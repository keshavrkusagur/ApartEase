import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { sendNotificationToAll } from "../utils/notify";

import {
  Typography, Table, TableHead, TableRow, TableCell,
  TableBody, Button, Box, TextField, Paper, TableContainer,
  Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Chip, IconButton, InputAdornment,
  MenuItem, Select, FormControl, InputLabel
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

const emptyForm = { title: "", category: "water", total_amount: "", month: "", bill_date: "" };

const categoryColors = {
  water: { bg: "rgba(59,130,246,0.15)", color: "#60a5fa" },
  electricity: { bg: "rgba(251,191,36,0.15)", color: "#fbbf24" },
  security: { bg: "rgba(16,185,129,0.15)", color: "#34d399" },
  cleaning: { bg: "rgba(167,139,250,0.15)", color: "#a78bfa" },
  other: { bg: "rgba(156,163,175,0.15)", color: "#9ca3af" },
};

export default function ExpensesPage({ theme }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const isDark = theme === "night";
  const accentColor = theme === "morning" ? "#FF6B35"
    : theme === "afternoon" ? "#2196F3"
    : theme === "evening" ? "#ff80ab"
    : "#6366f1";

  const textPrimary = isDark ? "#ffffff" : "#111827";
  const textSecondary = isDark ? "rgba(255,255,255,0.4)" : "#6b7280";
  const tableBg = isDark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.6)";
  const tableHeadBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.4)";
  const tableBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)";
  const inputBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.6)";
  const cardBg = isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.6)";
  const dialogBg = isDark ? "#0d1524" : "#ffffff";
  const statCardBg = isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.6)";

  useEffect(() => { fetchExpenses(); }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    setExpenses(data || []);
    setLoading(false);
  };

const handleSave = async () => {
  setSaving(true);
  try {
    const perHouse = parseFloat(form.total_amount) / 24;
    
    const { error } = await supabase
      .from("expenses")
      .insert({
        title: form.title,
        category: form.category,
        total_amount: parseFloat(form.total_amount),
        month: form.month,
        bill_date: form.bill_date || null,
      });

if (!error) {
  //Calculate total for this month
  const { data: allExpenses } = await supabase
    .from("expenses")
    .select("per_house_amount")
    .eq("month", form.month);

  const newTotal = allExpenses?.reduce((sum, e) => sum + (e.per_house_amount || 0), 0) || 0;

  // Update all payments for this month to reflect total
  await supabase
    .from("payments")
    .update({ amount: newTotal })
    .eq("month", form.month)
    .neq("status", "paid"); 

  // Notify all residents
  await sendNotificationToAll(
    "due_reminder",
    `New bill added — ${form.title}`,
    `₹${Math.round(parseFloat(form.total_amount) / 24).toLocaleString("en-IN")} added. Your total for ${form.month} is now ₹${Math.round(newTotal).toLocaleString("en-IN")}.`
  );
}

    setSaving(false);
    setDialogOpen(false);
    setForm(emptyForm);
    fetchExpenses();
  } catch (err) {
    alert("Error: " + err.message);
    setSaving(false);
  }
}
  const handleDelete = async () => {
    const { error } = await supabase.from("expenses").delete().eq("id", selectedExpense.id);
    if (error) console.error(error);
    setDeleteDialogOpen(false);
    setSelectedExpense(null);
    fetchExpenses();
  };

  const totalAmount = expenses.reduce((sum, e) => sum + (e.total_amount || 0), 0);
  const thisMonth = new Date().toLocaleString("default", { month: "long", year: "numeric" });
  const thisMonthTotal = expenses.filter(e => e.month === thisMonth).reduce((sum, e) => sum + (e.total_amount || 0), 0);
  const thisMonthPerHouse = expenses.filter(e => e.month === thisMonth).reduce((sum, e) => sum + (e.per_house_amount || 0), 0);

  const filtered = expenses.filter(e =>
    e.title?.toLowerCase().includes(search.toLowerCase()) ||
    e.category?.toLowerCase().includes(search.toLowerCase()) ||
    e.month?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight="600"
          sx={{ color: textPrimary, fontFamily: "'Syne', sans-serif" }}>
          Expenses
          <Chip label={`${expenses.length} total`} size="small"
            sx={{ ml: 1.5, background: `${accentColor}22`, color: accentColor, fontWeight: 500 }} />
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />}
          onClick={() => { setForm(emptyForm); setDialogOpen(true); }}
          sx={{ background: accentColor, "&:hover": { opacity: 0.9, background: accentColor }, borderRadius: 2 }}>
          Add Expense
        </Button>
      </Box>

      {/* Stat cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 2, mb: 3 }}>
        {[
          { label: "Total expenses", value: `₹${totalAmount.toLocaleString("en-IN")}` },
          { label: "This month", value: `₹${thisMonthTotal.toLocaleString("en-IN")}` },
          { label: "Per house this month", value: `₹${Math.round(thisMonthPerHouse).toLocaleString("en-IN")}`, accent: true },
        ].map((s, i) => (
          <Box key={i} sx={{
            background: statCardBg,
            border: `1px solid ${tableBorder}`,
            borderRadius: 2, p: 2,
            backdropFilter: "blur(10px)",
          }}>
            <Typography variant="body2" sx={{ color: textSecondary, mb: 0.5 }}>{s.label}</Typography>
            <Typography variant="h5" fontWeight="700"
              sx={{ color: s.accent ? accentColor : textPrimary, fontFamily: "'Syne', sans-serif" }}>
              {s.value}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Search */}
      <TextField
        placeholder="Search by title, category or month..."
        size="small" value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{
          mb: 3, width: 320,
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

      {/* Table */}
      <TableContainer component={Paper} elevation={0}
        sx={{ background: tableBg, border: `1px solid ${tableBorder}`, borderRadius: 2, backdropFilter: "blur(10px)" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: tableHeadBg }}>
              {["Title", "Category", "Month", "Total Amount", "Per House", "Bill Date", "Actions"].map(h => (
                <TableCell key={h} sx={{
                  fontWeight: 600, color: textSecondary,
                  fontSize: "11px", textTransform: "uppercase",
                  letterSpacing: "0.06em", borderColor: tableBorder,
                }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6, borderColor: tableBorder }}>
                  <CircularProgress size={28} sx={{ color: accentColor }} />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center"
                  sx={{ py: 6, color: textSecondary, borderColor: tableBorder }}>
                  No expenses found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((e) => {
                const cat = categoryColors[e.category] || categoryColors.other;
                return (
                  <TableRow key={e.id} hover
                    sx={{ "&:hover": { background: isDark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.5)" } }}>
                    <TableCell sx={{ fontWeight: 500, color: textPrimary, borderColor: tableBorder }}>
                      {e.title}
                    </TableCell>
                    <TableCell sx={{ borderColor: tableBorder }}>
                      <Chip label={e.category} size="small"
                        sx={{ background: cat.bg, color: cat.color, fontWeight: 500, textTransform: "capitalize" }} />
                    </TableCell>
                    <TableCell sx={{ color: textSecondary, borderColor: tableBorder }}>{e.month}</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: textPrimary, borderColor: tableBorder }}>
                      ₹{e.total_amount?.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell sx={{ borderColor: tableBorder }}>
                      <Chip label={`₹${e.per_house_amount?.toLocaleString("en-IN")}`} size="small"
                        sx={{ background: "rgba(16,185,129,0.15)", color: "#34d399", fontWeight: 600 }} />
                    </TableCell>
                    <TableCell sx={{ color: textSecondary, borderColor: tableBorder }}>
                      {e.bill_date ? new Date(e.bill_date).toLocaleDateString("en-IN") : "—"}
                    </TableCell>
                    <TableCell sx={{ borderColor: tableBorder }}>
                      <IconButton size="small"
                        onClick={() => { setSelectedExpense(e); setDeleteDialogOpen(true); }}
                        sx={{ color: "#f87171" }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Expense Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { background: dialogBg, borderRadius: 3, border: `1px solid ${tableBorder}` } }}>
        <DialogTitle sx={{ color: textPrimary, fontFamily: "'Syne', sans-serif", fontWeight: 600 }}>
          Add Expense
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}>
          <TextField label="Title" fullWidth size="small"
            placeholder="e.g. Water Bill March"
            value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            sx={{
              "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: tableBorder }, "&.Mui-focused fieldset": { borderColor: accentColor } },
              "& input": { color: textPrimary }, "& label": { color: textSecondary },
            }}
          />
          <FormControl fullWidth size="small">
            <InputLabel sx={{ color: textSecondary }}>Category</InputLabel>
            <Select value={form.category} label="Category"
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              sx={{ color: textPrimary, "& .MuiOutlinedInput-notchedOutline": { borderColor: tableBorder } }}>
              <MenuItem value="water">Water</MenuItem>
              <MenuItem value="electricity">Electricity</MenuItem>
              <MenuItem value="security">Security</MenuItem>
              <MenuItem value="cleaning">Cleaning</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Total Amount (₹)" fullWidth size="small" type="number"
            placeholder="e.g. 1500"
            value={form.total_amount} onChange={(e) => setForm({ ...form, total_amount: e.target.value })}
            sx={{
              "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: tableBorder }, "&.Mui-focused fieldset": { borderColor: accentColor } },
              "& input": { color: textPrimary }, "& label": { color: textSecondary },
            }}
          />
          {form.total_amount && (
            <Box sx={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 1, p: 1.5 }}>
              <Typography variant="body2" sx={{ color: "#34d399" }}>
                Per house: ₹{(parseFloat(form.total_amount) / 24).toFixed(2)}
              </Typography>
            </Box>
          )}
         // month 
<FormControl fullWidth size="small">
  <InputLabel sx={{ color: textSecondary }}>Month</InputLabel>
  <Select
    value={form.month}
    label="Month"
    onChange={(e) => setForm({ ...form, month: e.target.value })}
    sx={{ color: textPrimary, "& .MuiOutlinedInput-notchedOutline": { borderColor: tableBorder } }}
  >
    {Array.from({ length: 12 }, (_, i) => {
      const date = new Date(2026, i, 1);
      const month = date.toLocaleString("default", { month: "long", year: "numeric" });
      return <MenuItem key={month} value={month}>{month}</MenuItem>;
    })}
  </Select>
</FormControl>
          <TextField label="Bill Date" fullWidth size="small" type="date"
            InputLabelProps={{ shrink: true }}
            value={form.bill_date} onChange={(e) => setForm({ ...form, bill_date: e.target.value })}
            sx={{
              "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: tableBorder }, "&.Mui-focused fieldset": { borderColor: accentColor } },
              "& input": { color: textPrimary }, "& label": { color: textSecondary },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: textSecondary }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}
            disabled={saving || !form.title || !form.total_amount || !form.month}
            sx={{ background: accentColor, "&:hover": { opacity: 0.9, background: accentColor }, borderRadius: 2 }}>
            {saving ? <CircularProgress size={20} color="inherit" /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { background: dialogBg, borderRadius: 3, border: `1px solid ${tableBorder}` } }}>
        <DialogTitle sx={{ color: textPrimary, fontFamily: "'Syne', sans-serif", fontWeight: 600 }}>
          Delete Expense
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: textSecondary }}>
            Are you sure you want to delete <strong style={{ color: textPrimary }}>{selectedExpense?.title}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: textSecondary }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete} sx={{ borderRadius: 2 }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}