/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, 'ArtCollectionPanelUI.js'), 'utf8');
const en = readFileSync(join(here, '../locales/en.json'), 'utf8');
const zh = readFileSync(join(here, '../locales/zh.json'), 'utf8');

test('art collection panel is its own glass card', () => {
  assert.match(src, /id: 'art-collection-backdrop'/);
  assert.match(src, /id = 'art-collection-panel'/);
  assert.match(src, /z-index: 18/);
  assert.match(src, /\.art-collection-panel__btn:active:not\(:disabled\)/);
  assert.match(src, /requestArtPurchase/);
  assert.doesNotMatch(src, /localStorage/);
  assert.doesNotMatch(src, /永久拥有/);
  assert.doesNotMatch(src, /登录/);
});

test('art collection copy asks for an email and does not say the purchase is permanent', () => {
  for (const text of [en, zh]) {
    assert.match(text, /ART_COLLECTION_PAYMENT_NOT_OPEN/);
    assert.match(text, /ART_COLLECTION_EMAIL_REQUIRED/);
    assert.match(text, /ART_COLLECTION_MENU_LABEL/);
    assert.doesNotMatch(text, /ART_COLLECTION_[A-Z0-9_]+": "[^"]*永久拥有/);
    assert.doesNotMatch(text, /ART_COLLECTION_[A-Z0-9_]+": "[^"]*log in/i);
  }
});
