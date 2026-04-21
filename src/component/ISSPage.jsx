import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const ISSPage = ({ onBack }) => {
  const [pos, setPos] = useState(null);

  useEffect(() => {
    const fetchISS = () => {
      fetch("http://api.open-notify.org/iss-now.json")
        .then(res => res.json())
        .then(res => setPos(res.iss_position));
    };

    fetchISS();
    const interval = setInterval(fetchISS, 5000); // update tiap 5 detik

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen pb-28 p-5 bg-gradient-to-br from-[#0a0015] to-black">
      <button onClick={onBack} className="text-purple-400 text-xs mb-4">
        ← Kembali
      </button>

      <h1 className="text-lg font-black text-white mb-4">🛰️ ISS Tracker</h1>

      {!pos && <p className="text-gray-400">Loading...</p>}

      {pos && (
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="p-5 rounded-2xl bg-purple-900/20 border border-purple-500/20"
        >
          <p className="text-xs text-gray-400">Latitude</p>
          <p className="text-lg font-bold text-white">{pos.latitude}</p>

          <p className="text-xs text-gray-400 mt-3">Longitude</p>
          <p className="text-lg font-bold text-white">{pos.longitude}</p>
        </motion.div>
      )}
    </div>
  );
};

export default ISSPage;