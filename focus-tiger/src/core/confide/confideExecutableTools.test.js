/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { confideClassify } from './confideClassify.js';
import { CONFIDE_ROUTE } from './confideRoutes.js';
import {
  CONFIDE_EXECUTABLE_TOOLS,
  CONFIDE_TOOL_ID,
  CONFIDE_TOOL_RISK,
  matchConfideExecutableTool
} from './confideExecutableTools.js';
import {
  buildConfideToolCallLabPrompt,
  parseConfideToolCallJson,
  scoreConfideToolCall
} from './confideToolCallParse.js';
import { CONFIDE_TOOL_CALL_FIXTURES } from './confideToolCallFixtures.js';

describe('confide executable tool registry', () => {
  it('keeps V1 order practice → presence → forget', () => {
    assert.deepEqual(
      CONFIDE_EXECUTABLE_TOOLS.map((tool) => tool.id),
      [
        CONFIDE_TOOL_ID.QUERY_PRACTICE_DURATION,
        CONFIDE_TOOL_ID.QUERY_PRESENCE_TREND,
        CONFIDE_TOOL_ID.FORGET_MEMORY_ENTRY
      ]
    );
  });

  it('matches duration and trend on fallback only', () => {
    const duration = 'How long have I practiced?';
    assert.equal(confideClassify(duration), CONFIDE_ROUTE.FALLBACK);
    assert.equal(
      matchConfideExecutableTool({ route: CONFIDE_ROUTE.FALLBACK, text: duration })
        ?.id,
      CONFIDE_TOOL_ID.QUERY_PRACTICE_DURATION
    );
    const mood = 'Has my mood improved these two weeks?';
    assert.equal(
      matchConfideExecutableTool({ route: CONFIDE_ROUTE.FALLBACK, text: mood })?.id,
      CONFIDE_TOOL_ID.QUERY_PRESENCE_TREND
    );
    const sad = 'I feel depressed, how long have I practiced?';
    assert.equal(confideClassify(sad), CONFIDE_ROUTE.SAD);
    assert.equal(
      matchConfideExecutableTool({ route: CONFIDE_ROUTE.SAD, text: sad }),
      null
    );
  });

  it('does not match verbal forget without bridge and consent-shaped state', () => {
    assert.equal(
      matchConfideExecutableTool({
        route: CONFIDE_ROUTE.FALLBACK,
        text: 'Please forget what I said about Monday',
        hasBridge: false
      }),
      null
    );
  });

  it('labels read vs reversible risk', () => {
    assert.equal(
      CONFIDE_EXECUTABLE_TOOLS[0].risk,
      CONFIDE_TOOL_RISK.READ
    );
    assert.equal(
      CONFIDE_EXECUTABLE_TOOLS[2].risk,
      CONFIDE_TOOL_RISK.LOCAL_REVERSIBLE
    );
    assert.equal(CONFIDE_EXECUTABLE_TOOLS[2].autoExecute, false);
  });
});

describe('confide tool-call parse (lab)', () => {
  it('accepts fenced JSON and scores write false positives', () => {
    const parsed = parseConfideToolCallJson(
      'Sure.\n```json\n{"tool":"forget_memory_entry","arguments":{}}\n```'
    );
    assert.equal(parsed.ok, true);
    assert.equal(parsed.tool, CONFIDE_TOOL_ID.FORGET_MEMORY_ENTRY);
    const score = scoreConfideToolCall({
      expectedId: 'none',
      parsed
    });
    assert.equal(score.hit, false);
    assert.equal(score.writeFalsePositive, true);
  });

  it('rejects unknown tools including backup', () => {
    const parsed = parseConfideToolCallJson(
      '{"tool":"backup_journey_log","arguments":{"period":"this_week"}}'
    );
    assert.equal(parsed.ok, false);
    assert.equal(parsed.error, 'unknown_tool');
  });

  it('builds a lab prompt that lists frozen ids', () => {
    const prompt = buildConfideToolCallLabPrompt('How long have I practiced?');
    assert.match(prompt, /query_practice_duration/);
    assert.match(prompt, /none/);
    assert.match(prompt, /How long have I practiced\?/);
  });

  it('keeps fixture expected ids inside the allowed set', () => {
    assert.ok(CONFIDE_TOOL_CALL_FIXTURES.length >= 12);
    for (const row of CONFIDE_TOOL_CALL_FIXTURES) {
      const parsed = parseConfideToolCallJson(
        JSON.stringify({ tool: row.expectedId, arguments: {} })
      );
      assert.equal(parsed.ok, true, row.id);
    }
  });
});
