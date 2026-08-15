import { useState } from 'react'
import { useStore } from '../store'
import { Milk, LogIn, UserPlus, KeyRound, ArrowLeft, Loader2 } from 'lucide-react'

export default function Login() {
  const login = useStore((s) => s.login)
  const signup = useStore((s) => s.signup)
  const resetPin = useStore((s) => s.resetPin)

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
          <div className="inline-flex items-center gap-2 mb-2">
            <Milk className="text-amber-300" size={32} />
            <h1 className="text-2xl font-bold text-white">🥛 Doodh Tracker</h1>
          </div>
          <p className="text-emerald-400 text-sm">
            {mode === 'login' ? 'Apna account kholo' : mode === 'signup' ? 'Naya account banao' : 'PIN reset karo'}
          </p>
        </div>

        {success && (
          <div className="bg-green-900/50 border border-green-700 rounded-lg px-4 py-2 mb-3 text-green-300 text-sm text-center">
            {success}
          </div>
        )}

        {/* LOGIN */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="bg-emerald-900/50 rounded-2xl p-5 border border-emerald-800 space-y-4">
            <div>
              <label className="text-emerald-400 text-xs font-semibold block mb-1">Naam</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="jaise: Ramesh"
                className="w-full bg-emerald-950/60 text-white border border-emerald-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400" />
            </div>
            <div>
              <label className="text-emerald-400 text-xs font-semibold block mb-1">PIN</label>
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
              <label className="text-emerald-400 text-xs font-semibold block mb-1">Naam</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="jaise: Ramesh"
                className="w-full bg-emerald-950/60 text-white border border-emerald-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400" />
            </div>
            <div>
              <label className="text-emerald-400 text-xs font-semibold block mb-1">Naya PIN (4 digit)</label>
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
              <label className="text-emerald-400 text-xs font-semibold block mb-1">Apna Naam</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="jo account mein hai"
                className="w-full bg-emerald-950/60 text-white border border-emerald-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400" />
            </div>
            <div>
              <label className="text-emerald-400 text-xs font-semibold block mb-1">Naya PIN (4 digit)</label>
              <input type="password" inputMode="numeric" maxLength={6} value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))} placeholder="••••"
                className="w-full bg-emerald-950/60 text-white border border-emerald-700 rounded-lg px-3 py-2.5 text-sm tracking-widest focus:outline-none focus:border-amber-400" />
            </div>
            <div>
              <label className="text-emerald-400 text-xs font-semibold block mb-1">Naya PIN Dobara</label>
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
                  <button onClick={() => { setMode('forgot'); setError(''); setSuccess('') }} className="text-emerald-400 underline text-sm block">
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

        <p className="text-emerald-600 text-xs text-center mt-4">
          🔒 Tumhara data encrypted hai. PIN aur entries dono secure — DevTools mein bhi nahi dikhega.
        </p>
      </div>
    </div>
  )
}
