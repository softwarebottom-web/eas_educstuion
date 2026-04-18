import { useState, useEffect } from "react";
import { db, supabaseMedia } from "../api/config";
import { collection, addDoc, getDocs, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { BookOpen, Upload, Search, FileText, ExternalLink, Trash2, CheckCircle, Clock, Filter } from "lucide-react";
import { useEasStore, THEMES } from "../store/useStore";
import { playSound } from "../component/Intro";
import { motion } from "framer-motion";

const CATEGORIES = ["Semua", "Jurnal", "Buku", "Artikel", "Paper", "Materi EAS", "Lainnya"];

const Library = () => {
  const [tab, setTab] = useState("browse");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("Semua");
  const { theme } = useEasStore();
  const t = THEMES[theme] || THEMES.dark;
  const userData = JSON.parse(localStorage.getItem("eas_user_data") || "{}");
  const isAdmin = ["admin","owner","moderator"].includes(userData.role);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, "library"), orderBy("createdAt", "desc")));
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(i => isAdmin || i.approved));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filtered = items.filter(i => {
    const matchCat = cat === "Semua" || i.category === cat;
    const matchSearch = !search || i.title?.toLowerCase().includes(search.toLowerCase()) || i.author?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen pb-28" style={{ background: t.bg }}>
      {/* Header */}
      <div className="p-5 border-b" style={{ borderColor: t.border }}>
        <div className="flex items-center gap-2 mb-1">
          <BookOpen size={20} style={{ color: t.accent }} />
          <h1 className="text-base font-black text-white">Perpustakaan EAS</h1>
        </div>
        <p className="text-[9px] text-gray-500">Jurnal, buku, artikel, dan materi astronomi</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-4">
        {["browse", "submit"].map(tb => (
          <button key={tb} onClick={() => { playSound("click"); setTab(tb); }}
            className="flex-1 py-2 rounded-xl text-xs font-bold transition"
            style={{ background: tab === tb ? t.accent : "rgba(255,255,255,0.04)", color: tab === tb ? "#fff" : "#6b7280" }}>
            {tb === "browse" ? "📚 Jelajahi" : "📤 Kirim Karya"}
          </button>
        ))}
      </div>

      {tab === "browse" ? (
        <BrowseView items={filtered} loading={loading} search={search} setSearch={setSearch}
          cat={cat} setCat={setCat} isAdmin={isAdmin} onRefresh={fetchItems} t={t} />
      ) : (
        <SubmitView userData={userData} onSuccess={() => { setTab("browse"); fetchItems(); }} t={t} />
      )}
    </div>
  );
};

const BrowseView = ({ items, loading, search, setSearch, cat, setCat, isAdmin, onRefresh, t }) => {
  const approve = async (id) => {
    await updateDoc(doc(db, "library", id), { approved: true });
    playSound("success"); onRefresh();
  };
  const remove = async (id) => {
    if (!confirm("Hapus item ini?")) return;
    await deleteDoc(doc(db, "library", id));
    playSound("click"); onRefresh();
  };

  return (
    <div className="px-4 space-y-4">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari judul, penulis..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs text-white outline-none"
          style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${t.border}` }} />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCat(c)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold transition"
            style={{ background: cat === c ? t.accent : "rgba(255,255,255,0.05)", color: cat === c ? "#fff" : "#6b7280" }}>
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-600 text-xs">Memuat...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen size={32} className="mx-auto mb-3 text-gray-700" />
          <p className="text-xs text-gray-600">Belum ada item ditemukan</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="p-4 rounded-2xl border" style={{ borderColor: t.border, background: "rgba(255,255,255,0.02)" }}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ background: t.accent + "20", color: t.accent }}>{item.category}</span>
                    {!item.approved && <span className="text-[9px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">Pending</span>}
                  </div>
                  <h3 className="text-xs font-bold text-white leading-tight">{item.title}</h3>
                  <p className="text-[10px] text-gray-500 mt-0.5">{item.author} {item.year && `· ${item.year}`}</p>
                </div>
                <div className="flex gap-1 ml-2">
                  {item.fileUrl && (
                    <a href={item.fileUrl} target="_blank" rel="noopener noreferrer"
                      className="p-2 rounded-xl transition" style={{ background: t.accent + "15", color: t.accent }}>
                      <ExternalLink size={13} />
                    </a>
                  )}
                  {isAdmin && !item.approved && (
                    <button onClick={() => approve(item.id)} className="p-2 rounded-xl bg-green-500/15 text-green-400">
                      <CheckCircle size={13} />
                    </button>
                  )}
                  {isAdmin && (
                    <button onClick={() => remove(item.id)} className="p-2 rounded-xl bg-red-500/10 text-red-400">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
              {item.description && <p className="text-[10px] text-gray-500 leading-relaxed">{item.description}</p>}
              <p className="text-[9px] text-gray-700 mt-2">Dikirim oleh {item.submittedBy} · {new Date(item.createdAt).toLocaleDateString("id-ID")}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

const SubmitView = ({ userData, onSuccess, t }) => {
  const [form, setForm] = useState({ title: "", author: "", year: "", category: "Jurnal", description: "", link: "" });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.author) return alert("Isi judul dan penulis!");
    setLoading(true);
    try {
      let fileUrl = form.link || null;
      if (file) {
        const fname = `library/${Date.now()}_${file.name}`;
        const { error } = await supabaseMedia.storage.from("eas-library").upload(fname, file);
        if (error) throw error;
        const { data } = supabaseMedia.storage.from("eas-library").getPublicUrl(fname);
        fileUrl = data.publicUrl;
      }
      await addDoc(collection(db, "library"), {
        ...form, fileUrl, approved: false,
        submittedBy: userData.nama, userId: userData.id,
        createdAt: new Date().toISOString()
      });
      playSound("success");
      alert("Berhasil dikirim! Menunggu persetujuan admin.");
      onSuccess();
    } catch (err) { alert("Gagal: " + err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="px-4 pb-8">
      <p className="text-[10px] text-gray-500 mb-4">Kirim jurnal, buku, atau materi untuk perpustakaan EAS. Admin akan mereview sebelum dipublikasi.</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        {[["Judul *", "title", "Judul karya"], ["Penulis/Author *", "author", "Nama penulis"], ["Tahun", "year", "2024"], ["Link (opsional)", "link", "https://..."]].map(([lbl, key, ph]) => (
          <div key={key}>
            <label className="text-[10px] text-gray-500 uppercase mb-1 block font-bold">{lbl}</label>
            <input value={form[key]} onChange={e => setForm(f => ({...f, [key]: e.target.value}))} placeholder={ph}
              className="w-full p-3 rounded-xl text-xs text-white outline-none"
              style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${t.border}` }} />
          </div>
        ))}

        <div>
          <label className="text-[10px] text-gray-500 uppercase mb-1 block font-bold">Kategori</label>
          <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}
            className="w-full p-3 rounded-xl text-xs text-white outline-none"
            style={{ background: "rgba(0,0,0,0.6)", border: `1px solid ${t.border}` }}>
            {CATEGORIES.slice(1).map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="text-[10px] text-gray-500 uppercase mb-1 block font-bold">Deskripsi</label>
          <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} rows={3} placeholder="Deskripsi singkat..."
            className="w-full p-3 rounded-xl text-xs text-white resize-none outline-none"
            style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${t.border}` }} />
        </div>

        <div>
          <label className="text-[10px] text-gray-500 uppercase mb-1 block font-bold">Upload File (PDF/gambar)</label>
          <input type="file" accept=".pdf,.jpg,.png,.doc,.docx" onChange={e => setFile(e.target.files[0])}
            className="w-full p-3 rounded-xl text-xs text-gray-400" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${t.border}` }} />
        </div>

        <button type="submit" disabled={loading}
          className="w-full p-4 rounded-2xl font-black text-sm text-white transition"
          style={{ background: loading ? "#374151" : t.accent }}>
          {loading ? "Mengirim..." : "📤 Kirim ke Perpustakaan"}
        </button>
      </form>
    </div>
  );
};

export default Library;
