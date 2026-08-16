/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GLASS_FILL,
  GLASS_FILL_STRONG,
  glassPanelSurfaceDecls
} from './glassPanelStyles.js';

test('glass panel fill stays translucent (not near-opaque cream cards)', () => {
  assert.match(GLASS_FILL, /,\.62\)/);
  assert.match(GLASS_FILL_STRONG, /,\.78\)/);
  const decls = glassPanelSurfaceDecls().join(';');
  assert.match(decls, /backdrop-filter/);
  assert.match(decls, /,\.62/);
  assert.doesNotMatch(decls, /0\.9[3-9]/);
});
