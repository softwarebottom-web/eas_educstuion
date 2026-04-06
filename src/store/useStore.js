import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useEasStore = create(
  persist(
    (set) => ({
      // User
      user: null,
      isVerified: false,
      isAdmin: false,

      // 🎨 Theme: "dark" | "midnight" | "neon" | "aurora"
      theme: "dark",

      // 🔊 Music
      musicVolume: 0.3,
      musicMuted: false,
      musicEnabled: true,

      // 🌌 About hologram mode: "planet" | "galaxy"
      hologramMode: "planet",

      // Actions
      setUser: (userData) => set({ user: userData }),
      verifyId: () => set({ isVerified: true }),
      setAdmin: (role, level) => set({ isAdmin: true }),

      setTheme: (theme) => set({ theme }),
      setMusicVolume: (v) => set({ musicVolume: v }),
      setMusicMuted: (v) => set({ musicMuted: v }),
      setMusicEnabled: (v) => set({ musicEnabled: v }),
      setHologramMode: (mode) => set({ hologramMode: mode }),

      logout: () => {
        localStorage.removeItem('eas_admin_token');
        localStorage.removeItem('eas_admin_id');
        localStorage.removeItem('eas_admin_role');
        localStorage.removeItem('eas_admin_level');
        localStorage.removeItem('eas_admin_expire');
        set({ user: null, isVerified: false, isAdmin: false });
      }
    }),
    { name: 'eas-storage' }
  )
);

// Theme CSS variables map
export const THEMES = {
  dark: {
    label: "Dark",
    bg: "#00050d",
    accent: "#3b82f6",
    accent2: "#06b6d4",
    border: "rgba(59,130,246,0.2)",
    card: "rgba(255,255,255,0.03)",
    text: "#e2e8f0",
    preview: ["#00050d", "#3b82f6", "#06b6d4"],
  },
  midnight: {
    label: "Midnight",
    bg: "#0f0a1a",
    accent: "#8b5cf6",
    accent2: "#a78bfa",
    border: "rgba(139,92,246,0.2)",
    card: "rgba(139,92,246,0.05)",
    text: "#e2e8f0",
    preview: ["#0f0a1a", "#8b5cf6", "#a78bfa"],
  },
  neon: {
    label: "Neon",
    bg: "#020810",
    accent: "#00ff88",
    accent2: "#00ccff",
    border: "rgba(0,255,136,0.2)",
    card: "rgba(0,255,136,0.03)",
    text: "#e2e8f0",
    preview: ["#020810", "#00ff88", "#00ccff"],
  },
  aurora: {
    label: "Aurora",
    bg: "#030d0a",
    accent: "#10b981",
    accent2: "#f59e0b",
    border: "rgba(16,185,129,0.2)",
    card: "rgba(16,185,129,0.03)",
    text: "#e2e8f0",
    preview: ["#030d0a", "#10b981", "#f59e0b"],
  },
};
