import React, { useState } from "react";
import { db } from "../api/config";
import { collection, addDoc } from "firebase/firestore";
import axios from "axios";
import { ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RegisterPortal = () => {
  const [gen, setGen] = useState(2);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nama: "",
    umur: "",
    domisili: "",
    tiktok: ""
  });

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (parseInt(form.umur) < 10) {
      alert("Minimal umur 10 tahun.");
      setLoading(false);
      return;
    }

    const userData = {
      ...form,
      umur: parseInt(form.umur),
      gen: gen,
      id: "EAS-" + Math.floor(Math.random() * 9999),
      timestamp: new Date().toISOString(),
      status: "verified"
    };

    try {
      const aiCheck = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "google/gemini-2.0-flash-001",
          messages: [
            {
              role: "user",
              content: `Apakah nama "${form.nama}" valid? jawab VALID atau INVALID`
            }
          ]
        },
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_KEY}`
          }
        }
      );

      const isValid = aiCheck.data.choices[0].message.content.includes("VALID");

      if (!isValid) {
        alert("Nama tidak valid.");
        setLoading(false);
        return;
      }

      await addDoc(collection(db, `pendaftaran_eas_gen${gen}`), userData);

    } catch (err) {
      console.error("Error:", err);
    }

    // simpan local
    localStorage.setItem("eas_user_data", JSON.stringify(userData));
    localStorage.setItem("eas_verified", "true");

    navigate("/access-portal");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#00050d] text-white p-6 flex flex-col items-center justify-center">

      <div className="flex mb-6">
        <button onClick={() => setGen(1)}>GEN 1</button>
        <button onClick={() => setGen(2)}>GEN 2</button>
      </div>

      <form onSubmit={handleRegister} className="space-y-4 w-full max-w-sm">
        <input required placeholder="Nama" onChange={e => setForm({...form, nama: e.target.value})} />
        <input required type="number" placeholder="Umur" onChange={e => setForm({...form, umur: e.target.value})} />
        <input required placeholder="Domisili" onChange={e => setForm({...form, domisili: e.target.value})} />
        <input required placeholder="TikTok" onChange={e => setForm({...form, tiktok: e.target.value})} />

        <button type="submit" disabled={loading}>
          {loading ? "LOADING..." : "REGISTER"}
        </button>
      </form>
    </div>
  );
};

export default RegisterPortal;
