import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Ganti handleLogout manual
import { getNasaAPOD } from "../api/nasaApi";
import { Globe, BookOpen, Zap, Award, LogOut } from "lucide-react";

const Dashboard = () => {
  const [apod, setApod] = useState(null);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Ambil NASA APOD (Tetap ada buat vibe Astronomi lo)
    getNasaAPOD().then(data => setApod(data));
    
    // 2. AMBIL DATA DARI LOCALSTORAGE (Bukan Firestore Auth)
    const saved = localStorage.getItem("eas_user_data");
    if (saved) {
      setUserData(JSON.parse(saved));
    } else {
      // Jika data ilang/kosong, tendang balik ke register
      navigate("/register");
    }
  }, [navigate]);

  const handleLogout = () => {
    if (window.confirm("LOGOUT: Putus koneksi dari EAS Satellite?")) {
      localStorage.clear(); // Hapus semua session
      window.location.href = "/register";
    }
  };

  return (
    <div className="min-h-screen bg-[#00050d] text-white p-4 pb-24 font-sans selection:bg-blue-500/30">
      
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8 border-b border-blue-900/30 pb-4 mt-4">
        <div>
          <h1 className="text-[10px] font-black tracking-[0.5em] text-blue-500 uppercase italic">EAS COMMAND CENTER</h1>
          <p className="text-sm font-bold tracking-tight text-gray-300">
            Welcome, {userData?.nama || 'Researcher'}
          </p>
        </div>
        <button 
          onClick={handleLogout} 
          className="p-3 bg-red-900/10 text-red-500 rounded-2xl border border-red-900/20 active:scale-95 transition-all"
        >
          <LogOut size={18}/>
        </button>
      </div>

      {/* NASA APOD Card (ASTRONOMY THEME) */}
      <div className="bg-gray-900/20 rounded-[2rem] overflow-hidden border border-blue-900/30 mb-8 backdrop-blur-md">
        {apod ? (
          <>
            <img src={apod.url} alt="NASA APOD" className="w-full h-52 object-cover opacity-60 hover:opacity-100 transition-opacity duration-700" />
            <div className="p-6 bg-gradient-to-t from-[#00050d] to-transparent">
              <div className="flex items-center gap-2 mb-2">
                <Globe size={12} className="text-cyan-400 animate-spin-slow" />
                <h2 className="text-[9px] font-black text-cyan-400 tracking-widest uppercase">NASA Deep Space Feed</h2>
              </div>
              <p className="text-[11px] font-bold text-gray-200 line-clamp-1 italic">{apod.title}</p>
            </div>
          </>
        ) : (
          <div className="h-52 w-full bg-blue-950/10 animate-pulse flex items-center justify-center">
            <p className="text-[8px] tracking-[0.4em] text-blue-900 font-black">LINKING TO SATELLITE...</p>
          </div>
        )}
      </div>

      {/* Stats Quick View */}
      <div className="flex gap-4 mb-8">
        <div className="flex-1 bg-blue-950/20 border border-blue-500/20 p-4 rounded-2xl">
          <p className="text-[8px] text-blue-500 font-black uppercase mb-1">Status</p>
          <p className="text-xs font-bold text-white uppercase italic">GEN {userData?.gen || "2"}</p>
        </div>
        <div className="flex-1 bg-blue-950/20 border border-blue-500/20 p-4 rounded-2xl">
          <p className="text-[8px] text-blue-500 font-black uppercase mb-1">Rank</p>
          <p className="text-xs font-bold text-white uppercase italic">Active Member</p>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-2 gap-4">
        <MenuCard icon={<Globe size={20} className="text-blue-500"/>} title="Berita Dunia" desc="Update Edukasi" />
        <MenuCard icon={<BookOpen size={20} className="text-purple-500"/>} title="Library EAS" desc="Jurnal & Tesis" onClick={() => navigate("/library")} />
        <MenuCard icon={<Zap size={20} className="text-yellow-500"/>} title="Quiz Harian" desc="Test Skill" onClick={() => navigate("/quiz")} />
        <MenuCard icon={<Award size={20} className="text-green-500"/>} title="Database" desc="Archive Gen" />
      </div>

      {/* Footer Branding */}
      <footer className="mt-12 text-center opacity-20">
        <p className="text-[7px] font-bold tracking-[1em] uppercase">Marga EAS • System v3.0</p>
      </footer>
    </div>
  );
};

const MenuCard = ({ icon, title, desc, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-blue-950/10 p-5 rounded-3xl border border-blue-900/20 hover:border-blue-500/50 transition-all cursor-pointer group active:scale-95"
  >
    <div className="mb-4 bg-gray-900/50 w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-200">{title}</h3>
    <p className="text-[8px] text-gray-600 mt-1 uppercase tracking-tighter leading-tight">{desc}</p>
  </div>
);

export default Dashboard;
