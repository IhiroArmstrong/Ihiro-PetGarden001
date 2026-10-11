/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { GLASS_FILL } from './glassPanelStyles.js';
import { SystemTtsPreferenceUI } from './SystemTtsPreferenceUI.js';

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

test('voice announcement card is sanctuary glass, not a dark plate', () => {
  const restore = installDocument();
  try {
    const mount = {
      children: [],
      appendChild(node) {
        this.children.push(node);
      }
    };
    const ui = new SystemTtsPreferenceUI(mount);
    ui.openPanel();
    const style = document.getElementById('system-tts-preference-styles-v1');
    assert.ok(style, 'card stylesheet is on the page');
    assert.match(style.textContent, new RegExp(GLASS_FILL.replace(/[().]/g, '\\$&')));
    assert.doesNotMatch(style.textContent, /rgba\(28,\s*26,\s*24/);
    assert.equal(ui.titleEl.textContent, 'Voice announcements');
    assert.equal(ui.panel.hidden, false);
  } finally {
    restore();
  }
});
