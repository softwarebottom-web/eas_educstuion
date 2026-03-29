import { useState, useEffect } from "react";
import { db } from "../api/config";
import { doc, getDoc } from "firebase/firestore";

const QuizMember = () => {
  const [quiz, setQuiz] = useState(null);
  const [userAnswer, setUserAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  useEffect(() => {
    const fetchTodayQuiz = async () => {
      // Ambil tanggal hari ini format YYYY-MM-DD
      const today = new Date().toISOString().split('T')[0];
      const snap = await getDoc(doc(db, "daily_quizzes", today));
      
      if (snap.exists()) {
        setQuiz(snap.data());
      }
    };
    fetchTodayQuiz();
  }, []);

  const handleSubmit = () => {
    if (userAnswer === quiz.correctAnswer) {
      setIsCorrect(true);
      alert("Jawaban Benar! Anda mendapatkan poin riset.");
    } else {
      setIsCorrect(false);
      alert("Jawaban Salah. Teruslah belajar, Researcher!");
    }
  };

  if (!quiz) return (
    <div className="h-screen flex items-center justify-center text-gray-600 italic text-sm">
      Admin belum merilis quiz untuk hari ini...
    </div>
  );

  return (
    <div className="p-6 text-white bg-[#00050d] min-h-screen">
      <div className="bg-blue-900/10 border border-blue-900 p-6 rounded-3xl">
        <h3 className="text-blue-500 font-black mb-6 uppercase tracking-tighter italic">Daily Mission</h3>
        <p className="text-lg font-medium mb-8 leading-relaxed">{quiz.question}</p>
        
        <div className="space-y-3">
          {quiz.options.map((opt, i) => (
            <button 
              key={i}
              disabled={isCorrect !== null}
              onClick={() => setUserAnswer(i)}
              className={`w-full p-4 rounded-xl text-left transition-all border ${
                userAnswer === i ? 'border-blue-500 bg-blue-600/20' : 'border-gray-800 bg-black/40'
              }`}
            >
              <span className="text-[10px] mr-3 opacity-30">{String.fromCharCode(65 + i)}</span>
              {opt}
            </button>
          ))}
        </div>

        {isCorrect === null && (
          <button 
            onClick={handleSubmit}
            className="w-full mt-10 bg-blue-600 p-4 rounded-2xl font-black tracking-widest"
          >
            SUBMIT ANSWER
          </button>
        )}
      </div>
    </div>
  );
};
