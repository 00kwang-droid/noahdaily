/* Daily Self — service worker
   버전을 올리면(예: v3 → v4) 새 배포 시 캐시가 갱신됩니다. */
const CACHE = 'daily-self-v4';
const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(async c => {
      // 파일 하나가 404 등으로 실패해도 전체 설치가 무너지지 않도록
      // addAll(all-or-nothing) 대신 개별 add + 실패 허용으로 처리합니다.
      await Promise.allSettled(
        SHELL.map(url => c.add(url).catch(err => {
          console.warn('[sw] precache 실패(무시하고 계속):', url, err);
        }))
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Firebase / Google / 외부 API는 절대 캐시하지 않고 그대로 네트워크로 보냅니다.
  if (
    url.hostname.includes('firebase') ||
    url.hostname.includes('firestore') ||
    url.hostname.includes('googleapis') ||
    url.hostname.includes('gstatic') ||
    url.hostname.includes('google')
  ) {
    return; // 브라우저 기본 동작
  }

  // 앱 문서(네비게이션): 네트워크 우선, 실패 시 캐시된 index.html
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // 그 외 정적 리소스: 캐시 우선, 없으면 네트워크
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      if (res.ok && url.origin === location.origin) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => hit))
  );
});
