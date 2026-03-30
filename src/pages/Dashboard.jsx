import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getNasaAPOD } from "../api/nasaApi";
import { Globe, BookOpen, Zap, Award, LogOut } from "lucide-react"; 

const Dashboard = () => {
  const [apod, setApod] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // 🔥 NASA API (AMAN)
    getNasaAPOD()
      .then(data => {
        // fallback kalau bukan image (kadang NASA kirim video)
        if (data?.media_type === "image") {
          setApod(data);
        } else {
          setApod(null);
        }
      })
      .catch(err => {
        console.log("NASA API Error:", err);
        setApod(null);
      });

    // 🔥 LOCAL STORAGE SAFE PARSE
    try {
      const saved = localStorage.getItem("eas_user_data");

      if (!saved) {
        navigate("/register");
        return;
      }

      const parsed = JSON.parse(saved);

      // VALIDASI DATA WAJIB
      if (!parsed?.nama || !parsed?.gen) {
        localStorage.removeItem("eas_user_data");
        navigate("/register");
        return;
      }

      setUserData(parsed);
    } catch (err) {
      console.error("UserData Error:", err);
      localStorage.removeItem("eas_user_data");
      navigate("/register");
      return;
    } finally {
      setIsLoading(false);
    }

  }, [navigate]);

  const handleLogout = () => {
    if (window.confirm("TERMINATE SESSION: Putus koneksi dari Satelit EAS?")) {
      localStorage.clear();
      navigate("/register", { replace: true }); // 🔥 ganti dari window.location
    }
  };

  // 🔥 LOADING SCREEN
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
    <div className="min-h-screen bg-[#00050d] text-white p-4 pb-24 font-mono animate-in fade-in duration-700">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 border-b border-blue-900/30 pb-4 mt-2">
        <div>
          <h1 className="text-lg font-black tracking-tighter text-blue-400 italic">
            EAS COMMAND
          </h1>
          <p className="text-[9px] text-gray-500 uppercase tracking-[0.2em]">
            Log: {userData?.nama || 'Unknown'} // GEN {userData?.gen || 'X'}
          </p>
        </div>

        <button 
          onClick={handleLogout} 
          className="p-2.5 bg-red-900/10 text-red-500 rounded-xl border border-red-900/20 active:scale-95 transition-all"
        >
          <LogOut size={18}/>
        </button>
      </div>

      {/* NASA CARD */}
      <div className="bg-gray-900/20 rounded-3xl overflow-hidden border border-blue-900/30 mb-6 backdrop-blur-sm">
        {apod ? (
          <>
            <img 
              src={apod.url} 
              alt="NASA APOD" 
              className="w-full h-44 object-cover opacity-60 hover:opacity-100 transition-opacity duration-1000" 
              loading="lazy"
            />
            <div className="p-4 bg-gradient-to-t from-[#00050d] to-transparent">
              <h2 className="text-[10px] font-black text-cyan-400 tracking-widest uppercase mb-1">
                Deep Space Daily Feed
              </h2>
              <p className="text-[11px] text-gray-300 italic line-clamp-1">
                {apod.title}
              </p>
            </div>
          </>
        ) : (
          <div className="h-44 w-full bg-blue-950/10 animate-pulse flex items-center justify-center">
            <p className="text-[8px] tracking-widest text-blue-800 font-black uppercase">
              No Signal / Satellite Offline
            </p>
          </div>
        )}
      </div>

      {/* MENU */}
      <div className="grid grid-cols-2 gap-4">
        <MenuCard 
          icon={<Globe size={20} className="text-blue-500"/>} 
          title="Berita Dunia" 
          desc="Update Edukasi" 
          onClick={() => navigate("/news")} // ⚠️ pastikan route ada
        />
        <MenuCard 
          icon={<BookOpen size={20} className="text-purple-500"/>} 
          title="Library EAS" 
          desc="Jurnal & Tesis" 
          onClick={() => navigate("/library")}
        />
        <MenuCard 
          icon={<Zap size={20} className="text-yellow-500"/>} 
          title="Quiz Harian" 
          desc="Test Skill" 
          onClick={() => navigate("/quiz")}
        />
        <MenuCard 
          icon={<Award size={20} className="text-green-500"/>} 
          title="About" 
          desc="EAS Structure" 
          onClick={() => navigate("/about")}
        />

        {/* STATUS */}
        <div className="col-span-2 bg-gradient-to-r from-blue-900/20 to-black p-5 rounded-3xl border border-blue-500/20 flex items-center justify-between mt-2 shadow-lg shadow-blue-900/10">
          <div>
            <h3 className="font-black text-[11px] tracking-widest uppercase">
              Class: GEN {userData?.gen || "X"}
            </h3>
            <p className="text-[9px] text-blue-400 italic">
              EAS Digital Identity Active
            </p>
          </div>

          <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/30 animate-pulse">
             <Award size={20} className="text-blue-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

const MenuCard = ({ icon, title, desc, onClick }) => (
  <button 
    onClick={onClick}
    className="bg-gray-900/30 p-5 rounded-3xl border border-blue-900/20 hover:border-cyan-500/50 transition-all active:scale-95 text-left w-full"
  >
    <div className="mb-3">{icon}</div>
    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-200">
      {title}
    </h3>
    <p className="text-[8px] text-gray-500 mt-1 uppercase leading-tight">
      {desc}
    </p>
  </button>
);

export default Dashboard;
