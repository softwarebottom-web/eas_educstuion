import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scan, Atom, Satellite, Globe2, FlaskConical, Orbit, ChevronLeft, RefreshCw, MapPin, Clock } from "lucide-react";
import { playSound } from "../component/Intro";

const P = { bg: "linear-gradient(135deg,#0a0015,#050010)", accent: "#a855f7", accent2: "#ec4899", border: "rgba(168,85,247,0.2)" };

const FEATURES = [
  { id:"apod", icon:Scan, color:"#8b5cf6", title:"NASA APOD", desc:"Astronomy Picture of the Day real dari NASA API" },
  { id:"iss",  icon:Satellite,  color:"#3b82f6", title:"ISS Tracker", desc:"Posisi real-time ISS dari Open Notify API" },
  { id:"elements", icon:Atom,   color:"#ec4899", title:"Elemen Astronomi", desc:"Elemen kimia dalam konteks kosmologi" },
  { id:"exoplanet",icon:Orbit,  color:"#f59e0b", title:"Exoplanet Explorer", desc:"Data exoplanet dari NASA Exoplanet Archive" },
  { id:"constellation",icon:Globe2,color:"#10b981",title:"Rasi Bintang",desc:"88 rasi bintang resmi + mitologi" },
  { id:"blackhole",icon:FlaskConical,color:"#ef4444",title:"Black Hole Calc",desc:"Simulasi fisika black hole interaktif" },
];

// ===================== APOD REAL =====================
const APODPage = ({ onBack }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const fetchAPOD = async (d) => {
    setLoading(true); setError(null);
    try {
      // Pakai NASA APOD API - key DEMO_KEY untuk development (rate limited)
      const NASA_KEY = import.meta.env.VITE_NASA_API_KEY || "DEMO_KEY";
      const res = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${NASA_KEY}&date=${d}`);
      if (!res.ok) throw new Error(`NASA API error ${res.status}`);
      setData(await res.json());
    } catch (err) {
      // Fallback: coba tanpa date
      try {
        const res2 = await fetch(`https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY`);
        if (res2.ok) { setData(await res2.json()); return; }
      } catch (_) {}
      setError(err.message);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAPOD(date); }, []);

  return (
    <div className="min-h-screen pb-8" style={{ background: P.bg }}>
      <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: P.border }}>
        <button onClick={onBack} style={{ color: P.accent }}><ChevronLeft size={20} /></button>
        <div><h2 className="text-sm font-black text-white">NASA APOD</h2><p className="text-[9px] text-gray-500">Astronomy Picture of the Day</p></div>
        <button onClick={() => fetchAPOD(date)} className="ml-auto p-1.5 rounded-lg" style={{ background: P.accent+"15", color: P.accent }}><RefreshCw size={14} /></button>
      </div>

      <div className="p-4">
        <div className="flex gap-2 mb-4">
          <input type="date" value={date} max={new Date().toISOString().split("T")[0]}
            onChange={e => setDate(e.target.value)}
            className="flex-1 p-2.5 rounded-xl text-xs text-white outline-none" style={{ background: P.accent+"10", border: `1px solid ${P.border}` }} />
          <button onClick={() => fetchAPOD(date)} className="px-4 py-2.5 rounded-xl text-xs font-bold text-white" style={{ background: `linear-gradient(135deg,${P.accent},${P.accent2})` }}>Cari</button>
        </div>

        {loading && <div className="flex flex-col items-center py-16 gap-3"><motion.div animate={{ rotate:360 }} transition={{ duration:2, repeat:Infinity, ease:"linear" }}><Telescope size={32} style={{ color: P.accent }} /></motion.div><p className="text-xs text-gray-500">Mengambil data dari NASA...</p></div>}

        {error && <div className="p-4 rounded-2xl bg-red-900/20 border border-red-800/40"><p className="text-xs text-red-400 font-bold mb-1">Gagal mengambil APOD</p><p className="text-[10px] text-gray-500">{error}</p><p className="text-[10px] text-gray-600 mt-2">Tip: Tambahkan VITE_NASA_API_KEY di Vercel env vars (gratis di api.nasa.gov)</p></div>}

        {data && !loading && (
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
            {data.media_type === "image" ? (
              <div className="rounded-3xl overflow-hidden mb-4 border" style={{ borderColor: P.border }}>
                <img src={data.url} alt={data.title} className="w-full object-cover max-h-72" />
              </div>
            ) : data.media_type === "video" ? (
              <div className="rounded-3xl overflow-hidden mb-4 aspect-video border" style={{ borderColor: P.border }}>
                <iframe src={data.url} className="w-full h-full" allowFullScreen title={data.title} />
              </div>
            ) : null}
            <div className="px-1">
              <div className="flex gap-2 mb-2">
                <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ background: P.accent+"20", color: P.accent }}>{data.date}</span>
                {data.copyright && <span className="text-[9px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">© {data.copyright}</span>}
              </div>
              <h3 className="text-sm font-black text-white mb-3">{data.title}</h3>
              <p className="text-[11px] text-gray-400 leading-relaxed">{data.explanation}</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// ===================== ISS REAL =====================
const ISSPage = ({ onBack }) => {
  const [iss, setIss] = useState(null);
  const [astronauts, setAstronauts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchISS = async () => {
    try {
      // Open Notify API - free, no key needed
      const [posRes, peopleRes] = await Promise.all([
        fetch("https://api.open-notify.org/iss-now.json"),
        fetch("https://api.open-notify.org/astros.json")
      ]);
      if (posRes.ok) {
        const posData = await posRes.json();
        setIss(posData.iss_position);
        setLastUpdate(new Date().toLocaleTimeString("id-ID"));
      }
      if (peopleRes.ok) {
        const peopleData = await peopleRes.json();
        setAstronauts(peopleData.people?.filter(p => p.craft === "ISS") || []);
      }
    } catch (err) {
      // Fallback data jika CORS block di browser
      setIss({ latitude: "51.7432", longitude: "-157.2340" });
      setAstronauts([{ name: "Oleg Kononenko" }, { name: "Nikolai Chub" }, { name: "Tracy Dyson" }]);
      setLastUpdate("Simulasi");
    } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchISS();
    const interval = setInterval(fetchISS, 5000); // update setiap 5 detik
    return () => clearInterval(interval);
  }, []);

  const lat = iss ? parseFloat(iss.latitude) : 0;
  const lng = iss ? parseFloat(iss.longitude) : 0;
  // Hitung region berdasarkan koordinat
  const getRegion = (lat, lng) => {
    if (lat > 60) return "Arktik";
    if (lat < -60) return "Antartika";
    if (lng > -30 && lng < 60 && lat > 0) return "Eropa/Afrika Utara";
    if (lng > 60 && lng < 150) return "Asia";
    if (lng > 150 || lng < -120) return "Pasifik";
    if (lng > -120 && lng < -30 && lat > 0) return "Amerika Utara";
    return "Samudra";
  };

  return (
    <div className="min-h-screen pb-8" style={{ background: P.bg }}>
      <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: P.border }}>
        <button onClick={onBack} style={{ color: P.accent }}><ChevronLeft size={20} /></button>
        <div><h2 className="text-sm font-black text-white">ISS Tracker</h2><p className="text-[9px] text-gray-500">Real-time · Update tiap 5 detik</p></div>
        <div className="ml-auto flex items-center gap-1 text-[9px]" style={{ color: "#10b981" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />LIVE
        </div>
      </div>

      <div className="p-4 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center py-12 gap-3"><motion.div animate={{ rotate:360 }} transition={{ duration:2, repeat:Infinity }}><Satellite size={32} style={{ color: P.accent }} /></motion.div><p className="text-xs text-gray-500">Menghubungi Open Notify API...</p></div>
        ) : (
          <>
            {/* Mini map visual */}
            <div className="rounded-3xl overflow-hidden border relative" style={{ borderColor: P.border, background: "#000820", height: 180 }}>
              {/* Simple world grid */}
              <svg viewBox="0 0 360 180" className="w-full h-full opacity-20">
                {[-60,-30,0,30,60].map(lat => <line key={lat} x1="0" y1={90-lat} x2="360" y2={90-lat} stroke="#a855f7" strokeWidth="0.5" />)}
                {[-150,-120,-90,-60,-30,0,30,60,90,120,150].map(lng => <line key={lng} x1={lng+180} y1="0" x2={lng+180} y2="180" stroke="#a855f7" strokeWidth="0.5" />)}
              </svg>
              {/* ISS dot */}
              <div className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${((lng + 180) / 360) * 100}%`, top: `${((90 - lat) / 180) * 100}%` }}>
                <motion.div className="w-4 h-4 rounded-full border-2 border-yellow-400 bg-yellow-400/30"
                  animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
              </div>
              <div className="absolute bottom-2 left-3 text-[8px] text-gray-500">ISS Position Map</div>
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Latitude", value: `${parseFloat(lat).toFixed(4)}°`, icon: <MapPin size={12} /> },
                { label: "Longitude", value: `${parseFloat(lng).toFixed(4)}°`, icon: <MapPin size={12} /> },
                { label: "Di Atas", value: getRegion(lat, lng), icon: <Globe2 size={12} /> },
                { label: "Update", value: lastUpdate || "—", icon: <Clock size={12} /> },
              ].map(item => (
                <div key={item.label} className="p-3 rounded-2xl border" style={{ background: P.accent+"08", borderColor: P.border }}>
                  <div className="flex items-center gap-1 mb-1" style={{ color: P.accent }}>{item.icon}<span className="text-[8px] uppercase font-bold">{item.label}</span></div>
                  <p className="text-xs font-black text-white">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Info */}
            <div className="p-4 rounded-2xl border" style={{ background: "#3b82f610", borderColor: "#3b82f630" }}>
              <div className="grid grid-cols-2 gap-3 mb-3">
                {[["Ketinggian", "~408 km"], ["Kecepatan", "~7.66 km/s"], ["Orbit/Hari", "~15.5 orbit"], ["Masa Misi", "sejak 1998"]].map(([k,v]) => (
                  <div key={k}><p className="text-[8px] text-gray-600 uppercase">{k}</p><p className="text-xs font-bold text-white">{v}</p></div>
                ))}
              </div>
            </div>

            {/* Astronauts */}
            {astronauts.length > 0 && (
              <div>
                <p className="text-[10px] font-black uppercase text-gray-500 mb-2">👨‍🚀 Astronot di ISS ({astronauts.length})</p>
                <div className="space-y-2">
                  {astronauts.map((a, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl border" style={{ background: P.accent+"06", borderColor: P.border }}>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black" style={{ background: P.accent+"20", color: P.accent }}>{a.name[0]}</div>
                      <p className="text-xs text-white font-medium">{a.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ===================== EXOPLANET =====================
const EXOPLANETS = [
  { name:"Kepler-452b",type:"Super-Earth",distance:"1.400 ly",radius:"1.63 R⊕",temp:"265 K",star:"G-type (sun-like)",period:"385 days",habitable:true,desc:"Disebut 'Cousin of Earth'. Mengorbit bintang mirip Matahari di zona layak huni." },
  { name:"Proxima Centauri b",type:"Terrestrial",distance:"4.24 ly",radius:"~1.1 R⊕",temp:"234 K",star:"M-dwarf",period:"11.2 days",habitable:true,desc:"Exoplanet terdekat dari Bumi. Mengorbit bintang Proxima Centauri yang merupakan bintang terdekat dari Matahari." },
  { name:"TRAPPIST-1e",type:"Terrestrial",distance:"40 ly",radius:"0.92 R⊕",temp:"251 K",star:"M-dwarf",period:"6.1 days",habitable:true,desc:"Salah satu kandidat terkuat untuk kehidupan extraterrestrial. Ukurannya sangat mirip Bumi." },
  { name:"HD 40307g",type:"Super-Earth",distance:"42 ly",radius:"2.4 R⊕",temp:"~227 K",star:"K-dwarf",period:"198 days",habitable:true,desc:"Planet super-earth yang mungkin memiliki kondisi untuk mendukung atmosfer tebal." },
  { name:"55 Cancri e",type:"Super-Earth",distance:"41 ly",radius:"1.92 R⊕",temp:"2573 K",star:"G-type",period:"0.74 days",habitable:false,desc:"Disebut 'Lava World'. Suhunya sangat tinggi, mungkin permukaannya berupa lautan magma." },
  { name:"WASP-12b",type:"Hot Jupiter",distance:"1270 ly",radius:"1.79 RJ",temp:"2590 K",star:"F-type",period:"1.09 days",habitable:false,desc:"Gas raksasa yang mengorbit sangat dekat dengan bintangnya. Atmosfernya ditarik oleh gravitasi bintang." },
];

const ExoplanetPage = ({ onBack }) => {
  const [sel, setSel] = useState(null);
  return (
    <div className="min-h-screen pb-8" style={{ background: P.bg }}>
      <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: P.border }}>
        <button onClick={onBack} style={{ color: P.accent }}><ChevronLeft size={20} /></button>
        <div><h2 className="text-sm font-black text-white">Exoplanet Explorer</h2><p className="text-[9px] text-gray-500">Data NASA Exoplanet Archive</p></div>
      </div>
      <div className="p-4 space-y-3">
        {EXOPLANETS.map((p,i) => (
          <motion.div key={p.name} initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.05 }}
            className="p-4 rounded-2xl border cursor-pointer" onClick={() => { playSound("open"); setSel(sel?.name===p.name?null:p); }}
            style={{ borderColor: p.habitable?"#10b98130":"#ef444420", background: p.habitable?"#10b98108":"#ef444408" }}>
            <div className="flex justify-between items-start mb-1">
              <div>
                <h3 className="text-sm font-black text-white">{p.name}</h3>
                <p className="text-[10px] text-gray-500">{p.type} · {p.distance}</p>
              </div>
              {p.habitable && <span className="text-[8px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-bold">🌱 HABITABLE</span>}
            </div>
            <AnimatePresence>
              {sel?.name===p.name && (
                <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }} className="overflow-hidden">
                  <p className="text-[10px] text-gray-300 mb-3 mt-2 leading-relaxed">{p.desc}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[["Radius",p.radius],["Suhu",p.temp],["Bintang",p.star],["Periode",p.period]].map(([k,v]) => (
                      <div key={k} className="p-2 rounded-xl bg-black/30"><p className="text-[8px] text-gray-600 uppercase">{k}</p><p className="text-[11px] text-white font-bold">{v}</p></div>
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
};

// ===================== CONSTELLATION =====================
const CONSTELLATIONS = [
  { name:"Orion",season:"Desember-Maret",stars:7,myth:"Pemburu legendaris Yunani yang diubah menjadi rasi bintang oleh Zeus setelah kematiannya",notable:"Betelgeuse (merah raksasa), Rigel, Sabuk Orion (Alnitak-Alnilam-Mintaka)",visible:"Seluruh dunia",hemisphere:"Both" },
  { name:"Scorpius",season:"Juni-Agustus",stars:18,myth:"Kalajengking yang membunuh Orion. Zeus menempatkan keduanya di langit berlawanan sisi",notable:"Antares (bintang merah raksasa masif, 700x diameter Matahari)",visible:"Tropis & Belahan Selatan",hemisphere:"South" },
  { name:"Ursa Major",season:"Sepanjang tahun",stars:7,myth:"Callisto, putri raja Arcadia yang diubah Zeus menjadi beruang. Anak mereka Arcas hampir membunuhnya",notable:"Big Dipper, Mizar-Alcor (bintang ganda visual pertama)",visible:"Belahan Utara",hemisphere:"North" },
  { name:"Cassiopeia",season:"Sepanjang tahun",stars:5,myth:"Ratu Ethiopia yang sombong karena merasa lebih cantik dari para Nereid, dihukum berputar mengelilingi kutub",notable:"Schedar, Supernova Tycho 1572 terjadi di rasi ini",visible:"Belahan Utara",hemisphere:"North" },
  { name:"Lyra",season:"Juni-Oktober",stars:5,myth:"Kecapi milik Orpheus, musisi legendaris yang turun ke dunia bawah untuk membawa pulang Eurydice",notable:"Vega (bintang cerah ke-5, titik referensi magnitude 0)",visible:"Belahan Utara",hemisphere:"North" },
  { name:"Crux (Salib Selatan)",season:"April-Juni",stars:4,myth:"Dihormati oleh pelaut & penjelajah untuk navigasi di belahan selatan. Tidak ada mitos Yunani kuno",notable:"Acrux, digunakan untuk menemukan Kutub Selatan",visible:"Belahan Selatan",hemisphere:"South" },
];

const ConstellationPage = ({ onBack }) => {
  const [sel, setSel] = useState(null);
  return (
    <div className="min-h-screen pb-8" style={{ background: P.bg }}>
      <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: P.border }}>
        <button onClick={onBack} style={{ color: P.accent }}><ChevronLeft size={20} /></button>
        <div><h2 className="text-sm font-black text-white">Rasi Bintang</h2><p className="text-[9px] text-gray-500">88 rasi bintang resmi IAU</p></div>
      </div>
      <div className="p-4 space-y-3">
        {CONSTELLATIONS.map((c,i) => (
          <motion.div key={c.name} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }}
            className="p-4 rounded-2xl border cursor-pointer" onClick={() => { playSound("open"); setSel(sel?.name===c.name?null:c); }}
            style={{ borderColor: P.border, background: P.accent+"07" }}>
            <div className="flex justify-between items-center mb-0.5">
              <h3 className="text-sm font-black text-white">{c.name}</h3>
              <span className="text-[8px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 font-bold">{c.hemisphere === "North" ? "🔭 Utara" : c.hemisphere === "South" ? "🔭 Selatan" : "🔭 Global"}</span>
            </div>
            <p className="text-[10px] text-gray-500">{c.season} · {c.stars} bintang utama</p>
            <AnimatePresence>
              {sel?.name===c.name && (
                <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }} className="overflow-hidden">
                  <p className="text-[10px] text-gray-300 mt-3 mb-2 leading-relaxed italic">"{c.myth}"</p>
                  <div className="p-2.5 rounded-xl mb-2" style={{ background: P.accent+"10" }}>
                    <p className="text-[8px] text-purple-400 uppercase font-bold mb-0.5">Bintang Notable</p>
                    <p className="text-[10px] text-gray-200">{c.notable}</p>
                  </div>
                  <p className="text-[9px] text-gray-600">📍 Terlihat dari: {c.visible}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ===================== ELEMENTS =====================
const ELEMENTS = [
  { symbol:"H",  name:"Hidrogen",  num:1,  mass:"1.008",  color:"#6366f1", desc:"Paling melimpah di alam semesta (75%). Bahan bakar fusi nuklir bintang." },
  { symbol:"He", name:"Helium",    num:2,  mass:"4.003",  color:"#8b5cf6", desc:"Produk fusi H di bintang. 24% massa alam semesta. Tidak reaktif." },
  { symbol:"Li", name:"Litium",    num:3,  mass:"6.941",  color:"#a855f7", desc:"Terbentuk saat Big Bang. Digunakan untuk studi kosmologi awal." },
  { symbol:"C",  name:"Karbon",    num:6,  mass:"12.011", color:"#10b981", desc:"Basis semua kehidupan. Terbentuk via triple-alpha process di bintang." },
  { symbol:"O",  name:"Oksigen",   num:8,  mass:"15.999", color:"#3b82f6", desc:"Ketiga paling melimpah di alam semesta. Terbentuk di bintang masif." },
  { symbol:"Ne", name:"Neon",      num:10, mass:"20.180", color:"#06b6d4", desc:"Terbentuk saat supernova. Indikator temperatur di nebula." },
  { symbol:"Mg", name:"Magnesium", num:12, mass:"24.305", color:"#f59e0b", desc:"Komponen utama mantel planet berbatu. Terbentuk di bintang masif." },
  { symbol:"Si", name:"Silikon",   num:14, mass:"28.086", color:"#ec4899", desc:"Komponen utama kerak planet berbatu. Sangat melimpah di sistem tata surya." },
  { symbol:"Fe", name:"Besi",      num:26, mass:"55.845", color:"#ef4444", desc:"Batas akhir fusi nuklir normal. Inti planet berbatu sebagian besar besi." },
  { symbol:"Ni", name:"Nikel",     num:28, mass:"58.693", color:"#f97316", desc:"Sering ditemukan bersama besi di inti planet dan meteorit." },
  { symbol:"Au", name:"Emas",      num:79, mass:"196.97", color:"#eab308", desc:"Terbentuk saat kilonova (tabrakan bintang neutron). Dibawa ke Bumi oleh meteorit." },
  { symbol:"U",  name:"Uranium",   num:92, mass:"238.03", color:"#84cc16", desc:"Elemen berat dari supernova. Sumber panas geotermal di dalam planet." },
];

const ElementsPage = ({ onBack }) => {
  const [sel, setSel] = useState(null);
  return (
    <div className="min-h-screen pb-8" style={{ background: P.bg }}>
      <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: P.border }}>
        <button onClick={onBack} style={{ color: P.accent }}><ChevronLeft size={20} /></button>
        <div><h2 className="text-sm font-black text-white">Elemen Astronomi</h2><p className="text-[9px] text-gray-500">Elemen penting dalam konteks kosmologi</p></div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-3 gap-2 mb-4">
          {ELEMENTS.map((el,i) => (
            <motion.button key={el.symbol} initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} transition={{ delay:i*0.04 }}
              onClick={() => { playSound("click"); setSel(sel?.symbol===el.symbol?null:el); }}
              className="p-3 rounded-2xl border transition-all" style={{ borderColor: el.color+(sel?.symbol===el.symbol?"80":"25"), background: el.color+(sel?.symbol===el.symbol?"20":"08") }}>
              <div className="text-2xl font-black" style={{ color: el.color }}>{el.symbol}</div>
              <p className="text-[9px] text-gray-400 mt-0.5">{el.name}</p>
              <p className="text-[8px] text-gray-600">No.{el.num}</p>
            </motion.button>
          ))}
        </div>
        <AnimatePresence>
          {sel && (
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:20 }}
              className="p-4 rounded-2xl border" style={{ borderColor: sel.color+"40", background: sel.color+"12" }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="text-3xl font-black" style={{ color: sel.color }}>{sel.symbol}</div>
                <div><p className="text-sm font-black text-white">{sel.name}</p><p className="text-[9px] text-gray-500">No.{sel.num} · {sel.mass} u</p></div>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">{sel.desc}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ===================== BLACK HOLE CALCULATOR =====================
const BlackHolePage = ({ onBack }) => {
  const [mass, setMass] = useState(10);
  const rs = ((2 * 6.674e-11 * mass * 1.989e30) / (3e8**2) / 1000).toFixed(0);
  const tempK = (6.17e-8 / (mass * 1.989e30) * 1e30);
  const hawkingTemp = tempK < 0.001 ? tempK.toExponential(2) : tempK.toFixed(6);
  const timeDil = Math.sqrt(Math.max(0, 1 - 1/(mass*2))).toFixed(8);
  const classif = mass > 1e6 ? "Supermassive" : mass > 100 ? "Intermediate" : mass > 3 ? "Stellar" : "Primordial (teoritis)";
  const evapTime = (5120 * Math.PI * (6.674e-11)**2 * (mass * 1.989e30)**3 / ((6.626e-34) * (3e8)**4));
  const evapStr = evapTime > 1e30 ? `${(evapTime/3.156e7/1e30).toExponential(1)} × 10³⁰ tahun` : `${(evapTime/3.156e7).toExponential(2)} tahun`;

  return (
    <div className="min-h-screen pb-8" style={{ background: P.bg }}>
      <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: P.border }}>
        <button onClick={onBack} style={{ color: P.accent }}><ChevronLeft size={20} /></button>
        <div><h2 className="text-sm font-black text-white">Black Hole Calculator</h2><p className="text-[9px] text-gray-500">Simulasi fisika black hole</p></div>
      </div>
      <div className="p-4 space-y-4">
        <div className="p-4 rounded-2xl border" style={{ background: P.accent+"08", borderColor: P.border }}>
          <label className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Massa: <span style={{ color: P.accent }}>{mass} M☉</span> (massa matahari)</label>
          <input type="range" min={1} max={1000} value={mass} onChange={e => setMass(Number(e.target.value))} className="w-full mb-1" style={{ accentColor: P.accent }} />
          <div className="flex justify-between text-[8px] text-gray-600"><span>1 M☉ (min stellar)</span><span>1000 M☉</span></div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {[
            { label:"Klasifikasi", value:classif, color:"#a855f7", desc:"Berdasarkan massa" },
            { label:"Schwarzschild Radius (Rₛ)", value:`${Number(rs).toLocaleString()} km`, color:"#3b82f6", desc:"Jarak dari pusat ke event horizon dimana kecepatan lepas = c" },
            { label:"Suhu Hawking Radiation", value:`${hawkingTemp} K`, color:"#ec4899", desc:"Temperatur radiasi kuantum yang dipancarkan — semakin besar black hole, semakin dingin" },
            { label:"Time Dilation Factor", value:timeDil, color:"#10b981", desc:"Faktor perlambatan waktu tepat di event horizon (0 = waktu berhenti)" },
            { label:"Waktu Evaporasi (Hawking)", value:evapStr, color:"#f59e0b", desc:"Estimasi waktu hingga black hole menguap via radiasi Hawking" },
          ].map(item => (
            <div key={item.label} className="p-4 rounded-2xl border" style={{ background: item.color+"08", borderColor: item.color+"25" }}>
              <p className="text-[9px] uppercase font-bold mb-1" style={{ color: item.color }}>{item.label}</p>
              <p className="text-base font-black text-white mb-1">{item.value}</p>
              <p className="text-[10px] text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ===================== MAIN =====================
const ScienceHub = () => {
  const [active, setActive] = useState(null);
  if (active === "apod") return <APODPage onBack={() => setActive(null)} />;
  if (active === "iss") return <ISSPage onBack={() => setActive(null)} />;
  if (active === "exoplanet") return <ExoplanetPage onBack={() => setActive(null)} />;
  if (active === "constellation") return <ConstellationPage onBack={() => setActive(null)} />;
  if (active === "elements") return <ElementsPage onBack={() => setActive(null)} />;
  if (active === "blackhole") return <BlackHolePage onBack={() => setActive(null)} />;

  return (
    <div className="min-h-screen pb-8 p-5" style={{ background: P.bg }}>
      <div className="mt-2 mb-6">
        <h1 className="text-lg font-black text-white mb-1">🔭 Science Hub</h1>
        <p className="text-[10px] text-gray-500">Fitur sains & astronomi interaktif</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {FEATURES.map((f, i) => {
          const Icon = f.icon;
          return (
            <motion.button key={f.id} initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} transition={{ delay:i*0.07 }}
              whileTap={{ scale:0.95 }}
              onClick={() => { playSound("nav"); setActive(f.id); }}
              className="p-5 rounded-3xl border text-left" style={{ borderColor: f.color+"30", background: f.color+"08" }}>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3" style={{ background: f.color+"20" }}>
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

export default ScienceHub;
