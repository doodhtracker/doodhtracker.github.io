import { LogOut, Cloud, CloudOff, RefreshCw } from 'lucide-react'
import { useStore } from '../store'
import FarmerLogo from './FarmerLogo'

export default function Header() {
  const currentUser = useStore((s) => s.currentUser)
  const logout = useStore((s) => s.logout)
  const cloudUser = useStore((s) => s.cloudUser)
  const cloudStatus = useStore((s) => s.cloudStatus)

  return (
    <header className="sticky top-0 z-20 bg-emerald-950/90 backdrop-blur border-b border-emerald-800">
      <div className="max-w-md mx-auto flex items-center gap-2 px-4 py-2.5">
        <FarmerLogo size={36} />
        <h1 className="text-lg font-bold text-white">Doodh Tracker</h1>
        <div className="ml-auto flex items-center gap-2">
          {cloudUser ? (
            <span title={cloudUser.email}>
              {cloudStatus === 'syncing' ? (
                <RefreshCw size={14} className="text-amber-300 animate-spin" />
              ) : cloudStatus === 'error' ? (
                <CloudOff size={14} className="text-red-400" />
              ) : (
                <Cloud size={14} className="text-green-400" />
              )}
            </span>
          ) : null}
          <span className="text-emerald-50 text-xs font-semibold bg-emerald-800/80 border border-emerald-600/60 px-2 py-1 rounded-full max-w-[92px] truncate">
            {cloudUser ? cloudUser.name : currentUser}
          </span>
          <button onClick={logout} className="text-red-400/70 hover:text-red-400 transition-colors" title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  )
}
