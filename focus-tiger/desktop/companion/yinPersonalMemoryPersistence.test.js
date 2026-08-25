/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import {
  readYinPersonalMemoryState,
  rememberYinPersonalMemoryFromConfide,
  setYinPersonalMemoryConsent,
  yinPersonalMemoryFilePath
} from './yinPersonalMemoryPersistence.js';

test('persistence writes userData companion-l2 json', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'ft-yin-memory-'));
  const next = await setYinPersonalMemoryConsent(dir, true);
  assert.equal(next.consent, 'granted');
  const filePath = yinPersonalMemoryFilePath(dir);
  const raw = JSON.parse(await readFile(filePath, 'utf8'));
  assert.equal(raw.consent, 'granted');
  const roundTrip = await readYinPersonalMemoryState(dir);
  assert.equal(roundTrip.consent, 'granted');
  assert.deepEqual(roundTrip.memories, []);
});

test('rememberFromConfide persists active memory when consented', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'ft-yin-memory-'));
  await setYinPersonalMemoryConsent(dir, true);
  const next = await rememberYinPersonalMemoryFromConfide(dir, {
    userText: 'I prefer quiet, short reflections.',
    route: 'fallback',
    replySource: 'generate',
    turnOrdinal: 1,
    nowIso: '2026-08-25T12:00:00.000Z'
  });
  assert.equal(next.memories.length, 1);
  assert.equal(next.memories[0].status, 'active');
  assert.equal(next.memories[0].sourceRoute, 'confide_fallback');
  const roundTrip = await readYinPersonalMemoryState(dir);
  assert.equal(roundTrip.memories.length, 1);
});
