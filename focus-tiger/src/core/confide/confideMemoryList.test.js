/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { confideClassify } from './confideClassify.js';
import { CONFIDE_ROUTE } from './confideRoutes.js';
import {
  CONFIDE_MEMORY_LIST_MAX,
  formatMemoryListReply,
  isMemoryListQuestion,
  shouldAnswerWithMemoryList
} from './confideMemoryList.js';
import { emptyYinPersonalMemoryState } from '../yinPersonalMemory/yinPersonalMemorySchema.js';

const tFn = (key) =>
  ({
    CONFIDE_MEMORY_LIST_HEADER: 'On this device I keep:',
    CONFIDE_MEMORY_LIST_ITEM: '• {summary}',
    CONFIDE_MEMORY_LIST_MORE: 'And {count} more in What Yin remembers.',
    CONFIDE_MEMORY_LIST_NONE: 'I do not have any remembered observations on this device yet.',
    CONFIDE_MEMORY_LIST_DENIED: 'I am not keeping observations on this device right now.',
    CONFIDE_MEMORY_LIST_UNDECIDED:
      'I have not started keeping observations on this device yet.'
  })[key] || key;

function activeEntry(id, summary, lastSeenAt) {
  return {
    id,
    kind: 'pattern',
    summary,
    evidence: 'confide:turn:1',
    confidence: 'medium',
    firstSeenAt: lastSeenAt,
    lastSeenAt,
    status: 'active',
    sourceRoute: 'confide_fallback'
  };
}

describe('confide memory list (Phase 1A CI-03)', () => {
  it('matches Show memory canonicals and not sharing or forget', () => {
    assert.equal(isMemoryListQuestion('Show me what you remember'), true);
    assert.equal(
      isMemoryListQuestion("Could you show me what you've remembered about me?"),
      true
    );
    assert.equal(
      isMemoryListQuestion('What do you remember from our last few conversations?'),
      true
    );
    assert.equal(isMemoryListQuestion('What do you remember about me?'), true);
    assert.equal(isMemoryListQuestion('你还记得什么'), true);
    assert.equal(isMemoryListQuestion('何を覚えていますか'), true);
    assert.equal(isMemoryListQuestion('I remember feeling tired'), false);
    assert.equal(
      isMemoryListQuestion('Please forget what I said about Monday'),
      false
    );
    assert.equal(isMemoryListQuestion('How long have I practiced?'), false);
  });

  it('requires fallback + Electron bridge and does not steal crisis', () => {
    const text = 'Show me what you remember';
    assert.equal(confideClassify(text), CONFIDE_ROUTE.FALLBACK);
    assert.equal(shouldAnswerWithMemoryList(CONFIDE_ROUTE.FALLBACK, text, true), true);
    assert.equal(shouldAnswerWithMemoryList(CONFIDE_ROUTE.FALLBACK, text, false), false);
    const sad = 'I feel depressed, show me what you remember';
    assert.equal(confideClassify(sad), CONFIDE_ROUTE.SAD);
    assert.equal(shouldAnswerWithMemoryList(CONFIDE_ROUTE.SAD, sad, true), false);
  });

  it('uses honest templates from store summaries without inventing', () => {
    assert.equal(
      formatMemoryListReply(emptyYinPersonalMemoryState(), tFn),
      'I have not started keeping observations on this device yet.'
    );
    assert.equal(
      formatMemoryListReply({ ...emptyYinPersonalMemoryState(), consent: 'denied' }, tFn),
      'I am not keeping observations on this device right now.'
    );
    assert.equal(
      formatMemoryListReply(
        { ...emptyYinPersonalMemoryState(), consent: 'granted', memories: [] },
        tFn
      ),
      'I do not have any remembered observations on this device yet.'
    );
    const listed = formatMemoryListReply(
      {
        ...emptyYinPersonalMemoryState(),
        consent: 'granted',
        memories: [
          activeEntry('a', 'Mondays feel crowded', '2026-09-01T10:00:00.000Z'),
          activeEntry('b', 'Prefers quiet, short reflections', '2026-09-01T09:00:00.000Z')
        ]
      },
      tFn
    );
    assert.match(listed, /^On this device I keep:\n/);
    assert.match(listed, /• Mondays feel crowded/);
    assert.match(listed, /• Prefers quiet, short reflections/);
    assert.equal(listed.includes('invented'), false);
  });

  it('caps the oral list and points to the panel for the rest', () => {
    const memories = Array.from({ length: CONFIDE_MEMORY_LIST_MAX + 2 }, (_, i) =>
      activeEntry(
        `m${i}`,
        `Summary ${i}`,
        `2026-09-01T${String(i).padStart(2, '0')}:00:00.000Z`
      )
    );
    const listed = formatMemoryListReply(
      { ...emptyYinPersonalMemoryState(), consent: 'granted', memories },
      tFn
    );
    assert.match(listed, /And 2 more in What Yin remembers\./);
    assert.equal(listed.split('\n• ').length - 1, CONFIDE_MEMORY_LIST_MAX);
  });
});
