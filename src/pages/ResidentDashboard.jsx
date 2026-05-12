import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import { CircularProgress, Chip } from "@mui/material";
import NotificationBell from "../components/NotificationBell";

export default function ResidentDashboard() {
  const [theme, setTheme] = useState("night");
  const [profile, setProfile] = useState(null);
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState("Dashboard");
  const navigate = useNavigate();

  // Auto theme
  useEffect(() => {
    const detectTheme = () => {
      const h = new Date().getHours();
      if (h >= 5 && h < 12) setTheme("morning");
      else if (h >= 12 && h < 17) setTheme("afternoon");
      else if (h >= 17 && h < 21) setTheme("evening");
      else setTheme("night");
    };
    detectTheme();
    const interval = setInterval(detectTheme, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
  setLoading(true);

  // Wait for session to be ready
  await new Promise(res => setTimeout(res, 500));
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) { navigate("/"); return; }

    const userId = session.user.id;

    const [profRes, payRes, expRes, notRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase.from("payments").select("*").eq("resident_id", userId).order("created_at", { ascending: false }),
      supabase.from("expenses").select("*").order("created_at", { ascending: false }),
      supabase.from("notices").select("*").in("visible_to", ["all", "resident"]).order("created_at", { ascending: false }),
    ]);

    setProfile(profRes.data);
    setPayments(payRes.data || []);
    setExpenses(expRes.data || []);
    setNotices(notRes.data || []);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  // Theme config
  const themes = {
    morning: {
      emoji: "🌅", name: "Morning", greeting: "Good morning",
      rootBg: "#FFF8F0", sidebarBg: "#FFF0E0", sidebarBorder: "#FFD4A0",
      logoIconBg: "linear-gradient(135deg,#FF6B35,#F7931E)", logoAccent: "#FF6B35", logoColor: "#1a1a1a",
      navActiveBg: "rgba(255,107,53,0.1)", navActiveColor: "#FF6B35", navActiveBorder: "rgba(255,107,53,0.2)",
      navDot: "#FF6B35", navColor: "#b8a898", subColor: "#b8a898",
      userBg: "rgba(255,107,53,0.06)", avatarBg: "linear-gradient(135deg,#FF6B35,#F7931E)",
      userNameColor: "#3d2a1a", logoutBorder: "rgba(255,107,53,0.15)", logoutColor: "#b8a898",
      topbarBg: "#FFF4E8", topbarBorder: "#FFD4A0", topbarTitleColor: "#1a1a1a", topbarSubColor: "#b8a898",
      badgeBg: "rgba(255,107,53,0.08)", badgeColor: "#FF6B35", badgeBorder: "rgba(255,107,53,0.2)",
      mainBg: "#FFF8F0", cardBg: "rgba(255,107,53,0.04)", cardBorder: "rgba(255,107,53,0.12)",
      cardTitleColor: "#3d2a1a", cardLinkColor: "#FF6B35", statLabelColor: "#b8a898", statValueColor: "#1a1a1a",
      accentColor: "#FF6B35", isDark: false,
    },
    afternoon: {
      emoji: "☀️", name: "Afternoon", greeting: "Good afternoon",
      rootBg: "#F0F8FF", sidebarBg: "#E8F4FD", sidebarBorder: "#B0D4F1",
      logoIconBg: "linear-gradient(135deg,#1565C0,#2196F3)", logoAccent: "#2196F3", logoColor: "#0d2137",
      navActiveBg: "rgba(33,150,243,0.1)", navActiveColor: "#1565C0", navActiveBorder: "rgba(33,150,243,0.2)",
      navDot: "#2196F3", navColor: "#90a8c0", subColor: "#90a8c0",
      userBg: "rgba(33,150,243,0.06)", avatarBg: "linear-gradient(135deg,#1565C0,#2196F3)",
      userNameColor: "#0d2137", logoutBorder: "rgba(33,150,243,0.15)", logoutColor: "#90a8c0",
      topbarBg: "#EBF5FB", topbarBorder: "#B0D4F1", topbarTitleColor: "#0d2137", topbarSubColor: "#90a8c0",
      badgeBg: "rgba(33,150,243,0.08)", badgeColor: "#1565C0", badgeBorder: "rgba(33,150,243,0.2)",
      mainBg: "#F0F8FF", cardBg: "rgba(33,150,243,0.04)", cardBorder: "rgba(33,150,243,0.12)",
      cardTitleColor: "#0d2137", cardLinkColor: "#2196F3", statLabelColor: "#90a8c0", statValueColor: "#0d2137",
      accentColor: "#2196F3", isDark: false,
    },
    evening: {
      emoji: "🌸", name: "Evening", greeting: "Good evening",
      rootBg: "#fff0f5", sidebarBg: "#ffe4ef", sidebarBorder: "#ffc2d4",
      logoIconBg: "linear-gradient(135deg,#ff80ab,#ffb6c1)", logoAccent: "#ff80ab", logoColor: "#3d1a2e",
      navActiveBg: "rgba(255,128,171,0.12)", navActiveColor: "#e91e8c", navActiveBorder: "rgba(255,128,171,0.25)",
      navDot: "#ff80ab", navColor: "#c48fa0", subColor: "#c48fa0",
      userBg: "rgba(255,128,171,0.08)", avatarBg: "linear-gradient(135deg,#ff80ab,#ffb6c1)",
      userNameColor: "#3d1a2e", logoutBorder: "rgba(255,128,171,0.2)", logoutColor: "#c48fa0",
      topbarBg: "#ffeef5", topbarBorder: "#ffc2d4", topbarTitleColor: "#3d1a2e", topbarSubColor: "#c48fa0",
      badgeBg: "rgba(255,128,171,0.12)", badgeColor: "#e91e8c", badgeBorder: "rgba(255,128,171,0.25)",
      mainBg: "#fff5f8", cardBg: "rgba(255,255,255,0.8)", cardBorder: "#ffc2d4",
      cardTitleColor: "#3d1a2e", cardLinkColor: "#e91e8c", statLabelColor: "#c48fa0", statValueColor: "#3d1a2e",
      accentColor: "#ff80ab", isDark: false,
    },
    night: {
      emoji: "🌙", name: "Night", greeting: "Good night",
      rootBg: "#0a0f1e", sidebarBg: "rgba(255,255,255,0.02)", sidebarBorder: "rgba(255,255,255,0.06)",
      logoIconBg: "linear-gradient(135deg,#4f46e5,#7c3aed)", logoAccent: "#a5b4fc", logoColor: "#fff",
      navActiveBg: "rgba(99,102,241,0.1)", navActiveColor: "#a5b4fc", navActiveBorder: "rgba(99,102,241,0.18)",
      navDot: "#6366f1", navColor: "rgba(255,255,255,0.3)", subColor: "rgba(255,255,255,0.22)",
      userBg: "rgba(255,255,255,0.03)", avatarBg: "linear-gradient(135deg,#4f46e5,#7c3aed)",
      userNameColor: "rgba(255,255,255,0.65)", logoutBorder: "rgba(255,255,255,0.07)", logoutColor: "rgba(255,255,255,0.28)",
      topbarBg: "rgba(255,255,255,0.01)", topbarBorder: "rgba(255,255,255,0.05)", topbarTitleColor: "#fff", topbarSubColor: "rgba(255,255,255,0.28)",
      badgeBg: "rgba(99,102,241,0.1)", badgeColor: "#a5b4fc", badgeBorder: "rgba(99,102,241,0.2)",
      mainBg: "#04060f", cardBg: "rgba(255,255,255,0.03)", cardBorder: "rgba(255,255,255,0.07)",
      cardTitleColor: "rgba(255,255,255,0.7)", cardLinkColor: "#6366f1", statLabelColor: "rgba(255,255,255,0.32)", statValueColor: "#fff",
      accentColor: "#6366f1", isDark: true,
    },
  };

  const t = themes[theme];

  const navItems = [
    { label: "Dashboard", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
    { label: "Payments", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
    { label: "Bills", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
    { label: "Notices", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg> },
  ];

  // Current month
  const currentMonth = new Date().toLocaleString("default", { month: "long", year: "numeric" });

  // Latest payment
  const latestPayment = payments[0];
  const currentMonthPayment = payments.find(p => p.month === currentMonth);

  // Current month expenses
  const currentMonthExpenses = expenses.filter(e => e.month === currentMonth);
  const totalBill = currentMonthExpenses.reduce((sum, e) => sum + (e.per_house_amount || 0), 0);

  const statusColor = (status) => {
    if (status === "paid") return { color: t.isDark ? "#34d399" : "#16a34a", bg: t.isDark ? "rgba(16,185,129,0.15)" : "rgba(34,197,94,0.1)" };
    if (status === "pending") return { color: t.isDark ? "#fbbf24" : "#d97706", bg: t.isDark ? "rgba(251,191,36,0.15)" : "rgba(245,158,11,0.1)" };
    if (status === "overdue") return { color: t.isDark ? "#f87171" : "#dc2626", bg: t.isDark ? "rgba(239,68,68,0.15)" : "rgba(239,68,68,0.1)" };
    return { color: t.statLabelColor, bg: t.cardBg };
  };

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    @keyframes slideUp { from{opacity:0;transform:translateY(12px);} to{opacity:1;transform:translateY(0);} }
    @keyframes pulse { 0%,100%{opacity:0.5;} 50%{opacity:1;} }
    @keyframes fadeIn { from{opacity:0;} to{opacity:1;} }

    .res-root { display:flex; height:100vh; width:100%; font-family:'DM Sans',sans-serif; overflow:hidden; transition:background 1s ease; }
    .res-sidebar { width:220px; flex-shrink:0; display:flex; flex-direction:column; border-right-width:1px; border-right-style:solid; transition:all 1s ease; }
    .res-sb-logo { padding:24px 20px 20px; border-bottom-width:1px; border-bottom-style:solid; }
    .res-sb-logo-row { display:flex; align-items:center; gap:10px; margin-bottom:4px; }
    .res-sb-icon { width:32px; height:32px; border-radius:9px; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(0,0,0,0.15); }
    .res-sb-name { font-family:'Syne',sans-serif; font-size:16px; font-weight:800; }
    .res-sb-sub { font-size:10px; letter-spacing:0.04em; }
    .res-nav { padding:14px 10px; flex:1; }
    .res-nav-item { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:10px; font-size:13px; cursor:pointer; margin-bottom:3px; border:1px solid transparent; transition:all 0.2s; }
    .res-nav-dot { width:4px; height:4px; border-radius:50%; margin-left:auto; }
    .res-sb-foot { padding:14px 10px; border-top-width:1px; border-top-style:solid; }
    .res-sb-user { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:10px; margin-bottom:8px; }
    .res-sb-avatar { width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:#fff; flex-shrink:0; }
    .res-topbar { display:flex; justify-content:space-between; align-items:center; padding:20px 28px; border-bottom-width:1px; border-bottom-style:solid; transition:all 1s ease; }
    .res-main { flex:1; overflow:auto; display:flex; flex-direction:column; transition:background 1s ease; }
    .res-content { padding:24px 28px; flex:1; }
    .res-glass { border-radius:16px; border-width:1px; border-style:solid; transition:all 1s ease; }
    .res-stat-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:14px; margin-bottom:20px; }
    .res-stat-card { padding:18px; animation:slideUp 0.5s ease both; }
    .res-stat-icon { width:34px; height:34px; border-radius:9px; display:flex; align-items:center; justify-content:center; margin-bottom:14px; }
    .res-stat-label { font-size:10px; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:8px; }
    .res-stat-value { font-family:'Syne',sans-serif; font-size:24px; font-weight:700; margin-bottom:4px; }
    .res-stat-sub { font-size:11px; }
    .res-two-col { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px; }
    .res-panel { padding:20px; }
    .res-panel-title { font-family:'Syne',sans-serif; font-size:13px; font-weight:600; margin-bottom:16px; display:flex; justify-content:space-between; }
    .res-bill-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; }
    .res-bill-bar { height:3px; border-radius:2px; margin:6px 0 12px; }
    .res-notice { padding:14px 16px; border-radius:10px; margin-bottom:10px; border-left:3px solid; transition:all 0.2s; }
    .res-pay-row { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:10px; margin-bottom:8px; border:1px solid; }
    .logout-btn { width:100%; padding:9px; background:transparent; border-radius:9px; font-size:12px; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.2s; border-width:1px; border-style:solid; }
    .res-main::-webkit-scrollbar { width:4px; }
    .res-main::-webkit-scrollbar-track { background:transparent; }
    .res-main::-webkit-scrollbar-thumb { border-radius:2px; background:rgba(99,102,241,0.3); }
  `;

  const renderDashboard = () => (
    <>
      {/* Stat cards */}
      <div className="res-stat-grid">
        {[
          {
            label: "My flat",
            value: profile?.flat_number || "—",
            sub: profile?.full_name || "Resident",
            subColor: t.statLabelColor,
            iconBg: `${t.accentColor}22`, iconColor: t.accentColor,
            icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
          },
          {
            label: "This month status",
            value: currentMonthPayment?.status
              ? currentMonthPayment.status.charAt(0).toUpperCase() + currentMonthPayment.status.slice(1)
              : "No dues",
            sub: currentMonthPayment?.amount ? `₹${currentMonthPayment.amount.toLocaleString("en-IN")}` : "—",
            subColor: statusColor(currentMonthPayment?.status).color,
            iconBg: statusColor(currentMonthPayment?.status).bg,
            iconColor: statusColor(currentMonthPayment?.status).color,
            icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          },
          {
            label: "Monthly bill share",
            value: `₹${Math.round(totalBill).toLocaleString("en-IN")}`,
            sub: `${currentMonthExpenses.length} bills this month`,
            subColor: t.isDark ? "#34d399" : "#16a34a",
            iconBg: t.isDark ? "rgba(16,185,129,0.12)" : "rgba(34,197,94,0.1)",
            iconColor: t.isDark ? "#34d399" : "#16a34a",
            icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
          },
        ].map((s, i) => (
          <div key={i} className="res-glass res-stat-card"
            style={{ background: t.cardBg, borderColor: t.cardBorder, animationDelay: `${i * 0.08}s` }}>
            <div className="res-stat-icon" style={{ background: s.iconBg, color: s.iconColor }}>{s.icon}</div>
            <div className="res-stat-label" style={{ color: t.statLabelColor }}>{s.label}</div>
            <div className="res-stat-value" style={{ color: t.statValueColor }}>{s.value}</div>
            <div className="res-stat-sub" style={{ color: s.subColor }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="res-two-col">
        {/* Bill breakdown */}
        <div className="res-glass res-panel" style={{ background: t.cardBg, borderColor: t.cardBorder }}>
          <div className="res-panel-title" style={{ color: t.cardTitleColor }}>
            Bill breakdown — {currentMonth}
          </div>
          {currentMonthExpenses.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px", color: t.statLabelColor, fontSize: "13px" }}>
              No bills for {currentMonth}
            </div>
          ) : (
            <>
              {currentMonthExpenses.map((e, i) => {
                const catColors = {
                  water: "#60a5fa", electricity: "#fbbf24",
                  security: "#34d399", cleaning: "#a78bfa", other: "#9ca3af"
                };
                const color = catColors[e.category] || "#9ca3af";
                const maxAmt = Math.max(...currentMonthExpenses.map(x => x.per_house_amount || 0));
                const width = `${Math.round(((e.per_house_amount || 0) / maxAmt) * 100)}%`;
                return (
                  <div key={i}>
                    <div className="res-bill-row">
                      <div>
                        <div style={{ fontSize: "13px", color: t.cardTitleColor }}>{e.title}</div>
                        <div style={{ fontSize: "10px", color: t.statLabelColor, textTransform: "capitalize" }}>{e.category}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: t.statValueColor }}>
                          ₹{e.per_house_amount?.toLocaleString("en-IN")}
                        </div>
                        <div style={{ fontSize: "10px", color: t.statLabelColor }}>your share</div>
                      </div>
                    </div>
                    <div className="res-bill-bar" style={{ background: `${color}22` }}>
                      <div style={{ height: "100%", width, background: color, borderRadius: "2px" }}></div>
                    </div>
                  </div>
                );
              })}
              <div style={{ borderTop: `1px solid ${t.cardBorder}`, paddingTop: "12px", display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontSize: "13px", fontWeight: 500, color: t.statValueColor }}>Total this month</div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: t.isDark ? "#34d399" : "#16a34a" }}>
                  ₹{Math.round(totalBill).toLocaleString("en-IN")}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Notices */}
        <div className="res-glass res-panel" style={{ background: t.cardBg, borderColor: t.cardBorder }}>
          <div className="res-panel-title" style={{ color: t.cardTitleColor }}>
            Latest notices
            <span style={{ fontSize: "11px", color: t.cardLinkColor, cursor: "pointer", fontWeight: 400 }}
              onClick={() => setPage("Notices")}>
              View all →
            </span>
          </div>
          {notices.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px", color: t.statLabelColor, fontSize: "13px" }}>
              No notices yet
            </div>
          ) : (
            notices.slice(0, 4).map((n, i) => (
              <div key={i} className="res-notice"
                style={{ background: `${t.accentColor}08`, borderLeftColor: t.accentColor }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: t.cardTitleColor, marginBottom: "4px" }}>
                  {n.title}
                </div>
                <div style={{ fontSize: "11px", color: t.statLabelColor, lineHeight: 1.6 }}>
                  {n.message.length > 80 ? n.message.slice(0, 80) + "..." : n.message}
                </div>
                <div style={{ fontSize: "10px", color: t.statLabelColor, marginTop: "6px" }}>
                  {new Date(n.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );

  const renderPayments = () => (
  <div className="res-glass res-panel" style={{ background: t.cardBg, borderColor: t.cardBorder }}>
    <div className="res-panel-title" style={{ color: t.cardTitleColor }}>
      Payment history — Flat {profile?.flat_number}
    </div>

    {/* Summary stats */}
    <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
      {[
        { label: "Total paid", value: payments.filter(p => p.status === "paid").length, color: t.isDark ? "#34d399" : "#16a34a" },
        { label: "Pending", value: payments.filter(p => p.status === "pending").length, color: t.isDark ? "#fbbf24" : "#d97706" },
        { label: "Overdue", value: payments.filter(p => p.status === "overdue").length, color: t.isDark ? "#f87171" : "#dc2626" },
      ].map((s, i) => (
        <div key={i} style={{
          flex: 1, padding: "12px", borderRadius: "10px",
          background: t.cardBg, border: `1px solid ${t.cardBorder}`,
          textAlign: "center"
        }}>
          <div style={{ fontSize: "20px", fontWeight: 700, color: s.color }}>{s.value}</div>
          <div style={{ fontSize: "10px", color: t.statLabelColor, marginTop: "2px" }}>{s.label}</div>
        </div>
      ))}
    </div>

    {payments.length === 0 ? (
      <div style={{ textAlign: "center", padding: "32px", color: t.statLabelColor }}>
        No payment records found
      </div>
    ) : (
      payments.map((p, i) => {
        const st = statusColor(p.status);
        return (
          <div key={i} className="res-pay-row"
            style={{ background: st.bg, borderColor: `${st.color}30` }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "13px", fontWeight: 500, color: t.cardTitleColor }}>
                {p.month}
              </div>
              <div style={{ fontSize: "11px", color: t.statLabelColor, marginTop: "2px" }}>
                {p.status === "paid"
                  ? `Paid on ${new Date(p.paid_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
                  : p.status === "overdue" ? "⚠️ Overdue — please pay immediately"
                  : "🕐 Payment pending"}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "14px", fontWeight: 700, color: t.statValueColor }}>
                ₹{p.amount?.toLocaleString("en-IN")}
              </div>
              <div style={{ marginTop: "4px" }}>
                <span style={{
                  fontSize: "10px", fontWeight: 600, padding: "2px 8px",
                  borderRadius: "20px", background: st.bg, color: st.color,
                  textTransform: "capitalize",
                }}>
                  {p.status}
                </span>
              </div>
            </div>
          </div>
        );
      })
    )}
  </div>
);

  const renderBills = () => (
  <div>
    {[...new Set(expenses.map(e => e.month))].map(month => {
      const monthExpenses = expenses.filter(e => e.month === month);
      const monthTotal = monthExpenses.reduce((sum, e) => sum + (e.per_house_amount || 0), 0);
      const monthPayment = payments.find(p => p.month === month);
      const isPaid = monthPayment?.status === "paid";

      return (
        <div key={month} className="res-glass res-panel"
          style={{ background: t.cardBg, borderColor: t.cardBorder, marginBottom: "16px" }}>

          {/* Month header */}
          <div className="res-panel-title" style={{ color: t.cardTitleColor }}>
            {month}
            <span style={{ fontSize: "13px", fontWeight: 700, color: t.isDark ? "#34d399" : "#16a34a" }}>
              ₹{Math.round(monthTotal).toLocaleString("en-IN")} total
            </span>
          </div>

          {/* Bill rows */}
          {monthExpenses.map((e, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between",
              padding: "10px 0",
              borderBottom: i < monthExpenses.length - 1
                ? `1px solid ${t.cardBorder}` : "none"
            }}>
              <div>
                <div style={{ fontSize: "13px", color: t.cardTitleColor }}>{e.title}</div>
                <div style={{
                  fontSize: "10px", color: t.statLabelColor,
                  textTransform: "capitalize", marginTop: "2px"
                }}>
                  {e.category}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "13px", fontWeight: 600, color: t.statValueColor }}>
                  ₹{e.per_house_amount?.toLocaleString("en-IN")}
                </div>
                <div style={{ fontSize: "10px", color: t.statLabelColor }}>your share</div>
              </div>
            </div>
          ))}

          {/* Total + Pay button */}
          <div style={{
            marginTop: "16px", paddingTop: "14px",
            borderTop: `1px solid ${t.cardBorder}`,
            display: "flex", justifyContent: "space-between", alignItems: "center"
          }}>
            <div>
              <div style={{ fontSize: "11px", color: t.statLabelColor, marginBottom: "2px" }}>
                Total due
              </div>
              <div style={{
                fontSize: "22px", fontWeight: 700,
                fontFamily: "'Syne', sans-serif", color: t.statValueColor
              }}>
                ₹{Math.round(monthTotal).toLocaleString("en-IN")}
              </div>
            </div>

            {isPaid ? (
              <div style={{
                padding: "10px 24px", borderRadius: "12px",
                background: t.isDark ? "rgba(16,185,129,0.15)" : "rgba(34,197,94,0.1)",
                color: t.isDark ? "#34d399" : "#16a34a",
                fontSize: "13px", fontWeight: 600,
                border: `1px solid ${t.isDark ? "rgba(16,185,129,0.3)" : "rgba(34,197,94,0.3)"}`,
                display: "flex", alignItems: "center", gap: "6px"
              }}>
                ✅ Paid on {new Date(monthPayment.paid_at).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short"
                })}
              </div>
            ) : (
              <button
                onClick={() => handlePayNow(month, monthTotal, monthPayment)}
                style={{
                  padding: "12px 28px", borderRadius: "12px",
                  background: t.accentColor,
                  color: "#fff", border: "none",
                  fontSize: "14px", fontWeight: 600,
                  cursor: "pointer", fontFamily: "'Syne', sans-serif",
                  boxShadow: `0 4px 16px ${t.accentColor}44`,
                  transition: "opacity 0.15s",
                }}
                onMouseEnter={e => e.target.style.opacity = "0.85"}
                onMouseLeave={e => e.target.style.opacity = "1"}
              >
                Pay Now ₹{Math.round(monthTotal).toLocaleString("en-IN")}
              </button>
            )}
          </div>
        </div>
      );
    })}
    {expenses.length === 0 && (
      <div style={{ textAlign: "center", padding: "48px", color: t.statLabelColor }}>
        No bills found
      </div>
    )}
  </div>
);
const handlePayNow = async (month, amount, existingPayment) => {
  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: Math.round(amount * 100), // convert to paise
    currency: "INR",
    name: "ApartEase",
    description: `Maintenance — ${month}`,
    image: "/favicon.ico",
    handler: async function (response) {
      try {
        if (existingPayment) {
          // Update existing payment
          await supabase
            .from("payments")
            .update({
              status: "paid",
              paid_at: new Date().toISOString(),
              razorpay_payment_id: response.razorpay_payment_id,
            })
            .eq("id", existingPayment.id);
        } else {
          // Create new payment record
          await supabase.from("payments").insert({
            resident_id: profile.id,
            flat_number: profile.flat_number,
            month: month,
            amount: amount,
            status: "paid",
            paid_at: new Date().toISOString(),
            razorpay_payment_id: response.razorpay_payment_id,
          });
        }

        // Refresh data
        await fetchData();

        alert(`✅ Payment successful!\nID: ${response.razorpay_payment_id}`);
      } catch (err) {
        console.error("Payment update error:", err);
        alert("Payment done but failed to update. Contact admin.");
      }
    },
    prefill: {
      name: profile?.full_name || "Resident",
      email: profile?.email || "",
      contact: profile?.phone || "",
    },
    theme: {
      color: t.accentColor,
    },
    modal: {
      ondismiss: () => console.log("Payment cancelled by user"),
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
};

  const renderNotices = () => (
    <div>
      {notices.map((n, i) => (
        <div key={i} className="res-notice res-glass"
          style={{ background: t.cardBg, borderColor: t.cardBorder, borderLeftColor: t.accentColor, marginBottom: "12px", padding: "16px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
            <div style={{ fontSize: "14px", fontWeight: 600, color: t.cardTitleColor }}>{n.title}</div>
            <div style={{ fontSize: "10px", color: t.statLabelColor }}>
              {new Date(n.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </div>
          </div>
          <div style={{ fontSize: "13px", color: t.statLabelColor, lineHeight: 1.7 }}>{n.message}</div>
        </div>
      ))}
      {notices.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px", color: t.statLabelColor }}>No notices found</div>
      )}
    </div>
  );

  const renderPage = () => {
    switch (page) {
      case "Payments": return renderPayments();
      case "Bills": return renderBills();
      case "Notices": return renderNotices();
      default: return renderDashboard();
    }
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  if (loading) return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: t.rootBg }}>
      <CircularProgress sx={{ color: t.accentColor }} />
    </div>
  );

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "R";

  return (
    <>
      <style>{styles}</style>
      <div className="res-root" style={{ background: t.rootBg }}>

        {/* SIDEBAR */}
        <div className="res-sidebar" style={{ background: t.sidebarBg, borderRightColor: t.sidebarBorder }}>
          <div className="res-sb-logo" style={{ borderBottomColor: t.sidebarBorder }}>
            <div className="res-sb-logo-row">
              <div className="res-sb-icon" style={{ background: t.logoIconBg }}>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="2">
                  <path d="M3 9l7-6 7 6v9a1 1 0 01-1 1H4a1 1 0 01-1-1V9z"/>
                  <path d="M8 19V13h4v6"/>
                </svg>
              </div>
              <span className="res-sb-name" style={{ color: t.logoColor }}>
                Apart<span style={{ color: t.logoAccent }}>Ease</span>
              </span>
            </div>
            <div className="res-sb-sub" style={{ color: t.subColor }}>
              Resident Portal · Flat {profile?.flat_number || "—"}
            </div>
          </div>

          <div className="res-nav">
            {navItems.map(({ label, icon }) => (
              <div key={label} className="res-nav-item"
                onClick={() => setPage(label)}
                style={page === label ? {
                  background: t.navActiveBg, color: t.navActiveColor, borderColor: t.navActiveBorder,
                } : { color: t.navColor }}>
                {icon}
                {label}
                {page === label && <div className="res-nav-dot" style={{ background: t.navDot }}></div>}
              </div>
            ))}
          </div>

          <div className="res-sb-foot" style={{ borderTopColor: t.sidebarBorder }}>
            <div className="res-sb-user" style={{ background: t.userBg }}>
              <div className="res-sb-avatar" style={{ background: t.avatarBg }}>{initials}</div>
              <div>
                <div style={{ fontSize: "12px", fontWeight: 500, color: t.userNameColor }}>
                  {profile?.full_name || "Resident"}
                </div>
                <div style={{ fontSize: "10px", color: t.subColor }}>Flat {profile?.flat_number}</div>
              </div>
            </div>
            <button className="logout-btn"
              style={{ borderColor: t.logoutBorder, color: t.logoutColor }}
              onClick={handleLogout}>
              Sign out
            </button>
          </div>
        </div>

        {/* MAIN */}
        <div className="res-main" style={{ background: t.mainBg }}>
          {/* Topbar */}
          <div className="res-topbar" style={{ background: t.topbarBg, borderBottomColor: t.topbarBorder }}>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "17px", fontWeight: 700, color: t.topbarTitleColor }}>
                {t.greeting}, {profile?.full_name?.split(" ")[0] || "Resident"}
              </div>
              <div style={{ fontSize: "11px", color: t.topbarSubColor, marginTop: "2px" }}>{dateStr}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
  <NotificationBell
    residentId={profile?.id}
    accentColor={t.accentColor}
    isDark={t.isDark}
  />
  <div style={{
    padding: "6px 14px", borderRadius: "20px", fontSize: "11px",
    fontWeight: 500, background: t.badgeBg, color: t.badgeColor,
    border: `1px solid ${t.badgeBorder}`, fontFamily: "'Syne', sans-serif",
  }}>
    {t.emoji} {t.name}
  </div>
  <div style={{
    padding: "6px 14px", borderRadius: "20px", fontSize: "11px",
    fontWeight: 500, background: t.badgeBg, color: t.badgeColor,
    border: `1px solid ${t.badgeBorder}`,
  }}>
    Flat {profile?.flat_number || "—"}
  </div>
</div>
          </div>

          {/* Content */}
          <div className="res-content">{renderPage()}</div>
        </div>
      </div>
    </>
  );
}