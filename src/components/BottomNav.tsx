import { Home, ClipboardList, BarChart3 } from 'lucide-react'
import { useStore } from '../store'
import type { Tab } from '../types'

const items: { key: Tab; label: string; icon: typeof Home }[] = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'entry', label: 'Entry', icon: ClipboardList },
  { key: 'stats', label: 'Stats', icon: BarChart3 },
]

export default function BottomNav() {
  const activeTab = useStore((s) => s.activeTab)
  const setActiveTab = useStore((s) => s.setActiveTab)
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 bg-emerald-950/95 backdrop-blur border-t border-emerald-800">
      <div className="max-w-md mx-auto flex">
        {items.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${activeTab === key ? 'text-amber-300' : 'text-emerald-500'}`}>
            <Icon size={20} />
            <span className="text-[10px] font-semibold">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
