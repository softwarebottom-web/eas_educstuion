import { useState, useEffect } from "react";
import { db } from "../api/config";
import {
  collection, addDoc, getDocs, doc, updateDoc,
  setDoc, getDoc, query, orderBy, where, deleteDoc
} from "firebase/firestore";
import {
  Shield, Clock, Lock, CheckCircle, XCircle,
  AlertTriangle, Send, Plus, Trash2, Eye, ToggleLeft, ToggleRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { playSound } from "../component/Intro";

const glass = (op = 0.08, border = "rgba(120,80,220,0.2)") => ({
  background: `rgba(12,5,28,${op})`,
  backdropFilter: "blur(20px) saturate(1.8)",
  WebkitBackdropFilter: "blur(20px) saturate(1.8)",
  border: `1px solid ${border}`,
  boxShadow: "0 8px 32px rgba(80,40,180,0.12), inset 0 1px 0 rgba(255,255,255,0.05)",
});

const BG = "linear-gradient(135deg,#06010f 0%,#0a0218 40%,#060115 100%)";
const ACCENT = "#a855f7";
const ACCENT2 = "#38bdf8";

// ─── ANTI-CHEAT ──────────────────────────
const useAntiCheat = (active) => {
  const [violations, setViolations] = useState([]);
  const [disqualified, setDisqualified] = useState(false);

  useEffect(() => {
    if (!active) return;
    const add = (type) => {
      setViolations(prev => {
        const next = [...prev, { type, time: new Date().toLocaleTimeString("id-ID") }];
        if (next.length >= 3) setDisqualified(true);
        return next;
      });
      playSound("click");
    };
    const blockCopy = (e) => { e.preventDefault(); add("Copy/Paste terdeteksi"); };
    const blockPrint = (e) => { e.preventDefault(); add("Screenshot/Print terdeteksi"); };
    const handleVis = () => { if (document.visibilityState === "hidden") add("Tab switching terdeteksi"); };
    const blockCtx = (e) => { e.preventDefault(); add("Klik kanan terdeteksi"); };
    const blockKeys = (e) => {
      if (e.key === "F12" || (e.ctrlKey && e.shiftKey && ["I","J","C"].includes(e.key)) || (e.ctrlKey && e.key === "u")) {
        e.preventDefault(); add("DevTools terdeteksi");
      }
    };
    document.addEventListener("copy", blockCopy);
    document.addEventListener("cut", blockCopy);
    document.addEventListener("paste", blockCopy);
    window.addEventListener("beforeprint", blockPrint);
    document.addEventListener("visibilitychange", handleVis);
    document.addEventListener("contextmenu", blockCtx);
    document.addEventListener("keydown", blockKeys);
    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";
    return () => {
      document.removeEventListener("copy", blockCopy);
      document.removeEventListener("cut", blockCopy);
      document.removeEventListener("paste", blockCopy);
      window.removeEventListener("beforeprint", blockPrint);
      document.removeEventListener("visibilitychange", handleVis);
      document.removeEventListener("contextmenu", blockCtx);
      document.removeEventListener("keydown", blockKeys);
      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";
    };
  }, [active]);

  return { violations, disqualified };
};

// ─── COUNTDOWN TIMER ─────────────────────
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
      <div className="relative w-20 h-20">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(120,80,220,0.15)" strokeWidth="5"/>
          <circle cx="40" cy="40" r="34" fill="none" stroke={color} strokeWidth="5"
            strokeDasharray={`${2*Math.PI*34}`}
            strokeDashoffset={`${2*Math.PI*34*(1-pct/100)}`}
            style={{ transition:"stroke-dashoffset 1s linear", strokeLinecap:"round" }}/>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-black" style={{ color }}>{left}</span>
        </div>
      </div>
      <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Waktu Tersisa</p>
    </div>
  );
};

// ════════════════════════════════════════════
// MEMBER: FORM LAMARAN
// Fase 1 — member isi lamaran, tunggu approve
// ════════════════════════════════════════════
export const ApplyForm = () => {
  const [phase, setPhase] = useState("check"); // check|form|pending|approved|rejected|seleksi_wait|seleksi
  const [myApp, setMyApp] = useState(null);
  const [settings, setSettings] = useState({ isOpen: true, timerSeconds: 15 });
  const [form, setForm] = useState({ role:"moderator", experience:"", motivation:"", skills:"", social:"" });
  const [loading, setLoading] = useState(false);
  const [seleksiSoal, setSeleksiSoal] = useState([]); // soal personal user
  const [seleksiAnswers, setSeleksiAnswers] = useState({});
  const [seleksiPhase, setSeleksiPhase] = useState("pre"); // pre|timer|form|done
  const [seleksiDone, setSeleksiDone] = useState(false);
  const { violations, disqualified } = useAntiCheat(seleksiPhase === "timer" || seleksiPhase === "form");
  const userData = JSON.parse(localStorage.getItem("eas_user_data") || "{}");

  useEffect(() => { checkStatus(); }, []);

  const checkStatus = async () => {
    setPhase("check");
    try {
      const [settSnap, appsSnap] = await Promise.all([
        getDoc(doc(db, "settings", "admin_apply")),
        getDocs(query(collection(db,"admin_applications"), where("userId","==",userData.id)))
      ]);

      if (settSnap.exists()) setSettings({ isOpen:true, timerSeconds:15, ...settSnap.data() });

      if (!appsSnap.empty) {
        const appDoc = appsSnap.docs[0];
        const appData = { id: appDoc.id, ...appDoc.data() };
        setMyApp(appData);

        if (appData.status === "rejected") { setPhase("rejected"); return; }
        if (appData.status === "pending") { setPhase("pending"); return; }
        if (appData.status === "approved") {
          // Cek apakah sudah ada soal seleksi personal
          const soalSnap = await getDocs(query(collection(db,"seleksi_soal"), where("userId","==",userData.id)));
          if (!soalSnap.empty && soalSnap.docs[0].data().soal?.length > 0) {
            // Ada soal — cek sudah dikerjakan?
            const hasilSnap = await getDocs(query(collection(db,"seleksi_hasil"), where("userId","==",userData.id)));
            if (!hasilSnap.empty) { setSeleksiDone(true); setPhase("seleksi_done"); return; }
            setSeleksiSoal(soalSnap.docs[0].data().soal);
            setPhase("seleksi_wait");
          } else {
            setPhase("approved"); // menunggu admin buat soal
          }
          return;
        }
      }
      // Belum pernah melamar
      setPhase(settSnap.data()?.isOpen !== false ? "form" : "closed");
    } catch (err) {
      console.error(err);
      setPhase("form");
    }
  };

  const submitLamaran = async (e) => {
    e.preventDefault();
    if (!form.experience || !form.motivation) return alert("Isi semua field wajib!");
    setLoading(true);
    try {
      await addDoc(collection(db,"admin_applications"), {
        ...form, userId:userData.id, nama:userData.nama,
        gen:userData.gen, memberId:userData.memberId,
        status:"pending", appliedAt: new Date().toISOString()
      });
      playSound("success"); setPhase("pending");
    } catch (err) { alert("Gagal: " + err.message); }
    finally { setLoading(false); }
  };

  const submitSeleksi = async () => {
    if (Object.keys(seleksiAnswers).length < seleksiSoal.length) {
      alert(`Masih ada ${seleksiSoal.length - Object.keys(seleksiAnswers).length} soal belum dijawab!`);
      return;
    }
    if (disqualified) { alert("Diskualifikasi karena pelanggaran!"); return; }
    setLoading(true);
    try {
      let benar = 0;
      seleksiSoal.forEach((s,i) => { if (seleksiAnswers[i] === s.correctAnswer) benar++; });
      await addDoc(collection(db,"seleksi_hasil"), {
        userId:userData.id, nama:userData.nama, appId:myApp.id,
        answers: seleksiAnswers, score: benar, total: seleksiSoal.length,
        violations: violations.length, disqualified,
        submittedAt: new Date().toISOString()
      });
      // Update aplikasi
      await updateDoc(doc(db,"admin_applications",myApp.id), { seleksiStatus:"submitted", seleksiScore:benar, seleksiTotal:seleksiSoal.length });
      playSound("success"); setSeleksiPhase("done"); setPhase("seleksi_done");
    } catch (err) { alert("Gagal submit: " + err.message); }
    finally { setLoading(false); }
  };

  // ── CLOSED ──
  if (phase === "closed") return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: BG }}>
      <div className="text-center p-8 rounded-3xl max-w-sm" style={glass(0.12,"rgba(120,80,220,0.3)")}>
        <Lock size={40} className="mx-auto mb-4 text-purple-400 opacity-50"/>
        <h2 className="text-sm font-black text-white mb-2">Pendaftaran Ditutup</h2>
        <p className="text-xs text-gray-500">Lamaran staff EAS sedang tidak dibuka. Pantau pengumuman di grup.</p>
      </div>
    </div>
  );

  // ── LOADING ──
  if (phase === "check") return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: BG }}>
      <div className="text-purple-400 text-xs font-black animate-pulse tracking-widest">Memeriksa status...</div>
    </div>
  );

  // ── PENDING ──
  if (phase === "pending") return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: BG }}>
      <div className="text-center p-8 rounded-3xl max-w-sm w-full" style={glass(0.1,"rgba(245,158,11,0.25)")}>
        <Clock size={44} className="mx-auto mb-4 text-yellow-400"/>
        <h2 className="text-base font-black text-white mb-2">Lamaran Terkirim</h2>
        <p className="text-xs text-gray-400 mb-4">Admin sedang mereview lamaranmu. Jika diterima, kamu akan mendapat akses ke tahap seleksi.</p>
        <div className="px-3 py-2 rounded-xl bg-yellow-500/10 text-yellow-400 text-[10px] font-bold">⏳ Status: MENUNGGU REVIEW</div>
      </div>
    </div>
  );

  // ── REJECTED ──
  if (phase === "rejected") return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: BG }}>
      <div className="text-center p-8 rounded-3xl max-w-sm w-full" style={glass(0.1,"rgba(239,68,68,0.2)")}>
        <XCircle size={44} className="mx-auto mb-4 text-red-400"/>
        <h2 className="text-base font-black text-white mb-2">Tidak Diterima</h2>
        {myApp?.adminNote && <p className="text-xs text-gray-300 italic bg-black/20 p-3 rounded-xl mb-3">"{myApp.adminNote}"</p>}
        <p className="text-[10px] text-gray-500">Hubungi admin untuk informasi lebih lanjut.</p>
      </div>
    </div>
  );

  // ── APPROVED: tunggu soal dari admin ──
  if (phase === "approved") return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: BG }}>
      <div className="text-center p-8 rounded-3xl max-w-sm w-full" style={glass(0.1,"rgba(16,185,129,0.2)")}>
        <CheckCircle size={44} className="mx-auto mb-4 text-green-400"/>
        <h2 className="text-base font-black text-white mb-2">Lamaran Diterima! 🎉</h2>
        <p className="text-xs text-gray-400 mb-4">Kamu lolos tahap lamaran. Admin akan menyiapkan soal seleksi khusus untukmu. Cek kembali nanti.</p>
        <div className="px-3 py-2 rounded-xl bg-green-500/10 text-green-400 text-[10px] font-bold">✅ Menunggu soal seleksi dari admin</div>
        <button onClick={checkStatus} className="mt-4 text-[10px] text-purple-400 underline">Refresh status</button>
      </div>
    </div>
  );

  // ── SELEKSI DONE ──
  if (phase === "seleksi_done") return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: BG }}>
      <div className="text-center p-8 rounded-3xl max-w-sm w-full" style={glass(0.1,"rgba(168,85,247,0.2)")}>
        <CheckCircle size={44} className="mx-auto mb-4 text-purple-400"/>
        <h2 className="text-base font-black text-white mb-2">Seleksi Selesai</h2>
        <p className="text-xs text-gray-400">Jawabanmu sudah dikirim. Admin akan menilai dan menghubungimu.</p>
      </div>
    </div>
  );

  // ── SELEKSI WAIT: intro seleksi ──
  if (phase === "seleksi_wait") {

    if (seleksiPhase === "pre") return (
      <div className="min-h-screen pb-8 p-5" style={{ background: BG }}>
        <div className="mt-4 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Shield size={20} style={{ color: ACCENT }}/>
            <h1 className="text-base font-black text-white">Tahap Seleksi</h1>
          </div>
          <p className="text-[10px] text-gray-500">Baca peraturan sebelum memulai. Soal bersifat personal & rahasia.</p>
        </div>
        <div className="space-y-3 mb-6">
          {[
            ["⏱️","Timer Ketat",`Form aktif selama ${settings.timerSeconds} detik setelah countdown. Tidak bisa diperpanjang.`],
            ["🔒","Anti Copy-Paste","Semua aktivitas copy, cut, paste diblokir dan dicatat sebagai pelanggaran."],
            ["📵","No Tab Switching","Berpindah tab / minimize browser = pelanggaran otomatis."],
            ["🚫","No Screenshot","Aktivitas print/screenshot terdeteksi dan dicatat."],
            ["⚠️","3 Pelanggaran = DQ","Lebih dari 3 pelanggaran → diskualifikasi otomatis, form tidak bisa submit."],
            ["🎯","Soal Personal","Soal kamu berbeda dengan peserta lain. Dibuat khusus oleh admin/owner."],
          ].map(([ico,title,desc],i) => (
            <div key={i} className="flex gap-3 p-3 rounded-2xl" style={glass(0.07,"rgba(120,80,220,0.2)")}>
              <span className="text-lg flex-shrink-0">{ico}</span>
              <div><p className="text-xs font-bold text-white">{title}</p><p className="text-[10px] text-gray-500 mt-0.5">{desc}</p></div>
            </div>
          ))}
        </div>
        <motion.button whileTap={{ scale:0.96 }}
          onClick={() => { playSound("click"); setSeleksiPhase("timer"); }}
          className="w-full py-4 rounded-2xl font-black text-white text-sm"
          style={{ background:`linear-gradient(135deg,${ACCENT},#2563eb)` }}>
          Saya Siap — Mulai Seleksi
        </motion.button>
      </div>
    );

    if (seleksiPhase === "timer") return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: BG }}>
        <AnimatePresence>
          {violations.length > 0 && (
            <motion.div initial={{ opacity:0,y:-20 }} animate={{ opacity:1,y:0 }}
              className="fixed top-4 left-4 right-4 p-3 rounded-2xl bg-red-900/80 border border-red-500/50 z-50">
              <p className="text-xs text-red-300 font-bold">⚠️ Pelanggaran {violations.length}/3 — {violations[violations.length-1]?.type}</p>
            </motion.div>
          )}
        </AnimatePresence>
        <Shield size={44} className="mb-6" style={{ color:ACCENT }}/>
        <h2 className="text-lg font-black text-white mb-2">Siapkan Dirimu</h2>
        <p className="text-xs text-gray-500 text-center mb-10 max-w-xs">Form soal akan terbuka setelah countdown selesai. Jangan kemana-mana!</p>
        <CountdownTimer seconds={settings.timerSeconds} onExpire={() => { playSound("success"); setSeleksiPhase("form"); }}/>
      </div>
    );

    // ── SELEKSI FORM ──
    if (seleksiPhase === "form" || seleksiPhase === "done") {
      const currentSoal = seleksiSoal;
      return (
        <div className="min-h-screen pb-8 p-5" style={{ background: BG, userSelect:"none", WebkitUserSelect:"none" }}>
          {/* Violation bar */}
          <AnimatePresence>
            {violations.length > 0 && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
                className="fixed top-0 left-0 right-0 p-3 bg-red-900/90 border-b border-red-500/50 z-50 flex items-center gap-2">
                <AlertTriangle size={14} className="text-red-300"/>
                <p className="text-xs text-red-300 font-bold">Pelanggaran {violations.length}/3 {disqualified && "— DISKUALIFIKASI"}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className={`${violations.length>0?"mt-12":"mt-4"} mb-5 flex items-center justify-between`}>
            <div>
              <h1 className="text-base font-black text-white">Form Seleksi</h1>
              <p className="text-[9px] text-gray-500">{Object.keys(seleksiAnswers).length}/{currentSoal.length} dijawab</p>
            </div>
            <div className="px-3 py-1.5 rounded-full text-[9px] font-black" style={{ background:ACCENT+"20", color:ACCENT }}>AKTIF</div>
          </div>

          {disqualified ? (
            <div className="text-center p-8 rounded-3xl border border-red-500/30 bg-red-900/10">
              <XCircle size={40} className="mx-auto mb-3 text-red-400"/>
              <h3 className="text-sm font-black text-red-400 mb-1">DISKUALIFIKASI</h3>
              <p className="text-xs text-gray-500">Terlalu banyak pelanggaran. Hubungi admin untuk klarifikasi.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentSoal.map((soal, i) => (
                <div key={i} className="rounded-3xl p-4" style={glass(0.09,ACCENT+"25")}>
                  <p className="text-[10px] font-black text-purple-400 uppercase mb-2">Soal {i+1}</p>
                  <p className="text-xs text-white font-medium mb-3 leading-relaxed">{soal.pertanyaan}</p>
                  {soal.tipe === "pilihan" ? (
                    <div className="space-y-2">
                      {soal.pilihan.map((p, pi) => (
                        <button key={pi} onClick={() => { playSound("click"); setSeleksiAnswers(a => ({...a,[i]:pi})); }}
                          className="w-full p-3 rounded-xl text-left text-xs transition-all"
                          style={{
                            background: seleksiAnswers[i]===pi ? ACCENT+"25" : "rgba(255,255,255,0.03)",
                            border: `1px solid ${seleksiAnswers[i]===pi ? ACCENT+"60" : "rgba(255,255,255,0.06)"}`,
                            color: seleksiAnswers[i]===pi ? "#fff" : "#9ca3af"
                          }}>
                          <span className="font-mono opacity-50 mr-2 text-[9px]">{String.fromCharCode(65+pi)}.</span>{p}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <textarea
                      value={seleksiAnswers[i] || ""}
                      onChange={e => setSeleksiAnswers(a => ({...a,[i]:e.target.value}))}
                      onPaste={e => e.preventDefault()}
                      onCopy={e => e.preventDefault()}
                      rows={3} placeholder="Tulis jawabanmu di sini..."
                      className="w-full p-3 rounded-xl text-xs text-white resize-none outline-none"
                      style={{ background:"rgba(255,255,255,0.05)", border:`1px solid ${ACCENT}25` }}
                    />
                  )}
                </div>
              ))}

              <button onClick={submitSeleksi} disabled={loading}
                className="w-full py-4 rounded-2xl font-black text-sm text-white transition"
                style={{ background: loading?"#374151":`linear-gradient(135deg,${ACCENT},#2563eb)` }}>
                {loading ? "Mengirim..." : "📤 Submit Seleksi"}
              </button>
            </div>
          )}
        </div>
      );
    }
  }

  // ── FORM LAMARAN ──
  return (
    <div className="min-h-screen pb-8 p-5" style={{ background: BG }}>
      <div className="mt-4 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Shield size={20} style={{ color:ACCENT }}/>
          <h1 className="text-base font-black text-white">Lamaran Staff EAS</h1>
        </div>
        <p className="text-[10px] text-gray-500">Isi dengan jujur. Jika diterima, kamu akan lanjut ke tahap seleksi.</p>
      </div>

      <form onSubmit={submitLamaran} className="space-y-4">
        <div>
          <label className="text-[9px] text-gray-500 uppercase mb-2 block font-black">Posisi yang dilamar *</label>
          <div className="grid grid-cols-2 gap-2">
            {["moderator","admin","editor","co-owner"].map(r => (
              <button type="button" key={r}
                onClick={() => { playSound("click"); setForm(f=>({...f,role:r})); }}
                className="p-3 rounded-xl border text-xs font-bold transition"
                style={{ borderColor:form.role===r?ACCENT:"rgba(120,80,220,0.2)", background:form.role===r?ACCENT+"20":"rgba(255,255,255,0.02)", color:form.role===r?ACCENT:"#6b7280" }}>
                {r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {[
          ["experience","Pengalaman & Background *","Ceritakan pengalamanmu di komunitas, organisasi, atau bidang astronomi...",true],
          ["motivation","Motivasi Bergabung *","Kenapa ingin jadi staff EAS? Kontribusi apa yang bisa kamu berikan?",true],
          ["skills","Skill & Kemampuan","Desain, moderasi, konten, writing, dll",false],
          ["social","Social Media","TikTok, Instagram, atau media sosial lainnya",false],
        ].map(([key,label,ph,required]) => (
          <div key={key}>
            <label className="text-[9px] text-gray-500 uppercase mb-1 block font-black">{label}</label>
            <textarea value={form[key]} rows={required?4:2}
              onChange={e => setForm(f=>({...f,[key]:e.target.value}))} placeholder={ph}
              className="w-full p-3 rounded-2xl text-xs text-white resize-none outline-none"
              style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(120,80,220,0.2)" }}/>
          </div>
        ))}

        <motion.button type="submit" disabled={loading} whileTap={{ scale:0.96 }}
          className="w-full p-4 rounded-2xl font-black text-sm text-white transition"
          style={{ background:loading?"#374151":`linear-gradient(135deg,${ACCENT},#2563eb)` }}>
          {loading ? "Mengirim..." : <><Send size={15} className="inline mr-2"/>Kirim Lamaran</>}
        </motion.button>
      </form>
    </div>
  );
};

// ════════════════════════════════════════════
// ADMIN PANEL: Kelola Lamaran + Buat Soal Seleksi
// ════════════════════════════════════════════
export const AdminApplications = ({ role, adminId }) => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(true);
  const [timerSec, setTimerSec] = useState(15);
  const [noteModal, setNoteModal] = useState(null);
  const [note, setNote] = useState("");
  const [soalModal, setSoalModal] = useState(null); // { appId, userId, nama }
  const [soalList, setSoalList] = useState([{ pertanyaan:"", tipe:"pilihan", pilihan:["","","",""], correctAnswer:0 }]);
  const [grantModal, setGrantModal] = useState(null);
  // Cek apakah admin ini punya akses buat soal
  const canMakeSoal = role === "owner" || role === "moderator";
  // Admin biasa bisa jika punya flag aksesSeleksi
  const [hasGrantedAccess, setHasGrantedAccess] = useState(false);

  useEffect(() => { fetchAll(); checkOwnAccess(); }, []);

  const checkOwnAccess = async () => {
    if (role === "owner" || role === "moderator") return;
    try {
      const snap = await getDoc(doc(db,"seleksi_access",adminId));
      if (snap.exists() && snap.data().granted) setHasGrantedAccess(true);
    } catch (_) {}
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [appsSnap, settSnap] = await Promise.all([
        getDocs(query(collection(db,"admin_applications"), orderBy("appliedAt","desc"))),
        getDoc(doc(db,"settings","admin_apply"))
      ]);
      setApps(appsSnap.docs.map(d => ({id:d.id,...d.data()})));
      if (settSnap.exists()) {
        setIsOpen(settSnap.data().isOpen !== false);
        setTimerSec(settSnap.data().timerSeconds || 15);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const saveSettings = async () => {
    if (role !== "owner") return alert("Hanya owner yang bisa ubah pengaturan!");
    const clamped = Math.min(20, Math.max(10, timerSec));
    await setDoc(doc(db,"settings","admin_apply"), { isOpen, timerSeconds:clamped }, { merge:true });
    playSound("success"); alert("Pengaturan disimpan!");
  };

  const decide = async (id, status) => {
    await updateDoc(doc(db,"admin_applications",id), { status, adminNote:note||null, decidedAt:new Date().toISOString() });
    playSound(status==="approved"?"success":"click");
    setNoteModal(null); setNote(""); fetchAll();
  };

  const grantSeleksiAccess = async (targetAdminId) => {
    if (role !== "owner") return alert("Hanya owner yang bisa memberikan akses!");
    await setDoc(doc(db,"seleksi_access",targetAdminId), { granted:true, grantedBy:adminId, grantedAt:new Date().toISOString() });
    playSound("success"); alert("Akses seleksi diberikan!");
  };

  const addSoal = () => setSoalList(s => [...s, { pertanyaan:"", tipe:"pilihan", pilihan:["","","",""], correctAnswer:0 }]);
  const removeSoal = (i) => setSoalList(s => s.filter((_,idx) => idx !== i));
  const updateSoal = (i, field, val) => setSoalList(s => s.map((soal,idx) => idx===i ? {...soal,[field]:val} : soal));
  const updatePilihan = (si, pi, val) => setSoalList(s => s.map((soal,idx) => idx===si ? {...soal,pilihan:soal.pilihan.map((p,pidx)=>pidx===pi?val:p)} : soal));

  const submitSoal = async () => {
    const valid = soalList.every(s => s.pertanyaan.trim() && (s.tipe==="essay" || s.pilihan.every(p=>p.trim())));
    if (!valid) return alert("Lengkapi semua soal terlebih dahulu!");
    try {
      // Hapus soal lama kalau ada
      const existing = await getDocs(query(collection(db,"seleksi_soal"), where("userId","==",soalModal.userId)));
      await Promise.all(existing.docs.map(d => deleteDoc(doc(db,"seleksi_soal",d.id))));
      // Simpan soal baru (per user → soal personal)
      await addDoc(collection(db,"seleksi_soal"), {
        userId: soalModal.userId, nama: soalModal.nama, appId: soalModal.appId,
        soal: soalList, createdBy: adminId, createdAt: new Date().toISOString()
      });
      playSound("success"); setSoalModal(null);
      setSoalList([{ pertanyaan:"", tipe:"pilihan", pilihan:["","","",""], correctAnswer:0 }]);
      alert(`Soal untuk ${soalModal.nama} berhasil disimpan!`);
    } catch (err) { alert("Gagal: " + err.message); }
  };

  const canEditSoal = canMakeSoal || hasGrantedAccess;
  const statusColor = { pending:"#f59e0b", approved:"#10b981", rejected:"#ef4444" };

  return (
    <div className="space-y-5">
      <h3 className="text-sm font-black text-white flex items-center gap-2"><Shield size={16}/> Lamaran & Seleksi Staff</h3>

      {/* Settings — owner only */}
      {role === "owner" && (
        <div className="p-4 rounded-2xl space-y-3" style={{ background:"rgba(168,85,247,0.08)", border:"1px solid rgba(168,85,247,0.2)" }}>
          <p className="text-[10px] font-black text-purple-400 uppercase tracking-wider">⚙️ Pengaturan Pendaftaran</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white font-bold">Status Pendaftaran</p>
              <p className="text-[9px] text-gray-500">{isOpen ? "Member bisa melamar sekarang" : "Pendaftaran ditutup"}</p>
            </div>
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-1.5 text-xs font-black transition"
              style={{ color: isOpen?"#10b981":"#ef4444" }}>
              {isOpen ? <ToggleRight size={28}/> : <ToggleLeft size={28}/>}
            </button>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <p className="text-xs text-gray-400">Timer Seleksi</p>
              <span className="text-xs font-black" style={{ color:ACCENT }}>{timerSec}s</span>
            </div>
            <input type="range" min={10} max={20} value={timerSec}
              onChange={e => setTimerSec(Number(e.target.value))}
              className="w-full" style={{ accentColor:ACCENT }}/>
            <div className="flex justify-between text-[8px] text-gray-600 mt-0.5"><span>10s (min)</span><span>20s (max)</span></div>
          </div>
          <button onClick={saveSettings}
            className="w-full py-2.5 rounded-xl text-xs font-black text-white"
            style={{ background:`linear-gradient(135deg,${ACCENT},#2563eb)` }}>
            Simpan Pengaturan
          </button>
        </div>
      )}

      {/* Grant access ke admin biasa — owner only */}
      {role === "owner" && (
        <div className="p-3 rounded-2xl text-center" style={{ background:"rgba(56,189,248,0.06)", border:"1px solid rgba(56,189,248,0.2)" }}>
          <p className="text-[9px] text-sky-400 font-black uppercase mb-1">Akses Buat Soal</p>
          <p className="text-[9px] text-gray-500 mb-2">Berikan akses ke admin tertentu untuk membuat soal seleksi</p>
          <button onClick={() => setGrantModal(true)}
            className="text-[10px] font-black text-sky-400 underline">Kelola Akses Admin</button>
        </div>
      )}

      {/* Info untuk admin biasa */}
      {role === "admin" && !hasGrantedAccess && (
        <div className="p-3 rounded-2xl text-center" style={{ background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.2)" }}>
          <Lock size={16} className="mx-auto mb-1 text-red-400"/>
          <p className="text-[9px] text-red-400">Kamu belum punya akses untuk membuat soal seleksi. Minta owner untuk memberikan akses.</p>
        </div>
      )}

      {/* Daftar lamaran */}
      {loading ? <p className="text-xs text-gray-600">Memuat...</p> : apps.length === 0 ? (
        <div className="text-center py-8">
          <Shield size={32} className="mx-auto mb-2 text-gray-700"/>
          <p className="text-xs text-gray-600">Belum ada lamaran masuk</p>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map(app => (
            <div key={app.id} className="p-4 rounded-2xl" style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(120,80,220,0.15)" }}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-xs font-black text-white">{app.nama}</p>
                  <p className="text-[9px] text-gray-500">{app.memberId} · {app.role?.toUpperCase()}</p>
                  {app.seleksiStatus === "submitted" && (
                    <p className="text-[9px] text-green-400 font-bold mt-0.5">✅ Seleksi: {app.seleksiScore}/{app.seleksiTotal} benar</p>
                  )}
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded-full font-black"
                  style={{ background:(statusColor[app.status]||"#6b7280")+"20", color:statusColor[app.status]||"#6b7280" }}>
                  {app.status?.toUpperCase()}
                </span>
              </div>

              {app.motivation && <p className="text-[10px] text-gray-500 mb-3 line-clamp-2 italic">"{app.motivation}"</p>}

              <div className="flex gap-2 flex-wrap">
                {app.status === "pending" && (
                  <>
                    <button onClick={() => { setNoteModal({id:app.id,action:"approved",nama:app.nama}); setNote(""); }}
                      className="flex-1 py-2 rounded-xl text-xs font-black bg-green-500/15 text-green-400 flex items-center justify-center gap-1">
                      <CheckCircle size={12}/> Terima
                    </button>
                    <button onClick={() => { setNoteModal({id:app.id,action:"rejected",nama:app.nama}); setNote(""); }}
                      className="flex-1 py-2 rounded-xl text-xs font-black bg-red-500/10 text-red-400 flex items-center justify-center gap-1">
                      <XCircle size={12}/> Tolak
                    </button>
                  </>
                )}
                {app.status === "approved" && canEditSoal && (
                  <button onClick={() => { setSoalModal({appId:app.id,userId:app.userId,nama:app.nama}); setSoalList([{pertanyaan:"",tipe:"pilihan",pilihan:["","","",""],correctAnswer:0}]); }}
                    className="flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1"
                    style={{ background:ACCENT+"20", color:ACCENT }}>
                    <Eye size={12}/> Buat Soal Seleksi
                  </button>
                )}
              </div>
              {app.adminNote && <p className="text-[9px] text-gray-600 italic mt-2">Note: {app.adminNote}</p>}
            </div>
          ))}
        </div>
      )}

      {/* NOTE MODAL */}
      {noteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm p-6 rounded-3xl" style={{ background:"#0a0020", border:"1px solid rgba(120,80,220,0.3)" }}>
            <h3 className="text-sm font-black text-white mb-1">{noteModal.action==="approved"?"✅ Terima":"❌ Tolak"} — {noteModal.nama}</h3>
            <p className="text-[9px] text-gray-500 mb-4">{noteModal.action==="approved"?"Pelamar akan mendapat akses ke tahap seleksi.":"Pelamar tidak bisa melamar lagi."}</p>
            <textarea value={note} onChange={e=>setNote(e.target.value)}
              placeholder="Catatan untuk pelamar (opsional)..." rows={3}
              className="w-full p-3 rounded-xl text-xs text-white resize-none outline-none mb-4"
              style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(120,80,220,0.2)" }}/>
            <div className="flex gap-2">
              <button onClick={()=>setNoteModal(null)} className="flex-1 py-3 rounded-xl text-xs font-bold bg-gray-800 text-gray-400">Batal</button>
              <button onClick={()=>decide(noteModal.id,noteModal.action)}
                className={`flex-1 py-3 rounded-xl text-xs font-black text-white ${noteModal.action==="approved"?"bg-green-600":"bg-red-600"}`}>
                Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BUAT SOAL MODAL */}
      {soalModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-sm">
          <div className="min-h-screen p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4 pt-2">
              <div>
                <h3 className="text-sm font-black text-white">Buat Soal Seleksi</h3>
                <p className="text-[9px] text-purple-400">Untuk: {soalModal.nama} · Soal personal & rahasia</p>
              </div>
              <button onClick={()=>setSoalModal(null)} className="p-2 rounded-xl bg-gray-800 text-gray-400"><XCircle size={16}/></button>
            </div>

            <div className="space-y-4 flex-1">
              {soalList.map((soal,i) => (
                <div key={i} className="p-4 rounded-2xl" style={{ background:"rgba(168,85,247,0.06)", border:"1px solid rgba(168,85,247,0.2)" }}>
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-[10px] font-black text-purple-400 uppercase">Soal {i+1}</p>
                    {soalList.length > 1 && (
                      <button onClick={()=>removeSoal(i)} className="text-red-400 p-1"><Trash2 size={13}/></button>
                    )}
                  </div>

                  <textarea value={soal.pertanyaan} rows={3}
                    onChange={e=>updateSoal(i,"pertanyaan",e.target.value)}
                    placeholder="Tulis pertanyaan di sini..."
                    className="w-full p-3 rounded-xl text-xs text-white resize-none outline-none mb-3"
                    style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(120,80,220,0.2)" }}/>

                  <div className="grid grid-cols-2 gap-1.5 mb-3">
                    {["pilihan","essay"].map(t => (
                      <button key={t} type="button" onClick={()=>updateSoal(i,"tipe",t)}
                        className="py-1.5 rounded-xl text-[9px] font-black transition"
                        style={{ background:soal.tipe===t?ACCENT+"25":"rgba(255,255,255,0.04)", color:soal.tipe===t?ACCENT:"#6b7280", border:`1px solid ${soal.tipe===t?ACCENT+"40":"transparent"}` }}>
                        {t==="pilihan"?"Pilihan Ganda":"Essay"}
                      </button>
                    ))}
                  </div>

                  {soal.tipe === "pilihan" && (
                    <div className="space-y-2">
                      <p className="text-[9px] text-gray-500 font-bold">Pilihan jawaban:</p>
                      {soal.pilihan.map((p,pi) => (
                        <div key={pi} className="flex items-center gap-2">
                          <button type="button" onClick={()=>updateSoal(i,"correctAnswer",pi)}
                            className="w-5 h-5 rounded-full flex-shrink-0 border-2 transition"
                            style={{ borderColor:soal.correctAnswer===pi?"#10b981":"rgba(120,80,220,0.3)", background:soal.correctAnswer===pi?"#10b981":"transparent" }}/>
                          <input value={p} onChange={e=>updatePilihan(i,pi,e.target.value)}
                            placeholder={`Pilihan ${String.fromCharCode(65+pi)}`}
                            className="flex-1 p-2 rounded-xl text-xs text-white outline-none"
                            style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(120,80,220,0.15)" }}/>
                        </div>
                      ))}
                      <p className="text-[8px] text-green-400">● = jawaban benar</p>
                    </div>
                  )}
                </div>
              ))}

              <button onClick={addSoal}
                className="w-full py-3 rounded-2xl text-xs font-black border-2 border-dashed flex items-center justify-center gap-2"
                style={{ borderColor:"rgba(168,85,247,0.3)", color:ACCENT }}>
                <Plus size={14}/> Tambah Soal
              </button>

              <button onClick={submitSoal}
                className="w-full py-4 rounded-2xl font-black text-sm text-white"
                style={{ background:`linear-gradient(135deg,${ACCENT},#2563eb)` }}>
                💾 Simpan & Kirim Soal ke {soalModal.nama}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplyForm;
