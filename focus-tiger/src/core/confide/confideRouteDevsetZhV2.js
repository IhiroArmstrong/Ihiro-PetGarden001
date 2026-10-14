/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Confide **routing** development set (zh v2).
 * SSOT JSON: fixtures/confide-route-devset-zh-v2.json
 * Authoring copy: ~/Documents/ft-route-devset/v2.json
 * Implementers may read. Do not embed full lines in production routers.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEVSET_JSON_PATH = join(__dirname, '../../../fixtures/confide-route-devset-zh-v2.json');

/**
 * @typedef {'mixed-explicit' | 'product-real' | 'emotion-aside'} ConfideRouteDevsetClass
 */

/**
 * @typedef {Readonly<{
 *   id: string,
 *   class: ConfideRouteDevsetClass,
 *   dim?: string,
 *   expect: string,
 *   text: string
 * }>} ConfideRouteDevsetItem
 */

function loadConfideRouteDevsetZhV2() {
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
    labels: Object.freeze({ ...(parsed.meta.labels || {}) }),
    notes: Object.freeze([...(parsed.meta.notes || [])]),
    counts: Object.freeze({ ...(parsed.meta.counts || {}) }),
    class_counts: Object.freeze({ ...(parsed.meta.class_counts || {}) })
  });
  return Object.freeze({ meta, items });
}

const DEVSET = loadConfideRouteDevsetZhV2();

export const CONFIDE_ROUTE_DEVSET_ZH_V2_META = DEVSET.meta;
export const CONFIDE_ROUTE_DEVSET_ZH_V2_ITEMS = DEVSET.items;
export const CONFIDE_ROUTE_DEVSET_JSON_PATH = DEVSET_JSON_PATH;
export const CONFIDE_ROUTE_DEVSET_ZH_V2_CLASSES = Object.freeze([
  'mixed-explicit',
  'product-real',
  'emotion-aside'
]);
