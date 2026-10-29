/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Official sitting templates (design lock for A4).
 * Default is the live identity map. A4 Compass UI selects among all four.
 * @see docs/ritual-recipe-asset-catalog-v0.md
 */

import { RITUAL_RECIPE_DEFAULT_ROOM_ID } from './ritualRecipeAssets.js';
import { RECOVER_COOLDOWN_SEC } from './ritualRecipeSchema.js';

export const OFFICIAL_SITTING_TEMPLATE_ID = Object.freeze({
  DEFAULT: 'official.default',
  DEEP: 'official.deep',
  ADHD: 'official.adhd',
  EVENING: 'official.evening'
});

/**
 * @typedef {{
 *   templateId: string,
 *   title: string,
 *   soundId: string | null,
 *   roomId: string,
 *   moments: {
 *     arrive: { promptId: string | null },
 *     focus: { durationSec: number, mode: 'fixed' | 'open', promptId: string | null },
 *     recover: { cooldownSec: number },
 *     transition: { promptId: string | null },
 *     reflect: { promptId: string | null }
 *   }
 * }} OfficialSittingTemplate
 */

/** @type {Readonly<Record<string, OfficialSittingTemplate>>} */
export const OFFICIAL_SITTING_TEMPLATES = Object.freeze({
  [OFFICIAL_SITTING_TEMPLATE_ID.DEFAULT]: Object.freeze({
    templateId: OFFICIAL_SITTING_TEMPLATE_ID.DEFAULT,
    title: 'Default sitting',
    soundId: null,
    roomId: RITUAL_RECIPE_DEFAULT_ROOM_ID,
    moments: Object.freeze({
      arrive: Object.freeze({ promptId: null }),
      focus: Object.freeze({
        durationSec: 600,
        mode: 'fixed',
        promptId: null
      }),
      recover: Object.freeze({ cooldownSec: RECOVER_COOLDOWN_SEC }),
      transition: Object.freeze({ promptId: null }),
      reflect: Object.freeze({ promptId: null })
    })
  }),
  [OFFICIAL_SITTING_TEMPLATE_ID.DEEP]: Object.freeze({
    templateId: OFFICIAL_SITTING_TEMPLATE_ID.DEEP,
    title: 'Deep work',
    soundId: 'the-inner-sound',
    roomId: RITUAL_RECIPE_DEFAULT_ROOM_ID,
    moments: Object.freeze({
      arrive: Object.freeze({ promptId: 'arrive.deep.quiet' }),
      focus: Object.freeze({
        durationSec: 2700,
        mode: 'fixed',
        promptId: 'focus.deep.hold'
      }),
      recover: Object.freeze({ cooldownSec: RECOVER_COOLDOWN_SEC }),
      transition: Object.freeze({ promptId: 'transition.deep.return' }),
      reflect: Object.freeze({ promptId: 'reflect.deep.note' })
    })
  }),
  [OFFICIAL_SITTING_TEMPLATE_ID.ADHD]: Object.freeze({
    templateId: OFFICIAL_SITTING_TEMPLATE_ID.ADHD,
    title: 'ADHD-friendly',
    soundId: 'rain',
    roomId: RITUAL_RECIPE_DEFAULT_ROOM_ID,
    moments: Object.freeze({
      arrive: Object.freeze({ promptId: null }),
      focus: Object.freeze({
        durationSec: 900,
        mode: 'fixed',
        promptId: null
      }),
      recover: Object.freeze({ cooldownSec: RECOVER_COOLDOWN_SEC }),
      transition: Object.freeze({ promptId: null }),
      reflect: Object.freeze({ promptId: null })
    })
  }),
  [OFFICIAL_SITTING_TEMPLATE_ID.EVENING]: Object.freeze({
    templateId: OFFICIAL_SITTING_TEMPLATE_ID.EVENING,
    title: 'Evening close',
    soundId: 'dreamland',
    roomId: RITUAL_RECIPE_DEFAULT_ROOM_ID,
    moments: Object.freeze({
      arrive: Object.freeze({ promptId: 'arrive.evening.soft' }),
      focus: Object.freeze({
        durationSec: 600,
        mode: 'fixed',
        promptId: null
      }),
      recover: Object.freeze({ cooldownSec: RECOVER_COOLDOWN_SEC }),
      transition: Object.freeze({ promptId: 'transition.evening.rest' }),
      reflect: Object.freeze({ promptId: 'reflect.evening.close' })
    })
  })
});
