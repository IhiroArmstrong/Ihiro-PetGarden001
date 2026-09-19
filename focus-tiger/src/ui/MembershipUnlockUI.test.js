/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, 'MembershipUnlockUI.js'), 'utf8');

test('membership manage portal shows pending and success status before generic quiet error', () => {
  assert.match(src, /MEMBERSHIP_MANAGE_OPENING/);
  assert.match(src, /MEMBERSHIP_MANAGE_OPENED/);
  assert.match(src, /_resolvePortalError/);
  assert.match(src, /MEMBERSHIP_MANAGE_OPEN_FAILED/);
});
