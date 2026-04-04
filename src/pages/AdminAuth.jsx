import React, { useState, useEffect } from "react";
import { ShieldAlert, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { STAFF_LIST } from "../api/staff";

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
      const currentName = userData?.nama?.toLowerCase();

      // 🔥 VALIDASI KE STAFF.JS (BUKAN ENV DOANG)
      const staff = STAFF_LIST.find(
        (s) => s.nickname.toLowerCase() === currentName
      );

      if (!staff) {
        alert("DENIED: Anda bukan staff terdaftar!");
        return;
      }

      if (passkey !== masterKey) {
        alert("DENIED: Master key salah!");
        return;
      }

      // 🔐 GENERATE SESSION
      const expireTime = Date.now() + 1000 * 60 * 60; // 1 jam

      localStorage.setItem("eas_admin_token", "EAS_ADMIN_SESSION");
      localStorage.setItem("eas_active_staff", staff.nickname);
      localStorage.setItem("eas_admin_role", staff.role);
      localStorage.setItem("eas_admin_expire", expireTime.toString());

      alert(`ACCESS GRANTED: ${staff.nickname} (${staff.role})`);

      onClose();
      navigate("/admin", { replace: true });

    } catch (err) {
      console.error(err);
      alert("Terjadi error saat autentikasi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">

      {/* BACKDROP */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* MODAL */}
      <div className="relative w-full max-w-sm p-10 border border-red-900/30 rounded-[2.5rem] bg-black/90 text-center shadow-[0_0_60px_rgba(153,27,27,0.2)] z-10">

        <div className="bg-red-950/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
          <ShieldAlert className="text-red-500 animate-pulse" size={28} />
        </div>

        <h1 className="text-sm font-black tracking-[0.4em] text-red-500 uppercase mb-2 italic">
          Admin Gateway
        </h1>

        <p className="text-[9px] text-gray-500 uppercase mb-8 tracking-widest leading-relaxed">
          Log:{" "}
          <span className="text-gray-300 font-black">
            {userData?.nama || "Unknown"}
          </span>
          <br />
          Authorization Required
        </p>

        <form onSubmit={handleAdminAuth} className="space-y-4">

          {/* INPUT */}
          <div className="relative">
            <Lock
              className="absolute left-4 top-1/2 -translate-y-1/2 text-red-900"
              size={14}
            />

            <input
              type="password"
              placeholder="ENTER MASTER KEY"
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              className="w-full bg-red-950/5 border border-red-900/30 p-4 pl-12 rounded-2xl text-center text-[10px] text-red-500 placeholder:text-red-900/50 focus:outline-none focus:border-red-500/50 transition-all font-black tracking-[0.3em]"
              required
            />
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all
              ${loading
                ? "bg-red-900/20 text-red-700"
                : "bg-red-600/10 border border-red-500/30 text-red-500 hover:bg-red-600 hover:text-white"}
            `}
          >
            {loading ? "AUTHORIZING..." : "Authorize Access"}
          </button>
        </form>

        {/* CANCEL */}
        <button
          onClick={onClose}
          className="mt-6 text-[8px] text-gray-600 hover:text-gray-400 uppercase tracking-widest"
        >
          Cancel
        </button>

        <p className="mt-6 text-[7px] text-red-900 font-bold uppercase tracking-[0.5em]">
          EAS Security Layer
        </p>
      </div>
    </div>
  );
};

export default AdminAuth;
