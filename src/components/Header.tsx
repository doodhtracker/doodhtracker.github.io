import { LogOut, Cloud, CloudOff, RefreshCw } from 'lucide-react'
import { useStore } from '../store'
import FarmerLogo from './FarmerLogo'
import { LANGS, useT } from '../i18n'

export default function Header() {
  const currentUser = useStore((s) => s.currentUser)
  const logout = useStore((s) => s.logout)
  const cloudUser = useStore((s) => s.cloudUser)
  const cloudStatus = useStore((s) => s.cloudStatus)
  const lang = useStore((s) => s.lang)
  const setLang = useStore((s) => s.setLang)
  const t = useT()

  return (
    <header className="sticky top-0 z-20 bg-emerald-950/90 backdrop-blur border-b border-emerald-800">
      <div className="max-w-md mx-auto flex items-center gap-2 px-3 py-2.5 md:max-w-3xl md:px-6 md:py-3">
        <FarmerLogo size={34} />
        <h1 className="hidden text-lg font-bold text-white sm:block">Doodh Tracker</h1>
        <div className="ml-auto flex items-center gap-1.5">
          {/* Language switcher */}
          <div className="flex items-center rounded-lg border border-emerald-700 bg-emerald-900/70 p-0.5" title={t('header.language')}>
            {LANGS.map((l) => (
              <button
                key={l.id}
                onClick={() => setLang(l.id)}
                className={`rounded-md px-1.5 py-1 text-[10px] font-bold leading-none transition-colors ${
                  lang === l.id ? 'bg-amber-500 text-emerald-950' : 'text-emerald-300 hover:text-emerald-100'
                }`}
                title={l.label}
              >
                {l.short}
              </button>
            ))}
          </div>

          {cloudUser ? (
            <span title={cloudUser.email} className="hidden sm:inline">
              {cloudStatus === 'syncing' ? (
                <RefreshCw size={14} className="text-amber-300 animate-spin" />
              ) : cloudStatus === 'error' ? (
                <CloudOff size={14} className="text-red-300" />
              ) : (
                <Cloud size={14} className="text-green-300" />
              )}
            </span>
          ) : null}

          <span className="hidden max-w-[92px] truncate rounded-full border border-emerald-600/60 bg-emerald-800/80 px-2 py-1 text-xs font-semibold text-emerald-50 sm:block">
            {cloudUser ? cloudUser.name : currentUser}
          </span>

          <button onClick={logout} className="text-red-300 transition-colors hover:text-red-200" title={t('header.logout')}>
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  )
}
