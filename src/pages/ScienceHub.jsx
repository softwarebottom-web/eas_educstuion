import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Atom,
  Satellite,
  Globe2,
  FlaskConical,
  Orbit,
  ChevronRight
} from "lucide-react";
import APODPage from "../component/APODPage";
import ISSPage from "../component/ISSPage";
import { playSound } from "../component/Intro";

const FEATURES = [
  {
    id: "apod",
    icon: Orbit, // ✅ pengganti Telescope
    color: "#8b5cf6",
    title: "NASA APOD",
    desc: "Astronomy Picture of the Day langsung dari NASA",
    component: "APOD"
  },
  {
    id: "iss",
    icon: Satellite,
    color: "#3b82f6",
    title: "ISS Tracker",
    desc: "Posisi real-time International Space Station",
    component: "ISS"
  },
  {
    id: "elements",
    icon: Atom,
    color: "#ec4899",
    title: "Tabel Periodik",
    desc: "Elemen kimia interaktif dengan info lengkap",
    component: "Elements"
  },
  {
    id: "exoplanet",
    icon: Orbit,
    color: "#f59e0b",
    title: "Exoplanet Explorer",
    desc: "Jelajahi planet di luar tata surya kita",
    component: "Exoplanet"
  },
  {
    id: "constellation",
    icon: Globe2,
    color: "#10b981",
    title: "Rasi Bintang",
    desc: "Peta rasi bintang interaktif & mitologi",
    component: "Constellation"
  },
  {
    id: "blackhole",
    icon: FlaskConical,
    color: "#ef4444",
    title: "Black Hole Sim",
    desc: "Simulasi gravitasi dan time dilation black hole",
    component: "BlackHoleSim"
  },
];

const EXOPLANETS = [
  { name: "Kepler-452b", type: "Super-Earth", distance: "1.400 ly", radius: "1.63 R⊕", temp: "265 K", star: "G-type", habitable: true },
  { name: "Proxima Centauri b", type: "Terrestrial", distance: "4.24 ly", radius: "~1.1 R⊕", temp: "234 K", star: "M-type", habitable: true },
  { name: "TRAPPIST-1e", type: "Terrestrial", distance: "40 ly", radius: "0.92 R⊕", temp: "251 K", star: "M-type", habitable: true },
  { name: "HD 40307g", type: "Super-Earth", distance: "42 ly", radius: "2.4 R⊕", temp: "~227 K", star: "K-type", habitable: true },
  { name: "55 Cancri e", type: "Super-Earth", distance: "41 ly", radius: "1.92 R⊕", temp: "2573 K", star: "G-type", habitable: false },
  { name: "WASP-12b", type: "Hot Jupiter", distance: "1270 ly", radius: "1.79 RJ", temp: "2590 K", star: "F-type", habitable: false },
];

const CONSTELLATIONS = [
  { name: "Orion", season: "Musim Dingin", stars: 7, myth: "Pemburu legendaris Yunani yang diubah menjadi rasi bintang oleh Zeus", notable: "Betelgeuse, Rigel, Alnitak" },
  { name: "Scorpius", season: "Musim Panas", stars: 18, myth: "Kalajengking yang membunuh Orion, keduanya tak pernah muncul bersamaan", notable: "Antares (bintang merah raksasa)" },
  { name: "Ursa Major", season: "Sepanjang tahun", stars: 7, myth: "Beruang besar, Callisto yang diubah Zeus, dikenal sebagai Big Dipper", notable: "Dubhe, Merak, Alioth" },
  { name: "Cassiopeia", season: "Musim Gugur", stars: 5, myth: "Ratu Ethiopia yang sombong, dihukum berputar mengelilingi kutub", notable: "Schedar, Caph" },
  { name: "Lyra", season: "Musim Panas", stars: 5, myth: "Kecapi Orpheus yang terlempar ke langit setelah kematiannya", notable: "Vega (bintang cerah ke-5)" },
  { name: "Perseus", season: "Musim Gugur-Dingin", stars: 19, myth: "Pahlawan yang membunuh Medusa dan menyelamatkan Andromeda", notable: "Algol (bintang ganda eclipsing)" },
];

const ELEMENTS_HIGHLIGHT = [
  { symbol: "H", name: "Hidrogen", num: 1, mass: "1.008", color: "#6366f1", category: "Nonmetal", desc: "Elemen paling melimpah di alam semesta. Bahan bakar bintang lewat fusi nuklir." },
  { symbol: "He", name: "Helium", num: 2, mass: "4.003", color: "#8b5cf6", category: "Noble Gas", desc: "Produk fusi hidrogen di bintang. Kedua paling melimpah di alam semesta." },
  { symbol: "O", name: "Oksigen", num: 8, mass: "15.999", color: "#3b82f6", category: "Nonmetal", desc: "Terbentuk di bintang masif. Penting untuk kehidupan dan pembentukan air." },
  { symbol: "Fe", name: "Besi", num: 26, mass: "55.845", color: "#ef4444", category: "Metal", desc: "Titik akhir fusi nuklir bintang normal. Inti bumi sebagian besar terdiri dari besi." },
  { symbol: "Au", name: "Emas", num: 79, mass: "196.97", color: "#f59e0b", category: "Metal", desc: "Terbentuk saat penggabungan bintang neutron (kilonova). Dibawa meteor ke Bumi." },
  { symbol: "C", name: "Karbon", num: 6, mass: "12.011", color: "#10b981", category: "Nonmetal", desc: "Basis seluruh kehidupan. Terbentuk di bintang via triple-alpha process." },
];

const ScienceHub = () => {
  const [active, setActive] = useState(null);
  const [selPlanet, setSelPlanet] = useState(null);
  const [selStar, setSelStar] = useState(null);
  const [selEl, setSelEl] = useState(null);

  if (active === "Exoplanet") {
    return (
      <div className="min-h-screen pb-28 p-5" style={{ background: "linear-gradient(135deg,#0a0015,#050010)" }}>
        <button onClick={() => setActive(null)} className="flex items-center gap-2 text-purple-400 text-xs mb-5">
          <ChevronRight className="rotate-180" size={14} /> Kembali
        </button>

        <h1 className="text-base font-black text-white mb-1 flex items-center gap-2">
          <Orbit size={18} style={{ color: "#f59e0b" }} /> Exoplanet Explorer
        </h1>

        <p className="text-[10px] text-gray-500 mb-4">
          Planet di luar tata surya yang terdeteksi teleskop
        </p>

        <div className="space-y-3">
          {EXOPLANETS.map(p => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 rounded-2xl border cursor-pointer"
              onClick={() => setSelPlanet(selPlanet?.name === p.name ? null : p)}
              style={{
                borderColor: p.habitable ? "#10b98130" : "#ef444420",
                background: p.habitable ? "#10b98108" : "#ef444408"
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-black text-white">{p.name}</h3>
                  <p className="text-[10px] text-gray-500">{p.type} · {p.distance}</p>
                </div>

                {p.habitable && (
                  <span className="text-[8px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-bold">
                    🌱 HABITABLE ZONE
                  </span>
                )}
              </div>

              <AnimatePresence>
                {selPlanet?.name === p.name && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {[["Radius",p.radius],["Suhu",p.temp],["Bintang Induk",p.star],["Jarak",p.distance]].map(([k,v]) => (
                        <div key={k} className="p-2 rounded-xl bg-black/30">
                          <p className="text-[8px] text-gray-600 uppercase">{k}</p>
                          <p className="text-[11px] text-white font-bold">{v}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (active === "BlackHoleSim") return <BlackHolePage onBack={() => setActive(null)} />;

  return (
    <div className="min-h-screen pb-28 p-5" style={{ background: "linear-gradient(135deg,#0a0015,#050010)" }}>
      <div className="mt-2 mb-6">
        <h1 className="text-lg font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1">
          🔭 Science Hub
        </h1>
        <p className="text-[10px] text-gray-500">
          Fitur sains & astronomi interaktif
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {FEATURES.map((f, i) => {
          const Icon = f.icon;

          return (
            <motion.button
              key={f.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.07 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                playSound("nav");
                setActive(f.component);
              }}
              className="p-5 rounded-3xl border text-left"
              style={{
                borderColor: f.color + "30",
                background: f.color + "08"
              }}
            >
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3" style={{ background: f.color + "20" }}>
                <Icon size={20} style={{ color: f.color }} />
              </div>

              <h3 className="text-xs font-black text-white mb-1">{f.title}</h3>
              <p className="text-[9px] text-gray-500 leading-relaxed">{f.desc}</p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

const BlackHolePage = ({ onBack }) => {
  const [mass, setMass] = useState(10);

  const rs = (2 * 6.674e-11 * mass * 1.989e30 / (3e8 ** 2) / 1000).toFixed(0);
  const temp = (6.17e-8 / (mass * 1.989e30) * 1e30).toExponential(2);
  const timeDilation = Math.sqrt(1 - (1 / (mass * 2))).toFixed(6);

  return (
    <div className="min-h-screen pb-28 p-5" style={{ background: "linear-gradient(135deg,#0a0015,#000005)" }}>
      <button onClick={onBack} className="flex items-center gap-2 text-purple-400 text-xs mb-5">
        <ChevronRight className="rotate-180" size={14} /> Kembali
      </button>

      <h1 className="text-base font-black text-white mb-1">🕳️ Black Hole Calculator</h1>
      <p className="text-[10px] text-gray-500 mb-5">Simulasi sifat fisika black hole berdasarkan massa</p>

      <div className="p-5 rounded-2xl border border-purple-800/30 bg-purple-900/10 mb-4">
        <label className="text-[10px] text-gray-500 uppercase font-bold block mb-2">
          Massa ({mass} M☉)
        </label>

        <input
          type="range"
          min={1}
          max={1000}
          value={mass}
          onChange={e => setMass(Number(e.target.value))}
          className="w-full accent-purple-500 mb-2"
        />
      </div>

      <div className="grid gap-3">
        {[
          { label: "Schwarzschild Radius", value: `${Number(rs).toLocaleString()} km` },
          { label: "Hawking Temp", value: `${temp} K` },
          { label: "Time Dilation", value: timeDilation },
        ].map(item => (
          <div key={item.label} className="p-4 rounded-2xl border border-gray-800 bg-black/40">
            <p className="text-[9px] text-purple-400 uppercase font-bold">{item.label}</p>
            <p className="text-lg font-black text-white">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScienceHub;
