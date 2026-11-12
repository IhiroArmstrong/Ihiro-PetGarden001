/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  PR_SMOKE_PATH_ROUTES,
  matchingPrSmokeRoutes,
  extraPrePushNpmScripts
} from './pr-smoke-path-routes.js'

describe('PR smoke path routes (T99)', () => {
  it('does not bind menu full-walk to required extras', () => {
    const menu = PR_SMOKE_PATH_ROUTES.find((r) => r.id === 'menu-reachability')
    assert.equal(menu, undefined)
  })

  it('glass stays inside default smoke; menu files add no extras', () => {
    const files = [
      'focus-tiger/src/ui/WideIdleMoreMenu.js',
      'focus-tiger/src/core/glassCardVisualSurfaces.js'
    ]
    const ids = matchingPrSmokeRoutes(files).map((r) => r.id).sort()
    assert.deepEqual(ids, ['glass-visual'])
    assert.deepEqual(extraPrePushNpmScripts(files), [])
  })

  it('unrelated src does not add extras', () => {
    assert.deepEqual(
      extraPrePushNpmScripts(['focus-tiger/src/core/foo.js']),
      []
    )
  })
})
