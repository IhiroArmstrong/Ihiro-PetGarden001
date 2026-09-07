/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

test('CalmActionRecoverCardUI exposes stable testid and bottom clearance', () => {
  const src = readFileSync(join(here, 'CalmActionRecoverCardUI.js'), 'utf8');
  assert.match(src, /dataset\.testid = ROOT_ID/);
  assert.match(src, /calm-action-recover-card/);
  assert.match(src, /homeClearanceBottomCss/);
  assert.equal(src.includes("t('ACTIVE_RECOVER')"), false);
  assert.equal(src.includes('COPY_POOLS'), false);
});
