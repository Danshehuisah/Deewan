// sw.js - Service Worker for offline caching
const CACHE_NAME = 'diwan-cache-v2'; // Bumped version so it updates your users
const urlsToCache = [
    './',
    'index.html',
    'css/main.css',
    'css/chapter.css',
    'css/verses.css',
    'js/main.js',
    'js/chapter.js',
    'js/verses.js',
    'fonts/Amiri-Regular.ttf',
    'fonts/Amiri-Bold.ttf',
    'fonts/ScheherazadeNew-Regular.ttf',
    'fonts/ScheherazadeNew-Bold.ttf',
    'fonts/NotoKufiArabic-Regular.ttf',
    'fonts/NotoKufiArabic-Bold.ttf',
    'fonts/NotoNaskhArabic-Regular.ttf',
    'fonts/NotoNaskhArabic-Bold.ttf',
    'locales/ar.json',
    'locales/en.json',
    'locales/fr.json',
    'manifest.json',
    
    // PNG Icons (For Android)
    'icons/icon-72x72.png',
    'icons/icon-96x96.png',
    'icons/icon-128x128.png',
    'icons/icon-144x144.png',
    'icons/icon-152x152.png',
    'icons/icon-192x192.png',
    'icons/icon-384x384.png',
    'icons/icon-512x512.png',
    
    // PNG Icons (For iOS)
    'apple-touch-icon.png',
    'apple-touch-icon-120x120.png',
    'apple-touch-icon-152x152.png'
];

// Install service worker and cache all core resources
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Serve cached content when offline
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // 1. Cache hit - return response
                if (response) {
                    return response;
                }

                // 2. Not in cache - fetch from network
                return fetch(event.request).then(networkResponse => {
                    // 3. If it's a JSON chapter (deewan-text), cache it dynamically for offline use
                    if (event.request.url.includes('/deewan-text/')) {
                        const responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return networkResponse;
                }).catch(() => {
                    // Optional: If completely offline and not cached, just fail silently
                    console.log('Network request failed and no cache available.');
                });
            })
    );
});

// Clean up old caches
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