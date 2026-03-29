// File: api/check-name.js
export default async function handler(req, res) {
  // 1. Validasi Method (Hanya terima POST)
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { nama } = req.body;
  const apiKey = process.env.VITE_OPENROUTER_KEY; // Pastikan sudah diset di Vercel

  if (!nama) {
    return res.status(400).json({ valid: false, reason: "Identitas Kosong" });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://eas-education.vercel.app", // Opsional: URL web lu
        "X-Title": "EAS Education Portal"
      },
      body: JSON.stringify({
        "model": "google/gemini-2.0-flash-001", // Model kenceng & murah
        "messages": [
          {
            "role": "system", 
            "content": "Kamu adalah AI Security Portal EAS Education. Tugasmu memvalidasi nama pendaftar. Nama harus wajar (nama manusia asli). Tolak nama asal-asalan, angka saja, atau kata kasar. Balas HANYA dengan JSON mentah: {\"valid\": true, \"reason\": \"...\"}"
          },
          {
            "role": "user", 
            "content": `Cek nama ini: "${nama}"`
          }
        ],
        "response_format": { "type": "json_object" } // Memaksa output JSON
      })
    });

    const data = await response.json();
    
    // Ambil teks jawaban dari OpenRouter
    const aiResponse = data.choices[0].message.content;
    const evaluation = JSON.parse(aiResponse);

    return res.status(200).json(evaluation);

  } catch (error) {
    console.error("OpenRouter Error:", error);
    // 2. Bypass: Kalau AI error, biarin lolos biar gak nge-block pendaftar asli
    return res.status(200).json({ 
      valid: true, 
      reason: "Bypass: System Busy (Check Manual by Admin)" 
    });
  }
}
