/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  M01_BACKGROUND_EXEMPTIONS,
  M01_CLICK_MUTATION_FILES
} from './mutationM01Contract.js';

describe('M-01 contract tables', () => {
  it('lists click mutations and written exemptions without overlap', () => {
    assert.ok(M01_CLICK_MUTATION_FILES.includes('src/core/cloudApiClient.js'));
    assert.ok(
      M01_CLICK_MUTATION_FILES.includes('src/core/focusCircleWitness.js')
    );
    const click = new Set(M01_CLICK_MUTATION_FILES);
    const exempt = M01_BACKGROUND_EXEMPTIONS.map((row) => row.file);
    for (const file of exempt) {
      assert.equal(click.has(file), false, file);
    }
    assert.ok(exempt.includes('src/core/tasteLayerSync.js'));
  });
});
