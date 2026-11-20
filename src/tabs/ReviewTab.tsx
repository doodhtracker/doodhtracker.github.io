import { useState } from 'react'
import { useStore, useReviews } from '../store'
import { Star, Send, Trash2, MessageSquare, Lightbulb, Mail } from 'lucide-react'
import { useT } from '../i18n'

const OWNER_EMAIL = 'sheebu.in@gmail.com'

function fmtWhen(ts: number): string {
  const d = new Date(ts)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${dd}/${mm}/${d.getFullYear()} · ${hh}:${mi}`
}

export default function ReviewTab() {
  const reviews = useReviews()
  const addReview = useStore((s) => s.addReview)
  const removeReview = useStore((s) => s.removeReview)
  const t = useT()

  const [name, setName] = useState('')
  const [rating, setRating] = useState(0)
  const [problem, setProblem] = useState('')
  const [suggestion, setSuggestion] = useState('')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const inputCls =
    'w-full bg-emerald-950/60 text-white border border-emerald-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400 placeholder:text-emerald-500'

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!problem.trim() && !suggestion.trim()) {
      setError(t('rev.errEmpty'))
      return
    }
    addReview({
      name: name.trim() || t('rev.anon'),
      rating,
      problem: problem.trim(),
      suggestion: suggestion.trim(),
    })
    setName('')
    setRating(0)
    setProblem('')
    setSuggestion('')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function shareToOwner() {
    const lines: string[] = []
    lines.push('Doodh Tracker — Review')
    lines.push('')
    if (reviews.length === 0) {
      lines.push(t('rev.noneWritten'))
    } else {
      reviews.forEach((r, i) => {
        lines.push(`${i + 1}. ${r.name} — ${r.rating > 0 ? r.rating + '/5' : t('rev.noRating')}`)
        if (r.problem) lines.push(`   ${t('rev.lblProblem')}: ${r.problem}`)
        if (r.suggestion) lines.push(`   ${t('rev.lblSuggestion')}: ${r.suggestion}`)
        lines.push(`   (${fmtWhen(r.createdAt)})`)
        lines.push('')
      })
    }
    const subject = encodeURIComponent('Doodh Tracker — Review / Feedback')
    const body = encodeURIComponent(lines.join('\n'))
    window.location.href = `mailto:${OWNER_EMAIL}?subject=${subject}&body=${body}`
  }

  return (
    <div className="space-y-4">
      <div className="bg-emerald-900/50 rounded-2xl p-4 border border-emerald-800">
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare className="text-amber-300" size={18} />
          <h3 className="text-white font-bold text-sm">📝 {t('rev.title')}</h3>
        </div>
        <p className="text-emerald-300 text-xs mb-3">{t('rev.sub')}</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-emerald-300 text-xs font-semibold block mb-1">{t('rev.name')}</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('rev.namePh')} className={inputCls} />
          </div>

          <div>
            <label className="text-emerald-300 text-xs font-semibold block mb-1">{t('rev.rating')}</label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setRating(rating === n ? 0 : n)} className="p-0.5" title={`${n}/5`}>
                  <Star size={26} className={n <= rating ? 'text-amber-400' : 'text-emerald-300'} fill={n <= rating ? 'currentColor' : 'none'} />
                </button>
              ))}
              {rating > 0 && <span className="text-amber-300 text-xs font-semibold ml-1">{rating}/5</span>}
            </div>
          </div>

          <div>
            <label className="text-emerald-300 text-xs font-semibold block mb-1">{t('rev.problem')}</label>
            <textarea value={problem} onChange={(e) => setProblem(e.target.value)} rows={3} placeholder={t('rev.problemPh')} className={`${inputCls} resize-none`} />
          </div>

          <div>
            <label className="text-emerald-300 text-xs font-semibold block mb-1">{t('rev.suggestion')}</label>
            <textarea value={suggestion} onChange={(e) => setSuggestion(e.target.value)} rows={3} placeholder={t('rev.suggestionPh')} className={`${inputCls} resize-none`} />
          </div>

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}

          <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
            <Send size={18} /> {saved ? `✅ ${t('rev.saved')}` : t('rev.submit')}
          </button>
        </form>
      </div>

      <div className="bg-emerald-900/50 rounded-2xl p-4 border border-emerald-800">
        <div className="flex items-center gap-2 mb-2">
          <Mail className="text-amber-300" size={18} />
          <h3 className="text-white font-bold text-sm">📤 {t('rev.shareTitle')}</h3>
        </div>
        <p className="text-emerald-300 text-xs mb-3">{t('rev.shareSub')}</p>
        <button onClick={shareToOwner} disabled={reviews.length === 0}
          className="w-full bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
          <Mail size={18} /> {t('rev.shareBtn')} ({reviews.length})
        </button>
      </div>

      <div>
        <h3 className="text-emerald-300 text-xs font-semibold uppercase mb-2">{t('rev.thisDevice')} ({reviews.length})</h3>
        {reviews.length === 0 ? (
          <div className="bg-emerald-900/40 rounded-xl p-5 text-center border border-emerald-800">
            <Lightbulb className="text-emerald-300 mx-auto mb-2" size={22} />
            <p className="text-emerald-300 text-sm">{t('rev.empty')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {reviews.map((r) => (
              <div key={r.id} className="bg-emerald-900/40 rounded-xl p-3 border border-emerald-800">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{r.name}</p>
                    <p className="text-emerald-300 text-sm">{fmtWhen(r.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {r.rating > 0 && (
                      <span className="flex items-center gap-0.5 text-amber-400 text-xs font-bold">
                        {r.rating}
                        <Star size={12} fill="currentColor" />
                      </span>
                    )}
                    <button onClick={() => removeReview(r.id)} className="text-red-300 hover:text-red-400 transition-colors ml-1" title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                {r.problem && (
                  <p className="text-emerald-300 text-xs mt-2">
                    <span className="text-emerald-300 font-semibold">{t('rev.lblProblem')}: </span>
                    {r.problem}
                  </p>
                )}
                {r.suggestion && (
                  <p className="text-emerald-300 text-xs mt-1">
                    <span className="text-emerald-300 font-semibold">{t('rev.lblSuggestion')}: </span>
                    {r.suggestion}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
