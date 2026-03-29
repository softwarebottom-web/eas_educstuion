import React from "react"; 
import html2canvas from "html2canvas";
import { Download, ShieldCheck } from "lucide-react";

// Pastikan props 'data' dan 'gen' diterima dengan benar dari AccessPortal
const IDCard = ({ data, gen }) => {
  const downloadCard = () => {
    const card = document.getElementById("eas-card");
    if (!card) return;
    
    html2canvas(card, {
      backgroundColor: "#00050d", 
      scale: 3, // Naikkan ke 3 agar hasil download lebih tajam di HP
      useCORS: true // Tambahkan ini agar QR Code dari API eksternal bisa ikut ter-render
    }).then((canvas) => {
      const link = document.createElement("a");
      link.download = `EAS_ID_${data?.nama || "Member"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  };

  return (
    <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div 
        id="eas-card" 
        className={`w-80 h-48 rounded-[2rem] p-6 relative overflow-hidden border-2 shadow-2xl transition-all duration-500 ${
          gen === 1 ? 'border-blue-600 bg-[#000a1a]' : 'border-cyan-600 bg-black'
        }`}
      >
        {/* Carbon Fiber Pattern Overlay */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        
        <div className="relative z-10 flex justify-between h-full">
          <div className="flex flex-col justify-between">
            <div className="space-y-1">
              <h2 className="text-[8px] font-black text-blue-500 uppercase tracking-[0.4em]">Official Researcher</h2>
              <h3 className={`text-xl font-black tracking-tighter ${gen === 1 ? 'text-blue-400' : 'text-cyan-400'}`}>
                EAS GEN {gen || "X"}
              </h3>
            </div>
            
            <div className="mb-2">
              <p className="text-[7px] text-gray-500 uppercase tracking-widest font-bold">Identity Name</p>
              <p className="font-black text-sm uppercase tracking-tight text-white truncate w-40 leading-none">
                {data?.nama || "M. Fikri Surya Firdaus"}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-2">
             <div className="bg-white p-1.5 rounded-xl shadow-lg shadow-blue-500/20">
               <img 
                 src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=EAS-VERIFIED-${data?.nama || "MEMBER"}`} 
                 alt="QR Verification" 
                 className="w-12 h-12"
               />
             </div>
             <p className="text-[6px] font-mono text-blue-500/80 font-bold uppercase tracking-widest">Auth Verified</p>
          </div>
        </div>
        
        <ShieldCheck className={`absolute -bottom-8 -right-8 opacity-10 ${gen === 1 ? 'text-blue-500' : 'text-cyan-500'}`} size={140} />
      </div>

      <button 
        onClick={downloadCard}
        className="mt-8 flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl font-black text-[10px] tracking-[0.2em] transition-all active:scale-95 shadow-[0_10px_20px_rgba(37,99,235,0.3)] uppercase"
      >
        <Download size={14} /> Download Identity
      </button>
    </div>
  );
};

export default IDCard;
