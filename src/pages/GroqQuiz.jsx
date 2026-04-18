import { useState, useEffect } from "react";
import { db } from "../api/config";
import { doc, getDoc, setDoc, collection, addDoc, getDocs, query, orderBy, limit } from "firebase/firestore";
import { Zap, Brain, CheckCircle, XCircle, RefreshCw, Star } from "lucide-react";
import { useEasStore, THEMES } from "../store/useStore";
import { playSound } from "../component/Intro";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

const generateQuizFromGroq = async () => {
  const prompt = `Generate exactly 3 multiple choice quiz questions about astronomy and science for students. 
  Return ONLY valid JSON array with this exact format, no markdown:
  [
    {
      "question": "question text here",
      "options": ["A. option1", "B. option2", "C. option3", "D. option4"],
      "correctAnswer": 0,
      "explanation": "brief explanation why this is correct",
      "difficulty": "easy|medium|hard",
      "category": "Astronomy|Physics|Chemistry|Biology|Space"
    }
  ]
  Make questions educational, interesting, and varied in difficulty. Topics: planets, stars, galaxies, black holes, space exploration, physics laws, chemical elements, biology of space.`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: "llama3-8b-8192",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1500
    })
  });

  if (!res.ok) throw new Error("Groq API error: " + res.status);
  const data = await res.json();
  const text = data.choices[0].message.content;
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
};

const GroqQuiz = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [score, setScore] = useState(0);
  const [error, setError] = useState(null);
  const { theme } = useEasStore();
  const t = THEMES[theme] || THEMES.dark;
  const today = new Date().toISOString().split("T")[0];
  const userData = JSON.parse(localStorage.getItem("eas_user_data") || "{}");

  useEffect(() => { loadTodayQuiz(); }, []);

  const loadTodayQuiz = async () => {
    setLoading(true);
    setError(null);
    try {
      const snap = await getDoc(doc(db, "groq_quizzes", today));
      if (snap.exists()) {
        setQuizzes(snap.data().questions || []);
        // Cek apakah user sudah jawab hari ini
        const userSnap = await getDoc(doc(db, "groq_quiz_answers", `${today}_${userData.id}`));
        if (userSnap.exists()) {
          setAnswers(userSnap.data().answers || {});
          setScore(userSnap.data().score || 0);
          setSubmitted(true);
        }
      } else {
        await generateAndSave();
      }
    } catch (err) {
      setError("Gagal memuat quiz: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateAndSave = async () => {
    setGenerating(true);
    try {
      const questions = await generateQuizFromGroq();
      await setDoc(doc(db, "groq_quizzes", today), {
        questions,
        generatedAt: new Date().toISOString(),
        date: today
      });
      setQuizzes(questions);
    } catch (err) {
      setError("Gagal generate quiz AI. Cek API key Groq kamu.");
    } finally {
      setGenerating(false);
    }
  };

  const handleAnswer = (qIdx, aIdx) => {
    if (submitted) return;
    playSound("click");
    setAnswers(prev => ({ ...prev, [qIdx]: aIdx }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < quizzes.length) {
      alert("Jawab semua soal dulu!");
      return;
    }
    let sc = 0;
    quizzes.forEach((q, i) => { if (answers[i] === q.correctAnswer) sc++; });
    setScore(sc);
    setSubmitted(true);
    playSound(sc === quizzes.length ? "success" : "click");

    try {
      await setDoc(doc(db, "groq_quiz_answers", `${today}_${userData.id}`), {
        userId: userData.id, nama: userData.nama,
        date: today, answers, score: sc,
        total: quizzes.length,
        submittedAt: new Date().toISOString()
      });
    } catch (_) {}
  };

  const q = quizzes[current];
  const diffColor = { easy: "#10b981", medium: "#f59e0b", hard: "#ef4444" };

  if (loading || generating) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: t.bg }}>
      <Brain size={40} style={{ color: t.accent }} className="animate-pulse" />
      <p className="text-xs font-bold" style={{ color: t.accent }}>
        {generating ? "🤖 AI sedang membuat quiz hari ini..." : "Memuat quiz..."}
      </p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6" style={{ background: t.bg }}>
      <XCircle size={40} className="text-red-400" />
      <p className="text-xs text-red-400 text-center">{error}</p>
      <button onClick={loadTodayQuiz} className="px-6 py-3 rounded-xl font-bold text-xs" style={{ background: t.accent }}>
        Coba Lagi
      </button>
    </div>
  );

  if (submitted) return (
    <div className="min-h-screen pb-28 p-5" style={{ background: t.bg }}>
      {/* Score */}
      <div className="text-center py-8">
        <div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center border-4 mb-4"
          style={{ borderColor: t.accent, background: `${t.accent}20` }}>
          <span className="text-3xl font-black" style={{ color: t.accent }}>{score}/{quizzes.length}</span>
        </div>
        <h2 className="text-lg font-black text-white mb-1">
          {score === quizzes.length ? "🏆 Perfect!" : score >= 2 ? "⭐ Bagus!" : "💪 Keep Learning!"}
        </h2>
        <p className="text-xs text-gray-500">Quiz AI Hari Ini — {today}</p>
      </div>

      {/* Review */}
      <div className="space-y-4">
        {quizzes.map((q, i) => {
          const correct = answers[i] === q.correctAnswer;
          return (
            <div key={i} className="p-4 rounded-2xl border" style={{ borderColor: correct ? "#10b981" : "#ef4444", background: correct ? "#10b98110" : "#ef444410" }}>
              <div className="flex items-start gap-2 mb-3">
                {correct ? <CheckCircle size={16} className="text-green-400 flex-shrink-0 mt-0.5" /> : <XCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />}
                <p className="text-xs text-white font-medium">{q.question}</p>
              </div>
              <div className="space-y-1 mb-3">
                {q.options.map((opt, oi) => (
                  <div key={oi} className={`text-[10px] px-3 py-1.5 rounded-lg ${oi === q.correctAnswer ? "text-green-400 font-bold bg-green-900/20" : oi === answers[i] && !correct ? "text-red-400 line-through bg-red-900/10" : "text-gray-600"}`}>
                    {opt}
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 italic">💡 {q.explanation}</p>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-28 p-5" style={{ background: t.bg }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 mt-2">
        <div>
          <h1 className="text-base font-black flex items-center gap-2" style={{ color: t.accent }}>
            <Brain size={18} /> AI Quiz
          </h1>
          <p className="text-[9px] text-gray-500">Generated by Groq AI · {today}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-black text-white">{current + 1} / {quizzes.length}</p>
          <p className="text-[9px] text-gray-600">{Object.keys(answers).length} dijawab</p>
        </div>
      </div>

      {/* Progress */}
      <div className="w-full h-1 bg-gray-800 rounded-full mb-6">
        <div className="h-full rounded-full transition-all" style={{ width: `${((current + 1) / quizzes.length) * 100}%`, background: t.accent }} />
      </div>

      {/* Question */}
      <div className="p-5 rounded-3xl border mb-5" style={{ background: `${t.accent}08`, borderColor: t.border }}>
        <div className="flex gap-2 mb-3">
          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ background: diffColor[q.difficulty] + "25", color: diffColor[q.difficulty] }}>
            {q.difficulty?.toUpperCase()}
          </span>
          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-gray-800 text-gray-400">
            {q.category}
          </span>
        </div>
        <p className="text-sm text-white font-medium leading-relaxed">{q.question}</p>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {q.options.map((opt, i) => (
          <button key={i} onClick={() => handleAnswer(current, i)}
            className="w-full p-4 rounded-2xl border text-left transition-all text-xs"
            style={{
              borderColor: answers[current] === i ? t.accent : "rgba(255,255,255,0.06)",
              background: answers[current] === i ? `${t.accent}20` : "rgba(255,255,255,0.02)",
              color: answers[current] === i ? "#fff" : "#9ca3af"
            }}>
            {opt}
          </button>
        ))}
      </div>

      {/* Nav */}
      <div className="flex gap-3">
        {current > 0 && (
          <button onClick={() => { playSound("click"); setCurrent(c => c - 1); }}
            className="flex-1 py-3 rounded-xl font-bold text-xs border" style={{ borderColor: t.border, color: t.accent }}>
            ← Prev
          </button>
        )}
        {current < quizzes.length - 1 ? (
          <button onClick={() => { playSound("click"); setCurrent(c => c + 1); }}
            className="flex-1 py-3 rounded-xl font-bold text-xs text-white" style={{ background: t.accent }}>
            Next →
          </button>
        ) : (
          <button onClick={handleSubmit}
            className="flex-1 py-3 rounded-xl font-black text-xs text-white" style={{ background: "#10b981" }}>
            Submit Semua ✓
          </button>
        )}
      </div>

      {/* Dots nav */}
      <div className="flex justify-center gap-2 mt-4">
        {quizzes.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className="w-2 h-2 rounded-full transition-all"
            style={{ background: i === current ? t.accent : answers[i] !== undefined ? t.accent + "60" : "#374151" }} />
        ))}
      </div>
    </div>
  );
};

export default GroqQuiz;
