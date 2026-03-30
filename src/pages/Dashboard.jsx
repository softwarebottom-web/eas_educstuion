import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getNasaAPOD } from "../api/nasaApi";
import { Globe, BookOpen, Zap, Award, LogOut, Shield } from "lucide-react";
import AdminAuth from "../pages/AdminAuth"; // ✅ FIXED (dari pages)

const Dashboard = () => {
  const [apod, setApod] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdminAuth, setShowAdminAuth] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // 🔥 NASA API
    getNasaAPOD()
      .then(data => {
        if (data?.media_type === "image") setApod(data);
        else setApod(null);
      })
      .catch(() => setApod(null));

    // 🔥 USER DATA VALIDATION
    try {
      const saved = localStorage.getItem("eas_user_data");

      if (!saved) {
        navigate("/register");
        return;
      }

      const parsed = JSON.parse(saved);

      if (!parsed?.nama || !parsed?.gen) {
        localStorage.removeItem("eas_user_data");
        navigate("/register");
        return;
      }

      setUserData(parsed);
    } catch {
      localStorage.removeItem("eas_user_data");
      navigate("/register");
      return;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const handleLogout = () => {
    if (window.confirm("TERMINATE SESSION?")) {
      localStorage.clear();
      navigate("/register", { replace: true });
    }
  };

  // 🔥 LOADING
  if (isLoading) {
    return (
      <div className="h-screen bg-[#00050d] flex items-center justify-center">
        <div className="text-blue-500 font-black animate-pulse tracking-[0.3em] text-[10px] uppercase">
          Initializing Command Center...
        </div>
      </div>
    );
  }

  // 🔥 SAFETY (biar gak undefined)
  if (!userData) return null;

  return (
    <div className="min-h-screen bg-[#00050d] text-white p-4 pb-24 font-mono">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 border-b border-blue-900/30 pb-4 mt-2">
        <div>
          <h1 className="text-lg font-black text-blue-400 italic">
            EAS COMMAND
          </h1>
          <p className="text-[9px] text-gray-500 uppercase">
            Log: {userData.nama} // GEN {userData.gen}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="p-2 bg-red-900/10 text-red-500 rounded-xl border border-red-900/20 active:scale-95 transition-all"
        >
          <LogOut size={18} />
        </button>
      </div>

      {/* NASA CARD */}
      <div className="bg-gray-900/20 rounded-3xl overflow-hidden border border-blue-900/30 mb-6 backdrop-blur-sm">
        {apod ? (
          <>
            <img
              src={apod.url}
              alt="NASA APOD"
              className="w-full h-44 object-cover opacity-70 hover:opacity-100 transition"
            />
            <div className="p-4">
              <p className="text-xs text-cyan-400 italic">
                {apod.title}
              </p>
            </div>
          </>
        ) : (
          <div className="h-44 flex items-center justify-center">
            <p className="text-xs text-gray-500">
              No Signal / Satellite Offline
            </p>
          </div>
        )}
      </div>

      {/* MENU */}
      <div className="grid grid-cols-2 gap-4">

        <MenuCard
          title="Berita Dunia"
          desc="Update Edukasi"
          icon={<Globe size={20} className="text-blue-500" />}
          onClick={() => navigate("/news")}
        />

        <MenuCard
          title="Library EAS"
          desc="Jurnal & Tesis"
          icon={<BookOpen size={20} className="text-purple-500" />}
          onClick={() => navigate("/library")}
        />

        <MenuCard
          title="Quiz Harian"
          desc="Test Skill"
          icon={<Zap size={20} className="text-yellow-500" />}
          onClick={() => navigate("/quiz")}
        />

        <MenuCard
          title="About"
          desc="EAS Structure"
          icon={<Award size={20} className="text-green-500" />}
          onClick={() => navigate("/about")}
        />

        {/* 🔥 ADMIN ACCESS */}
        <div className="col-span-2 mt-2">
          <button
            onClick={() => setShowAdminAuth(true)}
            className="w-full flex items-center justify-center gap-2 bg-red-900/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
          >
            <Shield size={16} />
            Admin Access
          </button>
        </div>

        {/* STATUS */}
        <div className="col-span-2 bg-gradient-to-r from-blue-900/20 to-black p-5 rounded-3xl border border-blue-500/20 flex items-center justify-between mt-2">
          <div>
            <h3 className="font-black text-xs uppercase">
              Class: GEN {userData.gen}
            </h3>
            <p className="text-[10px] text-blue-400 italic">
              EAS Digital Identity Active
            </p>
          </div>
          <Award size={20} className="text-blue-400" />
        </div>
      </div>

      {/* 🔥 ADMIN AUTH MODAL */}
      <AdminAuth
        isOpen={showAdminAuth}
        onClose={() => setShowAdminAuth(false)}
        userData={userData}
      />
    </div>
  );
};

// 🔥 CARD COMPONENT
const MenuCard = ({ icon, title, desc, onClick }) => (
  <button
    onClick={onClick}
    className="bg-gray-900/30 p-5 rounded-3xl border border-blue-900/20 hover:border-cyan-500/50 transition-all active:scale-95 text-left"
  >
    <div className="mb-2">{icon}</div>
    <h3 className="text-[10px] font-black uppercase tracking-widest">
      {title}
    </h3>
    <p className="text-[8px] text-gray-500 mt-1 uppercase">
      {desc}
    </p>
  </button>
);

export default Dashboard;
