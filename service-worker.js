// service-worker.js (CORRETTO PER GITHUB PAGES)

const CACHE_NAME = 'jw-shepherd-cache-v2'; // Versione incrementata per forzare l'aggiornamento
const REPO_NAME = '/JW_Shepherd/'; // Nome della tua repository

// Lista dei file da mettere in cache con percorsi relativi
const urlsToCache = [
    // Percorsi relativi per funzionare su GitHub Pages
    './',
    './index.html',
    './manifest.json',
    './icons/icon-72x72.png',
    './icons/icon-96x96.png',
    './icons/icon-128x128.png',
    './icons/icon-144x144.png',
    './icons/icon-152x152.png',
    './icons/icon-192x192.png',
    './icons/icon-384x384.png',
    './icons/icon-512x512.png',

    // URL esterni (questi non cambiano)
    'https://cdn.tailwindcss.com',
    'https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.snow.css',
    'https://fonts.googleapis.com/css2?family=Comfortaa:wght@500&family=Nunito:wght@700&display=swap',
    'https://unpkg.com/react@18/umd/react.development.js',
    'https://unpkg.com/react-dom@18/umd/react-dom.development.js',
    'https://unpkg.com/@babel/standalone/babel.min.js',
    'https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.js'
];

// Evento di installazione: memorizza nella cache le risorse dell'app.
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache aperta');
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

// Evento fetch: serve le risorse dalla cache se disponibili.
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Se la risorsa è in cache, la restituisce
                if (response) {
                    return response;
                }
                // Altrimenti, la scarica dalla rete
                return fetch(event.request);
            })
    );
});

// Evento click sulla notifica: apre l'app o la mette a fuoco.
self.addEventListener('notificationclick', event => {
    console.log('Notifica cliccata: ', event.notification.tag);
    event.notification.close();

    event.waitUntil(
        clients.matchAll({
            type: "window",
            includeUncontrolled: true
        }).then(clientList => {
            // Controlla se una finestra con il percorso della repository è già aperta
            for (let i = 0; i < clientList.length; i++) {
                let client = clientList[i];
                if (client.url.includes(REPO_NAME) && 'focus' in client) {
                    return client.focus();
                }
            }
            // Altrimenti, apre una nuova finestra al percorso corretto
            if (clients.openWindow) {
                return clients.openWindow(REPO_NAME);
            }
        })
    );
});