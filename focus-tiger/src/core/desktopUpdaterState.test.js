/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  DESKTOP_UPDATE_PHASES,
  desktopUpdateFailedActionsVisible,
  mapUrgencyForMvp,
  readForceDesktopUpdateFlag,
  shouldDeferQuitAndInstall,
  shouldRevealDesktopUpdateChip
} from './desktopUpdaterState.js';

describe('desktopUpdaterState', () => {
  it('shouldRevealDesktopUpdateChip hides when busy or idle', () => {
    assert.equal(
      shouldRevealDesktopUpdateChip({
        phase: DESKTOP_UPDATE_PHASES.AVAILABLE,
        busySession: true
      }),
      false
    );
    assert.equal(
      shouldRevealDesktopUpdateChip({ phase: DESKTOP_UPDATE_PHASES.IDLE }),
      false
    );
  });

  it('shouldRevealDesktopUpdateChip shows active phases when idle', () => {
    assert.equal(
      shouldRevealDesktopUpdateChip({
        phase: DESKTOP_UPDATE_PHASES.AVAILABLE,
        availableVersion: '1.2.3'
      }),
      true
    );
    assert.equal(
      shouldRevealDesktopUpdateChip({
        phase: DESKTOP_UPDATE_PHASES.FAILED,
        availableVersion: '1.2.3'
      }),
      true
    );
  });

  it('shouldRevealDesktopUpdateChip hides skipped version until newer', () => {
    assert.equal(
      shouldRevealDesktopUpdateChip({
        phase: DESKTOP_UPDATE_PHASES.AVAILABLE,
        skippedVersion: '1.0.0',
        availableVersion: '1.0.0'
      }),
      false
    );
    assert.equal(
      shouldRevealDesktopUpdateChip({
        phase: DESKTOP_UPDATE_PHASES.AVAILABLE,
        skippedVersion: '1.0.0',
        availableVersion: '1.0.1'
      }),
      true
    );
  });

  it('mapUrgencyForMvp treats required as optional', () => {
    assert.equal(mapUrgencyForMvp('required'), 'optional');
    assert.equal(mapUrgencyForMvp('optional'), 'optional');
  });

  it('failed state requires retry and not-now affordances', () => {
    assert.equal(
      desktopUpdateFailedActionsVisible(DESKTOP_UPDATE_PHASES.FAILED),
      true
    );
    assert.equal(
      desktopUpdateFailedActionsVisible(DESKTOP_UPDATE_PHASES.AVAILABLE),
      false
    );
  });

  it('shouldDeferQuitAndInstall when busy at ready', () => {
    assert.equal(
      shouldDeferQuitAndInstall({
        phase: DESKTOP_UPDATE_PHASES.READY_TO_INSTALL,
        busySession: true
      }),
      true
    );
    assert.equal(
      shouldDeferQuitAndInstall({
        phase: DESKTOP_UPDATE_PHASES.READY_TO_INSTALL,
        busySession: false
      }),
      false
    );
  });

  it('readForceDesktopUpdateFlag reads query param', () => {
    assert.equal(readForceDesktopUpdateFlag('?product=1'), false);
    assert.equal(readForceDesktopUpdateFlag('?forceDesktopUpdate=1'), true);
  });
});
