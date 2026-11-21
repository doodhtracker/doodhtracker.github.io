import { Home, Plus, BarChart3, Settings, BookOpen, MessageSquare } from 'lucide-react'
import { useStore } from '../store'
import { useT } from '../i18n'

export default function BottomNav() {
  const activeTab = useStore((s) => s.activeTab)
  const setActiveTab = useStore((s) => s.setActiveTab)
  const t = useT()

  const tabs = [
    { id: 'home' as const, key: 'nav.home', icon: Home },
    { id: 'entry' as const, key: 'nav.entry', icon: Plus },
    { id: 'stats' as const, key: 'nav.stats', icon: BarChart3 },
    { id: 'settings' as const, key: 'nav.settings', icon: Settings },
    { id: 'guide' as const, key: 'nav.guide', icon: BookOpen },
    { id: 'review' as const, key: 'nav.review', icon: MessageSquare },
  ]

  return (
    <nav className="w-full bg-emerald-950/95 backdrop-blur border-t border-emerald-800 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-md mx-auto flex">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
                isActive ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[11px] font-semibold leading-tight">{t(tab.key)}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
