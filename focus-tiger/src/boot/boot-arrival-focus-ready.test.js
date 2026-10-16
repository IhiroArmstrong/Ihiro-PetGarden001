/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createBootArrivalFocusReadyState,
  mountArrivalPractice,
  mountFocusInput,
  applyBootSpriteOccupancy,
  createTastePrefetchStarter,
  scheduleLiftLoadingMask,
  markAppReady
} from './boot-arrival-focus-ready.js';

describe('bootArrivalFocusReady (A7.6)', () => {
  it('creates FocusInput on the bag before construct', () => {
    const state = createBootArrivalFocusReadyState();
    assert.equal(state.focusInput, null);
  });

  it('mounts Arrival onto honesty state and Focus onto the ready bag', () => {
    const honesty = { arrivalPractice: null };
    const focus = createBootArrivalFocusReadyState();
    class Fake {
      constructor(...args) {
        this.args = args;
      }
    }
    const overlay = { id: 'ui-overlay' };
    const handlers = { onBegin: () => {} };
    const start = () => true;
    const stop = () => false;
    assert.throws(() => mountArrivalPractice(honesty, overlay, handlers));
    assert.throws(() => mountFocusInput(focus, start, stop));
    const arrival = mountArrivalPractice(honesty, overlay, handlers, {
      ArrivalUI: Fake
    });
    const input = mountFocusInput(focus, start, stop, { Input: Fake });
    assert.equal(honesty.arrivalPractice, arrival);
    assert.equal(focus.focusInput, input);
    assert.equal(arrival.args[0], overlay);
    assert.equal(arrival.args[1], handlers);
    assert.equal(input.args[0], start);
    assert.equal(input.args[1], stop);
  });

  it('applies first-paint occupancy except KEEP', () => {
    const scene = { spriteOccupancy: 'idle' };
    applyBootSpriteOccupancy(scene, { occupy: 'welcome' }, 'keep');
    assert.equal(scene.spriteOccupancy, 'welcome');
    applyBootSpriteOccupancy(scene, { occupy: 'keep' }, 'keep');
    assert.equal(scene.spriteOccupancy, 'welcome');
    applyBootSpriteOccupancy(scene, { occupy: null }, 'keep');
    assert.equal(scene.spriteOccupancy, 'welcome');
  });

  it('delays taste prefetch while overlay is busy, then runs once', () => {
    const calls = [];
    let overlayBusy = true;
    const { startOnce } = createTastePrefetchStarter({
      isOverlayBusy: () => overlayBusy,
      nextDelayMs: ({ overlayBusy: busy, firstWaitDone }) => {
        if (busy) return firstWaitDone ? 400 : 12000;
        return 0;
      },
      schedule: (fn, ms) => {
        calls.push(['schedule', ms]);
        overlayBusy = false;
        fn();
      },
      runPrefetch: () => {
        calls.push(['prefetch']);
      }
    });
    startOnce();
    assert.deepEqual(calls, [
      ['schedule', 12000],
      ['prefetch']
    ]);
  });

  it('lifts the loading mask on the next animation frame and marks ready', () => {
    const frames = [];
    scheduleLiftLoadingMask((fn) => frames.push(fn), () => frames.push('lift'));
    assert.equal(frames.length, 1);
    frames[0]();
    assert.equal(frames[1], 'lift');
    const events = [];
    class FakeEvent {
      constructor(type) {
        this.type = type;
      }
    }
    const target = {
      dispatchEvent: (event) => {
        events.push(event.type);
        return true;
      }
    };
    markAppReady(target, { EventCtor: FakeEvent });
    assert.equal(target.__FT_APP_READY__, true);
    assert.deepEqual(events, ['ft:app-ready']);
  });
});
