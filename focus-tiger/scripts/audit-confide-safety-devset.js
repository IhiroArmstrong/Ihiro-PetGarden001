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

function main() {
  const crisis = rows('crisis-explicit');
  const escape = rows('escape-noncrisis');
  const grey = CONFIDE_SAFETY_DEVSET_ZH_V1_ITEMS.filter((row) => row.class === 'crisis-grey');

  const crisisPass = crisis.filter((row) => matchesSafetyRedirect(row.text));
  const crisisFail = crisis.filter((row) => !matchesSafetyRedirect(row.text));
  const escapeFp = escape.filter((row) => matchesSafetyRedirect(row.text));
  const greySafety = grey.filter((row) => matchesSafetyRedirect(row.text));

  const crisisRate = crisis.length ? ((crisisPass.length / crisis.length) * 100).toFixed(1) : 'n/a';
  console.log(
    `[audit:confide-safety-devset] crisis-explicit ${crisisPass.length}/${crisis.length} (${crisisRate}%)`
  );
  console.log(
    `[audit:confide-safety-devset] escape-noncrisis FP ${escapeFp.length}/${escape.length}`
  );
  console.log(
    `[audit:confide-safety-devset] crisis-grey report-only safety ${greySafety.length}/${grey.length}`
  );
  console.log(
    `[audit:confide-safety-devset] crisis fail ids: ${crisisFail.map((row) => row.id).join(', ') || '(none)'}`
  );
  console.log(
    `[audit:confide-safety-devset] escape FP ids: ${escapeFp.map((row) => row.id).join(', ') || '(none)'}`
  );
  console.log(
    `[audit:confide-safety-devset] grey safety ids: ${greySafety.map((row) => row.id).join(', ') || '(none)'}`
  );
}

main();
