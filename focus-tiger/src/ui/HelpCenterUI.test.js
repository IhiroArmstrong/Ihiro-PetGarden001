/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, 'HelpCenterUI.js'), 'utf8');

test('HelpCenterUI registers active press feedback on topic buttons', () => {
  assert.match(src, /\.help-center__topic:active/);
});

test('HelpCenterUI mounts T22 ask-card anchors on the index view', () => {
  assert.match(src, /help-center-ask-input/);
  assert.match(src, /help-center-ask-submit/);
  assert.match(src, /help-center-ask-empty/);
  assert.match(src, /help-center-ask-card-/);
  assert.doesNotMatch(src, /onTranscriptCommitted:\s*\(\)\s*=>\s*void this\._submitAsk/);
});

test('HelpCenterUI mounts T34 operating confirm anchors and does not auto-search on transcript', () => {
  assert.match(src, /help-center-operating/);
  assert.match(src, /help-center-operating-confirm/);
  assert.match(src, /help-center-operating-cancel/);
  assert.match(src, /resolveHelpCenterAskSubmitPolicy/);
  assert.match(src, /runYinVoiceCommand/);
});

test('HelpCenterUI chrome re-open keeps the current view', () => {
  const openAt = src.indexOf('  open({ resume = false } = {})');
  assert.ok(openAt >= 0);
  const openFn = src.slice(openAt, src.indexOf('  close() {', openAt));
  assert.match(openFn, /if \(!resume\) this\._showIndex\(\)/);
  assert.match(openFn, /pushOverlayEscapeLayer/);
});

test('HelpCenterUI docks with the T41/T42 wide secondary rule', () => {
  assert.match(src, /wideSecondaryDockCss\('#help-center'\)/);
  assert.match(src, /wideSecondaryDockPlacement/);
  assert.match(src, /dataset\.dock/);
});

test('help center close hides the card in the same turn as the click', () => {
  const closeAt = src.indexOf('  close() {');
  const closeFn = src.slice(closeAt, src.indexOf('  _showIndex() {', closeAt));
  assert.match(closeFn, /_cancelOperatingListen/);
  assert.match(closeFn, /this\.root\.hidden = true/);
  assert.match(closeFn, /hideOverlayBackdrop\(this\.backdrop, \{ fadeMs: FADE_MS \}\)/);
  assert.doesNotMatch(closeFn, /hideOverlayBackdrop\(this\.backdrop, FADE_MS/);
});
