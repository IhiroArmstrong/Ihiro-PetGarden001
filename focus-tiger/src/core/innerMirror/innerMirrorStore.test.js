/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CONFIDE_ROUTE } from '../confide/confideRoutes.js';
import {
  appendInnerMirrorLog,
  exportInnerMirrorDiagnostics,
  getInnerMirrorBackupSnapshot,
  getInnerMirrorCache,
  getInnerMirrorLog,
  getInnerMirrorYinSummaries,
  rememberInnerMirrorYinSummary,
  setInnerMirrorBackupSnapshot,
  setInnerMirrorDiagnosticBody
} from './innerMirrorDerivatives.js';
import { shouldShowInnerMirrorLeave } from './innerMirrorMount.js';
import {
  INNER_MIRROR_MAY_ENTER_GENERATION,
  INNER_MIRROR_STORAGE_KEY,
  correctInnerMirrorEntry,
  forgetInnerMirror,
  innerMirrorKeyPresent,
  leaveInnerMirrorEntry,
  readInnerMirrorState
} from './innerMirrorStore.js';
import { countInnerMirrorThemes } from './innerMirrorLexicon.js';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

function memoryStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => {
      map.set(k, String(v));
    },
    removeItem: (k) => {
      map.delete(k);
    }
  };
}

describe('innerMirror store', () => {
  it('does not enter generation', () => {
    assert.equal(INNER_MIRROR_MAY_ENTER_GENERATION, false);
  });

  it('Thought Drop card wires leave / forget / correct', () => {
    const ui = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), '../../ui/ConfideToYinUI.js'),
      'utf8'
    );
    assert.match(ui, /inner-mirror-leave/);
    assert.match(ui, /inner-mirror-forget/);
    assert.match(ui, /inner-mirror-correct/);
    assert.match(ui, /leaveInnerMirrorEntry/);
  });

  it('hides Leave when the freeze switch is off', () => {
    assert.equal(
      shouldShowInnerMirrorLeave({
        locale: 'en',
        widthPx: 1200,
        crisis: false
      }),
      false
    );
    assert.equal(
      shouldShowInnerMirrorLeave({
        mountEnabled: true,
        locale: 'en',
        widthPx: 1200,
        crisis: false
      }),
      true
    );
    assert.equal(
      shouldShowInnerMirrorLeave({
        mountEnabled: true,
        locale: 'ja',
        widthPx: 1200
      }),
      false
    );
    assert.equal(
      shouldShowInnerMirrorLeave({
        mountEnabled: true,
        locale: 'en',
        widthPx: 375
      }),
      false
    );
  });

  it('refuses crisis before counting', () => {
    const storage = memoryStorage();
    const crisis = leaveInnerMirrorEntry(storage, {
      text: 'I want to kill myself',
      locale: 'en'
    });
    assert.equal(crisis.ok, false);
    assert.equal(crisis.reason, 'crisis');
    assert.equal(innerMirrorKeyPresent(storage), false);
    const routed = leaveInnerMirrorEntry(storage, {
      text: 'today I am so tired',
      route: CONFIDE_ROUTE.SAFETY_REDIRECT
    });
    assert.equal(routed.ok, false);
    const counted = countInnerMirrorThemes(readInnerMirrorState(storage).entries);
    assert.equal(counted.leftCount, 0);
    for (const n of Object.values(counted.counts)) assert.equal(n, 0);
  });

  it('leaves a non-crisis line and voids a crisis replacement', () => {
    const storage = memoryStorage();
    const left = leaveInnerMirrorEntry(storage, {
      text: 'I was criticized at work',
      locale: 'en'
    });
    assert.equal(left.ok, true);
    assert.ok(left.entry.themes.includes('criticized'));
    const crisisFix = correctInnerMirrorEntry(storage, {
      id: left.entry.id,
      replacement: 'I want to kill myself',
      locale: 'en'
    });
    assert.equal(crisisFix.ok, false);
    assert.equal(crisisFix.reason, 'crisis');
    const row = readInnerMirrorState(storage).entries[0];
    assert.equal(row.themeStatus, 'void');
    assert.equal(row.replacement, undefined);
  });

  it('true-deletes six app-held surfaces', () => {
    const storage = memoryStorage();
    const left = leaveInnerMirrorEntry(storage, {
      text: 'I felt dismissed in the meeting',
      locale: 'en'
    });
    assert.equal(left.ok, true);
    const secret = left.entry.text;
    appendInnerMirrorLog(`raw:${secret}`);
    setInnerMirrorDiagnosticBody(`export ${secret}`);
    rememberInnerMirrorYinSummary(secret);
    setInnerMirrorBackupSnapshot({
      stores: { [INNER_MIRROR_STORAGE_KEY]: JSON.stringify({ entries: [left.entry] }) }
    });
    const forgotten = forgetInnerMirror(storage, { id: left.entry.id });
    assert.equal(forgotten.ok, true);
    assert.equal(innerMirrorKeyPresent(storage), false);
    assert.deepEqual(getInnerMirrorCache().entries, []);
    assert.equal(getInnerMirrorBackupSnapshot().stores[INNER_MIRROR_STORAGE_KEY], undefined);
    assert.equal(getInnerMirrorYinSummaries().includes(secret), false);
    assert.equal(exportInnerMirrorDiagnostics().includes(secret), false);
    assert.equal(getInnerMirrorLog().some((line) => line.includes(secret)), false);
  });
});
