#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * First-invite ship: packaged updater feed must be https on the
 * PO-locked host. Env override, if set, must match that host.
 *
 * Usage: node scripts/verify-first-pack-update-feed.js
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CANONICAL_UPDATE_FEED_HOST,
  CANONICAL_UPDATE_FEED_URL,
  evaluateUpdateFeedUrl
} from '../src/core/desktopUpdateFeedUrl.js';

/**
 * @param {Record<string, string | undefined>} env
 * @param {{ notice?: string, source?: string }} [files]
 * @returns {{ ok: true } | { ok: false, error: string }}
 */
export function evaluateFirstPackUpdateFeed(env = {}, files = {}) {
  const canonical = evaluateUpdateFeedUrl(CANONICAL_UPDATE_FEED_URL, {
    requireNonEmpty: true
  });
  if (!canonical.ok) return canonical;

  const notice = String(files.notice || '');
  if (!notice.includes(CANONICAL_UPDATE_FEED_HOST)) {
    return {
      ok: false,
      error: `verify-first-pack-update-feed: PRIVACY_NOTICE.md must name ${CANONICAL_UPDATE_FEED_HOST}`
    };
  }

  const source = String(files.source || '');
  if (!source.includes(CANONICAL_UPDATE_FEED_URL)) {
    return {
      ok: false,
      error:
        'verify-first-pack-update-feed: desktopUpdateFeedUrl.js must keep the canonical https URL'
    };
  }

  const fromEnv = String(env.FT_UPDATE_FEED_URL || '').trim();
  if (fromEnv) {
    const envResult = evaluateUpdateFeedUrl(fromEnv, { requireNonEmpty: true });
    if (!envResult.ok) return envResult;
  }

  return { ok: true };
}

const isCli =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (!isCli) {
  // imported by unit tests
} else {
  const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
  const result = evaluateFirstPackUpdateFeed(process.env, {
    notice: readFileSync(path.join(rootDir, 'docs/PRIVACY_NOTICE.md'), 'utf8'),
    source: readFileSync(
      path.join(rootDir, 'src/core/desktopUpdateFeedUrl.js'),
      'utf8'
    )
  });
  if (!result.ok) {
    console.error(result.error);
    process.exit(1);
  }
  console.log(
    `verify-first-pack-update-feed: OK (${CANONICAL_UPDATE_FEED_HOST})`
  );
}
