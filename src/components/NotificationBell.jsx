import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import { markAsRead, markAllAsRead } from "../utils/notify";

export default function NotificationBell({ residentId, accentColor, isDark }) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const unread = notifications.filter((n) => !n.is_read).length;

  const typeIcon = {
    due_reminder: "🔔",
    payment_received: "✅",
    overdue: "⚠️",
    notice: "📢",
  };

  const typeColor = {
    due_reminder: "#fbbf24",
    payment_received: "#34d399",
    overdue: "#f87171",
    notice: accentColor,
  };

  useEffect(() => {
    if (!residentId) return;
    fetchNotifications();

    // Realtime subscription
    const channel = supabase
      .channel("notifications")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `resident_id=eq.${residentId}`,
      }, (payload) => {
        setNotifications((prev) => [payload.new, ...prev]);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [residentId]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("resident_id", residentId)
      .order("created_at", { ascending: false })
      .limit(20);
    setNotifications(data || []);
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead(residentId);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const handleClick = async (n) => {
    if (!n.is_read) {
      await markAsRead(n.id);
      setNotifications((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x))
      );
    }
  };

  const cardBg = isDark ? "#0f172a" : "#fff";
  const borderColor = isDark ? "rgba(255,255,255,0.1)" : "#f0f0f0";
  const textColor = isDark ? "#fff" : "#1a1a1a";
  const subColor = isDark ? "rgba(255,255,255,0.4)" : "#888";

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Bell button */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          width: "36px", height: "36px", borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", position: "relative",
          background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
          border: `1px solid ${borderColor}`,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke={accentColor} strokeWidth="2">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
        {unread > 0 && (
          <div style={{
            position: "absolute", top: "-4px", right: "-4px",
            width: "18px", height: "18px", borderRadius: "50%",
            background: "#f87171", color: "#fff",
            fontSize: "10px", fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {unread > 9 ? "9+" : unread}
          </div>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", right: 0, top: "44px",
          width: "320px", maxHeight: "420px",
          background: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: "16px", overflow: "hidden",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          zIndex: 1000,
        }}>
          {/* Header */}
          <div style={{
            padding: "14px 16px",
            borderBottom: `1px solid ${borderColor}`,
            display: "flex", justifyContent: "space-between", alignItems: "center"
          }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: textColor }}>
              Notifications {unread > 0 && `(${unread} new)`}
            </span>
            {unread > 0 && (
              <span onClick={handleMarkAllRead} style={{
                fontSize: "11px", color: accentColor,
                cursor: "pointer", fontWeight: 500
              }}>
                Mark all read
              </span>
            )}
          </div>

          {/* List */}
          <div style={{ overflowY: "auto", maxHeight: "360px" }}>
            {notifications.length === 0 ? (
              <div style={{
                padding: "32px", textAlign: "center",
                color: subColor, fontSize: "13px"
              }}>
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} onClick={() => handleClick(n)} style={{
                  padding: "12px 16px",
                  borderBottom: `1px solid ${borderColor}`,
                  cursor: "pointer",
                  background: n.is_read
                    ? "transparent"
                    : isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
                  display: "flex", gap: "12px", alignItems: "flex-start",
                  transition: "background 0.2s",
                }}>
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "8px",
                    background: `${typeColor[n.type]}22`,
                    display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "14px",
                    flexShrink: 0,
                  }}>
                    {typeIcon[n.type] || "🔔"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: "12px", fontWeight: n.is_read ? 400 : 600,
                      color: textColor, marginBottom: "2px"
                    }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: "11px", color: subColor, lineHeight: 1.5 }}>
                      {n.message}
                    </div>
                    <div style={{ fontSize: "10px", color: subColor, marginTop: "4px" }}>
                      {new Date(n.created_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                      })}
                    </div>
                  </div>
                  {!n.is_read && (
                    <div style={{
                      width: "7px", height: "7px", borderRadius: "50%",
                      background: accentColor, flexShrink: 0, marginTop: "4px"
                    }} />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}