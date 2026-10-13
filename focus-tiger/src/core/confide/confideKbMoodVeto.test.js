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
import { readFileSync } from 'node:fs';
import {
  DEFAULT_CONFIDE_KB_MOOD_VETO_MARGIN,
  confideKbMoodVetoUtteranceLang,
  isConfideKbMoodVetoLive,
  isProductKnowledgeColdStartProbe,
  moodAsideOutranksProductLibrary,
  resolveProductKnowledgeGateAction
} from './confideProductKnowledgeSemantic.js';
import {
  KB_ROUTING_MATRIX_FIXTURES,
  KB_ROUTING_MATRIX_REGRESSION_IDS
} from './confideKbRoutingMatrix.js';
import { CONFIDE_MOOD_VETO_DEVSET_ZH_V1_ITEMS } from './confideMoodVetoDevsetZhV1.js';
import {
  KB_MOOD_VETO_LAB_CONTROL_EXCLUDED_MATRIX_IDS,
  KB_MOOD_VETO_LAB_CONTROL_ROWS,
  KB_MOOD_VETO_LAB_MIN_CONTROL_ROWS,
  KB_MOOD_VETO_LAB_MOOD_MIN_N,
  KB_MOOD_VETO_LAB_MOOD_ROWS,
  KB_MOOD_VETO_LAB_REVERSE_RISK_GROUP,
  KB_MOOD_VETO_LAB_REVERSE_RISK_MIN_N,
  KB_MOOD_VETO_LAB_REVERSE_RISK_PULLED_FROM_STAGE2B,
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

  it('never seeds from the zh v1 development set', () => {
    const dev = new Set(CONFIDE_MOOD_VETO_DEVSET_ZH_V1_ITEMS.map((r) => r.text));
    const leaked = CONFIDE_SEMANTIC_LIBRARY_MOOD_ASIDE.filter((line) => dev.has(line));
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
  it('a mood-shaped semantic product hit still goes to honesty when the switch is off', () => {
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

describe('live Chinese mood veto', () => {
  const liveProduct = {
    embeddingState: 'ready',
    semanticIsProduct: true,
    catalogHit: false,
    nearAction: null,
    lifeOutranksProduct: false,
    moodOutranksProduct: true,
    moodVetoLive: true
  };

  it('keeps the switch off unless unpackaged Electron explicitly asks for live', () => {
    assert.equal(isConfideKbMoodVetoLive({}), false);
    assert.equal(isConfideKbMoodVetoLive({ FT_CONFIDE_KB_MOOD_VETO: 'live' }), false);
    assert.equal(
      isConfideKbMoodVetoLive(
        { FT_CONFIDE_KB_MOOD_VETO: 'live' },
        { electronUnpackaged: true }
      ),
      true
    );
    assert.equal(
      isConfideKbMoodVetoLive(
        { FT_CONFIDE_KB_MOOD_VETO: 'shadow' },
        { electronUnpackaged: true }
      ),
      false
    );
    assert.equal(
      isConfideKbMoodVetoLive({ FT_CONFIDE_KB_MOOD_VETO: 'off' }, { electronUnpackaged: true }),
      false
    );
  });

  it('sends the Chinese acceptance lines to the observe wing only while live', () => {
    for (const text of ['我讨厌练习', '今天感觉不爽']) {
      assert.equal(confideKbMoodVetoUtteranceLang(text), 'zh');
      assert.equal(
        resolveProductKnowledgeGateAction({ ...liveProduct, text, moodVetoLive: false }),
        'honesty'
      );
      assert.equal(resolveProductKnowledgeGateAction({ ...liveProduct, text }), 'skip');
    }
    for (const text of ['想起以前', '想喝酒', '练太久']) {
      assert.equal(
        resolveProductKnowledgeGateAction({ ...liveProduct, text, moodVetoLive: false }),
        'skip'
      );
      assert.equal(resolveProductKnowledgeGateAction({ ...liveProduct, text }), 'skip');
    }
  });

  it('keeps 观察翼是什么 on the honesty empty state when mood does not outrank', () => {
    assert.equal(
      resolveProductKnowledgeGateAction({
        ...liveProduct,
        text: '观察翼是什么',
        moodOutranksProduct: false
      }),
      'honesty'
    );
    assert.equal(
      resolveProductKnowledgeGateAction({
        text: '观察翼是什么',
        embeddingState: 'not_ready',
        semanticIsProduct: false,
        catalogHit: false,
        moodOutranksProduct: true,
        moodVetoLive: true
      }),
      'honesty'
    );
  });

  it('does not live-route English or Japanese, and does not special-case the sitting line', () => {
    assert.equal(
      resolveProductKnowledgeGateAction({
        ...liveProduct,
        text: "I'm just sitting here for a bit"
      }),
      'honesty'
    );
    assert.equal(
      resolveProductKnowledgeGateAction({
        ...liveProduct,
        text: "I'm just sitting here for a bit",
        catalogHit: true
      }),
      'hit'
    );
    assert.equal(
      resolveProductKnowledgeGateAction({
        ...liveProduct,
        text: '練習したくない、お酒が飲みたい'
      }),
      'honesty'
    );
  });

  it('accepts the Chinese mixed-sentence false veto and still answers a catalog hit', () => {
    assert.equal(
      resolveProductKnowledgeGateAction({ ...liveProduct, text: '太累了，怎么关提醒？' }),
      'skip'
    );
    assert.equal(
      resolveProductKnowledgeGateAction({
        ...liveProduct,
        text: '太累了，怎么关提醒？',
        catalogHit: true
      }),
      'hit'
    );
    assert.equal(
      resolveProductKnowledgeGateAction({
        ...liveProduct,
        text: '我讨厌练习',
        nearAction: 'honesty',
        semanticIsProduct: false
      }),
      'skip'
    );
  });

  it('wires the switch through the product-gate send chain', () => {
    const ui = readFileSync(new URL('../../ui/ConfideToYinUI.js', import.meta.url), 'utf8');
    const runtime = readFileSync(
      new URL('../../../desktop/companion/l1Runtime.js', import.meta.url),
      'utf8'
    );
    const hold = readFileSync(
      new URL('../../../desktop/companion/l1EmbeddingHold.js', import.meta.url),
      'utf8'
    );
    assert.match(ui, /moodVetoLive: gate\?\.moodVetoLive === true/);
    assert.match(runtime, /isConfideKbMoodVetoLive\(this\.env/);
    assert.match(hold, /moodOutranksProduct: mood\.moodOutranksProduct/);
    assert.doesNotMatch(ui, /stage2bLivePromote[\s\S]{0,80}moodVetoLive/);
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
      withVetoAskGuard: 'skip',
      withVetoNarrowAskGuard: 'skip',
      moodOutranksProduct: true,
      functionAsk: false,
      libraryCPointsAtProduct: true
    });
    assert.equal(simulateKbMoodVetoGate({ ...base, moodScore: 0.4 }).withVeto, 'honesty');
  });

  it('never overturns a catalog hit', () => {
    const sim = simulateKbMoodVetoGate({ ...base, text: '备份在哪', catalogHit: true });
    assert.equal(sim.baseline, 'hit');
    assert.equal(sim.withVeto, 'hit');
  });

  it('rule 1 keeps a function-ask shape on the product answer', () => {
    const mixed = simulateKbMoodVetoGate({ ...base, text: '太累了，怎么关提醒？' });
    assert.equal(mixed.functionAsk, true);
    assert.equal(mixed.withVeto, 'skip');
    assert.equal(mixed.withVetoAskGuard, 'honesty');
    const plain = simulateKbMoodVetoGate(base);
    assert.equal(plain.functionAsk, false);
    assert.equal(plain.withVetoAskGuard, 'skip');
  });

  it('narrow rule 1 releases the veto only when the ask also points at Library C', () => {
    const mixed = simulateKbMoodVetoGate({ ...base, text: '太累了，怎么关提醒？' });
    assert.equal(mixed.libraryCPointsAtProduct, true);
    assert.equal(mixed.withVetoNarrowAskGuard, 'honesty');

    const exclamation = simulateKbMoodVetoGate({
      ...base,
      text: '怎么又这样……',
      semanticIsProduct: false,
      productScore: 0.2,
      nearAction: 'honesty'
    });
    assert.equal(exclamation.baseline, 'honesty');
    assert.equal(exclamation.functionAsk, true);
    assert.equal(exclamation.libraryCPointsAtProduct, false);
    assert.equal(exclamation.withVeto, 'skip');
    assert.equal(exclamation.withVetoAskGuard, 'honesty');
    assert.equal(exclamation.withVetoNarrowAskGuard, 'skip');
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

  it('English mood lines reach 40 without the reverse-risk group', () => {
    const en = KB_MOOD_VETO_LAB_MOOD_ROWS.filter(
      (r) => r.lang === 'en' && r.group !== KB_MOOD_VETO_LAB_REVERSE_RISK_GROUP
    );
    assert.ok(en.length >= KB_MOOD_VETO_LAB_MOOD_MIN_N.en, String(en.length));
  });

  it('reverse-risk lines sit in the mood set and all look like function asks', () => {
    const rows = KB_MOOD_VETO_LAB_MOOD_ROWS.filter(
      (r) => r.group === KB_MOOD_VETO_LAB_REVERSE_RISK_GROUP
    );
    assert.ok(rows.length >= KB_MOOD_VETO_LAB_REVERSE_RISK_MIN_N, String(rows.length));
    assert.ok(rows.some((r) => r.text === '练着练着就想问怎么放弃'));
    assert.ok(rows.some((r) => r.text === '怎么又这样……'));
    assert.ok(rows.some((r) => r.text === '怎么才能不难过'));
    for (const lang of ['zh', 'en', 'ja']) {
      assert.ok(rows.some((r) => r.lang === lang), lang);
    }
    assert.deepEqual(
      rows.filter((r) => !isProductKnowledgeColdStartProbe(r.text)).map((r) => r.text),
      []
    );
    const stage2b = KB_MOOD_VETO_LAB_MOOD_ROWS.filter((r) => r.group === 'stage2b_negative_control');
    for (const text of KB_MOOD_VETO_LAB_REVERSE_RISK_PULLED_FROM_STAGE2B) {
      assert.equal(stage2b.some((r) => r.text === text), false, text);
    }
  });

  it('drops the practice-fact line whose real path the routing matrix locks', () => {
    assert.ok(!KB_MOOD_VETO_LAB_CONTROL_ROWS.some((r) => r.text === '累积了 多久'));
    for (const id of KB_MOOD_VETO_LAB_CONTROL_EXCLUDED_MATRIX_IDS) {
      const row = KB_ROUTING_MATRIX_FIXTURES.find((r) => r.id === id);
      assert.equal(row?.lock, 'must-hit', id);
      assert.equal(row?.expect.dataSource, 'practice_facts', id);
      assert.ok(KB_ROUTING_MATRIX_REGRESSION_IDS.includes(id), id);
    }
  });
});

describe('summarizeKbMoodVetoLab', () => {
  const moodRows = [
    ...['zh', 'ja'].map((lang) => ({ lang, text: lang })),
    ...Array.from({ length: 40 }, (_, i) => ({ lang: 'en', text: `en${i}` }))
  ].map((r) => ({ ...r, set: 'mood', group: 'g', baseline: 'honesty', withVeto: 'skip' }));
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

  it('English under 40 lines fails even at 100%', () => {
    const s = summarizeKbMoodVetoLab([...moodRows.slice(0, -1), ...controlRows]);
    assert.equal(s.mood.en.n, 39);
    assert.equal(s.mood.en.rate, 1);
    assert.equal(s.mood.en.passed, false);
    assert.equal(s.gatePassed, false);
  });

  it('reverse-risk rows are counted apart and report misses', () => {
    const risk = [
      { set: 'mood', group: KB_MOOD_VETO_LAB_REVERSE_RISK_GROUP, lang: 'zh', text: 'r0', baseline: 'honesty', withVeto: 'honesty' },
      { set: 'mood', group: KB_MOOD_VETO_LAB_REVERSE_RISK_GROUP, lang: 'zh', text: 'r1', baseline: 'honesty', withVeto: 'skip' }
    ];
    const s = summarizeKbMoodVetoLab([...moodRows, ...risk, ...controlRows]);
    assert.equal(s.mood.zh.n, 1);
    assert.equal(s.mood.zh.passed, true);
    assert.deepEqual(s.reverseRisk, { n: 2, vetoSkip: 1, missed: ['r0'] });
  });

  it('one false veto in the control group fails the gate', () => {
    const rows = [...moodRows, ...controlRows];
    const i = moodRows.length;
    rows[i] = { ...rows[i], withVeto: 'skip' };
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
