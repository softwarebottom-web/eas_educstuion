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
import GroqQuiz from "./pages/GroqQuiz";
import About from "./pages/About";
import Settings from "./pages/Settings";
import AdminPanel from "./pages/AdminPanel";
import Chat from "./pages/Chat";
import Webinar from "./pages/Webinar";
import SolarSystem from "./pages/SolarSystem";
import Market from "./pages/Market";
import ScienceHub from "./pages/ScienceHub";
import { ApplyForm } from "./pages/AdminApply";

const PURPLE = { bg: "#0a0015" };

const ProtectedRoute = ({ children }) => {
  const [user, loading] = useAuthState(auth);
  const localUser = JSON.parse(localStorage.getItem("eas_user_data") || "null");
  const isVerified = localStorage.getItem("eas_verified") === "true";
  const location = useLocation();
  if (loading) return <div className="h-screen flex items-center justify-center" style={{ background: PURPLE.bg }}><div className="text-purple-400 font-black animate-pulse tracking-[0.5em] text-[10px] uppercase">Connecting to EAS...</div></div>;
  if (!user && !localUser) return <Navigate to="/register" state={{ from: location }} replace />;
  if (!isVerified && location.pathname !== "/access-portal") return <Navigate to="/access-portal" replace />;
  return children;
};

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [user] = useAuthState(auth);
  const localUser = localStorage.getItem("eas_user_data");

  useEffect(() => { setShowIntro(!localStorage.getItem("intro_viewed")); }, []);
  useEffect(() => { document.body.style.background = PURPLE.bg; }, []);

  const showUI = !showIntro && (user || localUser);

  return (
    <Router>
      <div className="min-h-screen text-white selection:bg-purple-500" style={{ background: PURPLE.bg }}>
        {showIntro && <Intro onFinish={() => { localStorage.setItem("intro_viewed","true"); setShowIntro(false); }} />}
        <div className={showIntro ? "hidden" : "block pb-28"}>
          <Routes>
            <Route path="/register" element={<RegisterPortal />} />
            <Route path="/login" element={<LoginPortal />} />
            <Route path="/access-portal" element={<ProtectedRoute><AccessPortal /></ProtectedRoute>} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
            <Route path="/ai-quiz" element={<ProtectedRoute><GroqQuiz /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="/webinar" element={<ProtectedRoute><Webinar /></ProtectedRoute>} />
            <Route path="/solar" element={<ProtectedRoute><SolarSystem /></ProtectedRoute>} />
            <Route path="/market" element={<ProtectedRoute><Market /></ProtectedRoute>} />
            <Route path="/science" element={<ProtectedRoute><ScienceHub /></ProtectedRoute>} />
            <Route path="/apply" element={<ProtectedRoute><ApplyForm /></ProtectedRoute>} />
            <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          {showUI && <Navbar />}
        </div>
      </div>
    </Router>
  );
}

export default App;
