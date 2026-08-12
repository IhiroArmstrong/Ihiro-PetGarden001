import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { COPY_POOLS } from '../locales/i18n.js';
import en from '../locales/en.json' with { type: 'json' };
import zh from '../locales/zh.json' with { type: 'json' };

const here = dirname(fileURLToPath(import.meta.url));

test('FOCUS_AWARENESS pool has three observational keys', () => {
  assert.equal(COPY_POOLS.FOCUS_AWARENESS.length, 3);
});

test('zh awareness copy matches product short lines (no thesis sentence)', () => {
  assert.equal(zh.FOCUS_AWARENESS_1, '念头如云，聚了又散。');
  assert.equal(zh.FOCUS_AWARENESS_2, '此间无事，唯有呼吸。');
  assert.equal(zh.FOCUS_AWARENESS_3, '身体坐在这里，心也坐在这里。');
  const blob = `${zh.FOCUS_AWARENESS_1}${zh.FOCUS_AWARENESS_2}${zh.FOCUS_AWARENESS_3}`;
  assert.equal(blob.includes('最好的正念辅导'), false);
  assert.equal(en.FOCUS_AWARENESS_1.length > 0, true);
});

test('FocusAwarenessCardUI anchors bottom and skips Moment Whisper gate', () => {
  const src = readFileSync(join(here, 'FocusAwarenessCardUI.js'), 'utf8');
  assert.equal(src.includes('momentWhispersGate'), false);
  assert.equal(src.includes('markMomentWhisperSeen'), false);
  assert.match(src, /homeClearanceBottomCss/);
  assert.match(src, /bottom:/);
});
