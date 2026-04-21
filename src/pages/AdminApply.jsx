import { useState, useEffect, useRef, useCallback } from "react";
import { db } from "../api/config";
import { collection, addDoc, getDocs, doc, updateDoc, setDoc, getDoc, query, orderBy } from "firebase/firestore";
import { Shield, Clock, Lock, Eye, EyeOff, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { playSound } from "../component/Intro";

const P = { bg: "linear-gradient(135deg,#0a0015,#050010)", accent: "#a855f7", accent2: "#ec4899", border: "rgba(168,85,247,0.2)" };

// ==========================================
// ANTI-CHEAT HOOKS
// ==========================================
const useAntiCheat = (active) => {
  const [violations, setViolations] = useState([]);
  const [disqualified, setDisqualified] = useState(false);

  useEffect(() => {
    if (!active) return;

    const addViolation = (type) => {
      const v = { type, time: new Date().toLocaleTimeString("id-ID"), ts: Date.now() };
      setViolations(prev => {
        const next = [...prev, v];
        if (next.length >= 3) setDisqualified(true);
        return next;
      });
      playSound("click");
    };

    // Block copy-paste
    const blockCopy = (e) => { e.preventDefault(); addViolation("Copy/Paste terdeteksi"); };
    // Block screenshot (tidak bisa 100% tapi bisa detect via visibility change + key combo)
    const blockPrint = (e) => { e.preventDefault(); addViolation("Print/Screenshot terdeteksi"); };
    // Block tab switch
    const handleVisibility = () => { if (document.visibilityState === "hidden") addViolation("Tab switching terdeteksi"); };
    // Block right click
    const blockCtx = (e) => { e.preventDefault(); addViolation("Klik kanan terdeteksi"); };
    // Block dev tools shortcut
    const blockKeys = (e) => {
      if (e.key === "F12" || (e.ctrlKey && e.shiftKey && ["I","J","C"].includes(e.key)) || (e.ctrlKey && e.key === "u")) {
        e.preventDefault(); addViolation("DevTools shortcut terdeteksi");
      }
    };

    document.addEventListener("copy", blockCopy);
    document.addEventListener("cut", blockCopy);
    document.addEventListener("paste", blockCopy);
    window.addEventListener("beforeprint", blockPrint);
    document.addEventListener("visibilitychange", handleVisibility);
    document.addEventListener("contextmenu", blockCtx);
    document.addEventListener("keydown", blockKeys);

    // CSS anti-screenshot
    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";

    return () => {
      document.removeEventListener("copy", blockCopy);
      document.removeEventListener("cut", blockCopy);
      document.removeEventListener("paste", blockCopy);
      window.removeEventListener("beforeprint", blockPrint);
      document.removeEventListener("visibilitychange", handleVisibility);
      document.removeEventListener("contextmenu", blockCtx);
      document.removeEventListener("keydown", blockKeys);
      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";
    };
  }, [active]);

  return { violations, disqualified };
};

// ==========================================
// TIMER COMPONENT
// ==========================================
const CountdownTimer = ({ seconds, onExpire }) => {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    if (left <= 0) { onExpire(); return; }
    const t = setTimeout(() => setLeft(l => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  const pct = (left / seconds) * 100;
  const color = left <= 5 ? "#ef4444" : left <= 10 ? "#f59e0b" : "#10b981";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-16 h-16">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="28" fill="none" stroke="#1f1035" strokeWidth="4" />
          <circle cx="32" cy="32" r="28" fill="none" stroke={color} strokeWidth="4"
            strokeDasharray={`${2*Math.PI*28}`} strokeDashoffset={`${2*Math.PI*28*(1-pct/100)}`}
            style={{ transition: "stroke-dashoffset 1s linear" }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-black" style={{ color }}>{left}</span>
        </div>
      </div>
      <p className="text-[9px] text-gray-500 uppercase font-bold">Waktu tersisa</p>
    </div>
  );
};

// ==========================================
// FORM LAMARAN (untuk member)
// ==========================================
export const ApplyForm = () => {
  const [form, setForm] = useState({ role: "moderator", experience: "", motivation: "", skills: "", social: "" });
  const [loading, setLoading] = useState(false);
  const [myApp, setMyApp] = useState(null);
  const [isOpen, setIsOpen] = useState(true);
  const [settings, setSettings] = useState({ isOpen: true, timerSeconds: 15 });
  const [phase, setPhase] = useState("pre"); // pre | timer | form | submitted
  const [timerDone, setTimerDone] = useState(false);
  const { violations, disqualified } = useAntiCheat(phase === "timer" || phase === "form");
  const userData = JSON.parse(localStorage.getItem("eas_user_data") || "{}");

  useEffect(() => { checkStatus(); }, []);

  const checkStatus = async () => {
    try {
      const [settSnap, apps] = await Promise.all([
        getDoc(doc(db, "settings", "admin_apply")),
        getDocs(collection(db, "admin_applications"))
      ]);
      if (settSnap.exists()) {
        const s = settSnap.data();
        setSettings(s);
        setIsOpen(s.isOpen !== false);
      }
      const mine = apps.docs.find(d => d.data().userId === userData.id);
      if (mine) setMyApp({ id: mine.id, ...mine.data() });
    } catch (_) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (disqualified) return alert("Diskualifikasi karena pelanggaran!");
    if (!form.experience || !form.motivation) return alert("Isi semua field wajib!");
    setLoading(true);
    try {
      await addDoc(collection(db, "admin_applications"), {
        ...form, userId: userData.id, nama: userData.nama, gen: userData.gen, memberId: userData.memberId,
        status: "pending", violations: violations.length,
        appliedAt: new Date().toISOString()
      });
      playSound("success"); setPhase("submitted");
    } catch (err) { alert("Gagal: " + err.message); }
    finally { setLoading(false); }
  };

  if (!isOpen) return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: P.bg }}>
      <div className="text-center p-8 rounded-3xl border max-w-sm" style={{ borderColor: P.border, background: "rgba(168,85,247,0.05)" }}>
        <Lock size={40} className="mx-auto mb-4" style={{ color: P.accent, opacity: 0.5 }} />
        <h2 className="text-base font-black text-white mb-2">Seleksi Ditutup</h2>
        <p className="text-xs text-gray-500">Lamaran staff EAS sedang tidak dibuka. Pantau pengumuman di grup.</p>
      </div>
    </div>
  );

  if (myApp) return (
    <div className="min-h-screen pb-8 p-5" style={{ background: P.bg }}>
      <div className="mt-8 text-center p-8 rounded-3xl border" style={{ borderColor: P.border, background: "rgba(168,85,247,0.05)" }}>
        {myApp.status==="pending" && <Clock size={40} className="mx-auto mb-4 text-yellow-400" />}
        {myApp.status==="approved" && <CheckCircle size={40} className="mx-auto mb-4 text-green-400" />}
        {myApp.status==="rejected" && <XCircle size={40} className="mx-auto mb-4 text-red-400" />}
        <h2 className="text-sm font-black text-white mb-2">{myApp.status==="pending"?"⏳ Sedang Diproses":myApp.status==="approved"?"✅ Diterima!":"❌ Tidak Diterima"}</h2>
        <p className="text-[10px] text-gray-500 mb-3">Posisi: {myApp.role?.toUpperCase()}</p>
        {myApp.adminNote && <p className="text-xs text-gray-300 italic bg-black/30 p-3 rounded-xl">" {myApp.adminNote} "</p>}
      </div>
    </div>
  );

  if (phase === "submitted") return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: P.bg }}>
      <motion.div initial={{ scale:0.8, opacity:0 }} animate={{ scale:1, opacity:1 }} className="text-center p-8 rounded-3xl border max-w-sm" style={{ borderColor: "#10b98130", background: "#10b98108" }}>
        <CheckCircle size={48} className="mx-auto mb-4 text-green-400" />
        <h2 className="text-base font-black text-white mb-2">Lamaran Terkirim!</h2>
        <p className="text-xs text-gray-400">Admin akan mereview dan memberikan keputusan. Tunggu notifikasi.</p>
      </motion.div>
    </div>
  );

  // PRE - sebelum mulai
  if (phase === "pre") return (
    <div className="min-h-screen pb-8 p-5" style={{ background: P.bg }}>
      <div className="mt-4 mb-6">
        <h1 className="text-lg font-black text-white mb-1 flex items-center gap-2"><Shield size={20} style={{ color: P.accent }} /> Seleksi Staff EAS</h1>
        <p className="text-[10px] text-gray-500">Baca ketentuan dengan seksama sebelum mulai</p>
      </div>

      <div className="space-y-3 mb-6">
        {[
          { icon:"⏱️", title:"Timer Ketat", desc:`Form hanya bisa diisi selama ${settings.timerSeconds} detik setelah timer dimulai. Tidak ada perpanjangan.` },
          { icon:"🚫", title:"Anti Copy-Paste", desc:"Semua aktivitas copy, paste, cut akan terdeteksi dan dicatat sebagai pelanggaran." },
          { icon:"📱", title:"Anti Screenshot", desc:"Perilaku mencurigakan seperti print screen akan terdeteksi. Jangan coba-coba." },
          { icon:"🔒", title:"No Tab Switching", desc:"Berpindah tab atau minimize browser akan tercatat sebagai pelanggaran." },
          { icon:"⚠️", title:"Diskualifikasi", desc:"3 pelanggaran = diskualifikasi otomatis. Form tidak bisa disubmit." },
        ].map((r,i) => (
          <div key={i} className="flex gap-3 p-3 rounded-2xl border" style={{ borderColor: P.border, background: "rgba(168,85,247,0.05)" }}>
            <span className="text-xl">{r.icon}</span>
            <div><p className="text-xs font-bold text-white">{r.title}</p><p className="text-[10px] text-gray-500 mt-0.5">{r.desc}</p></div>
          </div>
        ))}
      </div>

      <motion.button whileTap={{ scale:0.95 }} onClick={() => { playSound("click"); setPhase("timer"); }}
        className="w-full py-4 rounded-2xl font-black text-white text-sm" style={{ background: `linear-gradient(135deg,${P.accent},${P.accent2})` }}>
        Saya Mengerti — Mulai Seleksi
      </motion.button>
    </div>
  );

  // TIMER phase
  if (phase === "timer") return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: P.bg }}>
      <AnimatePresence>
        {violations.length > 0 && (
          <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} className="fixed top-4 left-4 right-4 p-3 rounded-2xl bg-red-900/80 border border-red-500/50 z-50">
            <p className="text-xs text-red-300 font-bold">⚠️ Pelanggaran {violations.length}/3: {violations[violations.length-1]?.type}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <Shield size={48} className="mb-6" style={{ color: P.accent }} />
      <h2 className="text-lg font-black text-white mb-2 text-center">Siapkan Jawabanmu</h2>
      <p className="text-xs text-gray-500 text-center mb-8 max-w-xs">Form akan terbuka setelah timer selesai. Siapkan jawaban tentang pengalaman dan motivasimu.</p>

      <CountdownTimer seconds={settings.timerSeconds} onExpire={() => { playSound("success"); setPhase("form"); }} />
    </div>
  );

  // FORM phase
  return (
    <div className="min-h-screen pb-8 p-5" style={{ background: P.bg }}>
      {/* Violation bar */}
      <AnimatePresence>
        {violations.length > 0 && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="fixed top-0 left-0 right-0 p-3 bg-red-900/90 border-b border-red-500/50 z-50 flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-300" />
            <p className="text-xs text-red-300 font-bold">Pelanggaran: {violations.length}/3 — {disqualified?"DISKUALIFIKASI":"Hati-hati!"}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`${violations.length > 0 ? "mt-12" : "mt-4"} mb-5 flex items-center justify-between`}>
        <div>
          <h1 className="text-base font-black text-white">Form Seleksi</h1>
          <p className="text-[9px] text-gray-500">Isi dengan jujur & mandiri</p>
        </div>
        {/* Live timer kecil */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "rgba(168,85,247,0.15)", border: `1px solid ${P.border}` }}>
          <Clock size={12} style={{ color: P.accent }} />
          <span className="text-[10px] font-bold" style={{ color: P.accent }}>Form Aktif</span>
        </div>
      </div>

      {disqualified ? (
        <div className="text-center p-8 rounded-3xl border border-red-500/30 bg-red-900/10">
          <XCircle size={40} className="mx-auto mb-3 text-red-400" />
          <h3 className="text-sm font-black text-red-400 mb-1">DISKUALIFIKASI</h3>
          <p className="text-xs text-gray-500">Terlalu banyak pelanggaran terdeteksi. Hubungi admin untuk klarifikasi.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role */}
          <div>
            <label className="text-[10px] text-gray-500 uppercase mb-2 block font-bold">Posisi yang dilamar *</label>
            <div className="grid grid-cols-2 gap-2">
              {["moderator","admin","editor","co-owner"].map(r => (
                <button type="button" key={r} onClick={() => setForm(f => ({...f,role:r}))}
                  className="p-3 rounded-xl border text-xs font-bold transition"
                  style={{ borderColor: form.role===r?P.accent:P.border, background: form.role===r?P.accent+"20":"rgba(255,255,255,0.02)", color: form.role===r?P.accent:"#6b7280" }}>
                  {r.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {[
            { key:"experience", label:"Pengalaman & Background *", ph:"Ceritakan pengalamanmu di komunitas, organisasi, atau bidang astronomi..." },
            { key:"motivation", label:"Motivasi Bergabung *", ph:"Kenapa ingin jadi staff EAS? Kontribusi apa yang bisa kamu berikan?" },
            { key:"skills", label:"Skill & Kemampuan", ph:"Desain, moderasi, konten, writing, public speaking, dll" },
            { key:"social", label:"Social Media", ph:"TikTok, Instagram, atau media sosial lainnya" },
          ].map(({key,label,ph}) => (
            <div key={key}>
              <label className="text-[10px] text-gray-500 uppercase mb-1 block font-bold">{label}</label>
              <textarea value={form[key]} rows={key==="experience"||key==="motivation"?4:2}
                onChange={e => setForm(f => ({...f,[key]:e.target.value}))} placeholder={ph}
                className="w-full p-3 rounded-xl text-xs text-white resize-none outline-none"
                style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${P.border}` }}
                onPaste={e => e.preventDefault()}
                onCopy={e => e.preventDefault()} />
            </div>
          ))}

          <button type="submit" disabled={loading}
            className="w-full p-4 rounded-2xl font-black text-sm text-white transition"
            style={{ background: loading?"#374151":`linear-gradient(135deg,${P.accent},${P.accent2})` }}>
            {loading?"Mengirim...":"📤 Kirim Lamaran"}
          </button>
        </form>
      )}
    </div>
  );
};

// ==========================================
// ADMIN VIEW
// ==========================================
export const AdminApplications = ({ role }) => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(true);
  const [timerSec, setTimerSec] = useState(15);
  const [noteModal, setNoteModal] = useState(null);
  const [note, setNote] = useState("");

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [appsSnap, settSnap] = await Promise.all([
        getDocs(query(collection(db, "admin_applications"), orderBy("appliedAt", "desc"))),
        getDoc(doc(db, "settings", "admin_apply"))
      ]);
      setApps(appsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      if (settSnap.exists()) {
        setIsOpen(settSnap.data().isOpen !== false);
        setTimerSec(settSnap.data().timerSeconds || 15);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const saveSettings = async () => {
    const clamped = Math.min(20, Math.max(10, timerSec));
    await setDoc(doc(db, "settings", "admin_apply"), { isOpen, timerSeconds: clamped }, { merge: true });
    playSound("success"); alert("Pengaturan disimpan!");
  };

  const decide = async (id, status) => {
    await updateDoc(doc(db, "admin_applications", id), { status, adminNote: note || null, decidedAt: new Date().toISOString() });
    playSound(status==="approved"?"success":"click");
    setNoteModal(null); setNote(""); fetchAll();
  };

  const statusColor = { pending:"#f59e0b", approved:"#10b981", rejected:"#ef4444" };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-black text-white flex items-center gap-2"><Shield size={16} /> Seleksi Staff</h3>

      {/* Settings - hanya owner */}
      {role === "owner" && (
        <div className="p-4 rounded-2xl border border-purple-800/30 bg-purple-900/10 space-y-3">
          <p className="text-[10px] font-black text-purple-400 uppercase">⚙️ Pengaturan Seleksi</p>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">Status Pendaftaran</p>
            <button onClick={() => setIsOpen(!isOpen)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black border transition ${isOpen?"border-green-500/40 text-green-400 bg-green-500/10":"border-red-500/40 text-red-400 bg-red-500/10"}`}>
              {isOpen?"OPEN":"CLOSED"}
            </button>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <p className="text-xs text-gray-400">Timer Seleksi</p>
              <p className="text-xs font-black" style={{ color: P.accent }}>{timerSec} detik</p>
            </div>
            <input type="range" min={10} max={20} value={timerSec} onChange={e => setTimerSec(Number(e.target.value))}
              className="w-full" style={{ accentColor: P.accent }} />
            <div className="flex justify-between text-[8px] text-gray-600 mt-0.5"><span>10s (min)</span><span>20s (max)</span></div>
          </div>
          <button onClick={saveSettings} className="w-full py-2.5 rounded-xl text-xs font-black text-white" style={{ background: `linear-gradient(135deg,${P.accent},${P.accent2})` }}>
            Simpan Pengaturan
          </button>
        </div>
      )}

      {loading ? <p className="text-xs text-gray-600">Memuat...</p> : apps.length === 0 ? (
        <p className="text-xs text-gray-600 text-center py-6">Belum ada lamaran</p>
      ) : apps.map(app => (
        <div key={app.id} className="p-4 rounded-2xl border border-gray-800 bg-white/5">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs font-bold text-white">{app.nama}</p>
              <p className="text-[9px] text-gray-500">{app.memberId} · {app.role?.toUpperCase()}</p>
              {app.violations > 0 && <p className="text-[9px] text-red-400">⚠️ {app.violations} pelanggaran terdeteksi</p>}
            </div>
            <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ background: statusColor[app.status]+"20", color: statusColor[app.status] }}>
              {app.status?.toUpperCase()}
            </span>
          </div>
          {app.motivation && <p className="text-[10px] text-gray-400 mb-2 line-clamp-2">{app.motivation}</p>}
          {app.status === "pending" && (
            <div className="flex gap-2">
              <button onClick={() => { setNoteModal({ id:app.id, action:"approved", nama:app.nama }); setNote(""); }}
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-green-500/20 text-green-400 flex items-center justify-center gap-1">
                ✅ Terima
              </button>
              <button onClick={() => { setNoteModal({ id:app.id, action:"rejected", nama:app.nama }); setNote(""); }}
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-red-500/10 text-red-400 flex items-center justify-center gap-1">
                ❌ Tolak
              </button>
            </div>
          )}
          {app.adminNote && <p className="text-[9px] text-gray-600 italic mt-2">Note: {app.adminNote}</p>}
        </div>
      ))}

      {/* Note modal */}
      {noteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-[#0a0f1e] border border-gray-700">
            <h3 className="text-sm font-black text-white mb-1">{noteModal.action==="approved"?"✅ Terima":"❌ Tolak"} Lamaran</h3>
            <p className="text-[10px] text-gray-500 mb-4">{noteModal.nama}</p>
            <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Catatan untuk pelamar (opsional)..." rows={3}
              className="w-full p-3 rounded-xl text-xs text-white resize-none outline-none mb-4 bg-black/40 border border-gray-700" />
            <div className="flex gap-2">
              <button onClick={() => setNoteModal(null)} className="flex-1 py-3 rounded-xl text-xs font-bold bg-gray-800 text-gray-400">Batal</button>
              <button onClick={() => decide(noteModal.id, noteModal.action)}
                className={`flex-1 py-3 rounded-xl text-xs font-bold text-white ${noteModal.action==="approved"?"bg-green-600":"bg-red-600"}`}>
                Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplyForm;
