/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Unified sprite-channel arbiter: one occupancy decision for DORMANT /
 * cold-start first paint / session-end pose.
 *
 * Callers report an intent (or use a scene resolver). This module does not
 * pick weighted pools — `sceneAnimationDispatcher` still draws keys.
 */

import { STATES } from './StateManager.js';
import { shouldEnterDormantIdle } from './dormantTrigger.js';
import { DORMANT_IDLE_MS } from '../utils/Constants.js';
import { isLateNightHour } from './lateNightHour.js';
import { WELLNESS_DAY_BANDS } from '../character/cloakVariant.js';

export const SPRITE_SOURCES = Object.freeze({
  BOOT: 'boot',
  VISIBILITY: 'visibility',
  SESSION_END: 'session-end',
  RISE_SYNC: 'rise-sync',
  LATE_NIGHT_IDLE: 'late-night-idle',
  HONESTY_COMPLETE: 'honesty-complete',
  MICRO_COMPLETE: 'micro-complete',
  RITUAL_COMPLETE: 'ritual-complete',
  PAYMENT_ASYNC: 'payment-async',
  PARROT: 'parrot',
  DEBUG: 'debug'
});

export const SPRITE_OCCUPANCY = Object.freeze({
  KEEP: 'keep',
  DORMANT_ENTER: 'dormant-enter',
  PAYMENT_THANKS: 'payment-thanks',
  FLOWER: 'flower',
  MORNING_WAKE: 'morning-wake',
  WELCOME: 'welcome',
  PARROT: 'parrot',
  CELEBRATE: 'celebrate',
  MILESTONE: 'milestone',
  LIGHT_COMPLETE: 'light-complete',
  RISE_HOLD: 'rise-hold',
  HONESTY_ACK: 'honesty-ack',
  IDLE_BASELINE: 'idle-baseline',
  LONG_AWAY_WAKE: 'long-away-wake'
});

export const FIRST_PAINT_OCCUPANCY = Object.freeze(
  new Set([
    SPRITE_OCCUPANCY.WELCOME,
    SPRITE_OCCUPANCY.FLOWER,
    SPRITE_OCCUPANCY.MORNING_WAKE,
    SPRITE_OCCUPANCY.PAYMENT_THANKS
  ])
);

export const TAP_BLOCKING_OCCUPANCY = Object.freeze(
  new Set([
    SPRITE_OCCUPANCY.WELCOME,
    SPRITE_OCCUPANCY.FLOWER,
    SPRITE_OCCUPANCY.MORNING_WAKE,
    SPRITE_OCCUPANCY.PAYMENT_THANKS,
    SPRITE_OCCUPANCY.DORMANT_ENTER,
    SPRITE_OCCUPANCY.CELEBRATE,
    SPRITE_OCCUPANCY.MILESTONE,
    SPRITE_OCCUPANCY.RISE_HOLD,
    SPRITE_OCCUPANCY.PARROT
  ])
);

const CEREMONY_SOURCES = new Set([
  SPRITE_SOURCES.SESSION_END,
  SPRITE_SOURCES.HONESTY_COMPLETE,
  SPRITE_SOURCES.MICRO_COMPLETE,
  SPRITE_SOURCES.RITUAL_COMPLETE
]);

/**
 * @param {object} [context]
 */
export function normalizeSpriteChannelContext(context = {}) {
  const now = context.now instanceof Date ? context.now : new Date();
  return {
    sessionState: context.sessionState || STATES.IDLE,
    overlayBusy: context.overlayBusy === true,
    honestyFlowOpen: context.honestyFlowOpen === true,
    hiddenMs:
      typeof context.hiddenMs === 'number' && Number.isFinite(context.hiddenMs)
        ? context.hiddenMs
        : null,
    lastEndedAt:
      typeof context.lastEndedAt === 'number' &&
      Number.isFinite(context.lastEndedAt)
        ? context.lastEndedAt
        : null,
    now,
    occupancy: context.occupancy || null,
    wellnessBand: context.wellnessBand || null,
    flowerForce: context.flowerForce === true,
    checkoutThanksKind: context.checkoutThanksKind || null,
    playAtWelcomeSlot: context.playAtWelcomeSlot || null,
    welcomeAvailable: context.welcomeAvailable === true,
    hasCelebratedToday: context.hasCelebratedToday === true,
    preferMilestoneGlow: context.preferMilestoneGlow === true,
    lateNight:
      context.lateNight === true ||
      (context.lateNight !== false && isLateNightHour(now)),
    forceDormant: context.forceDormant === true,
    allowEnterDormant: context.allowEnterDormant,
    idleMs:
      typeof context.idleMs === 'number' && context.idleMs > 0
        ? context.idleMs
        : DORMANT_IDLE_MS
  };
}

function keep(reason) {
  return {
    occupy: SPRITE_OCCUPANCY.KEEP,
    sessionDelta: null,
    play: null,
    reason
  };
}

function playOccupy(occupy, emotionKey, holdPose, reason, sessionDelta = null) {
  return {
    occupy,
    sessionDelta,
    play: emotionKey
      ? { emotionKey, holdPose: Boolean(holdPose) }
      : null,
    reason
  };
}

function enterDormant(reason) {
  return {
    occupy: SPRITE_OCCUPANCY.DORMANT_ENTER,
    sessionDelta: 'enter-dormant',
    play: null,
    reason
  };
}

function leaveDormant(reason) {
  return {
    occupy: SPRITE_OCCUPANCY.IDLE_BASELINE,
    sessionDelta: 'leave-dormant',
    play: null,
    reason
  };
}

function stampElapsed(ctx) {
  return shouldEnterDormantIdle({
    lastEndedAt: ctx.lastEndedAt,
    nowMs: ctx.now.getTime(),
    idleMs: ctx.idleMs
  });
}

function isBusySession(sessionState) {
  return sessionState === STATES.FOCUSING || sessionState === STATES.CELEBRATE;
}

function isCeremonySource(source) {
  return CEREMONY_SOURCES.has(source);
}

/**
 * Top-down matrix for a single requested intent.
 *
 * @param {object} opts
 * @param {string} opts.intent
 * @param {string} opts.source
 * @param {string | null} [opts.emotionKey]
 * @param {boolean} [opts.holdPose]
 * @param {object} [opts.context]
 */
export function arbitrateSpriteChannel({
  intent,
  source,
  emotionKey = null,
  holdPose = false,
  context = {}
} = {}) {
  const ctx = normalizeSpriteChannelContext(context);

  if (source === SPRITE_SOURCES.DEBUG) {
    return playOccupy(
      intent || SPRITE_OCCUPANCY.KEEP,
      emotionKey,
      holdPose,
      'debug'
    );
  }

  // 0 — Focusing / Celebrate (2B wake is the only Focusing exception)
  if (isBusySession(ctx.sessionState)) {
    if (
      intent === SPRITE_OCCUPANCY.LONG_AWAY_WAKE &&
      ctx.sessionState === STATES.FOCUSING
    ) {
      return playOccupy(
        SPRITE_OCCUPANCY.LONG_AWAY_WAKE,
        emotionKey || 'dormantWake',
        true,
        '2b-wake'
      );
    }
    return keep('busy-session');
  }

  // 1 — Honesty flow blocks non-ceremony (Honesty complete is a ceremony)
  if (ctx.honestyFlowOpen && !isCeremonySource(source)) {
    return keep('honesty-flow');
  }

  // 1b — overlay blocks sleep / welcome / payment-async / parrot
  if (ctx.overlayBusy && !isCeremonySource(source)) {
    return keep('overlay-busy');
  }

  // 2 — session-end family never cloaks
  if (
    isCeremonySource(source) &&
    (intent === SPRITE_OCCUPANCY.DORMANT_ENTER || intent === 'cloak-hold')
  ) {
    return keep('session-end-never-cloak');
  }

  if (source === SPRITE_SOURCES.SESSION_END) {
    return resolveSessionEndSpriteOccupancy({
      completed: intent !== SPRITE_OCCUPANCY.RISE_HOLD,
      preferMilestoneGlow: ctx.preferMilestoneGlow,
      hasCelebratedToday: ctx.hasCelebratedToday,
      emotionKey,
      holdPose
    });
  }

  if (source === SPRITE_SOURCES.HONESTY_COMPLETE) {
    if (ctx.preferMilestoneGlow) {
      return playOccupy(
        SPRITE_OCCUPANCY.MILESTONE,
        emotionKey || 'milestoneGlow',
        false,
        'honesty-milestone'
      );
    }
    return playOccupy(
      SPRITE_OCCUPANCY.HONESTY_ACK,
      emotionKey,
      holdPose,
      'honesty-ack'
    );
  }

  if (
    source === SPRITE_SOURCES.MICRO_COMPLETE ||
    source === SPRITE_SOURCES.RITUAL_COMPLETE
  ) {
    return playOccupy(
      SPRITE_OCCUPANCY.LIGHT_COMPLETE,
      emotionKey || 'sessionComplete',
      holdPose,
      source
    );
  }

  // 3 — payment thanks beats late-night cloak
  if (
    intent === SPRITE_OCCUPANCY.PAYMENT_THANKS ||
    source === SPRITE_SOURCES.PAYMENT_ASYNC
  ) {
    return playOccupy(
      SPRITE_OCCUPANCY.PAYMENT_THANKS,
      emotionKey,
      false,
      'payment-thanks',
      ctx.sessionState === STATES.DORMANT ? 'leave-dormant' : null
    );
  }

  // 6b — short tab hide after first-paint occupancy
  if (
    source === SPRITE_SOURCES.VISIBILITY &&
    FIRST_PAINT_OCCUPANCY.has(ctx.occupancy) &&
    (ctx.hiddenMs == null || ctx.hiddenMs < ctx.idleMs)
  ) {
    return keep('short-hide-after-first-paint');
  }

  // 7b — parrot after welcome
  if (intent === SPRITE_OCCUPANCY.PARROT || source === SPRITE_SOURCES.PARROT) {
    if (ctx.sessionState === STATES.DORMANT) return keep('dormant-blocks-parrot');
    return playOccupy(
      SPRITE_OCCUPANCY.PARROT,
      emotionKey || 'parrotEarVisit',
      false,
      'parrot'
    );
  }

  if (intent === SPRITE_OCCUPANCY.DORMANT_ENTER) {
    return resolveDormantEnterIntent(source, ctx);
  }

  if (intent === SPRITE_OCCUPANCY.IDLE_BASELINE) {
    return playOccupy(
      SPRITE_OCCUPANCY.IDLE_BASELINE,
      emotionKey || 'idle',
      false,
      'idle-baseline'
    );
  }

  if (intent === SPRITE_OCCUPANCY.FLOWER) {
    return playOccupy(SPRITE_OCCUPANCY.FLOWER, emotionKey, false, 'flower');
  }
  if (intent === SPRITE_OCCUPANCY.WELCOME) {
    return playOccupy(SPRITE_OCCUPANCY.WELCOME, emotionKey, false, 'welcome');
  }
  if (intent === SPRITE_OCCUPANCY.MORNING_WAKE) {
    return playOccupy(
      SPRITE_OCCUPANCY.MORNING_WAKE,
      emotionKey || 'dormantWake',
      true,
      'morning-wake'
    );
  }

  return keep('unhandled-intent');
}

function resolveDormantEnterIntent(source, ctx) {
  if (ctx.allowEnterDormant === false) {
    if (ctx.sessionState === STATES.DORMANT && !stampElapsed(ctx)) {
      return leaveDormant('boot-no-enter');
    }
    return keep('boot-no-enter');
  }

  if (source === SPRITE_SOURCES.VISIBILITY) {
    return resolveVisibilitySpriteOccupancy(ctx);
  }

  if (source === SPRITE_SOURCES.RISE_SYNC) {
    if (stampElapsed(ctx)) return enterDormant('rise-sync-2h');
    if (ctx.sessionState === STATES.DORMANT) {
      return leaveDormant('rise-sync-fresh');
    }
    return keep('rise-sync-fresh');
  }

  if (
    source === SPRITE_SOURCES.LATE_NIGHT_IDLE ||
    ctx.forceDormant === true
  ) {
    if (!ctx.lateNight && ctx.forceDormant !== true) {
      return keep('not-late-night');
    }
    return enterDormant(
      ctx.forceDormant ? 'force-dormant' : 'late-night-idle'
    );
  }

  if (source === SPRITE_SOURCES.BOOT) {
    return resolveBootSpriteOccupancy(ctx);
  }

  if (stampElapsed(ctx)) return enterDormant('stamp-2h');
  return keep('no-dormant-reason');
}

/**
 * Cold-start winner. Does not consume welcome quota.
 *
 * @param {object} [context]
 */
export function resolveBootSpriteOccupancy(context = {}) {
  const ctx = normalizeSpriteChannelContext(context);
  if (isBusySession(ctx.sessionState)) return keep('busy-session');
  if (ctx.honestyFlowOpen) return keep('honesty-flow');
  if (ctx.overlayBusy) return keep('overlay-busy');

  // 3 — checkout return (tip plays now; sanctuary/membership wait for async)
  if (ctx.checkoutThanksKind) {
    if (ctx.playAtWelcomeSlot) {
      return playOccupy(
        SPRITE_OCCUPANCY.PAYMENT_THANKS,
        ctx.playAtWelcomeSlot,
        false,
        'payment-boot'
      );
    }
    return playOccupy(
      SPRITE_OCCUPANCY.IDLE_BASELINE,
      'idle',
      false,
      'checkout-pending'
    );
  }

  // 4 — flower over wellness cloak / morning wake
  if (ctx.flowerForce) {
    return playOccupy(SPRITE_OCCUPANCY.FLOWER, null, false, 'flower-boot');
  }

  // 5 — wellness morning
  if (ctx.wellnessBand === WELLNESS_DAY_BANDS.MORNING) {
    return playOccupy(
      SPRITE_OCCUPANCY.MORNING_WAKE,
      'dormantWake',
      true,
      'wellness-morning'
    );
  }

  // 11 — wellness late (aligned 23:00–05:59)
  if (ctx.wellnessBand === WELLNESS_DAY_BANDS.LATE_NIGHT) {
    return enterDormant('wellness-late');
  }

  // 7 — welcome pool
  if (ctx.welcomeAvailable) {
    return playOccupy(SPRITE_OCCUPANCY.WELCOME, null, false, 'welcome-boot');
  }

  // 10 — Expand A if welcome already used today
  if (ctx.lateNight) {
    return enterDormant('late-night-boot');
  }

  return playOccupy(
    SPRITE_OCCUPANCY.IDLE_BASELINE,
    'idle',
    false,
    'boot-idle'
  );
}

/**
 * Visibility → visible (after 2B is ruled out by the caller).
 *
 * @param {object} [context]
 */
export function resolveVisibilitySpriteOccupancy(context = {}) {
  const ctx = normalizeSpriteChannelContext(context);
  if (isBusySession(ctx.sessionState)) return keep('busy-session');
  if (ctx.honestyFlowOpen) return keep('honesty-flow');
  if (ctx.overlayBusy) return keep('overlay-busy');

  if (FIRST_PAINT_OCCUPANCY.has(ctx.occupancy)) {
    if (ctx.hiddenMs == null || ctx.hiddenMs < ctx.idleMs) {
      return keep('short-hide-after-first-paint');
    }
  }

  const longHide =
    ctx.hiddenMs != null && ctx.hiddenMs >= ctx.idleMs;
  const wantSleep = stampElapsed(ctx) || ctx.lateNight;

  if (!longHide) {
    if (ctx.sessionState === STATES.DORMANT && !stampElapsed(ctx)) {
      return leaveDormant('short-hide-fresh-stamp');
    }
    return keep('short-hide');
  }

  if (wantSleep) {
    return enterDormant(ctx.lateNight && !stampElapsed(ctx) ? 'late-night-idle' : 'visibility-2h');
  }

  if (ctx.sessionState === STATES.DORMANT) {
    return leaveDormant('visibility-stamp-fresh');
  }
  return keep('visibility-no-sleep');
}

/**
 * Timed complete / Rise pose. Never cloakSleep.
 *
 * @param {object} opts
 * @param {boolean} [opts.completed]
 * @param {boolean} [opts.preferMilestoneGlow]
 * @param {boolean} [opts.hasCelebratedToday]
 * @param {string | null} [opts.emotionKey]
 * @param {boolean} [opts.holdPose]
 */
export function resolveSessionEndSpriteOccupancy({
  completed = true,
  preferMilestoneGlow = false,
  hasCelebratedToday = false,
  emotionKey = null,
  holdPose = false
} = {}) {
  if (!completed) {
    return playOccupy(
      SPRITE_OCCUPANCY.RISE_HOLD,
      emotionKey,
      holdPose || true,
      'rise-hold'
    );
  }
  if (preferMilestoneGlow) {
    return playOccupy(
      SPRITE_OCCUPANCY.MILESTONE,
      emotionKey || 'milestoneGlow',
      false,
      'milestone'
    );
  }
  if (!hasCelebratedToday) {
    return {
      occupy: SPRITE_OCCUPANCY.CELEBRATE,
      sessionDelta: 'celebrate',
      play: null,
      reason: 'celebrate'
    };
  }
  return playOccupy(
    SPRITE_OCCUPANCY.LIGHT_COMPLETE,
    emotionKey,
    false,
    'light-complete'
  );
}

/**
 * Map a decision onto HonestyCheckInController session state.
 *
 * @param {string | null | undefined} sessionDelta
 * @returns {'enter-dormant' | 'leave-dormant' | 'stay'}
 */
export function dormantDeltaFromDecision(sessionDelta) {
  if (sessionDelta === 'enter-dormant') return 'enter-dormant';
  if (sessionDelta === 'leave-dormant') return 'leave-dormant';
  return 'stay';
}
