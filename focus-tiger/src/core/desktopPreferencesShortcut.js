/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * macOS ⌘+, → open the same Preferences entry as ⋯ menu group first item.
 */

import { shouldOfferLanguagePicker } from '../locales/localePreference.js';
import { isDesktopShellRuntime } from './desktopShell.js';
import { hasSubmittedNewsletter } from './newsletter/newsletterCaptureGate.js';

/**
 * Mirrors ⋯ → Preferences group order in `idleChromeOrchestration.js`.
 *
 * @param {{
 *   reminderAvailable?: boolean,
 *   languagePickerAvailable?: boolean,
 *   newsletterSubmitted?: boolean
 * }} [deps]
 * @returns {'reminder' | 'language' | 'newsletter' | 'local-backup'}
 */
export function resolvePrimaryPreferenceProxy(deps = {}) {
  const reminderAvailable =
    deps.reminderAvailable ??
    Boolean(
      typeof document !== 'undefined' &&
        document.getElementById('reminder-preference-toggle')
    );
  const languagePickerAvailable =
    deps.languagePickerAvailable ?? shouldOfferLanguagePicker();
  const newsletterSubmitted =
    deps.newsletterSubmitted ?? hasSubmittedNewsletter();

  if (reminderAvailable) return 'reminder';
  if (languagePickerAvailable) return 'language';
  if (!newsletterSubmitted) return 'newsletter';
  return 'local-backup';
}

/**
 * @param {{ onOpen: (proxy: ReturnType<typeof resolvePrimaryPreferenceProxy>) => void }} options
 * @returns {() => void}
 */
export function bindDesktopPreferencesShortcut({ onOpen }) {
  if (!isDesktopShellRuntime()) return () => {};
  const shell = globalThis.desktopShell;
  if (!shell || typeof shell.onOpenPreferences !== 'function') return () => {};
  const unsub = shell.onOpenPreferences(() => {
    onOpen(resolvePrimaryPreferenceProxy());
  });
  return typeof unsub === 'function' ? unsub : () => {};
}
