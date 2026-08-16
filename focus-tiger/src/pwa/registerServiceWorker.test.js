/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { registerServiceWorker } from './registerServiceWorker.js';

describe('registerServiceWorker', () => {
  it('skips registration when not production', async () => {
    let calledWith = null;
    const result = await registerServiceWorker({
      isProd: false,
      register: async (url) => {
        calledWith = url;
        return { scope: '/' };
      }
    });
    assert.equal(result, null);
    assert.equal(calledWith, null);
  });

  it('skips when register is unavailable', async () => {
    const result = await registerServiceWorker({
      isProd: true,
      register: null
    });
    assert.equal(result, null);
  });

  it('registers /sw.js in production', async () => {
    let calledWith = null;
    const result = await registerServiceWorker({
      isProd: true,
      register: async (url) => {
        calledWith = url;
        return { scope: '/' };
      }
    });
    assert.equal(calledWith, '/sw.js');
    assert.deepEqual(result, { scope: '/' });
  });

  it('swallows registration errors', async () => {
    const result = await registerServiceWorker({
      isProd: true,
      register: async () => {
        throw new Error('boom');
      }
    });
    assert.equal(result, null);
  });
});
