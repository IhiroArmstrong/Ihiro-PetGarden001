/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import {
  ensureGgufDownloaded,
  l0PartPath
} from '../companion/l0Download.js';

export const GUIDED_MEDITATION_CACHE_DIRNAME = 'guided-meditation';

const USER_AGENT = 'FocusTiger-GuidedMeditation/1.0';

/** @type {Map<string, Promise<{ fileUrl: string, path: string, fromCache: boolean }>>} */
const inflight = new Map();

/**
 * @param {string} userDataDir
 * @param {string} lessonId
 * @param {string} objectHash
 * @param {GuidedMeditationRenditionKind} kind
 */
export function guidedMeditationCacheDestPath(
  userDataDir,
  lessonId,
  objectHash,
  kind
) {
  const ext = kind === 'audio' ? 'm4a' : 'mp4';
  return path.join(
    userDataDir,
    GUIDED_MEDITATION_CACHE_DIRNAME,
    lessonId,
    objectHash,
    `delivery.${ext}`
  );
}

/**
 * @param {string} filePath
 * @returns {string}
 */
export function sha256FileHex(filePath) {
  const hash = createHash('sha256');
  hash.update(fs.readFileSync(filePath));
  return hash.digest('hex');
}

/**
 * @param {string} destPath
 * @param {string} expectedSha256
 */
export function verifyGuidedMeditationSha256(destPath, expectedSha256) {
  const expected = String(expectedSha256 || '').trim().toLowerCase();
  if (!expected) return;
  const actual = sha256FileHex(destPath);
  if (actual !== expected) {
    try {
      fs.unlinkSync(destPath);
    } catch {
      /* ignore */
    }
    const part = l0PartPath(destPath);
    try {
      if (fs.existsSync(part)) fs.unlinkSync(part);
    } catch {
      /* ignore */
    }
    throw new Error('guided_meditation_sha256_mismatch');
  }
}

/**
 * @typedef {'video' | 'audio'} GuidedMeditationRenditionKind
 *
 * @param {{
 *   userDataDir: string,
 *   lessonId: string,
 *   kind: GuidedMeditationRenditionKind,
 *   url: string,
 *   objectHash: string,
 *   expectedSha256?: string,
 *   expectedBytes?: number,
 *   onProgress?: (info: { received: number, total: number | null }) => void,
 *   fetch?: typeof fetch
 * }} opts
 * @returns {Promise<{ fileUrl: string, path: string, fromCache: boolean }>}
 */
export async function ensureGuidedMeditationCached(opts) {
  const destPath = guidedMeditationCacheDestPath(
    opts.userDataDir,
    opts.lessonId,
    opts.objectHash,
    opts.kind
  );
  const key = destPath;
  const existing = inflight.get(key);
  if (existing) return existing;

  const job = (async () => {
    const minBytes =
      Number.isFinite(Number(opts.expectedBytes)) && Number(opts.expectedBytes) > 0
        ? Number(opts.expectedBytes)
        : 1;
    if (fs.existsSync(destPath)) {
      try {
        verifyGuidedMeditationSha256(destPath, opts.expectedSha256 || '');
        return {
          path: destPath,
          fileUrl: pathToFileURL(destPath).href,
          fromCache: true
        };
      } catch {
        /* re-download */
      }
    }
    const fetchFn = opts.fetch || fetch;
    const dl = await ensureGgufDownloaded(destPath, opts.url, {
      onProgress: opts.onProgress,
      minBytes,
      fetch: (...args) =>
        fetchFn(args[0], {
          ...args[1],
          headers: {
            ...(args[1]?.headers || {}),
            'user-agent': USER_AGENT
          }
        })
    });
    verifyGuidedMeditationSha256(destPath, opts.expectedSha256 || '');
    return {
      path: dl.path,
      fileUrl: pathToFileURL(dl.path).href,
      fromCache: !dl.downloaded
    };
  })();

  inflight.set(key, job);
  try {
    return await job;
  } finally {
    inflight.delete(key);
  }
}

/**
 * @param {string} userDataDir
 * @param {string} lessonId
 * @param {string} objectHash
 * @param {GuidedMeditationRenditionKind} kind
 */
export function removeGuidedMeditationCacheEntry(
  userDataDir,
  lessonId,
  objectHash,
  kind
) {
  const destPath = guidedMeditationCacheDestPath(
    userDataDir,
    lessonId,
    objectHash,
    kind
  );
  for (const target of [destPath, l0PartPath(destPath), `${destPath}.meta.json`]) {
    try {
      if (fs.existsSync(target)) fs.unlinkSync(target);
    } catch {
      /* ignore */
    }
  }
}
