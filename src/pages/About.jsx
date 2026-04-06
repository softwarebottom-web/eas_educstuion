import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Globe, Award, Users } from "lucide-react";
import { useEasStore, THEMES } from "../store/useStore";
import { playSound } from "../component/Intro";

// ==========================================
// 🪐 MODE 1: PLANET
// ==========================================
const PlanetCanvas = ({ accentColor, accent2 }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const stars = Array.from({ length: 120 }, () => ({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, r: Math.random() * 1.5 + 0.3, opacity: Math.random() }));
    const rings = [{ rx: 90, ry: 22, color: accentColor, opacity: 0.5 }, { rx: 110, ry: 28, color: accent2, opacity: 0.3 }, { rx: 130, ry: 34, color: "#8b5cf6", opacity: 0.2 }];
    const orbiters = Array.from({ length: 5 }, (_, i) => ({ angle: (i / 5) * Math.PI * 2, speed: 0.008 + i * 0.002, rx: 100 + i * 15, ry: 25 + i * 6, color: [accentColor, accent2, "#8b5cf6", "#f59e0b", "#10b981"][i], size: 2 + Math.random() * 2 }));
    let frame = 0; let animId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2, cy = canvas.height / 2;
      stars.forEach(s => { s.opacity += (Math.random() - 0.5) * 0.05; s.opacity = Math.max(0.1, Math.min(1, s.opacity)); ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(147,197,253,${s.opacity})`; ctx.fill(); });
      ctx.save(); ctx.globalAlpha = 0.06;
      for (let i = 0; i < canvas.width; i += 30) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.strokeStyle = accentColor; ctx.lineWidth = 0.5; ctx.stroke(); }
      for (let j = 0; j < canvas.height; j += 30) { ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(canvas.width, j); ctx.strokeStyle = accentColor; ctx.lineWidth = 0.5; ctx.stroke(); }
      ctx.restore();
      const grd = ctx.createRadialGradient(cx, cy, 5, cx, cy, 65);
      grd.addColorStop(0, `${accentColor}ee`); grd.addColorStop(0.5, `${accent2}88`); grd.addColorStop(1, `${accentColor}00`);
      ctx.beginPath(); ctx.arc(cx, cy, 60, 0, Math.PI * 2); ctx.fillStyle = grd; ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, 52, 0, Math.PI * 2); ctx.fillStyle = "rgba(15,23,42,0.85)"; ctx.fill(); ctx.strokeStyle = `${accentColor}99`; ctx.lineWidth = 1.5; ctx.stroke();
      const scanY = cy - 52 + ((frame * 1.5) % 104);
      ctx.save(); ctx.globalAlpha = 0.2; ctx.fillStyle = accent2; ctx.fillRect(cx - 52, scanY, 104, 2); ctx.restore();
      ctx.save(); ctx.translate(cx, cy);
      rings.forEach(r => { ctx.beginPath(); ctx.ellipse(0, 0, r.rx, r.ry, 0, 0, Math.PI * 2); ctx.strokeStyle = r.color; ctx.globalAlpha = r.opacity + Math.sin(frame * 0.02) * 0.05; ctx.lineWidth = 1.5; ctx.stroke(); });
      ctx.restore();
      orbiters.forEach(o => { o.angle += o.speed; const ox = cx + Math.cos(o.angle) * o.rx, oy = cy + Math.sin(o.angle) * o.ry; ctx.beginPath(); ctx.arc(ox, oy, o.size, 0, Math.PI * 2); ctx.fillStyle = o.color; ctx.globalAlpha = 0.9; ctx.fill(); ctx.beginPath(); ctx.arc(cx + Math.cos(o.angle - 0.15) * o.rx, cy + Math.sin(o.angle - 0.15) * o.ry, o.size * 0.6, 0, Math.PI * 2); ctx.fillStyle = o.color; ctx.globalAlpha = 0.3; ctx.fill(); });
      ctx.save(); ctx.translate(cx, cy); ctx.globalAlpha = 0.6 + Math.sin(frame * 0.05) * 0.2; ctx.fillStyle = "#93c5fd"; ctx.font = "bold 9px monospace"; ctx.textAlign = "center"; ctx.fillText("EAS", 0, -8); ctx.font = "6px monospace"; ctx.fillStyle = accent2; ctx.fillText("CORE", 0, 4); ctx.restore();
      frame++; animId = requestAnimationFrame(draw);
    };
    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [accentColor, accent2]);
  return <canvas ref={canvasRef} className="w-full h-full" />;
};

// ==========================================
// 🌌 MODE 2: GALAXY
// ==========================================
const GalaxyCanvas = ({ accentColor, accent2 }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight;
    const cx = canvas.width / 2, cy = canvas.height / 2;
    const spiralStars = Array.from({ length: 300 }, (_, i) => { const arm = i % 3, t = (i / 300) * Math.PI * 6, armAngle = arm * ((Math.PI * 2) / 3), r = 10 + t * 10, scatter = (Math.random() - 0.5) * 18; return { angle: t + armAngle, radius: r + scatter, size: Math.random() * 1.8 + 0.3, opacity: Math.random() * 0.8 + 0.2, color: [accentColor, accent2, "#8b5cf6", "#f59e0b"][Math.floor(Math.random() * 4)], speed: (Math.random() * 0.003 + 0.001) * (arm % 2 === 0 ? 1 : -0.5), twinkle: Math.random() * Math.PI * 2 }; });
    const bgStars = Array.from({ length: 80 }, () => ({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, r: Math.random() * 1, opacity: Math.random() * 0.5 }));
    let frame = 0; let animId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      bgStars.forEach(s => { ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(200,220,255,${s.opacity})`; ctx.fill(); });
      const coreGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 35); coreGrd.addColorStop(0, `${accentColor}ff`); coreGrd.addColorStop(0.4, `${accent2}88`); coreGrd.addColorStop(1, `${accentColor}00`);
      ctx.beginPath(); ctx.arc(cx, cy, 35, 0, Math.PI * 2); ctx.fillStyle = coreGrd; ctx.fill();
      const pulseR = 20 + Math.sin(frame * 0.05) * 5; ctx.beginPath(); ctx.arc(cx, cy, pulseR, 0, Math.PI * 2); ctx.strokeStyle = accent2; ctx.globalAlpha = 0.4 + Math.sin(frame * 0.05) * 0.2; ctx.lineWidth = 1; ctx.stroke(); ctx.globalAlpha = 1;
      spiralStars.forEach(s => { s.angle += s.speed; s.twinkle += 0.05; const x = cx + Math.cos(s.angle) * s.radius * 0.85, y = cy + Math.sin(s.angle) * s.radius * 0.4, twinkleOp = s.opacity * (0.7 + Math.sin(s.twinkle) * 0.3); ctx.beginPath(); ctx.arc(x, y, s.size, 0, Math.PI * 2); ctx.fillStyle = s.color; ctx.globalAlpha = twinkleOp; ctx.fill(); });
      ctx.globalAlpha = 1;
      ctx.save(); ctx.translate(cx, cy); ctx.globalAlpha = 0.7 + Math.sin(frame * 0.05) * 0.2; ctx.fillStyle = "#fff"; ctx.font = "bold 8px monospace"; ctx.textAlign = "center"; ctx.fillText("EAS", 0, -4); ctx.font = "5px monospace"; ctx.fillStyle = accent2; ctx.fillText("GALAXY", 0, 6); ctx.restore();
      frame++; animId = requestAnimationFrame(draw);
    };
    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [accentColor, accent2]);
  return <canvas ref={canvasRef} className="w-full h-full" />;
};

// ==========================================
// 🕳️ MODE 3: BLACK HOLE
// ==========================================
const BlackHoleCanvas = ({ accentColor, accent2 }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight;
    const cx = canvas.width / 2, cy = canvas.height / 2;

    // Stars that get pulled in
    const stars = Array.from({ length: 200 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const dist = 60 + Math.random() * 120;
      return { angle, dist, size: Math.random() * 2 + 0.5, speed: (Math.random() * 0.005 + 0.003) * (Math.random() > 0.5 ? 1 : -1), opacity: Math.random(), color: [accentColor, accent2, "#fff", "#f59e0b"][Math.floor(Math.random() * 4)], drift: (Math.random() - 0.5) * 0.2 };
    });

    // Accretion disk particles
    const disk = Array.from({ length: 150 }, (_, i) => ({
      angle: (i / 150) * Math.PI * 2,
      rx: 55 + Math.random() * 30,
      ry: 12 + Math.random() * 8,
      speed: 0.015 + Math.random() * 0.01,
      color: [accentColor, accent2, "#f59e0b", "#ff6b6b"][Math.floor(Math.random() * 4)],
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.8 + 0.2
    }));

    let frame = 0; let animId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Stars
      stars.forEach(s => {
        s.angle += s.speed;
        s.opacity = 0.3 + Math.sin(frame * 0.03 + s.angle) * 0.4;
        const x = cx + Math.cos(s.angle) * s.dist, y = cy + Math.sin(s.angle) * s.dist * 0.5;
        ctx.beginPath(); ctx.arc(x, y, s.size * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = s.color; ctx.globalAlpha = Math.max(0, s.opacity); ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Gravitational lensing rings
      for (let r = 100; r >= 55; r -= 8) {
        const grd = ctx.createRadialGradient(cx, cy, r - 4, cx, cy, r + 4);
        grd.addColorStop(0, `${accentColor}00`);
        grd.addColorStop(0.5, `${accentColor}${Math.floor((1 - r / 100) * 40).toString(16).padStart(2, "0")}`);
        grd.addColorStop(1, `${accentColor}00`);
        ctx.beginPath(); ctx.ellipse(cx, cy, r, r * 0.45, 0, 0, Math.PI * 2);
        ctx.strokeStyle = grd; ctx.lineWidth = 3; ctx.globalAlpha = 0.4; ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Accretion disk
      disk.forEach(p => {
        p.angle += p.speed;
        const x = cx + Math.cos(p.angle) * p.rx, y = cy + Math.sin(p.angle) * p.ry;
        ctx.beginPath(); ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color; ctx.globalAlpha = p.opacity * (0.6 + Math.sin(frame * 0.05 + p.angle) * 0.4); ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Black hole core — absolute black with glow
      const glowGrd = ctx.createRadialGradient(cx, cy, 15, cx, cy, 55);
      glowGrd.addColorStop(0, "rgba(0,0,0,1)");
      glowGrd.addColorStop(0.6, "rgba(0,0,0,0.95)");
      glowGrd.addColorStop(0.85, `${accentColor}44`);
      glowGrd.addColorStop(1, `${accentColor}00`);
      ctx.beginPath(); ctx.arc(cx, cy, 55, 0, Math.PI * 2); ctx.fillStyle = glowGrd; ctx.fill();

      // Event horizon
      ctx.beginPath(); ctx.arc(cx, cy, 32, 0, Math.PI * 2);
      ctx.fillStyle = "#000"; ctx.fill();
      ctx.strokeStyle = `${accentColor}cc`; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.8 + Math.sin(frame * 0.04) * 0.2; ctx.stroke();
      ctx.globalAlpha = 1;

      // Photon ring flicker
      ctx.beginPath(); ctx.arc(cx, cy, 36, 0, Math.PI * 2);
      ctx.strokeStyle = accent2; ctx.lineWidth = 1; ctx.globalAlpha = 0.3 + Math.sin(frame * 0.08) * 0.2; ctx.stroke();
      ctx.globalAlpha = 1;

      // Center label
      ctx.save(); ctx.translate(cx, cy);
      ctx.globalAlpha = 0.5 + Math.sin(frame * 0.06) * 0.3;
      ctx.fillStyle = accentColor; ctx.font = "bold 7px monospace"; ctx.textAlign = "center";
      ctx.fillText("EAS", 0, -3); ctx.font = "5px monospace"; ctx.fillStyle = accent2;
      ctx.fillText("∞", 0, 7); ctx.restore();

      frame++; animId = requestAnimationFrame(draw);
    };
    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [accentColor, accent2]);
  return <canvas ref={canvasRef} className="w-full h-full" />;
};

// ==========================================
// MAIN ABOUT PAGE
// ==========================================
const About = () => {
  const navigate = useNavigate();
  const { theme, hologramMode, setHologramMode } = useEasStore();
  const t = THEMES[theme] || THEMES.dark;

  const modes = [
    { key: "planet", emoji: "🪐", label: "Planet" },
    { key: "galaxy", emoji: "🌌", label: "Galaxy" },
    { key: "blackhole", emoji: "🕳️", label: "Black Hole" },
  ];

  return (
    <div className="min-h-screen text-white p-6 flex flex-col items-center relative overflow-hidden font-mono pb-28 pt-20"
      style={{ background: t.bg }}>

      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 rounded-full blur-[120px] pointer-events-none" style={{ background: `${t.accent}18` }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 rounded-full blur-[120px] pointer-events-none" style={{ background: `${t.accent2}18` }} />

      {/* BACK */}
      <button onClick={() => { playSound("click"); navigate("/"); }}
        className="absolute top-8 left-8 p-3 rounded-2xl border transition-all active:scale-90"
        style={{ borderColor: t.border, color: t.accent, background: `${t.accent}10` }}>
        <ArrowLeft size={20} />
      </button>

      {/* MODE TOGGLE */}
      <div className="absolute top-8 right-4 flex gap-1">
        {modes.map((m) => (
          <button key={m.key}
            onClick={() => { playSound("click"); setHologramMode(m.key); }}
            className="px-2 py-1.5 rounded-xl text-[8px] font-black uppercase transition-all border"
            style={{ borderColor: hologramMode === m.key ? t.accent : "rgba(255,255,255,0.08)", background: hologramMode === m.key ? `${t.accent}20` : "transparent", color: hologramMode === m.key ? t.accent : "#4b5563" }}
          >
            {m.emoji}
          </button>
        ))}
      </div>

      {/* CANVAS */}
      <div className="relative w-64 h-64 mb-4">
        {hologramMode === "planet" && <PlanetCanvas accentColor={t.accent} accent2={t.accent2} />}
        {hologramMode === "galaxy" && <GalaxyCanvas accentColor={t.accent} accent2={t.accent2} />}
        {hologramMode === "blackhole" && <BlackHoleCanvas accentColor={t.accent} accent2={t.accent2} />}
      </div>

      {/* MODE LABEL */}
      <p className="text-[9px] font-bold uppercase tracking-widest mb-6" style={{ color: t.accent }}>
        {hologramMode === "planet" ? "🪐 Hologram Planet" : hologramMode === "galaxy" ? "🌌 Spiral Galaxy" : "🕳️ Black Hole Simulation"}
      </p>

      {/* TITLE */}
      <div className="text-center mb-6">
        <h1 className="text-lg font-black tracking-[0.3em] uppercase italic" style={{ color: t.accent }}>
          EAS
        </h1>
        <p className="text-[11px] text-gray-300 font-bold mt-1">
          Education Astronomi Sains
        </p>
        <p className="text-[9px] text-gray-600 tracking-widest mt-1 uppercase">
          Komunitas Astronomi & Edukasi
        </p>
      </div>

      {/* CONTENT */}
      <div className="max-w-md w-full p-6 rounded-[2rem] backdrop-blur-xl shadow-2xl space-y-5 border"
        style={{ background: `${t.accent}08`, borderColor: t.border }}>

        {/* DESKRIPSI */}
        <p className="text-xs text-gray-300 leading-relaxed text-center">
          <span className="font-bold" style={{ color: t.accent }}>EAS (Education Astronomi Sains)</span> adalah komunitas astronomi yang berfokus pada edukasi dan informasi astronomi terbaru dan komprehensif.
        </p>

        <div className="text-[10px] text-gray-400 leading-relaxed text-center italic border-t border-b py-3" style={{ borderColor: t.border }}>
          Marga yang dibuat pada <span className="text-white font-bold">07 Desember 2025</span> oleh{" "}
          <span className="font-bold" style={{ color: t.accent }}>Shadow</span> dan dikembangkan oleh{" "}
          <span className="font-bold" style={{ color: t.accent2 }}>Zef</span> serta admin lain seperti{" "}
          <span className="text-gray-300">Wendy, ALZZ, Nay, Ryneford</span> dan lain-lain.
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <Globe size={12} />, label: "Mission", value: "Education" },
            { icon: <Award size={12} />, label: "Status", value: "Active" },
            { icon: <Users size={12} />, label: "Type", value: "Community" },
          ].map((s, i) => (
            <div key={i} className="text-center space-y-1">
              <div className="flex justify-center" style={{ color: t.accent2 }}>{s.icon}</div>
              <p className="text-[7px] text-gray-600 uppercase font-black">{s.label}</p>
              <p className="text-[9px] text-gray-200 font-bold uppercase italic">{s.value}</p>
            </div>
          ))}
        </div>

        {/* DEV */}
        <div className="p-3 rounded-2xl border text-center" style={{ background: `${t.accent}15`, borderColor: `${t.accent}30` }}>
          <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Web Developer</p>
          <p className="text-[11px] font-black uppercase tracking-widest italic" style={{ color: t.accent }}>
            M. Fikri Surya Firdaus
          </p>
        </div>
      </div>

      <footer className="mt-8 opacity-10">
        <p className="text-[7px] font-black tracking-[1.5em] uppercase">EAS Security Protocol • v3.0</p>
      </footer>
    </div>
  );
};

export default About;
