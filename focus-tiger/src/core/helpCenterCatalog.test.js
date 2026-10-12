/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  HELP_CENTER_ARTICLES,
  findHelpCenterArticle,
  listHelpCenterArticlesForSection
} from './helpCenterCatalog.js';

const catalog = JSON.parse(
  readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), 'confide/productKnowledgeCatalog.json'),
    'utf8'
  )
);

test('help center articles never include internal ops kb ids', () => {
  for (const row of HELP_CENTER_ARTICLES) {
    assert.ok(!row.id.startsWith('KB-OPS-'));
    assert.ok(!row.kbTraceId?.startsWith('KB-OPS-'));
  }
});

test('listHelpCenterArticlesForSection returns start topics', () => {
  const ids = listHelpCenterArticlesForSection('start').map((r) => r.id);
  assert.ok(ids.includes('KB-FUNC-0001'));
});

test('findHelpCenterArticle resolves known id', () => {
  assert.equal(findHelpCenterArticle('KB-FUNC-0002')?.sectionId, 'practice');
  assert.equal(findHelpCenterArticle('missing'), null);
});

test('every approved catalog entry has a help center article', () => {
  const helpIds = new Set(HELP_CENTER_ARTICLES.map((row) => row.id));
  for (const entry of catalog.entries) {
    assert.ok(helpIds.has(entry.id), `missing help article for ${entry.id}`);
  }
});

test('help center includes breath inventory article KB-FUNC-0006', () => {
  assert.ok(findHelpCenterArticle('KB-FUNC-0006'));
});

const HELP_CENTER_GAP_IDS = Object.freeze([
  'HELP-BREATH-DURATION',
  'HELP-LOTUS-BLOOMS',
  'HELP-BUY-COLLECTIONS',
  'HELP-BADGE-NOT-COIN'
]);

test('help center gap articles are allowlisted and absent from confide catalog', () => {
  const catalogIds = new Set(catalog.entries.map((entry) => entry.id));
  const practice = listHelpCenterArticlesForSection('practice').map((row) => row.id);
  const data = listHelpCenterArticlesForSection('data').map((row) => row.id);
  assert.ok(practice.includes('HELP-BREATH-DURATION'));
  assert.ok(practice.includes('HELP-LOTUS-BLOOMS'));
  assert.ok(data.includes('HELP-BUY-COLLECTIONS'));
  assert.ok(data.includes('HELP-BADGE-NOT-COIN'));
  for (const id of HELP_CENTER_GAP_IDS) {
    const row = findHelpCenterArticle(id);
    assert.ok(row, `missing help article ${id}`);
    assert.equal(row.kbTraceId, undefined);
    assert.equal(catalogIds.has(id), false, `${id} must not enter Confide catalog`);
  }
});

test('help center keeps 39 KB-traced articles after gap add', () => {
  const kbish = HELP_CENTER_ARTICLES.filter((row) => row.id.startsWith('KB-'));
  assert.equal(kbish.length, 39);
  assert.equal(HELP_CENTER_ARTICLES.length, 43);
});

test('help center gap article locale keys exist in en zh ja', () => {
  const slice = JSON.parse(
    readFileSync(
      join(
        dirname(fileURLToPath(import.meta.url)),
        '../locales/slices/help-center.json'
      ),
      'utf8'
    )
  );
  for (const id of HELP_CENTER_GAP_IDS) {
    const stem = `HELP_CENTER_ARTICLE_${id.replaceAll('-', '_')}`;
    for (const loc of ['en', 'zh', 'ja']) {
      const title = slice[loc][`${stem}_TITLE`];
      const body = slice[loc][`${stem}_BODY`];
      assert.equal(typeof title, 'string', `${loc} ${stem}_TITLE`);
      assert.ok(title.length > 0, `${loc} ${stem}_TITLE empty`);
      assert.equal(typeof body, 'string', `${loc} ${stem}_BODY`);
      assert.ok(body.length > 0, `${loc} ${stem}_BODY empty`);
    }
  }
  assert.match(
    slice.en.HELP_CENTER_ARTICLE_HELP_BADGE_NOT_COIN_BODY,
    /cannot spend a badge/
  );
  assert.match(
    slice.en.HELP_CENTER_ARTICLE_HELP_BREATH_DURATION_BODY,
    /1, 3, 5, 10, or 20 minutes/
  );
});
