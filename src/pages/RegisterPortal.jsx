import React, { useState } from "react";
import { db } from "../api/config";
import { collection, addDoc } from "firebase/firestore";
import { ShieldCheck, User, Link as LinkIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RegisterPortal = () => {
  const [gen, setGen] = useState(2);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nama: "",
    umur: "",
    domisili: "",
    tiktok: ""
  });

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    // 🔒 VALIDASI LEBIH AMAN
    if (!form.nama || form.nama.trim().length < 3) {
      alert("Nama terlalu pendek.");
      return;
    }

    const umurNum = parseInt(form.umur);
    if (isNaN(umurNum) || umurNum < 10) {
      alert("Umur minimal 10 tahun.");
      return;
    }

    // validasi link tiktok (lebih fleksibel)
    if (!form.tiktok.toLowerCase().includes("tiktok")) {
      alert("Masukkan link TikTok yang valid.");
      return;
    }

    setLoading(true);

    // 🔥 DATA UTAMA (dipakai di semua kondisi)
    const userData = {
      nama: form.nama.trim(),
      umur: umurNum,
      domisili: form.domisili.trim(),
      tiktok: form.tiktok.trim(),
      gen: gen,
      memberId: "EAS-" + Math.floor(1000 + Math.random() * 9000),
      timestamp: new Date().toISOString()
    };

    try {
      // 🔥 SIMPAN FIRESTORE
      await addDoc(collection(db, `pendaftaran_eas_gen${gen}`), userData);

      // 🔥 SIMPAN LOCAL (WAJIB)
      localStorage.setItem("eas_user_data", JSON.stringify(userData));
      localStorage.setItem("eas_verified", "false");

      navigate("/access-portal");

    } catch (err) {
      console.error("Firestore Error:", err);

      // 🔥 FALLBACK (BIAR USER TETAP LANJUT)
      localStorage.setItem("eas_user_data", JSON.stringify(userData));
      localStorage.setItem("eas_verified", "false");

      alert("Mode offline: data tetap disimpan di device.");

      navigate("/access-portal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#00050d] text-white flex flex-col items-center justify-center p-6 font-sans">
      
      {/* GEN SELECTOR */}
      <div className="flex bg-gray-900/50 p-1.5 rounded-2xl mb-8 border border-blue-900/30 w-full max-w-xs">
        <button 
          onClick={() => setGen(1)} 
          className={`flex-1 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all ${gen === 1 ? 'bg-blue-600 shadow-lg' : 'text-gray-500'}`}
        >
          GEN 1
        </button>
        <button 
          onClick={() => setGen(2)} 
          className={`flex-1 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all ${gen === 2 ? 'bg-cyan-600 shadow-lg' : 'text-gray-500'}`}
        >
          GEN 2
        </button>
      </div>

      <div className="w-full max-w-md p-8 rounded-[2.5rem] border border-blue-500/20 bg-blue-950/10 backdrop-blur-2xl">
        <div className="flex justify-center mb-4 text-blue-500">
          <ShieldCheck size={40} />
        </div>

        <h2 className="text-xl font-black text-center mb-8 tracking-widest uppercase italic">
          EAS REGISTER
        </h2>

        <form onSubmit={handleRegister} className="space-y-4">
          
          <div className="relative">
            <User className="absolute left-4 top-4 text-gray-600" size={18} />
            <input
              required
              placeholder="NAMA LENGKAP"
              className="w-full p-4 pl-12 bg-black/40 border border-gray-800 rounded-2xl outline-none focus:border-blue-500 text-xs font-bold"
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
            />
          </div>

          <div className="flex gap-3">
            <input
              required
              type="number"
              placeholder="UMUR"
              className="w-1/3 p-4 bg-black/40 border border-gray-800 rounded-2xl outline-none focus:border-blue-500 text-xs font-bold"
              onChange={(e) => setForm({ ...form, umur: e.target.value })}
            />
            <input
              required
              placeholder="DOMISILI"
              className="w-2/3 p-4 bg-black/40 border border-gray-800 rounded-2xl outline-none focus:border-blue-500 text-xs font-bold"
              onChange={(e) => setForm({ ...form, domisili: e.target.value })}
            />
          </div>

          <div className="relative">
            <LinkIcon className="absolute left-4 top-4 text-gray-600" size={18} />
            <input
              required
              placeholder="LINK PROFIL TIKTOK"
              className="w-full p-4 pl-12 bg-black/40 border border-gray-800 rounded-2xl outline-none focus:border-blue-500 text-xs font-bold"
              onChange={(e) => setForm({ ...form, tiktok: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 p-5 rounded-2xl font-black text-[10px] tracking-[0.3em] bg-blue-600 hover:bg-blue-500 transition-all uppercase shadow-xl shadow-blue-900/20"
          >
            {loading ? "SAVING DATA..." : "REGISTER NOW"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPortal;
