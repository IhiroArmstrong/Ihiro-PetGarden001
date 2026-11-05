/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  isSamatiaScanLineWhitelisted,
  scanSamatiaA2UserFacingResiduals,
  scanSamatiaBUserFacingResiduals,
  scanSamatiaCUserFacingResiduals,
  scanSamatiaDUserFacingResiduals
} from './samatiaUserFacingResidualScan.js';
import { DESKTOP_DISPLAY_NAME } from '../../desktop/trayPolicy.js';
import desktopPackage from '../../desktop/package.json' with { type: 'json' };
import { retrieveProductKnowledge } from './confide/confideProductKnowledge.js';
import productKnowledgeCatalog from './confide/productKnowledgeCatalog.json' with { type: 'json' };

const focusTigerRoot = path.join(fileURLToPath(new URL('.', import.meta.url)), '..', '..');

test('T87-A2: whitelists copyright header and internal plan ids', () => {
  assert.equal(
    isSamatiaScanLineWhitelisted(
      ' * Focus Tiger™ is a product of Twinsology.'
    ),
    true
  );
  assert.equal(isSamatiaScanLineWhitelisted("  planId: 'focus-tiger-pro',"), true);
  assert.equal(
    isSamatiaScanLineWhitelisted('Focus practice usually means attention'),
    true
  );
});

test('T87-A2: A2 scan paths have no legacy public product name', () => {
  const hits = scanSamatiaA2UserFacingResiduals(focusTigerRoot);
  assert.deepEqual(
    hits,
    [],
    hits.map((h) => `${h.file}:${h.line} ${h.snippet}`).join('\n')
  );
});

test('T87-A2: Confide KB baseline — same ids, answers say Samatia not Focus Tiger', () => {
  const localAi = retrieveProductKnowledge('local AI browser');
  assert.equal(localAi.hit, true);
  assert.equal(localAi.id, 'KB-FUNC-0017');
  assert.match(String(localAi.text || ''), /Samatia/);
  assert.doesNotMatch(String(localAi.text || ''), /Focus Tiger/);

  const voice = retrieveProductKnowledge('speak instead of tap');
  assert.equal(voice.hit, true);
  assert.equal(voice.id, 'KB-FUNC-0039');
  assert.match(String(voice.text || ''), /Samatia/);
  assert.doesNotMatch(String(voice.text || ''), /Focus Tiger/);

  const edu = retrieveProductKnowledge('focus vs meditation');
  assert.equal(edu.hit, true);
  assert.equal(edu.id, 'KB-EDU-0003');
  assert.match(String(edu.text || ''), /Samatia/);
  assert.doesNotMatch(String(edu.text || ''), /Focus Tiger/);

  const kb39 = productKnowledgeCatalog.entries.find((e) => e.id === 'KB-FUNC-0039');
  assert.ok(kb39);
  assert.match(String(kb39.shortAnswerEn || ''), /Samatia/);
  assert.doesNotMatch(String(kb39.shortAnswerEn || ''), /Focus Tiger/);
});

test('T87-B: Electron productName, appId, and tray display name are Samatia', () => {
  assert.equal(desktopPackage.build.productName, 'Samatia');
  assert.equal(desktopPackage.build.appId, 'com.twinsology.samatia');
  assert.equal(DESKTOP_DISPLAY_NAME, 'Samatia');
  assert.equal(DESKTOP_DISPLAY_NAME, desktopPackage.build.productName);
});

test('T87-B: A2 + Electron display scan has no legacy public product name', () => {
  const hits = scanSamatiaBUserFacingResiduals(focusTigerRoot);
  assert.deepEqual(
    hits,
    [],
    hits.map((h) => `${h.file}:${h.line} ${h.snippet}`).join('\n')
  );
});

test('T87-C: marketing HTML and store listings have no legacy public product name', () => {
  const hits = scanSamatiaCUserFacingResiduals(focusTigerRoot);
  assert.deepEqual(
    hits,
    [],
    hits.map((h) => `${h.file}:${h.line} ${h.snippet}`).join('\n')
  );
});

test('T87-D: Checkout hardcoded copy scan has no legacy public product name', () => {
  const hits = scanSamatiaDUserFacingResiduals(focusTigerRoot);
  assert.deepEqual(
    hits,
    [],
    hits.map((h) => `${h.file}:${h.line} ${h.snippet}`).join('\n')
  );
});
