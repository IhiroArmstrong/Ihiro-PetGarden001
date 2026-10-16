/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GLASS_FILL,
  GLASS_FILL_STRONG,
  createGlassCard,
  glassPanelSurfaceDecls
} from './glassPanelStyles.js';
import { glassCardInlineZIndex } from './glassCardDeck.js';

test('glass panel fill stays translucent (not near-opaque cream cards)', () => {
  assert.match(GLASS_FILL, /,\.62\)/);
  assert.match(GLASS_FILL_STRONG, /,\.78\)/);
  const decls = glassPanelSurfaceDecls().join(';');
  assert.match(decls, /backdrop-filter/);
  assert.match(decls, /,\.62/);
  assert.doesNotMatch(decls, /0\.9[3-9]/);
});

function fakeDoc() {
  return {
    createElement() {
      return {
        id: '',
        className: '',
        style: { cssText: '' },
        dataset: {}
      };
    }
  };
}

test('createGlassCard defaults to sanctuary glass and does not join the drag deck', () => {
  const el = createGlassCard({ id: 'help-center', doc: fakeDoc() });
  assert.equal(el.id, 'help-center');
  assert.match(el.style.cssText, new RegExp(GLASS_FILL.replace(/[().]/g, '\\$&')));
  assert.equal(el.dataset.ftGlassCard, undefined);
  assert.equal(el.style.zIndex, undefined);
});

test('createGlassCard only marks deck when asked, and never tags Support', () => {
  const help = createGlassCard({
    id: 'help-center',
    deck: true,
    doc: fakeDoc()
  });
  assert.equal(help.dataset.ftGlassCard, '1');
  const support = createGlassCard({
    id: 'yin-support-modal',
    deck: true,
    strong: true,
    doc: fakeDoc()
  });
  assert.equal(support.dataset.ftGlassCard, undefined);
  assert.match(
    support.style.cssText,
    new RegExp(GLASS_FILL_STRONG.replace(/[().]/g, '\\$&'))
  );
  assert.equal(glassCardInlineZIndex('yin-support-modal', { isFront: true }), null);
});
