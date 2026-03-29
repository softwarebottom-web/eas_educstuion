import React, { useState, useEffect } from "react";

const Dashboard = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // FIX: Pastikan mengambil dari 'eas_user_data'
    const saved = localStorage.getItem("eas_user_data");
    if (saved) {
      setUserData(JSON.parse(saved));
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#00050d] p-6 text-white font-mono">
      {/* STATS SECTION */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-4 bg-blue-950/20 border border-blue-900/30 rounded-2xl">
          <p className="text-[8px] text-blue-500 uppercase font-black">Points</p>
          <h2 className="text-xl font-black">120</h2>
        </div>
        <div className="p-4 bg-blue-950/20 border border-blue-900/30 rounded-2xl">
          <p className="text-[8px] text-blue-500 uppercase font-black">Class</p>
          <h2 className="text-xl font-black italic">
            GEN {userData?.gen || "1"} {/* Ambil dari data pendaftaran */}
          </h2>
        </div>
      </div>

      {/* SPACE FEED (Gambar yang ada di screenshot kamu) */}
      <div className="bg-gray-900/20 border border-gray-800 rounded-3xl overflow-hidden mb-6">
        <img 
          src="https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=2070" 
          alt="Space" 
          className="w-full h-40 object-cover opacity-60"
        />
        <div className="p-6">
          <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-2">Space Daily Feed</h3>
          <h4 className="font-bold text-sm mb-2 italic">A Message from Earth</h4>
          <p className="text-[10px] text-gray-500 leading-relaxed">
            Menampilkan transmisi terbaru dari klaster bintang globular M13...
          </p>
        </div>
      </div>

      {/* LIST UPDATES (Yang kosong di screenshot kamu) */}
      <div className="p-6 bg-blue-950/10 border border-blue-900/20 rounded-3xl">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-blue-500">System Updates</h3>
        <ul className="space-y-3">
          <li className="flex items-center gap-3 text-[10px] text-gray-400">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full shadow-[0_0_10px_blue]"></span>
            Pendaftaran Gen 3 Segera Dibuka.
          </li>
          <li className="flex items-center gap-3 text-[10px] text-gray-400">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full shadow-[0_0_10px_blue]"></span>
            Vault Library Diperbarui.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
