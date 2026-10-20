/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  confideObjectKeywordMatches,
  stemEnglishPluralConservative
} from './confideObjectNormalize.js';

describe('confideObjectNormalize', () => {
  it('joins only two adjacent tokens for space compounds', () => {
    assert.equal(confideObjectKeywordMatches('back up', 'backup'), true);
    assert.equal(confideObjectKeywordMatches('back-up', 'backup'), true);
    assert.equal(confideObjectKeywordMatches('backups', 'backup'), true);
    assert.equal(confideObjectKeywordMatches('his it', 'sit'), false);
  });

  it('does not stem short words or -us/-ss endings', () => {
    assert.equal(stemEnglishPluralConservative('bus'), 'bus');
    assert.equal(stemEnglishPluralConservative('yes'), 'yes');
    assert.equal(stemEnglishPluralConservative('gas'), 'gas');
    assert.equal(stemEnglishPluralConservative('focus'), 'focus');
    assert.equal(stemEnglishPluralConservative('class'), 'class');
    assert.equal(stemEnglishPluralConservative('backups'), 'backup');
  });
});
