/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import { listCommerceProductsWithSupportCard } from './commerceProductRegistry.js';

const supportUiPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../ui/SupportYinModalUI.js'
);

describe('supportPaidCardParallelListContract (A9 registry)', () => {
  it('Support modal declares a card testId per checkout kind', () => {
    const src = fs.readFileSync(supportUiPath, 'utf8');
    for (const row of listCommerceProductsWithSupportCard()) {
      const kind = row.supportModalCheckoutKind;
      assert.match(
        src,
        new RegExp(`_runCheckout\\('${kind}'\\)`),
        `SupportYinModalUI missing checkout wiring for ${kind}`
      );
      assert.ok(src.includes(row.supportCardTestId), `missing ${row.supportCardTestId}`);
    }
  });
});
