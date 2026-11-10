/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { MENU_REACHABILITY_TRIGGER_PATH_RE } from './menu-reachability-trigger-paths.js'
import {
  PR_SMOKE_PATH_ROUTES,
  matchingPrSmokeRoutes,
  extraPrePushNpmScripts
} from './pr-smoke-path-routes.js'

describe('PR smoke path routes (T99)', () => {
  it('menu route reuses MENU_REACHABILITY_TRIGGER_PATH_RE', () => {
    const menu = PR_SMOKE_PATH_ROUTES.find((r) => r.id === 'menu-reachability')
    assert.ok(menu)
    assert.equal(menu.pathRe, MENU_REACHABILITY_TRIGGER_PATH_RE)
    assert.equal(menu.npmScript, 'test:e2e:menu-reachability')
    assert.equal(menu.inDefaultE2eSmoke, false)
  })

  it('menu file change selects menu extra; glass stays inside default smoke', () => {
    const files = [
      'focus-tiger/src/ui/WideIdleMoreMenu.js',
      'focus-tiger/src/core/glassCardVisualSurfaces.js'
    ]
    const ids = matchingPrSmokeRoutes(files).map((r) => r.id).sort()
    assert.deepEqual(ids, ['glass-visual', 'menu-reachability'])
    assert.deepEqual(extraPrePushNpmScripts(files), ['test:e2e:menu-reachability'])
  })

  it('unrelated src does not add extras', () => {
    assert.deepEqual(
      extraPrePushNpmScripts(['focus-tiger/src/core/foo.js']),
      []
    )
  })
})
