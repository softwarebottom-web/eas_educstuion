import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const About = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // 🌌 Animasi hologram astronomy di canvas
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
      speed: Math.random() * 0.3 + 0.05,
      opacity: Math.random(),
    }));

    // Planet rings
    const rings = [
      { rx: 90, ry: 22, color: "#3b82f6", opacity: 0.5 },
      { rx: 110, ry: 28, color: "#06b6d4", opacity: 0.3 },
      { rx: 130, ry: 34, color: "#8b5cf6", opacity: 0.2 },
    ];

    // Orbiting dots
    const orbiters = Array.from({ length: 5 }, (_, i) => ({
      angle: (i / 5) * Math.PI * 2,
      speed: 0.008 + i * 0.002,
      rx: 100 + i * 15,
      ry: 25 + i * 6,
      color: ["#3b82f6", "#06b6d4", "#8b5cf6", "#f59e0b", "#10b981"][i],
      size: 2 + Math.random() * 2,
    }));

    let frame = 0;

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
        ctx.fillStyle = `rgba(147, 197, 253, ${s.opacity})`;
        ctx.fill();
      });

      // Hologram grid glow
      ctx.save();
      ctx.globalAlpha = 0.08;
      for (let i = 0; i < canvas.width; i += 30) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
      for (let j = 0; j < canvas.height; j += 30) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(canvas.width, j);
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
      ctx.restore();

      // Planet glow
      const grd = ctx.createRadialGradient(cx, cy, 5, cx, cy, 65);
      grd.addColorStop(0, "rgba(59,130,246,0.9)");
      grd.addColorStop(0.5, "rgba(6,182,212,0.5)");
      grd.addColorStop(1, "rgba(139,92,246,0.0)");
      ctx.beginPath();
      ctx.arc(cx, cy, 60, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      // Planet surface texture
      ctx.beginPath();
      ctx.arc(cx, cy, 52, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
      ctx.fill();
      ctx.strokeStyle = "rgba(59,130,246,0.6)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Hologram scan line
      const scanY = cy - 52 + ((frame * 1.5) % 104);
      ctx.save();
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = "#06b6d4";
      ctx.fillRect(cx - 52, scanY, 104, 2);
      ctx.restore();

      // Rings
      ctx.save();
      ctx.translate(cx, cy);
      rings.forEach((r) => {
        ctx.beginPath();
        ctx.ellipse(0, 0, r.rx, r.ry, 0, 0, Math.PI * 2);
        ctx.strokeStyle = r.color;
        ctx.globalAlpha = r.opacity + Math.sin(frame * 0.02) * 0.05;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
      ctx.restore();

      // Orbiting dots
      orbiters.forEach((o) => {
        o.angle += o.speed;
        const ox = cx + Math.cos(o.angle) * o.rx;
        const oy = cy + Math.sin(o.angle) * o.ry;
        ctx.beginPath();
        ctx.arc(ox, oy, o.size, 0, Math.PI * 2);
        ctx.fillStyle = o.color;
        ctx.globalAlpha = 0.9;
        ctx.fill();

        // Trail
        ctx.beginPath();
        ctx.arc(
          cx + Math.cos(o.angle - 0.15) * o.rx,
          cy + Math.sin(o.angle - 0.15) * o.ry,
          o.size * 0.6, 0, Math.PI * 2
        );
        ctx.fillStyle = o.color;
        ctx.globalAlpha = 0.3;
        ctx.fill();
      });

      // Hologram flicker text on planet
      ctx.save();
      ctx.translate(cx, cy);
      ctx.globalAlpha = 0.6 + Math.sin(frame * 0.05) * 0.2;
      ctx.fillStyle = "#93c5fd";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "center";
      ctx.fillText("EAS", 0, -8);
      ctx.font = "6px monospace";
      ctx.fillStyle = "#06b6d4";
      ctx.fillText("CORE", 0, 4);
      ctx.restore();

      frame++;
      requestAnimationFrame(draw);
    };

    const anim = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(anim);
  }, []);

  return (
    <div className="min-h-screen bg-[#00050d] text-white p-6 flex flex-col items-center justify-center relative overflow-hidden font-mono">

      {/* BG GLOW */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* BACK */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-8 left-8 p-3 bg-blue-950/20 border border-blue-900/30 rounded-2xl text-blue-500 hover:bg-blue-600 hover:text-white transition-all active:scale-90"
      >
        <ArrowLeft size={20} />
      </button>

      {/* HOLOGRAM CANVAS */}
      <div className="relative w-64 h-64 mb-6">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ imageRendering: "pixelated" }}
        />
        {/* Hologram overlay flicker */}
        <div className="absolute inset-0 pointer-events-none rounded-full"
          style={{
            background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(59,130,246,0.03) 2px, rgba(59,130,246,0.03) 4px)",
            animation: "none"
          }}
        />
      </div>

      {/* TITLE */}
      <div className="text-center mb-8">
        <h1 className="text-xl font-black text-blue-500 tracking-[0.4em] uppercase italic">
          ABOUT EAS SYSTEM
        </h1>
        <p className="text-[9px] text-gray-600 tracking-[0.2em] mt-2 uppercase font-bold">
          Satellite Education & Research Protocol
        </p>
      </div>

      {/* CONTENT */}
      <div className="max-w-md w-full p-8 bg-blue-950/5 border border-blue-900/20 rounded-[2.5rem] backdrop-blur-xl shadow-2xl space-y-6 text-center">
        <p className="text-xs text-gray-400 leading-relaxed font-medium">
          EAS (Extra-Atmospheric Studies) adalah platform edukasi independen yang berfokus pada
          pengembangan data hipotesis, riset astronomi, dan pengarsipan tesis luar angkasa.
        </p>

        <div className="grid grid-cols-2 gap-4 py-4 border-y border-blue-900/20">
          <div className="space-y-1">
            <p className="text-[8px] text-gray-500 uppercase font-black">Core Mission</p>
            <p className="text-[10px] text-gray-200 font-bold uppercase italic">Space Archive</p>
          </div>
          <div className="space-y-1">
            <p className="text-[8px] text-gray-500 uppercase font-black">Status</p>
            <p className="text-[10px] text-gray-200 font-bold uppercase italic">Independent</p>
          </div>
        </div>

        <div className="pt-4 space-y-2">
          <p className="text-[8px] text-gray-600 uppercase tracking-[0.5em] font-black">
            Developed For Next Gen Researchers
          </p>
          <div className="bg-blue-600/10 p-3 rounded-2xl border border-blue-500/20">
            <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest italic">
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
