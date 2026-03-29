import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./api/config"; // Import Firebase config kamu

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

// Staff Data (Berdasarkan Struktur yang kamu berikan)
import { EAS_STAFF_LIST } from "./api/staff";

// --- 🛡️ PROTECTED ROUTE SYSTEM ---
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const [user, loading] = useAuthState(auth);
  const localUser = JSON.parse(localStorage.getItem("eas_user"));
  const isVerified = localStorage.getItem("eas_verified") === "true";
  const location = useLocation();

  if (loading) return (
    <div className="h-screen bg-black flex items-center justify-center">
      <div className="text-blue-500 font-black animate-pulse tracking-widest text-xs">INITIALIZING EAS SYSTEM...</div>
    </div>
  );

  // 1. Cek Login
  if (!user && !localUser) {
    return <Navigate to="/register" state={{ from: location }} replace />;
  }

  // 2. Cek ID Card (Kecuali AccessPortal)
  if (!isVerified && location.pathname !== "/access-portal") {
    return <Navigate to="/access-portal" replace />;
  }

  // 3. Cek Hirarki Admin & Editor
  if (adminOnly) {
    const staff = EAS_STAFF_LIST[localUser?.nama?.toLowerCase()];
    if (!staff || staff.level < 1) { // Editor level 1, Admin level 3, Owner level 5
      alert("AKSES DITOLAK: Area ini khusus Petinggi & Editor EAS!");
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

// --- 🚀 MAIN APP COMPONENT ---
function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [user] = useAuthState(auth);
  const localUser = localStorage.getItem("eas_user");

  // Cek apakah user sudah pernah melewati Intro
  useEffect(() => {
    const introDone = localStorage.getItem("intro_viewed");
    if (introDone) setShowIntro(false);
  }, []);

  const handleIntroFinish = () => {
    localStorage.setItem("intro_viewed", "true");
    setShowIntro(false);
  };

  return (
    <Router>
      <div className="min-h-screen bg-[#00050d] text-white selection:bg-blue-500 selection:text-white">
        
        {/* 1. INTRO & UUD LAYER */}
        {showIntro && <Intro onFinish={handleIntroFinish} />}

        <div className={showIntro ? "hidden" : "block pb-24"}>
          <Routes>
            {/* PUBLIC / REGISTRATION */}
            <Route path="/register" element={<RegisterPortal />} />
            
            {/* ACCESS GATE (SCAN ID) */}
            <Route path="/access-portal" element={
              <ProtectedRoute requireID={false}>
                <AccessPortal />
              </ProtectedRoute>
            } />

            {/* MEMBER AREA (HOME, LIBRARY, QUIZ, ABOUT) */}
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

            {/* 👑 STAFF AREA (OWNER, CO, ADMIN, EDITOR) */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly={true}>
                <AdminPanel />
              </ProtectedRoute>
            } />

            {/* REDIRECT IF WRONG URL */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* NAVBAR (Hanya muncul jika sudah login & intro selesai) */}
          {(user || localUser) && !showIntro && <Navbar />}
        </div>
      </div>
    </Router>
  );
}

export default App;
