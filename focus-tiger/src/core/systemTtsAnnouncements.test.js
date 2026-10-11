/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { maybeSpeakFocusEndAnnouncement, maybeSpeakPracticeAnnouncement, resetPracticeAnnouncementCue } from './systemTtsAnnouncements.js';
import { SYSTEM_TTS_PREF_STORAGE_KEY } from './systemTtsPreference.js';

/**
 * @param {Record<string, string>} [seed]
 */
function memoryStorage(seed = {}) {
  const data = { ...seed };
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null;
    },
    setItem(key, value) {
      data[key] = String(value);
    }
  };
}

// Dispatch is chained behind a stop request now (see speakSystemTts), so the
// speak call lands one microtask after the synchronous "did we dispatch" return.
test('focus end announcement requires global switch and desktop wide bridge', async () => {
  let spoke = false;
  const globalObj = {
    desktopShell: {
      isDesktop: true,
      systemTts: {
        speak() {
          spoke = true;
        }
      }
    }
  };
  const storage = memoryStorage();
  assert.equal(
    maybeSpeakFocusEndAnnouncement({
      widthPx: 480,
      storage,
      globalObj
    }),
    false
  );
  storage.setItem(
    SYSTEM_TTS_PREF_STORAGE_KEY,
    JSON.stringify({ announcementsEnabled: true })
  );
  assert.equal(
    maybeSpeakFocusEndAnnouncement({
      widthPx: 480,
      storage,
      globalObj
    }),
    true
  );
  await Promise.resolve();
  assert.equal(spoke, true);
});

test('focus end announcement stays off on narrow viewport', async () => {
  let spoke = false;
  const globalObj = {
    desktopShell: {
      isDesktop: true,
      systemTts: {
        speak() {
          spoke = true;
        }
      }
    }
  };
  const storage = memoryStorage({
    [SYSTEM_TTS_PREF_STORAGE_KEY]: JSON.stringify({
      announcementsEnabled: true
    })
  });
  assert.equal(
    maybeSpeakFocusEndAnnouncement({
      widthPx: 479,
      storage,
      globalObj
    }),
    false
  );
  await Promise.resolve();
  assert.equal(spoke, false);
});

test('practice line needs the switch, and the same cue is not repeated until reset', async () => {
  let spoken = [];
  const globalObj = {
    desktopShell: {
      isDesktop: true,
      systemTts: {
        speak({ text }) {
          spoken.push(text);
        }
      }
    }
  };
  const storage = memoryStorage();
  resetPracticeAnnouncementCue();
  assert.equal(
    maybeSpeakPracticeAnnouncement({
      text: 'Let the eyes land on what is actually here.',
      cueId: 'RESET_LOOK_INTRO',
      widthPx: 480,
      storage,
      globalObj
    }),
    false
  );
  storage.setItem(
    SYSTEM_TTS_PREF_STORAGE_KEY,
    JSON.stringify({ announcementsEnabled: true })
  );
  assert.equal(
    maybeSpeakPracticeAnnouncement({
      text: 'Let the eyes land on what is actually here.',
      cueId: 'RESET_LOOK_INTRO',
      widthPx: 480,
      storage,
      globalObj
    }),
    true
  );
  assert.equal(
    maybeSpeakPracticeAnnouncement({
      text: 'Let the eyes land on what is actually here.',
      cueId: 'RESET_LOOK_INTRO',
      widthPx: 480,
      storage,
      globalObj
    }),
    false
  );
  resetPracticeAnnouncementCue();
  assert.equal(
    maybeSpeakPracticeAnnouncement({
      text: 'Let the eyes land on what is actually here.',
      cueId: 'RESET_LOOK_INTRO',
      widthPx: 480,
      storage,
      globalObj
    }),
    true
  );
  await Promise.resolve();
  assert.equal(spoken.length, 2);
});
