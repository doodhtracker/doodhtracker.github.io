import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { MilkEntry, User, Tab, Rates } from './types'
import { hashPin, verifyPin, encryptData, decryptData } from './crypto'

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
  setRates: (gaay: number, bhains: number) => void

  allReminders: Record<string, ReminderConfig>
  setReminders: (config: ReminderConfig) => void

  activeTab: Tab
  setActiveTab: (t: Tab) => void

  addEntry: (e: Omit<MilkEntry, 'id' | 'createdAt'>) => void
  removeEntry: (id: number) => void
  importEntries: (entries: MilkEntry[]) => void
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
      activeTab: 'home',

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

      setRates: (gaay, bhains) => {
        const u = get().currentUser
        if (!u) return
        set((s) => ({ allRates: { ...s.allRates, [u]: { gaay, bhains } } }))
      },

      setReminders: (config) => {
        const u = get().currentUser
        if (!u) return
        set((s) => ({ allReminders: { ...s.allReminders, [u]: config } }))
      },

      addEntry: (e) => {
        const u = get().currentUser
        if (!u) return
        const id = get().nextEntryId[u] || 1
        set((s) => ({
          allEntries: { ...s.allEntries, [u]: [...(s.allEntries[u] || []), { ...e, id, createdAt: Date.now() }] },
          nextEntryId: { ...s.nextEntryId, [u]: id + 1 },
        }))
      },

      removeEntry: (id) => {
        const u = get().currentUser
        if (!u) return
        set((s) => ({
          allEntries: { ...s.allEntries, [u]: (s.allEntries[u] || []).filter((e) => e.id !== id) },
        }))
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
}

export function animalBreakdown(entries: MilkEntry[]): AnimalStat[] {
  const map: Record<string, AnimalStat> = {}
  for (const e of entries) {
    const key = `${e.animalType}-${e.animalName || 'default'}`
    if (!map[key]) map[key] = { name: e.animalName || (e.animalType === 'gaay' ? 'Gaay' : 'Bhains'), type: e.animalType, totalLiters: 0, entries: 0 }
    map[key].totalLiters += e.liters
    map[key].entries++
  }
  return Object.values(map).sort((a, b) => b.totalLiters - a.totalLiters)
}

export function calcPaisa(entries: MilkEntry[], rates: Rates): number {
  return entries.reduce((s, e) => s + e.liters * (e.animalType === 'gaay' ? rates.gaay : rates.bhains), 0)
}

export function monthTotal(entries: MilkEntry[], month: string): number {
  return filterByMonth(entries, month).reduce((s, e) => s + e.liters, 0)
}

export function monthPaisa(entries: MilkEntry[], month: string, rates: Rates): number {
  return calcPaisa(filterByMonth(entries, month), rates)
}

export function exportCSV(entries: MilkEntry[], rates: Rates): string {
  const header = 'Date,Janwar,Naam,Session,Litres,Rate,Paisa,Note\n'
  const rows = entries.map((e) => {
    const rate = e.animalType === 'gaay' ? rates.gaay : rates.bhains
    const paisa = e.liters * rate
    const name = e.animalName || ''
    const note = (e.note || '').replace(/,/g, ';')
    return `${e.date},${e.animalType === 'gaay' ? 'Gaay' : 'Bhains'},${name},${e.session === 'morning' ? 'Subah' : 'Shaam'},${e.liters},${rate},${paisa},${note}`
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
  reminderInterval = setInterval(() => {
    const now = new Date()
    const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    if (config.morningEnabled && hhmm === config.morningTime) {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🥛 Doodh Tracker', { body: 'Subah ka doodh entry karo!' })
      }
    }
    if (config.eveningEnabled && hhmm === config.eveningTime) {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🥛 Doodh Tracker', { body: 'Shaam ka doodh entry karo!' })
      }
    }
  }, 30000)
}
