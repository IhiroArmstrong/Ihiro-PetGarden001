/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { maskEmailForAccount } from './maskEmailForAccount.js';

describe('maskEmailForAccount', () => {
  it('keeps the first local character and the domain', () => {
    assert.equal(maskEmailForAccount('sam@gmail.com'), 's•••@gmail.com');
  });

  it('still masks a one-character local part', () => {
    assert.equal(maskEmailForAccount('a@x.co'), 'a•••@x.co');
  });

  it('does not echo the raw address', () => {
    const raw = 'hello.world@example.org';
    const masked = maskEmailForAccount(raw);
    assert.equal(masked.includes('hello.world'), false);
    assert.equal(masked, 'h•••@example.org');
  });

  it('returns a placeholder for junk', () => {
    assert.equal(maskEmailForAccount(''), '•••');
    assert.equal(maskEmailForAccount('not-an-email'), '•••');
  });
});
