// Service Worker — Nouran Senses (basic shell cache + hooks)
// مبدئي: هنطوّره لاحقًا لإشعارات التحكم في التسجيل

const CACHE = 'nshell-v2';
const SHELL = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.webmanifest'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  // شبكة أولاً للملفات الديناميكية، وكاش احتياطي للـ shell
  e.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// إشعارات — أساس (هنفعّل أزرار الإيقاف/الاستئناف لاحقًا)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  // مثال: نبعث أمر للصفحة عبر BroadcastChannel (هنكمّلها في التحديث القادم)
  // const ch = new BroadcastChannel('ns-control');
  // ch.postMessage({ action: 'toggle-record' });
});
