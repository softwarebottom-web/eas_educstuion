import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, requireID = true }) => {
  const location = useLocation();
  
  // 1. Cek apakah user sudah daftar (Data dari RegisterPortal)
  const localUser = JSON.parse(localStorage.getItem("eas_user_data") || "null");
  
  // 2. Cek apakah sudah tekan 'Activate Database' di AccessPortal
  const hasID = localStorage.getItem("eas_verified") === "true";

  // LOGIKA PROTEKSI:
  
  // A. Jika belum daftar sama sekali, lempar ke Register
  if (!localUser) {
    return <Navigate to="/register" state={{ from: location }} replace />;
  }

  // B. Jika sudah daftar tapi belum verifikasi ID, paksa ke Access Portal
  // Kecuali jika user memang sedang berada di Access Portal (cegah infinite loop)
  if (requireID && !hasID && location.pathname !== "/access-portal") {
    return <Navigate to="/access-portal" replace />;
  }

  return children;
};

export default ProtectedRoute;
