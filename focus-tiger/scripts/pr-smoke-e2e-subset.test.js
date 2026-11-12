/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const repoRoot = join(root, '..')

describe('PR smoke e2e subset (menu walk demoted)', () => {
  it('test:e2e:smoke does not include menu-full-reachability', () => {
    const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
    const smoke = pkg.scripts['test:e2e:smoke']
    const dedicated = pkg.scripts['test:e2e:menu-reachability']
    assert.match(smoke, /product-shell\.smoke/)
    assert.match(smoke, /--project=chromium/)
    assert.doesNotMatch(smoke, /menu-full-reachability/)
    assert.doesNotMatch(smoke, /menu full reachability/)
    assert.match(dedicated, /menu-full-reachability\.spec\.js/)
    assert.match(dedicated, /menu full reachability/)
  })

  it('pr-smoke.yml does not run menu-full-reachability as a Required extra', () => {
    const yml = readFileSync(
      join(repoRoot, '.github/workflows/pr-smoke.yml'),
      'utf8'
    )
    assert.doesNotMatch(yml, /id: menu_paths/)
    assert.doesNotMatch(yml, /npm run test:e2e:menu-reachability/)
    assert.match(yml, /npm run test:e2e:smoke/)
  })
})
