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
import { confideClassify } from './confide/confideClassify.js';
import { CONFIDE_ROUTE } from './confide/confideRoutes.js';
import {
  companionGenerateEnabled,
  shouldUseDesktopCompanionGenerate
} from './desktopCompanionL2Route.js';
import {
  buildCompanionL2Prompt,
  historyForGeneratePrompt
} from '../../desktop/companion/l2Persona.js';
import { sanitizeCompanionL2Reply } from '../../desktop/companion/l2Sanitize.js';

const here = dirname(fileURLToPath(import.meta.url));
const focusTigerRoot = join(here, '../..');

const readyOpen = {
  generateEnabled: true,
  generateLayerOpen: true,
  hasGenerateFn: true
};

describe('desktop companion L2 route', () => {
  it('depressed self-report classifies as sad and never generates', () => {
    const route = confideClassify('I feel depressed. Can you help me?');
    assert.equal(route, CONFIDE_ROUTE.SAD);
    assert.equal(
      shouldUseDesktopCompanionGenerate({ ...readyOpen, route }),
      false
    );
  });

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
    assert.match(prompt, /Recent turns:/);
    assert.match(prompt, /Yin: Heard\./);
  });

  it('drops corpus-backed exchanges from Recent turns (safety-01 pair)', () => {
    const safety =
      'Heard. If this feels too heavy to hold alone, please reach someone you trust or a local crisis line. Yin is here — not a substitute for professional help.';
    const prompt = buildCompanionL2Prompt({
      text: 'Whom do you like?',
      locale: 'en',
      history: [
        { role: 'user', text: "I don't want to live" },
        { role: 'yin', text: safety, source: 'corpus' }
      ]
    });
    assert.equal(prompt.includes('Recent turns:'), false);
    assert.equal(prompt.includes(safety), false);
    assert.equal(prompt.includes("I don't want to live"), false);
    assert.match(prompt, /Whom do you like\?/);
  });

  it('keeps generate-backed Yin turns in Recent turns', () => {
    const prompt = buildCompanionL2Prompt({
      text: 'and the sky?',
      locale: 'en',
      history: [
        { role: 'user', text: 'the weather is mild today' },
        { role: 'yin', text: 'Clouds drift. Tea stays.', source: 'generate' }
      ]
    });
    assert.match(prompt, /Recent turns:/);
    assert.match(prompt, /Clouds drift\. Tea stays\./);
    assert.match(prompt, /the weather is mild today/);
  });

  it('in mixed history keeps only generate-backed exchanges', () => {
    const prompt = buildCompanionL2Prompt({
      text: 'Do you eat anything?',
      locale: 'en',
      history: [
        { role: 'user', text: "I don't want to live" },
        {
          role: 'yin',
          text: 'Heard. If this feels too heavy to hold alone.',
          source: 'corpus'
        },
        { role: 'user', text: 'the weather is mild today' },
        { role: 'yin', text: 'Wind comes; wind goes.', source: 'generate' }
      ]
    });
    assert.match(prompt, /Wind comes; wind goes\./);
    assert.match(prompt, /the weather is mild today/);
    assert.equal(prompt.includes("I don't want to live"), false);
    assert.equal(prompt.includes('too heavy to hold alone'), false);
  });

  it('filters corpus first then keeps the last 8 remaining rows', () => {
    /** @type {Array<{ role: string, text: string, source?: string }>} */
    const history = [];
    for (let i = 0; i < 6; i += 1) {
      history.push({ role: 'user', text: `gen-user-${i}` });
      history.push({
        role: 'yin',
        text: `gen-yin-${i} sits quietly.`,
        source: 'generate'
      });
    }
    history.push({ role: 'user', text: 'corpus-user-a' });
    history.push({
      role: 'yin',
      text: 'Heard. If this feels too heavy to hold alone.',
      source: 'corpus'
    });
    history.push({ role: 'user', text: 'corpus-user-b' });
    history.push({
      role: 'yin',
      text: 'Heard. Yin nods quietly.',
      source: 'corpus'
    });
    const kept = historyForGeneratePrompt(history);
    assert.equal(kept.length, 8);
    assert.equal(kept[0].text, 'gen-user-2');
    assert.equal(kept[kept.length - 1].text, 'gen-yin-5 sits quietly.');
    assert.equal(
      kept.some((row) => String(row.text).includes('too heavy')),
      false
    );
    const slicedFirst = history.slice(-8);
    assert.equal(
      slicedFirst.some((row) => row.source === 'corpus'),
      true
    );
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
    const turnPushes = ui.match(/this\._l2Turns\.push\(/g) || [];
    assert.equal(turnPushes.length, 2);
    assert.match(ui, /source: shown\.source === 'generate' \? 'generate' : 'corpus'/);
    assert.match(ui, /this\._l2Turns\.slice\(\)/);
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
