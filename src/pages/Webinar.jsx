import { useState, useEffect, useRef } from "react";
import { db } from "../api/config";
import { collection, addDoc, onSnapshot, query, orderBy, doc, getDoc, updateDoc, setDoc, serverTimestamp, getDocs } from "firebase/firestore";
import { Mic, MicOff, Video, VideoOff, Users, MessageCircle, Send, Crown, Radio, Clock, Lock, ChevronLeft, Play, AlertCircle } from "lucide-react";
import { useEasStore, THEMES } from "../store/useStore";
import { playSound } from "../component/Intro";
import { motion, AnimatePresence } from "framer-motion";

const ROLES_LABEL = { host: "Pembawa Acara", speaker1: "Pemateri 1", speaker2: "Pemateri 2", closing: "Penutup", audience: "Penonton" };
const ROLES_COLOR = { host: "#f59e0b", speaker1: "#3b82f6", speaker2: "#8b5cf6", closing: "#10b981", audience: "#6b7280" };

const Webinar = () => {
  const [sessions, setSessions] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useEasStore();
  const t = THEMES[theme] || THEMES.dark;
  const userData = JSON.parse(localStorage.getItem("eas_user_data") || "{}");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "webinar_sessions"), snap => {
      setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.createdAt - a.createdAt));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (active) return <WebinarRoom session={active} onBack={() => setActive(null)} userData={userData} t={t} />;

  return (
    <div className="min-h-screen pb-28 p-5" style={{ background: t.bg }}>
      <div className="mt-2 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Radio size={20} style={{ color: t.accent }} />
          <h1 className="text-base font-black text-white">Webinar & Rapat EAS</h1>
        </div>
        <p className="text-[9px] text-gray-500">Sesi edukasi live & rapat internal</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-600 text-xs">Memuat sesi...</div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-16">
          <Radio size={40} className="mx-auto mb-4 text-gray-700" />
          <p className="text-sm text-gray-600 font-bold">Belum ada sesi aktif</p>
          <p className="text-xs text-gray-700 mt-1">Admin akan membuat sesi webinar atau rapat</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map(s => {
            const isRapat = s.type === "rapat";
            const userRole = s.assignments?.[userData.id] || "audience";
            const canJoin = !isRapat || ["admin","owner","moderator"].includes(userData.role);
            return (
              <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-3xl border" style={{ borderColor: isRapat ? "#ef444430" : t.border, background: isRapat ? "#ef444408" : `${t.accent}06` }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {s.status === "live" ? (
                        <span className="flex items-center gap-1 text-[9px] font-black text-red-400 bg-red-500/20 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" /> LIVE
                        </span>
                      ) : s.status === "upcoming" ? (
                        <span className="flex items-center gap-1 text-[9px] font-black text-yellow-400 bg-yellow-500/20 px-2 py-0.5 rounded-full">
                          <Clock size={8} /> SEGERA
                        </span>
                      ) : (
                        <span className="text-[9px] text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full">SELESAI</span>
                      )}
                      {isRapat && <span className="flex items-center gap-1 text-[9px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full"><Lock size={8} /> RAPAT INTERNAL</span>}
                    </div>
                    <h3 className="text-sm font-black text-white">{s.title}</h3>
                    <p className="text-[10px] text-gray-500 mt-0.5">{s.description}</p>
                  </div>
                </div>

                {/* Role assignments */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {Object.entries(ROLES_LABEL).filter(([r]) => r !== "audience").map(([role, label]) => {
                    const assignedName = s.assignedNames?.[role];
                    return (
                      <div key={role} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px]"
                        style={{ background: ROLES_COLOR[role] + "15", color: ROLES_COLOR[role] }}>
                        <span>{label}:</span>
                        <span className="font-bold">{assignedName || "—"}</span>
                      </div>
                    );
                  })}
                </div>

                {/* My role */}
                {userRole !== "audience" && (
                  <div className="mb-3 px-3 py-1.5 rounded-xl text-[10px] font-bold" style={{ background: ROLES_COLOR[userRole] + "20", color: ROLES_COLOR[userRole] }}>
                    🎭 Peran kamu: {ROLES_LABEL[userRole]}
                  </div>
                )}

                {!canJoin ? (
                  <div className="flex items-center gap-2 text-[10px] text-red-400 bg-red-500/10 px-3 py-2 rounded-xl">
                    <Lock size={12} /> Rapat ini hanya untuk admin & staff
                  </div>
                ) : s.status !== "ended" ? (
                  <button onClick={() => { playSound("nav"); setActive(s); }}
                    className="w-full py-3 rounded-xl font-black text-xs text-white transition"
                    style={{ background: s.status === "live" ? "#ef4444" : t.accent }}>
                    {s.status === "live" ? "🔴 Gabung Sekarang" : "📅 Lihat Detail"}
                  </button>
                ) : null}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const WebinarRoom = ({ session, onBack, userData, t }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sessionData, setSessionData] = useState(session);
  const bottomRef = useRef(null);
  const userRole = sessionData.assignments?.[userData.id] || "audience";
  const isStage = userRole !== "audience";
  const isRapat = sessionData.type === "rapat";

  useEffect(() => {
    const q = query(collection(db, `webinar_chat_${session.id}`), orderBy("createdAt", "asc"), limit(200));
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });
    const unsub2 = onSnapshot(doc(db, "webinar_sessions", session.id), snap => {
      if (snap.exists()) setSessionData({ id: snap.id, ...snap.data() });
    });
    return () => { unsub(); unsub2(); };
  }, [session.id]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      await addDoc(collection(db, `webinar_chat_${session.id}`), {
        text: text.trim(), userId: userData.id, nama: userData.nama,
        role: userRole, isStage, createdAt: serverTimestamp()
      });
      setText(""); playSound("click");
    } catch (err) { alert("Gagal: " + err.message); }
    finally { setSending(false); }
  };

  const stageReady = Object.keys(sessionData.assignments || {}).length >= 4;

  return (
    <div className="flex flex-col h-screen" style={{ background: t.bg }}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: t.border }}>
        <button onClick={onBack} style={{ color: t.accent }}><ChevronLeft size={20} /></button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {sessionData.status === "live" && <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />}
            <h2 className="text-sm font-black text-white truncate">{sessionData.title}</h2>
          </div>
          <p className="text-[9px] text-gray-500">{isRapat ? "🔒 Rapat Internal" : "📡 Webinar"} · {ROLES_LABEL[userRole]}</p>
        </div>
      </div>

      {/* Stage — untuk pemegang peran */}
      {sessionData.status !== "ended" && (
        <div className="p-4 border-b" style={{ borderColor: t.border }}>
          {!stageReady && sessionData.status === "upcoming" ? (
            <div className="text-center py-4">
              <AlertCircle size={24} className="mx-auto mb-2 text-yellow-400" />
              <p className="text-xs text-yellow-400 font-bold">Menunggu semua pemateri bergabung...</p>
              <p className="text-[10px] text-gray-600 mt-1">Sesi akan dimulai sebentar lagi</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {["host", "speaker1", "speaker2", "closing"].map(role => {
                const assignedId = Object.entries(sessionData.assignments || {}).find(([,r]) => r === role)?.[0];
                const name = sessionData.assignedNames?.[role] || "—";
                const isMe = assignedId === userData.id;
                return (
                  <div key={role} className={`p-3 rounded-2xl border flex items-center gap-2 ${isMe ? "border-opacity-60" : "border-opacity-20"}`}
                    style={{ borderColor: ROLES_COLOR[role], background: ROLES_COLOR[role] + (isMe ? "20" : "08") }}>
                    {role === "host" ? <Crown size={14} style={{ color: ROLES_COLOR[role] }} /> : <Mic size={14} style={{ color: ROLES_COLOR[role] }} />}
                    <div>
                      <p className="text-[9px] font-bold" style={{ color: ROLES_COLOR[role] }}>{ROLES_LABEL[role]}</p>
                      <p className="text-[10px] text-white font-medium">{name}</p>
                    </div>
                    {isMe && <span className="ml-auto text-[8px] font-black" style={{ color: ROLES_COLOR[role] }}>KAMU</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Chat */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <MessageCircle size={24} className="mx-auto mb-2 text-gray-700" />
            <p className="text-[10px] text-gray-600">{isStage ? "Mulai berbicara..." : "Ketik pertanyaan di bawah"}</p>
          </div>
        )}
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-2 ${msg.isStage ? "" : "opacity-80"}`}>
            <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-black`}
              style={{ background: ROLES_COLOR[msg.role] + "30", color: ROLES_COLOR[msg.role] }}>
              {msg.nama?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[9px] font-bold" style={{ color: ROLES_COLOR[msg.role] || "#fff" }}>{msg.nama}</span>
                <span className="text-[8px] text-gray-700">{ROLES_LABEL[msg.role]}</span>
              </div>
              <p className="text-xs text-gray-300">{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input — semua bisa chat (audience untuk tanya) */}
      <div className="p-4 border-t" style={{ borderColor: t.border }}>
        {!isStage && <p className="text-[9px] text-gray-600 mb-2">💬 Tanya kepada pemateri</p>}
        <div className="flex gap-2">
          <input value={text} onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            placeholder={isStage ? "Bicara ke audiens..." : "Kirim pertanyaan..."}
            className="flex-1 px-4 py-2.5 rounded-2xl text-xs text-white outline-none"
            style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${t.border}` }} />
          <button onClick={sendMessage} disabled={sending || !text.trim()}
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: text.trim() ? t.accent : "rgba(255,255,255,0.05)" }}>
            <Send size={16} color={text.trim() ? "#fff" : "#4b5563"} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Webinar;
