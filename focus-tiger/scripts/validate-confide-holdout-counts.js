#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Validate-only holdout inventory. Counts, never utterances. Does not increment
 * the embedding-lab run cap.
 *
 *   FT_CONFIDE_MOOD_HOLDOUT_PATH=/abs/outside.json \\
 *     npm run validate:confide-holdout-counts
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CONFIDE_MOOD_HOLDOUT_CLASS_IDS,
  CONFIDE_HOLDOUT_ROUTING_CLASS_IDS,
  inventoryHoldoutCounts,
  redactHoldoutError,
  resolveHoldoutFilePath
} from '../src/core/confide/confideMoodVetoHoldoutLab.js';

const FOCUS_TIGER = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const MOOD_POS_MIN = 20;
const MOOD_COUNTER_MIN = 20;
const MOOD_IQ_MIN = 5;
const MOOD_PO_MIN = 5;
const ROUTING_N_MIN = 60;
const ESCAPE_NONCRISIS_MIN = 20;

function loadItems(data) {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && Array.isArray(data.items)) return data.items;
  throw new Error('holdout JSON 无法解析');
}

function gap(have, need) {
  const d = Number(have) - Number(need);
  return d >= 0 ? 0 : -d;
}

async function main() {
  let holdoutPath;
  try {
    holdoutPath = resolveHoldoutFilePath(process.env.FT_CONFIDE_MOOD_HOLDOUT_PATH, FOCUS_TIGER);
  } catch (err) {
    process.stderr.write(`[holdout-validate] ${redactHoldoutError(err)}\n`);
    process.exit(1);
  }

  let items;
  try {
    const data = JSON.parse(await readFile(holdoutPath, 'utf8'));
    items = loadItems(data);
  } catch (err) {
    process.stderr.write(`[holdout-validate] ${redactHoldoutError(err)}\n`);
    process.exit(1);
  }

  const bag = inventoryHoldoutCounts(items);
  process.stdout.write('[holdout-validate] counts only; no utterances\n');
  process.stdout.write(`[holdout-validate] items=${items.length} classes=${Object.keys(bag).sort().join(',')}\n`);

  let failed = false;
  for (const id of CONFIDE_MOOD_HOLDOUT_CLASS_IDS) {
    const s = bag[id] || {};
    const pos = id === 'escape-urge' ? Number(s.n_noncrisis_positive || 0) : Number(s.n_positive || 0);
    const row = {
      class: id,
      n: s.n || 0,
      positive: pos,
      counter: s.n_counter || 0,
      iq: s.n_interrogative_positive || 0,
      po_spoken: s.n_po_spoken || 0,
      crisis_edge: s.n_crisis_edge || 0,
      crisis_grey: s.n_crisis_grey || 0,
      gap_positive: gap(pos, id === 'escape-urge' ? ESCAPE_NONCRISIS_MIN : MOOD_POS_MIN),
      gap_counter: gap(s.n_counter || 0, MOOD_COUNTER_MIN),
      gap_iq: gap(s.n_interrogative_positive || 0, MOOD_IQ_MIN),
      gap_po: gap(s.n_po_spoken || 0, MOOD_PO_MIN)
    };
    if (row.gap_positive || row.gap_counter || row.gap_iq || row.gap_po) failed = true;
    process.stdout.write(`[holdout-validate] ${JSON.stringify(row)}\n`);
  }
  for (const id of CONFIDE_HOLDOUT_ROUTING_CLASS_IDS) {
    const s = bag[id] || {};
    const n = s.n || 0;
    const need = id === 'mixed-emotion-dominant' ? 0 : ROUTING_N_MIN;
    const row = {
      class: id,
      n,
      positive: s.n_positive || 0,
      counter: s.n_counter || 0,
      po_spoken: s.n_po_spoken || 0,
      gap_n: need ? gap(n, need) : 0
    };
    if (row.gap_n) failed = true;
    process.stdout.write(`[holdout-validate] ${JSON.stringify(row)}\n`);
  }
  process.stdout.write(`[holdout-validate] ${failed ? 'GAPS' : 'OK'}\n`);
  process.exit(failed ? 2 : 0);
}

main().catch((err) => {
  process.stderr.write(`[holdout-validate] ${redactHoldoutError(err)}\n`);
  process.exit(1);
});
