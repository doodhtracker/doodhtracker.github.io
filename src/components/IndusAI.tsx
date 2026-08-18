import { useState, useMemo } from 'react'
import { useEntries, useRates } from '../store'
import { analyzeData } from '../ai/indus'
import { Sparkles, X, TrendingUp, TrendingDown, Minus, Brain, Zap } from 'lucide-react'

export default function IndusAI() {
  const [open, setOpen] = useState(false)
  const entries = useEntries()
  const rates = useRates()

  const report = useMemo(() => analyzeData(entries, rates), [entries, rates])

  const trendIcon = report.trend === 'up' ? <TrendingUp size={16} className="text-green-400" />
    : report.trend === 'down' ? <TrendingDown size={16} className="text-red-400" />
    : <Minus size={16} className="text-amber-400" />

  const healthColor = report.healthScore >= 70 ? 'text-green-400'
    : report.healthScore >= 40 ? 'text-amber-400' : 'text-red-400'

  const healthBg = report.healthScore >= 70 ? 'from-green-500 to-emerald-600'
    : report.healthScore >= 40 ? 'from-amber-500 to-orange-600' : 'from-red-500 to-rose-600'

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-20 right-4 z-50 flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white px-4 py-2.5 rounded-full shadow-lg shadow-violet-900/50 transition-all active:scale-95"
        >
          <Sparkles size={18} className="animate-pulse" />
          <span className="text-sm font-bold">Indus AI</span>
          {entries.length > 0 && (
            <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">{report.insights.length}</span>
          )}
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />
          <div
            className="relative w-full max-h-[85vh] overflow-y-auto bg-gradient-to-b from-zinc-900 to-zinc-950 rounded-t-3xl border-t border-violet-800/50 shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-b from-zinc-900 to-zinc-900/95 backdrop-blur px-4 pt-3 pb-2 border-b border-zinc-800 z-10">
              <div className="w-12 h-1.5 bg-zinc-700 rounded-full mx-auto mb-3" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 flex items-center justify-center">
                    <Brain size={18} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-base flex items-center gap-1.5">
                      Indus AI
                      <span className="text-[10px] bg-violet-600/30 text-violet-300 px-1.5 py-0.5 rounded-full font-medium">LIVE</span>
                    </h2>
                    <p className="text-zinc-500 text-[10px]">{report.summary}</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="text-zinc-500 hover:text-white p-1.5 rounded-full hover:bg-zinc-800 transition-colors">
                  <X size={20} />
                </button>
              </div>

              {entries.length > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-zinc-400 text-xs font-medium">Farm Health Score</span>
                    <span className={`text-sm font-bold ${healthColor}`}>{report.healthScore}/100</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${healthBg} rounded-full transition-all duration-500`}
                      style={{ width: `${report.healthScore}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 space-y-3">
              {entries.length > 0 && (
                <div className="bg-violet-950/30 border border-violet-800/30 rounded-xl p-3 mb-2">
                  <div className="flex items-start gap-2">
                    <Zap size={16} className="text-violet-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-violet-300 text-xs font-semibold uppercase tracking-wide mb-0.5">AI Prediction</p>
                      <p className="text-white text-sm">{report.prediction}</p>
                    </div>
                  </div>
                </div>
              )}

              {report.insights.map((insight, i) => {
                const bgClass = insight.type === 'success' ? 'bg-green-950/30 border-green-800/30'
                  : insight.type === 'warning' ? 'bg-red-950/30 border-red-800/30'
                  : insight.type === 'prediction' ? 'bg-violet-950/30 border-violet-800/30'
                  : insight.type === 'tip' ? 'bg-blue-950/30 border-blue-800/30'
                  : 'bg-zinc-900/50 border-zinc-800'
                const titleColor = insight.type === 'success' ? 'text-green-300'
                  : insight.type === 'warning' ? 'text-red-300'
                  : insight.type === 'prediction' ? 'text-violet-300'
                  : insight.type === 'tip' ? 'text-blue-300'
                  : 'text-zinc-300'
                return (
                  <div key={i} className={`${bgClass} border rounded-xl p-3`}>
                    <div className="flex items-start gap-2.5">
                      <span className="text-xl shrink-0">{insight.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <p className={`${titleColor} text-sm font-bold`}>{insight.title}</p>
                          {insight.type === 'success' && trendIcon}
                        </div>
                        <p className="text-zinc-400 text-xs leading-relaxed">{insight.message}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="sticky bottom-0 bg-zinc-950/90 backdrop-blur border-t border-zinc-800 px-4 py-2.5">
              <p className="text-center text-zinc-600 text-[10px]">
                Indus AI · Data本地分析 · Privacy 100% secure
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
