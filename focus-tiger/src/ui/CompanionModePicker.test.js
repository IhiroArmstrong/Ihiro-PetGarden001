/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

describe('CompanionModePicker arrival handoff', () => {
  it('open({ afterArrivalChoose }) bypasses postSessionOverlay latch', () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const src = readFileSync(join(here, 'CompanionModePicker.js'), 'utf8');
    assert.match(src, /afterArrivalChoose/);
    assert.match(
      src,
      /_postSessionOverlay && !opts\.afterArrivalChoose/
    );
  });
});
