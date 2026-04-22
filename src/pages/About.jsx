import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Globe, Award, Users, Star, Code2 } from "lucide-react";
import { useEasStore, THEMES } from "../store/useStore";
import { playSound } from "../component/Intro";

// Liquid Glass mixin (reusable style)
const glass = (opacity = 0.08, border = "rgba(168,85,247,0.2)") => ({
  background: `rgba(20,10,40,${opacity})`,
  backdropFilter: "blur(20px) saturate(1.8)",
  WebkitBackdropFilter: "blur(20px) saturate(1.8)",
  border: `1px solid ${border}`,
  boxShadow: "0 8px 32px rgba(100,40,200,0.15), inset 0 1px 0 rgba(255,255,255,0.06)",
});

// Canvas components (Planet, Galaxy, BlackHole) — sama seperti sebelumnya
const PlanetCanvas = ({ accentColor, accent2 }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight;
    const stars = Array.from({length:120},()=>({x:Math.random()*canvas.width,y:Math.random()*canvas.height,r:Math.random()*1.5+0.3,opacity:Math.random()}));
    const rings=[{rx:90,ry:22,color:accentColor,opacity:0.5},{rx:110,ry:28,color:accent2,opacity:0.3},{rx:130,ry:34,color:"#8b5cf6",opacity:0.2}];
    const orbiters=Array.from({length:5},(_,i)=>({angle:(i/5)*Math.PI*2,speed:0.008+i*0.002,rx:100+i*15,ry:25+i*6,color:[accentColor,accent2,"#8b5cf6","#f59e0b","#10b981"][i],size:2+Math.random()*2}));
    let frame=0,animId;
    const draw=()=>{
      ctx.clearRect(0,0,canvas.width,canvas.height);const cx=canvas.width/2,cy=canvas.height/2;
      stars.forEach(s=>{s.opacity+=(Math.random()-0.5)*0.05;s.opacity=Math.max(0.1,Math.min(1,s.opacity));ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fillStyle=`rgba(147,197,253,${s.opacity})`;ctx.fill();});
      const grd=ctx.createRadialGradient(cx,cy,5,cx,cy,65);grd.addColorStop(0,`${accentColor}ee`);grd.addColorStop(0.5,`${accent2}88`);grd.addColorStop(1,`${accentColor}00`);
      ctx.beginPath();ctx.arc(cx,cy,60,0,Math.PI*2);ctx.fillStyle=grd;ctx.fill();
      ctx.beginPath();ctx.arc(cx,cy,52,0,Math.PI*2);ctx.fillStyle="rgba(15,23,42,0.85)";ctx.fill();ctx.strokeStyle=`${accentColor}99`;ctx.lineWidth=1.5;ctx.stroke();
      const scanY=cy-52+((frame*1.5)%104);ctx.save();ctx.globalAlpha=0.2;ctx.fillStyle=accent2;ctx.fillRect(cx-52,scanY,104,2);ctx.restore();
      ctx.save();ctx.translate(cx,cy);rings.forEach(r=>{ctx.beginPath();ctx.ellipse(0,0,r.rx,r.ry,0,0,Math.PI*2);ctx.strokeStyle=r.color;ctx.globalAlpha=r.opacity+Math.sin(frame*0.02)*0.05;ctx.lineWidth=1.5;ctx.stroke();});ctx.restore();
      orbiters.forEach(o=>{o.angle+=o.speed;const ox=cx+Math.cos(o.angle)*o.rx,oy=cy+Math.sin(o.angle)*o.ry;ctx.beginPath();ctx.arc(ox,oy,o.size,0,Math.PI*2);ctx.fillStyle=o.color;ctx.globalAlpha=0.9;ctx.fill();});
      ctx.save();ctx.translate(cx,cy);ctx.globalAlpha=0.7;ctx.fillStyle="#93c5fd";ctx.font="bold 9px monospace";ctx.textAlign="center";ctx.fillText("EAS",0,-8);ctx.font="6px monospace";ctx.fillStyle=accent2;ctx.fillText("CORE",0,4);ctx.restore();
      frame++;animId=requestAnimationFrame(draw);
    };
    animId=requestAnimationFrame(draw);return()=>cancelAnimationFrame(animId);
  },[accentColor,accent2]);
  return <canvas ref={canvasRef} className="w-full h-full"/>;
};

const GalaxyCanvas = ({ accentColor, accent2 }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width=canvas.offsetWidth;canvas.height=canvas.offsetHeight;
    const cx=canvas.width/2,cy=canvas.height/2;
    const spiralStars=Array.from({length:300},(_,i)=>{const arm=i%3,t=(i/300)*Math.PI*6,aA=arm*((Math.PI*2)/3),r=10+t*10,sc=(Math.random()-0.5)*18;return{angle:t+aA,radius:r+sc,size:Math.random()*1.8+0.3,opacity:Math.random()*0.8+0.2,color:[accentColor,accent2,"#8b5cf6","#f59e0b"][Math.floor(Math.random()*4)],speed:(Math.random()*0.003+0.001)*(arm%2===0?1:-0.5),twinkle:Math.random()*Math.PI*2};});
    let frame=0,animId;
    const draw=()=>{
      ctx.clearRect(0,0,canvas.width,canvas.height);
      const cGrd=ctx.createRadialGradient(cx,cy,0,cx,cy,35);cGrd.addColorStop(0,`${accentColor}ff`);cGrd.addColorStop(0.4,`${accent2}88`);cGrd.addColorStop(1,`${accentColor}00`);
      ctx.beginPath();ctx.arc(cx,cy,35,0,Math.PI*2);ctx.fillStyle=cGrd;ctx.fill();
      const pR=20+Math.sin(frame*0.05)*5;ctx.beginPath();ctx.arc(cx,cy,pR,0,Math.PI*2);ctx.strokeStyle=accent2;ctx.globalAlpha=0.4+Math.sin(frame*0.05)*0.2;ctx.lineWidth=1;ctx.stroke();ctx.globalAlpha=1;
      spiralStars.forEach(s=>{s.angle+=s.speed;s.twinkle+=0.05;const x=cx+Math.cos(s.angle)*s.radius*0.85,y=cy+Math.sin(s.angle)*s.radius*0.4,op=s.opacity*(0.7+Math.sin(s.twinkle)*0.3);ctx.beginPath();ctx.arc(x,y,s.size,0,Math.PI*2);ctx.fillStyle=s.color;ctx.globalAlpha=op;ctx.fill();});
      ctx.globalAlpha=1;frame++;animId=requestAnimationFrame(draw);
    };
    animId=requestAnimationFrame(draw);return()=>cancelAnimationFrame(animId);
  },[accentColor,accent2]);
  return <canvas ref={canvasRef} className="w-full h-full"/>;
};

const BlackHoleCanvas = ({ accentColor, accent2 }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas=canvasRef.current;if(!canvas)return;const ctx=canvas.getContext("2d");
    canvas.width=canvas.offsetWidth;canvas.height=canvas.offsetHeight;const cx=canvas.width/2,cy=canvas.height/2;
    const disk=Array.from({length:150},(_,i)=>({angle:(i/150)*Math.PI*2,rx:55+Math.random()*30,ry:12+Math.random()*8,speed:0.015+Math.random()*0.01,color:[accentColor,accent2,"#f59e0b","#ff6b6b"][Math.floor(Math.random()*4)],size:Math.random()*2+0.5,opacity:Math.random()*0.8+0.2}));
    const stars=Array.from({length:100},()=>({angle:Math.random()*Math.PI*2,dist:60+Math.random()*120,size:Math.random()*1.5+0.3,speed:(Math.random()*0.003+0.001)*(Math.random()>0.5?1:-1),opacity:Math.random(),color:[accentColor,accent2,"#fff"][Math.floor(Math.random()*3)]}));
    let frame=0,animId;
    const draw=()=>{
      ctx.clearRect(0,0,canvas.width,canvas.height);
      stars.forEach(s=>{s.angle+=s.speed;s.opacity=0.3+Math.sin(frame*0.03+s.angle)*0.4;const x=cx+Math.cos(s.angle)*s.dist,y=cy+Math.sin(s.angle)*s.dist*0.5;ctx.beginPath();ctx.arc(x,y,s.size*0.6,0,Math.PI*2);ctx.fillStyle=s.color;ctx.globalAlpha=Math.max(0,s.opacity);ctx.fill();});
      ctx.globalAlpha=1;
      disk.forEach(p=>{p.angle+=p.speed;const x=cx+Math.cos(p.angle)*p.rx,y=cy+Math.sin(p.angle)*p.ry;ctx.beginPath();ctx.arc(x,y,p.size,0,Math.PI*2);ctx.fillStyle=p.color;ctx.globalAlpha=p.opacity*(0.6+Math.sin(frame*0.05+p.angle)*0.4);ctx.fill();});
      ctx.globalAlpha=1;
      const gGrd=ctx.createRadialGradient(cx,cy,15,cx,cy,55);gGrd.addColorStop(0,"rgba(0,0,0,1)");gGrd.addColorStop(0.6,"rgba(0,0,0,0.95)");gGrd.addColorStop(0.85,`${accentColor}44`);gGrd.addColorStop(1,`${accentColor}00`);
      ctx.beginPath();ctx.arc(cx,cy,55,0,Math.PI*2);ctx.fillStyle=gGrd;ctx.fill();
      ctx.beginPath();ctx.arc(cx,cy,32,0,Math.PI*2);ctx.fillStyle="#000";ctx.fill();ctx.strokeStyle=`${accentColor}cc`;ctx.lineWidth=1.5;ctx.globalAlpha=0.8+Math.sin(frame*0.04)*0.2;ctx.stroke();ctx.globalAlpha=1;
      ctx.beginPath();ctx.arc(cx,cy,36,0,Math.PI*2);ctx.strokeStyle=accent2;ctx.lineWidth=1;ctx.globalAlpha=0.3+Math.sin(frame*0.08)*0.2;ctx.stroke();ctx.globalAlpha=1;
      frame++;animId=requestAnimationFrame(draw);
    };
    animId=requestAnimationFrame(draw);return()=>cancelAnimationFrame(animId);
  },[accentColor,accent2]);
  return <canvas ref={canvasRef} className="w-full h-full"/>;
};

// ── STRUKTUR ──────────────────────────────
const ADMIN_STRUCTURE = [
  { role:"Owner",       name:"Shadow",      color:"#f59e0b" },
  { role:"Co-Owner",    name:"Zef",         color:"#f97316" },
  { role:"Co-Owner",    name:"Ryneford",    color:"#f97316" },
  { role:"Admin",       name:"Fii",         color:"#a855f7" },
  { role:"Admin",       name:"Nay",         color:"#a855f7" },
  { role:"Admin",       name:"Domino Fate", color:"#a855f7" },
  { role:"Admin",       name:"Vasily Manz", color:"#a855f7" },
];

const EDITOR_STRUCTURE = [
  { role:"Ketua Editor",  name:"Cahy", color:"#ec4899" },
  { role:"Wakil Editor",  name:"Dani", color:"#db2777" },
  { role:"Admin Editor",  name:"Neo",  color:"#38bdf8" },
  { role:"Admin Editor",  name:"Hani", color:"#38bdf8" },
];

const MODES = [
  { key:"planet",    emoji:"🪐", label:"Planet"    },
  { key:"galaxy",    emoji:"🌌", label:"Galaxy"    },
  { key:"blackhole", emoji:"🕳️", label:"Black Hole"},
];

// ── MAIN COMPONENT ────────────────────────
const About = () => {
  const navigate = useNavigate();
  const { theme, hologramMode, setHologramMode } = useEasStore();
  const t = THEMES[theme] || THEMES.dark;

  return (
    <div className="min-h-screen text-white relative overflow-hidden pb-28"
      style={{ background: "linear-gradient(135deg,#06010f 0%,#0a0218 40%,#060115 100%)" }}>

      {/* ambient glow */}
      <div className="absolute top-0 left-1/4 w-80 h-80 rounded-full pointer-events-none opacity-30"
        style={{ background: "radial-gradient(circle,#7c3aed40,transparent 70%)", filter:"blur(60px)" }}/>
      <div className="absolute bottom-20 right-0 w-64 h-64 rounded-full pointer-events-none opacity-20"
        style={{ background: "radial-gradient(circle,#2563eb40,transparent 70%)", filter:"blur(60px)" }}/>

      {/* Back */}
      <button onClick={() => { playSound("click"); navigate("/"); }}
        className="absolute top-5 left-4 p-2.5 rounded-2xl transition active:scale-90 z-10"
        style={glass(0.12,"rgba(168,85,247,0.3)")}>
        <ArrowLeft size={18} style={{ color: t.accent }} />
      </button>

      {/* Mode toggle */}
      <div className="absolute top-5 right-4 flex gap-1.5 z-10">
        {MODES.map(m => (
          <button key={m.key} onClick={() => { playSound("click"); setHologramMode(m.key); }}
            className="px-2 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all"
            style={hologramMode===m.key
              ? { background:`${t.accent}30`, border:`1px solid ${t.accent}60`, color:t.accent }
              : { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", color:"#6b7280" }}>
            {m.emoji}
          </button>
        ))}
      </div>

      {/* Canvas hologram */}
      <div className="relative w-64 h-64 mx-auto mt-16 mb-3">
        {hologramMode==="planet"    && <PlanetCanvas    accentColor={t.accent} accent2={t.accent2}/>}
        {hologramMode==="galaxy"    && <GalaxyCanvas    accentColor={t.accent} accent2={t.accent2}/>}
        {hologramMode==="blackhole" && <BlackHoleCanvas accentColor={t.accent} accent2={t.accent2}/>}
      </div>

      <p className="text-center text-[9px] font-bold uppercase tracking-widest mb-6" style={{ color:t.accent }}>
        {hologramMode==="planet"?"🪐 Hologram Planet":hologramMode==="galaxy"?"🌌 Spiral Galaxy":"🕳️ Black Hole"}
      </p>

      <div className="px-5 space-y-4">

        {/* Welcome card — liquid glass */}
        <div className="rounded-3xl p-5" style={glass(0.1,"rgba(120,60,220,0.25)")}>
          <h1 className="text-sm font-black text-center mb-3 leading-tight"
            style={{ background:"linear-gradient(135deg,#a855f7,#38bdf8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            WELCOME TO EAS
          </h1>
          <h2 className="text-xs font-black text-center text-white mb-2 uppercase tracking-wide">
            Education Astronomi Sains
          </h2>
          <p className="text-[10px] text-center font-bold text-purple-300 mb-3">
            Diumumkan pada 07 Desember 2025
          </p>
          <p className="text-[10px] text-gray-400 leading-relaxed text-center">
            Komunitas ini bertujuan untuk mengedukasi orang-orang agar paham dengan edukasi dan konsep astronomi secara mendalam dan komprehensif.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon:<Globe size={14}/>, label:"Mission",   value:"Education", color:"#38bdf8" },
            { icon:<Award size={14}/>, label:"Status",    value:"Active",    color:"#10b981" },
            { icon:<Users size={14}/>, label:"Type",      value:"Community", color:"#a855f7" },
          ].map((s,i) => (
            <div key={i} className="rounded-2xl p-3 text-center" style={glass(0.08,s.color+"25")}>
              <div className="flex justify-center mb-1" style={{ color:s.color }}>{s.icon}</div>
              <p className="text-[8px] text-gray-500 uppercase font-black">{s.label}</p>
              <p className="text-[9px] text-white font-bold mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Admin structure */}
        <div className="rounded-3xl p-4" style={glass(0.08,"rgba(245,158,11,0.2)")}>
          <p className="text-[10px] font-black text-yellow-400 uppercase tracking-widest mb-3">✨ Struktur Admin</p>
          <div className="space-y-2">
            {ADMIN_STRUCTURE.map((s,i) => (
              <div key={i} className="flex justify-between items-center px-3 py-2 rounded-xl"
                style={{ background:s.color+"12", border:`1px solid ${s.color}25` }}>
                <span className="text-[9px] text-gray-500 font-bold uppercase">{s.role}</span>
                <span className="text-[10px] font-black" style={{ color:s.color }}>{s.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Editor structure */}
        <div className="rounded-3xl p-4" style={glass(0.08,"rgba(236,72,153,0.2)")}>
          <p className="text-[10px] font-black text-pink-400 uppercase tracking-widest mb-3">👑 Struktur Editor</p>
          <div className="space-y-2">
            {EDITOR_STRUCTURE.map((s,i) => (
              <div key={i} className="flex justify-between items-center px-3 py-2 rounded-xl"
                style={{ background:s.color+"12", border:`1px solid ${s.color}25` }}>
                <span className="text-[9px] text-gray-500 font-bold uppercase">{s.role}</span>
                <span className="text-[10px] font-black" style={{ color:s.color }}>{s.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dev credit */}
        <div className="rounded-3xl p-4 text-center" style={glass(0.1,"rgba(56,189,248,0.2)")}>
          <Code2 size={18} className="mx-auto mb-2 text-sky-400" />
          <p className="text-[8px] text-gray-500 uppercase tracking-widest font-black mb-1">Developed by</p>
          <p className="text-xs font-black text-white">M. Fikri Surya Firdaus</p>
          <div className="mt-2 pt-2 border-t border-sky-500/20">
            <p className="text-[8px] text-gray-600 uppercase tracking-widest">Powered by</p>
            <p className="text-[10px] font-black bg-gradient-to-r from-purple-400 to-sky-400 bg-clip-text text-transparent mt-0.5">
              SynthCode Solutions
            </p>
          </div>
        </div>

        <footer className="text-center opacity-20 pb-2">
          <p className="text-[7px] font-black tracking-[1.5em] uppercase">EAS Security Protocol • v3.0</p>
        </footer>
      </div>
    </div>
  );
};

export default About;
