/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  IDLE_HEATMAP_CLUSTER_BOTTOM_CSS,
  IDLE_HEATMAP_CLUSTER_SHELL_GAP_PX,
  IDLE_LANTERN_BOTTOM_WIDE_CSS
} from './quietTogetherLanternLayout.js';

describe('quietTogetherLanternLayout', () => {
  it('wide lantern bottom anchors above heatmap cluster shell', () => {
    assert.match(IDLE_LANTERN_BOTTOM_WIDE_CSS, /36px \+ 88px \+ 20px \+ 58px/);
    assert.match(IDLE_HEATMAP_CLUSTER_BOTTOM_CSS, /36px \+ 88px \+ 20px/);
    assert.notEqual(IDLE_LANTERN_BOTTOM_WIDE_CSS, IDLE_HEATMAP_CLUSTER_BOTTOM_CSS);
  });
});
