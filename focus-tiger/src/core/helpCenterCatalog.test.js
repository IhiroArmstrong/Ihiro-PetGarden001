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
  listHelpCenterArticlesForSection,
  reconcileHelpCenterArticleCount
} from './helpCenterCatalog.js';
import {
  catalogEntryExportError,
  GRANDFATHERED_HELP_CENTER_IDS,
  HELP_ONLY_BACKFILL_IDS,
  helpCenterLocaleStem,
  isYinRetrievableCatalogEntry,
  listHelpCenterVisibleCatalogEntries
} from './confide/productKnowledgeCatalogGate.js';

const catalog = JSON.parse(
  readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), 'confide/productKnowledgeCatalog.json'),
    'utf8'
  )
);

const slice = JSON.parse(
  readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), '../locales/slices/help-center.json'),
    'utf8'
  )
);

test('help center articles never include internal ops kb ids', () => {
  for (const row of HELP_CENTER_ARTICLES) {
    assert.ok(!row.id.startsWith('KB-OPS-'));
    assert.ok(!row.kbTraceId?.startsWith('KB-OPS-'));
  }
});

test('catalog export contract: no forbidden combos or draft ids', () => {
  for (const entry of catalog.entries) {
    assert.equal(catalogEntryExportError(entry), null, entry.id);
    assert.ok(!String(entry.id).startsWith('KB-PSY-DRAFT-'), entry.id);
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

test('every help-visible catalog entry has a help center article', () => {
  const helpIds = new Set(HELP_CENTER_ARTICLES.map((row) => row.id));
  for (const entry of listHelpCenterVisibleCatalogEntries(catalog)) {
    assert.ok(helpIds.has(entry.id), `missing help article for ${entry.id}`);
  }
});

test('help center article count matches helpCenterVisible rows', () => {
  const recon = reconcileHelpCenterArticleCount();
  assert.equal(recon.delta, 0);
  assert.equal(recon.articleCount, recon.helpVisibleCount);
  assert.equal(recon.articleCount, 57);
});

test('help center includes breath inventory article KB-FUNC-0006', () => {
  assert.ok(findHelpCenterArticle('KB-FUNC-0006'));
});

test('help-only backfill rows are in catalog and not yin-retrievable', () => {
  const byId = Object.fromEntries(catalog.entries.map((row) => [row.id, row]));
  for (const id of HELP_ONLY_BACKFILL_IDS) {
    const entry = byId[id];
    assert.ok(entry, `missing catalog row ${id}`);
    assert.equal(entry.yinMayRetrieve, false);
    assert.equal(entry.helpCenterVisible, true);
    assert.equal(isYinRetrievableCatalogEntry(entry), false);
    assert.ok(findHelpCenterArticle(id));
  }
});

test('grandfathered HELP-* ids stay help-only; no new HELP-* prefix beyond the set', () => {
  for (const entry of catalog.entries) {
    if (String(entry.id).startsWith('HELP-')) {
      assert.ok(
        GRANDFATHERED_HELP_CENTER_IDS.includes(entry.id),
        `new HELP-* id not allowed: ${entry.id}`
      );
      assert.equal(entry.yinMayRetrieve, false);
    }
  }
});

test('help-only English bodies match catalog; every visible row has a locale body', () => {
  for (const entry of listHelpCenterVisibleCatalogEntries(catalog)) {
    const key = `${helpCenterLocaleStem(entry.id)}_BODY`;
    assert.equal(typeof slice.en[key], 'string', key);
    assert.ok(slice.en[key].length > 0, `${key} empty`);
    if (entry.yinMayRetrieve === false) {
      assert.equal(slice.en[key], entry.shortAnswerEn, entry.id);
    }
    for (const loc of ['zh', 'ja']) {
      assert.equal(typeof slice[loc][key], 'string', `${loc} ${key}`);
      assert.ok(slice[loc][key].length > 0, `${loc} ${key} empty`);
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
  assert.match(
    slice.en.HELP_CENTER_ARTICLE_KB_EDU_0002_BODY,
    /Wellness isn't only about the gym\. Many people overlook a more foundational practice: training the mind\./
  );
  assert.ok(listHelpCenterArticlesForSection('practice').map((row) => row.id).includes('HELP-BREATH-DURATION'));
  assert.ok(listHelpCenterArticlesForSection('data').map((row) => row.id).includes('HELP-BADGE-NOT-COIN'));
  assert.ok(listHelpCenterArticlesForSection('start').map((row) => row.id).includes('HELP-DEVICES-SAFARI'));
});
