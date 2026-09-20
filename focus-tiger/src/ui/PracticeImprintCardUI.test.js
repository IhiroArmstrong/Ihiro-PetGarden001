/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const src = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'PracticeImprintCardUI.js'),
  'utf8'
);

describe('PracticeImprintCardUI', () => {
  it('uses dedicated practice imprint card id and body class', () => {
    assert.match(src, /id = 'practice-imprint-card'/);
    assert.match(src, /PRACTICE_IMPRINT_BODY_CLASS/);
    assert.match(src, /practice-imprint-card-continue/);
  });

  it('marks reveal whenever an awarded imprint card opens', () => {
    assert.match(src, /markPracticeImprintRevealed/);
  });
});
