import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./api/config"; 

// Components & Pages
import Intro from "./component/Intro"; // Pastikan folder 'component' (tanpa s)
import RegisterPortal from "./pages/RegisterPortal";
import AccessPortal from "./pages/AccessPortal";
import Dashboard from "./pages/Dashboard";
import Library from "./pages/Libary"; // Cek apakah filenya 'Libary.jsx' atau 'Library.jsx'
import Quiz from "./pages/Quiz"; // ERROR UTAMA: Pastikan file 'Quiz.jsx' ADA di folder pages
import About from "./pages/About";
import AdminPanel from "./pages/AdminPanel";
import Navbar from "./component/Navbar";

// Staff Data
import { EAS_STAFF_LIST } from "./api/staff";

// --- 🛡️ PROTECTED ROUTE SYSTEM ---
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const [user, loading] = useAuthState(auth);
  const localUser = JSON.parse(localStorage.getItem("eas_user") || "{}");
  const isVerified = localStorage.getItem("eas_verified") === "true";
  const location = useLocation();

  if (loading) return (
    <div className="h-screen bg-[#00050d] flex items-center justify-center">
      <div className="text-blue-500 font-black animate-pulse tracking-widest text-xs uppercase">Connecting to EAS Satellite...</div>
    </div>
  );

  if (!user && Object.keys(localUser).length === 0) {
    return <Navigate to="/register" state={{ from: location }} replace />;
  }

  if (!isVerified && location.pathname !== "/access-portal") {
    return <Navigate to="/access-portal" replace />;
  }

  if (adminOnly) {
    const staff = EAS_STAFF_LIST[localUser?.nama?.toLowerCase()];
    if (!staff || staff.level < 1) {
      alert("AKSES DITOLAK: Area khusus Petinggi!");
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

  const handleVerified = () => {
    localStorage.setItem("eas_verified", "true");
  };

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
      <div className="min-h-screen bg-[#00050d] text-white selection:bg-blue-500">
        
        {showIntro && <Intro onFinish={handleIntroFinish} />}

        <div className={showIntro ? "hidden" : "block"}>
          <Routes>
            <Route path="/register" element={<RegisterPortal />} />
            
            <Route path="/access-portal" element={
              <ProtectedRoute>
                <AccessPortal onVerified={handleVerified} />
              </ProtectedRoute>
            } />

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

            <Route path="/admin" element={
              <ProtectedRoute adminOnly={true}>
                <AdminPanel />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {(user || localUser) && !showIntro && <Navbar />}
        </div>
      </div>
    </Router>
  );
}

export default App;
