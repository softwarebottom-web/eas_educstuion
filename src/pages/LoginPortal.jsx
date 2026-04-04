import React, { useState } from "react";
import { db } from "../api/config";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const LoginPortal = () => {
  const [qrInput, setQrInput] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const normalize = (val) => val?.toString().trim().toUpperCase();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!qrInput) return alert("Masukkan QR / Member ID!");

    setLoading(true);

    try {
      let foundUser = null;

      const input = normalize(qrInput);

      for (let gen of [1, 2]) {
        const snapshot = await getDocs(
          collection(db, `pendaftaran_eas_gen${gen}`)
        );

        for (let docSnap of snapshot.docs) {
          const d = docSnap.data();

          const memberId = normalize(d.memberId);
          const qrValue = normalize(d.qrValue);

          // 🔥 SUPPORT MULTI FORMAT
          if (
            input === memberId ||                       // EAS-2-1234
            input === qrValue ||                        // EAS|EAS-2-1234
            input === `EAS|${memberId}`                 // fallback
          ) {
            foundUser = d;
            break;
          }
        }

        if (foundUser) break;
      }

      if (!foundUser) {
        alert("ID tidak dikenali!");
        return;
      }

      // 🔥 SIMPAN SESSION
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

        <h2 className="font-bold text-center">LOGIN VIA QR / ID</h2>

        <input
          placeholder="Contoh: EAS-2-1234 atau EAS|EAS-2-1234"
          className="p-3 bg-gray-900 w-full rounded"
          onChange={(e) => setQrInput(e.target.value)}
        />

        <button className="w-full bg-blue-600 p-3 rounded">
          {loading ? "Checking..." : "Login"}
        </button>

      </form>
    </div>
  );
};

export default LoginPortal;
