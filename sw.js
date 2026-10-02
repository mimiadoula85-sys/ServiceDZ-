const CACHE_NAME = 'service-dz-v2'; // قومي بتغيير هذا الرقم (v2, v3, ...) مع كل تحديث جديد ترفعيه
const urlsToCache = [
  '/',
  '/index.html',
  // أضيفي هنا بقية الملفات الأساسية مثل ملفات الـ CSS أو الـ JS إذا وجدت
];

// 1. تثبيت الـ Service Worker وحفظ الملفات الجديدة
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // يجبر الـ Service Worker الجديد على تفعيل نفسه فوراً دون انتظار إغلاق المتصفح
});

// 2. تنشيط الـ Service Worker وحذف الكِش (Cache) القديم
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName); // يحذف النسخ القديمة تماماً
          }
        })
      );
    })
  );
  self.clients.claim(); // السيطرة الفورية على جميع الصفحات المفتوحة
});

// 3. جلب الملفات (Fetch)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
