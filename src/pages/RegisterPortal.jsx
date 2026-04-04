import React, { useState, useEffect } from "react";
import { db, supabaseMedia } from "../api/config";
import { collection, addDoc } from "firebase/firestore";
import { UploadCloud, User, MapPin, Link as LinkIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import QRCode from "qrcode";

const RegisterPortal = () => {
  const [gen, setGen] = useState(2);
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);

  const [form, setForm] = useState({
    nama: "",
    umur: "",
    domisili: "",
    tiktok: ""
  });

  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) return alert("File harus gambar!");
    if (file.size > 2 * 1024 * 1024) return alert("Max 2MB!");

    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!photo) return alert("Upload foto ID!");

    const umurNum = parseInt(form.umur);

    if (!form.nama || form.nama.trim().length < 3)
      return alert("Nama minimal 3 huruf");

    if (isNaN(umurNum) || umurNum < 10)
      return alert("Umur tidak valid");

    if (!form.tiktok.includes("tiktok"))
      return alert("Link TikTok tidak valid");

    setLoading(true);

    try {
      const fileExt = photo.name.split(".").pop();
      const fileName = `gen${gen}_${Date.now()}.${fileExt}`;

      // 🔥 Upload foto
      const { error } = await supabaseMedia.storage
        .from("eas-idcard")
        .upload(fileName, photo);

      if (error) throw error;

      const { data } = supabaseMedia.storage
        .from("eas-idcard")
        .getPublicUrl(fileName);

      // 🔥 MEMBER ID (FIXED)
      const memberId = `EAS-${gen}-${Date.now().toString().slice(-6)}`;

      // 🔥 QR VALUE
      const qrValue = `EAS|${memberId}`;

      // 🔥 QR IMAGE
      const qrImage = await QRCode.toDataURL(qrValue);

      const userData = {
        ...form,
        umur: umurNum,
        gen,
        photo: data.publicUrl,
        memberId,
        qrValue,
        qrImage,
        verified: false,
        timestamp: new Date().toISOString()
      };

      await addDoc(
        collection(db, `pendaftaran_eas_gen${gen}`),
        userData
      );

      localStorage.setItem("eas_user_data", JSON.stringify(userData));

      navigate("/access-portal");

    } catch (err) {
      alert("Upload gagal: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🎨 STYLE DINAMIS
  const theme =
    gen === 1
      ? {
          card: "from-blue-950/30 to-black border-blue-500/30",
          button: "bg-blue-600 hover:bg-blue-700",
          accent: "text-blue-400",
          glow: "shadow-[0_0_30px_rgba(59,130,246,0.3)]"
        }
      : {
          card: "from-cyan-950/30 to-black border-cyan-500/30",
          button: "bg-cyan-600 hover:bg-cyan-700",
          accent: "text-cyan-400",
          glow: "shadow-[0_0_30px_rgba(34,211,238,0.3)]"
        };

  return (
    <div className="min-h-screen bg-[#00050d] text-white flex items-center justify-center p-6">

      <div className={`w-full max-w-md p-8 bg-gradient-to-br ${theme.card} rounded-3xl border ${theme.glow}`}>

        {/* HEADER */}
        <div className="text-center mb-6">
          <h2 className={`text-xl font-black tracking-widest ${theme.accent}`}>
            EAS REGISTER
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Secure Identity Enrollment
          </p>
        </div>

        {/* GEN SELECT */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          {[1, 2].map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGen(g)}
              className={`p-3 rounded-xl text-xs font-bold transition-all
                ${gen === g
                  ? `${theme.button} text-white`
                  : "bg-gray-900 border border-gray-800 text-gray-400"}
              `}
            >
              GEN {g}
            </button>
          ))}
        </div>

        <form onSubmit={handleRegister} className="space-y-4">

          {/* FOTO */}
          <div className="text-center">
            <label className="cursor-pointer group">
              {preview ? (
                <img
                  src={preview}
                  className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-white/20"
                />
              ) : (
                <div className="w-24 h-24 mx-auto flex flex-col items-center justify-center border border-dashed border-gray-600 rounded-full group-hover:border-white transition-all">
                  <UploadCloud size={20} />
                </div>
              )}
              <input type="file" hidden onChange={handlePhoto} />
            </label>
          </div>

          {/* INPUT */}
          <Input icon={<User size={14} />} placeholder="Nama" onChange={(v)=>setForm({...form,nama:v})}/>
          <Input placeholder="Umur" type="number" onChange={(v)=>setForm({...form,umur:v})}/>
          <Input icon={<MapPin size={14} />} placeholder="Domisili" onChange={(v)=>setForm({...form,domisili:v})}/>
          <Input icon={<LinkIcon size={14} />} placeholder="Link TikTok" onChange={(v)=>setForm({...form,tiktok:v})}/>

          <button
            disabled={loading}
            className={`w-full p-4 rounded-xl font-bold transition-all ${theme.button}`}
          >
            {loading ? "Encrypting..." : "Register"}
          </button>
        </form>

        <button
          onClick={() => navigate("/login")}
          className={`w-full mt-4 text-xs ${theme.accent}`}
        >
          Sudah punya ID? Login →
        </button>
      </div>
    </div>
  );
};

// 🔹 INPUT COMPONENT
const Input = ({ icon, placeholder, type="text", onChange }) => (
  <div className="relative">
    {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{icon}</div>}
    <input
      type={type}
      placeholder={placeholder}
      onChange={(e)=>onChange(e.target.value)}
      className="w-full pl-10 p-3 bg-black/40 rounded-xl text-xs"
    />
  </div>
);

export default RegisterPortal;
