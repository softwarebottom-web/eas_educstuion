import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Download, ShieldCheck } from "lucide-react";

const IDCard = ({ data, gen }) => {
  const cardRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const finalGen = gen || data?.gen || 1;

  const safeName = (data?.nama || "Member")
    .replace(/[^a-z0-9]/gi, "_")
    .toUpperCase();

  const downloadCard = async () => {
    if (!cardRef.current || loading) return;
    setLoading(true);

    try {
      // tunggu image load (QR)
      const imgs = cardRef.current.querySelectorAll("img");
      await Promise.all(
        Array.from(imgs).map(
          (img) =>
            new Promise((res) => {
              if (img.complete) return res();
              img.onload = res;
              img.onerror = res;
            })
        )
      );

      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#00050d",
        scale: 3,
        useCORS: true,
      });

      const link = document.createElement("a");
      link.download = `EAS_ID_${safeName}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error(e);
      alert("Download gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div
        ref={cardRef}
        className={`w-80 h-48 p-6 rounded-[2rem] border-2 relative overflow-hidden ${
          finalGen === 1 ? "border-blue-600 bg-[#000a1a]" : "border-cyan-600 bg-black"
        }`}
      >
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

        <div className="relative z-10 flex justify-between h-full">
          <div className="flex flex-col justify-between">
            <div>
              <p className="text-[8px] text-blue-500 font-black uppercase">
                Official Researcher
              </p>
              <h3 className="text-xl font-black">
                GEN {finalGen}
              </h3>
            </div>

            <div>
              <p className="text-[7px] text-gray-500">Name</p>
              <p className="text-sm font-bold truncate w-40">
                {data?.nama || "Unknown"}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-2">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${safeName}`}
              alt="qr"
              className="w-12 h-12 bg-white p-1 rounded"
              crossOrigin="anonymous"
            />
            <p className="text-[6px] text-blue-400">Verified</p>
          </div>
        </div>

        <ShieldCheck className="absolute -bottom-8 -right-8 opacity-10" size={140} />
      </div>

      <button
        onClick={downloadCard}
        disabled={loading}
        className="mt-5 px-6 py-3 bg-blue-600 rounded-xl text-xs font-bold"
      >
        {loading ? "PROCESSING..." : "Download ID"}
      </button>
    </div>
  );
};

export default IDCard;
