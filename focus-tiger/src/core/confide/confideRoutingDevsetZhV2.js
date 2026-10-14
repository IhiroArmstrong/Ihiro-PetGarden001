/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Confide routing **development set** (session A · zh v2).
 * SSOT JSON: fixtures/confide-routing-devset-zh-v2.json
 * Brief: task-confide-routing-arbitration-v1.md — may live in repo; holdout may not.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEVSET_JSON_PATH = join(__dirname, '../../../fixtures/confide-routing-devset-zh-v2.json');

/**
 * @typedef {'mixed' | 'product-over-emotion' | 'mixed-emotion-dominant'} ConfideRoutingDevsetClass
 */

/**
 * @typedef {Readonly<{
 *   id: string,
 *   class: ConfideRoutingDevsetClass,
 *   expect: 'product' | 'mood',
 *   text: string
 * }>} ConfideRoutingDevsetItem
 */

/**
 * @returns {{
 *   meta: Readonly<{ name: string, version: string, date: string, set: string, counts: Record<string, number> }>,
 *   items: readonly ConfideRoutingDevsetItem[]
 * }}
 */
function loadConfideRoutingDevsetZhV2() {
  const parsed = JSON.parse(readFileSync(DEVSET_JSON_PATH, 'utf8'));
  const items = Object.freeze(
    parsed.items.map((row) =>
      Object.freeze({
        id: String(row.id),
        class: row.class,
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
    counts: Object.freeze({ ...parsed.meta.counts })
  });
  return Object.freeze({ meta, items });
}

const DEVSET = loadConfideRoutingDevsetZhV2();

/** @type {typeof DEVSET.meta} */
export const CONFIDE_ROUTING_DEVSET_ZH_V2_META = DEVSET.meta;

/** @type {readonly ConfideRoutingDevsetItem[]} */
export const CONFIDE_ROUTING_DEVSET_ZH_V2_ITEMS = DEVSET.items;

/** @type {readonly ConfideRoutingDevsetClass[]} */
export const CONFIDE_ROUTING_DEVSET_ZH_V2_CLASSES = Object.freeze([
  'mixed',
  'product-over-emotion',
  'mixed-emotion-dominant'
]);
