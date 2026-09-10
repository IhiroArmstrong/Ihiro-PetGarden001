/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DailyZenQuoteCardUI } from './DailyZenQuoteCardUI.js';
import { OVERLAY_BACKDROP_FADE_MS } from './overlayBackdrop.js';

describe('DailyZenQuoteCardUI overlay backdrop', () => {
  it('shows shared backdrop on open and hides on close / blank dismiss', () => {
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
      append(node) { this.children.push(node); },
      appendChild(node) { this.children.push(node); }
    };
    const storage = {
      _data: {},
      getItem(key) {
        return this._data[key] ?? null;
      },
      setItem(key, value) {
        this._data[key] = value;
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
            complete: true,
            naturalWidth: 1,
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
          children: [],
          append(...nodes) {
            this.children.push(...nodes);
          },
          appendChild(node) {
            this.children.push(node);
          },
          contains(node) {
            return node === this || this.children.includes(node);
          },
          classList: {
            _tokens: new Set(),
            add(token) { this._tokens.add(token); },
            remove(token) { this._tokens.delete(token); },
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
          remove() {}
        };
        return el;
      },
      addEventListener() {},
      removeEventListener() {}
    };
    globalThis.document = doc;

    try {
      const ui = new DailyZenQuoteCardUI(mountRoot, { storage });
      assert.equal(ui.backdrop.id, 'daily-zen-quote-backdrop');
      assert.equal(ui.backdrop.dataset.testid, 'daily-zen-quote-backdrop');
      assert.equal(ui.backdrop.style.zIndex, '17');
      assert.equal(ui.backdrop.hidden, true);

      ui.open();
      assert.equal(ui.isOpen(), true);
      assert.equal(ui.backdrop.hidden, false);
      assert.equal(ui.backdrop.classList.contains('is-visible'), true);
      assert.equal(ui.root.classList.contains('is-visible'), true);

      ui.backdrop.click();
      assert.equal(ui.isOpen(), false);
      assert.equal(ui.backdrop.classList.contains('is-visible'), false);

      assert.equal(timers.length, 2);
      assert.equal(timers[0].ms, OVERLAY_BACKDROP_FADE_MS + 40);
      assert.equal(timers[1].ms, OVERLAY_BACKDROP_FADE_MS + 40);
      timers.forEach(({ fn }) => fn());
      assert.equal(ui.backdrop.hidden, true);
      assert.equal(ui.root.hidden, true);
    } finally {
      globalThis.document = previousDocument;
      globalThis.setTimeout = previousSetTimeout;
      if (previousWindow === undefined) {
        delete globalThis.window;
      } else {
        globalThis.window = previousWindow;
      }
    }
  });
});
