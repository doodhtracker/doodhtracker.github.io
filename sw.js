// Doodh Tracker Service Worker — FULL offline support
// Eg baar online khola, phir hamesha offline chalega
const CACHE_NAME = 'doodh-tracker-v7'

// Install — skip waiting, take over immediately
self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll([
      '/',
      '/index.html',
      '/manifest.json',
    ])).catch(() => {})
  )
})

// Activate — clean ALL old caches, claim all clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => caches.delete(k))
      )
    }).then(() => self.clients.claim())
  )
})

// Fetch — CACHE FIRST for everything same-origin
// Pehli baar online aaya toh sab cache ho jayega
// Doosri baar cache se chalega — internet nahi chahiye
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)
  if (url.origin !== self.location.origin) return

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        // Cache mein hai — wahin de do, internet nahi chahiye
        // Background mein update bhi karo (taaki online hone pe latest version mile)
        fetch(event.request).then((resp) => {
          if (resp && resp.ok) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resp.clone()))
          }
        }).catch(() => {})
        return cached
      }

      // Cache mein nahi hai — network try karo
      return fetch(event.request).then((resp) => {
        // Agar response ok hai toh cache kar lo (taaki next time offline chal sake)
        if (resp && resp.ok && resp.type === 'basic') {
          const clone = resp.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        }
        return resp
      }).catch(() => {
        // Offline + cache miss — agar navigation request hai toh index.html de do
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html')
        }
      })
    })
  )
})
