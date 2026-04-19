import { useState, useEffect } from "react";
import { db } from "../api/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Brain, CheckCircle, XCircle, ChevronLeft, ChevronRight, Send, Zap } from "lucide-react";
import { useEasStore, THEMES } from "../store/useStore";
import { playSound } from "../component/Intro";
import { motion, AnimatePresence } from "framer-motion";

// ✅ Panggil backend Vercel — bukan Groq langsung
const generateQuiz = async () => {
  const res = await fetch("/api/generate-quiz", { method: "POST" });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Gagal generate quiz");
  }
  const data = await res.json();
  return data.questions;
};

const DIFF_COLOR = { easy: "#10b981", medium: "#f59e0b", hard: "#ef4444" };
const DIFF_LABEL = { easy: "Mudah", medium: "Sedang", hard: "Sulit" };

const GroqQuiz = () => {
  const [phase, setPhase] = useState("loading"); // loading | quiz | result
  const [quizzes, setQuizzes] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);
  const { theme } = useEasStore();
  const t = THEMES[theme] || THEMES.dark;
  const today = new Date().toISOString().split("T")[0];
  const userData = JSON.parse(localStorage.getItem("eas_user_data") || "{}");

  useEffect(() => { init(); }, []);

  const init = async () => {
    setPhase("loading");
    setError(null);
    try {
      // Cek apakah sudah ada quiz hari ini di Firestore
      const quizSnap = await getDoc(doc(db, "groq_quizzes", today));

      // Cek apakah user sudah jawab
      const answerSnap = await getDoc(doc(db, "groq_quiz_answers", `${today}_${userData.id}`));

      if (quizSnap.exists()) {
        setQuizzes(quizSnap.data().questions || []);
        if (answerSnap.exists()) {
          const saved = answerSnap.data();
          setAnswers(saved.answers || {});
          setScore(saved.score || 0);
          setPhase("result");
        } else {
          setPhase("quiz");
        }
      } else {
        // Generate quiz baru
        await generateAndSave();
      }
    } catch (err) {
      setError(err.message);
      setPhase("error");
    }
  };

  const generateAndSave = async () => {
    setGenerating(true);
    try {
      const questions = await generateQuiz();
      await setDoc(doc(db, "groq_quizzes", today), {
        questions,
        generatedAt: new Date().toISOString(),
        date: today,
      });
      setQuizzes(questions);
      setPhase("quiz");
    } catch (err) {
      setError(err.message);
      setPhase("error");
    } finally {
      setGenerating(false);
    }
  };

  const handleAnswer = (qIdx, aIdx) => {
    if (phase !== "quiz") return;
    playSound("click");
    setAnswers(prev => ({ ...prev, [qIdx]: aIdx }));
  };

  const handleSubmit = async () => {
    const total = quizzes.length;
    const unanswered = total - Object.keys(answers).length;
    if (unanswered > 0) {
      alert(`Masih ada ${unanswered} soal belum dijawab!`);
      return;
    }

    let sc = 0;
    quizzes.forEach((q, i) => { if (answers[i] === q.correctAnswer) sc++; });
    setScore(sc);

    playSound(sc === total ? "success" : sc >= Math.ceil(total / 2) ? "success" : "click");

    try {
      await setDoc(doc(db, "groq_quiz_answers", `${today}_${userData.id}`), {
        userId: userData.id,
        nama: userData.nama,
        date: today,
        answers,
        score: sc,
        total,
        submittedAt: new Date().toISOString(),
      });
    } catch (_) {}

    setPhase("result");
  };

  // ===== LOADING =====
  if (phase === "loading") return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5" style={{ background: t.bg }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
        <Brain size={44} style={{ color: t.accent }} />
      </motion.div>
      <div className="text-center">
        <p className="text-sm font-black text-white mb-1">
          {generating ? "🤖 AI Menyiapkan Quiz..." : "Memuat Quiz Hari Ini..."}
        </p>
        <p className="text-[10px] text-gray-500">
          {generating ? "Groq AI sedang membuat 3 soal astronomy & science" : "Mengambil data dari server"}
        </p>
      </div>
      <div className="flex gap-2">
        {[0,1,2].map(i => (
          <motion.div key={i} className="w-2 h-2 rounded-full" style={{ background: t.accent }}
            animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.25 }} />
        ))}
      </div>
    </div>
  );

  // ===== ERROR =====
  if (phase === "error") return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6" style={{ background: t.bg }}>
      <XCircle size={44} className="text-red-400" />
      <div className="text-center">
        <p className="text-sm font-black text-white mb-2">Gagal Memuat Quiz</p>
        <p className="text-xs text-red-400 bg-red-500/10 px-4 py-2 rounded-xl max-w-xs">{error}</p>
      </div>
      <button onClick={init} className="px-6 py-3 rounded-xl font-black text-sm text-white" style={{ background: t.accent }}>
        Coba Lagi
      </button>
    </div>
  );

  // ===== RESULT =====
  if (phase === "result") {
    const total = quizzes.length;
    const pct = Math.round((score / total) * 100);
    return (
      <div className="min-h-screen pb-28 p-5" style={{ background: t.bg }}>
        {/* Score Card */}
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8">
          <motion.div
            className="w-28 h-28 rounded-full mx-auto flex items-center justify-center border-4 mb-4"
            style={{ borderColor: pct === 100 ? "#10b981" : pct >= 66 ? t.accent : "#f59e0b", background: pct === 100 ? "#10b98120" : `${t.accent}15` }}
            animate={{ boxShadow: [`0 0 0px ${t.accent}00`, `0 0 30px ${t.accent}60`, `0 0 0px ${t.accent}00`] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div>
              <p className="text-3xl font-black" style={{ color: pct === 100 ? "#10b981" : t.accent }}>{score}/{total}</p>
              <p className="text-[9px] text-gray-500">{pct}%</p>
            </div>
          </motion.div>
          <h2 className="text-lg font-black text-white mb-1">
            {pct === 100 ? "🏆 Perfect Score!" : pct >= 66 ? "⭐ Bagus!" : pct >= 33 ? "💪 Lumayan!" : "📚 Keep Learning!"}
          </h2>
          <p className="text-[10px] text-gray-500">AI Quiz · {today}</p>
        </motion.div>

        {/* Review */}
        <div className="space-y-4">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Review Jawaban</p>
          {quizzes.map((q, i) => {
            const correct = answers[i] === q.correctAnswer;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="p-4 rounded-2xl border" style={{ borderColor: correct ? "#10b98130" : "#ef444430", background: correct ? "#10b98108" : "#ef444408" }}>
                <div className="flex gap-2 mb-3">
                  {correct ? <CheckCircle size={15} className="text-green-400 flex-shrink-0 mt-0.5" /> : <XCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />}
                  <p className="text-xs text-white font-medium leading-relaxed">{q.question}</p>
                </div>
                <div className="space-y-1 mb-3 ml-5">
                  {q.options.map((opt, oi) => (
                    <p key={oi} className={`text-[10px] px-3 py-1.5 rounded-lg transition ${
                      oi === q.correctAnswer ? "bg-green-900/30 text-green-400 font-bold" :
                      oi === answers[i] && !correct ? "bg-red-900/20 text-red-400 line-through" : "text-gray-600"
                    }`}>{opt}</p>
                  ))}
                </div>
                <div className="ml-5 p-2.5 rounded-xl text-[10px] text-gray-300 leading-relaxed" style={{ background: `${t.accent}10` }}>
                  💡 {q.explanation}
                </div>
              </motion.div>
            );
          })}
        </div>

        <p className="text-center text-[9px] text-gray-700 mt-6">Quiz AI diperbarui setiap hari oleh Groq AI</p>
      </div>
    );
  }

  // ===== QUIZ =====
  const q = quizzes[current];
  if (!q) return null;
  const answered = Object.keys(answers).length;

  return (
    <div className="min-h-screen pb-28 p-5" style={{ background: t.bg }}>
      {/* Header */}
      <div className="flex items-center justify-between mt-2 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Brain size={16} style={{ color: t.accent }} />
            <h1 className="text-sm font-black text-white">AI Quiz</h1>
            <span className="text-[8px] px-2 py-0.5 rounded-full font-bold bg-purple-500/20 text-purple-400">GROQ AI</span>
          </div>
          <p className="text-[9px] text-gray-500">{today} · {answered}/{quizzes.length} dijawab</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-black" style={{ color: t.accent }}>{current + 1}<span className="text-gray-600 text-sm">/{quizzes.length}</span></p>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2 mb-5">
        {quizzes.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className="flex-1 h-1.5 rounded-full transition-all"
            style={{ background: i === current ? t.accent : answers[i] !== undefined ? t.accent + "50" : "#1f2937" }} />
        ))}
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div key={current}
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.2 }}
          className="p-5 rounded-3xl border mb-5" style={{ background: `${t.accent}07`, borderColor: t.border }}>

          <div className="flex gap-2 mb-4">
            <span className="text-[9px] px-2 py-1 rounded-full font-black" style={{ background: DIFF_COLOR[q.difficulty] + "20", color: DIFF_COLOR[q.difficulty] }}>
              {DIFF_LABEL[q.difficulty] || q.difficulty}
            </span>
            <span className="text-[9px] px-2 py-1 rounded-full font-bold bg-gray-800 text-gray-400">
              {q.category}
            </span>
          </div>

          <p className="text-sm text-white font-medium leading-relaxed">{q.question}</p>
        </motion.div>
      </AnimatePresence>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {q.options.map((opt, i) => {
          const selected = answers[current] === i;
          return (
            <motion.button key={i} whileTap={{ scale: 0.98 }}
              onClick={() => handleAnswer(current, i)}
              className="w-full p-4 rounded-2xl border text-left text-xs transition-all"
              style={{
                borderColor: selected ? t.accent : "rgba(255,255,255,0.06)",
                background: selected ? `${t.accent}20` : "rgba(255,255,255,0.02)",
                color: selected ? "#fff" : "#9ca3af",
              }}>
              <span className="font-mono opacity-50 mr-2 text-[10px]">{String.fromCharCode(65 + i)}.</span>
              {opt.replace(/^[A-D]\.\s*/, "")}
            </motion.button>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button onClick={() => { playSound("click"); setCurrent(c => Math.max(0, c - 1)); }}
          disabled={current === 0}
          className="flex items-center gap-1 px-4 py-3 rounded-xl font-bold text-xs border transition disabled:opacity-30"
          style={{ borderColor: t.border, color: t.accent }}>
          <ChevronLeft size={16} /> Prev
        </button>

        {current < quizzes.length - 1 ? (
          <button onClick={() => { playSound("click"); setCurrent(c => c + 1); }}
            className="flex-1 flex items-center justify-center gap-1 py-3 rounded-xl font-black text-xs text-white"
            style={{ background: t.accent }}>
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button onClick={handleSubmit}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs text-white"
            style={{ background: answered === quizzes.length ? "#10b981" : "#374151" }}>
            <Send size={14} /> Submit Semua
          </button>
        )}
      </div>

      {/* Unanswered warning */}
      {answered < quizzes.length && current === quizzes.length - 1 && (
        <p className="text-center text-[10px] text-yellow-400 mt-3">
          ⚠️ {quizzes.length - answered} soal belum dijawab
        </p>
      )}
    </div>
  );
};

export default GroqQuiz;
