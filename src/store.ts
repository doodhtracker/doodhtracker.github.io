import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MilkEntry, User, Tab } from './types'

interface StoreState {
  currentUser: string | null
  users: Record<string, User>
  login: (username: string, pin: string) => boolean
  signup: (username: string, pin: string) => boolean
  logout: () => void
  allEntries: Record<string, MilkEntry[]>
  nextEntryId: Record<string, number>
  activeTab: Tab
  setActiveTab: (t: Tab) => void
  addEntry: (e: Omit<MilkEntry, 'id' | 'createdAt'>) => void
  removeEntry: (id: number) => void
}

function hashPin(pin: string): string {
  let h = 0
  for (let i = 0; i < pin.length; i++) {
    h = (h << 5) - h + pin.charCodeAt(i)
    h |= 0
  }
  return String(h)
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: {},
      allEntries: {},
      nextEntryId: {},
      activeTab: 'home',

      login: (username, pin) => {
        const u = get().users[username.toLowerCase()]
        if (!u || u.pin !== hashPin(pin)) return false
        set({ currentUser: username.toLowerCase() })
        return true
      },

      signup: (username, pin) => {
        const key = username.toLowerCase().trim()
        if (!key || get().users[key]) return false
        set((s) => ({
          users: { ...s.users, [key]: { username: key, pin: hashPin(pin) } },
          allEntries: { ...s.allEntries, [key]: [] },
          nextEntryId: { ...s.nextEntryId, [key]: 1 },
          currentUser: key,
        }))
        return true
      },

      logout: () => set({ currentUser: null, activeTab: 'home' }),
      setActiveTab: (t) => set({ activeTab: t }),

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
    }),
    { name: 'doodh-tracker-v2' },
  ),
)

export function useEntries(): MilkEntry[] {
  const currentUser = useStore((s) => s.currentUser)
  const allEntries = useStore((s) => s.allEntries)
  return currentUser ? (allEntries[currentUser] || []) : []
}

export function todayStr(): string { return new Date().toISOString().slice(0, 10) }
export function fmtDate(d: string): string { const [y, m, day] = d.split('-'); return `${day}/${m}/${y}` }
export function dayTotal(entries: MilkEntry[], date: string): number { return entries.filter((e) => e.date === date).reduce((s, e) => s + e.liters, 0) }
export function sessionTotal(entries: MilkEntry[], date: string, session: 'morning' | 'evening'): number { return entries.filter((e) => e.date === date && e.session === session).reduce((s, e) => s + e.liters, 0) }
export function last7Days(): string[] {
  const out: string[] = []
  for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); out.push(d.toISOString().slice(0, 10)) }
  return out
}
export function typeTotal(entries: MilkEntry[], type: 'gaay' | 'bhains'): number { return entries.filter((e) => e.animalType === type).reduce((s, e) => s + e.liters, 0) }
