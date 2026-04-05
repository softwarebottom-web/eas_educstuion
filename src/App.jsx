import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./api/config";

import Intro from "./component/Intro";
import Navbar from "./component/Navbar";
import RegisterPortal from "./pages/RegisterPortal";
import LoginPortal from "./pages/LoginPortal";
import AccessPortal from "./pages/AccessPortal";
import Dashboard from "./pages/Dashboard";
import Library from "./pages/Libary";
import Quiz from "./pages/Quiz";
import About from "./pages/About";
import AdminPanel from "./pages/AdminPanel";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const [user, loading] = useAuthState(auth);
  const localUser = JSON.parse(localStorage.getItem("eas_user_data") || "null");
  const isVerified = localStorage.getItem("eas_verified") === "true";
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen bg-[#00050d] flex items-center justify-center">
        <div className="text-blue-500 font-black animate-pulse tracking-[0.5em] text-[10px] uppercase">
          Connecting to EAS Satellite...
        </div>
      </div>
    );
  }

  // 🔒 BELUM LOGIN
  if (!user && !localUser) {
    return <Navigate to="/register" state={{ from: location }} replace />;
  }

  // 🔒 BELUM VERIFIKASI → ke Access Portal
  if (!isVerified && location.pathname !== "/access-portal") {
    return <Navigate to="/access-portal" replace />;
  }

  // 🔒 ADMIN CHECK — pakai token & role dari localStorage (hasil AdminAuth)
  if (adminOnly) {
    const token = localStorage.getItem("eas_admin_token");
    const adminRole = localStorage.getItem("eas_admin_role");
    const expire = localStorage.getItem("eas_admin_expire");

    const allowedRoles = ["owner", "admin", "moderator"];
    const isValid =
      token === "EAS_ADMIN_SESSION" &&
      adminRole &&
      allowedRoles.includes(adminRole) &&
      expire &&
      Date.now() < Number(expire);

    if (!isValid) {
      // Tidak redirect alert, biarkan AdminPanel yang handle auth
      return <AdminPanel />;
    }
  }

  return children;
};

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [user] = useAuthState(auth);
  const localUser = localStorage.getItem("eas_user_data");

  useEffect(() => {
    const introDone = localStorage.getItem("intro_viewed");
    setShowIntro(!introDone);
  }, []);

  const handleIntroFinish = () => {
    localStorage.setItem("intro_viewed", "true");
    setShowIntro(false);
  };

  return (
    <Router>
      <div className="min-h-screen bg-[#00050d] text-white selection:bg-blue-500">

        {showIntro && <Intro onFinish={handleIntroFinish} />}

        <div className={showIntro ? "hidden" : "block pb-24"}>
          <Routes>

            <Route path="/register" element={<RegisterPortal />} />
            <Route path="/login" element={<LoginPortal />} />

            <Route
              path="/access-portal"
              element={
                <ProtectedRoute>
                  <AccessPortal />
                </ProtectedRoute>
              }
            />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/library"
              element={
                <ProtectedRoute>
                  <Library />
                </ProtectedRoute>
              }
            />

            <Route
              path="/quiz"
              element={
                <ProtectedRoute>
                  <Quiz />
                </ProtectedRoute>
              }
            />

            <Route
              path="/about"
              element={
                <ProtectedRoute>
                  <About />
                </ProtectedRoute>
              }
            />

            {/* ✅ Admin — tidak pakai ProtectedRoute adminOnly, langsung AdminPanel */}
            <Route path="/admin" element={<AdminPanel />} />

            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>

          {(user || localUser) && !showIntro && <Navbar />}
        </div>
      </div>
    </Router>
  );
}

export default App;
