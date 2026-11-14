/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { A13_GLASS_VISUAL_SURFACES } from './glassCardVisualSurfaces.js'
import { CONFIDE_USER_MOUNT_ENABLED } from './confide/confideUserVisibilityGate.js'
import { shouldAssertA13SurfaceVisible } from './a13SurfaceVisibility.js'

describe('shouldAssertA13SurfaceVisible', () => {
  const confide = A13_GLASS_VISUAL_SURFACES.find((s) => s.id === 'confide-card')

  it('confide-card is gated on user mount or QA harness', () => {
    assert.ok(confide)
    assert.equal(confide.visibilityDependsOn, 'confide-user-or-harness')
    assert.equal(confide.qaHarnessRequired, true)
    assert.equal(confide.shellQuery?.confide, '1')
    assert.equal(CONFIDE_USER_MOUNT_ENABLED, false)
    assert.equal(shouldAssertA13SurfaceVisible(confide), true)
  })

  it('does not require the card when mount is off and harness is absent', () => {
    const noHarness = {
      id: 'confide-card',
      visibilityDependsOn: 'confide-user-or-harness',
      shellQuery: {}
    }
    assert.equal(
      shouldAssertA13SurfaceVisible(noHarness, {
        search: '?product=1',
        mountEnabled: false
      }),
      false
    )
    assert.equal(
      shouldAssertA13SurfaceVisible(noHarness, {
        search: '?confide=1',
        mountEnabled: false
      }),
      true
    )
    assert.equal(
      shouldAssertA13SurfaceVisible(noHarness, {
        search: '?product=1',
        mountEnabled: true
      }),
      true
    )
  })

  it('other glass rows stay unconditional', () => {
    const help = A13_GLASS_VISUAL_SURFACES.find((s) => s.id === 'help-center')
    assert.equal(shouldAssertA13SurfaceVisible(help, { mountEnabled: false }), true)
  })

  it('skips sanctuary-nav fan while the home nav flag is off', () => {
    const fan = A13_GLASS_VISUAL_SURFACES.find((s) => s.id === 'sanctuary-nav-fan')
    assert.ok(fan)
    assert.equal(fan.visibilityDependsOn, 'home-sanctuary-nav')
    assert.equal(shouldAssertA13SurfaceVisible(fan), false)
  })
})
