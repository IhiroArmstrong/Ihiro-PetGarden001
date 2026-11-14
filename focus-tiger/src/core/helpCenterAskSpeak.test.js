/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildHelpCenterClosestAnswerSpeakText,
  joinHelpCenterTitleAndBody,
  shouldSpeakHelpCenterAskSurface
} from './helpCenterAskSpeak.js';

const here = dirname(fileURLToPath(import.meta.url));
const helpCenterUi = readFileSync(join(here, '../ui/HelpCenterUI.js'), 'utf8');

test('shouldSpeakHelpCenterAskSurface follows on-screen text, not route names', () => {
  assert.equal(shouldSpeakHelpCenterAskSurface('How to start Sit with Yin'), true);
  assert.equal(shouldSpeakHelpCenterAskSurface('   '), false);
  assert.equal(shouldSpeakHelpCenterAskSurface(''), false);
});

test('joinHelpCenterTitleAndBody speaks title then body as one utterance', () => {
  assert.equal(
    joinHelpCenterTitleAndBody('How to start Sit with Yin', 'On the home seat, tap Sit with Yin.'),
    'How to start Sit with Yin. On the home seat, tap Sit with Yin.'
  );
  assert.equal(joinHelpCenterTitleAndBody('Title only', ''), 'Title only');
  assert.equal(joinHelpCenterTitleAndBody('', 'Body only'), 'Body only');
});

test('closest answer is the first ranked article title and body', () => {
  const spoken = buildHelpCenterClosestAnswerSpeakText({
    articleIds: ['KB-FUNC-0001', 'KB-FUNC-0007'],
    translate: (key) => {
      if (key === 'HELP_CENTER_ARTICLE_KB_FUNC_0001_TITLE') return 'How to start Sit with Yin';
      if (key === 'HELP_CENTER_ARTICLE_KB_FUNC_0001_BODY') return 'On the home seat, tap Sit with Yin.';
      if (key === 'HELP_CENTER_ARTICLE_KB_FUNC_0007_TITLE') return 'How to end a sit';
      if (key === 'HELP_CENTER_ARTICLE_KB_FUNC_0007_BODY') return 'Tap Rise.';
      return key;
    }
  });
  assert.equal(spoken, 'How to start Sit with Yin. On the home seat, tap Sit with Yin.');
  assert.doesNotMatch(spoken, /Tap Rise/);
});

test('empty ask results speak the on-screen empty line', () => {
  assert.equal(
    buildHelpCenterClosestAnswerSpeakText({
      articleIds: [],
      empty: true,
      emptyText: 'No matching topics'
    }),
    'No matching topics'
  );
});

test('T92 safety line is spoken instead of a topic article', () => {
  assert.equal(
    buildHelpCenterClosestAnswerSpeakText({
      articleIds: ['KB-FUNC-0001'],
      safetyText: 'If this feels too heavy, please call a local helpline.',
      translate: () => 'Must not speak this article'
    }),
    'If this feels too heavy, please call a local helpline.'
  );
});

test('HelpCenterUI speaks search/safety/card-open answers and stops on close', () => {
  assert.match(helpCenterUi, /buildHelpCenterClosestAnswerSpeakText/);
  assert.match(helpCenterUi, /_speakClosestAskAnswer/);
  assert.match(helpCenterUi, /_openArticle\(articleId, \{ speak: true \}\)/);
  const closeAt = helpCenterUi.indexOf('  close() {');
  const closeFn = helpCenterUi.slice(closeAt, helpCenterUi.indexOf('  _showIndex() {', closeAt));
  assert.match(closeFn, /stopSystemTts\(\)/);
});

test('HelpCenterUI does not auto-search on Speak-to-type (T22)', () => {
  assert.doesNotMatch(helpCenterUi, /onTranscriptCommitted:\s*\(\)\s*=>\s*void this\._submitAsk/);
});
