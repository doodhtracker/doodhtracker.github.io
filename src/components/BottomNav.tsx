import { Home, Plus, BarChart3, Settings } from 'lucide-react'
import { useStore } from '../store'

export default function BottomNav() {
  const activeTab = useStore((s) => s.activeTab)
  const setActiveTab = useStore((s) => s.setActiveTab)

  const tabs = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'entry' as const, label: 'Entry', icon: Plus },
    { id: 'stats' as const, label: 'Stats', icon: BarChart3 },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 bg-emerald-950/95 backdrop-blur border-t border-emerald-800">
      <div className="max-w-md mx-auto flex">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
                isActive ? 'text-amber-400' : 'text-emerald-600'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-semibold">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
