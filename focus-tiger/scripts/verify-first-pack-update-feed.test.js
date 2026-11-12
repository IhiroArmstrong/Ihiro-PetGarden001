/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CANONICAL_UPDATE_FEED_HOST,
  CANONICAL_UPDATE_FEED_URL
} from '../src/core/desktopUpdateFeedUrl.js';
import { evaluateFirstPackUpdateFeed } from './verify-first-pack-update-feed.js';

const files = {
  notice: `host ${CANONICAL_UPDATE_FEED_HOST} and IP`,
  source: `export const CANONICAL_UPDATE_FEED_URL = '${CANONICAL_UPDATE_FEED_URL}';`
};

test('canonical source + privacy notice pass', () => {
  assert.equal(evaluateFirstPackUpdateFeed({}, files).ok, true);
});

test('missing host in privacy notice fails', () => {
  const result = evaluateFirstPackUpdateFeed({}, { ...files, notice: 'no host' });
  assert.equal(result.ok, false);
});

test('wrong FT_UPDATE_FEED_URL env fails (would ship the wrong bucket)', () => {
  const result = evaluateFirstPackUpdateFeed(
    { FT_UPDATE_FEED_URL: 'https://example.com/updates/' },
    files
  );
  assert.equal(result.ok, false);
});
