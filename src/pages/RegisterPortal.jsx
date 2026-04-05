import React, { useState, useEffect } from "react";
import { db, supabaseMedia } from "../api/config";
import { collection, addDoc } from "firebase/firestore";
import { UploadCloud, User, Mail, Link as LinkIcon } from "lucide-react";
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
    const diff = Date.now() - birth.getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970);
  };

  const validate = () => {
    if (!photo) return "Upload foto dulu";
    if (form.nama.trim().length < 3) return "Nama minimal 3 huruf";
    if (!/\S+@\S+\.\S+/.test(form.email)) return "Email tidak valid";
    if (!form.dob) return "Tanggal lahir wajib";
    if (!DOMISILI.includes(form.domisili)) return "Pilih domisili valid";
    if (!form.tiktok.toLowerCase().includes("tiktok")) return "Link TikTok tidak valid";

    const umur = getAge(form.dob);
    if (umur < 10) return "Minimal umur 10 tahun";

    return null;
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) return alert("File harus gambar");
    if (file.size > 2 * 1024 * 1024) return alert("Max 2MB");

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
      // 🔥 Upload foto
      const fileName = `gen${gen}_${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;

      const { error } = await supabaseMedia.storage
        .from("eas-idcard")
        .upload(fileName, photo);

      if (error) throw error;

      const { data } = supabaseMedia.storage
        .from("eas-idcard")
        .getPublicUrl(fileName);

      // 🔐 Generate ID + QR
      const memberId = `EAS-${gen}-${Date.now().toString().slice(-6)}`;
      const qrValue = `EAS|${memberId}`;
      const qrImage = await QRCode.toDataURL(qrValue);

      const umur = getAge(form.dob);

      // 🔥 FIRESTORE STRUCTURE
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
          email: form.email
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

      // 🔐 LOCAL SAFE DATA
      const safeUser = {
        id: ref.id,
        nama: userDoc.public.nama,
        gen: userDoc.public.gen,
        memberId: userDoc.public.memberId,
        domisili: userDoc.public.domisili,
        umur: userDoc.public.umur,
        tiktok: userDoc.public.tiktok,
        photo: userDoc.public.photo
      };

      localStorage.setItem("eas_user_data", JSON.stringify(safeUser));
      localStorage.setItem("eas_verified", "false");

      // 🚀 REDIRECT FIX
      setTimeout(() => {
        navigate("/access-portal", { replace: true });
      }, 300);

    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#00050d] flex items-center justify-center p-6 text-white">

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 rounded-3xl border border-blue-500/20 bg-black/60 backdrop-blur-xl shadow-xl"
      >

        <h2 className="text-center text-xl font-black text-blue-400 mb-6">
          EAS REGISTER
        </h2>

        {/* GEN */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          {[1,2].map(g => (
            <button
              key={g}
              type="button"
              onClick={() => setGen(g)}
              className={`p-3 rounded-xl text-xs font-bold
              ${gen === g ? "bg-blue-600" : "bg-gray-900 text-gray-400"}`}
            >
              GEN {g}
            </button>
          ))}
        </div>

        <form onSubmit={handleRegister} className="space-y-4">

          {/* FOTO */}
          <label className="flex justify-center cursor-pointer">
            {preview ? (
              <img src={preview} className="w-24 h-24 rounded-full object-cover"/>
            ) : (
              <div className="w-24 h-24 border border-dashed flex items-center justify-center rounded-full">
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
            className="w-full p-3 bg-black/40 rounded-xl text-xs"
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
            className="w-full p-3 bg-black/40 rounded-xl text-xs"
          >
            <option value="">Pilih Provinsi</option>
            {DOMISILI.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <Input placeholder="Link TikTok" value={form.tiktok} onChange={(v)=>setForm({...form,tiktok:v})}/>

          <button
            disabled={loading}
            className="w-full p-4 bg-blue-600 rounded-xl font-bold"
          >
            {loading ? "Processing..." : "Register"}
          </button>

        </form>

        <button
          onClick={() => navigate("/login")}
          className="w-full mt-4 text-xs text-blue-400"
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
    className="w-full p-3 bg-black/40 rounded-xl text-xs"
  />
);

export default RegisterPortal;
