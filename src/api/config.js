import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// PERBAIKAN: Gunakan supabase-js
import { createClient } from "@supabase/supabase-js";

// --- CONFIGURATION FIREBASE (EAS Database) ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_KEY,
  authDomain: "eas-education.firebaseapp.com",
  projectId: "eas-education",
  storageBucket: "eas-education.appspot.com",
  messagingSenderId: "123456789", // Pastikan sesuai dengan Firebase Console
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// --- CONFIGURATION SUPABASE (EAC-Astronomy Vault) ---
// Project ID: sdrlmbusbdomnpbflyya
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://sdrlmbusbdomnpbflyya.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Pastikan createClient terpanggil dengan benar
export const supabaseMedia = createClient(supabaseUrl, supabaseKey);
