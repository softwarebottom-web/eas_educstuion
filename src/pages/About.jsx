import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Globe, Award } from "lucide-react";
import { useEasStore, THEMES } from "../store/useStore";

// ==========================================
// 🪐 MODE 1: PLANET HOLOGRAM
// ==========================================
const PlanetCanvas = ({ accentColor, accent2 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      opacity: Math.random(),
    }));

    const rings = [
      { rx: 90, ry: 22, color: accentColor, opacity: 0.5 },
      { rx: 110, ry: 28, color: accent2, opacity: 0.3 },
      { rx: 130, ry: 34, color: "#8b5cf6", opacity: 0.2 },
    ];

    const orbiters = Array.from({ length: 5 }, (_, i) => ({
      angle: (i / 5) * Math.PI * 2,
      speed: 0.008 + i * 0.002,
      rx: 100 + i * 15,
      ry: 25 + i * 6,
      color: [accentColor, accent2, "#8b5cf6", "#f59e0b", "#10b981"][i],
      size: 2 + Math.random() * 2,
    }));

    let frame = 0;
    let animId;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Stars
      stars.forEach((s) => {
        s.opacity += (Math.random() - 0.5) * 0.05;
        s.opacity = Math.max(0.1, Math.min(1, s.opacity));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(147,197,253,${s.opacity})`;
        ctx.fill();
      });

      // Grid
      ctx.save();
      ctx.globalAlpha = 0.06;
      for (let i = 0; i < canvas.width; i += 30) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height);
        ctx.strokeStyle = accentColor; ctx.lineWidth = 0.5; ctx.stroke();
      }
      for (let j = 0; j < canvas.height; j += 30) {
        ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(canvas.width, j);
        ctx.strokeStyle = accentColor; ctx.lineWidth = 0.5; ctx.stroke();
      }
      ctx.restore();

      // Planet glow
      const grd = ctx.createRadialGradient(cx, cy, 5, cx, cy, 65);
      grd.addColorStop(0, `${accentColor}ee`);
      grd.addColorStop(0.5, `${accent2}88`);
      grd.addColorStop(1, `${accentColor}00`);
      ctx.beginPath(); ctx.arc(cx, cy, 60, 0, Math.PI * 2);
      ctx.fillStyle = grd; ctx.fill();

      // Planet body
      ctx.beginPath(); ctx.arc(cx, cy, 52, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(15,23,42,0.85)"; ctx.fill();
      ctx.strokeStyle = `${accentColor}99`; ctx.lineWidth = 1.5; ctx.stroke();

      // Scan line
      const scanY = cy - 52 + ((frame * 1.5) % 104);
      ctx.save(); ctx.globalAlpha = 0.2;
      ctx.fillStyle = accent2;
      ctx.fillRect(cx - 52, scanY, 104, 2);
      ctx.restore();

      // Rings
      ctx.save(); ctx.translate(cx, cy);
      rings.forEach((r) => {
        ctx.beginPath(); ctx.ellipse(0, 0, r.rx, r.ry, 0, 0, Math.PI * 2);
        ctx.strokeStyle = r.color; ctx.globalAlpha = r.opacity + Math.sin(frame * 0.02) * 0.05;
        ctx.lineWidth = 1.5; ctx.stroke();
      });
      ctx.restore();

      // Orbiters
      orbiters.forEach((o) => {
        o.angle += o.speed;
        const ox = cx + Math.cos(o.angle) * o.rx;
        const oy = cy + Math.sin(o.angle) * o.ry;
        ctx.beginPath(); ctx.arc(ox, oy, o.size, 0, Math.PI * 2);
        ctx.fillStyle = o.color; ctx.globalAlpha = 0.9; ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + Math.cos(o.angle - 0.15) * o.rx, cy + Math.sin(o.angle - 0.15) * o.ry, o.size * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = o.color; ctx.globalAlpha = 0.3; ctx.fill();
      });

      // Label
      ctx.save(); ctx.translate(cx, cy);
      ctx.globalAlpha = 0.6 + Math.sin(frame * 0.05) * 0.2;
      ctx.fillStyle = "#93c5fd"; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
      ctx.fillText("EAS", 0, -8);
      ctx.font = "6px monospace"; ctx.fillStyle = accent2;
      ctx.fillText("CORE", 0, 4);
      ctx.restore();

      frame++;
      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [accentColor, accent2]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

// ==========================================
// 🌌 MODE 2: GALAXY HOLOGRAM
// ==========================================
const GalaxyCanvas = ({ accentColor, accent2 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // Spiral arms stars
    const spiralStars = Array.from({ length: 300 }, (_, i) => {
      const arm = i % 3;
      const t = (i / 300) * Math.PI * 6;
      const armAngle = arm * ((Math.PI * 2) / 3);
      const r = 10 + t * 10;
      const scatter = (Math.random() - 0.5) * 18;
      return {
        angle: t + armAngle,
        radius: r + scatter,
        size: Math.random() * 1.8 + 0.3,
        opacity: Math.random() * 0.8 + 0.2,
        color: [accentColor, accent2, "#8b5cf6", "#f59e0b"][Math.floor(Math.random() * 4)],
        speed: (Math.random() * 0.003 + 0.001) * (arm % 2 === 0 ? 1 : -0.5),
        twinkle: Math.random() * Math.PI * 2,
      };
    });

    // Background stars
    const bgStars = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1,
      opacity: Math.random() * 0.5,
    }));

    let frame = 0;
    let animId;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // BG stars
      bgStars.forEach((s) => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,220,255,${s.opacity})`;
        ctx.fill();
      });

      // Grid
      ctx.save(); ctx.globalAlpha = 0.04;
      for (let i = 0; i < canvas.width; i += 30) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height);
        ctx.strokeStyle = accentColor; ctx.lineWidth = 0.5; ctx.stroke();
      }
      for (let j = 0; j < canvas.height; j += 30) {
        ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(canvas.width, j);
        ctx.strokeStyle = accentColor; ctx.lineWidth = 0.5; ctx.stroke();
      }
      ctx.restore();

      // Galactic core glow
      const coreGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 35);
      coreGrd.addColorStop(0, `${accentColor}ff`);
      coreGrd.addColorStop(0.4, `${accent2}88`);
      coreGrd.addColorStop(1, `${accentColor}00`);
      ctx.beginPath(); ctx.arc(cx, cy, 35, 0, Math.PI * 2);
      ctx.fillStyle = coreGrd; ctx.fill();

      // Core pulse ring
      const pulseR = 20 + Math.sin(frame * 0.05) * 5;
      ctx.beginPath(); ctx.arc(cx, cy, pulseR, 0, Math.PI * 2);
      ctx.strokeStyle = accent2;
      ctx.globalAlpha = 0.4 + Math.sin(frame * 0.05) * 0.2;
      ctx.lineWidth = 1; ctx.stroke();
      ctx.globalAlpha = 1;

      // Spiral stars
      spiralStars.forEach((s) => {
        s.angle += s.speed;
        s.twinkle += 0.05;
        const x = cx + Math.cos(s.angle) * s.radius * 0.85;
        const y = cy + Math.sin(s.angle) * s.radius * 0.4;
        const twinkleOp = s.opacity * (0.7 + Math.sin(s.twinkle) * 0.3);

        ctx.beginPath();
        ctx.arc(x, y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = twinkleOp;
        ctx.fill();
      });

      ctx.globalAlpha = 1;

      // Scan line across galaxy
      const scanX = cx - 120 + ((frame * 2) % 240);
      ctx.save(); ctx.globalAlpha = 0.15;
      ctx.fillStyle = accent2;
      ctx.fillRect(scanX, cy - 80, 2, 160);
      ctx.restore();

      // Center label
      ctx.save(); ctx.translate(cx, cy);
      ctx.globalAlpha = 0.7 + Math.sin(frame * 0.05) * 0.2;
      ctx.fillStyle = "#fff"; ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
      ctx.fillText("EAS", 0, -4);
      ctx.font = "5px monospace"; ctx.fillStyle = accent2;
      ctx.fillText("GALAXY", 0, 6);
      ctx.restore();

      frame++;
      animId = requestAnimationFrame(draw);
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

  return (
    <div className="min-h-screen text-white p-6 flex flex-col items-center justify-center relative overflow-hidden font-mono pb-28"
      style={{ background: t.bg }}>

      {/* BG GLOW */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 rounded-full blur-[120px] pointer-events-none"
        style={{ background: `${t.accent}18` }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 rounded-full blur-[120px] pointer-events-none"
        style={{ background: `${t.accent2}18` }} />

      {/* BACK */}
      <button onClick={() => navigate("/")}
        className="absolute top-8 left-8 p-3 rounded-2xl border transition-all active:scale-90"
        style={{ borderColor: t.border, color: t.accent, background: `${t.accent}10` }}>
        <ArrowLeft size={20} />
      </button>

      {/* HOLOGRAM MODE TOGGLE */}
      <div className="absolute top-8 right-8 flex gap-2">
        {["planet", "galaxy"].map((m) => (
          <button
            key={m}
            onClick={() => setHologramMode(m)}
            className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all border"
            style={{
              borderColor: hologramMode === m ? t.accent : "rgba(255,255,255,0.08)",
              background: hologramMode === m ? `${t.accent}20` : "transparent",
              color: hologramMode === m ? t.accent : "#4b5563",
            }}
          >
            {m === "planet" ? "🪐" : "🌌"} {m}
          </button>
        ))}
      </div>

      {/* CANVAS */}
      <div className="relative w-64 h-64 mb-6">
        {hologramMode === "planet"
          ? <PlanetCanvas accentColor={t.accent} accent2={t.accent2} />
          : <GalaxyCanvas accentColor={t.accent} accent2={t.accent2} />
        }
        {/* scanline overlay */}
        <div className="absolute inset-0 pointer-events-none rounded-full"
          style={{ background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(59,130,246,0.02) 2px, rgba(59,130,246,0.02) 4px)" }} />
      </div>

      {/* TITLE */}
      <div className="text-center mb-8">
        <h1 className="text-xl font-black tracking-[0.4em] uppercase italic" style={{ color: t.accent }}>
          ABOUT EAS SYSTEM
        </h1>
        <p className="text-[9px] text-gray-600 tracking-[0.2em] mt-2 uppercase font-bold">
          {hologramMode === "planet" ? "Satellite Education & Research Protocol" : "Galactic Knowledge Archive System"}
        </p>
      </div>

      {/* CONTENT */}
      <div className="max-w-md w-full p-8 rounded-[2.5rem] backdrop-blur-xl shadow-2xl space-y-6 text-center border"
        style={{ background: `${t.accent}08`, borderColor: t.border }}>

        <p className="text-xs text-gray-400 leading-relaxed font-medium">
          EAS (Extra-Atmospheric Studies) adalah platform edukasi independen yang berfokus pada
          pengembangan data hipotesis, riset astronomi, dan pengarsipan tesis luar angkasa.
        </p>

        <div className="grid grid-cols-2 gap-4 py-4" style={{ borderTop: `1px solid ${t.border}`, borderBottom: `1px solid ${t.border}` }}>
          <div className="space-y-1">
            <Globe size={14} className="mx-auto mb-1" style={{ color: t.accent2 }} />
            <p className="text-[8px] text-gray-500 uppercase font-black">Core Mission</p>
            <p className="text-[10px] text-gray-200 font-bold uppercase italic">Space Archive</p>
          </div>
          <div className="space-y-1">
            <Award size={14} className="mx-auto mb-1" style={{ color: t.accent }} />
            <p className="text-[8px] text-gray-500 uppercase font-black">Status</p>
            <p className="text-[10px] text-gray-200 font-bold uppercase italic">Independent</p>
          </div>
        </div>

        <div className="pt-4 space-y-2">
          <p className="text-[8px] text-gray-600 uppercase tracking-[0.5em] font-black">
            Developed For Next Gen Researchers
          </p>
          <div className="p-3 rounded-2xl border" style={{ background: `${t.accent}15`, borderColor: `${t.accent}30` }}>
            <p className="text-[10px] font-black uppercase tracking-widest italic" style={{ color: t.accent }}>
              Lead Dev: M. Fikri Surya Firdaus
            </p>
          </div>
        </div>
      </div>

      <footer className="mt-12 opacity-10">
        <p className="text-[7px] font-black tracking-[1.5em] uppercase">Security Protocol • v3.0</p>
      </footer>
    </div>
  );
};

export default About;
