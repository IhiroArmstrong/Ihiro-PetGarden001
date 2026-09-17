/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CONFIDE_ROUTE } from './confideRoutes.js';
import {
  CONFIDE_TOOL_ID,
  isConfideHybridExecutableReadTool
} from './confideExecutableTools.js';
import {
  buildConfideReadHybridPrompt,
  CONFIDE_READ_HYBRID_MEMORY_LIST_GLOSS_LINES,
  parseConfideReadHybridJson
} from './confideToolCallParse.js';
import {
  CONFIDE_READ_HYBRID_MEMORY_LIST_NEG_FIXTURES,
  CONFIDE_READ_HYBRID_MEMORY_LIST_POS_FIXTURES
} from './confideReadHybridGlossFixtures.js';
import { isMemoryListQuestion } from './confideMemoryList.js';
import {
  mayUseConfideReadHybrid,
  resolveConfideReadHybridToolFromRaw
} from './confideReadHybrid.js';

describe('confide read hybrid', () => {
  it('gates hybrid to fallback regex miss on wide desktop only', () => {
    assert.equal(
      mayUseConfideReadHybrid({
        route: CONFIDE_ROUTE.FALLBACK,
        regexTool: null,
        hasBridge: true,
        hasClassifyFn: true,
        wideViewport: true,
        generateEnabled: true
      }),
      true
    );
    assert.equal(
      mayUseConfideReadHybrid({
        route: CONFIDE_ROUTE.FALLBACK,
        regexTool: { id: CONFIDE_TOOL_ID.QUERY_PRACTICE_DURATION },
        hasBridge: true,
        hasClassifyFn: true,
        wideViewport: true
      }),
      false
    );
    assert.equal(
      mayUseConfideReadHybrid({
        route: CONFIDE_ROUTE.FALLBACK,
        regexTool: null,
        hasBridge: true,
        hasClassifyFn: true,
        wideViewport: true,
        generateEnabled: false
      }),
      false
    );
    assert.equal(
      mayUseConfideReadHybrid({
        route: CONFIDE_ROUTE.SAD,
        regexTool: null,
        hasBridge: true,
        hasClassifyFn: true,
        wideViewport: true
      }),
      false
    );
    assert.equal(
      mayUseConfideReadHybrid({
        route: CONFIDE_ROUTE.FALLBACK,
        regexTool: null,
        hasBridge: true,
        hasClassifyFn: true,
        wideViewport: false
      }),
      false
    );
  });

  it('omits forget from read hybrid prompt and parser', () => {
    const prompt = buildConfideReadHybridPrompt('How long?');
    assert.match(prompt, /query_practice_duration/);
    assert.match(prompt, /query_memory_list/);
    assert.equal(prompt.includes('forget_memory_entry'), false);
    const forgetParsed = parseConfideReadHybridJson(
      JSON.stringify({ tool: CONFIDE_TOOL_ID.FORGET_MEMORY_ENTRY, arguments: {} })
    );
    assert.equal(forgetParsed.ok, false);
    assert.equal(forgetParsed.error, 'unknown_tool');
  });

  it('executes only readOnly autoExecute registry tools from L0 JSON', () => {
    const presence = resolveConfideReadHybridToolFromRaw(
      JSON.stringify({ tool: CONFIDE_TOOL_ID.QUERY_PRESENCE_TREND, arguments: {} })
    );
    assert.equal(presence?.id, CONFIDE_TOOL_ID.QUERY_PRESENCE_TREND);
    assert.equal(isConfideHybridExecutableReadTool(presence), true);
    const memoryList = resolveConfideReadHybridToolFromRaw(
      JSON.stringify({ tool: CONFIDE_TOOL_ID.QUERY_MEMORY_LIST, arguments: {} })
    );
    assert.equal(memoryList?.id, CONFIDE_TOOL_ID.QUERY_MEMORY_LIST);
    assert.equal(isConfideHybridExecutableReadTool(memoryList), true);
    assert.equal(
      resolveConfideReadHybridToolFromRaw(
        JSON.stringify({ tool: CONFIDE_TOOL_ID.FORGET_MEMORY_ENTRY, arguments: {} })
      ),
      null
    );
    assert.equal(
      resolveConfideReadHybridToolFromRaw(
        JSON.stringify({ tool: 'none', arguments: {} })
      ),
      null
    );
  });

  it('narrows query_memory_list gloss with negative examples (2026-09-18)', () => {
    const prompt = buildConfideReadHybridPrompt(
      'What have I been spending my time on lately?'
    );
    assert.match(prompt, /ONLY when the user explicitly asks to see, list, recall, or review/);
    assert.match(prompt, /Do NOT classify as query_memory_list/);
    assert.match(prompt, /Do you remember why I started doing this/);
    assert.match(prompt, /What have I been busy with lately/);
    assert.match(prompt, /Show me what you remember/);
    assert.equal(
      prompt.includes('list what Yin remembers on this device'),
      false,
      'old one-line gloss must be gone'
    );
    assert.ok(CONFIDE_READ_HYBRID_MEMORY_LIST_GLOSS_LINES.length >= 8);
    for (const row of CONFIDE_READ_HYBRID_MEMORY_LIST_NEG_FIXTURES) {
      assert.equal(
        isMemoryListQuestion(row.text),
        false,
        `${row.id} must stay regex miss`
      );
      if (row.note.includes('observe-only')) continue;
      assert.match(prompt, new RegExp(row.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    }
    for (const row of CONFIDE_READ_HYBRID_MEMORY_LIST_POS_FIXTURES) {
      assert.match(prompt, new RegExp(row.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    }
  });
});
