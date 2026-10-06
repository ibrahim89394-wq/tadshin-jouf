/* يحفظ الصفحة على الآيباد عشان تفتح بدون إنترنت */
const CACHE = 'tadshin-v12';
const FILES = ['./', './index.html'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
/* إذا فيه إنترنت: يجيب أحدث نسخة ويحفظها. إذا ما فيه: يفتح المحفوظة */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(e.request, {ignoreSearch:true}) ||
                   (e.request.mode === 'navigate' ? await cache.match('./index.html') : undefined);
    const net = fetch(e.request).then(r => { if (r.ok) cache.put(e.request, r.clone()); return r; });
    if (cached){
      /* نعطي المحفوظ فوراً ونحدّثه بالخلفية */
      e.waitUntil(net.catch(()=>{}));
      return cached;
    }
    return net;
  })());
});
