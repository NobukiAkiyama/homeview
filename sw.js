const CACHE_NAME = 'homeview-v1';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json',
    './assets/icon.png'
    // Dynamic assets like weather icons are fetched from CDN or API,
    // so we might not cache them statically unless we list them locally.
    // For now, caching core shell.
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('fetch', (e) => {
    // Basic Stale-While-Revalidate or Network-First Strategy
    // For a dashboard, Network-First is often better for data, but Stale-First for shell.
    // Let's use Stale-While-Revalidate for core assets.

    e.respondWith(
        caches.match(e.request).then((cachedResponse) => {
            return cachedResponse || fetch(e.request);
        })
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
});
