import React, { useState, useEffect, useRef } from "react";
import { db, auth } from "../api/config";
import { doc, getDoc } from "firebase/firestore";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { playSound } from "../component/Intro";
import { Mail, Lock, Eye, EyeOff, Scan, ShieldCheck, KeyRound, ArrowRight } from "lucide-react";

// ── Animated orbital bg ───────────────────
const OrbitalBG = () => {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);

    // Particles
    const pts = Array.from({ length: 55 }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      vx: (Math.random() - 0.5) * 0.28, vy: (Math.random() - 0.5) * 0.28,
      r: Math.random() * 1.4 + 0.3,
      hue: Math.random() > 0.5 ? 270 : 200, // purple or sky
      op: Math.random() * 0.5 + 0.15,
    }));

    let id, frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      frame++;

      // Slow pulse on connections
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > c.width) p.vx *= -1;
        if (p.y < 0 || p.y > c.height) p.vy *= -1;

        const alpha = p.op + Math.sin(frame * 0.02 + p.x) * 0.1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},80%,70%,${Math.max(0.05, alpha)})`;
        ctx.fill();
      });

      // Connections
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 110) {
            const alpha = (1 - d / 110) * 0.10;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(168,85,247,${alpha})`;
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
  return <canvas ref={ref} className="fixed inset-0 pointer-events-none z-0" />;
};

// ── Elegant animated input ────────────────
const ElegantInput = ({ icon: Icon, label, type = "text", value, onChange, placeholder, autoComplete }) => {
  const [focused, setFocused] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const isPass = type === "password";
  const filled = value.length > 0;

  return (
    <div className="relative">
      {/* Floating label */}
      <motion.label
        animate={{
          top: focused || filled ? "6px" : "50%",
          y: focused || filled ? "0%" : "-50%",
          fontSize: focused || filled ? "9px" : "11px",
          color: focused ? "#a855f7" : filled ? "#6b7280" : "#4b5563",
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="absolute left-11 font-black uppercase tracking-widest pointer-events-none z-10">
        {label}
      </motion.label>

      {/* Icon */}
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 transition-colors duration-200"
        style={{ color: focused ? "#a855f7" : "#374151" }}>
        <Icon size={16} />
      </div>

      <input
        type={isPass && showPw ? "text" : type}
        value={value}
        autoComplete={autoComplete}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={e => onChange(e.target.value)}
        className="w-full outline-none text-xs text-white transition-all duration-300"
        style={{
          paddingTop: "1.5rem",
          paddingBottom: "0.6rem",
          paddingLeft: "2.8rem",
          paddingRight: isPass ? "2.8rem" : "1rem",
          background: focused
            ? "rgba(168,85,247,0.09)"
            : "rgba(255,255,255,0.04)",
          border: `1px solid ${focused
            ? "rgba(168,85,247,0.65)"
            : filled
              ? "rgba(168,85,247,0.25)"
              : "rgba(255,255,255,0.07)"}`,
          borderRadius: "1rem",
          boxShadow: focused
            ? "0 0 0 3px rgba(168,85,247,0.10), 0 0 24px rgba(168,85,247,0.08)"
            : "none",
        }}
      />

      {/* Animated bottom bar */}
      <motion.div
        className="absolute bottom-0 left-3 right-3 h-px rounded-full pointer-events-none"
        animate={{
          scaleX: focused ? 1 : 0,
          background: "linear-gradient(90deg,#a855f7,#38bdf8)",
        }}
        style={{ transformOrigin: "left" }}
        transition={{ duration: 0.3 }}
      />

      {/* Show/hide password */}
      {isPass && (
        <button type="button" onClick={() => setShowPw(s => !s)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200"
          style={{ color: focused ? "#a855f7" : "#374151" }}>
          {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      )}
    </div>
  );
};

// ── Biometric / scanning ring ─────────────
const ScanRing = ({ scanning }) => (
  <div className="relative w-20 h-20 mx-auto mb-2">
    {/* Outer ring pulse */}
    <motion.div className="absolute inset-0 rounded-full border"
      style={{ borderColor: "rgba(168,85,247,0.2)" }}
      animate={scanning
        ? { scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }
        : { scale: 1, opacity: 0.3 }}
      transition={{ duration: 1.6, repeat: Infinity }}
    />
    {/* Mid ring spin */}
    <motion.div className="absolute inset-1 rounded-full border-2 border-transparent"
      style={{ borderTopColor: "#a855f7", borderRightColor: "#38bdf830" }}
      animate={{ rotate: 360 }}
      transition={{ duration: scanning ? 1 : 3, repeat: Infinity, ease: "linear" }}
    />
    {/* Inner ring counter-spin */}
    <motion.div className="absolute inset-3 rounded-full border border-transparent"
      style={{ borderBottomColor: "#38bdf8", borderLeftColor: "#a855f740" }}
      animate={{ rotate: -360 }}
      transition={{ duration: scanning ? 0.7 : 4, repeat: Infinity, ease: "linear" }}
    />
    {/* Center icon */}
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div animate={scanning
        ? { scale: [1, 1.1, 1], filter: ["brightness(1)", "brightness(1.6)", "brightness(1)"] }
        : {}}
        transition={{ duration: 0.8, repeat: Infinity }}>
        <Scan size={26} style={{ color: scanning ? "#a855f7" : "#4b5563" }} />
      </motion.div>
    </div>
  </div>
);

// ── Forgot password modal ─────────────────
const ForgotModal = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleReset = async () => {
    if (!email) { setErr("Masukkan email kamu"); return; }
    setLoading(true); setErr("");
    try {
      await sendPasswordResetEmail(auth, email.toLowerCase().trim());
      playSound("success"); setSent(true);
    } catch {
      setErr("Email tidak terdaftar atau gagal terkirim");
    } finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.85, y: 30, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.85, y: 20, opacity: 0 }} transition={{ type: "spring", damping: 22, stiffness: 200 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-xs rounded-3xl p-6"
        style={{
          background: "rgba(8,3,20,0.96)",
          backdropFilter: "blur(30px)",
          border: "1px solid rgba(168,85,247,0.3)",
          boxShadow: "0 0 60px rgba(124,58,237,0.2)",
        }}>
        <AnimatePresence mode="wait">
          {!sent ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="text-center mb-5">
                <KeyRound size={28} className="mx-auto mb-2" style={{ color: "#a855f7" }} />
                <h3 className="text-sm font-black text-white">Reset Password</h3>
                <p className="text-[9px] text-gray-500 mt-1">Link reset akan dikirim ke email kamu</p>
              </div>
              <ElegantInput icon={Mail} label="Email" type="email" value={email}
                onChange={setEmail} placeholder="" autoComplete="email" />
              {err && <p className="text-[10px] text-red-400 mt-2">{err}</p>}
              <div className="flex gap-2 mt-5">
                <button onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-gray-500"
                  style={{ background: "rgba(255,255,255,0.05)" }}>
                  Batal
                </button>
                <button onClick={handleReset} disabled={loading}
                  className="flex-1 py-2.5 rounded-xl text-xs font-black text-white transition"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)" }}>
                  {loading ? "Mengirim..." : "Kirim Link"}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="sent" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="text-center py-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{ background: "rgba(16,185,129,0.15)", border: "1px solid #10b98140" }}>
                <ShieldCheck size={24} className="text-green-400" />
              </motion.div>
              <h3 className="text-sm font-black text-white mb-1">Link Terkirim!</h3>
              <p className="text-[10px] text-gray-400 mb-5">Cek inbox atau folder spam email kamu.</p>
              <button onClick={onClose}
                className="px-6 py-2.5 rounded-xl text-xs font-black text-white"
                style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)" }}>
                Tutup
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

// ── LOGIN STATE: success animation ────────
const SuccessScreen = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
    className="fixed inset-0 z-50 flex flex-col items-center justify-center"
    style={{ background: "linear-gradient(135deg,#06010f,#0a0218)" }}>
    {[0, 1, 2].map(i => (
      <motion.div key={i} className="absolute rounded-full border border-purple-500/20"
        initial={{ scale: 0, opacity: 0.8 }}
        animate={{ scale: [0, 3 + i], opacity: [0.6, 0] }}
        transition={{ duration: 1.2, delay: i * 0.18, ease: "easeOut" }}
        style={{ width: 80, height: 80 }} />
    ))}
    <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 220, delay: 0.1 }}
      className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
      style={{ background: "rgba(168,85,247,0.15)", border: "2px solid #a855f7" }}>
      <ShieldCheck size={34} style={{ color: "#a855f7" }} />
    </motion.div>
    <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
      className="text-sm font-black text-white tracking-widest uppercase">
      Access Granted
    </motion.p>
    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
      className="text-[9px] text-purple-400 mt-1 uppercase tracking-widest">
      Redirecting...
    </motion.p>
  </motion.div>
);

// ── MAIN LoginPortal ──────────────────────
const LoginPortal = () => {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const navigate = useNavigate();

  // Entrance animation state
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!email || !password) { setError("Email & password wajib diisi"); return; }
    setLoading(true); setError("");
    try {
      const res = await signInWithEmailAndPassword(auth, email.toLowerCase().trim(), password);
      const snap = await getDoc(doc(db, "users", res.user.uid));
      if (!snap.exists()) throw new Error("Data user tidak ditemukan");
      const data = snap.data();
      localStorage.setItem("eas_user_data", JSON.stringify({ id: res.user.uid, ...data.public }));
      localStorage.setItem("eas_verified", data.system?.verified ? "true" : "false");
      playSound("success");
      setSuccess(true);
      setTimeout(() => {
        if (data.system?.verified) navigate("/", { replace: true });
        else navigate("/access-portal", { replace: true });
      }, 1600);
    } catch (err) {
      playSound("click"); setLoading(false);
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential")
        setError("Password salah. Coba lagi.");
      else if (err.code === "auth/user-not-found")
        setError("Email tidak terdaftar.");
      else if (err.code === "auth/too-many-requests")
        setError("Terlalu banyak percobaan. Tunggu sebentar.");
      else setError(err.message || "Login gagal. Coba lagi.");
    }
  };

  return (
    <>
      {success && <SuccessScreen />}

      <AnimatePresence>
        {showForgot && <ForgotModal onClose={() => setShowForgot(false)} />}
      </AnimatePresence>

      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg,#06010f 0%,#0a0218 55%,#060115 100%)" }}>

        <OrbitalBG />

        {/* Ambient glows */}
        <div className="fixed pointer-events-none"
          style={{ top: "10%", left: "20%", width: 340, height: 340, borderRadius: "50%", background: "radial-gradient(circle,#7c3aed14,transparent 70%)", filter: "blur(70px)" }} />
        <div className="fixed pointer-events-none"
          style={{ bottom: "10%", right: "15%", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle,#2563eb10,transparent 70%)", filter: "blur(60px)" }} />

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.88 }}
          animate={mounted ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-sm z-10">

          {/* Outer glow border */}
          <div className="absolute -inset-px rounded-3xl pointer-events-none"
            style={{ background: "linear-gradient(140deg,rgba(168,85,247,0.5),rgba(56,189,248,0.08),rgba(168,85,247,0.15),rgba(56,189,248,0.3))", borderRadius: "1.5rem" }} />

          <div className="relative rounded-3xl overflow-hidden"
            style={{
              background: "rgba(6,2,18,0.93)",
              backdropFilter: "blur(32px) saturate(1.8)",
              border: "1px solid rgba(168,85,247,0.22)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(168,85,247,0.08)",
            }}>

            {/* Horizontal scan line sweep */}
            <motion.div className="absolute left-0 right-0 h-px pointer-events-none z-0"
              style={{ background: "linear-gradient(90deg,transparent,rgba(168,85,247,0.5),rgba(56,189,248,0.4),transparent)" }}
              animate={{ top: ["0%", "100%", "0%"] }}
              transition={{ duration: 7, repeat: Infinity, ease: "linear" }} />

            {/* Corner accents */}
            {["top-0 left-0 border-t-2 border-l-2", "top-0 right-0 border-t-2 border-r-2",
              "bottom-0 left-0 border-b-2 border-l-2", "bottom-0 right-0 border-b-2 border-r-2"].map((cls, i) => (
              <motion.div key={i} className={`absolute w-5 h-5 ${cls} pointer-events-none`}
                style={{ borderColor: "rgba(168,85,247,0.5)", borderRadius: i < 2 ? "0 0 8px 0" : "8px 0 0 0" }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }} />
            ))}

            <div className="p-7 relative z-10">
              {/* Header */}
              <div className="text-center mb-7">
                <ScanRing scanning={loading} />
                <motion.h1
                  initial={{ opacity: 0, letterSpacing: "0.5em" }}
                  animate={mounted ? { opacity: 1, letterSpacing: "0.3em" } : {}}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-base font-black uppercase"
                  style={{ background: "linear-gradient(135deg,#a855f7,#38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  EAS Portal
                </motion.h1>
                <motion.p initial={{ opacity: 0 }} animate={mounted ? { opacity: 1 } : {}} transition={{ delay: 0.45 }}
                  className="text-[9px] text-gray-600 tracking-[0.3em] uppercase mt-0.5">
                  Secure Access System
                </motion.p>
              </div>

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={mounted ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.35 }}>
                  <ElegantInput icon={Mail} label="Email" type="email" value={email}
                    onChange={v => { setEmail(v); setError(""); }} autoComplete="email" />
                </motion.div>

                <motion.div initial={{ opacity: 0, x: -20 }} animate={mounted ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.42 }}>
                  <ElegantInput icon={Lock} label="Password" type="password" value={password}
                    onChange={v => { setPassword(v); setError(""); }} autoComplete="current-password" />
                </motion.div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -6, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -6, height: 0 }}
                      className="px-3.5 py-2.5 rounded-xl text-[10px] font-bold text-red-400 flex items-center gap-2"
                      style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}>
                      <span className="text-red-500 text-xs">⚠</span> {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Forgot password */}
                <motion.div initial={{ opacity: 0 }} animate={mounted ? { opacity: 1 } : {}} transition={{ delay: 0.5 }}
                  className="flex justify-end">
                  <button type="button" onClick={() => { playSound("click"); setShowForgot(true); }}
                    className="text-[9px] font-bold uppercase tracking-wider transition-colors"
                    style={{ color: "#6b7280" }}
                    onMouseEnter={e => e.target.style.color = "#a855f7"}
                    onMouseLeave={e => e.target.style.color = "#6b7280"}>
                    Lupa Password?
                  </button>
                </motion.div>

                {/* Login button */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={mounted ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.55 }}>
                  <motion.button type="submit" disabled={loading}
                    whileTap={!loading ? { scale: 0.96 } : {}}
                    className="w-full py-3.5 rounded-2xl text-sm font-black text-white flex items-center justify-center gap-2 relative overflow-hidden"
                    style={{
                      background: loading
                        ? "rgba(255,255,255,0.05)"
                        : "linear-gradient(135deg,#7c3aed,#2563eb)",
                      boxShadow: loading ? "none" : "0 4px 28px rgba(124,58,237,0.45), 0 0 0 1px rgba(168,85,247,0.2)",
                      border: loading ? "1px solid rgba(255,255,255,0.08)" : "none",
                      transition: "all 0.3s ease",
                    }}>
                    {loading ? (
                      <>
                        <motion.div className="w-4 h-4 rounded-full border-2 border-purple-500/30 border-t-purple-400"
                          animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }} />
                        <span className="text-gray-400">Memverifikasi...</span>
                      </>
                    ) : (
                      <>
                        <span>Masuk ke EAS</span>
                        <ArrowRight size={16} />
                        {/* Shimmer effect */}
                        <motion.div className="absolute inset-0 pointer-events-none"
                          animate={{ x: ["-100%", "200%"] }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                          style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)", width: "50%" }} />
                      </>
                    )}
                  </motion.button>
                </motion.div>
              </form>

              {/* Divider */}
              <motion.div initial={{ opacity: 0 }} animate={mounted ? { opacity: 1 } : {}} transition={{ delay: 0.62 }}
                className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(168,85,247,0.2))" }} />
                <span className="text-[8px] text-gray-700 uppercase tracking-widest font-black">atau</span>
                <div className="flex-1 h-px" style={{ background: "linear-gradient(270deg,transparent,rgba(168,85,247,0.2))" }} />
              </motion.div>

              {/* Register */}
              <motion.button type="button" initial={{ opacity: 0 }} animate={mounted ? { opacity: 1 } : {}} transition={{ delay: 0.68 }}
                onClick={() => { playSound("nav"); navigate("/register"); }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2"
                style={{
                  background: "rgba(168,85,247,0.07)",
                  border: "1px solid rgba(168,85,247,0.2)",
                  color: "#9ca3af",
                }}>
                Belum punya akun?
                <span style={{ color: "#a855f7" }}>Daftar Sekarang →</span>
              </motion.button>

              {/* Footer */}
              <motion.div initial={{ opacity: 0 }} animate={mounted ? { opacity: 1 } : {}} transition={{ delay: 0.75 }}
                className="flex items-center justify-center gap-1.5 mt-5">
                <ShieldCheck size={10} style={{ color: "#374151" }} />
                <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: "#2d3748" }}>
                  Firebase Secured · EAS v3.0
                </span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPortal;
