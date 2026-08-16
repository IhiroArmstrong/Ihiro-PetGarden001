/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

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
 * Icons: public/icons/pwa-*.png + apple-touch-icon.png (see pwa-icons.md).
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
