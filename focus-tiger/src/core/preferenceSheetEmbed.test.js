/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PREFERENCE_SHEET_EMBED_PROXIES,
  PREF_SHEET_BACK_GLYPH,
  applyPreferenceSheetBackButton,
  shouldEmbedPreferenceInSheet
} from './preferenceSheetEmbed.js';

describe('preferenceSheetEmbed', () => {
  it('embeds glass preference cards and leaves payment / sound / help out', () => {
    assert.equal(shouldEmbedPreferenceInSheet('reminder'), true);
    assert.equal(shouldEmbedPreferenceInSheet('co-practice-contract'), true);
    assert.equal(shouldEmbedPreferenceInSheet('local-backup'), true);
    assert.equal(shouldEmbedPreferenceInSheet('sound'), false);
    assert.equal(shouldEmbedPreferenceInSheet('help-center'), false);
    assert.equal(shouldEmbedPreferenceInSheet('membership'), false);
    assert.equal(shouldEmbedPreferenceInSheet('today-direction'), false);
    assert.equal(shouldEmbedPreferenceInSheet('always-on-top'), false);
    assert.ok(PREFERENCE_SHEET_EMBED_PROXIES.includes('language'));
  });

  it('shows a back arrow with localized aria-label', () => {
    /** @type {{ textContent: string, attrs: Record<string, string>, setAttribute: (k: string, v: string) => void, getAttribute: (k: string) => string | null }} */
    const btn = {
      textContent: '',
      attrs: {},
      setAttribute(k, v) {
        this.attrs[k] = v;
      },
      getAttribute(k) {
        return this.attrs[k] ?? null;
      }
    };
    applyPreferenceSheetBackButton(btn, 'Back to Preferences');
    assert.equal(btn.textContent, PREF_SHEET_BACK_GLYPH);
    assert.equal(btn.getAttribute('aria-label'), 'Back to Preferences');
  });

  it('wide and narrow sheets skip closeMenu for embed rows', () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const wide = readFileSync(join(here, '../ui/WideIdleMoreMenu.js'), 'utf8');
    const narrow = readFileSync(join(here, '../ui/NarrowIdleShell.js'), 'utf8');
    assert.match(wide, /shouldEmbedPreferenceInSheet/);
    assert.match(wide, /_enterPreferencePage/);
    assert.match(wide, /applyPreferenceSheetBackButton/);
    assert.match(narrow, /shouldEmbedPreferenceInSheet/);
    assert.match(narrow, /_enterPreferencePage/);
    assert.match(narrow, /applyPreferenceSheetBackButton/);
    assert.match(wide, /ft-pref-sheet-back/);
    assert.match(narrow, /ft-pref-sheet-back/);
  });
});
