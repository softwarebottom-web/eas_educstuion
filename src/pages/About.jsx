const About = () => (
  <div className="min-h-screen bg-black text-white p-10 flex flex-col items-center justify-center text-center">
    <img src="/assets/logo-eas.png" className="w-32 mb-6 animate-pulse" />
    <h1 className="text-2xl font-bold text-blue-500 mb-4 tracking-[0.3em]">ABOUT EAS EDUCATION</h1>
    <div className="max-w-md space-y-4 text-gray-400 text-sm leading-relaxed">
      <p>
        EAS (Extra-Atmospheric Studies) adalah platform edukasi independen yang berfokus pada 
        pengembangan data hipotesis, riset astronomi, dan pengarsipan tesis luar angkasa.
      </p>
      <p className="text-[10px] border-t border-blue-900 pt-4 uppercase">
        Developed for the next generation of researchers. <br/>
        Founder: Zane | Dev: FSF
      </p>
    </div>
  </div>
);

export default About;
