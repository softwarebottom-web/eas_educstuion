import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Search } from "lucide-react";
import IdCard from "../component/IdCard";

const AccessPortal = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("eas_user_data");

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUserData(parsed);
      } catch (err) {
        console.error("JSON error:", err);
      }
    }
  }, []);

  const handleUploadID = (e) => {
    setChecking(true);
    const file = e.target.files[0];

    setTimeout(() => {
      if (file) {
        localStorage.setItem("eas_verified", "true");
        alert("ID VALID: Akses Terbuka!");
        navigate("/");
      }
      setChecking(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#00050d] text-white flex flex-col items-center justify-center p-6 gap-8">

      {/* ✅ ID CARD MUNCUL */}
      {userData !== null && (
        <div className="flex flex-col items-center">
          <h1 className="text-xs text-blue-500 mb-4 uppercase">
            ID Generated
          </h1>

          <IdCard data={userData} />

          <p className="mt-4 text-xs text-gray-500 text-center">
            Screenshot / simpan ID ini
          </p>
        </div>
      )}

      {/* UPLOAD */}
      <div className="w-full max-w-sm p-6 border rounded-xl text-center">
        <div className="mb-4">
          {checking ? <Search /> : <Lock />}
        </div>

        <input type="file" onChange={handleUploadID} />
      </div>

    </div>
  );
};

export default AccessPortal;
