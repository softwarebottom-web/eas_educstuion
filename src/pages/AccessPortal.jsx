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
    const verified = localStorage.getItem("eas_verified");

    if (!saved) {
      navigate("/register");
      return;
    }

    try {
      const parsed = JSON.parse(saved);

      if (!parsed?.nama || !parsed?.gen) {
        localStorage.clear();
        navigate("/register");
        return;
      }

      setUserData(parsed);

      // 🔥 AUTO REDIRECT JIKA SUDAH VERIFIED
      if (verified === "true") {
        navigate("/dashboard");
      }

    } catch (err) {
      console.error(err);
      localStorage.clear();
      navigate("/register");
    }
  }, [navigate]);

  const handleActivate = () => {
    if (checking || !userData) return;

    setChecking(true);

    // 🔥 SIMULASI VALIDASI (bisa diganti API nanti)
    setTimeout(() => {
      localStorage.setItem("eas_verified", "true");

      navigate("/dashboard", { replace: true });

      setChecking(false);
    }, 1500);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/register");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#00050d] p-6 gap-8 relative overflow-hidden">
      
      {/* BACKGROUND */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none" 
        style={{ 
          backgroundImage: `radial-gradient(#1e3a8a 0.5px, transparent 0.5px)`, 
          backgroundSize: '24px 24px' 
        }}
      />

      {/* LOGOUT */}
      <button 
        onClick={handleLogout} 
        className="absolute top-8 left-8 text-[9px] uppercase text-gray-500 flex items-center gap-2 hover:text-red-400 transition-all z-10"
      >
        <ArrowLeft size={12} /> Logout
      </button>

      {/* MAIN */}
      {userData ? (
        <div className="flex flex-col items-center gap-6 w-full max-w-sm z-10">

          {/* ID CARD */}
          <IDCard data={userData} gen={userData.gen} />

          {/* WHATSAPP */}
          <a 
            href={WHATSAPP_LINKS[userData.gen] || "#"} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="w-full flex items-center justify-center gap-3 bg-green-600/10 border border-green-500/20 p-4 rounded-2xl text-green-400 uppercase text-[10px] font-black hover:bg-green-600 hover:text-white transition-all"
          >
            <MessageCircle size={18} /> Join WhatsApp Gen {userData.gen}
          </a>

        </div>
      ) : (
        <div className="text-blue-900 font-black text-[10px] animate-pulse">
          LOADING...
        </div>
      )}

      {/* SECURITY */}
      <div className="w-full max-w-xs p-8 border border-blue-900/30 rounded-[2.5rem] bg-black/60 backdrop-blur-md text-center z-10">
        
        <div className="mb-4">
          {checking 
            ? <Search className="animate-spin text-blue-400 mx-auto" size={24} /> 
            : <Lock className="text-blue-900 mx-auto" size={24} />}
        </div>

        <h2 className="text-[11px] font-black mb-2 uppercase text-blue-400">
          Security Check
        </h2>

        <p className="text-[8px] text-gray-600 mb-6 uppercase">
          Verification Required
        </p>
        
        <button 
          onClick={handleActivate}
          disabled={checking || !userData}
          className={`w-full py-4 rounded-xl font-black text-[10px] uppercase
            ${checking 
              ? 'bg-blue-900/20 text-blue-700' 
              : 'bg-blue-600/10 border border-blue-500 text-blue-400 hover:bg-blue-600 hover:text-white'}
          `}
        >
          {checking ? "Verifying..." : "Activate Access"}
        </button>

        <div className="mt-6 flex items-center justify-center gap-2 opacity-30">
          <ShieldCheck size={12} />
          <span className="text-[7px] uppercase">
            Secure Channel
          </span>
        </div>
      </div>

      <footer className="mt-4 opacity-10 text-[7px] uppercase font-black">
        EAS PORTAL
      </footer>
    </div>
  );
};

export default AccessPortal;
