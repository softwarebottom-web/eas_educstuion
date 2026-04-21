import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Scale, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";

export const playSound = (type = "click") => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    if (type === "click") {
      osc.type = "sine"; osc.frequency.setValueAtTime(660, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(330, ctx.currentTime+0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+0.12);
      osc.start(); osc.stop(ctx.currentTime+0.12);
    } else if (type === "success") {
      [523,659,784,1047].forEach((f,i) => { const o=ctx.createOscillator(),g=ctx.createGain(); o.connect(g); g.connect(ctx.destination); o.type="sine"; o.frequency.value=f; g.gain.setValueAtTime(0,ctx.currentTime+i*0.07); g.gain.linearRampToValueAtTime(0.1,ctx.currentTime+i*0.07+0.02); g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+i*0.07+0.2); o.start(ctx.currentTime+i*0.07); o.stop(ctx.currentTime+i*0.07+0.22); }); return;
    } else if (type === "open") {
      osc.type = "triangle"; osc.frequency.setValueAtTime(400, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime+0.12);
      gain.gain.setValueAtTime(0.08, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+0.15);
      osc.start(); osc.stop(ctx.currentTime+0.15);
    } else if (type === "nav") {
      osc.type = "sine"; osc.frequency.setValueAtTime(500, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime+0.05);
      gain.gain.setValueAtTime(0.06, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+0.07);
      osc.start(); osc.stop(ctx.currentTime+0.07);
    }
  } catch (_) {}
};

const PURPLE_BG = "linear-gradient(135deg, #0d0020 0%, #080015 40%, #0a001a 70%, #050010 100%)";
const PURPLE_ACCENT = "#a855f7";
const PINK_ACCENT = "#ec4899";

const UUD_DATA = [
  { id:1, title:"Pasal 1: Identitas", content:"• Setiap anggota memiliki hak untuk menjaga identitas masing-masing.\n• Dilarang mengejek identitas satu sama lain.\n• Dilarang menyebarkan identitas sesama anggota tanpa izin resmi." },
  { id:2, title:"Pasal 2: Anggota", content:"• Hak mendapatkan ilmu, kebahagiaan, dan berbicara.\n• Wajib patuhi aturan dan terima konsekuensi.\n• Bebas stiker (non-dewasa).\n• Dilarang mengaku Admin/memberi SP." },
  { id:3, title:"Pasal 3: Admin/Petinggi", content:"• Wajib jalankan tugas tertib.\n• Dilarang mengejek member/admin lain.\n• Wajib patuhi aturan & terima konsekuensi melanggar." },
  { id:4, title:"Pasal 4: SP (Surat Peringatan)", content:"• Pelanggaran 2x (SP 1: Nasihat).\n• Pelanggaran 4x (SP 2: Teguran kecil).\n• SP 3 (Teguran keras). SP 4 (Kick sementara). SP 5 (Blacklist)." },
  { id:5, title:"Pasal 5: Pendidikan", content:"• Admin wajib beri materi & quiz 1x sehari.\n• Member berhak tanya & koreksi materi." },
  { id:6, title:"Pasal 6-7: Keamanan & Rapat", content:"• Admin tanggung jawab keamanan.\n• Rapat dipimpin Admin untuk kepentingan bersama." },
  { id:7, title:"Pasal 8: Perkataan & Sikap", content:"• Dilarang bermesraan (sesama/lawan jenis).\n• Dilarang rasis, pelecehan, & mencari pacar/mesum." },
  { id:8, title:"Pasal 9-12: Jabatan & Promosi", content:"• Admin tidak on 1 minggu = Copot jabatan.\n• Promosi wajib izin Admin. Link Phising = SP 5." },
];

const STEPS = [
  { num:1, icon:"📱", title:"Buka Halaman Register", color:"#8b5cf6", desc:"Akses portal EAS dan pilih Register.", detail:"Gunakan email aktif yang bisa diakses kapan saja." },
  { num:2, icon:"✍️", title:"Isi Data Diri", color:"#a855f7", desc:"Nama, email, password, tanggal lahir, domisili, link TikTok.", detail:"Link TikTok wajib mengandung kata tiktok. Usia minimal 10 tahun." },
  { num:3, icon:"🪪", title:"ID Card Dibuat Otomatis", color:"#ec4899", desc:"Member ID unik dan QR Code langsung dibuat.", detail:"ID Card bisa didownload sebagai bukti keanggotaan EAS." },
  { num:4, icon:"⏳", title:"Tunggu Verifikasi Admin", color:"#f59e0b", desc:"Admin akan memverifikasi akunmu dalam 1x24 jam.", detail:"Pantau status di halaman Access Portal." },
  { num:5, icon:"💬", title:"Join Grup WhatsApp", color:"#10b981", desc:"Link grup muncul di Access Portal kalau grup open.", detail:"Ada grup Gen 1 dan Gen 2 sesuai pilihanmu saat daftar." },
  { num:6, icon:"🚀", title:"Activate & Mulai!", color:"#3b82f6", desc:"Klik Activate di Access Portal untuk masuk dashboard.", detail:"Akses Library, AI Quiz, Solar System, Chat, dan semua fitur EAS." },
];

const RoadmapSteps = () => {
  const [active, setActive] = useState(null);
  const [visible, setVisible] = useState(0);
  useEffect(() => { let i=0; const t=setInterval(() => { i++; setVisible(i); if(i>=STEPS.length) clearInterval(t); }, 120); return () => clearInterval(t); }, []);
  return (
    <div className="relative pb-2">
      <motion.div className="absolute left-6 top-0 w-0.5" initial={{ height:0 }} animate={{ height:"100%" }} transition={{ duration:1.5, ease:"easeOut" }}
        style={{ background: `linear-gradient(to bottom, ${PURPLE_ACCENT}, ${PINK_ACCENT}, transparent)` }} />
      <div className="space-y-1">
        {STEPS.map((s,i) => (
          <motion.div key={s.num} initial={{ opacity:0, x:-20 }} animate={visible>i?{opacity:1,x:0}:{opacity:0,x:-20}} transition={{ duration:0.3 }}>
            <button onClick={() => { playSound("open"); setActive(active===s.num?null:s.num); }} className="w-full text-left">
              <div className="flex items-start gap-3">
                <motion.div className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-lg border-2 flex-shrink-0"
                  style={{ background: active===s.num?s.color+"25":"rgba(10,0,21,0.9)", borderColor: visible>i?s.color:"#2d1f45" }}
                  animate={active===s.num?{boxShadow:[`0 0 0px ${s.color}00`,`0 0 20px ${s.color}60`,`0 0 0px ${s.color}00`]}:{}} transition={{ duration:1.5, repeat:Infinity }}>
                  {s.icon}
                </motion.div>
                <div className="flex-1 py-2">
                  <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: s.color }}>Step {s.num}</span>
                  <p className="text-xs font-bold text-white">{s.title}</p>
                  <p className="text-[10px] text-gray-400">{s.desc}</p>
                  <AnimatePresence>
                    {active===s.num && (
                      <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} exit={{ opacity:0, height:0 }} className="overflow-hidden">
                        <div className="mt-2 p-3 rounded-xl text-[10px] text-gray-200 leading-relaxed" style={{ background: s.color+"12", borderLeft: `2px solid ${s.color}` }}>💡 {s.detail}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </button>
          </motion.div>
        ))}
      </div>
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.2 }} className="mt-4 p-3 rounded-2xl text-center" style={{ background: PURPLE_ACCENT+"15", border: `1px solid ${PURPLE_ACCENT}30` }}>
        <p className="text-[9px] font-bold" style={{ color: PURPLE_ACCENT }}>Tap setiap step untuk detail lengkap 👆</p>
      </motion.div>
    </div>
  );
};

const Intro = ({ onFinish }) => {
  const [phase, setPhase] = useState("splash");
  const [loadPct, setLoadPct] = useState(0);
  const [loadTxt, setLoadTxt] = useState("Initializing...");
  const [openPasal, setOpenPasal] = useState(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);

  const LOADS = [
    { text:"Connecting to EAS Satellite...", pct:20 },
    { text:"Loading Constitution Database...", pct:45 },
    { text:"Verifying Security Protocol...", pct:70 },
    { text:"Decrypting Member Records...", pct:88 },
    { text:"System Ready.", pct:100 },
  ];

  useEffect(() => {
    if (phase !== "loading") return;
    let i=0;
    const run = () => { if(i>=LOADS.length){ setTimeout(()=>setPhase("reveal"),400); return; } setLoadTxt(LOADS[i].text); setLoadPct(LOADS[i].pct); i++; setTimeout(run,600); };
    const t = setTimeout(run,300); return () => clearTimeout(t);
  }, [phase]);

  const handleFinish = () => { playSound("success"); setRoadmapLoading(true); setTimeout(() => { setRoadmapLoading(false); setPhase("roadmap"); }, 1500); };
  const handleDone = () => { playSound("success"); setTimeout(onFinish, 300); };

  const Logo = () => (
    <img src="/assets/logo_eas.png" className="w-full h-full object-contain"
      onError={e => { e.target.parentElement.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:2rem">🌌</div>'; }} />
  );

  return (
    <div className="min-h-screen text-white flex items-center justify-center p-4 overflow-hidden" style={{ background: PURPLE_BG }}>
      {/* Animated bg particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_,i) => (
          <motion.div key={i} className="absolute w-1 h-1 rounded-full" style={{ background: i%2===0?PURPLE_ACCENT:PINK_ACCENT, left: `${Math.random()*100}%`, top: `${Math.random()*100}%`, opacity: 0.3 }}
            animate={{ y: [0, -30, 0], opacity: [0.1, 0.5, 0.1] }} transition={{ duration: 3+Math.random()*4, repeat:Infinity, delay: Math.random()*3 }} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* SPLASH */}
        {phase === "splash" && (
          <motion.div key="splash" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0, scale:0.9 }} className="flex flex-col items-center w-full max-w-sm" onClick={() => { playSound("click"); setPhase("loading"); }}>
            <motion.div className="relative w-full aspect-square max-w-xs rounded-3xl overflow-hidden cursor-pointer border"
              style={{ borderColor: PURPLE_ACCENT+"40" }}
              animate={{ boxShadow: [`0 0 40px ${PURPLE_ACCENT}20`,`0 0 80px ${PURPLE_ACCENT}50`,`0 0 40px ${PURPLE_ACCENT}20`] }} transition={{ duration:2.5, repeat:Infinity }}>
              <video src="/assets/intro.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover" onError={e=>{e.target.style.display="none";e.target.parentElement.querySelector(".fallback").style.display="flex";}} />
              <div className="fallback w-full h-full bg-gradient-to-br from-purple-950 to-black items-center justify-center hidden absolute inset-0">
                <div className="w-32 h-32"><Logo /></div>
              </div>
              <motion.div className="absolute inset-x-0 h-0.5 pointer-events-none" style={{ background: `linear-gradient(90deg, transparent, ${PURPLE_ACCENT}, ${PINK_ACCENT}, transparent)` }}
                animate={{ top:["0%","100%","0%"] }} transition={{ duration:3, repeat:Infinity, ease:"linear" }} />
              <motion.div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(135deg, ${PURPLE_ACCENT}08, ${PINK_ACCENT}08)` }}
                animate={{ opacity:[0,0.4,0] }} transition={{ duration:2, repeat:Infinity }} />
              {["top-3 left-3 border-t-2 border-l-2","top-3 right-3 border-t-2 border-r-2","bottom-3 left-3 border-b-2 border-l-2","bottom-3 right-3 border-b-2 border-r-2"].map((cls,i) => (
                <div key={i} className={`absolute w-6 h-6 ${cls}`} style={{ borderColor: PURPLE_ACCENT+"80" }} />
              ))}
            </motion.div>
            <motion.div className="text-center mt-8" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}>
              <h1 className="text-4xl font-black tracking-[0.3em]" style={{ background: `linear-gradient(135deg, ${PURPLE_ACCENT}, ${PINK_ACCENT})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>EAS</h1>
              <p className="text-[11px] text-gray-500 tracking-[0.4em] mt-1 uppercase">Education Astronomi Sains</p>
              <motion.p className="text-[9px] mt-6 tracking-widest" style={{ color: PURPLE_ACCENT+"80" }} animate={{ opacity:[0.4,1,0.4] }} transition={{ duration:1.5, repeat:Infinity }}>TAP TO ENTER</motion.p>
            </motion.div>
          </motion.div>
        )}

        {/* LOADING */}
        {phase === "loading" && (
          <motion.div key="loading" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border flex items-center justify-center" style={{ borderColor: PURPLE_ACCENT+"40", background: PURPLE_ACCENT+"10" }}>
              <Logo />
            </div>
            <div className="text-center space-y-4">
              <p className="text-[10px] font-mono tracking-widest animate-pulse" style={{ color: PURPLE_ACCENT }}>{loadTxt}</p>
              <div className="w-48 h-1 rounded-full overflow-hidden bg-gray-800">
                <motion.div className="h-full rounded-full" style={{ background: `linear-gradient(90deg,${PURPLE_ACCENT},${PINK_ACCENT})` }} initial={{ width:0 }} animate={{ width:`${loadPct}%` }} transition={{ duration:0.3 }} />
              </div>
              <p className="text-[9px] text-gray-700 font-mono">{loadPct}%</p>
            </div>
            <div className="flex gap-2">{[0,1,2].map(i=><motion.div key={i} className="w-2 h-2 rounded-full" style={{ background: i===1?PINK_ACCENT:PURPLE_ACCENT }} animate={{ opacity:[0.3,1,0.3] }} transition={{ duration:1, repeat:Infinity, delay:i*0.25 }} />)}</div>
          </motion.div>
        )}

        {/* REVEAL */}
        {phase === "reveal" && (
          <motion.div key="reveal" initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, y:-30 }} transition={{ type:"spring", damping:20 }} className="text-center">
            <motion.div className="w-36 h-36 mx-auto mb-6 rounded-full border-2 flex items-center justify-center p-3"
              style={{ borderColor: PURPLE_ACCENT+"60", background: PURPLE_ACCENT+"10" }}
              animate={{ boxShadow:[`0 0 40px ${PURPLE_ACCENT}30`,`0 0 80px ${PURPLE_ACCENT}60`,`0 0 40px ${PURPLE_ACCENT}30`] }} transition={{ duration:2, repeat:Infinity }}>
              <Logo />
            </motion.div>
            <motion.h1 className="text-3xl font-black tracking-[0.4em] mb-2" style={{ background: `linear-gradient(135deg,${PURPLE_ACCENT},${PINK_ACCENT})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}>EAS PORTAL</motion.h1>
            <motion.p className="text-[10px] text-gray-600 tracking-widest uppercase" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}>Education Astronomi Sains</motion.p>
            <motion.button initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.7 }} whileTap={{ scale:0.92 }} whileHover={{ scale:1.05 }}
              onClick={() => { playSound("success"); setPhase("constitution"); }}
              className="mt-10 px-8 py-3 rounded-full font-bold text-white" style={{ background: `linear-gradient(135deg,${PURPLE_ACCENT},${PINK_ACCENT})` }}>
              READ CONSTITUTION
            </motion.button>
          </motion.div>
        )}

        {/* CONSTITUTION */}
        {phase === "constitution" && (
          <motion.div key="constitution" initial={{ opacity:0, x:50 }} animate={{ opacity:1, x:0 }}
            className="w-full max-w-lg rounded-3xl p-6 h-[85vh] flex flex-col border" style={{ background: "#0a001aee", borderColor: PURPLE_ACCENT+"30" }}>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b" style={{ borderColor: PURPLE_ACCENT+"20" }}>
              <img src="/assets/logo_eas.png" className="w-8 h-8 object-contain" onError={e=>e.target.style.display="none"} />
              <div>
                <div className="flex items-center gap-2"><Scale size={14} style={{ color: PURPLE_ACCENT }} /><h2 className="font-black tracking-widest uppercase text-sm text-white">Undang-Undang EAS</h2></div>
                <p className="text-[9px] text-gray-600 uppercase">Education Astronomi Sains</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {UUD_DATA.map(item => (
                <div key={item.id} className="rounded-xl overflow-hidden border" style={{ borderColor: PURPLE_ACCENT+"15" }}>
                  <button onClick={() => { playSound("open"); setOpenPasal(openPasal===item.id?null:item.id); }}
                    className="w-full p-4 flex justify-between items-center text-left" style={{ background: PURPLE_ACCENT+"08" }}>
                    <span className="text-xs font-bold uppercase" style={{ color: PURPLE_ACCENT }}>{item.title}</span>
                    {openPasal===item.id?<ChevronUp size={14} style={{ color: PURPLE_ACCENT }}/>:<ChevronDown size={14} className="text-gray-600"/>}
                  </button>
                  {openPasal===item.id && <div className="p-4 text-[11px] leading-relaxed text-gray-400 whitespace-pre-line" style={{ background: "#05000f" }}>{item.content}</div>}
                </div>
              ))}
              {/* Sanksi */}
              <div className="mt-6"><div className="flex items-center gap-2 mb-3 font-bold uppercase italic text-red-400"><ShieldAlert size={16}/> Protocol Sanksi</div>
                {[{type:"Member",items:["Toxic: SP 3","Spam: SP 2-4","Rusuh: SP 3-5"]},{type:"Admin",items:["Haus Kekuasaan: SP 3-5","Kick Tanpa Alasan: SP 5"]},{type:"Petinggi",items:["Tindakan Tanpa Alasan: SP 5","Tidak Profesional: SP 4"]}].map((s,i) => (
                  <div key={i} className="mb-3 p-3 rounded-xl border border-red-900/30 bg-red-950/10">
                    <p className="text-[10px] font-black text-red-400 mb-1 uppercase">Sanksi {s.type}</p>
                    {s.items.map((t,j) => <p key={j} className="text-[10px] text-gray-500">• {t}</p>)}
                  </div>
                ))}
              </div>
            </div>
            <motion.button whileTap={{ scale:0.96 }} onClick={handleFinish} disabled={roadmapLoading}
              className="mt-5 w-full py-4 rounded-2xl font-black tracking-widest flex items-center justify-center gap-2 text-white"
              style={{ background: roadmapLoading?"#374151":`linear-gradient(135deg,${PURPLE_ACCENT},${PINK_ACCENT})` }}>
              {roadmapLoading ? (<><motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate:360 }} transition={{ duration:0.8, repeat:Infinity, ease:"linear" }}/> Memuat...</>) : (<><CheckCircle2 size={18}/> SAYA PATUH & SETUJU</>)}
            </motion.button>
          </motion.div>
        )}

        {/* ROADMAP */}
        {phase === "roadmap" && (
          <motion.div key="roadmap" initial={{ opacity:0, x:50 }} animate={{ opacity:1, x:0 }}
            className="w-full max-w-lg rounded-3xl p-6 h-[85vh] flex flex-col border" style={{ background: "#0a001aee", borderColor: PURPLE_ACCENT+"30" }}>
            <div className="flex items-center gap-3 mb-5 pb-4 border-b" style={{ borderColor: PURPLE_ACCENT+"20" }}>
              <img src="/assets/logo_eas.png" className="w-10 h-10 object-contain" onError={e=>e.target.style.display="none"} />
              <div>
                <h2 className="font-black tracking-widest uppercase text-sm" style={{ color: PURPLE_ACCENT }}>Cara Bergabung EAS</h2>
                <p className="text-[9px] text-gray-600 uppercase">Roadmap Pendaftaran Member</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto pr-1"><RoadmapSteps /></div>
            <motion.button whileTap={{ scale:0.96 }} whileHover={{ scale:1.02 }} onClick={handleDone}
              className="mt-5 w-full py-4 rounded-2xl font-black tracking-widest flex items-center justify-center gap-2 text-white"
              style={{ background: `linear-gradient(135deg,${PURPLE_ACCENT},${PINK_ACCENT})` }}>
              🚀 MASUK KE PORTAL EAS
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Intro;
