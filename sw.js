const CACHE_NAME = 'doodh-tracker-v21'
const PRECACHE = ['/', '/index.html', '/manifest.json', '/logo.png']

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)).catch(() => {})
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

function isHTMLRequest(req) {
  if (req.mode === 'navigate') return true
  const accept = req.headers.get('accept') || ''
  return accept.includes('text/html')
}

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return

  let url
  try { url = new URL(req.url) } catch { return }
  if (url.origin !== self.location.origin) return

  if (isHTMLRequest(req)) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE_NAME).then((c) => c.put('/index.html', copy)).catch(() => {})
          return res
        })
        .catch(async () => {
          const cached = await caches.match('/index.html')
          if (cached) return cached
          const root = await caches.match('/')
          if (root) return root
          return new Response('<h1>Offline</h1><p>Internet se ek baar khol lo.</p>', {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          })
        })
    )
    return
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached
      return fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === 'basic') {
            const copy = res.clone()
            caches.open(CACHE_NAME).then((c) => c.put(req, copy)).catch(() => {})
          }
          return res
        })
        .catch(() => new Response('', { status: 504, statusText: 'Offline' }))
    })
  )
})
