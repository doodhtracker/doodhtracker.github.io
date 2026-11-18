import { useState, useRef, useEffect } from 'react'
import { useStore, useRates, useReminders, useEntries, exportCSV, downloadCSV, parseCSV, startReminders } from '../store'
import { Settings, Bell, Download, Upload, LogOut, Wallet, Milk, Mail, Copy, RotateCcw, FileDown, Share2, FileText, Cloud, CloudOff, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'
import { packBackup, unpackBackup, backupSummary, type BackupData } from '../backup'
import { isCloudAvailable } from '../cloud'

export default function SettingsTab() {
  const rates = useRates()
  const reminders = useReminders()
  const entries = useEntries()
  const setRates = useStore((s) => s.setRates)
  const setReminders = useStore((s) => s.setReminders)
  const logout = useStore((s) => s.logout)
  const importEntries = useStore((s) => s.importEntries)
  const currentUser = useStore((s) => s.currentUser)

  const [gaayRate, setGaayRate] = useState(String(rates.gaay || ''))
  const [bhainsRate, setBhainsRate] = useState(String(rates.bhains || ''))
  const [rateSaved, setRateSaved] = useState(false)

  const [mornEn, setMornEn] = useState(reminders.morningEnabled)
  const [eveEn, setEveEn] = useState(reminders.eveningEnabled)
  const [mornTime, setMornTime] = useState(reminders.morningTime)
  const [eveTime, setEveTime] = useState(reminders.eveningTime)
  const [remSaved, setRemSaved] = useState(false)

  const [importMsg, setImportMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  // ─── Email backup ───
  const restoreBackup = useStore((s) => s.restoreBackup)
  const users = useStore((s) => s.users)
  const [toEmail, setToEmail] = useState('')
  const [backupCode, setBackupCode] = useState('')
  const [backupInfo, setBackupInfo] = useState('')
  const [backupBusy, setBackupBusy] = useState(false)
  const [pasteCode, setPasteCode] = useState('')
  const [backupMsg, setBackupMsg] = useState('')
  const restoreFileRef = useRef<HTMLInputElement>(null)

  function flashBackup(msg: string) {
    setBackupMsg(msg)
    setTimeout(() => setBackupMsg(''), 6000)
  }

  // Data badle to backup code apne aap naya ban jata hai
  useEffect(() => {
    let cancelled = false
    if (!currentUser) return
    const data: BackupData = {
      v: 1,
      app: 'doodh-tracker',
      at: Date.now(),
      username: users[currentUser]?.username || currentUser,
      entries,
      rates,
      reminders,
      reviews: useStore.getState().reviews || [],
    }
    packBackup(data)
      .then((code) => {
        if (cancelled) return
        setBackupCode(code)
        setBackupInfo(backupSummary(data))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [currentUser, entries, rates, reminders, users])

  function emailValid(v: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
  }

  function sendBackupEmail() {
    if (!emailValid(toEmail)) {
      flashBackup('❌ Sahi email ID daalo (jaise naam@gmail.com)')
      return
    }
    if (!backupCode) {
      flashBackup('❌ Backup ban raha hai — ek second baad try karo')
      return
    }
    const subject = 'Doodh Tracker Backup — sambhal ke rakho'
    const body =
      'Ye mera Doodh Tracker ka backup hai.\n\n' +
      'Naye phone pe: app kholo → Settings → Email Backup → Restore box mein neeche wala code paste karo → Restore dabao.\n\n' +
      '----- CODE START -----\n' +
      backupCode +
      '\n----- CODE END -----\n'
    window.location.href =
      'mailto:' + encodeURIComponent(toEmail.trim()) +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body)
    flashBackup('📧 Email app khul raha hai — bas Send dabao')
  }

  async function copyBackup() {
    try {
      await navigator.clipboard.writeText(backupCode)
      flashBackup('✅ Code copy ho gaya')
    } catch {
      flashBackup('❌ Copy nahi hua — code select karke manually copy karo')
    }
  }

  async function shareBackup() {
    if (!backupCode) return
    const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }
    if (nav.share) {
      try {
        await nav.share({ title: 'Doodh Tracker Backup', text: 'Doodh Tracker backup code:\n\n' + backupCode })
        return
      } catch {
        return
      }
    }
    await copyBackup()
  }

  function downloadBackupFile() {
    const blob = new Blob([backupCode], { type: 'text/plain;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `doodh-tracker-backup-${new Date().toISOString().slice(0, 10)}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  async function shareBackupFile() {
    if (!backupCode) return
    const fileName = `doodh-tracker-backup-${new Date().toISOString().slice(0, 10)}.txt`
    const file = new File([backupCode], fileName, { type: 'text/plain' })
    const nav = navigator as Navigator & {
      canShare?: (d: ShareData) => boolean
      share?: (d: ShareData) => Promise<void>
    }
    if (nav.share && nav.canShare && nav.canShare({ files: [file] })) {
      try {
        await nav.share({ files: [file], title: 'Doodh Tracker Backup' })
        return
      } catch {
        return
      }
    }
    downloadBackupFile()
  }

  async function restoreFromText(text: string) {
    setBackupBusy(true)
    try {
      const data = await unpackBackup(text)
      const res = restoreBackup(data)
      if (res.ok) {
        flashBackup(`✅ Restore ho gaya! Ab is account mein ${res.entries} entries hain`)
        setPasteCode('')
      } else {
        flashBackup('❌ ' + (res.error || 'Restore fail ho gaya'))
      }
    } catch (e) {
      flashBackup('❌ ' + (e instanceof Error ? e.message : 'Code galat hai'))
    }
    setBackupBusy(false)
  }

  async function doRestore() {
    await restoreFromText(pasteCode)
  }

  function handleRestoreFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      void restoreFromText(String(ev.target?.result || ''))
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  // ─── Cloud sync (Google) ───
  const cloudUser = useStore((s) => s.cloudUser)
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
    flashCloud(res.ok ? '✅ Google se jud gaya!' : '❌ ' + (res.error || 'Fail ho gaya'))
    setCloudBusy(false)
  }

  async function handleCloudPush() {
    setCloudBusy(true)
    const res = await cloudPush()
    flashCloud(res.ok ? '✅ Cloud pe save ho gaya!' : '❌ ' + (res.error || 'Fail'))
    setCloudBusy(false)
  }

  async function handleCloudPull() {
    setCloudBusy(true)
    const res = await cloudPull()
    flashCloud(res.ok ? '✅ Cloud se data aa gaya!' : '❌ ' + (res.error || 'Fail'))
    setCloudBusy(false)
  }

  async function handleMigrate() {
    if (!migrateFrom) {
      flashCloud('❌ Pehle account chuno jiska data bhejna hai')
      return
    }
    setCloudBusy(true)
    const res = await migrateLocalToCloud(migrateFrom)
    if (res.ok) flashCloud(`✅ ${res.count} entries cloud pe chali gayi!`)
    else flashCloud('❌ ' + (res.error || 'Fail'))
    setCloudBusy(false)
  }

  async function handleGoogleDisconnect() {
    await googleLogout()
    flashCloud('Google se disconnect ho gaya')
  }

  function saveRates() {
    setRates(parseFloat(gaayRate) || 0, parseFloat(bhainsRate) || 0)
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
        setImportMsg('❌ CSV file sahi nahi hai. Pehle export ki hui file use karo.')
        return
      }
      importEntries(parsed)
      setImportMsg(`✅ ${parsed.length} entries import ho gayi!`)
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
          <h3 className="text-white font-bold text-sm">💰 Rate Set Karo</h3>
        </div>
        <p className="text-emerald-300 text-xs mb-3">Litres ka rate daalo, taaki paisa ka hisaab bhi automatic chale</p>
        <div className="space-y-3">
          <div>
            <label className="text-emerald-300 text-xs font-semibold block mb-1">🐄 Gaay ka rate (₹/litre)</label>
            <input type="number" step="0.5" min="0" value={gaayRate} onChange={(e) => setGaayRate(e.target.value)}
              placeholder="jaise 40"
              className="w-full bg-emerald-950/60 text-white border border-emerald-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400" />
          </div>
          <div>
            <label className="text-emerald-300 text-xs font-semibold block mb-1">🐃 Bhains ka rate (₹/litre)</label>
            <input type="number" step="0.5" min="0" value={bhainsRate} onChange={(e) => setBhainsRate(e.target.value)}
              placeholder="jaise 45"
              className="w-full bg-emerald-950/60 text-white border border-emerald-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400" />
          </div>
          <button onClick={saveRates}
            className="w-full bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold py-2.5 rounded-lg transition-colors">
            {rateSaved ? '✅ Save ho gaya!' : 'Rate Save Karo'}
          </button>
        </div>
      </div>

      <div className="bg-emerald-900/50 rounded-2xl p-4 border border-emerald-800">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="text-amber-300" size={18} />
          <h3 className="text-white font-bold text-sm">🔔 Reminder Set Karo</h3>
        </div>
        <p className="text-emerald-300 text-xs mb-3">Subah/shaam entry karne ka reminder milega</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-emerald-950/40 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🌅</span>
              <span className="text-white text-sm font-semibold">Subah Reminder</span>
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
              <span className="text-white text-sm font-semibold">Shaam Reminder</span>
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
            {remSaved ? '✅ Save ho gaya!' : 'Reminder Save Karo'}
          </button>
          <p className="text-emerald-300 text-xs text-center">⚠️ Reminder tab kaam karega jab website browser mein khuli hogi</p>
        </div>
      </div>

      <div className="bg-emerald-900/50 rounded-2xl p-4 border border-emerald-800">
        <div className="flex items-center gap-2 mb-3">
          <Download className="text-amber-300" size={18} />
          <h3 className="text-white font-bold text-sm">📥 Data Export (Backup)</h3>
        </div>
        <p className="text-emerald-300 text-xs mb-3">Apna saara doodh data CSV file mein nikal lo — backup ke liye</p>
        <button onClick={exportAll} disabled={entries.length === 0}
          className="w-full bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
          <Download size={18} /> CSV Download Karo ({entries.length} entries)
        </button>
      </div>

      <div className="bg-emerald-900/50 rounded-2xl p-4 border border-emerald-800">
        <div className="flex items-center gap-2 mb-3">
          <Upload className="text-amber-300" size={18} />
          <h3 className="text-white font-bold text-sm">📤 Data Import (Purana Data Wapas Lau)</h3>
        </div>
        <p className="text-emerald-300 text-xs mb-3">Pehle export ki hui CSV file upload karo — purana data wapas aa jayega. Duplicate entries automatic skip honge.</p>
        <input ref={fileRef} type="file" accept=".csv" onChange={handleImport} className="hidden" />
        <button onClick={() => fileRef.current?.click()}
          className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
          <Upload size={18} /> CSV Upload Karo
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
          <h3 className="text-white font-bold text-sm">☁️ Cloud Sync (Google)</h3>
        </div>

        {!isCloudAvailable() && (
          <p className="text-emerald-300 text-xs leading-relaxed">
            Firebase setup baaki hai. Guide tab → &quot;☁️ Google login setup&quot; dekho — config bharte hi ye card chalu ho jayega.
            Tab tak Email Backup se kaam chala lo.
          </p>
        )}

        {isCloudAvailable() && !cloudUser && (
          <>
            <p className="text-emerald-300 text-xs mb-3 leading-relaxed">
              Google se jud jao — data cloud pe safe rahega aur har phone pe same dikhega.
            </p>
            <button onClick={handleCloudConnect} disabled={cloudBusy}
              className="w-full bg-white hover:bg-zinc-100 disabled:opacity-50 text-zinc-800 font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
              <span className="w-5 h-5 rounded-full bg-[#4285F4] text-white text-[12px] font-bold flex items-center justify-center leading-none">G</span>
              {cloudBusy ? 'Jud raha hai...' : 'Google se connect karo'}
            </button>
          </>
        )}

        {isCloudAvailable() && cloudUser && (
          <div className="space-y-3">
            <div className="bg-emerald-950/40 rounded-lg p-3">
              <p className="text-white text-sm font-semibold truncate">{cloudUser.name}</p>
              <p className="text-emerald-300 text-xs truncate">{cloudUser.email}</p>
              <p className="text-xs mt-1">
                {cloudStatus === 'syncing' && <span className="text-amber-300">⏳ Sync ho raha...</span>}
                {cloudStatus === 'synced' && <span className="text-green-300">✅ Cloud pe save hai</span>}
                {cloudStatus === 'error' && <span className="text-red-300">⚠️ Sync fail — internet check karo</span>}
                {cloudStatus === 'idle' && <span className="text-emerald-300">Abhi sync nahi hua</span>}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button onClick={handleCloudPush} disabled={cloudBusy}
                className="bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors">
                <ArrowUpFromLine size={14} /> Bhejo
              </button>
              <button onClick={handleCloudPull} disabled={cloudBusy}
                className="bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors">
                <ArrowDownToLine size={14} /> Laao
              </button>
            </div>

            {localAccounts.length > 0 && (
              <div className="bg-amber-950/40 border border-amber-800/30 rounded-lg p-3">
                <p className="text-amber-300 text-xs font-semibold mb-2">📦 Purana data cloud pe bhejo</p>
                <p className="text-emerald-300 text-[11px] mb-2 leading-relaxed">
                  Pehle PIN wale account ka data yahan se cloud mein daal sakte ho.
                </p>
                <div className="flex gap-2">
                  <select value={migrateFrom} onChange={(e) => setMigrateFrom(e.target.value)}
                    className="flex-1 bg-emerald-950/60 text-white border border-emerald-700 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-amber-400">
                    <option value="">account chuno...</option>
                    {localAccounts.map((k) => (
                      <option key={k} value={k}>
                        {users[k]?.username || k} ({(useStore.getState().allEntries[k] || []).length} entries)
                      </option>
                    ))}
                  </select>
                  <button onClick={handleMigrate} disabled={cloudBusy}
                    className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-emerald-950 text-xs font-bold px-3 rounded-lg transition-colors">
                    Bhejo
                  </button>
                </div>
              </div>
            )}

            <button onClick={handleGoogleDisconnect}
              className="w-full text-red-300 hover:text-red-200 text-xs font-semibold py-1 transition-colors">
              Google se disconnect karo
            </button>
          </div>
        )}

        {cloudMsg && (
          <div className={`mt-3 text-center text-sm ${cloudMsg.startsWith('✅') ? 'text-green-300' : 'text-red-300'}`}>
            {cloudMsg}
          </div>
        )}
      </div>

      {/* ─── EMAIL BACKUP ─── */}
      <div className="bg-emerald-900/50 rounded-2xl p-4 border border-emerald-800">
        <div className="flex items-center gap-2 mb-3">
          <Mail className="text-amber-300" size={18} />
          <h3 className="text-white font-bold text-sm">📧 Email Backup</h3>
        </div>
        <p className="text-emerald-300 text-xs mb-3 leading-relaxed">
          Email ID daalo aur Send dabao — backup code apne aap email mein bhar jayega.
          Naye phone pe usi email se code copy karke restore kar lena.
        </p>

        {backupCode ? (
          <p className="text-emerald-300 text-[11px] mb-2">{backupInfo} · code ready ✅</p>
        ) : (
          <p className="text-emerald-300 text-[11px] mb-2">Code ban raha hai...</p>
        )}

        <label className="text-emerald-300 text-xs font-semibold block mb-1">Kisko bhejna hai?</label>
        <input
          type="email"
          value={toEmail}
          onChange={(e) => setToEmail(e.target.value)}
          placeholder="tumhara-email@gmail.com"
          className="w-full bg-emerald-950/60 text-white border border-emerald-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400 placeholder:text-emerald-500"
        />

        <button
          onClick={sendBackupEmail}
          disabled={backupBusy || !backupCode}
          className="mt-2 w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-emerald-950 font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <Mail size={18} /> Email bhejo (code auto bhara)
        </button>

        <div className="grid grid-cols-2 gap-2 mt-2">
          <button
            onClick={shareBackup}
            disabled={!backupCode}
            className="bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
          >
            <Share2 size={14} /> Share karo
          </button>
          <button
            onClick={shareBackupFile}
            disabled={!backupCode}
            className="bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
          >
            <FileText size={14} /> File bhejo
          </button>
        </div>

        {backupCode.length > 4000 && (
          <p className="text-amber-400 text-[10px] mt-2 leading-relaxed">
            Code bada hai — email app poora na bhare to "Share karo" ya "File bhejo" use karo, wo poora chala jayega.
          </p>
        )}

        <div className="flex items-center justify-center gap-4 mt-2">
          <button onClick={downloadBackupFile} className="text-emerald-300 hover:text-emerald-300 text-[11px] font-semibold flex items-center gap-1 transition-colors">
            <FileDown size={12} /> .txt download
          </button>
          <button onClick={copyBackup} className="text-emerald-300 hover:text-emerald-300 text-[11px] font-semibold flex items-center gap-1 transition-colors">
            <Copy size={12} /> code copy
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-emerald-800">
          <p className="text-amber-300 text-xs font-semibold mb-2">🔄 Restore karo (naya phone)</p>
          <textarea
            value={pasteCode}
            onChange={(e) => setPasteCode(e.target.value)}
            rows={3}
            placeholder="Backup code yahan paste karo..."
            className="w-full bg-emerald-950/60 text-white border border-emerald-700 rounded-lg px-2 py-2 text-[10px] font-mono resize-none focus:outline-none focus:border-amber-400 placeholder:text-emerald-500"
          />
          <button
            onClick={doRestore}
            disabled={backupBusy || !pasteCode.trim()}
            className="mt-2 w-full bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw size={16} /> {backupBusy ? 'Restore ho raha...' : 'Restore Karo'}
          </button>

          <input ref={restoreFileRef} type="file" accept=".txt,text/plain" onChange={handleRestoreFile} className="hidden" />
          <button
            onClick={() => restoreFileRef.current?.click()}
            className="mt-2 w-full text-emerald-300 hover:text-emerald-300 text-[11px] font-semibold py-1 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Upload size={13} /> ya backup .txt file se restore karo
          </button>

          <p className="text-emerald-300 text-[10px] mt-1 leading-relaxed">
            Purani entries jodi jaati hain — duplicate skip, kuch delete nahi hota.
          </p>
        </div>

        {backupMsg && (
          <div className={`mt-3 text-center text-xs ${backupMsg.startsWith('✅') ? 'text-green-300' : backupMsg.startsWith('📧') ? 'text-amber-300' : 'text-red-300'}`}>
            {backupMsg}
          </div>
        )}
      </div>

      <div className="bg-emerald-900/50 rounded-2xl p-4 border border-emerald-800">
        <div className="flex items-center gap-2 mb-3">
          <Settings className="text-amber-300" size={18} />
          <h3 className="text-white font-bold text-sm">👤 Account</h3>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Milk className="text-amber-300" size={20} />
            <div>
              <p className="text-white text-sm font-semibold">{currentUser}</p>
              <p className="text-emerald-300 text-xs">{entries.length} entries · Logged in</p>
            </div>
          </div>
          <button onClick={logout} className="bg-red-900/40 hover:bg-red-900/60 text-red-300 font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      <p className="text-emerald-300 text-xs text-center pb-2">🥛 Doodh Tracker · Made with ❤️</p>
    </div>
  )
}
