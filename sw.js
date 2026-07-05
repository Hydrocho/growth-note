const CACHE_NAME = "growth-note-cache-v1";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./student-login.html",
  "./teacher.html",
  "./assets/css/style.css",
  "./assets/js/rules.js",
  "./assets/js/rewards.js",
  "./assets/js/auth.js",
  "./assets/js/student.js",
  "./assets/js/teacher.js",
  "./assets/js/supabase-config.js",
  "./assets/js/supabase-client.js",
  "./manifest.json",
  "./public/img/icon-192.png",
  "./public/img/icon-512.png"
];

// 서비스 워커 설치 및 캐싱
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 캐시 정리 및 활성화
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 오프라인 요청 대리 수행
self.addEventListener("fetch", (event) => {
  // Supabase API 등 외부 네트워크 요청은 캐싱에서 제외
  if (event.request.url.includes("supabase.co") || event.request.url.startsWith("http") === false) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((response) => {
        // 동적 정적 리소스 추가 캐싱
        if (response && response.status === 200 && response.type === "basic") {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      }).catch(() => {
        // 오프라인 상태일 때 빈 응답이나 실패 처리
      });
    })
  );
});
