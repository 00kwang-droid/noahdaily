/* Daily Self — service worker (v5)
   ─────────────────────────────────────────────────────────────
   중요: 앱을 수정해 다시 올릴 때는 아래 CACHE 값을 v6, v7... 로 올리세요.
   v5부터 manifest.json / 아이콘은 "네트워크 우선"이라
   아이콘을 바꿔도 옛 캐시가 설치를 막는 일이 없습니다.
   ───────────────────────────────────────────────────────────── */
const CACHE = 'daily-self-v5';
const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png'
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

// 네트워크 우선 + 성공 시 캐시 갱신, 실패 시 캐시로 폴백
async function networkFirst(request, fallbackUrl) {
  try {
    const res = await fetch(request);
    if (res && res.ok) {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(request, copy)).catch(() => {});
    }
    return res;
  } catch (err) {
    const hit = await caches.match(request);
    if (hit) return hit;
    if (fallbackUrl) {
      const fb = await caches.match(fallbackUrl);
      if (fb) return fb;
    }
    return Response.error();
  }
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

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
  if (req.mode === 'navigate') {
    e.respondWith(networkFirst(req, './index.html'));
    return;
  }

  // ★ 매니페스트와 아이콘: 반드시 네트워크 우선
  //   (캐시 우선이면 아이콘을 바꿔도 브라우저가 옛 파일을 보고 '설치'가 사라집니다)
  const isManifest =
    req.destination === 'manifest' || url.pathname.endsWith('/manifest.json');
  const isIcon = /icon.*\.(png|svg|webp)$/i.test(url.pathname);
  if (isManifest || isIcon) {
    e.respondWith(networkFirst(req));
    return;
  }

  // 그 외 정적 리소스: 캐시 우선, 없으면 네트워크
  e.respondWith(
    caches.match(req).then(hit => {
      if (hit) return hit;
      return fetch(req).then(res => {
        if (res && res.ok && url.origin === location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => Response.error());
    })
  );
});
