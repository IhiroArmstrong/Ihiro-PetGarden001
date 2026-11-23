/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T62 evening-facts consent controls (Preferences host).
 */

import { t } from '../locales/i18n.js';
import {
  clearEveningPracticeFactsLedger,
  readEveningFactsConsent,
  setEveningPracticeFactsConsent
} from '../core/eveningPracticeFacts.js';

/**
 * @param {HTMLElement} host
 * @param {{
 *   getStorage?: () => Storage | null,
 *   onChanged?: () => void
 * }} [handlers]
 */
export function mountEveningPracticeFactsControls(host, handlers = {}) {
  const storage = handlers.getStorage?.() ?? null;
  const consent = readEveningFactsConsent(storage);
  host.replaceChildren();

  const wrap = document.createElement('div');
  wrap.className = 'co-practice-contract__evening';
  wrap.dataset.testid = 'practice-paper-evening-controls';

  const disclosure = document.createElement('p');
  disclosure.className = 'co-practice-contract__hint ft-pref-row__hint';
  disclosure.dataset.testid = 'practice-paper-evening-disclosure';
  disclosure.textContent = t('PRACTICE_PAPER_EVENING_DISCLOSURE');
  wrap.appendChild(disclosure);

  const label = document.createElement('label');
  label.className = 'co-practice-contract__evening-toggle';
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = consent.enabled;
  input.dataset.testid = 'practice-paper-evening-consent';
  const labelText = document.createElement('span');
  labelText.textContent = t('PRACTICE_PAPER_EVENING_CONSENT_LABEL');
  label.append(input, labelText);
  wrap.appendChild(label);

  const confirmBtn = document.createElement('button');
  confirmBtn.type = 'button';
  confirmBtn.className = 'co-practice-contract__action';
  confirmBtn.dataset.testid = 'practice-paper-evening-confirm';
  confirmBtn.textContent = t('PRACTICE_PAPER_EVENING_CONFIRM');
  confirmBtn.hidden = true;
  confirmBtn.addEventListener('click', () => {
    if (!setEveningPracticeFactsConsent(storage, true)) return;
    handlers.onChanged?.();
  });
  wrap.appendChild(confirmBtn);

  input.addEventListener('change', () => {
    if (input.checked && !consent.enabled) {
      input.checked = false;
      confirmBtn.hidden = false;
      confirmBtn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      return;
    }
    if (!input.checked && consent.enabled) {
      if (!setEveningPracticeFactsConsent(storage, false)) {
        input.checked = true;
        return;
      }
      confirmBtn.hidden = true;
      handlers.onChanged?.();
    }
  });

  if (consent.enabled) {
    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'co-practice-contract__action';
    clearBtn.dataset.testid = 'practice-paper-evening-clear';
    clearBtn.textContent = t('PRACTICE_PAPER_EVENING_CLEAR');
    clearBtn.addEventListener('click', () => {
      if (!clearEveningPracticeFactsLedger(storage)) return;
      handlers.onChanged?.();
    });
    wrap.appendChild(clearBtn);
  }

  host.appendChild(wrap);
}
