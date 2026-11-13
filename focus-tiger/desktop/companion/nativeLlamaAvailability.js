/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Shared latch for the desktop llama native binding.
 * Electron 45 ships Node 24 (ABI 150). A binding built for the previous
 * shell's Node 22 fails to load. Semantic scoring and short generation
 * both use that one binding, so they go unavailable together.
 * Callers keep their existing fallbacks (corpus reply / embed skip).
 * This module never imports node-llama-cpp.
 */

export const NATIVE_LLAMA_UNAVAILABLE = 'native_llama_unavailable';

let nativeLlamaDown = false;

export function isNativeLlamaDown() {
  return nativeLlamaDown;
}

/** Test-only. Production code must not clear a failed binding mid-process. */
export function resetNativeLlamaLatchForTest() {
  nativeLlamaDown = false;
}

/**
 * @param {unknown} err
 * @returns {boolean}
 */
export function isNativeLlamaLoadFailure(err) {
  if (err == null) return false;
  const code =
    typeof err === 'object' && err && 'code' in err && err.code != null
      ? String(err.code)
      : '';
  const name = err instanceof Error ? err.name : '';
  const message = err instanceof Error ? err.message : String(err);
  if (message === NATIVE_LLAMA_UNAVAILABLE) return true;
  if (code === 'ERR_DLOPEN_FAILED') return true;
  if (name === 'NoBinaryFoundError' || message.includes('NoBinaryFoundError')) {
    return true;
  }
  if (message.includes('NODE_MODULE_VERSION')) return true;
  if (/compiled against a different Node/i.test(message)) return true;
  if (code === 'MODULE_NOT_FOUND' && /node-llama-cpp|\.node\b/.test(message)) {
    return true;
  }
  if (/dlopen\(/.test(message) && /\.node/.test(message)) return true;
  return false;
}

/**
 * @param {unknown} err
 * @returns {boolean} true when this failure (or an earlier one) latches both features off
 */
export function noteNativeLlamaFailure(err) {
  if (nativeLlamaDown) return true;
  if (!isNativeLlamaLoadFailure(err)) return false;
  nativeLlamaDown = true;
  return true;
}

/**
 * Child `error` events with this message must also mark semantic score unavailable.
 * Any other companion error keeps the previous embedding-gate reset.
 * @param {unknown} message
 * @returns {boolean}
 */
export function companionErrorDisablesSemanticScore(message) {
  return String(message || '') === NATIVE_LLAMA_UNAVAILABLE;
}

/**
 * @param {() => Promise<Record<string, unknown>>} importFn
 */
export async function importNodeLlamaOrMarkDown(importFn) {
  if (nativeLlamaDown) throw new Error(NATIVE_LLAMA_UNAVAILABLE);
  try {
    return await importFn();
  } catch (err) {
    if (noteNativeLlamaFailure(err)) throw new Error(NATIVE_LLAMA_UNAVAILABLE);
    throw err;
  }
}

/**
 * @param {(opts?: object) => Promise<unknown>} getLlama
 * @param {object} [llamaOpts]
 */
export async function getLlamaOrMarkNativeDown(getLlama, llamaOpts) {
  if (nativeLlamaDown) throw new Error(NATIVE_LLAMA_UNAVAILABLE);
  try {
    return await getLlama(llamaOpts);
  } catch (err) {
    if (noteNativeLlamaFailure(err)) throw new Error(NATIVE_LLAMA_UNAVAILABLE);
    throw err;
  }
}
