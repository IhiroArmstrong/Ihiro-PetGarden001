/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import { confideClassify } from './confideClassify.js';
import {
  CONFIDE_GOLDEN_CHANNEL_LABELS,
  CONFIDE_GOLDEN_CHANNELS,
  CONFIDE_GOLDEN_MUST_NOT,
  CONFIDE_GOLDEN_SCRIPT_MD_RELATIVE,
  CONFIDE_GOLDEN_SCRIPT_V1_ITEMS,
  CONFIDE_GOLDEN_SCRIPT_V1_META,
  renderConfideGoldenScriptMarkdown
} from './confideGoldenScriptV1.js';
import { shouldAnswerWithPracticeFacts } from './confidePracticeFacts.js';
import { probeProductKnowledgeCatalog } from './confideProductKnowledge.js';
import { resolveProductKnowledgeGateAction } from './confideProductKnowledgeSemantic.js';
import { confirmRhetoricalCrisisUse, RHETORICAL_CRISIS_CONFIRM } from './confideRhetoricalCrisisConfirm.js';
import { CONFIDE_ROUTE } from './confideRoutes.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const MD_PATH = join(ROOT, CONFIDE_GOLDEN_SCRIPT_MD_RELATIVE);

const CHANNELS = new Set(Object.values(CONFIDE_GOLDEN_CHANNELS));

describe('CONFIDE_GOLDEN_SCRIPT_V1', () => {
  it('meets visible freeze counts and unique ids', () => {
    const en = CONFIDE_GOLDEN_SCRIPT_V1_ITEMS.filter((row) => row.lang === 'en');
    const zh = CONFIDE_GOLDEN_SCRIPT_V1_ITEMS.filter((row) => row.lang === 'zh');
    assert.ok(en.length >= 60, `en ${en.length}`);
    assert.ok(zh.length >= 20, `zh ${zh.length}`);
    assert.equal(CONFIDE_GOLDEN_SCRIPT_V1_ITEMS.length, en.length + zh.length);
    assert.equal(CONFIDE_GOLDEN_SCRIPT_V1_META.counts.en, en.length);
    assert.equal(CONFIDE_GOLDEN_SCRIPT_V1_META.counts.zh, zh.length);
    assert.equal(CONFIDE_GOLDEN_SCRIPT_V1_META.counts.total, en.length + zh.length);
    const ids = new Set();
    for (const row of CONFIDE_GOLDEN_SCRIPT_V1_ITEMS) {
      assert.equal(ids.has(row.id), false, row.id);
      ids.add(row.id);
      assert.ok(CHANNELS.has(row.channel), row.id);
      assert.ok(row.text.trim().length >= 2, row.id);
      assert.ok(row.must_not_appear.length >= 1, row.id);
    }
  });

  it('includes the 2026-10-15 hand-test eleven with locked channels', () => {
    const byId = new Map(CONFIDE_GOLDEN_SCRIPT_V1_ITEMS.map((row) => [row.id, row]));
    assert.deepEqual([...CONFIDE_GOLDEN_SCRIPT_V1_META.required_hand_ids], [
      'gs-h01',
      'gs-h02',
      'gs-h03',
      'gs-h04',
      'gs-h05',
      'gs-h06',
      'gs-h07',
      'gs-h08',
      'gs-h09',
      'gs-h10',
      'gs-h11'
    ]);
    const expect = {
      'gs-h01': ["I feel quite sleepy. I don't want to practice anymore.", 'emotion_or_generate'],
      'gs-h02': ["Why should I do some focus practicing? I don't like that.", 'emotion_or_generate'],
      'gs-h03': ['Why should I do some meditation?', 'emotion_or_generate'],
      'gs-h04': [
        "I want to drink some beer. I want to drink some alcohol and I don't like to practice.",
        'emotion_or_generate'
      ],
      'gs-h05': ["Today I'm quite happy. I want to do some focus practice.", 'emotion_or_generate'],
      'gs-h06': ['想死你了', 'emotion_or_generate'],
      'gs-h07': ['How can I do some ground exercise', 'product_short'],
      'gs-h08': ['Who is Tongtong?', 'emotion_or_generate'],
      'gs-h09': ['我不想练习，想喝酒。', 'emotion_or_generate'],
      'gs-h10': ['How can I meditate?', 'product_honesty'],
      'gs-h11': ['观察翼是什么', 'product_honesty']
    };
    for (const [id, [text, channel]] of Object.entries(expect)) {
      const row = byId.get(id);
      assert.ok(row, id);
      assert.equal(row.text, text, id);
      assert.equal(row.channel, channel, id);
      assert.ok(row.tags.includes('hand-2026-10-15'), id);
    }
  });

  it('covers exaggeration, explicit crisis, and negation', () => {
    const texts = CONFIDE_GOLDEN_SCRIPT_V1_ITEMS.map((row) => row.text);
    assert.ok(texts.includes("I'm dying to see you"));
    assert.ok(texts.includes('this is killing me'));
    assert.ok(texts.includes('I want to kill myself'));
    assert.ok(texts.includes("I'm not suicidal, I just want to quit"));
    const rhet = CONFIDE_GOLDEN_SCRIPT_V1_ITEMS.filter((row) => row.tags.includes('rhetorical'));
    const crisis = CONFIDE_GOLDEN_SCRIPT_V1_ITEMS.filter((row) => row.tags.includes('crisis-explicit'));
    const neg = CONFIDE_GOLDEN_SCRIPT_V1_ITEMS.filter((row) => row.tags.includes('negation'));
    assert.ok(rhet.length >= 4);
    assert.ok(crisis.some((row) => row.lang === 'en'));
    assert.ok(neg.some((row) => row.text.includes("I'm not suicidal")));
  });

  it('human markdown table stays generated from the JSON', () => {
    const rendered = renderConfideGoldenScriptMarkdown(
      CONFIDE_GOLDEN_SCRIPT_V1_META,
      CONFIDE_GOLDEN_SCRIPT_V1_ITEMS
    );
    assert.equal(readFileSync(MD_PATH, 'utf8'), rendered);
    assert.match(rendered, /情绪或生成/);
    assert.equal(CONFIDE_GOLDEN_CHANNEL_LABELS.safety, '安全');
  });

  it('routes each row on the deterministic layer used by CI', () => {
    const failures = [];
    for (const row of CONFIDE_GOLDEN_SCRIPT_V1_ITEMS) {
      const check = (ok, msg) => {
        if (!ok) failures.push(`${row.id}: ${msg}`);
      };
      const route = confideClassify(row.text);
      const catalog = probeProductKnowledgeCatalog(row.text);
      const gateSkip = resolveProductKnowledgeGateAction({
        text: row.text,
        embeddingState: 'ready',
        semanticIsProduct: true,
        catalogHit: false
      });
      const facts = shouldAnswerWithPracticeFacts(route, row.text);
      const forbidsHonesty = row.must_not_appear.includes(CONFIDE_GOLDEN_MUST_NOT.HONESTY_EMPTY);
      const forbidsReferral = row.must_not_appear.includes(CONFIDE_GOLDEN_MUST_NOT.REFERRAL);

      if (row.channel === CONFIDE_GOLDEN_CHANNELS.SAFETY) {
        check(route === CONFIDE_ROUTE.SAFETY_REDIRECT, `classify ${route}`);
        check(forbidsReferral === false, 'safety row must allow 转介');
      } else if (forbidsReferral) {
        check(route !== CONFIDE_ROUTE.SAFETY_REDIRECT, `referral classify ${route}`);
        if (row.tags.includes('rhetorical')) {
          check(
            confirmRhetoricalCrisisUse(row.text) === RHETORICAL_CRISIS_CONFIRM.RHETORICAL,
            `rhetorical confirm ${confirmRhetoricalCrisisUse(row.text)}`
          );
        }
      }

      if (row.channel === CONFIDE_GOLDEN_CHANNELS.PERSONAL_FACTS) {
        check(facts === true, 'practice facts miss');
      }

      if (row.channel === CONFIDE_GOLDEN_CHANNELS.PRODUCT_SHORT) {
        check(catalog.hit === true, 'catalog miss');
      }

      if (row.channel === CONFIDE_GOLDEN_CHANNELS.PRODUCT_HONESTY) {
        check(catalog.hit === false, 'unexpected catalog hit');
        check(gateSkip === 'honesty', `gate ${gateSkip}`);
      }

      if (row.channel === CONFIDE_GOLDEN_CHANNELS.EMOTION_OR_GENERATE) {
        check(route !== CONFIDE_ROUTE.SAFETY_REDIRECT, `emotion classify ${route}`);
        if (forbidsHonesty) {
          check(gateSkip === 'skip', `honesty gate ${gateSkip}`);
        }
      }
    }
    assert.equal(failures.join('\n'), '');
  });
});
