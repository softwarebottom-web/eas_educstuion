import { Navigate } from "react-router-dom";
import { auth } from "../api/config";
import { useAuthState } from "react-firebase-hooks/auth";

const ProtectedRoute = ({ children, requireID = true }) => {
  const [user, loading] = useAuthState(auth);
  const hasID = localStorage.getItem("eas_verified") === "true";

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-blue-500 animate-pulse">SCANNING BIOMETRIC...</div>;

  // Jika belum login, tendang ke Register
  if (!user) {
    return <Navigate to="/register" replace />;
  }

  // Jika fitur butuh ID Card tapi user belum scan, tendang ke AccessPortal
  if (requireID && !hasID) {
    return <Navigate to="/access-portal" replace />;
  }

  return children;
};

export default ProtectedRoute;
