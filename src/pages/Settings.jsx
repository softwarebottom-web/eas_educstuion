import { useNavigate } from "react-router-dom";
import { ArrowLeft, Palette, Music2, Globe, Check } from "lucide-react";
import { useEasStore, THEMES } from "../store/useStore";

const Settings = () => {
  const navigate = useNavigate();
  const {
    theme, setTheme,
    musicVolume, setMusicVolume,
    musicMuted, setMusicMuted,
    musicEnabled, setMusicEnabled,
    hologramMode, setHologramMode,
  } = useEasStore();

  const t = THEMES[theme];

  return (
    <div
      className="min-h-screen text-white p-6 pb-28 font-mono"
      style={{ background: t.bg }}
    >
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8 mt-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl border"
          style={{ borderColor: t.border, color: t.accent }}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-base font-black uppercase tracking-widest" style={{ color: t.accent }}>
            Settings
          </h1>
          <p className="text-[9px] text-gray-500 uppercase">EAS System Configuration</p>
        </div>
      </div>

      {/* ======================== */}
      {/* 🎨 THEME */}
      {/* ======================== */}
      <Section icon={<Palette size={14} />} title="Color Theme" accent={t.accent}>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(THEMES).map(([key, th]) => (
            <button
              key={key}
              onClick={() => setTheme(key)}
              className="relative p-4 rounded-2xl border transition-all text-left"
              style={{
                borderColor: theme === key ? th.accent : "rgba(255,255,255,0.08)",
                background: theme === key ? `${th.accent}15` : "rgba(255,255,255,0.02)",
              }}
            >
              {/* Color preview dots */}
              <div className="flex gap-1 mb-3">
                {th.preview.map((c, i) => (
                  <div key={i} className="w-4 h-4 rounded-full" style={{ background: c, border: "1px solid rgba(255,255,255,0.1)" }} />
                ))}
              </div>
              <p className="text-[11px] font-black uppercase" style={{ color: theme === key ? th.accent : "#6b7280" }}>
                {th.label}
              </p>
              {theme === key && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: th.accent }}>
                  <Check size={10} color="#000" />
                </div>
              )}
            </button>
          ))}
        </div>
      </Section>

      {/* ======================== */}
      {/* 🔊 MUSIC */}
      {/* ======================== */}
      <Section icon={<Music2 size={14} />} title="Music & Sound" accent={t.accent}>
        <div className="space-y-4">

          {/* Enable/Disable */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">Background Music</p>
            <Toggle
              value={musicEnabled}
              onChange={setMusicEnabled}
              accent={t.accent}
            />
          </div>

          {/* Mute */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">Mute</p>
            <Toggle
              value={musicMuted}
              onChange={setMusicMuted}
              accent={t.accent}
            />
          </div>

          {/* Volume */}
          <div>
            <div className="flex justify-between mb-2">
              <p className="text-xs text-gray-400">Volume</p>
              <p className="text-xs font-bold" style={{ color: t.accent }}>
                {Math.round(musicVolume * 100)}%
              </p>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={musicVolume}
              onChange={(e) => setMusicVolume(Number(e.target.value))}
              className="w-full h-1 rounded-full cursor-pointer"
              style={{ accentColor: t.accent }}
            />
          </div>
        </div>
      </Section>

      {/* ======================== */}
      {/* 🌌 HOLOGRAM MODE */}
      {/* ======================== */}
      <Section icon={<Globe size={14} />} title="About Hologram Mode" accent={t.accent}>
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: "planet", label: "Planet", desc: "Rotating planet with rings & orbits", emoji: "🪐" },
            { key: "galaxy", label: "Galaxy", desc: "Spiral galaxy with star clusters", emoji: "🌌" },
          ].map((m) => (
            <button
              key={m.key}
              onClick={() => setHologramMode(m.key)}
              className="p-4 rounded-2xl border transition-all text-left"
              style={{
                borderColor: hologramMode === m.key ? t.accent : "rgba(255,255,255,0.08)",
                background: hologramMode === m.key ? `${t.accent}15` : "rgba(255,255,255,0.02)",
              }}
            >
              <div className="text-2xl mb-2">{m.emoji}</div>
              <p className="text-[11px] font-black uppercase mb-1" style={{ color: hologramMode === m.key ? t.accent : "#6b7280" }}>
                {m.label}
              </p>
              <p className="text-[9px] text-gray-600">{m.desc}</p>
              {hologramMode === m.key && (
                <div className="mt-2 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: t.accent }}>
                  <Check size={10} color="#000" />
                </div>
              )}
            </button>
          ))}
        </div>
      </Section>

      {/* VERSION */}
      <p className="text-center text-[8px] text-gray-700 uppercase tracking-widest mt-8">
        EAS System v3.0 • Configuration Panel
      </p>
    </div>
  );
};

const Section = ({ icon, title, accent, children }) => (
  <div className="mb-6 p-5 rounded-3xl bg-white/[0.02] border border-white/[0.06]">
    <div className="flex items-center gap-2 mb-4">
      <span style={{ color: accent }}>{icon}</span>
      <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-300">{title}</h2>
    </div>
    {children}
  </div>
);

const Toggle = ({ value, onChange, accent }) => (
  <button
    onClick={() => onChange(!value)}
    className="relative w-11 h-6 rounded-full transition-all"
    style={{ background: value ? accent : "rgba(255,255,255,0.1)" }}
  >
    <div
      className="absolute top-1 w-4 h-4 bg-white rounded-full transition-all"
      style={{ left: value ? "calc(100% - 20px)" : "4px" }}
    />
  </button>
);

export default Settings;
