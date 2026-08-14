import { useEntries, last7Days, typeTotal, fmtDate } from '../store'

function BarChart({ data }: { data: { day: string; Subah: number; Shaam: number }[] }) {
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
      <div className="flex gap-4 mt-1 text-xs"><span className="text-amber-300">■ Subah</span><span className="text-blue-400">■ Shaam</span></div>
    </div>
  )
}

function PieChart({ gaay, bhains }: { gaay: number; bhains: number }) {
  const total = gaay + bhains || 1, gaayPct = (gaay / total) * 100, bhainsPct = (bhains / total) * 100, r = 55, cx = 60, cy = 60, circ = 2 * Math.PI * r
  return (
    <div className="flex items-center gap-4">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f59e0b" strokeWidth="18" strokeDasharray={`${(gaayPct / 100) * circ} ${circ}`} strokeDashoffset="0" transform={`rotate(-90 ${cx} ${cy})`} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#3b82f6" strokeWidth="18" strokeDasharray={`${(bhainsPct / 100) * circ} ${circ}`} strokeDashoffset={`${-(gaayPct / 100) * circ}`} transform={`rotate(-90 ${cx} ${cy})`} />
      </svg>
      <div className="space-y-2">
        <div className="flex items-center gap-2"><span className="w-3 h-3 bg-amber-500 rounded inline-block" /><span className="text-white text-sm">🐄 Gaay: <b>{gaay}L</b> ({gaayPct.toFixed(0)}%)</span></div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 bg-blue-500 rounded inline-block" /><span className="text-white text-sm">🐃 Bhains: <b>{bhains}L</b> ({bhainsPct.toFixed(0)}%)</span></div>
      </div>
    </div>
  )
}

export default function StatsTab() {
  const entries = useEntries()
  if (entries.length === 0) {
    return (<div className="bg-emerald-900/40 rounded-xl p-6 text-center border border-emerald-800"><p className="text-emerald-400 text-sm">📊 Abhi koi data nahi. Pehle entries add karo!</p></div>)
  }
  const week = last7Days()
  const weekData = week.map((d) => {
    const morning = entries.filter((e) => e.date === d && e.session === 'morning').reduce((s, e) => s + e.liters, 0)
    const evening = entries.filter((e) => e.date === d && e.session === 'evening').reduce((s, e) => s + e.liters, 0)
    return { day: fmtDate(d).slice(0, 5), Subah: morning, Shaam: evening }
  })
  const gaayTotal = typeTotal(entries, 'gaay'), bhainsTotal = typeTotal(entries, 'bhains')
  const grandTotal = entries.reduce((s, e) => s + e.liters, 0)
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-emerald-900/50 rounded-xl p-3 border border-emerald-800 text-center"><p className="text-emerald-400 text-xs">Kul Doodh</p><p className="text-amber-300 text-2xl font-bold">{grandTotal} L</p></div>
        <div className="bg-emerald-900/50 rounded-xl p-3 border border-emerald-800 text-center"><p className="text-emerald-400 text-xs">Kul Entries</p><p className="text-white text-2xl font-bold">{entries.length}</p></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-amber-950/40 rounded-xl p-3 border border-amber-800/30 text-center"><p className="text-amber-300 text-xs">🐄 Gaay</p><p className="text-white text-xl font-bold">{gaayTotal} L</p></div>
        <div className="bg-blue-950/40 rounded-xl p-3 border border-blue-800/30 text-center"><p className="text-blue-300 text-xs">🐃 Bhains</p><p className="text-white text-xl font-bold">{bhainsTotal} L</p></div>
      </div>
      <div className="bg-emerald-900/40 rounded-2xl p-4 border border-emerald-800"><h3 className="text-white font-bold text-sm mb-3">📊 Pichhle 7 Din — Subah vs Shaam</h3><BarChart data={weekData} /></div>
      <div className="bg-emerald-900/40 rounded-2xl p-4 border border-emerald-800"><h3 className="text-white font-bold text-sm mb-3">🥧 Gaay vs Bhains</h3><PieChart gaay={gaayTotal} bhains={bhainsTotal} /></div>
    </div>
  )
}
