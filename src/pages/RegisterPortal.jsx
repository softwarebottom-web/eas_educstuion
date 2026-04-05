import React, { useState, useEffect } from "react";
import { db, supabaseMedia } from "../api/config";
import { collection, addDoc } from "firebase/firestore";
import { UploadCloud, User, Mail, MapPin, Link as LinkIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import QRCode from "qrcode";
import { motion } from "framer-motion";

const DOMISILI = [
  "Jakarta","Surabaya","Bandung","Medan","Makassar",
  "Semarang","Yogyakarta","Palembang","Denpasar",
  "Balikpapan","Malang","Bogor","Bekasi","Tangerang"
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

    if (!photo) return alert("Upload foto dulu");
    if (form.nama.trim().length < 3) return alert("Nama minimal 3 huruf");
    if (!form.email.includes("@")) return alert("Email tidak valid");
    if (!form.dob) return alert("Tanggal lahir wajib");
    if (!form.domisili) return alert("Pilih domisili");
    if (!form.tiktok.includes("tiktok")) return alert("Link TikTok tidak valid");

    const umur = getAge(form.dob);
    if (umur < 10) return alert("Minimal umur 10 tahun");

    setLoading(true);

    try {
      // 🔥 Upload Photo
      const fileName = `gen${gen}_${Date.now()}.jpg`;

      const { error } = await supabaseMedia.storage
        .from("eas-idcard")
        .upload(fileName, photo);

      if (error) throw error;

      const { data } = supabaseMedia.storage
        .from("eas-idcard")
        .getPublicUrl(fileName);

      // 🔐 CORE ID SYSTEM
      const memberId = `EAS-${gen}-${Date.now().toString().slice(-6)}`;
      const signature = crypto.randomUUID();

      const qrValue = `EAS|${memberId}|${signature}`;
      const qrImage = await QRCode.toDataURL(qrValue);

      // 🔥 STRUCTURE DATA
      const userDoc = {
        public: {
          nama: form.nama,
          umur,
          domisili: form.domisili,
          tiktok: form.tiktok,
          photo: data.publicUrl,
          memberId,
          gen,
          role: "member"
        },

        private: {
          email: form.email,
          signature
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
      localStorage.setItem(
        "eas_user_data",
        JSON.stringify({
          id: ref.id,
          ...userDoc.public
        })
      );

      // 📩 EMAIL QUEUE (TANPA PASSWORD)
      await addDoc(collection(db, "mail_queue"), {
        to: form.email,
        message: {
          subject: "EAS MEMBER ID",
          text: `
Halo ${form.nama},

Akun kamu berhasil dibuat.

Member ID: ${memberId}

Gunakan ID ini untuk login atau scan QR.

- EAS System
          `
        }
      });

      alert("REGISTER BERHASIL 🚀");
      navigate("/access-portal");

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
          <motion.label whileHover={{ scale: 1.05 }} className="flex justify-center cursor-pointer">
            {preview ? (
              <img src={preview} className="w-24 h-24 rounded-full object-cover"/>
            ) : (
              <div className="w-24 h-24 border border-dashed flex items-center justify-center rounded-full">
                <UploadCloud size={20}/>
              </div>
            )}
            <input type="file" hidden onChange={handlePhoto}/>
          </motion.label>

          <Input icon={<User size={14}/>} placeholder="Nama" onChange={(v)=>setForm({...form,nama:v})}/>
          <Input icon={<Mail size={14}/>} placeholder="Email" onChange={(v)=>setForm({...form,email:v})}/>

          <input
            type="date"
            className="w-full p-3 bg-black/40 rounded-xl text-xs"
            onChange={(e)=>setForm({...form,dob:e.target.value})}
          />

          <select
            className="w-full p-3 bg-black/40 rounded-xl text-xs"
            onChange={(e)=>setForm({...form,domisili:e.target.value})}
          >
            <option value="">Pilih Domisili</option>
            {DOMISILI.map(d => <option key={d}>{d}</option>)}
          </select>

          <Input icon={<LinkIcon size={14}/>} placeholder="Link TikTok" onChange={(v)=>setForm({...form,tiktok:v})}/>

          <motion.button
            whileTap={{ scale: 0.95 }}
            disabled={loading}
            className="w-full p-4 bg-blue-600 rounded-xl font-bold"
          >
            {loading ? "Processing..." : "Register"}
          </motion.button>

        </form>
      </motion.div>
    </div>
  );
};

const Input = ({ icon, placeholder, onChange }) => (
  <div className="relative">
    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
      {icon}
    </div>
    <input
      placeholder={placeholder}
      onChange={(e)=>onChange(e.target.value)}
      className="w-full pl-10 p-3 bg-black/40 rounded-xl text-xs"
    />
  </div>
);

export default RegisterPortal;
