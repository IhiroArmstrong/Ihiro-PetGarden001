/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { Z } from './zIndexLayers.js';

/**
 * Centered glass cards: at most two stay open, and a press on a non-control
 * area drags the card. Backdrops stay below the cards, so the other card
 * still receives clicks.
 */

export const GLASS_CARD_MAX_OPEN = 2;

/** Handle id → element id. Drag only these centered cards, not menus or toasts. */
export const GLASS_CARD_ELEMENT_IDS = Object.freeze({
  support: 'yin-support-modal',
  quote: 'daily-zen-quote-card',
  'mustard-seed': 'mustard-seed-seal-card',
  'practice-imprint': 'practice-imprint-card',
  wallpapers: 'digital-wallpapers-card',
  'art-collection': 'art-collection-panel',
  sanctuary: 'yin-sanctuary-card',
  membership: 'yin-membership-card',
  tip: 'yin-tip-jar-card',
  newsletter: 'newsletter-capture-card',
  confide: 'confide-to-yin-card',
  cinema: 'zen-cinema-card',
  'ground-exercise': 'ground-exercise-choice',
  moments: 'five-moments-compass',
  'cold-start-goal': 'cold-start-goal-card',
  journey: 'journey-log',
  'help-center': 'help-center',
  'growth-journey': 'growth-journey-detail',
  presence: 'presence-signals-panel',
  'yin-coin': 'yin-coin-panel',
  'local-backup': 'local-practice-data-panel',
  'quiet-together': 'quiet-together-panel',
  'focus-circle': 'focus-circle-panel'
});

export const GLASS_CARD_INTERACTIVE =
  'button, a, input, textarea, select, label, summary, [role="button"], [role="checkbox"], [role="radio"], [contenteditable="true"]';

/** Copyable lines keep the I-beam; empty chrome stays grab-to-drag. */
export const GLASS_CARD_TEXT_SELECT =
  'p, h1, h2, h3, h4, h5, h6, li, dt, dd, blockquote, pre, code, small, time, figcaption, caption, th, td, legend, address, span';

export const GLASS_CARD_DECK_STYLE = `
    [data-ft-glass-card="1"] { cursor: grab; }
    [data-ft-glass-card="1"]:active { cursor: grabbing; }
    [data-ft-glass-card="1"] :is(${GLASS_CARD_TEXT_SELECT}) {
      cursor: text;
      user-select: text;
      -webkit-user-select: text;
    }
    [data-ft-glass-card="1"] :is(${GLASS_CARD_TEXT_SELECT}):active {
      cursor: text;
    }
    [data-ft-glass-card="1"] :is(button, a, label),
    [data-ft-glass-card="1"] :is(button, a, label) * { cursor: pointer; }
    [data-ft-glass-card="1"] :is(input, textarea),
    [data-ft-glass-card="1"] :is(input, textarea) * { cursor: text; }
  `;

/**
 * Text (not controls) should stay selectable, including during QA copy.
 * @param {Element | null | undefined} target
 */
export function glassCardAllowsTextSelect(target) {
  if (!(target && typeof target.closest === 'function')) return false;
  if (target.closest(GLASS_CARD_INTERACTIVE)) return false;
  return Boolean(target.closest(GLASS_CARD_TEXT_SELECT));
}

/**
 * @param {Element | null | undefined} target
 * @param {{ id?: string } | null | undefined} card
 */
export function glassCardAllowsDrag(target, card) {
  if (!card?.id || GLASS_CARD_KEEP_STYLESHEET_Z.has(card.id)) return false;
  if (!(target && typeof target.closest === 'function')) return false;
  if (target.closest(GLASS_CARD_INTERACTIVE)) return false;
  if (glassCardAllowsTextSelect(target)) return false;
  return true;
}

/** Support modal is z 26 above its dim (z 25). The 18/19 deck must not pull it under. */
export const GLASS_CARD_KEEP_STYLESHEET_Z = Object.freeze(
  new Set(['yin-support-modal'])
);

/**
 * @param {string} elementId
 * @param {{ isFront?: boolean }} [opts]
 * @returns {string | null} null = leave stylesheet z-index
 */
export function glassCardInlineZIndex(elementId, { isFront = false } = {}) {
  if (GLASS_CARD_KEEP_STYLESHEET_Z.has(elementId)) return null;
  return isFront ? String(Z.GLASS_CARD_FRONT) : String(Z.GLASS_CARD);
}

/**
 * @param {object} opts
 * @param {string[]} opts.order Newest at the end.
 * @param {string[]} opts.openIds
 * @param {string | null} opts.exceptId Card about to stay open.
 * @param {number} [opts.maxOpen]
 * @returns {{ keepIds: string[], closeIds: string[] }}
 */
export function glassCardIdsToClose({
  order,
  openIds,
  exceptId,
  maxOpen = GLASS_CARD_MAX_OPEN
}) {
  const openOthers = openIds.filter((id) => id && id !== exceptId);
  if (!exceptId) {
    return { keepIds: [], closeIds: openOthers };
  }
  const slots = Math.max(0, maxOpen - 1);
  /** @type {string[]} */
  const newestFirst = [];
  for (let i = order.length - 1; i >= 0; i -= 1) {
    const id = order[i];
    if (id !== exceptId && openOthers.includes(id) && !newestFirst.includes(id)) {
      newestFirst.push(id);
    }
  }
  for (const id of openOthers) {
    if (!newestFirst.includes(id)) newestFirst.push(id);
  }
  const keepIds = newestFirst.slice(0, slots);
  const keep = new Set(keepIds);
  return {
    keepIds,
    closeIds: openOthers.filter((id) => !keep.has(id))
  };
}

/**
 * @param {string | null | undefined} handleId
 * @param {Document} [doc]
 */
export function bringGlassCardToFront(handleId, doc = document) {
  const frontId = handleId ? GLASS_CARD_ELEMENT_IDS[handleId] : '';
  for (const elementId of Object.values(GLASS_CARD_ELEMENT_IDS)) {
    const el = doc.getElementById(elementId);
    if (!el) continue;
    const next = glassCardInlineZIndex(elementId, {
      isFront: elementId === frontId
    });
    if (next == null) {
      el.style.removeProperty('z-index');
      continue;
    }
    el.style.zIndex = next;
  }
}

/**
 * @param {Document} [doc]
 */
export function installGlassCardDeck(doc = document) {
  if (!doc?.body) return;
  for (const elementId of Object.values(GLASS_CARD_ELEMENT_IDS)) {
    const el = doc.getElementById(elementId);
    if (el) el.dataset.ftGlassCard = '1';
  }
  if (doc.body.dataset.ftGlassDeck === '1') return;
  doc.body.dataset.ftGlassDeck = '1';
  const style = doc.createElement('style');
  style.id = 'ft-glass-card-deck';
  style.textContent = GLASS_CARD_DECK_STYLE;
  doc.head.append(style);

  /** @type {{ card: HTMLElement, dx: number, dy: number, pointerId: number } | null} */
  let drag = null;

  doc.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    const target = /** @type {Element | null} */ (event.target);
    const card = target?.closest?.('[data-ft-glass-card="1"]');
    if (!(card instanceof HTMLElement)) return;
    if (!glassCardAllowsDrag(target, card)) return;
    const rect = card.getBoundingClientRect();
    card.style.left = `${rect.left}px`;
    card.style.top = `${rect.top}px`;
    card.style.right = 'auto';
    card.style.bottom = 'auto';
    card.style.transform = 'none';
    card.style.margin = '0';
    card.style.zIndex = String(Z.GLASS_CARD_FRONT);
    drag = {
      card,
      dx: event.clientX - rect.left,
      dy: event.clientY - rect.top,
      pointerId: event.pointerId
    };
    card.setPointerCapture?.(event.pointerId);
  });

  const move = (event) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const maxLeft = Math.max(0, window.innerWidth - 48);
    const maxTop = Math.max(0, window.innerHeight - 48);
    const left = Math.min(maxLeft, Math.max(-drag.card.offsetWidth + 48, event.clientX - drag.dx));
    const top = Math.min(maxTop, Math.max(0, event.clientY - drag.dy));
    drag.card.style.left = `${left}px`;
    drag.card.style.top = `${top}px`;
  };
  doc.addEventListener('pointermove', move);
  const end = (event) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    drag = null;
  };
  doc.addEventListener('pointerup', end);
  doc.addEventListener('pointercancel', end);
}
