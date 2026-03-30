import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Award, Globe } from "lucide-react";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#00050d] text-white p-6 flex flex-col items-center justify-center relative overflow-hidden font-mono">
      
      {/* BACKGROUND DECORATION */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* BACK BUTTON */}
      <button 
        onClick={() => navigate("/")}
        className="absolute top-8 left-8 p-3 bg-blue-950/20 border border-blue-900/30 rounded-2xl text-blue-500 hover:bg-blue-600 hover:text-white transition-all active:scale-90"
      >
        <ArrowLeft size={20} />
      </button>

      {/* LOGO & TITLE */}
      <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <img 
          src="/assets/logo-eas.png" 
          className="w-28 mx-auto mb-6 drop-shadow-[0_0_25px_rgba(59,130,246,0.3)] animate-pulse" 
          alt="EAS Logo" 
        />
        <h1 className="text-xl font-black text-blue-500 tracking-[0.4em] uppercase italic">
          ABOUT EAS SYSTEM
        </h1>
        <p className="text-[9px] text-gray-600 tracking-[0.2em] mt-2 uppercase font-bold">
          Satellite Education & Research Protocol
        </p>
      </div>

      {/* MAIN CONTENT CARD */}
      <div className="max-w-md w-full p-8 bg-blue-950/5 border border-blue-900/20 rounded-[2.5rem] backdrop-blur-xl shadow-2xl space-y-6 text-center animate-in fade-in zoom-in duration-1000">
        <p className="text-xs text-gray-400 leading-relaxed font-medium">
          EAS (Extra-Atmospheric Studies) adalah platform edukasi independen yang berfokus pada 
          pengembangan data hipotesis, riset astronomi, dan pengarsipan tesis luar angkasa.
        </p>

        <div className="grid grid-cols-2 gap-4 py-4 border-y border-blue-900/20">
          <div className="space-y-1">
            <Globe size={14} className="mx-auto text-cyan-500 mb-1" />
            <p className="text-[8px] text-gray-500 uppercase font-black">Core Mission</p>
            <p className="text-[10px] text-gray-200 font-bold uppercase italic">Space Archive</p>
          </div>
          <div className="space-y-1">
            <Award size={14} className="mx-auto text-blue-500 mb-1" />
            <p className="text-[8px] text-gray-500 uppercase font-black">Status</p>
            <p className="text-[10px] text-gray-200 font-bold uppercase italic">Independent</p>
          </div>
        </div>

        {/* DEVELOPER SIGNATURE */}
        <div className="pt-4 space-y-2">
          <p className="text-[8px] text-gray-600 uppercase tracking-[0.5em] font-black">
            Developed For Next Gen Researchers
          </p>
          <div className="bg-blue-600/10 p-3 rounded-2xl border border-blue-500/20">
            <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest italic">
              Lead Dev: M. Fikri Surya Firdaus
            </p>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="mt-12 opacity-10">
        <p className="text-[7px] font-black tracking-[1.5em] uppercase">Security Protocol • v3.0</p>
      </footer>
    </div>
  );
};

export default About;
