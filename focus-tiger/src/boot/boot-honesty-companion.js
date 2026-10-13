/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * A7.3: Honesty / Companion picker / micro-ritual / Arrival placeholder.
 * Created before whisper / chrome helpers so those closures never TDZ.
 * `arrivalPractice` stays null until segment 7 assigns the UI.
 */

import { HonestyCheckInUI } from '../ui/HonestyCheckInUI.js';
import { CompanionModePicker } from '../ui/CompanionModePicker.js';
import { MicroRitualUI } from '../ui/MicroRitualUI.js';

export function createBootHonestyCompanionState() {
  return {
    honestyCheckInUI: /** @type {HonestyCheckInUI | null} */ (null),
    companionModePicker: /** @type {CompanionModePicker | null} */ (null),
    microRitualUI: /** @type {MicroRitualUI | null} */ (null),
    arrivalPractice: /** @type {import('../ui/ArrivalPracticeUI.js').ArrivalPracticeUI | null} */ (
      null
    )
  };
}

export function mountHonestyCheckInUI(
  state,
  overlayRoot,
  handlers = {},
  { CheckInUI = HonestyCheckInUI } = {}
) {
  state.honestyCheckInUI = new CheckInUI(overlayRoot, handlers);
  return state.honestyCheckInUI;
}

export function mountCompanionModePicker(
  state,
  overlayRoot,
  focusButton,
  handlers,
  { PickerUI = CompanionModePicker } = {}
) {
  state.companionModePicker = new PickerUI(overlayRoot, focusButton, handlers);
  return state.companionModePicker;
}

export function mountMicroRitualUI(
  state,
  overlayRoot,
  handlers,
  { RitualUI = MicroRitualUI } = {}
) {
  state.microRitualUI = new RitualUI(overlayRoot, handlers);
  return state.microRitualUI;
}
