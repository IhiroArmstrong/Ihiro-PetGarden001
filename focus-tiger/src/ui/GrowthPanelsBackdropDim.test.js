/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { FiveMomentsCompassUI } from './FiveMomentsCompassUI.js';
import { ZenCinemaCardUI } from './ZenCinemaCardUI.js';
import { OVERLAY_BACKDROP_FADE_MS } from './overlayBackdrop.js';

/**
 * @returns {{
 *   mountRoot: { children: unknown[], append: (node: unknown) => void, appendChild: (node: unknown) => void },
 *   doc: object,
 *   timers: { fn: () => void, ms: number }[],
 *   restore: () => void
 * }}
 */
function makeBackdropTestHarness() {
  const previousDocument = globalThis.document;
  const previousSetTimeout = globalThis.setTimeout;
  const previousWindow = globalThis.window;
  const timers = [];
  const mockSetTimeout = (fn, ms) => {
    timers.push({ fn, ms });
    return timers.length;
  };
  globalThis.setTimeout = mockSetTimeout;
  globalThis.window = { setTimeout: mockSetTimeout };

  const styles = new Map();
  const mountRoot = {
    children: [],
    append(node) {
      this.children.push(node);
    },
    appendChild(node) {
      this.children.push(node);
    }
  };

  const doc = {
    head: { appendChild(node) { styles.set(node.id, node); } },
    getElementById: (id) => styles.get(id) || null,
    createElement: (tag) => {
      if (tag === 'style') {
        return { id: '', textContent: '', tagName: 'STYLE' };
      }
      if (tag === 'img') {
        return {
          tagName: 'IMG',
          className: '',
          hidden: false,
          style: {},
          dataset: {},
          addEventListener() {},
          removeAttribute() {},
          setAttribute() {}
        };
      }
      const listeners = new Map();
      const el = {
        tagName: tag.toUpperCase(),
        id: '',
        className: '',
        hidden: false,
        style: {},
        dataset: {},
        textContent: '',
        innerHTML: '',
        children: [],
        append(...nodes) {
          this.children.push(...nodes);
        },
        appendChild(node) {
          this.children.push(node);
        },
        replaceChildren(...nodes) {
          this.children = [...nodes];
        },
        contains(node) {
          return node === this || this.children.includes(node);
        },
        classList: {
          _tokens: new Set(),
          add(token) { this._tokens.add(token); },
          remove(token) { this._tokens.delete(token); },
          toggle(token, on) {
            if (on) this._tokens.add(token);
            else this._tokens.delete(token);
          },
          contains(token) { return this._tokens.has(token); }
        },
        addEventListener(type, fn) {
          listeners.set(type, fn);
        },
        removeEventListener() {},
        click() {
          listeners.get('click')?.();
        },
        focus() {},
        getBoundingClientRect() {},
        setAttribute() {},
        querySelector() { return null; },
        remove() {}
      };
      return el;
    },
    addEventListener() {},
    removeEventListener() {}
  };
  globalThis.document = doc;

  return {
    mountRoot,
    doc,
    timers,
    restore() {
      globalThis.document = previousDocument;
      globalThis.setTimeout = previousSetTimeout;
      if (previousWindow === undefined) {
        delete globalThis.window;
      } else {
        globalThis.window = previousWindow;
      }
    }
  };
}

describe('Growth panels overlay backdrop', () => {
  it('FiveMomentsCompassUI shows shared backdrop on open and blank dismiss', () => {
    const { mountRoot, timers, restore } = makeBackdropTestHarness();
    try {
      const ui = new FiveMomentsCompassUI(mountRoot, { storage: null });
      assert.equal(ui.backdrop.id, 'five-moments-compass-backdrop');
      assert.equal(ui.backdrop.dataset.testid, 'five-moments-compass-backdrop');
      assert.equal(ui.backdrop.style.zIndex, '17');

      ui.open({ firstRun: false });
      assert.equal(ui.isOpen(), true);
      assert.equal(ui.backdrop.classList.contains('is-visible'), true);

      ui.backdrop.click();
      assert.equal(ui.isOpen(), false);
      timers.forEach(({ fn }) => fn());
      assert.equal(ui.backdrop.hidden, true);
    } finally {
      restore();
    }
  });

  it('ZenCinemaCardUI shows shared backdrop on open and blank dismiss', () => {
    const { mountRoot, timers, restore } = makeBackdropTestHarness();
    try {
      const ui = new ZenCinemaCardUI(mountRoot);
      assert.equal(ui.backdrop.id, 'zen-cinema-backdrop');
      assert.equal(ui.backdrop.dataset.testid, 'zen-cinema-backdrop');

      ui.open();
      assert.equal(ui.backdrop.classList.contains('is-visible'), true);
      ui.backdrop.click();
      assert.equal(ui.isOpen(), false);
      assert.equal(timers.at(-1)?.ms, OVERLAY_BACKDROP_FADE_MS + 40);
      timers.forEach(({ fn }) => fn());
      assert.equal(ui.backdrop.hidden, true);
    } finally {
      restore();
    }
  });
});
