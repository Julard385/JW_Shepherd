// Nome della cache e versione
const CACHE_NAME = 'jw-shepherd-cache-v2'; // Versione aggiornata per forzare l'aggiornamento

// Lista delle risorse da mettere in cache
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/react@18/umd/react.development.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.development.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.js',
  'https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.snow.css',
  'https://fonts.googleapis.com/css2?family=Comfortaa:wght@500&family=Nunito:wght@700&display=swap',
  // Aggiungi qui le icone se le hai in una cartella, es: '/icons/icon-192x192.png'
];

// Evento 'install': viene eseguito quando il service worker viene installato
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aperta');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('Impossibile memorizzare i file nella cache durante l\'installazione', err);
      })
  );
});

// Evento 'fetch': intercetta tutte le richieste di rete per il caching
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Evento 'activate': pulisce le vecchie cache
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

// Ascolta l'evento push per mostrare una notifica
self.addEventListener('push', event => {
    const data = event.data.json();
    const title = data.title || "Nuova Notifica";
    const options = {
        body: data.body,
        icon: data.icon || 'icons/icon-192x192.png',
        badge: data.badge || 'icons/icon-72x72.png'
    };
    event.waitUntil(self.registration.showNotification(title, options));
});

// Ascolta i click sulla notifica
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/')
    );
});