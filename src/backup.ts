// Doodh Tracker — Email backup code
// Poora data ek chhote code mein badal deta hai (gzip + base64).
// Us code ko email/WhatsApp/Notes mein save karo, naye phone pe paste karke restore karo.
// Koi server nahi, koi login nahi, koi setup nahi.

import type { MilkEntry, Rates, Review } from './types'

export interface BackupData {
  v: number
  app: string
  at: number
  username: string
  entries: MilkEntry[]
  rates: Rates
  reminders: {
    morningEnabled: boolean
    eveningEnabled: boolean
    morningTime: string
    eveningTime: string
  }
  reviews: Review[]
}

const PREFIX_GZIP = 'DTB1.'
const PREFIX_PLAIN = 'DTB0.'

function bytesToB64(bytes: Uint8Array): string {
  let bin = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(bin)
}

function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

function hasCompression(): boolean {
  return typeof (globalThis as { CompressionStream?: unknown }).CompressionStream === 'function'
}

async function gzipBytes(text: string): Promise<Uint8Array> {
  const CS = (globalThis as unknown as { CompressionStream: new (f: string) => unknown }).CompressionStream
  const cs = new CS('gzip') as { readable: ReadableStream; writable: WritableStream }
  const stream = new Blob([text]).stream().pipeThrough(cs as unknown as TransformStream)
  const buf = await new Response(stream).arrayBuffer()
  return new Uint8Array(buf)
}

async function gunzipBytes(bytes: Uint8Array): Promise<string> {
  const DS = (globalThis as unknown as { DecompressionStream: new (f: string) => unknown }).DecompressionStream
  const ds = new DS('gzip') as { readable: ReadableStream; writable: WritableStream }
  const stream = new Blob([bytes as unknown as BlobPart]).stream().pipeThrough(ds as unknown as TransformStream)
  const buf = await new Response(stream).arrayBuffer()
  return new TextDecoder().decode(buf)
}

// ─── Backup code banao ───
export async function packBackup(data: BackupData): Promise<string> {
  const json = JSON.stringify(data)
  if (hasCompression()) {
    try {
      const gz = await gzipBytes(json)
      return PREFIX_GZIP + bytesToB64(gz)
    } catch {
      // neeche plain tarika try hoga
    }
  }
  return PREFIX_PLAIN + bytesToB64(new TextEncoder().encode(json))
}

// ─── Code se data wapas laao ───
export async function unpackBackup(rawCode: string): Promise<BackupData> {
  // Email/WhatsApp se copy karte waqt newline-space aa jate hain — hata do
  const code = rawCode.replace(/\s+/g, '')
  if (!code) throw new Error('Code khaali hai')

  let json: string
  if (code.startsWith(PREFIX_GZIP)) {
    try {
      const bytes = b64ToBytes(code.slice(PREFIX_GZIP.length))
      json = await gunzipBytes(bytes)
    } catch {
      throw new Error('Code kharab hai — poora copy hua hai ya nahi check karo')
    }
  } else if (code.startsWith(PREFIX_PLAIN)) {
    try {
      const bytes = b64ToBytes(code.slice(PREFIX_PLAIN.length))
      json = new TextDecoder().decode(bytes)
    } catch {
      throw new Error('Code kharab hai — poora copy hua hai ya nahi check karo')
    }
  } else {
    throw new Error('Ye Doodh Tracker ka backup code nahi lagta')
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    throw new Error('Code kharab hai — poora copy hua hai ya nahi check karo')
  }

  const p = parsed as Partial<BackupData>
  if (!p || p.app !== 'doodh-tracker' || !Array.isArray(p.entries)) {
    throw new Error('Code kharab hai — poora copy hua hai ya nahi check karo')
  }

  const rates = (p.rates || {}) as Partial<Rates>
  const rem = (p.reminders || {}) as Partial<BackupData['reminders']>

  return {
    v: Number(p.v) || 1,
    app: 'doodh-tracker',
    at: Number(p.at) || 0,
    username: typeof p.username === 'string' ? p.username : '',
    entries: p.entries as MilkEntry[],
    rates: { gaay: Number(rates.gaay) || 0, bhains: Number(rates.bhains) || 0 },
    reminders: {
      morningEnabled: !!rem.morningEnabled,
      eveningEnabled: !!rem.eveningEnabled,
      morningTime: typeof rem.morningTime === 'string' ? rem.morningTime : '06:00',
      eveningTime: typeof rem.eveningTime === 'string' ? rem.eveningTime : '18:00',
    },
    reviews: Array.isArray(p.reviews) ? (p.reviews as Review[]) : [],
  }
}

export function backupSummary(data: BackupData): string {
  const parts = [`${data.entries.length} entries`]
  if (data.rates.gaay || data.rates.bhains) parts.push(`rate ₹${data.rates.gaay}/₹${data.rates.bhains}`)
  if (data.reviews.length) parts.push(`${data.reviews.length} reviews`)
  return parts.join(' · ')
}
