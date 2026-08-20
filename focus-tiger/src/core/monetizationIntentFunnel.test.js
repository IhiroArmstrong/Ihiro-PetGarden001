/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  MONETIZATION_FUNNEL_EVENTS,
  MONETIZATION_FUNNEL_STORAGE_KEY,
  MonetizationFunnelStore,
  isAllowedMonetizationFunnelCountKey,
  monetizationFunnelCountKey,
  monetizationFunnelCountKeys,
  normalizeMonetizationFunnelState,
  parseMonetizationFunnelLayout,
  readMonetizationFunnelState
} from './monetizationIntentFunnel.js';

function memoryStorage(seed = {}) {
  const map = new Map(Object.entries(seed));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => {
      map.set(k, String(v));
    },
    removeItem: (k) => {
      map.delete(k);
    }
  };
}

describe('monetizationIntentFunnel', () => {
  it('count keys combine name + track', () => {
    assert.equal(
      monetizationFunnelCountKey('support_cta', 'tea'),
      'support_cta:tea'
    );
    assert.equal(monetizationFunnelCountKey('support_open', null), 'support_open');
  });

  it('records Support → CTA → checkout → complete counts', () => {
    const storage = memoryStorage();
    const logged = [];
    const store = new MonetizationFunnelStore({
      storage,
      now: () => new Date('2026-08-12T10:00:00Z'),
      track: (name, props) => logged.push({ name, props })
    });
    store.supportOpen('fab');
    store.supportCta('tea');
    store.checkoutStart('tea', 'tip-jar');
    store.checkoutComplete('tea');
    const state = store.read();
    assert.equal(state.counts['support_open'], 1);
    assert.equal(state.counts['support_cta:tea'], 1);
    assert.equal(state.counts['checkout_start:tea'], 1);
    assert.equal(state.counts['checkout_complete:tea'], 1);
    assert.equal(state.events.length, 4);
    assert.equal(logged.length, 4);
    assert.ok(storage.getItem(MONETIZATION_FUNNEL_STORAGE_KEY));
  });

  it('separates sanctuary vs membership CTA', () => {
    const store = new MonetizationFunnelStore({ storage: memoryStorage() });
    store.supportCta('sanctuary');
    store.supportCta('membership');
    const { counts } = store.read();
    assert.equal(counts['support_cta:sanctuary'], 1);
    assert.equal(counts['support_cta:membership'], 1);
  });

  it('normalizes corrupt storage and caps events', () => {
    assert.deepEqual(normalizeMonetizationFunnelState(null), {
      counts: {},
      events: []
    });
    const storage = memoryStorage({
      [MONETIZATION_FUNNEL_STORAGE_KEY]: 'not-json'
    });
    assert.deepEqual(readMonetizationFunnelState(storage), {
      counts: {},
      events: []
    });
    const store = new MonetizationFunnelStore({ storage: memoryStorage() });
    for (let i = 0; i < 90; i++) store.supportOpen('fab');
    assert.equal(store.read().events.length, 80);
    assert.equal(store.read().counts.support_open, 90);
  });

  it('formatSummary lists counts', () => {
    const store = new MonetizationFunnelStore({ storage: memoryStorage() });
    store.checkoutCancel('tea');
    const text = store.formatSummary();
    assert.match(text, /checkout_cancel:tea = 1/);
    assert.match(text, /Monetization intent funnel/);
  });

  it('exports stable event names for PROCESS nodes', () => {
    assert.equal(MONETIZATION_FUNNEL_EVENTS.SUPPORT_OPEN, 'support_open');
    assert.equal(MONETIZATION_FUNNEL_EVENTS.SUPPORT_CTA, 'support_cta');
    assert.equal(MONETIZATION_FUNNEL_EVENTS.CHECKOUT_START, 'checkout_start');
    assert.equal(
      MONETIZATION_FUNNEL_EVENTS.CHECKOUT_COMPLETE,
      'checkout_complete'
    );
  });

  it('parses Support Modal layout dimension', () => {
    assert.equal(parseMonetizationFunnelLayout('tea-first'), 'tea-first');
    assert.equal(
      parseMonetizationFunnelLayout('sanctuary-first'),
      'sanctuary-first'
    );
    assert.equal(parseMonetizationFunnelLayout('tea'), null);
    assert.equal(parseMonetizationFunnelLayout('hack'), null);
  });

  it('count keys include layout and track×layout', () => {
    assert.deepEqual(
      monetizationFunnelCountKeys('support_open', { layout: 'tea-first' }),
      ['support_open', 'support_open:tea-first']
    );
    assert.deepEqual(
      monetizationFunnelCountKeys('support_cta', {
        track: 'tea',
        layout: 'tea-first'
      }),
      [
        'support_cta',
        'support_cta:tea',
        'support_cta:tea-first',
        'support_cta:tea:tea-first'
      ]
    );
    assert.equal(
      isAllowedMonetizationFunnelCountKey('support_open:tea-first'),
      true
    );
    assert.equal(
      isAllowedMonetizationFunnelCountKey('support_cta:tea:sanctuary-first'),
      true
    );
    assert.equal(
      isAllowedMonetizationFunnelCountKey('support_cta:tea:hack'),
      false
    );
    assert.equal(isAllowedMonetizationFunnelCountKey('evil:tea'), false);
  });

  it('records tea-first layout on Support open and tea CTA', () => {
    const store = new MonetizationFunnelStore({ storage: memoryStorage() });
    store.supportOpen('fab', 'tea-first');
    store.supportCta('tea', 'support-modal', 'tea-first');
    const { counts, events } = store.read();
    assert.equal(counts.support_open, 1);
    assert.equal(counts['support_open:tea-first'], 1);
    assert.equal(counts['support_cta:tea'], 1);
    assert.equal(counts['support_cta:tea-first'], 1);
    assert.equal(counts['support_cta:tea:tea-first'], 1);
    assert.equal(events[0].layout, 'tea-first');
    assert.equal(events[1].layout, 'tea-first');
    assert.equal(events[1].track, 'tea');
  });

  it('keeps layout null on legacy events without the field', () => {
    const state = normalizeMonetizationFunnelState({
      counts: { support_open: 1 },
      events: [
        {
          at: '2026-08-20T00:00:00Z',
          name: 'support_open',
          track: null,
          source: 'fab'
        }
      ]
    });
    assert.equal(state.events[0].layout, null);
  });
});
