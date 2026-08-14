import { useState } from 'react'
import { useStore } from '../store'
import { Milk, LogIn, UserPlus } from 'lucide-react'

export default function Login() {
  const login = useStore((s) => s.login)
  const signup = useStore((s) => s.signup)
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [username, setUsername] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!username.trim() || !pin.trim()) { setError('Naam aur PIN dono daalo'); return }
    if (pin.length < 4) { setError('PIN kam se kam 4 number ka ho'); return }
    const ok = mode === 'login' ? login(username, pin) : signup(username, pin)
    if (!ok) { setError(mode === 'login' ? 'Galat naam ya PIN' : 'Yeh naam pehle se hai, doosra chuno') }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-2">
            <Milk className="text-amber-300" size={32} />
            <h1 className="text-2xl font-bold text-white">🥛 Doodh Tracker</h1>
          </div>
          <p className="text-emerald-400 text-sm">{mode === 'login' ? 'Apna account kholo' : 'Naya account banao'}</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-emerald-900/50 rounded-2xl p-5 border border-emerald-800 space-y-4">
          <div>
            <label className="text-emerald-400 text-xs font-semibold block mb-1">Naam</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="jaise: Ramesh" className="w-full bg-emerald-950/60 text-white border border-emerald-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400" />
          </div>
          <div>
            <label className="text-emerald-400 text-xs font-semibold block mb-1">PIN (4 digit)</label>
            <input type="password" inputMode="numeric" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} placeholder="••••" className="w-full bg-emerald-950/60 text-white border border-emerald-700 rounded-lg px-3 py-2.5 text-sm tracking-widest focus:outline-none focus:border-amber-400" />
          </div>
          {error && <p className="text-red-400 text-xs text-center">{error}</p>}
          <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
            {mode === 'login' ? <><LogIn size={20} /> Login</> : <><UserPlus size={20} /> Account Banao</>}
          </button>
        </form>
        <p className="text-center mt-4 text-sm">
          {mode === 'login' ? (
            <button onClick={() => { setMode('signup'); setError('') }} className="text-amber-400 underline">Naya account banana hai? Yahan dabao</button>
          ) : (
            <button onClick={() => { setMode('login'); setError('') }} className="text-amber-400 underline">Pehle se account hai? Login karo</button>
          )}
        </p>
        <p className="text-emerald-600 text-xs text-center mt-4">🔒 Tumhara data sirf tumhare browser mein save hota hai. Koi dusra nahi dekh sakta.</p>
      </div>
    </div>
  )
}
