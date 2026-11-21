import { useStore, useEntries, useRates, todayStr, dayTotal, sessionTotal, fmtDate, fmtMonth, monthStr, monthTotal, monthPaisa, last7Days, entryAmount } from '../store'
import { Sunrise, Sunset, Plus, TrendingUp, Wallet, Trash2 } from 'lucide-react'
import { useT } from '../i18n'

export default function HomeTab() {
  const entries = useEntries()
  const rates = useRates()
  const setActiveTab = useStore((s) => s.setActiveTab)
  const removeEntry = useStore((s) => s.removeEntry)
  const t = useT()

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

  return (
    <div className="space-y-4">
      <div className="bg-emerald-900/50 rounded-2xl p-4 border border-emerald-800">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-emerald-300 text-xs font-semibold uppercase tracking-wide">{t('home.today')}</p>
            <p className="text-white text-lg font-bold">{fmtDate(today)}</p>
          </div>
          <div className="text-right">
            <p className="text-amber-300 text-3xl font-bold">{tTotal.toFixed(1)}</p>
            <p className="text-emerald-300 text-xs">{t('home.litreToday')}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-amber-950/40 rounded-xl p-3 border border-amber-800/30">
            <div className="flex items-center gap-1.5 text-amber-300 mb-1">
              <Sunrise size={16} /><span className="text-xs font-semibold">{t('home.morning')}</span>
            </div>
            <p className="text-white text-xl font-bold">{morning.toFixed(1)} L</p>
          </div>
          <div className="bg-orange-950/40 rounded-xl p-3 border border-orange-800/30">
            <div className="flex items-center gap-1.5 text-orange-300 mb-1">
              <Sunset size={16} /><span className="text-xs font-semibold">{t('home.evening')}</span>
            </div>
            <p className="text-white text-xl font-bold">{evening.toFixed(1)} L</p>
          </div>
        </div>
      </div>

      <div className="bg-emerald-900/50 rounded-2xl p-4 border border-emerald-800">
        <div className="flex items-center gap-2 mb-3">
          <Wallet className="text-amber-300" size={18} />
          <h3 className="text-white font-bold text-sm">{fmtMonth(mStr)} {t('home.monthSuffix')}</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-emerald-950/40 rounded-xl p-3 text-center">
            <p className="text-emerald-300 text-xs">{t('home.totalMilk')}</p>
            <p className="text-white text-xl font-bold">{mTotal.toFixed(1)} L</p>
          </div>
          <div className="bg-green-950/40 rounded-xl p-3 text-center">
            <p className="text-green-300 text-xs">{t('home.totalMoney')}</p>
            <p className="text-green-300 text-xl font-bold">₹{mPaisa.toFixed(0)}</p>
          </div>
        </div>
        {(rates.gaay > 0 || rates.bhains > 0) && (
          <div className="mt-2 text-center text-xs text-emerald-300">
            {t('home.rate')}: 🐄 ₹{rates.gaay}/L · 🐃 ₹{rates.bhains}/L
          </div>
        )}
      </div>

      <div className="bg-emerald-900/40 rounded-xl p-3 border border-emerald-800 flex items-center gap-3">
        <div className="bg-emerald-800 rounded-lg p-2"><TrendingUp className="text-emerald-300" size={20} /></div>
        <div>
          <p className="text-emerald-300 text-xs">{t('home.last7')}</p>
          <p className="text-white font-bold">{weekTotal.toFixed(1)} {t('home.litreTotal')}</p>
        </div>
      </div>

      <button onClick={() => setActiveTab('entry')}
        className="w-full bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
        <Plus size={20} /> {t('home.newEntry')}
      </button>

      <div>
        <h3 className="text-emerald-300 text-xs font-semibold uppercase mb-2">{t('home.todayEntries')}</h3>
        {todayEntries.length === 0 ? (
          <p className="text-emerald-300 text-sm text-center py-4">{t('home.noEntryToday')}</p>
        ) : (
          <div className="space-y-2">
            {todayEntries.map((e) => (
              <div key={e.id} className="bg-emerald-900/40 rounded-xl p-3 border border-emerald-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{e.animalType === 'gaay' ? '🐄' : '🐃'}</span>
                  <div>
                    <p className="text-white text-sm font-semibold">
                      {e.animalType === 'gaay' ? t('common.gaay') : t('common.bhains')}{e.animalName ? ` · ${e.animalName}` : ''}
                    </p>
                    <p className="text-emerald-300 text-xs">
                      {e.session === 'morning' ? `🌅 ${t('home.morning')}` : `🌇 ${t('home.evening')}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-amber-300 font-bold">{e.liters.toFixed(1)} L</p>
                    {(rates.gaay > 0 || rates.bhains > 0 || (e.fat || 0) > 0) && (
                      <p className="text-green-300 text-xs">₹{entryAmount(e, rates).toFixed(0)}</p>
                    )}
                  </div>
                  <button onClick={() => removeEntry(e.id)} className="text-red-300 hover:text-red-400 transition-colors" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {entries.length === 0 && (
        <div className="bg-amber-950/40 border border-amber-800/30 rounded-xl p-4 text-center">
          <p className="text-amber-300 text-sm font-semibold mb-2">📋 {t('home.goEntryFirst')}</p>
          <button onClick={() => setActiveTab('entry')} className="text-amber-400 underline text-sm">{t('home.goEntry')}</button>
        </div>
      )}

    </div>
  )
}
