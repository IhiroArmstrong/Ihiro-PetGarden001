/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { LotusPondStore } from '../core/LotusPondStore.js';
import { LotusPondRuntime } from './LotusPondRuntime.js';

function createStorage() {
  const values = new Map();
  return {
    getItem: (k) => values.get(k) ?? null,
    setItem: (k, v) => values.set(k, v),
    removeItem: (k) => values.delete(k)
  };
}

describe('LotusPondRuntime birth queue', () => {
  it('does not plant until releaseBirths (ceremony-after-glow contract)', () => {
    const planted = [];
    const chrome = {
      attach() {},
      renderQuiet() {},
      plantBloom(index) {
        planted.push(index);
      }
    };
    const runtime = new LotusPondRuntime({
      store: new LotusPondStore({ storage: createStorage() }),
      incenseGreeting: { getLotusDomSrc: () => 'data:lotus' },
      chrome
    });
    runtime.notePracticeMinutes(25);
    assert.deepEqual(planted, []);
    runtime.releaseBirths();
    assert.deepEqual(planted, [0]);
  });

  it('queues nothing past the visual cap', () => {
    const store = new LotusPondStore({ storage: createStorage() });
    store.replaceLifetimeMinutes(440);
    const planted = [];
    const runtime = new LotusPondRuntime({
      store,
      incenseGreeting: { getLotusDomSrc: () => 'data:lotus' },
      chrome: {
        attach() {},
        renderQuiet() {},
        plantBloom(index) {
          planted.push(index);
        }
      }
    });
    runtime.notePracticeMinutes(25);
    runtime.releaseBirths();
    assert.deepEqual(planted, []);
    assert.equal(store.getLifetimeMinutes(), 465);
  });

  it('pond chrome/runtime never borrow Yin lotus sequence frames', () => {
    const chromeSrc = fs.readFileSync(
      fileURLToPath(new URL('./LotusPondChrome.js', import.meta.url)),
      'utf8'
    );
    const runtimeSrc = fs.readFileSync(
      fileURLToPath(new URL('./LotusPondRuntime.js', import.meta.url)),
      'utf8'
    );
    for (const src of [chromeSrc, runtimeSrc]) {
      assert.equal(src.includes('/lotus-front-rising'), false);
      assert.equal(src.includes('/lotus-chest-halo'), false);
      assert.equal(/playEmotion\(\s*['"]lotus/i.test(src), false);
    }
  });

  it('does not mount a persistent pond on the Idle sprite overlay', () => {
    const chromeSrc = fs.readFileSync(
      fileURLToPath(new URL('./LotusPondChrome.js', import.meta.url)),
      'utf8'
    );
    const runtimeSrc = fs.readFileSync(
      fileURLToPath(new URL('./LotusPondRuntime.js', import.meta.url)),
      'utf8'
    );
    assert.equal(chromeSrc.includes("pond.id = 'lotus-pond'"), false);
    assert.equal(chromeSrc.includes('lotus-pond-birth-fx'), false);
    assert.equal(chromeSrc.includes('insertBefore'), false);
    assert.equal(chromeSrc.includes('sprite-stage'), false);
    assert.equal(runtimeSrc.includes('playBirthAt'), false);
    assert.equal(runtimeSrc.includes('overlayEl'), false);
    assert.match(chromeSrc, /growth-journey-lotus-row/);
    assert.match(chromeSrc, /min\(6vw, 48px\)/);
  });
});
