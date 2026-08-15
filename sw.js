// Doodh Tracker Service Worker — offline support
const CACHE_NAME = 'doodh-tracker-v4'
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
]

// Install: cache all assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  )
  self.skipWaiting()
})

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    })
  )
  self.clients.claim()
})

// Fetch: cache-first for same-origin, network fallback
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  const url = new URL(event.request.url)
  if (url.origin !== self.location.origin) return

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        // Update cache in background
        fetch(event.request).then((resp) => {
          if (resp.ok) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resp.clone()))
          }
        }).catch(() => {})
        return cached
      }
      // Not in cache, try network
      return fetch(event.request).then((resp) => {
        if (resp.ok) {
          const clone = resp.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        }
        return resp
      }).catch(() => {
        // Offline and not cached — return index.html for navigation
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html')
        }
      })
    })
  )
})
