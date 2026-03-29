import { useEffect, useState } from "react";
import { getNasaAPOD } from "../api/nasaApi";
import { auth, db } from "../api/config";
import { doc, getDoc } from "firebase/firestore";
import { Globe, BookOpen, zap, Award, LogOut } from "lucide-react";

const Dashboard = () => {
  const [apod, setApod] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    getNasaAPOD().then(data => setApod(data));
    
    const fetchUser = async () => {
      const docSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (docSnap.exists()) setUserData(docSnap.data());
    };
    fetchUser();
  }, []);

  const handleLogout = () => auth.signOut();

  return (
    <div className="min-h-screen bg-[#00050d] text-white p-4 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b border-blue-900 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tighter text-blue-400">EAS COMMAND</h1>
          <p className="text-[10px] text-gray-500 uppercase">Welcome, {userData?.nama || 'Researcher'}</p>
        </div>
        <button onClick={handleLogout} className="p-2 bg-red-900/20 text-red-500 rounded-full"><LogOut size={18}/></button>
      </div>

      {/* NASA APOD Card */}
      <div className="bg-gray-900/40 rounded-2xl overflow-hidden border border-blue-900 mb-6">
        {apod && (
          <>
            <img src={apod.url} alt="NASA APOD" className="w-full h-48 object-cover opacity-70" />
            <div className="p-4">
              <h2 className="text-sm font-bold text-cyan-400">NASA PHOTO OF THE DAY</h2>
              <p className="text-xs text-gray-400 mt-1 line-clamp-2">{apod.title}</p>
            </div>
          </>
        )}
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-2 gap-4">
        <MenuCard icon={<Globe className="text-blue-500"/>} title="Berita Dunia" desc="Update Edukasi" />
        <MenuCard icon={<BookOpen className="text-purple-500"/>} title="Library EAS" desc="Jurnal & Tesis" />
        <MenuCard icon={<zap className="text-yellow-500"/>} title="Quiz Harian" desc="Test Skill" />
        
        {/* Gen Access Card */}
        <div className="col-span-2 bg-gradient-to-r from-blue-900/50 to-black p-4 rounded-xl border border-blue-500/30 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm">LOGIN GEN 1 & 2</h3>
            <p className="text-[10px] text-blue-300 italic">EAS Professional Badge Required</p>
          </div>
          <img src="/assets/gen1-badge.svg" className="w-10 h-10 animate-pulse" />
        </div>
      </div>
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
