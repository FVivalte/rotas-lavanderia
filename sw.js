const CACHE_NAME = 'rota-buzios-v1';

const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './dados.js',
  './manifest.json'
];

// INSTALAÇÃO
self.addEventListener('install', event => {

  event.waitUntil(

    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })

  );

});

// FETCH OFFLINE
self.addEventListener('fetch', event => {

  event.respondWith(

    caches.match(event.request)
      .then(response => {

        return response || fetch(event.request);

      })

  );

});

// ATUALIZA CACHE
self.addEventListener('activate', event => {

  event.waitUntil(

    caches.keys().then(keys => {

      return Promise.all(

        keys.map(key => {

          if(key !== CACHE_NAME){

            return caches.delete(key);

          }

        })

      );

    })

  );

});