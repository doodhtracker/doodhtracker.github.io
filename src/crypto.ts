// Doodh Tracker — Security utilities
// SHA-256 PIN hashing + XOR-Base64 data encryption
// No external libraries — uses browser's built-in Web Crypto API + simple XOR

// ─── SHA-256 PIN Hashing ───
// PIN ko hash kar ke store karte hain — DevTools mein plain PIN kabhi nahi dikhega
export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(pin + '::doodh-tracker-salt::v5')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

// PIN verify — user ke PIN ko hash karke stored hash se compare karna
export async function verifyPin(pin: string, storedHash: string): Promise<boolean> {
  const hash = await hashPin(pin)
  return hash === storedHash
}

// ─── XOR-Base64 Data Encryption ───
// Entries ko encrypt kar ke localStorage mein store karna
// Key = fixed app key (not user PIN, so data works across logins)

function deriveKey(): string {
  const seed = 'doodh-tracker::secure-storage::v5'
  let key = seed
  while (key.length < 64) key += key
  return key.slice(0, 64)
}

function xorString(text: string, key: string): string {
  let result = ''
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length))
  }
  return result
}

export function encryptData(data: string): string {
  const key = deriveKey()
  const xored = xorString(data, key)
  try {
    return btoa(unescape(encodeURIComponent(xored)))
  } catch {
    return data
  }
}

export function decryptData(encrypted: string): string {
  const key = deriveKey()
  try {
    const xored = decodeURIComponent(escape(atob(encrypted)))
    return xorString(xored, key)
  } catch {
    return ''
  }
}
