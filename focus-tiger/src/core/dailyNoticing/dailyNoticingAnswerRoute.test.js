/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { routeDailyNoticingAnswer } from './dailyNoticingAnswerRoute.js';

describe('routeDailyNoticingAnswer', () => {
  it('empty answer stays on noticing path', () => {
    assert.deepEqual(routeDailyNoticingAnswer({ text: '  ' }), { kind: 'ok' });
  });

  it('ordinary mood text stays on noticing path', () => {
    const route = routeDailyNoticingAnswer({
      text: 'A bit tired but okay',
      localDate: '2026-11-26',
      locale: 'en'
    });
    assert.equal(route.kind, 'ok');
  });

  it('crisis text routes to fixed safety line (Layer 0)', () => {
    const route = routeDailyNoticingAnswer({
      text: "I don't want to live",
      localDate: '2026-11-26',
      locale: 'en'
    });
    assert.equal(route.kind, 'crisis');
    assert.ok(route.lineText);
    assert.match(route.lineText, /crisis helpline|heavy to hold/i);
    const hit = routeDailyNoticingAnswer({
      text: '不想活',
      localDate: '2026-11-26',
      locale: 'zh'
    });
    assert.equal(hit.kind, 'crisis');
    assert.ok(hit.lineText?.length);
  });

  it('does not invent a separate crisis classifier', () => {
    const route = routeDailyNoticingAnswer({
      text: "I don't want to live",
      localDate: '2026-11-26',
      locale: 'en'
    });
    assert.equal(route.kind, 'crisis');
    assert.notEqual(route.lineText, '');
  });
});