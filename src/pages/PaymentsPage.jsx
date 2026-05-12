import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { sendNotification } from "../utils/notify";
import {
  Box, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, Button, TableContainer, Paper, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, InputAdornment, TextField, MenuItem,
  Select, FormControl,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import NotificationsIcon from "@mui/icons-material/Notifications";
import HistoryIcon from "@mui/icons-material/History";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const TOTAL_HOUSES = 24;

// ── Helper: recalculate total per-house amount for a month from expenses ──
async function getMonthTotal(month) {
  const { data } = await supabase
    .from("expenses")
    .select("per_house_amount")
    .eq("month", month);
  return (data || []).reduce((sum, e) => sum + (e.per_house_amount || 0), 0);
}

// ── Helper: upsert ONE consolidated payment row per resident per month ──
async function syncConsolidatedPayment(residentId, month, newAmount, status = null) {
  const { data: existing } = await supabase
    .from("payments")
    .select("id, status, paid_at")
    .eq("resident_id", residentId)
    .eq("month", month)
    .order("created_at", { ascending: true })
    .limit(1);

  if (existing && existing.length > 0) {
    const updatePayload = { amount: newAmount };
    // Only update status if explicitly passed and payment isn't already paid
    if (status && existing[0].status !== "paid") {
      updatePayload.status = status;
    }
    if (status === "paid") {
      updatePayload.status = "paid";
      updatePayload.paid_at = new Date().toISOString();
    }
    await supabase.from("payments").update(updatePayload).eq("id", existing[0].id);

    // Delete any duplicate rows for this resident+month
    if (existing.length > 1) {
      const extraIds = existing.slice(1).map((r) => r.id);
      await supabase.from("payments").delete().in("id", extraIds);
    }
  } else if (newAmount > 0) {
    await supabase.from("payments").insert({
      resident_id: residentId,
      month,
      amount: newAmount,
      status: status || "pending",
      paid_at: status === "paid" ? new Date().toISOString() : null,
    });
  }
}

export default function PaymentsPage({ theme }) {
  const [residents, setResidents]         = useState([]);
  const [payments, setPayments]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState("");
  const [filterStatus, setFilterStatus]   = useState("all");
  const [filterMonth, setFilterMonth]     = useState("");
  const [availableMonths, setAvailableMonths] = useState([]);
  const [historyDialog, setHistoryDialog] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);
  const [historyData, setHistoryData]     = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [reminderDialog, setReminderDialog] = useState(false);
  const [reminderResident, setReminderResident] = useState(null);
  const [sending, setSending]             = useState(false);
  const [markingPaid, setMarkingPaid]     = useState(null); // payment id being marked

  const isDark = theme === "night";

  useEffect(() => { fetchData(); }, []);

  // ── Fetch + auto-sync amounts ─────────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);

    const { data: resData } = await supabase
      .from("profiles")
      .select("id, full_name, email, flat_number, phone")
      .eq("role", "resident")
      .order("flat_number", { ascending: true });

    const { data: expData } = await supabase
      .from("expenses")
      .select("*");

    const { data: payData } = await supabase
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false });

    setResidents(resData || []);

    // Build per-month totals from expenses
    const monthTotals = {};
    (expData || []).forEach((e) => {
      if (!monthTotals[e.month]) monthTotals[e.month] = 0;
      monthTotals[e.month] += e.per_house_amount || 0;
    });

    // Fix any payment rows whose amount doesn't match the current expense total
    // Only update rows that are still pending/overdue (don't change paid receipts)
    const fixPromises = (payData || [])
      .filter((p) => {
        const correct = monthTotals[p.month] || 0;
        return correct > 0 && p.amount !== correct && p.status !== "paid";
      })
      .map((p) =>
        supabase
          .from("payments")
          .update({ amount: monthTotals[p.month] })
          .eq("id", p.id)
      );
    if (fixPromises.length > 0) await Promise.all(fixPromises);

    // Re-fetch after fixes
    const { data: freshPayments } = await supabase
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false });

    setPayments(freshPayments || []);

    // Build available months from expenses (not just payments)
    const expMonths = [...new Set((expData || []).map((e) => e.month))].sort().reverse();
    const payMonths = [...new Set((freshPayments || []).map((p) => p.month))].sort().reverse();
    const allMonths = [...new Set([...expMonths, ...payMonths])];
    setAvailableMonths(allMonths);
    if (allMonths.length > 0 && !filterMonth) setFilterMonth(allMonths[0]);

    setLoading(false);
  };

  // ── Mark as Paid ──────────────────────────────────────────────────────────
  const markAsPaid = async (paymentId) => {
    setMarkingPaid(paymentId);
    const payment = payments.find((p) => p.id === paymentId);
    if (!payment) { setMarkingPaid(null); return; }

    // Get correct amount from expenses
    const correctAmount = await getMonthTotal(payment.month);
    const finalAmount = correctAmount > 0 ? correctAmount : payment.amount;

    // Use syncConsolidatedPayment to safely update the single row
    await syncConsolidatedPayment(payment.resident_id, payment.month, finalAmount, "paid");

    // Send in-app notification to resident
    await sendNotification(
      payment.resident_id,
      "payment_received",
      "Payment confirmed ✅",
      `Your payment of ₹${finalAmount.toLocaleString("en-IN")} for ${payment.month} has been recorded. Thank you!`
    );

    setMarkingPaid(null);
    fetchData();
  };

  // ── View payment history for a resident ──────────────────────────────────
  const viewHistory = async (resident) => {
    setSelectedResident(resident);
    setHistoryLoading(true);
    setHistoryDialog(true);
    const { data } = await supabase
      .from("payments")
      .select("*")
      .eq("resident_id", resident.id)
      .order("month", { ascending: false });
    setHistoryData(data || []);
    setHistoryLoading(false);
  };

  // ── Send reminder notification ────────────────────────────────────────────
  const sendReminder = async () => {
    setSending(true);
    const residentPayment = payments.find(
      (p) => p.resident_id === reminderResident?.id && p.month === filterMonth
    );
    const isOverdue = residentPayment?.status === "overdue";
    await sendNotification(
      reminderResident?.id,
      isOverdue ? "overdue" : "due_reminder",
      isOverdue ? "Payment Overdue ⚠️" : "Payment Reminder 🔔",
      `Your payment of ₹${residentPayment?.amount?.toLocaleString("en-IN") || "—"} for ${filterMonth} is ${
        isOverdue ? "overdue. Please pay immediately." : "due. Please pay on time."
      }`
    );
    setSending(false);
    setReminderDialog(false);
    alert(`Reminder sent to ${reminderResident?.full_name}!`);
  };

  // ── Export CSV ────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const rows = filtered.map(({ resident, payment }) => ({
      flat:    resident?.flat_number || "—",
      name:    resident?.full_name   || "—",
      email:   resident?.email       || "—",
      month:   payment?.month        || "—",
      amount:  payment?.amount       || 0,
      status:  payment?.status       || "—",
      paid_at: payment?.paid_at
        ? new Date(payment.paid_at).toLocaleDateString("en-IN")
        : "—",
    }));
    const headers = ["Flat", "Name", "Email", "Month", "Amount", "Status", "Paid At"];
    const csv = [
      headers.join(","),
      ...rows.map((r) => Object.values(r).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments_${filterMonth || "all"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Merge residents + payments for the selected month ────────────────────
  const mergedData = residents.map((resident) => {
    const payment = payments.find(
      (p) => p.resident_id === resident.id && p.month === filterMonth
    );
    return { resident, payment };
  });

  const filtered = mergedData.filter(({ resident, payment }) => {
    const matchSearch =
      resident.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      resident.flat_number?.toLowerCase().includes(search.toLowerCase()) ||
      resident.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "no_payment" && !payment) ||
      payment?.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalResidents  = residents.length;
  const paidCount       = mergedData.filter((d) => d.payment?.status === "paid").length;
  const pendingCount    = mergedData.filter((d) => d.payment?.status === "pending").length;
  const overdueCount    = mergedData.filter((d) => d.payment?.status === "overdue").length;
  const totalCollected  = payments
    .filter((p) => p.month === filterMonth && p.status === "paid")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  // ── Theme-aware colors ────────────────────────────────────────────────────
  const textPrimary    = isDark ? "#ffffff"                    : "#111827";
  const textSecondary  = isDark ? "rgba(255,255,255,0.4)"      : "#6b7280";
  const tableBg        = isDark ? "rgba(255,255,255,0.02)"     : "#ffffff";
  const tableHeadBg    = isDark ? "rgba(255,255,255,0.04)"     : "#f8fafc";
  const tableBorder    = isDark ? "rgba(255,255,255,0.06)"     : "#e2e8f0";
  const inputBg        = isDark ? "rgba(255,255,255,0.05)"     : "#ffffff";
  const accentColor    =
    theme === "morning"   ? "#FF6B35" :
    theme === "afternoon" ? "#2196F3" :
    theme === "evening"   ? "#ff80ab" :
    "#6366f1";

  const cardStyle = {
    background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.8)",
    border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "#e2e8f0"}`,
    borderRadius: "14px",
    padding: "18px",
  };

  const statusChip = (status) => {
    const map = {
      paid:    { label: "Paid",    bg: isDark ? "rgba(16,185,129,0.15)"  : "rgba(34,197,94,0.1)",  color: isDark ? "#34d399" : "#16a34a" },
      pending: { label: "Pending", bg: isDark ? "rgba(251,191,36,0.15)"  : "rgba(245,158,11,0.1)", color: isDark ? "#fbbf24" : "#d97706" },
      overdue: { label: "Overdue", bg: isDark ? "rgba(239,68,68,0.15)"   : "rgba(239,68,68,0.08)", color: isDark ? "#f87171" : "#dc2626" },
    };
    const s = map[status] || {
      label: "No payment",
      bg:    isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
      color: isDark ? "rgba(255,255,255,0.3)"  : "#9ca3af",
    };
    return (
      <Chip label={s.label} size="small"
        sx={{ background: s.bg, color: s.color, fontWeight: 500, fontSize: "11px" }} />
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight="600"
          sx={{ color: textPrimary, fontFamily: "'Syne', sans-serif" }}>
          Payments
          <Chip label={`${totalResidents} residents`} size="small"
            sx={{ ml: 1.5, background: isDark ? "rgba(255,255,255,0.08)" : "#f3f4f6", color: textSecondary, fontWeight: 500 }} />
        </Typography>
        <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={exportCSV}
          sx={{
            borderColor: isDark ? "rgba(255,255,255,0.15)" : "#e2e8f0",
            color: textSecondary, borderRadius: 2,
            "&:hover": { borderColor: accentColor, color: accentColor },
          }}>
          Export CSV
        </Button>
      </Box>

      {/* Stat cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 2, mb: 3 }}>
        {[
          { label: "Total residents", value: totalResidents,                               color: textPrimary },
          { label: "Paid",            value: paidCount,                                    color: isDark ? "#34d399" : "#16a34a" },
          { label: "Pending",         value: pendingCount,                                 color: isDark ? "#fbbf24" : "#d97706" },
          { label: "Overdue",         value: overdueCount,                                 color: isDark ? "#f87171" : "#dc2626" },
          { label: "Collected",       value: `₹${totalCollected.toLocaleString("en-IN")}`, color: isDark ? "#34d399" : "#16a34a" },
        ].map((s, i) => (
          <Box key={i} sx={cardStyle}>
            <Typography variant="body2"
              sx={{ color: textSecondary, fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em", mb: 1 }}>
              {s.label}
            </Typography>
            <Typography variant="h5" fontWeight="700"
              sx={{ color: s.color, fontFamily: "'Syne', sans-serif" }}>
              {s.value}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField
          placeholder="Search by name, flat or email..."
          size="small" value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            width: 280,
            "& .MuiOutlinedInput-root": {
              background: inputBg, borderRadius: 2,
              "& fieldset": { borderColor: tableBorder },
              "&:hover fieldset": { borderColor: accentColor },
              "&.Mui-focused fieldset": { borderColor: accentColor },
            },
            "& input": { color: textPrimary, fontSize: "13px" },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: textSecondary }} />
              </InputAdornment>
            ),
          }}
        />

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <Select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}
            displayEmpty
            sx={{
              background: inputBg, borderRadius: 2, color: textPrimary, fontSize: "13px",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: tableBorder },
              "& .MuiSvgIcon-root": { color: textSecondary },
            }}>
            <MenuItem value="">All months</MenuItem>
            {availableMonths.map((m) => (
              <MenuItem key={m} value={m}>{m}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            sx={{
              background: inputBg, borderRadius: 2, color: textPrimary, fontSize: "13px",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: tableBorder },
              "& .MuiSvgIcon-root": { color: textSecondary },
            }}>
            <MenuItem value="all">All status</MenuItem>
            <MenuItem value="paid">Paid</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="overdue">Overdue</MenuItem>
            <MenuItem value="no_payment">No payment</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Payments table */}
      <TableContainer component={Paper} elevation={0}
        sx={{ background: tableBg, border: `1px solid ${tableBorder}`, borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: tableHeadBg }}>
              {["Flat No.", "Resident Name", "Email", "Month", "Amount", "Status", "Paid On", "Actions"].map((h) => (
                <TableCell key={h}
                  sx={{ fontWeight: 600, color: textSecondary, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", borderColor: tableBorder }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6, borderColor: tableBorder }}>
                  <CircularProgress size={28} sx={{ color: accentColor }} />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center"
                  sx={{ py: 6, color: textSecondary, borderColor: tableBorder }}>
                  No payments found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(({ resident, payment }, i) => (
                <TableRow key={i} hover
                  sx={{ "&:hover": { background: isDark ? "rgba(255,255,255,0.02)" : "#f8fafc" } }}>
                  <TableCell sx={{ borderColor: tableBorder }}>
                    <Chip label={resident.flat_number || "—"} size="small"
                      sx={{ background: isDark ? "rgba(255,255,255,0.08)" : "#f3f4f6", color: textPrimary, fontWeight: 600, fontSize: "11px" }} />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500, color: textPrimary, borderColor: tableBorder }}>
                    {resident.full_name || "—"}
                  </TableCell>
                  <TableCell sx={{ color: textSecondary, fontSize: "12px", borderColor: tableBorder }}>
                    {resident.email || "—"}
                  </TableCell>
                  <TableCell sx={{ color: textSecondary, fontSize: "12px", borderColor: tableBorder }}>
                    {payment?.month || "—"}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: textPrimary, borderColor: tableBorder }}>
                    {payment?.amount ? `₹${payment.amount.toLocaleString("en-IN")}` : "—"}
                  </TableCell>
                  <TableCell sx={{ borderColor: tableBorder }}>
                    {statusChip(payment?.status)}
                  </TableCell>
                  <TableCell sx={{ color: textSecondary, fontSize: "12px", borderColor: tableBorder }}>
                    {payment?.paid_at
                      ? new Date(payment.paid_at).toLocaleDateString("en-IN")
                      : "—"}
                  </TableCell>
                  <TableCell sx={{ borderColor: tableBorder }}>
                    <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                      {/* Mark as paid */}
                      {payment && payment.status !== "paid" && (
                        <IconButton size="small" title="Mark as paid"
                          onClick={() => markAsPaid(payment.id)}
                          disabled={markingPaid === payment.id}
                          sx={{ color: isDark ? "#34d399" : "#16a34a" }}>
                          {markingPaid === payment.id
                            ? <CircularProgress size={16} color="inherit" />
                            : <CheckCircleIcon fontSize="small" />}
                        </IconButton>
                      )}
                      {/* View history */}
                      <IconButton size="small" title="View history"
                        onClick={() => viewHistory(resident)}
                        sx={{ color: accentColor }}>
                        <HistoryIcon fontSize="small" />
                      </IconButton>
                      {/* Send reminder (only for unpaid) */}
                      {payment?.status !== "paid" && (
                        <IconButton size="small" title="Send reminder"
                          onClick={() => { setReminderResident(resident); setReminderDialog(true); }}
                          sx={{ color: isDark ? "#fbbf24" : "#d97706" }}>
                          <NotificationsIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Payment History Dialog */}
      <Dialog open={historyDialog} onClose={() => setHistoryDialog(false)}
        maxWidth="sm" fullWidth
        PaperProps={{ sx: { background: isDark ? "#0d1524" : "#fff", borderRadius: 3, border: `1px solid ${tableBorder}` } }}>
        <DialogTitle
          sx={{ color: textPrimary, fontFamily: "'Syne', sans-serif", fontWeight: 600, borderBottom: `1px solid ${tableBorder}` }}>
          Payment History — {selectedResident?.full_name}
          <Typography variant="body2" sx={{ color: textSecondary, mt: 0.5 }}>
            Flat {selectedResident?.flat_number}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: "16px !important" }}>
          {historyLoading ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <CircularProgress size={24} sx={{ color: accentColor }} />
            </Box>
          ) : historyData.length === 0 ? (
            <Typography sx={{ color: textSecondary, textAlign: "center", py: 4 }}>
              No payment history found
            </Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  {["Month", "Amount", "Status", "Paid On"].map((h) => (
                    <TableCell key={h}
                      sx={{ color: textSecondary, fontSize: "11px", fontWeight: 600, borderColor: tableBorder }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {historyData.map((p, i) => (
                  <TableRow key={i}>
                    <TableCell sx={{ color: textPrimary, borderColor: tableBorder }}>{p.month}</TableCell>
                    <TableCell sx={{ color: textPrimary, fontWeight: 600, borderColor: tableBorder }}>
                      ₹{p.amount?.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell sx={{ borderColor: tableBorder }}>{statusChip(p.status)}</TableCell>
                    <TableCell sx={{ color: textSecondary, borderColor: tableBorder }}>
                      {p.paid_at ? new Date(p.paid_at).toLocaleDateString("en-IN") : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, borderTop: `1px solid ${tableBorder}` }}>
          <Button onClick={() => setHistoryDialog(false)} sx={{ color: textSecondary }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Send Reminder Dialog */}
      <Dialog open={reminderDialog} onClose={() => setReminderDialog(false)}
        maxWidth="xs" fullWidth
        PaperProps={{ sx: { background: isDark ? "#0d1524" : "#fff", borderRadius: 3, border: `1px solid ${tableBorder}` } }}>
        <DialogTitle sx={{ color: textPrimary, fontFamily: "'Syne', sans-serif", fontWeight: 600 }}>
          Send Payment Reminder
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: textSecondary, fontSize: "13px", lineHeight: 1.7 }}>
            Send a payment reminder to:
          </Typography>
          <Box sx={{ mt: 2, p: 2, background: isDark ? "rgba(255,255,255,0.04)" : "#f8fafc", borderRadius: 2, border: `1px solid ${tableBorder}` }}>
            <Typography sx={{ color: textPrimary, fontWeight: 600, fontSize: "14px" }}>
              {reminderResident?.full_name}
            </Typography>
            <Typography sx={{ color: textSecondary, fontSize: "12px", mt: 0.5 }}>
              Flat {reminderResident?.flat_number} · {reminderResident?.email}
            </Typography>
          </Box>
          <Typography sx={{ color: textSecondary, fontSize: "12px", mt: 2 }}>
            An in-app notification will be sent to this resident.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setReminderDialog(false)} sx={{ color: textSecondary }}>Cancel</Button>
          <Button variant="contained" onClick={sendReminder} disabled={sending}
            sx={{ background: accentColor, "&:hover": { opacity: 0.9 }, borderRadius: 2 }}>
            {sending ? <CircularProgress size={20} color="inherit" /> : "Send Reminder"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}