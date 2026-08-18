import { useMemo } from 'react'
import { useStore, useEntries, useRates, todayStr, dayTotal, sessionTotal, fmtDate, fmtMonth, monthStr, monthTotal, monthPaisa, last7Days } from '../store'
import { analyzeData } from '../ai/indus'
import { Sunrise, Sunset, Plus, TrendingUp, Wallet, Trash2, Brain } from 'lucide-react'

export default function HomeTab() {
  const entries = useEntries()
  const rates = useRates()
  const setActiveTab = useStore((s) => s.setActiveTab)
  const removeEntry = useStore((s) => s.removeEntry)
  const today = todayStr()
  const tTotal = dayTotal(entries, today)
  const morning = sessionTotal(entries, today, 'morning')
  const evening = sessionTotal(entries, today, 'evening')
  const week = last7Days()
  const weekTotal = week.reduce((s, d) => s + dayTotal(entries, d), 0)
  const todayEntries = entries.filter((e) => e.date === today)
  const mStr = monthStr()
  const mTotal = monthTotal(entries, mStr)
  const mPaisa = monthPaisa(entries, mStr, rates)

  const aiReport = useMemo(() => analyzeData(entries, rates), [entries, rates])
  const topInsights = aiReport.insights.slice(0, 2)

  const trendColor = aiReport.trend === 'up' ? 'text-green-400'
    : aiReport.trend === 'down' ? 'text-red-400' : 'text-amber-400'

  return (
    <div className="space-y-4">
      {entries.length > 0 && (
        <div className="bg-gradient-to-r from-violet-950/40 to-fuchsia-950/30 border border-violet-800/30 rounded-2xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 flex items-center justify-center">
              <Brain size={14} className="text-white" />
            </div>
            <span className="text-violet-300 text-xs font-bold uppercase tracking-wide">Indus AI Quick Insights</span>
            <span className={`ml-auto text-xs font-semibold ${trendColor}`}>{aiReport.healthScore}/100</span>
          </div>
          <div className="space-y-1.5">
            {topInsights.map((insight, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <span className="text-sm shrink-0">{insight.icon}</span>
                <p className="text-zinc-300 text-xs leading-snug">
                  <span className="font-semibold">{insight.title}:</span> {insight.message.slice(0, 100)}{insight.message.length > 100 ? '...' : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-emerald-900/50 to-zinc-900/50 rounded-2xl p-4 border border-emerald-800/50">
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
            <div className="flex items-center gap-1.5 text-amber-300 mb-1"><Sunrise size={16} /><span className="text-xs font-semibold">Subah</span></div>
            <p className="text-white text-xl font-bold">{morning} L</p>
          </div>
          <div className="bg-orange-950/40 rounded-xl p-3 border border-orange-800/30">
            <div className="flex items-center gap-1.5 text-orange-300 mb-1"><Sunset size={16} /><span className="text-xs font-semibold">Shaam</span></div>
            <p className="text-white text-xl font-bold">{evening} L</p>
          </div>
        </div>
      </div>

      <div className="bg-emerald-900/50 rounded-2xl p-4 border border-emerald-800/50">
        <div className="flex items-center gap-2 mb-3"><Wallet className="text-amber-300" size={18} /><h3 className="text-white font-bold text-sm">{fmtMonth(mStr)} ka Hisaab</h3></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-emerald-950/40 rounded-xl p-3 text-center"><p className="text-emerald-400 text-xs">Kul Doodh</p><p className="text-white text-xl font-bold">{mTotal} L</p></div>
          <div className="bg-green-950/40 rounded-xl p-3 text-center"><p className="text-green-400 text-xs">Kul Paisa</p><p className="text-green-300 text-xl font-bold">₹{mPaisa.toFixed(0)}</p></div>
        </div>
        {(rates.gaay > 0 || rates.bhains > 0) && (<div className="mt-2 text-center text-xs text-emerald-500">Rate: 🐄 ₹{rates.gaay}/L · 🐃 ₹{rates.bhains}/L</div>)}
      </div>

      <div className="bg-emerald-900/40 rounded-xl p-3 border border-emerald-800/50 flex items-center gap-3">
        <div className="bg-emerald-800 rounded-lg p-2"><TrendingUp className="text-emerald-300" size={20} /></div>
        <div><p className="text-emerald-400 text-xs">Pichhle 7 din</p><p className="text-white font-bold">{weekTotal} litre kul</p></div>
      </div>

      <button onClick={() => setActiveTab('entry')} className="w-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-emerald-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-amber-900/30"><Plus size={20} /> Naya Doodh Entry</button>

      <div>
        <h3 className="text-emerald-400 text-xs font-semibold uppercase mb-2">Aaj ki Entries</h3>
        {todayEntries.length === 0 ? (
          <p className="text-emerald-600 text-sm text-center py-4">Aaj koi entry nahi. Upar button dabao!</p>
        ) : (
          <div className="space-y-2">
            {todayEntries.map((e) => (
              <div key={e.id} className="bg-emerald-900/40 rounded-xl p-3 border border-emerald-800/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{e.animalType === 'gaay' ? '🐄' : '🐃'}</span>
                  <div>
                    <p className="text-white text-sm font-semibold">{e.animalType === 'gaay' ? 'Gaay' : 'Bhains'}{e.animalName ? ` · ${e.animalName}` : ''}</p>
                    <p className="text-emerald-500 text-xs">{e.session === 'morning' ? '🌅 Subah' : '🌇 Shaam'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-amber-300 font-bold">{e.liters} L</p>
                    {(rates.gaay > 0 || rates.bhains > 0) && (<p className="text-green-400 text-xs">₹{(e.liters * (e.animalType === 'gaay' ? rates.gaay : rates.bhains)).toFixed(0)}</p>)}
                  </div>
                  <button onClick={() => removeEntry(e.id)} className="text-red-400/70 hover:text-red-400 transition-colors" title="Delete"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {entries.length === 0 && (
        <div className="bg-amber-950/40 border border-amber-800/30 rounded-xl p-4 text-center">
          <p className="text-amber-300 text-sm font-semibold mb-2">📋 Pehle Entry tab mein jao!</p>
          <button onClick={() => setActiveTab('entry')} className="text-amber-400 underline text-sm">Entry tab mein jao →</button>
        </div>
      )}
    </div>
  )
}