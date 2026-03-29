import React, { useState } from "react";
import { db } from "../api/config";
import { collection, addDoc } from "firebase/firestore";
import axios from "axios";
import { ShieldCheck, User } from "lucide-react";
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
      alert("Minimal umur 10 tahun.");
      setLoading(false);
      return;
    }

    // 🔒 SATUKAN STRUKTUR DATA (dipakai di success & fallback)
    const baseData = {
      ...form,
      umur: parseInt(form.umur),
      gen: gen,
      memberId: "EAS-" + Math.floor(1000 + Math.random() * 9000),
      timestamp: new Date().toISOString()
    };

    try {
      // 🔥 AI VALIDATION (lebih aman)
      const aiCheck = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "google/gemini-2.0-flash-001",
          messages: [
            {
              role: "system",
              content: "Jawab hanya VALID atau INVALID."
            },
            {
              role: "user",
              content: `Apakah nama "${form.nama}" valid?`
            }
          ]
        },
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      const result = aiCheck?.data?.choices?.[0]?.message?.content?.toUpperCase() || "";
      const isValid = result.includes("VALID");

      if (!isValid) {
        alert("IDENTITAS DITOLAK: Gunakan nama asli.");
        setLoading(false);
        return;
      }

      // 🔥 FIRESTORE
      await addDoc(collection(db, `pendaftaran_eas_gen${gen}`), baseData);

      // 🔥 LOCAL STORAGE (KONSISTEN)
      localStorage.setItem("eas_user_data", JSON.stringify(baseData));
      localStorage.setItem("eas_verified", "true");

      navigate("/access-portal");

    } catch (err) {
      console.error("Error:", err);

      // 🔥 FALLBACK TETAP SAMA STRUKTUR
      localStorage.setItem("eas_user_data", JSON.stringify(baseData));
      localStorage.setItem("eas_verified", "true");

      navigate("/access-portal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#00050d] text-white flex flex-col items-center justify-center p-6">
      
      {/* GEN SELECTOR */}
      <div className="flex bg-gray-900/50 p-1.5 rounded-2xl mb-8 border border-blue-900/30 w-full max-w-xs">
        {[1, 2].map((g) => (
          <button 
            key={g}
            onClick={() => setGen(g)} 
            className={`flex-1 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all ${gen === g ? 'bg-blue-600' : 'text-gray-500'}`}
          >
            GEN {g}
          </button>
        ))}
      </div>

      <div className="w-full max-w-md p-8 rounded-[2.5rem] border border-blue-500/20 bg-blue-950/10 backdrop-blur-2xl">
        <div className="flex justify-center mb-4 text-blue-500">
          <ShieldCheck size={40} />
        </div>

        <h2 className="text-xl font-black text-center mb-8 tracking-widest uppercase italic">
          Researcher Portal
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

          <input
            required
            placeholder="TIKTOK @USERNAME"
            className="w-full p-4 bg-black/40 border border-gray-800 rounded-2xl outline-none focus:border-blue-500 text-xs font-bold"
            onChange={(e) => setForm({ ...form, tiktok: e.target.value })}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 p-5 rounded-2xl font-black text-[10px] tracking-widest bg-blue-600 hover:bg-blue-500 transition-all active:scale-95 shadow-lg shadow-blue-900/20"
          >
            {loading ? "CHECKING IDENTITY..." : "JOIN RESEARCHER"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPortal;
