import React, { useState, useEffect } from "react";
import { db, supabaseMedia, auth } from "../api/config";
import { collection, addDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { UploadCloud } from "lucide-react";
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
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);

  const [form, setForm] = useState({
    nama: "",
    email: "",
    dob: "",
    domisili: "",
    tiktok: ""
  });

  const navigate = useNavigate();

  useEffect(() => {
    return () => preview && URL.revokeObjectURL(preview);
  }, [preview]);

  const getAge = (dob) => {
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const validate = () => {
    if (!photo) return "Upload foto dulu";
    if (form.nama.trim().length < 3) return "Nama minimal 3 huruf";

    const email = form.email.toLowerCase().trim();
    if (!/\S+@\S+\.\S+/.test(email)) return "Email tidak valid";

    if (!form.dob) return "Tanggal lahir wajib";
    if (!form.domisili) return "Pilih domisili";

    if (!form.tiktok.toLowerCase().includes("tiktok"))
      return "Link TikTok tidak valid";

    if (getAge(form.dob) < 10) return "Minimal umur 10 tahun";

    return null;
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/"))
      return alert("File harus gambar");

    if (file.size > 2 * 1024 * 1024)
      return alert("Max 2MB");

    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (loading) return;

    const errorMsg = validate();
    if (errorMsg) return alert(errorMsg);

    setLoading(true);

    try {
      const email = form.email.toLowerCase().trim();
      const password = "EAS_DEFAULT_PASSWORD";

      // 🔐 CREATE AUTH USER
      await createUserWithEmailAndPassword(auth, email, password);

      // 📸 UPLOAD FOTO
      const fileName = `gen${gen}_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2)}.jpg`;

      const { error } = await supabaseMedia.storage
        .from("eas-idcard")
        .upload(fileName, photo);

      if (error) throw error;

      const { data } = supabaseMedia.storage
        .from("eas-idcard")
        .getPublicUrl(fileName);

      // 🔐 GENERATE ID
      const memberId = `EAS-${gen}-${Date.now().toString().slice(-6)}`;
      const qrValue = `EAS|${memberId}`;
      const qrImage = await QRCode.toDataURL(qrValue);

      const umur = getAge(form.dob);

      // 🔥 FIRESTORE
      const userDoc = {
        public: {
          nama: form.nama,
          umur,
          dob: form.dob,
          domisili: form.domisili,
          tiktok: form.tiktok,
          photo: data.publicUrl,
          memberId,
          gen,
          role: "member"
        },
        private: {
          email
        },
        system: {
          createdAt: new Date().toISOString(),
          verified: false,
          banned: false
        },
        meta: {
          qrValue,
          qrImage
        }
      };

      const ref = await addDoc(collection(db, "users"), userDoc);

      // 🔐 LOCAL SESSION
      localStorage.setItem(
        "eas_user_data",
        JSON.stringify({
          id: ref.id,
          ...userDoc.public
        })
      );

      localStorage.setItem("eas_verified", "false");

      // 🚀 REDIRECT LANGSUNG
      navigate("/access-portal", { replace: true });

    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00050d] to-[#020617] flex items-center justify-center p-6 text-white">

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]"
      >

        <h2 className="text-center text-xl font-black text-blue-400 mb-6 tracking-wide">
          EAS REGISTER
        </h2>

        {/* GEN */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          {[1, 2].map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGen(g)}
              className={`p-3 rounded-xl text-xs font-bold transition
              ${
                gen === g
                  ? "bg-blue-600 text-white"
                  : "bg-gray-900 text-gray-400"
              }`}
            >
              GEN {g}
            </button>
          ))}
        </div>

        <form onSubmit={handleRegister} className="space-y-4">

          {/* FOTO */}
          <label className="flex justify-center cursor-pointer">
            {preview ? (
              <img src={preview} className="w-24 h-24 rounded-full object-cover border border-blue-500"/>
            ) : (
              <div className="w-24 h-24 border border-dashed flex items-center justify-center rounded-full hover:border-blue-500 transition">
                <UploadCloud size={20}/>
              </div>
            )}
            <input type="file" hidden onChange={handlePhoto}/>
          </label>

          <Input placeholder="Nama" value={form.nama} onChange={(v)=>setForm({...form,nama:v})}/>
          <Input placeholder="Email" value={form.email} onChange={(v)=>setForm({...form,email:v})}/>

          <input
            type="date"
            value={form.dob}
            className="input"
            onChange={(e)=>setForm({...form,dob:e.target.value})}
          />

          {form.dob && (
            <p className="text-xs text-gray-400">
              Umur: {getAge(form.dob)} tahun
            </p>
          )}

          <select
            value={form.domisili}
            onChange={(e)=>setForm({...form, domisili: e.target.value})}
            className="input"
          >
            <option value="">Pilih Provinsi</option>
            {DOMISILI.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <Input placeholder="Link TikTok" value={form.tiktok} onChange={(v)=>setForm({...form,tiktok:v})}/>

          <button
            disabled={loading}
            className="btn"
          >
            {loading ? "Processing..." : "Register"}
          </button>

        </form>

        <button
          onClick={() => navigate("/login")}
          className="w-full mt-4 text-xs text-blue-400 hover:underline"
        >
          Sudah punya akun? Login →
        </button>

      </motion.div>
    </div>
  );
};

const Input = ({ placeholder, value, onChange }) => (
  <input
    value={value}
    placeholder={placeholder}
    onChange={(e)=>onChange(e.target.value)}
    className="input"
  />
);

export default RegisterPortal;
