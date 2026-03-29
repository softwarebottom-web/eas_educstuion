import { useEffect, useState } from "react";
import { db } from "../api/config";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { Users, Trash2, ExternalLink, RefreshCcw, ShieldCheck } from "lucide-react";

const AdminDashboard = () => {
  const [listGen1, setListGen1] = useState([]);
  const [listGen2, setListGen2] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Ambil nama staff yang aktif login
  const activeStaff = localStorage.getItem("eas_active_staff") || "Staff";

  const fetchData = async () => {
    setLoading(true);
    try {
      const res1 = await getDocs(collection(db, "pendaftaran_eas_gen1"));
      const res2 = await getDocs(collection(db, "pendaftaran_eas_gen2"));
      setListGen1(res1.docs.map(d => ({ id: d.id, ...d.data() })));
      setListGen2(res2.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Gagal ambil data:", err);
    }
    setLoading(false);
  };

  const deleteMember = async (id, gen) => {
    if (window.confirm("Hapus pendaftar ini secara permanen?")) {
      await deleteDoc(doc(db, `pendaftaran_eas_gen${gen}`, id));
      fetchData(); // Refresh data
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="min-h-screen bg-[#00050d] text-white p-6 pb-32 font-mono">
      {/* HEADER & STAFF INFO */}
      <header className="flex justify-between items-start mb-10 border-b border-blue-900 pb-6">
        <div>
          <h1 className="text-2xl font-black text-blue-500 tracking-[0.2em] italic">COMMAND CENTER</h1>
          <div className="flex items-center gap-2 mt-2 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/30">
            <ShieldCheck size={14} className="text-blue-400" />
            <span className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">Active: {activeStaff}</span>
          </div>
        </div>
        <button 
          onClick={fetchData} 
          className={`p-3 bg-gray-900 rounded-xl border border-gray-800 ${loading && 'animate-spin'}`}
        >
          <RefreshCcw size={18} />
        </button>
      </header>

      {/* STATS SUMMARY */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="bg-blue-950/20 p-4 rounded-2xl border border-blue-900 shadow-lg shadow-blue-900/10">
          <p className="text-[10px] text-blue-400 font-bold uppercase mb-1">Total Gen 1</p>
          <h3 className="text-3xl font-black">{listGen1.length}</h3>
        </div>
        <div className="bg-cyan-950/20 p-4 rounded-2xl border border-cyan-900 shadow-lg shadow-cyan-900/10">
          <p className="text-[10px] text-cyan-400 font-bold uppercase mb-1">Total Gen 2</p>
          <h3 className="text-3xl font-black">{listGen2.length}</h3>
        </div>
      </div>

      {/* SECTION GEN 1 */}
      <section className="mb-12">
        <h2 className="flex items-center gap-2 text-sm font-black text-blue-500 mb-6 tracking-widest uppercase">
          <Users size={16}/> Pendaftar Gen 1
        </h2>
        <div className="space-y-4">
          {listGen1.length > 0 ? (
            listGen1.map(u => <MemberCard key={u.id} data={u} gen={1} onDelete={deleteMember} color="blue" />)
          ) : <p className="text-[10px] text-gray-600 italic">Belum ada data...</p>}
        </div>
      </section>

      {/* SECTION GEN 2 */}
      <section>
        <h2 className="flex items-center gap-2 text-sm font-black text-cyan-500 mb-6 tracking-widest uppercase">
          <Users size={16}/> Pendaftar Gen 2
        </h2>
        <div className="space-y-4">
          {listGen2.length > 0 ? (
            listGen2.map(u => <MemberCard key={u.id} data={u} gen={2} onDelete={deleteMember} color="cyan" />)
          ) : <p className="text-[10px] text-gray-600 italic">Belum ada data...</p>}
        </div>
      </section>
    </div>
  );
};

const MemberCard = ({ data, gen, onDelete, color }) => (
  <div className={`p-4 rounded-2xl border bg-gray-950/50 flex justify-between items-center transition-all ${color === 'blue' ? 'border-blue-900 shadow-blue-900/10 shadow-lg' : 'border-cyan-900 shadow-cyan-900/10 shadow-lg'}`}>
    <div className="space-y-1">
      <h3 className={`font-black text-sm uppercase tracking-tighter ${color === 'blue' ? 'text-blue-400' : 'text-cyan-400'}`}>
        {data.nama}
      </h3>
      <div className="text-[10px] text-gray-500 flex items-center gap-2">
        <span>{data.domisili}</span>
        <span className="opacity-30">|</span>
        <span>{data.umur} THN</span>
      </div>
      <p className="text-[9px] text-gray-600 mt-2 font-mono">UID: {data.id.slice(0, 8)}</p>
    </div>

    <div className="flex gap-2">
      <a 
        href={`https://tiktok.com/@${data.tiktok}`} 
        target="_blank" 
        className="p-2 bg-gray-900 text-white rounded-lg border border-gray-800 hover:bg-white hover:text-black transition-colors"
      >
        <ExternalLink size={14} />
      </a>
      <button 
        onClick={() => onDelete(data.id, gen)}
        className="p-2 bg-red-950/30 text-red-500 rounded-lg border border-red-900 hover:bg-red-600 hover:text-white transition-all"
      >
        <Trash2 size={14} />
      </button>
    </div>
  </div>
);

export default AdminDashboard;
