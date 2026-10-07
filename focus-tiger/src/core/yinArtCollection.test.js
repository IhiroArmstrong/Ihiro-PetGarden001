/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { FOCUS_COIN_CURIO_SHOP_IDS } from './focusCoinsLedger.js';
import {
  YIN_ART_SHELF_EXCLUDED,
  YIN_ART_WORKS,
  formatYinArtPrice,
  mergeYinArtOwnedPiece,
  visibleYinArtOwnership,
  writeYinArtCacheFromServer,
  writeYinArtSession
} from './yinArtCollection.js';
import {
  beginYinArtCheckout,
  confirmYinArtReturnQuery,
  signOutYinArt,
  verifyYinArtSignIn
} from './yinArtCollectionCheckout.js';

function memoryStorage() {
  const map = new Map();
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key)
  };
}

test('the shelf is the five approved artworks, not the curio shop', () => {
  assert.equal(YIN_ART_WORKS.length, 5);
  assert.equal(FOCUS_COIN_CURIO_SHOP_IDS.length, 8);
  const ids = YIN_ART_WORKS.map((work) => work.id);
  assert.deepEqual(ids, [
    'moonlit-celadon-jar',
    'amber-phoenix-ewer',
    'amber-hu-vase',
    'gold-inlaid-ge',
    'pale-jade-ding'
  ]);
  assert.deepEqual(
    YIN_ART_WORKS.map((work) => formatYinArtPrice(work.unitAmount)),
    ['$2.99', '$2.99', '$1.99', '$1.99', '$0.99']
  );
  for (const work of YIN_ART_WORKS) {
    assert.equal(work.src.startsWith('/ui/art-collection/'), true);
    assert.equal(YIN_ART_SHELF_EXCLUDED.includes(work.src), false);
    assert.equal(work.src.includes('jun-glaze-saddled-horse'), false);
  }
});

test('a local cache is not shown as owned until this session is signed in', () => {
  const local = memoryStorage();
  const session = memoryStorage();
  mergeYinArtOwnedPiece(local, {
    email: 'yin@example.com',
    artId: 'pale-jade-ding',
    ownedAt: '2026-10-03T00:00:00.000Z',
    receiptId: 'cs_test_paid'
  });
  assert.deepEqual(visibleYinArtOwnership(local, session), {});
  writeYinArtSession(session, 'other@example.com');
  assert.deepEqual(visibleYinArtOwnership(local, session), {});
  writeYinArtSession(session, 'yin@example.com');
  assert.equal(
    visibleYinArtOwnership(local, session)['pale-jade-ding'].ownedAt,
    '2026-10-03T00:00:00.000Z'
  );
  signOutYinArt(session);
  assert.deepEqual(visibleYinArtOwnership(local, session), {});
});

test('opening checkout does not mark the piece owned', async () => {
  const local = memoryStorage();
  const session = memoryStorage();
  let opened = '';
  const result = await beginYinArtCheckout({
    artId: 'gold-inlaid-ge',
    postJson: async () => ({ url: 'https://checkout.stripe.com/c/pay/cs_test_art', sessionId: 'cs_test_art' }),
    openUrl: async (url) => {
      opened = url;
    }
  });
  assert.equal(result.phase, 'opening');
  assert.match(opened, /checkout\.stripe\.com/);
  assert.deepEqual(visibleYinArtOwnership(local, session), {});
  const unknown = await beginYinArtCheckout({
    artId: 'jun-glaze-saddled-horse',
    postJson: async () => {
      throw new Error('should not post');
    }
  });
  assert.deepEqual(unknown, { phase: 'failed', reason: 'unknown' });
});

test('a failed or pending confirm does not add ownership', async () => {
  const local = memoryStorage();
  const session = memoryStorage();
  const pending = await confirmYinArtReturnQuery({
    localStorage: local,
    sessionStorage: session,
    getSearch: () => '?art_session=cs_test_wait',
    replaceUrl: () => {},
    postJson: async () => ({ owned: false, pending: true, artId: 'amber-hu-vase' })
  });
  assert.equal(pending.outcome, 'pending');
  assert.deepEqual(visibleYinArtOwnership(local, session), {});

  const failed = await confirmYinArtReturnQuery({
    localStorage: local,
    sessionStorage: session,
    getSearch: () => '?art_session=cs_test_no',
    replaceUrl: () => {},
    postJson: async () => {
      throw new Error('stripe down');
    }
  });
  assert.equal(failed.outcome, 'failed');
  assert.deepEqual(visibleYinArtOwnership(local, session), {});
});

test('a paid confirm signs in and shows the date', async () => {
  const local = memoryStorage();
  const session = memoryStorage();
  const result = await confirmYinArtReturnQuery({
    localStorage: local,
    sessionStorage: session,
    getSearch: () => '?product=1&art_session=cs_test_paid',
    replaceUrl: () => {},
    postJson: async () => ({
      owned: true,
      email: 'Yin@Example.com',
      artId: 'moonlit-celadon-jar',
      ownedAt: '2026-10-03T12:00:00.000Z',
      receiptId: 'cs_test_paid'
    })
  });
  assert.equal(result.outcome, 'success');
  const owned = visibleYinArtOwnership(local, session);
  assert.equal(owned['moonlit-celadon-jar'].ownedAt, '2026-10-03T12:00:00.000Z');
});

test('sign-in replaces the cache from the server', async () => {
  const local = memoryStorage();
  const session = memoryStorage();
  mergeYinArtOwnedPiece(local, {
    email: 'yin@example.com',
    artId: 'pale-jade-ding',
    ownedAt: '2020-01-01T00:00:00.000Z',
    receiptId: 'stale'
  });
  const rejected = await verifyYinArtSignIn({
    email: 'yin@example.com',
    code: '000000',
    localStorage: local,
    sessionStorage: session,
    postJson: async () => {
      throw new Error('invalid');
    }
  });
  assert.equal(rejected.ok, false);
  assert.deepEqual(visibleYinArtOwnership(local, session), {});

  const ok = await verifyYinArtSignIn({
    email: 'yin@example.com',
    code: '123456',
    localStorage: local,
    sessionStorage: session,
    postJson: async () => ({
      signedIn: true,
      email: 'yin@example.com',
      items: {
        'amber-phoenix-ewer': {
          ownedAt: '2026-10-03T08:00:00.000Z',
          receiptId: 'cs_test_restored'
        }
      }
    })
  });
  assert.equal(ok.ok, true);
  const owned = visibleYinArtOwnership(local, session);
  assert.equal(owned['pale-jade-ding'], undefined);
  assert.equal(owned['amber-phoenix-ewer'].receiptId, 'cs_test_restored');
});

test('server cache write ignores pieces that are not on this shelf', () => {
  const local = memoryStorage();
  writeYinArtCacheFromServer(local, {
    email: 'yin@example.com',
    items: {
      'jun-glaze-saddled-horse': {
        ownedAt: '2026-10-03T00:00:00.000Z',
        receiptId: 'cs_test_nope'
      }
    }
  });
  const session = memoryStorage();
  writeYinArtSession(session, 'yin@example.com');
  assert.deepEqual(visibleYinArtOwnership(local, session), {});
});

test('a paid live sheet is remembered after this session signs in', () => {
  const local = memoryStorage();
  mergeYinArtOwnedPiece(local, {
    email: 'yin@example.com',
    artId: 'celadon-taotie-gu',
    ownedAt: '2026-10-07T12:00:00.000Z',
    receiptId: 'cs_test_sheet'
  });
  const session = memoryStorage();
  writeYinArtSession(session, 'yin@example.com');
  const owned = visibleYinArtOwnership(local, session);
  assert.equal(owned['celadon-taotie-gu'].receiptId, 'cs_test_sheet');
});
