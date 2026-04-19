export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) return res.status(500).json({ error: "GROQ_API_KEY not configured" });

  const prompt = `Generate exactly 3 multiple choice quiz questions about astronomy and science.
Return ONLY a valid JSON array, no markdown, no explanation, just pure JSON:
[
  {
    "question": "question text",
    "options": ["A. option1", "B. option2", "C. option3", "D. option4"],
    "correctAnswer": 0,
    "explanation": "brief explanation",
    "difficulty": "easy",
    "category": "Astronomy"
  }
]
Topics: planets, stars, galaxies, black holes, space exploration, physics, chemistry, biology.
Vary difficulty: 1 easy, 1 medium, 1 hard. Make them educational and interesting.`;

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
      return res.status(groqRes.status).json({ error: "Groq error: " + errText });
    }

    const data = await groqRes.json();
    const raw = data.choices?.[0]?.message?.content || "";

    // Bersihkan markdown kalau ada
    const cleaned = raw.replace(/```json|```/g, "").trim();

    // Cari array JSON
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (!match) return res.status(500).json({ error: "Invalid response format from Groq", raw });

    const questions = JSON.parse(match[0]);

    // Validasi struktur
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(500).json({ error: "No questions generated" });
    }

    return res.status(200).json({ questions, generatedAt: new Date().toISOString() });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
