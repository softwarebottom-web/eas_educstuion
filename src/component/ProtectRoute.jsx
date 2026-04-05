import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, requireID = true }) => {
  const location = useLocation();

  let localUser = null;
  try {
    localUser = JSON.parse(localStorage.getItem("eas_user_data"));
  } catch (e) {
    console.error("LocalStorage parse error:", e);
    localUser = null;
  }

  const hasID = localStorage.getItem("eas_verified") === "true";

  // 🔒 1. BELUM REGISTER → ke Register
  if (!localUser) {
    return (
      <Navigate
        to="/register"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // 🔒 2. SUDAH VERIFIED + DI ACCESS PORTAL → ke Dashboard
  if (hasID && location.pathname === "/access-portal") {
    return <Navigate to="/" replace />;
  }

  // 🔒 3. BELUM VERIFIED + BUKAN DI ACCESS PORTAL → ke Access Portal
  if (requireID && !hasID && location.pathname !== "/access-portal") {
    return <Navigate to="/access-portal" replace />;
  }

  // ✅ Aman, render halaman
  return children;
};

export default ProtectedRoute;
