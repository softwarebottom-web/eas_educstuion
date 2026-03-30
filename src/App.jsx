import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./api/config"; 

// Components & Pages
import Intro from "./component/Intro"; 
import Navbar from "./component/Navbar";
import RegisterPortal from "./pages/RegisterPortal";
import AccessPortal from "./pages/AccessPortal";
import Dashboard from "./pages/Dashboard";
import Library from "./pages/Libary";
import Quiz from "./pages/Quiz";
import About from "./pages/About";
import AdminPanel from "./pages/AdminPanel";

// Staff Data
import { EAS_STAFF_LIST } from "./api/staff";

// --- 🛡️ PROTECTED ROUTE ---
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

  // 1. Belum login
  if (!user && !localUser) {
    return <Navigate to="/register" state={{ from: location }} replace />;
  }

  // 2. Belum verifikasi ID
  if (!isVerified && location.pathname !== "/access-portal") {
    return <Navigate to="/access-portal" replace />;
  }

  // 3. Admin check
  if (adminOnly) {
    const staff = EAS_STAFF_LIST[localUser?.nama?.toLowerCase()];
    if (!staff || staff.level < 1) {
      alert("AKSES DITOLAK: Area khusus Petinggi!");
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

// --- 🚀 MAIN APP ---
function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [user] = useAuthState(auth);
  const localUser = localStorage.getItem("eas_user_data");

  // 🔥 FIX INTRO LOGIC
  useEffect(() => {
    const introDone = localStorage.getItem("intro_viewed");

    if (!introDone) {
      setShowIntro(true);
    } else {
      setShowIntro(false);
    }
  }, []);

  const handleIntroFinish = () => {
    localStorage.setItem("intro_viewed", "true");
    setShowIntro(false);
  };

  return (
    <Router>
      <div className="min-h-screen bg-[#00050d] text-white selection:bg-blue-500">

        {/* 🔥 INTRO LAYER */}
        {showIntro && <Intro onFinish={handleIntroFinish} />}

        {/* 🔥 MAIN APP */}
        <div className={showIntro ? "hidden" : "block pb-24"}>
          <Routes>

            <Route path="/register" element={<RegisterPortal />} />

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

            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* 🔥 NAVBAR */}
          {(user || localUser) && !showIntro && <Navbar />}
        </div>
      </div>
    </Router>
  );
}

export default App;
