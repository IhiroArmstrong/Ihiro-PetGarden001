/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CalmActionReflectStore } from '../core/CalmActionReflectStore.js';
import {
  mountReflectionCalmAction,
  refreshReflectionCalmActionLine
} from './reflectionCalmActionMount.js';

function fakeCreateElement(tag) {
  const children = [];
  /** @type {any} */
  const el = {
    tagName: String(tag).toUpperCase(),
    style: { cssText: '' },
    dataset: {},
    textContent: '',
    children,
    appendChild(child) {
      children.push(child);
      return child;
    }
  };
  return el;
}

test('mountReflectionCalmAction appends calm action line above daily wisdom slot', () => {
  /** @type {any[]} */
  const appended = [];
  const root = {
    appendChild(node) {
      appended.push(node);
      return node;
    }
  };
  const store = new CalmActionReflectStore();
  const mounted = mountReflectionCalmAction(root, store, 'en', {
    createElement: fakeCreateElement
  });
  assert.ok(mounted.host);
  assert.ok(mounted.lineEl);
  assert.equal(appended.length, 1);
  assert.equal(appended[0], mounted.host);
  assert.equal(mounted.host?.dataset?.testid, 'reflection-calm-action');
  assert.equal(mounted.lineEl?.dataset?.testid, 'calm-action-reflect-line');
  assert.match(String(mounted.lineEl?.textContent || ''), /.{12,}/);
});

test('refreshReflectionCalmActionLine updates locale text for locked id', () => {
  const store = new CalmActionReflectStore();
  const en = store.resolveQuote('en');
  assert.ok(en?.id);
  const lineEl = { textContent: '', dataset: { calmActionId: '' } };
  refreshReflectionCalmActionLine(lineEl, store, 'ja');
  assert.equal(lineEl.dataset.calmActionId, en.id);
  assert.ok(lineEl.textContent);
  assert.notEqual(lineEl.textContent, en.text);
});
