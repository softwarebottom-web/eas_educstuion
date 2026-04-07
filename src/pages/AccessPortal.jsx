import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../api/config";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { Lock, Search, MessageCircle, ArrowLeft, ShieldCheck, XCircle } from "lucide-react";
import { playSound } from "../component/Intro";

const AccessPortal = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [userData, setUserData] = useState(null);
  const [ready, setReady] = useState(false);
  const [waConfig, setWaConfig] = useState({ link: "", open: true });

  useEffect(() => {
    const init = async () => {
      try {
        const saved = localStorage.getItem("eas_user_data");
        if (!saved) { navigate("/login"); return; }
        const session = JSON.parse(saved);
        if (!session?.id) { navigate("/login"); return; }

        const snap = await getDoc(doc(db, "users", session.id));
        if (!snap.exists()) {
          localStorage.removeItem("eas_user_data");
          localStorage.removeItem("eas_verified");
          navigate("/register"); return;
        }

        const data = snap.data();
        if (!data?.public?.memberId) { alert("DATA INVALID"); navigate("/register"); return; }

        const fullData = { id: snap.id, ...data.public };
        setUserData(fullData);

        // Fetch WhatsApp settings
        const waSnap = await getDoc(doc(db, "settings", "whatsapp"));
        if (waSnap.exists()) {
          const waData = waSnap.data();
          const genKey = `gen${data.public.gen}`;
          setWaConfig(waData[genKey] || { link: "", open: true });
        }

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
    playSound("click");
    setChecking(true);
    try {
      await new Promise((res) => setTimeout(res, 1200));
      localStorage.setItem("eas_verified", "true");
      playSound("success");
      navigate("/", { replace: true });
    } catch { alert("Verification failed"); }
    finally { setChecking(false); }
  };

  const handleLogout = async () => {
    playSound("click");
    try { await signOut(auth); } catch (_) {}
    localStorage.removeItem("eas_user_data");
    localStorage.removeItem("eas_verified");
    navigate("/login");
  };

  const handleWaClick = () => {
    if (!waConfig.open) { playSound("click"); return; }
    playSound("success");
    window.open(waConfig.link, "_blank");
  };

  const genColor = userData?.gen === 1
    ? { accent: "text-blue-400", button: "bg-blue-600 hover:bg-blue-700", border: "border-blue-500/30", glow: "shadow-[0_0_30px_rgba(59,130,246,0.3)]" }
    : { accent: "text-cyan-400", button: "bg-cyan-600 hover:bg-cyan-700", border: "border-cyan-500/30", glow: "shadow-[0_0_30px_rgba(34,211,238,0.3)]" };

  if (!ready) return (
    <div className="h-screen flex items-center justify-center bg-[#00050d] text-blue-500 font-bold">
      Syncing Identity...
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#00050d] p-6 gap-8 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none"
        style={{ backgroundImage: `radial-gradient(#1e3a8a 0.5px, transparent 0.5px)`, backgroundSize: "24px 24px" }} />

      <button onClick={handleLogout}
        className="absolute top-8 left-8 text-[9px] uppercase text-gray-500 flex items-center gap-2 hover:text-red-400">
        <ArrowLeft size={12} /> Logout
      </button>

      <div className="flex flex-col items-center gap-4 w-full max-w-sm z-10">

        {/* ID CARD SIMPLE */}
        <div className={`w-full p-5 rounded-3xl border bg-black/60 ${genColor.border} ${genColor.glow}`}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-900/40 border border-blue-500/30 flex items-center justify-center text-2xl font-black text-blue-300">
              {userData.nama?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <p className={`text-sm font-black ${genColor.accent}`}>{userData.nama}</p>
              <p className="text-[10px] text-gray-500">{userData.memberId}</p>
              <p className="text-[9px] text-gray-600">{userData.domisili} • GEN {userData.gen}</p>
            </div>
          </div>
        </div>

        {/* WHATSAPP BUTTON */}
        {waConfig.open && waConfig.link ? (
          <button onClick={handleWaClick}
            className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl uppercase text-[10px] font-black bg-green-600/10 border border-green-500/20 text-green-400 hover:bg-green-600 hover:text-white transition">
            <MessageCircle size={18} /> Join WhatsApp GEN {userData.gen}
          </button>
        ) : (
          <div className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl uppercase text-[10px] font-black bg-red-600/10 border border-red-500/20 text-red-400 cursor-not-allowed">
            <XCircle size={18} />
            {waConfig.link ? "Grup Ditutup Sementara" : "Link Belum Tersedia"}
          </div>
        )}
      </div>

      {/* SECURITY CHECK */}
      <div className={`w-full max-w-xs p-8 border rounded-[2.5rem] bg-black/60 text-center ${genColor.border} ${genColor.glow}`}>
        <div className="mb-4">
          {checking ? <Search className="animate-spin mx-auto" size={24} /> : <Lock className="mx-auto opacity-50" size={24} />}
        </div>
        <h2 className={`text-[11px] font-black uppercase ${genColor.accent}`}>Security Check</h2>
        <p className="text-[8px] text-gray-600 mb-6 uppercase">Server Validation Required</p>
        <button onClick={handleActivate} disabled={checking}
          className={`w-full py-4 rounded-xl font-black text-[10px] uppercase ${checking ? "bg-gray-800" : genColor.button}`}>
          {checking ? "Validating..." : "Activate Access"}
        </button>
        <div className="mt-6 flex items-center justify-center gap-2 opacity-30">
          <ShieldCheck size={12} />
          <span className="text-[7px] uppercase">EAS Secure Layer</span>
        </div>
      </div>

      <footer className="opacity-10 text-[7px] uppercase font-black">EAS CORE SYSTEM v4</footer>
    </div>
  );
};

export default AccessPortal;
