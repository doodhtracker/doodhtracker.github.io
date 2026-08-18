// Indus AI — Smart Milk Analytics Engine
// Background mein lagatar data analyze karta hai
// Insights, predictions, anomaly detection, trends deta hai

import type { MilkEntry, Rates } from '../types'

export interface Insight {
  type: 'success' | 'warning' | 'info' | 'prediction' | 'tip'
  icon: string
  title: string
  message: string
  priority: number
}

export interface AIReport {
  insights: Insight[]
  summary: string
  healthScore: number
  trend: 'up' | 'down' | 'stable'
  prediction: string
}

// ─── Helper Functions ───

function avg(arr: number[]): number {
  if (arr.length === 0) return 0
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

function groupByDate(entries: MilkEntry[]): Record<string, MilkEntry[]> {
  const map: Record<string, MilkEntry[]> = {}
  for (const e of entries) {
    if (!map[e.date]) map[e.date] = []
    map[e.date].push(e)
  }
  return map
}

function lastNDates(n: number): string[] {
  const out: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
  }
  return out
}

function dateTotal(entries: MilkEntry[], date: string): number {
  return entries.filter((e) => e.date === date).reduce((s, e) => s + e.liters, 0)
}

// ─── Main AI Analysis Function ───

export function analyzeData(entries: MilkEntry[], rates: Rates): AIReport {
  const insights: Insight[] = []

  if (entries.length === 0) {
    return {
      insights: [{
        type: 'info',
        icon: '🥛',
        title: 'Indus AI Ready',
        message: 'Pehli entry karo — Indus AI turant analysis shuru karega. Tumhara doodh pattern samjhega aur smart tips dega.',
        priority: 0,
      }],
      summary: 'Abhi koi data nahi — entry karo aur AI analysis shuru karega',
      healthScore: 0,
      trend: 'stable',
      prediction: 'Data collect ho raha hai',
    }
  }

  const byDate = groupByDate(entries)
  const dates = Object.keys(byDate).sort()
  const last7 = lastNDates(7)
  const last30 = lastNDates(30)

  const dailyTotals7 = last7.map((d) => dateTotal(entries, d))
  const dailyTotals30 = last30.map((d) => dateTotal(entries, d))

  const weekTotal = dailyTotals7.reduce((a, b) => a + b, 0)
  const avgDaily = avg(dailyTotals7.filter((v) => v > 0))

  // ─── 1. TREND ANALYSIS ───
  const recent3 = dailyTotals7.slice(-3).filter((v) => v > 0)
  const prev3 = dailyTotals7.slice(0, 3).filter((v) => v > 0)
  const recentAvg = avg(recent3)
  const prevAvg = avg(prev3)

  let trend: 'up' | 'down' | 'stable' = 'stable'
  let trendPct = 0

  if (recentAvg > 0 && prevAvg > 0) {
    trendPct = ((recentAvg - prevAvg) / prevAvg) * 100
    if (trendPct > 10) trend = 'up'
    else if (trendPct < -10) trend = 'down'
  }

  if (trend === 'up' && trendPct > 0) {
    insights.push({
      type: 'success',
      icon: '📈',
      title: 'Production Badh Raha Hai',
      message: `Pichhle 3 din ka average ${recentAvg.toFixed(1)}L hai — pichhle week ke mukable ${trendPct.toFixed(0)}% zyada. Bahut accha chal raha hai!`,
      priority: 10,
    })
  } else if (trend === 'down' && trendPct < 0) {
    insights.push({
      type: 'warning',
      icon: '📉',
      title: 'Dhyan Do — Production Gir Raha Hai',
      message: `Pichhle 3 din ka average ${recentAvg.toFixed(1)}L hai — pichhle week se ${Math.abs(trendPct).toFixed(0)}% kam ho gaya. Janwar ki sehat, chara, ya mausam check karo.`,
      priority: 9,
    })
  } else {
    insights.push({
      type: 'info',
      icon: '➡️',
      title: 'Stable Production',
      message: `Doodh production stable hai — average ${avgDaily.toFixed(1)}L/day. Ek consistent routine hai.`,
      priority: 5,
    })
  }

  // ─── 2. MORNING vs EVENING ANALYSIS ───
  const morningTotal = entries.filter((e) => e.session === 'morning').reduce((s, e) => s + e.liters, 0)
  const eveningTotal = entries.filter((e) => e.session === 'evening').reduce((s, e) => s + e.liters, 0)
  const totalMilk = morningTotal + eveningTotal || 1
  const morningPct = (morningTotal / totalMilk) * 100
  const eveningPct = (eveningTotal / totalMilk) * 100

  if (morningTotal > 0 || eveningTotal > 0) {
    const dominant = morningPct > eveningPct ? 'subah' : 'shaam'
    const dominantPct = Math.max(morningPct, eveningPct)
    insights.push({
      type: 'info',
      icon: dominant === 'subah' ? '🌅' : '🌇',
      title: `${dominant === 'subah' ? 'Subah' : 'Shaam'} Ka Doodh Zyada`,
      message: `Subah: ${morningTotal.toFixed(1)}L (${morningPct.toFixed(0)}%) · Shaam: ${eveningTotal.toFixed(1)}L (${eveningPct.toFixed(0)}%). ${dominant === 'subah' ? 'Subah' : 'Shaam'} ka production ${dominantPct.toFixed(0)}% hai.`,
      priority: 4,
    })
  }

  // ─── 3. GAAY vs BHAINS ANALYSIS ───
  const gaayEntries = entries.filter((e) => e.animalType === 'gaay')
  const bhainsEntries = entries.filter((e) => e.animalType === 'bhains')
  const gaayTotal = gaayEntries.reduce((s, e) => s + e.liters, 0)
  const bhainsTotal = bhainsEntries.reduce((s, e) => s + e.liters, 0)

  if (gaayEntries.length > 0 && bhainsEntries.length > 0) {
    const gaayDays = new Set(gaayEntries.map((e) => e.date)).size || 1
    const bhainsDays = new Set(bhainsEntries.map((e) => e.date)).size || 1
    const gaayAvg = gaayTotal / gaayDays
    const bhainsAvg = bhainsTotal / bhainsDays
    const better = gaayAvg > bhainsAvg ? 'Gaay' : 'Bhains'
    insights.push({
      type: 'info',
      icon: better === 'Gaay' ? '🐄' : '🐃',
      title: `${better} Zyada Doodh Deti Hai`,
      message: `Gaay avg: ${gaayAvg.toFixed(1)}L/day · Bhains avg: ${bhainsAvg.toFixed(1)}L/day. ${better} ka production zyada hai.`,
      priority: 6,
    })
  }

  // ─── 4. PREDICTION (Next Week) ───
  let prediction = ''
  if (dailyTotals7.filter((v) => v > 0).length >= 3) {
    const predictedWeek = avgDaily * 7
    prediction = `Agle 7 din mein estimated ~${predictedWeek.toFixed(0)}L doodh`

    if (rates.gaay > 0 || rates.bhains > 0) {
      const avgRate = (rates.gaay + rates.bhains) / 2 || rates.gaay || rates.bhains
      const predictedPaisa = predictedWeek * avgRate
      prediction += ` aur ~₹${predictedPaisa.toFixed(0)} paisa`
    }

    insights.push({
      type: 'prediction',
      icon: '🔮',
      title: 'Agle Hafta Prediction',
      message: prediction + `. Yeh prediction pichhle 7 din ke average par based hai.`,
      priority: 8,
    })
  }

  // ─── 5. ANOMALY DETECTION ───
  const validDaily = dailyTotals7.filter((v) => v > 0)
  if (validDaily.length >= 3) {
    const mean = avg(validDaily)
    const variance = avg(validDaily.map((v) => (v - mean) ** 2))
    const stdDev = Math.sqrt(variance)

    for (let i = 0; i < 7; i++) {
      const d = last7[i]
      const val = dailyTotals7[i]
      if (val === 0 && i < 6) {
        const dayName = ['Ravivar', 'Somvar', 'Mangalvar', 'Budhvar', 'Guruvar', 'Shukravar', 'Shanivar'][new Date(d).getDay()]
        insights.push({
          type: 'warning',
          icon: '⚠️',
          title: `${dayName} — Koi Entry Nahi`,
          message: `${d} ko koi doodh entry nahi mili. Entry karna bhul gaye? Data complete rakho taaki analysis sahi rahe.`,
          priority: 7,
        })
      } else if (stdDev > 0 && val > 0) {
        const zScore = (val - mean) / stdDev
        if (zScore > 1.5) {
          insights.push({
            type: 'success',
            icon: '⭐',
            title: 'Din ka Record!',
            message: `${d} ko ${val.toFixed(1)}L doodh — average se ${zScore.toFixed(1)} std dev zyada! Kya accha hua us din?`,
            priority: 6,
          })
        } else if (zScore < -1.5) {
          insights.push({
            type: 'warning',
            icon: '🔍',
            title: 'Kam Doodh Din',
            message: `${d} ko sirf ${val.toFixed(1)}L — normal se kam. Janwar beemar thi? Chara kam tha? Wajah dhundo.`,
            priority: 7,
          })
        }
      }
    }
  }

  // ─── 6. PAISA INSIGHTS ───
  if (rates.gaay > 0 || rates.bhains > 0) {
    const totalPaisa = entries.reduce((s, e) => {
      const rate = e.animalType === 'gaay' ? rates.gaay : rates.bhains
      return s + e.liters * rate
    }, 0)

    const dailyPaisa = totalPaisa / (dates.length || 1)

    insights.push({
      type: 'success' as const,
      icon: '💰',
      title: 'Paisa Hisaab',
      message: `Total kamai: ₹${totalPaisa.toFixed(0)} · Roz avg: ₹${dailyPaisa.toFixed(0)} · ${dates.length} din ka data. Mahine ka estimated: ₹${(dailyPaisa * 30).toFixed(0)}`,
      priority: 5,
    })

    if (rates.gaay > 0 && rates.bhains > 0 && rates.gaay !== rates.bhains) {
      const betterRate = rates.gaay > rates.bhains ? 'gaay' : 'bhains'
      insights.push({
        type: 'tip',
        icon: '💡',
        title: 'Rate Tip',
        message: `${betterRate === 'gaay' ? 'Gaay' : 'Bhains'} ka rate zyada hai (₹${betterRate === 'gaay' ? rates.gaay : rates.bhains}/L). Agar ${betterRate === 'gaay' ? 'bhains' : 'gaay'} ka production badha sakte ho, toh kamai zyada hogi.`,
        priority: 3,
      })
    }
  }

  // ─── 7. CONSISTENCY SCORE ───
  let healthScore = 0
  if (entries.length > 0) {
    const consistencyDays = dailyTotals7.filter((v) => v > 0).length
    const consistencyScore = (consistencyDays / 7) * 30
    const volumeScore = Math.min(avgDaily / 20, 1) * 30
    const dataScore = Math.min(entries.length / 30, 1) * 20
    const ratesScore = (rates.gaay > 0 || rates.bhains > 0) ? 20 : 0
    healthScore = Math.round(consistencyScore + volumeScore + dataScore + ratesScore)
  }

  // ─── 8. SMART TIPS ───
  if (entries.length < 7) {
    insights.push({
      type: 'tip',
      icon: '📝',
      title: 'Data Collect Karo',
      message: `Abhi sirf ${entries.length} entries hain. Kam se kam 7 din ka data chaahiye taaki Indus AI sahi patterns dikhaye. Roz entry karo!`,
      priority: 2,
    })
  }

  if (rates.gaay === 0 && rates.bhains === 0) {
    insights.push({
      type: 'tip',
      icon: '⚙️',
      title: 'Rate Set Karo',
      message: 'Settings mein gaay aur bhains ka rate daalo. Tab tak paisa calculation aur predictions adhura rahega.',
      priority: 3,
    })
  }

  const unnamedCount = entries.filter((e) => !e.animalName).length
  if (unnamedCount > entries.length * 0.5 && entries.length > 5) {
    insights.push({
      type: 'tip',
      icon: '🏷️',
      title: 'Janwar Naam Daalo',
      message: `${unnamedCount} entries mein janwar ka naam nahi hai. Naam daalo taaki per-animal tracking aur better insights mil sake.`,
      priority: 2,
    })
  }

  insights.sort((a, b) => b.priority - a.priority)

  const trendEmoji = trend === 'up' ? '📈' : trend === 'down' ? '📉' : '➡️'
  const summary = `${entries.length} entries · ${weekTotal.toFixed(0)}L/week · ${avgDaily.toFixed(1)}L/day avg · ${trendEmoji} ${trend} · Health: ${healthScore}/100`

  return {
    insights,
    summary,
    healthScore,
    trend,
    prediction: prediction || `Data collect ho raha hai — ${entries.length} entries tak abhi analysis basic hai`,
  }
}
