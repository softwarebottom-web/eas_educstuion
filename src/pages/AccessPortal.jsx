import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Search, MessageCircle, ArrowLeft, ShieldCheck } from "lucide-react";
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
    if (saved) {
      setUserData(JSON.parse(saved));
    } else {
      navigate("/register");
    }
  }, [navigate]);

  const handleActivate = () => {
    setChecking(true);
    
    // Simulasi enkripsi database
    setTimeout(() => {
      localStorage.setItem("eas_verified", "true");
      setChecking(false);
      // Menggunakan replace agar tidak bisa back ke halaman ini
      window.location.replace("/"); 
    }, 2500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#00050d] p-6 gap-8 relative overflow-hidden">
      
      {/* Background Decor - Pengganti Carbon Fiber yang Error */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: `radial-gradient(#1e3a8a 0.5px, transparent 0.5px)`, backgroundSize: '24px 24px' }}></div>

      <button 
        onClick={() => navigate("/register")} 
        className="absolute top-8 left-8 text-[9px] uppercase text-gray-500 flex items-center gap-2 hover:text-blue-400 transition-all z-10"
      >
        <ArrowLeft size={12} /> Re-Register System
      </button>

      {userData ? (
        <div className="flex flex-col items-center gap-6 w-full max-w-sm animate-in fade-in zoom-in duration-700 z-10">
          <IDCard data={userData} gen={userData.gen} />
          
          <a 
            href={WHATSAPP_LINKS[userData.gen]} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="w-full flex items-center justify-center gap-3 bg-green-600/10 border border-green-500/20 p-4 rounded-2xl text-green-400 uppercase text-[10px] font-black hover:bg-green-600 hover:text-white transition-all shadow-lg active:scale-95"
          >
            <MessageCircle size={18} /> Join WhatsApp Gen {userData.gen}
          </a>
        </div>
      ) : (
        <div className="text-blue-900 font-black text-[10px] animate-pulse italic">DATA NOT FOUND...</div>
      )}

      {/* Security Terminal Card */}
      <div className="w-full max-w-xs p-8 border border-blue-900/30 rounded-[2.5rem] bg-black/60 backdrop-blur-md text-center z-10 shadow-2xl relative">
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#00050d] p-3 rounded-full border border-blue-900/30 shadow-[0_0_20px_rgba(30,58,138,0.5)]">
          {checking ? <Search className="animate-spin text-blue-400" size={24} /> : <Lock className="text-blue-900" size={24} />}
        </div>

        <h2 className="text-[11px] font-black mb-1 tracking-[0.3em] uppercase text-blue-400 italic mt-4">Security Check</h2>
        <p className="text-[8px] text-gray-600 mb-8 uppercase tracking-widest leading-relaxed">
          Identity Verification Required <br/> To Access EAS Command Center
        </p>
        
        <button 
          onClick={handleActivate}
          disabled={checking}
          className={`group relative w-full py-4 rounded-xl font-black text-[10px] tracking-widest transition-all uppercase overflow-hidden
            ${checking ? 'bg-blue-900/20 text-blue-700' : 'bg-blue-600/10 border border-blue-500/50 text-blue-400 hover:bg-blue-600 hover:text-white'}
          `}
        >
          <span className="relative z-10">
            {checking ? "Verifying Protocol..." : "Activate Database"}
          </span>
          {checking && <div className="absolute inset-0 bg-blue-600/10 animate-pulse"></div>}
        </button>

        <div className="mt-6 flex items-center justify-center gap-2 opacity-30">
          <ShieldCheck size={12} className="text-blue-500" />
          <span className="text-[7px] uppercase font-bold tracking-tighter">Encrypted Connection</span>
        </div>
      </div>

      <footer className="mt-4 opacity-10 text-[7px] uppercase font-black tracking-[1em] z-10">
        Security Portal • EAS-v3
      </footer>
    </div>
  );
};

export default AccessPortal;
