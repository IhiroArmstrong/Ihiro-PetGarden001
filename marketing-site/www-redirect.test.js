/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import worker from './_worker.js';
import { redirectWwwToApex } from './www-redirect.js';

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
