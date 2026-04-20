export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: "GROQ_API_KEY belum diset di Vercel Environment Variables" });
  }

  // ✅ Model terbaru yang aktif di Groq (April 2025)
  const MODELS = [
    "llama-3.1-8b-instant",
    "llama3-70b-8192",
    "mixtral-8x7b-32768",
    "gemma2-9b-it",
  ];

  const prompt = `You are a science quiz generator. Generate exactly 3 multiple choice questions about astronomy and science.

IMPORTANT: Return ONLY a JSON array. No explanation, no markdown, no code blocks. Start directly with [ and end with ].

Example format:
[{"question":"What is the largest planet?","options":["A. Earth","B. Jupiter","C. Saturn","D. Mars"],"correctAnswer":1,"explanation":"Jupiter is the largest planet.","difficulty":"easy","category":"Astronomy"}]

Now generate 3 questions. Mix difficulties: 1 easy, 1 medium, 1 hard. Topics: planets, stars, black holes, galaxies, physics, space exploration.`;

  let lastError = null;

  // Coba setiap model sampai berhasil
  for (const model of MODELS) {
    try {
      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: "You are a quiz generator. Always respond with valid JSON arrays only, no other text."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.5,
          max_tokens: 1200,
        }),
      });

      if (!groqRes.ok) {
        const errText = await groqRes.text();
        lastError = `Model ${model} error ${groqRes.status}: ${errText.slice(0, 100)}`;
        continue; // coba model berikutnya
      }

      const data = await groqRes.json();
      const raw = data.choices?.[0]?.message?.content || "";

      // Bersihkan response
      const cleaned = raw.replace(/```json|```/g, "").trim();

      // Cari JSON array
      const match = cleaned.match(/\[[\s\S]*\]/);
      if (!match) {
        lastError = `Model ${model}: format bukan JSON array`;
        continue;
      }

      let questions;
      try {
        questions = JSON.parse(match[0]);
      } catch (e) {
        lastError = `Model ${model}: parse error - ${e.message}`;
        continue;
      }

      if (!Array.isArray(questions) || questions.length === 0) {
        lastError = `Model ${model}: array kosong`;
        continue;
      }

      // Normalize
      const normalized = questions.slice(0, 3).map((q, i) => ({
        question: q.question || `Soal ${i + 1}`,
        options: Array.isArray(q.options) && q.options.length >= 4
          ? q.options.slice(0, 4)
          : ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
        correctAnswer: typeof q.correctAnswer === "number" && q.correctAnswer >= 0 && q.correctAnswer <= 3
          ? q.correctAnswer : 0,
        explanation: q.explanation || "",
        difficulty: ["easy","medium","hard"].includes(q.difficulty) ? q.difficulty : "medium",
        category: q.category || "Astronomy",
      }));

      // Berhasil
      return res.status(200).json({
        questions: normalized,
        model,
        generatedAt: new Date().toISOString(),
      });

    } catch (err) {
      lastError = `Model ${model} exception: ${err.message}`;
      continue;
    }
  }

  // Semua model gagal
  return res.status(500).json({
    error: "Semua model Groq gagal",
    lastError,
    hint: "Cek console.groq.com untuk status model yang tersedia"
  });
}
