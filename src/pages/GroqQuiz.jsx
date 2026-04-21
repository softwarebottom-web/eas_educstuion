import { useState, useEffect } from "react";
import { db } from "../api/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Brain, CheckCircle, XCircle, ChevronLeft, ChevronRight, Send, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { playSound } from "../component/Intro";
import { addPoints } from "./Market";

const generateQuiz = async () => {
  let res, data;
  try {
    res = await fetch("/api/generate-quiz", { method: "POST" });
    data = await res.json();
  } catch {
    throw new Error("Tidak bisa terhubung ke server. Pastikan sudah deploy ke Vercel.");
  }
  if (!res.ok) throw new Error(data.hint ? `${data.error} — ${data.hint}` : data.error || "Gagal generate quiz");
  if (!data.questions?.length) throw new Error("Server tidak mengembalikan soal.");
  return data.questions;
};

const DIFF_COLOR = { easy: "#10b981", medium: "#f59e0b", hard: "#ef4444" };

const GroqQuiz = () => {
  const [phase, setPhase] = useState("loading");
  const [quizzes, setQuizzes] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [error, setError] = useState(null);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  const userData = JSON.parse(localStorage.getItem("eas_user_data") || "{}");
  const PURPLE = { bg: "linear-gradient(135deg,#0a0015,#050010)", accent: "#a855f7", accent2: "#ec4899" };

  useEffect(() => { init(); }, []);

  const init = async () => {
    setPhase("loading"); setError(null);
    try {
      const [quizSnap, ansSnap] = await Promise.all([
        getDoc(doc(db, "groq_quizzes", today)),
        getDoc(doc(db, "groq_quiz_answers", `${today}_${userData.id}`))
      ]);
      if (ansSnap.exists()) {
        const saved = ansSnap.data();
        setAnswers(saved.answers || {}); setScore(saved.score || 0);
        setEarnedPoints(saved.earnedPoints || 0); setAlreadyDone(true);
        if (quizSnap.exists()) setQuizzes(quizSnap.data().questions || []);
        setPhase("result"); return;
      }
      if (quizSnap.exists()) { setQuizzes(quizSnap.data().questions || []); setPhase("quiz"); return; }
      // Generate baru
      setPhase("generating");
      const questions = await generateQuiz();
      await setDoc(doc(db, "groq_quizzes", today), { questions, generatedAt: new Date().toISOString(), date: today });
      setQuizzes(questions); setPhase("quiz");
    } catch (err) { setError(err.message); setPhase("error"); }
  };

  const handleAnswer = (qi, ai) => { if (phase !== "quiz") return; playSound("click"); setAnswers(p => ({...p,[qi]:ai})); };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < quizzes.length) { alert(`Masih ada ${quizzes.length - Object.keys(answers).length} soal belum dijawab!`); return; }
    let sc = 0;
    quizzes.forEach((q, i) => { if (answers[i] === q.correctAnswer) sc++; });
    // Random points: 1 per benar, max 7, tapi random juga
    const basePoints = sc;
    const bonus = Math.floor(Math.random() * 3);
    const pts = Math.min(7, basePoints + bonus);
    setScore(sc); setEarnedPoints(pts);
    playSound(sc === quizzes.length ? "success" : "click");
    try {
      await setDoc(doc(db, "groq_quiz_answers", `${today}_${userData.id}`), {
        userId: userData.id, nama: userData.nama, date: today,
        answers, score: sc, total: quizzes.length, earnedPoints: pts,
        submittedAt: new Date().toISOString()
      });
      if (pts > 0) await addPoints(userData.id, userData.nama, pts, `Quiz AI ${today}: ${sc}/${quizzes.length} benar`);
    } catch (_) {}
    setPhase("result");
  };

  const LOAD_MSG = { loading: "Memuat quiz hari ini...", generating: "🤖 AI sedang membuat soal astronomy & science..." };

  if (phase === "loading" || phase === "generating") return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5" style={{ background: PURPLE.bg }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
        <Brain size={44} style={{ color: PURPLE.accent }} />
      </motion.div>
      <div className="text-center"><p className="text-sm font-black text-white mb-1">{LOAD_MSG[phase]}</p><p className="text-[10px] text-gray-500">3 soal astronomy & science</p></div>
      <div className="flex gap-2">{[0,1,2].map(i => <motion.div key={i} className="w-2 h-2 rounded-full" style={{ background: PURPLE.accent }} animate={{ opacity: [0.3,1,0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i*0.25 }} />)}</div>
    </div>
  );

  if (phase === "error") return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6" style={{ background: PURPLE.bg }}>
      <XCircle size={44} className="text-red-400" />
      <p className="text-sm font-black text-white text-center">Gagal Memuat Quiz</p>
      <p className="text-xs text-red-400 bg-red-500/10 px-4 py-3 rounded-xl max-w-xs text-center">{error}</p>
      <button onClick={init} className="px-6 py-3 rounded-xl font-black text-sm text-white" style={{ background: PURPLE.accent }}>Coba Lagi</button>
    </div>
  );

  if (phase === "result") return (
    <div className="min-h-screen pb-28 p-5" style={{ background: PURPLE.bg }}>
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
        <motion.div className="w-28 h-28 rounded-full mx-auto flex flex-col items-center justify-center border-4 mb-4"
          style={{ borderColor: PURPLE.accent, background: PURPLE.accent + "15" }}
          animate={{ boxShadow: [`0 0 0px ${PURPLE.accent}00`,`0 0 40px ${PURPLE.accent}60`,`0 0 0px ${PURPLE.accent}00`] }} transition={{ duration: 2, repeat: Infinity }}>
          <p className="text-2xl font-black text-white">{score}/{quizzes.length}</p>
          <p className="text-[9px] text-gray-400">Benar</p>
        </motion.div>
        {!alreadyDone && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-3" style={{ background: "linear-gradient(135deg,#7c3aed,#db2777)" }}>
            <Star size={16} className="text-yellow-300" fill="#fcd34d" />
            <span className="text-sm font-black text-white">+{earnedPoints} Point!</span>
          </motion.div>
        )}
        {alreadyDone && <p className="text-[10px] text-gray-500 mb-3">Sudah dikerjakan hari ini</p>}
        <p className="text-[10px] text-gray-600">Quiz AI · {today}</p>
      </motion.div>

      <div className="space-y-3">
        <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Review</p>
        {quizzes.map((q, i) => {
          const correct = answers[i] === q.correctAnswer;
          return (
            <div key={i} className="p-4 rounded-2xl border" style={{ borderColor: correct ? "#10b98130" : "#ef444430", background: correct ? "#10b98108" : "#ef444408" }}>
              <div className="flex gap-2 mb-2">{correct ? <CheckCircle size={14} className="text-green-400 flex-shrink-0 mt-0.5" /> : <XCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />}<p className="text-xs text-white font-medium">{q.question}</p></div>
              <div className="space-y-1 ml-5 mb-2">
                {q.options.map((opt, oi) => <p key={oi} className={`text-[10px] px-2 py-1 rounded-lg ${oi===q.correctAnswer?"bg-green-900/30 text-green-400 font-bold":oi===answers[i]&&!correct?"bg-red-900/20 text-red-400 line-through":"text-gray-600"}`}>{opt}</p>)}
              </div>
              {q.explanation && <p className="text-[10px] text-gray-500 ml-5 italic">💡 {q.explanation}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );

  const q = quizzes[current]; if (!q) return null;
  const answered = Object.keys(answers).length;

  return (
    <div className="min-h-screen pb-28 p-5" style={{ background: PURPLE.bg }}>
      <div className="flex items-center justify-between mt-2 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-0.5"><Brain size={16} style={{ color: PURPLE.accent }} /><span className="text-sm font-black text-white">AI Quiz</span><span className="text-[8px] px-2 py-0.5 rounded-full font-bold" style={{ background: PURPLE.accent+"20", color: PURPLE.accent }}>GROQ</span></div>
          <p className="text-[9px] text-gray-500">{today} · {answered}/{quizzes.length} dijawab</p>
        </div>
        <div className="text-right"><p className="text-lg font-black text-white">{current+1}<span className="text-gray-600 text-sm">/{quizzes.length}</span></p></div>
      </div>
      <div className="flex gap-2 mb-5">
        {quizzes.map((_,i) => <button key={i} onClick={() => setCurrent(i)} className="flex-1 h-1.5 rounded-full transition-all" style={{ background: i===current?PURPLE.accent:answers[i]!==undefined?PURPLE.accent+"50":"#1f2937" }} />)}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={current} initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-30 }} transition={{ duration:0.2 }}
          className="p-5 rounded-3xl border mb-5" style={{ background: PURPLE.accent+"07", borderColor: PURPLE.accent+"20" }}>
          <div className="flex gap-2 mb-4">
            <span className="text-[9px] px-2 py-1 rounded-full font-black" style={{ background: (DIFF_COLOR[q.difficulty]||"#a855f7")+"20", color: DIFF_COLOR[q.difficulty]||"#a855f7" }}>{q.difficulty?.toUpperCase()}</span>
            <span className="text-[9px] px-2 py-1 rounded-full font-bold bg-gray-800 text-gray-400">{q.category}</span>
          </div>
          <p className="text-sm text-white font-medium leading-relaxed">{q.question}</p>
        </motion.div>
      </AnimatePresence>
      <div className="space-y-3 mb-6">
        {q.options.map((opt, i) => {
          const sel = answers[current] === i;
          return (
            <motion.button key={i} whileTap={{ scale:0.98 }} onClick={() => handleAnswer(current, i)}
              className="w-full p-4 rounded-2xl border text-left text-xs transition-all"
              style={{ borderColor: sel?PURPLE.accent:"rgba(255,255,255,0.06)", background: sel?PURPLE.accent+"20":"rgba(255,255,255,0.02)", color: sel?"#fff":"#9ca3af" }}>
              <span className="font-mono opacity-50 mr-2 text-[10px]">{String.fromCharCode(65+i)}.</span>{opt.replace(/^[A-D]\.\s*/,"")}
            </motion.button>
          );
        })}
      </div>
      <div className="flex gap-3">
        <button onClick={() => { playSound("click"); setCurrent(c => Math.max(0,c-1)); }} disabled={current===0}
          className="flex items-center gap-1 px-4 py-3 rounded-xl font-bold text-xs border disabled:opacity-30" style={{ borderColor: "#374151", color: PURPLE.accent }}>
          <ChevronLeft size={16} /> Prev
        </button>
        {current < quizzes.length-1 ? (
          <button onClick={() => { playSound("click"); setCurrent(c=>c+1); }} className="flex-1 flex items-center justify-center gap-1 py-3 rounded-xl font-black text-xs text-white" style={{ background: PURPLE.accent }}>
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button onClick={handleSubmit} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs text-white" style={{ background: answered===quizzes.length?"linear-gradient(135deg,#7c3aed,#db2777)":"#374151" }}>
            <Send size={14} /> Submit
          </button>
        )}
      </div>
    </div>
  );
};

export default GroqQuiz;
