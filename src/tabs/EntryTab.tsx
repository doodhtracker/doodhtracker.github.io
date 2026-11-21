import { useState } from 'react'
import { useStore, useEntries, useRates, todayStr, fmtDate, entryAmount } from '../store'
import { Check, Trash2, Sunrise, Sunset, Pencil, X } from 'lucide-react'
import type { AnimalType, MilkEntry } from '../types'
import { useT } from '../i18n'

export default function EntryTab() {
  const addEntry = useStore((s) => s.addEntry)
  const removeEntry = useStore((s) => s.removeEntry)
  const editEntry = useStore((s) => s.editEntry)
  const entries = useEntries()
  const rates = useRates()
  const t = useT()

  const [date, setDate] = useState(todayStr())
  const [session, setSession] = useState<'morning' | 'evening'>('morning')
  const [animalType, setAnimalType] = useState<AnimalType>('gaay')
  const [animalName, setAnimalName] = useState('')
  const [liters, setLiters] = useState('')
  const [note, setNote] = useState('')
  const [fat, setFat] = useState('')
  const [saved, setSaved] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  const knownAnimals = [...new Set(entries.map((e) => e.animalName).filter(Boolean))] as string[]

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const litersNum = parseFloat(liters)
    if (!liters || isNaN(litersNum) || litersNum <= 0) return

    if (editingId !== null) {
      // Purani entry sudharo
      editEntry(editingId, {
        date, animalType, animalName: animalName || undefined, session,
        liters: litersNum, note: note || undefined,
        fat: parseFloat(fat) > 0 ? parseFloat(fat) : undefined,
      })
      setEditingId(null)
    } else {
      addEntry({
        date, animalType, animalName: animalName || undefined, session,
        liters: litersNum, note: note || undefined,
        fat: parseFloat(fat) > 0 ? parseFloat(fat) : undefined,
      })
    }
    setLiters('')
    setNote('')
    setAnimalName('')
    setFat('')
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  function startEdit(e: MilkEntry) {
    setEditingId(e.id)
    setDate(e.date)
    setSession(e.session)
    setAnimalType(e.animalType)
    setAnimalName(e.animalName || '')
    setLiters(String(e.liters))
    setNote(e.note || '')
    setFat(e.fat ? String(e.fat) : '')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    setEditingId(null)
    setLiters('')
    setNote('')
    setAnimalName('')
    setFat('')
  }

  const litersNum = parseFloat(liters)
  const tooMuch = !isNaN(litersNum) && litersNum > 20

  const dayEntries = entries
    .filter((e) => e.date === date)
    .sort((a, b) => (a.session === 'morning' ? -1 : 1) - (b.session === 'morning' ? -1 : 1))

  const currentRate = animalType === 'gaay' ? rates.gaay : rates.bhains
  const fatRate = (animalType === 'gaay' ? rates.gaayFat : rates.bhainsFat) || 0
  const fatNum = parseFloat(fat)
  const useFat = !isNaN(fatNum) && fatNum > 0 && fatRate > 0
  const paisaPreview = liters
    ? useFat
      ? (parseFloat(liters) * fatNum * fatRate) / 100
      : parseFloat(liters) * currentRate
    : 0
  const showPaisaPreview = !!liters && (useFat || currentRate > 0)

  const inputCls =
    'w-full bg-emerald-950/60 text-white border border-emerald-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400'

  return (
    <div className="space-y-4 md:grid md:grid-cols-2 md:items-start md:gap-4 md:space-y-0">
      <form onSubmit={handleSubmit} className="bg-emerald-900/50 rounded-2xl p-4 border border-emerald-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-bold">🥛 {t('entry.title')}</h3>
          {editingId !== null && (
            <button type="button" onClick={cancelEdit}
              className="flex items-center gap-1 text-sm text-amber-300 hover:text-amber-200 font-semibold">
              <X size={15} /> {t('entry.cancelEdit')}
            </button>
          )}
        </div>
        {editingId !== null && (
          <p className="text-amber-300 text-sm font-semibold bg-amber-950/40 border border-amber-800/40 rounded-lg px-3 py-2">
            ✏️ {t('entry.editingNow')}
          </p>
        )}
        <div>
          <label className="text-emerald-300 text-xs font-semibold block mb-1">📅 {t('entry.date')}</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="text-emerald-300 text-xs font-semibold block mb-1">⏰ {t('entry.time')}</label>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setSession('morning')}
              className={`flex items-center justify-center gap-1.5 py-3 rounded-lg text-base font-bold transition-colors ${session === 'morning' ? 'bg-amber-500 text-emerald-950' : 'bg-emerald-950/60 text-emerald-300 border border-emerald-700'}`}>
              <Sunrise size={18} /> {t('home.morning')}
            </button>
            <button type="button" onClick={() => setSession('evening')}
              className={`flex items-center justify-center gap-1.5 py-3 rounded-lg text-base font-bold transition-colors ${session === 'evening' ? 'bg-orange-500 text-emerald-950' : 'bg-emerald-950/60 text-emerald-300 border border-emerald-700'}`}>
              <Sunset size={18} /> {t('home.evening')}
            </button>
          </div>
        </div>
        <div>
          <label className="text-emerald-300 text-xs font-semibold block mb-1">{t('entry.animal')}</label>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setAnimalType('gaay')}
              className={`py-3 rounded-lg text-base font-bold transition-colors ${animalType === 'gaay' ? 'bg-amber-500 text-emerald-950' : 'bg-emerald-950/60 text-emerald-300 border border-emerald-700'}`}>
              🐄 {t('common.gaay')}
            </button>
            <button type="button" onClick={() => setAnimalType('bhains')}
              className={`py-3 rounded-lg text-base font-bold transition-colors ${animalType === 'bhains' ? 'bg-blue-500 text-white' : 'bg-emerald-950/60 text-emerald-300 border border-emerald-700'}`}>
              🐃 {t('common.bhains')}
            </button>
          </div>
        </div>
        <div>
          <label className="text-emerald-300 text-xs font-semibold block mb-1">{t('entry.animalName')}</label>
          <input type="text" value={animalName} onChange={(e) => setAnimalName(e.target.value)}
            placeholder={t('entry.animalNamePh')} className={inputCls} />
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
          <label className="text-emerald-300 text-xs font-semibold block mb-1">🥛 {t('entry.liters')}</label>
          <input type="number" step="0.1" min="0" value={liters} onChange={(e) => setLiters(e.target.value)}
            placeholder={t('entry.litersPh')} className={inputCls} />
          {/* Jaldi chunne ke bade buttons — typing ki zaroorat nahi */}
          <div className="grid grid-cols-6 gap-1.5 mt-2">
            {[0.5, 1, 1.5, 2, 2.5, 3].map((v) => (
              <button key={v} type="button" onClick={() => setLiters(String(v))}
                className={`py-2.5 rounded-lg text-sm font-bold transition-colors ${
                  liters === String(v)
                    ? 'bg-amber-500 text-emerald-950'
                    : 'bg-emerald-950/60 text-emerald-300 border border-emerald-700'
                }`}>
                {v}
              </button>
            ))}
          </div>
          {tooMuch && (
            <p className="text-amber-300 text-sm font-semibold bg-amber-950/50 border border-amber-700/50 rounded-lg px-3 py-2 mt-2">
              ⚠️ {t('entry.highWarn')}
            </p>
          )}
        </div>
        {showPaisaPreview && (
          <div className="bg-green-950/40 border border-green-800/30 rounded-lg px-3 py-2 text-center">
            <p className="text-green-300 text-sm">💰 {t('entry.money')}: <b>₹{paisaPreview.toFixed(2)}</b> ({liters}L × ₹{currentRate}/L)</p>
          </div>
        )}
        <div>
          <label className="text-emerald-300 text-xs font-semibold block mb-1">🧪 {t('entry.fat')}</label>
          <input type="number" step="0.1" min="0" value={fat} onChange={(e) => setFat(e.target.value)}
            placeholder={t('entry.fatPh')} className={inputCls} />
          {fatRate > 0 && <p className="text-emerald-300 text-xs mt-1">{t('entry.fatHint')}</p>}
        </div>
        <div>
          <label className="text-emerald-300 text-xs font-semibold block mb-1">📝 {t('entry.note')}</label>
          <input type="text" value={note} onChange={(e) => setNote(e.target.value)}
            placeholder={t('entry.notePh')} className={inputCls} />
        </div>
        <button type="submit"
          className="w-full bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
          <Check size={20} /> {saved ? `✅ ${t('entry.saved')}` : editingId !== null ? t('entry.update') : t('entry.save')}
        </button>
      </form>

      <div>
        <h3 className="text-emerald-300 text-xs font-semibold uppercase mb-2">
          {fmtDate(date)} {t('entry.entriesSuffix')} ({dayEntries.length})
        </h3>
        {dayEntries.length === 0 ? (
          <p className="text-emerald-300 text-sm text-center py-3">{t('entry.none')}</p>
        ) : (
          <div className="space-y-2">
            {dayEntries.map((e) => (
              <div key={e.id} className="bg-emerald-900/40 rounded-xl p-3 border border-emerald-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{e.animalType === 'gaay' ? '🐄' : '🐃'}</span>
                  <div>
                    <p className="text-white text-sm font-semibold">
                      {e.animalType === 'gaay' ? t('common.gaay') : t('common.bhains')}{e.animalName ? ` · ${e.animalName}` : ''}
                    </p>
                    <p className="text-emerald-300 text-xs">
                      {e.session === 'morning' ? `🌅 ${t('home.morning')}` : `🌇 ${t('home.evening')}`}{e.note ? ` · ${e.note}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-amber-300 font-bold">{e.liters.toFixed(1)} L</p>
                    {((e.animalType === 'gaay' ? rates.gaay : rates.bhains) > 0 || (e.fat || 0) > 0) && (
                      <p className="text-green-300 text-xs">₹{entryAmount(e, rates).toFixed(0)}</p>
                    )}
                  </div>
                  <button onClick={() => startEdit(e)} className="text-amber-300 hover:text-amber-200 transition-colors" title={t('entry.edit')}>
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => removeEntry(e.id)} className="text-red-300 hover:text-red-400 transition-colors" title="Delete">
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
