/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { LocalPracticeDataPanelUI } from './LocalPracticeDataPanelUI.js';
import { EmailJourneyRestorePanelUI } from './EmailJourneyRestorePanelUI.js';
import { CoPracticeContractPanelUI } from './CoPracticeContractPanelUI.js';

export { mountEmailJourneyD4Chrome } from './emailJourneyD4Chrome.js';

/**
 * @param {ReturnType<typeof bindPreferenceBackupChrome>} preferenceBackupChrome
 * @param {{
 *   reminderPreferenceUI: { openPanel: () => void },
 *   workEndPreferenceUI?: { openPanel?: () => void },
 *   bootAmbientHints: { onboardingHints?: { openPrivacySheetForSettings?: () => void } }
 * }} runtime
 */
export function wireCoPracticeContractRuntime(preferenceBackupChrome, runtime) {
  preferenceBackupChrome.wireCoPracticeContractOpeners({
    onOpenReminderSettings: () => runtime.reminderPreferenceUI.openPanel(),
    onOpenWorkEndSettings: () => runtime.workEndPreferenceUI?.openPanel?.(),
    onOpenPrivacySettings: () =>
      runtime.bootAmbientHints.onboardingHints?.openPrivacySheetForSettings?.()
  });
}

/**
 * Preferences file backup + email restore. Lives outside main.js so D3
 * does not raise the architecture line cap.
 *
 * @param {HTMLElement} mountRoot
 */
export function createPreferenceBackupPanels(mountRoot) {
  const localPracticeDataPanelUI = new LocalPracticeDataPanelUI(mountRoot, {
    onClose: () => {
      document.body.classList.remove('ft-narrow-stage-local-backup');
      document.body.classList.remove('ft-wide-stage-local-backup');
    }
  });
  const emailJourneyRestorePanelUI = new EmailJourneyRestorePanelUI(mountRoot, {
    onClose: () => {
      document.body.classList.remove('ft-narrow-stage-email-journey');
      document.body.classList.remove('ft-wide-stage-email-journey');
    }
  });
  const coPracticeContractPanelUI = new CoPracticeContractPanelUI(mountRoot, {
    onClose: () => {
      document.body.classList.remove('ft-narrow-stage-co-practice-contract');
      document.body.classList.remove('ft-wide-stage-co-practice-contract');
    }
  });
  if (typeof window !== 'undefined') {
    window.__emailJourneyRestorePanel = emailJourneyRestorePanelUI;
    window.__coPracticeContractPanel = coPracticeContractPanelUI;
  }
  return {
    localPracticeDataPanelUI,
    emailJourneyRestorePanelUI,
    coPracticeContractPanelUI,
    overlayCards: [
      {
        id: 'local-backup',
        ui: localPracticeDataPanelUI,
        close: () => localPracticeDataPanelUI.closePanel()
      },
      {
        id: 'email-journey-restore',
        ui: emailJourneyRestorePanelUI,
        close: () => emailJourneyRestorePanelUI.closePanel()
      },
      {
        id: 'co-practice-contract',
        ui: coPracticeContractPanelUI,
        close: () => coPracticeContractPanelUI.closePanel()
      }
    ]
  };
}

/**
 * @param {{
 *   closeGrowthOverlayCards: (opts?: { except?: string | null }) => void,
 *   localPracticeDataPanelUI: LocalPracticeDataPanelUI,
 *   emailJourneyRestorePanelUI: EmailJourneyRestorePanelUI,
 *   coPracticeContractPanelUI: CoPracticeContractPanelUI,
 * }} deps
 */
export function bindPreferenceBackupChrome(deps) {
  const {
    closeGrowthOverlayCards,
    localPracticeDataPanelUI,
    emailJourneyRestorePanelUI,
    coPracticeContractPanelUI
  } = deps;
  return {
    onLocalBackup: () => {
      closeGrowthOverlayCards({ except: 'local-backup' });
      localPracticeDataPanelUI.openPanel();
    },
    onAccount: () => {
      closeGrowthOverlayCards({ except: 'email-journey-restore' });
      emailJourneyRestorePanelUI.openPanel();
    },
    onCoPracticeContract: () => {
      closeGrowthOverlayCards({ except: 'co-practice-contract' });
      document.body.classList.add('ft-narrow-stage-co-practice-contract');
      document.body.classList.add('ft-wide-stage-co-practice-contract');
      coPracticeContractPanelUI.openPanel();
    },
    closePreferenceBackupPanels: () => {
      localPracticeDataPanelUI.closePanel();
      emailJourneyRestorePanelUI.closePanel();
      coPracticeContractPanelUI.closePanel();
    },
    /**
     * @param {{ onOpenReminderSettings?: () => void, onOpenWorkEndSettings?: () => void, onOpenPrivacySettings?: () => void }} openers
     */
    wireCoPracticeContractOpeners(openers) {
      coPracticeContractPanelUI.setSettingsOpeners(openers);
    },
    /**
     * @param {string} proxy
     * @returns {boolean}
     */
    onDesktopShortcut: (proxy) => {
      if (proxy === 'local-backup') {
        closeGrowthOverlayCards({ except: 'local-backup' });
        localPracticeDataPanelUI.openPanel();
        return true;
      }
      if (proxy === 'account') {
        closeGrowthOverlayCards({ except: 'email-journey-restore' });
        emailJourneyRestorePanelUI.openPanel();
        return true;
      }
      return false;
    }
  };
}