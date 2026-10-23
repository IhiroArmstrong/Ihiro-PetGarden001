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

test('normalizeHelpCenterAskText keeps spaced compounds; matcher joins adjacent words', () => {
  assert.equal(normalizeHelpCenterAskText('Back up now'), 'back up now');
});

test('imperative backup phrase is B-tier confirm, not silent execute, not search', () => {
  assert.equal(isHelpCenterAskImperativeShape('Back up now'), true);
  const policy = resolveHelpCenterAskSubmitPolicy('Back up now');
  assert.equal(policy.shouldExecute, true);
  assert.equal(policy.shouldSearch, false);
  assert.equal(policy.reason, 'command');
  assert.equal(policy.decision?.command, 'backup');
  assert.equal(policy.decision?.tier, 'B');
  assert.equal(policy.decision?.execute, false);
});

test('address-latch backup in Help Center uses the same closed set', () => {
  const policy = resolveHelpCenterAskSubmitPolicy(
    'Hi Yin, please backup all the app data for me.'
  );
  assert.equal(policy.shouldExecute, true);
  assert.equal(policy.decision?.command, 'backup');
  assert.equal(policy.decision?.tier, 'B');
});

test('question-shaped backup ask still searches and does not operate', () => {
  const policy = resolveHelpCenterAskSubmitPolicy('How do I back up my data?');
  assert.equal(policy.shouldExecute, false);
  assert.equal(policy.shouldSearch, true);
  assert.equal(policy.reason, 'question');
});

test('crisis text in the ask box never starts backup', () => {
  const policy = resolveHelpCenterAskSubmitPolicy('I want to kill myself');
  assert.equal(policy.shouldExecute, false);
  assert.equal(policy.shouldSearch, false);
  assert.equal(policy.reason, 'safety');
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

test('focus start imperative is outside the closed S2 set so Help Center only searches', () => {
  assert.equal(isHelpCenterAskImperativeShape('Start a 25-minute focus'), true);
  const policy = resolveHelpCenterAskSubmitPolicy('Start a 25-minute focus');
  assert.equal(policy.shouldExecute, false);
  assert.equal(policy.shouldSearch, true);
});
