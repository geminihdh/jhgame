// 오프라인에서도 열리도록 파일을 기기에 저장해 둬요.
// 앱을 고쳐서 다시 올렸다면 아래 숫자(v1)를 v2, v3…로 올려야 새 버전이 보여요.
const VERSION = 'playroom-v3';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'fonts/Jua.woff2', 'fonts/GowunDodum.woff2'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
    const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return res;
  }).catch(() => caches.match('index.html'))));
});
