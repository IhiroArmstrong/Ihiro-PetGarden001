/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIDE_ROUTE } from './confideRoutes.js';
import { CONFIDE_SEMANTIC_BUCKET } from './confideSemanticBuckets.js';
import {
  CONFIDE_SEMANTIC_LIBRARY_A,
  CONFIDE_SEMANTIC_LIBRARY_B,
  CONFIDE_SEMANTIC_LIBRARY_C,
  CONFIDE_SEMANTIC_LIBRARY_MOOD_ASIDE
} from './confideSemanticExamples.js';
import {
  DEFAULT_CONFIDE_KB_MOOD_VETO_MARGIN,
  moodAsideOutranksProductLibrary,
  resolveProductKnowledgeGateAction
} from './confideProductKnowledgeSemantic.js';
import {
  KB_MOOD_VETO_LAB_CONTROL_ROWS,
  KB_MOOD_VETO_LAB_MIN_CONTROL_ROWS,
  KB_MOOD_VETO_LAB_MOOD_ROWS,
  kbMoodVetoLabLanguage
} from './confideKbMoodVetoLabSet.js';
import { simulateKbMoodVetoGate, summarizeKbMoodVetoLab } from './confideKbMoodVetoLabScore.js';
import { hashConfidePrivateText } from './confidePrivacy.js';
import { CONFIDE_TURNS_SHADOW_AUDIT_KINDS } from './confideTurnsJsonlRetention.js';
import {
  KB_PRODUCT_GATE_SHADOW_KIND,
  buildKbProductGateShadowTurnLogRecord,
  hashKbGateShadowText
} from '../../../desktop/companion/l1KbProductGateShadowLog.js';
import { buildSemanticShadowTurnLogRecord } from '../../../desktop/companion/l1SemanticShadowLog.js';

describe('CONFIDE_SEMANTIC_LIBRARY_MOOD_ASIDE', () => {
  it('has at least 15 lines per language', () => {
    for (const lang of ['zh', 'en', 'ja']) {
      const n = CONFIDE_SEMANTIC_LIBRARY_MOOD_ASIDE.filter(
        (line) => kbMoodVetoLabLanguage(line) === lang
      ).length;
      assert.ok(n >= 15, `${lang} has ${n}`);
    }
  });

  it('never seeds from the lab validation set', () => {
    const lab = new Set(
      [...KB_MOOD_VETO_LAB_MOOD_ROWS, ...KB_MOOD_VETO_LAB_CONTROL_ROWS].map((r) => r.text)
    );
    const leaked = CONFIDE_SEMANTIC_LIBRARY_MOOD_ASIDE.filter((line) => lab.has(line));
    assert.deepEqual(leaked, []);
  });

  it('is a separate library from A / B / C', () => {
    assert.notEqual(CONFIDE_SEMANTIC_LIBRARY_MOOD_ASIDE, CONFIDE_SEMANTIC_LIBRARY_B);
    const ja = (line) => kbMoodVetoLabLanguage(line) === 'ja';
    for (const lib of [CONFIDE_SEMANTIC_LIBRARY_A, CONFIDE_SEMANTIC_LIBRARY_B, CONFIDE_SEMANTIC_LIBRARY_C]) {
      assert.equal(lib.some(ja), false);
    }
  });
});

describe('moodAsideOutranksProductLibrary', () => {
  it('needs mood strictly above product plus margin', () => {
    assert.equal(DEFAULT_CONFIDE_KB_MOOD_VETO_MARGIN, 0);
    assert.equal(moodAsideOutranksProductLibrary(0.5, 0.51), true);
    assert.equal(moodAsideOutranksProductLibrary(0.5, 0.5), false);
    assert.equal(moodAsideOutranksProductLibrary(0.5, 0.51, 0.02), false);
    assert.equal(moodAsideOutranksProductLibrary(0.5, Number.NaN), false);
    assert.equal(moodAsideOutranksProductLibrary(undefined, 0.9), false);
  });
});

describe('stage one leaves the live gate action alone', () => {
  it('a mood-shaped semantic product hit still goes to honesty today', () => {
    // Stage two (separate PO nod) would turn this into skip.
    assert.equal(
      resolveProductKnowledgeGateAction({
        text: 'I want a cigarette',
        embeddingState: 'ready',
        semanticIsProduct: true,
        catalogHit: false,
        nearAction: null,
        lifeOutranksProduct: false,
        moodOutranksProduct: true
      }),
      'honesty'
    );
  });
});

describe('simulateKbMoodVetoGate', () => {
  const base = {
    text: 'I want a cigarette',
    catalogHit: false,
    nearAction: null,
    semanticIsProduct: true,
    lifeOutranksProduct: false,
    productScore: 0.5,
    moodScore: 0.6
  };

  it('turns honesty into skip only when mood outranks product', () => {
    assert.deepEqual(simulateKbMoodVetoGate(base), {
      baseline: 'honesty',
      withVeto: 'skip',
      moodOutranksProduct: true
    });
    assert.equal(simulateKbMoodVetoGate({ ...base, moodScore: 0.4 }).withVeto, 'honesty');
  });

  it('never overturns a catalog hit', () => {
    const sim = simulateKbMoodVetoGate({ ...base, text: '备份在哪', catalogHit: true });
    assert.equal(sim.baseline, 'hit');
    assert.equal(sim.withVeto, 'hit');
  });
});

describe('KB mood veto lab set', () => {
  it('control group has at least 40 lines and includes the three mixed asks', () => {
    assert.ok(KB_MOOD_VETO_LAB_CONTROL_ROWS.length >= KB_MOOD_VETO_LAB_MIN_CONTROL_ROWS);
    const mixed = KB_MOOD_VETO_LAB_CONTROL_ROWS.filter((r) => r.group === 'mixed');
    assert.deepEqual(
      mixed.map((r) => r.text),
      ['太累了，怎么关提醒？', "I'm exhausted, how do I turn off reminders?", '疲れた、リマインダーはどう消す？']
    );
  });

  it('mood and control sets do not overlap', () => {
    const mood = new Set(KB_MOOD_VETO_LAB_MOOD_ROWS.map((r) => r.text));
    assert.deepEqual(
      KB_MOOD_VETO_LAB_CONTROL_ROWS.filter((r) => mood.has(r.text)).map((r) => r.text),
      []
    );
  });

  it('has mood lines in all three languages', () => {
    for (const lang of ['zh', 'en', 'ja']) {
      assert.ok(KB_MOOD_VETO_LAB_MOOD_ROWS.some((r) => r.lang === lang), lang);
    }
  });
});

describe('summarizeKbMoodVetoLab', () => {
  const moodRows = ['zh', 'en', 'ja'].map((lang) => ({
    set: 'mood',
    group: 'g',
    lang,
    text: lang,
    baseline: 'honesty',
    withVeto: 'skip'
  }));
  const controlRows = Array.from({ length: 40 }, (_, i) => ({
    set: 'control',
    group: i === 0 ? 'mixed' : 'library_c',
    lang: 'en',
    text: `c${i}`,
    baseline: 'honesty',
    withVeto: 'honesty'
  }));

  it('passes but stays provisional until Japanese is native-reviewed', () => {
    const s = summarizeKbMoodVetoLab([...moodRows, ...controlRows]);
    assert.equal(s.gatePassed, true);
    assert.equal(s.jaProvisional, true);
    assert.equal(s.gateFinal, false);
    assert.equal(summarizeKbMoodVetoLab([...moodRows, ...controlRows], { jaNativeReviewed: true }).gateFinal, true);
  });

  it('one false veto in the control group fails the gate', () => {
    const rows = [...moodRows, ...controlRows];
    rows[3] = { ...rows[3], withVeto: 'skip' };
    const s = summarizeKbMoodVetoLab(rows);
    assert.deepEqual(s.control.falseVetoes, ['c0']);
    assert.deepEqual(s.control.mixedNotProduct, ['c0']);
    assert.equal(s.gatePassed, false);
  });

  it('fewer than 40 control lines fails the gate', () => {
    const s = summarizeKbMoodVetoLab([...moodRows, ...controlRows.slice(1)]);
    assert.equal(s.control.passed, false);
  });
});

describe('kb_product_gate_shadow turns.jsonl row', () => {
  const text = '我想抽烟';
  const row = buildKbProductGateShadowTurnLogRecord({
    text,
    result: {
      isProduct: true,
      score: 0.5,
      minScore: 0.42,
      lifeScore: 0.3,
      lifeOutranksProduct: false,
      moodScore: 0.6,
      moodOutranksProduct: true,
      nearestId: 'KB-FUNC-0001',
      nearestScore: 0.4,
      embedMs: 12
    },
    timing: { wallMs: 20 }
  });

  it('carries mood fields and no user text', () => {
    assert.equal(row.kind, KB_PRODUCT_GATE_SHADOW_KIND);
    assert.equal(row.kbMoodScore, 0.6);
    assert.equal(row.kbMoodOutranks, true);
    assert.equal(row.textLength, text.length);
    assert.equal(Object.prototype.hasOwnProperty.call(row, 'text'), false);
    assert.equal(JSON.stringify(row).includes('抽烟'), false);
  });

  it('hash matches the src privacy hash and the kind uses shadow retention', () => {
    assert.equal(row.queryHash, hashConfidePrivateText(text));
    assert.equal(hashKbGateShadowText('Backup failed'), hashConfidePrivateText('Backup failed'));
    assert.equal(CONFIDE_TURNS_SHADOW_AUDIT_KINDS.includes(KB_PRODUCT_GATE_SHADOW_KIND), true);
  });

  it('mood fields are null when the child sent no mood score', () => {
    const bare = buildKbProductGateShadowTurnLogRecord({ text, result: { isProduct: false, score: 0.2 } });
    assert.equal(bare.kbMoodScore, null);
    assert.equal(bare.kbMoodOutranks, null);
  });
});

describe('semantic_shadow_classify rows log the 2b mood veto (shadow only)', () => {
  const promote = {
    text: '想做一下呼吸练习',
    route: CONFIDE_ROUTE.FALLBACK,
    source: 'generate',
    literalCoarse: CONFIDE_SEMANTIC_BUCKET.GRAY,
    semanticResult: {
      bucket: CONFIDE_SEMANTIC_BUCKET.FUNCTIONAL,
      scoreA: 0.7,
      scoreB: 0.4,
      grayMargin: 0.08
    },
    ok: true,
    reason: 'ok'
  };
  const outranks = { productScore: 0.5, moodScore: 0.6, moodOutranksProduct: true };

  it('marks a would-promote the veto would stop, without changing would-promote', () => {
    const row = buildSemanticShadowTurnLogRecord({ ...promote, kbMood: outranks });
    assert.equal(row.stage2bWouldPromote, true);
    assert.equal(row.stage2bMoodVeto, true);
    assert.equal(row.kbMoodScore, 0.6);
    assert.equal(row.kbProductScore, 0.5);
  });

  it('is false when mood does not outrank, and when 2b would not promote', () => {
    assert.equal(
      buildSemanticShadowTurnLogRecord({
        ...promote,
        kbMood: { ...outranks, moodOutranksProduct: false }
      }).stage2bMoodVeto,
      false
    );
    const noPromote = buildSemanticShadowTurnLogRecord({
      ...promote,
      literalCoarse: CONFIDE_SEMANTIC_BUCKET.EMOTIONAL,
      kbMood: outranks
    });
    assert.equal(noPromote.stage2bWouldPromote, false);
    assert.equal(noPromote.stage2bMoodVeto, false);
  });

  it('is null when no mood score reached the row', () => {
    const row = buildSemanticShadowTurnLogRecord(promote);
    assert.equal(row.stage2bMoodVeto, null);
    assert.equal(row.kbMoodScore, null);
  });
});
