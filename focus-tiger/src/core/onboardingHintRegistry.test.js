import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  HINT_IDS,
  HINT_LOCALE_KEYS,
  HINT_TRIGGER_MODES,
  ONBOARDING_HINT_ANCHORS,
  ONBOARDING_HINT_REGISTRY,
  getHintTriggerMode,
  isClickTriggerHint
} from './onboardingHintRegistry.js';

const VALID_TRIGGER_MODES = new Set(['auto', 'click', 'manual', 'legacy']);

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

test('confirmed click-trigger hints use triggerMode click', () => {
  const clickIds = [
    'how-shall-we-sit',
    'ambient-gated',
    'rise-button',
    'idle-after-session',
    'weekly-heatmap',
    'micro-ritual',
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
  assert.equal(getHintTriggerMode('ambient-soundscape'), 'auto');
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
