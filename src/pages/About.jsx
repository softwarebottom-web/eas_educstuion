import React from "react";

const About = () => (
  <div className="min-h-screen bg-[#00050d] text-white p-10 flex flex-col items-center justify-center text-center">
    {/* Logo Tetap Ada */}
    <img src="/assets/logo-eas.png" className="w-32 mb-6 animate-pulse" alt="EAS Logo" />
    
    <h1 className="text-2xl font-bold text-blue-500 mb-4 tracking-[0.3em]">ABOUT EAS EDUCATION</h1>
    
    <div className="max-w-md space-y-4 text-gray-400 text-sm leading-relaxed">
      <p>
        EAS (Extra-Atmospheric Studies) adalah platform edukasi independen yang berfokus pada 
        pengembangan data hipotesis, riset astronomi, dan pengarsipan tesis luar angkasa.
      </p>
      
      <div className="text-[10px] border-t border-blue-900/50 pt-4 uppercase tracking-widest space-y-1">
        <p>Developed for the next generation of researchers.</p>
        <p className="text-blue-400 font-bold">Lead Developer: M. Fikri Surya Firdaus</p>
      </div>
    </div>
  </div>
);

export default About;
