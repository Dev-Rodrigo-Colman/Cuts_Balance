// IMPORTANTE: subí este número cada vez que actualices index.html y subas los cambios.
// Eso obliga al teléfono a bajar la versión nueva en vez de mostrar una guardada vieja.
const CACHE_VERSION = 'v1';
const CACHE_NAME = `balance-peluqueria-${CACHE_VERSION}`;

const ARCHIVOS_BASE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

// Instala y guarda una copia base para que la app abra aunque no haya internet
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ARCHIVOS_BASE))
  );
  self.skipWaiting(); // no espera a que se cierren todas las pestañas para activarse
});

// Borra versiones de caché viejas al activarse la nueva
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((nombres) =>
      Promise.all(
        nombres
          .filter((nombre) => nombre !== CACHE_NAME)
          .map((nombre) => caches.delete(nombre))
      )
    )
  );
  self.clients.claim();
});

// Estrategia: primero intenta traer de internet (así siempre ve lo último si hay señal),
// y si no hay conexión, usa la copia guardada.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((respuesta) => {
        const copia = respuesta.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copia));
        return respuesta;
      })
      .catch(() => caches.match(event.request))
  );
});