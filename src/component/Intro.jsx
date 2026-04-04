import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Scale, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";

const Intro = ({ onFinish }) => {
  const [step, setStep] = useState(1);
  const [openPasal, setOpenPasal] = useState(null);

  const togglePasal = (id) => setOpenPasal(openPasal === id ? null : id);

  // 🔊 SOUND (dipanggil saat user klik, biar ga kena block browser)
  const playWelcomeSound = () => {
    const audio = new Audio("/assets/welcome.mp3");
    audio.volume = 0.5;
    audio.play().catch(() => {});
  };

  const handleStart = () => {
    playWelcomeSound();
    setStep(2);
  };

  // DATA UUD
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

  return (
    <div className="min-h-screen bg-[#00050d] text-white flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div 
            key="logo"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -50 }}
            className="text-center"
          >
            {/* ✅ FIX LOGO PATH */}
            <img src="/assets/logo_eas.png" className="w-32 mx-auto mb-6 animate-pulse" />

            <h1 className="text-3xl font-black tracking-[0.5em] text-blue-500">
              EAS PORTAL
            </h1>

            <button 
              onClick={handleStart}
              className="mt-10 px-8 py-3 bg-blue-600 rounded-full font-bold hover:bg-cyan-500 transition"
            >
              READ CONSTITUTION
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="uud"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-lg bg-gray-900/50 border border-blue-900 rounded-3xl p-6 h-[85vh] flex flex-col"
          >
            <div className="flex items-center gap-2 mb-6 border-b border-blue-900 pb-4">
              <Scale className="text-blue-400" />
              <h2 className="font-black tracking-widest uppercase">
                Undang-Undang Marga EAS
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {UUD_DATA.map((item) => (
                <div key={item.id} className="border border-gray-800 rounded-xl overflow-hidden">
                  <button 
                    onClick={() => togglePasal(item.id)}
                    className="w-full p-4 flex justify-between items-center bg-black/40 text-left"
                  >
                    <span className="text-xs font-bold uppercase text-blue-300">
                      {item.title}
                    </span>
                    {openPasal === item.id ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
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
                        <li key={i} className="text-[10px] text-gray-400">
                          • {txt}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={onFinish}
              className="mt-6 w-full py-4 bg-green-600 rounded-2xl font-black tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-green-500 transition"
            >
              <CheckCircle2 size={20} /> SAYA PATUH & SETUJU
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Intro;
