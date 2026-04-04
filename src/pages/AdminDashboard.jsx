import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../api/config";
import { STAFF_LIST } from "../api/staff";

import {
  collection,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore";

import {
  Users,
  Trash2,
  ExternalLink,
  RefreshCcw,
  ShieldCheck,
  BookOpen,
  LogOut
} from "lucide-react";

import AdminQuiz from "./AdminQuiz";

const AdminDashboard = () => {
  const [listGen1, setListGen1] = useState([]);
  const [listGen2, setListGen2] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("members");

  const [activeStaff, setActiveStaff] = useState(null);
  const [role, setRole] = useState(null);

  const navigate = useNavigate();

  // =========================
  // 🔥 FETCH DATA
  // =========================
  const fetchData = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const [res1, res2] = await Promise.all([
        getDocs(collection(db, "pendaftaran_eas_gen1")),
        getDocs(collection(db, "pendaftaran_eas_gen2"))
      ]);

      const mapData = (snap) =>
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setListGen1(mapData(res1).slice(0, 100));
      setListGen2(mapData(res2).slice(0, 100));

    } catch (err) {
      console.error("Fetch error:", err);
      alert("Gagal ambil data");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // 🔐 AUTH CHECK
  // =========================
  useEffect(() => {
    const token = localStorage.getItem("eas_admin_token");
    const staff = localStorage.getItem("eas_active_staff");
    const roleLS = localStorage.getItem("eas_admin_role");
    const expire = localStorage.getItem("eas_admin_expire");

    if (!token || !staff || !roleLS) {
      navigate("/", { replace: true });
      return;
    }

    if (!expire || Date.now() > Number(expire)) {
      localStorage.clear();
      navigate("/", { replace: true });
      return;
    }

    // 🔥 VALIDASI KE STAFF.JS
    const valid = STAFF_LIST.find(
      (s) =>
        s.nickname.toLowerCase() === staff.toLowerCase() &&
        s.role === roleLS
    );

    if (!valid) {
      localStorage.clear();
      navigate("/", { replace: true });
      return;
    }

    setActiveStaff(valid.nickname);
    setRole(valid.role);

    fetchData();
  }, [navigate]);

  // =========================
  // 🗑 DELETE MEMBER
  // =========================
  const deleteMember = async (id, gen) => {
    if (!["admin", "superadmin"].includes(role)) {
      alert("Tidak punya akses!");
      return;
    }

    if (!window.confirm("Hapus member ini?")) return;

    try {
      await deleteDoc(doc(db, `pendaftaran_eas_gen${gen}`, id));
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Gagal hapus");
    }
  };

  // =========================
  // 🔓 LOGOUT
  // =========================
  const handleLogout = () => {
    if (window.confirm("Keluar dari admin?")) {
      localStorage.clear();
      navigate("/", { replace: true });
    }
  };

  // =========================
  // ❌ UNAUTHORIZED
  // =========================
  if (!activeStaff) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#00050d] text-red-500 font-bold">
        Unauthorized Access
      </div>
    );
  }

  // =========================
  // ⏳ LOADING
  // =========================
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#00050d] text-blue-500 font-bold">
        Loading Admin Panel...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#00050d] text-white p-6 pb-32 font-mono">

      {/* HEADER */}
      <header className="flex justify-between items-start mb-8 border-b border-blue-900 pb-4">
        <div>
          <h1 className="text-xl font-black text-blue-500 tracking-widest italic">
            ADMIN COMMAND CENTER
          </h1>

          <div className="flex items-center gap-2 mt-2 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/30">
            <ShieldCheck size={14} />
            <span className="text-[10px] font-bold uppercase">
              {activeStaff}
            </span>
            <span className="text-[10px] text-blue-300 uppercase">
              ({role})
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchData}
            className="p-3 bg-gray-900 rounded-xl border border-gray-800"
          >
            <RefreshCcw size={18} />
          </button>

          <button
            onClick={handleLogout}
            className="p-3 bg-red-900/20 text-red-400 rounded-xl border border-red-900"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* TAB */}
      <div className="flex gap-2 mb-6">
        <TabButton active={tab === "members"} onClick={() => setTab("members")}>
          <Users size={14} /> Members
        </TabButton>

        <TabButton active={tab === "quiz"} onClick={() => setTab("quiz")}>
          <BookOpen size={14} /> Quiz
        </TabButton>
      </div>

      {/* CONTENT */}
      {tab === "members" && (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <StatCard title="Gen 1" value={listGen1.length} />
            <StatCard title="Gen 2" value={listGen2.length} />
          </div>

          <Section title="Gen 1" data={listGen1} gen={1} onDelete={deleteMember} role={role} />
          <Section title="Gen 2" data={listGen2} gen={2} onDelete={deleteMember} role={role} />
        </>
      )}

      {tab === "quiz" && <AdminQuiz />}
    </div>
  );
};

// =========================
// COMPONENTS
// =========================

const TabButton = ({ children, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase
    ${active ? "bg-blue-600 text-white" : "bg-gray-900 text-gray-400 border border-gray-800"}`}
  >
    {children}
  </button>
);

const StatCard = ({ title, value }) => (
  <div className="p-4 rounded-2xl border border-blue-900">
    <p className="text-[10px] text-gray-400 uppercase">{title}</p>
    <h3 className="text-2xl font-black">{value}</h3>
  </div>
);

const Section = ({ title, data, gen, onDelete, role }) => (
  <section className="mb-8">
    <h2 className="text-sm font-black mb-4 uppercase">{title}</h2>

    <div className="space-y-3">
      {data.length > 0 ? (
        data.map((u) => (
          <MemberCard key={u.id} data={u} gen={gen} onDelete={onDelete} role={role} />
        ))
      ) : (
        <p className="text-gray-600 text-xs">Kosong</p>
      )}
    </div>
  </section>
);

const MemberCard = ({ data, gen, onDelete, role }) => (
  <div className="p-4 rounded-xl border bg-gray-950/50 flex justify-between items-center">

    <div className="flex items-center gap-3">
      <img
        src={data.photo}
        alt="profile"
        className="w-10 h-10 rounded-full object-cover border border-gray-700"
      />

      <div>
        <h3 className="font-bold text-sm">{data.nama}</h3>

        <p className="text-[10px] text-blue-400 font-mono">
          {data.memberId || "NO-ID"}
        </p>

        <p className="text-xs text-gray-500">
          {data.domisili} • {data.umur} THN
        </p>
      </div>
    </div>

    <div className="flex gap-2">
      <a
        href={data.tiktok}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 bg-gray-900 rounded-lg"
      >
        <ExternalLink size={14} />
      </a>

      {(role === "admin" || role === "superadmin") && (
        <button
          onClick={() => onDelete(data.id, gen)}
          className="p-2 bg-red-900/40 text-red-400 rounded-lg"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  </div>
);

export default AdminDashboard;
