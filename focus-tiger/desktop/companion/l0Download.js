/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Resume-safe GGUF fetch: `.part` + `.meta.json`, HTTP Range, same-URL
 * retries, then mirror failover that does not wipe a compatible partial.
 */

import fs from 'node:fs';
import path from 'node:path';
import { L0_MODEL_MIN_BYTES } from './l0Config.js';
import {
  retireLegacyProductionGgufs,
  trySeedProductionFromSpikeCache
} from './l0SpikeSeed.js';

export const L0_DOWNLOAD_ATTEMPTS_PER_URL = 5;
export const L0_DOWNLOAD_RETRY_DELAYS_MS = [2000, 4000, 8000, 16000, 32000];

const PROGRESS_STEP_BYTES = 8 * 1024 * 1024;
const USER_AGENT = 'FocusTiger-L0Probe/1.0';

function defaultSleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function l0PartPath(destPath) {
  return `${destPath}.part`;
}

export function l0MetaPath(destPath) {
  return `${destPath}.meta.json`;
}

/**
 * Complete file: size must match Content-Length when known.
 * Without expected size, keep the HTML-guard floor (legacy 0.6B cache).
 *
 * @param {number} bytes
 * @param {number | null | undefined} expectedBytes
 * @param {number} [minBytes]
 */
export function isGgufDownloadComplete(
  bytes,
  expectedBytes,
  minBytes = L0_MODEL_MIN_BYTES
) {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n <= 0) return false;
  const floor = Number(minBytes);
  const min = Number.isFinite(floor) && floor > 0 ? floor : 0;
  if (n < min) return false;
  const expected = Number(expectedBytes);
  if (Number.isFinite(expected) && expected > 0) return n === expected;
  return true;
}

/**
 * @param {unknown} urlOrUrls
 * @returns {string[]}
 */
export function normalizeDownloadUrls(urlOrUrls) {
  if (typeof urlOrUrls === 'string' && urlOrUrls.trim()) return [urlOrUrls.trim()];
  if (!Array.isArray(urlOrUrls)) return [];
  return urlOrUrls.map((u) => String(u || '').trim()).filter(Boolean);
}

/**
 * Keep `.part` when switching mirrors only if the new HEAD length matches.
 *
 * @param {{ partBytes: number, expectedBytes: number | null, headLength: number | null }} row
 */
export function canReusePartOnMirror(row) {
  const partBytes = Number(row?.partBytes) || 0;
  if (partBytes <= 0) return true;
  const headLength = Number(row?.headLength);
  if (!Number.isFinite(headLength) || headLength <= 0) return false;
  const expected = Number(row?.expectedBytes);
  if (Number.isFinite(expected) && expected > 0) return headLength === expected;
  return headLength > partBytes;
}

/**
 * @param {string} destPath
 * @returns {{ expectedBytes: number | null, etag: string | null, url: string | null } | null}
 */
export function readDownloadMeta(destPath) {
  const metaPath = l0MetaPath(destPath);
  if (!fs.existsSync(metaPath)) return null;
  try {
    const row = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    const expected = Number(row?.expectedBytes);
    return {
      expectedBytes: Number.isFinite(expected) && expected > 0 ? expected : null,
      etag: typeof row?.etag === 'string' ? row.etag : null,
      url: typeof row?.url === 'string' ? row.url : null
    };
  } catch {
    return null;
  }
}

/**
 * @param {string} destPath
 * @param {{ expectedBytes?: number | null, etag?: string | null, url?: string | null }} meta
 */
export function writeDownloadMeta(destPath, meta) {
  const payload = {
    expectedBytes:
      Number.isFinite(Number(meta?.expectedBytes)) && Number(meta.expectedBytes) > 0
        ? Number(meta.expectedBytes)
        : null,
    etag: meta?.etag || null,
    url: meta?.url || null,
    updatedAt: new Date().toISOString()
  };
  fs.writeFileSync(l0MetaPath(destPath), `${JSON.stringify(payload)}\n`);
}

function partBytes(destPath) {
  const partPath = l0PartPath(destPath);
  if (!fs.existsSync(partPath)) return 0;
  return fs.statSync(partPath).size;
}

/**
 * @param {string} destPath
 * @param {unknown} urlOrUrls
 * @param {{
 *   onProgress?: (info: { received: number, total: number | null }) => void,
 *   minBytes?: number,
 *   fetch?: typeof fetch,
 *   sleep?: (ms: number) => Promise<void>
 * }} [opts]
 * @returns {Promise<{ path: string, bytes: number, downloaded: boolean, url?: string }>}
 */
export async function ensureGgufDownloaded(destPath, urlOrUrls, opts = {}) {
  const urls = normalizeDownloadUrls(urlOrUrls);
  if (urls.length === 0) throw new Error('model_download_no_url');
  const minBytes = opts.minBytes ?? L0_MODEL_MIN_BYTES;
  const fetchFn = opts.fetch || fetch;
  const sleepFn = opts.sleep || defaultSleep;

  const dir = path.dirname(destPath);
  fs.mkdirSync(dir, { recursive: true });
  recoverIncompleteDest(destPath, minBytes);
  trySeedProductionFromSpikeCache(destPath);
  retireLegacyProductionGgufs(destPath);

  if (fs.existsSync(destPath)) {
    const bytes = fs.statSync(destPath).size;
    const meta = readDownloadMeta(destPath);
    if (isGgufDownloadComplete(bytes, meta?.expectedBytes, minBytes)) {
      return { path: destPath, bytes, downloaded: false };
    }
  }

  let lastError = null;
  for (const url of urls) {
    if (!(await canUseUrlWithExistingPart(destPath, url, fetchFn))) {
      lastError = new Error('model_download_mirror_length_mismatch');
      continue;
    }
    for (let attempt = 0; attempt < L0_DOWNLOAD_ATTEMPTS_PER_URL; attempt++) {
      try {
        const result = await downloadAttempt(destPath, url, {
          onProgress: opts.onProgress,
          minBytes,
          fetch: fetchFn
        });
        if (isGgufDownloadComplete(result.bytes, result.expectedBytes, minBytes)) {
          return {
            path: destPath,
            bytes: result.bytes,
            downloaded: true,
            url
          };
        }
        lastError = new Error(`model_download_incomplete_${result.bytes}`);
      } catch (err) {
        lastError = err;
        const code = err instanceof Error ? err.message : String(err);
        if (
          code === 'model_download_source_no_range' ||
          code === 'model_download_mirror_length_mismatch'
        ) {
          break;
        }
      }
      const delay = L0_DOWNLOAD_RETRY_DELAYS_MS[
        Math.min(attempt, L0_DOWNLOAD_RETRY_DELAYS_MS.length - 1)
      ];
      if (attempt < L0_DOWNLOAD_ATTEMPTS_PER_URL - 1) await sleepFn(delay);
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error(String(lastError || 'model_download_failed'));
}

function recoverIncompleteDest(destPath, minBytes) {
  if (!fs.existsSync(destPath)) return;
  const bytes = fs.statSync(destPath).size;
  const meta = readDownloadMeta(destPath);
  if (isGgufDownloadComplete(bytes, meta?.expectedBytes, minBytes)) return;
  const partPath = l0PartPath(destPath);
  if (!fs.existsSync(partPath)) {
    fs.renameSync(destPath, partPath);
    return;
  }
  if (bytes > fs.statSync(partPath).size) {
    fs.unlinkSync(partPath);
    fs.renameSync(destPath, partPath);
    return;
  }
  fs.unlinkSync(destPath);
}

async function canUseUrlWithExistingPart(destPath, url, fetchFn) {
  const existing = partBytes(destPath);
  if (existing <= 0) return true;
  const meta = readDownloadMeta(destPath);
  if (meta?.url && meta.url === url) return true;
  const headLength = await headContentLength(url, fetchFn);
  return canReusePartOnMirror({
    partBytes: existing,
    expectedBytes: meta?.expectedBytes,
    headLength
  });
}

async function headContentLength(url, fetchFn) {
  try {
    const res = await fetchFn(url, {
      method: 'HEAD',
      redirect: 'follow',
      headers: { 'user-agent': USER_AGENT, accept: '*/*' }
    });
    if (!res.ok) return null;
    const n = Number(res.headers.get('content-length'));
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

/**
 * @param {string} destPath
 * @param {string} url
 * @param {{
 *   onProgress?: (info: { received: number, total: number | null }) => void,
 *   minBytes: number,
 *   fetch: typeof fetch
 * }} opts
 */
async function downloadAttempt(destPath, url, opts) {
  const partPath = l0PartPath(destPath);
  let startAt = partBytes(destPath);
  const meta = readDownloadMeta(destPath);
  const headLength = await headContentLength(url, opts.fetch);
  if (
    startAt > 0 &&
    !canReusePartOnMirror({
      partBytes: startAt,
      expectedBytes: meta?.expectedBytes ?? headLength,
      headLength
    })
  ) {
    throw new Error('model_download_mirror_length_mismatch');
  }

  /** @type {Record<string, string>} */
  const headers = {
    'user-agent': USER_AGENT,
    accept: '*/*'
  };
  if (startAt > 0) headers.range = `bytes=${startAt}-`;

  const res = await opts.fetch(url, { headers, redirect: 'follow' });
  if (res.status === 416) {
    const expected = meta?.expectedBytes || headLength;
    if (isGgufDownloadComplete(startAt, expected, opts.minBytes)) {
      finalizePart(destPath, startAt, expected, url, res.headers.get('etag'));
      return { bytes: startAt, expectedBytes: expected };
    }
    throw new Error('model_download_range_unsatisfiable');
  }
  const resumable = res.status === 206;
  if (!res.ok && !resumable) {
    throw new Error(`model_download_http_${res.status}`);
  }
  if (startAt > 0 && !resumable) {
    throw new Error('model_download_source_no_range');
  }
  if (!res.body) throw new Error('model_download_empty_body');

  const totalHeader = res.headers.get('content-length');
  const chunkTotal = totalHeader ? Number(totalHeader) : null;
  const total =
    resumable && Number.isFinite(chunkTotal)
      ? startAt + chunkTotal
      : Number.isFinite(chunkTotal)
        ? chunkTotal
        : headLength;
  writeDownloadMeta(destPath, {
    expectedBytes: Number.isFinite(total) ? total : meta?.expectedBytes,
    etag: res.headers.get('etag'),
    url
  });

  const file = fs.createWriteStream(partPath, { flags: startAt > 0 ? 'a' : 'w' });
  const reader = res.body.getReader();
  let received = startAt;
  let lastLogged = startAt;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      const ok = file.write(Buffer.from(value));
      if (!ok) {
        await new Promise((resolve) => file.once('drain', resolve));
      }
      if (received - lastLogged >= PROGRESS_STEP_BYTES || received === total) {
        lastLogged = received;
        opts.onProgress?.({
          received,
          total: Number.isFinite(total) ? total : null
        });
      }
    }
  } finally {
    await new Promise((resolve, reject) => {
      file.end((err) => (err ? reject(err) : resolve()));
    });
  }

  const bytes = fs.existsSync(partPath) ? fs.statSync(partPath).size : received;
  const expected = Number.isFinite(total) ? total : readDownloadMeta(destPath)?.expectedBytes;
  if (!isGgufDownloadComplete(bytes, expected, opts.minBytes)) {
    throw new Error(`model_download_incomplete_${bytes}`);
  }
  finalizePart(destPath, bytes, expected, url, res.headers.get('etag'));
  return { bytes, expectedBytes: expected };
}

function finalizePart(destPath, bytes, expectedBytes, url, etag) {
  const partPath = l0PartPath(destPath);
  if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
  fs.renameSync(partPath, destPath);
  writeDownloadMeta(destPath, { expectedBytes, etag, url });
  void bytes;
}
