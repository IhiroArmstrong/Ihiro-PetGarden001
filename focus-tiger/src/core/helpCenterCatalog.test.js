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
