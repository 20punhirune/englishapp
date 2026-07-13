/*
  Service Worker for Flash English
  --------------------------------
  ★ デプロイして中身を更新したら、必ず CACHE_VERSION の数字を上げること。
    上げないと古いキャッシュが使われ続けます。
*/
const CACHE_VERSION = "v1";
const CACHE_NAME = `flash-english-${CACHE_VERSION}`;

// 相対パスなので GitHub Pages のサブディレクトリ (/repo-name/) でもそのまま動く
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-512-maskable.png",
  "./icons/apple-touch-icon-180.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // cache:"reload" で HTTP キャッシュを迂回し、必ずサーバの最新を取得する
      await cache.addAll(PRECACHE_URLS.map((url) => new Request(url, { cache: "reload" })));
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // 外部オリジンは介入しない

  // 1) ページ遷移: network-first（オンラインなら最新の index.html、オフラインならキャッシュ）
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req);
          const cache = await caches.open(CACHE_NAME);
          cache.put("./index.html", fresh.clone());
          return fresh;
        } catch (e) {
          const cache = await caches.open(CACHE_NAME);
          const cached = (await cache.match("./index.html")) || (await cache.match("./"));
          return cached || Response.error();
        }
      })()
    );
    return;
  }

  // 2) その他の同一オリジン資産: stale-while-revalidate
  //    キャッシュがあれば即返す（=オフラインでも即起動）。裏で最新を取得してキャッシュを更新する。
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(req);
      const networkPromise = fetch(req)
        .then((res) => {
          if (res && res.ok && res.type === "basic") cache.put(req, res.clone());
          return res;
        })
        .catch(() => null);
      return cached || (await networkPromise) || Response.error();
    })()
  );
});
