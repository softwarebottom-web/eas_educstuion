import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getNasaAPOD } from "../api/nasaApi";
import {
  LogOut, Star, Brain, BookOpen, ShoppingBag,
  MessageCircle, Radio, Scan, FlaskConical, User,
  Settings, Shield
} from "lucide-react";
import AdminAuth from "../pages/AdminAuth";
import { playSound } from "../component/Intro";
import { getPoints } from "../pages/Market";
import { motion } from "framer-motion";

const FALLBACK_ICON = Scan;

const ALL_MENUS = [
  { path:"/ai-quiz",  icon:Brain,         label:"AI Quiz",       desc:"Quiz astronomy AI harian",     color:"#a855f7" },
  { path:"/library",  icon:BookOpen,      label:"Library",       desc:"Jurnal & buku astronomi",      color:"#3b82f6" },
  { path:"/market",   icon:ShoppingBag,   label:"Market",        desc:"Tukar point rewards",          color:"#ec4899" },
  { path:"/solar",    icon:Scan,          label:"Solar System",  desc:"Sistem tata surya 3D",         color:"#f59e0b" },
  { path:"/science",  icon:FlaskConical,  label:"Science Hub",   desc:"APOD, ISS, exoplanet & more", color:"#10b981" },
  { path:"/chat",     icon:MessageCircle, label:"Chat",          desc:"Debat & diskusi santai",       color:"#06b6d4" },
  { path:"/webinar",  icon:Radio,         label:"Webinar",       desc:"Sesi live & rapat EAS",        color:"#ef4444" },
  { path:"/apply",    icon:Shield,        label:"Lamar Staff",   desc:"Daftar jadi admin/moderator",  color:"#f97316" },
  { path:"/about",    icon:User,          label:"About",         desc:"Info & struktur EAS",          color:"#8b5cf6" },
  { path:"/settings", icon:Settings,      label:"Settings",      desc:"Konfigurasi akun",             color:"#6b7280" },
];

const Dashboard = () => {
  const [apod, setApod] = useState(null);
  const [userData, setUserData] = useState(null);
  const [points, setPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      try {
        // APOD
        const d = await getNasaAPOD();
        if (d?.media_type === "image") setApod(d);

        // USER DATA
        const saved = localStorage.getItem("eas_user_data");
        if (!saved) return navigate("/register");

        const parsed = JSON.parse(saved);
        if (!parsed?.nama || !parsed?.gen) {
          localStorage.removeItem("eas_user_data");
          return navigate("/register");
        }

        setUserData(parsed);

        // POINTS
        try {
          const pts = await getPoints(parsed.id);
          setPoints(pts || 0);
        } catch {
          setPoints(0);
        }

      } catch (err) {
        console.error("INIT ERROR:", err);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [navigate]);

  const handleLogout = () => {
    playSound("click");
    if (window.confirm("TERMINATE SESSION?")) {
      localStorage.clear();
      navigate("/register", { replace: true });
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: "#0a0015" }}>
        <div className="text-purple-400 font-black animate-pulse tracking-[0.3em] text-[10px] uppercase">
          Loading...
        </div>
      </div>
    );
  }

  if (!userData) return null;

  return (
    <div className="min-h-screen text-white pb-28 font-mono"
      style={{ background: "linear-gradient(135deg,#0a0015 0%,#080012 50%,#0a0015 100%)" }}>

      {/* HEADER */}
      <div className="px-5 pt-5 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-base font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            EAS COMMAND
          </h1>
          <p className="text-[9px] text-gray-500 uppercase mt-0.5">
            {userData.nama} · GEN {userData.gen}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-purple-700/30 bg-purple-900/20">
            <Star size={11} className="text-yellow-400" fill="#fbbf24" />
            <span className="text-xs font-black text-yellow-400">{points}</span>
            <span className="text-[8px] text-gray-600">pts</span>
          </div>

          <button
            onClick={() => { playSound("click"); setShowAdminAuth(true); }}
            className="w-9 h-9 rounded-full flex items-center justify-center border border-red-500/30 bg-red-900/10 text-red-400">
            <Shield size={15} />
          </button>

          <button
            onClick={handleLogout}
            className="w-9 h-9 rounded-full flex items-center justify-center border border-red-500/20 bg-red-900/10 text-red-400">
            <LogOut size={15} />
          </button>
        </div>
      </div>

      {/* APOD */}
      <div className="mx-5 mb-4 rounded-3xl overflow-hidden border border-purple-800/30">
        {apod ? (
          <div className="relative">
            <img src={apod.url} alt="NASA APOD" className="w-full h-44 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a001590] to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-[9px] font-bold text-purple-400 uppercase tracking-wider mb-0.5">
                NASA APOD · {new Date().toLocaleDateString("id-ID")}
              </p>
              <p className="text-xs text-white font-bold leading-tight">{apod.title}</p>
            </div>
          </div>
        ) : (
          <div className="h-32 flex flex-col items-center justify-center gap-2 bg-purple-900/10">
            <FALLBACK_ICON size={24} className="text-purple-500 opacity-40" />
            <p className="text-[9px] text-gray-600">No Signal / Satellite Offline</p>
          </div>
        )}
      </div>

      {/* MENU */}
      <div className="px-5">
        <div className="grid grid-cols-2 gap-3">
          {ALL_MENUS.map((m, i) => {
            const Icon = typeof m.icon === "function" ? m.icon : FALLBACK_ICON;

            return (
              <motion.button
                key={m.path}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { playSound("nav"); navigate(m.path); }}
                className="p-4 rounded-2xl border text-left flex flex-col gap-2"
                style={{ background: m.color + "08", borderColor: m.color + "25" }}
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: m.color + "20" }}>
                  <Icon size={16} style={{ color: m.color }} />
                </div>

                <div>
                  <p className="text-xs font-black text-white">{m.label}</p>
                  <p className="text-[9px] text-gray-500">{m.desc}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <AdminAuth
        isOpen={showAdminAuth}
        onClose={() => { playSound("click"); setShowAdminAuth(false); }}
        userData={userData}
      />
    </div>
  );
};

export default Dashboard;
