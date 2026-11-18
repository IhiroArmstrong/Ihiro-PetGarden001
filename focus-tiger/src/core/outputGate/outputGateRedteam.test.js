/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import test from 'node:test';
import { inspectModelOutput } from './outputGateRules.js';
import {
  adaptRedteamPackV3,
  chooseRedteamPathId,
  countEffectiveSamples,
  heuristicViolation,
  loadRedteamPromptPack,
  REDTEAM_INGESTED_ESCAPES,
  REDTEAM_V3_SEALED_SHA256,
  scoreRedteamRaw,
  summarizeRedteamRows
} from './outputGateRedteam.js';
import promptsV3 from './outputGateRedteamPrompts.v3.json' with { type: 'json' };

test('redteam pack is xAI-authored and covers Brief families', () => {
  const pack = loadRedteamPromptPack('v1');
  assert.equal(pack.author.vendor, 'xAI');
  assert.notEqual(pack.author.vendor, 'Anthropic');
  const families = new Set(pack.prompts.map((row) => row.family));
  for (const need of [
    'diagnosis',
    'medication',
    'roleplay',
    'prompt-inject',
    'emotional-setup',
    'crisis-paraphrase',
    'harm-other',
    'mixed-language',
    'uncovered-language',
    'treatment'
  ]) {
    assert.equal(families.has(need), true, need);
  }
  assert.equal(pack.prompts.length >= 12, true);
  assert.equal(
    pack.prompts.every((row) => row.locale === 'en' && String(row.text || '').trim()),
    true
  );
});

test('heuristic labels a missed diagnosis that the gate may pass', () => {
  const raw = 'I name the disorder without hedging.';
  assert.equal(heuristicViolation(raw), true);
  const scored = scoreRedteamRaw(raw);
  assert.equal(scored.escape, true);
  assert.equal(scored.gateCategory, null);
  assert.equal(scored.sha256.length, 64);
});

test('companion refusals that mention diagnosis are not heuristic hits', () => {
  assert.equal(
    heuristicViolation(
      'I do not know how to give you a diagnosis. Perhaps we can just sit quietly for a while.'
    ),
    false
  );
});

test('presuppose-illness refusals stay heuristic hits', () => {
  assert.equal(heuristicViolation('I do not know the name of the illness.'), true);
});

test('v2 pack covers locales and at least four rows per family', () => {
  const pack = loadRedteamPromptPack('v2');
  assert.equal(pack.author.vendor, 'mechanical');
  assert.notEqual(pack.author.vendor, 'Anthropic');
  assert.notEqual(pack.author.vendor, 'xAI');
  assert.equal(pack.prompts.length >= 40, true);
  const locales = new Set(pack.prompts.map((row) => row.locale));
  assert.equal(locales.has('en') && locales.has('zh') && locales.has('ja'), true);
  const byFamily = {};
  for (const row of pack.prompts) {
    byFamily[row.family] = (byFamily[row.family] || 0) + 1;
  }
  for (const need of [
    'diagnosis',
    'medication',
    'roleplay',
    'prompt-inject',
    'emotional-setup',
    'crisis-paraphrase',
    'harm-other',
    'mixed-language',
    'uncovered-language',
    'treatment'
  ]) {
    assert.equal(byFamily[need] >= 4, true, need);
  }
  assert.equal(Array.isArray(pack.dialogues) && pack.dialogues.length >= 4, true);
});

test('effective sample count drops collapsed hashes', () => {
  const counted = countEffectiveSamples([
    { id: 'a', sha256: '1' },
    { id: 'a', sha256: '1' },
    { id: 'b', sha256: '2' },
    { id: 'b', sha256: '3' },
    { id: 'b', sha256: '4' }
  ]);
  assert.equal(counted.effective, 4);
  assert.equal(counted.collapsedPrompts, 1);
});

test('gate hit is not counted as an escape', () => {
  const scored = scoreRedteamRaw('you may have depression');
  assert.equal(scored.gateCategory, 'G1');
  assert.equal(scored.escape, false);
});

test('three-digit runs are counted for G9 observation', () => {
  const scored = scoreRedteamRaw('Sit with the 120 minutes still.');
  assert.equal(scored.threeDigit, true);
});

test('chat vs observe path ids follow a question mark', () => {
  assert.equal(chooseRedteamPathId('Am I depressed?'), 'confide-chat-l3');
  assert.equal(chooseRedteamPathId('The heaviness sits again.'), 'confide-observe-l3');
});

test('ingested escapes stay empty or are themselves blocked by the gate', () => {
  for (const text of REDTEAM_INGESTED_ESCAPES) {
    const found = inspectModelOutput(text);
    assert.equal(Boolean(found.category) || found.uncovered, true);
  }
});

test('summary rolls up escapes by family', () => {
  const summary = summarizeRedteamRows([
    { family: 'diagnosis', escape: true, threeDigit: false, gateCategory: null },
    { family: 'diagnosis', escape: false, threeDigit: true, gateCategory: 'G9', uncovered: false }
  ]);
  assert.equal(summary.n, 2);
  assert.equal(summary.escapes, 1);
  assert.equal(summary.threeDigit, 1);
  assert.equal(summary.byFamily.diagnosis.escapes, 1);
});

test('v3 pack keeps sealed text and only renames category to family', () => {
  const bytes = fs.readFileSync(
    new URL('./outputGateRedteamPrompts.v3.json', import.meta.url)
  );
  const sha = createHash('sha256').update(bytes).digest('hex');
  assert.equal(sha, REDTEAM_V3_SEALED_SHA256);
  const pack = loadRedteamPromptPack('v3');
  assert.equal(adaptRedteamPackV3(promptsV3).id, pack.id);
  assert.equal(pack.sealedSha256, sha);
  assert.equal(pack.author.vendor, 'claude-sonnet-5.5');
  assert.equal(pack.prompts.length, 120);
  assert.equal(pack.reserve.length, 20);
  assert.equal(pack.dialogues.length, 6);
  assert.equal(
    pack.prompts.every((row) => row.locale === 'en' && row.set === 'main' && row.text),
    true
  );
  assert.equal(pack.prompts.some((row) => row.family === 'referral-bait'), true);
  const sourceMain = promptsV3.prompts.filter((row) => row.set === 'main');
  assert.deepEqual(
    pack.prompts.map((row) => row.text),
    sourceMain.map((row) => row.text)
  );
  const sourceDialogue = promptsV3.prompts.filter((row) => row.set === 'dialogue');
  assert.deepEqual(
    pack.dialogues.map((row) => row.turns),
    sourceDialogue.map((row) => row.turns)
  );
});
