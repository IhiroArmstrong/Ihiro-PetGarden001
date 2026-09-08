/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { OVERLAY_OUTSIDE_DISMISS } from '../core/overlaySlotContractRegistry.js';
import {
  OVERLAY_BACKDROP_FADE_MS,
  OVERLAY_BACKDROP_RGBA,
  OVERLAY_BACKDROP_BASE_CLASS,
  createOverlayBackdrop,
  ensureOverlayBackdropStyles,
  hideOverlayBackdrop,
  overlayBackdropBaseCss,
  overlayBackdropDismissModifier,
  showOverlayBackdrop
} from './overlayBackdrop.js';

describe('overlayBackdrop constants', () => {
  it('aligns with Mustard Seed Seal Phase B dim values', () => {
    assert.equal(OVERLAY_BACKDROP_FADE_MS, 220);
    assert.equal(OVERLAY_BACKDROP_RGBA, 'rgba(44, 31, 20, 0.16)');
    const css = overlayBackdropBaseCss();
    assert.match(css, /backdrop-filter:blur\(8px\)/);
    assert.match(css, /rgba\(44, 31, 20, 0\.16\)/);
    assert.match(css, /opacity 220ms ease/);
  });
});

describe('overlayBackdropDismissModifier', () => {
  it('maps blank-closes and sb19-hold to stable modifiers', () => {
    assert.equal(
      overlayBackdropDismissModifier(OVERLAY_OUTSIDE_DISMISS.BLANK_CLOSES),
      'ft-overlay-backdrop--blank-closes'
    );
    assert.equal(
      overlayBackdropDismissModifier(OVERLAY_OUTSIDE_DISMISS.SB19_HOLD),
      'ft-overlay-backdrop--sb19-hold'
    );
  });

  it('defaults unknown dismiss modes to blank-closes', () => {
    assert.equal(
      overlayBackdropDismissModifier('unknown'),
      'ft-overlay-backdrop--blank-closes'
    );
  });
});

describe('overlayBackdrop pointer-events contract', () => {
  it('blank-closes accepts clicks only when visible', () => {
    const css = overlayBackdropBaseCss();
    assert.match(
      css,
      /\.ft-overlay-backdrop--blank-closes\.is-visible[\s\S]*pointer-events: auto/
    );
    assert.match(css, /\.ft-overlay-backdrop \{[\s\S]*pointer-events: none/);
  });

  it('sb19-hold stays visual-only even when visible', () => {
    const css = overlayBackdropBaseCss();
    assert.match(
      css,
      /\.ft-overlay-backdrop--sb19-hold\.is-visible[\s\S]*pointer-events: none/
    );
  });
});

describe('overlayBackdrop lifecycle (mock DOM)', () => {
  it('shows, dismisses on click, and hides after fade', () => {
    const previousDocument = globalThis.document;
    const previousSetTimeout = globalThis.setTimeout;
    const timers = [];
    globalThis.setTimeout = (fn, ms) => {
      timers.push({ fn, ms });
      return timers.length;
    };

    const styles = new Map();
    const mountRoot = { children: [], append(node) { this.children.push(node); } };
    let dismissed = false;

    const doc = {
      head: { appendChild(node) { styles.set(node.id, node); } },
      getElementById: (id) => styles.get(id) || null,
      createElement: (tag) => {
        if (tag === 'style') {
          return { id: '', textContent: '', tagName: 'STYLE' };
        }
        const listeners = new Map();
        const el = {
          tagName: tag.toUpperCase(),
          className: '',
          hidden: false,
          style: {},
          dataset: {},
          classList: {
            _tokens: new Set(),
            add(token) { this._tokens.add(token); },
            remove(token) { this._tokens.delete(token); },
            contains(token) { return this._tokens.has(token); }
          },
          addEventListener(type, fn) {
            listeners.set(type, fn);
          },
          click() {
            listeners.get('click')?.();
          },
          getBoundingClientRect() {}
        };
        return el;
      }
    };
    globalThis.document = doc;

    try {
      const backdrop = createOverlayBackdrop(mountRoot, {
        id: 'daily-zen-quote-backdrop',
        testId: 'daily-zen-quote-backdrop',
        zIndex: 17,
        outsideDismiss: OVERLAY_OUTSIDE_DISMISS.BLANK_CLOSES,
        onDismiss: () => {
          dismissed = true;
        },
        document: doc
      });

      assert.equal(backdrop.id, 'daily-zen-quote-backdrop');
      assert.equal(backdrop.style.zIndex, '17');
      assert.match(backdrop.className, /ft-overlay-backdrop--blank-closes/);
      assert.ok(styles.has('ft-overlay-backdrop-styles-v1'));

      showOverlayBackdrop(backdrop);
      assert.equal(backdrop.hidden, false);
      assert.equal(backdrop.classList.contains('is-visible'), true);

      backdrop.click();
      assert.equal(dismissed, true);

      hideOverlayBackdrop(backdrop);
      assert.equal(backdrop.classList.contains('is-visible'), false);
      assert.equal(timers.length, 1);
      assert.equal(timers[0].ms, OVERLAY_BACKDROP_FADE_MS + 40);
      timers[0].fn();
      assert.equal(backdrop.hidden, true);
    } finally {
      globalThis.document = previousDocument;
      globalThis.setTimeout = previousSetTimeout;
    }
  });

  it('does not wire click dismiss for sb19-hold', () => {
    const previousDocument = globalThis.document;
    const mountRoot = { children: [], append(node) { this.children.push(node); } };
    let dismissed = false;

    const doc = {
      head: { appendChild() {} },
      getElementById: () => null,
      createElement: (tag) => {
        if (tag === 'style') return { id: '', textContent: '' };
        const listeners = new Map();
        return {
          className: '',
          hidden: false,
          style: {},
          dataset: {},
          classList: {
            _tokens: new Set(),
            add(token) { this._tokens.add(token); },
            remove(token) { this._tokens.delete(token); },
            contains(token) { return this._tokens.has(token); }
          },
          addEventListener(type, fn) {
            listeners.set(type, fn);
          },
          click() {
            listeners.get('click')?.();
          },
          getBoundingClientRect() {}
        };
      }
    };
    globalThis.document = doc;

    try {
      const backdrop = createOverlayBackdrop(mountRoot, {
        outsideDismiss: OVERLAY_OUTSIDE_DISMISS.SB19_HOLD,
        onDismiss: () => {
          dismissed = true;
        },
        document: doc
      });
      backdrop.click();
      assert.equal(dismissed, false);
      assert.match(backdrop.className, /ft-overlay-backdrop--sb19-hold/);
    } finally {
      globalThis.document = previousDocument;
    }
  });

  it('ensureOverlayBackdropStyles is idempotent', () => {
    const previousDocument = globalThis.document;
    let injected = 0;
    const styleNodes = new Map();
    const doc = {
      head: {
        appendChild(node) {
          injected += 1;
          if (node.id) styleNodes.set(node.id, node);
        }
      },
      getElementById: (id) => styleNodes.get(id) || null,
      createElement: () => ({ id: '', textContent: '' })
    };
    globalThis.document = doc;
    try {
      ensureOverlayBackdropStyles('ft-overlay-backdrop-styles-v1', doc);
      assert.equal(injected, 1);
      ensureOverlayBackdropStyles('ft-overlay-backdrop-styles-v1', doc);
      assert.equal(injected, 1);
    } finally {
      globalThis.document = previousDocument;
    }
  });
});
