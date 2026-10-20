/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { confideClassify } from './confideClassify.js';
import { CONFIDE_ROUTE } from './confideRoutes.js';
import { resolveConfideReply } from './confideReplyFlow.js';
import { shouldUseDesktopCompanionGenerate } from '../desktopCompanionL2Route.js';
import {
  CONFIDE_JA_NOT_YET_OPEN_ENV,
  CONFIDE_JA_NOT_YET_OPEN_EN,
  CONFIDE_JA_NOT_YET_OPEN_JA,
  formatConfideJapaneseNotYetOpenReply
} from './confideJapaneseNotYetOpen.js';

const readyOpen = {
  generateEnabled: true,
  generateLayerOpen: true,
  hasGenerateFn: true
};

const gateOff = { [CONFIDE_JA_NOT_YET_OPEN_ENV]: 'off' };

test('T36 done line: Japanese explicit self-harm still safety-01', () => {
  assert.equal(confideClassify('死にたい'), CONFIDE_ROUTE.SAFETY_REDIRECT);
  const hit = resolveConfideReply({ text: '死にたい', localDate: '2026-10-21' });
  assert.ok(hit);
  assert.equal(hit.route, CONFIDE_ROUTE.SAFETY_REDIRECT);
  assert.equal(hit.line.id, 'safety-01');
  assert.notEqual(hit.line.id, 'language-not-yet-open-01');
  assert.equal(
    shouldUseDesktopCompanionGenerate({ ...readyOpen, route: hit.route }),
    false
  );
});

test('T36 done line: removing the language gate does not drop safety', () => {
  assert.equal(
    confideClassify('死にたい', gateOff),
    CONFIDE_ROUTE.SAFETY_REDIRECT
  );
  const hit = resolveConfideReply({
    text: '死にたい',
    localDate: '2026-10-21',
    env: gateOff
  });
  assert.ok(hit);
  assert.equal(hit.route, CONFIDE_ROUTE.SAFETY_REDIRECT);
  assert.equal(hit.line.id, 'safety-01');
  assert.match(hit.line.en, /Heard\. If this feels too heavy/);
});

test('T36: kana after safety is not-yet-open, not mood or generate', () => {
  assert.equal(
    confideClassify('こんにちは、今日は疲れた'),
    CONFIDE_ROUTE.LANGUAGE_NOT_YET_OPEN
  );
  const hit = resolveConfideReply({
    text: 'こんにちは、今日は疲れた',
    localDate: '2026-10-21'
  });
  assert.ok(hit);
  assert.equal(hit.route, CONFIDE_ROUTE.LANGUAGE_NOT_YET_OPEN);
  assert.equal(hit.line.en, formatConfideJapaneseNotYetOpenReply());
  assert.match(hit.line.en, new RegExp(CONFIDE_JA_NOT_YET_OPEN_EN));
  assert.match(hit.line.en, new RegExp(CONFIDE_JA_NOT_YET_OPEN_JA));
  assert.doesNotMatch(hit.line.en, /cannot be used|不能使用|使えません/);
  assert.equal(
    shouldUseDesktopCompanionGenerate({ ...readyOpen, route: hit.route }),
    false
  );
});

test('T36: mixed English + kana is not-yet-open; English-only unchanged', () => {
  assert.equal(
    confideClassify('I feel sad です'),
    CONFIDE_ROUTE.LANGUAGE_NOT_YET_OPEN
  );
  assert.equal(confideClassify('I feel sad'), CONFIDE_ROUTE.SAD);
  assert.equal(confideClassify('the weather is mild today'), CONFIDE_ROUTE.FALLBACK);
});

test('T36: Chinese is not hard-blocked', () => {
  assert.equal(confideClassify('我不想活了'), CONFIDE_ROUTE.SAFETY_REDIRECT);
  assert.equal(confideClassify('我好难过'), CONFIDE_ROUTE.SAD);
});
