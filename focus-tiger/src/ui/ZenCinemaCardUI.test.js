/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ZenCinemaCardUI } from './ZenCinemaCardUI.js';
import { OVERLAY_BACKDROP_FADE_MS } from './overlayBackdrop.js';

function createMockDocument() {
  const styles = new Map();

  const createEl = (tag) => {
    const childListeners = new Map();
    const el = {
      tagName: String(tag).toUpperCase(),
      id: '',
      className: '',
      hidden: false,
      style: {},
      dataset: {},
      textContent: '',
      children: [],
      src: '',
      alt: '',
      width: 0,
      height: 0,
      decoding: '',
      loading: '',
      draggable: false,
      type: '',
      append(...nodes) {
        this.children.push(...nodes);
      },
      appendChild(node) {
        this.children.push(node);
        return node;
      },
      contains(node) {
        return node === this || this.children.includes(node);
      },
      classList: {
        _tokens: new Set(),
        add(token) {
          this._tokens.add(token);
        },
        remove(token) {
          this._tokens.delete(token);
        },
        toggle(token, on) {
          if (on) this._tokens.add(token);
          else this._tokens.delete(token);
        },
        contains(token) {
          return this._tokens.has(token);
        }
      },
      addEventListener(type, fn) {
        childListeners.set(type, fn);
      },
      removeEventListener() {},
      click() {
        childListeners.get('click')?.();
      },
      focus() {},
      getBoundingClientRect() {
        return { width: 1, height: 1 };
      },
      setAttribute(name, value) {
        if (name === 'data-testid') this.dataset.testid = value;
      },
      removeAttribute() {},
      querySelector(sel) {
        if (sel === '.zen-cinema-card__tile-label') {
          return this.children.find((c) =>
            String(c.className || '').includes('zen-cinema-card__tile-label')
          );
        }
        return null;
      },
      remove() {}
    };
    return el;
  };

  return {
    head: {
      appendChild(node) {
        styles.set(node.id, node);
      }
    },
    getElementById: (id) => styles.get(id) || null,
    createElement: (tag) => {
      if (tag === 'style') return { id: '', textContent: '', tagName: 'STYLE' };
      return createEl(tag);
    },
    addEventListener() {},
    removeEventListener() {}
  };
}

describe('ZenCinemaCardUI film grid', () => {
  it('opens selected film URL after picking a tile', () => {
    const previousDocument = globalThis.document;
    const previousSetTimeout = globalThis.setTimeout;
    const previousWindow = globalThis.window;
    const timers = [];
    const mockSetTimeout = (fn, ms) => {
      timers.push({ fn, ms });
      return timers.length;
    };
    globalThis.setTimeout = mockSetTimeout;
    globalThis.window = { setTimeout: mockSetTimeout, open() { return null; } };

    globalThis.document = createMockDocument();
    const mountRoot = {
      children: [],
      append(node) {
        this.children.push(node);
      },
      appendChild(node) {
        this.children.push(node);
      }
    };

    try {
      /** @type {string[]} */
      const opened = [];
      const ui = new ZenCinemaCardUI(mountRoot, {
        onOpenExternal: (url) => opened.push(url)
      });
      assert.equal(ui.gridEl.dataset.testid, 'zen-cinema-grid');
      assert.equal(ui._tileButtons.size >= 2, true);

      const second = ui._tileButtons.get('what-is-zen');
      assert.ok(second);
      second.click();
      assert.equal(ui._selectedId, 'what-is-zen');
      assert.equal(second.classList.contains('is-selected'), true);

      ui.open();
      ui.openBtn.click();
      assert.deepEqual(opened, ['https://youtu.be/xawM6cgJSrE']);
      assert.equal(ui.isOpen(), false);
      assert.equal(timers[0]?.ms, OVERLAY_BACKDROP_FADE_MS + 40);
    } finally {
      globalThis.document = previousDocument;
      globalThis.setTimeout = previousSetTimeout;
      if (previousWindow === undefined) delete globalThis.window;
      else globalThis.window = previousWindow;
    }
  });
});
