/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import {
  DESKTOP_CUSTOM_ORIGIN,
  isAllowedCloudApiPath,
  isAllowedExternalUrl
} from '../../desktop/ipcGuard.js';

const desktopPkg = JSON.parse(
  readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), '../../desktop/package.json'),
    'utf8'
  )
);

const mainSrc = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '../../desktop/main.js'),
  'utf8'
);

describe('desktop packaging contract (Step A)', () => {
  it('keeps electron out of the product package.json', () => {
    const product = JSON.parse(
      readFileSync(
        join(dirname(fileURLToPath(import.meta.url)), '../../package.json'),
        'utf8'
      )
    );
    assert.equal(product.dependencies?.electron, undefined);
    assert.equal(product.devDependencies?.electron, undefined);
    assert.equal(product.dependencies?.['electron-builder'], undefined);
    assert.equal(product.dependencies?.['node-llama-cpp'], undefined);
    assert.equal(product.devDependencies?.['node-llama-cpp'], undefined);
  });

  it('puts sprites and audio in extraResources, not asar', () => {
    const extra = desktopPkg.build.extraResources;
    assert.ok(Array.isArray(extra));
    assert.ok(extra.some((row) => row.to === 'sprites' && row.from.includes('public/sprites')));
    assert.ok(extra.some((row) => row.to === 'audio' && row.from.includes('public/audio')));
    const distFilter = desktopPkg.build.files.find(
      (row) => row && row.to === 'dist' && Array.isArray(row.filter)
    );
    assert.ok(distFilter.filter.includes('!sprites/**'));
    assert.ok(distFilter.filter.includes('!audio/**'));
  });

  it('Step A main process does not create a Tray', () => {
    assert.equal(/new Tray\b/.test(mainSrc), false);
    assert.equal(/\bimport\s*\{[^}]*\bTray\b/.test(mainSrc), false);
  });

  it('Step A quits when the last window closes', () => {
    assert.match(mainSrc, /window-all-closed/);
    assert.match(mainSrc, /app\.quit\(\)/);
  });

  it('cloud IPC returns a status envelope instead of throwing Error fields', () => {
    assert.match(mainSrc, /ok:\s*false/);
    assert.match(mainSrc, /ok:\s*true/);
  });

  it('uses a stable custom origin', () => {
    assert.equal(DESKTOP_CUSTOM_ORIGIN, 'focus-tiger://app');
    assert.match(mainSrc, /DESKTOP_CUSTOM_ORIGIN/);
    assert.match(mainSrc, /\$\{DESKTOP_CUSTOM_ORIGIN\}/);
  });
});

describe('desktop IPC allowlists', () => {
  it('allows /api/ POSTs and blocks traversal', () => {
    assert.equal(isAllowedCloudApiPath('/api/create-tip-checkout-session'), true);
    assert.equal(isAllowedCloudApiPath('/api/practice-backup/put'), true);
    assert.equal(isAllowedCloudApiPath('/api/restore/request-otp'), true);
    assert.equal(isAllowedCloudApiPath('/secret'), false);
    assert.equal(isAllowedCloudApiPath('/api/../etc/passwd'), false);
    assert.equal(isAllowedCloudApiPath(null), false);
  });

  it('allows https externals and loopback http only', () => {
    assert.equal(isAllowedExternalUrl('https://checkout.stripe.com/c/pay/x'), true);
    assert.equal(isAllowedExternalUrl('http://127.0.0.1:4242/ok'), true);
    assert.equal(isAllowedExternalUrl('http://evil.example/phish'), false);
    assert.equal(isAllowedExternalUrl('file:///tmp/x'), false);
  });
});
