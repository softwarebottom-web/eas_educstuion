import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const RegisterPortal = () => {
  const [gen, setGen] = useState(2);
  const [form, setForm] = useState({
    nama: "",
    umur: "",
    domisili: "",
    tiktok: ""
  });

  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();

    if (parseInt(form.umur) < 10) {
      alert("Minimal umur 10 tahun");
      return;
    }

    const userData = {
      ...form,
      umur: parseInt(form.umur),
      gen,
      memberId: "EAS-" + Math.floor(1000 + Math.random() * 9000),
      timestamp: new Date().toISOString()
    };

    localStorage.setItem("eas_user_data", JSON.stringify(userData));
    localStorage.setItem("eas_verified", "true");

    navigate("/access-portal");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6">
      <div className="flex gap-2 mb-5">
        <button onClick={() => setGen(1)}>GEN 1</button>
        <button onClick={() => setGen(2)}>GEN 2</button>
      </div>

      <form onSubmit={handleRegister} className="space-y-3 w-full max-w-sm">
        <input placeholder="Nama" required onChange={(e)=>setForm({...form,nama:e.target.value})}/>
        <input placeholder="Umur" type="number" required onChange={(e)=>setForm({...form,umur:e.target.value})}/>
        <input placeholder="Domisili" required onChange={(e)=>setForm({...form,domisili:e.target.value})}/>
        <input placeholder="TikTok" required onChange={(e)=>setForm({...form,tiktok:e.target.value})}/>
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default RegisterPortal;
