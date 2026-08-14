// Milk entry — no animal name/tag, just type + session + liters
export type AnimalType = 'gaay' | 'bhains'

export interface MilkEntry {
  id: number
  date: string
  animalType: AnimalType
  session: 'morning' | 'evening'
  liters: number
  note?: string
  createdAt: number
}

export interface User {
  username: string
  pin: string
}

export type Tab = 'home' | 'entry' | 'stats'
