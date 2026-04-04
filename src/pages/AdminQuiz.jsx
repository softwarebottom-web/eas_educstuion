import { useState } from "react";
import { db } from "../api/config";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { Save, PlusCircle } from "lucide-react";

const AdminQuiz = () => {
  const [loading, setLoading] = useState(false);

  const [quizData, setQuizData] = useState({
    date: new Date().toISOString().split("T")[0],
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0
  });

  const saveQuiz = async () => {
    if (loading) return;

    // 🔐 VALIDASI KERAS
    if (quizData.question.trim().length < 10) {
      return alert("Pertanyaan minimal 10 karakter!");
    }

    if (quizData.options.some(opt => opt.trim().length < 1)) {
      return alert("Semua opsi wajib diisi!");
    }

    setLoading(true);

    try {
      const ref = doc(db, "daily_quizzes", quizData.date);

      // 🔍 CEK EXISTING DATA
      const existing = await getDoc(ref);

      if (existing.exists()) {
        const confirmOverwrite = window.confirm(
          "Quiz tanggal ini sudah ada. Mau overwrite?"
        );
        if (!confirmOverwrite) {
          setLoading(false);
          return;
        }
      }

      // 🔥 FINAL DATA (ADA METADATA)
      const finalData = {
        ...quizData,
        createdAt: new Date().toISOString(),
        createdBy: localStorage.getItem("eas_active_staff") || "unknown",
        status: "active" // bisa future: draft / archived
      };

      await setDoc(ref, finalData);

      alert(`Quiz ${quizData.date} berhasil dipublish 🚀`);

    } catch (err) {
      console.error(err);
      alert("Gagal simpan: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h2 className="text-xl font-bold mb-6 text-blue-500 flex items-center gap-2">
        <PlusCircle /> MANAGEMENT QUIZ HARIAN
      </h2>

      <div className="space-y-4 bg-black/40 p-6 rounded-2xl border border-blue-900">

        {/* DATE */}
        <input
          type="date"
          value={quizData.date}
          onChange={(e) =>
            setQuizData({ ...quizData, date: e.target.value })
          }
          className="w-full p-3 bg-gray-900 rounded border border-gray-800"
        />

        {/* QUESTION */}
        <textarea
          placeholder="Tulis pertanyaan..."
          className="w-full p-3 bg-gray-900 rounded border border-gray-800 h-24"
          onChange={(e) =>
            setQuizData({ ...quizData, question: e.target.value })
          }
        />

        {/* OPTIONS */}
        {quizData.options.map((opt, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              type="radio"
              checked={quizData.correctAnswer === i}
              onChange={() =>
                setQuizData({ ...quizData, correctAnswer: i })
              }
            />
            <input
              type="text"
              placeholder={`Opsi ${i + 1}`}
              className="flex-1 p-2 bg-gray-900 border border-gray-800 rounded"
              onChange={(e) => {
                const newOpts = [...quizData.options];
                newOpts[i] = e.target.value;
                setQuizData({ ...quizData, options: newOpts });
              }}
            />
          </div>
        ))}

        {/* BUTTON */}
        <button
          onClick={saveQuiz}
          disabled={loading}
          className="w-full bg-blue-600 p-4 rounded-xl font-black hover:bg-cyan-500 transition"
        >
          {loading ? "Saving..." : "PUBLISH QUIZ"}
        </button>

      </div>
    </div>
  );
};

export default AdminQuiz;
