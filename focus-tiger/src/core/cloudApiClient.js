/**
 * Shared Cloud API helpers (tip + sanctuary).
 * No entitlement state — safe for either track to import.
 */

/**
 * @returns {string} Cloud API base without trailing slash, or "" if unset.
 */
export function getCloudApiBaseUrl() {
  try {
    const raw = String(import.meta.env?.VITE_CLOUD_API_BASE_URL || '').trim();
    return raw.replace(/\/+$/, '');
  } catch {
    return '';
  }
}

/**
 * @param {string} path e.g. "/api/create-tip-checkout-session"
 * @param {RequestInit} [init]
 */
export async function postCloudJson(path, init = {}) {
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
    /** @type {any} */ (err).status = res.status;
    /** @type {any} */ (err).body = body;
    throw err;
  }
  return body;
}
