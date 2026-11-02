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
