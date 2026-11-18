/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Shared DOM for T63 co-practice contract rows (Preferences panel host).
 */

import { t } from '../locales/i18n.js';
import { buildCoPracticeContractRows } from '../core/coPracticeContractSurface.js';
import { getStorage } from '../utils/Storage.js';

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
 * @param {number} [handlers.now]
 */
export function mountCoPracticeContractSurface(host, handlers = {}) {
  host.replaceChildren();
  const storage = handlers.getStorage?.() ?? getStorage();
  const rows = buildCoPracticeContractRows({
    storage,
    now: handlers.now ?? Date.now()
  });

  const heading = document.createElement('p');
  heading.className = 'co-practice-contract__title';
  heading.textContent = t('CO_PRACTICE_CONTRACT_TITLE');
  host.appendChild(heading);

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
    const status = document.createElement('p');
    status.className = 'co-practice-contract__status ft-pref-row__status';
    status.textContent = formatContractStatus(row.status);
    trail.appendChild(status);

    line.append(copy, trail);

    if (row.action && row.actionKey) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'co-practice-contract__action';
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
      line.appendChild(btn);
    }

    host.appendChild(line);
  }
}

export const CO_PRACTICE_CONTRACT_PANEL_STYLE_ID = 'co-practice-contract-panel-styles-v1';

/** Inject once; shared by Preferences panel. */
export function injectCoPracticeContractPanelStyles() {
  if (document.getElementById(CO_PRACTICE_CONTRACT_PANEL_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = CO_PRACTICE_CONTRACT_PANEL_STYLE_ID;
  style.textContent = `
    .co-practice-contract__title {
      font-weight: 600;
      margin: 0 0 6px;
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
      text-align: right;
    }
    .co-practice-contract__action {
      margin-top: 8px;
      cursor: pointer;
    }
  `;
  document.head.appendChild(style);
}