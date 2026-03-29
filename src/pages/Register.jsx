import { useState } from "react";
import { db } from "../api/config";
import { collection, addDoc } from "firebase/firestore";
import axios from "axios";
import { Send, ExternalLink, ShieldCheck } from "lucide-react";

const RegisterPortal = () => {
  const [gen, setGen] = useState(2); 
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nama: "", umur: "", domisili: "", tiktok: "" });

  // Link WhatsApp dari data yang kamu berikan
  const WHATSAPP_LINKS = {
    1: "https://chat.whatsapp.com/DMSABsZCPC77nkFdzphbNH",
    2: "https://chat.whatsapp.com/JuLtO0VsqxDHUSHNrNjQZN"
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    // --- VALIDASI UMUR ---
    if (parseInt(form.umur) < 10) {
      alert("AKSES DITOLAK: Portal EAS minimal 10 tahun sesuai UUD.");
      setLoading(false);
      return;
    }

    try {
      // --- AI NAME CHECK (GEMINI) ---
      // Catatan: Pastikan endpoint /api/check-name sudah terpasang di Vercel/Backend
      const check = await axios.post('/api/check-name', { nama: form.nama });
      
      if (!check.data.valid) {
        alert(`IDENTITAS DITOLAK AI: ${check.data.reason}`);
        setLoading(false);
        return;
      }

      // --- SIMPAN KE FIRESTORE SESUAI GEN ---
      const collectionName = `pendaftaran_eas_gen${gen}`;
      await addDoc(collection(db, collectionName), {
        ...form,
        umur: parseInt(form.umur),
        gen: gen,
        timestamp: new Date().toISOString(),
        status: "pending"
      });

      localStorage.setItem("eas_user", JSON.stringify({ ...form, gen }));
      localStorage.setItem("eas_verified", "false");

      // --- REDIRECT KE GRUP WHATSAPP ---
      alert(`IDENTITAS TERVERIFIKASI! Selamat bergabung di Gen ${gen}. Klik OK untuk masuk ke grup seleksi.`);
      
      // Auto-redirect ke grup WA
      window.location.href = WHATSAPP_LINKS[gen];

    } catch (err) {
      // Jika server AI mati, tetap simpan data agar Admin bisa cek manual
      localStorage.setItem("eas_user", JSON.stringify({ ...form, gen }));
      localStorage.setItem("eas_verified", "false");
      console.error("AI Offline, bypass ke admin mode.");
      alert("Sistem AI sedang sibuk, data dikirim langsung ke Admin. Silakan masuk ke grup.");
      window.location.href = WHATSAPP_LINKS[gen];
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#00050d] text-white p-6 flex flex-col items-center justify-center font-sans">
      
      {/* Selector Gen dengan Animasi Glow */}
      <div className="flex bg-gray-900/50 p-1 rounded-2xl mb-10 border border-blue-900/30 w-full max-w-sm backdrop-blur-md">
        <button 
          onClick={() => setGen(1)} 
          className={`flex-1 py-3 rounded-xl text-xs font-black tracking-widest transition-all duration-500 ${gen === 1 ? 'bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.5)]' : 'text-gray-500 opacity-50'}`}
        >
          GEN 1
        </button>
        <button 
          onClick={() => setGen(2)} 
          className={`flex-1 py-3 rounded-xl text-xs font-black tracking-widest transition-all duration-500 ${gen === 2 ? 'bg-cyan-600 shadow-[0_0_20px_rgba(8,145,178,0.5)]' : 'text-gray-500 opacity-50'}`}
        >
          GEN 2
        </button>
      </div>

      <div className={`w-full max-w-md p-8 rounded-[2.5rem] border-2 transition-all duration-700 ${gen === 1 ? 'border-blue-500/50 bg-blue-950/20 shadow-[0_0_40px_rgba(30,58,138,0.2)]' : 'border-cyan-500/50 bg-cyan-950/10 shadow-[0_0_40px_rgba(8,145,178,0.15)]'} backdrop-blur-2xl`}>
        <div className="flex justify-center mb-4">
            <ShieldCheck className={gen === 1 ? 'text-blue-500' : 'text-cyan-500'} size={40} />
        </div>
        <h2 className="text-xl font-black text-center mb-8 tracking-[0.3em] uppercase italic">
          MEMBER REGISTRATION
        </h2>

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 ml-2 uppercase">Nama Lengkap (Sesuai ID)</label>
            <input required type="text" placeholder="Contoh: M. Fikri Surya Firdaus" value={form.nama} className="w-full p-4 bg-black/40 border border-gray-800 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium" onChange={e => setForm({...form, nama: e.target.value})} />
          </div>

          <div className="flex gap-3">
            <div className="w-1/3 space-y-1">
                <label className="text-[10px] font-bold text-gray-500 ml-2 uppercase">Umur</label>
                <input required type="number" placeholder="10+" value={form.umur} className="w-full p-4 bg-black/40 border border-gray-800 rounded-2xl outline-none focus:border-blue-500" onChange={e => setForm({...form, umur: e.target.value})} />
            </div>
            <div className="w-2/3 space-y-1">
                <label className="text-[10px] font-bold text-gray-500 ml-2 uppercase">Domisili</label>
                <input required type="text" placeholder="Kota / Wilayah" value={form.domisili} className="w-full p-4 bg-black/40 border border-gray-800 rounded-2xl outline-none focus:border-blue-500" onChange={e => setForm({...form, domisili: e.target.value})} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 ml-2 uppercase">Akun TikTok</label>
            <input required type="text" placeholder="@username" value={form.tiktok} className="w-full p-4 bg-black/40 border border-gray-800 rounded-2xl outline-none focus:border-blue-500" onChange={e => setForm({...form, tiktok: e.target.value})} />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className={`w-full mt-4 p-5 rounded-2xl font-black text-xs tracking-widest flex justify-center items-center gap-3 transition-all active:scale-95 ${gen === 1 ? 'bg-blue-600' : 'bg-cyan-600'} ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110 shadow-xl'}`}
          >
            {loading ? (
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    AI ENCRYPTING...
                </div>
            ) : (
                <><Send size={18}/> JOIN SELECTIVE GROUP</>
            )}
          </button>
        </form>
        
        <p className="text-[9px] text-center text-gray-600 mt-8 uppercase tracking-widest">
            Identity Protection System v3.0 • EAS Education
        </p>
      </div>
    </div>
  );
};

export default RegisterPortal;
