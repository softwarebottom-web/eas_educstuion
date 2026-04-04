import React, { useState, useEffect } from "react";
import { db, supabaseMedia } from "../api/config";
import { collection, addDoc } from "firebase/firestore";
import { Image, UploadCloud, User, MapPin, Link as LinkIcon } from "lucide-react";
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

    if (!file.type.startsWith("image/")) {
      return alert("File harus gambar!");
    }

    if (file.size > 2 * 1024 * 1024) {
      return alert("Max 2MB!");
    }

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

      // 🔥 GENERATE MEMBER ID
      const memberId = `EAS-${gen}-${Math.floor(1000 + Math.random() * 9000)}`;

      // 🔥 QR VALUE (ini yang nanti dipakai login)
      const qrValue = `EAS|${memberId}`;

      // 🔥 GENERATE QR IMAGE
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

      // 🔥 SAVE KE FIRESTORE
      await addDoc(
        collection(db, `pendaftaran_eas_gen${gen}`),
        userData
      );

      // 🔥 SAVE LOCAL
      localStorage.setItem("eas_user_data", JSON.stringify(userData));

      navigate("/access-portal");

    } catch (err) {
      console.error(err);
      alert("Upload gagal: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#00050d] text-white flex items-center justify-center p-6">

      <div className="w-full max-w-md p-8 bg-gradient-to-br from-blue-950/20 to-black rounded-3xl border border-blue-500/20 shadow-xl">

        {/* HEADER */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-black tracking-widest text-blue-400">
            EAS REGISTER
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Secure Identity Enrollment
          </p>
        </div>

        {/* GEN */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          {[1, 2].map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGen(g)}
              className={`p-3 rounded-xl text-xs font-bold transition-all
                ${gen === g
                  ? "bg-blue-600 shadow-lg"
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
                  className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-blue-500 shadow-md"
                />
              ) : (
                <div className="w-24 h-24 mx-auto flex flex-col items-center justify-center border border-dashed border-gray-600 rounded-full group-hover:border-blue-400 transition-all">
                  <UploadCloud size={20} className="text-gray-500" />
                  <span className="text-[8px] text-gray-500 mt-1">UPLOAD</span>
                </div>
              )}
              <input type="file" hidden onChange={handlePhoto} />
            </label>
            <p className="text-xs text-gray-500 mt-2">
              Upload ID Card (Max 2MB)
            </p>
          </div>

          {/* INPUT */}
          <div className="relative">
            <User className="input-icon" />
            <input
              placeholder="Nama Lengkap"
              className="input"
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
            />
          </div>

          <input
            type="number"
            placeholder="Umur"
            className="input"
            onChange={(e) => setForm({ ...form, umur: e.target.value })}
          />

          <div className="relative">
            <MapPin className="input-icon" />
            <input
              placeholder="Domisili"
              className="input"
              onChange={(e) => setForm({ ...form, domisili: e.target.value })}
            />
          </div>

          <div className="relative">
            <LinkIcon className="input-icon" />
            <input
              placeholder="Link TikTok"
              className="input"
              onChange={(e) => setForm({ ...form, tiktok: e.target.value })}
            />
          </div>

          {/* BUTTON */}
          <button
            disabled={loading}
            className="w-full bg-blue-600 p-4 rounded-xl font-bold tracking-wide hover:bg-blue-700 transition-all active:scale-95"
          >
            {loading ? "Encrypting Identity..." : "Register"}
          </button>
        </form>

        {/* LOGIN */}
        <button
          onClick={() => navigate("/login")}
          className="w-full mt-4 text-xs text-blue-400 hover:text-blue-300"
        >
          Sudah punya ID? Login →
        </button>

      </div>

      <style jsx>{`
        .input {
          width: 100%;
          padding: 12px 12px 12px 40px;
          background: rgba(0,0,0,0.4);
          border-radius: 12px;
          font-size: 12px;
        }
        .input-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #555;
          width: 14px;
        }
      `}</style>
    </div>
  );
};

export default RegisterPortal;
