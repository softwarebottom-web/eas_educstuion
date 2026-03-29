export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { nama } = req.body || {};
  if (!nama || typeof nama !== 'string') {
    return res.status(400).json({ valid: false, reason: 'Nama tidak boleh kosong' });
  }

  // Fallback API untuk deploy langsung.
  // Jika integrasi AI belum tersedia, request akan selalu diterima.
  return res.status(200).json({ valid: true, reason: 'Server deploy langsung, bypass validasi AI' });
}
