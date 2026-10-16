/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { Z } from '../src/ui/zIndexLayers.js';
import {
  collectZIndexLiterals,
  evaluateZIndexLiterals,
  parseRegistryZValues,
  runZIndexLiteralCheck
} from './z-index-literal-check.js';

test('out-of-table z-index digits fail even with an exemption cap', () => {
  const result = evaluateZIndexLiterals({
    checkModuleRegistry: false,
    scanTargets: ['src/ui/x.js'],
    registryMarkdown: '| **17** | `src/ui/x.js` | dim |\n',
    exemptions: [{ file: 'src/ui/x.js', maxHits: 9, reason: 'test' }],
    readFile: () => 'root.style.zIndex = 9999;\n'
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((err) => /9999 is not in Z_INDEX.md/.test(err)));
});

test('in-table literals fail unless the file is exempt', () => {
  const result = evaluateZIndexLiterals({
    checkModuleRegistry: false,
    scanTargets: ['src/ui/x.js'],
    registryMarkdown: '| **17** | `src/ui/x.js` | dim |\n',
    exemptions: [],
    readFile: () => 'zIndex: 17,\n'
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((err) => /must use Z\.\*/.test(err)));
});

test('exempt in-table literals pass at the cap', () => {
  const result = evaluateZIndexLiterals({
    checkModuleRegistry: false,
    scanTargets: ['index.html'],
    registryMarkdown: '| **17** | `index.html` | overlay |\n',
    exemptions: [{ file: 'index.html', maxHits: 1, reason: 'shell' }],
    readFile: () => '#ui-overlay { z-index: 17; }\n'
  });
  assert.equal(result.ok, true, result.errors.join('; '));
});

test('collectZIndexLiterals ignores comment lines', () => {
  const hits = collectZIndexLiterals(`
    // z-index: 999
    * z-index: 888
    z-index: 17;
  `);
  assert.equal(hits.length, 1);
  assert.equal(hits[0].value, 17);
});

test('Z_INDEX.md appendix is not a product allocation', () => {
  const values = parseRegistryZValues(`
| **17** | src/ui/x.js | dim |
## 附录 · 非产品运行时
| **10000** | e2e | test shield |
`);
  assert.equal(values.has(17), true);
  assert.equal(values.has(10000), false);
});

test('protected stack order is encoded in Z', () => {
  assert.ok(Z.GLASS_CARD_FRONT < Z.SUPPORT_DIM);
  assert.ok(Z.SUPPORT_DIM < Z.SUPPORT_MODAL);
  assert.ok(Z.SUPPORT_MODAL < Z.SANCTUARY_CARD);
  assert.equal(Z.SUPPORT_DIM, 25);
  assert.equal(Z.SUPPORT_MODAL, 26);
});

test('live product tree matches exemption caps', () => {
  assert.equal(runZIndexLiteralCheck(), true);
});

test('Lit hint bubble interpolates z via unsafeCSS so the module can load', async () => {
  const mod = await import('../src/ui/ft-onboarding-hint-bubble.js');
  assert.equal(typeof mod.FtOnboardingHintBubble, 'function');
});
