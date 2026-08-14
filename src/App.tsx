import Header from './components/Header'
import BottomNav from './components/BottomNav'
import Login from './components/Login'
import HomeTab from './tabs/HomeTab'
import EntryTab from './tabs/EntryTab'
import StatsTab from './tabs/StatsTab'
import SettingsTab from './tabs/SettingsTab'
import { useStore } from './store'

export default function App() {
  const currentUser = useStore((s) => s.currentUser)
  const activeTab = useStore((s) => s.activeTab)

  if (!currentUser) return <Login />

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans selection:bg-fuchsia-500/30 pb-24">
      <Header />
      <main className="max-w-md mx-auto px-4 py-4">
        {activeTab === 'home' && <HomeTab />}
        {activeTab === 'entry' && <EntryTab />}
        {activeTab === 'stats' && <StatsTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </main>
      <BottomNav />
    </div>
  )
}
