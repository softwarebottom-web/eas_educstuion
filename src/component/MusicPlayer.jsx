import { useState, useEffect, useRef } from "react";
import { Music2, VolumeX, Volume2 } from "lucide-react";
import { useEasStore, THEMES } from "../store/useStore";
import { playSound } from "./Intro";

const MusicPlayer = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [tried, setTried] = useState(false);

  const { theme, musicVolume, setMusicVolume, musicMuted, setMusicMuted, musicEnabled } = useEasStore();
  const t = THEMES[theme] || THEMES.dark;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = "/assets/sound.mp3";
    audio.loop = true;
    audio.volume = musicMuted ? 0 : musicVolume;
  }, []);

  // ✅ Auto-play saat komponen mount — pakai interaction listener
  useEffect(() => {
    if (tried || !musicEnabled) return;

    const audio = audioRef.current;
    if (!audio) return;

    // Coba autoplay langsung dulu
    const tryPlay = () => {
      audio.volume = musicMuted ? 0 : musicVolume;
      audio.play()
        .then(() => { setIsPlaying(true); setTried(true); })
        .catch(() => {
          // Browser block autoplay — tunggu interaksi pertama user
          const onInteract = () => {
            audio.play().then(() => { setIsPlaying(true); }).catch(() => {});
            document.removeEventListener("click", onInteract);
            document.removeEventListener("touchstart", onInteract);
            document.removeEventListener("keydown", onInteract);
          };
          document.addEventListener("click", onInteract, { once: true });
          document.addEventListener("touchstart", onInteract, { once: true });
          document.addEventListener("keydown", onInteract, { once: true });
          setTried(true);
        });
    };

    tryPlay();
  }, [musicEnabled]);

  // Sync volume & mute
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = musicMuted ? 0 : musicVolume;
  }, [musicVolume, musicMuted]);

  // Pause kalau disabled
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!musicEnabled && isPlaying) {
      audio.pause();
      setIsPlaying(false);
    }
  }, [musicEnabled]);

  // Progress bar
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const update = () => {
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
    };
    audio.addEventListener("timeupdate", update);
    return () => audio.removeEventListener("timeupdate", update);
  }, []);

  const togglePlay = () => {
    if (!musicEnabled) return;
    playSound("click");
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const seekTo = (e) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * audio.duration;
  };

  if (!musicEnabled) return null;

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-2">
      <audio ref={audioRef} />

      {expanded && (
        <div
          className="w-52 rounded-2xl p-4 shadow-2xl border"
          style={{ background: `${t.bg}f2`, borderColor: t.border, backdropFilter: "blur(20px)" }}
        >
          <div className="mb-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Music2 size={10} className={isPlaying ? "animate-pulse" : ""} style={{ color: t.accent }} />
              <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: t.accent }}>
                Now Playing
              </span>
            </div>
            <p className="text-[11px] font-bold text-white">EAS Ambient</p>
            <p className="text-[9px] text-gray-600">Loop Mode</p>
          </div>

          <div className="w-full h-1 bg-gray-800 rounded-full mb-3 cursor-pointer" onClick={seekTo}>
            <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: t.accent }} />
          </div>

          <div className="flex justify-center mb-3">
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm transition"
              style={{ background: t.accent }}
            >
              {isPlaying ? "⏸" : "▶"}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => { playSound("click"); setMusicMuted(!musicMuted); }} style={{ color: t.accent2 }}>
              {musicMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
            </button>
            <input
              type="range" min="0" max="1" step="0.05"
              value={musicMuted ? 0 : musicVolume}
              onChange={(e) => { setMusicVolume(Number(e.target.value)); setMusicMuted(false); }}
              className="flex-1 h-1 cursor-pointer"
              style={{ accentColor: t.accent }}
            />
            <span className="text-[9px] text-gray-500">{Math.round((musicMuted ? 0 : musicVolume) * 100)}%</span>
          </div>
        </div>
      )}

      <button
        onClick={() => { playSound("click"); setExpanded(!expanded); }}
        className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all border"
        style={{
          background: isPlaying ? t.accent : t.bg,
          borderColor: t.border,
          boxShadow: isPlaying ? `0 0 20px ${t.accent}60` : "none"
        }}
      >
        <Music2
          size={18}
          style={{ color: isPlaying ? "#fff" : t.accent, opacity: isPlaying ? 1 : 0.5 }}
          className={isPlaying ? "animate-pulse" : ""}
        />
      </button>
    </div>
  );
};

export default MusicPlayer;
