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
  /** FAT % — dairy/society ke liye (optional). Diya ho to rate FAT se lagta hai. */
  fat?: number
  createdAt: number
}

export interface User {
  username: string
  pin: string
}

export interface Rates {
  gaay: number
  bhains: number
  /** ₹ per kg FAT — dairy/society ka tarika (optional) */
  gaayFat?: number
  bhainsFat?: number
}

/** Advance ya pashu aahar — jo bill se minus hota hai */
export interface Deduction {
  id: number
  date: string
  kind: 'advance' | 'aahar' | 'other'
  note?: string
  amount: number
  createdAt: number
}

// Review / feedback — koi bhi user apni problem ya suggestion likh sakta hai
export interface Review {
  id: number
  name: string
  rating: number
  problem: string
  suggestion: string
  createdAt: number
}

export type Tab = 'home' | 'entry' | 'stats' | 'settings' | 'guide' | 'review'
