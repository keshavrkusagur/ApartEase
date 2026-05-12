import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { Box, Paper, TextField, Button, Typography } from "@mui/material";

export default function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleUpdate = async () => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    setMessage(error.message);
  } else {
    setMessage("Password updated successfully!");
    setTimeout(() => navigate("/"), 2000);
  }
};

  return (
    <Box sx={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Paper sx={{ p: 4, width: 400 }}>
        <Typography variant="h6">Set New Password</Typography>
        <TextField
          fullWidth
          label="New Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ my: 2 }}
        />
        <Button fullWidth variant="contained" onClick={handleUpdate}>
          Update Password
        </Button>
        {message && <Typography mt={2}>{message}</Typography>}
      </Paper>
    </Box>
  );
}


