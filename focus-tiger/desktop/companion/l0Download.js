/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import fs from 'node:fs';
import path from 'node:path';
import { L0_MODEL_MIN_BYTES } from './l0Config.js';

const MAX_ATTEMPTS = 6;
const PROGRESS_STEP_BYTES = 8 * 1024 * 1024;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * @param {string} destPath
 * @param {string} url
 * @param {{ onProgress?: (info: { received: number, total: number | null }) => void }} [opts]
 * @returns {Promise<{ path: string, bytes: number, downloaded: boolean }>}
 */
export async function ensureGgufDownloaded(destPath, url, opts = {}) {
  const dir = path.dirname(destPath);
  fs.mkdirSync(dir, { recursive: true });
  if (fs.existsSync(destPath)) {
    const bytes = fs.statSync(destPath).size;
    if (bytes >= L0_MODEL_MIN_BYTES) {
      return { path: destPath, bytes, downloaded: false };
    }
    fs.unlinkSync(destPath);
  }

  let lastError = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const result = await downloadAttempt(destPath, url, opts);
      if (result.bytes >= L0_MODEL_MIN_BYTES) return result;
      lastError = new Error(`model_download_too_small_${result.bytes}`);
    } catch (err) {
      lastError = err;
    }
    await sleep(1500 * attempt);
  }
  throw lastError instanceof Error
    ? lastError
    : new Error(String(lastError || 'model_download_failed'));
}

/**
 * @param {string} destPath
 * @param {string} url
 * @param {{ onProgress?: (info: { received: number, total: number | null }) => void }} opts
 */
async function downloadAttempt(destPath, url, opts) {
  const partPath = `${destPath}.part`;
  let startAt = 0;
  if (fs.existsSync(partPath)) {
    startAt = fs.statSync(partPath).size;
  }

  /** @type {Record<string, string>} */
  const headers = {
    'user-agent': 'FocusTiger-L0Probe/1.0',
    accept: '*/*'
  };
  if (startAt > 0) headers.range = `bytes=${startAt}-`;

  const res = await fetch(url, { headers, redirect: 'follow' });
  if (res.status === 416) {
    if (fs.existsSync(partPath)) fs.unlinkSync(partPath);
    throw new Error('model_download_range_unsatisfiable');
  }
  const resumable = res.status === 206;
  if (!res.ok && !resumable) {
    throw new Error(`model_download_http_${res.status}`);
  }
  if (startAt > 0 && !resumable) {
    fs.unlinkSync(partPath);
    startAt = 0;
  }
  if (!res.body) throw new Error('model_download_empty_body');

  const totalHeader = res.headers.get('content-length');
  const chunkTotal = totalHeader ? Number(totalHeader) : null;
  const total =
    resumable && Number.isFinite(chunkTotal)
      ? startAt + chunkTotal
      : Number.isFinite(chunkTotal)
        ? chunkTotal
        : null;

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
  if (bytes < L0_MODEL_MIN_BYTES) {
    throw new Error(`model_download_incomplete_${bytes}`);
  }
  fs.renameSync(partPath, destPath);
  return { path: destPath, bytes, downloaded: true };
}
