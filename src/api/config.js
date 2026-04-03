import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { createClient } from "@supabase/supabase-js";

// --- CONFIGURATION FIREBASE (EAS Database) ---
const firebaseConfig = {
  // Pakai string asli agar langsung jalan tanpa setting env di Vercel
  apiKey: "AIzaSyDcjlV3C0DpKJ3RRzZa2Rsn7MNjxDQ5r1c",
  authDomain: "eas-education.firebaseapp.com",
  projectId: "eas-education",
  storageBucket: "eas-education.appspot.com",
  messagingSenderId: "748565335165",
  appId: "1:748565335165:web:97ca081732552998ebb514",
  measurementId: "G-EVF9PMSR4K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// --- CONFIGURATION SUPABASE (EAC-Astronomy Vault) ---
const supabaseUrl = "https://sdrlmbusbdomnpbflyya.supabase.co";
// Masukkan Anon Key (JWT) kamu di sini (yang diawali eyJhbGci...)
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkcmxtYnVzYmRvbW5wYmZseXlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3NzEzODksImV4cCI6MjA5MDM0NzM4OX0.gaNDRJLiIAKW38M6TfKyxZjD6DD8Hh3vVNaC26K1wWs"; 

export const supabase = createClient(supabaseUrl, supabaseKey);
