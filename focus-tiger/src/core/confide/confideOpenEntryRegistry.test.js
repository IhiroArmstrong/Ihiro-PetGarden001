/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

import {
  CONFIDE_OPEN_ENTRY_REGISTRY,
  listConfideOpenEntries
} from './confideOpenEntryRegistry.js';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '../../..');
const confideUiSrc = readFileSync(
  join(repoRoot, 'src/ui/ConfideToYinUI.js'),
  'utf8'
);
const mainSrc = readFileSync(join(repoRoot, 'src/main.js'), 'utf8');

describe('confideOpenEntryRegistry', () => {
  it('lists unique entry ids', () => {
    const ids = listConfideOpenEntries().map((row) => row.id);
    assert.equal(new Set(ids).size, ids.length);
    assert.ok(ids.length >= 5);
  });

  it('every visible-must-feedback entry is enumerated (Plan A dead-end guard)', () => {
    const visible = CONFIDE_OPEN_ENTRY_REGISTRY.filter(
      (row) => row.policy === 'visible-must-feedback'
    );
    assert.ok(visible.some((row) => row.id === 'contemplative-inquiry-crisis'));
    for (const row of visible) {
      assert.ok(row.note.length > 10, row.id);
    }
  });

  it('ConfideToYinUI.open invokes onOpenBlocked when canOpen rejects', () => {
    assert.match(confideUiSrc, /onOpenBlocked/);
    assert.match(
      confideUiSrc,
      /if \(this\.handlers\.canOpen && !this\.handlers\.canOpen\(\)\)[\s\S]*?onOpenBlocked/
    );
  });

  it('main.js wires confide open blocked toast handler', () => {
    assert.match(mainSrc, /onOpenBlocked/);
    assert.match(mainSrc, /CONFIDE_OPEN_BLOCKED_TOAST_TESTID|confide-open-blocked-safety-help/);
    assert.match(mainSrc, /confideOpenBlockedUserMessage/);
  });

  it('contemplative inquiry crisis still routes through confideToYinUI.open', () => {
    assert.match(mainSrc, /onCrisis:[\s\S]*?confideToYinUI\.open\(\)/);
  });
});
