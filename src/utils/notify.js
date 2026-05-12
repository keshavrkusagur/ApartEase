import { supabase } from "../supabaseClient";

// Send to one resident
export const sendNotification = async (residentId, type, title, message) => {
  const { error } = await supabase.from("notifications").insert({
    resident_id: residentId,
    type,
    title,
    message,
  });
  if (error) console.error("Notification error:", error);
};

// Send to all residents
export const sendNotificationToAll = async (type, title, message) => {
  const { data: residents } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "resident");

  if (!residents) return;

  const notifications = residents.map((r) => ({
    resident_id: r.id,
    type,
    title,
    message,
  }));

  const { error } = await supabase.from("notifications").insert(notifications);
  if (error) console.error("Bulk notification error:", error);
};

// Mark as read
export const markAsRead = async (notificationId) => {
  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);
};

// Mark all as read
export const markAllAsRead = async (residentId) => {
  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("resident_id", residentId)
    .eq("is_read", false);
};


