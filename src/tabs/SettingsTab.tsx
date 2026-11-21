import { useState, useRef } from 'react'
import { useStore, useRates, useReminders, useEntries, useDeductions, exportCSV, downloadCSV, parseCSV, startReminders, deductionTotal, todayStr, fmtDate } from '../store'
import { Settings, Bell, Download, Upload, LogOut, Wallet, Milk, Cloud, CloudOff, ArrowDownToLine, ArrowUpFromLine, MinusCircle, Trash2 } from 'lucide-react'
import { isCloudAvailable } from '../cloud'
import { useT } from '../i18n'

export default function SettingsTab() {
  const rates = useRates()
  const reminders = useReminders()
  const entries = useEntries()
  const setRates = useStore((s) => s.setRates)
  const setReminders = useStore((s) => s.setReminders)
  const logout = useStore((s) => s.logout)
  const importEntries = useStore((s) => s.importEntries)
  const currentUser = useStore((s) => s.currentUser)
  const t = useT()

  const [gaayRate, setGaayRate] = useState(String(rates.gaay || ''))
  const [bhainsRate, setBhainsRate] = useState(String(rates.bhains || ''))
  const [gaayFat, setGaayFat] = useState(String(rates.gaayFat || ''))
  const [bhainsFat, setBhainsFat] = useState(String(rates.bhainsFat || ''))

  // ─── Advance / pashu aahar ───
  const deductions = useDeductions()
  const addDeduction = useStore((st) => st.addDeduction)
  const removeDeduction = useStore((st) => st.removeDeduction)
  const [dedKind, setDedKind] = useState<'advance' | 'aahar' | 'other'>('advance')
  const [dedAmount, setDedAmount] = useState('')
  const [dedNote, setDedNote] = useState('')
  const [dedDate, setDedDate] = useState(todayStr())
  const [rateSaved, setRateSaved] = useState(false)

  const [mornEn, setMornEn] = useState(reminders.morningEnabled)
  const [eveEn, setEveEn] = useState(reminders.eveningEnabled)
  const [mornTime, setMornTime] = useState(reminders.morningTime)
  const [eveTime, setEveTime] = useState(reminders.eveningTime)
  const [remSaved, setRemSaved] = useState(false)

  const [importMsg, setImportMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  // ─── Cloud sync (Google) ───
  const users = useStore((s) => s.users)
  const cloudUser = useStore((s) => s.cloudUser)

  // Google wale account ka andar ka ID (g:xxxx) chhupao — asli naam dikhao
  const displayName =
    (currentUser && users[currentUser]?.username) || cloudUser?.name || currentUser || ''
  const cloudStatus = useStore((s) => s.cloudStatus)
  const googleLogin = useStore((s) => s.googleLogin)
  const googleLogout = useStore((s) => s.googleLogout)
  const cloudPull = useStore((s) => s.cloudPull)
  const cloudPush = useStore((s) => s.cloudPush)
  const migrateLocalToCloud = useStore((s) => s.migrateLocalToCloud)
  const [cloudMsg, setCloudMsg] = useState('')
  const [cloudBusy, setCloudBusy] = useState(false)
  const [migrateFrom, setMigrateFrom] = useState('')

  const localAccounts = Object.keys(users).filter((k) => !k.startsWith('g:'))

  function flashCloud(msg: string) {
    setCloudMsg(msg)
    setTimeout(() => setCloudMsg(''), 4000)
  }

  async function handleCloudConnect() {
    setCloudBusy(true)
    const res = await googleLogin()
    flashCloud(res.ok ? '✅ ' + t('set.cloudConnected') : '❌ ' + (res.error || 'Fail ho gaya'))
    setCloudBusy(false)
  }

  async function handleCloudPush() {
    setCloudBusy(true)
    const res = await cloudPush()
    flashCloud(res.ok ? '✅ ' + t('set.cloudPushed') : '❌ ' + (res.error || 'Fail'))
    setCloudBusy(false)
  }

  async function handleCloudPull() {
    setCloudBusy(true)
    const res = await cloudPull()
    flashCloud(res.ok ? '✅ ' + t('set.cloudPulled') : '❌ ' + (res.error || 'Fail'))
    setCloudBusy(false)
  }

  async function handleMigrate() {
    if (!migrateFrom) {
      flashCloud('❌ ' + t('set.cloudPickAccount'))
      return
    }
    setCloudBusy(true)
    const res = await migrateLocalToCloud(migrateFrom)
    if (res.ok) flashCloud(`✅ ${res.count} ${t('set.cloudMigrated')}`)
    else flashCloud('❌ ' + (res.error || 'Fail'))
    setCloudBusy(false)
  }

  async function handleGoogleDisconnect() {
    await googleLogout()
    flashCloud(t('set.cloudDisconnected'))
  }

  function saveRates() {
    setRates(parseFloat(gaayRate) || 0, parseFloat(bhainsRate) || 0, parseFloat(gaayFat) || 0, parseFloat(bhainsFat) || 0)
    setRateSaved(true)
    setTimeout(() => setRateSaved(false), 1500)
  }

  function saveReminders() {
    const config = { morningEnabled: mornEn, eveningEnabled: eveEn, morningTime: mornTime, eveningTime: eveTime }
    setReminders(config)
    if (mornEn || eveEn) {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission()
      }
      startReminders(config)
    } else {
      startReminders(config)
    }
    setRemSaved(true)
    setTimeout(() => setRemSaved(false), 1500)
  }

  function exportAll() {
    const csv = exportCSV(entries, rates)
    downloadCSV(csv, `doodh-tracker-all-data.csv`)
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const parsed = parseCSV(text)
      if (parsed.length === 0) {
        setImportMsg('❌ ' + t('set.importBad'))
        return
      }
      importEntries(parsed)
      setImportMsg(`✅ ${parsed.length} ${t('set.importOk')}`)
      setTimeout(() => setImportMsg(''), 3000)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="space-y-4">
      <div className="bg-emerald-900/50 rounded-2xl p-4 border border-emerald-800">
        <div className="flex items-center gap-2 mb-3">
          <Wallet className="text-amber-300" size={18} />
          <h3 className="text-white font-bold text-sm">💰 {t('set.rateTitle')}</h3>
        </div>
        <p className="text-emerald-300 text-xs mb-3">{t('set.rateSub')}</p>
        <div className="space-y-3">
          <div>
            <label className="text-emerald-300 text-xs font-semibold block mb-1">🐄 {t('set.gaayRate')}</label>
            <input type="number" step="0.5" min="0" value={gaayRate} onChange={(e) => setGaayRate(e.target.value)}
              placeholder={t('set.gaayRatePh')}
              className="w-full bg-emerald-950/60 text-white border border-emerald-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400" />
          </div>
          <div>
            <label className="text-emerald-300 text-xs font-semibold block mb-1">🐃 {t('set.bhainsRate')}</label>
            <input type="number" step="0.5" min="0" value={bhainsRate} onChange={(e) => setBhainsRate(e.target.value)}
              placeholder={t('set.bhainsRatePh')}
              className="w-full bg-emerald-950/60 text-white border border-emerald-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400" />
          </div>
          <div className="border-t border-emerald-800 pt-3">
            <p className="text-amber-300 text-sm font-semibold mb-2">🧪 FAT se rate (dairy/society ke liye)</p>
            <div className="space-y-3">
              <div>
                <label className="text-emerald-300 text-xs font-semibold block mb-1">🐄 {t('set.gaayFat')}</label>
                <input type="number" step="5" min="0" value={gaayFat} onChange={(e) => setGaayFat(e.target.value)}
                  placeholder={t('set.gaayFatPh')}
                  className="w-full bg-emerald-950/60 text-white border border-emerald-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400" />
              </div>
              <div>
                <label className="text-emerald-300 text-xs font-semibold block mb-1">🐃 {t('set.bhainsFat')}</label>
                <input type="number" step="5" min="0" value={bhainsFat} onChange={(e) => setBhainsFat(e.target.value)}
                  placeholder={t('set.bhainsFatPh')}
                  className="w-full bg-emerald-950/60 text-white border border-emerald-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400" />
              </div>
              <p className="text-emerald-300 text-xs leading-relaxed">{t('set.fatNote')}</p>
            </div>
          </div>
          <button onClick={saveRates}
            className="w-full bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold py-2.5 rounded-lg transition-colors">
            {rateSaved ? `✅ ${t('set.saved')}` : t('set.rateSave')}
          </button>
        </div>
      </div>

      <div className="bg-emerald-900/50 rounded-2xl p-4 border border-emerald-800">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="text-amber-300" size={18} />
          <h3 className="text-white font-bold text-sm">🔔 {t('set.remTitle')}</h3>
        </div>
        <p className="text-emerald-300 text-xs mb-3">{t('set.remSub')}</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-emerald-950/40 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🌅</span>
              <span className="text-white text-sm font-semibold">{t('set.morningRem')}</span>
            </div>
            <div className="flex items-center gap-2">
              <input type="time" value={mornTime} onChange={(e) => setMornTime(e.target.value)}
                className="bg-emerald-950/60 text-white border border-emerald-700 rounded px-2 py-1 text-xs" />
              <button onClick={() => setMornEn(!mornEn)}
                className={`w-12 h-6 rounded-full transition-colors relative ${mornEn ? 'bg-amber-500' : 'bg-emerald-800'}`}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${mornEn ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between bg-emerald-950/40 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🌇</span>
              <span className="text-white text-sm font-semibold">{t('set.eveningRem')}</span>
            </div>
            <div className="flex items-center gap-2">
              <input type="time" value={eveTime} onChange={(e) => setEveTime(e.target.value)}
                className="bg-emerald-950/60 text-white border border-emerald-700 rounded px-2 py-1 text-xs" />
              <button onClick={() => setEveEn(!eveEn)}
                className={`w-12 h-6 rounded-full transition-colors relative ${eveEn ? 'bg-amber-500' : 'bg-emerald-800'}`}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${eveEn ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
          <button onClick={saveReminders}
            className="w-full bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold py-2.5 rounded-lg transition-colors">
            {remSaved ? `✅ ${t('set.saved')}` : t('set.remSave')}
          </button>
          <p className="text-emerald-300 text-xs text-center">⚠️ {t('set.remWarn')}</p>
        </div>
      </div>

      <div className="bg-emerald-900/50 rounded-2xl p-4 border border-emerald-800">
        <div className="flex items-center gap-2 mb-3">
          <Download className="text-amber-300" size={18} />
          <h3 className="text-white font-bold text-sm">📥 {t('set.exportTitle')}</h3>
        </div>
        <p className="text-emerald-300 text-xs mb-3">{t('set.exportSub')}</p>
        <button onClick={exportAll} disabled={entries.length === 0}
          className="w-full bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
          <Download size={18} /> {t('set.exportBtn')} ({entries.length})
        </button>
      </div>

      <div className="bg-emerald-900/50 rounded-2xl p-4 border border-emerald-800">
        <div className="flex items-center gap-2 mb-3">
          <Upload className="text-amber-300" size={18} />
          <h3 className="text-white font-bold text-sm">📤 {t('set.importTitle')}</h3>
        </div>
        <p className="text-emerald-300 text-xs mb-3">{t('set.importSub')}</p>
        <input ref={fileRef} type="file" accept=".csv" onChange={handleImport} className="hidden" />
        <button onClick={() => fileRef.current?.click()}
          className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
          <Upload size={18} /> {t('set.importBtn')}
        </button>
        {importMsg && (
          <div className={`mt-2 text-center text-sm ${importMsg.startsWith('✅') ? 'text-green-300' : 'text-red-300'}`}>
            {importMsg}
          </div>
        )}
      </div>

      {/* ─── CLOUD SYNC ─── */}
      <div className="bg-emerald-900/50 rounded-2xl p-4 border border-emerald-800">
        <div className="flex items-center gap-2 mb-3">
          {cloudUser ? <Cloud className="text-amber-300" size={18} /> : <CloudOff className="text-emerald-300" size={18} />}
          <h3 className="text-white font-bold text-sm">☁️ {t('set.cloudTitle')}</h3>
        </div>

        {!isCloudAvailable() && (
          <p className="text-emerald-300 text-xs leading-relaxed">
            {t('set.cloudSetupPending')}
          </p>
        )}

        {isCloudAvailable() && !cloudUser && (
          <>
            <p className="text-emerald-300 text-xs mb-3 leading-relaxed">
              {t('set.cloudSub')}
            </p>
            <button onClick={handleCloudConnect} disabled={cloudBusy}
              className="w-full bg-white hover:bg-zinc-100 disabled:opacity-50 text-zinc-800 font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
              <span className="w-5 h-5 rounded-full bg-[#4285F4] text-white text-[12px] font-bold flex items-center justify-center leading-none">G</span>
              {cloudBusy ? t('set.cloudConnecting') : t('set.cloudConnect')}
            </button>
          </>
        )}

        {isCloudAvailable() && cloudUser && (
          <div className="space-y-3">
            <div className="bg-emerald-950/40 rounded-lg p-3">
              <p className="text-white text-sm font-semibold truncate">{cloudUser.name}</p>
              <p className="text-emerald-300 text-xs truncate">{cloudUser.email}</p>
              <p className="text-xs mt-1">
                {cloudStatus === 'syncing' && <span className="text-amber-300">⏳ {t('set.cloudSyncing')}</span>}
                {cloudStatus === 'synced' && <span className="text-green-300">✅ {t('set.cloudSynced')}</span>}
                {cloudStatus === 'error' && <span className="text-red-300">⚠️ {t('set.cloudError')}</span>}
                {cloudStatus === 'idle' && <span className="text-emerald-300">{t('set.cloudIdle')}</span>}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button onClick={handleCloudPush} disabled={cloudBusy}
                className="bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors">
                <ArrowUpFromLine size={14} /> {t('set.cloudPush')}
              </button>
              <button onClick={handleCloudPull} disabled={cloudBusy}
                className="bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors">
                <ArrowDownToLine size={14} /> {t('set.cloudPull')}
              </button>
            </div>

            {localAccounts.length > 0 && (
              <div className="bg-amber-950/40 border border-amber-800/30 rounded-lg p-3">
                <p className="text-amber-300 text-xs font-semibold mb-2">📦 {t('set.cloudMigrateTitle')}</p>
                <p className="text-emerald-300 text-sm mb-2 leading-relaxed">
                  {t('set.cloudMigrateSub')}
                </p>
                <div className="flex gap-2">
                  <select value={migrateFrom} onChange={(e) => setMigrateFrom(e.target.value)}
                    className="flex-1 bg-emerald-950/60 text-white border border-emerald-700 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-amber-400">
                    <option value="">{t('set.cloudMigratePick')}</option>
                    {localAccounts.map((k) => (
                      <option key={k} value={k}>
                        {users[k]?.username || k} ({(useStore.getState().allEntries[k] || []).length})
                      </option>
                    ))}
                  </select>
                  <button onClick={handleMigrate} disabled={cloudBusy}
                    className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-emerald-950 text-xs font-bold px-3 rounded-lg transition-colors">
                    {t('set.cloudPush')}
                  </button>
                </div>
              </div>
            )}

            <button onClick={handleGoogleDisconnect}
              className="w-full text-red-300 hover:text-red-200 text-xs font-semibold py-1 transition-colors">
              {t('set.cloudDisconnect')}
            </button>
          </div>
        )}

        {cloudMsg && (
          <div className={`mt-3 text-center text-sm ${cloudMsg.startsWith('✅') ? 'text-green-300' : 'text-red-300'}`}>
            {cloudMsg}
          </div>
        )}
      </div>

      {/* ─── ADVANCE / PASHAU AAHAR ─── */}
      <div className="bg-emerald-900/50 rounded-2xl p-4 border border-emerald-800">
        <div className="flex items-center gap-2 mb-3">
          <MinusCircle className="text-amber-300" size={18} />
          <h3 className="text-white font-bold text-sm">💰 {t('set.dedTitle')}</h3>
        </div>
        <p className="text-emerald-300 text-xs mb-3 leading-relaxed">{t('set.dedSub')}</p>

        <div className="space-y-2">
          <div>
            <label className="text-emerald-300 text-xs font-semibold block mb-1">{t('set.dedKind')}</label>
            <select value={dedKind} onChange={(e) => setDedKind(e.target.value as 'advance' | 'aahar' | 'other')}
              className="w-full bg-emerald-950/60 text-white border border-emerald-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400">
              <option value="advance">{t('set.dedAdvance')}</option>
              <option value="aahar">{t('set.dedAahar')}</option>
              <option value="other">{t('set.dedOther')}</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-emerald-300 text-xs font-semibold block mb-1">{t('set.dedAmount')}</label>
              <input type="number" step="10" min="0" value={dedAmount} onChange={(e) => setDedAmount(e.target.value)}
                placeholder={t('set.dedAmountPh')}
                className="w-full bg-emerald-950/60 text-white border border-emerald-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400" />
            </div>
            <div>
              <label className="text-emerald-300 text-xs font-semibold block mb-1">{t('entry.date')}</label>
              <input type="date" value={dedDate} onChange={(e) => setDedDate(e.target.value)}
                className="w-full bg-emerald-950/60 text-white border border-emerald-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400" />
            </div>
          </div>
          <div>
            <label className="text-emerald-300 text-xs font-semibold block mb-1">{t('set.dedNote')}</label>
            <input type="text" value={dedNote} onChange={(e) => setDedNote(e.target.value)}
              placeholder={t('set.dedNotePh')}
              className="w-full bg-emerald-950/60 text-white border border-emerald-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400" />
          </div>
          <button
            onClick={() => {
              const amt = parseFloat(dedAmount)
              if (!amt || amt <= 0) return
              addDeduction({ date: dedDate, kind: dedKind, note: dedNote || undefined, amount: amt })
              setDedAmount('')
              setDedNote('')
            }}
            className="w-full bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold py-2.5 rounded-lg transition-colors">
            {t('set.dedAdd')}
          </button>
        </div>

        {deductions.length === 0 ? (
          <p className="text-emerald-300 text-sm text-center py-3">{t('set.dedEmpty')}</p>
        ) : (
          <div className="mt-3 space-y-2">
            {deductions.map((d) => (
              <div key={d.id} className="flex items-center justify-between bg-emerald-950/40 rounded-lg p-2.5">
                <div className="min-w-0">
                  <p className="text-white text-sm font-semibold">
                    {d.kind === 'advance' ? '💵 ' + t('set.dedAdvance') : d.kind === 'aahar' ? '🌾 ' + t('set.dedAahar') : '📝 ' + t('set.dedOther')}
                  </p>
                  <p className="text-emerald-300 text-xs">
                    {fmtDate(d.date)}{d.note ? ' · ' + d.note : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-amber-300 font-bold text-sm">₹{d.amount.toFixed(0)}</span>
                  <button onClick={() => removeDeduction(d.id)} className="text-red-300 hover:text-red-400 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between border-t border-emerald-800 pt-2">
              <span className="text-emerald-300 text-sm font-semibold">{t('set.dedTotal')}</span>
              <span className="text-amber-300 font-bold">₹{deductionTotal(deductions).toFixed(0)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-emerald-900/50 rounded-2xl p-4 border border-emerald-800">
        <div className="flex items-center gap-2 mb-3">
          <Settings className="text-amber-300" size={18} />
          <h3 className="text-white font-bold text-sm">👤 {t('set.accountTitle')}</h3>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Milk className="text-amber-300" size={20} />
            <div>
              <p className="text-white text-sm font-semibold">{displayName}</p>
              <p className="text-emerald-300 text-xs">{entries.length} · {t('set.loggedIn')}</p>
            </div>
          </div>
          <button onClick={logout} className="bg-red-900/40 hover:bg-red-900/60 text-red-300 font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
            <LogOut size={16} /> {t('set.logout')}
          </button>
        </div>
      </div>

      <p className="text-emerald-300 text-xs text-center pb-2">{t('set.footer')}</p>
    </div>
  )
}
