import React, { useState, useEffect, useRef } from "react";
import { db, auth } from "../api/config";
import { doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import QRCode from "qrcode";
import { motion, AnimatePresence } from "framer-motion";
import { playSound } from "../component/Intro";
import {
  User, Mail, Lock, Calendar, MapPin, Music2,
  ChevronRight, ChevronLeft, Check, Eye, EyeOff, Scan
} from "lucide-react";

// ── Constants ─────────────────────────────
const DOMISILI = [
  "Aceh","Sumatera Utara","Sumatera Barat","Riau","Jambi","Sumatera Selatan",
  "Bengkulu","Lampung","Kepulauan Bangka Belitung","Kepulauan Riau",
  "DKI Jakarta","Jawa Barat","Jawa Tengah","DI Yogyakarta","Jawa Timur","Banten",
  "Bali","Nusa Tenggara Barat","Nusa Tenggara Timur",
  "Kalimantan Barat","Kalimantan Tengah","Kalimantan Selatan","Kalimantan Timur","Kalimantan Utara",
  "Sulawesi Utara","Sulawesi Tengah","Sulawesi Selatan","Sulawesi Tenggara","Gorontalo","Sulawesi Barat",
  "Maluku","Maluku Utara","Papua","Papua Barat","Papua Selatan","Papua Tengah","Papua Pegunungan"
];

const STEPS = [
  { id:"identity", label:"Identitas",   icon:User     },
  { id:"account",  label:"Akun",        icon:Lock     },
  { id:"profile",  label:"Profil",      icon:MapPin   },
  { id:"confirm",  label:"Konfirmasi",  icon:Check    },
];

// ── Particle canvas bg ────────────────────
const ParticleBG = () => {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);

    const pts = Array.from({ length: 60 }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.4,
      col: Math.random() > 0.5 ? "#a855f7" : "#38bdf8",
      op: Math.random() * 0.5 + 0.1,
    }));

    let id;
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > c.width)  p.vx *= -1;
        if (p.y < 0 || p.y > c.height) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.col + Math.round(p.op * 255).toString(16).padStart(2,"0");
        ctx.fill();
      });
      // Draw connections
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(168,85,247,${(1 - dist/100) * 0.12})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      id = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="fixed inset-0 pointer-events-none z-0"/>;
};

// ── Futuristic Input ──────────────────────
const FInput = ({ icon:Icon, label, type="text", value, onChange, placeholder, children }) => {
  const [focus, setFocus] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const isPass = type === "password";

  return (
    <div className="relative group">
      <label className="block text-[9px] font-black uppercase tracking-widest mb-1.5 transition-all"
        style={{ color: focus ? "#a855f7" : "#4b5563" }}>
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 transition-all"
            style={{ color: focus ? "#a855f7" : "#374151" }}>
            <Icon size={15}/>
          </div>
        )}
        {children ? children : (
          <input
            type={isPass && showPw ? "text" : type}
            value={value}
            placeholder={placeholder}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            onChange={e => { onChange(e.target.value); }}
            className="w-full py-3.5 text-xs text-white outline-none transition-all placeholder-gray-700"
            style={{
              paddingLeft: Icon ? "2.5rem" : "1rem",
              paddingRight: isPass ? "2.75rem" : "1rem",
              background: focus ? "rgba(168,85,247,0.08)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${focus ? "rgba(168,85,247,0.6)" : "rgba(255,255,255,0.07)"}`,
              borderRadius: "0.875rem",
              boxShadow: focus ? "0 0 0 3px rgba(168,85,247,0.12), 0 0 20px rgba(168,85,247,0.08)" : "none",
            }}
          />
        )}
        {isPass && (
          <button type="button" onClick={() => setShowPw(s=>!s)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-purple-400 transition-colors">
            {showPw ? <EyeOff size={14}/> : <Eye size={14}/>}
          </button>
        )}
        {/* Animated border bottom */}
        <motion.div className="absolute bottom-0 left-0 h-px rounded-full"
          animate={{ width: focus ? "100%" : "0%", background: "linear-gradient(90deg,#a855f7,#38bdf8)" }}
          transition={{ duration: 0.3 }}/>
      </div>
    </div>
  );
};

// ── Step indicator ────────────────────────
const StepBar = ({ current }) => (
  <div className="flex items-center justify-between mb-8 px-1">
    {STEPS.map((s, i) => {
      const done = i < current;
      const active = i === current;
      const Icon = s.icon;
      return (
        <React.Fragment key={s.id}>
          <div className="flex flex-col items-center gap-1">
            <motion.div
              animate={active
                ? { scale:[1,1.08,1], boxShadow:["0 0 0px #a855f700","0 0 16px #a855f760","0 0 0px #a855f700"] }
                : {}}
              transition={{ duration:1.8, repeat:Infinity }}
              className="w-8 h-8 rounded-full flex items-center justify-center border transition-all"
              style={{
                background: done ? "#a855f7" : active ? "rgba(168,85,247,0.2)" : "rgba(255,255,255,0.04)",
                borderColor: done || active ? "#a855f7" : "rgba(255,255,255,0.08)",
              }}>
              {done
                ? <Check size={14} className="text-white"/>
                : <Icon size={13} style={{ color: active ? "#a855f7" : "#374151" }}/>
              }
            </motion.div>
            <span className="text-[7px] font-black uppercase tracking-wider"
              style={{ color: active ? "#a855f7" : done ? "#7c3aed" : "#374151" }}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className="flex-1 h-px mx-1 relative overflow-hidden rounded-full" style={{ background:"rgba(255,255,255,0.06)" }}>
              <motion.div className="absolute inset-y-0 left-0 rounded-full"
                animate={{ width: i < current ? "100%" : "0%" }}
                transition={{ duration:0.4, ease:"easeInOut" }}
                style={{ background:"linear-gradient(90deg,#a855f7,#38bdf8)" }}/>
            </div>
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ── Gen Selector ──────────────────────────
const GenSelector = ({ gen, onChange }) => (
  <div className="grid grid-cols-2 gap-3">
    {[1, 2].map(g => (
      <motion.button key={g} type="button" whileTap={{ scale:0.94 }}
        onClick={() => { playSound("click"); onChange(g); }}
        className="relative p-4 rounded-2xl text-center transition-all overflow-hidden"
        style={{
          background: gen === g ? "rgba(168,85,247,0.15)" : "rgba(255,255,255,0.03)",
          border: `1px solid ${gen === g ? "rgba(168,85,247,0.6)" : "rgba(255,255,255,0.07)"}`,
          boxShadow: gen === g ? "0 0 20px rgba(168,85,247,0.2)" : "none",
        }}>
        {gen === g && (
          <motion.div className="absolute inset-0 pointer-events-none"
            animate={{ opacity:[0,0.15,0] }} transition={{ duration:2, repeat:Infinity }}
            style={{ background:"radial-gradient(circle at 50% 50%,#a855f7,transparent)" }}/>
        )}
        <div className="text-2xl mb-1">{g === 1 ? "🌟" : "🚀"}</div>
        <p className="text-sm font-black text-white">GEN {g}</p>
        <p className="text-[8px] text-gray-500 mt-0.5">{g === 1 ? "Generasi Pertama" : "Generasi Kedua"}</p>
        {gen === g && (
          <motion.div className="absolute top-2 right-2" initial={{ scale:0 }} animate={{ scale:1 }}>
            <div className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center">
              <Check size={9} className="text-white"/>
            </div>
          </motion.div>
        )}
      </motion.button>
    ))}
  </div>
);

// ── Main RegisterPortal ───────────────────
const RegisterPortal = () => {
  const [step, setStep]       = useState(0);
  const [gen, setGen]         = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [form, setForm]       = useState({
    nama:"", email:"", password:"", dob:"", domisili:"", tiktok:""
  });
  const navigate = useNavigate();

  const set = (key) => (val) => { setForm(f => ({...f,[key]:val})); setError(""); };

  const getAge = (dob) => {
    if (!dob) return 0;
    const b = new Date(dob), t = new Date();
    let a = t.getFullYear() - b.getFullYear();
    if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) a--;
    return a;
  };

  // Per-step validation
  const validateStep = () => {
    if (step === 0) {
      if (form.nama.trim().length < 3) return "Nama minimal 3 huruf";
      if (!form.dob) return "Tanggal lahir wajib diisi";
      if (getAge(form.dob) < 10) return "Minimal usia 10 tahun";
    }
    if (step === 1) {
      if (!/\S+@\S+\.\S+/.test(form.email)) return "Format email tidak valid";
      if (form.password.length < 6) return "Password minimal 6 karakter";
    }
    if (step === 2) {
      if (!form.domisili) return "Pilih domisili / provinsi";
      if (!form.tiktok.toLowerCase().includes("tiktok")) return "Link TikTok tidak valid";
    }
    return null;
  };

  const nextStep = () => {
    const err = validateStep();
    if (err) { setError(err); playSound("click"); return; }
    playSound("success");
    setStep(s => s + 1);
    setError("");
  };

  const handleRegister = async () => {
    if (loading) return;
    setLoading(true); setError("");
    try {
      const email = form.email.toLowerCase().trim();
      const cred  = await createUserWithEmailAndPassword(auth, email, form.password);
      const uid   = cred.user.uid;
      const memberId  = `EAS-${gen}-${Date.now().toString().slice(-6)}`;
      const qrImage   = await QRCode.toDataURL(`EAS|${memberId}`);
      const umur      = getAge(form.dob);
      const userDoc   = {
        public:  { nama:form.nama, umur, dob:form.dob, domisili:form.domisili, tiktok:form.tiktok, memberId, gen, role:"member" },
        private: { email },
        system:  { createdAt:new Date().toISOString(), verified:false, banned:false },
        meta:    { qrValue:`EAS|${memberId}`, qrImage },
      };
      await setDoc(doc(db,"users",uid), userDoc);
      localStorage.setItem("eas_user_data", JSON.stringify({ id:uid, ...userDoc.public }));
      localStorage.setItem("eas_verified", "false");
      playSound("success");
      setTimeout(() => navigate("/access-portal",{replace:true}), 300);
    } catch (err) {
      playSound("click");
      if (err.code === "auth/email-already-in-use") setError("Email sudah terdaftar. Silakan login.");
      else setError(err.message || "Terjadi kesalahan. Coba lagi.");
    } finally { setLoading(false); }
  };

  const age = getAge(form.dob);

  // ── Slide variants ─────────────────────
  const slide = {
    initial: (dir) => ({ opacity:0, x: dir > 0 ? 60 : -60 }),
    animate: { opacity:1, x:0 },
    exit:    (dir) => ({ opacity:0, x: dir > 0 ? -60 : 60 }),
  };
  const [dir, setDir] = useState(1);
  const goNext = () => { setDir(1); nextStep(); };
  const goBack = () => { setDir(-1); setStep(s=>s-1); setError(""); };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background:"linear-gradient(135deg,#06010f 0%,#0a0218 50%,#060115 100%)" }}>

      <ParticleBG/>

      {/* Ambient glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background:"radial-gradient(circle,#7c3aed18,transparent 70%)", filter:"blur(80px)" }}/>
      <div className="fixed bottom-0 right-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{ background:"radial-gradient(circle,#2563eb15,transparent 70%)", filter:"blur(70px)" }}/>

      {/* Card */}
      <motion.div initial={{ opacity:0, y:40, scale:0.92 }} animate={{ opacity:1, y:0, scale:1 }}
        transition={{ duration:0.5, ease:"easeOut" }}
        className="relative w-full max-w-sm z-10">

        {/* Card glow border */}
        <div className="absolute -inset-px rounded-3xl pointer-events-none"
          style={{ background:"linear-gradient(135deg,rgba(168,85,247,0.4),rgba(56,189,248,0.1),rgba(168,85,247,0.2))", borderRadius:"1.5rem" }}/>

        <div className="relative rounded-3xl p-6 overflow-hidden"
          style={{
            background:"rgba(8,3,20,0.92)",
            backdropFilter:"blur(30px) saturate(1.8)",
            border:"1px solid rgba(168,85,247,0.25)",
          }}>

          {/* Scan line effect */}
          <motion.div className="absolute left-0 right-0 h-px pointer-events-none z-0"
            style={{ background:"linear-gradient(90deg,transparent,rgba(168,85,247,0.4),rgba(56,189,248,0.4),transparent)" }}
            animate={{ top:["0%","100%","0%"] }} transition={{ duration:6, repeat:Infinity, ease:"linear" }}/>

          {/* Header */}
          <div className="text-center mb-6 relative z-10">
            <motion.div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-3"
              style={{ background:"rgba(168,85,247,0.15)", border:"1px solid rgba(168,85,247,0.3)" }}
              animate={{ boxShadow:["0 0 10px #a855f720","0 0 24px #a855f750","0 0 10px #a855f720"] }}
              transition={{ duration:2, repeat:Infinity }}>
              <Scan size={22} style={{ color:"#a855f7" }}/>
            </motion.div>
            <h1 className="text-sm font-black tracking-[0.25em] uppercase"
              style={{ background:"linear-gradient(135deg,#a855f7,#38bdf8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              EAS Register
            </h1>
            <p className="text-[9px] text-gray-600 tracking-widest mt-0.5 uppercase">Secure Identity System</p>
          </div>

          {/* Step bar */}
          <div className="relative z-10">
            <StepBar current={step}/>
          </div>

          {/* Step content */}
          <div className="relative z-10 overflow-hidden">
            <AnimatePresence mode="wait" custom={dir}>
              {/* ── STEP 0: Identitas ── */}
              {step === 0 && (
                <motion.div key="s0" custom={dir} variants={slide}
                  initial="initial" animate="animate" exit="exit"
                  transition={{ duration:0.28, ease:"easeInOut" }}
                  className="space-y-4">
                  <FInput icon={User} label="Nama Lengkap" value={form.nama}
                    onChange={set("nama")} placeholder="Nama kamu"/>

                  <FInput icon={Calendar} label="Tanggal Lahir" value={form.dob} onChange={set("dob")}>
                    <input type="date" value={form.dob}
                      onChange={e => { set("dob")(e.target.value); playSound("click"); }}
                      className="w-full pl-10 pr-4 py-3.5 text-xs text-white outline-none transition-all"
                      style={{
                        background:"rgba(255,255,255,0.03)",
                        border:"1px solid rgba(255,255,255,0.07)",
                        borderRadius:"0.875rem",
                      }}/>
                    <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color:"#374151" }}/>
                  </FInput>

                  {form.dob && (
                    <motion.div initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }}
                      className="text-center py-2 rounded-xl text-[10px]"
                      style={{ background:"rgba(168,85,247,0.08)", border:"1px solid rgba(168,85,247,0.2)" }}>
                      <span className="text-gray-500">Usia: </span>
                      <span className="font-black" style={{ color: age >= 10 ? "#a855f7" : "#ef4444" }}>
                        {age} tahun
                      </span>
                      {age < 10 && <span className="text-red-400 ml-1">— Minimal 10 tahun</span>}
                    </motion.div>
                  )}

                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest mb-1.5 text-gray-600">Generasi</label>
                    <GenSelector gen={gen} onChange={setGen}/>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 1: Akun ── */}
              {step === 1 && (
                <motion.div key="s1" custom={dir} variants={slide}
                  initial="initial" animate="animate" exit="exit"
                  transition={{ duration:0.28, ease:"easeInOut" }}
                  className="space-y-4">
                  <FInput icon={Mail} label="Email" type="email" value={form.email}
                    onChange={set("email")} placeholder="email@kamu.com"/>
                  <FInput icon={Lock} label="Password" type="password" value={form.password}
                    onChange={set("password")} placeholder="Minimal 6 karakter"/>

                  {/* Password strength */}
                  {form.password.length > 0 && (
                    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="space-y-1.5">
                      <div className="flex gap-1">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="flex-1 h-1 rounded-full transition-all"
                            style={{ background: form.password.length >= i*2 ? i <= 2 ? "#ef4444" : i === 3 ? "#f59e0b" : "#10b981" : "rgba(255,255,255,0.06)" }}/>
                        ))}
                      </div>
                      <p className="text-[9px] text-gray-600">
                        Kekuatan: {form.password.length < 4 ? "Lemah" : form.password.length < 6 ? "Sedang" : form.password.length < 8 ? "Kuat" : "Sangat Kuat"}
                      </p>
                    </motion.div>
                  )}

                  <div className="p-3 rounded-2xl text-[9px] text-gray-500 leading-relaxed"
                    style={{ background:"rgba(56,189,248,0.06)", border:"1px solid rgba(56,189,248,0.15)" }}>
                    💡 Email digunakan untuk login. Gunakan email aktif yang bisa kamu akses.
                  </div>
                </motion.div>
              )}

              {/* ── STEP 2: Profil ── */}
              {step === 2 && (
                <motion.div key="s2" custom={dir} variants={slide}
                  initial="initial" animate="animate" exit="exit"
                  transition={{ duration:0.28, ease:"easeInOut" }}
                  className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest mb-1.5 text-gray-600">
                      Domisili / Provinsi
                    </label>
                    <div className="relative">
                      <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 text-gray-700"/>
                      <select value={form.domisili}
                        onChange={e => { set("domisili")(e.target.value); playSound("click"); }}
                        className="w-full pl-9 pr-4 py-3.5 text-xs text-white outline-none appearance-none"
                        style={{
                          background:"rgba(255,255,255,0.03)",
                          border:"1px solid rgba(255,255,255,0.07)",
                          borderRadius:"0.875rem",
                        }}>
                        <option value="" style={{ background:"#0a0015" }}>Pilih Provinsi</option>
                        {DOMISILI.map(d => (
                          <option key={d} value={d} style={{ background:"#0a0015" }}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <FInput icon={Music2} label="Link TikTok" value={form.tiktok}
                    onChange={set("tiktok")} placeholder="tiktok.com/@username"/>

                  <div className="p-3 rounded-2xl text-[9px] text-gray-500 leading-relaxed"
                    style={{ background:"rgba(168,85,247,0.06)", border:"1px solid rgba(168,85,247,0.15)" }}>
                    🎵 Link TikTok wajib mengandung kata <span className="text-purple-400 font-bold">tiktok</span>. Contoh: tiktok.com/@namaprofilmu
                  </div>
                </motion.div>
              )}

              {/* ── STEP 3: Konfirmasi ── */}
              {step === 3 && (
                <motion.div key="s3" custom={dir} variants={slide}
                  initial="initial" animate="animate" exit="exit"
                  transition={{ duration:0.28, ease:"easeInOut" }}
                  className="space-y-3">
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-3">Periksa data kamu</p>

                  {[
                    { label:"Nama",      value:form.nama },
                    { label:"Email",     value:form.email },
                    { label:"Usia",      value:`${age} tahun` },
                    { label:"Domisili",  value:form.domisili },
                    { label:"TikTok",    value:form.tiktok },
                    { label:"Generasi",  value:`GEN ${gen}` },
                  ].map(({ label, value }, i) => (
                    <motion.div key={label}
                      initial={{ opacity:0, x:-15 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.05 }}
                      className="flex justify-between items-center px-4 py-2.5 rounded-xl"
                      style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.06)" }}>
                      <span className="text-[9px] text-gray-500 uppercase font-black">{label}</span>
                      <span className="text-[10px] text-white font-bold max-w-[55%] text-right truncate">{value || "—"}</span>
                    </motion.div>
                  ))}

                  <div className="pt-1 text-center">
                    <p className="text-[9px] text-gray-600">Dengan mendaftar, kamu menyetujui</p>
                    <p className="text-[9px] text-purple-400 font-bold">Undang-Undang & Peraturan EAS</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity:0, y:-8, height:0 }} animate={{ opacity:1, y:0, height:"auto" }} exit={{ opacity:0, y:-8, height:0 }}
                className="mt-3 px-4 py-2.5 rounded-xl text-[10px] font-bold text-red-400 relative z-10"
                style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)" }}>
                ⚠ {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex gap-2 mt-5 relative z-10">
            {step > 0 && (
              <motion.button type="button" whileTap={{ scale:0.94 }} onClick={goBack}
                className="flex items-center gap-1.5 px-4 py-3 rounded-2xl text-xs font-black transition"
                style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", color:"#6b7280" }}>
                <ChevronLeft size={15}/> Back
              </motion.button>
            )}

            {step < 3 ? (
              <motion.button type="button" whileTap={{ scale:0.94 }} onClick={goNext}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl text-xs font-black text-white"
                style={{ background:"linear-gradient(135deg,#7c3aed,#2563eb)", boxShadow:"0 4px 20px rgba(124,58,237,0.35)" }}>
                Lanjut <ChevronRight size={15}/>
              </motion.button>
            ) : (
              <motion.button type="button" whileTap={{ scale:0.94 }}
                onClick={handleRegister} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black text-white overflow-hidden relative"
                style={{ background: loading ? "#374151" : "linear-gradient(135deg,#7c3aed,#ec4899)", boxShadow: loading ? "none" : "0 4px 24px rgba(168,85,247,0.4)" }}>
                {loading ? (
                  <>
                    <motion.div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white"
                      animate={{ rotate:360 }} transition={{ duration:0.7, repeat:Infinity, ease:"linear" }}/>
                    Mendaftar...
                  </>
                ) : (
                  <><Scan size={15}/> Daftarkan Akun</>
                )}
                {!loading && (
                  <motion.div className="absolute inset-0 pointer-events-none"
                    animate={{ opacity:[0,0.2,0] }} transition={{ duration:2, repeat:Infinity }}
                    style={{ background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)" }}/>
                )}
              </motion.button>
            )}
          </div>

          {/* Login link */}
          <button type="button"
            onClick={() => { playSound("nav"); navigate("/login"); }}
            className="w-full mt-4 text-[10px] text-gray-600 hover:text-purple-400 transition-colors relative z-10">
            Sudah punya akun? <span className="text-purple-400 font-bold underline">Login →</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPortal;
