import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useState, useEffect } from "react"
import api from "./api/axios";
import Login from "./pages/Login"
import Register from "./pages/Register"
import Instrument from "./pages/Instrument"
import Dashboard from "./pages/Dashboard"
import Binary from "./pages/Binary"
import MqttViewer from './pages/MqttViewer';

// 🔐 Protected Route (FIXED)
function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      // No token found
      if (!token) {
        setIsAuth(false);
        setLoading(false);
        return;
      }

      try {
        // Verify token with backend
        await api.get("/auth/verify");

        setIsAuth(true);
      } catch (err) {
        console.error("Authentication failed:", err);

        // Remove invalid/expired token
        localStorage.removeItem("token");

        setIsAuth(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Show nothing while checking authentication
  if (loading) return null;

  return isAuth ? children : <Navigate to="/" replace />;
}

export default function App() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white">

      <BrowserRouter>

        <Routes>

          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* 🔒 Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/instrument"
            element={
              <ProtectedRoute>
                <Instrument />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mqtt-viewer"
            element={
              <ProtectedRoute>
                <MqttViewer />
              </ProtectedRoute>
            }
          />

          <Route
            path="/binary"
            element={
              <ProtectedRoute>
                <Binary />
              </ProtectedRoute>
            }
          />

        </Routes>

      </BrowserRouter>

    </div>
  )
}