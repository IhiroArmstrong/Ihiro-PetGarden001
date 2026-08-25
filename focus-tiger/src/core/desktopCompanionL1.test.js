/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import { isCompanionL1Allowed } from '../../desktop/companion/l1Capability.js';
import {
  applyCompanionEvent,
  createCompanionStatus
} from '../../desktop/companion/l1Status.js';
import { resolveCompanionNodeSpawn } from '../../desktop/companion/l1Runtime.js';
import {
  canRegisterDesktopCompanionGeneration,
  DESKTOP_COMPANION_WIDE_MIN_PX,
  desktopCompanionDownloadPercent,
  desktopCompanionModelLabel,
  desktopCompanionStatusCopyKey,
  hasDesktopCompanionBridge,
  shouldCloseDesktopCompanionGenerateLayer
} from './desktopCompanionGate.js';
import { canOpenConfidePanel } from './confide/confideUserVisibilityGate.js';
import { listSecondaryChromeEntries } from './idleChromeOrchestration.js';

const here = dirname(fileURLToPath(import.meta.url));
const focusTigerRoot = join(here, '../..');

describe('desktop companion L1 capability', () => {
  it('hides the entry on 8GB-class machines unless forced on', () => {
    const eight = 8 * 1024 * 1024 * 1024;
    assert.equal(isCompanionL1Allowed({ totalMemBytes: eight, env: {} }), false);
    assert.equal(
      isCompanionL1Allowed({
        totalMemBytes: eight,
        env: { FT_COMPANION_L1_FORCE_ON: '1' }
      }),
      true
    );
    assert.equal(
      isCompanionL1Allowed({
        totalMemBytes: 16 * 1024 * 1024 * 1024,
        env: { FT_COMPANION_L1_FORCE_OFF: '1' }
      }),
      false
    );
    assert.equal(
      isCompanionL1Allowed({
        totalMemBytes: 16 * 1024 * 1024 * 1024,
        env: {}
      }),
      true
    );
  });
});

describe('desktop companion L1 renderer gates', () => {
  it('registers generation only with a companion bridge and wide viewport', () => {
    assert.equal(DESKTOP_COMPANION_WIDE_MIN_PX, 480);
    assert.equal(
      canRegisterDesktopCompanionGeneration({ hasBridge: false, widthPx: 1100 }),
      false
    );
    assert.equal(
      canRegisterDesktopCompanionGeneration({ hasBridge: true, widthPx: 479 }),
      false
    );
    assert.equal(
      canRegisterDesktopCompanionGeneration({ hasBridge: true, widthPx: 480 }),
      true
    );
    assert.equal(hasDesktopCompanionBridge({}), false);
    assert.equal(
      hasDesktopCompanionBridge({ desktopShell: { isDesktop: true } }),
      false
    );
    assert.equal(
      hasDesktopCompanionBridge({
        desktopShell: { isDesktop: true, companion: { ensureReady() {} } }
      }),
      true
    );
  });

  it('closes the generate layer when the window is dragged narrow', () => {
    assert.equal(
      shouldCloseDesktopCompanionGenerateLayer({
        generateLayerOpen: true,
        widthPx: 390
      }),
      true
    );
    assert.equal(
      shouldCloseDesktopCompanionGenerateLayer({
        generateLayerOpen: true,
        widthPx: 900
      }),
      false
    );
    assert.equal(
      shouldCloseDesktopCompanionGenerateLayer({
        generateLayerOpen: false,
        widthPx: 390
      }),
      false
    );
  });

  it('maps status phases to locale keys and download percent', () => {
    assert.equal(
      desktopCompanionStatusCopyKey({ phase: 'downloading' }),
      'CONFIDE_DESKTOP_STATUS_DOWNLOADING'
    );
    assert.equal(
      desktopCompanionStatusCopyKey({ phase: 'ready', focusing: true }),
      'CONFIDE_DESKTOP_STATUS_UNLOADED_FOCUSING'
    );
    assert.equal(
      desktopCompanionStatusCopyKey({ phase: 'ready' }, { sending: true }),
      'CONFIDE_DESKTOP_STATUS_GENERATING'
    );
    assert.equal(
      desktopCompanionDownloadPercent({ received: 50, total: 200 }),
      25
    );
    assert.equal(desktopCompanionDownloadPercent({ received: 1, total: null }), null);
    assert.equal(
      desktopCompanionModelLabel({ modelId: 'Qwen3-1.7B-Q4_K_M' }),
      'Qwen3-1.7B-Q4_K_M'
    );
    assert.equal(desktopCompanionModelLabel({ modelId: '  ' }), '');
    assert.equal(desktopCompanionModelLabel(null), '');
  });
});

describe('desktop companion L1 Confide chrome', () => {
  const allOn = {
    microRitualVisible: true,
    companionVisible: true,
    companionEnabled: true,
    reminderAvailable: true,
    confideUserVisible: false
  };

  it('shows the Confide row on wide-more when companionGeneration is on, even if mount is closed', () => {
    const hidden = listSecondaryChromeEntries('wide-more', allOn);
    assert.equal(hidden.some((e) => e.proxy === 'confide'), false);
    const open = listSecondaryChromeEntries('wide-more', {
      ...allOn,
      companionGeneration: true
    });
    const row = open.find((e) => e.proxy === 'confide');
    assert.equal(row?.labelKey, 'CONFIDE_MENU_LABEL');
    assert.equal(row?.testId, 'idle-confide-desktop');
  });

  it('does not leak the desktop companion Confide row into the narrow drawer', () => {
    const entries = listSecondaryChromeEntries('narrow-drawer', {
      ...allOn,
      companionGeneration: true
    });
    assert.equal(entries.some((e) => e.proxy === 'confide'), false);
  });

  it('can open Confide from companion generation on Idle only', () => {
    assert.equal(
      canOpenConfidePanel({
        search: '',
        stage: 'idle',
        companionGeneration: true,
        safetyOk: () => true
      }),
      true
    );
    assert.equal(
      canOpenConfidePanel({
        search: '',
        stage: 'focusing',
        companionGeneration: true,
        safetyOk: () => true
      }),
      false
    );
    assert.equal(
      canOpenConfidePanel({
        search: '',
        stage: 'idle',
        companionGeneration: true,
        safetyOk: () => false
      }),
      false
    );
  });
});

describe('desktop companion L1 status reducer', () => {
  it('never enables generate in the reducer; ready overlay is L2', () => {
    let status = createCompanionStatus();
    assert.equal(status.generateEnabled, false);
    status = applyCompanionEvent(status, {
      event: 'progress',
      received: 10,
      total: 100
    });
    assert.equal(status.phase, 'downloading');
    status = applyCompanionEvent(status, { event: 'ready' });
    assert.equal(status.phase, 'ready');
    assert.equal(status.generateEnabled, false);
    status = applyCompanionEvent(status, {
      event: 'generated',
      id: 'x',
      text: 'Heard.'
    });
    assert.equal(status.phase, 'ready');
    assert.equal(status.generateEnabled, false);
    status = applyCompanionEvent(status, { event: 'unloaded' });
    assert.equal(status.phase, 'idle');
  });
});

describe('desktop companion L1 isolation', () => {
  it('spawns a Node child, not renderer llama, and uses ELECTRON_RUN_AS_NODE when packed', () => {
    const packed = resolveCompanionNodeSpawn({
      isPackaged: true,
      execPath: '/fake/electron',
      env: {}
    });
    assert.equal(packed.command, '/fake/electron');
    assert.equal(packed.env.ELECTRON_RUN_AS_NODE, '1');
    assert.match(packed.args[0], /l1Child\.js$/);
    const dev = resolveCompanionNodeSpawn({ isPackaged: false, env: {} });
    assert.equal(dev.command, 'node');
  });

  it('exposes companion on preload only after the allowed sync gate', () => {
    const preload = readFileSync(join(focusTigerRoot, 'desktop/preload.js'), 'utf8');
    assert.match(preload, /desktop:companion-allowed/);
    assert.match(preload, /if \(companionAllowed\)/);
    assert.match(preload, /desktopShell\.companion/);
    assert.equal(preload.includes('desktop:companion-generate'), true);
    assert.match(preload, /require\(\s*['"]electron['"]\s*\)/);
  });

  it('adds a generate IPC in companion ipc, still spawned from main L1 attach', () => {
    const mainSrc = readFileSync(join(focusTigerRoot, 'desktop/main.js'), 'utf8');
    const ipcSrc = readFileSync(
      join(focusTigerRoot, 'desktop/companion/l1Ipc.js'),
      'utf8'
    );
    assert.match(mainSrc, /attachCompanionL1Ipc/);
    assert.match(ipcSrc, /desktop:companion-generate/);
    assert.match(ipcSrc, /desktop:companion-ensure/);
    assert.match(ipcSrc, /desktop:companion-set-focusing/);
    const runtimeSrc = readFileSync(
      join(focusTigerRoot, 'desktop/companion/l1Runtime.js'),
      'utf8'
    );
    assert.match(runtimeSrc, /modelId: L0_MODEL_ID/);
  });

  it('packs companion runtime JS and still keeps GGUF out of the file list', () => {
    const desktop = JSON.parse(
      readFileSync(join(focusTigerRoot, 'desktop/package.json'), 'utf8')
    );
    const files = desktop.build.files;
    assert.equal(
      files.some((row) => typeof row === 'string' && row.includes('companion')),
      true
    );
    assert.equal(
      JSON.stringify(files).toLowerCase().includes('gguf'),
      false
    );
  });

  it('routes Confide send through retrieve first; generate only via L2 helper', () => {
    const ui = readFileSync(join(focusTigerRoot, 'src/ui/ConfideToYinUI.js'), 'utf8');
    assert.match(ui, /resolveConfideReply/);
    assert.match(ui, /ypeMayUseCompanionGenerate/);
    assert.match(ui, /confide-to-yin-desktop-status/);
    assert.match(ui, /ensureReady/);
    assert.match(ui, /companion\.generate/);
    assert.match(ui, /shouldSubmitConfideOnEnter/);
    assert.match(ui, /confide-to-yin-desktop-model/);
  });

  it('unloads on Focusing from the product shell', () => {
    const mainSrc = readFileSync(join(focusTigerRoot, 'src/main.js'), 'utf8');
    assert.match(mainSrc, /setFocusing\(stateManager\.state === STATES\.FOCUSING\)/);
    assert.match(mainSrc, /confideToYinUI\.close\(\)/);
    assert.match(mainSrc, /bindDesktopCompanion/);
  });
});
