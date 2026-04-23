import { useState, useEffect } from "react";
import { db } from "../api/config";
import {
  collection, getDocs, addDoc, doc, updateDoc, getDoc,
  setDoc, query, where, orderBy, deleteDoc
} from "firebase/firestore";
import {
  Shield, Plus, Trash2, CheckCircle, XCircle, Eye,
  Star, ToggleLeft, ToggleRight, Users, Award,
  ChevronDown, ChevronUp, Lock, UserCheck, AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { playSound } from "../component/Intro";

const ACCENT = "#a855f7";
const ACCENT2 = "#38bdf8";

const glass = (op = 0.08, border = "rgba(120,80,220,0.2)") => ({
  background: `rgba(12,5,28,${op})`,
  backdropFilter: "blur(20px) saturate(1.8)",
  WebkitBackdropFilter: "blur(20px) saturate(1.8)",
  border: `1px solid ${border}`,
  boxShadow: "0 8px 32px rgba(80,40,180,0.12), inset 0 1px 0 rgba(255,255,255,0.05)",
});

// ════════════════════════════════════════════
// ADMIN SELEKSI — Tab di AdminDashboard
// ════════════════════════════════════════════
const AdminSeleksi = ({ role, adminId }) => {
  const [subTab, setSubTab] = useState("list"); // list | buat_soal | hasil | settings
  const [apps, setApps] = useState([]); // lamaran yang approved
  const [selected, setSelected] = useState(null); // peserta yang dipilih
  const [loading, setLoading] = useState(true);
  const [hasilList, setHasilList] = useState([]);

  // Settings
  const [lulusMin, setLulusMin] = useState(80); // % minimum lulus
  const [isOpen, setIsOpen] = useState(true);
  const [timerSec, setTimerSec] = useState(15);

  // Akses — siapa yang boleh buat soal
  const canMakeSoal = role === "owner" || role === "moderator";
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    fetchAll();
    fetchSettings();
    if (role === "admin") checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const snap = await getDoc(doc(db, "seleksi_access", adminId));
      setHasAccess(snap.exists() && snap.data().granted === true);
    } catch (_) {}
  };

  const fetchSettings = async () => {
    try {
      const snap = await getDoc(doc(db, "settings", "admin_apply"));
      if (snap.exists()) {
        const d = snap.data();
        setLulusMin(d.lulusMin || 80);
        setIsOpen(d.isOpen !== false);
        setTimerSec(d.timerSeconds || 15);
      }
    } catch (_) {}
  };

  const saveSettings = async () => {
    if (role !== "owner" && role !== "moderator") return alert("Hanya owner/moderator yang bisa ubah settings!");
    try {
      await setDoc(doc(db, "settings", "admin_apply"), {
        isOpen, lulusMin, timerSeconds: Math.min(20, Math.max(10, timerSec))
      }, { merge: true });
      playSound("success");
      alert("✅ Pengaturan seleksi disimpan!");
    } catch (err) { alert("Gagal: " + err.message); }
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [appsSnap, hasilSnap] = await Promise.all([
        getDocs(query(collection(db, "admin_applications"), orderBy("appliedAt", "desc"))),
        getDocs(query(collection(db, "seleksi_hasil"), orderBy("submittedAt", "desc")))
      ]);
      const allApps = appsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setApps(allApps.filter(a => a.status === "approved"));
      setHasilList(hasilSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const canEdit = canMakeSoal || hasAccess;

  const getHasilByUser = (userId) => hasilList.find(h => h.userId === userId);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-white flex items-center gap-2">
          <Shield size={16} style={{ color: ACCENT }}/> Manajemen Seleksi
        </h3>
        <button onClick={fetchAll} className="text-[9px] text-gray-500 underline">Refresh</button>
      </div>

      {/* Sub tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {[
          ["list", "Peserta", Users],
          ["buat_soal", "Buat Soal", Plus],
          ["hasil", "Hasil", Award],
          ["settings", "Settings", Shield],
        ].filter(([key]) => {
          if (key === "settings") return role === "owner" || role === "moderator";
          return true;
        }).map(([key, label, Icon]) => (
          <button key={key} onClick={() => { playSound("click"); setSubTab(key); selected && key !== "buat_soal" && setSelected(null); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black flex-shrink-0 transition-all"
            style={subTab === key
              ? { background: `linear-gradient(135deg,${ACCENT},#2563eb)`, color: "#fff" }
              : { background: "rgba(255,255,255,0.05)", color: "#6b7280" }}>
            <Icon size={12}/>{label}
          </button>
        ))}
      </div>

      {/* ── LIST PESERTA ── */}
      {subTab === "list" && (
        <PesertaList
          apps={apps} loading={loading} hasilList={hasilList} lulusMin={lulusMin}
          canEdit={canEdit} role={role} adminId={adminId}
          onSelect={(app) => { setSelected(app); setSubTab("buat_soal"); }}
        />
      )}

      {/* ── BUAT SOAL ── */}
      {subTab === "buat_soal" && (
        <BuatSoalPanel
          selected={selected} apps={apps} canEdit={canEdit} role={role}
          onSelectApp={setSelected} onBack={() => setSubTab("list")} onSaved={fetchAll}
        />
      )}

      {/* ── HASIL SELEKSI ── */}
      {subTab === "hasil" && (
        <HasilPanel hasilList={hasilList} lulusMin={lulusMin} apps={apps} role={role} />
      )}

      {/* ── SETTINGS ── */}
      {subTab === "settings" && (role === "owner" || role === "moderator") && (
        <SettingsPanel
          isOpen={isOpen} setIsOpen={setIsOpen}
          lulusMin={lulusMin} setLulusMin={setLulusMin}
          timerSec={timerSec} setTimerSec={setTimerSec}
          onSave={saveSettings} role={role} adminId={adminId}
        />
      )}
    </div>
  );
};

// ─── PESERTA LIST ─────────────────────────
const PesertaList = ({ apps, loading, hasilList, lulusMin, canEdit, onSelect }) => {
  if (loading) return <p className="text-xs text-gray-600 py-6 text-center">Memuat peserta...</p>;

  if (apps.length === 0) return (
    <div className="text-center py-10">
      <Users size={36} className="mx-auto mb-3 text-gray-700"/>
      <p className="text-sm text-gray-600 font-bold">Belum ada peserta yang lolos lamaran</p>
      <p className="text-xs text-gray-700 mt-1">Approve lamaran di tab Lamaran terlebih dahulu</p>
    </div>
  );

  return (
    <div className="space-y-3">
      <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest">{apps.length} peserta lolos lamaran</p>
      {apps.map((app, i) => {
        const hasil = hasilList.find(h => h.userId === app.userId);
        const pct = hasil ? Math.round((hasil.score / hasil.total) * 100) : null;
        const lulus = pct !== null && pct >= lulusMin;

        return (
          <motion.div key={app.id} initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.05 }}
            className="rounded-2xl overflow-hidden" style={glass(0.08, ACCENT+"20")}>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-xs font-black text-white">{app.nama}</p>
                  <p className="text-[9px] text-gray-500">{app.memberId} · {app.role?.toUpperCase()}</p>
                  <p className="text-[9px] text-gray-600 mt-0.5">Melamar: {new Date(app.appliedAt).toLocaleDateString("id-ID")}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {hasil ? (
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-black ${lulus ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                      {lulus ? "✅ LULUS" : "❌ TIDAK LULUS"}
                    </span>
                  ) : (
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-black bg-yellow-500/20 text-yellow-400">⏳ Belum Seleksi</span>
                  )}
                  {hasil && (
                    <span className="text-[9px] font-black" style={{ color: lulus ? "#10b981" : "#ef4444" }}>
                      {hasil.score}/{hasil.total} ({pct}%)
                    </span>
                  )}
                </div>
              </div>

              {canEdit && !hasil && (
                <button onClick={() => onSelect(app)}
                  className="w-full py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition mt-1"
                  style={{ background: ACCENT+"20", color: ACCENT, border:`1px solid ${ACCENT}30` }}>
                  <Plus size={13}/> Buat Soal Seleksi untuk {app.nama}
                </button>
              )}
              {hasil && (
                <div className="mt-2 p-2 rounded-xl text-[9px]" style={{ background:"rgba(255,255,255,0.04)" }}>
                  <div className="w-full h-1.5 rounded-full bg-gray-800 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width:`${pct}%`, background: lulus ? "#10b981" : "#ef4444" }}/>
                  </div>
                  <p className="text-gray-500 mt-1">{pct}% · Min lulus: {lulusMin}% · Pelanggaran: {hasil.violations || 0}</p>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// ─── BUAT SOAL PANEL ─────────────────────
const BuatSoalPanel = ({ selected, apps, canEdit, role, onSelectApp, onBack, onSaved }) => {
  const [soalList, setSoalList] = useState([
    { pertanyaan:"", tipe:"pilihan", pilihan:["","","",""], correctAnswer:0, nilai:25 }
  ]);
  const [loading, setLoading] = useState(false);
  const [existingSoal, setExistingSoal] = useState(null);

  useEffect(() => {
    if (selected) loadExistingSoal();
  }, [selected]);

  const loadExistingSoal = async () => {
    if (!selected) return;
    try {
      const snap = await getDocs(query(collection(db,"seleksi_soal"), where("userId","==",selected.userId)));
      if (!snap.empty) {
        const data = snap.docs[0].data();
        setExistingSoal({ id: snap.docs[0].id, ...data });
        setSoalList(data.soal || []);
      } else {
        setExistingSoal(null);
        setSoalList([{ pertanyaan:"", tipe:"pilihan", pilihan:["","","",""], correctAnswer:0, nilai:25 }]);
      }
    } catch (_) {}
  };

  const totalNilai = soalList.reduce((sum, s) => sum + (Number(s.nilai) || 0), 0);

  const addSoal = () => {
    const sisaNilai = 100 - totalNilai;
    setSoalList(s => [...s, { pertanyaan:"", tipe:"pilihan", pilihan:["","","",""], correctAnswer:0, nilai:Math.max(5, Math.min(sisaNilai, 25)) }]);
  };

  const removeSoal = (i) => setSoalList(s => s.filter((_,idx) => idx !== i));
  const updateSoal = (i, field, val) => setSoalList(s => s.map((soal,idx) => idx===i ? {...soal,[field]:val} : soal));
  const updatePilihan = (si, pi, val) => setSoalList(s => s.map((soal,idx) => idx===si ? {...soal,pilihan:soal.pilihan.map((p,pidx)=>pidx===pi?val:p)} : soal));

  const submitSoal = async () => {
    if (!selected) return alert("Pilih peserta dulu!");
    const invalid = soalList.find(s => !s.pertanyaan.trim() || (s.tipe==="pilihan" && s.pilihan.some(p=>!p.trim())));
    if (invalid) return alert("Lengkapi semua soal terlebih dahulu!");
    if (totalNilai !== 100) return alert(`Total nilai harus 100! Sekarang: ${totalNilai}`);

    setLoading(true);
    try {
      if (existingSoal) {
        await updateDoc(doc(db,"seleksi_soal",existingSoal.id), { soal:soalList, updatedAt:new Date().toISOString() });
      } else {
        await addDoc(collection(db,"seleksi_soal"), {
          userId:selected.userId, nama:selected.nama, appId:selected.id,
          soal:soalList, createdAt:new Date().toISOString()
        });
      }
      playSound("success");
      alert(`✅ Soal untuk ${selected.nama} berhasil ${existingSoal?"diupdate":"disimpan"}!`);
      onSaved(); onBack();
    } catch (err) { alert("Gagal: " + err.message); }
    finally { setLoading(false); }
  };

  if (!canEdit) return (
    <div className="text-center py-10" style={glass(0.08,"rgba(239,68,68,0.2)")}>
      <Lock size={32} className="mx-auto mb-3 text-red-400"/>
      <p className="text-sm font-black text-red-400 mb-1">Akses Ditolak</p>
      <p className="text-xs text-gray-500">Kamu belum punya akses untuk membuat soal. Minta owner/moderator untuk memberikan akses.</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Pilih peserta */}
      <div className="rounded-2xl p-4" style={glass(0.09,ACCENT+"25")}>
        <p className="text-[9px] text-purple-400 uppercase font-black mb-2">Peserta yang diseleksi</p>
        {selected ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-white">{selected.nama}</p>
              <p className="text-[9px] text-gray-500">{selected.memberId} · {selected.role?.toUpperCase()}</p>
              {existingSoal && <p className="text-[9px] text-yellow-400 mt-0.5">⚠️ Sudah ada soal — akan diupdate</p>}
            </div>
            <button onClick={() => { onSelectApp(null); setExistingSoal(null); setSoalList([{pertanyaan:"",tipe:"pilihan",pilihan:["","","",""],correctAnswer:0,nilai:25}]); }}
              className="text-xs text-gray-500 underline">Ganti</button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-[10px] text-gray-400">Pilih peserta dari list di bawah:</p>
            {apps.map(app => (
              <button key={app.id} onClick={() => onSelectApp(app)}
                className="w-full text-left p-3 rounded-xl transition text-xs font-bold text-white"
                style={glass(0.06,ACCENT+"20")}>
                {app.nama} <span className="text-gray-500 font-normal">· {app.role}</span>
              </button>
            ))}
            {apps.length === 0 && <p className="text-xs text-gray-600">Belum ada peserta yang lolos lamaran</p>}
          </div>
        )}
      </div>

      {selected && (
        <>
          {/* Total nilai indicator */}
          <div className="rounded-2xl p-3 flex items-center justify-between" style={{ background: totalNilai===100?"rgba(16,185,129,0.1)":"rgba(239,68,68,0.1)", border:`1px solid ${totalNilai===100?"#10b98130":"#ef444430"}` }}>
            <p className="text-xs font-black" style={{ color:totalNilai===100?"#10b981":"#ef4444" }}>
              Total Nilai: {totalNilai}/100
            </p>
            <p className="text-[9px] text-gray-500">{totalNilai===100?"✅ Sudah 100%":"❌ Harus tepat 100%"}</p>
          </div>

          {/* Soal builder */}
          <div className="space-y-3">
            {soalList.map((soal, i) => (
              <SoalCard key={i} soal={soal} index={i}
                onUpdate={(f,v)=>updateSoal(i,f,v)}
                onUpdatePilihan={(pi,v)=>updatePilihan(i,pi,v)}
                onRemove={()=>removeSoal(i)} canRemove={soalList.length>1}/>
            ))}
          </div>

          <button onClick={addSoal}
            className="w-full py-3 rounded-2xl text-xs font-black border-2 border-dashed flex items-center justify-center gap-2 transition"
            style={{ borderColor:"rgba(168,85,247,0.3)", color:ACCENT }}>
            <Plus size={14}/> Tambah Soal
          </button>

          <button onClick={submitSoal} disabled={loading || totalNilai!==100}
            className="w-full py-4 rounded-2xl font-black text-sm text-white transition disabled:opacity-50"
            style={{ background:`linear-gradient(135deg,${ACCENT},#2563eb)` }}>
            {loading ? "Menyimpan..." : `💾 Simpan Soal untuk ${selected.nama}`}
          </button>
        </>
      )}
    </div>
  );
};

// ─── SOAL CARD ───────────────────────────
const SoalCard = ({ soal, index, onUpdate, onUpdatePilihan, onRemove, canRemove }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="rounded-2xl overflow-hidden" style={glass(0.08,ACCENT+"20")}>
      {/* Header soal */}
      <button className="w-full flex items-center justify-between p-3" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black text-purple-400 uppercase">Soal {index+1}</span>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 font-black">
            {soal.nilai || 0} poin
          </span>
          <span className="text-[9px] px-2 py-0.5 rounded-full font-black" style={{ background:ACCENT+"15", color:ACCENT }}>
            {soal.tipe}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {canRemove && <button onClick={(e)=>{e.stopPropagation();onRemove();}} className="text-red-400 p-1"><Trash2 size={12}/></button>}
          {expanded ? <ChevronUp size={14} className="text-gray-600"/> : <ChevronDown size={14} className="text-gray-600"/>}
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-4 space-y-3">
          {/* Nilai soal */}
          <div>
            <label className="text-[9px] text-gray-500 uppercase font-black block mb-1">Nilai soal ini (total harus 100)</label>
            <input type="number" value={soal.nilai} min={5} max={100}
              onChange={e => onUpdate("nilai", Number(e.target.value))}
              className="w-full p-2 rounded-xl text-xs text-white outline-none"
              style={{ background:"rgba(255,255,255,0.05)", border:`1px solid ${ACCENT}25` }}/>
          </div>

          {/* Tipe soal */}
          <div className="grid grid-cols-2 gap-1.5">
            {["pilihan","essay"].map(t => (
              <button key={t} type="button" onClick={() => onUpdate("tipe",t)}
                className="py-1.5 rounded-xl text-[9px] font-black transition"
                style={{ background:soal.tipe===t?ACCENT+"25":"rgba(255,255,255,0.04)", color:soal.tipe===t?ACCENT:"#6b7280", border:`1px solid ${soal.tipe===t?ACCENT+"40":"transparent"}` }}>
                {t==="pilihan"?"Pilihan Ganda":"Essay"}
              </button>
            ))}
          </div>

          {/* Pertanyaan */}
          <div>
            <label className="text-[9px] text-gray-500 uppercase font-black block mb-1">Pertanyaan *</label>
            <textarea value={soal.pertanyaan} rows={3}
              onChange={e => onUpdate("pertanyaan",e.target.value)}
              placeholder="Tulis soal seleksi di sini..."
              className="w-full p-3 rounded-xl text-xs text-white resize-none outline-none"
              style={{ background:"rgba(255,255,255,0.05)", border:`1px solid ${ACCENT}25` }}/>
          </div>

          {/* Pilihan jawaban */}
          {soal.tipe === "pilihan" && (
            <div>
              <label className="text-[9px] text-gray-500 uppercase font-black block mb-2">
                Pilihan Jawaban <span className="text-green-400">(● = jawaban benar)</span>
              </label>
              <div className="space-y-2">
                {soal.pilihan.map((p, pi) => (
                  <div key={pi} className="flex items-center gap-2">
                    <button type="button" onClick={() => onUpdate("correctAnswer",pi)}
                      className="w-5 h-5 rounded-full flex-shrink-0 border-2 transition flex items-center justify-center"
                      style={{ borderColor:soal.correctAnswer===pi?"#10b981":"rgba(120,80,220,0.3)", background:soal.correctAnswer===pi?"#10b981":"transparent" }}>
                      {soal.correctAnswer===pi && <div className="w-2 h-2 rounded-full bg-white"/>}
                    </button>
                    <input value={p} onChange={e => onUpdatePilihan(pi,e.target.value)}
                      placeholder={`Pilihan ${String.fromCharCode(65+pi)}`}
                      className="flex-1 p-2.5 rounded-xl text-xs text-white outline-none"
                      style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${soal.correctAnswer===pi?"#10b98140":"rgba(120,80,220,0.15)"}` }}/>
                  </div>
                ))}
              </div>
            </div>
          )}

          {soal.tipe === "essay" && (
            <div className="p-3 rounded-xl text-[9px] text-gray-500" style={{ background:"rgba(255,255,255,0.03)" }}>
              💡 Soal essay — admin menilai jawaban peserta secara manual setelah seleksi
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── HASIL PANEL ─────────────────────────
const HasilPanel = ({ hasilList, lulusMin, apps, role }) => {
  const [detail, setDetail] = useState(null);

  if (hasilList.length === 0) return (
    <div className="text-center py-10">
      <Award size={36} className="mx-auto mb-3 text-gray-700"/>
      <p className="text-sm text-gray-600 font-bold">Belum ada hasil seleksi</p>
    </div>
  );

  return (
    <div className="space-y-3">
      <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest">{hasilList.length} peserta sudah mengerjakan</p>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label:"Total", value:hasilList.length, color:ACCENT },
          { label:"Lulus", value:hasilList.filter(h=>Math.round((h.score/h.total)*100)>=lulusMin).length, color:"#10b981" },
          { label:"Tidak Lulus", value:hasilList.filter(h=>Math.round((h.score/h.total)*100)<lulusMin).length, color:"#ef4444" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-3 text-center" style={glass(0.08,s.color+"25")}>
            <p className="text-lg font-black" style={{ color:s.color }}>{s.value}</p>
            <p className="text-[8px] text-gray-500 uppercase font-black">{s.label}</p>
          </div>
        ))}
      </div>

      {hasilList.map((h, i) => {
        const pct = Math.round((h.score / h.total) * 100);
        const lulus = pct >= lulusMin;
        const app = apps.find(a => a.userId === h.userId);

        return (
          <motion.div key={h.id} initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.05 }}
            className="rounded-2xl overflow-hidden" style={glass(0.08, lulus?"rgba(16,185,129,0.2)":"rgba(239,68,68,0.15)")}>
            <button className="w-full p-4 text-left" onClick={() => setDetail(detail===h.id?null:h.id)}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-black text-white">{h.nama}</p>
                  <p className="text-[9px] text-gray-500">{app?.memberId} · {app?.role?.toUpperCase()}</p>
                  <p className="text-[9px] text-gray-600 mt-0.5">{new Date(h.submittedAt).toLocaleDateString("id-ID",{dateStyle:"long"})}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-black ${lulus?"bg-green-500/20 text-green-400":"bg-red-500/20 text-red-400"}`}>
                    {lulus?"✅ LULUS":"❌ GAGAL"}
                  </span>
                  <span className="text-sm font-black" style={{ color:lulus?"#10b981":"#ef4444" }}>{pct}%</span>
                  <span className="text-[9px] text-gray-600">{h.score}/{h.total} benar</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="w-full h-2 rounded-full bg-gray-800 overflow-hidden">
                  <motion.div className="h-full rounded-full"
                    initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ delay:i*0.05+0.2, duration:0.6 }}
                    style={{ background:lulus?"#10b981":"#ef4444" }}/>
                </div>
                <div className="flex justify-between text-[8px] text-gray-600 mt-0.5">
                  <span>0%</span>
                  <span className="text-yellow-400">Min {lulusMin}%</span>
                  <span>100%</span>
                </div>
              </div>

              {h.violations > 0 && (
                <div className="mt-2 flex items-center gap-1 text-[9px] text-orange-400">
                  <AlertTriangle size={10}/> {h.violations} pelanggaran{h.disqualified?" — DISKUALIFIKASI":""}
                </div>
              )}
            </button>

            {/* Detail jawaban */}
            <AnimatePresence>
              {detail === h.id && (
                <motion.div initial={{ height:0,opacity:0 }} animate={{ height:"auto",opacity:1 }} exit={{ height:0,opacity:0 }}
                  className="overflow-hidden">
                  <div className="px-4 pb-4 space-y-2 border-t" style={{ borderColor:"rgba(255,255,255,0.05)" }}>
                    <p className="text-[9px] text-gray-500 uppercase font-black mt-3">Detail Jawaban</p>
                    {Object.entries(h.answers || {}).map(([qi, ans]) => (
                      <div key={qi} className="p-2.5 rounded-xl text-[10px]" style={{ background:"rgba(255,255,255,0.03)" }}>
                        <p className="text-gray-400 font-bold mb-1">Soal {Number(qi)+1}</p>
                        <p className="text-white">{typeof ans === "number" ? `Pilihan ${String.fromCharCode(65+ans)}` : ans}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
};

// ─── SETTINGS PANEL ──────────────────────
const SettingsPanel = ({ isOpen, setIsOpen, lulusMin, setLulusMin, timerSec, setTimerSec, onSave, role, adminId }) => {
  const [accessList, setAccessList] = useState([]);
  const [allAdmins, setAllAdmins] = useState([]);
  const [loadingAccess, setLoadingAccess] = useState(true);

  useEffect(() => { fetchAccess(); }, []);

  const fetchAccess = async () => {
    setLoadingAccess(true);
    try {
      const [accessSnap, usersSnap] = await Promise.all([
        getDocs(collection(db,"seleksi_access")),
        getDocs(collection(db,"users"))
      ]);
      setAccessList(accessSnap.docs.map(d => ({ id:d.id, ...d.data() })));
      const admins = usersSnap.docs.map(d => ({ id:d.id, ...d.data().public })).filter(u => u.role === "admin");
      setAllAdmins(admins);
    } catch (_) {}
    finally { setLoadingAccess(false); }
  };

  const grantAccess = async (userId, nama) => {
    if (role !== "owner" && role !== "moderator") return alert("Hanya owner/moderator!");
    try {
      await setDoc(doc(db,"seleksi_access",userId), { granted:true, grantedBy:adminId, nama, grantedAt:new Date().toISOString() });
      playSound("success"); fetchAccess();
    } catch (err) { alert("Gagal: " + err.message); }
  };

  const revokeAccess = async (userId) => {
    if (role !== "owner") return alert("Hanya owner yang bisa mencabut akses!");
    try {
      await deleteDoc(doc(db,"seleksi_access",userId));
      playSound("click"); fetchAccess();
    } catch (err) { alert("Gagal: " + err.message); }
  };

  return (
    <div className="space-y-4">
      {/* Pengaturan seleksi */}
      <div className="rounded-2xl p-4 space-y-4" style={glass(0.09,ACCENT+"25")}>
        <p className="text-[10px] font-black text-purple-400 uppercase tracking-wider">⚙️ Pengaturan Seleksi</p>

        {/* Buka/tutup */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-white">Status Pendaftaran</p>
            <p className="text-[9px] text-gray-500">{isOpen?"Member bisa melamar":"Pendaftaran ditutup"}</p>
          </div>
          <button onClick={() => setIsOpen(!isOpen)} style={{ color:isOpen?"#10b981":"#ef4444" }}>
            {isOpen ? <ToggleRight size={32}/> : <ToggleLeft size={32}/>}
          </button>
        </div>

        {/* % Lulus minimum */}
        <div>
          <div className="flex justify-between mb-1">
            <p className="text-xs text-gray-400">Nilai Minimum Lulus</p>
            <span className="text-sm font-black text-green-400">{lulusMin}%</span>
          </div>
          <input type="range" min={50} max={100} value={lulusMin}
            onChange={e => setLulusMin(Number(e.target.value))}
            className="w-full" style={{ accentColor:"#10b981" }}/>
          <div className="flex justify-between text-[8px] text-gray-600 mt-0.5"><span>50%</span><span>100%</span></div>
        </div>

        {/* Timer */}
        <div>
          <div className="flex justify-between mb-1">
            <p className="text-xs text-gray-400">Timer Seleksi</p>
            <span className="text-sm font-black" style={{ color:ACCENT }}>{timerSec}s</span>
          </div>
          <input type="range" min={10} max={20} value={timerSec}
            onChange={e => setTimerSec(Number(e.target.value))}
            className="w-full" style={{ accentColor:ACCENT }}/>
          <div className="flex justify-between text-[8px] text-gray-600 mt-0.5"><span>10s (min)</span><span>20s (max)</span></div>
        </div>

        <button onClick={onSave}
          className="w-full py-3 rounded-2xl text-xs font-black text-white"
          style={{ background:`linear-gradient(135deg,${ACCENT},#2563eb)` }}>
          💾 Simpan Pengaturan
        </button>
      </div>

      {/* Kelola akses buat soal */}
      <div className="rounded-2xl p-4" style={glass(0.08,"rgba(56,189,248,0.2)")}>
        <p className="text-[10px] font-black text-sky-400 uppercase tracking-wider mb-3">👥 Akses Buat Soal</p>
        <p className="text-[9px] text-gray-500 mb-3">
          Owner & Moderator otomatis bisa buat soal. Berikan akses ke admin tertentu di bawah.
        </p>

        {loadingAccess ? <p className="text-xs text-gray-600">Memuat...</p> : (
          <div className="space-y-2">
            {allAdmins.length === 0 && <p className="text-xs text-gray-600">Tidak ada admin yang bisa diberi akses</p>}
            {allAdmins.map(admin => {
              const hasAcc = accessList.some(a => a.id === admin.id && a.granted);
              return (
                <div key={admin.id} className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.06)" }}>
                  <div>
                    <p className="text-xs font-bold text-white">{admin.nama}</p>
                    <p className="text-[9px] text-gray-500">{admin.memberId} · ADMIN</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasAcc && <span className="text-[8px] text-green-400 font-black bg-green-500/10 px-2 py-0.5 rounded-full">AKTIF</span>}
                    {hasAcc ? (
                      role === "owner" && (
                        <button onClick={() => revokeAccess(admin.id)}
                          className="text-[9px] font-black text-red-400 px-2 py-1 rounded-lg bg-red-500/10">
                          Cabut
                        </button>
                      )
                    ) : (
                      <button onClick={() => grantAccess(admin.id, admin.nama)}
                        className="text-[9px] font-black px-2 py-1 rounded-lg"
                        style={{ background:ACCENT+"20", color:ACCENT }}>
                        Beri Akses
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSeleksi;
