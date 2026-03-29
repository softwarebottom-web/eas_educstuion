import { useState } from "react";
import { Lock, Search } from "lucide-react";

const AccessPortal = ({ onVerified }) => {
  const [checking, setChecking] = useState(false);

  const handleUploadID = (e) => {
    setChecking(true);
    const file = e.target.files[0];
    
    // Simulasi Scanning (Bisa dikembangkan dengan Library QR Scanner)
    setTimeout(() => {
      if (file) {
        alert("ID VALID: Akses Laboratorium Terbuka!");
        onVerified(true);
      }
      setChecking(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm p-8 border border-dashed border-gray-700 rounded-3xl text-center">
        <div className="bg-gray-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
          {checking ? <Search className="animate-spin text-blue-500" /> : <Lock className="text-gray-500" />}
        </div>
        
        <h2 className="text-xl font-bold mb-2">RESTRICTED AREA</h2>
        <p className="text-xs text-gray-500 mb-8 px-4">
          Silahkan upload ID Card EAS Anda untuk memverifikasi hak akses Quiz & Library.
        </p>

        <label className="block w-full bg-blue-600 py-3 rounded-xl font-bold cursor-pointer hover:bg-blue-500 transition">
          {checking ? "SCANNING DATA..." : "UPLOAD ID CARD"}
          <input type="file" className="hidden" accept="image/*" onChange={handleUploadID} />
        </label>
      </div>
    </div>
  );
};
// Di baris paling akhir file AccessPortal.jsx
export default AccessPortal; 

