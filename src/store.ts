import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Animal, MilkEntry, Tab } from './types'

interface StoreState {
  animals: Animal[]
  entries: MilkEntry[]
  activeTab: Tab
  nextAnimalId: number
  nextEntryId: number
  setActiveTab: (t: Tab) => void
  addAnimal: (name: string, type: Animal['type'], tagNumber?: string) => void
  getOrCreateAnimal: (name: string, type: Animal['type']) => number
  removeAnimal: (id: number) => void
  addEntry: (e: Omit<MilkEntry, 'id' | 'createdAt'>) => void
  removeEntry: (id: number) => void
  updateEntry: (id: number, liters: number, note?: string) => void
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      animals: [],
      entries: [],
      activeTab: 'home',
      nextAnimalId: 1,
      nextEntryId: 1,
      setActiveTab: (t) => set({ activeTab: t }),
      addAnimal: (name, type, tagNumber) =>
        set((s) => ({
          animals: [...s.animals, { id: s.nextAnimalId, name, type, tagNumber, createdAt: Date.now() }],
          nextAnimalId: s.nextAnimalId + 1,
        })),
      getOrCreateAnimal: (name, type) => {
        const existing = get().animals.find(
          (a) => a.name.toLowerCase() === name.toLowerCase() && a.type === type,
        )
        if (existing) return existing.id
        const newId = get().nextAnimalId
        set((s) => ({
          animals: [...s.animals, { id: newId, name, type, createdAt: Date.now() }],
          nextAnimalId: newId + 1,
        }))
        return newId
      },
      removeAnimal: (id) =>
        set((s) => ({
          animals: s.animals.filter((a) => a.id !== id),
          entries: s.entries.filter((e) => e.animalId !== id),
        })),
      addEntry: (e) =>
        set((s) => ({
          entries: [...s.entries, { ...e, id: s.nextEntryId, createdAt: Date.now() }],
          nextEntryId: s.nextEntryId + 1,
        })),
      removeEntry: (id) =>
        set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),
      updateEntry: (id, liters, note) =>
        set((s) => ({
          entries: s.entries.map((e) => (e.id === id ? { ...e, liters, note } : e)),
        })),
    }),
    { name: 'doodh-tracker' },
  ),
)

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}
export function fmtDate(d: string): string {
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}
export function dayTotal(entries: MilkEntry[], date: string): number {
  return entries.filter((e) => e.date === date).reduce((s, e) => s + e.liters, 0)
}
export function sessionTotal(entries: MilkEntry[], date: string, session: 'morning' | 'evening'): number {
  return entries.filter((e) => e.date === date && e.session === session).reduce((s, e) => s + e.liters, 0)
}
export function last7Days(): string[] {
  const out: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    out.push(d.toISOString().slice(0, 10))
  }
  return out
}
export function animalTotal(entries: MilkEntry[], animalId: number): number {
  return entries.filter((e) => e.animalId === animalId).reduce((s, e) => s + e.liters, 0)
}
export function typeTotal(entries: MilkEntry[], type: 'gaay' | 'bhains'): number {
  return entries.filter((e) => e.animalType === type).reduce((s, e) => s + e.liters, 0)
}
