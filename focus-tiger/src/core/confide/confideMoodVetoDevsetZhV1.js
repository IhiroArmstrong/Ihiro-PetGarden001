/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Confide KB mood-veto **development set** (session A · zh v1).
 * SSOT JSON: fixtures/confide-mood-veto-devset-zh-v1.json
 * Brief: task-confide-class-blind-acceptance.md — may live in repo; holdout may not.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEVSET_JSON_PATH = join(__dirname, '../../../fixtures/confide-mood-veto-devset-zh-v1.json');

/**
 * @typedef {'practice-aversion' | 'present-discomfort' | 'unbidden-recall' | 'escape-urge' | 'practice-fatigue'} ConfideMoodVetoDevsetClass
 */

/**
 * @typedef {'positive' | 'interrogative-positive' | 'counter-mixed' | 'counter-product' | 'crisis-edge-clear' | 'crisis-edge-grey'} ConfideMoodVetoDevsetLabel
 */

/**
 * @typedef {Readonly<{
 *   id: string,
 *   class: ConfideMoodVetoDevsetClass,
 *   label: ConfideMoodVetoDevsetLabel,
 *   expect: string,
 *   dim?: string,
 *   text: string
 * }>} ConfideMoodVetoDevsetItem
 */

/**
 * @typedef {Readonly<{
 *   name: string,
 *   version: string,
 *   date: string,
 *   set: string,
 *   labels: Record<string, string>,
 *   notes: readonly string[],
 *   counts: Record<string, number>
 * }>} ConfideMoodVetoDevsetMeta
 */

/**
 * @returns {{ meta: ConfideMoodVetoDevsetMeta, items: readonly ConfideMoodVetoDevsetItem[] }}
 */
function loadConfideMoodVetoDevsetZhV1() {
  const parsed = JSON.parse(readFileSync(DEVSET_JSON_PATH, 'utf8'));
  const items = Object.freeze(
    parsed.items.map((row) =>
      Object.freeze({
        id: String(row.id),
        class: row.class,
        label: row.label,
        expect: String(row.expect),
        dim: row.dim == null ? undefined : String(row.dim),
        text: String(row.text)
      })
    )
  );
  const meta = Object.freeze({
    name: String(parsed.meta.name),
    version: String(parsed.meta.version),
    date: String(parsed.meta.date),
    set: String(parsed.meta.set),
    labels: Object.freeze({ ...parsed.meta.labels }),
    notes: Object.freeze([...parsed.meta.notes]),
    counts: Object.freeze({ ...parsed.meta.counts })
  });
  return Object.freeze({ meta, items });
}

const DEVSET = loadConfideMoodVetoDevsetZhV1();

/** @type {ConfideMoodVetoDevsetMeta} */
export const CONFIDE_MOOD_VETO_DEVSET_ZH_V1_META = DEVSET.meta;

/** @type {readonly ConfideMoodVetoDevsetItem[]} */
export const CONFIDE_MOOD_VETO_DEVSET_ZH_V1_ITEMS = DEVSET.items;

/** @type {readonly ConfideMoodVetoDevsetClass[]} */
export const CONFIDE_MOOD_VETO_DEVSET_ZH_V1_CLASSES = Object.freeze([
  'practice-aversion',
  'present-discomfort',
  'unbidden-recall',
  'escape-urge',
  'practice-fatigue'
]);
