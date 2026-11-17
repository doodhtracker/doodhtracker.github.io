import { useState, useRef } from 'react'
import { useStore, useRates, useReminders, useEntries, exportCSV, downloadCSV, parseCSV, startReminders } from '../store'
import { Settings, Bell, Download, Upload, LogOut, Wallet, Milk, Mail, Copy, RotateCcw, FileDown } from 'lucide-react'
import { packBackup, unpackBackup, backupSummary, type BackupData } from '../backup'

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
  const remindersCfg = reminders
  const [backupCode, setBackupCode] = useState('')
  const [backupInfo, setBackupInfo] = useState('')
  const [backupBusy, setBackupBusy] = useState(false)
  const [pasteCode, setPasteCode] = useState('')
  const [backupMsg, setBackupMsg] = useState('')

  function flashBackup(msg: string) {
    setBackupMsg(msg)
    setTimeout(() => setBackupMsg(''), 5000)
  }

  async function makeBackup() {
    setBackupBusy(true)
    try {
      const data: BackupData = {
        v: 1,
        app: 'doodh-tracker',
        at: Date.now(),
        username: currentUser ? users[currentUser]?.username || currentUser : '',
        entries,
        rates,
        reminders: remindersCfg,
        reviews: useStore.getState().reviews || [],
      }
      const code = await packBackup(data)
      setBackupCode(code)
      setBackupInfo(backupSummary(data))
      flashBackup('✅ Backup code ban gaya — neeche se copy karo')
    } catch {
      flashBackup('❌ Backup banane mein dikkat aayi')
    }
    setBackupBusy(false)
  }

  async function copyBackup() {
    try {
      await navigator.clipboard.writeText(backupCode)
      flashBackup('✅ Code copy ho gaya! Ab email/WhatsApp mein paste karo')
    } catch {
      flashBackup('❌ Copy nahi hua — code select karke manually copy karo')
    }
  }

  function emailBackup() {
    const subject = encodeURIComponent('Doodh Tracker Backup — sambhal ke rakho')
    const body = encodeURIComponent(
      'Ye mera Doodh Tracker ka backup hai.\n\nNaye phone pe: app kholo → Settings → Email Backup → neeche box mein code paste karo → Restore dabao.\n\n[ yahan code paste karo — app ke Settings se Copy kiya hua ]\n',
    )
    window.location.href = `mailto:?subject=${subject}&body=${body}`
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

  async function doRestore() {
    setBackupBusy(true)
    try {
      const data = await unpackBackup(pasteCode)
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
        <p className="text-emerald-500 text-xs mb-3">Litres ka rate daalo, taaki paisa ka hisaab bhi automatic chale</p>
        <div className="space-y-3">
          <div>
            <label className="text-emerald-400 text-xs font-semibold block mb-1">🐄 Gaay ka rate (₹/litre)</label>
            <input type="number" step="0.5" min="0" value={gaayRate} onChange={(e) => setGaayRate(e.target.value)}
              placeholder="jaise 40"
              className="w-full bg-emerald-950/60 text-white border border-emerald-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400" />
          </div>
          <div>
            <label className="text-emerald-400 text-xs font-semibold block mb-1">🐃 Bhains ka rate (₹/litre)</label>
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
        <p className="text-emerald-500 text-xs mb-3">Subah/shaam entry karne ka reminder milega</p>
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
          <p className="text-emerald-600 text-xs text-center">⚠️ Reminder tab kaam karega jab website browser mein khuli hogi</p>
        </div>
      </div>

      <div className="bg-emerald-900/50 rounded-2xl p-4 border border-emerald-800">
        <div className="flex items-center gap-2 mb-3">
          <Download className="text-amber-300" size={18} />
          <h3 className="text-white font-bold text-sm">📥 Data Export (Backup)</h3>
        </div>
        <p className="text-emerald-500 text-xs mb-3">Apna saara doodh data CSV file mein nikal lo — backup ke liye</p>
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
        <p className="text-emerald-500 text-xs mb-3">Pehle export ki hui CSV file upload karo — purana data wapas aa jayega. Duplicate entries automatic skip honge.</p>
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

      {/* ─── EMAIL BACKUP ─── */}
      <div className="bg-emerald-900/50 rounded-2xl p-4 border border-emerald-800">
        <div className="flex items-center gap-2 mb-3">
          <Mail className="text-amber-300" size={18} />
          <h3 className="text-white font-bold text-sm">📧 Email Backup</h3>
        </div>
        <p className="text-emerald-500 text-xs mb-3 leading-relaxed">
          Poora data ek code mein badal jata hai. Us code ko khud ko email kar lo.
          Naye phone pe wahi code paste karke sab wapas le aao. Koi login nahi, koi setup nahi.
        </p>

        <button onClick={makeBackup} disabled={backupBusy || entries.length === 0}
          className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-emerald-950 font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
          <Mail size={18} /> {backupBusy ? 'Ban raha hai...' : 'Backup Code Banao'}
        </button>

        {backupCode && (
          <div className="mt-3 space-y-2">
            <p className="text-emerald-400 text-[11px]">{backupInfo} · {backupCode.length} characters</p>
            <textarea readOnly value={backupCode} rows={4}
              onFocus={(e) => e.currentTarget.select()}
              className="w-full bg-emerald-950/60 text-emerald-300 border border-emerald-700 rounded-lg px-2 py-2 text-[10px] font-mono break-all resize-none" />
            <div className="grid grid-cols-2 gap-2">
              <button onClick={copyBackup}
                className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors">
                <Copy size={14} /> Copy karo
              </button>
              <button onClick={emailBackup}
                className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors">
                <Mail size={14} /> Email kholo
              </button>
            </div>
            <button onClick={downloadBackupFile}
              className="w-full text-emerald-400 hover:text-emerald-300 text-xs font-semibold py-1 flex items-center justify-center gap-1.5 transition-colors">
              <FileDown size={13} /> Ya file mein download karo (.txt)
            </button>
            <p className="text-emerald-600 text-[10px] text-center leading-relaxed">
              Email app khulega — pehle "Copy karo" dabao, phir email mein code paste kar do.
            </p>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-emerald-800">
          <p className="text-amber-300 text-xs font-semibold mb-2">🔄 Restore karo (naya phone)</p>
          <textarea value={pasteCode} onChange={(e) => setPasteCode(e.target.value)} rows={4}
            placeholder="Yahan backup code paste karo..."
            className="w-full bg-emerald-950/60 text-white border border-emerald-700 rounded-lg px-2 py-2 text-[10px] font-mono resize-none focus:outline-none focus:border-amber-400 placeholder:text-emerald-700" />
          <button onClick={doRestore} disabled={backupBusy || !pasteCode.trim()}
            className="mt-2 w-full bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
            <RotateCcw size={16} /> {backupBusy ? 'Restore ho raha...' : 'Restore Karo'}
          </button>
          <p className="text-emerald-600 text-[10px] mt-2 leading-relaxed">
            Purani entries jodi jaati hain — jo pehle se hai wo dobara nahi aayegi, kuch delete nahi hota.
          </p>
        </div>

        {backupMsg && (
          <div className={`mt-3 text-center text-xs ${backupMsg.startsWith('✅') ? 'text-green-300' : 'text-red-300'}`}>
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
              <p className="text-emerald-500 text-xs">{entries.length} entries · Logged in</p>
            </div>
          </div>
          <button onClick={logout} className="bg-red-900/40 hover:bg-red-900/60 text-red-300 font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      <p className="text-emerald-600 text-xs text-center pb-2">🥛 Doodh Tracker · Made with ❤️</p>
    </div>
  )
}
