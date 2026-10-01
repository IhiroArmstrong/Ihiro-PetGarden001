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
const src = readFileSync(join(here, 'FocusCirclePanelUI.js'), 'utf8');

test('My Circle panel lists peer traces from witness peek without stealing idle snapshot', () => {
  assert.match(src, /focus-circle-peer-traces-section/);
  assert.match(src, /updateIdleSnapshot: false/);
  assert.match(src, /formatFocusCirclePeerTraceLines/);
  assert.match(src, /FOCUS_CIRCLE_PEER_TRACES_EMPTY/);
});
