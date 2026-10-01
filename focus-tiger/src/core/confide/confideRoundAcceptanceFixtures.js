/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Master Confide round acceptance set — 100 frozen utterances (PO 2026-09-19).
 * Composes meta-query (32) + aggression (30) + supplement (38).
 * Passing 100/100 = regex routing meat-test termination; not L3 quality or Stage 2 shadow cutover.
 */

import { CONFIDE_AGGRESSION_ACCEPTANCE_FIXTURES } from './confideAggressionAcceptanceFixtures.js';
import { CONFIDE_META_QUERY_ACCEPTANCE_FIXTURES } from './confideMetaQueryAcceptanceFixtures.js';
import { CONFIDE_ROUND_ACCEPTANCE_SUPPLEMENT_FIXTURES } from './confideRoundAcceptanceSupplementFixtures.js';

/** @typedef {'meta_query' | 'aggression_route' | 'classify_route' | 'desktop_source' | 'generate_eligible'} ConfideRoundAssertionKind */

/**
 * @typedef {Readonly<{
 *   id: string,
 *   text: string,
 *   kind: ConfideRoundAssertionKind,
 *   expect: string,
 *   suite: 'meta' | 'aggression' | 'supplement',
 *   note?: string
 * }>} ConfideRoundAcceptanceFixture
 */

/** @type {readonly ConfideRoundAcceptanceFixture[]} */
export const CONFIDE_ROUND_ACCEPTANCE_FIXTURES = Object.freeze([
  ...CONFIDE_META_QUERY_ACCEPTANCE_FIXTURES.map((row) =>
    Object.freeze({
      id: row.id,
      text: row.text,
      kind: 'meta_query',
      expect: row.bucket,
      suite: 'meta',
      note: row.note
    })
  ),
  ...CONFIDE_AGGRESSION_ACCEPTANCE_FIXTURES.map((row) =>
    Object.freeze({
      id: row.id,
      text: row.text,
      kind: 'aggression_route',
      expect: row.route,
      suite: 'aggression',
      note: row.note
    })
  ),
  ...CONFIDE_ROUND_ACCEPTANCE_SUPPLEMENT_FIXTURES.map((row) =>
    Object.freeze({
      id: row.id,
      text: row.text,
      kind: row.kind,
      expect: row.expect,
      suite: 'supplement',
      note: row.note
    })
  )
]);

export const CONFIDE_ROUND_ACCEPTANCE_COUNTS = Object.freeze({
  total: CONFIDE_ROUND_ACCEPTANCE_FIXTURES.length,
  meta: CONFIDE_META_QUERY_ACCEPTANCE_FIXTURES.length,
  aggression: CONFIDE_AGGRESSION_ACCEPTANCE_FIXTURES.length,
  supplement: CONFIDE_ROUND_ACCEPTANCE_SUPPLEMENT_FIXTURES.length
});

/**
 * @param {'meta' | 'aggression' | 'supplement'} suite
 * @returns {readonly ConfideRoundAcceptanceFixture[]}
 */
export function fixturesForRoundAcceptanceSuite(suite) {
  return CONFIDE_ROUND_ACCEPTANCE_FIXTURES.filter((row) => row.suite === suite);
}
