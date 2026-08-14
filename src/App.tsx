import Header from './components/Header'
import BottomNav from './components/BottomNav'
import HomeTab from './tabs/HomeTab'
import EntryTab from './tabs/EntryTab'
import StatsTab from './tabs/StatsTab'
import { useStore } from './store'

export default function App() {
  const activeTab = useStore((s) => s.activeTab)
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans selection:bg-fuchsia-500/30 pb-24">
      <Header />
      <main className="max-w-md mx-auto px-4 py-4">
        {activeTab === 'home' && <HomeTab />}
        {activeTab === 'entry' && <EntryTab />}
        {activeTab === 'stats' && <StatsTab />}
      </main>
      <BottomNav />
    </div>
  )
}
