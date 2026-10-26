/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Reverse scan: every `focus-tiger.*.v1` string literal under `src/` must be either
 * on the DEV reset whitelist (`FOCUS_TIGER_LOCAL_STORAGE_KEYS`) or on the frozen
 * exception list below (shrink-only — new keys must join the whitelist).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { FOCUS_TIGER_LOCAL_STORAGE_KEYS } from './localStateKeys.js';

const LITERAL_RE = /['"`](focus-tiger\.[a-z0-9.-]+\.v1)['"`]/g;

/**
 * Keys that appear as literals but are intentionally not cleared by
 * `clearAllFocusTigerLocalState` (sessionStorage / IndexedDB / pre-T60 local gaps).
 * **Shrink-only**: do not add rows; remove when the key joins the reset whitelist.
 */
export const FOCUS_TIGER_LOCAL_STORAGE_KEY_LITERAL_EXCEPTIONS = Object.freeze([
  // sessionStorage (see localStateKeys DEV_* / coldStartGoalGate)
  'focus-tiger.cloud-presence-hint.v1',
  'focus-tiger.cold-start-goal-choice.v1',
  'focus-tiger.dev-boot-idle.v1',
  'focus-tiger.dev-reset-toast.v1',
  // IndexedDB (`UserAmbientLibrary` — reset via `clearAllUserAmbientTracks`)
  'focus-tiger.user-ambient.v1',
  // localStorage literals not yet on reset whitelist (frozen at T60; future PRs add to whitelist)
  'focus-tiger.confide-help-entry-daily.v1',
  'focus-tiger.focus-circle-beside.v1',
  'focus-tiger.landscape-hint-dismissed.v1',
  'focus-tiger.open-ended-nudge.v1',
  'focus-tiger.practice-imprint.v1',
  'focus-tiger.practice-paper-hidden.v1',
  'focus-tiger.yin-art-notice.v1',
  'focus-tiger.yin-art-ownership.v1',
  'focus-tiger.yin-art-session.v1'
]);

/**
 * @param {string} [srcRoot] absolute or repo-relative path to `focus-tiger/src`
 * @returns {string[]} sorted unique key literals
 */
export function scanFocusTigerLocalStorageKeyLiterals(srcRoot) {
  const root = path.resolve(srcRoot);
  const keys = new Set();

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (!entry.name.endsWith('.js')) continue;
      const text = fs.readFileSync(full, 'utf8');
      let match;
      LITERAL_RE.lastIndex = 0;
      while ((match = LITERAL_RE.exec(text)) !== null) {
        keys.add(match[1]);
      }
    }
  }

  walk(root);
  return [...keys].sort();
}

/**
 * @param {object} [opts]
 * @param {string} [opts.srcRoot]
 * @returns {{ ok: boolean, unregistered: string[] }}
 */
export function auditFocusTigerLocalStorageKeyLiterals(opts = {}) {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const srcRoot = opts.srcRoot ?? path.join(here, '..');
  const whitelist = new Set(FOCUS_TIGER_LOCAL_STORAGE_KEYS);
  const exceptions = new Set(FOCUS_TIGER_LOCAL_STORAGE_KEY_LITERAL_EXCEPTIONS);
  const literals = scanFocusTigerLocalStorageKeyLiterals(srcRoot);
  const unregistered = literals.filter(
    (key) => !whitelist.has(key) && !exceptions.has(key)
  );
  return { ok: unregistered.length === 0, unregistered };
}
