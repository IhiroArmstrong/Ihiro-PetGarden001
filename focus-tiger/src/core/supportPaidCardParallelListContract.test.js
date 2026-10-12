/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const supportUiPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../ui/SupportYinModalUI.js'
);

/** Checkout kinds wired in Support modal cards (A3 until A9 full registry). */
const SUPPORT_MODAL_CHECKOUT_KINDS = Object.freeze([
  'sanctuary',
  'membership',
  'tea',
  'pro',
  'companion-addon'
]);

describe('supportPaidCardParallelListContract (A3)', () => {
  it('Support modal declares a card testId per checkout kind', () => {
    const src = fs.readFileSync(supportUiPath, 'utf8');
    for (const kind of SUPPORT_MODAL_CHECKOUT_KINDS) {
      assert.match(
        src,
        new RegExp(`_runCheckout\\('${kind}'\\)`),
        `SupportYinModalUI missing checkout wiring for ${kind}`
      );
      const testId =
        kind === 'tea'
          ? 'yin-support-tea-card'
          : `yin-support-${kind}-card`;
      assert.ok(src.includes(testId), `missing ${testId}`);
    }
  });
});
