import React, { useState } from "react";
import { db, auth } from "../api/config";
import { doc, getDoc } from "firebase/firestore";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Loader2, ShieldCheck, KeyRound } from "lucide-react";

const LoginPortal = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setStatus("❌ Isi email & password");
      return;
    }

    setLoading(true);
    setStatus("");

    try {
      // ✅ Login Firebase Auth
      const res = await signInWithEmailAndPassword(
        auth,
        email.toLowerCase().trim(),
        password
      );
      const uid = res.user.uid;

      // ✅ Langsung ambil doc by UID (tidak perlu query)
      const userSnap = await getDoc(doc(db, "users", uid));

      if (!userSnap.exists()) {
        setStatus("❌ Data user tidak ditemukan");
        return;
      }

      const data = userSnap.data();

      // ✅ Simpan session
      localStorage.setItem("eas_user_data", JSON.stringify({
        id: uid,
        ...data.public
      }));

      // ✅ Verified dari Firestore
      localStorage.setItem(
        "eas_verified",
        data.system?.verified ? "true" : "false"
      );

      setStatus("✅ Login berhasil");
      await new Promise((res) => setTimeout(res, 500));

      if (data.system?.verified) {
        navigate("/", { replace: true });
      } else {
        navigate("/access-portal", { replace: true });
      }

    } catch (err) {
      console.error(err);
      if (
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        setStatus("❌ Password salah");
      } else if (err.code === "auth/user-not-found") {
        setStatus("❌ Email tidak terdaftar");
      } else {
        setStatus("❌ " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!email) {
      setStatus("❌ Masukkan email dulu");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.toLowerCase().trim());
      setStatus("📩 Link reset dikirim ke email");
    } catch (err) {
      console.error(err);
      setStatus("❌ Gagal kirim reset, cek email kamu");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#00050d] text-white px-6">
      <div className="w-full max-w-md p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-6 shadow-xl">

        <div className="text-center">
          <h1 className="text-xl font-black tracking-widest text-blue-400">EAS LOGIN</h1>
          <p className="text-xs text-gray-500">Secure Access System</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              className="w-full pl-10 p-3 bg-black/40 border border-gray-800 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              className="w-full pl-10 p-3 bg-black/40 border border-gray-800 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-xs flex justify-center gap-2 transition disabled:bg-gray-700"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : "Login"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleReset}
          className="w-full text-xs text-yellow-400 flex justify-center gap-2 hover:underline"
        >
          <KeyRound size={14} /> Lupa Password
        </button>

        {status && (
          <div className="text-center text-xs text-gray-400">{status}</div>
        )}

        <div className="flex justify-center gap-2 text-[10px] opacity-40">
          <ShieldCheck size={12} /> Firebase Secured
        </div>

      </div>
    </div>
  );
};

export default LoginPortal;
