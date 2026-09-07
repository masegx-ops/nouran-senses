// Service Worker — Nouran Senses
const CACHE = 'nshell-v4';
const SHELL = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/continuity-core.js',
  '/causal-ablation.js',
  '/causal-ablation-batch.js',
  '/path-dependence.js',
  '/manifest.webmanifest'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => k !== CACHE).map(k => caches.delete(k))
  )));
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
});
