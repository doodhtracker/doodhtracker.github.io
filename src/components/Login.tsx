import { useState } from 'react'
import { useStore } from '../store'
import { LogIn, UserPlus, KeyRound, ArrowLeft, Loader2 } from 'lucide-react'
import FarmerLogo from './FarmerLogo'
import { isCloudAvailable } from '../cloud'
import { LANGS, useT } from '../i18n'

export default function Login() {
  const login = useStore((s) => s.login)
  const signup = useStore((s) => s.signup)
  const resetPin = useStore((s) => s.resetPin)
  const googleLogin = useStore((s) => s.googleLogin)
  const lang = useStore((s) => s.lang)
  const setLang = useStore((s) => s.setLang)
  const t = useT()

  const [googleLoading, setGoogleLoading] = useState(false)
  const [googleError, setGoogleError] = useState('')

  async function handleGoogle() {
    setGoogleError('')
    setGoogleLoading(true)
    try {
      const res = await googleLogin()
      if (!res.ok) setGoogleError(res.error || t('login.googleFail'))
    } catch {
      setGoogleError(t('login.googleFailRetry'))
    }
    setGoogleLoading(false)
  }

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login')
  const [username, setUsername] = useState('')
  const [pin, setPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!username.trim() || !pin.trim()) { setError(t('login.err.empty')); return }
    if (pin.length < 4) { setError(t('login.err.pinShort')); return }
    setLoading(true)
    try {
      const ok = await login(username, pin)
      if (!ok) setError(t('login.err.wrong'))
    } catch {
      setError(t('login.err.generic'))
    }
    setLoading(false)
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!username.trim() || !pin.trim()) { setError(t('login.err.empty')); return }
    if (pin.length < 4) { setError(t('login.err.pinShort')); return }
    setLoading(true)
    try {
      const ok = await signup(username, pin)
      if (!ok) setError(t('login.err.nameTaken'))
    } catch {
      setError(t('login.err.generic'))
    }
    setLoading(false)
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!username.trim()) { setError(t('login.err.nameFirst')); return }
    if (newPin.length < 4) { setError(t('login.err.newPinShort')); return }
    if (newPin !== confirmPin) { setError(t('login.err.pinMismatch')); return }
    setLoading(true)
    try {
      const ok = await resetPin(username, newPin)
      if (!ok) { setError(t('login.err.notRegistered')); setLoading(false); return }
      setSuccess(t('login.ok.pinChanged'))
      setMode('login')
      setPin('')
      setNewPin('')
      setConfirmPin('')
    } catch {
      setError(t('login.err.generic'))
    }
    setLoading(false)
  }

  const inputCls =
    'w-full bg-emerald-950/60 text-white border border-emerald-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400'
  const pinCls =
    'w-full bg-emerald-950/60 text-white border border-emerald-700 rounded-lg px-3 py-2.5 text-sm tracking-widest focus:outline-none focus:border-amber-400'

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Language switcher */}
        <div className="mb-3 flex justify-end">
          <div className="flex items-center rounded-lg border border-emerald-700 bg-emerald-900/70 p-0.5">
            {LANGS.map((l) => (
              <button
                key={l.id}
                onClick={() => setLang(l.id)}
                className={`rounded-md px-2 py-1 text-[10px] font-bold leading-none transition-colors ${
                  lang === l.id ? 'bg-amber-500 text-emerald-950' : 'text-emerald-300 hover:text-emerald-100'
                }`}
                title={l.label}
              >
                {l.short}
              </button>
            ))}
          </div>
        </div>

        <div className="text-center mb-6">
          <div className="flex flex-col items-center gap-2 mb-2">
            <FarmerLogo size={80} />
            <h1 className="text-2xl font-bold text-white">Doodh Tracker</h1>
          </div>
          <p className="text-emerald-300 text-sm">
            {mode === 'login' ? t('login.sub.login') : mode === 'signup' ? t('login.sub.signup') : t('login.sub.forgot')}
          </p>
        </div>

        {success && (
          <div className="bg-green-900/50 border border-green-700 rounded-lg px-4 py-2 mb-3 text-green-300 text-sm text-center">
            {success}
          </div>
        )}

        {/* GOOGLE LOGIN */}
        {isCloudAvailable() ? (
          <div className="mb-4">
            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleLoading}
              className="w-full bg-white hover:bg-zinc-100 disabled:opacity-60 text-zinc-800 font-bold py-3 rounded-xl flex items-center justify-center gap-2.5 transition-colors"
            >
              {googleLoading ? (
                <Loader2 size={18} className="animate-spin text-zinc-400" />
              ) : (
                <span className="w-5 h-5 rounded-full bg-[#4285F4] text-white text-[12px] font-bold flex items-center justify-center leading-none">
                  G
                </span>
              )}
              {googleLoading ? t('login.googleLoading') : t('login.google')}
            </button>
            {googleError && <p className="text-red-400 text-xs text-center mt-2">{googleError}</p>}
            <div className="flex items-center gap-2 my-4">
              <div className="h-px bg-emerald-800 flex-1" />
              <span className="text-emerald-300 text-xs">{t('login.orPin')}</span>
              <div className="h-px bg-emerald-800 flex-1" />
            </div>
          </div>
        ) : (
          <div className="mb-4 bg-emerald-900/40 border border-emerald-800 rounded-lg px-3 py-2 text-center">
            <p className="text-emerald-300 text-[11px] leading-relaxed">{t('login.setupPending')}</p>
          </div>
        )}

        {/* LOGIN */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="bg-emerald-900/50 rounded-2xl p-5 border border-emerald-800 space-y-4">
            <div>
              <label className="text-emerald-300 text-xs font-semibold block mb-1">{t('login.name')}</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder={t('login.namePh')} className={inputCls} />
            </div>
            <div>
              <label className="text-emerald-300 text-xs font-semibold block mb-1">{t('login.pin')}</label>
              <input type="password" inputMode="numeric" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} placeholder="••••" className={pinCls} />
            </div>
            {error && <p className="text-red-400 text-xs text-center">{error}</p>}
            <button type="submit" disabled={loading} className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-emerald-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
              {loading ? <Loader2 size={20} className="animate-spin" /> : <LogIn size={20} />} {loading ? t('login.btn.checking') : t('login.btn.login')}
            </button>
          </form>
        )}

        {/* SIGNUP */}
        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="bg-emerald-900/50 rounded-2xl p-5 border border-emerald-800 space-y-4">
            <div>
              <label className="text-emerald-300 text-xs font-semibold block mb-1">{t('login.name')}</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder={t('login.namePh')} className={inputCls} />
            </div>
            <div>
              <label className="text-emerald-300 text-xs font-semibold block mb-1">{t('login.newPin4')}</label>
              <input type="password" inputMode="numeric" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} placeholder="••••" className={pinCls} />
            </div>
            {error && <p className="text-red-400 text-xs text-center">{error}</p>}
            <button type="submit" disabled={loading} className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-emerald-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
              {loading ? <Loader2 size={20} className="animate-spin" /> : <UserPlus size={20} />} {loading ? t('login.btn.creating') : t('login.btn.signup')}
            </button>
          </form>
        )}

        {/* FORGOT PIN */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgot} className="bg-emerald-900/50 rounded-2xl p-5 border border-emerald-800 space-y-4">
            <div>
              <label className="text-emerald-300 text-xs font-semibold block mb-1">{t('login.yourName')}</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder={t('login.yourNamePh')} className={inputCls} />
            </div>
            <div>
              <label className="text-emerald-300 text-xs font-semibold block mb-1">{t('login.newPin4')}</label>
              <input type="password" inputMode="numeric" maxLength={6} value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))} placeholder="••••" className={pinCls} />
            </div>
            <div>
              <label className="text-emerald-300 text-xs font-semibold block mb-1">{t('login.newPinAgain')}</label>
              <input type="password" inputMode="numeric" maxLength={6} value={confirmPin} onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))} placeholder="••••" className={pinCls} />
            </div>
            {error && <p className="text-red-400 text-xs text-center">{error}</p>}
            <button type="submit" disabled={loading} className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-emerald-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
              {loading ? <Loader2 size={20} className="animate-spin" /> : <KeyRound size={20} />} {loading ? t('login.btn.changing') : t('login.btn.reset')}
            </button>
          </form>
        )}

        {/* Navigation buttons */}
        <div className="mt-4 text-center space-y-2">
          {mode === 'forgot' ? (
            <button onClick={() => { setMode('login'); setError(''); setSuccess('') }} className="text-amber-400 underline text-sm flex items-center justify-center gap-1">
              <ArrowLeft size={14} /> {t('login.backToLogin')}
            </button>
          ) : (
            <>
              {mode === 'login' ? (
                <>
                  <button onClick={() => { setMode('signup'); setError(''); setSuccess('') }} className="text-amber-400 underline text-sm block w-full">
                    {t('login.toSignup')}
                  </button>
                  <button onClick={() => { setMode('forgot'); setError(''); setSuccess('') }} className="text-emerald-300 underline text-sm block w-full">
                    {t('login.toForgot')}
                  </button>
                </>
              ) : (
                <button onClick={() => { setMode('login'); setError(''); setSuccess('') }} className="text-amber-400 underline text-sm">
                  {t('login.toLogin')}
                </button>
              )}
            </>
          )}
        </div>

        <p className="text-emerald-300 text-xs text-center mt-4">{t('login.footer')}</p>
      </div>
    </div>
  )
}
