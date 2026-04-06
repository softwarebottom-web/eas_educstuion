import { useState, useEffect } from "react";
import { db } from "../api/config";
import { doc, setDoc, getDoc, collection, getDocs, deleteDoc } from "firebase/firestore";
import { PlusCircle, Trash2, Calendar, CheckCircle } from "lucide-react";

const AdminQuiz = () => {
  const [loading, setLoading] = useState(false);
  const [quizList, setQuizList] = useState([]);
  const [tab, setTab] = useState("create"); // create | list

  const [quizData, setQuizData] = useState({
    date: new Date().toISOString().split("T")[0],
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0
  });

  // Fetch semua quiz
  const fetchQuizList = async () => {
    try {
      const snap = await getDocs(collection(db, "daily_quizzes"));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => b.id.localeCompare(a.id));
      setQuizList(list);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchQuizList();
  }, []);

  const updateOption = (index, value) => {
    const newOpts = [...quizData.options];
    newOpts[index] = value;
    setQuizData({ ...quizData, options: newOpts });
  };

  const saveQuiz = async () => {
    if (loading) return;

    if (!quizData.question.trim() || quizData.question.trim().length < 5) {
      return alert("Pertanyaan minimal 5 karakter!");
    }

    const emptyOpts = quizData.options.filter(o => !o.trim());
    if (emptyOpts.length > 0) {
      return alert("Semua opsi wajib diisi!");
    }

    setLoading(true);

    try {
      const ref = doc(db, "daily_quizzes", quizData.date);
      const existing = await getDoc(ref);

      if (existing.exists()) {
        const ok = window.confirm("Quiz tanggal ini sudah ada. Overwrite?");
        if (!ok) { setLoading(false); return; }
      }

      await setDoc(ref, {
        date: quizData.date,
        question: quizData.question.trim(),
        options: quizData.options.map(o => o.trim()),
        correctAnswer: quizData.correctAnswer,
        createdAt: new Date().toISOString(),
        createdBy: localStorage.getItem("eas_admin_id") || "admin",
        status: "active"
      });

      alert(`✅ Quiz ${quizData.date} berhasil dipublish!`);

      // Reset form
      setQuizData({
        date: new Date().toISOString().split("T")[0],
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0
      });

      fetchQuizList();
      setTab("list");

    } catch (err) {
      console.error(err);
      alert("Gagal simpan: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteQuiz = async (id) => {
    if (!window.confirm(`Hapus quiz ${id}?`)) return;
    try {
      await deleteDoc(doc(db, "daily_quizzes", id));
      fetchQuizList();
    } catch (err) {
      alert("Gagal hapus: " + err.message);
    }
  };

  return (
    <div className="text-white">
      {/* TAB */}
      <div className="flex gap-2 mb-6">
        {["create", "list"].map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); if (t === "list") fetchQuizList(); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition
              ${tab === t ? "bg-blue-600 text-white" : "bg-gray-900 text-gray-500 hover:text-white"}`}
          >
            {t === "create" ? "➕ Buat Quiz" : "📋 Daftar Quiz"}
          </button>
        ))}
      </div>

      {/* CREATE TAB */}
      {tab === "create" && (
        <div className="space-y-4 bg-black/40 p-6 rounded-2xl border border-blue-900">
          <h2 className="text-sm font-black text-blue-400 flex items-center gap-2">
            <PlusCircle size={16} /> BUAT QUIZ HARIAN
          </h2>

          {/* DATE */}
          <div>
            <label className="text-[10px] text-gray-500 uppercase mb-1 block">Tanggal Quiz</label>
            <input
              type="date"
              value={quizData.date}
              onChange={(e) => setQuizData({ ...quizData, date: e.target.value })}
              className="w-full p-3 bg-gray-900 rounded-xl border border-gray-800 text-xs text-white"
            />
          </div>

          {/* QUESTION */}
          <div>
            <label className="text-[10px] text-gray-500 uppercase mb-1 block">Pertanyaan</label>
            <textarea
              placeholder="Tulis pertanyaan quiz..."
              value={quizData.question}
              className="w-full p-3 bg-gray-900 rounded-xl border border-gray-800 h-24 text-xs text-white resize-none"
              onChange={(e) => setQuizData({ ...quizData, question: e.target.value })}
            />
          </div>

          {/* OPTIONS */}
          <div>
            <label className="text-[10px] text-gray-500 uppercase mb-2 block">
              Pilihan Jawaban <span className="text-green-400">(● = jawaban benar)</span>
            </label>
            <div className="space-y-2">
              {quizData.options.map((opt, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <button
                    onClick={() => setQuizData({ ...quizData, correctAnswer: i })}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition
                      ${quizData.correctAnswer === i
                        ? "border-green-500 bg-green-500"
                        : "border-gray-600 hover:border-gray-400"}`}
                  >
                    {quizData.correctAnswer === i && <CheckCircle size={12} color="white" />}
                  </button>
                  <input
                    type="text"
                    placeholder={`Opsi ${String.fromCharCode(65 + i)}`}
                    value={opt}
                    className="flex-1 p-2.5 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white"
                    onChange={(e) => updateOption(i, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* PREVIEW */}
          {quizData.question && (
            <div className="p-4 bg-blue-900/20 border border-blue-800/50 rounded-xl">
              <p className="text-[9px] text-blue-400 uppercase font-bold mb-2">Preview</p>
              <p className="text-xs text-white mb-2">{quizData.question}</p>
              {quizData.options.map((o, i) => o && (
                <p key={i} className={`text-[10px] mb-1 ${i === quizData.correctAnswer ? "text-green-400 font-bold" : "text-gray-400"}`}>
                  {String.fromCharCode(65 + i)}. {o} {i === quizData.correctAnswer ? "✓" : ""}
                </p>
              ))}
            </div>
          )}

          {/* SUBMIT */}
          <button
            onClick={saveQuiz}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 p-4 rounded-xl font-black text-sm transition"
          >
            {loading ? "Menyimpan..." : "🚀 PUBLISH QUIZ"}
          </button>
        </div>
      )}

      {/* LIST TAB */}
      {tab === "list" && (
        <div>
          <h2 className="text-sm font-black text-blue-400 mb-4 flex items-center gap-2">
            <Calendar size={16} /> DAFTAR QUIZ ({quizList.length})
          </h2>

          {quizList.length === 0 && (
            <p className="text-xs text-gray-600 text-center py-8">Belum ada quiz</p>
          )}

          <div className="space-y-3">
            {quizList.map((q) => (
              <div key={q.id} className="p-4 bg-black/40 border border-gray-800 rounded-2xl">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-[10px] text-blue-400 font-bold">{q.id}</p>
                    <p className="text-xs text-white font-medium mt-1">{q.question}</p>
                  </div>
                  <button
                    onClick={() => deleteQuiz(q.id)}
                    className="text-gray-600 hover:text-red-500 transition ml-2 flex-shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1 mt-2">
                  {q.options?.map((o, i) => (
                    <p key={i} className={`text-[9px] px-2 py-1 rounded ${i === q.correctAnswer ? "bg-green-900/30 text-green-400" : "text-gray-500"}`}>
                      {String.fromCharCode(65 + i)}. {o}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuiz;
