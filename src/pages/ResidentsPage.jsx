import { useEffect, useState } from "react";
import { supabase } from '../supabaseClient';
import {
  Typography, Table, TableHead, TableRow, TableCell,
  TableBody, Button, Box, TextField, Paper, TableContainer,
  Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Chip, IconButton, InputAdornment
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const emptyForm = { full_name: "", email: "", flat_number: "", phone: "" };

export default function ResidentsPage({ theme }) {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);
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
  const cardBg = isDark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.6)";
  const dialogBg = isDark ? "#0d1524" : "#ffffff";

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "resident")
      .order("flat_number", { ascending: true });
    if (error) console.error(error);
    setResidents(data || []);
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    if (selectedResident) {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: form.full_name,
          flat_number: form.flat_number,
          phone: form.phone,
        })
        .eq("id", selectedResident.id);
      if (error) { alert("Error updating resident: " + error.message); setSaving(false); return; }
    } else {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const bodyData = JSON.stringify({
          full_name: form.full_name,
          email: form.email,
          flat_number: form.flat_number,
          phone: form.phone,
        });
        const response = await fetch(
          `https://kapjxwazxjpmyznlccxi.supabase.co/functions/v1/invite-resident`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${session.access_token}`,
              "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
            },
            body: bodyData,
          }
        );
        const result = await response.json();
        if (result.error) { alert("Error: " + result.error); setSaving(false); return; }
      } catch (err) {
        alert("Network error: " + err.message);
        setSaving(false);
        return;
      }
    }
    setSaving(false);
    setDialogOpen(false);
    setForm(emptyForm);
    setSelectedResident(null);
    fetchResidents();
  };

  const handleEdit = (resident) => {
    setSelectedResident(resident);
    setForm({
      full_name: resident.full_name || "",
      email: resident.email || "",
      flat_number: resident.flat_number || "",
      phone: resident.phone || "",
    });
    setDialogOpen(true);
  };

  const handleDeleteConfirm = (resident) => {
    setSelectedResident(resident);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    const { error } = await supabase.from("profiles").delete().eq("id", selectedResident.id);
    if (error) console.error(error);
    setDeleteDialogOpen(false);
    setSelectedResident(null);
    fetchResidents();
  };

  const filtered = residents.filter(r =>
    r.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.flat_number?.toLowerCase().includes(search.toLowerCase()) ||
    r.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight="600"
          sx={{ color: textPrimary, fontFamily: "'Syne', sans-serif" }}>
          Residents
          <Chip label={`${residents.length} total`} size="small"
            sx={{ ml: 1.5, background: `${accentColor}22`, color: accentColor, fontWeight: 500 }} />
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />}
          onClick={() => { setSelectedResident(null); setForm(emptyForm); setDialogOpen(true); }}
          sx={{ background: accentColor, "&:hover": { opacity: 0.9, background: accentColor }, borderRadius: 2 }}>
          Add Resident
        </Button>
      </Box>

      {/* Search */}
      <TextField
        placeholder="Search by name, flat or email..."
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
        sx={{ background: cardBg, border: `1px solid ${tableBorder}`, borderRadius: 2, backdropFilter: "blur(10px)" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: tableHeadBg }}>
              {["Flat", "Name", "Email", "Phone", "Status", "Actions"].map(h => (
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
                <TableCell colSpan={6} align="center" sx={{ py: 6, borderColor: tableBorder }}>
                  <CircularProgress size={28} sx={{ color: accentColor }} />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center"
                  sx={{ py: 6, color: textSecondary, borderColor: tableBorder }}>
                  No residents found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((r) => (
                <TableRow key={r.id} hover
                  sx={{ "&:hover": { background: isDark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.5)" } }}>
                  <TableCell sx={{ borderColor: tableBorder }}>
                    <Chip label={r.flat_number || "—"} size="small"
                      sx={{ background: `${accentColor}22`, color: accentColor, fontWeight: 600 }} />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500, color: textPrimary, borderColor: tableBorder }}>
                    {r.full_name || "—"}
                  </TableCell>
                  <TableCell sx={{ color: textSecondary, borderColor: tableBorder }}>
                    {r.email || "—"}
                  </TableCell>
                  <TableCell sx={{ color: textSecondary, borderColor: tableBorder }}>
                    {r.phone || "—"}
                  </TableCell>
                  <TableCell sx={{ borderColor: tableBorder }}>
                    <Chip label="Active" size="small"
                      sx={{ background: "rgba(16,185,129,0.15)", color: "#34d399", fontWeight: 500 }} />
                  </TableCell>
                  <TableCell sx={{ borderColor: tableBorder }}>
                    <IconButton size="small" onClick={() => handleEdit(r)}
                      sx={{ color: accentColor, mr: 0.5 }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteConfirm(r)}
                      sx={{ color: "#f87171" }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { background: dialogBg, borderRadius: 3, border: `1px solid ${tableBorder}` } }}>
        <DialogTitle sx={{ color: textPrimary, fontFamily: "'Syne', sans-serif", fontWeight: 600 }}>
          {selectedResident ? "Edit Resident" : "Add Resident"}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}>
          {["Full Name", "Email", "Flat Number", "Phone"].map((label, i) => {
            const keys = ["full_name", "email", "flat_number", "phone"];
            const key = keys[i];
            return (
              <TextField key={label} label={label} fullWidth size="small"
                value={form[key]}
                disabled={label === "Email" && !!selectedResident}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: tableBorder },
                    "&:hover fieldset": { borderColor: accentColor },
                    "&.Mui-focused fieldset": { borderColor: accentColor },
                  },
                  "& input": { color: textPrimary },
                  "& label": { color: textSecondary },
                }}
              />
            );
          })}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: textSecondary }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}
            sx={{ background: accentColor, "&:hover": { opacity: 0.9, background: accentColor }, borderRadius: 2 }}>
            {saving ? <CircularProgress size={20} color="inherit" /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { background: dialogBg, borderRadius: 3, border: `1px solid ${tableBorder}` } }}>
        <DialogTitle sx={{ color: textPrimary, fontFamily: "'Syne', sans-serif", fontWeight: 600 }}>
          Delete Resident
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: textSecondary }}>
            Are you sure you want to remove <strong style={{ color: textPrimary }}>{selectedResident?.full_name}</strong> from Flat {selectedResident?.flat_number}?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: textSecondary }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete} sx={{ borderRadius: 2 }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}



