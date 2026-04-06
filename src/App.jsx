import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./api/config";
import { useEasStore, THEMES } from "./store/useStore";

import Intro from "./component/Intro";
import Navbar from "./component/Navbar";
import MusicPlayer from "./component/MusicPlayer";
import RegisterPortal from "./pages/RegisterPortal";
import LoginPortal from "./pages/LoginPortal";
import AccessPortal from "./pages/AccessPortal";
import Dashboard from "./pages/Dashboard";
import Library from "./pages/Libary";
import Quiz from "./pages/Quiz";
import About from "./pages/About";
import Settings from "./pages/Settings";
import AdminPanel from "./pages/AdminPanel";

const ProtectedRoute = ({ children }) => {
  const [user, loading] = useAuthState(auth);
  const localUser = JSON.parse(localStorage.getItem("eas_user_data") || "null");
  const isVerified = localStorage.getItem("eas_verified") === "true";
  const location = useLocation();
  const { theme } = useEasStore();
  const t = THEMES[theme] || THEMES.dark;

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: t.bg }}>
        <div className="font-black animate-pulse tracking-[0.5em] text-[10px] uppercase" style={{ color: t.accent }}>
          Connecting to EAS Satellite...
        </div>
      </div>
    );
  }

  if (!user && !localUser) {
    return <Navigate to="/register" state={{ from: location }} replace />;
  }

  if (!isVerified && location.pathname !== "/access-portal") {
    return <Navigate to="/access-portal" replace />;
  }

  return children;
};

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [user] = useAuthState(auth);
  const localUser = localStorage.getItem("eas_user_data");
  const { theme } = useEasStore();
  const t = THEMES[theme] || THEMES.dark;

  useEffect(() => {
    const introDone = localStorage.getItem("intro_viewed");
    setShowIntro(!introDone);
  }, []);

  // ✅ Apply theme bg ke body
  useEffect(() => {
    document.body.style.background = t.bg;
  }, [theme]);

  const handleIntroFinish = () => {
    localStorage.setItem("intro_viewed", "true");
    setShowIntro(false);
  };

  const showUI = !showIntro && (user || localUser);

  return (
    <Router>
      <div className="min-h-screen text-white selection:bg-blue-500" style={{ background: t.bg }}>

        {showIntro && <Intro onFinish={handleIntroFinish} />}

        <div className={showIntro ? "hidden" : "block pb-24"}>
          <Routes>
            <Route path="/register" element={<RegisterPortal />} />
            <Route path="/login" element={<LoginPortal />} />

            <Route path="/access-portal" element={
              <ProtectedRoute><AccessPortal /></ProtectedRoute>
            } />
            <Route path="/" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/library" element={
              <ProtectedRoute><Library /></ProtectedRoute>
            } />
            <Route path="/quiz" element={
              <ProtectedRoute><Quiz /></ProtectedRoute>
            } />
            <Route path="/about" element={
              <ProtectedRoute><About /></ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute><Settings /></ProtectedRoute>
            } />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {showUI && <MusicPlayer />}
          {showUI && <Navbar />}
        </div>
      </div>
    </Router>
  );
}

export default App;
