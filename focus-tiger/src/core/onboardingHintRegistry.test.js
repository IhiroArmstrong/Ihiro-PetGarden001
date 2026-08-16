/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  HINT_IDS,
  HINT_LOCALE_KEYS,
  HINT_TRIGGER_MODES,
  HINT_TIERS,
  ONBOARDING_HINT_ANCHORS,
  ONBOARDING_HINT_REGISTRY,
  getHintTriggerMode,
  getHintTier,
  isClickTriggerHint,
  isDetailedHint
} from './onboardingHintRegistry.js';

const VALID_TRIGGER_MODES = new Set(['auto', 'click', 'manual', 'legacy']);
const VALID_TIERS = new Set(['simple', 'detailed']);

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = join(__dirname, '../locales');

/** @param {string} file */
function readLocale(file) {
  return JSON.parse(readFileSync(join(LOCALES_DIR, file), 'utf8'));
}

test('registry derives HINT_IDS, HINT_LOCALE_KEYS, ONBOARDING_HINT_ANCHORS, HINT_TRIGGER_MODES 1:1', () => {
  const idsFromRegistry = ONBOARDING_HINT_REGISTRY.map((e) => e.id);
  const localeKeys = Object.keys(HINT_LOCALE_KEYS);
  const anchorKeys = Object.keys(ONBOARDING_HINT_ANCHORS);
  const modeKeys = Object.keys(HINT_TRIGGER_MODES);

  assert.deepEqual([...HINT_IDS], idsFromRegistry);
  assert.deepEqual(localeKeys.sort(), [...HINT_IDS].sort());
  assert.deepEqual(anchorKeys.sort(), [...HINT_IDS].sort());
  assert.deepEqual(modeKeys.sort(), [...HINT_IDS].sort());

  for (const entry of ONBOARDING_HINT_REGISTRY) {
    assert.equal(HINT_LOCALE_KEYS[entry.id], entry.localeKey);
    assert.deepEqual(ONBOARDING_HINT_ANCHORS[entry.id], entry.anchor);
    assert.equal(HINT_TRIGGER_MODES[entry.id], entry.triggerMode);
    assert.equal(getHintTriggerMode(entry.id), entry.triggerMode);
    assert.equal(isClickTriggerHint(entry.id), entry.triggerMode === 'click');
  }
});

test('every registry entry has a valid triggerMode', () => {
  for (const { id, triggerMode } of ONBOARDING_HINT_REGISTRY) {
    assert.ok(
      VALID_TRIGGER_MODES.has(triggerMode),
      `${id}: invalid triggerMode "${triggerMode}"`
    );
  }
});

test('tier only on click hints; auto/manual/legacy omit tier (null)', () => {
  for (const entry of ONBOARDING_HINT_REGISTRY) {
    if (entry.triggerMode === 'click') {
      assert.ok(
        entry.tier && VALID_TIERS.has(entry.tier),
        `${entry.id}: click must declare tier simple|detailed`
      );
      assert.equal(getHintTier(entry.id), entry.tier);
      assert.equal(HINT_TIERS[entry.id], entry.tier);
    } else {
      assert.equal(
        entry.tier,
        undefined,
        `${entry.id}: non-click must not set tier (no badge semantics)`
      );
      assert.equal(getHintTier(entry.id), null);
    }
  }
});

test('click tier map: help-affordance detailed; other click hints simple', () => {
  assert.equal(getHintTier('help-affordance'), 'detailed');
  assert.equal(isDetailedHint('help-affordance'), true);
  for (const id of [
    'how-shall-we-sit',
    'ambient-gated',
    'ambient-soundscape',
    'rise-button',
    'idle-after-session',
    'weekly-heatmap',
    'language-preference',
    'micro-ritual',
    'quick-start',
    'in-app-reminder',
    'focus-hud-ring',
    'focus-hud-progress',
    'focus-hud-streak'
  ]) {
    assert.equal(getHintTier(id), 'simple', id);
    assert.equal(isDetailedHint(id), false, id);
  }
  assert.equal(Object.keys(HINT_TIERS).length, 14);
});

test('confirmed click-trigger hints use triggerMode click', () => {
  const clickIds = [
    'how-shall-we-sit',
    'ambient-gated',
    'ambient-soundscape',
    'rise-button',
    'idle-after-session',
    'weekly-heatmap',
    'language-preference',
    'micro-ritual',
    'quick-start',
    'in-app-reminder',
    'help-affordance'
  ];
  for (const id of clickIds) {
    assert.equal(getHintTriggerMode(id), 'click', id);
  }
});

test('companion mode detail hints stay auto (behavior differences)', () => {
  for (const id of ['companion-stay', 'companion-away', 'companion-across-tools']) {
    assert.equal(getHintTriggerMode(id), 'auto', id);
  }
  assert.equal(getHintTriggerMode('companion-mode'), 'auto');
  assert.equal(getHintTriggerMode('ambient-soundscape'), 'click');
});

test('every registry entry has localeKey present in en.json and zh.json', () => {
  const en = readLocale('en.json');
  const zh = readLocale('zh.json');
  for (const { id, localeKey } of ONBOARDING_HINT_REGISTRY) {
    assert.ok(
      localeKey in en,
      `${id}: missing ${localeKey} in en.json`
    );
    assert.ok(
      localeKey in zh,
      `${id}: missing ${localeKey} in zh.json`
    );
  }
});

test('every anchor entry has selector, placement, and tip', () => {
  for (const { id, anchor } of ONBOARDING_HINT_REGISTRY) {
    assert.equal(typeof anchor.selector, 'string');
    assert.ok(anchor.selector.length > 0, `${id}.selector must be non-empty`);
    assert.equal(typeof anchor.placement, 'string');
    assert.ok(anchor.placement.length > 0, `${id}.placement must be non-empty`);
    assert.equal(typeof anchor.tip, 'string');
    assert.ok(anchor.tip.length > 0, `${id}.tip must be non-empty`);
  }
});

test('anchorGroup: selectors must be distinct within each group', () => {
  /** @type {Map<string, { id: string, selector: string }[]>} */
  const byGroup = new Map();
  for (const entry of ONBOARDING_HINT_REGISTRY) {
    if (!entry.anchorGroup) continue;
    const list = byGroup.get(entry.anchorGroup) ?? [];
    list.push({ id: entry.id, selector: entry.anchor.selector });
    byGroup.set(entry.anchorGroup, list);
  }

  for (const [group, members] of byGroup) {
    const seen = new Map();
    for (const { id, selector } of members) {
      const prev = seen.get(selector);
      assert.ok(
        !prev,
        `anchorGroup "${group}": ${id} and ${prev} share selector "${selector}"`
      );
      seen.set(selector, id);
    }
  }
});
