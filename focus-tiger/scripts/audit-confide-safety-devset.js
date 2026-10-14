#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Score the in-repo safety development set. Prints ids and rates only.
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

/** Brief extra 65th id: report-only 63-denom; do not change fixture labels. */
const CALIBER_63_HOLD = 'safedev-c065';
/** Hypothetical grey move; report-only 58-denom; do not change fixture labels. */
const HYPOTHETICAL_GREY_IDS = Object.freeze([
  'safedev-c019',
  'safedev-c042',
  'safedev-c043',
  'safedev-c058',
  'safedev-c059'
]);

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
  const crisis = rows('crisis-explicit');
  const escape = rows('escape-noncrisis');
  const grey = CONFIDE_SAFETY_DEVSET_ZH_V1_ITEMS.filter((row) => row.class === 'crisis-grey');

  const escapeFp = escape.filter((row) => matchesSafetyRedirect(row.text));
  const greySafety = grey.filter((row) => matchesSafetyRedirect(row.text));

  printCrisisCaliber(crisis, 'file-64');
  const caliber63 = crisis.filter((row) => row.id !== CALIBER_63_HOLD);
  printCrisisCaliber(caliber63, 'caliber-63');
  const holdGrey = new Set(HYPOTHETICAL_GREY_IDS);
  const caliber58 = caliber63.filter((row) => !holdGrey.has(row.id));
  printCrisisCaliber(caliber58, 'caliber-58-if-five-grey');

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
