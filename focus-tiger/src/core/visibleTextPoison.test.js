/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  appendDomChild,
  assertNoVisibleTextPoison,
  findVisibleTextPoison,
  setDomText,
  VISIBLE_TEXT_POISON_RE
} from './visibleTextPoison.js';

describe('visibleTextPoison', () => {
  it('detects poison tokens with word boundaries', () => {
    assert.equal(findVisibleTextPoison('hello undefined world'), 'undefined');
    assert.equal(findVisibleTextPoison('NaN'), 'NaN');
    assert.equal(findVisibleTextPoison('see [object Object] here'), '[object Object]');
    assert.equal(findVisibleTextPoison('banana'), null);
  });

  it('assertNoVisibleTextPoison throws with context', () => {
    assert.throws(
      () => assertNoVisibleTextPoison('x undefined y', 'panel title'),
      /panel title.*undefined/
    );
  });

  it('matches [object Object] without a trailing word boundary after ]', () => {
    assert.equal(findVisibleTextPoison('tail [object Object]'), '[object Object]');
  });
});

describe('dom-safe assembly', () => {
  it('appendDomChild throws on undefined in test env', () => {
    const parent = { children: [], appendChild(node) { this.children.push(node); } };
    assert.throws(
      () => appendDomChild(parent, undefined, 'detail node'),
      /detail node is undefined/
    );
  });

  it('appendDomChild appends real nodes', () => {
    const parent = { children: [], appendChild(node) { this.children.push(node); } };
    const child = { tag: 'span' };
    appendDomChild(parent, child, 'detail node');
    assert.deepEqual(parent.children, [child]);
  });

  it('setDomText throws on null in test env', () => {
    const el = { textContent: '' };
    assert.throws(() => setDomText(el, null, 'title'), /title is null/);
    setDomText(el, 'hello', 'title');
    assert.equal(el.textContent, 'hello');
  });
});
