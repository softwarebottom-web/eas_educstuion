import React, { useState } from "react";
import { db, auth } from "../api/config";
import { doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import QRCode from "qrcode";
import { motion } from "framer-motion";

const DOMISILI = [
  "Aceh","Sumatera Utara","Sumatera Barat","Riau","Jambi","Sumatera Selatan",
  "Bengkulu","Lampung","Kepulauan Bangka Belitung","Kepulauan Riau",
  "DKI Jakarta","Jawa Barat","Jawa Tengah","DI Yogyakarta","Jawa Timur","Banten",
  "Bali","Nusa Tenggara Barat","Nusa Tenggara Timur",
  "Kalimantan Barat","Kalimantan Tengah","Kalimantan Selatan","Kalimantan Timur","Kalimantan Utara",
  "Sulawesi Utara","Sulawesi Tengah","Sulawesi Selatan","Sulawesi Tenggara","Gorontalo","Sulawesi Barat",
  "Maluku","Maluku Utara","Papua","Papua Barat","Papua Selatan","Papua Tengah","Papua Pegunungan"
];

const RegisterPortal = () => {
  const [gen, setGen] = useState(2);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nama: "", email: "", password: "", dob: "", domisili: "", tiktok: ""
  });

  const navigate = useNavigate();

  const getAge = (dob) => {
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const validate = () => {
    if (form.nama.trim().length < 3) return "Nama minimal 3 huruf";
    if (!/\S+@\S+\.\S+/.test(form.email)) return "Email tidak valid";
    if (form.password.length < 6) return "Password minimal 6 karakter";
    if (!form.dob) return "Tanggal lahir wajib";
    if (!form.domisili) return "Pilih domisili";
    if (!form.tiktok.toLowerCase().includes("tiktok")) return "Link TikTok tidak valid";
    if (getAge(form.dob) < 10) return "Minimal umur 10 tahun";
    return null;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (loading) return;

    const errorMsg = validate();
    if (errorMsg) return alert(errorMsg);

    setLoading(true);

    try {
      const email = form.email.toLowerCase().trim();

      const cred = await createUserWithEmailAndPassword(auth, email, form.password);
      const uid = cred.user.uid;

      const memberId = `EAS-${gen}-${Date.now().toString().slice(-6)}`;
      const qrValue = `EAS|${memberId}`;
      const qrImage = await QRCode.toDataURL(qrValue);
      const umur = getAge(form.dob);

      const userDoc = {
        public: {
          nama: form.nama,
          umur,
          dob: form.dob,
          domisili: form.domisili,
          tiktok: form.tiktok,
          memberId,
          gen,
          role: "member"
        },
        private: { email },
        system: {
          createdAt: new Date().toISOString(),
          verified: false,
          banned: false
        },
        meta: { qrValue, qrImage }
      };

      await setDoc(doc(db, "users", uid), userDoc);

      localStorage.setItem("eas_user_data", JSON.stringify({ id: uid, ...userDoc.public }));
      localStorage.setItem("eas_verified", "false");

      await new Promise((res) => setTimeout(res, 300));
      navigate("/access-portal", { replace: true });

    } catch (err) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        alert("Email sudah terdaftar, silakan login");
      } else {
        alert("Error: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-black to-[#020617] flex items-center justify-center p-6 text-white">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl"
      >
        <div className="text-center mb-6">
          <h2 className="text-xl font-black text-blue-400 tracking-widest">EAS REGISTER</h2>
          <p className="text-xs text-gray-500">Secure Digital Identity System</p>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-6">
          {[1, 2].map((g) => (
            <motion.button
              key={g}
              type="button"
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => setGen(g)}
              className={`p-3 rounded-xl text-xs font-bold transition
                ${gen === g
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-900 text-gray-400 hover:bg-gray-800"}`}
            >
              GEN {g}
            </motion.button>
          ))}
        </div>

        <form onSubmit={handleRegister} className="space-y-3">

          <Input placeholder="Nama lengkap" value={form.nama} onChange={(v) => setForm({ ...form, nama: v })} />
          <Input placeholder="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <Input placeholder="Password (min 6 karakter)" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} />

          <input
            type="date"
            value={form.dob}
            onChange={(e) => setForm({ ...form, dob: e.target.value })}
            className="w-full p-3 bg-black/40 border border-gray-800 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none text-gray-300"
          />

          {form.dob && (
            <p className="text-xs text-gray-500 text-center">
              Umur: <span className="text-blue-400 font-bold">{getAge(form.dob)} tahun</span>
            </p>
          )}

          <select
            value={form.domisili}
            onChange={(e) => setForm({ ...form, domisili: e.target.value })}
            className="w-full p-3 bg-black/40 border border-gray-800 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none text-gray-300"
          >
            <option value="">Pilih Provinsi</option>
            {DOMISILI.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>

          <Input placeholder="Link TikTok (tiktok.com/@...)" value={form.tiktok} onChange={(v) => setForm({ ...form, tiktok: v })} />

          <motion.button
            type="submit"
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            disabled={loading}
            className="w-full p-4 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-sm shadow-lg transition disabled:bg-gray-700 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Register"}
          </motion.button>

        </form>

        <button
          type="button"
          onClick={() => navigate("/login")}
          className="w-full mt-4 text-xs text-blue-400 hover:underline"
        >
          Sudah punya akun? Login →
        </button>

      </motion.div>
    </div>
  );
};

const Input = ({ placeholder, value, onChange, type = "text" }) => (
  <input
    type={type}
    value={value}
    placeholder={placeholder}
    onChange={(e) => onChange(e.target.value)}
    className="w-full p-3 bg-black/40 border border-gray-800 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none transition text-gray-300 placeholder-gray-600"
  />
);

export default RegisterPortal;
