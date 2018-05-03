/* See: https://developers.google.com/web/tools/workbox/guides/get-started */
importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.1.0/workbox-sw.js');

workbox.routing.registerRoute(
    new RegExp('.*'),
    workbox.strategies.networkFirst()
  );