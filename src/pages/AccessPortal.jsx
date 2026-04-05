import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../api/config";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { Lock, Search, MessageCircle, ArrowLeft, ShieldCheck } from "lucide-react";
import IDCard from "../component/IDCard";

const WHATSAPP_LINKS = {
  1: "https://chat.whatsapp.com/DMSABsZCPC77nkFdzphbNH",
  2: "https://chat.whatsapp.com/JuLtO0VsqxDHUSHNrNjQZN"
};

const AccessPortal = () => {
  const navigate = useNavigate();

  const [checking, setChecking] = useState(false);
  const [userData, setUserData] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        // ✅ Pakai key yang sama dengan Register
        const saved = localStorage.getItem("eas_user_data");

        if (!saved) {
          navigate("/login");
          return;
        }

        const session = JSON.parse(saved);

        if (!session?.id) {
          navigate("/login");
          return;
        }

        // ✅ Fetch data dari Firestore
        const snap = await getDoc(doc(db, "users", session.id));

        if (!snap.exists()) {
          localStorage.removeItem("eas_user_data");
          localStorage.removeItem("eas_verified");
          navigate("/register");
          return;
        }

        const data = snap.data();

        // ✅ Validasi field yang memang ada (tanpa signature)
        if (!data?.public?.memberId) {
          alert("DATA INVALID");
          navigate("/register");
          return;
        }

        const fullData = {
          id: snap.id,
          ...data.public
        };

        setUserData(fullData);
        setTimeout(() => setReady(true), 300);

      } catch (err) {
        console.error(err);
        navigate("/login");
      }
    };

    init();
  }, [navigate]);

  const handleActivate = async () => {
    if (checking || !userData) return;
    setChecking(true);

    try {
      await new Promise((res) => setTimeout(res, 1200));

      localStorage.setItem("eas_verified", "true");
      navigate("/dashboard", { replace: true });

    } catch (err) {
      alert("Verification failed");
    } finally {
      setChecking(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (_) {}
    localStorage.removeItem("eas_user_data");
    localStorage.removeItem("eas_verified");
    navigate("/login");
  };

  const theme =
    userData?.gen === 1
      ? {
          accent: "text-blue-400",
          button: "bg-blue-600 hover:bg-blue-700",
          border: "border-blue-500/30",
          glow: "shadow-[0_0_30px_rgba(59,130,246,0.3)]"
        }
      : {
          accent: "text-cyan-400",
          button: "bg-cyan-600 hover:bg-cyan-700",
          border: "border-cyan-500/30",
          glow: "shadow-[0_0_30px_rgba(34,211,238,0.3)]"
        };

  if (!ready) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#00050d] text-blue-500 font-bold">
        Syncing Identity...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#00050d] p-6 gap-8 relative overflow-hidden">

      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#1e3a8a 0.5px, transparent 0.5px)`,
          backgroundSize: "24px 24px"
        }}
      />

      <button
        onClick={handleLogout}
        className="absolute top-8 left-8 text-[9px] uppercase text-gray-500 flex items-center gap-2 hover:text-red-400"
      >
        <ArrowLeft size={12} /> Logout
      </button>

      <div className="flex flex-col items-center gap-6 w-full max-w-sm z-10">

        <IDCard data={userData} gen={userData.gen} />

        <a
          href={WHATSAPP_LINKS[userData.gen]}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl uppercase text-[10px] font-black bg-green-600/10 border border-green-500/20 text-green-400 hover:bg-green-600 hover:text-white"
        >
          <MessageCircle size={18} /> Join WhatsApp
        </a>
      </div>

      <div className={`w-full max-w-xs p-8 border rounded-[2.5rem] bg-black/60 text-center ${theme.border} ${theme.glow}`}>

        <div className="mb-4">
          {checking
            ? <Search className="animate-spin mx-auto" size={24} />
            : <Lock className="mx-auto opacity-50" size={24} />}
        </div>

        <h2 className={`text-[11px] font-black uppercase ${theme.accent}`}>
          Security Check
        </h2>

        <p className="text-[8px] text-gray-600 mb-6 uppercase">
          Server Validation Required
        </p>

        <button
          onClick={handleActivate}
          disabled={checking}
          className={`w-full py-4 rounded-xl font-black text-[10px] uppercase
            ${checking ? "bg-gray-800" : theme.button}`}
        >
          {checking ? "Validating..." : "Activate Access"}
        </button>

        <div className="mt-6 flex items-center justify-center gap-2 opacity-30">
          <ShieldCheck size={12} />
          <span className="text-[7px] uppercase">EAS Secure Layer</span>
        </div>
      </div>

      <footer className="opacity-10 text-[7px] uppercase font-black">
        EAS CORE SYSTEM v4
      </footer>
    </div>
  );
};

export default AccessPortal;
