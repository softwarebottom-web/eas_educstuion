import React, { useState, useEffect } from "react";
import { ShieldAlert, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminAuth = ({ isOpen, onClose, userData }) => {
  const navigate = useNavigate();
  const [passkey, setPasskey] = useState("");

  useEffect(() => {
    // reset input setiap modal dibuka
    if (isOpen) {
      setPasskey("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAdminAuth = (e) => {
    e.preventDefault();

    // 🔥 Ambil ENV
    const adminEnv = import.meta.env.VITE_ADMIN_LIST || "";
    const adminList = adminEnv
      .split(",")
      .map((name) => name.trim().toLowerCase());

    const masterKey = import.meta.env.VITE_ADMIN_MASTER_KEY;

    const currentName = userData?.nama?.toLowerCase();

    // 🔐 VALIDASI
    if (adminList.includes(currentName) && passkey === masterKey) {
      localStorage.setItem("eas_admin_token", "SUPER_ADMIN_GRANTED_2026");

      alert(`WELCOME COMMANDER: ${userData?.nama || "ADMIN"}`);

      onClose(); // tutup modal
      navigate("/admin");
    } else {
      alert("DENIED: Anda bukan admin atau key salah!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      
      {/* BACKDROP CLICK */}
      <div
        className="absolute inset-0"
        onClick={onClose}
      ></div>

      {/* MODAL */}
      <div className="relative w-full max-w-sm p-10 border border-red-900/30 rounded-[2.5rem] bg-black/90 text-center shadow-[0_0_60px_rgba(153,27,27,0.2)] z-10">
        
        {/* ICON */}
        <div className="bg-red-950/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
          <ShieldAlert className="text-red-500 animate-pulse" size={28} />
        </div>

        {/* TITLE */}
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

        {/* FORM */}
        <form onSubmit={handleAdminAuth} className="space-y-4">
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

          <button
            type="submit"
            className="w-full bg-red-600/10 border border-red-500/30 py-4 rounded-2xl font-black text-[10px] text-red-500 hover:bg-red-600 hover:text-white transition-all uppercase tracking-[0.2em] active:scale-95"
          >
            Authorize Access
          </button>
        </form>

        {/* CLOSE */}
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
