import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Scale, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";

// 🔊 Sound helper — Web Audio API, no file needed
const playSound = (type = "click") => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "click") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === "open") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === "success") {
      // Chord arpeggio
      [523, 659, 784].forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.type = "sine";
        o.frequency.value = freq;
        g.gain.setValueAtTime(0, ctx.currentTime + i * 0.08);
        g.gain.linearRampToValueAtTime(0.15, ctx.currentTime + i * 0.08 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.2);
        o.start(ctx.currentTime + i * 0.08);
        o.stop(ctx.currentTime + i * 0.08 + 0.2);
      });
      return;
    } else if (type === "nav") {
      osc.type = "square";
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    }
  } catch (_) {}
};

const Intro = ({ onFinish }) => {
  const [step, setStep] = useState(1);
  const [openPasal, setOpenPasal] = useState(null);

  const togglePasal = (id) => {
    playSound("open");
    setOpenPasal(openPasal === id ? null : id);
  };

  const playWelcomeSound = () => {
    const audio = new Audio("/assets/welcome.mp3");
    audio.volume = 0.5;
    audio.play().catch(() => {});
  };

  const handleStart = () => {
    playSound("success");
    playWelcomeSound();
    setTimeout(() => setStep(2), 200);
  };

  const handleFinish = () => {
    playSound("success");
    setTimeout(() => onFinish(), 300);
  };

  const UUD_DATA = [
    { id: 1, title: "Pasal 1: Identitas", content: "• Setiap anggota memiliki hak untuk menjaga identitas masing-masing.\n• Dilarang mengejek identitas satu sama lain.\n• Dilarang menyebarkan identitas sesama anggota tanpa izin resmi." },
    { id: 2, title: "Pasal 2: Anggota", content: "• Hak mendapatkan ilmu, kebahagiaan, dan berbicara.\n• Wajib patuhi aturan dan terima konsekuensi.\n• Bebas stiker (non-dewasa).\n• Dilarang mengaku Admin/memberi SP." },
    { id: 3, title: "Pasal 3: Admin/Petinggi", content: "• Wajib jalankan tugas tertib.\n• Dilarang mengejek member/admin lain.\n• Wajib patuhi aturan & terima konsekuensi melanggar." },
    { id: 4, title: "Pasal 4: SP (Surat Peringatan)", content: "• Pelanggaran 2x (SP 1: Nasihat).\n• Pelanggaran 4x (SP 2: Teguran kecil).\n• SP 3 (Teguran keras).\n• SP 4 (Kick sementara).\n• SP 5 (Blacklist Permanen)." },
    { id: 5, title: "Pasal 5: Pendidikan", content: "• Admin wajib beri materi & quiz 1x sehari.\n• Member berhak tanya & koreksi materi.\n• Admin wajib koreksi jawaban member." },
    { id: 6, title: "Pasal 6 & 7: Keamanan & Rapat", content: "• Admin tanggung jawab keamanan.\n• Rapat dipimpin Admin, keputusan untuk kepentingan bersama.\n• Member berhak sampaikan pendapat logis." },
    { id: 8, title: "Pasal 8: Perkataan & Sikap", content: "• Dilarang bermesraan (sesama/lawan jenis).\n• Dilarang rasis, pelecehan, & mencari pacar/mesum." },
    { id: 9, title: "Pasal 9-12: Jabatan & Promosi", content: "• Admin tidak on 1 minggu = Copot jabatan.\n• Member berhak buat grup jika berguna.\n• Promosi wajib izin Admin. Link Phising = SP 5." },
  ];

  const SANKSI_DATA = [
    { type: "Member", items: ["Toxic: SP 3", "Spam Stiker: SP 2-4", "Stiker Jomok: SP 3", "Rusuh: SP 3-5", "Langgar UUD: SP 3-5"] },
    { type: "Admin", items: ["Haus Kekuasaan: SP 3-5", "Rusuh/Tidak Profesional: SP 4", "Kick Tanpa Alasan: SP 5/Copot Jabatan", "Toxic: SP 3"] },
    { type: "Petinggi", items: ["Haus Kekuasaan: SP 5", "Tindakan Tanpa Alasan: SP 5", "Tidak Profesional: SP 4/Turun Jabatan"] }
  ];

  const ADMIN_STRUCTURE = [
    { role: "Owner", name: "Shadow", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" },
    { role: "Co-Owner", name: "Wendy", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30" },
    { role: "Co-Owner", name: "Dr. Ryneford", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30" },
    { role: "Admin", name: "ALZZ", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
    { role: "Admin", name: "Fii", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
    { role: "Admin", name: "Nay", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
  ];

  const EDITOR_STRUCTURE = [
    { role: "Ketua Editor", name: "Zef", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/30" },
    { role: "Wakil Editor", name: "Dani", color: "text-purple-300", bg: "bg-purple-500/10 border-purple-500/30" },
    { role: "Admin Editor", name: "Neo", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/30" },
    { role: "Admin Editor", name: "Hani", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/30" },
  ];

  return (
    <div className="min-h-screen bg-[#00050d] text-white flex items-center justify-center p-4">
      <AnimatePresence mode="wait">

        {step === 1 && (
          <motion.div
            key="logo"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -50 }}
            className="text-center"
          >
            <div className="w-40 h-40 mx-auto mb-6 rounded-full overflow-hidden border-2 border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.3)]">
              <video
                src="/assets/intro.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.parentElement.innerHTML = '<img src="/assets/logo_eas.png" class="w-full h-full object-contain p-4 animate-pulse" />';
                }}
              />
            </div>

            <h1 className="text-3xl font-black tracking-[0.5em] text-blue-500">EAS PORTAL</h1>
            <p className="text-[10px] text-gray-600 tracking-widest mt-2 uppercase">Extra-Atmospheric Studies</p>

            <motion.button
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.05 }}
              onClick={handleStart}
              className="mt-10 px-8 py-3 bg-blue-600 rounded-full font-bold hover:bg-cyan-500 transition"
            >
              READ CONSTITUTION
            </motion.button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="uud"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-lg bg-gray-900/50 border border-blue-900 rounded-3xl p-6 h-[85vh] flex flex-col"
          >
            <div className="flex items-center gap-2 mb-6 border-b border-blue-900 pb-4">
              <Scale className="text-blue-400" />
              <h2 className="font-black tracking-widest uppercase">Undang-Undang Marga EAS</h2>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {UUD_DATA.map((item) => (
                <div key={item.id} className="border border-gray-800 rounded-xl overflow-hidden">
                  <button
                    onClick={() => togglePasal(item.id)}
                    className="w-full p-4 flex justify-between items-center bg-black/40 text-left"
                  >
                    <span className="text-xs font-bold uppercase text-blue-300">{item.title}</span>
                    {openPasal === item.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {openPasal === item.id && (
                    <div className="p-4 text-[11px] leading-relaxed text-gray-400 bg-black/20 whitespace-pre-line">
                      {item.content}
                    </div>
                  )}
                </div>
              ))}

              {/* SANKSI */}
              <div className="mt-8">
                <div className="flex items-center gap-2 text-red-500 mb-4 font-bold uppercase italic">
                  <ShieldAlert size={18} /> Protocol Sanksi
                </div>
                {SANKSI_DATA.map((s, idx) => (
                  <div key={idx} className="mb-4 bg-red-950/10 border border-red-900/30 p-4 rounded-xl">
                    <p className="text-[10px] font-black text-red-400 mb-2 underline tracking-widest">
                      SANKSI {s.type.toUpperCase()}
                    </p>
                    <ul className="space-y-1">
                      {s.items.map((txt, i) => (
                        <li key={i} className="text-[10px] text-gray-400">• {txt}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* STRUKTUR ADMIN */}
              <div className="mt-8">
                <p className="text-[10px] font-black text-yellow-400 tracking-widest uppercase mb-4">✨ Struktur Admin</p>
                <div className="space-y-2">
                  {ADMIN_STRUCTURE.map((s, i) => (
                    <div key={i} className={`flex justify-between items-center p-3 rounded-xl border ${s.bg}`}>
                      <span className="text-[10px] text-gray-500 uppercase font-bold">{s.role}</span>
                      <span className={`text-[11px] font-black ${s.color}`}>{s.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* STRUKTUR EDITOR */}
              <div className="mt-6 mb-4">
                <p className="text-[10px] font-black text-purple-400 tracking-widest uppercase mb-4">👑 Struktur Editor</p>
                <div className="space-y-2">
                  {EDITOR_STRUCTURE.map((s, i) => (
                    <div key={i} className={`flex justify-between items-center p-3 rounded-xl border ${s.bg}`}>
                      <span className="text-[10px] text-gray-500 uppercase font-bold">{s.role}</span>
                      <span className={`text-[11px] font-black ${s.color}`}>{s.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.02 }}
              onClick={handleFinish}
              className="mt-6 w-full py-4 bg-green-600 rounded-2xl font-black tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-green-500 transition"
            >
              <CheckCircle2 size={20} /> SAYA PATUH & SETUJU
            </motion.button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export { playSound };
export default Intro;
