import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Scale, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";

// ==========================================
// 🔊 SOUND ENGINE
// ==========================================
export const playSound = (type = "click") => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);

    if (type === "click") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start(); osc.stop(ctx.currentTime + 0.1);
    } else if (type === "open") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start(); osc.stop(ctx.currentTime + 0.2);
    } else if (type === "success") {
      [523, 659, 784].forEach((freq, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = "sine"; o.frequency.value = freq;
        g.gain.setValueAtTime(0, ctx.currentTime + i * 0.08);
        g.gain.linearRampToValueAtTime(0.12, ctx.currentTime + i * 0.08 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.2);
        o.start(ctx.currentTime + i * 0.08);
        o.stop(ctx.currentTime + i * 0.08 + 0.25);
      });
      return;
    } else if (type === "nav") {
      osc.type = "square";
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start(); osc.stop(ctx.currentTime + 0.08);
    }
  } catch (_) {}
};

// ==========================================
// LOADING BAR
// ==========================================
const LoadingBar = ({ progress, color = "#3b82f6" }) => (
  <div className="w-48 h-1 bg-gray-800 rounded-full overflow-hidden">
    <motion.div className="h-full rounded-full" style={{ background: color }}
      initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
  </div>
);

// ==========================================
// 🗺️ ROADMAP STEPS
// ==========================================
const STEPS = [
  { num: 1, icon: "📱", title: "Buka Halaman Register", color: "#3b82f6",
    desc: "Akses portal EAS lalu pilih 'Register' atau langsung ke /register.",
    detail: "Pastikan kamu menggunakan email aktif yang bisa diakses kapan saja." },
  { num: 2, icon: "✍️", title: "Isi Data Diri Lengkap", color: "#8b5cf6",
    desc: "Nama lengkap, Email, Password, Tanggal lahir, Domisili provinsi, dan Link TikTok.",
    detail: "Link TikTok harus mengandung kata 'tiktok'. Usia minimal 10 tahun untuk mendaftar." },
  { num: 3, icon: "🔐", title: "Buat Password Aman", color: "#06b6d4",
    desc: "Password minimal 6 karakter. Simpan dengan aman karena dibutuhkan setiap login.",
    detail: "Kalau lupa password, gunakan fitur 'Lupa Password' di halaman login untuk reset via email." },
  { num: 4, icon: "🪪", title: "ID Card Otomatis Dibuat", color: "#10b981",
    desc: "Setelah register berhasil, ID Card digital EAS kamu langsung terbuat dengan Member ID unik.",
    detail: "ID Card berisi nama, Member ID, domisili, generasi, dan QR Code yang bisa diverifikasi admin." },
  { num: 5, icon: "⏳", title: "Tunggu Verifikasi Admin", color: "#f59e0b",
    desc: "Admin EAS akan memverifikasi akunmu. Pantau statusnya di halaman Access Portal.",
    detail: "Proses verifikasi biasanya 1x24 jam. Kalau lebih dari itu, hubungi admin langsung." },
  { num: 6, icon: "💬", title: "Join Grup WhatsApp", color: "#22c55e",
    desc: "Link join grup WhatsApp muncul di Access Portal kalau grup sedang open.",
    detail: "Ada dua grup — Gen 1 dan Gen 2. Kamu akan masuk grup sesuai pilihan saat register." },
  { num: 7, icon: "🚀", title: "Aktifkan Akses Portal", color: "#3b82f6",
    desc: "Klik 'Activate Access' di Access Portal untuk masuk ke dashboard EAS sepenuhnya.",
    detail: "Setelah aktif kamu bisa akses Library, Quiz Harian, dan semua fitur EAS lainnya." },
];

const RoadmapSteps = () => {
  const [activeStep, setActiveStep] = useState(null);
  const [visibleSteps, setVisibleSteps] = useState(0);

  // Animasi steps muncul satu per satu saat mount
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setVisibleSteps(i);
      if (i >= STEPS.length) clearInterval(timer);
    }, 150);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative pb-4">
      {/* Vertical animated line */}
      <motion.div
        className="absolute left-6 top-0 w-0.5 bg-gradient-to-b from-blue-500/60 via-purple-500/40 to-green-500/20"
        initial={{ height: 0 }}
        animate={{ height: "100%" }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />

      <div className="space-y-1">
        {STEPS.map((step, idx) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, x: -30 }}
            animate={visibleSteps > idx ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <button
              onClick={() => { playSound("open"); setActiveStep(activeStep === step.num ? null : step.num); }}
              className="w-full text-left"
            >
              <div className="flex items-start gap-3">
                {/* Node dengan pulse kalau aktif */}
                <div className="relative z-10 flex-shrink-0">
                  <motion.div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-lg border-2 transition-all"
                    style={{
                      background: activeStep === step.num ? `${step.color}25` : "rgba(0,5,13,0.9)",
                      borderColor: visibleSteps > idx ? step.color : "#1f2937",
                    }}
                    animate={activeStep === step.num ? {
                      boxShadow: [`0 0 0px ${step.color}00`, `0 0 20px ${step.color}60`, `0 0 0px ${step.color}00`]
                    } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <span>{step.icon}</span>
                  </motion.div>
                  {/* Connector dot */}
                  {idx < STEPS.length - 1 && (
                    <div className="absolute left-1/2 -translate-x-1/2 top-12 w-0.5 h-2"
                      style={{ background: step.color + "40" }} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-3 pt-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: step.color }}>
                      STEP {step.num}
                    </span>
                    <div className="flex-1 h-px opacity-20" style={{ background: step.color }} />
                    <span className="text-[9px] text-gray-600">{activeStep === step.num ? "▲" : "▼"}</span>
                  </div>
                  <p className="text-xs font-bold text-white leading-tight">{step.title}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{step.desc}</p>

                  {/* Detail expand */}
                  <AnimatePresence>
                    {activeStep === step.num && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-3 rounded-xl border text-[10px] text-gray-200 leading-relaxed"
                          style={{ background: `${step.color}12`, borderColor: `${step.color}35` }}>
                          💡 {step.detail}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </button>
          </motion.div>
        ))}
      </div>

      {/* Hint */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
        className="mt-4 p-3 bg-blue-900/20 border border-blue-800/30 rounded-2xl text-center"
      >
        <p className="text-[9px] text-blue-400 font-bold">Tap setiap step untuk detail lengkap 👆</p>
      </motion.div>
    </div>
  );
};

// ==========================================
// MAIN INTRO
// ==========================================
const Intro = ({ onFinish }) => {
  // Phases: splash → loading → reveal → constitution → roadmap
  const [phase, setPhase] = useState("splash");
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadText, setLoadText] = useState("Initializing...");
  const [openPasal, setOpenPasal] = useState(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);

  const LOAD_STEPS = [
    { text: "Connecting to EAS Satellite...", pct: 20 },
    { text: "Loading Constitution Database...", pct: 45 },
    { text: "Verifying Security Protocol...", pct: 70 },
    { text: "Decrypting Member Records...", pct: 88 },
    { text: "System Ready.", pct: 100 },
  ];

  useEffect(() => {
    if (phase !== "loading") return;
    let i = 0;
    const run = () => {
      if (i >= LOAD_STEPS.length) { setTimeout(() => setPhase("reveal"), 400); return; }
      setLoadText(LOAD_STEPS[i].text);
      setLoadProgress(LOAD_STEPS[i].pct);
      i++;
      setTimeout(run, 600);
    };
    const t = setTimeout(run, 300);
    return () => clearTimeout(t);
  }, [phase]);

  const handleSplashClick = () => { playSound("click"); setPhase("loading"); };
  const handleRevealDone = () => { playSound("success"); setPhase("constitution"); };
  const togglePasal = (id) => { playSound("open"); setOpenPasal(openPasal === id ? null : id); };

  const handleFinish = () => {
    playSound("success");
    // Kasih delay loading sebelum roadmap agar tidak asal tekan
    setRoadmapLoading(true);
    setTimeout(() => {
      setRoadmapLoading(false);
      setPhase("roadmap");
    }, 1500);
  };

  const handleRoadmapDone = () => {
    playSound("success");
    setTimeout(() => onFinish(), 300);
  };

  const UUD_DATA = [
    { id: 1, title: "Pasal 1: Identitas", content: "• Setiap anggota memiliki hak untuk menjaga identitas masing-masing.\n• Dilarang mengejek identitas satu sama lain.\n• Dilarang menyebarkan identitas sesama anggota tanpa izin resmi." },
    { id: 2, title: "Pasal 2: Anggota", content: "• Hak mendapatkan ilmu, kebahagiaan, dan berbicara.\n• Wajib patuhi aturan dan terima konsekuensi.\n• Bebas stiker (non-dewasa).\n• Dilarang mengaku Admin/memberi SP." },
    { id: 3, title: "Pasal 3: Admin/Petinggi", content: "• Wajib jalankan tugas tertib.\n• Dilarang mengejek member/admin lain.\n• Wajib patuhi aturan & terima konsekuensi melanggar." },
    { id: 4, title: "Pasal 4: SP (Surat Peringatan)", content: "• Pelanggaran 2x (SP 1: Nasihat).\n• Pelanggaran 4x (SP 2: Teguran kecil).\n• SP 3 (Teguran keras).\n• SP 4 (Kick sementara).\n• SP 5 (Blacklist Permanen)." },
    { id: 5, title: "Pasal 5: Pendidikan", content: "• Admin wajib beri materi & quiz 1x sehari.\n• Member berhak tanya & koreksi materi.\n• Admin wajib koreksi jawaban member." },
    { id: 6, title: "Pasal 6 & 7: Keamanan & Rapat", content: "• Admin tanggung jawab keamanan.\n• Rapat dipimpin Admin, keputusan untuk kepentingan bersama.\n• Member berhak sampaikan pendapat logis." },
    { id: 7, title: "Pasal 8: Perkataan & Sikap", content: "• Dilarang bermesraan (sesama/lawan jenis).\n• Dilarang rasis, pelecehan, & mencari pacar/mesum." },
    { id: 8, title: "Pasal 9-12: Jabatan & Promosi", content: "• Admin tidak on 1 minggu = Copot jabatan.\n• Member berhak buat grup jika berguna.\n• Promosi wajib izin Admin. Link Phising = SP 5." },
  ];

  const SANKSI_DATA = [
    { type: "Member", items: ["Toxic: SP 3", "Spam Stiker: SP 2-4", "Stiker Jomok: SP 3", "Rusuh: SP 3-5", "Langgar UUD: SP 3-5"] },
    { type: "Admin", items: ["Haus Kekuasaan: SP 3-5", "Rusuh/Tidak Profesional: SP 4", "Kick Tanpa Alasan: SP 5/Copot Jabatan", "Toxic: SP 3"] },
    { type: "Petinggi", items: ["Haus Kekuasaan: SP 5", "Tindakan Tanpa Alasan: SP 5", "Tidak Profesional: SP 4/Turun Jabatan"] }
  ];

  const ADMIN_STRUCTURE = [
    { role: "Owner", name: "Shadow", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" },
    { role: "Co-Owner", name: "Wendy", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30" },
    { role: "Co-Owner", name: "Dr. Ryneford", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30" },
    { role: "Admin", name: "ALZZ", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
    { role: "Admin", name: "Fii", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
    { role: "Admin", name: "Nay", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
  ];

  const EDITOR_STRUCTURE = [
    { role: "Ketua Editor", name: "Zef", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/30" },
    { role: "Wakil Editor", name: "Dani", color: "text-purple-300", bg: "bg-purple-500/10 border-purple-500/30" },
    { role: "Admin Editor", name: "Neo", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/30" },
    { role: "Admin Editor", name: "Hani", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/30" },
  ];

  const Logo = ({ className = "w-10 h-10" }) => (
    <img src="/assets/logo_eas.png" className={`${className} object-contain`}
      onError={(e) => { e.target.style.display = "none"; }} />
  );

  return (
    <div className="min-h-screen bg-[#00050d] text-white flex items-center justify-center p-4 overflow-hidden">
      <AnimatePresence mode="wait">

        {/* ===== PHASE 1: SPLASH — video besar fullscreen ===== */}
        {phase === "splash" && (
          <motion.div key="splash"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center w-full max-w-sm"
            onClick={handleSplashClick}
          >
            {/* VIDEO BESAR */}
            <motion.div
              className="relative w-full aspect-square max-w-xs rounded-3xl overflow-hidden border border-blue-500/20 cursor-pointer"
              animate={{ boxShadow: ["0 0 40px rgba(59,130,246,0.2)", "0 0 80px rgba(59,130,246,0.5)", "0 0 40px rgba(59,130,246,0.2)"] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <video src="/assets/intro.mp4" autoPlay loop muted playsInline
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.parentElement.querySelector(".fallback").style.display = "flex";
                }}
              />
              {/* Fallback pakai logo */}
              <div className="fallback w-full h-full bg-gradient-to-br from-blue-950 to-black items-center justify-center hidden absolute inset-0">
                <Logo className="w-32 h-32 animate-pulse" />
              </div>

              {/* Scan line */}
              <motion.div className="absolute inset-x-0 h-0.5 bg-blue-400/40 pointer-events-none"
                animate={{ top: ["0%", "100%", "0%"] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} />

              {/* Blink overlay */}
              <motion.div className="absolute inset-0 bg-blue-500/10 pointer-events-none"
                animate={{ opacity: [0, 0.3, 0, 0.15, 0] }}
                transition={{ duration: 2, repeat: Infinity, times: [0, 0.1, 0.3, 0.5, 1] }} />

              {/* Corners */}
              <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-blue-400/60" />
              <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-blue-400/60" />
              <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-blue-400/60" />
              <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-blue-400/60" />
            </motion.div>

            <motion.div className="text-center mt-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <h1 className="text-4xl font-black tracking-[0.3em] text-blue-400">EAS</h1>
              <p className="text-[11px] text-gray-500 tracking-[0.4em] mt-1 uppercase">Education Astronomi Sains</p>
              <motion.p className="text-[9px] text-blue-500/60 mt-6 tracking-widest"
                animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}>
                TAP TO ENTER
              </motion.p>
            </motion.div>
          </motion.div>
        )}

        {/* ===== PHASE 2: LOADING ===== */}
        {phase === "loading" && (
          <motion.div key="loading"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6"
          >
            {/* Logo kecil saat loading */}
            <motion.div className="w-20 h-20 rounded-2xl overflow-hidden border border-blue-500/30 flex items-center justify-center bg-blue-950/30"
              animate={{ rotate: [0, 2, -2, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              <Logo className="w-14 h-14" />
            </motion.div>

            <div className="text-center space-y-4">
              <p className="text-[10px] text-blue-400 font-mono tracking-widest animate-pulse">{loadText}</p>
              <LoadingBar progress={loadProgress} />
              <p className="text-[9px] text-gray-700 font-mono">{loadProgress}%</p>
            </div>

            <div className="flex gap-2">
              {[0, 1, 2].map(i => (
                <motion.div key={i} className="w-1.5 h-1.5 bg-blue-500 rounded-full"
                  animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.3 }} />
              ))}
            </div>
          </motion.div>
        )}

        {/* ===== PHASE 3: REVEAL — logo, bukan video ===== */}
        {phase === "reveal" && (
          <motion.div key="reveal"
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.6, type: "spring" }}
            className="text-center"
          >
            {/* Logo (bukan video) dengan glow */}
            <motion.div
              className="w-36 h-36 mx-auto mb-6 rounded-full border-2 border-blue-500/40 flex items-center justify-center bg-blue-950/30"
              animate={{ boxShadow: ["0 0 40px rgba(59,130,246,0.3)", "0 0 80px rgba(59,130,246,0.6)", "0 0 40px rgba(59,130,246,0.3)"] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Logo className="w-20 h-20" />
            </motion.div>

       
