import React, { useState } from "react";
import { db } from "../api/config";
import { collection, addDoc } from "firebase/firestore";
import axios from "axios";
import { ShieldCheck, Send, User, MapPin, Calendar, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RegisterPortal = () => {
  const [gen, setGen] = useState(2);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nama: "", umur: "", domisili: "", tiktok: "" });

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (parseInt(form.umur) < 10) {
      alert("Akses Ditolak: Minimal umur 10 tahun sesuai konstitusi.");
      setLoading(false);
      return;
    }

    try {
      // Panggil OpenRouter untuk Validasi Nama
      const aiCheck = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "google/gemini-2.0-flash-001",
          messages: [
            {
              role: "system",
              content: "Kamu adalah validator identitas. Jawab hanya 'VALID' jika nama orang wajar, atau 'INVALID' jika asal-asalan."
            },
            {
              role: "user",
              content: `Apakah nama "${form.nama}" valid?`
            }
          ]
        },
        {
          headers: {
            "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      const isValid = aiCheck.data.choices[0].message.content.includes("VALID");

      if (!isValid) {
        alert("IDENTITAS DITOLAK AI: Gunakan nama asli yang profesional.");
        setLoading(false);
        return;
      }

      const userData = {
        ...form,
        umur: parseInt(form.umur),
        gen: gen,
        memberId: "EAS-" + Math.floor(1000 + Math.random() * 9000),
        timestamp: new Date().toISOString(),
        status: "verified"
      };

      // Simpan ke Firestore
      await addDoc(collection(db, `pendaftaran_eas_gen${gen}`), userData);

      // Simpan ke Local Storage untuk ID Card di AccessPortal
      localStorage.setItem("eas_user_data", JSON.stringify(userData));
      localStorage.setItem("eas_verified", "true");

      alert("Identitas Terverifikasi! Mengalihkan ke Portal ID Card...");
      navigate("/access-portal");

    } catch (err) {
      console.error("System Error:", err);
      alert("Sistem sibuk, mencoba bypass ke pendaftaran manual.");
      // Fallback tetap bisa daftar kalau API error
      localStorage.setItem("eas_user_data", JSON.stringify({...form, gen}));
      navigate("/access-portal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#00050d] text-white flex flex-col items-center justify-center p-6 font-sans">
      
      {/* GEN SELECTOR */}
      <div className="flex bg-gray-900/50 p-1.5 rounded-2xl mb-8 border border-blue-900/30 w-full max-w-xs backdrop-blur-md">
        <button 
          onClick={() => setGen(1)} 
          className={`flex-1 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all ${gen === 1 ? 'bg-blue-600 shadow-lg shadow-blue-500/20' : 'text-gray-500'}`}
        >
          GEN 1
        </button>
        <button 
          onClick={() => setGen(2)} 
          className={`flex-1 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all ${gen === 2 ? 'bg-cyan-600 shadow-lg shadow-cyan-500/20' : 'text-gray-500'}`}
        >
          GEN 2
        </button>
      </div>

      {/* REGISTRATION CARD */}
      <div className="w-full max-w-md p-8 rounded-[2.5rem] border border-blue-500/20 bg-blue-950/10 backdrop-blur-2xl shadow-2xl">
        <div className="flex justify-center mb-4 text-blue-500">
          <ShieldCheck size={40} />
        </div>
        <h2 className="text-xl font-black text-center mb-8 tracking-[0.2em] uppercase italic">
          Researcher Portal
        </h2>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-4 text-gray-600" size={18} />
            <input required placeholder="NAMA LENGKAP" className="w-full p-4 pl-12 bg-black/40 border border-gray-800 rounded-2xl outline-none focus:border-blue-500 transition-all text-xs font-bold" onChange={e => setForm({...form, nama: e.target.value})} />
          </div>

          <div className="flex gap-3">
            <div className="w-1/3 relative">
              <Calendar className="absolute left-4 top-4 text-gray-600" size={16} />
              <input required type="number" placeholder="UMUR" className="w-full p-4 pl-10 bg-black/40 border border-gray-800 rounded-2xl outline-none focus:border-blue-500 text-xs font-bold" onChange={e => setForm({...form, umur: e.target.value})} />
            </div>
            <div className="w-2/3 relative">
              <MapPin className="absolute left-4 top-4 text-gray-600" size={16} />
              <input required placeholder="DOMISILI" className="w-full p-4 pl-10 bg-black/40 border border-gray-800 rounded-2xl outline-none focus:border-blue-500 text-xs font-bold" onChange={e => setForm({...form, domisili: e.target.value})} />
            </div>
          </div>

          <div className="relative">
            <Smartphone className="absolute left-4 top-4 text-gray-600" size={18} />
            <input required placeholder="TIKTOK @USERNAME" className="w-full p-4 pl-12 bg-black/40 border border-gray-800 rounded-2xl outline-none focus:border-blue-500 text-xs font-bold" onChange={e => setForm({...form, tiktok: e.target.value})} />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className={`w-full mt-4 p-5 rounded-2xl font-black text-[10px] tracking-widest flex justify-center items-center gap-3 transition-all active:scale-95 ${gen === 1 ? 'bg-blue-600' : 'bg-cyan-600'} ${loading ? 'opacity-50' : 'hover:brightness-110 shadow-xl'}`}
          >
            {loading ? "PROCESSING..." : <><Send size={16}/> JOIN RESEARCHER</>}
          </button>
        </form>
      </div>

      <p className="text-[9px] text-gray-600 mt-10 tracking-[0.5em] uppercase font-bold">
        Secure Identity System v3.0 • EAS
      </p>
    </div>
  );
};

export default RegisterPortal;
