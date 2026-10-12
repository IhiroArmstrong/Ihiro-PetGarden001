/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Stage 2b shadow fields for semantic_shadow_classify rows (log-only).
 * Strings stay in this file so packaged companion JS does not import src/.
 * Must agree with src/core/confide/confideSemanticStage2b.js (sync test).
 */

const PROTECTED_ROUTES = Object.freeze(['safety_redirect', 'aggression_toward_others']);
const PROMOTABLE_SOURCES = Object.freeze(['generate', 'corpus']);

/**
 * Only the Electron main process may mark a session as lab-seeded.
 * `po_seeded` is a legacy alias and writes `lab_seeded`.
 * @param {NodeJS.ProcessEnv | Record<string, string | undefined> | null | undefined} env
 * @returns {'lab_seeded' | 'natural'}
 */
export function resolveStage2bSeedSource(env) {
  const raw = String(env?.FT_CONFIDE_SEED_SOURCE || '')
    .trim()
    .toLowerCase();
  return raw === 'lab_seeded' || raw === 'po_seeded' ? 'lab_seeded' : 'natural';
}

/**
 * @param {{
 *   route?: string | null,
 *   source?: string | null,
 *   literalCoarse?: string | null,
 *   semanticCoarse?: string | null,
 *   seedSource?: string | null
 * }} ctx
 * @returns {{ stage2bWouldPromote: boolean, stage2bReason: string, seedSource: 'lab_seeded' | 'natural' }}
 */
export function buildStage2bShadowFields(ctx = {}) {
  const seedSource =
    ctx.seedSource === 'lab_seeded' || ctx.seedSource === 'po_seeded'
      ? 'lab_seeded'
      : 'natural';
  const no = (reason) => ({ stage2bWouldPromote: false, stage2bReason: reason, seedSource });
  if (PROTECTED_ROUTES.includes(String(ctx.route || ''))) return no('protected_route');
  if (ctx.literalCoarse !== 'gray') return no('literal_not_gray');
  if (typeof ctx.semanticCoarse !== 'string' || !ctx.semanticCoarse) {
    return no('semantic_missing');
  }
  if (ctx.semanticCoarse !== 'functional') return no('semantic_not_functional');
  if (!PROMOTABLE_SOURCES.includes(String(ctx.source || ''))) return no('already_handled');
  return { stage2bWouldPromote: true, stage2bReason: 'gray_to_functional', seedSource };
}
