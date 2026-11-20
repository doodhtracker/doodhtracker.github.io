import { useEffect } from 'react'
import { Home, Plus, BarChart3, Settings, BookOpen, MessageSquare } from 'lucide-react'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import Login from './components/Login'
import HomeTab from './tabs/HomeTab'
import EntryTab from './tabs/EntryTab'
import StatsTab from './tabs/StatsTab'
import SettingsTab from './tabs/SettingsTab'
import GuideTab from './tabs/GuideTab'
import ReviewTab from './tabs/ReviewTab'
import { useStore } from './store'
import { watchAuth, isCloudAvailable } from './cloud'

const TABS = [
  { id: 'home' as const, label: 'Home', icon: Home },
  { id: 'entry' as const, label: 'Entry', icon: Plus },
  { id: 'stats' as const, label: 'Stats', icon: BarChart3 },
  { id: 'settings' as const, label: 'Settings', icon: Settings },
  { id: 'guide' as const, label: 'Guide', icon: BookOpen },
  { id: 'review' as const, label: 'Review', icon: MessageSquare },
]

export default function App() {
  const currentUser = useStore((s) => s.currentUser)
  const activeTab = useStore((s) => s.activeTab)
  const setActiveTab = useStore((s) => s.setActiveTab)

  useEffect(() => {
    if (!isCloudAvailable()) return
    return watchAuth((u) => {
      if (!u) useStore.getState().setCloudUser(null)
    })
  }, [])

  if (!currentUser) return <Login />

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans selection:bg-fuchsia-500/30 pb-24 md:pb-10">
      <Header />

      <nav className="hidden border-b border-emerald-800/70 bg-emerald-950/60 md:block">
        <div className="mx-auto flex w-full max-w-md items-center gap-1 px-4 py-2 md:max-w-3xl md:px-6">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-amber-500 text-emerald-950'
                    : 'text-emerald-300 hover:bg-emerald-900/70 hover:text-emerald-100'
                }`}
              >
                <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </nav>

      <main className="mx-auto w-full max-w-md px-4 py-4 md:max-w-3xl md:px-6 md:py-6">
        {activeTab === 'home' && <HomeTab />}
        {activeTab === 'entry' && <EntryTab />}
        {activeTab === 'stats' && <StatsTab />}
        {activeTab === 'settings' && <SettingsTab />}
        {activeTab === 'guide' && <GuideTab />}
        {activeTab === 'review' && <ReviewTab />}
      </main>

      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  )
}
