import { useState } from "react";
import { db } from "../api/config";
import { doc, setDoc } from "firebase/firestore";
import { Calendar, Save, PlusCircle } from "lucide-react";

const AdminQuiz = () => {
  const [quizData, setQuizData] = useState({
    date: new Date().toISOString().split('T')[0], // Default hari ini
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0
  });

  const saveQuiz = async () => {
    if (!quizData.question || quizData.options.some(opt => opt === "")) {
      alert("Mohon isi semua data quiz!");
      return;
    }

    try {
      // Kita gunakan 'date' sebagai Document ID agar sistem member otomatis ambil sesuai tanggal
      await setDoc(doc(db, "daily_quizzes", quizData.date), quizData);
      alert(`Quiz untuk tanggal ${quizData.date} Berhasil Disimpan!`);
    } catch (err) {
      alert("Gagal simpan: " + err.message);
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h2 className="text-xl font-bold mb-6 text-blue-500 flex items-center gap-2">
        <PlusCircle /> MANAGEMENT QUIZ HARIAN
      </h2>

      <div className="space-y-4 bg-black/40 p-6 rounded-2xl border border-blue-900">
        <div>
          <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Jadwal Tayang</label>
          <input 
            type="date" 
            className="w-full p-3 bg-gray-900 rounded border border-gray-800 outline-none focus:border-blue-500"
            value={quizData.date}
            onChange={(e) => setQuizData({...quizData, date: e.target.value})}
          />
        </div>

        <div>
          <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Pertanyaan Astronomi/EAS</label>
          <textarea 
            placeholder="Contoh: Apa nama galaksi tetangga terdekat Bima Sakti?"
            className="w-full p-3 bg-gray-900 rounded border border-gray-800 h-24 outline-none focus:border-blue-500"
            onChange={(e) => setQuizData({...quizData, question: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-1 gap-2">
          <label className="text-[10px] text-gray-500 uppercase font-bold">Opsi Jawaban (Klik radio untuk kunci jawaban)</label>
          {quizData.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input 
                type="radio" 
                name="correct" 
                checked={quizData.correctAnswer === i} 
                onChange={() => setQuizData({...quizData, correctAnswer: i})}
              />
              <input 
                type="text" 
                placeholder={`Opsi ${i + 1}`}
                className="flex-1 p-2 bg-gray-900 border border-gray-800 rounded text-sm"
                onChange={(e) => {
                  const newOpts = [...quizData.options];
                  newOpts[i] = e.target.value;
                  setQuizData({...quizData, options: newOpts});
                }}
              />
            </div>
          ))}
        </div>

        <button 
          onClick={saveQuiz}
          className="w-full bg-blue-600 p-4 rounded-xl font-black mt-4 hover:bg-cyan-500 transition flex items-center justify-center gap-2"
        >
          <Save size={18} /> PUBLISH QUIZ
        </button>
      </div>
    </div>
  );
};

export default AdminQuiz;
