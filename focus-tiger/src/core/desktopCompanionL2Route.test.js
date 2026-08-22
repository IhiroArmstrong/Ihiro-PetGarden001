/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import { CONFIDE_ROUTE } from './confide/confideRoutes.js';
import {
  companionGenerateEnabled,
  shouldUseDesktopCompanionGenerate
} from './desktopCompanionL2Route.js';
import { buildCompanionL2Prompt } from '../../desktop/companion/l2Persona.js';
import { sanitizeCompanionL2Reply } from '../../desktop/companion/l2Sanitize.js';

const here = dirname(fileURLToPath(import.meta.url));
const focusTigerRoot = join(here, '../..');

const readyOpen = {
  generateEnabled: true,
  generateLayerOpen: true,
  hasGenerateFn: true
};

describe('desktop companion L2 route', () => {
  it('never generates on safety or emotion buckets', () => {
    assert.equal(
      shouldUseDesktopCompanionGenerate({
        ...readyOpen,
        route: CONFIDE_ROUTE.SAFETY_REDIRECT
      }),
      false
    );
    assert.equal(
      shouldUseDesktopCompanionGenerate({
        ...readyOpen,
        route: CONFIDE_ROUTE.ANXIOUS
      }),
      false
    );
    assert.equal(
      shouldUseDesktopCompanionGenerate({
        ...readyOpen,
        route: CONFIDE_ROUTE.TIRED
      }),
      false
    );
    for (const route of [
      CONFIDE_ROUTE.STUCK,
      CONFIDE_ROUTE.SAD,
      CONFIDE_ROUTE.SCATTERED
    ]) {
      assert.equal(
        shouldUseDesktopCompanionGenerate({ ...readyOpen, route }),
        false,
        route
      );
    }
  });

  it('generates only on fallback when the desktop hold is ready', () => {
    assert.equal(
      shouldUseDesktopCompanionGenerate({
        ...readyOpen,
        route: CONFIDE_ROUTE.FALLBACK
      }),
      true
    );
    assert.equal(
      shouldUseDesktopCompanionGenerate({
        route: CONFIDE_ROUTE.FALLBACK,
        generateEnabled: false,
        generateLayerOpen: true,
        hasGenerateFn: true
      }),
      false
    );
    assert.equal(
      shouldUseDesktopCompanionGenerate({
        route: CONFIDE_ROUTE.FALLBACK,
        generateEnabled: true,
        generateLayerOpen: false,
        hasGenerateFn: true
      }),
      false
    );
    assert.equal(
      shouldUseDesktopCompanionGenerate({
        route: CONFIDE_ROUTE.FALLBACK,
        generateEnabled: true,
        generateLayerOpen: true,
        hasGenerateFn: false
      }),
      false
    );
  });

  it('enables generate only when allowed, ready, and not focusing', () => {
    assert.equal(
      companionGenerateEnabled({ phase: 'ready', focusing: false }, true),
      true
    );
    assert.equal(
      companionGenerateEnabled({ phase: 'ready', focusing: true }, true),
      false
    );
    assert.equal(
      companionGenerateEnabled({ phase: 'loading', focusing: false }, true),
      false
    );
    assert.equal(
      companionGenerateEnabled({ phase: 'ready', focusing: false }, false),
      false
    );
  });
});

describe('desktop companion L2 persona / sanitize', () => {
  it('builds a no_think observer prompt and drops banned coaching', () => {
    const prompt = buildCompanionL2Prompt({
      text: 'the weather is mild today',
      locale: 'en',
      history: [{ role: 'user', text: 'hello' }, { role: 'yin', text: 'Heard.' }]
    });
    assert.match(prompt, /\/no_think/);
    assert.match(prompt, /do not advise/i);
    assert.match(prompt, /the weather is mild today/);
    assert.equal(sanitizeCompanionL2Reply('Tea is still warm.'), 'Tea is still warm.');
    assert.equal(sanitizeCompanionL2Reply('You should try to breathe slowly.'), null);
    assert.equal(sanitizeCompanionL2Reply('你应该深呼吸。'), null);
    assert.equal(sanitizeCompanionL2Reply(''), null);
  });
});

describe('desktop companion L2 isolation', () => {
  it('wires generate IPC on preload and companion ipc, not in ritual UIs', () => {
    const preload = readFileSync(join(focusTigerRoot, 'desktop/preload.js'), 'utf8');
    const ipcSrc = readFileSync(
      join(focusTigerRoot, 'desktop/companion/l1Ipc.js'),
      'utf8'
    );
    const uiPath = join(focusTigerRoot, 'src/ui/ConfideToYinUI.js');
    const ui = readFileSync(uiPath, 'utf8');
    const syntax = spawnSync(process.execPath, ['--check', uiPath], {
      encoding: 'utf8'
    });
    assert.equal(syntax.status, 0, syntax.stderr || syntax.stdout);
    const whisper = readFileSync(
      join(focusTigerRoot, 'src/ui/MomentWhisperUI.js'),
      'utf8'
    );
    const recover = readFileSync(
      join(focusTigerRoot, 'src/ui/ActiveRecoverAnchorUI.js'),
      'utf8'
    );
    assert.match(preload, /desktop:companion-generate/);
    assert.match(ipcSrc, /desktop:companion-generate/);
    assert.match(ui, /shouldUseDesktopCompanionGenerate/);
    assert.match(ui, /companion\.generate/);
    assert.match(ui, /confide-to-yin-user/);
    assert.match(ui, /data-route='\$\{CONFIDE_ROUTE\.FALLBACK\}'/);
    assert.match(ui, /#d4a24a/);
    assert.match(ui, /#7a5340/);
    assert.equal(whisper.includes('companion.generate'), false);
    assert.equal(recover.includes('companion.generate'), false);
  });

  it('resets the chat hold so later unmatched turns can still generate', () => {
    const hold = readFileSync(
      join(focusTigerRoot, 'desktop/companion/l1Hold.js'),
      'utf8'
    );
    assert.match(hold, /resetChatHistory/);
  });

  it('keeps llama out of src/', () => {
    const srcHold = readFileSync(
      join(focusTigerRoot, 'src/core/desktopCompanionL2Route.js'),
      'utf8'
    );
    assert.equal(srcHold.includes('node-llama-cpp'), false);
    assert.equal(srcHold.includes('LlamaChatSession'), false);
  });

  it('does not import renderer src from the desktop runtime', () => {
    const runtime = readFileSync(
      join(focusTigerRoot, 'desktop/companion/l1Runtime.js'),
      'utf8'
    );
    assert.equal(runtime.includes("from '../../src/"), false);
    assert.equal(runtime.includes('focus-tiger/src'), false);
  });
});
