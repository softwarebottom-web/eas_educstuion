import React, { useState, useEffect } from "react";
import { db, supabase } from "../api/config"; // 🔥 SATU TEMPAT
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

  // 🔥 CLEANUP MEMORY (penting)
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("File harus gambar!");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Max 2MB!");
      return;
    }

    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!photo) return alert("Upload foto ID Card!");

    const umurNum = parseInt(form.umur);

    if (!form.nama || form.nama.trim().length < 3) {
      return alert("Nama minimal 3 huruf");
    }

    if (isNaN(umurNum) || umurNum < 10) {
      return alert("Umur tidak valid");
    }

    if (!form.tiktok.toLowerCase().includes("tiktok")) {
      return alert("Link TikTok tidak valid");
    }

    setLoading(true);

    try {
      // 🔥 UNIQUE FILE NAME (ANTI TABRAKAN)
      const fileExt = photo.name.split(".").pop();
      const fileName = `idcard_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;

      // 🔥 UPLOAD
      const { error: uploadError } = await supabase.storage
        .from("eas-idcard")
        .upload(fileName, photo);

      if (uploadError) throw uploadError;

      // 🔥 GET PUBLIC URL
      const { data } = supabase.storage
        .from("eas-idcard")
        .getPublicUrl(fileName);

      const photoURL = data.publicUrl;

      // 🔥 DATA FINAL
      const userData = {
        nama: form.nama.trim(),
        umur: umurNum,
        domisili: form.domisili.trim(),
        tiktok: form.tiktok.trim(),
        gen,
        photo: photoURL,
        verified: false, // 🔥 PENTING BUAT ADMIN
        memberId: "EAS-" + Math.floor(1000 + Math.random() * 9000),
        timestamp: new Date().toISOString()
      };

      // 🔥 SAVE FIRESTORE
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

          {/* INPUT */}
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

          {/* BUTTON */}
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
