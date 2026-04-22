import { useState, useEffect, useRef } from "react";
import { db, supabaseMedia } from "../api/config";
import { collection, addDoc, getDocs, query, orderBy, doc, updateDoc, deleteDoc, getDoc } from "firebase/firestore";
import { BookOpen, Search, Upload, Filter, ExternalLink, Trash2, CheckCircle, Clock, FileText, Film, Image, Download, X, Plus, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { playSound } from "../component/Intro";

const glass = (opacity = 0.08, border = "rgba(120,80,220,0.2)") => ({
  background: `rgba(12,5,28,${opacity})`,
  backdropFilter: "blur(20px) saturate(1.8)",
  WebkitBackdropFilter: "blur(20px) saturate(1.8)",
  border: `1px solid ${border}`,
  boxShadow: "0 8px 32px rgba(80,40,180,0.12), inset 0 1px 0 rgba(255,255,255,0.05)",
});

const CATEGORIES = ["Semua","Jurnal","Buku","Artikel","Paper","Materi EAS","Video","Lainnya"];
const CAT_COLORS = {
  "Jurnal":"#a855f7","Buku":"#3b82f6","Artikel":"#10b981","Paper":"#f59e0b",
  "Materi EAS":"#ec4899","Video":"#ef4444","Lainnya":"#6b7280","Semua":"#38bdf8"
};

const getFileIcon = (type, url) => {
  if (type?.includes("video") || url?.includes(".mp4")) return <Film size={16} className="text-red-400"/>;
  if (type?.includes("image") || url?.match(/\.(jpg|png|webp|gif)/i)) return <Image size={16} className="text-green-400"/>;
  return <FileText size={16} className="text-purple-400"/>;
};

// ── MAIN ─────────────────────────────────
const Library = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("Semua");
  const [tab, setTab] = useState("browse"); // browse | submit
  const [showFilter, setShowFilter] = useState(false);
  const [sortBy, setSortBy] = useState("newest"); // newest | oldest | title | category
  const userData = JSON.parse(localStorage.getItem("eas_user_data") || "{}");
  const isAdmin = ["admin","owner","moderator"].includes(userData.role);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, "library"), orderBy("createdAt","desc")));
      const all = snap.docs.map(d => ({ id:d.id, ...d.data() }));
      setItems(isAdmin ? all : all.filter(i => i.approved));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const approve = async (id) => {
    await updateDoc(doc(db,"library",id), { approved:true });
    playSound("success"); fetchItems();
  };
  const remove = async (id) => {
    if (!confirm("Hapus item ini?")) return;
    await deleteDoc(doc(db,"library",id));
    playSound("click"); fetchItems();
  };

  const sorted = [...items]
    .filter(i => {
      const matchCat = cat === "Semua" || i.category === cat;
      const matchQ = !search || i.title?.toLowerCase().includes(search.toLowerCase()) ||
        i.author?.toLowerCase().includes(search.toLowerCase()) ||
        i.description?.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchQ;
    })
    .sort((a,b) => {
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "title") return (a.title||"").localeCompare(b.title||"");
      if (sortBy === "category") return (a.category||"").localeCompare(b.category||"");
      return new Date(b.createdAt) - new Date(a.createdAt); // newest
    });

  return (
    <div className="min-h-screen pb-28 text-white"
      style={{ background: "linear-gradient(135deg,#06010f 0%,#0a0218 40%,#060115 100%)" }}>

      {/* Ambient */}
      <div className="fixed top-0 left-1/3 w-64 h-64 rounded-full pointer-events-none opacity-20"
        style={{ background:"radial-gradient(circle,#7c3aed30,transparent 70%)", filter:"blur(60px)", zIndex:0 }}/>

      {/* ── HEADER ── */}
      <div className="sticky top-0 z-20 px-4 pt-5 pb-3" style={{ background:"rgba(6,1,15,0.85)", backdropFilter:"blur(20px)" }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-base font-black bg-gradient-to-r from-purple-400 to-sky-400 bg-clip-text text-transparent flex items-center gap-2">
              <BookOpen size={18} style={{ color:"#a855f7" }} /> Perpustakaan EAS
            </h1>
            <p className="text-[9px] text-gray-500 mt-0.5">{items.filter(i=>i.approved).length} karya tersedia</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { playSound("click"); setShowFilter(!showFilter); }}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition"
              style={{ background:showFilter?"rgba(168,85,247,0.3)":"rgba(255,255,255,0.05)", color:showFilter?"#a855f7":"#6b7280", border:"1px solid rgba(168,85,247,0.2)" }}>
              <Filter size={14}/>
            </button>
            <button onClick={() => { playSound("nav"); setTab(tab==="browse"?"submit":"browse"); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition"
              style={{ background:"linear-gradient(135deg,#7c3aed,#2563eb)", color:"#fff" }}>
              {tab==="browse" ? <><Plus size={12}/>Kirim</> : <><BookOpen size={12}/>Jelajahi</>}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-2">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari judul, penulis, deskripsi..."
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl text-xs text-white outline-none"
            style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(168,85,247,0.2)" }}/>
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"><X size={12}/></button>}
        </div>

        {/* Category chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => { playSound("click"); setCat(c); }}
              className="flex-shrink-0 px-3 py-1 rounded-full text-[9px] font-black transition-all"
              style={{
                background: cat===c ? CAT_COLORS[c]+"30" : "rgba(255,255,255,0.04)",
                border: `1px solid ${cat===c ? CAT_COLORS[c]+"60" : "rgba(255,255,255,0.06)"}`,
                color: cat===c ? CAT_COLORS[c] : "#6b7280"
              }}>
              {c}
            </button>
          ))}
        </div>

        {/* Filter panel */}
        <AnimatePresence>
          {showFilter && (
            <motion.div initial={{ opacity:0,height:0 }} animate={{ opacity:1,height:"auto" }} exit={{ opacity:0,height:0 }}
              className="overflow-hidden mt-2">
              <div className="p-3 rounded-2xl" style={glass(0.1,"rgba(168,85,247,0.2)")}>
                <p className="text-[9px] text-gray-500 uppercase font-black mb-2">Urutkan</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {[["newest","Terbaru"],["oldest","Terlama"],["title","Judul A-Z"],["category","Kategori"]].map(([k,l]) => (
                    <button key={k} onClick={() => { setSortBy(k); playSound("click"); }}
                      className="py-1.5 rounded-xl text-[9px] font-bold transition"
                      style={{ background:sortBy===k?"rgba(168,85,247,0.3)":"rgba(255,255,255,0.04)", color:sortBy===k?"#a855f7":"#6b7280", border:`1px solid ${sortBy===k?"rgba(168,85,247,0.4)":"transparent"}` }}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── CONTENT ── */}
      <div className="px-4 relative z-10">
        {tab === "browse" ? (
          <BrowseView items={sorted} loading={loading} search={search} cat={cat} isAdmin={isAdmin} onApprove={approve} onRemove={remove} />
        ) : (
          <SubmitView userData={userData} onSuccess={() => { setTab("browse"); fetchItems(); }} />
        )}
      </div>
    </div>
  );
};

// ── BROWSE ────────────────────────────────
const BrowseView = ({ items, loading, search, cat, isAdmin, onApprove, onRemove }) => {
  const [expanded, setExpanded] = useState(null);

  if (loading) return (
    <div className="flex flex-col items-center py-16 gap-3">
      <motion.div animate={{ rotate:360 }} transition={{ duration:2,repeat:Infinity,ease:"linear" }}>
        <BookOpen size={32} className="text-purple-500"/>
      </motion.div>
      <p className="text-xs text-gray-500">Memuat perpustakaan...</p>
    </div>
  );

  if (items.length === 0) return (
    <div className="flex flex-col items-center py-16 gap-3">
      <BookOpen size={40} className="text-gray-700"/>
      <p className="text-sm text-gray-600 font-bold">Tidak ada hasil</p>
      {search && <p className="text-xs text-gray-700">Coba kata kunci lain</p>}
    </div>
  );

  return (
    <div className="space-y-3 pt-2">
      <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">{items.length} hasil ditemukan</p>
      {items.map((item,i) => {
        const isExp = expanded === item.id;
        const catColor = CAT_COLORS[item.category] || "#6b7280";
        return (
          <motion.div key={item.id} initial={{ opacity:0,y:15 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.04 }}
            className="rounded-3xl overflow-hidden transition-all"
            style={glass(0.08, catColor+"20")}>

            {/* Main row */}
            <button className="w-full p-4 text-left" onClick={() => { playSound("open"); setExpanded(isExp?null:item.id); }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background:catColor+"20" }}>
                  {getFileIcon(item.type, item.fileUrl)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[8px] px-2 py-0.5 rounded-full font-black"
                      style={{ background:catColor+"20", color:catColor }}>{item.category}</span>
                    {!item.approved && <span className="text-[8px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">⏳ Pending</span>}
                  </div>
                  <h3 className="text-xs font-black text-white leading-tight mb-0.5 line-clamp-2">{item.title}</h3>
                  <p className="text-[9px] text-gray-500">{item.author}{item.year ? ` · ${item.year}` : ""}</p>
                </div>
                <ChevronDown size={14} className="text-gray-600 flex-shrink-0 mt-1 transition-transform"
                  style={{ transform:isExp?"rotate(180deg)":"none" }}/>
              </div>
            </button>

            {/* Expanded */}
            <AnimatePresence>
              {isExp && (
                <motion.div initial={{ height:0,opacity:0 }} animate={{ height:"auto",opacity:1 }} exit={{ height:0,opacity:0 }}
                  className="overflow-hidden">
                  <div className="px-4 pb-4 space-y-3">
                    {item.description && (
                      <p className="text-[10px] text-gray-400 leading-relaxed">{item.description}</p>
                    )}
                    <p className="text-[9px] text-gray-600">Dikirim oleh <span className="text-gray-400">{item.submittedBy}</span> · {new Date(item.createdAt).toLocaleDateString("id-ID",{dateStyle:"long"})}</p>

                    <div className="flex gap-2">
                      {item.fileUrl && (
                        <a href={item.fileUrl} target="_blank" rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition"
                          style={{ background:"linear-gradient(135deg,#7c3aed,#2563eb)", color:"#fff" }}
                          onClick={() => playSound("click")}>
                          <ExternalLink size={13}/> Buka / Unduh
                        </a>
                      )}
                      {isAdmin && !item.approved && (
                        <button onClick={() => onApprove(item.id)}
                          className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-green-500/20 text-green-400">
                          <CheckCircle size={13}/> Approve
                        </button>
                      )}
                      {isAdmin && (
                        <button onClick={() => onRemove(item.id)}
                          className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-red-500/10 text-red-400">
                          <Trash2 size={13}/>
                        </button>
                      )}
                    </div>
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

// ── SUBMIT ────────────────────────────────
const SubmitView = ({ userData, onSuccess }) => {
  const [form, setForm] = useState({ title:"", author:"", year:"", category:"Jurnal", description:"", link:"" });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (f) => {
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { alert("Max 10MB"); return; }
    setFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.author) return alert("Isi judul dan penulis!");
    setLoading(true);
    try {
      let fileUrl = form.link || null;
      if (file) {
        const fname = `library/${Date.now()}_${file.name}`;
        const { error } = await supabaseMedia.storage.from("eas-library").upload(fname, file);
        if (error) throw new Error("Upload gagal: " + error.message);
        const { data } = supabaseMedia.storage.from("eas-library").getPublicUrl(fname);
        fileUrl = data.publicUrl;
      }
      if (!fileUrl) return alert("Upload file atau masukkan link!");

      await addDoc(collection(db,"library"), {
        ...form, fileUrl, type: file?.type || "link",
        approved: false, submittedBy: userData.nama,
        userId: userData.id, createdAt: new Date().toISOString()
      });
      playSound("success");
      alert("✅ Berhasil dikirim! Admin akan mereview sebelum dipublikasi.");
      onSuccess();
    } catch (err) { alert("Gagal: " + err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="pt-3 pb-4">
      <div className="rounded-3xl p-5 mb-4" style={{ background:"rgba(12,5,28,0.8)", border:"1px solid rgba(120,80,220,0.2)" }}>
        <h2 className="text-sm font-black text-white mb-1 flex items-center gap-2">
          <Plus size={16} style={{ color:"#a855f7" }}/> Kirim Karya
        </h2>
        <p className="text-[9px] text-gray-500">Admin akan mereview sebelum dipublikasi ke perpustakaan.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Drag-drop file */}
        <div className={`rounded-3xl p-5 border-2 border-dashed text-center transition-all cursor-pointer ${dragOver?"border-purple-500 bg-purple-500/10":"border-purple-900/40"}`}
          onDragOver={e=>{e.preventDefault();setDragOver(true);}} onDragLeave={()=>setDragOver(false)}
          onDrop={e=>{e.preventDefault();setDragOver(false);handleFile(e.dataTransfer.files[0]);}}
          onClick={() => document.getElementById("lib-file-input").click()}>
          <Upload size={24} className="mx-auto mb-2 text-purple-500 opacity-60"/>
          {file ? (
            <div>
              <p className="text-xs font-bold text-white">{file.name}</p>
              <p className="text-[9px] text-gray-500">{(file.size/1024/1024).toFixed(1)} MB</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-400 font-bold">Drop file di sini</p>
              <p className="text-[9px] text-gray-600">PDF, DOC, JPG, MP4 · Max 10MB</p>
            </>
          )}
          <input id="lib-file-input" type="file" className="hidden" accept=".pdf,.doc,.docx,.jpg,.png,.mp4,.txt"
            onChange={e => handleFile(e.target.files[0])}/>
        </div>

        <div className="text-center text-[9px] text-gray-600">— atau —</div>

        {/* Fields */}
        {[["Judul *","title","Judul karya/buku/artikel"],["Penulis/Author *","author","Nama penulis atau institusi"],["Tahun Terbit","year","2024"],["Link (jika ada)","link","https://..."]].map(([l,k,p]) => (
          <div key={k}>
            <label className="text-[9px] text-gray-500 uppercase font-black mb-1 block">{l}</label>
            <input value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} placeholder={p}
              className="w-full p-3 rounded-2xl text-xs text-white outline-none"
              style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(168,85,247,0.2)" }}/>
          </div>
        ))}

        <div>
          <label className="text-[9px] text-gray-500 uppercase font-black mb-1 block">Kategori</label>
          <div className="grid grid-cols-3 gap-1.5">
            {CATEGORIES.slice(1).map(c => (
              <button type="button" key={c} onClick={() => setForm(f=>({...f,category:c}))}
                className="py-2 rounded-xl text-[9px] font-bold transition"
                style={{ background:form.category===c?CAT_COLORS[c]+"25":"rgba(255,255,255,0.04)", color:form.category===c?CAT_COLORS[c]:"#6b7280", border:`1px solid ${form.category===c?CAT_COLORS[c]+"40":"transparent"}` }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[9px] text-gray-500 uppercase font-black mb-1 block">Deskripsi Singkat</label>
          <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={3}
            placeholder="Gambaran singkat tentang karya ini..."
            className="w-full p-3 rounded-2xl text-xs text-white resize-none outline-none"
            style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(168,85,247,0.2)" }}/>
        </div>

        <button type="submit" disabled={loading}
          className="w-full p-4 rounded-2xl font-black text-sm text-white transition"
          style={{ background:loading?"#374151":"linear-gradient(135deg,#7c3aed,#2563eb)" }}>
          {loading ? "Mengirim..." : "📚 Kirim ke Perpustakaan"}
        </button>
      </form>
    </div>
  );
};

export default Library;
