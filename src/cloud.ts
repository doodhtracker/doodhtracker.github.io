// Doodh Tracker — Firebase cloud layer
// Google login + Firestore mein data save/load
// Agar config nahi bhara (isFirebaseConfigured === false) to ye module
// kuch bhi load nahi karta aur app normal (PIN + localStorage) chalta hai.

import { firebaseConfig, isFirebaseConfigured } from './firebase-config'
import type { Auth } from 'firebase/auth'
import type { Firestore } from 'firebase/firestore'

export interface CloudUser {
  uid: string
  email: string
  name: string
}

export interface CloudPayload {
  entries: unknown[]
  rates: { gaay: number; bhains: number; gaayFat?: number; bhainsFat?: number }
  deductions?: unknown[]
  reminders: {
    morningEnabled: boolean
    eveningEnabled: boolean
    morningTime: string
    eveningTime: string
  }
}

interface Ctx {
  auth: Auth
  db: Firestore
  authMod: typeof import('firebase/auth')
  fsMod: typeof import('firebase/firestore')
}

let cached: Ctx | null = null

export function isCloudAvailable(): boolean {
  return isFirebaseConfigured
}

// Firebase ko sirf tab load karo jab config bhara ho
async function ensureInit(): Promise<Ctx | null> {
  if (!isFirebaseConfigured) return null
  if (cached) return cached

  const [appMod, authMod, fsMod] = await Promise.all([
    import('firebase/app'),
    import('firebase/auth'),
    import('firebase/firestore'),
  ])

  const app = appMod.initializeApp(firebaseConfig)
  const auth = authMod.getAuth(app)
  const db = fsMod.getFirestore(app)
  cached = { auth, db, authMod, fsMod }
  return cached
}

function docPath(uid: string): string {
  return `users/${uid}`
}

export async function signInWithGoogle(): Promise<CloudUser> {
  const ctx = await ensureInit()
  if (!ctx) throw new Error('Firebase config nahi bhara hai')
  const provider = new ctx.authMod.GoogleAuthProvider()
  const cred = await ctx.authMod.signInWithPopup(ctx.auth, provider)
  const u = cred.user
  return {
    uid: u.uid,
    email: u.email || '',
    name: u.displayName || (u.email ? u.email.split('@')[0] : 'Google User'),
  }
}

export async function signOutGoogle(): Promise<void> {
  const ctx = await ensureInit()
  if (!ctx) return
  await ctx.authMod.signOut(ctx.auth)
}

export function watchAuth(cb: (u: CloudUser | null) => void): () => void {
  if (!isFirebaseConfigured) return () => {}
  let unsub: (() => void) | null = null
  let cancelled = false

  ensureInit().then((ctx) => {
    if (!ctx || cancelled) return
    unsub = ctx.authMod.onAuthStateChanged(ctx.auth, (u) => {
      if (!u) {
        cb(null)
        return
      }
      cb({
        uid: u.uid,
        email: u.email || '',
        name: u.displayName || (u.email ? u.email.split('@')[0] : 'Google User'),
      })
    })
  })

  return () => {
    cancelled = true
    if (unsub) unsub()
  }
}

// ─── Firestore: ek hi document mein poora data (JSON string) ───
// Simple aur atomic — chhote app ke liye best.

export async function loadCloud(uid: string): Promise<CloudPayload | null> {
  const ctx = await ensureInit()
  if (!ctx) return null
  const ref = ctx.fsMod.doc(ctx.db, docPath(uid))
  const snap = await ctx.fsMod.getDoc(ref)
  if (!snap.exists()) return null

  const raw = snap.data()?.payload
  if (typeof raw !== 'string' || !raw) return null

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const rates = (parsed.rates || {}) as Record<string, unknown>
    const rem = (parsed.reminders || {}) as Record<string, unknown>
    return {
      entries: Array.isArray(parsed.entries) ? parsed.entries : [],
      rates: {
        gaay: Number(rates.gaay) || 0,
        bhains: Number(rates.bhains) || 0,
      },
      reminders: {
        morningEnabled: !!rem.morningEnabled,
        eveningEnabled: !!rem.eveningEnabled,
        morningTime: typeof rem.morningTime === 'string' ? rem.morningTime : '06:00',
        eveningTime: typeof rem.eveningTime === 'string' ? rem.eveningTime : '18:00',
      },
    }
  } catch {
    return null
  }
}

export async function saveCloud(uid: string, payload: CloudPayload, email: string): Promise<void> {
  const ctx = await ensureInit()
  if (!ctx) return
  const ref = ctx.fsMod.doc(ctx.db, docPath(uid))
  await ctx.fsMod.setDoc(ref, {
    payload: JSON.stringify(payload),
    email,
    updatedAt: Date.now(),
  })
}
