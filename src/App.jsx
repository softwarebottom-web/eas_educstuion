import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./api/config"; 

// Components & Pages
import Intro from "./components/Intro";
import RegisterPortal from "./pages/Register";
import AccessPortal from "./pages/AccessPortal";
import Dashboard from "./pages/Dashboard";
import Library from "./pages/Library";
import Quiz from "./pages/Quiz";
import About from "./pages/About";
import AdminPanel from "./pages/AdminPanel";
import Navbar from "./components/Navbar";

// Staff Data (Hierarchy: Owner 5, Admin 3, Editor 1)
import { EAS_STAFF_LIST } from "./api/staff";

// --- 🛡️ PROTECTED ROUTE SYSTEM ---
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const [user, loading] = useAuthState(auth);
  // FIX: Konsisten pakai 'eas_user_data' biar sinkron sama Register
  const localUser = JSON.parse(localStorage.getItem("eas_user_data") || "null");
  const isVerified = localStorage.getItem("eas_verified") === "true";
  const location = useLocation();

  if (loading) return (
    <div className="h-screen bg-[#00050d] flex items-center justify-center">
      <div className="text-blue-500 font-black animate-pulse tracking-[0.5em] text-[10px] uppercase">
        Connecting to EAS Satellite...
      </div>
    </div>
  );

  // 1. Cek Login (Firebase Auth atau LocalStorage)
  if (!user && !localUser) {
    return <Navigate to="/register" state={{ from: location }} replace />;
  }

  // 2. Cek ID Card (Kecuali pas di Access Portal)
  if (!isVerified && location.pathname !== "/access-portal") {
    return <Navigate to="/access-portal" replace />;
  }

  // 3. Cek Hirarki Staff (Level System)
  if (adminOnly) {
    // Normalisasi nama buat nyocokin sama list staff
    const staffName = localUser?.nama?.toLowerCase();
    const staff = EAS_STAFF_LIST[staffName];
    
    if (!staff || staff.level < 1) { 
      alert("AKSES DITOLAK: Area khusus Petinggi (Admin/Editor)!");
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

// --- 🚀 MAIN APP COMPONENT ---
function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [user] = useAuthState(auth);
  const localUser = localStorage.getItem("eas_user_data");

  useEffect(() => {
    // Cek apakah user sudah pernah liat intro biar gak spam
    const introDone = localStorage.getItem("intro_viewed");
    if (introDone) setShowIntro(false);
  }, []);

  const handleIntroFinish = () => {
    localStorage.setItem("intro_viewed", "true");
    setShowIntro(false);
  };

  return (
    <Router>
      <div className="min-h-screen bg-[#00050d] text-white selection:bg-blue-500">
        
        {/* 1. INTRO LAYER (UUD & Animation) */}
        {showIntro && <Intro onFinish={handleIntroFinish} />}

        {/* 2. MAIN APP CONTENT */}
        <div className={showIntro ? "hidden" : "block"}>
          <Routes>
            {/* PUBLIC / REGISTER */}
            <Route path="/register" element={<RegisterPortal />} />
            
            {/* ACCESS GATE (SCAN ID) */}
            <Route path="/access-portal" element={
              <ProtectedRoute>
                <AccessPortal />
              </ProtectedRoute>
            } />

            {/* MEMBER AREA */}
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/library" element={
              <ProtectedRoute>
                <Library />
              </ProtectedRoute>
            } />
            
            <Route path="/quiz" element={
              <ProtectedRoute>
                <Quiz />
              </ProtectedRoute>
            } />
            
            <Route path="/about" element={
              <ProtectedRoute>
                <About />
              </ProtectedRoute>
            } />

            {/* 👑 STAFF AREA (ADMIN/EDITOR ONLY) */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly={true}>
                <AdminPanel />
              </ProtectedRoute>
            } />

            {/* FALLBACK REDIRECT */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* NAVBAR: Muncul kalau sudah Login & Lewat Intro */}
          {(user || localUser) && !showIntro && <Navbar />}
        </div>
      </div>
    </Router>
  );
}

export default App;
