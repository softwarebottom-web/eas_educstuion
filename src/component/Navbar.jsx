import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  BookOpen,
  Brain,
  ShoppingBag,
  Globe,      // ✅ pengganti Telescope
  Atom,       // ✅ pengganti Telescope
  MessageCircle,
  Radio,
  Settings,
  User,
  Shield,
  ChevronUp,
  X
} from "lucide-react";
import { playSound } from "./Intro";

const PURPLE = {
  bg: "#0a0015",
  accent: "#a855f7",
  accent2: "#ec4899",
  border: "rgba(168,85,247,0.2)",
  card: "rgba(168,85,247,0.08)"
};

const mainItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/ai-quiz", icon: Brain, label: "Quiz" },
  { path: "/library", icon: BookOpen, label: "Library" },
  { path: "/market", icon: ShoppingBag, label: "Market" },
  { path: "/more", icon: ChevronUp, label: "More", isMore: true },
];

const moreItems = [
  { path: "/solar", icon: Globe, label: "Solar System", color: "#a855f7" },   // ✅
  { path: "/science", icon: Atom, label: "Science Hub", color: "#3b82f6" },   // ✅
  { path: "/chat", icon: MessageCircle, label: "Chat", color: "#10b981" },
  { path: "/webinar", icon: Radio, label: "Webinar", color: "#ef4444" },
  { path: "/apply", icon: Shield, label: "Lamar Staff", color: "#f59e0b" },
  { path: "/about", icon: User, label: "About", color: "#ec4899" },
  { path: "/settings", icon: Settings, label: "Settings", color: "#6b7280" },
];

const Navbar = () => {
  const location = useLocation();
  const [showMore, setShowMore] = useState(false);

  return (
    <>
      {showMore && (
        <div className="fixed inset-0 z-40" onClick={() => setShowMore(false)} />
      )}

      {showMore && (
        <div
          className="fixed bottom-24 left-4 right-4 z-50 rounded-3xl border p-3"
          style={{
            background: `${PURPLE.bg}f8`,
            borderColor: PURPLE.border,
            backdropFilter: "blur(20px)"
          }}
        >
          <div className="flex justify-between items-center mb-3 px-2">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              Menu Lainnya
            </span>
            <button
              onClick={() => setShowMore(false)}
              className="p-1 rounded-lg"
              style={{ color: PURPLE.accent }}
            >
              <X size={14} />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {moreItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    playSound("nav");
                    setShowMore(false);
                  }}
                  className="flex flex-col items-center py-3 px-1 rounded-2xl transition-all"
                  style={{
                    background: isActive
                      ? item.color + "20"
                      : "rgba(255,255,255,0.03)",
                    color: isActive ? item.color : "#6b7280"
                  }}
                >
                  <Icon size={17} />
                  <span className="text-[8px] mt-1.5 font-bold text-center leading-tight">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-50">
        <div
          className="rounded-3xl p-2 flex justify-around items-center border"
          style={{
            background: `${PURPLE.bg}ee`,
            borderColor: PURPLE.border,
            backdropFilter: "blur(24px)",
            boxShadow: `0 0 40px ${PURPLE.accent}20`
          }}
        >
          {mainItems.map(item => {
            const Icon = item.icon;
            const isActive =
              !item.isMore && location.pathname === item.path;

            if (item.isMore)
              return (
                <button
                  key="more"
                  onClick={() => {
                    playSound("nav");
                    setShowMore(!showMore);
                  }}
                  className="flex flex-col items-center px-3 py-2 rounded-2xl transition-all"
                  style={{
                    color: showMore ? PURPLE.accent : "#4b5563",
                    background: showMore
                      ? PURPLE.accent + "15"
                      : "transparent"
                  }}
                >
                  <ChevronUp
                    size={19}
                    style={{
                      transform: showMore
                        ? "rotate(180deg)"
                        : "none",
                      transition: "transform 0.2s"
                    }}
                  />
                  <span
                    className="text-[8px] mt-1.5 font-black uppercase tracking-wide"
                    style={{ opacity: showMore ? 1 : 0.4 }}
                  >
                    More
                  </span>
                </button>
              );

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => {
                  playSound("nav");
                  setShowMore(false);
                }}
                className="flex flex-col items-center px-3 py-2 rounded-2xl transition-all duration-200"
                style={{
                  color: isActive
                    ? PURPLE.accent
                    : "#4b5563",
                  background: isActive
                    ? PURPLE.accent + "15"
                    : "transparent",
                  transform: isActive
                    ? "scale(1.05)"
                    : "scale(1)"
                }}
              >
                <Icon size={19} />
                <span
                  className="text-[8px] mt-1.5 font-black uppercase tracking-[0.1em]"
                  style={{ opacity: isActive ? 1 : 0.4 }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
