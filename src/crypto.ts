// Doodh Tracker — Security utilities
// SHA-256 PIN hashing + XOR-Base64 data encryption
// No external libraries — uses browser's built-in Web Crypto API

// ─── SHA-256 PIN Hashing ───
export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(pin + '::doodh-tracker-salt::v5')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function verifyPin(pin: string, storedHash: string): Promise<boolean> {
  const hash = await hashPin(pin)
  return hash === storedHash
}

// ─── XOR-Base64 Data Encryption ───
// Uses TextEncoder/TextDecoder for proper UTF-8 byte-level XOR

function deriveKey(): string {
  const seed = 'doodh-tracker::secure-storage::v5'
  let key = seed
  while (key.length < 64) key += key
  return key.slice(0, 64)
}

export function encryptData(data: string): string {
  try {
    const key = deriveKey()
    const encoder = new TextEncoder()
    const dataBytes = encoder.encode(data)
    const keyBytes = encoder.encode(key)
    const xored = new Uint8Array(dataBytes.length)
    for (let i = 0; i < dataBytes.length; i++) {
      xored[i] = dataBytes[i] ^ keyBytes[i % keyBytes.length]
    }
    let binary = ''
    for (let i = 0; i < xored.length; i++) {
      binary += String.fromCharCode(xored[i])
    }
    return btoa(binary)
  } catch {
    return data
  }
}

export function decryptData(encrypted: string): string {
  try {
    const key = deriveKey()
    const binary = atob(encrypted)
    const xored = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      xored[i] = binary.charCodeAt(i)
    }
    const keyBytes = new TextEncoder().encode(key)
    const dataBytes = new Uint8Array(xored.length)
    for (let i = 0; i < xored.length; i++) {
      dataBytes[i] = xored[i] ^ keyBytes[i % keyBytes.length]
    }
    return new TextDecoder().decode(dataBytes)
  } catch {
    return ''
  }
}
