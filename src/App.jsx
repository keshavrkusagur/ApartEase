// Make sure your App.jsx looks like this:
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import UpdatePassword from "./pages/UpdatePassword";
import AdminDashboard from "./pages/AdminDashboard";
import ResidentDashboard from "./pages/ResidentDashboard";
import AuthCallback from "./pages/AuthCallback";
import Signup from "./pages/Signup";

export default function App() {  // 👈 make sure "export default" is here
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/resident" element={<ResidentDashboard />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
    </BrowserRouter>
  );
}