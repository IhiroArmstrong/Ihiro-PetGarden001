/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { createHash } from 'node:crypto';
import fs from 'node:fs';

/**
 * @param {string} filePath
 * @returns {string} lowercase hex
 */
export function sha256FileHex(filePath) {
  const hash = createHash('sha256');
  const fd = fs.openSync(filePath, 'r');
  try {
    const buf = Buffer.alloc(8 * 1024 * 1024);
    let n = 0;
    do {
      n = fs.readSync(fd, buf, 0, buf.length, null);
      if (n > 0) hash.update(buf.subarray(0, n));
    } while (n > 0);
  } finally {
    fs.closeSync(fd);
  }
  return hash.digest('hex');
}

/**
 * @param {string} destPath
 * @param {string} expectedSha256 lowercase hex
 */
export function verifyGgufSha256(destPath, expectedSha256) {
  const expected = String(expectedSha256 || '').trim().toLowerCase();
  if (!expected || !/^[0-9a-f]{64}$/.test(expected)) {
    throw new Error('model_sha256_expected_missing');
  }
  if (!fs.existsSync(destPath)) throw new Error('model_sha256_file_missing');
  const actual = sha256FileHex(destPath);
  if (actual !== expected) {
    throw new Error('model_sha256_mismatch');
  }
}
