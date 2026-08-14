import { Milk } from 'lucide-react'

export default function Header() {
  return (
    <header className="sticky top-0 z-20 bg-emerald-950/90 backdrop-blur border-b border-emerald-800">
      <div className="max-w-md mx-auto flex items-center gap-2 px-4 py-3">
        <Milk className="text-amber-300" size={26} />
        <h1 className="text-lg font-bold text-white">🥛 Doodh Tracker</h1>
      </div>
    </header>
  )
}
