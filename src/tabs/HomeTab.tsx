import { useStore, todayStr, dayTotal, sessionTotal, fmtDate, last7Days } from '../store'
import { Sunrise, Sunset, Plus, TrendingUp } from 'lucide-react'

export default function HomeTab() {
  const animals = useStore((s) => s.animals)
  const entries = useStore((s) => s.entries)
  const setActiveTab = useStore((s) => s.setActiveTab)
  const today = todayStr()
  const tTotal = dayTotal(entries, today)
  const morning = sessionTotal(entries, today, 'morning')
  const evening = sessionTotal(entries, today, 'evening')
  const week = last7Days()
  const weekTotal = week.reduce((s, d) => s + dayTotal(entries, d), 0)
  const todayEntries = entries.filter((e) => e.date === today)

  return (
    <div className="space-y-4">
      <div className="bg-emerald-900/50 rounded-2xl p-4 border border-emerald-800">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wide">Aaj</p>
            <p className="text-white text-lg font-bold">{fmtDate(today)}</p>
          </div>
          <div className="text-right">
            <p className="text-amber-300 text-3xl font-bold">{tTotal.toFixed(1)}</p>
            <p className="text-emerald-400 text-xs">litre aaj</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-amber-950/40 rounded-xl p-3 border border-amber-800/30">
            <div className="flex items-center gap-1.5 text-amber-300 mb-1">
              <Sunrise size={16} />
              <span className="text-xs font-semibold">Subah</span>
            </div>
            <p className="text-white text-xl font-bold">{morning} L</p>
          </div>
          <div className="bg-orange-950/40 rounded-xl p-3 border border-orange-800/30">
            <div className="flex items-center gap-1.5 text-orange-300 mb-1">
              <Sunset size={16} />
              <span className="text-xs font-semibold">Shaam</span>
            </div>
            <p className="text-white text-xl font-bold">{evening} L</p>
          </div>
        </div>
      </div>
      <div className="bg-emerald-900/40 rounded-xl p-3 border border-emerald-800 flex items-center gap-3">
        <div className="bg-emerald-800 rounded-lg p-2">
          <TrendingUp className="text-emerald-300" size={20} />
        </div>
        <div>
          <p className="text-emerald-400 text-xs">Pichhle 7 din</p>
          <p className="text-white font-bold">{weekTotal} litre kul</p>
        </div>
      </div>
      <button onClick={() => setActiveTab('entry')} className="w-full bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
        <Plus size={20} /> Naya Doodh Entry
      </button>
      <div>
        <h3 className="text-emerald-400 text-xs font-semibold uppercase mb-2">Aaj ki Entries</h3>
        {todayEntries.length === 0 ? (
          <p className="text-emerald-600 text-sm text-center py-4">Aaj koi entry nahi. Upar button dabao!</p>
        ) : (
          <div className="space-y-2">
            {todayEntries.map((e) => (
              <div key={e.id} className="bg-emerald-900/40 rounded-xl p-3 border border-emerald-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{e.animalType === 'gaay' ? '🐄' : '🐃'}</span>
                  <div>
                    <p className="text-white text-sm font-semibold">{e.animalName}</p>
                    <p className="text-emerald-500 text-xs">{e.session === 'morning' ? '🌅 Subah' : '🌇 Shaam'}</p>
                  </div>
                </div>
                <p className="text-amber-300 font-bold">{e.liters} L</p>
              </div>
            ))}
          </div>
        )}
      </div>
      {animals.length === 0 && (
        <div className="bg-amber-950/40 border border-amber-800/30 rounded-xl p-4 text-center">
          <p className="text-amber-300 text-sm font-semibold mb-2">📋 Pehle Entry tab mein jao!</p>
          <button onClick={() => setActiveTab('entry')} className="text-amber-400 underline text-sm">Entry tab mein jao →</button>
        </div>
      )}
    </div>
  )
}
