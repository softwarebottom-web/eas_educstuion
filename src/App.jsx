import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
// Hapus useAuthState kalau kamu cuma pakai LocalStorage + Firestore tanpa Firebase Auth (Email/Pass)
// import { useAuthState } from "react-firebase-hooks/auth"; 
// import { auth } from "./api/config"; 

import RegisterPortal from "./pages/RegisterPortal";
import AccessPortal from "./pages/AccessPortal";
import Dashboard from "./pages/Dashboard";
import Library from "./pages/Libary"; // Pastikan filenya 'Libary.jsx' (typo di nama file)
import Quiz from "./pages/Quiz"; 
import AdminAuth from "./pages/AdminAuth"; // Halaman Login Admin yang ada PDF-nya
import AdminPanel from "./pages/AdminPanel"; // Dashboard Admin

// --- 🛡️ PROTECTED ROUTE SYSTEM ---
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const location = useLocation();
  
  // FIX: Sesuaikan dengan key yang di-save di RegisterPortal
  const localUser = JSON.parse(localStorage.getItem("eas_user_data") || "null");
  const isVerified = localStorage.getItem("eas_verified") === "true";
  const isAdmin = localStorage.getItem("eas_admin_token") === "SUPER_ADMIN_GRANTED_2026";

  // 1. Jika tidak ada data user sama sekali, lempar ke Register
  if (!localUser && location.pathname !== "/admin-login") {
    return <Navigate to="/register" state={{ from: location }} replace />;
  }

  // 2. Jika sudah daftar tapi belum verifikasi ID Card, paksa ke Access Portal
  if (localUser && !isVerified && location.pathname !== "/access-portal" && !isAdmin) {
    return <Navigate to="/access-portal" replace />;
  }

  // 3. Jika ini rute Admin, cek token admin
  if (adminOnly && !isAdmin) {
    alert("AKSES DITOLAK: Area khusus Petinggi!");
    return <Navigate to="/admin-login" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#00050d] text-white">
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/register" element={<RegisterPortal />} />
          
          {/* LOGIN ADMIN (Tanpa Protection biar bisa diakses) */}
          <Route path="/admin-login" element={
            <AdminAuth onAuthSuccess={() => window.location.href="/admin-dashboard"} />
          } />

          {/* PROTECTED ROUTES */}
          <Route path="/access-portal" element={
            <ProtectedRoute>
              <AccessPortal />
            </ProtectedRoute>
          } />

          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/quiz" element={
            <ProtectedRoute>
              <Quiz />
            </ProtectedRoute>
          } />

          <Route path="/admin-dashboard" element={
            <ProtectedRoute adminOnly={true}>
              <AdminPanel />
            </ProtectedRoute>
          } />

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/register" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
