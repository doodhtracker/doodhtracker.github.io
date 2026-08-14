import { Milk, LogOut } from 'lucide-react'
import { useStore } from '../store'

export default function Header() {
  const currentUser = useStore((s) => s.currentUser)
  const logout = useStore((s) => s.logout)
  return (
    <header className="sticky top-0 z-20 bg-emerald-950/90 backdrop-blur border-b border-emerald-800">
      <div className="max-w-md mx-auto flex items-center gap-2 px-4 py-3">
        <Milk className="text-amber-300" size={26} />
        <h1 className="text-lg font-bold text-white">🥛 Doodh Tracker</h1>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-emerald-400 text-xs font-semibold bg-emerald-900/60 px-2 py-1 rounded-full">{currentUser}</span>
          <button onClick={logout} className="text-red-400/70 hover:text-red-400 transition-colors" title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  )
}
