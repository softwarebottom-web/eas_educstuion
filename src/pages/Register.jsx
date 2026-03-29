import React, { useState } from "react"; // Fix: React is not defined
import { db } from "../api/config";
import { collection, addDoc } from "firebase/firestore";
import axios from "axios";
import { Send, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RegisterPortal = () => {
  const [gen, setGen] = useState(2); 
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nama: "", umur: "", domisili: "", tiktok: "" });
  const navigate = useNavigate();

  const WHATSAPP_LINKS = {
    1: "https://chat.whatsapp.com/DMSABsZCPC77nkFdzphbNH",
    2: "https://chat.whatsapp.com/JuLtO0VsqxDHUSHNrNjQZN"
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (parseInt(form.umur) < 10) {
      alert("AKSES DITOLAK: Portal EAS minimal 10 tahun.");
      setLoading(false);
      return;
    }

    try {
      // --- OPENROUTER NAME CHECK ---
      // Kita panggil OpenRouter buat cek apakah namanya "pantas" buat researcher
      const aiCheck = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
        model: "google/gemini-2.0-flash-001",
        messages: [{ role: "user", content: `Apakah nama "${form.nama}" adalah nama orang yang wajar? Jawab hanya 'VALID' atau 'INVALID'.` }]
      }, {
        headers: { "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_KEY}` }
      });

      const isAiValid = aiCheck.data.choices[0].message.content.includes("VALID");
      
      if (!isAiValid) {
        alert("IDENTITAS DITOLAK AI: Gunakan nama asli yang profesional.");
        setLoading(false);
        return;
      }

      // --- SIMPAN KE FIRESTORE ---
      const userData = {
        ...form,
        umur: parseInt(form.umur),
        gen: gen,
        timestamp: new Date().toISOString(),
        status: "verified"
      };
      
      await addDoc(collection(db, `pendaftaran_eas_gen${gen}`), userData);

      // --- FIX ID CARD: Simpan ke LocalStorage agar halaman AccessPortal bisa baca ---
      localStorage.setItem("eas_user_data", JSON.stringify(userData));
      localStorage.setItem("eas_verified", "true");

      alert(`IDENTITAS TERVERIFIKASI! Klik OK untuk generate ID Card kamu.`);
      
      // JANGAN langsung ke WA. Lempar ke Access Portal dulu buat download ID Card
      navigate("/access-portal"); 

    } catch (err) {
      console.error("AI Error:", err);
      // Fallback: Tetap simpan data biar user gak rugi input
      localStorage.setItem("eas_user_data", JSON.stringify({ ...form, gen }));
      localStorage.setItem("eas_verified", "true");
      navigate("/access-portal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#00050d] text-white p-6 flex flex-col items-center justify-center">
      {/* Selector Gen */}
      <div className="flex bg-gray-900/50 p-1 rounded-2xl mb-10 border border-blue-900/30 w-full max-w-sm">
        <button onClick={() => setGen(1)} className={`flex-1 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all ${gen === 1 ? 'bg-blue-600' : 'text-gray-500'}`}>GEN 1</button>
        <button onClick={() => setGen(2)} className={`flex-1 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all ${gen === 2 ? 'bg-cyan-600' : 'text-gray-500'}`}>GEN 2</button>
      </div>

      <div className={`w-full max-w-md p-8 rounded-[2.5rem] border-2 backdrop-blur-2xl transition-all ${gen === 1 ? 'border-blue-500/50 bg-blue-950/20' : 'border-cyan-500/50 bg-cyan-950/10'}`}>
        <div className="flex justify-center mb-4">
            <ShieldCheck className={gen === 1 ? 'text-blue-500' : 'text-cyan-500'} size={40} />
        </div>
        <h2 className="text-xl font-black text-center mb-8 tracking-[0.2em] uppercase">EAS REGISTRATION</h2>

        <form onSubmit={handleRegister} className="space-y-4">
          <input required type="text" placeholder="Nama Lengkap" className="w-full p-4 bg-black/40 border border-gray-800 rounded-2xl outline-none" onChange={e => setForm({...form, nama: e.target.value})} />
          <div className="flex gap-3">
            <input required type="number" placeholder="Umur" className="w-1/3 p-4 bg-black/40 border border-gray-800 rounded-2xl outline-none" onChange={e => setForm({...form, umur: e.target.value})} />
            <input required type="text" placeholder="Domisili" className="w-2/3 p-4 bg-black/40 border border-gray-800 rounded-2xl outline-none" onChange={e => setForm({...form, domisili: e.target.value})} />
          </div>
          <input required type="text" placeholder="TikTok @username" className="w-full p-4 bg-black/40 border border-gray-800 rounded-2xl outline-none" onChange={e => setForm({...form, tiktok: e.target.value})} />

          <button type="submit" disabled={loading} className={`w-full mt-4 p-5 rounded-2xl font-black text-[10px] tracking-widest flex justify-center items-center gap-3 transition-all ${gen === 1 ? 'bg-blue-600' : 'bg-cyan-600'} ${loading ? 'opacity-50' : 'hover:scale-105'}`}>
            {loading ? "ENCRYPTING..." : "JOIN RESEARCHER GROUP"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPortal;
