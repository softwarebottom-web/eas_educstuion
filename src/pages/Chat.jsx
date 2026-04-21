import { useState, useEffect, useRef } from "react";
import { db } from "../api/config";
import { collection, addDoc, onSnapshot, query, orderBy, limit, serverTimestamp } from "firebase/firestore";
import { MessageCircle, Flame, Coffee, Send, Link2, Users, Reply, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { playSound } from "../component/Intro";

const PURPLE = { accent: "#a855f7", accent2: "#ec4899", border: "rgba(168,85,247,0.2)", bg: "linear-gradient(135deg,#0a0015,#050010)" };

const ROOMS = [
  { id:"debate", name:"Debat", icon:Flame, color:"#ef4444", desc:"Argumentasi ilmiah dengan referensi · Max 4 peserta aktif", requireRef:true },
  { id:"chill", name:"Chill", icon:Coffee, color:"#10b981", desc:"Ngobrol santai seputar astronomi & sains", requireRef:false },
  { id:"discuss", name:"Diskusi", icon:MessageCircle, color:"#a855f7", desc:"Tanya jawab & sharing materi EAS", requireRef:false },
];

const Chat = () => {
  const [room, setRoom] = useState(null);
  if (!room) return <RoomSelector onSelect={setRoom} />;
  return <ChatRoom room={room} onBack={() => setRoom(null)} />;
};

const RoomSelector = ({ onSelect }) => (
  <div className="min-h-screen pb-28 p-5" style={{ background: PURPLE.bg }}>
    <div className="mt-4 mb-8">
      <h1 className="text-lg font-black text-white mb-1">💬 EAS Chat</h1>
      <p className="text-[10px] text-gray-500">Pilih ruang diskusi</p>
    </div>
    <div className="space-y-4">
      {ROOMS.map(r => {
        const Icon = r.icon;
        return (
          <button key={r.id} onClick={() => { playSound("nav"); onSelect(r); }}
            className="w-full p-5 rounded-3xl border text-left transition-all active:scale-98"
            style={{ borderColor: r.color+"30", background: r.color+"08" }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: r.color+"20" }}>
                <Icon size={20} style={{ color: r.color }} />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">{r.name}</h3>
                {r.requireRef && <span className="text-[8px] px-2 py-0.5 rounded-full font-bold" style={{ background: r.color+"20", color: r.color }}>REFERENSI WAJIB</span>}
              </div>
            </div>
            <p className="text-[10px] text-gray-500 ml-13">{r.desc}</p>
          </button>
        );
      })}
    </div>
  </div>
);

const ChatRoom = ({ room, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [ref, setRef] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [debaters, setDebaters] = useState([]);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const userData = JSON.parse(localStorage.getItem("eas_user_data") || "{}");

  useEffect(() => {
    const q = query(collection(db, `chat_${room.id}`), orderBy("createdAt", "asc"), limit(100));
    const unsub = onSnapshot(q, snap => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMessages(msgs);
      if (room.id === "debate") {
        const recent = msgs.slice(-50).map(m => m.userId).filter(Boolean);
        setDebaters([...new Set(recent)].slice(0, 4));
      }
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });
    return () => unsub();
  }, [room.id]);

  const canDebate = room.id !== "debate" || debaters.length < 4 || debaters.includes(userData.id);

  const handleSend = async () => {
    if (!text.trim()) return;
    if (room.requireRef && !ref.trim()) { alert("Sertakan referensi untuk ruang debat!"); return; }
    if (room.id === "debate" && !canDebate) { alert("Ruang debat penuh (max 4 peserta)!"); return; }
    setSending(true);
    try {
      await addDoc(collection(db, `chat_${room.id}`), {
        text: text.trim(), reference: ref.trim() || null,
        replyTo: replyTo ? { id: replyTo.id, text: replyTo.text.slice(0, 60), nama: replyTo.nama } : null,
        userId: userData.id, nama: userData.nama, memberId: userData.memberId, gen: userData.gen,
        createdAt: serverTimestamp()
      });
      playSound("click"); setText(""); setRef(""); setReplyTo(null);
    } catch (err) { alert("Gagal: " + err.message); }
    finally { setSending(false); }
  };

  const Icon = room.icon;

  return (
    // ✅ Fix: pakai dvh dan padding bottom agar tidak ketutup navbar
    <div className="flex flex-col" style={{ height: "100dvh", background: "linear-gradient(135deg,#0a0015,#050010)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b flex-shrink-0" style={{ borderColor: PURPLE.border }}>
        <button onClick={onBack} style={{ color: PURPLE.accent }}><ChevronLeft size={20} /></button>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: room.color+"20" }}>
          <Icon size={16} style={{ color: room.color }} />
        </div>
        <div>
          <h2 className="text-sm font-black text-white">{room.name}</h2>
          {room.id === "debate" && <p className="text-[9px]" style={{ color: room.color }}>{debaters.length}/4 debater aktif</p>}
        </div>
      </div>

      {/* Debaters */}
      {room.id === "debate" && debaters.length > 0 && (
        <div className="px-4 py-2 border-b flex gap-2 items-center flex-shrink-0" style={{ borderColor: PURPLE.border }}>
          <Users size={10} className="text-red-400" />
          <span className="text-[9px] text-gray-500">Debater:</span>
          {debaters.map((uid, i) => <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">{uid === userData.id ? "Kamu" : `User ${i+1}`}</span>)}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ paddingBottom: "1rem" }}>
        {messages.length === 0 && <div className="text-center py-12 text-gray-600 text-xs">Belum ada pesan. Mulai diskusi! 👋</div>}
        {messages.map(msg => {
          const isMe = msg.userId === userData.id;
          return (
            <motion.div key={msg.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
              className={`flex ${isMe?"justify-end":"justify-start"}`}>
              <div className={`max-w-[80%] ${isMe?"items-end":"items-start"} flex flex-col gap-1`}>
                {!isMe && <span className="text-[9px] text-gray-500 ml-1">{msg.nama}</span>}
                {msg.replyTo && (
                  <div className="text-[9px] px-2 py-1 rounded-lg border-l-2 mb-0.5" style={{ borderColor: PURPLE.accent, background: PURPLE.accent+"10", color: "#9ca3af" }}>
                    ↩ {msg.replyTo.nama}: {msg.replyTo.text}
                  </div>
                )}
                <div className="px-4 py-2.5 rounded-2xl text-xs" style={{ background: isMe?`linear-gradient(135deg,#7c3aed,#db2777)`:"rgba(255,255,255,0.07)", color:"#e2e8f0" }}>
                  {msg.text}
                </div>
                {msg.reference && (
                  <div className="flex items-center gap-1 text-[9px] text-blue-400 px-2">
                    <Link2 size={9} /><span className="truncate max-w-[180px]">{msg.reference}</span>
                  </div>
                )}
                <button onClick={() => setReplyTo(msg)} className="text-[8px] text-gray-600 hover:text-gray-400 ml-1 flex items-center gap-1">
                  <Reply size={9} /> Balas
                </button>
              </div>
            </motion.div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input - ✅ pb-24 agar tidak ketutup navbar */}
      <div className="p-4 pb-28 border-t flex-shrink-0 space-y-2" style={{ borderColor: PURPLE.border }}>
        {replyTo && (
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl text-[9px]" style={{ background: PURPLE.accent+"10", color: PURPLE.accent }}>
            <span>↩ Membalas {replyTo.nama}: {replyTo.text.slice(0,40)}...</span>
            <button onClick={() => setReplyTo(null)} className="text-gray-500">✕</button>
          </div>
        )}
        {room.requireRef && (
          <input value={ref} onChange={e => setRef(e.target.value)} placeholder="🔗 Referensi / sumber (wajib)"
            className="w-full px-4 py-2 rounded-xl text-[10px] text-white outline-none"
            style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${PURPLE.border}` }} />
        )}
        <div className="flex gap-2">
          <input value={text} onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key==="Enter"&&!e.shiftKey&&handleSend()}
            placeholder={!canDebate?"Ruang debat penuh...":"Ketik pesan..."}
            disabled={!canDebate}
            className="flex-1 px-4 py-2.5 rounded-2xl text-xs text-white outline-none"
            style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${PURPLE.border}` }} />
          <button onClick={handleSend} disabled={sending||!text.trim()}
            className="w-10 h-10 rounded-2xl flex items-center justify-center transition"
            style={{ background: text.trim()?`linear-gradient(135deg,#7c3aed,#db2777)`:"rgba(255,255,255,0.05)" }}>
            <Send size={16} color={text.trim()?"#fff":"#4b5563"} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
