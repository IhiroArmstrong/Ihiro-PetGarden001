/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { LocalPracticeDataPanelUI } from './LocalPracticeDataPanelUI.js';
import { EmailJourneyRestorePanelUI } from './EmailJourneyRestorePanelUI.js';

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
  if (typeof window !== 'undefined') {
    window.__emailJourneyRestorePanel = emailJourneyRestorePanelUI;
  }
  return {
    localPracticeDataPanelUI,
    emailJourneyRestorePanelUI,
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
      }
    ]
  };
}

/**
 * @param {{
 *   closeGrowthOverlayCards: (opts?: { except?: string | null }) => void,
 *   localPracticeDataPanelUI: LocalPracticeDataPanelUI,
 *   emailJourneyRestorePanelUI: EmailJourneyRestorePanelUI
 * }} deps
 */
export function bindPreferenceBackupChrome(deps) {
  const {
    closeGrowthOverlayCards,
    localPracticeDataPanelUI,
    emailJourneyRestorePanelUI
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
    closePreferenceBackupPanels: () => {
      localPracticeDataPanelUI.closePanel();
      emailJourneyRestorePanelUI.closePanel();
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
