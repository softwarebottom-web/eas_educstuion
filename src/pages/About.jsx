import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Code2 } from "lucide-react";
import { useEasStore, THEMES } from "../store/useStore";
import { playSound } from "../component/Intro";
import { motion, AnimatePresence } from "framer-motion";

// ── Liquid Glass helper ───────────────────
const glass = (op = 0.08, border = "rgba(120,80,220,0.22)") => ({
  background: `rgba(12,5,28,${op})`,
  backdropFilter: "blur(22px) saturate(1.9)",
  WebkitBackdropFilter: "blur(22px) saturate(1.9)",
  border: `1px solid ${border}`,
  boxShadow: "0 8px 32px rgba(80,40,180,0.14), inset 0 1px 0 rgba(255,255,255,0.07)",
});

// ── Canvas: Planet ────────────────────────
const PlanetCanvas = ({ ac, a2 }) => {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    c.width = c.offsetWidth; c.height = c.offsetHeight;
    const stars = Array.from({length:120},()=>({x:Math.random()*c.width,y:Math.random()*c.height,r:Math.random()*1.4+0.3,o:Math.random()}));
    const rings=[{rx:88,ry:22,col:ac,op:0.5},{rx:108,ry:28,col:a2,op:0.3},{rx:128,ry:34,col:"#8b5cf6",op:0.2}];
    const orbs=Array.from({length:5},(_,i)=>({a:(i/5)*Math.PI*2,sp:0.008+i*0.002,rx:98+i*15,ry:24+i*6,col:[ac,a2,"#8b5cf6","#f59e0b","#10b981"][i],sz:2+Math.random()*2}));
    let fr=0, id;
    const draw=()=>{
      ctx.clearRect(0,0,c.width,c.height);
      const cx=c.width/2,cy=c.height/2;
      stars.forEach(s=>{s.o+=(Math.random()-0.5)*0.04;s.o=Math.max(0.1,Math.min(1,s.o));ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fillStyle=`rgba(180,160,255,${s.o})`;ctx.fill();});
      const g=ctx.createRadialGradient(cx,cy,4,cx,cy,62);g.addColorStop(0,ac+"ee");g.addColorStop(0.5,a2+"88");g.addColorStop(1,ac+"00");
      ctx.beginPath();ctx.arc(cx,cy,58,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();
      ctx.beginPath();ctx.arc(cx,cy,50,0,Math.PI*2);ctx.fillStyle="rgba(10,5,25,0.88)";ctx.fill();
      ctx.strokeStyle=ac+"99";ctx.lineWidth=1.5;ctx.stroke();
      const sy=cy-50+((fr*1.5)%100);ctx.save();ctx.globalAlpha=0.18;ctx.fillStyle=a2;ctx.fillRect(cx-50,sy,100,2);ctx.restore();
      ctx.save();ctx.translate(cx,cy);
      rings.forEach(r=>{ctx.beginPath();ctx.ellipse(0,0,r.rx,r.ry,0,0,Math.PI*2);ctx.strokeStyle=r.col;ctx.globalAlpha=r.op+Math.sin(fr*0.02)*0.04;ctx.lineWidth=1.5;ctx.stroke();});
      ctx.restore();ctx.globalAlpha=1;
      orbs.forEach(o=>{o.a+=o.sp;const ox=cx+Math.cos(o.a)*o.rx,oy=cy+Math.sin(o.a)*o.ry;ctx.beginPath();ctx.arc(ox,oy,o.sz,0,Math.PI*2);ctx.fillStyle=o.col;ctx.globalAlpha=0.9;ctx.fill();});
      ctx.globalAlpha=1;fr++;id=requestAnimationFrame(draw);
    };
    id=requestAnimationFrame(draw);return()=>cancelAnimationFrame(id);
  },[ac,a2]);
  return <canvas ref={ref} className="w-full h-full"/>;
};

// ── Canvas: Galaxy ────────────────────────
const GalaxyCanvas = ({ ac, a2 }) => {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    c.width=c.offsetWidth;c.height=c.offsetHeight;
    const cx=c.width/2,cy=c.height/2;
    const stars=Array.from({length:300},(_,i)=>{const arm=i%3,t=(i/300)*Math.PI*6,aA=arm*((Math.PI*2)/3),r=10+t*10,sc=(Math.random()-0.5)*18;return{a:t+aA,r:r+sc,sz:Math.random()*1.8+0.3,op:Math.random()*0.8+0.2,col:[ac,a2,"#8b5cf6","#f59e0b"][Math.floor(Math.random()*4)],sp:(Math.random()*0.003+0.001)*(arm%2===0?1:-0.5),tw:Math.random()*Math.PI*2};});
    let fr=0,id;
    const draw=()=>{
      ctx.clearRect(0,0,c.width,c.height);
      const cg=ctx.createRadialGradient(cx,cy,0,cx,cy,34);cg.addColorStop(0,ac+"ff");cg.addColorStop(0.4,a2+"88");cg.addColorStop(1,ac+"00");
      ctx.beginPath();ctx.arc(cx,cy,34,0,Math.PI*2);ctx.fillStyle=cg;ctx.fill();
      const pr=20+Math.sin(fr*0.05)*5;ctx.beginPath();ctx.arc(cx,cy,pr,0,Math.PI*2);ctx.strokeStyle=a2;ctx.globalAlpha=0.4+Math.sin(fr*0.05)*0.2;ctx.lineWidth=1;ctx.stroke();ctx.globalAlpha=1;
      stars.forEach(s=>{s.a+=s.sp;s.tw+=0.05;const x=cx+Math.cos(s.a)*s.r*0.85,y=cy+Math.sin(s.a)*s.r*0.4,op=s.op*(0.7+Math.sin(s.tw)*0.3);ctx.beginPath();ctx.arc(x,y,s.sz,0,Math.PI*2);ctx.fillStyle=s.col;ctx.globalAlpha=op;ctx.fill();});
      ctx.globalAlpha=1;fr++;id=requestAnimationFrame(draw);
    };
    id=requestAnimationFrame(draw);return()=>cancelAnimationFrame(id);
  },[ac,a2]);
  return <canvas ref={ref} className="w-full h-full"/>;
};

// ── Canvas: Black Hole ────────────────────
const BlackHoleCanvas = ({ ac, a2 }) => {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    c.width=c.offsetWidth;c.height=c.offsetHeight;const cx=c.width/2,cy=c.height/2;
    const disk=Array.from({length:150},(_,i)=>({a:(i/150)*Math.PI*2,rx:54+Math.random()*28,ry:12+Math.random()*8,sp:0.015+Math.random()*0.01,col:[ac,a2,"#f59e0b","#ff6b6b"][Math.floor(Math.random()*4)],sz:Math.random()*2+0.5,op:Math.random()*0.8+0.2}));
    const stars=Array.from({length:100},()=>({a:Math.random()*Math.PI*2,d:60+Math.random()*120,sz:Math.random()*1.5+0.3,sp:(Math.random()*0.003+0.001)*(Math.random()>0.5?1:-1),op:Math.random(),col:[ac,a2,"#fff"][Math.floor(Math.random()*3)]}));
    let fr=0,id;
    const draw=()=>{
      ctx.clearRect(0,0,c.width,c.height);
      stars.forEach(s=>{s.a+=s.sp;s.op=0.3+Math.sin(fr*0.03+s.a)*0.4;const x=cx+Math.cos(s.a)*s.d,y=cy+Math.sin(s.a)*s.d*0.5;ctx.beginPath();ctx.arc(x,y,s.sz*0.6,0,Math.PI*2);ctx.fillStyle=s.col;ctx.globalAlpha=Math.max(0,s.op);ctx.fill();});
      ctx.globalAlpha=1;
      disk.forEach(p=>{p.a+=p.sp;const x=cx+Math.cos(p.a)*p.rx,y=cy+Math.sin(p.a)*p.ry;ctx.beginPath();ctx.arc(x,y,p.sz,0,Math.PI*2);ctx.fillStyle=p.col;ctx.globalAlpha=p.op*(0.6+Math.sin(fr*0.05+p.a)*0.4);ctx.fill();});
      ctx.globalAlpha=1;
      const gg=ctx.createRadialGradient(cx,cy,14,cx,cy,54);gg.addColorStop(0,"rgba(0,0,0,1)");gg.addColorStop(0.6,"rgba(0,0,0,0.95)");gg.addColorStop(0.85,ac+"44");gg.addColorStop(1,ac+"00");
      ctx.beginPath();ctx.arc(cx,cy,54,0,Math.PI*2);ctx.fillStyle=gg;ctx.fill();
      ctx.beginPath();ctx.arc(cx,cy,30,0,Math.PI*2);ctx.fillStyle="#000";ctx.fill();
      ctx.strokeStyle=ac+"cc";ctx.lineWidth=1.5;ctx.globalAlpha=0.8+Math.sin(fr*0.04)*0.2;ctx.stroke();ctx.globalAlpha=1;
      fr++;id=requestAnimationFrame(draw);
    };
    id=requestAnimationFrame(draw);return()=>cancelAnimationFrame(id);
  },[ac,a2]);
  return <canvas ref={ref} className="w-full h-full"/>;
};

// ── Structure data ────────────────────────
const ADMIN_STRUCT = [
  { role:"Owner",       name:"Shadow",       badge:"👑", color:"#f59e0b", glow:"rgba(245,158,11,0.40)", rank:0, effect:"pulse" },
  { role:"Co-Owner",    name:"Zef",          badge:"🌙", color:"#fb923c", glow:"rgba(251,146,60,0.30)", rank:1, effect:"shimmer" },
  { role:"Co-Owner",    name:"Ryneford",     badge:"⚡", color:"#f97316", glow:"rgba(249,115,22,0.30)", rank:1, effect:"shimmer" },
  { role:"Admin",       name:"Fii",          badge:"🔮", color:"#a855f7", glow:"rgba(168,85,247,0.25)", rank:2, effect:"glow" },
  { role:"Admin",       name:"Nay",          badge:"💜", color:"#8b5cf6", glow:"rgba(139,92,246,0.25)", rank:2, effect:"glow" },
  { role:"Admin",       name:"Domino Fate",  badge:"🌀", color:"#7c3aed", glow:"rgba(124,58,237,0.25)", rank:2, effect:"glow" },
  { role:"Admin",       name:"Vasily Manz",  badge:"🛸", color:"#6d28d9", glow:"rgba(109,40,217,0.25)", rank:2, effect:"glow" },
];

const EDITOR_STRUCT = [
  { role:"Ketua Editor",  name:"Cahy",  badge:"✨", color:"#ec4899", glow:"rgba(236,72,153,0.32)", rank:0, effect:"pulse" },
  { role:"Wakil Editor",  name:"Dyela", badge:"🌸", color:"#f472b6", glow:"rgba(244,114,182,0.25)", rank:1, effect:"shimmer" },
  { role:"Admin Editor",  name:"Neo",   badge:"💎", color:"#38bdf8", glow:"rgba(56,189,248,0.25)", rank:2, effect:"glow" },
];

const MODES = [
  { key:"planet",    emoji:"🪐", label:"Planet"     },
  { key:"galaxy",    emoji:"🌌", label:"Galaxy"     },
  { key:"blackhole", emoji:"🕳️", label:"Black Hole" },
];

// ── Structure Card ────────────────────────
const StructCard = ({ item, index }) => {
  const [hovered, setHovered] = useState(false);
  const isOwner  = item.rank === 0;
  const isCo     = item.rank === 1;
  const PAD      = isOwner ? "p-4" : isCo ? "p-3.5" : "p-3";
  const NAMESIZE = isOwner ? "text-sm" : isCo ? "text-xs" : "text-xs";
  const ORBSIZE  = isOwner ? 42 : isCo ? 36 : 30;

  // Efek berbeda per rank
  const pulseAnim   = { boxShadow: [`0 0 10px ${item.glow}`, `0 0 28px ${item.glow}`, `0 0 10px ${item.glow}`] };
  const shimmerBg   = `linear-gradient(120deg, ${item.color}25 0%, ${item.color}10 40%, ${item.color}30 60%, ${item.color}10 100%)`;

  return (
    <motion.div
      initial={{ opacity:0, x: index % 2 === 0 ? -20 : 20 }}
      animate={{ opacity:1, x:0 }}
      transition={{ delay: index * 0.07, type:"spring", stiffness:130, damping:18 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className={`relative rounded-2xl ${PAD} cursor-default overflow-hidden`}
      style={{
        background: hovered
          ? `rgba(12,5,28,0.18)`
          : `rgba(12,5,28,0.10)`,
        backdropFilter: "blur(22px) saturate(1.9)",
        WebkitBackdropFilter: "blur(22px) saturate(1.9)",
        border: `1px solid ${item.color}${hovered?"55":"28"}`,
        transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
        transform: hovered
          ? isOwner ? "translateY(-3px) scale(1.01)" : "translateY(-2px)"
          : "none",
        boxShadow: hovered
          ? `0 0 30px ${item.glow}, 0 12px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.10)`
          : `0 4px 16px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.04)`,
      }}>

      {/* Top glow strip */}
      <motion.div className="absolute top-0 left-0 right-0 h-px"
        animate={hovered ? { opacity:1 } : { opacity:0.4 }}
        style={{ background:`linear-gradient(90deg,transparent,${item.color}90,transparent)` }}/>

      {/* Shimmer overlay (co-owner rank) */}
      {isCo && hovered && (
        <motion.div initial={{ x:"-100%" }} animate={{ x:"200%" }} transition={{ duration:0.7, ease:"easeInOut" }}
          className="absolute inset-0 pointer-events-none"
          style={{ background:`linear-gradient(90deg,transparent,${item.color}15,transparent)`, width:"60%" }}/>
      )}

      {/* Pulse ring (owner rank) */}
      {isOwner && (
        <motion.div className="absolute inset-0 rounded-2xl pointer-events-none"
          animate={pulseAnim} transition={{ duration:2.5, repeat:Infinity, ease:"easeInOut" }}
          style={{ border:`1px solid ${item.color}30` }}/>
      )}

      <div className="flex items-center justify-between gap-2 relative z-10">
        <div className="flex items-center gap-2.5 min-w-0">

          {/* Avatar orb */}
          <motion.div
            animate={isOwner
              ? { boxShadow: [`0 0 8px ${item.glow}`,`0 0 22px ${item.glow}`,`0 0 8px ${item.glow}`] }
              : hovered ? { scale:1.1 } : { scale:1 }}
            transition={isOwner
              ? { duration:2, repeat:Infinity, ease:"easeInOut" }
              : { type:"spring", stiffness:280 }}
            className="flex-shrink-0 flex items-center justify-center rounded-full"
            style={{
              width: ORBSIZE, height: ORBSIZE,
              background: `radial-gradient(circle at 35% 30%, ${item.color}60, ${item.color}18)`,
              border: `${isOwner?"2px":"1.5px"} solid ${item.color}${hovered?"70":"40"}`,
              fontSize: isOwner ? "1.25rem" : isCo ? "1rem" : "0.875rem",
              boxShadow: `0 0 ${isOwner?16:8}px ${item.glow}`,
            }}>
            {item.badge}
          </motion.div>

          {/* Name + role */}
          <div className="min-w-0">
            <p className={`font-black text-white leading-tight truncate ${NAMESIZE}`}>{item.name}</p>
            <motion.p className="text-[9px] font-bold uppercase tracking-widest mt-0.5"
              animate={hovered ? { opacity:1 } : { opacity:0.7 }}
              style={{ color: item.color }}>
              {item.role}
            </motion.p>
          </div>
        </div>

        {/* Right side: rank dots + star (owner) */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <div className="flex gap-1">
            {Array.from({ length: Math.max(1, 3 - item.rank) }).map((_, i) => (
              <motion.div key={i}
                animate={hovered
                  ? { opacity:1, scale:1.3, y:-1 }
                  : { opacity: 0.35 + i * 0.15, scale:1, y:0 }}
                transition={{ delay: i * 0.06, type:"spring", stiffness:250 }}
                className="rounded-full"
                style={{
                  width: isOwner ? 6 : isCo ? 5 : 4,
                  height: isOwner ? 6 : isCo ? 5 : 4,
                  background: item.color,
                  boxShadow: hovered ? `0 0 6px ${item.glow}` : "none"
                }}/>
            ))}
          </div>
          {isOwner && (
            <motion.span className="text-[8px] font-black"
              style={{ color:item.color }}
              animate={{ opacity:[0.6,1,0.6] }} transition={{ duration:2, repeat:Infinity }}>
              ★ LEAD
            </motion.span>
          )}
          {isCo && (
            <span className="text-[7px] font-black" style={{ color:item.color, opacity:0.6 }}>◆ CO</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ── MAIN ABOUT ────────────────────────────
const About = () => {
  const navigate = useNavigate();
  const { theme, hologramMode, setHologramMode } = useEasStore();
  const t = THEMES[theme] || THEMES.dark;

  return (
    <div className="min-h-screen text-white pb-28 relative overflow-hidden"
      style={{ background:"linear-gradient(135deg,#06010f 0%,#0a0218 40%,#060115 100%)" }}>

      {/* Ambient blobs */}
      <div className="fixed top-10 left-1/4 w-72 h-72 rounded-full pointer-events-none"
        style={{ background:"radial-gradient(circle,#7c3aed25,transparent 70%)", filter:"blur(60px)", zIndex:0 }}/>
      <div className="fixed bottom-20 right-0 w-56 h-56 rounded-full pointer-events-none"
        style={{ background:"radial-gradient(circle,#2563eb20,transparent 70%)", filter:"blur(50px)", zIndex:0 }}/>

      {/* Back */}
      <button onClick={() => { playSound("click"); navigate("/"); }}
        className="absolute top-5 left-4 p-2.5 rounded-2xl z-10 transition active:scale-90"
        style={glass(0.14,"rgba(168,85,247,0.35)")}>
        <ArrowLeft size={18} style={{ color:"#a855f7" }}/>
      </button>

      {/* Mode toggle */}
      <div className="absolute top-5 right-4 flex gap-1.5 z-10">
        {MODES.map(m => (
          <button key={m.key} onClick={() => { playSound("click"); setHologramMode(m.key); }}
            className="px-2 py-1.5 rounded-xl text-[9px] font-black transition-all"
            style={hologramMode===m.key
              ? glass(0.22, "#a855f760")
              : { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", color:"#6b7280" }}>
            <span style={hologramMode===m.key?{color:"#a855f7"}:{}}>{m.emoji}</span>
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div className="relative w-60 h-60 mx-auto mt-16 mb-2 z-10">
        {hologramMode==="planet"    && <PlanetCanvas    ac={t.accent} a2={t.accent2}/>}
        {hologramMode==="galaxy"    && <GalaxyCanvas    ac={t.accent} a2={t.accent2}/>}
        {hologramMode==="blackhole" && <BlackHoleCanvas ac={t.accent} a2={t.accent2}/>}
      </div>

      <p className="text-center text-[9px] font-black uppercase tracking-widest mb-5 z-10 relative" style={{ color:t.accent }}>
        {hologramMode==="planet"?"🪐 Hologram Planet":hologramMode==="galaxy"?"🌌 Spiral Galaxy":"🕳️ Black Hole"}
      </p>

      {/* Content */}
      <div className="px-4 space-y-4 relative z-10">

        {/* Welcome */}
        <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.05 }}
          className="rounded-3xl p-5" style={glass(0.12,"rgba(120,80,220,0.28)")}>
          <div className="absolute top-0 left-8 right-8 h-px"
            style={{ background:"linear-gradient(90deg,transparent,#a855f780,#38bdf880,transparent)" }}/>
          <h1 className="text-sm font-black text-center mb-2 leading-tight"
            style={{ background:"linear-gradient(135deg,#a855f7,#38bdf8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            WELCOME TO EAS
          </h1>
          <h2 className="text-xs font-black text-center text-white uppercase tracking-widest mb-2">
            Education Astronomi Sains
          </h2>
          <p className="text-[10px] font-bold text-center text-purple-300 mb-3">
            Diumumkan pada 07 Desember 2025
          </p>
          <p className="text-[10px] text-gray-400 leading-relaxed text-center">
            Komunitas ini bertujuan untuk mengedukasi orang-orang agar paham dengan edukasi dan konsep astronomi secara mendalam dan komprehensif.
          </p>
        </motion.div>

        {/* Admin structure */}
        <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.1 }}
          className="rounded-3xl p-4" style={glass(0.09,"rgba(245,158,11,0.2)")}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 rounded-full" style={{ background:"linear-gradient(to bottom,#f59e0b,#f97316)" }}/>
            <p className="text-xs font-black text-yellow-400 uppercase tracking-widest">Struktur Admin</p>
          </div>
          <div className="space-y-2">
            {ADMIN_STRUCT.map((item, i) => (
              <StructCard key={item.name} item={item} index={i}/>
            ))}
          </div>
        </motion.div>

        {/* Editor structure */}
        <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.15 }}
          className="rounded-3xl p-4" style={glass(0.09,"rgba(236,72,153,0.2)")}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 rounded-full" style={{ background:"linear-gradient(to bottom,#ec4899,#38bdf8)" }}/>
            <p className="text-xs font-black text-pink-400 uppercase tracking-widest">Struktur Editor</p>
          </div>
          <div className="space-y-2">
            {EDITOR_STRUCT.map((item, i) => (
              <StructCard key={item.name} item={item} index={i}/>
            ))}
          </div>
        </motion.div>

        {/* Credit */}
        <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.2 }}
          className="rounded-3xl p-4 text-center" style={glass(0.1,"rgba(56,189,248,0.22)")}>
          <div className="absolute top-0 left-8 right-8 h-px"
            style={{ background:"linear-gradient(90deg,transparent,#38bdf860,transparent)" }}/>
          <Code2 size={20} className="mx-auto mb-2 text-sky-400"/>
          <p className="text-[8px] text-gray-500 uppercase tracking-widest font-black mb-0.5">Developed by</p>
          <p className="text-sm font-black text-white">M. Fikri Surya Firdaus</p>
          <div className="mt-3 pt-3 border-t border-sky-500/15">
            <p className="text-[8px] text-gray-600 uppercase tracking-widest mb-0.5">Powered by</p>
            <p className="text-xs font-black"
              style={{ background:"linear-gradient(135deg,#a855f7,#38bdf8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              SynthCode Solutions
            </p>
          </div>
        </motion.div>

        <div className="text-center pb-2">
          <p className="text-[7px] font-black tracking-[1.5em] uppercase text-gray-800">EAS Portal • v3.0</p>
        </div>
      </div>
    </div>
  );
};

export default About;
