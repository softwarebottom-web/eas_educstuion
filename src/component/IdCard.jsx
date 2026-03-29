import html2canvas from "html2canvas";
import { Download, ShieldCheck } from "lucide-react";

const IDCard = ({ data, gen }) => {
  const downloadCard = () => {
    const card = document.getElementById("eas-card");
    html2canvas(card).then((canvas) => {
      const link = document.createElement("a");
      link.download = `EAS_ID_${data.nama}.png`;
      link.href = canvas.toDataURL();
      link.click();
    });
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        id="eas-card" 
        className={`w-80 h-48 rounded-xl p-4 relative overflow-hidden border-2 ${gen === 1 ? 'border-blue-500 bg-slate-900' : 'border-cyan-500 bg-black'}`}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        
        <div className="relative z-10 flex justify-between h-full">
          <div className="flex flex-col justify-between">
            <div>
              <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Official Member</h2>
              <h3 className={`text-lg font-black tracking-tighter ${gen === 1 ? 'text-blue-400' : 'text-cyan-400'}`}>
                EAS GEN {gen}
              </h3>
            </div>
            
            <div className="mb-2">
              <p className="text-[10px] text-gray-400 uppercase">Researcher Name</p>
              <p className="font-bold text-sm truncate w-40">{data.nama}</p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-2">
             {/* QR Code Placeholder (Gunakan UID atau Nama) */}
             <div className="bg-white p-1 rounded">
               <img src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${data.nama}`} alt="QR" />
             </div>
             <p className="text-[8px] font-mono opacity-50">VERIFIED BY AI</p>
          </div>
        </div>
        
        {/* Watermark Logo */}
        <ShieldCheck className="absolute -bottom-4 -right-4 text-white/5" size={100} />
      </div>

      <button 
        onClick={downloadCard}
        className="mt-4 flex items-center gap-2 bg-green-600 px-6 py-2 rounded-full font-bold text-xs hover:bg-green-500 transition"
      >
        <Download size={14} /> SIMPAN ID CARD
      </button>
    </div>
  );
};

export default IDCard;
