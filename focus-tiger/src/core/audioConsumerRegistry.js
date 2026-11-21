/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Every product sound / speech source must name which mute or TTS switch
 * gates it. Adding speakSystemTts without a row fails the census test.
 *
 * Confide reply speech stays independent of 朗读练习引导 on purpose.
 */

/**
 * @typedef {'system-tts-announcements' | 'session-cues' | 'soundscape-mute' | 'none'} AudioGateId
 *
 * @typedef {object} AudioConsumerRow
 * @property {string} id
 * @property {string} file relative to `focus-tiger/`
 * @property {AudioGateId} gate
 */

/** @type {readonly AudioConsumerRow[]} */
export const AUDIO_CONSUMERS = Object.freeze([
  Object.freeze({
    id: 'session-cues',
    file: 'src/audio/SessionCueController.js',
    gate: 'session-cues'
  }),
  Object.freeze({
    id: 'ambient-soundscape',
    file: 'src/audio/AmbientSoundscapeController.js',
    gate: 'soundscape-mute'
  }),
  Object.freeze({
    id: 'practice-announcements',
    file: 'src/core/systemTtsAnnouncements.js',
    gate: 'system-tts-announcements'
  }),
  Object.freeze({
    id: 'guided-meditation-speech',
    file: 'src/core/guidedMeditationSpeech.js',
    gate: 'system-tts-announcements'
  }),
  Object.freeze({
    id: 'help-center-tts',
    file: 'src/ui/HelpCenterUI.js',
    gate: 'none'
  }),
  Object.freeze({
    id: 'confide-reply-tts',
    file: 'src/ui/ConfideToYinUI.js',
    gate: 'none'
  }),
  Object.freeze({
    id: 'system-tts-bridge',
    file: 'src/core/systemTtsBridge.js',
    gate: 'none'
  })
]);

/** Files that may call speakSystemTts without being a product consumer. */
export const SPEAK_SYSTEM_TTS_INFRA_FILES = Object.freeze([
  'src/core/systemTtsBridge.js',
  'src/core/systemTtsBridge.test.js',
  'src/core/systemTtsAnnouncements.test.js',
  'src/core/guidedMeditationSpeech.test.js'
]);
