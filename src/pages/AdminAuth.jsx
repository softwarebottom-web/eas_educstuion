import { useState } from "react";
import { jsPDF } from "jspdf";
import { Lock, ShieldCheck, AlertTriangle } from "lucide-react";

const AdminAuth = ({ onAuthSuccess }) => {
  const [input, setInput] = useState({ user: "", pass: "" });
  const [error, setError] = useState("");

  // 1. Ambil List User dari Env dan pecah jadi Array
  const ADMIN_LIST_RAW = import.meta.env.VITE_ADMIN_USER_LIST || "";
  const ADMIN_ARRAY = ADMIN_LIST_RAW.split(",").map(name => name.trim().toLowerCase());
  const MASTER_PW = import.meta.env.VITE_ADMIN_PW;

  const handleLogin = (e) => {
    e.preventDefault();
    const inputUser = input.user.trim().toLowerCase();

    // 2. Cek apakah Username ada di Array & Password Benar
    if (ADMIN_ARRAY.includes(inputUser) && input.pass === MASTER_PW) {
      
      // Simpan identitas spesifik siapa yang login
      localStorage.setItem("eas_admin_token", "SUPER_ADMIN_GRANTED_2026");
      localStorage.setItem("eas_active_staff", input.user); // Nama asli (bukan lowercase)
      
      // Auto Download PDF untuk Staff tersebut
      generateAdminPDF(input.user);
      
      onAuthSuccess();
    } else {
      setError("AKSES DITOLAK: Identitas Staff tidak terdaftar!");
    }
  };

  const generateAdminPDF = (username) => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: [100, 60] });
    
    // Background Hitam Elegan
    doc.setFillColor(5, 10, 20); doc.rect(0, 0, 100, 60, "F");
    
    // Header
    doc.setTextColor(59, 130, 246); doc.setFont("helvetica", "bold");
    doc.setFontSize(12); doc.text("EAS HIGH COMMAND", 10, 15);
    doc.setDrawColor(59, 130, 246); doc.line(10, 18, 90, 18);
    
    // Staff Info
    doc.setTextColor(255, 255, 255); doc.setFontSize(9);
    doc.text(`STAFF NAME : ${username.toUpperCase()}`, 10, 30);
    doc.text(`SECURITY LVL: OVERRIDE 05`, 10, 38);
    doc.text(`STATUS      : AUTHORIZED STAFF`, 10, 46);
    
    // Footer Watermark
    doc.setTextColor(40, 40, 40); doc.setFontSize(7);
    doc.text("PROPERTY OF MARGA EAS - 2026", 10, 55);
    
    doc.save(`EAS_STAFF_CARD_${username.replace(" ", "_")}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#00050d] flex items-center justify-center p-6 font-mono">
      <div className="w-full max-w-sm p-8 bg-black border-2 border-blue-900 rounded-3xl shadow-[0_0_50px_rgba(30,58,138,0.3)]">
        <div className="flex flex-col items-center mb-8">
          <ShieldCheck className="text-blue-500 mb-2" size={50} />
          <h2 className="text-xl font-black tracking-widest text-white uppercase italic">Staff Login</h2>
          <div className="h-1 w-20 bg-blue-600 mt-1"></div>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-[10px] text-blue-400 font-bold mb-1 block uppercase">Identitas Petinggi</label>
            <input 
              required type="text" placeholder="Masukkan Nama Staff..." 
              className="w-full p-3 bg-gray-900/50 border border-gray-800 rounded-xl text-white outline-none focus:border-blue-500 transition-all"
              onChange={(e) => setInput({...input, user: e.target.value})}
            />
          </div>

          <div>
            <label className="text-[10px] text-blue-400 font-bold mb-1 block uppercase">Kode Akses 2026</label>
            <input 
              required type="password" placeholder="••••••" 
              className="w-full p-3 bg-gray-900/50 border border-gray-800 rounded-xl text-white outline-none focus:border-blue-500"
              onChange={(e) => setInput({...input, pass: e.target.value})}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-[10px] bg-red-500/10 p-2 rounded">
              <AlertTriangle size={12}/> {error}
            </div>
          )}
          
          <button className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-black text-xs tracking-widest transition-transform active:scale-95 flex items-center justify-center gap-2 border-b-4 border-blue-800">
             VERIFY & GENERATE ID CARD <Lock size={14}/>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminAuth;
