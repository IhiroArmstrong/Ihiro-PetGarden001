/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { NewsletterCaptureUI } from './NewsletterCaptureUI.js';
import { ConfideToYinUI } from './ConfideToYinUI.js';
import { TipJarUI } from './TipJarUI.js';
import { SanctuaryUnlockUI } from './SanctuaryUnlockUI.js';
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
  globalThis.requestAnimationFrame = (fn) => {
    fn();
    return 1;
  };
  globalThis.window = {
    setTimeout: mockSetTimeout,
    clearTimeout() {},
    requestAnimationFrame: globalThis.requestAnimationFrame
  };

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
        value: '',
        disabled: false,
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
      delete globalThis.requestAnimationFrame;
      if (previousWindow === undefined) {
        delete globalThis.window;
      } else {
        globalThis.window = previousWindow;
      }
    }
  };
}

/** @param {object} ui */
function assertSb19BackdropContract(ui, id, testId, zIndex) {
  assert.equal(ui.backdrop.id, id);
  assert.equal(ui.backdrop.dataset.testid, testId);
  assert.equal(ui.backdrop.style.zIndex, String(zIndex));
  assert.match(ui.backdrop.className, /ft-overlay-backdrop--sb19-hold/);
}

describe('Paid panels SB-19 overlay backdrop', () => {
  it('NewsletterCaptureUI shows visual-only backdrop that does not dismiss on click', () => {
    const { mountRoot, restore } = makeBackdropTestHarness();
    try {
      const ui = new NewsletterCaptureUI(mountRoot, { storage: null });
      assertSb19BackdropContract(
        ui,
        'newsletter-capture-backdrop',
        'newsletter-capture-backdrop',
        17
      );

      ui.open();
      assert.equal(ui.isOpen(), true);
      assert.equal(ui.backdrop.classList.contains('is-visible'), true);

      ui.backdrop.click();
      assert.equal(ui.isOpen(), true);
    } finally {
      restore();
    }
  });

  it('ConfideToYinUI shows visual-only backdrop that does not dismiss on click', () => {
    const { mountRoot, restore } = makeBackdropTestHarness();
    try {
      const ui = new ConfideToYinUI(mountRoot);
      assertSb19BackdropContract(
        ui,
        'confide-to-yin-backdrop',
        'confide-to-yin-backdrop',
        17
      );

      ui.open();
      assert.equal(ui.isOpen(), true);
      ui.backdrop.click();
      assert.equal(ui.isOpen(), true);
    } finally {
      restore();
    }
  });

  it('TipJarUI shows visual-only backdrop that does not dismiss on click', () => {
    const { mountRoot, restore } = makeBackdropTestHarness();
    try {
      const ui = new TipJarUI(mountRoot, { storage: null });
      assertSb19BackdropContract(ui, 'yin-tip-jar-backdrop', 'yin-tip-jar-backdrop', 17);

      ui.open();
      assert.equal(ui.isOpen(), true);
      ui.backdrop.click();
      assert.equal(ui.isOpen(), true);
    } finally {
      restore();
    }
  });

  it('SanctuaryUnlockUI shows visual-only backdrop at z26 and does not dismiss on click', () => {
    const { mountRoot, timers, restore } = makeBackdropTestHarness();
    try {
      const ui = new SanctuaryUnlockUI(mountRoot, { storage: null });
      assertSb19BackdropContract(
        ui,
        'yin-sanctuary-backdrop',
        'yin-sanctuary-backdrop',
        26
      );

      ui.open();
      assert.equal(ui.isOpen(), true);
      ui.backdrop.click();
      assert.equal(ui.isOpen(), true);

      ui.close();
      assert.equal(ui.isOpen(), false);
      assert.equal(timers.at(-1)?.ms, OVERLAY_BACKDROP_FADE_MS + 40);
    } finally {
      restore();
    }
  });
});
