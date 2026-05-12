import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { generateReceipt } from "../utils/generateReceipt";

function getTheme() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return { label: "Morning", icon: "🌅", color: "#f97316" };
  if (h >= 12 && h < 17) return { label: "Afternoon", icon: "☀️", color: "#3b82f6" };
  if (h >= 17 && h < 21) return { label: "Evening", icon: "🌆", color: "#ec4899" };
  return { label: "Night", icon: "🌙", color: "#7c3aed" };
}

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Good morning";
  if (h >= 12 && h < 17) return "Good afternoon";
  if (h >= 17 && h < 21) return "Good evening";
  return "Good night";
}

function formatMonthLabel(monthStr) {
  if (!monthStr) return "";
  const [year, month] = monthStr.split("-");
  return new Date(year, month - 1).toLocaleString("default", { month: "long", year: "numeric" });
}

const STATUS_COLORS = {
  paid:    { bg: "#10b98122", color: "#10b981", label: "Paid" },
  pending: { bg: "#f59e0b22", color: "#f59e0b", label: "Pending" },
  overdue: { bg: "#ef444422", color: "#ef4444", label: "Overdue" },
};

export default function ResidentPaymentsPage() {
  const navigate = useNavigate();
  const theme    = getTheme();

  const [profile, setProfile]                 = useState(null);
  const [monthlyPayments, setMonthlyPayments] = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [expandedMonth, setExpandedMonth]     = useState(null);
  const [expensesByMonth, setExpensesByMonth] = useState({});
  const [downloading, setDownloading]         = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/"); return; }

    const { data: prof } = await supabase
      .from("profiles").select("*").eq("id", user.id).single();
    setProfile(prof);

    const { data: allPayments } = await supabase
      .from("payments")
      .select("*")
      .eq("resident_id", user.id)
      .order("month", { ascending: false });

    if (!allPayments || allPayments.length === 0) {
      setMonthlyPayments([]);
      setLoading(false);
      return;
    }

    // Group by month → one row per month
    const grouped = {};
    const statusPriority = { overdue: 3, pending: 2, paid: 1 };

    allPayments.forEach((p) => {
      const key = p.month;
      if (!grouped[key]) {
        grouped[key] = { month: key, totalAmount: 0, status: "paid", paid_at: null, resident_id: p.resident_id, id: p.id, rows: [] };
      }
      grouped[key].totalAmount += p.amount || 0;
      grouped[key].rows.push(p);
      if ((statusPriority[p.status] || 0) > (statusPriority[grouped[key].status] || 0)) {
        grouped[key].status = p.status;
      }
      if (p.paid_at && (!grouped[key].paid_at || p.paid_at > grouped[key].paid_at)) {
        grouped[key].paid_at = p.paid_at;
      }
    });

    setMonthlyPayments(Object.values(grouped).sort((a, b) => b.month.localeCompare(a.month)));
    setLoading(false);
  }

  async function loadExpensesForMonth(monthStr) {
    if (expensesByMonth[monthStr]) return;
    const { data } = await supabase
      .from("expenses").select("*").eq("month", monthStr).order("bill_date", { ascending: true });
    setExpensesByMonth((prev) => ({ ...prev, [monthStr]: data || [] }));
  }

  function toggleMonth(monthStr) {
    if (expandedMonth === monthStr) { setExpandedMonth(null); return; }
    setExpandedMonth(monthStr);
    loadExpensesForMonth(monthStr);
  }

  async function handleDownload(mp, e) {
    e.stopPropagation();
    if (downloading) return;
    setDownloading(mp.month);

    let expenses = expensesByMonth[mp.month];
    if (!expenses) {
      const { data } = await supabase
        .from("expenses").select("*").eq("month", mp.month).order("bill_date", { ascending: true });
      expenses = data || [];
      setExpensesByMonth((prev) => ({ ...prev, [mp.month]: expenses }));
    }

    await generateReceipt({ payment: { ...mp, amount: mp.totalAmount }, expenses, profile });
    setDownloading(null);
  }

  const totalPaid    = monthlyPayments.filter((m) => m.status === "paid").length;
  const totalPending = monthlyPayments.filter((m) => m.status === "pending").length;
  const totalOverdue = monthlyPayments.filter((m) => m.status === "overdue").length;

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: "⊞", path: "/resident" },
    { id: "payments",  label: "Payments",  icon: "💳", path: "/resident/payments" },
    { id: "bills",     label: "Bills",     icon: "📄", path: "/resident/bills" },
    { id: "notices",   label: "Notices",   icon: "🔔", path: "/resident/notices" },
  ];

  const s = {
    root:         { display: "flex", minHeight: "100vh", background: "#0f0f1a", color: "#e2e8f0", fontFamily: "'DM Sans', sans-serif" },
    sidebar:      { width: 210, minHeight: "100vh", background: "#13131f", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", padding: "20px 0", position: "fixed", top: 0, left: 0, bottom: 0 },
    logo:         { padding: "0 20px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 12 },
    logoText:     { fontSize: 20, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#fff" },
    logoSub:      { fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 },
    navItem: (a) => ({ display: "flex", alignItems: "center", gap: 10, padding: "10px 20px", margin: "2px 10px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: a ? 600 : 400, color: a ? "#fff" : "rgba(255,255,255,0.5)", background: a ? "rgba(255,255,255,0.08)" : "transparent", transition: "all 0.15s", border: "none", width: "calc(100% - 20px)", textAlign: "left" }),
    navDot:       { width: 6, height: 6, borderRadius: "50%", background: theme.color, marginLeft: "auto" },
    userBlock:    { marginTop: "auto", padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.06)" },
    avatar:       { width: 32, height: 32, borderRadius: "50%", background: theme.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 },
    main:         { marginLeft: 210, flex: 1, display: "flex", flexDirection: "column" },
    topbar:       { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "#0f0f1a" },
    greeting:     { fontSize: 22, fontFamily: "'Syne', sans-serif", fontWeight: 700 },
    greetingDate: { fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 },
    badge: (c)  => ({ padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: c + "22", color: c, border: `1px solid ${c}44` }),
    content:      { padding: "24px 28px", flex: 1 },
    pageTitle:    { fontSize: 20, fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 4 },
    pageSub:      { fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 24 },
    statsRow:     { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24 },
    statCard:     { background: "#1a1a2e", borderRadius: 14, padding: "18px 22px", border: "1px solid rgba(255,255,255,0.07)", textAlign: "center" },
    statValue:    { fontSize: 28, fontFamily: "'Syne', sans-serif", fontWeight: 700 },
    statLabel:    { fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 4 },
    paymentRow:   { background: "#1a1a2e", borderRadius: 14, marginBottom: 10, border: "1px solid rgba(255,255,255,0.07)", overflow: "hidden" },
    rowHeader:    { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", cursor: "pointer" },
    monthLabel:   { fontSize: 15, fontWeight: 600 },
    subLabel:     { fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 3 },
    statusBadge: (st) => ({ display: "inline-block", padding: "3px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: (STATUS_COLORS[st] || STATUS_COLORS.pending).bg, color: (STATUS_COLORS[st] || STATUS_COLORS.pending).color, marginTop: 5 }),
    expandIcon: (open) => ({ fontSize: 16, color: "rgba(255,255,255,0.3)", transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", marginLeft: 12 }),
    downloadBtn: (busy) => ({ display: "flex", alignItems: "center", gap: 6, background: busy ? "rgba(16,185,129,0.08)" : "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: busy ? "not-allowed" : "pointer", transition: "all 0.15s", marginLeft: 10, whiteSpace: "nowrap", opacity: busy ? 0.6 : 1, flexShrink: 0 }),
    breakdown:       { padding: "0 22px 18px", borderTop: "1px solid rgba(255,255,255,0.05)" },
    breakdownTitle:  { fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", textTransform: "uppercase", padding: "12px 0 8px" },
    breakdownRow:    { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" },
    breakdownLabel:  { fontSize: 13 },
    breakdownCat:    { fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 },
    breakdownAmt:    { fontSize: 13, fontWeight: 600, color: theme.color },
    emptyState:      { textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.3)", fontSize: 14 },
    signOut:         { background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", padding: "8px 0", textAlign: "left", width: "100%", marginTop: 10 },
  };

  return (
    <div style={s.root}>
      {/* Sidebar */}
      <div style={s.sidebar}>
        <div style={s.logo}>
          <div style={s.logoText}><span style={{ color: theme.color }}>Apart</span>Ease</div>
          <div style={s.logoSub}>Resident Portal · Flat {profile?.flat_number || "—"}</div>
        </div>
        {sidebarItems.map((item) => (
          <button key={item.id} style={s.navItem(item.id === "payments")} onClick={() => navigate(item.path)}>
            <span>{item.icon}</span><span>{item.label}</span>
            {item.id === "payments" && <span style={s.navDot} />}
          </button>
        ))}
        <div style={s.userBlock}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={s.avatar}>{profile?.full_name?.[0] || "R"}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{profile?.full_name}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Flat {profile?.flat_number}</div>
            </div>
          </div>
          <button style={s.signOut} onClick={async () => { await supabase.auth.signOut(); navigate("/"); }}>Sign out</button>
        </div>
      </div>

      {/* Main */}
      <div style={s.main}>
        <div style={s.topbar}>
          <div>
            <div style={s.greeting}>{getGreeting()}, {profile?.full_name?.split(" ")[0]}</div>
            <div style={s.greetingDate}>
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={s.badge(theme.color)}>{theme.icon} {theme.label}</div>
            <div style={s.badge("#6b7280")}>Flat {profile?.flat_number}</div>
          </div>
        </div>

        <div style={s.content}>
          <div style={s.pageTitle}>Payment history — Flat {profile?.flat_number}</div>
          <div style={s.pageSub}>
            Click any month to see the bill breakdown · Receipt download appears once payment is confirmed
          </div>

          {!loading && monthlyPayments.length > 0 && (
            <div style={s.statsRow}>
              <div style={s.statCard}>
                <div style={{ ...s.statValue, color: "#10b981" }}>{totalPaid}</div>
                <div style={s.statLabel}>Total paid</div>
              </div>
              <div style={s.statCard}>
                <div style={{ ...s.statValue, color: "#f59e0b" }}>{totalPending}</div>
                <div style={s.statLabel}>Pending</div>
              </div>
              <div style={s.statCard}>
                <div style={{ ...s.statValue, color: "#ef4444" }}>{totalOverdue}</div>
                <div style={s.statLabel}>Overdue</div>
              </div>
            </div>
          )}

          {loading ? (
            <div style={s.emptyState}>Loading...</div>
          ) : monthlyPayments.length === 0 ? (
            <div style={s.emptyState}>No payment records found.</div>
          ) : (
            monthlyPayments.map((mp) => {
              const isOpen        = expandedMonth === mp.month;
              const sc            = STATUS_COLORS[mp.status] || STATUS_COLORS.pending;
              const monthExpenses = expensesByMonth[mp.month] || [];
              const isPaid        = mp.status === "paid";
              const isDownloading = downloading === mp.month;

              return (
                <div key={mp.month} style={s.paymentRow}>
                  <div style={s.rowHeader} onClick={() => toggleMonth(mp.month)}>
                    {/* Left */}
                    <div>
                      <div style={s.monthLabel}>{formatMonthLabel(mp.month)}</div>
                      <div style={s.subLabel}>
                        {isPaid && mp.paid_at
                          ? `Paid on ${new Date(mp.paid_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
                          : "Payment pending"}
                      </div>
                    </div>

                    {/* Right */}
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 16, fontWeight: 700 }}>
                          ₹{mp.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div style={s.statusBadge(mp.status)}>{sc.label}</div>
                      </div>

                      {/* PDF receipt button — only for paid */}
                      {isPaid && (
                        <button
                          style={s.downloadBtn(isDownloading)}
                          onClick={(e) => handleDownload(mp, e)}
                          disabled={isDownloading}
                          title="Download PDF receipt"
                        >
                          <span style={{ fontSize: 13 }}>{isDownloading ? "⏳" : "⬇"}</span>
                          {isDownloading ? "Generating…" : "Receipt"}
                        </button>
                      )}

                      <span style={s.expandIcon(isOpen)}>▾</span>
                    </div>
                  </div>

                  {/* Expandable breakdown */}
                  {isOpen && (
                    <div style={s.breakdown}>
                      <div style={s.breakdownTitle}>Bill breakdown</div>
                      {monthExpenses.length === 0 ? (
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", padding: "8px 0" }}>
                          No expense details found.
                        </div>
                      ) : (
                        <>
                          {monthExpenses.map((exp) => (
                            <div key={exp.id} style={s.breakdownRow}>
                              <div>
                                <div style={s.breakdownLabel}>{exp.title}</div>
                                <div style={s.breakdownCat}>
                                  {exp.category?.charAt(0).toUpperCase() + exp.category?.slice(1)}
                                </div>
                              </div>
                              <div style={s.breakdownAmt}>
                                ₹{(exp.per_house_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                            </div>
                          ))}
                          <div style={{ ...s.breakdownRow, borderBottom: "none", paddingTop: 12 }}>
                            <div style={{ fontSize: 13, fontWeight: 700 }}>Total</div>
                            <div style={{ ...s.breakdownAmt, fontSize: 15 }}>
                              ₹{mp.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

