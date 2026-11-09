/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import { isClientQaHarnessAllowed } from './clientQaHarnessGate.js';
import { isCompanionEntitled } from './companionEntitlement.js';

const gateSrc = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'clientQaHarnessGate.js'),
  'utf8'
);

describe('clientQaHarnessGate', () => {
  it('uses Vite-inlinable import.meta.env (no env?. optional chain)', () => {
    const code = gateSrc
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '');
    assert.doesNotMatch(code, /import\.meta\.env\?\./);
    assert.match(code, /import\.meta\.env\.VITE_FT_QA_BOOT/);
  });

  it('allows harness only in dev or VITE_FT_QA_BOOT', () => {
    assert.equal(isClientQaHarnessAllowed({ viteDev: false, viteQaBoot: '0' }), false);
    assert.equal(isClientQaHarnessAllowed({ viteDev: true, viteQaBoot: '0' }), true);
    assert.equal(isClientQaHarnessAllowed({ viteDev: false, viteQaBoot: '1' }), true);
  });
});

describe('companionEntitlement · production QA params', () => {
  it('ignores ?companionEntitled=1 when QA harness is off', () => {
    const mem = { getItem() { return null; }, setItem() {}, removeItem() {} };
    assert.equal(
      isCompanionEntitled({
        storage: mem,
        search: '?companionEntitled=1',
        qaHarnessAllowed: false
      }),
      false
    );
  });
});
