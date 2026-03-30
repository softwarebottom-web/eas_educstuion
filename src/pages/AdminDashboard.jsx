import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../api/config";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { Users, Trash2, ExternalLink, RefreshCcw, ShieldCheck, BookOpen } from "lucide-react";

// 🔥 IMPORT QUIZ MANAGER
import AdminQuiz from "./AdminQuiz";

const AdminDashboard = () => {
  const [listGen1, setListGen1] = useState([]);
  const [listGen2, setListGen2] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("members"); // 🔥 TAB SWITCH

  const navigate = useNavigate();

  const adminToken = localStorage.getItem("eas_admin_token");
  const activeStaff = localStorage.getItem("eas_active_staff");

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
      fetchData();
    }
  };

  useEffect(() => {
    // 🔐 VALIDASI ADMIN
    if (adminToken !== "SUPER_ADMIN_GRANTED_2026") {
      navigate("/", { replace: true });
      return;
    }

    if (!activeStaff) {
      navigate("/", { replace: true });
      return;
    }

    fetchData();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#00050d] text-white p-6 pb-32 font-mono">
      
      {/* HEADER */}
      <header className="flex justify-between items-start mb-8 border-b border-blue-900 pb-4">
        <div>
          <h1 className="text-xl font-black text-blue-500 tracking-widest italic">
            ADMIN COMMAND CENTER
          </h1>

          <div className="flex items-center gap-2 mt-2 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/30">
            <ShieldCheck size={14} className="text-blue-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              {activeStaff}
            </span>
          </div>
        </div>

        <button 
          onClick={fetchData} 
          className={`p-3 bg-gray-900 rounded-xl border border-gray-800 ${loading && 'animate-spin'}`}
        >
          <RefreshCcw size={18} />
        </button>
      </header>

      {/* 🔥 TAB NAVIGATION */}
      <div className="flex gap-2 mb-6">
        <TabButton active={tab === "members"} onClick={() => setTab("members")}>
          <Users size={14}/> Members
        </TabButton>

        <TabButton active={tab === "quiz"} onClick={() => setTab("quiz")}>
          <BookOpen size={14}/> Quiz Manager
        </TabButton>
      </div>

      {/* 🔥 TAB CONTENT */}
      {tab === "members" && (
        <>
          {/* STATS */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <StatCard title="Gen 1" value={listGen1.length} color="blue" />
            <StatCard title="Gen 2" value={listGen2.length} color="cyan" />
          </div>

          {/* GEN 1 */}
          <Section 
            title="Pendaftar Gen 1"
            data={listGen1}
            gen={1}
            color="blue"
            onDelete={deleteMember}
          />

          {/* GEN 2 */}
          <Section 
            title="Pendaftar Gen 2"
            data={listGen2}
            gen={2}
            color="cyan"
            onDelete={deleteMember}
          />
        </>
      )}

      {/* 🔥 QUIZ TAB */}
      {tab === "quiz" && <AdminQuiz />}
    </div>
  );
};



// 🔥 SUB COMPONENTS

const TabButton = ({ children, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all
      ${active 
        ? "bg-blue-600 text-white" 
        : "bg-gray-900 text-gray-400 border border-gray-800"}
    `}
  >
    {children}
  </button>
);

const StatCard = ({ title, value, color }) => (
  <div className={`p-4 rounded-2xl border ${
    color === "blue" ? "border-blue-900" : "border-cyan-900"
  }`}>
    <p className="text-[10px] uppercase text-gray-400">{title}</p>
    <h3 className="text-2xl font-black">{value}</h3>
  </div>
);

const Section = ({ title, data, gen, color, onDelete }) => (
  <section className="mb-8">
    <h2 className="text-sm font-black mb-4 uppercase tracking-widest">
      {title}
    </h2>

    <div className="space-y-3">
      {data.length > 0 ? (
        data.map(u => (
          <MemberCard key={u.id} data={u} gen={gen} onDelete={onDelete} color={color} />
        ))
      ) : (
        <p className="text-gray-600 text-xs">Belum ada data...</p>
      )}
    </div>
  </section>
);

const MemberCard = ({ data, gen, onDelete, color }) => (
  <div className="p-4 rounded-xl border bg-gray-950/50 flex justify-between items-center">
    
    <div>
      <h3 className="font-bold text-sm">{data.nama}</h3>
      <p className="text-xs text-gray-500">
        {data.domisili} • {data.umur} THN
      </p>
    </div>

    <div className="flex gap-2">
      <a 
        href={`https://tiktok.com/@${data.tiktok}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 bg-gray-900 rounded-lg"
      >
        <ExternalLink size={14} />
      </a>

      <button 
        onClick={() => onDelete(data.id, gen)}
        className="p-2 bg-red-900/40 text-red-400 rounded-lg"
      >
        <Trash2 size={14} />
      </button>
    </div>
  </div>
);

export default AdminDashboard;