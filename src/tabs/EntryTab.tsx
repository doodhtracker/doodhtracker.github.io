import { useState } from 'react'
import { useStore, useEntries, useRates, todayStr, fmtDate } from '../store'
import { Check, Trash2, Sunrise, Sunset } from 'lucide-react'
import type { AnimalType } from '../types'

export default function EntryTab() {
  const addEntry = useStore((s) => s.addEntry)
  const removeEntry = useStore((s) => s.removeEntry)
  const entries = useEntries()
  const rates = useRates()

  const [date, setDate] = useState(todayStr())
  const [session, setSession] = useState<'morning' | 'evening'>('morning')
  const [animalType, setAnimalType] = useState<AnimalType>('gaay')
  const [animalName, setAnimalName] = useState('')
  const [liters, setLiters] = useState('')
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)

  const knownAnimals = [...new Set(entries.map((e) => e.animalName).filter(Boolean))] as string[]

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const litersNum = parseFloat(liters)
    if (!liters || isNaN(litersNum) || litersNum <= 0) return
    addEntry({
      date, animalType, animalName: animalName || undefined, session,
      liters: litersNum, note: note || undefined,
    })
    setLiters('')
    setNote('')
    setAnimalName('')
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const dayEntries = entries
    .filter((e) => e.date === date)
    .sort((a, b) => (a.session === 'morning' ? -1 : 1) - (b.session === 'morning' ? -1 : 1))

  const currentRate = animalType === 'gaay' ? rates.gaay : rates.bhains
  const paisaPreview = liters ? (parseFloat(liters) * currentRate) : 0

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="bg-emerald-900/50 rounded-2xl p-4 border border-emerald-800 space-y-3">
        <h3 className="text-white font-bold">🥛 Nai Entry</h3>
        <div>
          <label className="text-emerald-400 text-xs font-semibold block mb-1">📅 Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="w-full bg-emerald-950/60 text-white border border-emerald-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400" />
        </div>
        <div>
          <label className="text-emerald-400 text-xs font-semibold block mb-1">⏰ Time</label>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setSession('morning')}
              className={`flex items-center justify-center gap-1.5 py-3 rounded-lg text-base font-bold transition-colors ${session === 'morning' ? 'bg-amber-500 text-emerald-950' : 'bg-emerald-950/60 text-emerald-400 border border-emerald-700'}`}>
              <Sunrise size={18} /> Subah
            </button>
            <button type="button" onClick={() => setSession('evening')}
              className={`flex items-center justify-center gap-1.5 py-3 rounded-lg text-base font-bold transition-colors ${session === 'evening' ? 'bg-orange-500 text-emerald-950' : 'bg-emerald-950/60 text-emerald-400 border border-emerald-700'}`}>
              <Sunset size={18} /> Shaam
            </button>
          </div>
        </div>
        <div>
          <label className="text-emerald-400 text-xs font-semibold block mb-1">Janwar</label>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setAnimalType('gaay')}
              className={`py-3 rounded-lg text-base font-bold transition-colors ${animalType === 'gaay' ? 'bg-amber-500 text-emerald-950' : 'bg-emerald-950/60 text-emerald-400 border border-emerald-700'}`}>
              🐄 Gaay
            </button>
            <button type="button" onClick={() => setAnimalType('bhains')}
              className={`py-3 rounded-lg text-base font-bold transition-colors ${animalType === 'bhains' ? 'bg-blue-500 text-white' : 'bg-emerald-950/60 text-emerald-400 border border-emerald-700'}`}>
              🐃 Bhains
            </button>
          </div>
        </div>
        <div>
          <label className="text-emerald-400 text-xs font-semibold block mb-1">Janwar ka Naam (optional)</label>
          <input type="text" value={animalName} onChange={(e) => setAnimalName(e.target.value)}
            placeholder="jaise: Laxmi, Gauri..."
            className="w-full bg-emerald-950/60 text-white border border-emerald-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400" />
          {knownAnimals.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {knownAnimals.slice(0, 8).map((name) => (
                <button key={name} type="button" onClick={() => setAnimalName(name)}
                  className="text-xs bg-emerald-800/60 text-emerald-300 px-2 py-1 rounded-full hover:bg-emerald-700">
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <label className="text-emerald-400 text-xs font-semibold block mb-1">🥛 Doodh (litre)</label>
          <input type="number" step="0.1" min="0" value={liters} onChange={(e) => setLiters(e.target.value)}
            placeholder="jaise 2.5"
            className="w-full bg-emerald-950/60 text-white border border-emerald-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400" />
        </div>
        {currentRate > 0 && liters && (
          <div className="bg-green-950/40 border border-green-800/30 rounded-lg px-3 py-2 text-center">
            <p className="text-green-300 text-sm">💰 Paisa: <b>₹{paisaPreview.toFixed(2)}</b> ({liters}L × ₹{currentRate}/L)</p>
          </div>
        )}
        <div>
          <label className="text-emerald-400 text-xs font-semibold block mb-1">📝 Note (optional)</label>
          <input type="text" value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="koi khaat baat"
            className="w-full bg-emerald-950/60 text-white border border-emerald-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400" />
        </div>
        <button type="submit"
          className="w-full bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
          <Check size={20} /> {saved ? '✅ Save ho gaya!' : 'Entry Save Karo'}
        </button>
      </form>
      <div>
        <h3 className="text-emerald-400 text-xs font-semibold uppercase mb-2">
          {fmtDate(date)} ki Entries ({dayEntries.length})
        </h3>
        {dayEntries.length === 0 ? (
          <p className="text-emerald-600 text-sm text-center py-3">Is din koi entry nahi.</p>
        ) : (
          <div className="space-y-2">
            {dayEntries.map((e) => (
              <div key={e.id} className="bg-emerald-900/40 rounded-xl p-3 border border-emerald-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{e.animalType === 'gaay' ? '🐄' : '🐃'}</span>
                  <div>
                    <p className="text-white text-sm font-semibold">
                      {e.animalType === 'gaay' ? 'Gaay' : 'Bhains'}{e.animalName ? ` · ${e.animalName}` : ''}
                    </p>
                    <p className="text-emerald-500 text-xs">
                      {e.session === 'morning' ? '🌅 Subah' : '🌇 Shaam'}{e.note ? ` · ${e.note}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-amber-300 font-bold">{e.liters.toFixed(1)} L</p>
                    {(e.animalType === 'gaay' ? rates.gaay : rates.bhains) > 0 && <p className="text-green-400 text-xs">₹{(e.liters * (e.animalType === 'gaay' ? rates.gaay : rates.bhains)).toFixed(0)}</p>}
                  </div>
                  <button onClick={() => removeEntry(e.id)} className="text-red-400/70 hover:text-red-400 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
