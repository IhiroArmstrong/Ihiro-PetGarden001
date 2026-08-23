/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const en = JSON.parse(readFileSync(join(here, '../locales/en.json'), 'utf8'));
const zh = JSON.parse(readFileSync(join(here, '../locales/zh.json'), 'utf8'));
const ja = JSON.parse(readFileSync(join(here, '../locales/ja.json'), 'utf8'));

const HINT_KEYS = [
  'COMPANION_MODE_STAY_HINT',
  'COMPANION_MODE_STEP_AWAY_HINT',
  'COMPANION_MODE_ACROSS_TOOLS_HINT'
];

describe('companionModeCopy', () => {
  it('locks sanctuary-tone one-liners and rejects spec / 走神 phrasing', () => {
    assert.equal(
      en.COMPANION_MODE_STAY_HINT,
      "This seat is enough. Yin's breath is company."
    );
    assert.equal(
      en.COMPANION_MODE_STEP_AWAY_HINT,
      'You may sit elsewhere. This page keeps time; Yin does not ask.'
    );
    assert.equal(
      en.COMPANION_MODE_ACROSS_TOOLS_HINT,
      'The window may rest. Move among your tools; Yin remains.'
    );
    assert.equal(zh.COMPANION_MODE_STAY_HINT, '就在这席。阿寅的呼吸，便是陪伴。');
    assert.equal(
      zh.COMPANION_MODE_STEP_AWAY_HINT,
      '你去别处坐。这一页替你守着时间，阿寅不问。'
    );
    assert.equal(zh.COMPANION_MODE_ACROSS_TOOLS_HINT, '窗口可以收起。你去做事，阿寅仍在。');
    assert.equal(
      ja.COMPANION_MODE_STAY_HINT,
      'この席でよい。阿寅の呼吸が、そばにいます。'
    );
    assert.equal(
      ja.COMPANION_MODE_STEP_AWAY_HINT,
      'よそで坐っても、この頁が時を守ります。阿寅は問いません。'
    );
    assert.equal(
      ja.COMPANION_MODE_ACROSS_TOOLS_HINT,
      '窓は閉じてよい。道具のあいだを行き来しても、阿寅はここに。'
    );

    const joined = HINT_KEYS.map((k) => `${en[k]}\n${zh[k]}\n${ja[k]}`).join(
      '\n'
    );
    assert.doesNotMatch(joined, /distraction|Keep this screen|Minimize the window/i);
    assert.doesNotMatch(joined, /分心|保持此屏幕|最小化窗口|调整你自己/);
    assert.doesNotMatch(joined, /散漫|最小化し|開いたまま/);
  });

  it('does not change mode titles', () => {
    assert.equal(en.COMPANION_MODE_STAY, 'Here & Now');
    assert.equal(en.COMPANION_MODE_STEP_AWAY, 'Offline Space');
    assert.equal(en.COMPANION_MODE_ACROSS_TOOLS, 'Flow State');
  });
});
