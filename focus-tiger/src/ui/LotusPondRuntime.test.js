/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
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
    const births = [];
    const chrome = {
      birthRoot: null,
      mount() {},
      renderQuiet() {},
      plantBloom(index) {
        planted.push(index);
      }
    };
    const incenseGreeting = {
      getLotusDomSrc: () => 'data:lotus',
      playBirthAt(slot, opts) {
        births.push(slot.index);
        opts?.onPlanted?.();
      }
    };
    const runtime = new LotusPondRuntime({
      store: new LotusPondStore({ storage: createStorage() }),
      incenseGreeting,
      chrome
    });
    runtime.notePracticeMinutes(25);
    assert.deepEqual(planted, []);
    assert.deepEqual(births, []);
    runtime.releaseBirths();
    assert.deepEqual(births, [0]);
    assert.deepEqual(planted, [0]);
  });

  it('queues nothing past the visual cap', () => {
    const store = new LotusPondStore({ storage: createStorage() });
    store.replaceLifetimeMinutes(440);
    const births = [];
    const runtime = new LotusPondRuntime({
      store,
      incenseGreeting: {
        getLotusDomSrc: () => 'data:lotus',
        playBirthAt(slot, opts) {
          births.push(slot.index);
          opts?.onPlanted?.();
        }
      },
      chrome: {
        birthRoot: null,
        mount() {},
        renderQuiet() {},
        plantBloom() {}
      }
    });
    runtime.notePracticeMinutes(25);
    runtime.releaseBirths();
    assert.deepEqual(births, []);
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

  it('persistent pond sits in front of Yin (z 2 > stage 1)', () => {
    const chromeSrc = fs.readFileSync(
      fileURLToPath(new URL('./LotusPondChrome.js', import.meta.url)),
      'utf8'
    );
    assert.match(chromeSrc, /pond.id = 'lotus-pond'[\s\S]*?z-index:2/);
    assert.match(chromeSrc, /stage.style.zIndex = '1'/);
    assert.match(
      chromeSrc,
      /birth.id = 'lotus-pond-birth-fx'[\s\S]*?z-index:3/
    );
  });
});
