import React, { useState } from "react";
import { db } from "../api/config";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  ShieldCheck,
  QrCode,
  Loader2
} from "lucide-react";

const LoginPortal = () => {
  const [qrInput, setQrInput] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const normalize = (val) => val?.toString().trim().toUpperCase();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!qrInput) return alert("Masukkan ID / QR!");

    setLoading(true);

    try {
      const input = normalize(qrInput);

      const q = query(
        collection(db, "users"),
        where("public.memberId", "==", input.replace("EAS|", "").split("|")[0])
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        alert("ID tidak ditemukan");
        return;
      }

      const docSnap = snapshot.docs[0];
      const data = docSnap.data();

      const qrValue = normalize(data.meta?.qrValue);

      if (
        input !== normalize(data.public.memberId) &&
        input !== qrValue &&
        input !== `EAS|${data.public.memberId}`
      ) {
        alert("QR tidak valid");
        return;
      }

      localStorage.setItem(
        "eas_user_session",
        JSON.stringify({
          id: docSnap.id
        })
      );

      navigate("/access-portal");

    } catch (err) {
      console.error(err);
      alert("Login gagal");
    } finally {
      setLoading(false);
    }
  };

  const handleGetMyData = async () => {
    if (!email.includes("@")) return alert("Email tidak valid!");

    setLoading(true);

    try {
      const q = query(
        collection(db, "users"),
        where("private.email", "==", email)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        alert("Email tidak ditemukan");
        return;
      }

      const user = snapshot.docs[0].data();

      await addDoc(collection(db, "mail_queue"), {
        to: email,
        message: {
          subject: "EAS - DATA AKUN",
          text: `
Halo ${user.public.nama},

Member ID kamu:
${user.public.memberId}

Foto ID:
${user.public.photo}
          `
        }
      });

      alert("Data dikirim ke email!");

    } catch (err) {
      console.error(err);
      alert("Gagal kirim");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#00050d] flex items-center justify-center px-6 text-white relative overflow-hidden">

      {/* BACKGROUND GLOW */}
      <div className="absolute w-[500px] h-[500px] bg-blue-600/10 blur-3xl rounded-full top-[-100px] left-[-100px]" />
      <div className="absolute w-[400px] h-[400px] bg-cyan-500/10 blur-3xl rounded-full bottom-[-100px] right-[-100px]" />

      <div className="w-full max-w-md p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] space-y-6">

        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-xl font-black tracking-widest text-blue-400">
            EAS ACCESS
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Secure Identity System
          </p>
        </div>

        {/* LOGIN CARD */}
        <form onSubmit={handleLogin} className="space-y-4">

          <div className="relative">
            <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16}/>
            <input
              placeholder="Scan / Input Member ID"
              className="w-full pl-10 p-3 bg-black/40 border border-gray-800 rounded-xl text-xs focus:outline-none focus:border-blue-500 transition-all"
              onChange={(e) => setQrInput(e.target.value)}
            />
          </div>

          <button
            className="w-full p-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            {loading ? <Loader2 className="animate-spin" size={16}/> : "Login"}
          </button>

        </form>

        {/* DIVIDER */}
        <div className="flex items-center gap-3 text-gray-600 text-xs">
          <div className="flex-1 h-[1px] bg-gray-800"/>
          Recovery
          <div className="flex-1 h-[1px] bg-gray-800"/>
        </div>

        {/* GET MY DATA */}
        <div className="space-y-3">

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16}/>
            <input
              placeholder="Email untuk ambil data"
              className="w-full pl-10 p-3 bg-black/40 border border-gray-800 rounded-xl text-xs focus:outline-none focus:border-green-500 transition-all"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            onClick={handleGetMyData}
            className="w-full p-3 bg-green-600 hover:bg-green-700 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            {loading ? <Loader2 className="animate-spin" size={16}/> : <><Mail size={14}/> Get My Data</>}
          </button>

        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-center gap-2 text-[10px] text-gray-500 opacity-50">
          <ShieldCheck size={12}/>
          Encrypted Identity Layer
        </div>

      </div>
    </div>
  );
};

export default LoginPortal;
