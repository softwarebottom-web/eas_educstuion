import React, { useRef } from "react";
import html2canvas from "html2canvas";
import { Download, ShieldCheck } from "lucide-react";

const IDCard = ({ data, gen }) => {
  const cardRef = useRef();

  const safeName = (data?.nama || "Member").replace(/[^a-z0-9]/gi, "_");

  const downloadCard = async () => {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#00050d",
        scale: 3,
        useCORS: true,
        allowTaint: true
      });

      const link = document.createElement("a");
      link.download = `EAS_ID_${safeName}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Download error:", err);
      alert("Gagal download ID Card");
    }
  };

  const finalGen = gen || data?.gen || 1;

  return (
    <div className="flex flex-col items-center">
      <div
        ref={cardRef}
        className={`w-80 h-48 rounded-[2rem] p-6 relative overflow-hidden border-2 shadow-2xl ${
          finalGen === 1
            ? "border-blue-600 bg-[#000a1a]"
            : "border-cyan-600 bg-black"
        }`}
      >
        {/* Overlay */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

        <div className="relative z-10 flex justify-between h-full">
          <div className="flex flex-col justify-between">
            <div>
              <h2 className="text-[8px] font-black text-blue-500 uppercase tracking-[0.4em]">
                Official Researcher
              </h2>
              <h3
                className={`text-xl font-black ${
                  finalGen === 1 ? "text-blue-400" : "text-cyan-400"
                }`}
              >
                EAS GEN {finalGen}
              </h3>
            </div>

            <div>
              <p className="text-[7px] text-gray-500 uppercase font-bold">
                Identity Name
              </p>
              <p className="font-black text-sm text-white truncate w-40">
                {data?.nama || "Unknown"}
              </p>
            </div>
          </div>

          {/* QR */}
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="bg-white p-1.5 rounded-xl">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=EAS-${safeName}`}
                alt="QR"
                className="w-12 h-12"
                crossOrigin="anonymous"
              />
            </div>
            <p className="text-[6px] text-blue-400 uppercase">
              Verified
            </p>
          </div>
        </div>

        <ShieldCheck
          className={`absolute -bottom-8 -right-8 opacity-10 ${
            finalGen === 1 ? "text-blue-500" : "text-cyan-500"
          }`}
          size={140}
        />
      </div>

      {/* BUTTON */}
      <button
        onClick={downloadCard}
        className="mt-6 flex items-center gap-2 bg-blue-600 px-6 py-3 rounded-xl font-bold text-xs hover:scale-105 transition"
      >
        <Download size={14} />
        Download ID
      </button>
    </div>
  );
};

export default IDCard;
