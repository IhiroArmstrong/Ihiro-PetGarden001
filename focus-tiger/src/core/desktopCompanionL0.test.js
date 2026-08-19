/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import {
  L0_LOW_SPEC_TOTAL_MEM_MB,
  L0_MODEL_ID,
  L0_MODEL_URL,
  L0_MODEL_URLS,
  L0_RAF_P95_DELTA_FAIL_MS,
  L0_TOK_S_FAIL,
  L0_TTFT_FAIL_MS,
  isLowSpecDesktopMemory
} from '../../desktop/companion/l0Config.js';
import { parseNdjsonLine } from '../../desktop/companion/l0Main.js';
import {
  evaluateL0Verdict,
  rssMb,
  summarizeFrameIntervals,
  tokensPerSecond
} from '../../desktop/companion/l0Metrics.js';
import { rafSamplerSource } from '../../desktop/companion/l0Raf.js';

const here = dirname(fileURLToPath(import.meta.url));
const focusTigerRoot = join(here, '../..');

/**
 * @param {string} dir
 * @param {(file: string) => boolean} [keep]
 * @returns {string[]}
 */
function walkFiles(dir, keep) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walkFiles(p, keep));
    else if (!keep || keep(p)) out.push(p);
  }
  return out;
}

describe('desktop companion L0 metrics', () => {
  it('converts RSS bytes to one-decimal MiB', () => {
    assert.equal(rssMb(0), 0);
    assert.equal(rssMb(1024 * 1024), 1);
    assert.equal(rssMb(1.55 * 1024 * 1024), 1.6);
    assert.equal(rssMb(-1), 0);
  });

  it('computes tokens per second', () => {
    assert.equal(tokensPerSecond(10, 1000), 10);
    assert.equal(tokensPerSecond(0, 1000), 0);
    assert.equal(tokensPerSecond(8, 0), 0);
  });

  it('summarizes rAF intervals with a p95', () => {
    const empty = summarizeFrameIntervals([]);
    assert.equal(empty.count, 0);
    const row = summarizeFrameIntervals([16, 16, 17, 40, 16]);
    assert.equal(row.count, 5);
    assert.equal(row.maxMs, 40);
    assert.ok(row.p95Ms >= 16);
  });

  it('treats 8GB-class machines as low-spec and 16GB as not', () => {
    assert.equal(L0_LOW_SPEC_TOTAL_MEM_MB, 8704);
    assert.equal(isLowSpecDesktopMemory(8 * 1024 * 1024 * 1024), true);
    assert.equal(isLowSpecDesktopMemory(7.8 * 1024 * 1024 * 1024), true);
    assert.equal(isLowSpecDesktopMemory(16 * 1024 * 1024 * 1024), false);
    assert.equal(isLowSpecDesktopMemory(0), true);
    assert.equal(isLowSpecDesktopMemory(Number.NaN), true);
  });

  it('fails the probe on load error, slow TTFT, slow decode, or rAF hitch', () => {
    assert.deepEqual(evaluateL0Verdict({}).ok, true);
    assert.equal(evaluateL0Verdict({ loadError: 'native' }).fails.includes('load_error'), true);
    assert.equal(
      evaluateL0Verdict({ ttftMs: L0_TTFT_FAIL_MS + 1 }).fails.includes('ttft_over_3s'),
      true
    );
    assert.equal(
      evaluateL0Verdict({ tokensPerSec: L0_TOK_S_FAIL - 0.1 }).fails.includes('too_slow'),
      true
    );
    assert.equal(
      evaluateL0Verdict({
        rafP95DeltaMs: L0_RAF_P95_DELTA_FAIL_MS + 1
      }).fails.includes('raf_regression'),
      true
    );
    assert.equal(
      evaluateL0Verdict({
        ttftMs: 800,
        tokensPerSec: 20,
        rafP95DeltaMs: 2
      }).ok,
      true
    );
  });
});

describe('desktop companion L0 isolation', () => {
  it('keeps the starting candidate on Hugging Face GGUF, not a chat API', () => {
    assert.equal(L0_MODEL_ID, 'Qwen3-0.6B-Q4_K_M');
    assert.match(L0_MODEL_URL, /huggingface\.co/);
    assert.match(L0_MODEL_URL, /Qwen3-0\.6B/);
    assert.match(L0_MODEL_URL, /\.gguf$/);
    assert.equal(L0_MODEL_URLS[0], L0_MODEL_URL);
    assert.ok(L0_MODEL_URLS.length >= 1);
  });

  it('parses child NDJSON and ignores junk lines', () => {
    assert.equal(parseNdjsonLine(''), null);
    assert.equal(parseNdjsonLine('not-json'), null);
    assert.deepEqual(parseNdjsonLine('{"event":"ready"}\n'), { event: 'ready' });
  });

  it('samples frames via requestAnimationFrame, not a product IPC', () => {
    assert.match(rafSamplerSource(2500), /requestAnimationFrame/);
    assert.match(rafSamplerSource(2500), /2500/);
  });

  it('does not put node-llama-cpp on the product package.json', () => {
    const product = JSON.parse(readFileSync(join(focusTigerRoot, 'package.json'), 'utf8'));
    assert.equal(product.dependencies?.['node-llama-cpp'], undefined);
    assert.equal(product.devDependencies?.['node-llama-cpp'], undefined);
  });

  it('keeps llama as a desktop-only dependency and out of the Step A DMG file list', () => {
    const desktop = JSON.parse(
      readFileSync(join(focusTigerRoot, 'desktop/package.json'), 'utf8')
    );
    assert.ok(desktop.dependencies?.['node-llama-cpp']);
    assert.ok(desktop.scripts['companion:l0']);
    const files = desktop.build.files;
    assert.equal(
      files.some((row) => typeof row === 'string' && row.includes('companion')),
      false
    );
  });

  it('does not expose a companion API on preload', () => {
    const preload = readFileSync(join(focusTigerRoot, 'desktop/preload.js'), 'utf8');
    assert.equal(/companion/i.test(preload), false);
    assert.match(preload, /openExternal/);
  });

  it('gates the probe behind FT_COMPANION_L0 in main, then starts Step B tray', () => {
    const mainSrc = readFileSync(join(focusTigerRoot, 'desktop/main.js'), 'utf8');
    assert.match(mainSrc, /FT_COMPANION_L0/);
    assert.match(mainSrc, /companion\/l0Main\.js/);
    assert.match(mainSrc, /\bnew Tray\b/);
    const whenReady = mainSrc.slice(mainSrc.indexOf('app.whenReady()'));
    const probeIdx = whenReady.indexOf('FT_COMPANION_L0');
    const trayCallIdx = whenReady.indexOf('createTray();');
    assert.ok(probeIdx >= 0 && trayCallIdx > probeIdx);
  });

  it('keeps product src/ from importing desktop/companion', () => {
    const srcRoot = join(focusTigerRoot, 'src');
    const files = walkFiles(srcRoot, (file) => file.endsWith('.js') && !file.endsWith('.test.js'));
    for (const file of files) {
      const src = readFileSync(file, 'utf8');
      assert.equal(
        src.includes('desktop/companion'),
        false,
        `${file} must not import desktop/companion`
      );
    }
  });
});
