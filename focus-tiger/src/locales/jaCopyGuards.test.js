/**
 * Unit · jaCopyGuards (parity / script / placeholder helpers for i18n:sync).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  hasJapaneseScript,
  isJaProperNounAllowlisted,
  listJaEqualToEn,
  listJaMissingJapaneseScript,
  listMissingJaKeys
} from './jaCopyGuards.js';

test('hasJapaneseScript accepts kana and kanji-only labels', () => {
  assert.equal(hasJapaneseScript('到着'), true);
  assert.equal(hasJapaneseScript('回復'), true);
  assert.equal(hasJapaneseScript('正直チェックイン'), true);
  assert.equal(hasJapaneseScript('フォーカス'), true);
  assert.equal(hasJapaneseScript('Honesty Check-in'), false);
  assert.equal(hasJapaneseScript('Arrive'), false);
  assert.equal(hasJapaneseScript('Focus Tiger'), false);
});

test('designer kana-only rule would reject kanji labels — we intentionally allow kanji', () => {
  // Regression note for product review: do not require hiragana/katakana alone.
  assert.equal(/[\u3040-\u309F\u30A0-\u30FF]/.test('到着'), false);
  assert.equal(hasJapaneseScript('到着'), true);
});

test('listMissingJaKeys / equal-en / missing-script', () => {
  const en = {
    A: 'Hello',
    B: 'World',
    APP_TITLE: 'Focus Tiger',
    AMBIENT_TRACK_RAIN: 'Rain'
  };
  const ja = {
    A: 'こんにちは',
    B: 'World',
    APP_TITLE: 'Focus Tiger',
    AMBIENT_TRACK_RAIN: 'Rain',
    C: '余分'
  };
  assert.deepEqual(listMissingJaKeys({ ...en, NEW: 'x' }, ja), ['NEW']);
  assert.deepEqual(listJaEqualToEn(en, ja), ['B']);
  assert.deepEqual(listJaMissingJapaneseScript({ X: 'Only Latin' }), ['X']);
  assert.deepEqual(listJaMissingJapaneseScript({ Y: '到着' }), []);
  assert.equal(isJaProperNounAllowlisted('APP_TITLE'), true);
  assert.equal(isJaProperNounAllowlisted('AMBIENT_TRACK_X'), true);
  assert.equal(isJaProperNounAllowlisted('BTN_FOCUS_START'), false);
});
