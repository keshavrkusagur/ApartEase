import { useState, useEffect } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { Alert, CircularProgress } from "@mui/material";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState("night");
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
const [fullName, setFullName] = useState("");
const [message, setMessage] = useState("");

  // Auto-detect theme based on time
  useEffect(() => {
    const detectTheme = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) setTheme("morning");
      else if (hour >= 12 && hour < 17) setTheme("afternoon");
      else if (hour >= 17 && hour < 21) setTheme("evening");
      else setTheme("night");
    };
    detectTheme();
    const interval = setInterval(detectTheme, 60000);
    return () => clearInterval(interval);
  }, []);

// Email login — navigates directly, never touches /auth/callback
const handleSignIn = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) { setError("Invalid email or password."); setLoading(false); return; }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  setLoading(false);

  if (profile?.role === "admin") {
    navigate("/admin", { replace: true });   // ✅ direct
  } else {
    navigate("/resident", { replace: true }); // ✅ direct
  }
};

// Google login — goes through /auth/callback
const handleGoogleLogin = async () => {
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
};
  const handleKeyDown = (e) => { if (e.key === "Enter") handleSignIn(); };

  // Theme configs
  const themes = {
    morning: {
      greeting: "Good morning",
      sub: "Sign in to start your day",
      bg: "linear-gradient(180deg,#FFD4A0 0%,#FFB347 25%,#FFA07A 45%,#87CEEB 70%,#B0E2FF 100%)",
      cardBg: "rgba(255,255,255,0.75)",
      cardBorder: "rgba(255,255,255,0.9)",
      cardShadow: "0 20px 50px rgba(255,140,0,0.2)",
      titleColor: "#1a1a1a",
      subColor: "#7a6a5a",
      labelColor: "#7a6a5a",
      inputBg: "rgba(255,255,255,0.7)",
      inputBorder: "rgba(255,150,50,0.2)",
      inputFocusBorder: "#FF6B35",
      inputColor: "#1a1a1a",
      inputPlaceholder: "#b8a898",
      rememberColor: "#7a6a5a",
      forgotColor: "#FF6B35",
      btnBg: "linear-gradient(135deg,#FF6B35,#F7931E)",
      btnShadow: "rgba(255,107,53,0.35)",
      logoIconBg: "linear-gradient(135deg,#FF6B35,#F7931E)",
      logoAccent: "#FF6B35",
      divLineColor: "rgba(0,0,0,0.08)",
      divTextColor: "#b8a898",
      googleBg: "rgba(255,255,255,0.7)",
      googleBorder: "rgba(0,0,0,0.1)",
      googleColor: "#555",
      footerColor: "#b8a898",
      footerDot: "#4ade80",
    },
    afternoon: {
      greeting: "Good afternoon",
      sub: "Welcome back to ApartEase",
      bg: "linear-gradient(180deg,#1a6ba8 0%,#2196F3 20%,#64B5F6 45%,#E3F2FD 70%,#fff 100%)",
      cardBg: "rgba(255,255,255,0.72)",
      cardBorder: "rgba(255,255,255,0.95)",
      cardShadow: "0 20px 50px rgba(33,150,243,0.2)",
      titleColor: "#0d2137",
      subColor: "#4a6a8a",
      labelColor: "#4a6a8a",
      inputBg: "rgba(255,255,255,0.75)",
      inputBorder: "rgba(33,150,243,0.2)",
      inputFocusBorder: "#2196F3",
      inputColor: "#0d2137",
      inputPlaceholder: "#90a8c0",
      rememberColor: "#4a6a8a",
      forgotColor: "#1565C0",
      btnBg: "linear-gradient(135deg,#1565C0,#2196F3)",
      btnShadow: "rgba(33,150,243,0.35)",
      logoIconBg: "linear-gradient(135deg,#1565C0,#2196F3)",
      logoAccent: "#2196F3",
      divLineColor: "rgba(0,0,0,0.08)",
      divTextColor: "#90a8c0",
      googleBg: "rgba(255,255,255,0.8)",
      googleBorder: "rgba(0,0,0,0.1)",
      googleColor: "#4a6a8a",
      footerColor: "#90a8c0",
      footerDot: "#4ade80",
    },
    evening: {
  greeting: "Good evening",
  sub: "Sign in to your dashboard",
  bg: "linear-gradient(180deg,#1a0510 0%,#4a0728 20%,#9d174d 45%,#db2777 65%,#f472b6 80%,#1a0510 100%)",
  cardBg: "rgba(26,5,16,0.65)",
  cardBorder: "rgba(244,114,182,0.15)",
  cardShadow: "0 20px 50px rgba(0,0,0,0.5), inset 0 0 0 0.5px rgba(244,114,182,0.1)",
  titleColor: "#fff",
  subColor: "rgba(255,255,255,0.4)",
  labelColor: "rgba(255,255,255,0.35)",
  inputBg: "rgba(255,255,255,0.06)",
  inputBorder: "rgba(244,114,182,0.15)",
  inputFocusBorder: "rgba(244,114,182,0.5)",
  inputColor: "#fff",
  inputPlaceholder: "rgba(255,255,255,0.2)",
  rememberColor: "rgba(255,255,255,0.35)",
  forgotColor: "#f472b6",
  btnBg: "linear-gradient(135deg,#9d174d,#db2777,#f472b6)",
  btnShadow: "rgba(219,39,119,0.4)",
  logoIconBg: "linear-gradient(135deg,#9d174d,#db2777)",
  logoAccent: "#f472b6",
  divLineColor: "rgba(255,255,255,0.07)",
  divTextColor: "rgba(255,255,255,0.2)",
  googleBg: "rgba(255,255,255,0.05)",
  googleBorder: "rgba(244,114,182,0.15)",
  googleColor: "rgba(255,255,255,0.5)",
  footerColor: "rgba(255,255,255,0.2)",
  footerDot: "#f472b6",
},
    night: {
      greeting: "Welcome back",
      sub: "Sign in to manage your complex",
      bg: "linear-gradient(160deg,#1a1a2e 0%,#16213e 30%,#0f3460 60%,#1a1a2e 100%)",
      cardBg: "rgba(255,255,255,0.07)",
      cardBorder: "rgba(255,255,255,0.13)",
      cardShadow: "0 32px 64px rgba(0,0,0,0.5)",
      titleColor: "#fff",
      subColor: "rgba(255,255,255,0.38)",
      labelColor: "rgba(255,255,255,0.38)",
      inputBg: "rgba(255,255,255,0.06)",
      inputBorder: "rgba(255,255,255,0.1)",
      inputFocusBorder: "rgba(165,180,252,0.5)",
      inputColor: "#fff",
      inputPlaceholder: "rgba(255,255,255,0.22)",
      rememberColor: "rgba(255,255,255,0.32)",
      forgotColor: "#a5b4fc",
      btnBg: "linear-gradient(135deg,#4f46e5,#7c3aed)",
      btnShadow: "rgba(79,70,229,0.4)",
      logoIconBg: "linear-gradient(135deg,#4f46e5,#7c3aed)",
      logoAccent: "#a5b4fc",
      divLineColor: "rgba(255,255,255,0.08)",
      divTextColor: "rgba(255,255,255,0.22)",
      googleBg: "rgba(255,255,255,0.05)",
      googleBorder: "rgba(255,255,255,0.1)",
      googleColor: "rgba(255,255,255,0.55)",
      footerColor: "rgba(255,255,255,0.2)",
      footerDot: "#10b981",
    },
  };

  const t = themes[theme];

  const hour = new Date().getHours();

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }

    @keyframes float { 0%,100%{transform:translateY(0px);} 50%{transform:translateY(-10px);} }
    @keyframes fadeUp { from{opacity:0;transform:translateY(16px);} to{opacity:1;transform:translateY(0);} }
    @keyframes shimmer { 0%{left:-100%;} 100%{left:200%;} }
    @keyframes twinkle { 0%,100%{opacity:0.15;} 50%{opacity:1;} }
    @keyframes pulse { 0%,100%{opacity:0.4;} 50%{opacity:1;} }
    @keyframes sunRay { 0%,100%{opacity:0.3;transform:scale(1);} 50%{opacity:0.6;transform:scale(1.06);} }
    @keyframes cloudDrift { 0%,100%{transform:translateX(0);} 50%{transform:translateX(14px);} }
    @keyframes birdFly { 0%{transform:translateX(0) translateY(0);} 50%{transform:translateX(25px) translateY(-8px);} 100%{transform:translateX(50px) translateY(0);} }
    @keyframes windowGlow { 0%,100%{opacity:0.5;} 50%{opacity:1;} }
    @keyframes personWalk { 0%,100%{transform:translateX(0);} 50%{transform:translateX(8px);} }

    .login-root {
      height: 100vh; width: 100%;
      position: relative;
      display: flex; align-items: center; justify-content: center;
      overflow: hidden;
      font-family: 'DM Sans', sans-serif;
      transition: background 2s ease;
    }

    /* THEME BADGE */
    .theme-badge {
      position: absolute;
      top: 20px; right: 20px;
      z-index: 20;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 500;
      backdrop-filter: blur(10px);
      font-family: 'Syne', sans-serif;
      letter-spacing: 0.05em;
    }

    /* BACKGROUND */
    .bg { position: absolute; inset: 0; transition: all 1s ease; }

    /* SUN */
    .sun {
      position: absolute;
      border-radius: 50%;
      transition: all 1s ease;
    }
    .sun-glow {
      position: absolute;
      border-radius: 50%;
      animation: sunRay 4s ease-in-out infinite;
    }

    /* MOON */
    .moon {
      position: absolute;
      border-radius: 50%;
      background: radial-gradient(circle at 35% 35%, #fff8dc, #fde68a);
      box-shadow: 0 0 30px rgba(253,230,138,0.25);
    }
    .moon-glow {
      position: absolute;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(253,230,138,0.12), transparent);
    }

    /* CLOUDS */
    .cloud {
      position: absolute;
      background: rgba(255,255,255,0.85);
      border-radius: 40px;
      animation: cloudDrift ease-in-out infinite;
    }

    /* BIRDS */
    .bird { position: absolute; animation: birdFly ease-in-out infinite; }

    /* STARS */
    .star {
      position: absolute; border-radius: 50%;
      animation: twinkle var(--d) var(--dl) ease-in-out infinite;
    }

    /* CITYSCAPE */
    .cityscape {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      width: 100%; height: 75%;
      z-index: 1;
    }

    /* FOG LAYERS */
    .fog-bottom {
      position: absolute; bottom: 0; left: 0; right: 0;
      height: 120px; pointer-events: none; z-index: 2;
    }
    .fog-top {
      position: absolute; top: 0; left: 0; right: 0;
      height: 80px; pointer-events: none; z-index: 2;
    }

    /* FLOATING CARD */
    .card {
      position: relative; z-index: 10;
      width: 340px;
      backdrop-filter: blur(28px);
      -webkit-backdrop-filter: blur(28px);
      border-radius: 24px;
      padding: 40px 36px;
      animation: float 5s ease-in-out infinite;
      transition: all 1s ease;
    }
    .card-logo {
      display: flex; align-items: center; gap: 10px;
      margin-bottom: 28px;
      animation: fadeUp 0.5s ease both;
    }
    .logo-icon {
      width: 32px; height: 32px;
      border-radius: 9px;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      transition: background 1s ease;
    }
    .logo-name {
      font-family: 'Syne', sans-serif;
      font-size: 18px; font-weight: 800;
      transition: color 1s ease;
    }

    .card-title {
      font-family: 'Syne', sans-serif;
      font-size: 24px; font-weight: 700;
      margin-bottom: 6px;
      animation: fadeUp 0.5s 0.1s ease both; opacity: 0;
      transition: color 1s ease;
    }
    .card-sub {
      font-size: 12px; margin-bottom: 28px;
      animation: fadeUp 0.5s 0.15s ease both; opacity: 0;
      transition: color 1s ease;
    }

    .f-label {
      font-size: 10px; font-weight: 500;
      text-transform: uppercase; letter-spacing: 0.1em;
      margin-bottom: 6px;
      transition: color 1s ease;
    }
    .f-wrap { margin-bottom: 14px; }
    .f-input-wrap { position: relative; }
    .f-icon {
      position: absolute; right: 13px; top: 50%;
      transform: translateY(-50%);
      transition: color 1s ease;
    }
    .f-input {
      width: 100%;
      padding: 12px 36px 12px 14px;
      border-radius: 12px;
      font-size: 13px;
      outline: none;
      font-family: 'DM Sans', sans-serif;
      transition: all 0.2s;
    }
    .f-row {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 22px;
    }
    .f-remember {
      display: flex; align-items: center; gap: 6px;
      font-size: 11px; cursor: pointer;
      transition: color 1s ease;
    }
    .f-forgot {
      font-size: 11px; cursor: pointer;
      text-decoration: none;
      transition: color 1s ease;
    }

    .btn-login {
      width: 100%; padding: 13px;
      color: #fff; border: none; border-radius: 14px;
      font-size: 14px; font-weight: 600; cursor: pointer;
      font-family: 'Syne', sans-serif; letter-spacing: 0.04em;
      position: relative; overflow: hidden;
      transition: transform 0.15s, box-shadow 0.2s, background 1s ease;
      margin-bottom: 14px;
      display: flex; align-items: center; justify-content: center;
    }
    .btn-login:hover { transform: translateY(-2px); }
    .btn-login:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }
    .btn-login::after {
      content: '';
      position: absolute; top: 0; left: -100%;
      width: 60%; height: 100%;
      background: linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent);
      animation: shimmer 3s infinite;
    }

    .divider {
      display: flex; align-items: center; gap: 12px; margin-bottom: 12px;
    }
    .div-line { flex: 1; height: 1px; transition: background 1s ease; }
    .div-text {
      font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em;
      transition: color 1s ease;
    }

    .btn-google {
      width: 100%; padding: 12px;
      border-radius: 14px; font-size: 12px; cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      font-family: 'DM Sans', sans-serif;
      transition: all 0.2s;
    }
    .btn-google:hover { opacity: 0.85; }

    .card-footer {
      display: flex; justify-content: center; align-items: center;
      gap: 6px; margin-top: 20px; padding-top: 16px;
      font-size: 10px;
      transition: color 1s ease, border-color 1s ease;
    }
    .footer-dot {
      width: 5px; height: 5px; border-radius: 50%;
      animation: pulse 2s infinite;
    }

    /* RESPONSIVE */
    @media (max-width: 640px) {
      .login-root { align-items: flex-end; }
      .card {
        width: 100%;
        border-radius: 28px 28px 0 0;
        padding: 28px 24px 40px;
        animation: none;
        border-bottom: none;
      }
      .card-title { font-size: 20px; }
      .cityscape { height: 55%; }
      .theme-badge { top: 12px; right: 12px; }
    }
  `;

  // Time-based scene elements
  const renderSceneElements = () => {
    if (theme === "morning") return (
      <>
        {/* Sun */}
        <div className="sun" style={{ width: "80px", height: "80px", background: "radial-gradient(circle,#FFF7A0,#FFD700)", top: "8%", left: "50%", transform: "translateX(-50%)", boxShadow: "0 0 60px rgba(255,215,0,0.5)" }}/>
        <div className="sun-glow" style={{ width: "150px", height: "150px", background: "radial-gradient(circle,rgba(255,215,0,0.18),transparent)", top: "2%", left: "50%", transform: "translateX(-50%)" }}/>
        {/* Sun rays */}
        {[0,30,-30,55,-55,80,-80].map((deg,i) => (
          <div key={i} style={{ position:"absolute", width:"2px", height:`${70-i*5}px`, background:"rgba(255,215,0,0.15)", top:"6%", left:"50%", transformOrigin:"bottom center", transform:`rotate(${deg}deg)`, animation:`sunRay ${3+i*0.2}s ${i*0.3}s ease-in-out infinite` }}/>
        ))}
        {/* Clouds */}
        <div className="cloud" style={{ width:"90px", height:"24px", top:"18%", left:"8%", animationDuration:"8s" }}/>
        <div className="cloud" style={{ width:"55px", height:"16px", top:"21%", left:"12%", animationDuration:"8s" }}/>
        <div className="cloud" style={{ width:"110px", height:"28px", top:"22%", right:"10%", animationDuration:"10s", animationDelay:"1s" }}/>
        <div className="cloud" style={{ width:"65px", height:"18px", top:"28%", left:"28%", animationDuration:"12s", animationDelay:"2s", opacity:0.6 }}/>
        {/* Birds */}
        <div className="bird" style={{ top:"28%", left:"15%", animationDuration:"6s" }}>
          <svg width="22" height="8" viewBox="0 0 22 8"><path d="M0 4 Q5.5 0 11 4 Q16.5 0 22 4" stroke="#666" strokeWidth="1.5" fill="none"/></svg>
        </div>
        <div className="bird" style={{ top:"32%", left:"22%", animationDuration:"7s", animationDelay:"1s" }}>
          <svg width="15" height="6" viewBox="0 0 15 6"><path d="M0 3 Q3.75 0 7.5 3 Q11.25 0 15 3" stroke="#777" strokeWidth="1.2" fill="none"/></svg>
        </div>
        <div className="bird" style={{ top:"25%", left:"62%", animationDuration:"8s", animationDelay:"2s" }}>
          <svg width="18" height="7" viewBox="0 0 18 7"><path d="M0 3.5 Q4.5 0 9 3.5 Q13.5 0 18 3.5" stroke="#666" strokeWidth="1.3" fill="none"/></svg>
        </div>
      </>
    );

    if (theme === "afternoon") return (
      <>
        {/* Bright sun high up */}
        <div className="sun" style={{ width:"70px", height:"70px", background:"radial-gradient(circle,#fff,#FFF9C4)", top:"5%", left:"50%", transform:"translateX(-50%)", boxShadow:"0 0 50px rgba(255,255,200,0.6)" }}/>
        <div className="sun-glow" style={{ width:"130px", height:"130px", background:"radial-gradient(circle,rgba(255,255,200,0.15),transparent)", top:"0%", left:"50%", transform:"translateX(-50%)" }}/>
        {/* White fluffy clouds */}
        <div className="cloud" style={{ width:"120px", height:"32px", top:"20%", left:"5%", animationDuration:"12s", opacity:0.95 }}/>
        <div className="cloud" style={{ width:"80px", height:"22px", top:"23%", left:"9%", animationDuration:"12s", opacity:0.9 }}/>
        <div className="cloud" style={{ width:"140px", height:"36px", top:"18%", right:"5%", animationDuration:"14s", animationDelay:"2s", opacity:0.9 }}/>
        <div className="cloud" style={{ width:"90px", height:"24px", top:"22%", right:"10%", animationDuration:"14s", animationDelay:"2s", opacity:0.85 }}/>
        <div className="cloud" style={{ width:"100px", height:"28px", top:"30%", left:"35%", animationDuration:"10s", animationDelay:"1s", opacity:0.7 }}/>
        {/* Birds */}
        <div className="bird" style={{ top:"35%", left:"20%", animationDuration:"7s" }}>
          <svg width="20" height="8" viewBox="0 0 20 8"><path d="M0 4 Q5 0 10 4 Q15 0 20 4" stroke="#333" strokeWidth="1.5" fill="none"/></svg>
        </div>
        <div className="bird" style={{ top:"38%", left:"55%", animationDuration:"9s", animationDelay:"2s" }}>
          <svg width="14" height="6" viewBox="0 0 14 6"><path d="M0 3 Q3.5 0 7 3 Q10.5 0 14 3" stroke="#444" strokeWidth="1.2" fill="none"/></svg>
        </div>
      </>
    );

    if (theme === "evening") return (
      <>
        {/* Setting sun low */}
        <div className="sun" style={{ width:"60px", height:"60px", background:"radial-gradient(circle,#FFE082,#FF8F00)", bottom:"28%", left:"50%", transform:"translateX(-50%)", boxShadow:"0 0 50px rgba(255,140,0,0.6)" }}/>
        <div className="sun-glow" style={{ width:"130px", height:"65px", background:"radial-gradient(ellipse,rgba(255,140,0,0.25),transparent)", bottom:"26%", left:"50%", transform:"translateX(-50%)" }}/>
        {/* Horizon glow line */}
        <div style={{ position:"absolute", bottom:"28%", left:0, right:0, height:"3px", background:"linear-gradient(90deg,transparent,rgba(255,140,0,0.6),rgba(255,200,0,0.8),rgba(255,140,0,0.6),transparent)" }}/>
        {/* A few appearing stars */}
        {[{t:"5%",l:"20%"},{t:"8%",l:"55%"},{t:"6%",l:"78%"},{t:"12%",l:"38%"},{t:"4%",l:"88%"}].map((s,i) => (
          <div key={i} className="star" style={{ width:"2px", height:"2px", background:"#fff", top:s.t, left:s.l, "--d":`${2+i*0.5}s`, "--dl":`${i*0.3}s` }}/>
        ))}
      </>
    );

    // Night
    return (
      <>
        <div className="moon-glow" style={{ width:"100px", height:"100px", top:"4%", left:"12%" }}/>
        <div className="moon" style={{ width:"56px", height:"56px", top:"6%", left:"14%" }}/>
        {[{t:"5%",l:"25%"},{t:"8%",l:"45%"},{t:"12%",l:"65%"},{t:"6%",l:"80%"},{t:"15%",l:"90%"},{t:"3%",l:"55%"},{t:"18%",l:"35%"},{t:"10%",l:"72%"},{t:"7%",l:"15%"},{t:"20%",l:"88%"}].map((s,i) => (
          <div key={i} className="star" style={{ width:i%2===0?"2px":"1px", height:i%2===0?"2px":"1px", background:i%3===0?"#c7d2fe":"#fff", top:s.t, left:s.l, "--d":`${2+i*0.3}s`, "--dl":`${i*0.2}s` }}/>
        ))}
      </>
    );
  };

  // Building colors per theme
  const bldColors = {
    morning: { main:"#E89060", light:"#F0A070", win:"#FFF9E6", win2:"#FFE4A0", ground:"#C87848", door:"#C07040" },
    afternoon: { main:"#5B8DB8", light:"#7BAAD0", win:"#FFF9E6", win2:"#E3F2FD", ground:"#3A6A90", door:"#2A5A80" },
  evening: {
  main: "#ffb6c1",
  light: "#ffc8d4",
  win: "#fff",
  win2: "#ffe4ef",
  ground: "#ff80ab",
  door: "#e91e8c"
},
    night: { main:"#1e2d5a", light:"#243060", win:"#fde68a", win2:"#93c5fd", ground:"#060e1e", door:"#0a1228" },
  };
  const b = bldColors[theme];

  const themeBadgeStyles = {
    morning: { bg:"rgba(255,245,230,0.85)", color:"#FF6B35", border:"rgba(255,107,53,0.2)" },
    afternoon: { bg:"rgba(227,242,253,0.85)", color:"#1565C0", border:"rgba(33,150,243,0.2)" },
    evening: { bg:"rgba(20,5,40,0.7)", color:"#FF8F00", border:"rgba(255,143,0,0.2)" },
    night: { bg:"rgba(15,25,60,0.7)", color:"#a5b4fc", border:"rgba(99,102,241,0.2)" },
  };
  const tb = themeBadgeStyles[theme];

  const themeEmoji = { morning:"🌅", afternoon:"☀️", evening:"🌇", night:"🌙" };

  return (
    <>
      <style>{styles}</style>
      <div className="login-root">

        {/* Background */}
        <div className="bg" style={{ background: t.bg }}/>

        {/* Theme badge */}
        <div className="theme-badge" style={{ background: tb.bg, color: tb.color, border: `1px solid ${tb.border}` }}>
          {themeEmoji[theme]} {theme.charAt(0).toUpperCase() + theme.slice(1)}
        </div>

        {/* Sky elements */}
        {renderSceneElements()}

        {/* Cityscape */}
        <svg className="cityscape" viewBox="0 0 800 420" preserveAspectRatio="xMidYMax meet" xmlns="http://www.w3.org/2000/svg">
          {/* Building 1 - left tall */}
          <rect x="20" y="120" width="75" height="260" fill={b.main} opacity="0.9"/>
          <rect x="20" y="108" width="75" height="14" fill={b.light}/>
          <rect x="55" y="76" width="4" height="34" fill={b.main}/>
          <circle cx="57" cy="74" r="5" fill={theme==="night"?"#6366f1":"#f87171"} opacity="0.8">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/>
          </circle>
          {[130,150,170,190,210,230].map((y,i) => (
            <g key={i}>
              <rect x="30" y={y} width="14" height="10" rx="1" fill={i%2===0?b.win:b.win2} opacity={0.4+i*0.1}>
                {i%2===0 && <animate attributeName="opacity" values={`${0.4+i*0.08};0.9;${0.4+i*0.08}`} dur={`${2.5+i*0.4}s`} repeatCount="indefinite"/>}
              </rect>
              <rect x="50" y={y} width="14" height="10" rx="1" fill={b.win} opacity={0.3+i*0.12}/>
              <rect x="70" y={y} width="14" height="10" rx="1" fill={i%3===0?b.win2:b.win} opacity={0.5+i*0.07}/>
            </g>
          ))}
          <rect x="42" y="345" width="28" height="35" rx="2" fill={b.door}/>

          {/* Building 2 */}
          <rect x="100" y="180" width="60" height="200" fill={b.main} opacity="0.85"/>
          <rect x="100" y="168" width="60" height="14" fill={b.light}/>
          {[188,205,222,239].map((y,i) => (
            <g key={i}>
              <rect x="110" y={y} width="12" height="9" rx="1" fill={b.win} opacity={0.4+i*0.15}/>
              <rect x="128" y={y} width="12" height="9" rx="1" fill={i%2===0?b.win2:b.win} opacity={0.5+i*0.1}/>
              <rect x="146" y={y} width="8" height="9" rx="1" fill={b.win} opacity={0.3+i*0.12}/>
            </g>
          ))}
          <rect x="114" y="352" width="22" height="28" rx="2" fill={b.door}/>

          {/* Building 3 - tallest */}
          <rect x="165" y="55" width="90" height="325" fill={b.main} opacity="0.9"/>
          <rect x="165" y="42" width="90" height="15" fill={b.light}/>
          <rect x="207" y="14" width="5" height="30" fill={b.main}/>
          <circle cx="209" cy="12" r="5" fill={theme==="morning"||theme==="afternoon"?"#FFD700":"#f87171"} opacity="0.9">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite"/>
          </circle>
          {[62,82,102,122,142,162,182,202].map((y,i) => (
            <g key={i}>
              <rect x="175" y={y} width="16" height="12" rx="1" fill={i%3===0?b.win2:b.win} opacity={0.3+i*0.08}>
                {i%3===0 && <animate attributeName="opacity" values={`${0.4+i*0.05};1;${0.4+i*0.05}`} dur={`${2+i*0.3}s`} repeatCount="indefinite"/>}
              </rect>
              <rect x="198" y={y} width="16" height="12" rx="1" fill={b.win} opacity={0.5+i*0.06}/>
              <rect x="221" y={y} width="16" height="12" rx="1" fill={i%2===0?b.win:b.win2} opacity={0.4+i*0.07}/>
            </g>
          ))}
          <rect x="172" y="216" width="22" height="4" rx="1" fill={b.door} opacity="0.5"/>
          <rect x="196" y="216" width="22" height="4" rx="1" fill={b.door} opacity="0.5"/>
          <rect x="220" y="216" width="22" height="4" rx="1" fill={b.door} opacity="0.5"/>
          <rect x="195" y="350" width="30" height="30" rx="2" fill={b.door}/>

          {/* Building 4 - small mid */}
          <rect x="268" y="220" width="55" height="160" fill={b.main} opacity="0.85"/>
          {[230,248,266].map((y,i) => (
            <g key={i}>
              <rect x="278" y={y} width="12" height="10" rx="1" fill={b.win} opacity={0.4+i*0.2}/>
              <rect x="298" y={y} width="12" height="10" rx="1" fill={i%2===0?b.win2:b.win} opacity={0.5+i*0.15}/>
            </g>
          ))}
          <rect x="283" y="353" width="22" height="27" rx="2" fill={b.door}/>

          {/* Building 5 - small right */}
          <rect x="488" y="228" width="60" height="152" fill={b.main} opacity="0.85"/>
          {[238,256,274].map((y,i) => (
            <g key={i}>
              <rect x="498" y={y} width="12" height="10" rx="1" fill={b.win} opacity={0.5+i*0.15}/>
              <rect x="518" y={y} width="12" height="10" rx="1" fill={i%2===0?b.win2:b.win} opacity={0.4+i*0.18}/>
            </g>
          ))}
          <rect x="503" y="352" width="24" height="28" rx="2" fill={b.door}/>

          {/* Building 6 - right tall */}
          <rect x="558" y="98" width="85" height="282" fill={b.main} opacity="0.9"/>
          <rect x="558" y="84" width="85" height="16" fill={b.light}/>
          <rect x="595" y="50" width="4" height="36" fill={b.main}/>
          <circle cx="597" cy="48" r="5" fill={theme==="night"?"#6366f1":"#FFD700"} opacity="0.8">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="2.2s" repeatCount="indefinite"/>
          </circle>
          {[106,126,146,166,186,206].map((y,i) => (
            <g key={i}>
              <rect x="568" y={y} width="16" height="12" rx="1" fill={i%3===0?b.win2:b.win} opacity={0.4+i*0.08}>
                {i%2===0 && <animate attributeName="opacity" values={`${0.4+i*0.06};0.95;${0.4+i*0.06}`} dur={`${2.5+i*0.3}s`} repeatCount="indefinite"/>}
              </rect>
              <rect x="591" y={y} width="16" height="12" rx="1" fill={b.win} opacity={0.3+i*0.1}/>
              <rect x="614" y={y} width="16" height="12" rx="1" fill={i%2===0?b.win:b.win2} opacity={0.5+i*0.07}/>
            </g>
          ))}
          <rect x="568" y="216" width="22" height="4" rx="1" fill={b.door} opacity="0.5"/>
          <rect x="591" y="216" width="22" height="4" rx="1" fill={b.door} opacity="0.5"/>
          <rect x="614" y="216" width="22" height="4" rx="1" fill={b.door} opacity="0.5"/>
          <rect x="580" y="352" width="30" height="28" rx="2" fill={b.door}/>

          {/* Building 7 - far right */}
          <rect x="648" y="78" width="70" height="302" fill={b.main} opacity="0.85"/>
          <rect x="648" y="64" width="70" height="16" fill={b.light}/>
          {[86,104,122,140,158,176].map((y,i) => (
            <g key={i}>
              <rect x="658" y={y} width="12" height="10" rx="1" fill={b.win} opacity={0.3+i*0.1}/>
              <rect x="676" y={y} width="12" height="10" rx="1" fill={i%2===0?b.win2:b.win} opacity={0.5+i*0.08}>
                {i%3===0 && <animate attributeName="opacity" values={`${0.5+i*0.07};1;${0.5+i*0.07}`} dur={`${2.8+i*0.2}s`} repeatCount="indefinite"/>}
              </rect>
              <rect x="694" y={y} width="12" height="10" rx="1" fill={b.win} opacity={0.4+i*0.09}/>
            </g>
          ))}
          <rect x="670" y="352" width="24" height="28" rx="2" fill={b.door}/>

          {/* Trees (morning/afternoon) */}
          {(theme==="morning"||theme==="afternoon") && (
            <>
              <rect x="345" y="360" width="4" height="20" fill="#8B4513"/>
              <ellipse cx="347" cy="352" rx="14" ry="16" fill={theme==="morning"?"#228B22":"#2E7D32"} opacity="0.85"/>
              <rect x="430" y="365" width="3" height="15" fill="#8B4513"/>
              <ellipse cx="431" cy="358" rx="10" ry="12" fill={theme==="morning"?"#32CD32":"#388E3C"} opacity="0.8"/>
            </>
          )}

          {/* Ground */}
          <rect x="0" y="378" width="800" height="42" fill={b.ground}/>
          <rect x="0" y="378" width="800" height="3" fill={theme==="morning"?"rgba(255,200,100,0.4)":theme==="afternoon"?"rgba(100,180,255,0.3)":theme==="evening"?"rgba(255,143,0,0.5)":"rgba(99,102,241,0.25)"}/>

          {/* Street lights */}
          <line x1="340" y1="378" x2="340" y2="342" stroke={b.door} strokeWidth="2"/>
          <circle cx="340" cy="340" r="5" fill={theme==="morning"||theme==="afternoon"?"#FFF9C4":"#fde68a"} opacity="0.9">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="4s" repeatCount="indefinite"/>
          </circle>
          <line x1="460" y1="378" x2="460" y2="342" stroke={b.door} strokeWidth="2"/>
          <circle cx="460" cy="340" r="5" fill={theme==="morning"||theme==="afternoon"?"#FFF9C4":"#fde68a"} opacity="0.9">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="3.5s" begin="0.5s" repeatCount="indefinite"/>
          </circle>

          {/* Person */}
          <g style={{animation:"personWalk 3s ease-in-out infinite"}}>
            <ellipse cx="385" cy="366" rx="5" ry="5" fill={theme==="morning"||theme==="afternoon"?"#5D4037":b.door}/>
            <rect x="382" y="371" width="6" height="7" rx="2" fill={theme==="morning"?"#D2691E":theme==="afternoon"?"#1565C0":"#0d0520"}/>
            <line x1="382" y1="376" x2="378" y2="382" stroke={theme==="morning"?"#8B4513":"#333"} strokeWidth="2" strokeLinecap="round"/>
            <line x1="388" y1="376" x2="392" y2="382" stroke={theme==="morning"?"#8B4513":"#333"} strokeWidth="2" strokeLinecap="round"/>
          </g>

          {/* Road markings */}
          {[350,375,400,425,450].map((x,i) => (
            <rect key={i} x={x} y="394" width="16" height="2" rx="1" fill={b.door} opacity="0.25"/>
          ))}
        </svg>

        {/* Fog */}
        <div className="fog-bottom" style={{ background: theme==="morning" ? "linear-gradient(0deg,rgba(255,200,150,0.3),transparent)" : theme==="afternoon" ? "linear-gradient(0deg,rgba(200,230,255,0.2),transparent)" : theme==="evening" ? "linear-gradient(0deg,rgba(13,2,8,0.9),transparent)" : "linear-gradient(0deg,rgba(13,2,8,0.9),transparent)" }}/>
        <div className="fog-top" style={{ background: theme==="morning" ? "linear-gradient(180deg,rgba(255,212,160,0.3),transparent)" : theme==="afternoon" ? "linear-gradient(180deg,rgba(26,107,168,0.4),transparent)" : theme==="evening" ? "linear-gradient(180deg,rgba(13,2,8,0.9),transparent)" : "linear-gradient(180deg,rgba(13,2,8,0.9),transparent)" }}/>

        {/* CARD */}
        <div className="card" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>
          <div className="card-logo">
            <div className="logo-icon" style={{ background: t.logoIconBg }}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="2">
                <path d="M3 9l7-6 7 6v9a1 1 0 01-1 1H4a1 1 0 01-1-1V9z"/>
                <path d="M8 19V13h4v6"/>
              </svg>
            </div>
            <span className="logo-name" style={{ color: t.titleColor }}>
              Apart<span style={{ color: t.logoAccent }}>Ease</span>
            </span>
          </div>

          <div className="card-title" style={{ color: t.titleColor }}>
  {isSignUp ? "Create account" : t.greeting}
</div>
<div className="card-sub" style={{ color: t.subColor }}>
  {isSignUp ? "Join ApartEase as a resident" : t.sub}
</div>
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontSize: "12px" }}>{error}</Alert>
          )}
          {/* Full name — only for signup */}
{isSignUp && (
  <div className="f-wrap" style={{ animation: "fadeUp 0.5s 0.15s ease both", opacity: 0 }}>
    <div className="f-label" style={{ color: t.labelColor }}>Full name</div>
    <div className="f-input-wrap">
      <svg className="f-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={t.labelColor} strokeWidth="2">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
      <input className="f-input" type="text" placeholder="Your full name"
        value={fullName} onChange={(e) => setFullName(e.target.value)}
        style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.inputColor }}
      />
    </div>
  </div>
)}

          {/* Email */}
          <div className="f-wrap" style={{ animation: "fadeUp 0.5s 0.2s ease both", opacity: 0 }}>
            <div className="f-label" style={{ color: t.labelColor }}>Email</div>
            <div className="f-input-wrap">
              <svg className="f-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={t.labelColor} strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <input className="f-input" type="email" placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={handleKeyDown}
                style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.inputColor, "--placeholder": t.inputPlaceholder }}
              />
            </div>
          </div>

          {/* Password */}
          <div className="f-wrap" style={{ animation: "fadeUp 0.5s 0.3s ease both", opacity: 0 }}>
            <div className="f-label" style={{ color: t.labelColor }}>Password</div>
            <div className="f-input-wrap">
              <svg className="f-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={t.labelColor} strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              <input className="f-input" type="password" placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={handleKeyDown}
                style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.inputColor }}
              />
            </div>
          </div>

          {/* Remember + Forgot */}
          <div className="f-row" style={{ animation: "fadeUp 0.5s 0.35s ease both", opacity: 0 }}>
            <label className="f-remember" style={{ color: t.rememberColor }}>
              <input type="checkbox" style={{ accentColor: t.logoAccent }}/> Remember me
            </label>
            <RouterLink to="/reset-password" className="f-forgot" style={{ color: t.forgotColor }}>
              Forgot?
            </RouterLink>
          </div>

          {/* Login button */}
          <button className="btn-login" onClick={handleSignIn} disabled={loading}
  style={{ background: t.btnBg, boxShadow: `0 4px 20px ${t.btnShadow}`, animation: "fadeUp 0.5s 0.4s ease both", opacity: 0 }}>
  {loading ? <CircularProgress size={20} color="inherit"/> : isSignUp ? "Create account" : "Sign in"}
</button>

          {/* Divider */}
          <div className="divider" style={{ animation: "fadeUp 0.5s 0.45s ease both", opacity: 0 }}>
            <div className="div-line" style={{ background: t.divLineColor }}></div>
            <span className="div-text" style={{ color: t.divTextColor }}>or</span>
            <div className="div-line" style={{ background: t.divLineColor }}></div>
          </div>

          {/* Google */}
          <button className="btn-google" onClick={handleGoogleLogin}
            style={{ background: t.googleBg, border: `1px solid ${t.googleBorder}`, color: t.googleColor, animation: "fadeUp 0.5s 0.5s ease both", opacity: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
          {/* Toggle sign in / sign up */}
<div style={{
  textAlign: "center", marginTop: "14px",
  fontSize: "12px", color: t.subColor
}}>
  {isSignUp ? "Already have an account? " : "Don't have an account? "}
  <span
    onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
    style={{ color: t.forgotColor, cursor: "pointer", fontWeight: 600 }}
  >
    {isSignUp ? "Sign in" : "Sign up"}
  </span>
</div>

          {/* Footer */}
          <div className="card-footer" style={{ color: t.footerColor, borderTop: `1px solid ${t.divLineColor}`, animation: "fadeUp 0.5s 0.6s ease both", opacity: 0 }}>
            <div className="footer-dot" style={{ background: t.footerDot }}></div>
           Secured by Supabase
          </div>
        </div>


      </div>
    </>
  );
}