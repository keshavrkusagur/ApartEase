import { useEffect, useState } from "react";
import { supabase } from '../supabaseClient';
import {
  Box, Typography, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, CircularProgress, Chip,
  IconButton, FormControl, InputLabel, Select, MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

export default function NoticesPage({ theme }) {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", message: "", visible_to: "all" });

  const isDark = theme === "night";
  const accentColor = theme === "morning" ? "#FF6B35"
    : theme === "afternoon" ? "#2196F3"
    : theme === "evening" ? "#ff80ab" : "#6366f1";
  const textPrimary = isDark ? "#fff" : "#111827";
  const textSecondary = isDark ? "rgba(255,255,255,0.4)" : "#6b7280";
  const cardBg = isDark ? "rgba(255,255,255,0.03)" : "#fff";
  const borderColor = isDark ? "rgba(255,255,255,0.07)" : "#e2e8f0";
  const dialogBg = isDark ? "#0d1524" : "#fff";
  const inputBg = isDark ? "rgba(255,255,255,0.05)" : "#fff";

  useEffect(() => { fetchNotices(); }, []);

  const fetchNotices = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("notices")
      .select("*")
      .order("created_at", { ascending: false });
    setNotices(data || []);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.message.trim()) return;
    setSaving(true);

    const { error } = await supabase.from("notices").insert({
      title: form.title,
      message: form.message,
      visible_to: form.visible_to,
    });

    if (error) { alert("Error: " + error.message); setSaving(false); return; }

    // Send in-app notification to all residents
    const { data: residents } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "resident");

    if (residents?.length > 0) {
      await supabase.from("notifications").insert(
        residents.map(r => ({
          resident_id: r.id,
          type: "notice",
          title: `📢 ${form.title}`,
          message: form.message,
        }))
      );
    }

    setSaving(false);
    setDialogOpen(false);
    setForm({ title: "", message: "", visible_to: "all" });
    fetchNotices();
  };

  const handleDelete = async (id) => {
    await supabase.from("notices").delete().eq("id", id);
    setDeleteId(null);
    fetchNotices();
  };

  const visibleChip = (v) => ({
    all: { label: "All residents", color: accentColor, bg: `${accentColor}20` },
    resident: { label: "Residents only", color: "#34d399", bg: "rgba(16,185,129,0.15)" },
  }[v] || { label: v, color: textSecondary, bg: borderColor });

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight="600"
          sx={{ color: textPrimary, fontFamily: "'Syne', sans-serif" }}>
          Notices
          <Chip label={`${notices.length} total`} size="small"
            sx={{ ml: 1.5, background: `${accentColor}22`, color: accentColor, fontWeight: 500 }} />
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />}
          onClick={() => { setForm({ title: "", message: "", visible_to: "all" }); setDialogOpen(true); }}
          sx={{ background: accentColor, "&:hover": { opacity: 0.9, background: accentColor }, borderRadius: 2 }}>
          Add Notice
        </Button>
      </Box>

      {/* Notices list */}
      {loading ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <CircularProgress sx={{ color: accentColor }} />
        </Box>
      ) : notices.length === 0 ? (
        <Box sx={{
          textAlign: "center", py: 8,
          background: cardBg, border: `1px solid ${borderColor}`,
          borderRadius: 3, color: textSecondary
        }}>
          No notices yet. Create your first notice!
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {notices.map((n) => {
            const chip = visibleChip(n.visible_to);
            return (
              <Box key={n.id} sx={{
                background: cardBg,
                border: `1px solid ${borderColor}`,
                borderLeft: `4px solid ${accentColor}`,
                borderRadius: 2, p: 2.5,
                display: "flex", justifyContent: "space-between", alignItems: "flex-start",
              }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                    <Typography sx={{ fontWeight: 600, color: textPrimary, fontSize: "14px" }}>
                      {n.title}
                    </Typography>
                    <Chip label={chip.label} size="small"
                      sx={{ background: chip.bg, color: chip.color, fontSize: "10px", fontWeight: 500 }} />
                  </Box>
                  <Typography sx={{ color: textSecondary, fontSize: "13px", lineHeight: 1.7 }}>
                    {n.message}
                  </Typography>
                  <Typography sx={{ color: textSecondary, fontSize: "11px", mt: 1 }}>
                    {new Date(n.created_at).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit"
                    })}
                  </Typography>
                </Box>
                <IconButton size="small"
                  onClick={() => setDeleteId(n.id)}
                  sx={{ color: "#f87171", ml: 2 }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            );
          })}
        </Box>
      )}

      {/* Add Notice Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}
        maxWidth="sm" fullWidth
        PaperProps={{ sx: { background: dialogBg, borderRadius: 3, border: `1px solid ${borderColor}` } }}>
        <DialogTitle sx={{ color: textPrimary, fontFamily: "'Syne', sans-serif", fontWeight: 600 }}>
          Create Notice
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}>
          <TextField label="Title" fullWidth size="small"
            placeholder="e.g. Water Supply Interruption"
            value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            sx={{
              "& .MuiOutlinedInput-root": { background: inputBg, "& fieldset": { borderColor }, "&.Mui-focused fieldset": { borderColor: accentColor } },
              "& input": { color: textPrimary }, "& label": { color: textSecondary },
            }}
          />
          <TextField label="Message" fullWidth size="small" multiline rows={4}
            placeholder="Type your notice message here..."
            value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
            sx={{
              "& .MuiOutlinedInput-root": { background: inputBg, "& fieldset": { borderColor }, "&.Mui-focused fieldset": { borderColor: accentColor } },
              "& textarea": { color: textPrimary }, "& label": { color: textSecondary },
            }}
          />
          <FormControl fullWidth size="small">
            <InputLabel sx={{ color: textSecondary }}>Visible to</InputLabel>
            <Select value={form.visible_to} label="Visible to"
              onChange={(e) => setForm({ ...form, visible_to: e.target.value })}
              sx={{ color: textPrimary, background: inputBg, "& .MuiOutlinedInput-notchedOutline": { borderColor } }}>
              <MenuItem value="all">All residents</MenuItem>
              <MenuItem value="resident">Residents only</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: textSecondary }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}
            disabled={saving || !form.title.trim() || !form.message.trim()}
            sx={{ background: accentColor, "&:hover": { opacity: 0.9, background: accentColor }, borderRadius: 2 }}>
            {saving ? <CircularProgress size={20} color="inherit" /> : "Publish Notice"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}
        maxWidth="xs" fullWidth
        PaperProps={{ sx: { background: dialogBg, borderRadius: 3, border: `1px solid ${borderColor}` } }}>
        <DialogTitle sx={{ color: textPrimary, fontFamily: "'Syne', sans-serif", fontWeight: 600 }}>
          Delete Notice
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: textSecondary }}>
            Are you sure you want to delete this notice? Residents will no longer see it.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteId(null)} sx={{ color: textSecondary }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={() => handleDelete(deleteId)}
            sx={{ borderRadius: 2 }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}



