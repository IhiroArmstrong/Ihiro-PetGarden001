/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Confide **safety** development set (zh v1).
 * SSOT JSON: fixtures/confide-safety-devset-zh-v1.json
 * Authoring copy: ~/Documents/ft-safety-devset/v1.json
 * Implementers may read. Do not embed full lines in production classifiers.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEVSET_JSON_PATH = join(__dirname, '../../../fixtures/confide-safety-devset-zh-v1.json');

/**
 * @typedef {Readonly<{
 *   id: string,
 *   class: string,
 *   dim?: string,
 *   expect: string,
 *   text: string
 * }>} ConfideSafetyDevsetItem
 */

function loadConfideSafetyDevsetZhV1() {
  const parsed = JSON.parse(readFileSync(DEVSET_JSON_PATH, 'utf8'));
  const items = Object.freeze(
    parsed.items.map((row) =>
      Object.freeze({
        id: String(row.id),
        class: String(row.class),
        dim: row.dim == null ? undefined : String(row.dim),
        expect: String(row.expect),
        text: String(row.text)
      })
    )
  );
  const meta = Object.freeze({
    name: String(parsed.meta.name),
    version: String(parsed.meta.version),
    date: String(parsed.meta.date),
    set: String(parsed.meta.set),
    notes: Object.freeze([...(parsed.meta.notes || [])]),
    excluded_ids: Object.freeze([...(parsed.meta.excluded_ids || [])]),
    counts: Object.freeze({ ...(parsed.meta.counts || {}) })
  });
  return Object.freeze({ meta, items });
}

const DEVSET = loadConfideSafetyDevsetZhV1();

export const CONFIDE_SAFETY_DEVSET_ZH_V1_META = DEVSET.meta;
export const CONFIDE_SAFETY_DEVSET_ZH_V1_ITEMS = DEVSET.items;
export const CONFIDE_SAFETY_DEVSET_JSON_PATH = DEVSET_JSON_PATH;
