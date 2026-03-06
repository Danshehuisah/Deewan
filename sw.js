// sw.js - Service Worker for offline caching
const CACHE_NAME = 'diwan-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/main.css',
    '/css/chapter.css',
    '/css/verses.css',
    '/js/main.js',
    '/js/chapter.js',
    '/js/verses.js',
    '/fonts/Amiri-Regular.ttf',
    '/fonts/Amiri-Bold.ttf',
    '/fonts/ScheherazadeNew-Regular.ttf',
    '/fonts/ScheherazadeNew-Bold.ttf',
    '/fonts/NotoKufiArabic-Regular.ttf',
    '/fonts/NotoKufiArabic-Bold.ttf',
    '/fonts/NotoNaskhArabic-Regular.ttf',
    '/fonts/NotoNaskhArabic-Bold.ttf',
    '/locales/ar.json',
    '/locales/en.json',
    '/locales/fr.json',
    '/manifest.json',
    // Add all your icons
    '/icons/icon-72x72.webp',
    '/icons/icon-96x96.webp',
    '/icons/icon-128x128.webp',
    '/icons/icon-144x144.webp',
    '/icons/icon-152x152.webp',
    '/icons/icon-192x192.webp',
    '/icons/icon-384x384.webp',
    '/icons/icon-512x512.webp',
    '/icons/apple-touch-icon.png',
    '/icons/apple-touch-icon-120x120.png',
    '/icons/apple-touch-icon-152x152.png',
    '/icons/apple-touch-icon-167x167.png',
    '/icons/apple-touch-icon-180x180.png'
];

// Install service worker and cache all resources
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
                // Cache hit - return response
                if (response) {
                    return response;
                }
                return fetch(event.request);
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