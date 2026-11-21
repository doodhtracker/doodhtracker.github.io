import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { MilkEntry, User, Tab, Rates, Review, Deduction } from './types'
import { hashPin, verifyPin, encryptData, decryptData } from './crypto'
import { isCloudAvailable, signInWithGoogle, signOutGoogle, loadCloud, saveCloud, type CloudUser } from './cloud'
import type { BackupData } from './backup'
import type { Lang } from './i18n'

// ─── Encrypted Storage Adapter ───
// Poora state JSON encrypt hoke localStorage mein save hota hai
// DevTools khol ke koi bhi data nahi padh sakta

const encryptedStorage = createJSONStorage(() => ({
  getItem: (name: string) => {
    const raw = localStorage.getItem(name)
    if (!raw) return null
    // Try decrypting (new encrypted format)
    const decrypted = decryptData(raw)
    if (decrypted && decrypted.startsWith('{')) return decrypted
    // Fallback: old unencrypted data (migration)
    return raw
  },
  setItem: (name: string, value: string) => {
    localStorage.setItem(name, encryptData(value))
  },
  removeItem: (name: string) => localStorage.removeItem(name),
}))

interface StoreState {
  currentUser: string | null
  users: Record<string, User>
  login: (username: string, pin: string) => Promise<boolean>
  signup: (username: string, pin: string) => Promise<boolean>
  resetPin: (username: string, newPin: string) => Promise<boolean>
  logout: () => void

  allEntries: Record<string, MilkEntry[]>
  nextEntryId: Record<string, number>

  allRates: Record<string, Rates>
  setRates: (gaay: number, bhains: number, gaayFat?: number, bhainsFat?: number) => void

  allReminders: Record<string, ReminderConfig>
  setReminders: (config: ReminderConfig) => void

  // Advance / pashu aahar — bill se minus
  allDeductions: Record<string, Deduction[]>
  nextDeductionId: Record<string, number>
  addDeduction: (d: Omit<Deduction, 'id' | 'createdAt'>) => void
  removeDeduction: (id: number) => void

  activeTab: Tab
  setActiveTab: (t: Tab) => void

  lang: Lang
  setLang: (l: Lang) => void

  addEntry: (e: Omit<MilkEntry, 'id' | 'createdAt'>) => void
  removeEntry: (id: number) => void
  editEntry: (id: number, updates: Partial<Omit<MilkEntry, 'id' | 'createdAt'>>) => void
  importEntries: (entries: MilkEntry[]) => void

  // Reviews — device pe save hote hain (per-user nahi, taaki ek hi phone pe
  // saare accounts ke reviews ek jagah dikhein)
  reviews: Review[]
  nextReviewId: number
  addReview: (r: Omit<Review, 'id' | 'createdAt'>) => void
  removeReview: (id: number) => void

  // ─── Cloud (Google login + Firestore) ───
  cloudUser: CloudUser | null
  cloudStatus: CloudStatus
  setCloudUser: (u: CloudUser | null) => void
  googleLogin: () => Promise<CloudResult>
  googleLogout: () => Promise<void>
  cloudPull: () => Promise<CloudResult>
  cloudPush: () => Promise<CloudResult>
  migrateLocalToCloud: (sourceKey: string) => Promise<CloudResult & { count: number }>

  // ─── Email backup se restore ───
  restoreBackup: (data: BackupData) => { ok: boolean; entries: number; reviews: number; error?: string }
}

export type CloudStatus = 'idle' | 'syncing' | 'synced' | 'error'

export interface CloudResult {
  ok: boolean
  error?: string
}

const DEFAULT_REMINDERS: ReminderConfig = {
  morningEnabled: false,
  eveningEnabled: false,
  morningTime: '06:00',
  eveningTime: '18:00',
}

export function googleKey(uid: string): string {
  return `g:${uid}`
}

function errText(e: unknown): string {
  if (e && typeof e === 'object' && 'code' in e) {
    const code = String((e as { code?: unknown }).code || '')
    if (code.includes('popup-closed-by-user')) return 'Google window band ho gaya. Dobara try karo.'
    if (code.includes('popup-blocked')) return 'Browser ne popup roka. Popup allow karke dobara try karo.'
    if (code.includes('unauthorized-domain')) return 'Yeh domain Firebase mein allowed nahi hai. Guide tab dekho.'
    if (code.includes('network-request-failed')) return 'Internet nahi hai. Online hoke try karo.'
    if (code.includes('permission-denied')) return 'Firestore rules permission nahi de rahi. Guide tab dekho.'
    if (code.includes('operation-not-allowed')) return 'Google sign-in Firebase mein ON nahi hai. Guide tab dekho.'
    return `Error: ${code}`
  }
  const m = e instanceof Error ? e.message : String(e)
  return m || 'Kuch gadbad ho gayi'
}

function entrySig(e: MilkEntry): string {
  return `${e.date}|${e.animalType}|${e.animalName || ''}|${e.session}|${e.liters}`
}

function sanitizeEntries(raw: unknown[]): MilkEntry[] {
  const out: MilkEntry[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const e = item as Partial<MilkEntry>
    if (!e.date || typeof e.liters !== 'number') continue
    if (e.animalType !== 'gaay' && e.animalType !== 'bhains') continue
    if (e.session !== 'morning' && e.session !== 'evening') continue
    out.push({
      id: Number(e.id) || 0,
      date: String(e.date),
      animalType: e.animalType,
      animalName: e.animalName ? String(e.animalName) : undefined,
      session: e.session,
      liters: Number(e.liters) || 0,
      note: e.note ? String(e.note) : undefined,
      createdAt: Number(e.createdAt) || Date.now(),
    })
  }
  return out
}

function mergeEntries(base: MilkEntry[], incoming: MilkEntry[]): MilkEntry[] {
  const seen = new Set(base.map(entrySig))
  const out = [...base]
  for (const e of incoming) {
    const sig = entrySig(e)
    if (seen.has(sig)) continue
    seen.add(sig)
    out.push(e)
  }
  return out.map((e, i) => ({ ...e, id: i + 1 }))
}

// Auto-push: data badle to cloud pe bhej do (debounced)
let pushTimer: ReturnType<typeof setTimeout> | null = null
function scheduleCloudPush(get: () => StoreState) {
  const s = get()
  if (!s.cloudUser || !s.currentUser || !s.currentUser.startsWith('g:')) return
  if (pushTimer) clearTimeout(pushTimer)
  pushTimer = setTimeout(() => {
    void get().cloudPush()
  }, 1500)
}

export interface ReminderConfig {
  morningEnabled: boolean
  eveningEnabled: boolean
  morningTime: string
  eveningTime: string
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: {},
      allEntries: {},
      nextEntryId: {},
      allRates: {},
      allReminders: {},
      allDeductions: {},
      nextDeductionId: {},
      activeTab: 'home',
      lang: 'hi' as Lang,
      reviews: [],
      nextReviewId: 1,
      cloudUser: null,
      cloudStatus: 'idle',

      // LOGIN — async, PIN ko SHA-256 hash karke compare karta hai
      // Old plain-text PIN ke liye migration fallback bhi hai
      login: async (username, pin) => {
        const key = username.toLowerCase().trim()
        const u = get().users[key]
        if (!u) return false
        // Try hashed PIN first (new format)
        const ok = await verifyPin(pin, u.pin)
        if (ok) {
          set({ currentUser: key })
          return true
        }
        // Fallback: old plain-text PIN (migration)
        if (u.pin === pin) {
          const pinHash = await hashPin(pin)
          set((s) => ({ users: { ...s.users, [key]: { ...s.users[key], pin: pinHash } } }))
          set({ currentUser: key })
          return true
        }
        return false
      },

      // SIGNUP — PIN ko hash karke store karta hai
      signup: async (username, pin) => {
        const key = username.toLowerCase().trim()
        if (!key || get().users[key]) return false
        const pinHash = await hashPin(pin)
        set((s) => ({
          users: { ...s.users, [key]: { username: key, pin: pinHash } },
          allEntries: { ...s.allEntries, [key]: [] },
          nextEntryId: { ...s.nextEntryId, [key]: 1 },
          allRates: { ...s.allRates, [key]: { gaay: 0, bhains: 0 } },
          allReminders: { ...s.allReminders, [key]: { morningEnabled: false, eveningEnabled: false, morningTime: '06:00', eveningTime: '18:00' } },
          currentUser: key,
        }))
        return true
      },

      // RESET PIN — naya PIN bhi hash hoke store hota hai
      resetPin: async (username, newPin) => {
        const key = username.toLowerCase().trim()
        const u = get().users[key]
        if (!u) return false
        const pinHash = await hashPin(newPin)
        set((s) => ({ users: { ...s.users, [key]: { ...s.users[key], pin: pinHash } } }))
        return true
      },

      logout: () => set({ currentUser: null, activeTab: 'home' }),
      setActiveTab: (t) => set({ activeTab: t }),
      setLang: (l) => set({ lang: l }),

      setRates: (gaay, bhains, gaayFat, bhainsFat) => {
        const u = get().currentUser
        if (!u) return
        set((s) => ({
          allRates: { ...s.allRates, [u]: { gaay, bhains, gaayFat: gaayFat || 0, bhainsFat: bhainsFat || 0 } },
        }))
        scheduleCloudPush(get)
      },

      addDeduction: (d) => {
        const u = get().currentUser
        if (!u) return
        const id = get().nextDeductionId[u] || 1
        set((s) => ({
          allDeductions: {
            ...s.allDeductions,
            [u]: [{ ...d, id, createdAt: Date.now() }, ...(s.allDeductions[u] || [])],
          },
          nextDeductionId: { ...s.nextDeductionId, [u]: id + 1 },
        }))
        scheduleCloudPush(get)
      },

      removeDeduction: (id) => {
        const u = get().currentUser
        if (!u) return
        set((s) => ({
          allDeductions: { ...s.allDeductions, [u]: (s.allDeductions[u] || []).filter((d) => d.id !== id) },
        }))
        scheduleCloudPush(get)
      },

      setReminders: (config) => {
        const u = get().currentUser
        if (!u) return
        set((s) => ({ allReminders: { ...s.allReminders, [u]: config } }))
        scheduleCloudPush(get)
      },

      addEntry: (e) => {
        const u = get().currentUser
        if (!u) return
        const id = get().nextEntryId[u] || 1
        set((s) => ({
          allEntries: { ...s.allEntries, [u]: [...(s.allEntries[u] || []), { ...e, id, createdAt: Date.now() }] },
          nextEntryId: { ...s.nextEntryId, [u]: id + 1 },
        }))
        scheduleCloudPush(get)
      },

      removeEntry: (id) => {
        const u = get().currentUser
        if (!u) return
        set((s) => ({
          allEntries: { ...s.allEntries, [u]: (s.allEntries[u] || []).filter((e) => e.id !== id) },
        }))
        scheduleCloudPush(get)
      },

      editEntry: (id, updates) => {
        const u = get().currentUser
        if (!u) return
        set((s) => ({
          allEntries: {
            ...s.allEntries,
            [u]: (s.allEntries[u] || []).map((e) => (e.id === id ? { ...e, ...updates } : e)),
          },
        }))
        scheduleCloudPush(get)
      },

      addReview: (r) => {
        const id = get().nextReviewId || 1
        set((s) => ({
          reviews: [{ ...r, id, createdAt: Date.now() }, ...(s.reviews || [])],
          nextReviewId: id + 1,
        }))
      },

      removeReview: (id) => {
        set((s) => ({ reviews: (s.reviews || []).filter((r) => r.id !== id) }))
      },

      importEntries: (newEntries) => {
        const u = get().currentUser
        if (!u) return
        const existing = get().allEntries[u] || []
        const existingKeys = new Set(existing.map((e) => `${e.date}|${e.animalType}|${e.animalName || ''}|${e.session}|${e.liters}`))
        const toAdd: MilkEntry[] = []
        for (const e of newEntries) {
          const key = `${e.date}|${e.animalType}|${e.animalName || ''}|${e.session}|${e.liters}`
          if (!existingKeys.has(key)) {
            toAdd.push(e)
            existingKeys.add(key)
          }
        }
        const merged = [...existing, ...toAdd]
        const maxId = merged.reduce((mx, e) => Math.max(mx, e.id), 0)
        set((s) => ({
          allEntries: { ...s.allEntries, [u]: merged },
          nextEntryId: { ...s.nextEntryId, [u]: maxId + 1 },
        }))
        scheduleCloudPush(get)
      },

      // ─── Cloud actions ───

      setCloudUser: (u) => set({ cloudUser: u, cloudStatus: u ? get().cloudStatus : 'idle' }),

      googleLogin: async () => {
        if (!isCloudAvailable()) {
          return { ok: false, error: 'Firebase config nahi bhara hai. Guide tab mein setup dekho.' }
        }
        set({ cloudStatus: 'syncing' })
        try {
          const cu = await signInWithGoogle()
          const key = googleKey(cu.uid)
          set((s) => ({
            users: { ...s.users, [key]: { username: cu.name || cu.email, pin: '' } },
            allEntries: { ...s.allEntries, [key]: s.allEntries[key] || [] },
            nextEntryId: { ...s.nextEntryId, [key]: s.nextEntryId[key] || 1 },
            allRates: { ...s.allRates, [key]: s.allRates[key] || { gaay: 0, bhains: 0 } },
            allReminders: { ...s.allReminders, [key]: s.allReminders[key] || DEFAULT_REMINDERS },
            cloudUser: cu,
            currentUser: key,
            activeTab: 'home',
          }))

          const cloud = await loadCloud(cu.uid)
          if (cloud && cloud.entries.length > 0) {
            const incoming = sanitizeEntries(cloud.entries)
            const merged = mergeEntries(get().allEntries[key] || [], incoming)
            set((s) => ({
              allEntries: { ...s.allEntries, [key]: merged },
              nextEntryId: { ...s.nextEntryId, [key]: merged.length + 1 },
              allRates: { ...s.allRates, [key]: cloud.rates },
              allReminders: { ...s.allReminders, [key]: cloud.reminders },
              cloudStatus: 'synced',
            }))
          } else {
            set({ cloudStatus: 'synced' })
          }
          return { ok: true }
        } catch (e) {
          set({ cloudStatus: 'error' })
          return { ok: false, error: errText(e) }
        }
      },

      googleLogout: async () => {
        try {
          await signOutGoogle()
        } catch {
          // ignore
        }
        set({ cloudUser: null, cloudStatus: 'idle' })
      },

      cloudPull: async () => {
        const { cloudUser, currentUser } = get()
        if (!cloudUser || !currentUser) return { ok: false, error: 'Pehle Google se login karo' }
        set({ cloudStatus: 'syncing' })
        try {
          const cloud = await loadCloud(cloudUser.uid)
          if (!cloud) {
            set({ cloudStatus: 'synced' })
            return { ok: true }
          }
          const incoming = sanitizeEntries(cloud.entries)
          const merged = mergeEntries(get().allEntries[currentUser] || [], incoming)
          set((s) => ({
            allEntries: { ...s.allEntries, [currentUser]: merged },
            nextEntryId: { ...s.nextEntryId, [currentUser]: merged.length + 1 },
            allRates: { ...s.allRates, [currentUser]: cloud.rates },
            allReminders: { ...s.allReminders, [currentUser]: cloud.reminders },
            cloudStatus: 'synced',
          }))
          return { ok: true }
        } catch (e) {
          set({ cloudStatus: 'error' })
          return { ok: false, error: errText(e) }
        }
      },

      cloudPush: async () => {
        const { cloudUser, currentUser, allEntries, allRates, allReminders } = get()
        if (!cloudUser || !currentUser) return { ok: false, error: 'Pehle Google se login karo' }
        set({ cloudStatus: 'syncing' })
        try {
          await saveCloud(
            cloudUser.uid,
            {
              entries: allEntries[currentUser] || [],
              rates: allRates[currentUser] || { gaay: 0, bhains: 0 },
              deductions: get().allDeductions[currentUser] || [],
              reminders: allReminders[currentUser] || DEFAULT_REMINDERS,
            },
            cloudUser.email,
          )
          set({ cloudStatus: 'synced' })
          return { ok: true }
        } catch (e) {
          set({ cloudStatus: 'error' })
          return { ok: false, error: errText(e) }
        }
      },

      restoreBackup: (data) => {
        const u = get().currentUser
        if (!u) return { ok: false, entries: 0, reviews: 0, error: 'Pehle login karo' }
        try {
          const incoming = sanitizeEntries(data.entries as unknown[])
          const merged = mergeEntries(get().allEntries[u] || [], incoming)

          const existingReviews = get().reviews || []
          const seen = new Set(
            existingReviews.map((r) => `${r.name}|${r.problem}|${r.suggestion}|${r.createdAt}`),
          )
          const newReviews = (data.reviews || []).filter((r) => {
            const sig = `${r.name}|${r.problem}|${r.suggestion}|${r.createdAt}`
            if (seen.has(sig)) return false
            seen.add(sig)
            return true
          })
          let nextRid = get().nextReviewId || 1
          const withIds = newReviews.map((r) => ({ ...r, id: nextRid++ }))

          const curRates = get().allRates[u] || { gaay: 0, bhains: 0 }
          const ratesToUse = curRates.gaay || curRates.bhains ? curRates : data.rates

          const curRem = get().allReminders[u] || DEFAULT_REMINDERS
          const remIsDefault =
            !curRem.morningEnabled &&
            !curRem.eveningEnabled &&
            curRem.morningTime === '06:00' &&
            curRem.eveningTime === '18:00'
          const remToUse = remIsDefault ? data.reminders : curRem

          set((s) => ({
            allEntries: { ...s.allEntries, [u]: merged },
            nextEntryId: { ...s.nextEntryId, [u]: merged.length + 1 },
            allRates: { ...s.allRates, [u]: ratesToUse },
            allReminders: { ...s.allReminders, [u]: remToUse },
            reviews: [...withIds, ...existingReviews],
            nextReviewId: nextRid,
          }))
          scheduleCloudPush(get)
          return { ok: true, entries: merged.length, reviews: withIds.length }
        } catch {
          return { ok: false, entries: 0, reviews: 0, error: 'Restore fail ho gaya' }
        }
      },

      migrateLocalToCloud: async (sourceKey) => {
        const { cloudUser, currentUser } = get()
        if (!cloudUser || !currentUser) return { ok: false, count: 0, error: 'Pehle Google se login karo' }
        if (!sourceKey || sourceKey.startsWith('g:')) {
          return { ok: false, count: 0, error: 'Sahi local account chuno' }
        }
        const sourceEntries = get().allEntries[sourceKey] || []
        if (sourceEntries.length === 0) {
          return { ok: false, count: 0, error: 'Us account mein koi entry nahi hai' }
        }
        const merged = mergeEntries(get().allEntries[currentUser] || [], sourceEntries)
        const sourceRates = get().allRates[sourceKey] || { gaay: 0, bhains: 0 }
        const currentRates = get().allRates[currentUser] || { gaay: 0, bhains: 0 }
        const ratesToUse =
          currentRates.gaay || currentRates.bhains ? currentRates : sourceRates
        set((s) => ({
          allEntries: { ...s.allEntries, [currentUser]: merged },
          nextEntryId: { ...s.nextEntryId, [currentUser]: merged.length + 1 },
          allRates: { ...s.allRates, [currentUser]: ratesToUse },
        }))
        const pushed = await get().cloudPush()
        if (!pushed.ok) return { ok: false, count: 0, error: pushed.error }
        return { ok: true, count: sourceEntries.length }
      },
    }),
    {
      name: 'doodh-tracker-v4',
      storage: encryptedStorage,
    },
  ),
)

export function useEntries(): MilkEntry[] {
  const currentUser = useStore((s) => s.currentUser)
  const allEntries = useStore((s) => s.allEntries)
  return currentUser ? (allEntries[currentUser] || []) : []
}

export function useRates(): Rates {
  const currentUser = useStore((s) => s.currentUser)
  const allRates = useStore((s) => s.allRates)
  return currentUser ? (allRates[currentUser] || { gaay: 0, bhains: 0 }) : { gaay: 0, bhains: 0 }
}

export function useDeductions(): Deduction[] {
  const currentUser = useStore((s) => s.currentUser)
  const allDeductions = useStore((s) => s.allDeductions)
  return currentUser ? allDeductions[currentUser] || [] : []
}

export function useReviews(): Review[] {
  return useStore((s) => s.reviews) || []
}

export function useReminders(): ReminderConfig {
  const currentUser = useStore((s) => s.currentUser)
  const allReminders = useStore((s) => s.allReminders)
  return currentUser ? (allReminders[currentUser] || { morningEnabled: false, eveningEnabled: false, morningTime: '06:00', eveningTime: '18:00' }) : { morningEnabled: false, eveningEnabled: false, morningTime: '06:00', eveningTime: '18:00' }
}

export function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
export function fmtDate(d: string): string { const [y, m, day] = d.split('-'); return `${day}/${m}/${y}` }
export function monthStr(d?: string): string {
  const dt = d ? new Date(d + 'T00:00:00') : new Date()
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`
}
export function fmtMonth(m: string): string { const [y, mo] = m.split('-'); const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; return `${names[parseInt(mo) - 1]} ${y}` }

export function dayTotal(entries: MilkEntry[], date: string): number { return entries.filter((e) => e.date === date).reduce((s, e) => s + e.liters, 0) }
export function sessionTotal(entries: MilkEntry[], date: string, session: 'morning' | 'evening'): number { return entries.filter((e) => e.date === date && e.session === session).reduce((s, e) => s + e.liters, 0) }

export function last7Days(): string[] {
  const out: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
  }
  return out
}

export function typeTotal(entries: MilkEntry[], type: 'gaay' | 'bhains'): number { return entries.filter((e) => e.animalType === type).reduce((s, e) => s + e.liters, 0) }

export function filterByDateRange(entries: MilkEntry[], from: string, to: string): MilkEntry[] {
  return entries.filter((e) => e.date >= from && e.date <= to)
}

export function filterByMonth(entries: MilkEntry[], month: string): MilkEntry[] {
  return entries.filter((e) => e.date.startsWith(month))
}

export interface AnimalStat {
  name: string
  type: 'gaay' | 'bhains'
  totalLiters: number
  entries: number
  /** Kul paisa (jab rates diye ho) */
  totalAmount?: number
}

export function animalBreakdown(entries: MilkEntry[], rates?: Rates): AnimalStat[] {
  const map: Record<string, AnimalStat & { totalAmount?: number }> = {}
  for (const e of entries) {
    const key = `${e.animalType}-${e.animalName || 'default'}`
    if (!map[key]) {
      map[key] = {
        name: e.animalName || (e.animalType === 'gaay' ? 'Gaay' : 'Bhains'),
        type: e.animalType,
        totalLiters: 0,
        entries: 0,
        totalAmount: 0,
      }
    }
    map[key].totalLiters += e.liters
    map[key].entries++
    if (rates) map[key].totalAmount = (map[key].totalAmount || 0) + entryAmount(e, rates)
  }
  return Object.values(map).sort((a, b) => b.totalLiters - a.totalLiters) as AnimalStat[]
}

/**
 * Ek entry ka paisa.
 * Agar entry mein FAT diya hai aur FAT rate bhi set hai -> FAT se hisaab:
 *   paisa = litre x (FAT/100) x (₹ per kg FAT)
 * Warna simple ₹/litre rate se.
 */
export function entryAmount(e: MilkEntry, rates: Rates): number {
  const fatRate = (e.animalType === 'gaay' ? rates.gaayFat : rates.bhainsFat) || 0
  if (e.fat && e.fat > 0 && fatRate > 0) {
    return (e.liters * e.fat * fatRate) / 100
  }
  const fixed = (e.animalType === 'gaay' ? rates.gaay : rates.bhains) || 0
  return e.liters * fixed
}

export function calcPaisa(entries: MilkEntry[], rates: Rates): number {
  return entries.reduce((s, e) => s + entryAmount(e, rates), 0)
}

export function deductionTotal(list: Deduction[]): number {
  return list.reduce((s, d) => s + (d.amount || 0), 0)
}

export function monthTotal(entries: MilkEntry[], month: string): number {
  return filterByMonth(entries, month).reduce((s, e) => s + e.liters, 0)
}

export function monthPaisa(entries: MilkEntry[], month: string, rates: Rates): number {
  return calcPaisa(filterByMonth(entries, month), rates)
}

function csvEscape(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return '"' + value.replace(/"/g, '""') + '"'
  }
  return value
}

export function exportCSV(entries: MilkEntry[], rates: Rates): string {
  const header = 'Date,Janwar,Naam,Session,Litres,Rate,Paisa,Note\n'
  const rows = entries.map((e) => {
    const rate = e.animalType === 'gaay' ? rates.gaay : rates.bhains
    const paisa = e.liters * rate
    const name = e.animalName || ''
    const note = (e.note || '').replace(/,/g, ';')
    return [e.date, e.animalType === 'gaay' ? 'Gaay' : 'Bhains', name, e.session === 'morning' ? 'Subah' : 'Shaam', String(e.liters), String(rate), String(paisa), note].map(csvEscape).join(',')
  })
  return header + rows.join('\n')
}

export function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function parseCSV(text: string): MilkEntry[] {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []
  const entries: MilkEntry[] = []
  let id = 1
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',')
    if (cols.length < 5) continue
    const date = cols[0]?.trim()
    const janwar = cols[1]?.trim().toLowerCase()
    const naam = cols[2]?.trim() || undefined
    const sessionRaw = cols[3]?.trim().toLowerCase()
    const liters = parseFloat(cols[4]?.trim()) || 0
    const note = cols[7]?.trim() || undefined
    if (!date || !janwar) continue
    const animalType = janwar.includes('bhains') ? 'bhains' : 'gaay'
    const session = sessionRaw.includes('shaam') || sessionRaw.includes('evening') ? 'evening' : 'morning'
    entries.push({ id: id++, date, animalType, animalName: naam, session, liters, note, createdAt: Date.now() + i })
  }
  return entries
}

let reminderInterval: ReturnType<typeof setInterval> | null = null

export function startReminders(config: ReminderConfig) {
  if (reminderInterval) clearInterval(reminderInterval)
  if (!config.morningEnabled && !config.eveningEnabled) return
  let lastFired = ''
  reminderInterval = setInterval(() => {
    const now = new Date()
    const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const key = `${hhmm}`
    if (key === lastFired) return
    if (config.morningEnabled && hhmm === config.morningTime) {
      lastFired = key
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🥛 Doodh Tracker', { body: 'Subah ka doodh entry karo!' })
      }
    }
    if (config.eveningEnabled && hhmm === config.eveningTime) {
      lastFired = key
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🥛 Doodh Tracker', { body: 'Shaam ka doodh entry karo!' })
      }
    }
  }, 30000)
}
