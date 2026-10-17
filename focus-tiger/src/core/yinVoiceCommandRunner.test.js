/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { YIN_VOICE_BACKUP_MISSED_KEY } from './yinVoiceCommandEntry.js';
import { runYinVoiceCommand } from './yinVoiceCommandRunner.js';

const backup = {
  channel: 'command',
  command: 'backup',
  tier: 'B',
  execute: false,
  raw: 'Hi Yin, please backup',
  display: 'Hi Yin, please backup'
};

describe('T10 backup runner', () => {
  it('does not listen until the recap has finished', async () => {
    let releaseSpeech;
    const speech = new Promise((resolve) => {
      releaseSpeech = resolve;
    });
    let listened = false;
    const running = runYinVoiceCommand(backup, {
      show() {},
      speakAndWait: () => speech.then(() => true),
      listen: async (ms) => {
        listened = true;
        assert.equal(ms, 10_000);
        return '';
      },
      writeBackup: async () => {
        throw new Error('wrote too early');
      },
      openJourney() {},
      closeJourney() {},
      switchLanguage: () => ({ changed: false, undo() {} })
    });
    await Promise.resolve();
    assert.equal(listened, false);
    releaseSpeech();
    await running;
    assert.equal(listened, true);
  });

  it('speaks the missed line on timeout and does not write', async () => {
    const said = [];
    let writes = 0;
    await runYinVoiceCommand(backup, {
      show(_user, key) {
        said.push(key);
      },
      speakAndWait: async () => true,
      listen: async () => '',
      writeBackup: async () => {
        writes += 1;
      },
      openJourney() {},
      closeJourney() {},
      switchLanguage: () => ({ changed: false, undo() {} })
    });
    assert.equal(writes, 0);
    assert.equal(said.at(-1), YIN_VOICE_BACKUP_MISSED_KEY);
  });

  it('writes only after Yes', async () => {
    let writes = 0;
    await runYinVoiceCommand(backup, {
      show() {},
      speakAndWait: async () => true,
      listen: async () => 'Yes',
      writeBackup: async () => {
        writes += 1;
      },
      openJourney() {},
      closeJourney() {},
      switchLanguage: () => ({ changed: false, undo() {} })
    });
    assert.equal(writes, 1);
  });
});

describe('T10 A-tier undo and C-tier wipe', () => {
  it('asks the language switch to return to English', async () => {
    let target = 'unset';
    await runYinVoiceCommand(
      { ...backup, command: 'switch_language', targetLocale: 'en' },
      {
        show() {},
        speakAndWait: async () => false,
        listen: async () => '',
        writeBackup: async () => {},
        openJourney() {},
        closeJourney() {},
        switchLanguage: (locale) => {
          target = locale;
          return { changed: false, undo() {} };
        }
      }
    );
    assert.equal(target, 'en');
  });

  it('reverts language within 5 seconds', async () => {
    let undone = false;
    let listenMs = 0;
    await runYinVoiceCommand(
      { ...backup, command: 'switch_language' },
      {
        show() {},
        speakAndWait: async () => true,
        listen: async (ms) => {
          listenMs = ms;
          return 'Cancel';
        },
        writeBackup: async () => {},
        openJourney() {},
        closeJourney() {},
        switchLanguage: () => ({
          changed: true,
          undo() {
            undone = true;
          }
        })
      }
    );
    assert.equal(listenMs, 5_000);
    assert.equal(undone, true);
  });

  it('does not erase when the forget confirmation is spoken', async () => {
    const said = [];
    await runYinVoiceCommand(
      { ...backup, command: 'forget_all' },
      {
        show(_user, key) {
          said.push(key);
        },
        speakAndWait: async () => true,
        listen: async () => 'Yes, forget everything',
        writeBackup: async () => {
          throw new Error('backup');
        },
        openJourney() {},
        closeJourney() {},
        switchLanguage: () => ({ changed: false, undo() {} })
      }
    );
    assert.equal(said.at(-1), 'YIN_VOICE_FORGET_HEARD_NOT_ERASED');
  });
});
