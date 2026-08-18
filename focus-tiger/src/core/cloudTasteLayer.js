/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Optional cloud overlay for Dispatcher weight pools (云端品味层).
 * Unknown / missing `schemaVersion`, timeout, 4xx → keep local freeze tables.
 * Idle / CapCut / SpriteSequencePlayer stay local. Sit / Rise must not await this.
 */

export const TASTE_LAYER_SCHEMA_VERSION = 1;

export const TASTE_LAYER_POOL_NAMES = Object.freeze([
  'welcome',
  'lightComplete',
  'riseInterrupt'
]);

/** @type {Record<string, ReadonlyArray<{ key: string, weight: number }>> | null} */
let tasteOverlayPools = null;

/**
 * @returns {Record<string, ReadonlyArray<{ key: string, weight: number }>> | null}
 */
export function getTasteOverlayPools() {
  return tasteOverlayPools;
}

/**
 * @param {'welcome' | 'lightComplete' | 'riseInterrupt'} name
 * @returns {ReadonlyArray<{ key: string, weight: number }> | null}
 */
export function getTasteLayerPool(name) {
  const overlay = tasteOverlayPools;
  if (!overlay || !Object.prototype.hasOwnProperty.call(overlay, name)) {
    return null;
  }
  return overlay[name];
}

/**
 * @param {Record<string, ReadonlyArray<{ key: string, weight: number }>> | null} pools
 */
export function setTasteOverlayPoolsForTests(pools) {
  tasteOverlayPools = pools;
}

export function resetTasteOverlayPools() {
  tasteOverlayPools = null;
}

/**
 * @param {unknown} cloud
 * @param {ReadonlyArray<{ key: string, weight: number }>} local
 * @returns {ReadonlyArray<{ key: string, weight: number }> | null}
 */
export function parseTastePool(cloud, local) {
  if (!Array.isArray(cloud) || !Array.isArray(local) || cloud.length !== local.length) {
    return null;
  }
  const localKeys = new Set(local.map((e) => e.key));
  if (localKeys.size !== local.length) return null;
  const seen = new Set();
  /** @type {{ key: string, weight: number }[]} */
  const out = [];
  for (const entry of cloud) {
    if (!entry || typeof entry !== 'object') return null;
    const key = /** @type {{ key?: unknown }} */ (entry).key;
    const weight = Number(/** @type {{ weight?: unknown }} */ (entry).weight);
    if (typeof key !== 'string' || !localKeys.has(key) || seen.has(key)) return null;
    if (!Number.isFinite(weight) || weight < 0) return null;
    seen.add(key);
    out.push({ key, weight });
  }
  if (seen.size !== localKeys.size) return null;
  return out;
}

/**
 * @param {unknown} body
 * @param {Record<string, ReadonlyArray<{ key: string, weight: number }>>} localPools
 * @returns {Record<string, ReadonlyArray<{ key: string, weight: number }>> | null}
 */
export function parseTasteWeightPayload(body, localPools) {
  if (!body || typeof body !== 'object') return null;
  const version = /** @type {{ schemaVersion?: unknown }} */ (body).schemaVersion;
  if (version !== TASTE_LAYER_SCHEMA_VERSION) return null;
  const pools = /** @type {{ pools?: unknown }} */ (body).pools;
  if (!pools || typeof pools !== 'object') return null;

  /** @type {Record<string, ReadonlyArray<{ key: string, weight: number }>>} */
  const out = {};
  for (const name of TASTE_LAYER_POOL_NAMES) {
    const local = localPools[name];
    if (!local) return null;
    const parsed = parseTastePool(
      /** @type {Record<string, unknown>} */ (pools)[name],
      local
    );
    if (!parsed) return null;
    if (
      name === 'lightComplete' &&
      parsed.some(
        (e) =>
          e.key === 'celebrating' ||
          e.key === 'celebrateDance' ||
          e.key === 'celebrateDanceV2'
      )
    ) {
      return null;
    }
    out[name] = parsed;
  }
  return out;
}

/**
 * @param {number} timeoutMs
 * @returns {Promise<never>}
 */
function timeoutReject(timeoutMs) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('taste_layer_timeout')), timeoutMs);
  });
}

/**
 * Best-effort overlay refresh. Never throws to the caller.
 *
 * @param {{
 *   postCloudJson?: (path: string, init?: RequestInit) => Promise<unknown>,
 *   localPools: Record<string, ReadonlyArray<{ key: string, weight: number }>>,
 *   timeoutMs?: number
 * }} opts
 * @returns {Promise<boolean>} true if an overlay was applied
 */
export async function refreshCloudTasteLayer(opts) {
  const timeoutMs = opts.timeoutMs ?? 2500;
  const postCloudJson = opts.postCloudJson;
  if (typeof postCloudJson !== 'function') {
    tasteOverlayPools = null;
    return false;
  }
  try {
    const body = await Promise.race([
      postCloudJson('/api/emotion-weight', {
        body: JSON.stringify({
          emotionKey: 'Idle',
          sessionPhase: 'arrive'
        })
      }),
      timeoutReject(timeoutMs)
    ]);
    const parsed = parseTasteWeightPayload(body, opts.localPools);
    tasteOverlayPools = parsed;
    return parsed != null;
  } catch {
    tasteOverlayPools = null;
    return false;
  }
}
