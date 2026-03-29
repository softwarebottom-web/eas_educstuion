import React from "react"; // Fix: Mencegah 'React is not defined' crash
import html2canvas from "html2canvas";
import { Download, ShieldCheck } from "lucide-react";

const IDCard = ({ data, gen }) => {
  const downloadCard = () => {
    const card = document.getElementById("eas-card");
    if (!card) return;
    
    html2canvas(card, {
      backgroundColor: "#00050d", // Memastikan background tetap gelap saat didownload
      scale: 2 // Meningkatkan kualitas gambar
    }).then((canvas) => {
      const link = document.createElement("a");
      link.download = `EAS_ID_${data?.nama || "Member"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        id="eas-card" 
        className={`w-80 h-48 rounded-2xl p-6 relative overflow-hidden border-2 shadow-2xl ${
          gen === 1 ? 'border-blue-600 bg-[#000a1a]' : 'border-cyan-600 bg-black'
        }`}
      >
        {/* Background Overlay */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        
        <div className="relative z-10 flex justify-between h-full">
          <div className="flex flex-col justify-between">
            <div className="space-y-1">
              <h2 className="text-[9px] font-black text-blue-500 uppercase tracking-[0.3em]">Official Researcher</h2>
              <h3 className={`text-xl font-black tracking-tighter ${gen === 1 ? 'text-blue-400' : 'text-cyan-400'}`}>
                EAS GEN {gen}
              </h3>
            </div>
            
            <div className="mb-2">
              <p className="text-[8px] text-gray-500 uppercase tracking-widest font-bold">Identity Name</p>
              <p className="font-black text-sm uppercase tracking-tight text-white truncate w-40">
                {data?.nama || "Unknown Researcher"}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-2">
             {/* QR Code */}
             <div className="bg-white p-1.5 rounded-lg shadow-lg">
               <img 
                 src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${data?.nama || "EAS"}`} 
                 alt="QR Code Verification" 
                 className="w-14 h-14"
               />
             </div>
             <p className="text-[7px] font-mono text-blue-500/60 font-bold uppercase tracking-widest">System Verified</p>
          </div>
        </div>
        
        {/* Watermark Aesthetic */}
        <ShieldCheck className="absolute -bottom-6 -right-6 text-blue-500/10" size={120} />
      </div>

      <button 
        onClick={downloadCard}
        className="mt-6 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl font-black text-[10px] tracking-[0.2em] transition-all active:scale-95 shadow-lg shadow-blue-900/20 uppercase"
      >
        <Download size={14} /> Simpan ID Card
      </button>
    </div>
  );
};

export default IDCard;
