/* Mary Care — Service Worker v36
   Estrategia:
   - HTML: network-first (siempre la versión más nueva si hay internet)
   - Estáticos y CDN: stale-while-revalidate
   - Supabase / API: nunca se cachea
   - Fotos del storage: cache-first (no cambian)
*/
const VERSION = 'mc-v36';
const SHELL = VERSION + '-shell';
const RUNTIME = VERSION + '-runtime';
const IMGS = VERSION + '-img';

const PRECACHE = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(SHELL)
      .then((c) => c.addAll(PRECACHE).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

function esSupabaseAPI(url) {
  return url.hostname.endsWith('.supabase.co') && !url.pathname.includes('/storage/v1/object/public/');
}
function esFotoStorage(url) {
  return url.pathname.includes('/storage/v1/object/public/');
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch (err) { return; }

  // Datos en vivo: nunca cachear
  if (esSupabaseAPI(url)) return;

  // Fotos: cache-first, son inmutables
  if (esFotoStorage(url)) {
    e.respondWith(
      caches.open(IMGS).then((c) =>
        c.match(req).then((hit) => hit || fetch(req).then((res) => {
          if (res.ok) c.put(req, res.clone());
          return res;
        }).catch(() => hit))
      )
    );
    return;
  }

  // Navegación / HTML: network-first
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(SHELL).then((c) => c.put('./index.html', copy));
          return res;
        })
        .catch(() => caches.match('./index.html').then((r) => r || caches.match('./')))
    );
    return;
  }

  // Fuentes, iconos, scripts CDN: stale-while-revalidate
  e.respondWith(
    caches.open(RUNTIME).then((c) =>
      c.match(req).then((hit) => {
        const net = fetch(req).then((res) => {
          if (res && (res.ok || res.type === 'opaque')) c.put(req, res.clone());
          return res;
        }).catch(() => hit);
        return hit || net;
      })
    )
  );
});

self.addEventListener('message', (e) => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});
