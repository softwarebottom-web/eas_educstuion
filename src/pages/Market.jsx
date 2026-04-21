import { useState, useEffect } from "react";
import { db } from "../api/config";
import { collection, getDocs, addDoc, doc, updateDoc, getDoc, setDoc, query, orderBy, onSnapshot } from "firebase/firestore";
import { ShoppingBag, Star, Gift, Plus, Trash2, Package, Clock, CheckCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { playSound } from "../component/Intro";

const ITEM_TYPES = ["Foto Antariksa", "Preset", "Buku Digital", "Badge Eksklusif", "Akses Konten", "Merchandise", "Giveaway"];

export const getPoints = async (userId) => {
  const snap = await getDoc(doc(db, "user_points", userId));
  return snap.exists() ? snap.data().total || 0 : 0;
};

export const addPoints = async (userId, nama, amount, reason) => {
  const ref = doc(db, "user_points", userId);
  const snap = await getDoc(ref);
  const current = snap.exists() ? snap.data().total || 0 : 0;
  await setDoc(ref, { userId, nama, total: current + amount, updatedAt: new Date().toISOString() }, { merge: true });
  await addDoc(collection(db, "point_history"), { userId, nama, amount, reason, createdAt: new Date().toISOString() });
};

const Market = () => {
  const [items, setItems] = useState([]);
  const [myPoints, setMyPoints] = useState(0);
  const [myOrders, setMyOrders] = useState([]);
  const [tab, setTab] = useState("market");
  const [confirmItem, setConfirmItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const userData = JSON.parse(localStorage.getItem("eas_user_data") || "{}");
  const isAdmin = ["owner","admin"].includes(userData.role);

  useEffect(() => {
    loadData();
    const unsub = onSnapshot(doc(db, "user_points", userData.id), snap => {
      if (snap.exists()) setMyPoints(snap.data().total || 0);
    });
    return () => unsub();
  }, []);

  const loadData = async () => {
    const [itemsSnap, ordersSnap] = await Promise.all([
      getDocs(query(collection(db, "market_items"), orderBy("createdAt", "desc"))),
      getDocs(collection(db, "market_orders"))
    ]);
    setItems(itemsSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(i => isAdmin || i.active));
    setMyOrders(ordersSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(o => o.userId === userData.id));
    const pts = await getPoints(userData.id);
    setMyPoints(pts);
  };

  const handleRedeem = async (item) => {
    if (myPoints < item.cost) return alert("Point tidak cukup!");
    setLoading(true);
    try {
      // Kurangi point
      const ref = doc(db, "user_points", userData.id);
      const snap = await getDoc(ref);
      const current = snap.exists() ? snap.data().total || 0 : 0;
      await updateDoc(ref, { total: current - item.cost });
      // Buat order
      await addDoc(collection(db, "market_orders"), {
        userId: userData.id, nama: userData.nama,
        itemId: item.id, itemName: item.name, itemType: item.type,
        cost: item.cost, status: "pending",
        createdAt: new Date().toISOString()
      });
      // Log history
      await addDoc(collection(db, "point_history"), {
        userId: userData.id, nama: userData.nama,
        amount: -item.cost, reason: `Redeem: ${item.name}`,
        createdAt: new Date().toISOString()
      });
      playSound("success");
      alert(`✅ Berhasil! Admin akan memproses ${item.name}`);
      setConfirmItem(null);
      loadData();
    } catch (err) { alert("Gagal: " + err.message); }
    finally { setLoading(false); }
  };

  const typeColor = {
    "Foto Antariksa": "#8b5cf6", "Preset": "#ec4899", "Buku Digital": "#3b82f6",
    "Badge Eksklusif": "#f59e0b", "Akses Konten": "#10b981", "Merchandise": "#ef4444", "Giveaway": "#a855f7"
  };

  return (
    <div className="min-h-screen pb-28" style={{ background: "linear-gradient(135deg, #0a0015 0%, #050010 50%, #0a0015 100%)" }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-lg font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
            <ShoppingBag size={20} style={{ color: "#c084fc" }} /> EAS Market
          </h1>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-900/30 border border-purple-700/30">
            <Star size={12} className="text-yellow-400" fill="#fbbf24" />
            <span className="text-sm font-black text-yellow-400">{myPoints}</span>
            <span className="text-[9px] text-gray-500">pts</span>
          </div>
        </div>
        <p className="text-[10px] text-gray-600">Tukar point dari quiz AI dengan reward eksklusif</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-5 mb-4">
        {[["market","Market"], ["orders","Pesanan Saya"], ...(isAdmin ? [["manage","Kelola"]] : [])].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold transition"
            style={{ background: tab === k ? "linear-gradient(135deg,#7c3aed,#db2777)" : "rgba(139,92,246,0.1)", color: tab === k ? "#fff" : "#6b7280" }}>
            {l}
          </button>
        ))}
      </div>

      {tab === "market" && (
        <div className="px-5 space-y-3">
          {items.length === 0 && <div className="text-center py-16"><Package size={40} className="mx-auto mb-3 text-gray-700" /><p className="text-sm text-gray-600">Belum ada item di market</p></div>}
          {items.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="p-4 rounded-3xl border" style={{ borderColor: (typeColor[item.type] || "#7c3aed") + "30", background: (typeColor[item.type] || "#7c3aed") + "08" }}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <span className="text-[9px] px-2 py-0.5 rounded-full font-bold mb-1 inline-block"
                    style={{ background: (typeColor[item.type] || "#7c3aed") + "25", color: typeColor[item.type] || "#c084fc" }}>
                    {item.type}
                  </span>
                  <h3 className="text-sm font-black text-white">{item.name}</h3>
                  <p className="text-[10px] text-gray-500 mt-0.5">{item.description}</p>
                </div>
                {item.imageUrl && <img src={item.imageUrl} className="w-16 h-16 rounded-2xl object-cover ml-3" />}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star size={13} className="text-yellow-400" fill="#fbbf24" />
                  <span className="text-sm font-black text-yellow-400">{item.cost}</span>
                  <span className="text-[9px] text-gray-600">point</span>
                </div>
                <button onClick={() => { playSound("click"); setConfirmItem(item); }}
                  disabled={myPoints < item.cost || !item.active}
                  className="px-4 py-2 rounded-xl text-xs font-black transition disabled:opacity-30"
                  style={{ background: myPoints >= item.cost ? "linear-gradient(135deg,#7c3aed,#db2777)" : "#374151", color: "#fff" }}>
                  {myPoints >= item.cost ? "Tukar" : "Point Kurang"}
                </button>
              </div>
              {item.stock !== undefined && <p className="text-[9px] text-gray-600 mt-1">Stok: {item.stock}</p>}
            </motion.div>
          ))}
        </div>
      )}

      {tab === "orders" && (
        <div className="px-5 space-y-3">
          {myOrders.length === 0 && <div className="text-center py-16"><Gift size={40} className="mx-auto mb-3 text-gray-700" /><p className="text-sm text-gray-600">Belum ada pesanan</p></div>}
          {myOrders.map(o => (
            <div key={o.id} className="p-4 rounded-2xl border border-purple-800/30 bg-purple-900/10">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xs font-bold text-white">{o.itemName}</h3>
                  <p className="text-[10px] text-gray-500">{o.itemType}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={10} className="text-yellow-400" fill="#fbbf24" />
                    <span className="text-[10px] text-yellow-400 font-bold">{o.cost} pts</span>
                  </div>
                </div>
                <span className={`text-[9px] px-2 py-1 rounded-full font-bold ${o.status === "completed" ? "bg-green-500/20 text-green-400" : o.status === "rejected" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                  {o.status === "completed" ? "✅ Selesai" : o.status === "rejected" ? "❌ Ditolak" : "⏳ Pending"}
                </span>
              </div>
              <p className="text-[9px] text-gray-700 mt-2">{new Date(o.createdAt).toLocaleString("id-ID")}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "manage" && isAdmin && <AdminMarket onRefresh={loadData} />}

      {/* Confirm Modal */}
      <AnimatePresence>
        {confirmItem && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
              className="w-full max-w-sm p-6 rounded-3xl border border-purple-700/40"
              style={{ background: "linear-gradient(135deg,#0d0020,#080015)" }}>
              <Gift size={32} className="mx-auto mb-3" style={{ color: "#c084fc" }} />
              <h3 className="text-sm font-black text-white text-center mb-1">Konfirmasi Penukaran</h3>
              <p className="text-xs text-gray-400 text-center mb-4">{confirmItem.name}</p>
              <div className="flex justify-between items-center p-3 rounded-2xl bg-purple-900/20 mb-4">
                <span className="text-xs text-gray-400">Point kamu:</span>
                <span className="text-sm font-black text-yellow-400">{myPoints} pts</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-2xl bg-purple-900/20 mb-5">
                <span className="text-xs text-gray-400">Harga:</span>
                <span className="text-sm font-black text-pink-400">-{confirmItem.cost} pts</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setConfirmItem(null)} className="flex-1 py-3 rounded-xl text-xs font-bold bg-gray-800 text-gray-400">Batal</button>
                <button onClick={() => handleRedeem(confirmItem)} disabled={loading}
                  className="flex-1 py-3 rounded-xl text-xs font-black text-white"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#db2777)" }}>
                  {loading ? "Proses..." : "Tukar Sekarang"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AdminMarket = ({ onRefresh }) => {
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", type: "Foto Antariksa", cost: 5, stock: 10, active: true });
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    const snap = await getDocs(query(collection(db, "market_orders"), orderBy("createdAt", "desc")));
    setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const createItem = async () => {
    if (!form.name) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "market_items"), { ...form, createdAt: new Date().toISOString() });
      playSound("success"); setShowForm(false); onRefresh();
    } catch (err) { alert("Gagal: " + err.message); }
    finally { setLoading(false); }
  };

  const updateOrder = async (id, status) => {
    await updateDoc(doc(db, "market_orders", id), { status, updatedAt: new Date().toISOString() });
    playSound("click"); fetchOrders();
  };

  const pending = orders.filter(o => o.status === "pending");

  return (
    <div className="px-5 space-y-4">
      <button onClick={() => setShowForm(!showForm)}
        className="w-full py-3 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2"
        style={{ background: "linear-gradient(135deg,#7c3aed,#db2777)" }}>
        <Plus size={16} /> Tambah Item Market
      </button>

      {showForm && (
        <div className="p-5 rounded-2xl border border-purple-800/30 bg-purple-900/10 space-y-3">
          {[["Nama Item","name","Nama reward"],["Deskripsi","description","Deskripsi singkat"]].map(([l,k,p]) => (
            <div key={k}>
              <label className="text-[10px] text-gray-500 uppercase mb-1 block font-bold">{l}</label>
              <input value={form[k]} onChange={e => setForm(f => ({...f,[k]:e.target.value}))} placeholder={p}
                className="w-full p-3 rounded-xl text-xs text-white outline-none bg-black/40 border border-purple-800/30" />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-gray-500 uppercase mb-1 block font-bold">Tipe</label>
              <select value={form.type} onChange={e => setForm(f => ({...f,type:e.target.value}))}
                className="w-full p-3 rounded-xl text-xs text-white outline-none bg-black/60 border border-purple-800/30">
                {ITEM_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-500 uppercase mb-1 block font-bold">Harga (pts)</label>
              <input type="number" value={form.cost} onChange={e => setForm(f => ({...f,cost:Number(e.target.value)}))} min={1}
                className="w-full p-3 rounded-xl text-xs text-white outline-none bg-black/40 border border-purple-800/30" />
            </div>
          </div>
          <button onClick={createItem} disabled={loading}
            className="w-full py-3 rounded-xl font-black text-xs text-white"
            style={{ background: "linear-gradient(135deg,#7c3aed,#db2777)" }}>
            {loading ? "Menyimpan..." : "Simpan Item"}
          </button>
        </div>
      )}

      <h3 className="text-xs font-black text-purple-400 uppercase">⏳ Pesanan Pending ({pending.length})</h3>
      {pending.map(o => (
        <div key={o.id} className="p-4 rounded-2xl border border-yellow-800/30 bg-yellow-900/10">
          <p className="text-xs font-bold text-white">{o.nama}</p>
          <p className="text-[10px] text-gray-500">{o.itemName} · {o.cost} pts</p>
          <div className="flex gap-2 mt-2">
            <button onClick={() => updateOrder(o.id, "completed")} className="flex-1 py-2 rounded-xl text-xs font-bold bg-green-500/20 text-green-400 flex items-center justify-center gap-1"><CheckCircle size={11} /> Selesai</button>
            <button onClick={() => updateOrder(o.id, "rejected")} className="flex-1 py-2 rounded-xl text-xs font-bold bg-red-500/10 text-red-400 flex items-center justify-center gap-1"><X size={11} /> Tolak</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Market;
