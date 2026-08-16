/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Classic cloak-sleep vs starlight-cloak A/B for DORMANT entry / Honesty wake.
 * Both stay wired; pick ~50/50 so we can slowly compare matte/story feel.
 */

export const CLOAK_VARIANTS = Object.freeze({
  CLASSIC: 'classic',
  STARLIGHT: 'starlight'
});

/**
 * @param {() => number} [random]
 * @returns {'classic'|'starlight'}
 */
export function pickCloakVariant(random = Math.random) {
  return random() < 0.5 ? CLOAK_VARIANTS.CLASSIC : CLOAK_VARIANTS.STARLIGHT;
}

/**
 * @param {'classic'|'starlight'|null|undefined} variant
 * @returns {'classic'|'starlight'}
 */
export function normalizeCloakVariant(variant) {
  return variant === CLOAK_VARIANTS.STARLIGHT
    ? CLOAK_VARIANTS.STARLIGHT
    : CLOAK_VARIANTS.CLASSIC;
}

/**
 * @param {'classic'|'starlight'|null|undefined} variant
 * @returns {'cloakSleep'|'starlightCloakSleep'}
 */
export function cloakSleepSequenceKey(variant) {
  return normalizeCloakVariant(variant) === CLOAK_VARIANTS.STARLIGHT
    ? 'starlightCloakSleep'
    : 'cloakSleep';
}

/**
 * @param {'classic'|'starlight'|null|undefined} variant
 * @returns {'sleeping'|'starlightSleeping'}
 */
export function sleepingSequenceKey(variant) {
  return normalizeCloakVariant(variant) === CLOAK_VARIANTS.STARLIGHT
    ? 'starlightSleeping'
    : 'sleeping';
}

/**
 * @param {'classic'|'starlight'|null|undefined} variant
 * @returns {'dormantWake'|'starlightDormantWake'}
 */
export function dormantWakeSequenceKey(variant) {
  return normalizeCloakVariant(variant) === CLOAK_VARIANTS.STARLIGHT
    ? 'starlightDormantWake'
    : 'dormantWake';
}

/** Wellness cold-start bands (local clock). */
export const WELLNESS_DAY_BANDS = Object.freeze({
  MORNING: 'morning',
  DAY: 'day',
  LATE_NIGHT: 'lateNight'
});

/** Inclusive morning start hour (local). */
export const WELLNESS_MORNING_HOUR_START = 6;
/** Exclusive morning end / day start (local). */
export const WELLNESS_MORNING_HOUR_END = 10;
/** Late-night start hour (local); matches LATE_NIGHT_HOUR. */
export const WELLNESS_LATE_NIGHT_HOUR = 23;

/**
 * @param {Date} date
 * @returns {'morning'|'day'|'lateNight'}
 */
export function resolveWellnessDayBand(date) {
  const h = date.getHours();
  if (h >= WELLNESS_LATE_NIGHT_HOUR || h < WELLNESS_MORNING_HOUR_START) {
    return WELLNESS_DAY_BANDS.LATE_NIGHT;
  }
  if (h >= WELLNESS_MORNING_HOUR_START && h < WELLNESS_MORNING_HOUR_END) {
    return WELLNESS_DAY_BANDS.MORNING;
  }
  return WELLNESS_DAY_BANDS.DAY;
}
