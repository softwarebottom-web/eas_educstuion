import { useEffect, useState } from "react";
import { getNasaAPOD } from "../api/nasaApi";
import { auth, db } from "../api/config";
import { doc, getDoc } from "firebase/firestore";
// PERBAIKAN: Ganti 'zap' menjadi 'Zap' (PascalCase)
import { Globe, BookOpen, Zap, Award, LogOut } from "lucide-react";

const Dashboard = () => {
  const [apod, setApod] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true); // State loading tambahan

  useEffect(() => {
    // 1. Ambil Data NASA APOD
    getNasaAPOD().then(data => setApod(data));
    
    // 2. Ambil Data User dari Firestore
    const fetchUser = async () => {
      // Keamanan: Cek apakah user sudah login
      if (auth.currentUser) {
        try {
          const docRef = doc(db, "users", auth.currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            console.log("No such user document!");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
      setLoading(false); // Selesai memuat data user
    };
    
    fetchUser();
  }, []);

  const handleLogout = () => {
    auth.signOut();
    // Opsional: Hapus localStorage jika kamu memakainya untuk session
    localStorage.removeItem("eas_user");
    localStorage.removeItem("eas_verified");
  };

  // Tampilkan Loading jika data user belum siap
  if (loading) {
    return (
      <div className="h-screen bg-[#00050d] flex items-center justify-center">
        <div className="text-blue-500 font-black animate-pulse tracking-widest text-xs">LOADING EAS COMMAND...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#00050d] text-white p-4 pb-20 selection:bg-blue-500">
      {/* --- HEADER --- */}
      <div className="flex justify-between items-center mb-8 border-b border-blue-900 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tighter text-blue-400">EAS COMMAND</h1>
          {/* Gunakan Optional Chaining (?.) untuk keamanan */}
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">
            Welcome, {userData?.nama || 'Researcher'}
          </p>
        </div>
        <button 
          onClick={handleLogout} 
          className="p-2 bg-red-900/20 text-red-500 rounded-full hover:bg-red-900/40 transition-colors"
          title="Logout"
        >
          <LogOut size={18}/>
        </button>
      </div>

      {/* --- QUICK ACTIONS / STATS --- */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-gray-900/40 p-4 rounded-xl border border-blue-900/50 flex items-center gap-3">
          <Zap className="text-yellow-400" size={24} />
          <div>
            <div className="text-lg font-bold">120</div>
            <div className="text-[10px] text-gray-400 uppercase">EAS Points</div>
          </div>
        </div>
        <div className="bg-gray-900/40 p-4 rounded-xl border border-blue-900/50 flex items-center gap-3">
          <Award className="text-blue-400" size={24} />
          <div>
            <div className="text-lg font-bold">Gen 1</div>
            <div className="text-[10px] text-gray-400 uppercase">Member Class</div>
          </div>
        </div>
      </div>

      {/* --- NASA APOD CARD --- */}
      <div className="bg-gray-900/40 rounded-2xl overflow-hidden border border-blue-900 mb-6 group">
        {apod ? (
          <>
            <img 
              src={apod.url} 
              alt={apod.title} 
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Globe size={12} className="text-blue-500" />
                <span className="text-[10px] text-blue-400 uppercase tracking-widest">Astronomy Picture of the Day</span>
              </div>
              <h2 className="text-sm font-bold mb-2 leading-tight">{apod.title}</h2>
              <p className="text-[11px] text-gray-400 line-clamp-3 leading-relaxed">{apod.explanation}</p>
            </div>
          </>
        ) : (
          <div className="h-48 flex items-center justify-center text-gray-700 text-xs tracking-widest animate-pulse">
            LOADING ASTRO DATA...
          </div>
        )}
      </div>

      {/* --- LATEST UPDATES / NEWS --- */}
      <div className="bg-gray-900/40 p-5 rounded-2xl border border-blue-900">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen size={20} className="text-blue-500"/>
          <h3 className="text-md font-bold tracking-tight">Latest EAS Updates</h3>
        </div>
        <ul className="space-y-3 text-[11px] text-gray-300 list-disc list-inside">
          <li>Pendaftaran Marga EAS Gen 3 segera dibuka, siapkan berkas Anda!</li>
          <li>Materi baru tentang Exoplanet sudah tersedia di Library.</li>
          <li>Jadwal Quiz Mingguan akan diupdate hari Sabtu ini.</li>
        </ul>
      </div>

    </div>
  );
};

export default Dashboard;
    </div>
  );
};

const MenuCard = ({ icon, title, desc }) => (
  <div className="bg-gray-900/60 p-4 rounded-xl border border-blue-900/50 hover:border-cyan-500 transition cursor-pointer">
    <div className="mb-2">{icon}</div>
    <h3 className="text-xs font-bold uppercase tracking-widest">{title}</h3>
    <p className="text-[9px] text-gray-500 mt-1">{desc}</p>
  </div>
);

export default Dashboard;
