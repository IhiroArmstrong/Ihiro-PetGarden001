/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { resolveConfideHelpEntryEnabled } from './confideHelpEntryGate.js';
import {
  buildConfideHelpEntryDailyRecord,
  recordConfideHelpEntryOpen
} from './confideHelpEntryTelemetry.js';
import { formatConfideSafetyResourceGuidance } from './confideSafetyResources.js';

describe('confide help entry (CR-46 P3)', () => {
  it('help entry is on by default and FT_CONFIDE_HELP_ENTRY=off hides', () => {
    assert.equal(resolveConfideHelpEntryEnabled({}), true);
    assert.equal(resolveConfideHelpEntryEnabled({ FT_CONFIDE_HELP_ENTRY: 'off' }), false);
  });

  it('resource panel reuses safety-01 guidance in three locales', () => {
    const en = formatConfideSafetyResourceGuidance('en');
    assert.match(en, /crisis line/i);
    assert.match(formatConfideSafetyResourceGuidance('zh'), /热线|专业帮助/);
    assert.match(formatConfideSafetyResourceGuidance('ja'), /相談窓口/);
  });

  it('daily click log has no text field', () => {
    const storage = {
      /** @type {string | null} */
      value: null,
      getItem() {
        return this.value;
      },
      setItem(_key, next) {
        this.value = next;
      }
    };
    const row = recordConfideHelpEntryOpen(storage, 'zh', () => new Date('2026-10-16T12:00:00Z'));
    assert.equal(row.kind, 'confide_help_entry_daily');
    assert.equal(row.locale, 'zh');
    assert.equal(typeof row.at, 'string');
    assert.ok(row.count >= 1);
    assert.equal(Object.hasOwn(row, 'text'), false);
    assert.equal(Object.hasOwn(row, 'raw'), false);
    const frozen = buildConfideHelpEntryDailyRecord({ at: '2026-10-16', count: 2, locale: 'en' });
    assert.deepEqual(Object.keys(frozen).sort(), ['at', 'count', 'kind', 'locale']);
  });
});
