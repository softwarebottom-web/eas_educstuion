import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../api/config";
import { collection, getDocs, deleteDoc, doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { Users, Trash2, ExternalLink, RefreshCcw, ShieldCheck, BookOpen, LogOut, CheckCircle, XCircle, Crown, KeyRound, ChevronDown, Link, Lock, Unlock, Shield, Radio } from "lucide-react";
import AdminQuiz from "./AdminQuiz";
import { AdminApplications, AdminWebinar, AdminLibraryManager } from "./AdminFeatures";
import AdminSeleksi from "./AdminSeleksi";
import { playSound } from "../component/Intro";

const ROLES = ["member", "moderator", "admin", "owner"];

const AdminDashboard = () => {
  const [listGen1, setListGen1] = useState([]);
  const [listGen2, setListGen2] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("members");
  const [role, setRole] = useState(null);
  const [adminId, setAdminId] = useState(null);

  // Modal states
  const [codeModal, setCodeModal] = useState(null);
  const [newCode, setNewCode] = useState("");
  const [codeLoading, setCodeLoading] = useState(false);

  // WhatsApp settings state
  const [waSettings, setWaSettings] = useState({
    gen1: { link: "", open: true },
    gen2: { link: "", open: true },
  });
  const [waLoading, setWaLoading] = useState(false);

  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "users"));
      const users = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      const sortFn = (a, b) => new Date(b.system?.createdAt) - new Date(a.system?.createdAt);
      setListGen1(users.filter((u) => u.public?.gen === 1).sort(sortFn).slice(0, 100));
      setListGen2(users.filter((u) => u.public?.gen === 2).sort(sortFn).slice(0, 100));
    } catch (err) {
      console.error(err);
      alert("Gagal ambil data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch WhatsApp settings dari Firestore
  const fetchWaSettings = async () => {
    try {
      const snap = await getDoc(doc(db, "settings", "whatsapp"));
      if (snap.exists()) {
        setWaSettings(snap.data());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const saveWaSettings = async () => {
    setWaLoading(true);
    try {
      await setDoc(doc(db, "settings", "whatsapp"), waSettings);
      playSound("success");
      alert("✅ Pengaturan WhatsApp disimpan!");
    } catch (err) {
      alert("Gagal simpan: " + err.message);
    } finally {
      setWaLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("eas_admin_token");
    const id = localStorage.getItem("eas_admin_id");
    const roleLS = localStorage.getItem("eas_admin_role");
    const expire = localStorage.getItem("eas_admin_expire");

    if (!token || !id || !roleLS || !expire || Date.now() > Number(expire)) {
      localStorage.clear();
      navigate("/", { replace: true });
      return;
    }

    setAdminId(id);
    setRole(roleLS);
    fetchData();
    fetchWaSettings();
  }, [navigate]);

  const toggleVerify = async (userId, currentStatus) => {
    playSound("click");
    try {
      await updateDoc(doc(db, "users", userId), { "system.verified": !currentStatus });
      fetchData();
    } catch (err) {
      alert("Gagal update: " + err.message);
    }
  };

  const changeRole = async (userId, newRole) => {
    if (role !== "owner") { alert("Hanya Owner yang bisa ubah role!"); return; }
    playSound("click");
    try {
      await updateDoc(doc(db, "users", userId), { "public.role": newRole });
      fetchData();
    } catch (err) {
      alert("Gagal update role: " + err.message);
    }
  };

  const handleSetAdminCode = async () => {
    if (!newCode.trim() || newCode.trim().length < 4) { alert("Admin code minimal 4 karakter"); return; }
    setCodeLoading(true);
    try {
      await updateDoc(doc(db, "users", codeModal.userId), { "private.adminCode": newCode.trim() });
      playSound("success");
      alert(`Admin code untuk ${codeModal.nama} berhasil diset!`);
      setCodeModal(null);
      setNewCode("");
    } catch (err) {
      alert("Gagal set code: " + err.message);
    } finally {
      setCodeLoading(false);
    }
  };

  const deleteMember = async (id) => {
    if (!["owner", "admin", "moderator"].includes(role)) { alert("Tidak punya akses!"); return; }
    if (!window.confirm("Hapus member ini?")) return;
    playSound("click");
    try {
      await deleteDoc(doc(db, "users", id));
      fetchData();
    } catch (err) {
      alert("Gagal hapus: " + err.message);
    }
  };

  const handleLogout = () => {
    playSound("click");
    localStorage.clear();
    navigate("/", { replace: true });
  };

  if (!role) return <div className="h-screen flex items-center justify-center bg-[#06010f] text-red-500 font-bold">Unauthorized</div>;
  if (loading) return <div className="h-screen flex items-center justify-center bg-[#06010f] text-purple-400 font-bold">Loading Admin Panel...</div>;

  return (
    <div className="min-h-screen text-white p-5 pb-32 font-mono" style={{ background:"linear-gradient(135deg,#06010f,#0a0218,#060115)" }}>

      {/* HEADER */}
      <header className="flex justify-between mb-6 border-b pb-4" style={{ borderColor:"rgba(120,80,220,0.2)" }}>
        <div>
          <h1 className="text-lg font-black bg-gradient-to-r from-purple-400 to-sky-400 bg-clip-text text-transparent">ADMIN COMMAND CENTER</h1>
          <div className="flex gap-2 mt-1 text-xs text-purple-400">
            <ShieldCheck size={14} /> {role?.toUpperCase()}
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <button onClick={() => { playSound("click"); fetchData(); fetchWaSettings(); }} className="text-gray-400 hover:text-white"><RefreshCcw size={18} /></button>
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-400"><LogOut size={18} /></button>
        </div>
      </header>

      {/* TABS */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: "members", label: "Members", icon: <Users size={14} /> },
          { key: "whatsapp", label: "WhatsApp", icon: <Link size={14} /> },
          { key: "quiz", label: "Quiz", icon: <BookOpen size={14} /> },
          { key: "applications", label: "Lamaran", icon: <Shield size={14} /> },
          { key: "webinar", label: "Webinar", icon: <Radio size={14} /> },
          { key: "library", label: "Library", icon: <BookOpen size={14} /> },
          { key: "seleksi", label: "Seleksi", icon: <Shield size={14} /> },
        ].map((t) => (
          <button key={t.key}
            onClick={() => { playSound("click"); setTab(t.key); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${tab === t.key ? "text-white" : "bg-gray-900/50 text-gray-500"}`}
            style={tab===t.key?{background:"linear-gradient(135deg,#7c3aed,#2563eb)"}:{}}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* MEMBERS TAB */}
      {tab === "members" && (
        <>
          <div className="flex gap-4 mb-6 text-xs text-gray-400">
            <span>Gen 1: <span className="text-blue-400 font-bold">{listGen1.length}</span></span>
            <span>Gen 2: <span className="text-blue-400 font-bold">{listGen2.length}</span></span>
            <span>Total: <span className="text-white font-bold">{listGen1.length + listGen2.length}</span></span>
          </div>
          <Section title="GEN 1" data={listGen1} onDelete={deleteMember} onVerify={toggleVerify} onChangeRole={changeRole}
            onSetCode={(userId, nama) => { setCodeModal({ userId, nama }); setNewCode(""); }} role={role} />
          <Section title="GEN 2" data={listGen2} onDelete={deleteMember} onVerify={toggleVerify} onChangeRole={changeRole}
            onSetCode={(userId, nama) => { setCodeModal({ userId, nama }); setNewCode(""); }} role={role} />
        </>
      )}

      {/* WHATSAPP TAB */}
      {tab === "whatsapp" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-black text-green-400 flex items-center gap-2">
              <Link size={16} /> PENGATURAN GRUP WHATSAPP
            </h2>
            {role !== "owner" && (
              <span className="text-[9px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full font-bold uppercase">
                View Only
              </span>
            )}
          </div>

          {/* INFO KHUSUS NON-OWNER */}
          {role !== "owner" && (
            <div className="p-4 bg-yellow-900/10 border border-yellow-800/30 rounded-2xl text-center">
              <p className="text-[10px] text-yellow-500 font-bold">🔒 Hanya Owner yang dapat mengubah link & status grup</p>
              <p className="text-[9px] text-gray-600 mt-1">Kamu bisa melihat status tapi tidak bisa mengedit</p>
            </div>
          )}

          {[1, 2].map((gen) => {
            const key = `gen${gen}`;
            const wa = waSettings[key] || { link: "", open: true };
            const isOwner = role === "owner";
            return (
              <div key={gen} className="p-5 bg-black/40 border border-gray-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-black text-white">GEN {gen}</p>

                  {/* TOGGLE — hanya owner */}
                  {isOwner ? (
                    <button
                      onClick={() => {
                        playSound("click");
                        setWaSettings(prev => ({ ...prev, [key]: { ...prev[key], open: !wa.open } }));
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition border
                        ${wa.open
                          ? "bg-green-600/20 border-green-500/40 text-green-400 hover:bg-green-600/40"
                          : "bg-red-600/20 border-red-500/40 text-red-400 hover:bg-red-600/40"}`}
                    >
                      {wa.open ? <><Unlock size={12} /> OPEN</> : <><Lock size={12} /> CLOSED</>}
                    </button>
                  ) : (
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black border opacity-60
                      ${wa.open ? "border-green-500/30 text-green-400" : "border-red-500/30 text-red-400"}`}>
                      {wa.open ? <><Unlock size={11} /> OPEN</> : <><Lock size={11} /> CLOSED</>}
                    </div>
                  )}
                </div>

                {/* Link input — hanya owner bisa edit */}
                <div>
                  <label className="text-[10px] text-gray-500 uppercase mb-1 block">
                    Link WhatsApp Grup {isOwner ? "" : "(read only)"}
                  </label>
                  <input
                    type="text"
                    placeholder="https://chat.whatsapp.com/..."
                    value={wa.link}
                    readOnly={!isOwner}
                    onChange={isOwner ? (e) => setWaSettings(prev => ({ ...prev, [key]: { ...prev[key], link: e.target.value } })) : undefined}
                    className={`w-full p-3 border rounded-xl text-xs text-white outline-none
                      ${isOwner
                        ? "bg-gray-900 border-gray-700 focus:border-green-500 cursor-text"
                        : "bg-black/20 border-gray-800 cursor-not-allowed text-gray-500"}`}
                  />
                </div>

                <div className={`text-[10px] px-3 py-2 rounded-lg font-bold flex items-center gap-2
                  ${wa.open ? "bg-green-900/20 text-green-400" : "bg-red-900/20 text-red-400"}`}>
                  <span>{wa.open ? "✅" : "🔴"}</span>
                  Grup {wa.open ? "TERBUKA — member bisa join" : "DITUTUP — member tidak bisa join"}
                </div>
              </div>
            );
          })}

          {/* Tombol simpan hanya owner */}
          {role === "owner" && (
            <button
              onClick={saveWaSettings}
              disabled={waLoading}
              className="w-full p-4 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 rounded-xl font-black text-sm transition"
            >
              {waLoading ? "Menyimpan..." : "💾 SIMPAN PENGATURAN"}
            </button>
          )}
        </div>
      )}

      {/* QUIZ TAB */}
      {tab === "quiz" && <AdminQuiz />}
      {tab === "applications" && <AdminApplications role={role} />}
      {tab === "webinar" && <AdminWebinar adminId={adminId} role={role} />}
      {tab === "library" && <AdminLibraryManager />}
      {tab === "seleksi" && <AdminSeleksi role={role} adminId={adminId} />}

      {/* MODAL SET ADMIN CODE */}
      {codeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm p-8 rounded-3xl bg-[#0a0f1e] border border-yellow-500/30 text-center">
            <KeyRound className="mx-auto text-yellow-400 mb-4" size={28} />
            <h2 className="text-sm font-black text-yellow-400 mb-1">SET ADMIN CODE</h2>
            <p className="text-[10px] text-gray-500 mb-6">{codeModal.nama}</p>
            <input type="password" placeholder="Admin Code baru (min 4 karakter)" value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              className="w-full p-3 bg-black/40 border border-yellow-500/20 rounded-xl text-xs text-yellow-400 text-center focus:outline-none focus:border-yellow-500 mb-4" />
            <div className="flex gap-2">
              <button onClick={() => { playSound("click"); setCodeModal(null); }}
                className="flex-1 py-3 rounded-xl text-xs font-bold bg-gray-800 text-gray-400 hover:bg-gray-700">Cancel</button>
              <button onClick={handleSetAdminCode} disabled={codeLoading}
                className="flex-1 py-3 rounded-xl text-xs font-bold bg-yellow-600 hover:bg-yellow-500 text-white disabled:bg-gray-700">
                {codeLoading ? "Saving..." : "Set Code"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Section = ({ title, data, onDelete, onVerify, onChangeRole, onSetCode, role }) => (
  <div className="mb-8">
    <h2 className="text-xs font-black text-gray-500 uppercase mb-3 tracking-widest">{title} — {data.length} members</h2>
    {data.length === 0 && <p className="text-xs text-gray-700">Tidak ada member</p>}
    {data.map((u) => (
      <MemberCard key={u.id} data={u} onDelete={onDelete} onVerify={onVerify} onChangeRole={onChangeRole} onSetCode={onSetCode} role={role} />
    ))}
  </div>
);

const MemberCard = ({ data, onDelete, onVerify, onChangeRole, onSetCode, role }) => {
  const pub = data.public || {};
  const sys = data.system || {};
  const [showRole, setShowRole] = useState(false);

  return (
    <div className="p-4 border border-gray-800 rounded-2xl mb-2 bg-white/5 hover:bg-white/10 transition">
      <div className="flex justify-between items-start">
        <div className="flex gap-3 items-center">
          <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center text-xs font-black text-blue-300">
            {pub.nama?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div>
            <div className="text-xs font-bold text-white">{pub.nama}</div>
            <div className="text-[10px] text-blue-400">{pub.memberId}</div>
            <div className="text-[10px] text-gray-500">{pub.domisili} • {pub.umur} thn</div>
            <div className={`text-[9px] mt-1 font-bold ${sys.verified ? "text-green-500" : "text-yellow-500"}`}>
              {sys.verified ? "✓ VERIFIED" : "⏳ PENDING"}
            </div>
          </div>
        </div>

        <div className="flex gap-2 items-center flex-wrap justify-end">
          <button onClick={() => onVerify(data.id, sys.verified)}
            className={`p-2 rounded-xl transition ${sys.verified ? "bg-green-500/20 text-green-400 hover:bg-red-500/20 hover:text-red-400" : "bg-yellow-500/20 text-yellow-400 hover:bg-green-500/20 hover:text-green-400"}`}>
            {sys.verified ? <CheckCircle size={14} /> : <XCircle size={14} />}
          </button>

          {pub.tiktok && (
            <a href={pub.tiktok} target="_blank" rel="noopener noreferrer"
              className="p-2 rounded-xl bg-gray-800 text-gray-400 hover:text-white transition">
              <ExternalLink size={14} />
            </a>
          )}

          {role === "owner" && (
            <div className="relative">
              <button onClick={() => setShowRole(!showRole)}
                className="p-2 rounded-xl bg-purple-500/20 text-purple-400 hover:bg-purple-500/40 transition flex items-center gap-1">
                <Crown size={14} /><ChevronDown size={10} />
              </button>
              {showRole && (
                <div className="absolute right-0 top-10 z-20 bg-[#0a0f1e] border border-purple-500/30 rounded-xl overflow-hidden w-32 shadow-xl">
                  {ROLES.map((r) => (
                    <button key={r} onClick={() => { onChangeRole(data.id, r); setShowRole(false); }}
                      className={`w-full text-left px-4 py-2 text-[11px] font-bold hover:bg-purple-500/20 transition ${pub.role === r ? "text-purple-400" : "text-gray-400"}`}>
                      {r.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {role === "owner" && (
            <button onClick={() => onSetCode(data.id, pub.nama)}
              className="p-2 rounded-xl bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/40 transition" title="Set Admin Code">
              <KeyRound size={14} />
            </button>
          )}

          {["owner", "admin", "moderator"].includes(role) && (
            <button onClick={() => onDelete(data.id)}
              className="p-2 rounded-xl bg-red-500/10 text-gray-600 hover:text-red-500 hover:bg-red-500/20 transition">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="mt-2">
        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full
          ${pub.role === "owner" ? "bg-yellow-500/20 text-yellow-400" :
            pub.role === "admin" ? "bg-blue-500/20 text-blue-400" :
            pub.role === "moderator" ? "bg-purple-500/20 text-purple-400" :
            "bg-gray-800 text-gray-500"}`}>
          {pub.role?.toUpperCase() || "MEMBER"}
        </span>
      </div>
    </div>
  );
};

export default AdminDashboard;
