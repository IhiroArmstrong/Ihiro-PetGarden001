/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Shared Cloud API helpers (tip + sanctuary).
 * No entitlement state — safe for either track to import.
 */

import { getDesktopShellBridge, isDesktopShellRuntime } from './desktopShell.js';

/** Keep in sync with `desktop/main.js` `DEFAULT_CLOUD_API_BASE`. */
export const DEFAULT_CLOUD_API_BASE_URL =
  'https://focus-tiger-cloud.ihiro.workers.dev';

/**
 * @param {object} [globalObj]
 * @param {{ viteDev?: boolean }} [flags]
 * @returns {string} Cloud API base without trailing slash, or "" if unset.
 */
export function getCloudApiBaseUrl(globalObj = globalThis, flags = {}) {
  // Packaged Electron: IPC POST; URL is a fallback signal for UI “cloud ready”.
  if (isDesktopShellRuntime(globalObj)) {
    try {
      const raw = String(import.meta.env?.VITE_CLOUD_API_BASE_URL || '').trim();
      if (raw) return raw.replace(/\/+$/, '');
    } catch {
      // Vite env unavailable.
    }
    return DEFAULT_CLOUD_API_BASE_URL;
  }
  let viteDev = flags.viteDev;
  if (viteDev === undefined) {
    try {
      viteDev = Boolean(import.meta.env?.DEV);
    } catch {
      viteDev = false;
    }
  }
  // Vite `npm run dev` on :5174+ is not on Worker ALLOWED_ORIGIN (:5173 only).
  // Same-origin `/api` → vite.config.js proxy, so Safari is not CORS-blocked.
  if (viteDev) {
    const origin = String(globalObj?.location?.origin || '').replace(/\/+$/, '');
    if (origin) return origin;
  }
  try {
    const raw = String(import.meta.env?.VITE_CLOUD_API_BASE_URL || '').trim();
    if (raw) return raw.replace(/\/+$/, '');
  } catch {
    // Vite env unavailable (unit tests / non-bundled).
  }
  return '';
}

/** Click-mutation default. Callers may pass `deps.timeoutMs`; `0` disables (tests only). */
export const CLOUD_JSON_DEFAULT_TIMEOUT_MS = 12000;

/**
 * @param {unknown} err
 * @param {number} [status]
 * @param {unknown} [body]
 */
function attachCloudError(err, status, body) {
  if (err && typeof err === 'object') {
    if (status != null) /** @type {any} */ (err).status = status;
    if (body !== undefined) /** @type {any} */ (err).body = body;
  }
  return err;
}

/**
 * @param {Promise<unknown>} promise
 * @param {number} timeoutMs
 */
export async function withCloudJsonTimeout(promise, timeoutMs) {
  if (!(timeoutMs > 0)) return promise;
  let timer = null;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => {
          reject(attachCloudError(new Error('timeout'), 408));
        }, timeoutMs);
      })
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * @param {{ timeoutMs?: number }} [deps]
 */
export function resolveCloudJsonTimeoutMs(deps = {}) {
  if (deps.timeoutMs === 0) return 0;
  if (Number.isFinite(deps.timeoutMs) && /** @type {number} */ (deps.timeoutMs) > 0) {
    return /** @type {number} */ (deps.timeoutMs);
  }
  return CLOUD_JSON_DEFAULT_TIMEOUT_MS;
}

/**
 * @param {string} path e.g. "/api/create-tip-checkout-session"
 * @param {RequestInit} [init]
 * @param {{ desktopShell?: ReturnType<typeof getDesktopShellBridge>, timeoutMs?: number }} [deps]
 */
export async function postCloudJson(path, init = {}, deps = {}) {
  return withCloudJsonTimeout(
    postCloudJsonOnce(path, init, deps),
    resolveCloudJsonTimeoutMs(deps)
  );
}

/**
 * @param {string} path
 * @param {RequestInit} [init]
 * @param {{ desktopShell?: ReturnType<typeof getDesktopShellBridge> }} [deps]
 */
async function postCloudJsonOnce(path, init = {}, deps = {}) {
  const shell = deps.desktopShell ?? getDesktopShellBridge();
  if (shell && typeof shell.cloudPostJson === 'function') {
    let result;
    try {
      result = await shell.cloudPostJson(
        path,
        typeof init.body === 'string' ? init.body : init.body == null ? '{}' : String(init.body)
      );
    } catch (err) {
      const status = /** @type {any} */ (err)?.status;
      const body = /** @type {any} */ (err)?.body;
      throw attachCloudError(
        err instanceof Error ? err : new Error(String(err)),
        status,
        body
      );
    }
    // Main-process envelope keeps HTTP status across IPC (thrown Error
    // custom fields are not reliable after Electron clone).
    if (result && typeof result === 'object' && result.ok === false) {
      const detail =
        typeof result.detail === 'string' && result.detail
          ? result.detail
          : `HTTP ${result.status || 0}`;
      throw attachCloudError(new Error(detail), result.status, result.body);
    }
    if (result && typeof result === 'object' && result.ok === true && 'body' in result) {
      return result.body;
    }
    return result;
  }

  const base = getCloudApiBaseUrl();
  if (!base) {
    throw new Error('cloud_api_unconfigured');
  }
  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(init.headers || {})
    },
    ...init
  });
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  if (!res.ok) {
    const detail =
      body && typeof body === 'object' && 'detail' in body
        ? String(/** @type {{ detail?: unknown }} */ (body).detail || '')
        : `HTTP ${res.status}`;
    const err = new Error(detail || `HTTP ${res.status}`);
    throw attachCloudError(err, res.status, body);
  }
  return body;
}

export { openCheckoutUrl } from './desktopShell.js';
