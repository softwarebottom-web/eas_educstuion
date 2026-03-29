import React from "react"; // Fix: Mencegah 'React is not defined' crash di Vercel
import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, LayoutGrid, User, ShieldCheck } from "lucide-react";

const Navbar = ({ isAdmin }) => {
  const location = useLocation();
  
  // Menggunakan label yang lebih profesional: Vault -> Library
  const navItems = [
    { path: "/", icon: <Home size={20}/>, label: "Home" },
    { path: "/library", icon: <BookOpen size={20}/>, label: "Library" },
    { path: "/quiz", icon: <LayoutGrid size={20}/>, label: "Mission" },
    { path: "/about", icon: <User size={20}/>, label: "About" },
  ];

  if (isAdmin) {
    navItems.push({ 
      path: "/admin", 
      icon: <ShieldCheck size={20} className="text-blue-500 animate-pulse"/>, 
      label: "Admin" 
    });
  }

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50">
      <div className="bg-[#00050d]/90 backdrop-blur-2xl border border-blue-900/40 rounded-3xl p-2 flex justify-around items-center shadow-[0_0_40px_rgba(30,58,138,0.2)]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex flex-col items-center px-4 py-2 rounded-2xl transition-all duration-500 ${
                isActive 
                ? 'text-blue-400 bg-blue-900/20 scale-105 shadow-inner shadow-blue-900/10' 
                : 'text-gray-600 hover:text-blue-300 hover:bg-blue-900/5'
              }`}
            >
              <div className={isActive ? "animate-bounce-short" : ""}>
                {item.icon}
              </div>
              <span className={`text-[8px] mt-1.5 font-black uppercase tracking-[0.2em] ${
                isActive ? 'opacity-100' : 'opacity-40'
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navbar;
