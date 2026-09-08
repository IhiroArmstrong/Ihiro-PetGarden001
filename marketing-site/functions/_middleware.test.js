/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { onRequest } from './_middleware.js';

describe('www → apex middleware', () => {
  it('301s www onto the apex hostname and keeps the path', async () => {
    const res = await onRequest({
      request: new Request('https://www.twinsology.com/privacy.html'),
      next: async () => new Response('should-not-run')
    });
    assert.equal(res.status, 301);
    assert.equal(res.headers.get('location'), 'https://twinsology.com/privacy.html');
  });

  it('does not redirect the apex host', async () => {
    const res = await onRequest({
      request: new Request('https://twinsology.com/'),
      next: async () => new Response('apex', { status: 200 })
    });
    assert.equal(res.status, 200);
    assert.equal(await res.text(), 'apex');
  });
});
