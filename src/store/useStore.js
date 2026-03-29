import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useEasStore = create(
  persist(
    (set) => ({
      user: null, // Data nama, umur, gen
      isVerified: false, // Status Scan ID Card
      isAdmin: false, // Status Akses Staff
      
      // Action untuk Login
      setUser: (userData) => set({ user: userData }),
      
      // Action untuk Verifikasi ID
      verifyId: () => set({ isVerified: true }),
      
      // Action Logout (Clear All)
      logout: () => {
        localStorage.removeItem('eas_admin_token');
        set({ user: null, isVerified: false, isAdmin: false });
      }
    }),
    { name: 'eas-storage' } // Nama key di LocalStorage
  )
);
