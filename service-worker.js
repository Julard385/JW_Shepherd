// service-worker.js (Versione Finale con Fix CORS)

const CACHE_NAME = 'jw-shepherd-cache-v6'; // Versione incrementata
const REPO_NAME = '/JW_Shepherd/';

// Lista dei file da salvare: SOLO I FILE LOCALI
const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    './icons/icon-192x192.png',
    './icons/icon-512x512.png'
    // TUTTI GLI URL ESTERNI (CDN) SONO STATI RIMOSSI
];

// Evento di installazione
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache aperta, inizio caching dei soli file locali...');
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.error('Errore durante cache.addAll():', error);
                return Promise.reject(error);
            })
    );
});

// Evento di attivazione: pulisce le vecchie cache
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

// Evento fetch: prova a servire dalla cache, altrimenti va in rete
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Se la risorsa è in cache (i nostri file locali), la restituisce.
                // Altrimenti (le risorse CDN), prova a scaricarla dalla rete.
                return response || fetch(event.request);
            })
    );
});

// Evento click sulla notifica
self.addEventListener('notificationclick', event => {
    console.log('Notifica cliccata: ', event.notification.tag);
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then(clientList => {
            for (let i = 0; i < clientList.length; i++) {
                let client = clientList[i];
                if (client.url.includes(REPO_NAME) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(REPO_NAME);
            }
        })
    );
});