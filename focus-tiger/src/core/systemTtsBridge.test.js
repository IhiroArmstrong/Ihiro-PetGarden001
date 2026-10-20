/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { confideClassify } from './confide/confideClassify.js';
import { CONFIDE_ROUTE } from './confide/confideRoutes.js';
import {
  speakSystemTts,
  stopSystemTts,
  canUseSystemTts,
  hasSystemTtsBridge,
  mapLocaleToTtsLocale,
  shouldSpeakConfideReply
} from './systemTtsBridge.js';

/** Let the stop→speak chain settle; the bridge calls are async. */
function flush() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * @param {{ stopThrows?: boolean }} [opts]
 */
function fakeShell({ stopThrows = false } = {}) {
  const calls = [];
  return {
    calls,
    globalObj: {
      desktopShell: {
        isDesktop: true,
        systemTts: {
          async stop() {
            calls.push('stop');
            if (stopThrows) throw new Error('stop failed');
          },
          async speak(payload) {
            calls.push(`speak:${payload.text}`);
          }
        }
      }
    }
  };
}

describe('systemTtsBridge speech coordination (audit T-1 / T-2)', () => {
  it('stops whatever is speaking before starting the next line', async () => {
    const shell = fakeShell();
    assert.equal(speakSystemTts({ text: 'first', globalObj: shell.globalObj }), true);
    await flush();
    assert.equal(speakSystemTts({ text: 'second', globalObj: shell.globalObj }), true);
    await flush();
    assert.deepEqual(shell.calls, ['stop', 'speak:first', 'stop', 'speak:second']);
  });

  it('keeps the newest line even when the two sources are different features', async () => {
    // Confide reply and the focus-end announcement both land here now, so the
    // ordering guarantee is the same regardless of who asked.
    const shell = fakeShell();
    speakSystemTts({ text: 'confide reply', globalObj: shell.globalObj });
    speakSystemTts({ text: 'your sitting time is complete', globalObj: shell.globalObj });
    await flush();
    assert.equal(shell.calls.filter((c) => c === 'stop').length, 2);
    assert.equal(shell.calls[shell.calls.length - 1], 'speak:your sitting time is complete');
  });

  it('still speaks when stopping fails', async () => {
    const shell = fakeShell({ stopThrows: true });
    assert.equal(speakSystemTts({ text: 'hello', globalObj: shell.globalObj }), true);
    await flush();
    assert.deepEqual(shell.calls, ['stop', 'speak:hello']);
  });

  it('dispatches nothing without a bridge or without text', () => {
    const shell = fakeShell();
    assert.equal(speakSystemTts({ text: '   ', globalObj: shell.globalObj }), false);
    assert.equal(speakSystemTts({ text: 'hi', globalObj: {} }), false);
    assert.equal(stopSystemTts({}), false);
    assert.deepEqual(shell.calls, []);
  });

  it('stopSystemTts reports dispatch and reaches the bridge', async () => {
    const shell = fakeShell();
    assert.equal(stopSystemTts(shell.globalObj), true);
    await flush();
    assert.deepEqual(shell.calls, ['stop']);
  });
});

describe('systemTtsBridge', () => {
  it('maps product locales to AVSpeech locale ids', () => {
    assert.equal(mapLocaleToTtsLocale('en'), 'en-US');
    assert.equal(mapLocaleToTtsLocale('ja'), 'ja-JP');
    assert.equal(mapLocaleToTtsLocale('en-US'), 'en-US');
  });

  it('speaks crisis and aggression replies the same as emotion replies (T34)', () => {
    assert.equal(shouldSpeakConfideReply(CONFIDE_ROUTE.SAD), true);
    assert.equal(shouldSpeakConfideReply(CONFIDE_ROUTE.SAFETY_REDIRECT), true);
    assert.equal(shouldSpeakConfideReply(CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS), true);
    assert.equal(
      shouldSpeakConfideReply(
        CONFIDE_ROUTE.SAFETY_REDIRECT,
        'Heard. If this feels too heavy to hold alone, please reach someone you trust or a local crisis line.'
      ),
      true
    );
    assert.equal(shouldSpeakConfideReply(CONFIDE_ROUTE.SAFETY_REDIRECT, '   '), false);
  });

  it('requires desktop wide viewport for product TTS', () => {
    const globalObj = {
      desktopShell: {
        isDesktop: true,
        systemTts: { speak() {} }
      }
    };
    assert.equal(canUseSystemTts({ widthPx: 479, globalObj }), false);
    assert.equal(canUseSystemTts({ widthPx: 480, globalObj }), true);
    assert.equal(hasSystemTtsBridge(globalObj), true);
  });

  it('hides TTS on web builds without bridge', () => {
    assert.equal(canUseSystemTts({ widthPx: 1200, globalObj: {} }), false);
  });

  it('keeps speaking the local-AI reply route (task-confide-tts-v1 挂载点)', () => {
    assert.equal(shouldSpeakConfideReply('generate'), true);
  });

  it('speaks every reachable route id, including crisis and redirect (T34)', () => {
    const expected = {
      [CONFIDE_ROUTE.ANXIOUS]: true,
      [CONFIDE_ROUTE.TIRED]: true,
      [CONFIDE_ROUTE.STUCK]: true,
      [CONFIDE_ROUTE.SAD]: true,
      [CONFIDE_ROUTE.SCATTERED]: true,
      [CONFIDE_ROUTE.FALLBACK]: true,
      [CONFIDE_ROUTE.SAFETY_REDIRECT]: true,
      [CONFIDE_ROUTE.SAFETY_CARE]: true,
      [CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS]: true,
      generate: true,
      help_center_redirect: true
    };
    for (const [route, speaks] of Object.entries(expected)) {
      assert.equal(shouldSpeakConfideReply(route), speaks, `route ${route}`);
    }
    assert.equal(Object.keys(CONFIDE_ROUTE).length, 9);
  });

  it('speaks unrecognised route ids when a reply body is on screen (T34)', () => {
    assert.equal(shouldSpeakConfideReply(''), true);
    assert.equal(shouldSpeakConfideReply(undefined), true);
    assert.equal(shouldSpeakConfideReply(null), true);
    assert.equal(shouldSpeakConfideReply('crisis_followup'), true);
  });

  it('lets stop interrupt a crisis line the same as any other line', async () => {
    const shell = fakeShell();
    const line =
      'Heard. If this feels too heavy to hold alone, please reach someone you trust or a local crisis line.';
    assert.equal(speakSystemTts({ text: line, globalObj: shell.globalObj }), true);
    await flush();
    assert.equal(stopSystemTts(shell.globalObj), true);
    await flush();
    assert.deepEqual(shell.calls, ['stop', `speak:${line}`, 'stop']);
  });
});

describe('crisis paraphrases outside the keyword layer (audit A-1 gap)', () => {
  /**
   * Pinned gap, not desired behaviour. These reach CONFIDE_ROUTE.FALLBACK, so
   * the local-AI branch answers them and — per the TTS v1 挂载点 — speaks the
   * answer. Widening confideSafetyKeywords is deliberately NOT done here:
   * it changes classifier scope and needs its own brief.
   * @type {readonly string[]}
   */
  const PARAPHRASES = Object.freeze([
    'I do not see the point of being here anymore',
    'I want to disappear forever',
    'maybe everyone would be better off without me',
    '我撑不下去了',
    '我不想醒来了',
    'もう消えるしかない'
  ]);

  it('routes to fallback today, which is the open gap', () => {
    for (const text of PARAPHRASES) {
      assert.equal(
        confideClassify(text),
        CONFIDE_ROUTE.FALLBACK,
        `expected the documented gap for: ${text}`
      );
    }
  });

  it('keyword layer still catches the explicit phrasings it claims to', () => {
    assert.equal(confideClassify('I want to kill myself'), CONFIDE_ROUTE.SAFETY_REDIRECT);
    assert.equal(confideClassify('我不想活了'), CONFIDE_ROUTE.SAFETY_REDIRECT);
    assert.equal(confideClassify('死にたい'), CONFIDE_ROUTE.SAFETY_REDIRECT);
  });
});
