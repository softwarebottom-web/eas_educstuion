import { useState, useEffect } from "react";
import AdminAuth from "./AdminAuth";
import AdminDashboard from "./AdminDashboard";

const AdminPanel = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("eas_admin_token");
    const expire = localStorage.getItem("eas_admin_expire");

    // 🔐 VALIDASI TOKEN + EXPIRE
    if (token === "EAS_ADMIN_SESSION" && expire && Date.now() < Number(expire)) {
      setIsAuthorized(true);
    } else {
      localStorage.removeItem("eas_admin_token");
      localStorage.removeItem("eas_admin_expire");
    }
  }, []);

  // 🔥 KIRIM CALLBACK KE AUTH
  if (!isAuthorized) {
    return (
      <AdminAuth
        isOpen={true}
        onClose={() => {}}
        onAuthSuccess={() => setIsAuthorized(true)}
      />
    );
  }

  return <AdminDashboard />;
};

export default AdminPanel;
