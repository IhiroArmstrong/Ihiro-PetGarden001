/**
 * Save a curated wallpaper still to the device (download link).
 * Reuses the Quiet Line download pattern — no social share.
 */

import {
  digitalWallpaperFilename,
  findDigitalWallpaperById
} from './digitalWallpapersCatalog.js';

/**
 * @param {Blob} blob
 * @param {string} filename
 * @param {{
 *   createElement?: (tag: string) => HTMLElement,
 *   createObjectURL?: (b: Blob) => string,
 *   revokeObjectURL?: (url: string) => void
 * }} [deps]
 * @returns {boolean}
 */
export function downloadBlobAsFile(blob, filename, deps = {}) {
  const createElement =
    deps.createElement ||
    (typeof document !== 'undefined'
      ? document.createElement.bind(document)
      : null);
  if (!createElement || !blob) return false;

  const createObjectURL =
    deps.createObjectURL ||
    ((b) =>
      typeof URL !== 'undefined' && URL.createObjectURL
        ? URL.createObjectURL(b)
        : '');
  const revokeObjectURL =
    deps.revokeObjectURL ||
    ((url) => {
      if (typeof URL !== 'undefined' && URL.revokeObjectURL) {
        URL.revokeObjectURL(url);
      }
    });

  const url = createObjectURL(blob);
  if (!url) return false;
  const a = createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  a.click();
  revokeObjectURL(url);
  return true;
}

/**
 * @param {{
 *   id: string,
 *   fetchImpl?: typeof fetch,
 *   createElement?: (tag: string) => HTMLElement,
 *   createObjectURL?: (b: Blob) => string,
 *   revokeObjectURL?: (url: string) => void
 * }} opts
 * @returns {Promise<{ ok: boolean, filename: string, id: string }>}
 */
export async function saveDigitalWallpaperImage(opts) {
  const still = findDigitalWallpaperById(opts?.id);
  if (!still) {
    return { ok: false, filename: '', id: String(opts?.id || '') };
  }
  const filename = digitalWallpaperFilename(still);
  const fetchImpl =
    opts.fetchImpl ||
    (typeof fetch === 'function' ? fetch.bind(globalThis) : null);
  if (!fetchImpl) {
    return { ok: false, filename, id: still.id };
  }

  try {
    const res = await fetchImpl(still.src);
    if (!res?.ok) {
      return { ok: false, filename, id: still.id };
    }
    const blob = await res.blob();
    const ok = downloadBlobAsFile(blob, filename, opts);
    return { ok, filename, id: still.id };
  } catch {
    return { ok: false, filename, id: still.id };
  }
}
