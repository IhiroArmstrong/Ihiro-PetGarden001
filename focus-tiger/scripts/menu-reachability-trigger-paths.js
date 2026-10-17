/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Path filter for the Idle menu full-walk e2e (wide ⋯ → narrow drawer).
 * SSOT for `pr-smoke.yml` extra step. Keep the grep in that workflow in sync
 * (`scripts/pr-smoke-e2e-subset.test.js` compares the two).
 *
 * Docs: `docs/PR_SMOKE_FAILURE_CLASSES.md`（`pr-smoke-failure-classes`）.
 */

export const MENU_REACHABILITY_TRIGGER_PATH_RE =
  '^(focus-tiger/src/ui/NarrowIdleShell|focus-tiger/src/ui/WideIdleMoreMenu|focus-tiger/src/core/idleChromeOrchestration|focus-tiger/src/core/IdleChromeFacade|focus-tiger/src/core/createIdleChromeFacade|focus-tiger/src/core/menuReachabilityContract|focus-tiger/src/core/wideMenuRadialLayout|focus-tiger/src/core/electronIdleContextMenu|focus-tiger/src/locales/slices/menu-|focus-tiger/e2e/menu-full-reachability|focus-tiger/e2e/wide-idle-more-menu|focus-tiger/e2e/helpers/product-shell\\.js|\\.github/workflows/menu-full-reachability\\.yml)'
