import { useState } from 'react'
import { useStore, useEntries, useRates, useDeductions, last7Days, typeTotal, fmtDate, filterByDateRange, animalBreakdown, calcPaisa, exportCSV, downloadCSV, todayStr, deductionTotal, entryAmount } from '../store'
import { Download, Filter, FileText, MessageCircle } from 'lucide-react'
import { useT } from '../i18n'

function BarChart({ data }: { data: { day: string; Subah: number; Shaam: number }[] }) {
  const t = useT()
  const maxVal = Math.max(...data.map((d) => d.Subah + d.Shaam), 1)
  const barW = 16, gap = 6, chartW = data.length * (barW * 2 + gap) + 30, chartH = 140, yMax = Math.ceil(maxVal)
  return (
    <div className="overflow-x-auto">
      <svg width={chartW} height={chartH + 20} className="block">
        {[0, 0.5, 1].map((p, i) => {
          const val = Math.round(yMax * (1 - p)), y = 10 + p * (chartH - 10)
          return (<g key={i}><line x1="24" y1={y} x2={chartW} y2={y} stroke="#065f46" strokeWidth="0.5" /><text x="20" y={y + 3} textAnchor="end" fill="#6ee7b7" fontSize="9">{val}</text></g>)
        })}
        {data.map((d, i) => {
          const x = 28 + i * (barW * 2 + gap), subahH = (d.Subah / maxVal) * (chartH - 10), shaamH = (d.Shaam / maxVal) * (chartH - 10), baseY = chartH
          return (<g key={i}><rect x={x} y={baseY - subahH} width={barW} height={subahH} fill="#f59e0b" rx="2" /><rect x={x + barW + 2} y={baseY - shaamH} width={barW} height={shaamH} fill="#3b82f6" rx="2" /><text x={x + barW} y={chartH + 14} textAnchor="middle" fill="#6ee7b7" fontSize="9">{d.day}</text></g>)
        })}
      </svg>
      <div className="flex gap-4 mt-1 text-xs">
        <span className="text-amber-300">■ {t('home.morning')}</span>
        <span className="text-blue-400">■ {t('home.evening')}</span>
      </div>
    </div>
  )
}

function PieChart({ gaay, bhains }: { gaay: number; bhains: number }) {
  const t = useT()
  const total = gaay + bhains || 1, gaayPct = (gaay / total) * 100, bhainsPct = (bhains / total) * 100, r = 55, cx = 60, cy = 60, circ = 2 * Math.PI * r
  return (
    <div className="flex items-center gap-4">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f59e0b" strokeWidth="18" strokeDasharray={`${(gaayPct / 100) * circ} ${circ}`} strokeDashoffset="0" transform={`rotate(-90 ${cx} ${cy})`} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#3b82f6" strokeWidth="18" strokeDasharray={`${(bhainsPct / 100) * circ} ${circ}`} strokeDashoffset={`${-(gaayPct / 100) * circ}`} transform={`rotate(-90 ${cx} ${cy})`} />
      </svg>
      <div className="space-y-2">
        <div className="flex items-center gap-2"><span className="w-3 h-3 bg-amber-500 rounded inline-block" /><span className="text-white text-sm">🐄 {t('common.gaay')}: <b>{gaay}L</b> ({gaayPct.toFixed(0)}%)</span></div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 bg-blue-500 rounded inline-block" /><span className="text-white text-sm">🐃 {t('common.bhains')}: <b>{bhains}L</b> ({bhainsPct.toFixed(0)}%)</span></div>
      </div>
    </div>
  )
}

export default function StatsTab() {
  const entries = useEntries()
  const rates = useRates()
  const currentUser = useStore((st) => st.currentUser)
  const users = useStore((st) => st.users)
  const cloudUser = useStore((st) => st.cloudUser)
  const t = useT()
  const [fromDate, setFromDate] = useState(todayStr().slice(0, 8) + '01')
  const [toDate, setToDate] = useState(todayStr())

  if (entries.length === 0) {
    return (<div className="bg-emerald-900/40 rounded-xl p-6 text-center border border-emerald-800"><p className="text-emerald-300 text-sm">📊 {t('stats.empty')}</p></div>)
  }

  const filtered = filterByDateRange(entries, fromDate, toDate)
  const week = last7Days()
  const weekData = week.map((d) => {
    const morning = entries.filter((e) => e.date === d && e.session === 'morning').reduce((s, e) => s + e.liters, 0)
    const evening = entries.filter((e) => e.date === d && e.session === 'evening').reduce((s, e) => s + e.liters, 0)
    return { day: fmtDate(d).slice(0, 5), Subah: morning, Shaam: evening }
  })
  const gaayTotal = typeTotal(filtered, 'gaay')
  const bhainsTotal = typeTotal(filtered, 'bhains')
  const grandTotal = filtered.reduce((s, e) => s + e.liters, 0)
  const totalPaisa = calcPaisa(filtered, rates)
  const deductions = useDeductions()
  const dedTotal = deductionTotal(deductions)
  const netPayable = totalPaisa - dedTotal
  const animals = animalBreakdown(filtered, rates)

  function handleExport() {
    const csv = exportCSV(filtered, rates)
    downloadCSV(csv, `doodh-tracker-${fromDate}-to-${toDate}.csv`)
  }

  const showMoney = rates.gaay > 0 || rates.bhains > 0

  // Google wale account ka andar ka ID (g:xxxx) PDF mein na dikhe
  const displayName =
    (currentUser && users[currentUser]?.username) || cloudUser?.name || currentUser || ''

  function esc(v: string): string {
    return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }

  function handleWhatsApp() {
    const lines: string[] = []
    lines.push('🥛 ' + t('pdf.title'))
    if (displayName) lines.push(displayName)
    lines.push(`${t('entry.date')}: ${fmtDate(fromDate)} — ${fmtDate(toDate)}`)
    lines.push('')
    lines.push(`${t('stats.totalMilk')}: ${grandTotal.toFixed(1)} L`)
    lines.push(`${t('stats.totalEntries')}: ${filtered.length}`)
    if (showMoney) lines.push(`${t('stats.totalMoney')}: ₹${totalPaisa.toFixed(0)}`)
    if (showMoney && dedTotal > 0) {
      lines.push(`${t('stats.deductions')}: -₹${dedTotal.toFixed(0)}`)
      lines.push(`${t('stats.netPayable')}: ₹${netPayable.toFixed(0)}`)
    }
    lines.push('')
    lines.push(`🐄 ${t('common.gaay')}: ${gaayTotal.toFixed(1)} L`)
    lines.push(`🐃 ${t('common.bhains')}: ${bhainsTotal.toFixed(1)} L`)
    if (animals.length > 0) {
      lines.push('')
      animals.forEach((a) => {
        lines.push(`${a.type === 'gaay' ? '🐄' : '🐃'} ${a.name}: ${a.totalLiters.toFixed(1)} L (${a.entries})`)
      })
    }
    lines.push('')
    lines.push('— Doodh Tracker')

    const url = 'https://wa.me/?text=' + encodeURIComponent(lines.join('\n'))
    window.open(url, '_blank')
  }

  function handlePDF() {
    const byDate = new Map<string, { m: number; e: number; l: number; p: number }>()
    filtered.forEach((x) => {
      const rate = x.animalType === 'gaay' ? rates.gaay : rates.bhains
      const row = byDate.get(x.date) || { m: 0, e: 0, l: 0, p: 0 }
      if (x.session === 'morning') row.m += x.liters
      else row.e += x.liters
      row.l += x.liters
      row.p += x.liters * rate
      byDate.set(x.date, row)
    })
    const dates = [...byDate.keys()].sort()

    const dayRows = dates.length
      ? dates
          .map((d) => {
            const r = byDate.get(d)!
            return `<tr><td>${fmtDate(d)}</td><td>${r.m.toFixed(1)}</td><td>${r.e.toFixed(1)}</td><td>${r.l.toFixed(1)}</td><td>${showMoney ? '₹' + r.p.toFixed(0) : '-'}</td></tr>`
          })
          .join('')
      : `<tr><td colspan="5" style="text-align:center;color:#888">${esc(t('pdf.noData'))}</td></tr>`

    const animalRows = animals.length
      ? `<h2>${esc(t('stats.animalWise'))}</h2>
         <table>
           <thead><tr><th>${esc(t('entry.animal'))}</th><th>${esc(t('stats.entriesWord'))}</th><th>${esc(t('entry.liters'))}</th>${showMoney ? `<th>${esc(t('pdf.money'))}</th>` : ''}</tr></thead>
           <tbody>
             ${animals
               .map((a) => {
                 const rate = a.type === 'gaay' ? rates.gaay : rates.bhains
                 return `<tr><td>${a.type === 'gaay' ? '🐄' : '🐃'} ${esc(a.name)}</td><td>${a.entries}</td><td>${a.totalLiters.toFixed(1)}</td>${showMoney ? `<td>₹${(a.totalAmount || 0).toFixed(0)}</td>` : ''}</tr>`
               })
               .join('')}
           </tbody>
         </table>`
      : ''

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(t('pdf.title'))}</title>
<style>
  *{box-sizing:border-box}
  body{font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#111;margin:0;padding:20px;background:#fff}
  h1{font-size:20px;margin:0 0 4px}
  .sub{color:#555;font-size:12px;margin-bottom:16px;line-height:1.6}
  .grid{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px}
  .box{flex:1 1 30%;border:1px solid #ccc;border-radius:8px;padding:8px;text-align:center;min-width:110px}
  .lbl{font-size:11px;color:#666}
  .val{font-size:17px;font-weight:700;margin-top:2px}
  table{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:14px}
  th,td{border:1px solid #ccc;padding:5px 7px;text-align:right}
  th{background:#f0f0f0;text-align:center;font-size:11px}
  td:first-child,th:first-child{text-align:left}
  tfoot td{font-weight:700;background:#f7f7f7}
  h2{font-size:14px;margin:16px 0 8px}
  .foot{margin-top:18px;font-size:10px;color:#777;text-align:center;border-top:1px solid #ddd;padding-top:8px}
  @media print{body{padding:8px}@page{margin:10mm}}
</style></head><body>
  <h1>🥛 ${esc(t('pdf.title'))}</h1>
  <div class="sub">
    <strong style="font-size:13px;color:#111">${esc(displayName)}</strong>${cloudUser?.email ? `<br><span style="color:#666">${esc(cloudUser.email)}</span>` : ''}<br>
    ${esc(t('entry.date'))}: ${fmtDate(fromDate)} — ${fmtDate(toDate)}
  </div>

  <div class="grid">
    <div class="box"><div class="lbl">${esc(t('stats.totalMilk'))}</div><div class="val">${grandTotal.toFixed(1)} L</div></div>
    <div class="box"><div class="lbl">${esc(t('stats.totalEntries'))}</div><div class="val">${filtered.length}</div></div>
    ${showMoney ? `<div class="box"><div class="lbl">${esc(t('stats.totalMoney'))}</div><div class="val">₹${totalPaisa.toFixed(0)}</div></div>` : ''}
    <div class="box"><div class="lbl">🐄 ${esc(t('common.gaay'))}</div><div class="val">${gaayTotal.toFixed(1)} L</div></div>
    <div class="box"><div class="lbl">🐃 ${esc(t('common.bhains'))}</div><div class="val">${bhainsTotal.toFixed(1)} L</div></div>
    ${showMoney ? `<div class="box"><div class="lbl">➖ ${esc(t('stats.deductions'))}</div><div class="val">₹${dedTotal.toFixed(0)}</div></div>` : ''}
    ${showMoney ? `<div class="box"><div class="lbl">💰 ${esc(t('stats.netPayable'))}</div><div class="val">₹${netPayable.toFixed(0)}</div></div>` : ''}
  </div>

  <h2>${esc(t('pdf.dayWise'))}</h2>
  <table>
    <thead><tr>
      <th>${esc(t('entry.date'))}</th>
      <th>${esc(t('home.morning'))}</th>
      <th>${esc(t('home.evening'))}</th>
      <th>${esc(t('pdf.total'))}</th>
      ${showMoney ? `<th>${esc(t('pdf.money'))}</th>` : ''}
    </tr></thead>
    <tbody>${dayRows}</tbody>
    <tfoot><tr>
      <td>${esc(t('pdf.total'))}</td>
      <td>${dates.reduce((a, d) => a + byDate.get(d)!.m, 0).toFixed(1)}</td>
      <td>${dates.reduce((a, d) => a + byDate.get(d)!.e, 0).toFixed(1)}</td>
      <td>${grandTotal.toFixed(1)}</td>
      ${showMoney ? `<td>₹${totalPaisa.toFixed(0)}</td>` : ''}
    </tr></tfoot>
  </table>

  ${dedTotal > 0 ? `<h2>${esc(t('stats.deductions'))}</h2>
  <table>
    <thead><tr><th>${esc(t('entry.date'))}</th><th>${esc(t('set.dedKind'))}</th><th>${esc(t('set.dedNote'))}</th><th>${esc(t('pdf.money'))}</th></tr></thead>
    <tbody>
      ${deductions
        .map(
          (d) =>
            `<tr><td>${fmtDate(d.date)}</td><td>${esc(d.kind === 'advance' ? t('set.dedAdvance') : d.kind === 'aahar' ? t('set.dedAahar') : t('set.dedOther'))}</td><td>${esc(d.note || '-')}</td><td>₹${d.amount.toFixed(0)}</td></tr>`,
        )
        .join('')}
    </tbody>
    <tfoot><tr><td colspan="3">${esc(t('set.dedTotal'))}</td><td>₹${dedTotal.toFixed(0)}</td></tr></tfoot>
  </table>` : ''}

  ${animalRows}

  <div class="foot">
    ${esc(t('pdf.madeOn'))}: ${fmtDate(todayStr())} ${new Date().toLocaleTimeString()} · Doodh Tracker
  </div>
</body></html>`

    const w = window.open('', '_blank')
    if (!w) {
      alert(t('pdf.popup'))
      return
    }
    w.document.write(html)
    w.document.close()
    w.focus()
    setTimeout(() => {
      try {
        w.print()
      } catch {
        /* user can press print manually */
      }
    }, 500)
  }

  return (
    <div className="space-y-4">
      <div className="bg-emerald-900/50 rounded-xl p-3 border border-emerald-800">
        <div className="flex items-center gap-2 mb-2"><Filter className="text-emerald-300" size={16} /><h3 className="text-white font-bold text-sm">{t('stats.dateFilter')}</h3></div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-emerald-300 text-xs block mb-1">{t('stats.from')}</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
              className="w-full bg-emerald-950/60 text-white border border-emerald-700 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-amber-400" />
          </div>
          <div>
            <label className="text-emerald-300 text-xs block mb-1">{t('stats.to')}</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
              className="w-full bg-emerald-950/60 text-white border border-emerald-700 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-amber-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-emerald-900/50 rounded-xl p-3 border border-emerald-800 text-center"><p className="text-emerald-300 text-xs">{t('stats.totalMilk')}</p><p className="text-amber-300 text-2xl font-bold">{grandTotal.toFixed(1)} L</p></div>
        <div className="bg-emerald-900/50 rounded-xl p-3 border border-emerald-800 text-center"><p className="text-emerald-300 text-xs">{t('stats.totalEntries')}</p><p className="text-white text-2xl font-bold">{filtered.length}</p></div>
      </div>

      {(rates.gaay > 0 || rates.bhains > 0) && (
        <div className="bg-green-950/40 rounded-xl p-3 border border-green-800/30 text-center">
          <p className="text-green-300 text-xs">💰 {t('stats.totalMoney')} ({fmtDate(fromDate)} - {fmtDate(toDate)})</p>
          <p className="text-green-300 text-2xl font-bold">₹{totalPaisa.toFixed(2)}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {showMoney && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-amber-950/40 rounded-xl p-3 border border-amber-800/30 text-center">
            <p className="text-amber-300 text-xs">➖ {t('stats.deductions')}</p>
            <p className="text-amber-300 text-xl font-bold">₹{dedTotal.toFixed(0)}</p>
          </div>
          <div className="bg-emerald-950/60 rounded-xl p-3 border border-emerald-700 text-center">
            <p className="text-emerald-300 text-xs">💰 {t('stats.netPayable')}</p>
            <p className={`text-xl font-bold ${netPayable < 0 ? 'text-red-300' : 'text-green-300'}`}>₹{netPayable.toFixed(0)}</p>
          </div>
        </div>
      )}

      <button onClick={handlePDF} className="w-full bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
          <FileText size={20} /> {t('pdf.btn')}
        </button>
        <button onClick={handleWhatsApp} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
          <MessageCircle size={20} /> {t('wa.btn')}
        </button>
        <button onClick={handleExport} className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
          <Download size={20} /> {t('stats.export')}
        </button>
      </div>
      <p className="text-emerald-300 text-sm text-center -mt-1">{t('pdf.printHint')}</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-amber-950/40 rounded-xl p-3 border border-amber-800/30 text-center"><p className="text-amber-300 text-xs">🐄 {t('common.gaay')}</p><p className="text-white text-xl font-bold">{gaayTotal.toFixed(1)} L</p></div>
        <div className="bg-blue-950/40 rounded-xl p-3 border border-blue-800/30 text-center"><p className="text-blue-300 text-xs">🐃 {t('common.bhains')}</p><p className="text-white text-xl font-bold">{bhainsTotal.toFixed(1)} L</p></div>
      </div>

      <div className="bg-emerald-900/40 rounded-2xl p-4 border border-emerald-800"><h3 className="text-white font-bold text-sm mb-3">📊 {t('stats.weekChart')}</h3><BarChart data={weekData} /></div>
      <div className="bg-emerald-900/40 rounded-2xl p-4 border border-emerald-800"><h3 className="text-white font-bold text-sm mb-3">🥧 {t('stats.pie')}</h3><PieChart gaay={gaayTotal} bhains={bhainsTotal} /></div>

      <div className="bg-emerald-900/40 rounded-2xl p-4 border border-emerald-800">
        <h3 className="text-white font-bold text-sm mb-3">🐄 {t('stats.animalWise')}</h3>
        {animals.length === 0 ? (
          <p className="text-emerald-300 text-sm text-center py-2">{t('stats.noData')}</p>
        ) : (
          <div className="space-y-2">
            {animals.map((a, i) => (
              <div key={i} className="flex items-center justify-between bg-emerald-950/40 rounded-lg p-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{a.type === 'gaay' ? '🐄' : '🐃'}</span>
                  <div>
                    <p className="text-white text-sm font-semibold">{a.name}</p>
                    <p className="text-emerald-300 text-xs">{a.entries} {t('stats.entriesWord')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-amber-300 font-bold">{a.totalLiters.toFixed(1)} L</p>
                  {(rates.gaay > 0 || rates.bhains > 0 || (rates.gaayFat || 0) > 0 || (rates.bhainsFat || 0) > 0) && (
                    <p className="text-green-300 text-xs">₹{(a.totalAmount || 0).toFixed(0)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
