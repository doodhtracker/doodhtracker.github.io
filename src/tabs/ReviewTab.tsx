import { useState } from 'react'
import { useStore, useReviews } from '../store'
import { Star, Send, Trash2, MessageSquare, Lightbulb, Mail } from 'lucide-react'

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

  const [name, setName] = useState('')
  const [rating, setRating] = useState(0)
  const [problem, setProblem] = useState('')
  const [suggestion, setSuggestion] = useState('')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const inputCls =
    'w-full bg-emerald-950/60 text-white border border-emerald-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400 placeholder:text-emerald-700'

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!problem.trim() && !suggestion.trim()) {
      setError('Kam se kam ek baat likho — problem ya suggestion')
      return
    }
    addReview({
      name: name.trim() || 'Anonymous',
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
      lines.push('(abhi koi review nahi likha)')
    } else {
      reviews.forEach((r, i) => {
        lines.push(`${i + 1}. ${r.name} — ${r.rating > 0 ? r.rating + '/5 star' : 'rating nahi diya'}`)
        if (r.problem) lines.push(`   Problem: ${r.problem}`)
        if (r.suggestion) lines.push(`   Suggestion: ${r.suggestion}`)
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
          <h3 className="text-white font-bold text-sm">📝 Apna Review Likho</h3>
        </div>
        <p className="text-emerald-500 text-xs mb-3">
          Koi problem aa rahi hai? Kya aur add hona chahiye? Yahan likho.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-emerald-400 text-xs font-semibold block mb-1">Tumhara naam (optional)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="jaise: Ramesh"
              className={inputCls}
            />
          </div>

          <div>
            <label className="text-emerald-400 text-xs font-semibold block mb-1">Rating</label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(rating === n ? 0 : n)}
                  className="p-0.5"
                  title={`${n} star`}
                >
                  <Star
                    size={26}
                    className={n <= rating ? 'text-amber-400' : 'text-emerald-700'}
                    fill={n <= rating ? 'currentColor' : 'none'}
                  />
                </button>
              ))}
              {rating > 0 && <span className="text-amber-300 text-xs font-semibold ml-1">{rating}/5</span>}
            </div>
          </div>

          <div>
            <label className="text-emerald-400 text-xs font-semibold block mb-1">
              Kya problem hai?
            </label>
            <textarea
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              rows={3}
              placeholder="jaise: entry save nahi ho rahi, ya rate galat dikh raha hai..."
              className={`${inputCls} resize-none`}
            />
          </div>

          <div>
            <label className="text-emerald-400 text-xs font-semibold block mb-1">
              Kya aur add hona chahiye?
            </label>
            <textarea
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              rows={3}
              placeholder="jaise: mahine ka PDF report, ya dudhiya mode..."
              className={`${inputCls} resize-none`}
            />
          </div>

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}

          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Send size={18} /> {saved ? '✅ Review save ho gaya!' : 'Review Submit Karo'}
          </button>
        </form>
      </div>

      <div className="bg-emerald-900/50 rounded-2xl p-4 border border-emerald-800">
        <div className="flex items-center gap-2 mb-2">
          <Mail className="text-amber-300" size={18} />
          <h3 className="text-white font-bold text-sm">📤 Review Developer ko Bhejo</h3>
        </div>
        <p className="text-emerald-500 text-xs mb-3">
          Review is phone pe save hota hai. Developer tak pahunchane ke liye neeche wala button dabao —
          tumhara email app khulega, review pehle se likha hoga, bas Send dabana hai.
        </p>
        <button
          onClick={shareToOwner}
          disabled={reviews.length === 0}
          className="w-full bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <Mail size={18} /> Email se bhejo ({reviews.length})
        </button>
      </div>

      <div>
        <h3 className="text-emerald-400 text-xs font-semibold uppercase mb-2">
          Is device ke Reviews ({reviews.length})
        </h3>
        {reviews.length === 0 ? (
          <div className="bg-emerald-900/40 rounded-xl p-5 text-center border border-emerald-800">
            <Lightbulb className="text-emerald-600 mx-auto mb-2" size={22} />
            <p className="text-emerald-500 text-sm">
              Abhi koi review nahi. Upar form bhar ke pehla review likho!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {reviews.map((r) => (
              <div key={r.id} className="bg-emerald-900/40 rounded-xl p-3 border border-emerald-800">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{r.name}</p>
                    <p className="text-emerald-600 text-[11px]">{fmtWhen(r.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {r.rating > 0 && (
                      <span className="flex items-center gap-0.5 text-amber-400 text-xs font-bold">
                        {r.rating}
                        <Star size={12} fill="currentColor" />
                      </span>
                    )}
                    <button
                      onClick={() => removeReview(r.id)}
                      className="text-red-400/70 hover:text-red-400 transition-colors ml-1"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                {r.problem && (
                  <p className="text-emerald-300 text-xs mt-2">
                    <span className="text-emerald-500 font-semibold">Problem: </span>
                    {r.problem}
                  </p>
                )}
                {r.suggestion && (
                  <p className="text-emerald-300 text-xs mt-1">
                    <span className="text-emerald-500 font-semibold">Suggestion: </span>
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
