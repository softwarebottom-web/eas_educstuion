import React, { useState, useEffect } from "react"; // Fix: React is not defined
import { useNavigate } from "react-router-dom";
import { Lock, Search, Download } from "lucide-react";
import IDCard from "../components/IDCard";

const AccessPortal = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Ambil data yang baru disimpan pas registrasi tadi
    const saved = localStorage.getItem("eas_user_data");
    if (saved) {
      setUserData(JSON.parse(saved));
    }
  }, []);

  const handleUploadID = (e) => {
    setChecking(true);
    const file = e.target.files[0];
    
    // Simulasi Scanning ID Card
    setTimeout(() => {
      if (file) {
        localStorage.setItem("eas_verified", "true");
        alert("ID VALID: Akses Laboratorium Terbuka!");
        navigate("/");
      }
      setChecking(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#00050d] text-white flex flex-col items-center justify-center p-6 gap-8">
      
      {/* JIKA USER BARU DAFTAR: Tampilkan Kartu buat di-Download */}
      {userData && (
        <div className="flex flex-col items-center animate-in fade-in zoom-in duration-700">
          <h1 className="text-[10px] font-black tracking-[0.4em] text-blue-500 mb-6 uppercase">
            Researcher Identity Generated
          </h1>
          <IDCard data={userData} gen={userData.gen || 1} />
          
          <p className="mt-6 text-[9px] text-gray-500 max-w-[250px] text-center leading-relaxed uppercase tracking-widest">
            Simpan ID Card di atas. Gunakan saat sistem meminta verifikasi akses masuk.
          </p>
        </div>
      )}

      {/* JIKA MAU VERIFIKASI AKSES (UPLOAD) */}
      <div className="w-full max-w-sm p-8 border border-dashed border-blue-900/30 rounded-[2.5rem] bg-black/40 backdrop-blur-md text-center">
        <div className="bg-blue-950/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
          {checking ? <Search className="animate-spin text-blue-400" /> : <Lock className="text-gray-600" />}
        </div>
        
        <h2 className="text-lg font-black mb-2 tracking-tighter italic">RESTRICTED AREA</h2>
        <p className="text-[10px] text-gray-500 mb-8 px-4 uppercase tracking-tighter">
          Upload ID Card EAS untuk memverifikasi hak akses Quiz & Library.
        </p>

        <label className="block w-full bg-blue-600 py-4 rounded-2xl font-black text-[10px] tracking-widest cursor-pointer hover:bg-blue-500 transition-all active:scale-95 shadow-lg shadow-blue-900/20">
          {checking ? "ENCRYPTING DATA..." : "UPLOAD ID CARD"}
          <input type="file" className="hidden" accept="image/*" onChange={handleUploadID} />
        </label>
      </div>

      {userData && (
        <button 
          onClick={() => navigate("/")}
          className="text-[9px] font-bold text-gray-600 hover:text-blue-400 transition-colors tracking-[0.2em] uppercase"
        >
          Skip to Dashboard →
        </button>
      )}
    </div>
  );
};

export default AccessPortal;
