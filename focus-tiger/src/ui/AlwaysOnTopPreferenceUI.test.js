/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { GLASS_FILL } from './glassPanelStyles.js';
import { AlwaysOnTopPreferenceUI } from './AlwaysOnTopPreferenceUI.js';

function installDocument() {
  const styles = new Map();
  const doc = {
    head: {
      appendChild(node) {
        styles.set(node.id, node);
      }
    },
    getElementById: (id) => styles.get(id) || null,
    createElement() {
      const listeners = new Map();
      const el = {
        id: '',
        className: '',
        hidden: false,
        type: '',
        checked: false,
        disabled: false,
        textContent: '',
        children: [],
        style: {},
        dataset: {},
        append(...nodes) {
          this.children.push(...nodes);
        },
        appendChild(node) {
          this.children.push(node);
        },
        contains(node) {
          return node === this || this.children.includes(node);
        },
        setAttribute() {},
        addEventListener(type, fn) {
          listeners.set(type, fn);
        },
        focus() {}
      };
      return el;
    },
    addEventListener() {},
    removeEventListener() {}
  };
  const previous = globalThis.document;
  globalThis.document = doc;
  return () => {
    globalThis.document = previous;
  };
}

test('always-on-top card is sanctuary glass, not a system sheet', () => {
  const restore = installDocument();
  try {
    const mount = {
      children: [],
      appendChild(node) {
        this.children.push(node);
      }
    };
    const ui = new AlwaysOnTopPreferenceUI(mount);
    ui.openPanel();
    const style = document.getElementById('always-on-top-preference-styles-v1');
    assert.ok(style, 'card stylesheet is on the page');
    assert.match(style.textContent, new RegExp(GLASS_FILL.replace(/[().]/g, '\\$&')));
    assert.doesNotMatch(style.textContent, /NSPanel|sheet/i);
    assert.equal(ui.panel.id, 'always-on-top-preference-panel');
    assert.equal(ui.panel.hidden, false);
  } finally {
    restore();
  }
});
