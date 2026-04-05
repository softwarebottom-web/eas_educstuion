import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../api/config";

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
  // 🔥 FETCH USERS (NEW SYSTEM)
  // =========================
  const fetchData = async () => {
    setLoading(true);

    try {
      const snapshot = await getDocs(collection(db, "users"));

      const users = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data()
      }));

      // 🔥 SPLIT GEN
      const gen1 = users.filter((u) => u.public?.gen === 1);
      const gen2 = users.filter((u) => u.public?.gen === 2);

      const sortFn = (a, b) =>
        new Date(b.system?.createdAt) - new Date(a.system?.createdAt);

      setListGen1(gen1.sort(sortFn).slice(0, 100));
      setListGen2(gen2.sort(sortFn).slice(0, 100));

    } catch (err) {
      console.error(err);
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

    setActiveStaff(staff);
    setRole(roleLS);

    fetchData();
  }, [navigate]);

  // =========================
  // 🗑 DELETE USER
  // =========================
  const deleteMember = async (id) => {
    if (!["admin", "superadmin"].includes(role)) {
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

  // =========================
  // 🔓 LOGOUT
  // =========================
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

      {/* HEADER */}
      <header className="flex justify-between mb-8 border-b border-blue-900 pb-4">
        <div>
          <h1 className="text-xl font-black text-blue-500">
            ADMIN COMMAND CENTER
          </h1>

          <div className="flex gap-2 mt-2 text-xs text-blue-300">
            <ShieldCheck size={14} />
            {activeStaff} ({role})
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={fetchData}>
            <RefreshCcw size={18} />
          </button>

          <button onClick={handleLogout}>
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

      {/* MEMBERS */}
      {tab === "members" && (
        <>
          <StatCard title="Gen 1" value={listGen1.length} />
          <StatCard title="Gen 2" value={listGen2.length} />

          <Section title="Gen 1" data={listGen1} onDelete={deleteMember} role={role} />
          <Section title="Gen 2" data={listGen2} onDelete={deleteMember} role={role} />
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
  <button onClick={onClick} className={active ? "text-blue-400" : "text-gray-500"}>
    {children}
  </button>
);

const StatCard = ({ title, value }) => (
  <div className="mb-4">
    {title}: {value}
  </div>
);

const Section = ({ title, data, onDelete, role }) => (
  <div>
    <h2>{title}</h2>

    {data.map((u) => (
      <MemberCard key={u.id} data={u} onDelete={onDelete} role={role} />
    ))}
  </div>
);

const MemberCard = ({ data, onDelete, role }) => {
  const pub = data.public || {};

  return (
    <div className="flex justify-between p-3 border mb-2">

      <div className="flex gap-3">
        <img src={pub.photo} className="w-10 h-10 rounded-full" />

        <div>
          <div>{pub.nama}</div>
          <div>{pub.memberId}</div>
          <div>{pub.domisili} • {pub.umur}</div>
        </div>
      </div>

      <div className="flex gap-2">
        <a href={pub.tiktok} target="_blank">
          <ExternalLink size={14} />
        </a>

        {(role === "admin" || role === "superadmin") && (
          <button onClick={() => onDelete(data.id)}>
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
