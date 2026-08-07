/**
 * Focus Tiger · minimal network-only service worker
 *
 * Purpose: PWA installability foundation + future Web Push hook point.
 * Strategy (scheme A): no Cache Storage; every fetch goes to the network.
 * Does NOT precache sprites, audio, models, or app shell.
 *
 * Stale-content risk after deploys: near-zero for app JS/CSS (Vite hashed URLs
 * + no SW cache). Ensure host serves this file with Cache-Control: no-cache
 * when possible so SW script updates are not stuck behind HTTP cache.
 *
 * Icons: brand PNGs still pending — see public/icons/pwa-ICONS-PENDING.md
 * Do not claim install acceptance until those files exist.
 *
 * Out of scope: push subscription, offline-first, Capacitor.
 */

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
