import { useState, useEffect } from "react";
import { db } from "../api/config";
import { collection, getDocs, doc, updateDoc, setDoc, getDoc, addDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { Shield, FileText, Plus, Trash2, Check, X, Users, Radio, Mail, Send, Clock, ChevronDown, BookOpen } from "lucide-react";
import { playSound } from "../component/Intro";

// ==========================================
// ADMIN LAMARAN MANAGER
// ==========================================
export const AdminApplications = ({ role }) => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(true);
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
      if (settSnap.exists()) setIsOpen(settSnap.data().isOpen !== false);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const toggleOpen = async () => {
    await setDoc(doc(db, "settings", "admin_apply"), { isOpen: !isOpen }, { merge: true });
    playSound("click"); setIsOpen(!isOpen);
  };

  const decide = async (id, status) => {
    await updateDoc(doc(db, "admin_applications", id), { status, adminNote: note || null, decidedAt: new Date().toISOString() });
    playSound(status === "approved" ? "success" : "click");
    setNoteModal(null); setNote(""); fetchAll();
  };

  const statusColor = { pending: "#f59e0b", approved: "#10b981", rejected: "#ef4444" };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-white flex items-center gap-2"><Shield size={16} /> Lamaran Staff</h3>
        {role === "owner" && (
          <button onClick={toggleOpen}
            className={`px-3 py-1.5 rounded-xl text-xs font-black border transition ${isOpen ? "border-green-500/40 text-green-400 bg-green-500/10" : "border-red-500/40 text-red-400 bg-red-500/10"}`}>
            {isOpen ? "OPEN" : "CLOSED"}
          </button>
        )}
      </div>

      {loading ? <p className="text-xs text-gray-600">Memuat...</p> : apps.length === 0 ? (
        <p className="text-xs text-gray-600 text-center py-6">Belum ada lamaran</p>
      ) : apps.map(app => (
        <div key={app.id} className="p-4 rounded-2xl border border-gray-800 bg-white/5">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs font-bold text-white">{app.nama}</p>
              <p className="text-[9px] text-gray-500">{app.memberId} · {app.role?.toUpperCase()}</p>
            </div>
            <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ background: statusColor[app.status] + "20", color: statusColor[app.status] }}>
              {app.status?.toUpperCase()}
            </span>
          </div>
          <p className="text-[10px] text-gray-400 mb-2 line-clamp-2">{app.motivation}</p>
          {app.status === "pending" && (
            <div className="flex gap-2">
              <button onClick={() => { setNoteModal({ id: app.id, action: "approved", nama: app.nama }); setNote(""); }}
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-green-500/20 text-green-400 flex items-center justify-center gap-1">
                <Check size={12} /> Terima
              </button>
              <button onClick={() => { setNoteModal({ id: app.id, action: "rejected", nama: app.nama }); setNote(""); }}
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-red-500/10 text-red-400 flex items-center justify-center gap-1">
                <X size={12} /> Tolak
              </button>
            </div>
          )}
          {app.adminNote && <p className="text-[9px] text-gray-600 italic mt-2">Note: {app.adminNote}</p>}
        </div>
      ))}

      {noteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-[#0a0f1e] border border-gray-700">
            <h3 className="text-sm font-black text-white mb-1">{noteModal.action === "approved" ? "✅ Terima" : "❌ Tolak"} Lamaran</h3>
            <p className="text-[10px] text-gray-500 mb-4">{noteModal.nama}</p>
            <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Catatan untuk pelamar (opsional)..." rows={3}
              className="w-full p-3 rounded-xl text-xs text-white resize-none outline-none mb-4 bg-black/40 border border-gray-700" />
            <div className="flex gap-2">
              <button onClick={() => setNoteModal(null)} className="flex-1 py-3 rounded-xl text-xs font-bold bg-gray-800 text-gray-400">Batal</button>
              <button onClick={() => decide(noteModal.id, noteModal.action)}
                className={`flex-1 py-3 rounded-xl text-xs font-bold text-white ${noteModal.action === "approved" ? "bg-green-600" : "bg-red-600"}`}>
                Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// WEBINAR MANAGER
// ==========================================
export const AdminWebinar = ({ adminId, role }) => {
  const [sessions, setSessions] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", type: "webinar", scheduledAt: "", invites: { host: "", speaker1: "", speaker2: "", closing: "" } });
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    fetchSessions();
    fetchMembers();
  }, []);

  const fetchSessions = async () => {
    const snap = await getDocs(collection(db, "webinar_sessions"));
    setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const fetchMembers = async () => {
    const snap = await getDocs(collection(db, "users"));
    setMembers(snap.docs.map(d => ({ id: d.id, ...d.data().public })).filter(u => u.verified !== false));
  };

  const createSession = async () => {
    if (!form.title) return alert("Isi judul sesi!");
    setLoading(true);
    try {
      // Build assignments map: userId -> role
      const assignments = {};
      const assignedNames = {};
      const inviteEmails = [];

      for (const [role, email] of Object.entries(form.invites)) {
        if (!email) continue;
        const member = members.find(m => m.email === email || m.nama?.toLowerCase() === email.toLowerCase());
        if (member) {
          assignments[member.id] = role;
          assignedNames[role] = member.nama;
          inviteEmails.push({ email: member.email || email, role, nama: member.nama || email });
        }
      }

      await addDoc(collection(db, "webinar_sessions"), {
        title: form.title, description: form.description,
        type: form.type, status: "upcoming",
        scheduledAt: form.scheduledAt || null,
        assignments, assignedNames,
        createdBy: adminId, createdAt: new Date().toISOString()
      });

      // Kirim invite ke mail_queue (untuk Firebase Extension atau manual notification)
      for (const invite of inviteEmails) {
        await addDoc(collection(db, "mail_queue"), {
          to: invite.email,
          subject: `Undangan ${form.type === "rapat" ? "Rapat" : "Webinar"} EAS: ${form.title}`,
          body: `Halo ${invite.nama}, kamu diundang sebagai ${invite.role === "host" ? "Pembawa Acara" : invite.role === "speaker1" ? "Pemateri 1" : invite.role === "speaker2" ? "Pemateri 2" : "Penutup"} di sesi "${form.title}". Login ke portal EAS untuk bergabung.`,
          sentAt: new Date().toISOString()
        });
      }

      playSound("success");
      alert("✅ Sesi dibuat & undangan dikirim!");
      setShowCreate(false);
      fetchSessions();
    } catch (err) { alert("Gagal: " + err.message); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, "webinar_sessions", id), { status });
    playSound("click"); fetchSessions();
  };

  const deleteSession = async (id) => {
    if (!confirm("Hapus sesi ini?")) return;
    await deleteDoc(doc(db, "webinar_sessions", id));
    playSound("click"); fetchSessions();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-white flex items-center gap-2"><Radio size={16} /> Webinar & Rapat</h3>
        <button onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black bg-blue-600 text-white">
          <Plus size={12} /> Buat
        </button>
      </div>

      {showCreate && (
        <div className="p-5 rounded-2xl border border-blue-800/40 bg-blue-900/10 space-y-3">
          <h4 className="text-xs font-black text-blue-400">Buat Sesi Baru</h4>

          <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="Judul sesi *"
            className="w-full p-3 rounded-xl text-xs text-white outline-none bg-black/40 border border-gray-700" />
          <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="Deskripsi" rows={2}
            className="w-full p-3 rounded-xl text-xs text-white resize-none outline-none bg-black/40 border border-gray-700" />

          <div className="grid grid-cols-2 gap-2">
            {["webinar", "rapat"].map(tp => (
              <button key={tp} type="button" onClick={() => setForm(f => ({...f, type: tp}))}
                className={`py-2 rounded-xl text-xs font-bold transition border ${form.type === tp ? "border-blue-500 bg-blue-500/20 text-blue-400" : "border-gray-700 text-gray-500"}`}>
                {tp === "webinar" ? "📡 Webinar" : "🔒 Rapat"}
              </button>
            ))}
          </div>

          <input type="datetime-local" value={form.scheduledAt} onChange={e => setForm(f => ({...f, scheduledAt: e.target.value}))}
            className="w-full p-3 rounded-xl text-xs text-white outline-none bg-black/40 border border-gray-700" />

          <div className="space-y-2">
            <p className="text-[10px] text-gray-500 font-bold uppercase">Undang Pemateri (nama/email)</p>
            {[["host","Pembawa Acara"],["speaker1","Pemateri 1"],["speaker2","Pemateri 2"],["closing","Penutup"]].map(([key, label]) => (
              <div key={key}>
                <label className="text-[9px] text-gray-600 mb-0.5 block">{label}</label>
                <input value={form.invites[key]} onChange={e => setForm(f => ({...f, invites: {...f.invites, [key]: e.target.value}}))}
                  placeholder={`Nama atau email ${label}`}
                  className="w-full p-2.5 rounded-xl text-xs text-white outline-none bg-black/40 border border-gray-700" />
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button onClick={() => setShowCreate(false)} className="flex-1 py-3 rounded-xl text-xs font-bold bg-gray-800 text-gray-400">Batal</button>
            <button onClick={createSession} disabled={loading}
              className="flex-1 py-3 rounded-xl text-xs font-bold bg-blue-600 text-white">
              {loading ? "Membuat..." : "Buat & Kirim Undangan"}
            </button>
          </div>
        </div>
      )}

      {sessions.map(s => (
        <div key={s.id} className="p-4 rounded-2xl border border-gray-800 bg-white/5">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs font-bold text-white">{s.title}</p>
              <p className="text-[9px] text-gray-500">{s.type} · {s.status}</p>
            </div>
            <button onClick={() => deleteSession(s.id)} className="p-1.5 text-gray-600 hover:text-red-400"><Trash2 size={12} /></button>
          </div>
          <div className="flex gap-2">
            {["upcoming","live","ended"].map(st => (
              <button key={st} onClick={() => updateStatus(s.id, st)}
                className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold transition ${s.status === st ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-500"}`}>
                {st === "upcoming" ? "Segera" : st === "live" ? "🔴 Live" : "Selesai"}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// ==========================================
// LIBRARY MANAGER
// ==========================================
export const AdminLibraryManager = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    const snap = await getDocs(query(collection(db, "library"), orderBy("createdAt", "desc")));
    setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  const approve = async (id) => { await updateDoc(doc(db, "library", id), { approved: true }); playSound("success"); fetchItems(); };
  const remove = async (id) => { await deleteDoc(doc(db, "library", id)); playSound("click"); fetchItems(); };

  const pending = items.filter(i => !i.approved);
  const approved = items.filter(i => i.approved);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-black text-white flex items-center gap-2"><BookOpen size={16} /> Manajemen Perpustakaan</h3>
      {loading ? <p className="text-xs text-gray-600">Memuat...</p> : (
        <>
          {pending.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-yellow-400 uppercase mb-2">⏳ Menunggu Review ({pending.length})</p>
              {pending.map(item => (
                <div key={item.id} className="p-3 rounded-2xl border border-yellow-800/30 bg-yellow-900/10 mb-2">
                  <p className="text-xs font-bold text-white">{item.title}</p>
                  <p className="text-[9px] text-gray-500">{item.author} · {item.category} · oleh {item.submittedBy}</p>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => approve(item.id)} className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-green-500/20 text-green-400 flex items-center justify-center gap-1"><Check size={11} /> Approve</button>
                    <button onClick={() => remove(item.id)} className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-red-500/10 text-red-400 flex items-center justify-center gap-1"><X size={11} /> Hapus</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="text-[10px] text-gray-600">{approved.length} item sudah dipublish</p>
        </>
      )}
    </div>
  );
};

export default { AdminApplications, AdminWebinar, AdminLibraryManager };
