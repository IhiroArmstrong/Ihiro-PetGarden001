/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * @param {{ isAudiblePlaying?: () => boolean } | null | undefined} ctrl
 * @returns {boolean}
 */
export function shouldOfferGuidedMeditationMusic(ctrl) {
  if (!ctrl || typeof ctrl.isAudiblePlaying !== 'function') return true;
  return !ctrl.isAudiblePlaying();
}

/**
 * Same gesture as Sit: session + preferred track without persisting enabled:true.
 * @param {{
 *   startSession?: () => void,
 *   startSittingMusic?: (opts?: object) => Promise<void>
 * } | null | undefined} ctrl
 * @returns {Promise<boolean>} true when a start was attempted
 */
export async function startGuidedMeditationEphemeralMusic(ctrl) {
  if (!ctrl) return false;
  ctrl.startSession?.();
  if (typeof ctrl.startSittingMusic !== 'function') return false;
  try {
    await ctrl.startSittingMusic();
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {boolean} ephemeralStarted
 * @param {{ endSession?: () => void } | null | undefined} ctrl
 */
export function endGuidedMeditationEphemeralMusic(ephemeralStarted, ctrl) {
  if (!ephemeralStarted || !ctrl || typeof ctrl.endSession !== 'function') return;
  ctrl.endSession();
}

/**
 * @param {{
 *   bootAmbientHints: { ambientSoundscape: object },
 *   idleChrome: { syncMuteVisual: (o: { musicOn: boolean }) => void },
 *   noteGuidedMeditationPracticeDay: (payload: object) => void,
 *   syncIdleYinTap: () => void
 * }} ctx
 */
export function createGuidedMeditationUIHandlers(ctx) {
  const {
    bootAmbientHints,
    idleChrome,
    noteGuidedMeditationPracticeDay,
    syncIdleYinTap
  } = ctx;
  const getAmbientSoundscapeUI = () => globalThis.__ambientSoundscapeUI;
  return {
    onClose: () => syncIdleYinTap(),
    onPracticeDay: (payload) => noteGuidedMeditationPracticeDay(payload),
    getAmbient: () => bootAmbientHints.ambientSoundscape,
    shouldOfferMusic: () =>
      shouldOfferGuidedMeditationMusic(bootAmbientHints.ambientSoundscape),
    onRequestMusic: async () => {
      const ctrl = bootAmbientHints.ambientSoundscape;
      const ui = getAmbientSoundscapeUI();
      if (!ui) return false;
      ui.setSessionActive(true);
      const ok = await startGuidedMeditationEphemeralMusic(ctrl);
      if (ok) {
        ui.renderAfterAudition?.();
        idleChrome.syncMuteVisual({ musicOn: ui.wantsMusicOn() });
      }
      return ok;
    },
    onReleaseEphemeralMusic: () => {
      endGuidedMeditationEphemeralMusic(
        true,
        bootAmbientHints.ambientSoundscape
      );
      const ui = getAmbientSoundscapeUI();
      if (!ui) return;
      ui.setSessionActive(false);
      ui.renderAfterAudition?.();
      idleChrome.syncMuteVisual({ musicOn: ui.wantsMusicOn() });
    }
  };
}