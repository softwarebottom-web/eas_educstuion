import { useState, useEffect } from "react";
import { db } from "../api/config";
import { doc, getDoc } from "firebase/firestore";

// PERBAIKAN: Nama fungsi harus sama dengan yang di-export
const Quiz = () => {
  const [quiz, setQuiz] = useState(null);
  const [userAnswer, setUserAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodayQuiz = async () => {
      try {
        // Ambil tanggal hari ini format YYYY-MM-DD
        const today = new Date().toISOString().split('T')[0];
        const snap = await getDoc(doc(db, "daily_quizzes", today));
        
        if (snap.exists()) {
          setQuiz(snap.data());
        }
      } catch (error) {
        console.error("Error fetching quiz:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTodayQuiz();
  }, []);

  const handleSubmit = () => {
    if (userAnswer === null) return alert("Pilih jawaban dulu, Researcher!");
    
    if (userAnswer === quiz.correctAnswer) {
      setIsCorrect(true);
      alert("Jawaban Benar! Anda mendapatkan poin riset.");
    } else {
      setIsCorrect(false);
      alert("Jawaban Salah. Teruslah belajar!");
    }
  };

  if (loading) return (
    <div className="h-screen bg-[#00050d] flex items-center justify-center">
      <div className="text-blue-500 font-black animate-pulse tracking-widest text-[10px]">SCANNING DATA VAULT...</div>
    </div>
  );

  if (!quiz) return (
    <div className="h-screen bg-[#00050d] flex items-center justify-center text-gray-600 italic text-sm p-10 text-center">
      Belum ada misi (quiz) yang dirilis untuk hari ini. Silakan kembali lagi nanti.
    </div>
  );

  return (
    <div className="p-6 text-white bg-[#00050d] min-h-screen pb-24">
      <div className="bg-blue-900/10 border border-blue-900/40 p-6 rounded-3xl shadow-[0_0_50px_rgba(30,58,138,0.1)]">
        <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
            <h3 className="text-blue-500 font-black uppercase tracking-tighter italic text-sm">Daily Mission</h3>
        </div>
        
        <p className="text-lg font-medium mb-8 leading-relaxed tracking-tight">{quiz.question}</p>
        
        <div className="space-y-3">
          {quiz.options.map((opt, i) => (
            <button 
              key={i}
              disabled={isCorrect !== null}
              onClick={() => setUserAnswer(i)}
              className={`w-full p-4 rounded-xl text-left transition-all border duration-300 ${
                userAnswer === i 
                ? 'border-blue-500 bg-blue-600/20 text-blue-100' 
                : 'border-blue-900/20 bg-black/40 text-gray-400 hover:border-blue-900'
              }`}
            >
              <span className="text-[10px] mr-3 font-mono opacity-50">{String.fromCharCode(65 + i)}</span>
              {opt}
            </button>
          ))}
        </div>

        {isCorrect === null && (
          <button 
            onClick={handleSubmit}
            className="w-full mt-10 bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-2xl font-black tracking-[0.2em] transition-all active:scale-95 shadow-lg shadow-blue-900/20"
          >
            SUBMIT ANSWER
          </button>
        )}

        {isCorrect !== null && (
            <div className={`mt-6 p-4 rounded-xl text-center font-bold text-xs uppercase tracking-widest border ${isCorrect ? 'border-green-500/50 bg-green-500/10 text-green-500' : 'border-red-500/50 bg-red-500/10 text-red-500'}`}>
                {isCorrect ? 'Mission Accomplished' : 'Mission Failed'}
            </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;
                  
