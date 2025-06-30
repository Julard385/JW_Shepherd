// service-worker.js (Versione Finale Definitiva)

const CACHE_NAME = 'jw-shepherd-cache-v5'; // Versione incrementata
const REPO_NAME = '/JW_Shepherd/';
const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    // Elenco icone ridotto a solo quelle che esistono
    './icons/icon-192x192.png',
    './icons/icon-512x512.png',
    // URL esterni
    'https://cdn.tailwindcss.com',
    'https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.snow.css',
    'https://fonts.googleapis.com/css2?family=Comfortaa:wght@500&family=Nunito:wght@700&display=swap',
    'https://unpkg.com/react@18/umd/react.development.js',
    'https://unpkg.com/react-dom@18/umd/react-dom.development.js',
    'https://unpkg.com/@babel/standalone/babel.min.js',
    'https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.js'
];

// Evento di installazione
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache aperta, inizio caching dei file corretti...');
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.error('Errore durante cache.addAll():', error);
                return Promise.reject(error);
            })
    );
});

// Evento di attivazione
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

// Evento fetch
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
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