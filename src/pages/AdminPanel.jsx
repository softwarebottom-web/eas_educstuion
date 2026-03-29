import { useState, useEffect } from "react";
import AdminAuth from "./AdminAuth";

const AdminPanel = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Cek apakah Admin sudah punya token "ID Card Digital" di browser
    const token = localStorage.getItem("eas_admin_token");
    if (token === "SUPER_ADMIN_GRANTED_2026") {
      setIsAuthorized(true);
    }
  }, []);

  // Jika belum login & tidak ada token, tampilkan form login
  if (!isAuthorized) {
    return <AdminAuth onAuthSuccess={() => setIsAuthorized(true)} />;
  }

  // Jika sudah lolos, tampilkan dashboard admin yang asli
  return (
    <div className="p-6">
      <h1 className="text-2xl font-black text-blue-500 mb-6">STAFF COMMAND CENTER</h1>
      {/* Isi Dashboard Admin (Daftar Pendaftar Gen 1/2, Atur Quiz, dll) */}
    </div>
  );
};

export default AdminPanel;
