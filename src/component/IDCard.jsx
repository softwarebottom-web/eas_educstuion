import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Download, ShieldCheck } from "lucide-react";

const IDCard = ({ data, gen }) => {
  const cardRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const finalGen = gen || data?.gen || 1;

  // 🔥 FIX: MEMBER ID FALLBACK
  const memberId = data?.memberId || `EAS-${finalGen}-XXXX`;

  // 🔥 FIX: QR FALLBACK (kalau qrImage kosong)
  const qrSrc =
    data?.qrImage ||
    `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
      `EAS|${memberId}`
    )}`;

  const safeName = (data?.nama || "Member")
    .replace(/[^a-z0-9]/gi, "_")
    .toUpperCase();

  const downloadCard = async () => {
    if (!cardRef.current || loading) return;
    setLoading(true);

    try {
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
        className={`w-80 h-48 p-5 rounded-[1.8rem] border relative overflow-hidden shadow-xl
        ${finalGen === 1
          ? "border-blue-600 bg-gradient-to-br from-[#000a1a] to-black"
          : "border-cyan-600 bg-gradient-to-br from-black to-[#001f2a]"}
        `}
      >

        {/* TEXTURE */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

        {/* HEADER */}
        <div className="relative z-10 flex justify-between items-start mb-3">
          <div>
            <p className="text-[7px] text-blue-400 font-black uppercase tracking-widest">
              EAS Secure Division
            </p>
            <h3 className="text-lg font-black tracking-widest">
              GEN {finalGen}
            </h3>
          </div>

          <ShieldCheck className="text-blue-500 opacity-70" size={18} />
        </div>

        {/* BODY */}
        <div className="relative z-10 flex justify-between h-full">

          {/* LEFT */}
          <div className="flex flex-col justify-between">

            <div>
              <p className="text-[7px] text-gray-500">NAME</p>
              <p className="text-sm font-bold truncate w-40">
                {data?.nama || "Unknown"}
              </p>
            </div>

            <div>
              <p className="text-[7px] text-gray-500">MEMBER ID</p>

              {/* 🔥 FIX: BIAR MENONJOL */}
              <p className="text-[11px] font-mono text-blue-400 tracking-wider bg-black/40 px-2 py-1 rounded">
                {memberId}
              </p>
            </div>

          </div>

          {/* RIGHT */}
          <div className="flex flex-col items-center justify-center gap-2">

            <img
              src={qrSrc}
              alt="qr"
              className="w-14 h-14 bg-white p-1 rounded-md border border-gray-300"
              crossOrigin="anonymous"
            />

            <p className="text-[6px] text-green-400 font-bold tracking-widest">
              VERIFIED
            </p>
          </div>
        </div>

        {/* WATERMARK */}
        <ShieldCheck
          className="absolute -bottom-10 -right-10 opacity-5"
          size={160}
        />

        {/* LINE */}
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30" />
      </div>

      <button
        onClick={downloadCard}
        disabled={loading}
        className="mt-5 px-6 py-3 bg-blue-600 rounded-xl text-xs font-bold tracking-widest hover:bg-blue-700 transition-all active:scale-95"
      >
        {loading ? "PROCESSING..." : "DOWNLOAD ID"}
      </button>
    </div>
  );
};

export default IDCard;
