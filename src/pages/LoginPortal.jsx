import React, { useState } from "react";
import { db, supabaseMedia } from "../api/config";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const LoginPortal = () => {
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!photo) return alert("Upload ID Card!");

    setLoading(true);

    try {
      const fileName = `login_${Date.now()}.jpg`;

      // 🔥 Upload sementara
      await supabaseMedia.storage
        .from("eas-idcard")
        .upload(fileName, photo);

      const { data } = supabaseMedia.storage
        .from("eas-idcard")
        .getPublicUrl(fileName);

      const uploadedURL = data.publicUrl;

      // 🔥 VALIDASI KE FIRESTORE
      let foundUser = null;

      for (let gen of [1,2]) {
        const snapshot = await getDocs(collection(db, `pendaftaran_eas_gen${gen}`));

        snapshot.forEach(doc => {
          const d = doc.data();

          // 🔥 MATCH PHOTO URL (simple version)
          if (d.photo === uploadedURL) {
            foundUser = d;
          }
        });
      }

      if (!foundUser) {
        alert("ID tidak dikenali!");
        return;
      }

      localStorage.setItem("eas_user_data", JSON.stringify(foundUser));

      navigate("/access-portal");

    } catch (err) {
      console.error(err);
      alert("Login gagal!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <form onSubmit={handleLogin} className="p-6 border rounded-xl space-y-4">
        
        <h2 className="font-bold text-center">LOGIN VIA ID CARD</h2>

        <input type="file" onChange={e => setPhoto(e.target.files[0])} />

        <button className="w-full bg-blue-600 p-3 rounded">
          {loading ? "Checking..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default LoginPortal;
