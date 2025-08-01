self.addEventListener('install', event => {
    console.log('Service Worker installing.');
    event.waitUntil(
        caches.open('pwa-cache-v1').then(cache => {
            return cache.addAll(['/', '/index.html', '/styles.css', '/script.js']);
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});

self.addEventListener('activate', event => {
    console.log('Service Worker activating.');
});
