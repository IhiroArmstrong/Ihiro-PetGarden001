/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import {
  isClientQaHarnessAllowed,
  parseEntitlementMockSearchIfQaHarness
} from './clientQaHarnessGate.js';
import { isCompanionEntitled } from './companionEntitlement.js';
import { canOpenConfidePanel } from './confide/confideUserVisibilityGate.js';

const gateSrc = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'clientQaHarnessGate.js'),
  'utf8'
);
const mainSrc = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '../main.js'),
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

  it('production main does not honor ?entitlementMock= without QA harness', () => {
    assert.match(mainSrc, /parseEntitlementMockSearchIfQaHarness\(/);
    assert.doesNotMatch(mainSrc, /parseEntitlementMockSearch\(/);
  });

  it('parseEntitlementMockSearchIfQaHarness is null when harness is off', () => {
    assert.equal(
      parseEntitlementMockSearchIfQaHarness('?entitlementMock=both', {
        viteDev: false,
        viteQaBoot: ''
      }),
      null
    );
    assert.equal(
      parseEntitlementMockSearchIfQaHarness('?entitlementMock=both', {
        viteDev: true,
        viteQaBoot: ''
      }),
      'both'
    );
  });

  it('allows harness only in dev or VITE_FT_QA_BOOT', () => {
    assert.equal(isClientQaHarnessAllowed({ viteDev: false, viteQaBoot: '0' }), false);
    assert.equal(isClientQaHarnessAllowed({ viteDev: true, viteQaBoot: '0' }), true);
    assert.equal(isClientQaHarnessAllowed({ viteDev: false, viteQaBoot: '1' }), true);
    // Vite may inline `env.VITE_FT_QA_BOOT === '1'` to boolean true; do not require === '1' again.
    assert.equal(isClientQaHarnessAllowed({ viteDev: false, viteQaBoot: true }), true);
  });
});

describe('companionEntitlement · production QA params', () => {
  it('production build ignores checkout-return query that rides QA params', () => {
    const search =
      '?product=1&pro_session=cs_test&confide=1&companionEntitled=1&entitlementMock=pro';
    const mem = { getItem() { return null; }, setItem() {}, removeItem() {} };
    assert.equal(
      canOpenConfidePanel({
        search,
        stage: 'idle',
        qaHarnessAllowed: false
      }),
      false
    );
    assert.equal(
      isCompanionEntitled({
        storage: mem,
        search,
        qaHarnessAllowed: false
      }),
      false
    );
  });

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
