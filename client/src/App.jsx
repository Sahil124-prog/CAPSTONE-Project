import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./Landing";
import Dashboard from "./Dashboard";
import Login from "./Login";
import AdminDashboard from "./AdminDashboard"; // Import the new portal

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminDashboard />} /> {/* Add Route */}
      </Routes>
    </BrowserRouter>
  );
}
