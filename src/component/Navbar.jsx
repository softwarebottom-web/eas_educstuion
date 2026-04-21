import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home, Brain, BookOpen, ShoppingBag, Scan,
  MessageCircle, Radio, FlaskConical, User, Settings,
  Shield, ChevronUp, X
} from "lucide-react";
import { playSound } from "./Intro";

// Transparan biru-ungu, aesthetic
const NAV_BG = "rgba(8, 4, 20, 0.75)";
const NAV_BORDER = "rgba(120, 80, 220, 0.25)";
const NAV_GLOW = "0 0 30px rgba(120,60,200,0.2), 0 -1px 0 rgba(150,100,255,0.1)";
const ACCENT = "#a855f7";
const ACCENT2 = "#38bdf8"; // biru langit

const mainItems = [
  { path:"/",          icon:Home,         label:"Home" },
  { path:"/ai-quiz",   icon:Brain,        label:"Quiz" },
  { path:"/library",   icon:BookOpen,     label:"Library" },
  { path:"/solar",     icon:Scan,    label:"Solar" },
  { path:"/more",      icon:ChevronUp,    label:"More", isMore:true },
];

const moreItems = [
  { path:"/science",   icon:FlaskConical, label:"Science",   color:"#10b981" },
  { path:"/chat",      icon:MessageCircle,label:"Chat",      color:"#38bdf8" },
  { path:"/market",    icon:ShoppingBag,  label:"Market",    color:"#ec4899" },
  { path:"/webinar",   icon:Radio,        label:"Webinar",   color:"#ef4444" },
  { path:"/apply",     icon:Shield,       label:"Staff",     color:"#f97316" },
  { path:"/about",     icon:User,         label:"About",     color:"#8b5cf6" },
  { path:"/settings",  icon:Settings,     label:"Settings",  color:"#6b7280" },
];

const Navbar = () => {
  const location = useLocation();
  const [showMore, setShowMore] = useState(false);

  return (
    <>
      {/* Backdrop untuk close more panel */}
      {showMore && (
        <div className="fixed inset-0 z-40" onClick={() => setShowMore(false)} />
      )}

      {/* More panel - transparan biru-ungu */}
      {showMore && (
        <div className="fixed bottom-24 left-3 right-3 z-50 rounded-3xl p-3 border"
          style={{
            background: "rgba(6,3,18,0.88)",
            borderColor: "rgba(100,60,200,0.3)",
            backdropFilter: "blur(24px) saturate(1.5)",
            boxShadow: "0 0 40px rgba(100,40,200,0.25), 0 0 80px rgba(30,80,200,0.1)",
          }}>
          <div className="flex justify-between items-center mb-2 px-1">
            <span className="text-[9px] font-black uppercase tracking-widest bg-gradient-to-r from-purple-400 to-sky-400 bg-clip-text text-transparent">
              Menu Lainnya
            </span>
            <button onClick={() => setShowMore(false)} className="p-1 rounded-lg text-gray-500 hover:text-white">
              <X size={13} />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {moreItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}
                  onClick={() => { playSound("nav"); setShowMore(false); }}
                  className="flex flex-col items-center py-2.5 px-1 rounded-2xl transition-all"
                  style={{
                    background: isActive ? item.color + "20" : "rgba(255,255,255,0.03)",
                    color: isActive ? item.color : "#6b7280",
                    border: `1px solid ${isActive ? item.color + "30" : "transparent"}`,
                  }}>
                  <Icon size={18} />
                  <span className="text-[8px] mt-1 font-bold text-center leading-tight">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Main navbar - transparan biru langit & ungu */}
      <nav className="fixed bottom-4 left-3 right-3 z-50">
        <div className="rounded-3xl px-2 py-2 flex justify-around items-center border"
          style={{
            background: NAV_BG,
            borderColor: NAV_BORDER,
            backdropFilter: "blur(28px) saturate(1.8)",
            WebkitBackdropFilter: "blur(28px) saturate(1.8)",
            boxShadow: NAV_GLOW,
          }}>

          {/* Subtle glow strip di atas navbar */}
          <div className="absolute -top-px left-8 right-8 h-px rounded-full"
            style={{ background: "linear-gradient(90deg, transparent, rgba(120,80,255,0.5), rgba(56,189,248,0.5), transparent)" }} />

          {mainItems.map(item => {
            const Icon = item.icon;
            const isActive = !item.isMore && location.pathname === item.path;
            const isMoreActive = item.isMore && showMore;

            if (item.isMore) return (
              <button key="more"
                onClick={() => { playSound("nav"); setShowMore(!showMore); }}
                className="flex flex-col items-center px-3 py-2 rounded-2xl transition-all relative"
                style={{
                  color: isMoreActive ? ACCENT : "#4b5563",
                  background: isMoreActive ? `${ACCENT}18` : "transparent",
                }}>
                <ChevronUp size={20}
                  style={{ transform: showMore ? "rotate(180deg)" : "none", transition: "transform 0.25s", color: isMoreActive ? ACCENT : "#4b5563" }} />
                <span className="text-[8px] mt-1 font-black uppercase tracking-wide"
                  style={{ opacity: isMoreActive ? 1 : 0.35 }}>More</span>
              </button>
            );

            return (
              <Link key={item.path} to={item.path}
                onClick={() => { playSound("nav"); setShowMore(false); }}
                className="flex flex-col items-center px-3 py-2 rounded-2xl transition-all duration-200 relative"
                style={{
                  color: isActive ? ACCENT : "#4b5563",
                  background: isActive ? `${ACCENT}15` : "transparent",
                  transform: isActive ? "scale(1.05)" : "scale(1)",
                }}>
                {/* Active indicator dot */}
                {isActive && (
                  <div className="absolute -top-0.5 w-4 h-0.5 rounded-full"
                    style={{ background: `linear-gradient(90deg,${ACCENT},${ACCENT2})` }} />
                )}
                <Icon size={20} />
                <span className="text-[8px] mt-1 font-black uppercase tracking-[0.1em]"
                  style={{ opacity: isActive ? 1 : 0.35 }}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
