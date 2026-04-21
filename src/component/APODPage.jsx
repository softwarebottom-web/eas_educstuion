import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const NASA_KEY = "W12TfPxwgbBvpexTbXE9pRDEVhmxDpZHdAZ01FLo";

const APODPage = ({ onBack }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://api.nasa.gov/planetary/apod?api_key=${NASA_KEY}`)
      .then(res => res.json())
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen pb-28 p-5 bg-gradient-to-br from-[#0a0015] to-black">
      <button onClick={onBack} className="text-purple-400 text-xs mb-4">
        ← Kembali
      </button>

      <h1 className="text-lg font-black text-white mb-3">🌌 NASA APOD</h1>

      {loading && <p className="text-gray-400 text-sm">Loading...</p>}

      {data && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <img
            src={data.url}
            alt={data.title}
            className="rounded-2xl mb-4"
          />
          <h2 className="text-sm font-bold text-white">{data.title}</h2>
          <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
            {data.explanation}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default APODPage;