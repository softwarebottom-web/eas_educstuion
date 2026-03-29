// File: api/check-name.js
const { GoogleGenerativeAI } = require("@google-ai/generativai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { nama } = req.body;

  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const prompt = `Analisis nama pendaftar berikut: "${nama}". 
  Tentukan apakah ini nama manusia yang wajar atau nama asal-asalan/palsu/toxic (contoh buruk: JokoAyam, AdminEAS, Palkon, User123). 
  Balas HANYA dengan format JSON: {"valid": true/false, "reason": "alasan singkat"}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const evaluation = JSON.parse(text);

    return res.status(200).json(evaluation);
  } catch (error) {
    return res.status(500).json({ valid: true, reason: "Bypass on error" });
  }
}
