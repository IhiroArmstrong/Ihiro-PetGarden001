/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { shouldAnswerWithPracticeFacts } from './confidePracticeFacts.js';
import {
  CONFIDE_GOLDEN_CHANNELS,
  CONFIDE_GOLDEN_SCRIPT_V1_ITEMS
} from './confideGoldenScriptV1.js';
import { confideClassify } from './confideClassify.js';
import { shouldRedirectConfideProductAskToHelpCenter } from './confideHelpCenterRedirect.js';
import { resolveConfideFactFirstSpeak } from './confideFactFirstSpeak.js';
import { probeProductKnowledgeCatalog } from './confideProductKnowledge.js';
import { resolveProductKnowledgeGateAction } from './confideProductKnowledgeSemantic.js';
import {
  hasConfideCatalogNounObject,
  listConfideCatalogNounKeywords
} from './confideProductObject.js';
import { tokenizeConfideObjectPhrase } from './confideObjectNormalize.js';

const LATIN_COMPOUND_RE = /^[a-z]{4,}$/;

/**
 * @param {string} keyword
 * @returns {string[]}
 */
function catalogKeywordSurfaceVariants(keyword) {
  /** @type {string[]} */
  const variants = [keyword];
  const tokens = tokenizeConfideObjectPhrase(keyword);
  if (tokens.length === 1 && LATIN_COMPOUND_RE.test(tokens[0])) {
    const compact = tokens[0];
    for (let i = 2; i <= compact.length - 2; i += 1) {
      variants.push(`${compact.slice(0, i)} ${compact.slice(i)}`);
      variants.push(`${compact.slice(0, i)}-${compact.slice(i)}`);
    }
    if (!/[su]$/.test(compact)) variants.push(`${compact}s`);
  } else if (tokens.every((tok) => /^[a-z]+$/.test(tok))) {
    const last = tokens[tokens.length - 1];
    if (LATIN_COMPOUND_RE.test(last) && !/[su]$/.test(last)) {
      variants.push(`${tokens.slice(0, -1).join(' ')} ${last}s`.trim());
    }
    if (tokens.length === 2) {
      variants.push(`${tokens[0]}-${tokens[1]}`);
    }
  }
  return [...new Set(variants)];
}

/**
 * @param {string} text
 * @returns {boolean}
 */
function wouldRedirectGoldenRow(text) {
  const route = confideClassify(text);
  const catalog = probeProductKnowledgeCatalog(text);
  const gateSkip = resolveProductKnowledgeGateAction({
    text,
    embeddingState: 'ready',
    semanticIsProduct: true,
    catalogHit: false
  });
  const facts = shouldAnswerWithPracticeFacts(route, text);
  return (
    facts === false &&
    shouldRedirectConfideProductAskToHelpCenter({
      text,
      gateAction: catalog.hit ? 'hit' : gateSkip,
      helpCenterAskReachable: true
    })
  );
}

describe('T29 catalog object normalize', () => {
  it('treats generated space, hyphen, and plural surfaces as catalog nouns', () => {
    const keywords = listConfideCatalogNounKeywords();
    assert.ok(keywords.includes('backup'));
    const failures = [];
    for (const keyword of keywords) {
      for (const variant of catalogKeywordSurfaceVariants(keyword)) {
        if (!hasConfideCatalogNounObject(variant)) {
          failures.push(`${keyword} ← ${variant}`);
        }
      }
    }
    assert.equal(failures.join('\n'), '');
  });

  it('does not turn unrelated chat into a catalog object', () => {
    assert.equal(hasConfideCatalogNounObject('xyzzy totally unrelated noodle'), false);
    assert.equal(hasConfideCatalogNounObject('his it'), false);
  });

  it('redirects the backup where-click line when Help Center is reachable', () => {
    const text = 'Where can I click to back up the data?';
    assert.equal(hasConfideCatalogNounObject(text), true);
    const catalog = probeProductKnowledgeCatalog(text);
    assert.equal(catalog.hit, true);
    const spoken = resolveConfideFactFirstSpeak({
      text,
      catalogResult: catalog,
      embeddingState: 'ready',
      semanticIsProduct: true,
      nearestId: catalog.id,
      nearestScore: 0.91,
      helpCenterAskReachable: true
    });
    assert.equal(spoken.action, 'help_center_redirect');
  });

  it('keeps English emotion chat and non-redirect gs-h01–h11 at zero redirects', () => {
    const emotionEn = CONFIDE_GOLDEN_SCRIPT_V1_ITEMS.filter(
      (row) =>
        row.lang === 'en' && row.channel === CONFIDE_GOLDEN_CHANNELS.EMOTION_OR_GENERATE
    );
    assert.equal(emotionEn.length, 38);
    const handIds = [
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
    ];
    const handRows = CONFIDE_GOLDEN_SCRIPT_V1_ITEMS.filter((row) => handIds.includes(row.id));
    assert.equal(handRows.length, 11);
    const mustStayZero = [
      ...emotionEn,
      ...handRows.filter((row) => row.channel !== CONFIDE_GOLDEN_CHANNELS.PRODUCT_REDIRECT)
    ];
    const leaks = [];
    for (const row of mustStayZero) {
      if (wouldRedirectGoldenRow(row.text)) leaks.push(row.id);
    }
    assert.deepEqual(leaks, []);
  });
});
