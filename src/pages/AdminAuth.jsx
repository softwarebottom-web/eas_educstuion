import React, { useState, useEffect } from "react";
import { ShieldAlert, Mail, Lock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../api/config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const AdminAuth = ({ isOpen, onClose, onAuthSuccess }) => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [foundDoc, setFoundDoc] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setEmail("");
      setPassword("");
      setAdminCode("");
      setFoundDoc(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCheckLogin = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const cred = await signInWithEmailAndPassword(
        auth,
        email.toLowerCase().trim(),
        password
      );

      const uid = cred.user.uid;
      const snap = await getDoc(doc(db, "users", uid));

      if (!snap.exists()) {
        alert("DENIED: User tidak terdaftar");
        return;
      }

      const data = snap.data();
      const role = data?.public?.role;
      const banned = data?.system?.banned;
      const verified = data?.system?.verified;

      if (banned) { alert("DENIED: Akun dibanned"); return; }
      if (!verified) { alert("DENIED: Akun belum diverifikasi"); return; }

      const allowedRoles = ["owner", "admin", "moderator"];
      if (!allowedRoles.includes(role)) {
        alert("DENIED: Anda bukan staff");
        return;
      }

      setFoundDoc({ id: uid, data });
      setStep(2);

    } catch (err) {
      console.error(err);
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        alert("DENIED: Password salah");
      } else if (err.code === "auth/user-not-found") {
        alert("DENIED: Email tidak terdaftar");
      } else {
        alert("Error: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckCode = async (e) => {
    e.preventDefault();
    if (loading || !foundDoc) return;
    setLoading(true);

    try {
      const data = foundDoc.data;
      const savedCode = data?.private?.adminCode;

      if (!savedCode) {
        alert("DENIED: Admin code belum diset, hubungi owner");
        return;
      }

      if (adminCode.trim() !== savedCode) {
        alert("DENIED: Admin code salah");
        return;
      }

      const role = data?.public?.role;
      let level = 1;
      if (role === "admin") level = 2;
      if (role === "owner") level = 3;

      const expireTime = Date.now() + 1000 * 60 * 60;

      localStorage.setItem("eas_admin_token", "EAS_ADMIN_SESSION");
      localStorage.setItem("eas_admin_id", foundDoc.id);
      localStorage.setItem("eas_admin_role", role);
      localStorage.setItem("eas_admin_level", level.toString());
      localStorage.setItem("eas_admin_expire", expireTime.toString());

      alert(`ACCESS GRANTED: ${role.toUpperCase()}`);

      // ✅ Panggil onAuthSuccess dulu, baru navigate
      if (onAuthSuccess) onAuthSuccess();
      onClose();
      navigate("/admin", { replace: true });

    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const role = foundDoc?.data?.public?.role;
  const nama = foundDoc?.data?.public?.nama;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-sm p-10 rounded-[2.5rem] bg-white/5 backdrop-blur-xl border border-red-500/20 text-center z-10">

        <div className="bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="text-red-500 animate-pulse" size={28} />
        </div>

        <h1 className="text-sm font-black tracking-widest text-red-400 mb-1">
          ADMIN ACCESS
        </h1>

        <div className="flex justify-center gap-2 mb-6">
          <div className={`w-8 h-1 rounded-full transition-all ${step >= 1 ? "bg-red-500" : "bg-gray-700"}`} />
          <div className={`w-8 h-1 rounded-full transition-all ${step >= 2 ? "bg-red-500" : "bg-gray-700"}`} />
        </div>

        {step === 1 && (
          <form onSubmit={handleCheckLogin} className="space-y-3">
            <p className="text-[10px] text-gray-500 mb-4">
              Login dengan akun staff kamu
            </p>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400/40" size={14} />
              <input
                type="email"
                placeholder="Gmail staff"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-red-500/20 p-4 pl-12 rounded-2xl text-center text-xs text-red-400 focus:outline-none focus:border-red-500"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400/40" size={14} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-red-500/20 p-4 pl-12 rounded-2xl text-center text-xs text-red-400 focus:outline-none focus:border-red-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-2xl text-xs font-black uppercase transition-all flex items-center justify-center gap-2
                ${loading ? "bg-red-900/20 text-red-700" : "bg-red-600 hover:bg-red-700 text-white"}`}
            >
              {loading ? "CHECKING..." : (<>NEXT <ArrowRight size={14} /></>)}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleCheckCode} className="space-y-4">
            <p className="text-[10px] text-gray-500 mb-1">
              Selamat datang, <span className="text-red-400 font-bold">{nama}</span>
            </p>
            <p className="text-[9px] text-gray-600 mb-4 uppercase">
              Role: {role}
            </p>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400/40" size={14} />
              <input
                type="password"
                placeholder="Admin Code"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                className="w-full bg-black/40 border border-red-500/20 p-4 pl-12 rounded-2xl text-center text-xs text-red-400 focus:outline-none focus:border-red-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-2xl text-xs font-black uppercase transition-all
                ${loading ? "bg-red-900/20 text-red-700" : "bg-red-600 hover:bg-red-700 text-white"}`}
            >
              {loading ? "AUTHORIZING..." : "ENTER SYSTEM"}
            </button>

            <button
              type="button"
              onClick={() => { setStep(1); setFoundDoc(null); }}
              className="text-[9px] text-gray-600 hover:text-gray-400"
            >
              ← Ganti akun
            </button>
          </form>
        )}

        <button onClick={onClose} className="mt-6 text-[9px] text-gray-500 hover:text-gray-300">
          Cancel
        </button>

      </div>
    </div>
  );
};

export default AdminAuth;
