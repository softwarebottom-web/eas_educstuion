import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getNasaAPOD } from "../api/nasaApi";
import { Globe, BookOpen, Zap, Award, LogOut, Shield } from "lucide-react";
import AdminAuth from "../pages/AdminAuth";
import { playSound } from "../component/Intro";
import { useEasStore, THEMES } from "../store/useStore";

const Dashboard = () => {
  const [apod, setApod] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const navigate = useNavigate();
  const { theme } = useEasStore();
  const t = THEMES[theme] || THEMES.dark;

  useEffect(() => {
    getNasaAPOD()
      .then(data => { if (data?.media_type === "image") setApod(data); else setApod(null); })
      .catch(() => setApod(null));

    try {
      const saved = localStorage.getItem("eas_user_data");
      if (!saved) { navigate("/register"); return; }
      const parsed = JSON.parse(saved);
      if (!parsed?.nama || !parsed?.gen) { localStorage.removeItem("eas_user_data"); navigate("/register"); return; }
      setUserData(parsed);
    } catch {
      localStorage.removeItem("eas_user_data");
      navigate("/register");
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const handleLogout = () => {
    playSound("click");
    if (window.confirm("TERMINATE SESSION?")) {
      localStorage.clear();
      navigate("/register", { replace: true });
    }
  };

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center" style={{ background: t.bg }}>
      <div className="font-black animate-pulse tracking-[0.3em] text-[10px] uppercase" style={{ color: t.accent }}>
        Initializing Command Center...
      </div>
    </div>
  );

  if (!userData) return null;

  return (
    <div className="min-h-screen text-white p-4 pb-24 font-mono" style={{ background: t.bg }}>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 border-b pb-4 mt-2" style={{ borderColor: t.border }}>
        <div>
          <h1 className="text-lg font-black italic" style={{ color: t.accent }}>EAS COMMAND</h1>
          <p className="text-[9px] text-gray-500 uppercase">Log: {userData.nama} // GEN {userData.gen}</p>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 bg-red-900/10 text-red-500 rounded-xl border border-red-900/20 active:scale-95 transition-all"
        >
          <LogOut size={18} />
        </button>
      </div>

      {/* NASA CARD */}
      <div className="rounded-3xl overflow-hidden border mb-6 backdrop-blur-sm" style={{ borderColor: t.border, background: "rgba(255,255,255,0.02)" }}>
        {apod ? (
          <>
            <img src={apod.url} alt="NASA APOD" className="w-full h-44 object-cover opacity-70 hover:opacity-100 transition" />
            <div className="p-4">
              <p className="text-xs italic" style={{ color: t.accent2 }}>{apod.title}</p>
            </div>
          </>
        ) : (
          <div className="h-44 flex items-center justify-center">
            <p className="text-xs text-gray-500">No Signal / Satellite Offline</p>
          </div>
        )}
      </div>

      {/* MENU */}
      <div className="grid grid-cols-2 gap-4">
        <MenuCard title="Library EAS" desc="Jurnal & Tesis" icon={<BookOpen size={20} style={{ color: t.accent }} />}
          onClick={() => { playSound("nav"); navigate("/library"); }} t={t} />
        <MenuCard title="Quiz Harian" desc="Test Skill" icon={<Zap size={20} className="text-yellow-500" />}
          onClick={() => { playSound("nav"); navigate("/quiz"); }} t={t} />
        <MenuCard title="About EAS" desc="Info Komunitas" icon={<Award size={20} className="text-green-500" />}
          onClick={() => { playSound("nav"); navigate("/about"); }} t={t} />
        <MenuCard title="Settings" desc="Konfigurasi" icon={<Globe size={20} className="text-purple-500" />}
          onClick={() => { playSound("nav"); navigate("/settings"); }} t={t} />

        {/* ADMIN */}
        <div className="col-span-2 mt-2">
          <button
            onClick={() => { playSound("click"); setShowAdminAuth(true); }}
            className="w-full flex items-center justify-center gap-2 bg-red-900/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
          >
            <Shield size={16} /> Admin Access
          </button>
        </div>

        {/* STATUS */}
        <div className="col-span-2 p-5 rounded-3xl border flex items-center justify-between mt-2"
          style={{ background: `${t.accent}10`, borderColor: `${t.accent}30` }}>
          <div>
            <h3 className="font-black text-xs uppercase">Class: GEN {userData.gen}</h3>
            <p className="text-[10px] italic" style={{ color: t.accent }}>EAS Digital Identity Active</p>
          </div>
          <Award size={20} style={{ color: t.accent }} />
        </div>
      </div>

      <AdminAuth isOpen={showAdminAuth} onClose={() => { playSound("click"); setShowAdminAuth(false); }} userData={userData} />
    </div>
  );
};

const MenuCard = ({ icon, title, desc, onClick, t }) => (
  <button onClick={onClick}
    className="p-5 rounded-3xl border transition-all active:scale-95 text-left hover:border-opacity-80"
    style={{ background: "rgba(255,255,255,0.02)", borderColor: t.border }}
  >
    <div className="mb-2">{icon}</div>
    <h3 className="text-[10px] font-black uppercase tracking-widest">{title}</h3>
    <p className="text-[8px] text-gray-500 mt-1 uppercase">{desc}</p>
  </button>
);

export default Dashboard;
              
