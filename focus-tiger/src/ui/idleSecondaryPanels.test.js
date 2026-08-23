/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createIdleSecondaryPanelCoordinator } from './idleSecondaryPanels.js';

describe('createIdleSecondaryPanelCoordinator', () => {
  it('closes purpose, soundscape, membership, and growth cards except the opener', () => {
    const calls = [];
    const { closeIdleSecondaryPanels } = createIdleSecondaryPanelCoordinator({
      membershipUnlockUI: { close: () => calls.push('membership') },
      getOnboardingHints: () => ({
        closePurposeCard: () => calls.push('purpose')
      }),
      ambientSoundscapeUI: { closeSoundPanel: () => calls.push('soundscape') },
      closeGrowthOverlayCards: (opts) =>
        calls.push(`growth:${opts?.except ?? 'none'}`)
    });

    closeIdleSecondaryPanels({ except: 'soundscape' });
    assert.deepEqual(calls, [
      'membership',
      'purpose',
      'growth:none'
    ]);
  });

  it('passes membership through to growth close except', () => {
    const growthExcept = [];
    const { closeIdleSecondaryPanels } = createIdleSecondaryPanelCoordinator({
      membershipUnlockUI: { close: () => {} },
      getOnboardingHints: () => ({ closePurposeCard: () => {} }),
      ambientSoundscapeUI: { closeSoundPanel: () => {} },
      closeGrowthOverlayCards: (opts) => growthExcept.push(opts?.except ?? null)
    });

    closeIdleSecondaryPanels({ except: 'membership' });
    assert.deepEqual(growthExcept, ['membership']);
  });
});
