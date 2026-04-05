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
  QrCode,
  Loader2,
  ShieldCheck,
  Send
} from "lucide-react";

const LoginPortal = () => {
  const [qrInput, setQrInput] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const navigate = useNavigate();

  const normalize = (val) => val?.toString().trim().toUpperCase();

  // 🔐 LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!qrInput) return alert("Masukkan Member ID / QR!");

    setLoading(true);
    setStatus("");

    try {
      const input = normalize(qrInput);
      const extractedId = input.replace("EAS|", "").split("|")[0];

      const q = query(
        collection(db, "users"),
        where("public.memberId", "==", extractedId)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setStatus("❌ ID tidak ditemukan");
        return;
      }

      const docSnap = snapshot.docs[0];
      const data = docSnap.data();

      const memberId = normalize(data.public.memberId);
      const qrValue = normalize(data.meta.qrValue);

      if (
        input !== memberId &&
        input !== qrValue &&
        input !== `EAS|${memberId}`
      ) {
        setStatus("❌ QR / ID tidak valid");
        return;
      }

      // 🔥 SESSION
      localStorage.setItem(
        "eas_user_session",
        JSON.stringify({ id: docSnap.id })
      );

      setStatus("✅ Login berhasil");
      setTimeout(() => navigate("/access-portal"), 800);

    } catch (err) {
      console.error(err);
      setStatus("❌ Login gagal");
    } finally {
      setLoading(false);
    }
  };

  // 📩 GET MY IDENTITY
  const handleGetMyData = async () => {
    if (!email.includes("@")) {
      setStatus("❌ Email tidak valid");
      return;
    }

    setLoading(true);
    setStatus("");

    try {
      const q = query(
        collection(db, "users"),
        where("private.email", "==", email)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setStatus("❌ Email tidak ditemukan");
        return;
      }

      const user = snapshot.docs[0].data();

      // 🔥 AMBIL DATA AMAN
      const nama = user.public.nama;
      const memberId = user.public.memberId;
      const photo = user.public.photo;

      // 🔥 KIRIM EMAIL
      await addDoc(collection(db, "mail_queue"), {
        to: email,
        message: {
          subject: "EAS Identity Recovery",
          html: `
            <h2>Halo ${nama}</h2>
            <p>Berikut data akun kamu:</p>

            <b>Member ID:</b><br/>
            ${memberId}<br/><br/>

            <b>ID Card:</b><br/>
            <img src="${photo}" width="200"/><br/><br/>

            <p>Simpan baik-baik ya.</p>
          `
        }
      });

      setStatus("📩 Data berhasil dikirim ke email!");

    } catch (err) {
      console.error(err);
      setStatus("❌ Gagal kirim data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#00050d] flex items-center justify-center px-6 text-white">

      <div className="w-full max-w-md p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-6">

        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-xl font-black tracking-widest text-blue-400">
            EAS ACCESS
          </h1>
          <p className="text-xs text-gray-500">
            Secure Identity System
          </p>
        </div>

        {/* LOGIN */}
        <form onSubmit={handleLogin} className="space-y-4">

          <div className="relative">
            <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16}/>
            <input
              placeholder="Member ID / QR"
              className="w-full pl-10 p-3 bg-black/40 border border-gray-800 rounded-xl text-xs"
              onChange={(e) => setQrInput(e.target.value)}
            />
          </div>

          <button className="w-full p-3 bg-blue-600 rounded-xl font-bold text-xs flex justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" size={16}/> : "Login"}
          </button>

        </form>

        {/* DIVIDER */}
        <div className="text-center text-xs text-gray-600">
          — Recovery —
        </div>

        {/* GET MY DATA */}
        <div className="space-y-3">

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16}/>
            <input
              placeholder="Email kamu"
              className="w-full pl-10 p-3 bg-black/40 border border-gray-800 rounded-xl text-xs"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            onClick={handleGetMyData}
            className="w-full p-3 bg-green-600 rounded-xl font-bold text-xs flex justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={16}/> : <><Send size={14}/> Get My Identity</>}
          </button>

        </div>

        {/* STATUS */}
        {status && (
          <div className="text-center text-xs text-gray-400">
            {status}
          </div>
        )}

        {/* FOOTER */}
        <div className="flex justify-center gap-2 text-[10px] opacity-40">
          <ShieldCheck size={12}/> Encrypted Layer
        </div>

      </div>
    </div>
  );
};

export default LoginPortal;
