import React, { useState } from "react";
import { db } from "../api/config";
import { collection, getDocs } from "firebase/firestore";
import { Image } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LoginPortal = () => {
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleLogin = async () => {
    if (!photo) return alert("Upload ID Card!");

    setLoading(true);

    try {
      // 🔥 AMBIL SEMUA DATA (Gen1 + Gen2)
      const gen1 = await getDocs(collection(db, "pendaftaran_eas_gen1"));
      const gen2 = await getDocs(collection(db, "pendaftaran_eas_gen2"));

      const allUsers = [
        ...gen1.docs.map(d => d.data()),
        ...gen2.docs.map(d => d.data())
      ];

      // 🔥 SIMPEL MATCH (sementara: pakai nama di file)
      const found = allUsers.find(user =>
        photo.name.toLowerCase().includes(user.nama.toLowerCase())
      );

      if (!found) {
        alert("User tidak ditemukan!");
        return;
      }

      // 🔥 SAVE SESSION
      localStorage.setItem("eas_user_data", JSON.stringify(found));

      navigate("/access-portal");

    } catch (err) {
      console.error(err);
      alert("Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#00050d] p-6 text-white">
      <div className="w-full max-w-md p-8 border border-green-500/20 rounded-3xl">

        <h2 className="text-xl font-black text-center mb-6">
          LOGIN PORTAL
        </h2>

        <div className="text-center mb-4">
          <label className="cursor-pointer">
            {preview ? (
              <img src={preview} className="w-24 h-24 rounded-full mx-auto object-cover"/>
            ) : (
              <div className="w-24 h-24 mx-auto flex items-center justify-center border border-gray-700 rounded-full">
                <Image />
              </div>
            )}
            <input type="file" hidden onChange={handlePhoto} />
          </label>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-green-600 p-4 rounded-xl font-bold"
        >
          {loading ? "Scanning..." : "Login via ID Card"}
        </button>
      </div>
    </div>
  );
};

export default LoginPortal;
