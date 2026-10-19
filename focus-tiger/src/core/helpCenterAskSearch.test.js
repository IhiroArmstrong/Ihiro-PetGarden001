/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isHelpCenterAskImperativeShape,
  normalizeHelpCenterAskText,
  resolveHelpCenterAskSubmitPolicy,
  searchHelpCenterAskCards
} from './helpCenterAskSearch.js';

test('normalizeHelpCenterAskText maps back up to backup for retrieval', () => {
  assert.equal(normalizeHelpCenterAskText('Back up now'), 'backup now');
});

test('imperative backup phrase is imperative-shaped, not executed on submit', () => {
  assert.equal(isHelpCenterAskImperativeShape('Back up now'), true);
  const policy = resolveHelpCenterAskSubmitPolicy('Back up now');
  assert.equal(policy.shouldExecute, false);
  assert.equal(policy.shouldSearch, true);
});

test('question-shaped backup ask lists backup article without embedding', () => {
  const result = searchHelpCenterAskCards('How do I back up my data?', {
    embeddingState: 'not_ready'
  });
  assert.equal(result.empty, false);
  assert.ok(result.articleIds.includes('KB-FUNC-0003'));
});

test('imperative backup lists backup article via alias (no command execution)', () => {
  const result = searchHelpCenterAskCards('Back up now', {
    embeddingState: 'not_ready'
  });
  assert.equal(result.imperativeShape, true);
  assert.equal(result.empty, false);
  assert.ok(result.articleIds.includes('KB-FUNC-0003'));
});

test('unrelated gibberish returns empty ask results', () => {
  const result = searchHelpCenterAskCards('xyzzy totally unrelated noodle', {
    embeddingState: 'not_ready'
  });
  assert.equal(result.empty, true);
  assert.deepEqual(result.articleIds, []);
});

test('focus start imperative does not imply execution from Help Center policy', () => {
  assert.equal(isHelpCenterAskImperativeShape('Start a 25-minute focus'), true);
  assert.equal(resolveHelpCenterAskSubmitPolicy('Start a 25-minute focus').shouldExecute, false);
});
