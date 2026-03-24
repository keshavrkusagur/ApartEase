import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async () => {
    setMessage("");
    setLoading(true);

    if (!fullName.trim()) { setMessage("Please enter your full name."); setLoading(false); return; }
    if (password.length < 6) { setMessage("Password must be at least 6 characters."); setLoading(false); return; }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });

    if (error) { setMessage(error.message); setLoading(false); return; }

    if (data?.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        email: data.user.email,
        full_name: fullName,
        role: "resident",
      });
    }

    setLoading(false);

    if (data?.session) {
      navigate("/resident");
    } else {
      setMessage("Account created! Check your email to verify before signing in.");
    }
  };

  return (
    <div style={{
      height: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#0a0f1e", fontFamily: "sans-serif"
    }}>
      <div style={{
        width: "340px", background: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.13)", borderRadius: "24px",
        padding: "40px 36px"
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "28px" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "9px",
            background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="2">
              <path d="M3 9l7-6 7 6v9a1 1 0 01-1 1H4a1 1 0 01-1-1V9z"/>
              <path d="M8 19V13h4v6"/>
            </svg>
          </div>
          <span style={{ fontFamily: "Syne, sans-serif", fontSize: "18px", fontWeight: 800, color: "#fff" }}>
            Apart<span style={{ color: "#a5b4fc" }}>Ease</span>
          </span>
        </div>

        <div style={{ fontSize: "22px", fontWeight: 700, color: "#fff", marginBottom: "6px" }}>
          Create account
        </div>
        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "28px" }}>
          Join ApartEase as a resident
        </div>

        {message && (
          <div style={{
            padding: "10px 14px", borderRadius: "10px", marginBottom: "16px",
            fontSize: "12px",
            background: message.includes("created") ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
            color: message.includes("created") ? "#34d399" : "#f87171",
            border: `1px solid ${message.includes("created") ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
          }}>
            {message}
          </div>
        )}

        {/* Full Name */}
        <div style={{ marginBottom: "14px" }}>
          <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.38)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>
            Full name
          </div>
          <input
            type="text" placeholder="Your full name"
            value={fullName} onChange={(e) => setFullName(e.target.value)}
            style={{
              width: "100%", padding: "12px 14px", borderRadius: "12px",
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff", fontSize: "13px", outline: "none", fontFamily: "sans-serif"
            }}
          />
        </div>

        {/* Email */}
        <div style={{ marginBottom: "14px" }}>
          <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.38)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>
            Email
          </div>
          <input
            type="email" placeholder="you@example.com"
            value={email} onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%", padding: "12px 14px", borderRadius: "12px",
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff", fontSize: "13px", outline: "none", fontFamily: "sans-serif"
            }}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: "22px" }}>
          <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.38)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>
            Password
          </div>
          <input
            type="password" placeholder="Min. 6 characters"
            value={password} onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%", padding: "12px 14px", borderRadius: "12px",
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff", fontSize: "13px", outline: "none", fontFamily: "sans-serif"
            }}
          />
        </div>

        {/* Button */}
        <button
          onClick={handleSignup} disabled={loading}
          style={{
            width: "100%", padding: "13px", borderRadius: "14px",
            background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
            color: "#fff", border: "none", fontSize: "14px",
            fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.65 : 1, marginBottom: "16px"
          }}>
          {loading ? "Creating account..." : "Create account"}
        </button>

        {/* Back to login */}
        <div style={{ textAlign: "center", fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>
          Already have an account?{" "}
          <span
            onClick={() => navigate("/")}
            style={{ color: "#a5b4fc", cursor: "pointer", fontWeight: 600 }}>
            Sign in
          </span>
        </div>
      </div>
    </div>
  );
}