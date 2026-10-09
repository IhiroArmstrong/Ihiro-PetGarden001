/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  HELP_CENTER_ARTICLES,
  findHelpCenterArticle,
  listHelpCenterArticlesForSection
} from './helpCenterCatalog.js';

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
