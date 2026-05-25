const CACHE_NAME = 'rota-buzios-v2';

// ======================
// ARQUIVOS CACHE
// ======================

const urlsToCache = [

  './',
  './index.html',
  './style.css',
  './manifest.json',

  './main.js',

  // CORE
  './core/init.js',
  './core/state.js',

  // DATA
  './data/dados.js',

  // UI
  './ui/elements.js',
  './ui/selection.js',
  './ui/route.js',
  './ui/mode.js',
  './ui/report.js',
  './ui/screens.js',

  // EVENTS
  './events/events.js',

  // STORAGE
  './storage/storage.js',
  './storage/database.js',

  // SERVICES
  './services/gps.js',
  './services/map.js',
  './services/map-camera.js',

  // UTILS
  './utils/utils.js'

];


// ======================
// INSTALL
// ======================

self.addEventListener(
  'install',
  event => {

    event.waitUntil(

      caches.open(CACHE_NAME)
      .then(cache => {

        return cache.addAll(
          urlsToCache
        );

      })

    );

    self.skipWaiting();

  }
);


// ======================
// FETCH
// ======================

self.addEventListener(
  'fetch',
  event => {

    event.respondWith(

      caches.match(
        event.request
      )
      .then(response => {

        if(response){

          return response;

        }

        return fetch(
          event.request
        )
        .then(networkResponse => {

          // salva novos arquivos
          if(
            event.request.method === 'GET'
          ){

            const clone =
              networkResponse.clone();

            caches.open(CACHE_NAME)
            .then(cache => {

              cache.put(
                event.request,
                clone
              );

            });

          }

          return networkResponse;

        })
        .catch(() => {

          // fallback offline
          if(
            event.request.mode === 'navigate'
          ){

            return caches.match(
              './index.html'
            );

          }

        });

      })

    );

  }
);


// ======================
// ACTIVATE
// ======================

self.addEventListener(
  'activate',
  event => {

    event.waitUntil(

      caches.keys()
      .then(keys => {

        return Promise.all(

          keys.map(key => {

            if(
              key !== CACHE_NAME
            ){

              return caches.delete(
                key
              );

            }

          })

        );

      })

    );

    self.clients.claim();

  }
);
