import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { createClient } from "@supabase/supabase-app";

// --- CONFIGURATION FIREBASE ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_KEY,
  authDomain: "eas-education.firebaseapp.com",
  projectId: "eas-education",
  storageBucket: "eas-education.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// --- CONFIGURATION SUPABASE (Untuk Vault/Library) ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseMedia = createClient(supabaseUrl, supabaseKey);
