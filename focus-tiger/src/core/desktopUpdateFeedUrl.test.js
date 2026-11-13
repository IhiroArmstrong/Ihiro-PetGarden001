/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CANONICAL_UPDATE_FEED_HOST,
  CANONICAL_UPDATE_FEED_URL,
  evaluateUpdateFeedUrl,
  resolveUpdaterFeedUrl
} from './desktopUpdateFeedUrl.js';

const repoDocs = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../docs/PRIVACY_NOTICE.md'
);

describe('desktopUpdateFeedUrl', () => {
  it('accepts the canonical https host with trailing slash', () => {
    const result = evaluateUpdateFeedUrl(CANONICAL_UPDATE_FEED_URL);
    assert.equal(result.ok, true);
    assert.equal(result.url, CANONICAL_UPDATE_FEED_URL);
  });

  it('rejects empty when required (would ship a stuck customer build)', () => {
    const result = evaluateUpdateFeedUrl('', { requireNonEmpty: true });
    assert.equal(result.ok, false);
  });

  it('rejects http, wrong host, and credentials', () => {
    assert.equal(evaluateUpdateFeedUrl('http://updates.twinsology.com/').ok, false);
    assert.equal(
      evaluateUpdateFeedUrl('https://github.com/IhiroArmstrong/Ihiro-PetGarden001/releases').ok,
      false
    );
    assert.equal(
      evaluateUpdateFeedUrl('https://user:pass@updates.twinsology.com/').ok,
      false
    );
  });

  it('accepts the internal /prep/ prefix on the locked host', () => {
    const result = evaluateUpdateFeedUrl('https://updates.twinsology.com/prep/');
    assert.equal(result.ok, true);
    assert.equal(result.url, 'https://updates.twinsology.com/prep/');
    assert.equal(
      resolveUpdaterFeedUrl(
        { FT_UPDATE_FEED_URL: 'https://updates.twinsology.com/prep' },
        { isPackaged: false }
      ),
      'https://updates.twinsology.com/prep/'
    );
  });

  it('packaged builds default to the canonical URL; unpackaged stay quiet', () => {
    assert.equal(resolveUpdaterFeedUrl({}, { isPackaged: true }), CANONICAL_UPDATE_FEED_URL);
    assert.equal(resolveUpdaterFeedUrl({}, { isPackaged: false }), '');
  });

  it('invalid env does not fall back to a third-party host', () => {
    assert.equal(
      resolveUpdaterFeedUrl(
        { FT_UPDATE_FEED_URL: 'https://evil.example/' },
        { isPackaged: true }
      ),
      ''
    );
  });

  it('privacy notice names the update host', () => {
    const notice = readFileSync(repoDocs, 'utf8');
    assert.match(notice, new RegExp(CANONICAL_UPDATE_FEED_HOST));
    assert.match(notice, /IP/);
  });
});
