/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Menu-core file list for the Idle full-walk e2e (wide ⋯ → narrow drawer).
 * Local optional: `npm run test:e2e:changed -- e2e/menu-full-reachability.spec.js`.
 * Not a Required PR / pre-push extra (shared-page flake). Nightly + push to
 * develop: `.github/workflows/menu-full-reachability.yml`.
 *
 * Docs: `docs/PR_SMOKE_FAILURE_CLASSES.md`（`pr-smoke-failure-classes`）.
 */

export const MENU_REACHABILITY_TRIGGER_PATH_RE =
  '^(focus-tiger/src/ui/NarrowIdleShell|focus-tiger/src/ui/WideIdleMoreMenu|focus-tiger/src/core/idleChromeOrchestration|focus-tiger/src/core/IdleChromeFacade|focus-tiger/src/core/createIdleChromeFacade|focus-tiger/src/core/menuReachabilityContract|focus-tiger/src/core/wideMenuRadialLayout|focus-tiger/src/core/electronIdleContextMenu|focus-tiger/src/locales/slices/menu-|focus-tiger/e2e/menu-full-reachability|focus-tiger/e2e/wide-idle-more-menu|focus-tiger/e2e/helpers/product-shell\\.js|\\.github/workflows/menu-full-reachability\\.yml)'
