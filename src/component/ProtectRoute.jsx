import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, requireID = true }) => {
  const location = useLocation();

  // 🔥 SAFE PARSE (hindari crash kalau JSON rusak)
  let localUser = null;
  try {
    localUser = JSON.parse(localStorage.getItem("eas_user_data"));
  } catch (e) {
    console.error("LocalStorage parse error:", e);
    localUser = null;
  }

  const hasID = localStorage.getItem("eas_verified") === "true";

  // 🔒 1. BELUM REGISTER
  if (!localUser) {
    return (
      <Navigate
        to="/register"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // 🔒 2. BELUM AKTIVASI ID
  if (requireID && !hasID) {
    // ❗ Hindari loop
    if (location.pathname !== "/access-portal") {
      return <Navigate to="/access-portal" replace />;
    }
  }

  // 🔒 3. SUDAH VERIFIED TAPI MASIH DI ACCESS PORTAL → LEMPAR KE DASHBOARD
  if (hasID && location.pathname === "/access-portal") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
