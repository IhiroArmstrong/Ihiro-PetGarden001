/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import worker from './_worker.js';
import {
  redirectMarketingHost,
  redirectWwwToApex
} from './www-redirect.js';

describe('www → apex redirect', () => {
  it('301s www onto the apex hostname and keeps the path', () => {
    const res = redirectWwwToApex(
      new Request('https://www.twinsology.com/privacy.html')
    );
    assert.equal(res.status, 301);
    assert.equal(
      res.headers.get('location'),
      'https://twinsology.com/privacy.html'
    );
  });

  it('does not redirect the apex host', () => {
    assert.equal(
      redirectWwwToApex(new Request('https://twinsology.com/')),
      null
    );
  });

  it('301s www.samatia.net onto samatia.net without the live flag', () => {
    const res = redirectMarketingHost(
      new Request('https://www.samatia.net/ja.html'),
      {}
    );
    assert.equal(res.status, 301);
    assert.equal(res.headers.get('location'), 'https://samatia.net/ja.html');
  });

  it('does not 301 twinsology.com to samatia.net until SAMATIA_CANONICAL_LIVE', () => {
    assert.equal(
      redirectMarketingHost(new Request('https://twinsology.com/'), {}),
      null
    );
    const live = redirectMarketingHost(new Request('https://twinsology.com/privacy.html'), {
      SAMATIA_CANONICAL_LIVE: '1'
    });
    assert.equal(live.status, 301);
    assert.equal(
      live.headers.get('location'),
      'https://samatia.net/privacy.html'
    );
  });

  it('_worker.js serves static assets for apex', async () => {
    const res = await worker.fetch(new Request('https://twinsology.com/'), {
      ASSETS: {
        fetch: async () => new Response('apex', { status: 200 }),
      },
    });
    assert.equal(res.status, 200);
    assert.equal(await res.text(), 'apex');
  });
});
