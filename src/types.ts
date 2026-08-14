// Animal types
export type AnimalType = 'gaay' | 'bhains'

export interface MilkEntry {
  id: number
  date: string
  animalId: number
  animalName: string
  animalType: AnimalType
  session: 'morning' | 'evening'
  liters: number
  note?: string
  createdAt: number
}

export interface Animal {
  id: number
  name: string
  type: AnimalType
  tagNumber?: string
  createdAt: number
}

export type Tab = 'home' | 'entry' | 'stats'
