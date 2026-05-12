import { useState } from "react";
import { supabase } from "../supabaseClient";
import { Box, Paper, TextField, Button, Typography } from "@mui/material";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      options: {
        emailRedirectTo: `${window.location.origin}/update-password`,
      },
    });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Check your email for reset link.");
    }
  };

  return (
    <Box sx={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Paper sx={{ p: 4, width: 400 }}>
        <Typography variant="h6">Reset Password</Typography>
        <TextField
          fullWidth
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ my: 2 }}
        />
        <Button fullWidth variant="contained" onClick={handleReset}>
          Send Reset Link
        </Button>
        {message && <Typography mt={2}>{message}</Typography>}
      </Paper>
    </Box>
  );
}


