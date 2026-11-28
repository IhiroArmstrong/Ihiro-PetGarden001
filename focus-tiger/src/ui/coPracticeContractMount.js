/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Shared DOM for T63 co-practice contract rows (Preferences panel host).
 */

import { t } from '../locales/i18n.js';
import {
  GLASS_BORDER,
  GLASS_FILL_STRONG
} from './glassPanelStyles.js';
import {
  buildCoPracticeContractRows,
  CO_PRACTICE_CONTRACT_ROW_IDS
} from '../core/coPracticeContractSurface.js';
import {
  isYinAdaptationEnabled,
  setYinAdaptationEnabled
} from '../core/yinAdaptationStore.js';
import { getStorage } from '../utils/Storage.js';
import { mountEveningPracticeFactsControls } from './eveningPracticeFactsControls.js';

/**
 * @param {{ key: string, params?: Record<string, string> }} status
 * @returns {string}
 */
function formatContractStatus(status) {
  let text = t(status.key);
  if (status.params?.time) {
    text = text.replaceAll('{time}', status.params.time);
  }
  if (status.params?.date) {
    text = text.replaceAll('{date}', status.params.date);
  }
  if (status.params?.n) {
    text = text.replaceAll('{n}', status.params.n);
  }
  return text;
}

/**
 * @param {HTMLElement} host
 * @param {object} [handlers]
 * @param {() => void} [handlers.onOpenReminderSettings]
 * @param {() => void} [handlers.onOpenWorkEndSettings]
 * @param {() => void} [handlers.onOpenPrivacySettings]
 * @param {() => Storage | null} [handlers.getStorage]
 * @param {() => void} [handlers.onChanged]
 * @param {number} [handlers.now]
 */
export function mountCoPracticeContractSurface(host, handlers = {}) {
  host.replaceChildren();
  const storage = handlers.getStorage?.() ?? getStorage();
  const rows = buildCoPracticeContractRows({
    storage,
    now: handlers.now ?? Date.now()
  });

  const intro = document.createElement('p');
  intro.className = 'co-practice-contract__intro';
  intro.textContent = t('CO_PRACTICE_CONTRACT_INTRO');
  host.appendChild(intro);

  for (const row of rows) {
    const line = document.createElement('div');
    line.className = 'co-practice-contract__row ft-pref-row';
    line.dataset.rowId = row.id;

    const copy = document.createElement('div');
    copy.className = 'ft-pref-row__copy';

    const label = document.createElement('p');
    label.className = 'co-practice-contract__label ft-pref-row__title';
    label.textContent = t(row.labelKey);
    copy.appendChild(label);

    if (row.hintKey) {
      const hint = document.createElement('p');
      hint.className = 'co-practice-contract__hint ft-pref-row__hint';
      hint.textContent = t(row.hintKey);
      copy.appendChild(hint);
    }

    const trail = document.createElement('div');
    trail.className = 'ft-pref-row__trail';
    if (row.id === CO_PRACTICE_CONTRACT_ROW_IDS.ADAPTATION) {
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'ft-pref-row__switch';
      toggle.dataset.testid = 'yin-adaptation-toggle';
      const on = isYinAdaptationEnabled();
      toggle.dataset.on = on ? '1' : '0';
      toggle.setAttribute('role', 'switch');
      toggle.setAttribute('aria-checked', on ? 'true' : 'false');
      toggle.setAttribute(
        'aria-label',
        t('YIN_ADAPTATION_TOGGLE_LABEL')
      );
      toggle.addEventListener('click', () => {
        setYinAdaptationEnabled(!isYinAdaptationEnabled());
        handlers.onChanged?.();
      });
      trail.appendChild(toggle);
    }
    const status = document.createElement('p');
    status.className = 'co-practice-contract__status ft-pref-row__status';
    status.textContent = formatContractStatus(row.status);
    trail.appendChild(status);

    if (row.action && row.actionKey) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'co-practice-contract__action ft-pref-inline-action';
      btn.dataset.testid = `co-practice-contract-action-${row.id}`;
      btn.textContent = t(row.actionKey);
      btn.addEventListener('click', () => {
        if (row.action === 'reminder') {
          handlers.onOpenReminderSettings?.();
        } else if (row.action === 'work-end') {
          handlers.onOpenWorkEndSettings?.();
        } else if (row.action === 'privacy') {
          handlers.onOpenPrivacySettings?.();
        }
      });
      trail.appendChild(btn);
    }

    line.append(copy, trail);

    host.appendChild(line);
  }

  const eveningHost = document.createElement('div');
  mountEveningPracticeFactsControls(eveningHost, {
    getStorage: () => storage,
    onChanged: () => handlers.onChanged?.()
  });
  host.appendChild(eveningHost);
}

export const CO_PRACTICE_CONTRACT_PANEL_STYLE_ID = 'co-practice-contract-panel-styles-v1';

/** Inject once; shared by Preferences panel. */
export function injectCoPracticeContractPanelStyles() {
  if (document.getElementById(CO_PRACTICE_CONTRACT_PANEL_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = CO_PRACTICE_CONTRACT_PANEL_STYLE_ID;
  style.textContent = `
    .co-practice-contract__intro {
      margin: 0 0 8px;
    }
    .co-practice-contract__intro,
    .co-practice-contract__label,
    .co-practice-contract__status,
    .co-practice-contract__hint {
      margin: 0;
      font-size: 0.92rem;
      line-height: 1.45;
    }
    .co-practice-contract__intro,
    .co-practice-contract__hint {
      opacity: 0.88;
    }
    .co-practice-contract__row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid rgba(80, 55, 30, 0.12);
    }
    .co-practice-contract__row.ft-pref-row .ft-pref-row__copy {
      flex: 1 1 auto;
    }
    .co-practice-contract__row.ft-pref-row .ft-pref-row__trail {
      flex: 0 0 auto;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 6px;
      text-align: right;
    }
    .co-practice-contract__action.ft-pref-inline-action,
    .co-practice-contract__evening .co-practice-contract__action {
      appearance: none;
      margin: 0;
      padding: 6px 12px;
      border-radius: 10px;
      border: ${GLASS_BORDER};
      background: ${GLASS_FILL_STRONG};
      color: rgba(44, 31, 20, 0.92);
      font: inherit;
      font-size: 0.8125rem;
      font-weight: 600;
      line-height: 1.25;
      cursor: pointer;
      box-shadow: 0 1px 0 rgba(255, 255, 255, 0.65) inset;
      transition: background 160ms ease, transform 160ms ease;
    }
    .co-practice-contract__action.ft-pref-inline-action:hover,
    .co-practice-contract__evening .co-practice-contract__action:hover {
      background: rgba(255, 252, 245, 0.92);
    }
    .co-practice-contract__action.ft-pref-inline-action:active,
    .co-practice-contract__evening .co-practice-contract__action:active {
      transform: scale(0.97);
    }
    .co-practice-contract__action.ft-pref-inline-action:focus-visible,
    .co-practice-contract__evening .co-practice-contract__action:focus-visible {
      outline: 2px solid rgba(181, 98, 58, 0.55);
      outline-offset: 2px;
    }
    .co-practice-contract__evening {
      margin-top: 16px;
      padding-top: 12px;
      border-top: 1px solid rgba(80, 55, 30, 0.12);
    }
    .co-practice-contract__evening-toggle {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      margin: 8px 0;
      cursor: pointer;
    }
    .co-practice-contract__row .ft-pref-row__switch {
      flex: 0 0 auto;
      width: 38px;
      height: 22px;
      margin: 0 0 6px auto;
      padding: 0;
      border: 0;
      border-radius: 999px;
      background: rgba(139, 115, 85, 0.22);
      position: relative;
      cursor: pointer;
    }
    .co-practice-contract__row .ft-pref-row__switch::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #fff;
    }
    .co-practice-contract__row .ft-pref-row__switch[data-on="1"] {
      background: #7d9a6a;
    }
    .co-practice-contract__row .ft-pref-row__switch[data-on="1"]::after {
      transform: translateX(16px);
    }
  `;
  document.head.appendChild(style);
}