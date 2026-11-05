/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  GUIDED_MEDITATION_LESSONS_PATH,
  evaluateGuidedMediaHostGate,
  runGuidedMediaHostCheck
} from './check-guided-meditation-media-host.js';

describe('check-guided-meditation-media-host', () => {
  it('warns but passes inventory while host is r2.dev', () => {
    const result = runGuidedMediaHostCheck({
      sourceText: readFileSync(GUIDED_MEDITATION_LESSONS_PATH, 'utf8')
    });
    assert.equal(result.ok, true);
    assert.equal(result.r2, true);
  });

  it('fails --release-gate while host still contains r2.dev', () => {
    const result = runGuidedMediaHostCheck({
      sourceText: readFileSync(GUIDED_MEDITATION_LESSONS_PATH, 'utf8'),
      releaseGate: true
    });
    assert.equal(result.ok, false);
    assert.match(result.message, /RELEASE GATE FAIL/);
  });

  it('passes release gate for a custom subdomain', () => {
    const result = evaluateGuidedMediaHostGate({
      host: 'https://media.twinsology.com',
      urls: ['https://media.twinsology.com/v1/a.mp4'],
      mode: 'release'
    });
    assert.equal(result.ok, true);
    assert.equal(result.r2, false);
  });
});
