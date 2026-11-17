// ─────────────────────────────────────────────────────────────
// Firebase config — Google login + cloud data
//
// Yahan apne Firebase project ki values paste karo.
// Values kahan se milengi — Guide tab mein poora tarika likha hai.
//
// Jab tak "PASTE_" wali values hain, Google login band rahega
// aur app pehle ki tarah PIN se normal chalega.
// ─────────────────────────────────────────────────────────────

export const firebaseConfig = {
  apiKey: 'PASTE_API_KEY',
  authDomain: 'PASTE_PROJECT_ID.firebaseapp.com',
  projectId: 'PASTE_PROJECT_ID',
  storageBucket: 'PASTE_PROJECT_ID.appspot.com',
  messagingSenderId: 'PASTE_SENDER_ID',
  appId: 'PASTE_APP_ID',
}

// Sab values bharte hi automatic true ho jayega
export const isFirebaseConfigured: boolean = !Object.values(firebaseConfig).some((v) =>
  String(v).includes('PASTE_'),
)
