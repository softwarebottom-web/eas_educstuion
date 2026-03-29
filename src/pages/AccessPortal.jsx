import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import IDCard from "../component/IDCard";

const WHATSAPP = {
  1: "https://chat.whatsapp.com/DMSABsZCPC77nkFdzphbNH",
  2: "https://chat.whatsapp.com/JuLtO0VsqxDHUSHNrNjQZN"
};

const AccessPortal = () => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const data = localStorage.getItem("eas_user_data");

    if (!data) {
      navigate("/register");
      return;
    }

    try {
      setUserData(JSON.parse(data));
    } catch {
      localStorage.removeItem("eas_user_data");
      navigate("/register");
    }
  }, []);

  if (!userData) {
    return <div className="text-white text-center mt-20">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white gap-6 p-6">

      <IDCard data={userData} gen={userData.gen} />

      <a
        href={WHATSAPP[userData.gen]}
        target="_blank"
        className="bg-green-600 px-5 py-3 rounded-xl"
      >
        Join WA GEN {userData.gen}
      </a>

    </div>
  );
};

export default AccessPortal;
