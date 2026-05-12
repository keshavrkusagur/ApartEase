import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import ResidentsPage from "./ResidentsPage";
import ExpensesPage from "./ExpensesPage";
import PaymentsPage from "./PaymentsPage";
import { sendNotificationToAll, sendNotification } from "../utils/notify";
import NoticesPage from "./NoticesPage";


const navItems = [
  { label: "Dashboard", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
  { label: "Residents", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg> },
  { label: "Payments", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
  { label: "Expenses", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
  { label: "Notices", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg> },
];

// All 4 theme configs — matching login page exactly
const themes = {
  morning: {
    name: "morning", emoji: "🌅",
    // Root & sidebar
    rootBg: "#FFF8F0",
    sidebarBg: "#FFF0E0",
    sidebarBorder: "#FFD4A0",
    // Logo
    logoIconBg: "linear-gradient(135deg,#FF6B35,#F7931E)"
    ,
    logoAccent: "#FF6B35",
    logoColor: "#1a1a1a",
    // Nav
    navActiveBg: "rgba(255,107,53,0.1)",
    navActiveColor: "#FF6B35",
    navActiveBorder: "rgba(255,107,53,0.2)",
    navDot: "#FF6B35",
    navColor: "#b8a898",
    navHoverBg: "rgba(255,107,53,0.05)",
    // Sub text
    subColor: "#b8a898",
    // User
    userBg: "rgba(255,107,53,0.06)",
    avatarBg: "linear-gradient(135deg,#FF6B35,#F7931E)",
    userNameColor: "#3d2a1a",
    logoutBorder: "rgba(255,107,53,0.15)",
    logoutColor: "#b8a898",
    logoutHoverBorder: "rgba(239,68,68,0.3)",
    logoutHoverColor: "#dc2626",
    // Topbar
    topbarBg: "#FFF4E8",
    topbarBorder: "#FFD4A0",
    topbarTitleColor: "#1a1a1a",
    topbarSubColor: "#b8a898",
    badgeBg: "rgba(255,107,53,0.08)",
    badgeColor: "#FF6B35",
    badgeBorder: "rgba(255,107,53,0.2)",
    bellBg: "rgba(255,107,53,0.06)",
    bellBorder: "rgba(255,107,53,0.15)",
    bellIcon: "#b8a898",
    notifDot: "#FF6B35",
    // Main content
    mainBg: "#FFF8F0",
    // Cards
    cardBg: "rgba(255,107,53,0.04)",
    cardBorder: "rgba(255,107,53,0.12)",
    cardTitleColor: "#3d2a1a",
    cardLinkColor: "#FF6B35",
    statLabelColor: "#b8a898",
    statValueColor: "#1a1a1a",
    // Stat icons
    icon1Bg: "rgba(255,107,53,0.12)", icon1Color: "#FF6B35",
    icon2Bg: "rgba(247,147,30,0.12)", icon2Color: "#F7931E",
    icon3Bg: "rgba(34,197,94,0.12)", icon3Color: "#22c55e",
    icon4Bg: "rgba(255,107,53,0.12)", icon4Color: "#FF6B35",
    // Bill bar colors same across themes
    billBar1: "#FF6B35", billBar2: "#F7931E", billBar3: "#22c55e", billBar4: "#f87171",
    // AI card
    aiCardBg: "rgba(255,107,53,0.06)",
    aiCardBorder: "rgba(255,107,53,0.14)",
    aiHeaderColor: "#FF6B35",
    aiTipColor: "#7a6a5a",
    // Greeting
    greeting: "Good morning",
  },
  afternoon: {
    name: "afternoon", emoji: "☀️",
    rootBg: "#F0F8FF",
    sidebarBg: "#E8F4FD",
    sidebarBorder: "#B0D4F1",
    logoIconBg: "linear-gradient(135deg,#1565C0,#2196F3)",
    logoAccent: "#2196F3",
    logoColor: "#0d2137",
    navActiveBg: "rgba(33,150,243,0.1)",
    navActiveColor: "#1565C0",
    navActiveBorder: "rgba(33,150,243,0.2)",
    navDot: "#2196F3",
    navColor: "#90a8c0",
    navHoverBg: "rgba(33,150,243,0.05)",
    subColor: "#90a8c0",
    userBg: "rgba(33,150,243,0.06)",
    avatarBg: "linear-gradient(135deg,#1565C0,#2196F3)",
    userNameColor: "#0d2137",
    logoutBorder: "rgba(33,150,243,0.15)",
    logoutColor: "#90a8c0",
    logoutHoverBorder: "rgba(239,68,68,0.3)",
    logoutHoverColor: "#dc2626",
    topbarBg: "#EBF5FB",
    topbarBorder: "#B0D4F1",
    topbarTitleColor: "#0d2137",
    topbarSubColor: "#90a8c0",
    badgeBg: "rgba(33,150,243,0.08)",
    badgeColor: "#1565C0",
    badgeBorder: "rgba(33,150,243,0.2)",
    bellBg: "rgba(33,150,243,0.06)",
    bellBorder: "rgba(33,150,243,0.15)",
    bellIcon: "#90a8c0",
    notifDot: "#2196F3",
    mainBg: "#F0F8FF",
    cardBg: "rgba(33,150,243,0.04)",
    cardBorder: "rgba(33,150,243,0.12)",
    cardTitleColor: "#0d2137",
    cardLinkColor: "#2196F3",
    statLabelColor: "#90a8c0",
    statValueColor: "#0d2137",
    icon1Bg: "rgba(33,150,243,0.12)", icon1Color: "#1565C0",
    icon2Bg: "rgba(245,158,11,0.12)", icon2Color: "#d97706",
    icon3Bg: "rgba(34,197,94,0.12)", icon3Color: "#16a34a",
    icon4Bg: "rgba(33,150,243,0.12)", icon4Color: "#1565C0",
    billBar1: "#2196F3", billBar2: "#F7931E", billBar3: "#22c55e", billBar4: "#f87171",
    aiCardBg: "rgba(33,150,243,0.06)",
    aiCardBorder: "rgba(33,150,243,0.14)",
    aiHeaderColor: "#1565C0",
    aiTipColor: "#4a6a8a",
    greeting: "Good afternoon",
  },
evening: {
  name: "evening", emoji: "🌸",
  rootBg: "#fff0f5",
  sidebarBg: "#ffe4ef",
  sidebarBorder: "#ffc2d4",
  logoIconBg: "linear-gradient(135deg,#ff80ab,#ffb6c1)",
  logoAccent: "#ff80ab",
  logoColor: "#3d1a2e",
  navActiveBg: "rgba(255,128,171,0.12)",
  navActiveColor: "#e91e8c",
  navActiveBorder: "rgba(255,128,171,0.25)",
  navDot: "#ff80ab",
  navColor: "#c48fa0",
  navHoverBg: "rgba(255,128,171,0.06)",
  subColor: "#c48fa0",
  userBg: "rgba(255,128,171,0.08)",
  avatarBg: "linear-gradient(135deg,#ff80ab,#ffb6c1)",
  userNameColor: "#3d1a2e",
  logoutBorder: "rgba(255,128,171,0.2)",
  logoutColor: "#c48fa0",
  logoutHoverBorder: "rgba(239,68,68,0.3)",
  logoutHoverColor: "#dc2626",
  topbarBg: "#ffeef5",
  topbarBorder: "#ffc2d4",
  topbarTitleColor: "#3d1a2e",
  topbarSubColor: "#c48fa0",
  badgeBg: "rgba(255,128,171,0.12)",
  badgeColor: "#e91e8c",
  badgeBorder: "rgba(255,128,171,0.25)",
  bellBg: "rgba(255,128,171,0.08)",
  bellBorder: "rgba(255,128,171,0.2)",
  bellIcon: "#c48fa0",
  notifDot: "#ff80ab",
  mainBg: "#fff5f8",
  cardBg: "rgba(255,255,255,0.8)",
  cardBorder: "#ffc2d4",
  cardTitleColor: "#3d1a2e",
  cardLinkColor: "#e91e8c",
  statLabelColor: "#c48fa0",
  statValueColor: "#3d1a2e",
  icon1Bg: "rgba(255,128,171,0.15)", icon1Color: "#e91e8c",
  icon2Bg: "rgba(255,182,193,0.2)", icon2Color: "#e91e8c",
  icon3Bg: "rgba(16,185,129,0.1)", icon3Color: "#059669",
  icon4Bg: "rgba(255,128,171,0.15)", icon4Color: "#e91e8c",
  billBar1: "#ff80ab", billBar2: "#ffb347", billBar3: "#34d399", billBar4: "#f87171",
  aiCardBg: "rgba(255,128,171,0.06)",
  aiCardBorder: "rgba(255,128,171,0.15)",
  aiHeaderColor: "#e91e8c",
  aiTipColor: "#7a4a5a",
  greeting: "Good evening",
},
  night: {
    name: "night", emoji: "🌙",
    rootBg: "#0a0f1e",
    sidebarBg: "rgba(255,255,255,0.02)",
    sidebarBorder: "rgba(255,255,255,0.06)",
    logoIconBg: "linear-gradient(135deg,#4f46e5,#7c3aed)",
    logoAccent: "#a5b4fc",
    logoColor: "#fff",
    navActiveBg: "rgba(99,102,241,0.1)",
    navActiveColor: "#a5b4fc",
    navActiveBorder: "rgba(99,102,241,0.18)",
    navDot: "#6366f1",
    navColor: "rgba(255,255,255,0.3)",
    navHoverBg: "rgba(255,255,255,0.04)",
    subColor: "rgba(255,255,255,0.22)",
    userBg: "rgba(255,255,255,0.03)",
    avatarBg: "linear-gradient(135deg,#4f46e5,#7c3aed)",
    userNameColor: "rgba(255,255,255,0.65)",
    logoutBorder: "rgba(255,255,255,0.07)",
    logoutColor: "rgba(255,255,255,0.28)",
    logoutHoverBorder: "rgba(239,68,68,0.3)",
    logoutHoverColor: "#f87171",
    topbarBg: "rgba(255,255,255,0.01)",
    topbarBorder: "rgba(255,255,255,0.05)",
    topbarTitleColor: "#fff",
    topbarSubColor: "rgba(255,255,255,0.28)",
    badgeBg: "rgba(99,102,241,0.1)",
    badgeColor: "#a5b4fc",
    badgeBorder: "rgba(99,102,241,0.2)",
    bellBg: "rgba(255,255,255,0.04)",
    bellBorder: "rgba(255,255,255,0.07)",
    bellIcon: "rgba(255,255,255,0.4)",
    notifDot: "#f87171",
    mainBg: "#04060f",
    cardBg: "rgba(255,255,255,0.03)",
    cardBorder: "rgba(255,255,255,0.07)",
    cardTitleColor: "rgba(255,255,255,0.7)",
    cardLinkColor: "#6366f1",
    statLabelColor: "rgba(255,255,255,0.32)",
    statValueColor: "#fff",
    icon1Bg: "rgba(99,102,241,0.15)", icon1Color: "#a5b4fc",
    icon2Bg: "rgba(251,191,36,0.12)", icon2Color: "#fbbf24",
    icon3Bg: "rgba(16,185,129,0.12)", icon3Color: "#34d399",
    icon4Bg: "rgba(139,92,246,0.15)", icon4Color: "#c4b5fd",
    billBar1: "#6366f1", billBar2: "#fbbf24", billBar3: "#34d399", billBar4: "#f87171",
    aiCardBg: "rgba(99,102,241,0.06)",
    aiCardBorder: "rgba(99,102,241,0.14)",
    aiHeaderColor: "#6366f1",
    aiTipColor: "rgba(255,255,255,0.5)",
    greeting: "Good night",
  },
};

export default function AdminDashboard() {
  const [page, setPage] = useState("Dashboard");
  const [theme, setTheme] = useState("night");
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState([]);
const [selectedMonth, setSelectedMonth] = useState("");
const [availableMonths, setAvailableMonths] = useState([]);
const [loadingExpenses, setLoadingExpenses] = useState(true);
const [residents, setResidents] = useState([]);      
const [payments, setPayments] = useState([]);

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
  useEffect(() => {
  fetchExpenses();
}, []);

const fetchExpenses = async () => {
  setLoadingExpenses(true);

  const [expRes, resRes, payRes] = await Promise.all([
    supabase.from("expenses").select("*").order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, full_name, flat_number").eq("role", "resident").order("flat_number"),
    supabase.from("payments").select("*"),
  ]);

  setExpenses(expRes.data || []);
  setResidents(resRes.data || []);
  setPayments(payRes.data || []);

  // Get months from EXPENSES only
  const months = [...new Set((expRes.data || []).map(e => e.month))];
  setAvailableMonths(months);
  if (months.length > 0) setSelectedMonth(months[0]);
  setLoadingExpenses(false);
};
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const t = themes[theme];
  const filteredExpenses = expenses.filter(e => e.month === selectedMonth);
const totalAmount = filteredExpenses.reduce((sum, e) => sum + (e.total_amount || 0), 0);
const totalPerHouse = filteredExpenses.reduce((sum, e) => sum + (e.per_house_amount || 0), 0);
const maxAmount = filteredExpenses.length > 0
  ? Math.max(...filteredExpenses.map(e => e.total_amount))
  : 1;

// ── Dashboard stat calculations ──
const totalMaintenance = filteredExpenses.reduce((sum, e) => sum + (e.total_amount || 0), 0);
const perHouseCost = filteredExpenses.reduce((sum, e) => sum + (e.per_house_amount || 0), 0);
const amountReceived = payments
  .filter(p => p.month === selectedMonth && p.status === "paid")
  .reduce((sum, p) => sum + (p.amount || 0), 0);
const surplusFunds = amountReceived - totalMaintenance;
const categoryColors = {
  water: t.billBar1,
  electricity: t.billBar2,
  security: t.billBar3,
  cleaning: "#a78bfa",
  other: t.billBar4,
};

  const isDark = theme === "night" || theme === "evening";

  // Shared status colors (same across all themes)
  const paid = { bg: isDark ? "rgba(16,185,129,0.15)" : "rgba(34,197,94,0.12)", color: isDark ? "#34d399" : "#16a34a", border: isDark ? "rgba(16,185,129,0.2)" : "rgba(34,197,94,0.2)" };
  const pending = { bg: isDark ? "rgba(251,191,36,0.15)" : "rgba(245,158,11,0.12)", color: isDark ? "#fbbf24" : "#d97706", border: isDark ? "rgba(251,191,36,0.2)" : "rgba(245,158,11,0.2)" };
  const overdue = { bg: isDark ? "rgba(239,68,68,0.15)" : "rgba(239,68,68,0.1)", color: isDark ? "#f87171" : "#dc2626", border: isDark ? "rgba(239,68,68,0.2)" : "rgba(239,68,68,0.15)" };

  const houseStatuses = ["paid","paid","paid","overdue","paid","paid","overdue","paid","paid","paid","paid","paid","paid","pending","paid","paid","paid","paid","paid","paid","pending","paid","paid","pending"];

  const statusStyle = (s) => s === "paid" ? paid : s === "pending" ? pending : overdue;

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }

    @keyframes slideUp { from{opacity:0;transform:translateY(12px);} to{opacity:1;transform:translateY(0);} }
    @keyframes pulse { 0%,100%{opacity:0.5;} 50%{opacity:1;} }
    @keyframes fadeIn { from{opacity:0;} to{opacity:1;} }
    @keyframes shimmer { 0%{left:-100%;} 100%{left:200%;} }

    .dash-root {
      display: flex; height: 100vh; width: 100%;
      font-family: 'DM Sans', sans-serif;
      overflow: hidden;
      transition: background 1s ease;
    }

    /* SIDEBAR */
    .sidebar {
      width: 224px; flex-shrink: 0;
      display: flex; flex-direction: column;
      transition: background 1s ease, border-color 1s ease;
      border-right-width: 1px; border-right-style: solid;
    }
    .sb-logo {
      padding: 24px 20px 20px;
      border-bottom-width: 1px; border-bottom-style: solid;
      transition: border-color 1s ease;
    }
    .sb-logo-row { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
    .sb-logo-icon {
      width: 32px; height: 32px; border-radius: 9px;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: background 1s ease;
    }
    .sb-logo-name {
      font-family: 'Syne', sans-serif;
      font-size: 16px; font-weight: 800;
      transition: color 1s ease;
    }
    .sb-sub {
      font-size: 10px; letter-spacing: 0.04em;
      transition: color 1s ease;
    }
    .sb-nav { padding: 14px 10px; flex: 1; }
    .nav-item {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 12px; border-radius: 10px;
      font-size: 13px; cursor: pointer;
      margin-bottom: 3px;
      border: 1px solid transparent;
      transition: all 0.2s;
      position: relative;
    }
    .nav-item:hover { opacity: 0.85; }
    .nav-dot { width: 4px; height: 4px; border-radius: 50%; margin-left: auto; }

    .sb-bottom {
      padding: 14px 10px;
      border-top-width: 1px; border-top-style: solid;
      transition: border-color 1s ease;
    }
    .sb-user {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 12px; border-radius: 10px;
      margin-bottom: 8px;
      transition: background 1s ease;
    }
    .sb-avatar {
      width: 30px; height: 30px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; color: #fff;
      flex-shrink: 0; transition: background 1s ease;
    }
    .sb-user-name { font-size: 12px; font-weight: 500; transition: color 1s ease; }
    .sb-user-role { font-size: 10px; transition: color 1s ease; }
    .logout-btn {
      width: 100%; padding: 9px;
      background: transparent;
      border-radius: 9px; font-size: 12px;
      cursor: pointer; font-family: 'DM Sans', sans-serif;
      transition: all 0.2s;
      border-width: 1px; border-style: solid;
    }

    /* TOPBAR */
    .topbar {
      display: flex; justify-content: space-between; align-items: center;
      padding: 20px 28px;
      border-bottom-width: 1px; border-bottom-style: solid;
      transition: all 1s ease;
    }
    .topbar-title {
      font-family: 'Syne', sans-serif;
      font-size: 17px; font-weight: 700;
      transition: color 1s ease;
    }
    .topbar-sub { font-size: 11px; margin-top: 2px; transition: color 1s ease; }
    .topbar-right { display: flex; align-items: center; gap: 10px; }
    .month-badge {
      padding: 6px 14px; border-radius: 20px;
      font-size: 11px; font-weight: 500;
      border-width: 1px; border-style: solid;
      transition: all 1s ease;
    }
    .notif-btn {
      width: 34px; height: 34px; border-radius: 9px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; position: relative;
      border-width: 1px; border-style: solid;
      transition: all 1s ease;
    }
    .notif-dot {
      width: 7px; height: 7px; border-radius: 50%;
      position: absolute; top: 6px; right: 6px;
      animation: pulse 2s infinite;
    }
    .theme-badge {
      display: flex; align-items: center; gap: 6px;
      font-size: 11px; padding: 5px 12px;
      border-radius: 20px; font-weight: 500;
      border-width: 1px; border-style: solid;
      font-family: 'Syne', sans-serif;
      transition: all 1s ease;
    }

    /* MAIN */
    .main { flex: 1; overflow: auto; display: flex; flex-direction: column; transition: background 1s ease; }
    .main-content { padding: 24px 28px; flex: 1; }

    /* GLASS CARD */
    .glass-card {
      border-radius: 16px;
      border-width: 1px; border-style: solid;
      transition: all 1s ease;
    }

    /* STAT GRID */
    .stat-grid { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 14px; margin-bottom: 20px; }
    .stat-card { padding: 18px; animation: slideUp 0.5s ease both; }
    .stat-icon { width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; transition: all 1s ease; }
    .stat-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; transition: color 1s ease; }
    .stat-value { font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 700; margin-bottom: 4px; transition: color 1s ease; }
    .stat-sub { font-size: 11px; }

    /* TWO COL */
    .two-col { display: grid; grid-template-columns: 1.4fr 1fr; gap: 16px; margin-bottom: 16px; }
    .panel { padding: 20px; }
    .panel-title {
      font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600;
      margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;
      transition: color 1s ease;
    }
    .panel-link { font-size: 11px; font-weight: 400; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: color 1s ease; }

    /* HOUSE GRID */
    .house-grid { display: grid; grid-template-columns: repeat(6,1fr); gap: 6px; }
    .h-cell {
      aspect-ratio: 1; border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      font-size: 9px; font-weight: 600; cursor: pointer;
      transition: transform 0.1s; border: 1px solid transparent;
    }
    .h-cell:hover { transform: scale(1.1); }
    .legend { display: flex; gap: 14px; margin-top: 12px; }
    .leg-item { display: flex; align-items: center; gap: 5px; font-size: 11px; }
    .leg-dot { width: 7px; height: 7px; border-radius: 2px; }

    /* REMINDERS */
    .reminder {
      display: flex; align-items: center; gap: 10px;
      padding: 11px 12px; border-radius: 10px; margin-bottom: 8px;
      border: 1px solid; transition: all 1s ease;
    }
    .r-avatar { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; flex-shrink: 0; }
    .r-name { font-size: 12px; font-weight: 500; transition: color 1s ease; }
    .r-sub { font-size: 10px; transition: color 1s ease; }
    .r-amt { font-size: 12px; font-weight: 600; margin-left: auto; }

    /* BILL LIST */
    .bill-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
    .bill-name { font-size: 13px; transition: color 1s ease; }
    .bill-cat { font-size: 10px; transition: color 1s ease; }
    .bill-amt { font-size: 13px; font-weight: 600; transition: color 1s ease; }
    .bill-per { font-size: 10px; text-align: right; transition: color 1s ease; }
    .bill-bar { height: 3px; border-radius: 2px; margin: 6px 0 14px; transition: background 1s ease; }
    .bill-bar-fill { height: 100%; border-radius: 2px; }
    .bill-total { border-top-width: 1px; border-top-style: solid; padding-top: 12px; display: flex; justify-content: space-between; transition: border-color 1s ease; }

    /* AI CARD */
    .ai-card { border-radius: 16px; padding: 20px; border-width: 1px; border-style: solid; transition: all 1s ease; }
    .ai-header { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 500; margin-bottom: 8px; font-family: 'Syne', sans-serif; transition: color 1s ease; }
    .ai-tip { font-size: 12px; line-height: 1.7; transition: color 1s ease; }
    .ai-save { font-size: 11px; color: #34d399; font-weight: 500; margin-top: 6px; }
    .ai-divider { height: 1px; margin: 12px 0; transition: background 1s ease; }

    /* PLACEHOLDER */
    .placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; gap: 10px; font-size: 14px; opacity: 0.4; }

    /* SCROLLBAR */
    .main::-webkit-scrollbar { width: 4px; }
    .main::-webkit-scrollbar-track { background: transparent; }
    .main::-webkit-scrollbar-thumb { border-radius: 2px; }
  `;

  const renderDashboard = () => (
  <>
    {/* Stat cards */}
    <div className="stat-grid">
      {[
  {
    label: "Total maintenance",
    value: `₹${totalMaintenance.toLocaleString("en-IN")}`,
    sub: `${filteredExpenses.length} bills · ${selectedMonth || "—"}`,
    subColor: isDark ? "#a5b4fc" : "#6366f1",
    iconBg: t.icon1Bg, iconColor: t.icon1Color,
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>
  },
  {
    label: "Amount received",
    value: `₹${amountReceived.toLocaleString("en-IN")}`,
    sub: `${payments.filter(p => p.month === selectedMonth && p.status === "paid").length} of ${residents.length} paid`,
    subColor: isDark ? "#34d399" : "#16a34a",
    iconBg: t.icon2Bg, iconColor: t.icon2Color,
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
  },
  {
    label: "Per house cost",
    value: `₹${Math.round(perHouseCost).toLocaleString("en-IN")}`,
    sub: `Auto split ÷ ${residents.length || 24}`,
    subColor: isDark ? "#fbbf24" : "#d97706",
    iconBg: t.icon3Bg, iconColor: t.icon3Color,
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
  },
  {
    label: "Surplus funds",
   value: `₹${Math.abs(surplusFunds).toLocaleString("en-IN")}`,
    sub: surplusFunds >= 0 ? "↑ Surplus available" : "↓ Deficit this month",
subColor: surplusFunds >= 0
  ? (isDark ? "#34d399" : "#16a34a")
  : (isDark ? "#f87171" : "#dc2626"),
    iconBg: t.icon4Bg, iconColor: t.icon4Color,
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
  },
].map((s, i) => (
  <div key={i} className="glass-card stat-card"
    style={{ background: t.cardBg, borderColor: t.cardBorder, animationDelay: `${i * 0.08}s` }}>
    <div className="stat-icon" style={{ background: s.iconBg, color: s.iconColor }}>{s.icon}</div>
    <div className="stat-label" style={{ color: t.statLabelColor }}>{s.label}</div>
    <div className="stat-value" style={{ color: t.statValueColor }}>{s.value}</div>
    <div className="stat-sub" style={{ color: s.subColor }}>{s.sub}</div>
  </div>
))}
    </div>

    {/* Bill breakdown + house grid */}
    <div className="two-col">

      {/* Bill breakdown — REAL DATA */}
      <div className="glass-card panel" style={{ background: t.cardBg, borderColor: t.cardBorder }}>
        <div className="panel-title" style={{ color: t.cardTitleColor }}>
          <span>Bill breakdown</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{
              background: t.cardBg,
              border: `1px solid ${t.cardBorder}`,
              borderRadius: "8px",
              padding: "4px 10px",
              fontSize: "11px",
              color: t.cardLinkColor,
              cursor: "pointer",
              outline: "none",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {availableMonths.length === 0
              ? <option>No data</option>
              : availableMonths.map(m => <option key={m} value={m}>{m}</option>)
            }
          </select>
        </div>

        {loadingExpenses ? (
          <div style={{ textAlign: "center", padding: "24px", color: t.statLabelColor, fontSize: "13px" }}>
            Loading...
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px", color: t.statLabelColor, fontSize: "13px" }}>
            No expenses found for {selectedMonth || "this month"}.
            Add expenses in the Expenses tab!
          </div>
        ) : (
          <>
            {filteredExpenses.map((e, i) => {
              const color = categoryColors[e.category] || t.billBar1;
              const barWidth = `${Math.round((e.total_amount / maxAmount) * 100)}%`;
              return (
                <div key={i}>
                  <div className="bill-row">
                    <div>
                      <div className="bill-name" style={{ color: t.cardTitleColor }}>{e.title}</div>
                      <div className="bill-cat" style={{ color: t.statLabelColor }}>
                        {e.category?.charAt(0).toUpperCase() + e.category?.slice(1)} ·{" "}
                        {e.bill_date
                          ? new Date(e.bill_date).toLocaleDateString("en-IN")
                          : e.month}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="bill-amt" style={{ color: t.statValueColor }}>
                        ₹{e.total_amount?.toLocaleString("en-IN")}
                      </div>
                      <div className="bill-per" style={{ color: t.cardLinkColor }}>
                        ₹{e.per_house_amount?.toLocaleString("en-IN")}/house
                      </div>
                    </div>
                  </div>
                  <div className="bill-bar" style={{ background: `${color}22` }}>
                    <div className="bill-bar-fill" style={{ width: barWidth, background: color }}></div>
                  </div>
                </div>
              );
            })}

            <div className="bill-total" style={{ borderColor: t.cardBorder }}>
              <div className="bill-name" style={{ fontWeight: 500, color: t.statValueColor }}>
                Total / house this month
              </div>
              <div className="bill-amt" style={{ color: isDark ? "#34d399" : "#16a34a" }}>
                ₹{Math.round(totalPerHouse).toLocaleString("en-IN")}
              </div>
            </div>
          </>
        )}
      </div>

      {/* House payment grid */}
      <div className="glass-card panel" style={{ background: t.cardBg, borderColor: t.cardBorder }}>
        <div className="panel-title" style={{ color: t.cardTitleColor }}>
  Payment status — {residents.length} flats
  <span
    className="panel-link"
    style={{ color: t.cardLinkColor, cursor: "pointer" }}
    onClick={() => setPage("Payments")}
  >
    View all →
  </span>
</div>
        <div className="house-grid">
          {residents.length === 0 ? (
  <div style={{ color: t.statLabelColor, fontSize: "12px", gridColumn: "span 6", textAlign: "center", padding: "12px" }}>
    No residents found
  </div>
) : (
  residents.map((r, i) => {
    const payment = payments.find(
      p => p.resident_id === r.id && p.month === selectedMonth
    );
    const status = payment?.status || "no_payment";
    const style =
      status === "paid" ? paid :
      status === "pending" ? pending :
      status === "overdue" ? overdue :
      {
        bg: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
        color: isDark ? "rgba(255,255,255,0.3)" : "#9ca3af",
        border: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"
      };
    return (
      <div
        key={i}
        className="h-cell"
        title={`${r.full_name || r.flat_number} — ${status}`}
        onClick={() => setPage("Payments")}
        style={{
          background: style.bg,
          color: style.color,
          borderColor: style.border,
          cursor: "pointer",
          fontSize: r.flat_number?.length > 3 ? "7px" : "9px",
        }}
      >
        {r.flat_number || `H${i + 1}`}
      </div>
    );
  })
)}
        </div>
        <div className="legend">
  {(() => {
    const paidC = residents.filter(r => payments.find(p => p.resident_id === r.id && p.month === selectedMonth && p.status === "paid")).length;
    const pendingC = residents.filter(r => payments.find(p => p.resident_id === r.id && p.month === selectedMonth && p.status === "pending")).length;
    const overdueC = residents.filter(r => payments.find(p => p.resident_id === r.id && p.month === selectedMonth && p.status === "overdue")).length;
    const noneC = residents.filter(r => !payments.find(p => p.resident_id === r.id && p.month === selectedMonth)).length;
    return (
      <>
        <div className="leg-item" style={{ color: t.statLabelColor }}><div className="leg-dot" style={{ background: paid.color }}></div>Paid ({paidC})</div>
        <div className="leg-item" style={{ color: t.statLabelColor }}><div className="leg-dot" style={{ background: pending.color }}></div>Pending ({pendingC})</div>
        <div className="leg-item" style={{ color: t.statLabelColor }}><div className="leg-dot" style={{ background: overdue.color }}></div>Overdue ({overdueC})</div>
        <div className="leg-item" style={{ color: t.statLabelColor }}><div className="leg-dot" style={{ background: isDark ? "rgba(255,255,255,0.2)" : "#d1d5db" }}></div>No payment ({noneC})</div>
      </>
    );
  })()}
</div>
      </div>
    </div>

    {/* AI Advisor */}
    <div className="ai-card" style={{ background: t.aiCardBg, borderColor: t.aiCardBorder }}>
      <div className="ai-header" style={{ color: t.aiHeaderColor }}>
        AI Savings Advisor
        {filteredExpenses.length > 0 && (
          <span style={{ fontSize: "10px", color: t.statLabelColor, fontWeight: 400, marginLeft: "8px" }}>
            Based on {selectedMonth} data
          </span>
        )}
      </div>
      {filteredExpenses.length === 0 ? (
        <div className="ai-tip" style={{ color: t.aiTipColor }}>
          Add expenses to get AI savings recommendations.
        </div>
      ) : (
        <>
          {filteredExpenses.find(e => e.category === "electricity") && (
            <>
              <div className="ai-tip" style={{ color: t.aiTipColor }}>
                Your electricity bill is ₹{filteredExpenses.find(e => e.category === "electricity")?.total_amount?.toLocaleString("en-IN")}. Switch corridor lights to motion sensors — save up to 35%.
              </div>
              <div className="ai-save">
                Potential saving: ₹{Math.round(filteredExpenses.find(e => e.category === "electricity")?.total_amount * 0.35).toLocaleString("en-IN")}/month
              </div>
              <div className="ai-divider" style={{ background: t.aiCardBorder }}></div>
            </>
          )}
          {filteredExpenses.find(e => e.category === "water") && (
            <>
              <div className="ai-tip" style={{ color: t.aiTipColor }}>
                Water bill is ₹{filteredExpenses.find(e => e.category === "water")?.total_amount?.toLocaleString("en-IN")}. Negotiate bulk contract for commercial rates.
              </div>
              <div className="ai-save">
                Potential saving: ₹{Math.round(filteredExpenses.find(e => e.category === "water")?.total_amount * 0.15).toLocaleString("en-IN")}/month
              </div>
              <div className="ai-divider" style={{ background: t.aiCardBorder }}></div>
            </>
          )}
          <div className="ai-tip" style={{ color: t.aiTipColor }}>
            Total monthly spend per house is ₹{Math.round(totalPerHouse).toLocaleString("en-IN")}. Solar panels on terrace could reduce costs by 40%.
          </div>
          <div className="ai-save">
            Potential saving: ₹{Math.round(totalAmount * 0.1).toLocaleString("en-IN")}/month
          </div>
        </>
      )}
    </div>
  </>
);

  const renderPage = () => {
    switch (page) {
      case "Residents": return <ResidentsPage theme={theme} />;
      case "Expenses":  return <ExpensesPage theme={theme} />;
      case "Payments":  return <PaymentsPage theme={theme} />;
      case "Notices": return <NoticesPage theme={theme} />;
      default: return renderDashboard();
    }
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const monthStr = now.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  return (
    <>
      <style>{styles}</style>
      <div className="dash-root" style={{ background: t.rootBg }}>

        {/* SIDEBAR */}
        <div className="sidebar" style={{ background: t.sidebarBg, borderRightColor: t.sidebarBorder }}>
          <div className="sb-logo" style={{ borderBottomColor: t.sidebarBorder }}>
            <div className="sb-logo-row">
              <div className="sb-logo-icon" style={{ background: t.logoIconBg }}>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="2">
                  <path d="M3 9l7-6 7 6v9a1 1 0 01-1 1H4a1 1 0 01-1-1V9z"/>
                  <path d="M8 19V13h4v6"/>
                </svg>
              </div>
              <span className="sb-logo-name" style={{ color: t.logoColor }}>
                Apart<span style={{ color: t.logoAccent }}>Ease</span>
              </span>
            </div>
            <div className="sb-sub" style={{ color: t.subColor }}>Admin Panel · 24 units</div>
          </div>

          <div className="sb-nav">
            {navItems.map(({ label, icon }) => (
              <div key={label} className="nav-item"
                onClick={() => setPage(label)}
                style={page === label ? {
                  background: t.navActiveBg,
                  color: t.navActiveColor,
                  borderColor: t.navActiveBorder,
                } : {
                  color: t.navColor,
                }}
              >
                {icon}
                {label}
                {page === label && <div className="nav-dot" style={{ background: t.navDot }}></div>}
              </div>
            ))}
          </div>

          <div className="sb-bottom" style={{ borderTopColor: t.sidebarBorder }}>
            <div className="sb-user" style={{ background: t.userBg }}>
              <div className="sb-avatar" style={{ background: t.avatarBg }}>A</div>
              <div>
                <div className="sb-user-name" style={{ color: t.userNameColor }}>Admin</div>
                <div className="sb-user-role" style={{ color: t.subColor }}>Super Admin</div>
              </div>
            </div>
            <button className="logout-btn"
              style={{ borderColor: t.logoutBorder, color: t.logoutColor }}
              onMouseEnter={e => { e.target.style.borderColor = t.logoutHoverBorder; e.target.style.color = t.logoutHoverColor; }}
              onMouseLeave={e => { e.target.style.borderColor = t.logoutBorder; e.target.style.color = t.logoutColor; }}
              onClick={handleLogout}
            >
              Sign out
            </button>
          </div>
        </div>

        {/* MAIN */}
        <div className="main" style={{ background: t.mainBg }}>
          {/* Topbar */}
          <div className="topbar" style={{ background: t.topbarBg, borderBottomColor: t.topbarBorder }}>
            <div>
              <div className="topbar-title" style={{ color: t.topbarTitleColor }}>{t.greeting}, Admin</div>
              <div className="topbar-sub" style={{ color: t.topbarSubColor }}>{dateStr}</div>
            </div>
            <div className="topbar-right">
              {/* Theme indicator */}
              <div className="theme-badge" style={{ background: t.badgeBg, color: t.badgeColor, borderColor: t.badgeBorder }}>
                {t.emoji} {t.name.charAt(0).toUpperCase() + t.name.slice(1)}
              </div>
              <div className="month-badge" style={{ background: t.badgeBg, color: t.badgeColor, borderColor: t.badgeBorder }}>
                {monthStr}
              </div>
              <div className="notif-btn" 
  style={{ background: t.bellBg, borderColor: t.bellBorder, cursor: "pointer" }}
  onClick={async () => {
    // Send overdue reminders to all overdue residents
    const overduePayments = payments.filter(
      p => p.month === selectedMonth && p.status === "overdue"
    );
    
    for (const p of overduePayments) {
      await sendNotification(
        p.resident_id,
        "overdue",
        "Payment Overdue ⚠️",
        `Your payment of ₹${p.amount} for ${p.month} is overdue. Please pay immediately.`
      );
    }

    // Also send due reminders to pending
    const pendingPayments = payments.filter(
      p => p.month === selectedMonth && p.status === "pending"
    );
    for (const p of pendingPayments) {
      await sendNotification(
        p.resident_id,
        "due_reminder",
        "Payment Reminder 🔔",
        `Your payment of ₹${p.amount} for ${p.month} is due. Please pay on time.`
      );
    }

    alert(`Sent reminders to ${overduePayments.length + pendingPayments.length} residents!`);
  }}
  title="Send reminders to overdue/pending residents"
>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.bellIcon} strokeWidth="2">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 01-3.46 0"/>
  </svg>
  <div className="notif-dot" style={{ background: t.notifDot }}></div>
              </div>
            </div>
          </div>

          {/* Page content */}
          <div className="main-content">{renderPage()}</div>
        </div>

      </div>
    </>
  );
}