import { useState, useEffect } from "react";
import AdminAuth from "./AdminAuth";
import AdminDashboard from "./AdminDashboard";

const AdminPanel = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("eas_admin_token");
    const adminId = localStorage.getItem("eas_admin_id");
    const role = localStorage.getItem("eas_admin_role");
    const expire = localStorage.getItem("eas_admin_expire");

    if (
      token === "EAS_ADMIN_SESSION" &&
      adminId &&
      role &&
      expire &&
      Date.now() < Number(expire)
    ) {
      setIsAuthorized(true);
    } else {
      // Bersihkan semua kalau tidak valid
      localStorage.removeItem("eas_admin_token");
      localStorage.removeItem("eas_admin_id");
      localStorage.removeItem("eas_admin_role");
      localStorage.removeItem("eas_admin_level");
      localStorage.removeItem("eas_admin_expire");
    }

    setChecking(false);
  }, []);

  if (checking) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#00050d] text-red-500 font-bold text-xs">
        Checking Authorization...
      </div>
    );
  }

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
