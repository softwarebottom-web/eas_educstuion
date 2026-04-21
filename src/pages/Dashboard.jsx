import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getNasaAPOD } from "../api/nasaApi";
import { LogOut, Star, Brain, BookOpen, ShoppingBag, Globe2, MessageCircle, Radio, Orbit, FlaskConical, User, Settings, Shield, Zap, ChevronRight } from "lucide-react";
import AdminAuth from "../pages/AdminAuth";
import { playSound } from "../component/Intro";
import { getPoints } from "../pages/Market";
import { motion } from "framer-motion";

const P = { bg: "linear-gradient(135deg,#0a0015 0%,#080012 50%,#0a0015 100%)", accent: "#a855f7", accent2: "#ec4899", border: "rgba(168,85,247,0.18)" };

const ALL_MENUS = [
  { path: "/ai-quiz",   icon: Brain,       label: "AI Quiz",      desc: "Quiz astronomy AI harian",      color: "#a855f7" },
  { path: "/library",   icon: BookOpen,    label: "Library",      desc: "Jurnal & buku astronomi",       color: "#3b82f6" },
  { path: "/market",    icon: ShoppingBag, label: "Market",       desc: "Tukar point rewards",           color: "#ec4899" },
  { path: "/solar",     icon: Telescope,   label: "Solar System", desc: "Sistem tata surya 3D",          color: "#f59e0b" },
  { path: "/science",   icon: FlaskConical,label: "Science Hub",  desc: "APOD, ISS, exoplanet & more",  color: "#10b981" },
  { path: "/chat",      icon: MessageCircle,label:"Chat",         desc: "Debat & diskusi santai",        color: "#06b6d4" },
  { path: "/webinar",   icon: Radio,       label: "Webinar",      desc: "Sesi live & rapat EAS",         color: "#ef4444" },
  { path: "/apply",     icon: Shield,      label: "Lamar Staff",  desc: "Daftar jadi admin/moderator",   color: "#f97316" },
  { path: "/about",     icon: User,        label: "About",        desc: "Info & struktur EAS",           color: "#8b5cf6" },
  { path: "/settings",  icon: Settings,    label: "Settings",     desc: "Tema, suara & konfigurasi",     color: "#6b7280" },
];

const Dashboard = () => {
  const [apod, setApod] = useState(null);
  const [userData, setUserData] = useState(null);
  const [points, setPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getNasaAPOD().then(d => { if (d?.media_type === "image") setApod(d); }).catch(() => {});
    try {
      const saved = localStorage.getItem("eas_user_data");
      if (!saved) { navigate("/register"); return; }
      const parsed = JSON.parse(saved);
      if (!parsed?.nama || !parsed?.gen) { localStorage.removeItem("eas_user_data"); navigate("/register"); return; }
      setUserData(parsed);
      getPoints(parsed.id).then(setPoints).catch(() => {});
    } catch { localStorage.removeItem("eas_user_data"); navigate("/register"); }
    finally { setIsLoading(false); }
  }, [navigate]);

  const handleLogout = () => {
    playSound("click");
    if (window.confirm("TERMINATE SESSION?")) { localStorage.clear(); navigate("/register", { replace: true }); }
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center" style={{ background: "#0a0015" }}><div className="text-purple-400 font-black animate-pulse tracking-[0.3em] text-[10px] uppercase">Loading...</div></div>;
  if (!userData) return null;

  return (
    <div className="min-h-screen text-white pb-8 font-mono" style={{ background: P.bg }}>

      {/* HEADER */}
      <div className="px-5 pt-5 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-base font-black" style={{ background: `linear-gradient(135deg,${P.accent},${P.accent2})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            EAS COMMAND
          </h1>
          <p className="text-[9px] text-gray-500 uppercase mt-0.5">{userData.nama} · GEN {userData.gen}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Points */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border" style={{ background: "rgba(168,85,247,0.1)", borderColor: P.border }}>
            <Star size={11} className="text-yellow-400" fill="#fbbf24" />
            <span className="text-xs font-black text-yellow-400">{points}</span>
            <span className="text-[8px] text-gray-600">pts</span>
          </div>
          {/* Admin toggle button - bulat */}
          <button onClick={() => { playSound("click"); setShowAdminAuth(true); }}
            className="w-9 h-9 rounded-full flex items-center justify-center border transition-all"
            style={{ background: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.3)", color: "#ef4444" }}
            title="Admin Login">
            <Shield size={15} />
          </button>
          <button onClick={handleLogout} className="w-9 h-9 rounded-full flex items-center justify-center border" style={{ background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.2)", color: "#ef4444" }}>
            <LogOut size={15} />
          </button>
        </div>
      </div>

      {/* NASA APOD */}
      <div className="mx-5 mb-5 rounded-3xl overflow-hidden border" style={{ borderColor: P.border }}>
        {apod ? (
          <>
            <div className="relative">
              <img src={apod.url} alt="NASA APOD" className="w-full h-44 object-cover" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #0a001590, transparent)" }} />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: P.accent }}>NASA APOD · {new Date().toLocaleDateString("id-ID")}</p>
                <p className="text-xs text-white font-bold leading-tight">{apod.title}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="h-32 flex flex-col items-center justify-center gap-2" style={{ background: P.border }}>
            <Telescope size={24} style={{ color: P.accent, opacity: 0.4 }} />
            <p className="text-[9px] text-gray-600">No Signal / Satellite Offline</p>
          </div>
        )}
      </div>

      {/* MEMBER STATUS BAR */}
      <div className="mx-5 mb-5 p-3.5 rounded-2xl border flex items-center justify-between" style={{ background: "rgba(168,85,247,0.07)", borderColor: P.border }}>
        <div>
          <p className="text-[9px] text-gray-500 uppercase font-bold">{userData.memberId}</p>
          <p className="text-[10px] text-white font-bold mt-0.5">GEN {userData.gen} · EAS Member</p>
        </div>
        <div className="flex items-center gap-1 text-[9px] font-black px-2 py-1 rounded-full" style={{ background: "rgba(16,185,129,0.2)", color: "#10b981" }}>
          ● ACTIVE
        </div>
      </div>

      {/* ALL MENUS GRID */}
      <div className="px-5">
        <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-3">Menu Utama</p>
        <div className="grid grid-cols-2 gap-3">
          {ALL_MENUS.map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.button key={m.path}
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { playSound("nav"); navigate(m.path); }}
                className="p-4 rounded-2xl border text-left flex flex-col gap-2 transition-all"
                style={{ background: m.color + "08", borderColor: m.color + "25" }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: m.color + "20" }}>
                  <Icon size={16} style={{ color: m.color }} />
                </div>
                <div>
                  <p className="text-xs font-black text-white leading-tight">{m.label}</p>
                  <p className="text-[9px] text-gray-500 mt-0.5 leading-tight">{m.desc}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <AdminAuth isOpen={showAdminAuth} onClose={() => { playSound("click"); setShowAdminAuth(false); }} userData={userData} />
    </div>
  );
};

export default Dashboard;
