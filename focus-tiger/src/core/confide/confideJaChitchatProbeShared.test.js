/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it, beforeEach, afterEach } from 'node:test';
import {
  appendJaChitchatTurn,
  buildJaChitchatProbeRow,
  historySourceFromDataSource,
  resolveJaChitchatRepeatCount,
  resolveJaChitchatLabRoute
} from '../../../desktop/scripts/l0-ja-chitchat-probe-shared.js';

describe('confideJaChitchatProbeShared', () => {
  const prevRepeats = process.env.FT_CHITCHAT_REPEATS;

  afterEach(() => {
    if (prevRepeats === undefined) delete process.env.FT_CHITCHAT_REPEATS;
    else process.env.FT_CHITCHAT_REPEATS = prevRepeats;
  });

  it('resolveJaChitchatRepeatCount clamps to 2–5', () => {
    delete process.env.FT_CHITCHAT_REPEATS;
    assert.equal(resolveJaChitchatRepeatCount(), 3);
    process.env.FT_CHITCHAT_REPEATS = '2';
    assert.equal(resolveJaChitchatRepeatCount(), 2);
    process.env.FT_CHITCHAT_REPEATS = '9';
    assert.equal(resolveJaChitchatRepeatCount(), 5);
  });

  it('appendJaChitchatTurn mirrors _l2Turns source tagging', () => {
    const history = [];
    appendJaChitchatTurn(history, 'hello', {
      dataSource: 'generate',
      replyText: 'hi'
    });
    assert.equal(history.length, 2);
    assert.equal(history[1].source, 'generate');
    assert.equal(historySourceFromDataSource('corpus'), 'corpus');
  });

  it('buildJaChitchatProbeRow includes raw generate diagnostics', () => {
    const row = buildJaChitchatProbeRow(
      { fixtureId: 'ja-chitchat-01', input: 'test', runIndex: 1 },
      {
        route: 'fallback',
        dataSource: 'corpus',
        corpusId: 'fallback-03',
        replyText: '茶はまだ温かい。',
        needsGenerate: true,
        generateAttempted: true,
        rawGenerate: 'still watching.',
        sanitizePassed: false,
        generateError: null
      }
    );
    assert.equal(row.rawGenerate, 'still watching.');
    assert.equal(row.sanitizePassed, false);
    assert.equal(row.generateAttempted, true);
    assert.equal(row.generateError, null);
    assert.equal(row.onTopic, null);
  });

  it('resolveJaChitchatLabRoute uses session salt for corpus retrieve', () => {
    const text = '小可耐喜欢吃胖粉吗？';
    const first = resolveJaChitchatLabRoute(text);
    assert.equal(first.needsGenerate, true);
    const history = [
      { role: 'user', text },
      { role: 'yin', text: 'first jacket', source: 'corpus' }
    ];
    const sessionExclude = new Set(['fallback-02']);
    const second = resolveJaChitchatLabRoute(text, { history, sessionExclude });
    assert.equal(second.needsGenerate, true);
  });
});
