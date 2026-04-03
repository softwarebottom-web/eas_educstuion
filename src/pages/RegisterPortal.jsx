import React, { useState, useEffect } from "react";
import { db, supabaseMedia } from "../api/config";
import { collection, addDoc } from "firebase/firestore";
import { Image } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RegisterPortal = () => {
  const [gen] = useState(2);
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

    if (!form.nama || form.nama.length < 3)
      return alert("Nama minimal 3 huruf");

    if (isNaN(umurNum) || umurNum < 10)
      return alert("Umur tidak valid");

    setLoading(true);

    try {
      const fileExt = photo.name.split(".").pop();
      const fileName = `idcard_${Date.now()}.${fileExt}`;

      // 🔥 SUPABASE UPLOAD
      const { error } = await supabaseMedia.storage
        .from("eas-idcard")
        .upload(fileName, photo);

      if (error) throw error;

      // 🔥 GET URL
      const { data } = supabaseMedia.storage
        .from("eas-idcard")
        .getPublicUrl(fileName);

      const userData = {
        ...form,
        umur: umurNum,
        gen,
        photo: data.publicUrl,
        verified: false,
        memberId: "EAS-" + Math.floor(1000 + Math.random() * 9000),
        timestamp: new Date().toISOString()
      };

      // 🔥 SAVE FIRESTORE
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
    <div className="min-h-screen bg-[#00050d] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md p-8 bg-blue-950/10 rounded-3xl border border-blue-500/20">

        <h2 className="text-xl font-black text-center mb-6">
          EAS REGISTER
        </h2>

        <form onSubmit={handleRegister} className="space-y-4">

          {/* FOTO */}
          <div className="text-center">
            <label className="cursor-pointer">
              {preview ? (
                <img
                  src={preview}
                  className="w-24 h-24 rounded-full mx-auto object-cover border border-blue-500/30"
                />
              ) : (
                <div className="w-24 h-24 mx-auto flex items-center justify-center border border-gray-700 rounded-full">
                  <Image />
                </div>
              )}
              <input type="file" hidden onChange={handlePhoto} />
            </label>
            <p className="text-xs text-gray-500 mt-2">
              Upload Foto ID (Max 2MB)
            </p>
          </div>

          <input
            placeholder="Nama"
            className="w-full p-3 bg-black/40 rounded-xl"
            onChange={(e) =>
              setForm({ ...form, nama: e.target.value })
            }
          />

          <input
            type="number"
            placeholder="Umur"
            className="w-full p-3 bg-black/40 rounded-xl"
            onChange={(e) =>
              setForm({ ...form, umur: e.target.value })
            }
          />

          <input
            placeholder="Domisili"
            className="w-full p-3 bg-black/40 rounded-xl"
            onChange={(e) =>
              setForm({ ...form, domisili: e.target.value })
            }
          />

          <input
            placeholder="Link TikTok"
            className="w-full p-3 bg-black/40 rounded-xl"
            onChange={(e) =>
              setForm({ ...form, tiktok: e.target.value })
            }
          />

          <button
            disabled={loading}
            className="w-full bg-blue-600 p-4 rounded-xl font-bold"
          >
            {loading ? "Uploading..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPortal;
