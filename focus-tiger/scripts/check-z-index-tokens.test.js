/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Z } from '../src/ui/zIndexLayers.js';
import {
  evaluateZIndexTokens,
  runZIndexTokensCheck,
  zTokenName
} from './check-z-index-tokens.js';

const here = dirname(fileURLToPath(import.meta.url));

test('drifted token values fail', () => {
  const result = evaluateZIndexTokens({
    css: ':root { --z-support-modal: 19; }\n',
    layers: { SUPPORT_MODAL: 26 }
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((err) => /--z-support-modal is 19/.test(err)));
});

test('live tokens match Z; index.html has no raw z-index digits', () => {
  assert.equal(runZIndexTokensCheck(), true);
  const html = readFileSync(join(here, '../index.html'), 'utf8');
  assert.match(html, /z-index-tokens\.css/);
  assert.doesNotMatch(html, /z-index\s*:\s*-?\d+/);
  assert.match(html, /z-index:\s*var\(--z-local\)/);
  assert.match(html, /z-index:\s*var\(--z-ui-overlay\)/);
  assert.match(html, /z-index:\s*var\(--z-loading\)/);
  assert.equal(zTokenName('SUPPORT_DIM'), '--z-support-dim');
  assert.equal(Z.SUPPORT_MODAL, 26);
});
