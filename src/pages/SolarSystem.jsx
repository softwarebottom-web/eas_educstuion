import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";

const VIEWS = {
  "Solar System": "solar",
  "Milky Way": "milky",
  "Andromeda": "andromeda",
  "Pulsar B0531": "pulsar",
};

const SOLAR_DATA = {
  Sun: {
    radius: 40, distance: 0, color: "#FDB813", emissive: true,
    info: { type: "Bintang", diameter: "1.39 juta km", suhu: "5.778 K (permukaan)", massa: "1.989 × 10³⁰ kg", gravitasi: "274 m/s²" },
    desc: "Pusat tata surya kita. Bintang tipe G yang menghasilkan energi melalui fusi nuklir hidrogen menjadi helium di intinya.",
    layers: ["Inti (15 juta K)", "Zona Radiatif", "Zona Konvektif", "Fotosfer", "Kromosfer", "Korona"]
  },
  Mercury: {
    radius: 5, distance: 80, speed: 4.7, color: "#B5B5B5", orbit: "#ffffff20",
    info: { type: "Planet Terestrial", diameter: "4.879 km", suhu: "-180 s/d 430°C", massa: "3.285 × 10²³ kg", gravitasi: "3.7 m/s²" },
    desc: "Planet terkecil dan terdekat dari Matahari. Tidak memiliki atmosfer yang berarti dan permukaannya penuh kawah.",
    layers: ["Inti Besi (75%)", "Mantel", "Kerak Tipis"]
  },
  Venus: {
    radius: 9, distance: 120, speed: 3.5, color: "#E8CDC4", orbit: "#ffffff20",
    info: { type: "Planet Terestrial", diameter: "12.104 km", suhu: "462°C (rata-rata)", massa: "4.867 × 10²⁴ kg", gravitasi: "8.87 m/s²" },
    desc: "Planet terpanas di tata surya karena efek rumah kaca ekstrem. Berotasi berlawanan arah dengan planet lain.",
    layers: ["Inti Besi-Nikel", "Mantel Silikat", "Kerak", "Atmosfer CO₂ Tebal"]
  },
  Earth: {
    radius: 10, distance: 170, speed: 3.0, color: "#4B9CD3", orbit: "#ffffff20",
    info: { type: "Planet Terestrial", diameter: "12.742 km", suhu: "15°C (rata-rata)", massa: "5.972 × 10²⁴ kg", gravitasi: "9.8 m/s²" },
    desc: "Satu-satunya planet yang diketahui memiliki kehidupan. Memiliki 70% permukaan tertutup air dan 1 satelit alami.",
    layers: ["Inti Dalam (Besi padat)", "Inti Luar (Besi cair)", "Mantel Bawah", "Mantel Atas", "Kerak"]
  },
  Mars: {
    radius: 7, distance: 220, speed: 2.4, color: "#CD5C5C", orbit: "#ffffff20",
    info: { type: "Planet Terestrial", diameter: "6.779 km", suhu: "-65°C (rata-rata)", massa: "6.39 × 10²³ kg", gravitasi: "3.72 m/s²" },
    desc: "Planet merah dengan gunung berapi terbesar di tata surya (Olympus Mons). Kemungkinan pernah memiliki air.",
    layers: ["Inti Besi-Sulfida", "Mantel Silikat", "Kerak", "Atmosfer CO₂ Tipis"]
  },
  Jupiter: {
    radius: 28, distance: 300, speed: 1.3, color: "#C88B3A", orbit: "#ffffff20",
    info: { type: "Planet Gas Raksasa", diameter: "139.820 km", suhu: "-110°C (awan atas)", massa: "1.898 × 10²⁷ kg", gravitasi: "24.79 m/s²" },
    desc: "Planet terbesar di tata surya. Great Red Spot adalah badai yang telah berlangsung lebih dari 350 tahun.",
    layers: ["Inti Berbatu Kecil", "Hidrogen Metalik", "Hidrogen Cair", "Atmosfer Hidrogen/Helium"]
  },
  Saturn: {
    radius: 24, distance: 400, speed: 0.96, color: "#F4D59C", orbit: "#ffffff20", ring: true,
    info: { type: "Planet Gas Raksasa", diameter: "116.460 km", suhu: "-140°C", massa: "5.683 × 10²⁶ kg", gravitasi: "10.44 m/s²" },
    desc: "Dikenal dengan cincin spektakulernya yang terbuat dari es dan batuan. Memiliki 83 bulan, termasuk Titan.",
    layers: ["Inti Berbatu", "Hidrogen Metalik", "Hidrogen/Helium Cair", "Atmosfer + Cincin Es"]
  },
  Uranus: {
    radius: 17, distance: 480, speed: 0.68, color: "#7DE8E8", orbit: "#ffffff20",
    info: { type: "Planet Es Raksasa", diameter: "50.724 km", suhu: "-195°C", massa: "8.681 × 10²⁵ kg", gravitasi: "8.69 m/s²" },
    desc: "Planet yang berputar miring hampir 90 derajat. Memiliki 13 cincin dan 27 bulan yang diketahui.",
    layers: ["Inti Berbatu", "Mantel Es (air, metana, amonia)", "Atmosfer H₂/He/Metana"]
  },
  Neptune: {
    radius: 16, distance: 550, speed: 0.54, color: "#3F54BA", orbit: "#ffffff20",
    info: { type: "Planet Es Raksasa", diameter: "49.244 km", suhu: "-200°C", massa: "1.024 × 10²⁶ kg", gravitasi: "11.15 m/s²" },
    desc: "Planet terjauh dengan angin tercepat di tata surya (2.100 km/jam). Memiliki bulan Triton yang berotasi mundur.",
    layers: ["Inti Berbatu", "Mantel Es", "Atmosfer H₂/He/Metana"]
  },
};

const SolarSystem = () => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const anglesRef = useRef({});
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState("solar");
  const [zoom, setZoom] = useState(1);
  const [showViewPicker, setShowViewPicker] = useState(false);
  const [tab, setTab] = useState("info");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    Object.keys(SOLAR_DATA).forEach(name => {
      if (SOLAR_DATA[name].speed) anglesRef.current[name] = Math.random() * Math.PI * 2;
    });

    let frame = 0;
    const draw = () => {
      const w = canvas.width, h = canvas.height;
      const cx = w / 2, cy = h / 2;
      ctx.clearRect(0, 0, w, h);

      if (view === "pulsar") { drawPulsar(ctx, cx, cy, frame, w, h); frame++; animRef.current = requestAnimationFrame(draw); return; }
      if (view === "milky" || view === "andromeda") { drawGalaxy(ctx, cx, cy, frame, w, h, view); frame++; animRef.current = requestAnimationFrame(draw); return; }

      // Stars background
      ctx.save();
      if (frame % 3 === 0) {
        for (let i = 0; i < 5; i++) {
          const x = Math.random() * w, y = Math.random() * h;
          ctx.beginPath(); ctx.arc(x, y, 0.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.5 + 0.2})`; ctx.fill();
        }
      }
      ctx.restore();

      // Draw orbits & planets
      Object.entries(SOLAR_DATA).forEach(([name, p]) => {
        const d = p.distance * zoom;
        if (d > 0) {
          ctx.beginPath(); ctx.arc(cx, cy, d, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 1; ctx.stroke();
        }

        let px = cx, py = cy;
        if (p.speed) {
          anglesRef.current[name] = (anglesRef.current[name] || 0) + p.speed * 0.003;
          px = cx + Math.cos(anglesRef.current[name]) * d;
          py = cy + Math.sin(anglesRef.current[name]) * d;
        }

        // Glow
        const r = p.radius * zoom;
        if (p.emissive) {
          const grd = ctx.createRadialGradient(px, py, 0, px, py, r * 2);
          grd.addColorStop(0, p.color + "ff");
          grd.addColorStop(0.5, p.color + "44");
          grd.addColorStop(1, "transparent");
          ctx.beginPath(); ctx.arc(px, py, r * 2, 0, Math.PI * 2);
          ctx.fillStyle = grd; ctx.fill();
        }

        // Planet body
        const grad = ctx.createRadialGradient(px - r * 0.3, py - r * 0.3, 0, px, py, r);
        grad.addColorStop(0, lightenColor(p.color, 40));
        grad.addColorStop(1, darkenColor(p.color, 40));
        ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fillStyle = grad; ctx.fill();

        // Saturn ring
        if (p.ring) {
          ctx.save();
          ctx.translate(px, py);
          ctx.scale(1, 0.3);
          ctx.beginPath(); ctx.arc(0, 0, r * 2.2, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(244,213,156,0.5)"; ctx.lineWidth = r * 0.4; ctx.stroke();
          ctx.restore();
        }

        // Label
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.font = `${Math.max(9, 10 * zoom)}px monospace`;
        ctx.textAlign = "center";
        ctx.fillText(name, px, py + r + 14);
      });

      frame++;
      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resize); };
  }, [view, zoom]);

  const handleCanvasClick = (e) => {
    if (view !== "solar") return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const cx = canvas.width / 2, cy = canvas.height / 2;

    for (const [name, p] of Object.entries(SOLAR_DATA)) {
      let px = cx, py = cy;
      if (p.speed && anglesRef.current[name] !== undefined) {
        px = cx + Math.cos(anglesRef.current[name]) * p.distance * zoom;
        py = cy + Math.sin(anglesRef.current[name]) * p.distance * zoom;
      }
      const dist = Math.hypot(mx - px, my - py);
      if (dist < p.radius * zoom + 12) { setSelected(name); setTab("info"); return; }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-purple-900/40 bg-black/80 backdrop-blur-sm z-10">
        <div>
          <h1 className="text-sm font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            🌌 EAS Solar System
          </h1>
          <p className="text-[9px] text-gray-600">Tap planet untuk info</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setZoom(z => Math.max(0.4, z - 0.2))} className="p-1.5 rounded-lg bg-purple-900/30 text-purple-400"><ZoomOut size={14} /></button>
          <button onClick={() => setZoom(z => Math.min(2, z + 0.2))} className="p-1.5 rounded-lg bg-purple-900/30 text-purple-400"><ZoomIn size={14} /></button>
          <button onClick={() => setZoom(1)} className="p-1.5 rounded-lg bg-purple-900/30 text-purple-400"><RotateCcw size={14} /></button>
          <button onClick={() => setShowViewPicker(!showViewPicker)}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-xs font-bold">
            {Object.entries(VIEWS).find(([,v]) => v === view)?.[0] || "Solar System"}
          </button>
        </div>
      </div>

      {/* View Picker */}
      <AnimatePresence>
        {showViewPicker && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="absolute top-14 right-4 z-50 bg-[#0a0010] border border-purple-800/40 rounded-2xl p-2 shadow-xl">
            {Object.entries(VIEWS).map(([label, val]) => (
              <button key={val} onClick={() => { setView(val); setShowViewPicker(false); setSelected(null); }}
                className={`block w-full text-left px-4 py-2 rounded-xl text-xs font-bold transition ${view === val ? "bg-purple-600 text-white" : "text-gray-400 hover:bg-purple-900/20"}`}>
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full cursor-pointer" onClick={handleCanvasClick}
          style={{ background: "radial-gradient(ellipse at center, #0a0020 0%, #000005 70%)" }} />
      </div>

      {/* Planet Info Panel */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="absolute bottom-0 left-0 right-0 bg-[#08001a]/95 backdrop-blur-xl border-t border-purple-800/40 rounded-t-3xl p-5 pb-8 max-h-[55vh] overflow-y-auto z-40">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-purple-500/50"
                  style={{ background: SOLAR_DATA[selected]?.color }} />
                <div>
                  <h2 className="text-base font-black text-white">{selected}</h2>
                  <p className="text-[10px] text-purple-400">{SOLAR_DATA[selected]?.info?.type}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-xl bg-purple-900/30 text-purple-400"><X size={16} /></button>
            </div>

            <div className="flex gap-2 mb-4">
              {["info", "layers", "desc"].map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition ${tab === t ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white" : "bg-purple-900/20 text-gray-500"}`}>
                  {t === "info" ? "Data" : t === "layers" ? "Lapisan" : "Info"}
                </button>
              ))}
            </div>

            {tab === "info" && (
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(SOLAR_DATA[selected]?.info || {}).map(([k, v]) => (
                  <div key={k} className="p-3 rounded-xl bg-purple-900/20 border border-purple-800/30">
                    <p className="text-[8px] text-purple-400 uppercase font-bold mb-0.5">{k}</p>
                    <p className="text-[11px] text-white font-medium">{v}</p>
                  </div>
                ))}
              </div>
            )}
            {tab === "layers" && (
              <div className="space-y-2">
                {(SOLAR_DATA[selected]?.layers || []).map((l, i, arr) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-purple-900/20">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black"
                      style={{ background: `hsl(${270 + i * 20}, 70%, ${30 + i * 8}%)` }}>{arr.length - i}</div>
                    <p className="text-xs text-gray-300">{l}</p>
                  </div>
                ))}
              </div>
            )}
            {tab === "desc" && (
              <p className="text-xs text-gray-300 leading-relaxed">{SOLAR_DATA[selected]?.desc}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function lightenColor(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, (n >> 16) + amount);
  const g = Math.min(255, ((n >> 8) & 0xff) + amount);
  const b = Math.min(255, (n & 0xff) + amount);
  return `rgb(${r},${g},${b})`;
}

function darkenColor(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, (n >> 16) - amount);
  const g = Math.max(0, ((n >> 8) & 0xff) - amount);
  const b = Math.max(0, (n & 0xff) - amount);
  return `rgb(${r},${g},${b})`;
}

function drawPulsar(ctx, cx, cy, frame, w, h) {
  ctx.fillStyle = "#000005"; ctx.fillRect(0, 0, w, h);
  // Star background
  for (let i = 0; i < 3; i++) {
    const x = Math.random() * w, y = Math.random() * h;
    ctx.beginPath(); ctx.arc(x, y, 0.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200,180,255,${Math.random() * 0.3})`; ctx.fill();
  }
  // Pulsar body
  const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 35);
  grd.addColorStop(0, "#ffffff"); grd.addColorStop(0.3, "#aaaaff");
  grd.addColorStop(0.7, "#4400ff44"); grd.addColorStop(1, "transparent");
  ctx.beginPath(); ctx.arc(cx, cy, 35, 0, Math.PI * 2); ctx.fillStyle = grd; ctx.fill();
  // Rotating beams
  const angle1 = frame * 0.08;
  const angle2 = angle1 + Math.PI;
  [[angle1, angle2], [angle2, angle1 + Math.PI]].forEach(([a]) => {
    const pulse = Math.abs(Math.sin(frame * 0.08));
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(a);
    const beamGrd = ctx.createLinearGradient(0, 0, Math.min(w, h) * 0.7, 0);
    beamGrd.addColorStop(0, `rgba(180,100,255,${pulse})`);
    beamGrd.addColorStop(0.3, `rgba(100,50,255,${pulse * 0.5})`);
    beamGrd.addColorStop(1, "transparent");
    ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(Math.min(w, h) * 0.7, -1); ctx.lineTo(Math.min(w, h) * 0.7, 1); ctx.lineTo(0, 8);
    ctx.fillStyle = beamGrd; ctx.fill(); ctx.restore();
  });
  // Magnetic field lines
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + frame * 0.02;
    ctx.beginPath();
    for (let t = 0; t < 60; t++) {
      const r = 40 + t * 3;
      const x = cx + Math.cos(a + Math.sin(t * 0.1) * 0.5) * r;
      const y = cy + Math.sin(a + Math.sin(t * 0.1) * 0.5) * r * 0.4;
      t === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(120,80,255,0.12)`; ctx.lineWidth = 1; ctx.stroke();
  }
  ctx.fillStyle = "#c084fc"; ctx.font = "bold 11px monospace"; ctx.textAlign = "center";
  ctx.fillText("PULSAR B0531+21", cx, cy + 55);
  ctx.fillStyle = "#9333ea"; ctx.font = "9px monospace";
  ctx.fillText(`Period: ${(0.033 + Math.sin(frame * 0.001) * 0.00001).toFixed(6)}s`, cx, cy + 70);
}

function drawGalaxy(ctx, cx, cy, frame, w, h, type) {
  ctx.fillStyle = type === "andromeda" ? "#000008" : "#000005"; ctx.fillRect(0, 0, w, h);
  const arms = type === "andromeda" ? 4 : 3;
  const color = type === "andromeda" ? [100, 150, 255] : [180, 100, 255];
  for (let arm = 0; arm < arms; arm++) {
    const baseAngle = (arm / arms) * Math.PI * 2 + frame * 0.002;
    for (let i = 0; i < 200; i++) {
      const t = i / 200;
      const spiral = t * Math.PI * 4 + baseAngle;
      const r = t * Math.min(w, h) * 0.42;
      const scatter = (Math.random() - 0.5) * 20;
      const x = cx + Math.cos(spiral) * r + scatter;
      const y = cy + Math.sin(spiral) * r * 0.45 + scatter * 0.3;
      const brightness = (1 - t) * 0.8 + 0.1;
      ctx.beginPath(); ctx.arc(x, y, Math.random() * 1.5 + 0.3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${brightness})`; ctx.fill();
    }
  }
  // Core
  const coreGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30);
  coreGrd.addColorStop(0, "rgba(255,255,255,0.9)");
  coreGrd.addColorStop(0.4, `rgba(${color[0]},${color[1]},${color[2]},0.5)`);
  coreGrd.addColorStop(1, "transparent");
  ctx.beginPath(); ctx.arc(cx, cy, 30, 0, Math.PI * 2); ctx.fillStyle = coreGrd; ctx.fill();
  ctx.fillStyle = "#a78bfa"; ctx.font = "bold 10px monospace"; ctx.textAlign = "center";
  ctx.fillText(type === "andromeda" ? "GALAKSI ANDROMEDA (M31)" : "BIMA SAKTI (Milky Way)", cx, cy + 50);
  ctx.fillStyle = "#7c3aed"; ctx.font = "8px monospace";
  ctx.fillText(type === "andromeda" ? "2.537 juta tahun cahaya dari Bumi" : "Diameter ~100.000 tahun cahaya", cx, cy + 65);
}

export default SolarSystem;
