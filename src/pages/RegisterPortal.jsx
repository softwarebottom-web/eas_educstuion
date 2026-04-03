import React, { useState, useEffect } from "react";
import { db, supabaseMedia } from "../api/config"; // 🔥 GANTI DISINI
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

    if (!form.nama || form.nama.length < 3)
      return alert("Nama minimal 3 huruf");

    if (isNaN(umurNum) || umurNum < 10)
      return alert("Umur tidak valid");

    setLoading(true);

    try {
      const fileExt = photo.name.split(".").pop();
      const fileName = `idcard_${Date.now()}.${fileExt}`;

      // 🔥 UPLOAD KE SUPABASE
      const { error } = await supabaseMedia.storage
        .from("eas-idcard")
        .upload(fileName, photo, {
          cacheControl: "3600",
          upsert: false
        });

      if (error) throw error;

      // 🔥 AMBIL URL
      const { data } = supabaseMedia.storage
        .from("eas-idcard")
        .getPublicUrl(fileName);

      const userData = {
        ...form,
        umur: umurNum,
        gen,
        photo: data.publicUrl,
        verified: false,
        timestamp: new Date().toISOString()
      };

      // 🔥 SIMPAN KE FIRESTORE
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
    <form onSubmit={handleRegister}>
      {/* UI tetap sama */}
    </form>
  );
};

export default RegisterPortal;
