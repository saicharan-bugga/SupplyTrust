/* SupplyTrust service worker: lets the app open and be read offline.
   Pages: network first, fall back to the cached app shell. Assets: cache first. */
const CACHE = 'supplytrust-v1'
const SHELL = ['./', 'favicon.svg', 'icon-192.png', 'icon-512.png', 'manifest.webmanifest']

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return
  const save = (res) => {
    if (res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone()))
    return res
  }
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then((res) => { if (res.ok) caches.open(CACHE).then((c) => c.put('./', res.clone())); return res })
        .catch(() => caches.match('./')),
    )
    return
  }
  e.respondWith(caches.match(req).then((hit) => hit ?? fetch(req).then(save)))
})
