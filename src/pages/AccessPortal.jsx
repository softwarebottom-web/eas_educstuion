import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Search, MessageCircle, ArrowLeft } from "lucide-react";
import IdCard from "../component/IdCard"; // SEKARANG KONSISTEN PAKE 'd' KECIL

const WHATSAPP_LINKS = {
  1: "https://chat.whatsapp.com/DMSABsZCPC77nkFdzphbNH",
  2: "https://chat.whatsapp.com/JuLtO0VsqxDHUSHNrNjQZN"
};

const AccessPortal = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("eas_user_data");
    if (saved) {
      try {
        setUserData(JSON.parse(saved));
      } catch (e) {
        console.error("Data error:", e);
      }
    }
  }, []);

  const handleUploadID = (e) => {
    if (!e.target.files[0]) return;
    setChecking(true);

    // Simulasi enkripsi data identitas untuk Lab EAS
    setTimeout(() => {
      localStorage.setItem("eas_verified", "true");
      alert("AKSES DITERIMA: Selamat datang di Lab.");
      navigate("/");
      setChecking(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#00050d] text-white p-6 gap-10">
      
      {/* HEADER NAVIGATION */}
      <button 
        onClick={() => navigate("/register")}
        className="absolute top-8 left-8 text-[9px] font-black tracking-[0.3em] uppercase text-gray-500 hover:text-blue-400 transition-all flex items-center gap-2"
      >
        <ArrowLeft size={12} /> Re-Register
      </button>

      {userData ? (
        <div className="flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-700 w-full max-w-sm">
          <div className="text-center space-y-2">
            <h1 className="text-[10px] font-black tracking-[0.5em] text-blue-500 uppercase">Identity Verified</h1>
            <p className="text-[9px] text-gray-600 uppercase tracking-widest">Simpan Identity Card Anda</p>
          </div>

          {/* KOMPONEN IDCARD */}
          <IdCard data={userData} gen={userData.gen} />

          {/* TOMBOL WHATSAPP */}
          <a
            href={WHATSAPP_LINKS[userData.gen]}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-3 bg-green-600/10 border border-green-500/30 p-5 rounded-2xl font-black text-[10px] tracking-[0.2em] text-green-400 hover:bg-green-600 hover:text-white transition-all uppercase shadow-lg shadow-green-900/10"
          >
            <MessageCircle size={18} /> Join WA Group Gen {userData.gen}
          </a>
        </div>
      ) : (
        <div className="text-center text-gray-600 font-black text-[10px] tracking-widest animate-pulse">
          MENCARI DATA IDENTITAS...
        </div>
      )}

      {/* SECTION VERIFIKASI (UPLOAD) */}
      <div className="w-full max-w-xs p-8 border border-dashed border-blue-900/30 rounded-[2.5rem] bg-black/40 backdrop-blur-xl text-center">
        <div className="bg-blue-950/20 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
          {checking ? <Search className="animate-spin text-blue-400" size={20} /> : <Lock className="text-gray-700" size={20} />}
        </div>
        
        <h2 className="text-[11px] font-black mb-1 tracking-[0.2em] italic uppercase">Internal Verification</h2>
        <p className="text-[8px] text-gray-600 mb-6 uppercase tracking-tighter">Upload ID Card untuk membuka database.</p>

        <label className="block w-full bg-blue-600/10 border border-blue-500/50 py-4 rounded-xl font-black text-[9px] tracking-widest cursor-pointer hover:bg-blue-600 hover:text-white transition-all uppercase">
          {checking ? "SCANNING..." : "SELECT IDENTITY FILE"}
          <input type="file" className="hidden" accept="image/*" onChange={handleUploadID} />
        </label>
      </div>

      <footer className="opacity-20 mt-4">
        <p className="text-[7px] font-bold tracking-[0.8em] uppercase">Security Portal • EAS</p>
      </footer>
    </div>
  );
};

export default AccessPortal;
