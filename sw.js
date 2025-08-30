// Service Worker لتطبيق Nouran Senses
// مسؤول عن الكاش البسيط + تجربة المزامنة في الخلفية

self.addEventListener('install', (event) => {
  console.log('Service Worker: Install');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  return self.clients.claim();
});

// محاولة لتخزين الملفات الأساسية (shell) - ممكن توسعها لاحقاً
const SHELL = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js'
];

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((resp) => {
      return resp || fetch(event.request);
    })
  );
});

// Background Sync تجريبي
self.addEventListener('sync', (event) => {
  if (event.tag === 'nouran-upload') {
    event.waitUntil((async () => {
      console.log('Background sync tick: nouran-upload');
      // هنا ممكن تنفّذ إعادة محاولة رفع ملفات متأخرة
    })());
  }
});
