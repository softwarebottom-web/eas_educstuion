import React, { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import { Download, ShieldCheck } from "lucide-react";
import { db } from "../api/config";
import { doc, getDoc } from "firebase/firestore";

const IDCard = () => {
  const cardRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [user, setUser] = useState(null);

  // 🔥 FETCH DATA ASLI DARI FIRESTORE
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const docId = localStorage.getItem("eas_doc_id");
        const gen = localStorage.getItem("eas_gen");

        if (!docId || !gen) {
          setLoading(false);
          return;
        }

        const ref = doc(db, `pendaftaran_eas_gen${gen}`, docId);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          setLoading(false);
          return;
        }

        setUser(snap.data());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // 🔥 LOADING
  if (loading) {
    return <div className="text-white text-xs">Loading ID...</div>;
  }

  // 🔥 VALIDASI
  if (!user?.memberId || !user?.signature || !user?.photo) {
    return (
      <div className="text-red-500 text-xs">
        DATA TIDAK VALID (DATABASE ERROR)
      </div>
    );
  }

  const finalGen = user.gen;
  const memberId = user.memberId;
  const signature = user.signature;

  const qrValue = `EAS|${memberId}|${signature}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(qrValue)}`;

  const downloadCard = async () => {
    if (!cardRef.current || downloading) return;
    setDownloading(true);

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#00050d",
        scale: 3,
        useCORS: true,
      });

      const link = document.createElement("a");
      link.download = `EAS_ID_${memberId}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">

      <div
        ref={cardRef}
        className={`w-80 h-52 p-4 rounded-[1.8rem] border relative overflow-hidden shadow-xl
        ${finalGen === 1
          ? "border-blue-600 bg-gradient-to-br from-[#000a1a] to-black"
          : "border-cyan-600 bg-gradient-to-br from-black to-[#001f2a]"}
        `}
      >

        {/* HEADER */}
        <div className="flex justify-between mb-3">
          <div>
            <p className="text-[7px] text-blue-400 font-black">
              EAS Secure Division
            </p>
            <h3 className="text-lg font-black">GEN {finalGen}</h3>
          </div>
          <ShieldCheck size={18} className="text-blue-500" />
        </div>

        {/* BODY */}
        <div className="flex gap-3">

          {/* FOTO */}
          <img
            src={user.photo}
            className="w-16 h-20 object-cover rounded border"
          />

          {/* INFO */}
          <div className="flex flex-col justify-between">

            <div>
              <p className="text-[7px] text-gray-500">NAME</p>
              <p className="text-sm font-bold">{user.nama}</p>
            </div>

            <div>
              <p className="text-[7px] text-gray-500">DOMISILI</p>
              <p className="text-[9px]">{user.domisili}</p>
            </div>

            <div>
              <p className="text-[7px] text-gray-500">MEMBER ID</p>
              <p className="text-[11px] font-mono text-blue-400">
                {memberId}
              </p>
            </div>

          </div>

          {/* QR */}
          <img src={qrSrc} className="w-14 h-14 bg-white p-1 rounded" />
        </div>
      </div>

      <button
        onClick={downloadCard}
        className="mt-5 px-6 py-3 bg-blue-600 rounded-xl text-xs font-bold"
      >
        {downloading ? "PROCESSING..." : "DOWNLOAD ID"}
      </button>
    </div>
  );
};

export default IDCard;
