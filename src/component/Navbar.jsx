import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, LayoutGrid, User, Settings } from "lucide-react";
import { useEasStore, THEMES } from "../store/useStore";
import { playSound } from "./Intro";

const Navbar = () => {
  const location = useLocation();
  const { theme } = useEasStore();
  const t = THEMES[theme] || THEMES.dark;

  const navItems = [
    { path: "/", icon: <Home size={20} />, label: "Home" },
    { path: "/library", icon: <BookOpen size={20} />, label: "Library" },
    { path: "/quiz", icon: <LayoutGrid size={20} />, label: "Mission" },
    { path: "/about", icon: <User size={20} />, label: "About" },
    { path: "/settings", icon: <Settings size={20} />, label: "Settings" },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50">
      <div
        className="backdrop-blur-2xl rounded-3xl p-2 flex justify-around items-center border"
        style={{ background: `${t.bg}e8`, borderColor: t.border, boxShadow: `0 0 40px ${t.accent}18` }}
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => playSound("nav")}
              className="flex flex-col items-center px-3 py-2 rounded-2xl transition-all duration-300"
              style={{
                color: isActive ? t.accent : "#4b5563",
                background: isActive ? `${t.accent}15` : "transparent",
                transform: isActive ? "scale(1.05)" : "scale(1)",
              }}
            >
              {item.icon}
              <span className="text-[8px] mt-1.5 font-black uppercase tracking-[0.15em]"
                style={{ opacity: isActive ? 1 : 0.4 }}>
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
