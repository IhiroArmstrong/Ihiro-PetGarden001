/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveHelpCenterPlatformAliasArticles,
  HELP_CENTER_DEVICES_ARTICLE_ID,
  HELP_CENTER_APPLE_HEALTH_ARTICLE_ID
} from './helpCenterPlatformAliases.js';

test('device aliases resolve Safari article', () => {
  const ids = resolveHelpCenterPlatformAliasArticles('download app for iphone');
  assert.ok(ids.includes(HELP_CENTER_DEVICES_ARTICLE_ID));
});

test('health aliases resolve Apple Health article', () => {
  const ids = resolveHelpCenterPlatformAliasArticles('记入健康 shortcuts');
  assert.ok(ids.includes(HELP_CENTER_APPLE_HEALTH_ARTICLE_ID));
});
