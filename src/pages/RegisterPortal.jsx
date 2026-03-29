import React, { useState } from "react";
import { db } from "../api/config";
import { collection, addDoc } from "firebase/firestore";
import { ShieldCheck, Send, User, MapPin, Calendar, Link } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RegisterPortal = () => {
  const [gen, setGen] = useState(2);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nama: "", umur: "", domisili: "", tiktok: "" });

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(false);

    // VALIDASI NAMA MANUAL (Bukan AI)
    if (form.nama.length < 3) {
      alert("NAMA TERLALU PENDEK: Masukkan nama asli yang benar.");
      return;
    }

    // VALIDASI LINK TIKTOK
    if (!form.tiktok.includes("tiktok.com")) {
      alert("LINK TIKTOK SALAH: Pastikan memasukkan URL TikTok yang benar.");
      return;
    }

    setLoading(true);

    try {
      const userData = {
        ...form,
        umur: parseInt(form.umur),
        gen: gen,
        memberId: "EAS-" + Math.floor(1000 + Math.random() * 9000),
        timestamp: new Date().toISOString(),
        status: "pending" // Default pending untuk dicek Admin nanti
      };

      // Simpan ke Firestore
      await addDoc(collection(db, `pendaftaran_eas_gen${gen}`), userData);

      // Simpan ke Local Storage
      localStorage.setItem("eas_user_data", JSON.stringify(userData));
      localStorage.setItem("eas_verified", "true");

      navigate("/access-portal");
    } catch (err) {
      console.error("Error:", err);
      alert("Gagal mendaftar. Cek koneksi internet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#00050d] text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md p-8 rounded-[2.5rem] border border-blue-500/20 bg-blue-950/10 backdrop-blur-2xl">
        <div className="flex justify-center mb-4 text-blue-500"><ShieldCheck size={40} /></div>
        <h2 className="text-xl font-black text-center mb-8 tracking-widest uppercase italic font-sans">EAS Register</h2>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-4 text-gray-600" size={18} />
            <input required placeholder="NAMA LENGKAP" className="w-full p-4 pl-12 bg-black/40 border border-gray-800 rounded-2xl outline-none focus:border-blue-500 text-xs font-bold" onChange={e => setForm({...form, nama: e.target.value})} />
          </div>

          <div className="flex gap-3">
            <input required type="number" placeholder="UMUR" className="w-1/3 p-4 bg-black/40 border border-gray-800 rounded-2xl outline-none focus:border-blue-500 text-xs font-bold" onChange={e => setForm({...form, umur: e.target.value})} />
            <input required placeholder="DOMISILI" className="w-2/3 p-4 bg-black/40 border border-gray-800 rounded-2xl outline-none focus:border-blue-500 text-xs font-bold" onChange={e => setForm({...form, domisili: e.target.value})} />
          </div>

          <div className="relative">
            <Link className="absolute left-4 top-4 text-gray-600" size={18} />
            <input required placeholder="LINK PROFIL TIKTOK" className="w-full p-4 pl-12 bg-black/40 border border-gray-800 rounded-2xl outline-none focus:border-blue-500 text-xs font-bold" onChange={e => setForm({...form, tiktok: e.target.value})} />
          </div>

          <button type="submit" disabled={loading} className="w-full mt-4 p-5 rounded-2xl font-black text-[10px] tracking-widest bg-blue-600 hover:bg-blue-500 transition-all shadow-lg">
            {loading ? "SAVING..." : "REGISTER NOW"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPortal;
