// Service Worker — Nouran Senses
const CACHE = 'nshell-v8';
const SHELL = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/continuity-core.js',
  '/causal-ablation.js',
  '/causal-ablation-batch.js',
  '/path-dependence.js',
  '/historical-snapshots.js',
  '/controlled-continuity-test.js',
  '/context-memory.js',
  '/context-manager.js',
  '/reality-gate.js',
  '/manifest.webmanifest'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    const copy = response.clone();
    caches.open(CACHE).then(cache => cache.put(event.request, copy));
    return response;
  }).catch(() => cached)));
});
