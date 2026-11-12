/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Shared “changed files → extra PR-smoke checks” table.
 * CI (`pr-smoke.yml`) and husky pre-push both read this.
 *
 * Docs: `docs/PR_SMOKE_FAILURE_CLASSES.md`（`pr-smoke-failure-classes`）.
 */

/**
 * @typedef {object} PrSmokePathRoute
 * @property {string} id
 * @property {string} pathRe
 * @property {string | null} npmScript extra npm script; null = already in default `test:e2e:smoke`
 * @property {boolean} inDefaultE2eSmoke
 */

/** @type {readonly PrSmokePathRoute[]} */
export const PR_SMOKE_PATH_ROUTES = Object.freeze([
  Object.freeze({
    id: 'glass-visual',
    pathRe:
      '^(focus-tiger/src/core/glassCard|focus-tiger/src/core/a13SurfaceVisibility|focus-tiger/src/ui/glass|focus-tiger/e2e/glass-card-visual|focus-tiger/e2e/helpers/glass-card-visual|focus-tiger/e2e/helpers/open-a13-glass-surface)',
    npmScript: null,
    inDefaultE2eSmoke: true
  })
])

/**
 * @param {string[]} files
 * @returns {PrSmokePathRoute[]}
 */
export function matchingPrSmokeRoutes(files) {
  const list = Array.isArray(files) ? files : []
  return PR_SMOKE_PATH_ROUTES.filter((route) => {
    const re = new RegExp(route.pathRe)
    return list.some((file) => re.test(String(file || '').replace(/\\/g, '/')))
  })
}

/**
 * Extra npm scripts for pre-push (not already covered by `test:e2e:smoke`).
 * @param {string[]} files
 * @returns {string[]}
 */
export function extraPrePushNpmScripts(files) {
  return matchingPrSmokeRoutes(files)
    .filter((route) => route.inDefaultE2eSmoke === false && route.npmScript)
    .map((route) => route.npmScript)
}
