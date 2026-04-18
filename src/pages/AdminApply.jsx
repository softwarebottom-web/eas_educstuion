import { useState, useEffect } from "react";
import { db } from "../api/config";
import { collection, addDoc, getDocs, doc, updateDoc, getDoc, query, orderBy } from "firebase/firestore";
import { Shield, Send, Clock, CheckCircle, XCircle, Users, ChevronDown, ChevronUp } from "lucide-react";
import { useEasStore, THEMES } from "../store/useStore";
import { playSound } from "../component/Intro";

// ==================
// FORM LAMARAN
// ==================
export const ApplyForm = () => {
  const { theme } = useEasStore();
  const t = THEMES[theme] || THEMES.dark;
  const userData = JSON.parse(localStorage.getItem("eas_user_data") || "{}");
  const [form, setForm] = useState({ role: "moderator", experience: "", motivation: "", skills: "", social: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [myApp, setMyApp] = useState(null);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const snap = await getDoc(doc(db, "settings", "admin_apply"));
      if (snap.exists()) setIsOpen(snap.data().isOpen !== false);
      // Cek apakah sudah pernah daftar
      const apps = await getDocs(collection(db, "admin_applications"));
      const mine = apps.docs.find(d => d.data().userId === userData.id);
      if (mine) setMyApp({ id: mine.id, ...mine.data() });
    } catch (_) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.experience || !form.motivation) return alert("Isi semua field wajib!");
    setLoading(true);
    try {
      await addDoc(collection(db, "admin_applications"), {
        ...form, userId: userData.id, nama: userData.nama,
        gen: userData.gen, memberId: userData.memberId,
        status: "pending",
        appliedAt: new Date().toISOString()
      });
      playSound("success");
      setSubmitted(true);
      checkStatus();
    } catch (err) {
      alert("Gagal kirim: " + err.message);
    } finally { setLoading(false); }
  };

  if (!isOpen) return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: t.bg }}>
      <div className="text-center p-8 rounded-3xl border max-w-sm" style={{ borderColor: t.border, background: `${t.accent}08` }}>
        <XCircle size={40} className="mx-auto mb-4 text-red-400" />
        <h2 className="text-base font-black text-white mb-2">Pendaftaran Ditutup</h2>
        <p className="text-xs text-gray-500">Lamaran admin sedang tidak dibuka. Coba lagi nanti.</p>
      </div>
    </div>
  );

  if (myApp) return (
    <div className="min-h-screen pb-28 p-5" style={{ background: t.bg }}>
      <div className="mt-8 text-center p-8 rounded-3xl border" style={{ borderColor: t.border, background: `${t.accent}08` }}>
        {myApp.status === "pending" && <Clock size={40} className="mx-auto mb-4 text-yellow-400" />}
        {myApp.status === "approved" && <CheckCircle size={40} className="mx-auto mb-4 text-green-400" />}
        {myApp.status === "rejected" && <XCircle size={40} className="mx-auto mb-4 text-red-400" />}
        <h2 className="text-sm font-black text-white mb-2">Lamaran {myApp.status === "pending" ? "Sedang Diproses" : myApp.status === "approved" ? "Diterima! 🎉" : "Ditolak"}</h2>
        <p className="text-[10px] text-gray-500 mb-3">Role: {myApp.role?.toUpperCase()}</p>
        {myApp.adminNote && <p className="text-xs text-gray-300 italic bg-black/30 p-3 rounded-xl">" {myApp.adminNote} "</p>}
        <p className="text-[9px] text-gray-700 mt-4">{new Date(myApp.appliedAt).toLocaleDateString("id-ID", { dateStyle: "long" })}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-28 p-5" style={{ background: t.bg }}>
      <div className="mt-4 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Shield size={20} style={{ color: t.accent }} />
          <h1 className="text-base font-black text-white">Lamaran Staff EAS</h1>
        </div>
        <p className="text-[10px] text-gray-500">Bergabung sebagai moderator atau admin komunitas EAS</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role */}
        <div>
          <label className="text-[10px] text-gray-500 uppercase mb-2 block font-bold">Posisi yang dilamar *</label>
          <div className="grid grid-cols-2 gap-2">
            {["moderator", "admin", "editor", "co-owner"].map(r => (
              <button type="button" key={r} onClick={() => { playSound("click"); setForm(f => ({...f, role: r})); }}
                className="p-3 rounded-xl border text-xs font-bold transition"
                style={{ borderColor: form.role === r ? t.accent : "rgba(255,255,255,0.08)", background: form.role === r ? `${t.accent}20` : "rgba(255,255,255,0.02)", color: form.role === r ? t.accent : "#6b7280" }}>
                {r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <Field label="Pengalaman & Background *" value={form.experience} onChange={v => setForm(f => ({...f, experience: v}))} placeholder="Ceritakan pengalamanmu di komunitas, organisasi, atau bidang astronomi..." multiline t={t} />
        <Field label="Motivasi Bergabung *" value={form.motivation} onChange={v => setForm(f => ({...f, motivation: v}))} placeholder="Kenapa kamu ingin menjadi staff EAS? Apa yang bisa kamu kontribusikan?" multiline t={t} />
        <Field label="Skill & Kemampuan" value={form.skills} onChange={v => setForm(f => ({...f, skills: v}))} placeholder="Desain, moderasi, konten, programming, dll" t={t} />
        <Field label="Social Media / TikTok" value={form.social} onChange={v => setForm(f => ({...f, social: v}))} placeholder="Link TikTok atau media sosial lainnya" t={t} />

        <button type="submit" disabled={loading}
          className="w-full p-4 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 transition"
          style={{ background: loading ? "#374151" : t.accent }}>
          {loading ? "Mengirim..." : <><Send size={16} /> Kirim Lamaran</>}
        </button>
      </form>
    </div>
  );
};

const Field = ({ label, value, onChange, placeholder, multiline, t }) => (
  <div>
    <label className="text-[10px] text-gray-500 uppercase mb-1 block font-bold">{label}</label>
    {multiline ? (
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3}
        className="w-full p-3 rounded-xl text-xs text-white resize-none outline-none"
        style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${t.border}` }} />
    ) : (
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full p-3 rounded-xl text-xs text-white outline-none"
        style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${t.border}` }} />
    )}
  </div>
);

export default ApplyForm;
