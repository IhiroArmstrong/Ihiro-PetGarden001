/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CONFIDE_SEMANTIC_BUCKET } from './confideSemanticBuckets.js';
import { classifyConfideSemanticCoarse } from './confideSemanticRouting.js';
import { buildConfideSemanticShadowLogRecord } from './confideSemanticCoarseMap.js';
import {
  buildConfideShadowContextualText,
  canReuseConfideSemanticLiveCache,
  priorConfideTurnForLiveClassify,
  priorConfideTurnForShadow
} from './confideSemanticShadowPriorTurn.js';

function unitVector(dim, index) {
  const vec = new Array(dim).fill(0);
  vec[index] = 1;
  return vec;
}

const EMOTIONAL_PRIOR = '今天什么都不想做，心里很闷';
const SHORT_TIRED = '好累';
const FUNCTIONAL_PRIOR = '累积了多久';

describe('confideSemanticShadowPriorTurn', () => {
  it('returns null on the first Confide turn', () => {
    assert.equal(
      priorConfideTurnForShadow([
        { role: 'user', text: SHORT_TIRED },
        { role: 'yin', text: 'Heard.', source: 'generate' }
      ]),
      null
    );
  });

  it('live classify reads the last complete pair before the current turn is pushed', () => {
    const shown = [
      { role: 'user', text: EMOTIONAL_PRIOR },
      { role: 'yin', text: 'Sitting with that.', source: 'generate' }
    ];
    assert.equal(priorConfideTurnForShadow(shown), null);
    assert.deepEqual(priorConfideTurnForLiveClassify(shown), {
      userText: EMOTIONAL_PRIOR,
      yinText: 'Sitting with that.'
    });
    assert.equal(
      buildConfideShadowContextualText(SHORT_TIRED, priorConfideTurnForLiveClassify(shown)),
      buildConfideShadowContextualText(
        SHORT_TIRED,
        priorConfideTurnForShadow([
          ...shown,
          { role: 'user', text: SHORT_TIRED },
          { role: 'yin', text: 'Mm.', source: 'generate' }
        ])
      )
    );
  });

  it('does not reuse live cache when shadow has prior context the live embed skipped', () => {
    const contextualText = buildConfideShadowContextualText(SHORT_TIRED, {
      userText: EMOTIONAL_PRIOR,
      yinText: 'Sitting with that.'
    });
    const liveOnlyCurrent = {
      ok: true,
      text: SHORT_TIRED,
      contextualText,
      bucket: CONFIDE_SEMANTIC_BUCKET.EMOTIONAL,
      scoreA: 0.64,
      scoreB: 0.82,
      grayMargin: 0.08,
      semanticResultWithPrior: null
    };
    assert.equal(
      canReuseConfideSemanticLiveCache(liveOnlyCurrent, {
        text: SHORT_TIRED,
        contextualText,
        hadPriorTurn: true
      }),
      false
    );
    assert.equal(
      canReuseConfideSemanticLiveCache(
        { ...liveOnlyCurrent, contextualText: '' },
        { text: SHORT_TIRED, contextualText, hadPriorTurn: true }
      ),
      false
    );
    assert.equal(
      canReuseConfideSemanticLiveCache(liveOnlyCurrent, {
        text: SHORT_TIRED,
        contextualText: '',
        hadPriorTurn: false
      }),
      false
    );
    assert.equal(
      canReuseConfideSemanticLiveCache(
        {
          ...liveOnlyCurrent,
          contextualText: '',
          semanticResultWithPrior: null
        },
        { text: SHORT_TIRED, contextualText: '', hadPriorTurn: false }
      ),
      true
    );
    assert.equal(
      canReuseConfideSemanticLiveCache(
        {
          ...liveOnlyCurrent,
          semanticResultWithPrior: {
            bucket: CONFIDE_SEMANTIC_BUCKET.EMOTIONAL,
            scoreA: 0.4,
            scoreB: 0.7,
            grayMargin: 0.08
          }
        },
        { text: SHORT_TIRED, contextualText, hadPriorTurn: true }
      ),
      true
    );
  });

  it('reads the previous user+yin pair after the current turn was pushed', () => {
    const prior = priorConfideTurnForShadow([
      { role: 'user', text: EMOTIONAL_PRIOR },
      { role: 'yin', text: 'Sitting with that.', source: 'generate' },
      { role: 'user', text: SHORT_TIRED },
      { role: 'yin', text: 'Mm.', source: 'generate' }
    ]);
    assert.deepEqual(prior, {
      userText: EMOTIONAL_PRIOR,
      yinText: 'Sitting with that.'
    });
  });

  it('builds contextual embedding text with prior user+yin then current', () => {
    const text = buildConfideShadowContextualText(SHORT_TIRED, {
      userText: EMOTIONAL_PRIOR,
      yinText: 'Sitting with that.'
    });
    assert.equal(
      text,
      `User: ${EMOTIONAL_PRIOR}\nYin: Sitting with that.\nUser: ${SHORT_TIRED}`
    );
  });

  it('synthetic vectors: ambiguous current stays gray; emotional prior flips to emotional', () => {
    const grayUser = unitVector(6, 0);
    const libraryA = [unitVector(6, 0)];
    const libraryB = [unitVector(6, 0)];
    const currentOnly = classifyConfideSemanticCoarse(grayUser, libraryA, libraryB, {
      grayMargin: 0.08,
      topK: 1
    });
    assert.equal(currentOnly.bucket, CONFIDE_SEMANTIC_BUCKET.GRAY);

    const withPrior = classifyConfideSemanticCoarse(
      unitVector(6, 1),
      [unitVector(6, 0)],
      [unitVector(6, 1)],
      { grayMargin: 0.08, topK: 1 }
    );
    assert.equal(withPrior.bucket, CONFIDE_SEMANTIC_BUCKET.EMOTIONAL);
  });

  it('synthetic vectors: functional prior can pull an ambiguous current toward functional', () => {
    const withPrior = classifyConfideSemanticCoarse(
      unitVector(6, 0),
      [unitVector(6, 0)],
      [unitVector(6, 1)],
      { grayMargin: 0.08, topK: 1 }
    );
    assert.equal(withPrior.bucket, CONFIDE_SEMANTIC_BUCKET.FUNCTIONAL);
    assert.ok(FUNCTIONAL_PRIOR.length > 0);
  });

  it('logs both current-only and with-prior buckets on one shadow row', () => {
    const row = buildConfideSemanticShadowLogRecord({
      text: SHORT_TIRED,
      route: 'fallback',
      source: 'generate',
      literalCoarse: CONFIDE_SEMANTIC_BUCKET.GRAY,
      semanticResult: {
        bucket: CONFIDE_SEMANTIC_BUCKET.GRAY,
        scoreA: 0.5,
        scoreB: 0.5,
        grayMargin: 0.08
      },
      ok: true,
      reason: 'ok',
      hadPriorTurn: true,
      contextualText: buildConfideShadowContextualText(SHORT_TIRED, {
        userText: EMOTIONAL_PRIOR,
        yinText: 'Sitting with that.'
      }),
      semanticResultWithPrior: {
        bucket: CONFIDE_SEMANTIC_BUCKET.EMOTIONAL,
        scoreA: 0.31,
        scoreB: 0.62,
        grayMargin: 0.08
      }
    });
    assert.equal(row.kind, 'semantic_shadow_classify');
    assert.equal(row.text, SHORT_TIRED);
    assert.equal(row.hadPriorTurn, true);
    assert.match(row.contextualText, /好累/);
    assert.equal(row.semanticCoarse, CONFIDE_SEMANTIC_BUCKET.GRAY);
    assert.equal(row.semanticCoarseWithPrior, CONFIDE_SEMANTIC_BUCKET.EMOTIONAL);
    assert.equal(row.scoreAWithPrior, 0.31);
    assert.equal(row.scoreBWithPrior, 0.62);
  });
});
