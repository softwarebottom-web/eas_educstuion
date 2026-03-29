import { useEffect, useState } from "react";
import { getNasaAPOD } from "../api/nasaApi";
import { auth, db } from "../api/config";
import { doc, getDoc } from "firebase/firestore";
// PERBAIKAN: Zap dengan Z kapital
import { Globe, BookOpen, Zap, Award, LogOut } from "lucide-react";

const Dashboard = () => {
  const [apod, setApod] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ambil Data NASA
    getNasaAPOD().then(data => setApod(data));
    
    // Ambil Data User
    const fetchUser = async () => {
      if (auth.currentUser) {
        try {
          const docSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
          if (docSnap.exists()) setUserData(docSnap.data());
        } catch (error) {
          console.error("Error:", error);
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    auth.signOut();
    localStorage.removeItem("eas_user");
    localStorage.removeItem("eas_verified");
  };

  if (loading) return (
    <div className="h-screen bg-[#00050d] flex items-center justify-center">
      <div className="text-blue-500 font-black animate-pulse tracking-widest text-[10px]">INITIALIZING COMMAND...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#00050d] text-white p-4 pb-24">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b border-blue-900 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tighter text-blue-400">EAS COMMAND</h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">Welcome, {userData?.nama || 'Researcher'}</p>
        </div>
        <button onClick={handleLogout} className="p-2 bg-red-900/20 text-red-500 rounded-full hover:bg-red-900/40">
          <LogOut size={18}/>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-gray-900/40 p-4 rounded-xl border border-blue-900/50 flex items-center gap-3">
          <Zap className="text-yellow-400" size={20} />
          <div>
            <div className="text-lg font-bold leading-none">120</div>
            <div className="text-[8px] text-gray-400 uppercase tracking-tighter">Points</div>
          </div>
        </div>
        <div className="bg-gray-900/40 p-4 rounded-xl border border-blue-900/50 flex items-center gap-3">
          <Award className="text-blue-400" size={20} />
          <div>
            <div className="text-lg font-bold leading-none">Gen 1</div>
            <div className="text-[8px] text-gray-400 uppercase tracking-tighter">Class</div>
          </div>
        </div>
      </div>

      {/* APOD Card */}
      <div className="bg-gray-900/40 rounded-2xl overflow-hidden border border-blue-900 mb-6">
        {apod ? (
          <>
            <img src={apod.url} alt="NASA" className="w-full h-40 object-cover" />
            <div className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Globe size={10} className="text-blue-500" />
                <span className="text-[9px] text-blue-400 uppercase font-bold">Space Daily Feed</span>
              </div>
              <h2 className="text-xs font-bold mb-1 truncate">{apod.title}</h2>
              <p className="text-[10px] text-gray-400 line-clamp-2">{apod.explanation}</p>
            </div>
          </>
        ) : (
          <div className="h-40 flex items-center justify-center text-[10px] text-gray-600 italic">FETCHING NEBULA DATA...</div>
        )}
      </div>

      {/* News Update */}
      <div className="bg-gray-900/40 p-4 rounded-2xl border border-blue-900">
        <div className="flex items-center gap-2 mb-3 text-blue-500">
          <BookOpen size={16}/>
          <h3 className="text-xs font-bold uppercase tracking-widest">System Updates</h3>
        </div>
        <ul className="space-y-2 text-[10px] text-gray-400">
          <li className="flex gap-2"><span className="text-blue-500">▶</span> Pendaftaran Gen 3 Segera Dibuka.</li>
          <li className="flex gap-2"><span className="text-blue-500">▶</span> Vault Library Diperbarui.</li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
