/// <reference types="vite/client" />

// ─────────────────────────────────────────────────────────────
// Firebase config — Google login + cloud sync
//
// Do tarah se chalega:
//   1) GitHub Actions mein VITE_FIREBASE_* env vars set ho -> wahi use honge
//   2) Env vars na ho -> neeche wali default values use hongi
//
// Neeche wali values chhupane ki zaroorat nahi hai. Firebase ki web
// apiKey public hoti hai (Google ke docs mein bhi likha hai) — ye sirf
// project pehchanti hai, koi permission nahi deti. Asli taala Firestore
// rules hai (users/{uid} — sirf apna data).
//
// NOTE: Pichhli baar sirf env vars rakhe gaye the aur wo set nahi the,
// isliye Google login button gayab ho gaya tha. Isliye ab fallback hai.
// ─────────────────────────────────────────────────────────────

const env = import.meta.env

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyBn1X0m0KKKdgUMjjLhoS54cd1PQ1MQreI',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'doodh-tracker-bb78a.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'doodh-tracker-bb78a',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'doodh-tracker-bb78a.firebasestorage.app',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '192825303582',
  appId: env.VITE_FIREBASE_APP_ID || '1:192825303582:web:117b441e6d2ba045d6040f',
}

// Sab values bharte hi true — warna Google button chhup jata hai
export const isFirebaseConfigured: boolean = Object.values(firebaseConfig).every(
  (v) => Boolean(v) && !String(v).includes('PASTE_'),
)
