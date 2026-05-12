import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Signing you in...");
  const handled = useRef(false); // 👈 prevents double execution

  useEffect(() => {
    if (handled.current) return; // 👈 stop second run
    handled.current = true;

    const handleCallback = async () => {
      try {
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (!accessToken) {
          navigate("/", { replace: true });
          return;
        }

        // Clear the hash from URL immediately
        window.history.replaceState(null, "", window.location.pathname);

        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        console.log("SESSION:", data?.session?.user?.email);
        console.log("ERROR:", error);

        if (error || !data?.session) {
          setStatus("Sign in failed. Redirecting...");
          setTimeout(() => navigate("/", { replace: true }), 2000);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.session.user.id)
          .single();

        console.log("PROFILE:", profile);

        if (!profile) {
          await supabase.from("profiles").insert({
            id: data.session.user.id,
            email: data.session.user.email,
            role: "resident",
          });
          navigate("/resident", { replace: true });
          return;
        }

        if (profile.role === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/resident", { replace: true });
        }

      } catch (err) {
        console.error("Error:", err);
        navigate("/", { replace: true });
      }
    };

    handleCallback();
  }, []);

  return (
    <div style={{
      height: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: "16px",
      fontFamily: "sans-serif", background: "#0a0f1e", color: "#a5b4fc"
    }}>
      <div style={{ fontSize: "32px" }}>🏠</div>
      <p style={{ fontSize: "14px" }}>{status}</p>
    </div>
  );
}


