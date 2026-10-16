/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  CONFIDE_G2_FACT_ARRIVAL_BRIEF_VERSION,
  CONFIDE_G2_FACT_ARRIVAL_DIAGNOSTIC_ROLE,
  factArrivalActualFromSpoken,
  factArrivalMatchesExpected,
  parseG2FactArrivalFile,
  scoreG2FactArrivalRow,
  summarizeG2FactArrivalScores,
  validateG2FactArrivalCounts
} from './confideG2FactArrivalLab.js';

describe('confideG2FactArrivalLab', () => {
  it('parses diagnostic envelope without utterances in fixtures', () => {
    const parsed = parseG2FactArrivalFile({
      brief_version: CONFIDE_G2_FACT_ARRIVAL_BRIEF_VERSION,
      holdout_set_version: 'confide-g2-fact-arrival/diagnostic-unseen-v1',
      role: CONFIDE_G2_FACT_ARRIVAL_DIAGNOSTIC_ROLE,
      author_prompt_id: 'g2-fact-unseen-v1-test-fixture',
      items: [
        {
          id: 'meta-01',
          class_id: 'fixture-class',
          expected: { kind: 'honesty' },
          text: 'fixture-only-line-not-asserted-in-repo'
        }
      ]
    });
    assert.equal(parsed.items.length, 1);
    assert.equal(parsed.authorPromptId, 'g2-fact-unseen-v1-test-fixture');
  });

  it('scores product_card and no_product_card expectations', () => {
    const actualCard = factArrivalActualFromSpoken({
      action: 'product_knowledge',
      id: 'KB-FUNC-0038'
    });
    assert.equal(
      factArrivalMatchesExpected(
        { kind: 'product_card', card_id: 'KB-FUNC-0038' },
        actualCard
      ),
      true
    );
    assert.equal(
      factArrivalMatchesExpected({ kind: 'no_product_card' }, actualCard),
      false
    );
    const honesty = factArrivalActualFromSpoken({ action: 'honesty' });
    assert.equal(factArrivalMatchesExpected({ kind: 'no_product_card' }, honesty), true);
  });

  it('summarizes by class without echoing text', () => {
    const rows = [
      scoreG2FactArrivalRow({
        id: 'a',
        classId: 'c1',
        expected: { kind: 'honesty' },
        actual: { kind: 'honesty', cardId: null }
      }),
      scoreG2FactArrivalRow({
        id: 'b',
        classId: 'c1',
        expected: { kind: 'product_card', card_id: 'KB-FUNC-0038' },
        actual: { kind: 'companionship', cardId: null }
      })
    ];
    const summary = summarizeG2FactArrivalScores(rows);
    assert.equal(summary.n, 2);
    assert.equal(summary.pass, 1);
    assert.equal(summary.by_class.c1.pass, 1);
    assert.equal(summary.by_class.c1.n, 2);
  });

  it('validate counts classes', () => {
    const parsed = parseG2FactArrivalFile({
      brief_version: CONFIDE_G2_FACT_ARRIVAL_BRIEF_VERSION,
      holdout_set_version: 'confide-g2-fact-arrival/diagnostic-unseen-v1',
      role: CONFIDE_G2_FACT_ARRIVAL_DIAGNOSTIC_ROLE,
      author_prompt_id: 'g2-fact-unseen-v1-test-fixture',
      items: [
        {
          id: 'x1',
          class_id: 'alpha',
          expected: { kind: 'companionship' },
          text: 'x'
        }
      ]
    });
    const report = validateG2FactArrivalCounts(parsed);
    assert.equal(report.ok, true);
    assert.equal(report.classes.alpha, 1);
  });
});
