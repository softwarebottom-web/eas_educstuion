export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  if (!GROQ_API_KEY) {
    return res.status(500).json({
      error: "GROQ_API_KEY belum diset di Vercel Environment Variables",
      hint: "Tambahkan GROQ_API_KEY di Vercel → Settings → Environment Variables lalu redeploy"
    });
  }

  const prompt = `Generate exactly 3 multiple choice quiz questions about astronomy and science.
Return ONLY a valid JSON array, no markdown, no code blocks, just raw JSON:
[
  {
    "question": "question text here",
    "options": ["A. option1", "B. option2", "C. option3", "D. option4"],
    "correctAnswer": 1,
    "explanation": "explanation here",
    "difficulty": "easy",
    "category": "Astronomy"
  }
]
Rules: exactly 3 questions, 4 options each starting with A/B/C/D, correctAnswer is 0-indexed integer, difficulty must be easy/medium/hard, topics: planets stars galaxies black holes space exploration physics chemistry biology. Mix difficulties: 1 easy, 1 medium, 1 hard.`;

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      return res.status(groqRes.status).json({
        error: "Groq API error " + groqRes.status,
        detail: errText,
        hint: groqRes.status === 401
          ? "API key salah atau expired — cek di console.groq.com"
          : groqRes.status === 429
          ? "Rate limit — tunggu sebentar lalu coba lagi"
          : "Groq service issue"
      });
    }

    const data = await groqRes.json();
    const raw = data.choices?.[0]?.message?.content || "";

    // Bersihkan response
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const match = cleaned.match(/\[[\s\S]*\]/);

    if (!match) {
      return res.status(500).json({
        error: "Groq tidak mengembalikan format JSON array yang valid",
        raw: raw.slice(0, 200)
      });
    }

    let questions;
    try {
      questions = JSON.parse(match[0]);
    } catch (e) {
      return res.status(500).json({ error: "Gagal parse JSON: " + e.message });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(500).json({ error: "Array soal kosong" });
    }

    // Normalize & validasi
    const normalized = questions.slice(0, 3).map((q, i) => ({
      question: q.question || `Soal ${i + 1}`,
      options: Array.isArray(q.options) && q.options.length === 4
        ? q.options
        : ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
      correctAnswer: typeof q.correctAnswer === "number" && q.correctAnswer >= 0 && q.correctAnswer <= 3
        ? q.correctAnswer : 0,
      explanation: q.explanation || "",
      difficulty: ["easy", "medium", "hard"].includes(q.difficulty) ? q.difficulty : "medium",
      category: q.category || "Astronomy",
    }));

    return res.status(200).json({ questions: normalized, generatedAt: new Date().toISOString() });

  } catch (err) {
    return res.status(500).json({ error: "Server error: " + err.message });
  }
}
