/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { CONFIDE_ROUTE } from './confideRoutes.js';
import { resolveConfideReply } from './confideReplyFlow.js';

test('resolveConfideReply: empty → null', () => {
  assert.equal(resolveConfideReply({ text: '  ' }), null);
});

test('resolveConfideReply: safety never returns zen fallback line', () => {
  const hit = resolveConfideReply({
    text: 'I want to die',
    localDate: '2026-08-10'
  });
  assert.ok(hit);
  assert.equal(hit.route, CONFIDE_ROUTE.SAFETY_REDIRECT);
  assert.equal(hit.line.route, CONFIDE_ROUTE.SAFETY_REDIRECT);
});

test('resolveConfideReply: unmatched → fallback line', () => {
  const hit = resolveConfideReply({
    text: 'the weather is mild today',
    localDate: '2026-08-10'
  });
  assert.ok(hit);
  assert.equal(hit.route, CONFIDE_ROUTE.FALLBACK);
  assert.equal(hit.line.route, CONFIDE_ROUTE.FALLBACK);
});
