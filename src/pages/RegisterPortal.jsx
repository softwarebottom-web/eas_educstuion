import React, { useState, useEffect } from "react";
import { db, supabaseMedia } from "../api/config";
import { collection, addDoc } from "firebase/firestore";
import { Image } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

      // 🔥 Upload ke Supabase
      const { error } = await supabaseMedia.storage
        .from("eas-idcard")
        .upload(fileName, photo);

      if (error) throw error;

      const { data } = supabaseMedia.storage
        .from("eas-idcard")
        .getPublicUrl(fileName);

      const userData = {
        nama: form.nama.trim(),
        umur: umurNum,
        domisili: form.domisili.trim(),
        tiktok: form.tiktok.trim(),
        gen,
        photo: data.publicUrl,
        verified: false,
        memberId: `EAS-${gen}-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toISOString()
      };

      await addDoc(
        collection(db, `pendaftaran_eas_gen${gen}`),
        userData
      );

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
    <div className="min-h-screen flex items-center justify-center bg-[#00050d] text-white p-6">
      <div className="w-full max-w-md p-8 bg-blue-950/10 rounded-3xl border border-blue-500/20">

        <h2 className="text-xl font-black text-center mb-6">
          EAS REGISTER
        </h2>

        {/* 🔥 PILIH GEN */}
        <div className="flex gap-2 mb-4">
          {[1,2].map(g => (
            <button
              key={g}
              onClick={() => setGen(g)}
              className={`flex-1 p-2 rounded-xl text-xs font-bold ${
                gen === g ? "bg-blue-600" : "bg-gray-800"
              }`}
            >
              GEN {g}
            </button>
          ))}
        </div>

        <form onSubmit={handleRegister} className="space-y-4">

          {/* FOTO */}
          <div className="text-center">
            <label className="cursor-pointer">
              {preview ? (
                <img src={preview} className="w-24 h-24 rounded-full mx-auto object-cover"/>
              ) : (
                <div className="w-24 h-24 mx-auto flex items-center justify-center border rounded-full">
                  <Image />
                </div>
              )}
              <input type="file" hidden onChange={handlePhoto}/>
            </label>
          </div>

          <input placeholder="Nama" className="input" onChange={e => setForm({...form, nama: e.target.value})}/>
          <input type="number" placeholder="Umur" className="input" onChange={e => setForm({...form, umur: e.target.value})}/>
          <input placeholder="Domisili" className="input" onChange={e => setForm({...form, domisili: e.target.value})}/>
          <input placeholder="Link TikTok" className="input" onChange={e => setForm({...form, tiktok: e.target.value})}/>

          <button className="btn">
            {loading ? "Uploading..." : "Register"}
          </button>
        </form>

        {/* 🔥 LOGIN BUTTON */}
        <button
          onClick={() => navigate("/login")}
          className="w-full mt-4 text-xs text-blue-400"
        >
          Sudah punya ID? Login disini
        </button>
      </div>
    </div>
  );
};

export default RegisterPortal;
