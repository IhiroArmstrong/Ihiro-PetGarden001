/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { GLASS_FILL } from './glassPanelStyles.js';
import { GlobalSitHotkeyPreferenceUI } from './GlobalSitHotkeyPreferenceUI.js';

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

test('global sit hotkey card is sanctuary glass with capture control', () => {
  const restore = installDocument();
  try {
    const mount = {
      children: [],
      appendChild(node) {
        this.children.push(node);
      }
    };
    const ui = new GlobalSitHotkeyPreferenceUI(mount);
    ui.openPanel();
    const style = document.getElementById('global-sit-hotkey-preference-styles-v1');
    assert.ok(style, 'card stylesheet is on the page');
    assert.match(style.textContent, new RegExp(GLASS_FILL.replace(/[().]/g, '\\$&')));
    assert.doesNotMatch(style.textContent, /trafficLight|titleBar|NSPanel|sheet/i);
    assert.equal(ui.panel.id, 'global-sit-hotkey-preference-panel');
    assert.equal(ui.captureBtn.dataset.testid, 'global-sit-hotkey-capture');
    assert.equal(ui.panel.hidden, false);
  } finally {
    restore();
  }
});
