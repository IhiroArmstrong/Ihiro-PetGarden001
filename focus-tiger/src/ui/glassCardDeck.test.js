/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  glassCardAllowsDrag,
  glassCardAllowsTextSelect,
  glassCardIdsToClose,
  glassCardInlineZIndex,
  GLASS_CARD_DECK_STYLE,
  GLASS_CARD_DRAG_TITLE,
  GLASS_CARD_EXTRA_ELEMENT_IDS,
  GLASS_CARD_IDLE_MENU_IDS,
  GLASS_CARD_INTERACTIVE,
  GLASS_CARD_KEEP_STYLESHEET_Z,
  GLASS_CARD_STAGE_Z,
  GLASS_CARD_TEXT_SELECT
} from './glassCardDeck.js';

function fakePointerTarget({
  interactive = false,
  text = false,
  dragChrome = false,
  titleHandle = false
} = {}) {
  return {
    closest(sel) {
      if (sel === GLASS_CARD_DRAG_TITLE) {
        return dragChrome || titleHandle ? { id: 'title-chrome' } : null;
      }
      if (sel === GLASS_CARD_INTERACTIVE) return interactive ? { id: 'control' } : null;
      if (sel === GLASS_CARD_TEXT_SELECT) return text ? { id: 'copy' } : null;
      return null;
    }
  };
}

test('a third glass card closes the older open card and keeps the newer one', () => {
  const { keepIds, closeIds } = glassCardIdsToClose({
    order: ['help-center', 'moments', 'quote'],
    openIds: ['help-center', 'moments'],
    exceptId: 'quote'
  });
  assert.deepEqual(keepIds, ['moments']);
  assert.deepEqual(closeIds, ['help-center']);
});

test('one open card stays when another opens', () => {
  const { keepIds, closeIds } = glassCardIdsToClose({
    order: ['help-center', 'moments'],
    openIds: ['help-center'],
    exceptId: 'moments'
  });
  assert.deepEqual(keepIds, ['help-center']);
  assert.deepEqual(closeIds, []);
});

test('opening nothing keeps no cards', () => {
  const { closeIds } = glassCardIdsToClose({
    order: ['help-center', 'moments'],
    openIds: ['help-center', 'moments'],
    exceptId: null
  });
  assert.deepEqual(closeIds, ['help-center', 'moments']);
});

test('Support modal keeps stylesheet z-index so the dim layer cannot eat Subscribe', () => {
  assert.equal(GLASS_CARD_KEEP_STYLESHEET_Z.has('yin-support-modal'), true);
  assert.equal(glassCardInlineZIndex('yin-support-modal', { isFront: true }), null);
  assert.equal(glassCardInlineZIndex('yin-support-modal', { isFront: false }), null);
  const front = glassCardInlineZIndex('help-center', { isFront: true });
  const back = glassCardInlineZIndex('help-center', { isFront: false });
  assert.equal(front, '19');
  assert.equal(back, '18');
  assert.ok(Number(front) < 25, 'deck stack stays below Support dim (25)');
});

test('Journey Log stays above its dim and the wide ⋯ sheet (not deck 18/19)', () => {
  assert.equal(GLASS_CARD_STAGE_Z.has('journey-log'), true);
  assert.equal(glassCardInlineZIndex('journey-log', { isFront: true }), '32');
  assert.equal(glassCardInlineZIndex('journey-log', { isFront: false }), '32');
  assert.ok(
    Number(glassCardInlineZIndex('journey-log', { isFront: true })) > 31,
    'card must sit above journey-log-backdrop (31)'
  );
  assert.ok(
    Number(glassCardInlineZIndex('journey-log', { isFront: true })) > 27,
    'card must sit above wide ⋯ sheet (26/27)'
  );
});

test('copyable lines on a glass card keep a text cursor and do not start a drag', () => {
  const card = { id: 'confide-to-yin-card' };
  const copy = fakePointerTarget({ text: true });
  assert.equal(glassCardAllowsTextSelect(copy), true);
  assert.equal(glassCardAllowsDrag(copy, card), false);
  assert.match(GLASS_CARD_DECK_STYLE, /cursor:\s*text/);
  assert.match(GLASS_CARD_DECK_STYLE, /user-select:\s*text/);
});

test('Confide card never drags (fixed centered layout)', () => {
  const card = { id: 'confide-to-yin-card' };
  assert.equal(glassCardAllowsDrag(fakePointerTarget(), card), false);
});

test('empty glass-card chrome still starts a drag', () => {
  const card = { id: 'help-center' };
  assert.equal(glassCardAllowsDrag(fakePointerTarget(), card), true);
  assert.equal(glassCardAllowsTextSelect(fakePointerTarget()), false);
});

test('card title rows drag even when they use copyable tags', () => {
  const card = { id: 'help-center' };
  const titleHit = fakePointerTarget({ text: true, titleHandle: true });
  assert.equal(glassCardAllowsDrag(titleHit, card), true);
});

test('preference panels keep z35 in the deck and title chrome can drag', () => {
  assert.equal(glassCardInlineZIndex('reminder-preference-panel', { isFront: true }), '35');
  const card = { id: 'reminder-preference-panel' };
  assert.equal(
    glassCardAllowsDrag(fakePointerTarget({ dragChrome: true }), card),
    true
  );
});

test('wide ⋯ navigation sheets register in the drag deck', () => {
  assert.ok(GLASS_CARD_EXTRA_ELEMENT_IDS.includes('ft-wide-more-menu'));
  assert.ok(GLASS_CARD_EXTRA_ELEMENT_IDS.includes('ft-wide-more-radial'));
  assert.equal(GLASS_CARD_IDLE_MENU_IDS.has('ft-wide-more-menu'), true);
  const menuChrome = fakePointerTarget({ dragChrome: true });
  assert.equal(glassCardAllowsDrag(menuChrome, { id: 'ft-wide-more-menu' }), true);
});

test('buttons stay pointer-hit and Support still does not drag', () => {
  const confide = { id: 'confide-to-yin-card' };
  assert.equal(glassCardAllowsDrag(fakePointerTarget({ interactive: true }), confide), false);
  assert.equal(glassCardAllowsTextSelect(fakePointerTarget({ interactive: true, text: true })), false);
  assert.equal(glassCardAllowsDrag(fakePointerTarget(), { id: 'yin-support-modal' }), false);
  assert.match(GLASS_CARD_DECK_STYLE, /cursor:\s*pointer/);
});
