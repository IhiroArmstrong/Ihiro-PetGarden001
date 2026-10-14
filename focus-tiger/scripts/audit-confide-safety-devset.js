#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Score the in-repo safety development set. Prints ids and rates only.
 *
 * Labels are the caliber. Do not subtract extra ids.
 *   caliber-63 = class crisis-explicit (after excluded_ids)
 *   caliber-58 = those rows with caliber_58 !== false
 *
 *   npm run audit:confide-safety-devset
 */

import {
  CONFIDE_SAFETY_DEVSET_ZH_V1_ITEMS,
  CONFIDE_SAFETY_DEVSET_ZH_V1_META
} from '../src/core/confide/confideSafetyDevsetZhV1.js';
import { matchesSafetyRedirect } from '../src/core/confide/confideSafetyKeywords.js';

const EXCLUDED = new Set(CONFIDE_SAFETY_DEVSET_ZH_V1_META.excluded_ids || []);

function rows(className) {
  return CONFIDE_SAFETY_DEVSET_ZH_V1_ITEMS.filter(
    (row) => row.class === className && !EXCLUDED.has(row.id)
  );
}

function inCaliber58(row) {
  return row.caliber_58 !== false;
}

/**
 * @param {typeof CONFIDE_SAFETY_DEVSET_ZH_V1_ITEMS} pool
 * @param {string} label
 */
function printCrisisCaliber(pool, label) {
  const pass = pool.filter((row) => matchesSafetyRedirect(row.text));
  const fail = pool.filter((row) => !matchesSafetyRedirect(row.text));
  const rate = pool.length ? ((pass.length / pool.length) * 100).toFixed(1) : 'n/a';
  console.log(
    `[audit:confide-safety-devset] ${label} ${pass.length}/${pool.length} (${rate}%)`
  );
  console.log(
    `[audit:confide-safety-devset] ${label} fail ids: ${fail.map((row) => row.id).join(', ') || '(none)'}`
  );
}

function main() {
  const crisis63 = rows('crisis-explicit');
  const crisis58 = crisis63.filter(inCaliber58);
  const escape = rows('escape-noncrisis');
  const grey = CONFIDE_SAFETY_DEVSET_ZH_V1_ITEMS.filter((row) => row.class === 'crisis-grey');

  const escapeFp = escape.filter((row) => matchesSafetyRedirect(row.text));
  const greySafety = grey.filter((row) => matchesSafetyRedirect(row.text));

  printCrisisCaliber(crisis63, 'caliber-63');
  printCrisisCaliber(crisis58, 'caliber-58');

  console.log(
    `[audit:confide-safety-devset] escape-noncrisis FP ${escapeFp.length}/${escape.length}`
  );
  console.log(
    `[audit:confide-safety-devset] crisis-grey report-only safety ${greySafety.length}/${grey.length}`
  );
  console.log(
    `[audit:confide-safety-devset] escape FP ids: ${escapeFp.map((row) => row.id).join(', ') || '(none)'}`
  );
  console.log(
    `[audit:confide-safety-devset] grey safety ids: ${greySafety.map((row) => row.id).join(', ') || '(none)'}`
  );
}

main();
