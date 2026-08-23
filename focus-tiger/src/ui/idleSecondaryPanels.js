/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Mutual exclusion for Idle secondary panels (? purpose, Soundscape, membership,
 * and growth/monetization overlay cards).
 *
 * @param {object} deps
 * @param {{ close?: (opts?: object) => void } | null | undefined} deps.membershipUnlockUI
 * @param {() => { closePurposeCard?: () => void } | null | undefined} deps.getOnboardingHints
 * @param {{ closeSoundPanel?: () => void } | null | undefined} deps.ambientSoundscapeUI
 * @param {(opts?: { except?: string | null }) => void} deps.closeGrowthOverlayCards
 */
export function createIdleSecondaryPanelCoordinator(deps) {
  /**
   * @param {{ except?: 'membership' | 'purpose' | 'soundscape' | 'support' | 'sanctuary' | 'tip' | 'newsletter' | 'moments' | 'quote' | 'mustard-seed' | 'wallpapers' | 'confide' | 'cinema' | 'journey' | 'yin-coin' | null }} [opts]
   */
  function closeIdleSecondaryPanels(opts = {}) {
    const except = opts.except ?? null;

    if (except !== 'membership') deps.membershipUnlockUI?.close?.();
    if (except !== 'purpose') deps.getOnboardingHints()?.closePurposeCard?.();
    if (except !== 'soundscape') deps.ambientSoundscapeUI?.closeSoundPanel?.();

    const growthExcept =
      except === 'membership' ||
      except === 'support' ||
      except === 'sanctuary' ||
      except === 'tip' ||
      except === 'newsletter' ||
      except === 'moments' ||
      except === 'quote' ||
      except === 'mustard-seed' ||
      except === 'wallpapers' ||
      except === 'confide' ||
      except === 'cinema' ||
      except === 'journey' ||
      except === 'yin-coin'
        ? except
        : null;
    deps.closeGrowthOverlayCards({ except: growthExcept });
  }

  return { closeIdleSecondaryPanels };
}
