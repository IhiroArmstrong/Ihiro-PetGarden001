/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  COMMUNITY_EXTERNAL_URL,
  openCommunityExternalLink
} from './communityLink.js';

describe('communityLink', () => {
  it('exports a non-empty placeholder URL', () => {
    assert.equal(typeof COMMUNITY_EXTERNAL_URL, 'string');
    assert.ok(COMMUNITY_EXTERNAL_URL.startsWith('http'));
  });

  it('opens with noopener target', () => {
    /** @type {{ url: string, target: string, features: string }[]} */
    const calls = [];
    const ok = openCommunityExternalLink({
      open: (url, target, features) => {
        calls.push({ url, target, features });
        return null;
      }
    });
    assert.equal(ok, true);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, COMMUNITY_EXTERNAL_URL);
    assert.equal(calls[0].target, '_blank');
    assert.match(calls[0].features, /noopener/);
  });
});
