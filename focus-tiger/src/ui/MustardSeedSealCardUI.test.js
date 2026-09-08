/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import { mustardSeedSealZhIsPrimaryLocale } from '../core/mustardSeedSeal.js';

const src = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'MustardSeedSealCardUI.js'),
  'utf8'
);

describe('mustardSeedSealZhIsPrimaryLocale', () => {
  it('zh uses traditional poem as primary', () => {
    assert.equal(mustardSeedSealZhIsPrimaryLocale('zh'), true);
  });

  it('en and ja use English poem as primary', () => {
    assert.equal(mustardSeedSealZhIsPrimaryLocale('en'), false);
    assert.equal(mustardSeedSealZhIsPrimaryLocale('ja'), false);
  });
});

describe('MustardSeedSealCardUI narrow compact styles', () => {
  it('ships v4 stylesheet id', () => {
    assert.match(src, /mustard-seed-seal-card-styles-v4/);
  });

  it('hides secondary poem and save note on narrow shell', () => {
    assert.match(
      src,
      /body\.ft-narrow-shell \.mustard-seed-seal-card__poem-zh\.is-poem-secondary[\s\S]*display:\s*none/
    );
    assert.match(
      src,
      /body\.ft-narrow-shell \.mustard-seed-seal-card__save-note[\s\S]*display:\s*none/
    );
  });

  it('shrinks badge and hides scrollbar on narrow shell', () => {
    assert.match(
      src,
      /body\.ft-narrow-shell \.mustard-seed-seal-card__badge[\s\S]*width:\s*80px/
    );
    assert.match(src, /body\.ft-narrow-shell \.mustard-seed-seal-card[\s\S]*scrollbar-width:\s*none/);
  });

  it('raises card bottom on narrow shell for home grabber clearance', () => {
    assert.match(
      src,
      /body\.ft-narrow-shell \.mustard-seed-seal-card[\s\S]*bottom:\s*max\(108px/
    );
  });
});
