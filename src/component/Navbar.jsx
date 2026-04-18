import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, LayoutGrid, User, Settings, MessageCircle, Radio, Brain, Shield, ChevronUp, ChevronDown } from "lucide-react";
import { useEasStore, THEMES } from "../store/useStore";
import { playSound } from "./Intro";

const Navbar = () => {
  const location = useLocation();
  const { theme } = useEasStore();
  const t = THEMES[theme] || THEMES.dark;
  const [showMore, setShowMore] = useState(false);

  const mainItems = [
    { path: "/", icon: <Home size={19} />, label: "Home" },
    { path: "/library", icon: <BookOpen size={19} />, label: "Library" },
    { path: "/quiz", icon: <LayoutGrid size={19} />, label: "Quiz" },
    { path: "/chat", icon: <MessageCircle size={19} />, label: "Chat" },
    { path: "/settings", icon: <Settings size={19} />, label: "More", isMore: true },
  ];

  const moreItems = [
    { path: "/ai-quiz", icon: <Brain size={18} />, label: "AI Quiz", color: "#8b5cf6" },
    { path: "/webinar", icon: <Radio size={18} />, label: "Webinar", color: "#ef4444" },
    { path: "/apply", icon: <Shield size={18} />, label: "Lamar Staff", color: "#f59e0b" },
    { path: "/about", icon: <User size={18} />, label: "About", color: t.accent2 },
    { path: "/settings", icon: <Settings size={18} />, label: "Settings", color: "#6b7280" },
  ];

  return (
    <>
      {/* More Panel */}
      {showMore && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50">
          <div className="rounded-3xl p-3 border grid grid-cols-3 gap-2" style={{ background: `${t.bg}f5`, borderColor: t.border, backdropFilter: "blur(20px)" }}>
            {moreItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path} onClick={() => { playSound("nav"); setShowMore(false); }}
                  className="flex flex-col items-center py-3 px-2 rounded-2xl transition-all"
                  style={{ background: isActive ? item.color + "20" : "rgba(255,255,255,0.03)", color: isActive ? item.color : "#6b7280" }}>
                  {item.icon}
                  <span className="text-[8px] mt-1.5 font-black uppercase tracking-wider">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50">
        <div className="backdrop-blur-2xl rounded-3xl p-2 flex justify-around items-center border"
          style={{ background: `${t.bg}e8`, borderColor: t.border, boxShadow: `0 0 40px ${t.accent}18` }}>
          {mainItems.map(item => {
            const isActive = !item.isMore && location.pathname === item.path;
            const isMoreActive = item.isMore && showMore;
            return item.isMore ? (
              <button key="more" onClick={() => { playSound("nav"); setShowMore(!showMore); }}
                className="flex flex-col items-center px-3 py-2 rounded-2xl transition-all"
                style={{ color: isMoreActive ? t.accent : "#4b5563", background: isMoreActive ? `${t.accent}15` : "transparent" }}>
                {showMore ? <ChevronDown size={19} /> : <ChevronUp size={19} />}
                <span className="text-[8px] mt-1.5 font-black uppercase tracking-[0.15em]" style={{ opacity: isMoreActive ? 1 : 0.4 }}>More</span>
              </button>
            ) : (
              <Link key={item.path} to={item.path} onClick={() => { playSound("nav"); setShowMore(false); }}
                className="flex flex-col items-center px-3 py-2 rounded-2xl transition-all"
                style={{ color: isActive ? t.accent : "#4b5563", background: isActive ? `${t.accent}15` : "transparent", transform: isActive ? "scale(1.05)" : "scale(1)" }}>
                {item.icon}
                <span className="text-[8px] mt-1.5 font-black uppercase tracking-[0.15em]" style={{ opacity: isActive ? 1 : 0.4 }}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
