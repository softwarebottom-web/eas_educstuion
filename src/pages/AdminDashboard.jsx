import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../api/config";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { Users, Trash2, ExternalLink, RefreshCcw, ShieldCheck, BookOpen, LogOut } from "lucide-react";
import AdminQuiz from "./AdminQuiz";

const AdminDashboard = () => {
  const [listGen1, setListGen1] = useState([]);
  const [listGen2, setListGen2] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("members");
  const [activeStaff, setActiveStaff] = useState(null);
  const [role, setRole] = useState(null);

  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "users"));

      const users = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data()
      }));

      const sortFn = (a, b) =>
        new Date(b.system?.createdAt) - new Date(a.system?.createdAt);

      setListGen1(users.filter((u) => u.public?.gen === 1).sort(sortFn).slice(0, 100));
      setListGen2(users.filter((u) => u.public?.gen === 2).sort(sortFn).slice(0, 100));

    } catch (err) {
      console.error(err);
      alert("Gagal ambil data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("eas_admin_token");
    const adminId = localStorage.getItem("eas_admin_id"); // ✅ fix key
    const roleLS = localStorage.getItem("eas_admin_role");
    const expire = localStorage.getItem("eas_admin_expire");

    if (!token || !adminId || !roleLS) {
      navigate("/", { replace: true });
      return;
    }

    if (!expire || Date.now() > Number(expire)) {
      localStorage.clear();
      navigate("/", { replace: true });
      return;
    }

    setActiveStaff(adminId);
    setRole(roleLS);
    fetchData();
  }, [navigate]);

  const deleteMember = async (id) => {
    // ✅ fix: sesuai role yang ada
    if (!["owner", "admin", "moderator"].includes(role)) {
      alert("Tidak punya akses!");
      return;
    }

    if (!window.confirm("Hapus member ini?")) return;

    try {
      await deleteDoc(doc(db, "users", id));
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Gagal hapus");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/", { replace: true });
  };

  if (!activeStaff) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#00050d] text-red-500 font-bold">
        Unauthorized Access
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#00050d] text-blue-500 font-bold">
        Loading Admin Panel...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#00050d] text-white p-6 pb-32 font-mono">

      <header className="flex justify-between mb-8 border-b border-blue-900 pb-4">
        <div>
          <h1 className="text-xl font-black text-blue-500">
            ADMIN COMMAND CENTER
          </h1>
          <div className="flex gap-2 mt-2 text-xs text-blue-300">
            <ShieldCheck size={14} />
            {role?.toUpperCase()}
          </div>
        </div>

        <div className="flex gap-3 items-center">
          <button onClick={fetchData} className="text-gray-400 hover:text-white">
            <RefreshCcw size={18} />
          </button>
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-400">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div className="flex gap-4 mb-6">
        <TabButton active={tab === "members"} onClick={() => setTab("members")}>
          <Users size={14} /> Members
        </TabButton>
        <TabButton active={tab === "quiz"} onClick={() => setTab("quiz")}>
          <BookOpen size={14} /> Quiz
        </TabButton>
      </div>

      {tab === "members" && (
        <>
          <div className="flex gap-4 mb-6 text-xs text-gray-400">
            <span>Gen 1: <span className="text-blue-400 font-bold">{listGen1.length}</span></span>
            <span>Gen 2: <span className="text-blue-400 font-bold">{listGen2.length}</span></span>
            <span>Total: <span className="text-white font-bold">{listGen1.length + listGen2.length}</span></span>
          </div>

          <Section title="GEN 1" data={listGen1} onDelete={deleteMember} role={role} />
          <Section title="GEN 2" data={listGen2} onDelete={deleteMember} role={role} />
        </>
      )}

      {tab === "quiz" && <AdminQuiz />}
    </div>
  );
};

const TabButton = ({ children, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition
      ${active ? "bg-blue-600 text-white" : "bg-gray-900 text-gray-500 hover:text-white"}`}
  >
    {children}
  </button>
);

const Section = ({ title, data, onDelete, role }) => (
  <div className="mb-8">
    <h2 className="text-xs font-black text-gray-500 uppercase mb-3 tracking-widest">
      {title} — {data.length} members
    </h2>

    {data.length === 0 && (
      <p className="text-xs text-gray-700">Tidak ada member</p>
    )}

    {data.map((u) => (
      <MemberCard key={u.id} data={u} onDelete={onDelete} role={role} />
    ))}
  </div>
);

const MemberCard = ({ data, onDelete, role }) => {
  const pub = data.public || {};
  const sys = data.system || {};

  return (
    <div className="flex justify-between items-center p-4 border border-gray-800 rounded-2xl mb-2 bg-white/5 hover:bg-white/10 transition">

      <div className="flex gap-3 items-center">
        {/* Avatar placeholder kalau tidak ada foto */}
        <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center text-xs font-black text-blue-300">
          {pub.nama?.charAt(0)?.toUpperCase() || "?"}
        </div>

        <div>
          <div className="text-xs font-bold text-white">{pub.nama}</div>
          <div className="text-[10px] text-blue-400">{pub.memberId}</div>
          <div className="text-[10px] text-gray-500">
            {pub.domisili} • {pub.umur} thn
          </div>
          <div className={`text-[9px] mt-1 font-bold ${sys.verified ? "text-green-500" : "text-yellow-500"}`}>
            {sys.verified ? "✓ VERIFIED" : "⏳ PENDING"}
          </div>
        </div>
      </div>

      <div className="flex gap-3 items-center">
        {pub.tiktok && (
          <a
            href={pub.tiktok}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-white"
          >
            <ExternalLink size={14} />
          </a>
        )}

        {/* ✅ fix: owner, admin, moderator bisa delete */}
        {["owner", "admin", "moderator"].includes(role) && (
          <button
            onClick={() => onDelete(data.id)}
            className="text-gray-600 hover:text-red-500 transition"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
