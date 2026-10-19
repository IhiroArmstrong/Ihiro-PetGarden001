/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { applyVoiceProductLexicon } from './voiceProductLexicon.js';
import { shouldSubmitConfideOnEnter } from './confide/confideEnterSend.js';
import {
  YIN_VOICE_BACKUP_CONFIRM_LISTEN_MS,
  YIN_VOICE_BACKUP_MISSED_KEY,
  YIN_VOICE_LANGUAGE_UNDO_MS,
  backupConfirmWindow,
  classifyYinVoiceConfirmReply,
  classifyYinVoiceEntry,
  nextPickerLocaleId
} from './yinVoiceCommandEntry.js';

describe('T10 address latch on the raw transcript', () => {
  it('keeps ordinary Confide on the send path', () => {
    for (const text of [
      'I feel tired',
      'I had a rough day',
      'please backup my day',
      'I am in the garden',
      'I want to forget all of this',
      "I don't want to practice anymore",
      'Hi Yin, I feel tired',
      'Hi Yin, I had a rough day'
    ]) {
      const decision = classifyYinVoiceEntry(text, { enabled: true });
      assert.equal(decision.channel, 'confide', text);
      assert.notEqual(decision.command, 'backup');
    }
  });

  it('does not treat Ian as Yin when the lexicon would', () => {
    const raw = 'Hi Ian, please backup all the app data for me';
    assert.match(applyVoiceProductLexicon(raw), /Yin/);
    const fromRaw = classifyYinVoiceEntry(raw, { enabled: true });
    assert.equal(fromRaw.channel, 'confide');
    assert.equal(fromRaw.reason, 'no_address');
    const fromCorrected = classifyYinVoiceEntry(applyVoiceProductLexicon(raw), {
      enabled: true
    });
    assert.equal(fromCorrected.command, 'backup');
  });

  it('opens backup only as an unexecuted B-tier confirm', () => {
    const decision = classifyYinVoiceEntry(
      'Hi Yin, please backup all the app data for me.',
      { enabled: true }
    );
    assert.equal(decision.channel, 'command');
    assert.equal(decision.command, 'backup');
    assert.equal(decision.tier, 'B');
    assert.equal(decision.execute, false);
  });

  it('sends forget-everything to C and does not back up', () => {
    const decision = classifyYinVoiceEntry('Hi Yin, please forget everything', {
      enabled: true
    });
    assert.equal(decision.command, 'forget_all');
    assert.equal(decision.tier, 'C');
    assert.equal(decision.execute, false);
  });

  it('does not start a sit from an address', () => {
    const decision = classifyYinVoiceEntry(
      'Hi Yin, please start a 5 minute sit',
      { enabled: true }
    );
    assert.equal(decision.channel, 'confide');
  });

  it('switches back to English from the spoken phrase on any UI language', () => {
    const decision = classifyYinVoiceEntry('Hi Yin, please switch back to English', {
      enabled: true
    });
    assert.equal(decision.command, 'switch_language');
    assert.equal(decision.targetLocale, 'en');
    assert.equal(nextPickerLocaleId('en', ['en', 'ja']), 'ja');
    assert.equal(nextPickerLocaleId('ja', ['en', 'ja']), 'en');
  });

  it('stays on Confide when the English desktop gate is closed', () => {
    const decision = classifyYinVoiceEntry('Hi Yin, please backup', {
      enabled: false
    });
    assert.equal(decision.channel, 'confide');
    assert.equal(decision.reason, 'gate_closed');
  });

  it('leaves Enter-to-send unchanged', () => {
    assert.equal(shouldSubmitConfideOnEnter({ key: 'Enter' }), true);
    assert.equal(shouldSubmitConfideOnEnter({ key: 'Enter', shiftKey: true }), false);
  });
});

describe('T10 confirm windows', () => {
  it('keeps the language undo at 5 seconds and the backup listen at 10', () => {
    assert.equal(YIN_VOICE_LANGUAGE_UNDO_MS, 5_000);
    assert.equal(YIN_VOICE_BACKUP_CONFIRM_LISTEN_MS, 10_000);
  });

  it('does not open the backup listen window before the recap finishes', () => {
    assert.deepEqual(backupConfirmWindow(null, 10_000), {
      open: false,
      timedOut: false
    });
  });

  it('opens for 10 seconds after speech ends, then times out', () => {
    const ended = 1_000;
    assert.equal(backupConfirmWindow(ended, ended).open, true);
    assert.equal(backupConfirmWindow(ended, ended + 9_999).open, true);
    assert.equal(backupConfirmWindow(ended, ended + 10_000).timedOut, true);
  });

  it('locks the missed-backup sentence in the locale slice', () => {
    const slice = JSON.parse(
      readFileSync(
        new URL('../locales/slices/yin-voice-command-entry.json', import.meta.url),
        'utf8'
      )
    );
    assert.equal(slice.zh[YIN_VOICE_BACKUP_MISSED_KEY], '没听到，这次先不备份');
    assert.match(slice.en[YIN_VOICE_BACKUP_MISSED_KEY], /won't back up/i);
    assert.ok(slice.ja[YIN_VOICE_BACKUP_MISSED_KEY]);
    assert.ok(slice.en.YIN_VOICE_CONFIRM_LISTENING);
    assert.ok(slice.zh.YIN_VOICE_CONFIRM_LISTENING);
    assert.notEqual(
      slice.ja[YIN_VOICE_BACKUP_MISSED_KEY],
      slice.en[YIN_VOICE_BACKUP_MISSED_KEY]
    );
  });
});

describe('T10 confirm replies', () => {
  it('accepts Yes and OK, and treats Cancel as no', () => {
    assert.equal(classifyYinVoiceConfirmReply('Yes'), 'yes');
    assert.equal(classifyYinVoiceConfirmReply('OK'), 'yes');
    assert.equal(classifyYinVoiceConfirmReply('Please do it'), 'yes');
    assert.equal(classifyYinVoiceConfirmReply('Go ahead'), 'yes');
    assert.equal(classifyYinVoiceConfirmReply('Yeah'), 'yes');
    assert.equal(classifyYinVoiceConfirmReply('Yes please'), 'yes');
    assert.equal(classifyYinVoiceConfirmReply('Cancel'), 'no');
    assert.equal(classifyYinVoiceConfirmReply('Never mind'), 'no');
    assert.equal(classifyYinVoiceConfirmReply(''), 'empty');
  });

  it('does not treat a backup Yes as permission to wipe', () => {
    assert.equal(classifyYinVoiceConfirmReply('Yes'), 'yes');
    assert.notEqual(classifyYinVoiceConfirmReply('Yes'), 'forget_confirm');
    assert.equal(
      classifyYinVoiceConfirmReply('Yes, forget everything'),
      'forget_confirm'
    );
  });
});
