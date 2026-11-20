/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  enrichSecondaryMenuRowPresentation,
  resolveSecondaryMenuRowPresentation
} from './secondaryMenuRowPresentation.js';

test('companion row gets Preferences-style chrome fields', () => {
  const row = enrichSecondaryMenuRowPresentation({
    proxy: 'companion',
    labelKey: 'COMPANION_MODE_HINT'
  });
  assert.equal(row.prefKind, 'page');
  assert.ok(row.prefHintKey);
  assert.ok(row.prefIcon);
});

test('archive seal proxy resolves generic presentation', () => {
  const spec = resolveSecondaryMenuRowPresentation(
    'contemplative-archive-seal:ca-01-old-pond'
  );
  assert.ok(spec?.hintKey);
});
