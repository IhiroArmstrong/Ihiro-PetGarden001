/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { shouldSyncHomeCtasForRecords } from './WideIdleMoreMenu.js';

/**
 * @param {unknown} target
 * @returns {{ target: unknown }}
 */
const record = (target) => ({ target });

/**
 * @param {unknown[]} owned
 * @returns {{ contains: (node: unknown) => boolean }}
 */
const rowContaining = (owned) => ({
  contains: (node) => owned.includes(node)
});

describe('shouldSyncHomeCtasForRecords', () => {
  it('ignores mutations the home CTA row made to itself', () => {
    const ball = { id: 'ft-wide-home-sit' };
    const ctaRow = rowContaining([ball]);

    // The row writes aria-disabled/hidden on its own balls; reacting to that
    // re-enters the observer forever and freezes the page.
    assert.equal(shouldSyncHomeCtasForRecords([record(ctaRow)], ctaRow), false);
    assert.equal(shouldSyncHomeCtasForRecords([record(ball)], ctaRow), false);
    assert.equal(
      shouldSyncHomeCtasForRecords([record(ball), record(ctaRow)], ctaRow),
      false
    );
  });

  it('syncs when the proxied dock chrome changes', () => {
    const ball = { id: 'ft-wide-home-sit' };
    const ctaRow = rowContaining([ball]);
    const sitPill = { id: 'btn-focus' };

    assert.equal(shouldSyncHomeCtasForRecords([record(sitPill)], ctaRow), true);
    assert.equal(
      shouldSyncHomeCtasForRecords([record(ball), record(sitPill)], ctaRow),
      true
    );
  });

  it('is inert without records and permissive before the row mounts', () => {
    assert.equal(shouldSyncHomeCtasForRecords([], rowContaining([])), false);
    assert.equal(shouldSyncHomeCtasForRecords(null, rowContaining([])), false);
    assert.equal(shouldSyncHomeCtasForRecords([record({})], null), true);
  });
});

describe('wide more menu click reception', () => {
  it('menu rows have :active press (Journey log 0–1s)', () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const src = readFileSync(join(here, 'WideIdleMoreMenu.js'), 'utf8');
    assert.match(src, /\.ft-wide-more__item:active:not\(:disabled\)/);
  });

  it('does not dismiss ⋯ when the click is an onboarding tip or menu chrome', () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const src = readFileSync(join(here, 'WideIdleMoreMenu.js'), 'utf8');
    assert.match(src, /shouldIgnoreOutsideDismissTarget/);
    assert.match(src, /this\.menu\?\.contains\(target\)/);
  });

  it('docks the ⋯ sheet to the right edge instead of growing over Yin', () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const src = readFileSync(join(here, 'WideIdleMoreMenu.js'), 'utf8');
    assert.match(src, /ft-wide-more__backdrop/);
    assert.match(src, /left: max\(56vw, calc\(100vw - 312px\)\)/);
    assert.match(src, /z-index: 26/);
    assert.doesNotMatch(src, /bottom: calc\(100% \+ 10px\)/);
  });

  it('hides the Breath/Quick home ball while Companion 三选一 is staged', () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const src = readFileSync(join(here, 'WideIdleMoreMenu.js'), 'utf8');
    assert.match(
      src,
      /ft-wide-stage-companion #ft-wide-home-quickstart/
    );
    assert.match(src, /companionOpen/);
  });

  it('stages the reminder panel on-canvas (not the empty heatmap stub)', () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const src = readFileSync(join(here, 'WideIdleMoreMenu.js'), 'utf8');
    assert.match(
      src,
      /ft-wide-stage-reminder \.reminder-pref__panel/
    );
    assert.match(src, /pointer-events: auto !important/);
  });

  it('clearStage skips onClearStage while a growth glass card is the overlay', () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const src = readFileSync(join(here, 'WideIdleMoreMenu.js'), 'utf8');
    assert.match(src, /isGrowthCardOverlayActive/);
    assert.match(
      src,
      /if \(this\.handlers\.isGrowthCardOverlayActive\?\.\(\)\) return;[\s\S]*onClearStage/
    );
  });

  it('reminder panel lives on body as viewport-fixed (escapes cluster filter)', () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const src = readFileSync(join(here, 'ReminderPreferenceUI.js'), 'utf8');
    assert.match(src, /position: fixed/);
    assert.match(src, /shouldIgnoreOutsideDismissTarget/);
    assert.match(src, /doc\.body \|\| mountRoot/);
  });
});
