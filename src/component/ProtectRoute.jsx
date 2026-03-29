import React from "react"; // Fix: Mencegah 'React is not defined' crash
import { Navigate, useLocation } from "react-router-dom";
import { auth } from "../api/config";
import { useAuthState } from "react-firebase-hooks/auth";

const ProtectedRoute = ({ children, requireID = true }) => {
  const [user, loading] = useAuthState(auth);
  const location = useLocation();
  
  // Ambil status verifikasi dengan fallback false jika null
  const hasID = localStorage.getItem("eas_verified") === "true";

  if (loading) return (
    <div className="h-screen bg-[#00050d] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-900 border-t-blue-500 rounded-full animate-spin"></div>
        <div className="text-blue-500 font-black animate-pulse tracking-[0.3em] text-[10px] uppercase">
          Scanning Biometric Identity...
        </div>
      </div>
    </div>
  );

  // 1. Jika belum login, tendang ke Register
  // Gunakan state agar setelah login bisa balik ke halaman yang dituju sebelumnya
  if (!user) {
    return <Navigate to="/register" state={{ from: location }} replace />;
  }

  // 2. Jika fitur butuh ID Card tapi user belum scan, tendang ke AccessPortal
  // Pastikan tidak terjadi infinite redirect jika user sedang di AccessPortal
  if (requireID && !hasID && location.pathname !== "/access-portal") {
    return <Navigate to="/access-portal" replace />;
  }

  return children;
};

export default ProtectedRoute;
