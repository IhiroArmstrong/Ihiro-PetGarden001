/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Yin's Art Collection — purchased digital artwork, separate from Focus Coins.
 * Step 2 shows five works. Checkout is not wired, so a request never grants ownership.
 */

export const YIN_ART_WORKS = Object.freeze([
  Object.freeze({
    id: 'jun-glaze-saddled-horse',
    priceLabel: '$2.99',
    src: '/ui/collection-objects/jun-glaze-saddled-horse.png',
    nameKey: 'YIN_ART_HORSE',
    noteKey: 'YIN_ART_HORSE_NOTE'
  }),
  Object.freeze({
    id: 'silver-gilt-boshan-mountain-censer',
    priceLabel: '$1.99',
    src: '/ui/collection-objects/silver-gilt-boshan-mountain-censer.png',
    nameKey: 'YIN_ART_BOSHAN',
    noteKey: 'YIN_ART_BOSHAN_NOTE'
  }),
  Object.freeze({
    id: 'gold-dragon-ewer',
    priceLabel: '$1.99',
    src: '/ui/collection-objects/gold-dragon-ewer.png',
    nameKey: 'YIN_ART_EWER',
    noteKey: 'YIN_ART_EWER_NOTE'
  }),
  Object.freeze({
    id: 'celadon-dragon-handle-he',
    priceLabel: '$1.99',
    src: '/ui/collection-objects/celadon-dragon-handle-he.png',
    nameKey: 'YIN_ART_HE',
    noteKey: 'YIN_ART_HE_NOTE'
  }),
  Object.freeze({
    id: 'blue-white-scholar-jar',
    priceLabel: '$0.99',
    src: '/ui/collection-objects/blue-white-scholar-jar.png',
    nameKey: 'YIN_ART_JAR',
    noteKey: 'YIN_ART_JAR_NOTE'
  })
]);

/**
 * @param {string} artId
 * @returns {{ ok: false, reason: string, owned: false }}
 */
export function requestYinArtPurchase(artId) {
  const known = YIN_ART_WORKS.some((work) => work.id === artId);
  return {
    ok: false,
    reason: known ? 'payment-not-open' : 'unknown',
    owned: false
  };
}
