import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getNasaAPOD } from "../api/nasaApi";
import { Globe, BookOpen, Zap, Award, LogOut, Shield } from "lucide-react";
import AdminAuth from "../component/AdminAuth"; // 🔥 IMPORT

const Dashboard = () => {
  const [apod, setApod] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdminAuth, setShowAdminAuth] = useState(false); // 🔥 STATE ADMIN

  const navigate = useNavigate();

  useEffect(() => {
    getNasaAPOD()
      .then(data => {
        if (data?.media_type === "image") setApod(data);
        else setApod(null);
      })
      .catch(() => setApod(null));

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

  if (isLoading) {
    return (
      <div className="h-screen bg-[#00050d] flex items-center justify-center">
        <div className="text-blue-500 font-black animate-pulse tracking-[0.3em] text-[10px] uppercase">
          Initializing Command Center...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#00050d] text-white p-4 pb-24 font-mono">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 border-b border-blue-900/30 pb-4 mt-2">
        <div>
          <h1 className="text-lg font-black text-blue-400 italic">
            EAS COMMAND
          </h1>
          <p className="text-[9px] text-gray-500 uppercase">
            Log: {userData?.nama} // GEN {userData?.gen}
          </p>
        </div>

        <button onClick={handleLogout} className="p-2 bg-red-900/10 text-red-500 rounded-xl">
          <LogOut size={18}/>
        </button>
      </div>

      {/* NASA */}
      <div className="bg-gray-900/20 rounded-3xl overflow-hidden mb-6">
        {apod ? (
          <>
            <img src={apod.url} className="w-full h-44 object-cover opacity-70"/>
            <div className="p-4">
              <p className="text-xs text-cyan-400">{apod.title}</p>
            </div>
          </>
        ) : (
          <div className="h-44 flex items-center justify-center">
            <p className="text-xs text-gray-500">No Signal</p>
          </div>
        )}
      </div>

      {/* MENU */}
      <div className="grid grid-cols-2 gap-4">

        <MenuCard title="Berita" onClick={() => navigate("/news")} icon={<Globe />} />
        <MenuCard title="Library" onClick={() => navigate("/library")} icon={<BookOpen />} />
        <MenuCard title="Quiz" onClick={() => navigate("/quiz")} icon={<Zap />} />
        <MenuCard title="About" onClick={() => navigate("/about")} icon={<Award />} />

        {/* 🔥 ADMIN ACCESS */}
        <div className="col-span-2 mt-2">
          <button
            onClick={() => setShowAdminAuth(true)}
            className="w-full flex items-center justify-center gap-2 bg-red-900/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all"
          >
            <Shield size={16}/>
            Admin Access
          </button>
        </div>

        {/* STATUS */}
        <div className="col-span-2 bg-blue-900/10 p-4 rounded-3xl mt-2">
          <p className="text-xs">Class GEN {userData?.gen}</p>
        </div>
      </div>

      {/* 🔥 ADMIN MODAL */}
      <AdminAuth
        isOpen={showAdminAuth}
        onClose={() => setShowAdminAuth(false)}
        userData={userData}
      />
    </div>
  );
};

const MenuCard = ({ icon, title, onClick }) => (
  <button onClick={onClick} className="bg-gray-900/30 p-5 rounded-3xl text-left">
    <div>{icon}</div>
    <p className="text-xs mt-2">{title}</p>
  </button>
);

export default Dashboard;
