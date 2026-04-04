import React, { useState } from "react";
import { db } from "../api/config";
import { collection, getDocs } from "firebase/firestore";
import jsQR from "jsqr";
import { useNavigate } from "react-router-dom";

const LoginPortal = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);

    const img = new Image();
    const reader = new FileReader();

    reader.onload = () => {
      img.src = reader.result;
    };

    img.onload = async () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const code = jsQR(imageData.data, canvas.width, canvas.height);

      if (!code) {
        alert("QR tidak terbaca!");
        setLoading(false);
        return;
      }

      const qrValue = code.data;

      let foundUser = null;

      for (let gen of [1, 2]) {
        const snapshot = await getDocs(collection(db, `pendaftaran_eas_gen${gen}`));

        snapshot.forEach(doc => {
          const d = doc.data();

          if (d.qrValue === qrValue) {
            foundUser = d;
          }
        });
      }

      if (!foundUser) {
        alert("ID tidak valid!");
        setLoading(false);
        return;
      }

      localStorage.setItem("eas_user_data", JSON.stringify(foundUser));
      navigate("/access-portal");
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="p-6 border rounded-xl text-center space-y-4">
        <h2 className="font-bold">LOGIN VIA QR ID CARD</h2>

        <input type="file" onChange={handleScan} />

        <p className="text-xs text-gray-500">
          Upload / Scan QR dari ID Card kamu
        </p>

        {loading && <p>Scanning...</p>}
      </div>
    </div>
  );
};

export default LoginPortal;
