import React, { useState, useEffect } from "react";
import { ShieldAlert, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { db } from "../api/config";
import { collection, query, where, getDocs } from "firebase/firestore";

const AdminAuth = ({ isOpen, onClose, userData }) => {
  const navigate = useNavigate();
  const [passkey, setPasskey] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) setPasskey("");
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAdminAuth = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    try {
      const masterKey = import.meta.env.VITE_ADMIN_MASTER_KEY;
      const currentName = userData?.nama;

      if (!currentName) {
        alert("User tidak valid");
        return;
      }

      // 🔥 QUERY KE FIRESTORE (SOURCE OF TRUTH)
      const q = query(
        collection(db, "users"),
        where("public.nama", "==", currentName)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        alert("DENIED: User tidak terdaftar");
        return;
      }

      const docSnap = snapshot.docs[0];
      const data = docSnap.data();

      const role = data?.public?.role;
      const banned = data?.system?.banned;
      const verified = data?.system?.verified;

      // 🔐 VALIDASI SYSTEM
      if (banned) {
        alert("DENIED: Akun dibanned");
        return;
      }

      if (!verified) {
        alert("DENIED: Akun belum diverifikasi");
        return;
      }

      // 🔥 ROLE CHECK (HANYA PETINGGI)
      const allowedRoles = ["owner", "admin", "moderator"];

      if (!allowedRoles.includes(role)) {
        alert("DENIED: Anda bukan staff");
        return;
      }

      // 🔐 MASTER KEY
      if (passkey !== masterKey) {
        alert("DENIED: Key salah");
        return;
      }

      // 🔥 LEVEL SYSTEM
      let level = 1;
      if (role === "admin") level = 2;
      if (role === "owner") level = 3;

      const expireTime = Date.now() + 1000 * 60 * 60;

      // 🔥 SESSION
      localStorage.setItem("eas_admin_token", "EAS_ADMIN_SESSION");
      localStorage.setItem("eas_admin_id", docSnap.id);
      localStorage.setItem("eas_admin_role", role);
      localStorage.setItem("eas_admin_level", level.toString());
      localStorage.setItem("eas_admin_expire", expireTime.toString());

      alert(`ACCESS GRANTED: ${role.toUpperCase()}`);

      onClose();
      navigate("/admin", { replace: true });

    } catch (err) {
      console.error(err);
      alert("Auth error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">

      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="relative w-full max-w-sm p-10 rounded-[2.5rem] bg-white/5 backdrop-blur-xl border border-red-500/20 text-center z-10">

        <div className="bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="text-red-500 animate-pulse" size={28} />
        </div>

        <h1 className="text-sm font-black tracking-widest text-red-400 mb-2">
          ADMIN ACCESS
        </h1>

        <p className="text-[10px] text-gray-500 mb-6">
          {userData?.nama || "Unknown"} • Secure Auth
        </p>

        <form onSubmit={handleAdminAuth} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400/40" size={14} />
            <input
              type="password"
              placeholder="MASTER KEY"
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              className="w-full bg-black/40 border border-red-500/20 p-4 pl-12 rounded-2xl text-center text-xs text-red-400 focus:outline-none focus:border-red-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-2xl text-xs font-black uppercase transition-all
              ${loading
                ? "bg-red-900/20 text-red-700"
                : "bg-red-600 hover:bg-red-700 text-white"}
            `}
          >
            {loading ? "AUTHORIZING..." : "ENTER SYSTEM"}
          </button>
        </form>

        <button
          onClick={onClose}
          className="mt-6 text-[9px] text-gray-500 hover:text-gray-300"
        >
          Cancel
        </button>

      </div>
    </div>
  );
};

export default AdminAuth;
