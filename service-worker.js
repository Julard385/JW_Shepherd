// service-worker.js

const CACHE_NAME = 'jw-shepherd-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  // Aggiungi qui altri file statici che vuoi mettere in cache (es. CSS, JS, immagini)
  // Nota: i file caricati da CDN non verranno messi in cache da questa configurazione base.
];

// Evento di installazione: apre la cache e aggiunge i file principali.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento di attivazione: pulisce le vecchie cache.
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Evento fetch: intercetta le richieste di rete.
// Strategia Cache-First: prima controlla la cache, poi va in rete.
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Se la risorsa è in cache, la restituisce
        if (response) {
          return response;
        }

        // Altrimenti, la richiede alla rete, la aggiunge alla cache e la restituisce
        return fetch(event.request).then(
          response => {
            // Controlla che sia una risposta valida
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});