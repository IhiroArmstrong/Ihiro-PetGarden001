/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Lab decision for Stage 2 M replay.
 * Reuses the live route override only. Does not call Hybrid, generate a reply,
 * or rewrite literal / semantic buckets.
 */

import { CONFIDE_SEMANTIC_BUCKET } from './confideSemanticBuckets.js';
import {
  CONFIDE_SEMANTIC_ROUTING_MODE
} from './confideSemanticRoutingConfig.js';
import { applyConfideStage2Route } from './confideSemanticStage2.js';

/**
 * @param {{
 *   text?: string,
 *   route?: string | null,
 *   source?: string | null,
 *   literalCoarse?: string | null,
 *   skipped?: boolean,
 *   semanticCoarse?: string | null
 * }} row
 * @returns {{
 *   text: string,
 *   skipped: boolean,
 *   source: string | null,
 *   literalCoarse: string | null,
 *   semanticCoarse: string | null,
 *   literalRoute: string | null,
 *   replayRoute: string | null,
 *   override: string | null,
 *   mCandidate: boolean,
 *   routeChanged: boolean,
 *   stillGrayToFunctional: boolean
 * }}
 */
export function decideStage2MReplay(row) {
  const text = typeof row.text === 'string' ? row.text : '';
  const skipped = Boolean(row.skipped);
  const literalCoarse = row.literalCoarse ?? null;
  const semanticCoarse = row.semanticCoarse ?? null;
  const literalRoute = row.route ?? null;
  const stage2 = skipped
    ? { route: literalRoute, override: null }
    : applyConfideStage2Route({
      literalRoute,
      semanticCoarse,
      mode: CONFIDE_SEMANTIC_ROUTING_MODE.LIVE
    });
  const replayRoute = stage2.route ?? null;
  const override = stage2.override ?? null;
  const mCandidate =
    !skipped &&
    literalCoarse === CONFIDE_SEMANTIC_BUCKET.GRAY &&
    semanticCoarse === CONFIDE_SEMANTIC_BUCKET.FUNCTIONAL;
  const routeChanged = !skipped && replayRoute !== literalRoute;
  return {
    text,
    skipped,
    source: row.source ?? null,
    literalCoarse,
    semanticCoarse,
    literalRoute,
    replayRoute,
    override,
    mCandidate,
    routeChanged,
    stillGrayToFunctional: mCandidate && !routeChanged
  };
}
