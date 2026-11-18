import { useState } from 'react'
import { useStore } from '../store'
import { LogIn, UserPlus, KeyRound, ArrowLeft, Loader2 } from 'lucide-react'
import FarmerLogo from './FarmerLogo'
import { isCloudAvailable } from '../cloud'

export default function Login() {
  const login = useStore((s) => s.login)
  const signup = useStore((s) => s.signup)
  const resetPin = useStore((s) => s.resetPin)
  const googleLogin = useStore((s) => s.googleLogin)

  const [googleLoading, setGoogleLoading] = useState(false)
  const [googleError, setGoogleError] = useState('')

  async function handleGoogle() {
    setGoogleError('')
    setGoogleLoading(true)
    try {
      const res = await googleLogin()
      if (!res.ok) setGoogleError(res.error || 'Google login fail ho gaya')
    } catch {
      setGoogleError('Google login fail ho gaya. Dobara try karo.')
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
    if (!username.trim() || !pin.trim()) { setError('Naam aur PIN dono daalo'); return }
    if (pin.length < 4) { setError('PIN kam se kam 4 number ka ho'); return }
    setLoading(true)
    try {
      const ok = await login(username, pin)
      if (!ok) setError('Galat naam ya PIN. Sahi se daalo ya Forgot PIN dabao.')
    } catch {
      setError('Kuch garbar ho gaya. Dobari try karo.')
    }
    setLoading(false)
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!username.trim() || !pin.trim()) { setError('Naam aur PIN dono daalo'); return }
    if (pin.length < 4) { setError('PIN kam se kam 4 number ka ho'); return }
    setLoading(true)
    try {
      const ok = await signup(username, pin)
      if (!ok) setError('Yeh naam pehle se hai. Login karo ya doosra naam chuno.')
    } catch {
      setError('Kuch garbar ho gaya. Dobari try karo.')
    }
    setLoading(false)
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!username.trim()) { setError('Pehle apna naam daalo'); return }
    if (newPin.length < 4) { setError('Naya PIN kam se kam 4 number ka ho'); return }
    if (newPin !== confirmPin) { setError('Dono PIN match nahi karte'); return }
    setLoading(true)
    try {
      const ok = await resetPin(username, newPin)
      if (!ok) { setError('Yeh naam register nahi hai. Pehle naya account banao.'); setLoading(false); return }
      setSuccess('PIN badal gaya! Ab login karo.')
      setMode('login')
      setPin('')
      setNewPin('')
      setConfirmPin('')
    } catch {
      setError('Kuch garbar ho gaya. Dobari try karo.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="flex flex-col items-center gap-2 mb-2">
            <FarmerLogo size={80} />
            <h1 className="text-2xl font-bold text-white">Doodh Tracker</h1>
          </div>
          <p className="text-emerald-300 text-sm">
            {mode === 'login' ? 'Apna account kholo' : mode === 'signup' ? 'Naya account banao' : 'PIN reset karo'}
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
              {googleLoading ? 'Google se jud raha...' : 'Continue with Google'}
            </button>
            {googleError && <p className="text-red-400 text-xs text-center mt-2">{googleError}</p>}
            <div className="flex items-center gap-2 my-4">
              <div className="h-px bg-emerald-800 flex-1" />
              <span className="text-emerald-300 text-xs">ya PIN se</span>
              <div className="h-px bg-emerald-800 flex-1" />
            </div>
          </div>
        ) : (
          <div className="mb-4 bg-emerald-900/40 border border-emerald-800 rounded-lg px-3 py-2 text-center">
            <p className="text-emerald-300 text-[11px] leading-relaxed">
              Google login ka setup baaki hai — abhi PIN se chalao. Tarika Guide tab mein hai.
            </p>
          </div>
        )}

        {/* LOGIN */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="bg-emerald-900/50 rounded-2xl p-5 border border-emerald-800 space-y-4">
            <div>
              <label className="text-emerald-300 text-xs font-semibold block mb-1">Naam</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="jaise: Ramesh"
                className="w-full bg-emerald-950/60 text-white border border-emerald-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400" />
            </div>
            <div>
              <label className="text-emerald-300 text-xs font-semibold block mb-1">PIN</label>
              <input type="password" inputMode="numeric" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} placeholder="••••"
                className="w-full bg-emerald-950/60 text-white border border-emerald-700 rounded-lg px-3 py-2.5 text-sm tracking-widest focus:outline-none focus:border-amber-400" />
            </div>
            {error && <p className="text-red-400 text-xs text-center">{error}</p>}
            <button type="submit" disabled={loading} className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-emerald-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
              {loading ? <Loader2 size={20} className="animate-spin" /> : <LogIn size={20} />} {loading ? 'Check ho raha...' : 'Login'}
            </button>
          </form>
        )}

        {/* SIGNUP */}
        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="bg-emerald-900/50 rounded-2xl p-5 border border-emerald-800 space-y-4">
            <div>
              <label className="text-emerald-300 text-xs font-semibold block mb-1">Naam</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="jaise: Ramesh"
                className="w-full bg-emerald-950/60 text-white border border-emerald-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400" />
            </div>
            <div>
              <label className="text-emerald-300 text-xs font-semibold block mb-1">Naya PIN (4 digit)</label>
              <input type="password" inputMode="numeric" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} placeholder="••••"
                className="w-full bg-emerald-950/60 text-white border border-emerald-700 rounded-lg px-3 py-2.5 text-sm tracking-widest focus:outline-none focus:border-amber-400" />
            </div>
            {error && <p className="text-red-400 text-xs text-center">{error}</p>}
            <button type="submit" disabled={loading} className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-emerald-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
              {loading ? <Loader2 size={20} className="animate-spin" /> : <UserPlus size={20} />} {loading ? 'Bana raha hoon...' : 'Account Banao'}
            </button>
          </form>
        )}

        {/* FORGOT PIN */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgot} className="bg-emerald-900/50 rounded-2xl p-5 border border-emerald-800 space-y-4">
            <div>
              <label className="text-emerald-300 text-xs font-semibold block mb-1">Apna Naam</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="jo account mein hai"
                className="w-full bg-emerald-950/60 text-white border border-emerald-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400" />
            </div>
            <div>
              <label className="text-emerald-300 text-xs font-semibold block mb-1">Naya PIN (4 digit)</label>
              <input type="password" inputMode="numeric" maxLength={6} value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))} placeholder="••••"
                className="w-full bg-emerald-950/60 text-white border border-emerald-700 rounded-lg px-3 py-2.5 text-sm tracking-widest focus:outline-none focus:border-amber-400" />
            </div>
            <div>
              <label className="text-emerald-300 text-xs font-semibold block mb-1">Naya PIN Dobara</label>
              <input type="password" inputMode="numeric" maxLength={6} value={confirmPin} onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))} placeholder="••••"
                className="w-full bg-emerald-950/60 text-white border border-emerald-700 rounded-lg px-3 py-2.5 text-sm tracking-widest focus:outline-none focus:border-amber-400" />
            </div>
            {error && <p className="text-red-400 text-xs text-center">{error}</p>}
            <button type="submit" disabled={loading} className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-emerald-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
              {loading ? <Loader2 size={20} className="animate-spin" /> : <KeyRound size={20} />} {loading ? 'Badal raha hoon...' : 'PIN Badlo'}
            </button>
          </form>
        )}

        {/* Navigation buttons */}
        <div className="mt-4 text-center space-y-2">
          {mode === 'forgot' ? (
            <button onClick={() => { setMode('login'); setError(''); setSuccess('') }} className="text-amber-400 underline text-sm flex items-center justify-center gap-1">
              <ArrowLeft size={14} /> Wapas Login par
            </button>
          ) : (
            <>
              {mode === 'login' ? (
                <>
                  <button onClick={() => { setMode('signup'); setError(''); setSuccess('') }} className="text-amber-400 underline text-sm block">
                    Naya account banana hai? Yahan dabao
                  </button>
                  <button onClick={() => { setMode('forgot'); setError(''); setSuccess('') }} className="text-emerald-300 underline text-sm block">
                    PIN bhul gaye? Reset karo
                  </button>
                </>
              ) : (
                <button onClick={() => { setMode('login'); setError(''); setSuccess('') }} className="text-amber-400 underline text-sm">
                  Pehle se account hai? Login karo
                </button>
              )}
            </>
          )}
        </div>

        <p className="text-emerald-300 text-xs text-center mt-4">
          🔒 Tumhara data encrypted hai. PIN aur entries dono secure — DevTools mein bhi nahi dikhega.
        </p>
      </div>
    </div>
  )
}
