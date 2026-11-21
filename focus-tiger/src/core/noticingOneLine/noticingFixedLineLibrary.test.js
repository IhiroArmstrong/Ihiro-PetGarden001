/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { inspectModelOutput } from '../outputGate/outputGateRules.js';
import { CONFIDE_CORPUS } from '../confide/confideCorpus.js';
import { CONFIDE_ROUTE } from '../confide/confideRoutes.js';
import {
  NOTICING_FIXED_LINES,
  NOTICING_HOLD_KIND,
  NOTICING_INVITE_KIND,
  NOTICING_LINT_EXEMPT_LINE_IDS,
  enBannedHits,
  lintNoticingFixedLine,
  lintNoticingFixedLibrary,
  noticingFixedLineLocaleKey,
  noticingFixedLineText,
  pickNoticingFixedLine,
  shouldUseNoticingFixedLine,
  zhBannedHits
} from './noticingFixedLineLibrary.js';

const here = dirname(fileURLToPath(import.meta.url));

test('v0.3.1 library is 18 hold + 19 invite; item-7 drops stay out', () => {
  const ids = NOTICING_FIXED_LINES.map((l) => l.id);
  assert.equal(NOTICING_FIXED_LINES.length, 37);
  assert.equal(
    NOTICING_FIXED_LINES.filter((l) => l.kind === NOTICING_HOLD_KIND).length,
    18
  );
  assert.equal(
    NOTICING_FIXED_LINES.filter((l) => l.kind === NOTICING_INVITE_KIND).length,
    19
  );
  assert.ok(ids.filter((id) => id.startsWith('A-')).length >= 15);
  assert.ok(ids.filter((id) => id.startsWith('B-')).length >= 15);
  assert.equal(new Set(ids).size, 37);
  assert.equal(
    ids.some((id) => id === 'A-13' || id === 'A-15' || id === 'B-12'),
    false
  );
});

test('phrase-library lint passes for every A/B line', () => {
  assert.deepEqual(lintNoticingFixedLibrary(), []);
});

test('locale slice matches catalog for en/zh/ja', () => {
  const slice = JSON.parse(
    readFileSync(
      join(here, '../../locales/slices/noticing-fixed-line-library.json'),
      'utf8'
    )
  );
  for (const line of NOTICING_FIXED_LINES) {
    const key = noticingFixedLineLocaleKey(line.id);
    assert.equal(slice.en[key], line.en, key);
    assert.equal(slice.zh[key], line.zh, key);
    assert.equal(slice.ja[key], line.ja, key);
  }
});

test('G3: every en/zh/ja line is allowed by the existing output-gate inspector', () => {
  /** @type {string[]} */
  const hits = [];
  for (const line of NOTICING_FIXED_LINES) {
    for (const locale of ['en', 'zh', 'ja']) {
      const text = noticingFixedLineText(line, locale);
      const found = inspectModelOutput(text);
      if (found.category || found.uncovered) {
        hits.push(`${line.id}:${locale}:${found.category || 'uncovered'}`);
      }
    }
  }
  assert.deepEqual(hits, []);
});

test('non-crisis routes use the library; safety redirect, aggression, ja-not-open do not', () => {
  assert.equal(shouldUseNoticingFixedLine(CONFIDE_ROUTE.FALLBACK), true);
  assert.equal(shouldUseNoticingFixedLine(CONFIDE_ROUTE.SAD), true);
  assert.equal(
    shouldUseNoticingFixedLine(CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS),
    false
  );
  assert.equal(shouldUseNoticingFixedLine(CONFIDE_ROUTE.SAFETY_CARE), true);
  assert.equal(shouldUseNoticingFixedLine(CONFIDE_ROUTE.SAFETY_REDIRECT), false);
  assert.equal(
    shouldUseNoticingFixedLine(CONFIDE_ROUTE.LANGUAGE_NOT_YET_OPEN),
    false
  );
  assert.equal(
    pickNoticingFixedLine({
      route: CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS,
      localDate: '2026-11-21'
    }),
    null
  );
  assert.ok(
    pickNoticingFixedLine({
      route: CONFIDE_ROUTE.SAFETY_CARE,
      localDate: '2026-11-21'
    })
  );
});

test('same-session exclude rotates IDs', () => {
  const exclude = new Set();
  const ids = [];
  for (let salt = 0; salt < 12; salt += 1) {
    const line = pickNoticingFixedLine({
      route: CONFIDE_ROUTE.FALLBACK,
      localDate: '2026-11-19',
      salt,
      excludeIds: exclude,
      locale: 'en'
    });
    assert.ok(line);
    assert.match(line.id, /^[AB]-\d{2}$/);
    ids.push(line.id);
    exclude.add(line.id);
  }
  assert.equal(new Set(ids).size, 12);
});

test('dedicated aggression pool is exempt from noticing banned-phrase lint', () => {
  const pool = CONFIDE_CORPUS.filter(
    (line) => line.route === CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS
  );
  assert.deepEqual(
    pool.map((line) => line.id).sort(),
    [...NOTICING_LINT_EXEMPT_LINE_IDS].sort()
  );
  for (const line of pool) {
    assert.equal(
      NOTICING_FIXED_LINES.some((row) => row.id === line.id),
      false
    );
  }
  const anger = pool.find((line) => line.id === 'aggression-01');
  assert.ok(enBannedHits(anger.en).includes('sounds like'));
  assert.ok(zhBannedHits(anger.zh).includes('听起来'));
  assert.ok(lintNoticingFixedLine(anger).length > 0);
  assert.deepEqual(lintNoticingFixedLibrary(pool), []);
  assert.deepEqual(lintNoticingFixedLibrary(), []);
});
