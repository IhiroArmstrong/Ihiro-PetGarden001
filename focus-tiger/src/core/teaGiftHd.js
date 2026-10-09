/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * After tea is verified, show the cached high-resolution gift.
 * The preview stays until that file is on this device.
 */

import { TEA_GIFT_ART } from './artEditionCatalog.js';
import { cacheIssuedArtHd, readArtHd } from './artCollectionHd.js';
import { getCloudApiBaseUrl } from './cloudApiClient.js';

function artHdUrl(path) {
  const value = String(path || '');
  if (/^https?:\/\//.test(value)) return value;
  const base = String(getCloudApiBaseUrl() || '').replace(/\/$/, '');
  return `${base}${value.startsWith('/') ? value : `/${value}`}`;
}

/**
 * @param {HTMLImageElement | { src: string }} img
 * @param {{ url?: string, receiptId?: string, artId?: string } | null} [grant]
 * @param {{ fetchImpl?: typeof fetch, cache?: object }} [deps]
 */
export async function applyTeaGiftPicture(img, grant = null, deps = {}) {
  if (!img) return;
  const artId = TEA_GIFT_ART.id;
  const cached = await readArtHd(artId, deps.cache);
  if (cached?.blob) {
    const next = URL.createObjectURL(cached.blob);
    if (img._teaGiftObjectUrl) URL.revokeObjectURL(img._teaGiftObjectUrl);
    img._teaGiftObjectUrl = next;
    img.src = next;
    return;
  }
  const url = grant && grant.url;
  const receiptId = grant && grant.receiptId;
  if (!url || !receiptId) return;
  const saved = await cacheIssuedArtHd({
    artId,
    receiptId,
    url,
    fetchImpl: deps.fetchImpl,
    cache: deps.cache,
    resolveUrl: artHdUrl
  });
  if (!saved.ok) return;
  const again = await readArtHd(artId, deps.cache);
  if (!again?.blob) return;
  const next = URL.createObjectURL(again.blob);
  if (img._teaGiftObjectUrl) URL.revokeObjectURL(img._teaGiftObjectUrl);
  img._teaGiftObjectUrl = next;
  img.src = next;
}
