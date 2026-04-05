import React, { useState } from "react";
import { db, auth } from "../api/config";
import {
  doc,
  getDoc
} from "firebase/firestore";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";

import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Loader2,
  ShieldCheck,
  KeyRound
} from "lucide-react";

const LoginPortal = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const navigate = useNavigate();

  // 🔐 LOGIN FIREBASE AUTH
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setStatus("❌ Isi email & password");
      return;
    }

    setLoading(true);
    setStatus("");

    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      const uid = res.user.uid;

      // 🔥 AMBIL DATA FIRESTORE
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        setStatus("❌ Data user tidak ditemukan");
        return;
      }

      const data = userSnap.data();

      // 🔐 SIMPAN SESSION
      localStorage.setItem("eas_user_data", JSON.stringify({
        id: uid,
        ...data.public
      }));

      setStatus("✅ Login berhasil");

      setTimeout(() => {
        navigate("/access-portal");
      }, 500);

    } catch (err) {
      console.error(err);
      setStatus("❌ Email / password salah");
    } finally {
      setLoading(false);
    }
  };

  // 📩 RESET PASSWORD
  const handleReset = async () => {
    if (!email) {
      setStatus("❌ Masukkan email dulu");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setStatus("📩 Link reset dikirim ke email");
    } catch (err) {
      console.error(err);
      setStatus("❌ Gagal kirim reset");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#00050d] text-white px-6">

      <div className="w-full max-w-md p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-6 shadow-xl">

        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-xl font-black tracking-widest text-blue-400">
            EAS LOGIN
          </h1>
          <p className="text-xs text-gray-500">
            Secure Access System
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleLogin} className="space-y-4">

          {/* EMAIL */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16}/>
            <input
              type="email"
              placeholder="Email"
              className="w-full pl-10 p-3 bg-black/40 border border-gray-800 rounded-xl text-xs"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* PASSWORD */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16}/>
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-10 p-3 bg-black/40 border border-gray-800 rounded-xl text-xs"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* LOGIN BUTTON */}
          <button className="w-full p-3 bg-blue-600 rounded-xl font-bold text-xs flex justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" size={16}/> : "Login"}
          </button>

        </form>

        {/* RESET */}
        <button
          onClick={handleReset}
          className="w-full text-xs text-yellow-400 flex justify-center gap-2"
        >
          <KeyRound size={14}/> Lupa Password
        </button>

        {/* STATUS */}
        {status && (
          <div className="text-center text-xs text-gray-400">
            {status}
          </div>
        )}

        {/* FOOTER */}
        <div className="flex justify-center gap-2 text-[10px] opacity-40">
          <ShieldCheck size={12}/> Firebase Secured
        </div>

      </div>
    </div>
  );
};

export default LoginPortal;
