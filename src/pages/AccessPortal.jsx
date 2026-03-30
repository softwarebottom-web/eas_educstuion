import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Search, MessageCircle, ArrowLeft } from "lucide-react";
import IDCard from "../component/IDCard"; 

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
    if (saved) setUserData(JSON.parse(saved));
  }, []);

  // UBAH JADI BUTTON CLICK, BUKAN UPLOAD FILE
  const handleActivate = () => {
    setChecking(true);

    setTimeout(() => {
      // 1. Simpan kunci akses ke storage
      localStorage.setItem("eas_verified", "true");
      
      // 2. Hentikan loading
      setChecking(false);
      
      // 3. Paksa pindah ke Dashboard pakai replace agar history bersih
      window.location.replace("/"); 
    }, 2000); // Simulasi proses 2 detik
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#00050d] p-6 gap-10">
      <button onClick={() => navigate("/register")} className="absolute top-8 left-8 text-[9px] uppercase text-gray-500 flex items-center gap-2 hover:text-blue-400 transition-all">
        <ArrowLeft size={12} /> Re-Register
      </button>

      {userData ? (
        <div className="flex flex-col items-center gap-8 w-full max-w-sm animate-in fade-in duration-700">
          <IDCard data={userData} gen={userData.gen} />
          <a href={WHATSAPP_LINKS[userData.gen]} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-3 bg-green-600/10 border border-green-500/30 p-5 rounded-2xl text-green-400 uppercase text-[10px] font-black hover:bg-green-600 hover:text-white transition-all active:scale-95 shadow-lg shadow-green-900/20">
            <MessageCircle size={18} /> Join Group Gen {userData.gen}
          </a>
        </div>
      ) : (
        <div className="text-gray-600 font-black text-[10px] animate-pulse tracking-[0.2em]">MENCARI DATA IDENTITAS...</div>
      )}

      {/* SECTION VERIFIKASI AKSES */}
      <div className="w-full max-w-xs p-8 border border-dashed border-blue-900/30 rounded-[2.5rem] bg-black/40 text-center shadow-2xl backdrop-blur-sm">
        <div className="bg-blue-950/20 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
          {checking ? <Search className="animate-spin text-blue-400" size={20} /> : <Lock className="text-gray-700" size={20} />}
        </div>
        
        <h2 className="text-[11px] font-black mb-1 tracking-widest uppercase text-blue-400 italic">Security Check</h2>
        <p className="text-[8px] text-gray-600 mb-6 uppercase tracking-tighter leading-relaxed">
          Sistem akan memverifikasi ID Card di atas untuk membuka akses database.
        </p>
        
        {/* TOMBOL MURNI, TANPA INPUT FILE */}
        <button 
          onClick={handleActivate}
          disabled={checking}
          className="block w-full bg-blue-600/10 border border-blue-500/50 py-4 rounded-xl font-black text-[9px] cursor-pointer hover:bg-blue-600 hover:text-white transition-all uppercase disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(59,130,246,0.1)]"
        >
          {checking ? "ENCRYPTING..." : "ACTIVATE DATABASE"}
        </button>
      </div>
    </div>
  );
};

export default AccessPortal;
