/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/** @typedef {{ id: string, text: string, reviewed?: boolean, reviewer?: string, reviewerType?: string, reviewedOn?: string, contentHash?: string }} CompanionCopyEntry */

export const COMPANION_CHANNEL_COPY_EN_REL = 'content/companion-channel-copy/en.json';

/**
 * @param {string} text
 * @returns {string}
 */
export function computeCompanionCopyContentHash(text) {
  return createHash('sha256').update(String(text).normalize('NFC'), 'utf8').digest('hex');
}

/**
 * @param {string} pkgRoot
 */
export function readCompanionChannelCopyEn(pkgRoot) {
  const raw = readFileSync(join(pkgRoot, COMPANION_CHANNEL_COPY_EN_REL), 'utf8');
  return JSON.parse(raw);
}

/**
 * @param {ReturnType<typeof readCompanionChannelCopyEn>} doc
 * @returns {string[]}
 */
export function validateCompanionChannelCopyEn(doc) {
  const errors = [];
  if (doc.schemaVersion !== 1) {
    errors.push(`companion-channel-copy en schemaVersion ${doc.schemaVersion} !== 1`);
  }
  if (doc.locale !== 'en') {
    errors.push(`companion-channel-copy locale ${doc.locale} !== en`);
  }
  if (doc.overlayLive !== false) {
    errors.push('companion-channel-copy en overlayLive must stay false until deploy step 4');
  }
  const pools = doc.pools;
  if (!pools || typeof pools !== 'object') {
    errors.push('companion-channel-copy en missing pools');
    return errors;
  }

  const ids = new Set();
  for (const [poolId, poolOrEntries] of Object.entries(pools)) {
    const entries = Array.isArray(poolOrEntries) ? poolOrEntries : poolOrEntries?.entries;
    if (!Array.isArray(entries)) {
      errors.push(`pool ${poolId} missing entries array`);
      continue;
    }
    for (const entry of entries) {
      const label = `${poolId}:${entry?.id || '?'}`;
      if (!entry?.id) errors.push(`${label} missing id`);
      if (ids.has(entry.id)) errors.push(`duplicate template id ${entry.id}`);
      ids.add(entry.id);
      if (!entry?.text) errors.push(`${label} missing text`);

      if (entry.reviewed === true) {
        if (!entry.reviewer || !String(entry.reviewer).trim()) {
          errors.push(`${label} reviewed:true without reviewer`);
        }
        for (const field of ['reviewerType', 'reviewedOn', 'contentHash']) {
          if (!entry[field]) errors.push(`${label} reviewed:true missing ${field}`);
        }
        const expected = computeCompanionCopyContentHash(entry.text);
        if (entry.contentHash && entry.contentHash !== expected) {
          errors.push(`${label} contentHash mismatch (text changed without re-review)`);
        }
      }
    }
  }

  return errors;
}

/**
 * @param {ReturnType<typeof readCompanionChannelCopyEn>} doc
 * @returns {Array<{ channel: string, locale: string, key: string, text: string, file: string }>}
 */
export function collectCompanionChannelCopyStrings(doc) {
  const out = [];
  const file = COMPANION_CHANNEL_COPY_EN_REL;
  for (const [poolId, poolOrEntries] of Object.entries(doc.pools || {})) {
    const entries = Array.isArray(poolOrEntries) ? poolOrEntries : poolOrEntries?.entries;
    for (const entry of entries || []) {
      if (!entry?.text) continue;
      out.push({
        channel: 'companion-channel-copy',
        locale: 'en',
        key: `${poolId}:${entry.id}`,
        text: entry.text,
        file
      });
    }
  }
  return out;
}
