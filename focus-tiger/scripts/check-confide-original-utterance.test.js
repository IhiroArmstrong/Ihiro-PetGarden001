/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  scanConfideOriginalUtteranceSource,
  runConfideOriginalUtteranceCheck
} from './check-confide-original-utterance.js';

describe('scanConfideOriginalUtteranceSource', () => {
  it('fails a turns.jsonl dump', () => {
    const hits = scanConfideOriginalUtteranceSource(
      'companion-l2/turns.jsonl',
      'turns.jsonl',
      '{"kind":"kb_retrieval_miss"}\n'
    );
    assert.ok(hits.some((h) => h.includes('turns.jsonl')));
  });

  it('fails queryHash plus text on one line', () => {
    const hits = scanConfideOriginalUtteranceSource(
      'dump.jsonl',
      'dump.jsonl',
      '{"queryHash":"abc123def","text":"最近老是想起以前"}'
    );
    assert.ok(hits.some((h) => h.includes('queryHash')));
  });

  it('fails a sealed blind file that still lists sentences', () => {
    const hits = scanConfideOriginalUtteranceSource(
      '.secrets/confide-blind-holdout/set.json',
      'set.json',
      '{"utterances":["I keep thinking about the past lately"]}'
    );
    assert.ok(hits.some((h) => h.includes('blind holdout')));
  });

  it('allows hash-only telemetry', () => {
    const hits = scanConfideOriginalUtteranceSource(
      'docs/example.md',
      'example.md',
      '{"queryHash":"abc123def","textLength":12}'
    );
    assert.deepEqual(hits, []);
  });
});

describe('runConfideOriginalUtteranceCheck', () => {
  it('passes the current tree', () => {
    const result = runConfideOriginalUtteranceCheck();
    assert.equal(result.ok, true, result.hits.join('\n'));
  });
});
