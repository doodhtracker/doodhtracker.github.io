import { useEffect } from 'react'
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

export default function App() {
  const currentUser = useStore((s) => s.currentUser)
  const activeTab = useStore((s) => s.activeTab)

  // Google session band ho jaye (ya expire ho) to cloudUser hata do,
  // taaki UI galat "synced" na dikhaye. Data phone pe safe rehta hai.
  useEffect(() => {
    if (!isCloudAvailable()) return
    return watchAuth((u) => {
      if (!u) useStore.getState().setCloudUser(null)
    })
  }, [])

  if (!currentUser) return <Login />

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans selection:bg-fuchsia-500/30 pb-24">
      <Header />
      <main className="max-w-md mx-auto px-4 py-4">
        {activeTab === 'home' && <HomeTab />}
        {activeTab === 'entry' && <EntryTab />}
        {activeTab === 'stats' && <StatsTab />}
        {activeTab === 'settings' && <SettingsTab />}
        {activeTab === 'guide' && <GuideTab />}
        {activeTab === 'review' && <ReviewTab />}
      </main>
      <BottomNav />
    </div>
  )
}
