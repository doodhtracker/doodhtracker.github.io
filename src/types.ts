// Milk entry — optional animal name for per-animal tracking
export type AnimalType = 'gaay' | 'bhains'

export interface MilkEntry {
  id: number
  date: string
  animalType: AnimalType
  animalName?: string
  session: 'morning' | 'evening'
  liters: number
  note?: string
  createdAt: number
}

export interface User {
  username: string
  pin: string
}

export interface Rates {
  gaay: number
  bhains: number
}

export type Tab = 'home' | 'entry' | 'stats' | 'settings'
