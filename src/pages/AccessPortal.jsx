import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Search } from "lucide-react";
import IdCard from "../component/IdCard";

const WHATSAPP_LINKS = {
  1: "https://chat.whatsapp.com/DMSABsZCPC77nkFdzphbNH",
  2: "https://chat.whatsapp.com/JuLtO0VsqxDHUSHNrNjQZN"
};

const AccessPortal = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("eas_user_data");

    if (saved) {
      try {
        setUserData(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleUploadID = (e) => {
    setChecking(true);

    setTimeout(() => {
      localStorage.setItem("eas_verified", "true");
      navigate("/");
      setChecking(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white gap-6">

      {/* ID CARD */}
      {userData && (
        <>
          <IdCard data={userData} />

          {/* 🔥 JOIN WA */}
          <a
            href={WHATSAPP_LINKS[userData.gen]}
            target="_blank"
            className="bg-green-600 px-6 py-3 rounded-xl font-bold text-sm hover:scale-105 transition"
          >
            JOIN WHATSAPP GROUP
          </a>
        </>
      )}

      {/* UPLOAD */}
      <input type="file" onChange={handleUploadID} />

    </div>
  );
};

export default AccessPortal;
