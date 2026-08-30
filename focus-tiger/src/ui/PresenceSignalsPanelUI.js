/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Presence Signals · view / delete panel (Slice 6).
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import { listPresencePanelRows } from '../core/presencePanelRows.js';
import {
  deleteLegacyReflectionSession,
  deletePresenceSession,
  deletePresenceSignalById,
  DELETE_PRESENCE_SIGNAL_REJECT_LINKED_BUNDLE
} from '../core/presenceSignalsDelete.js';
import {
  readPresenceFreeTextL3Consent,
  writePresenceFreeTextL3Consent,
  isPresenceFreeTextL3ReadEnabled
} from '../core/presenceFreeTextL3Consent.js';
import {
  GLASS_BLUR_CSS,
  GLASS_BORDER,
  GLASS_FILL,
  GLASS_FILL_STRONG,
  GLASS_RADIUS,
  GLASS_SHADOW
} from './glassPanelStyles.js';

const FADE_MS = 220;

export class PresenceSignalsPanelUI {
  /**
   * @param {HTMLElement} mountRoot
   * @param {object} [handlers]
   * @param {Storage | null} [handlers.storage]
   */
  constructor(mountRoot, handlers = {}) {
    this._storage =
      handlers.storage ??
      (typeof localStorage !== 'undefined' ? localStorage : null);
    this._open = false;
    this._statusText = '';

    this.root = document.createElement('div');
    this.root.id = 'presence-signals-panel';
    this.root.hidden = true;
    this.root.dataset.testid = 'presence-signals-panel';
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');

    this.titleEl = document.createElement('p');
    this.titleEl.className = 'presence-signals-panel__title';

    this.blurbEl = document.createElement('p');
    this.blurbEl.className = 'presence-signals-panel__blurb';

    this.consentWrap = document.createElement('div');
    this.consentWrap.className = 'presence-signals-panel__consent';
    this.consentWrap.dataset.testid = 'presence-freetext-l3-consent';
    this.consentWrap.hidden = true;

    this.consentText = document.createElement('p');
    this.consentAllowBtn = document.createElement('button');
    this.consentAllowBtn.type = 'button';
    this.consentDenyBtn = document.createElement('button');
    this.consentDenyBtn.type = 'button';
    this.consentAllowBtn.addEventListener('click', () => {
      writePresenceFreeTextL3Consent(this._storage, 'granted');
      this._syncConsent();
    });
    this.consentDenyBtn.addEventListener('click', () => {
      writePresenceFreeTextL3Consent(this._storage, 'denied');
      this._syncConsent();
    });
    this.consentWrap.append(this.consentText, this.consentAllowBtn, this.consentDenyBtn);

    this.listEl = document.createElement('ul');
    this.listEl.className = 'presence-signals-panel__list';
    this.listEl.dataset.testid = 'presence-signals-panel-list';

    this.emptyEl = document.createElement('p');
    this.emptyEl.className = 'presence-signals-panel__empty';
    this.emptyEl.dataset.testid = 'presence-signals-panel-empty';

    this.statusEl = document.createElement('p');
    this.statusEl.className = 'presence-signals-panel__status';
    this.statusEl.dataset.testid = 'presence-signals-panel-status';
    this.statusEl.hidden = true;

    this.closeBtn = document.createElement('button');
    this.closeBtn.type = 'button';
    this.closeBtn.className = 'presence-signals-panel__close';
    this.closeBtn.addEventListener('click', () => this.close());

    this.root.style.cssText = [
      'position:fixed',
      'left:50%',
      'bottom:18%',
      'z-index:16',
      'width:min(440px,calc(100vw - 32px))',
      'padding:16px 18px',
      GLASS_BORDER,
      `border-radius:${GLASS_RADIUS}`,
      `background:${GLASS_FILL}`,
      GLASS_BLUR_CSS,
      `box-shadow:${GLASS_SHADOW}`,
      'transform:translate(-50%, 8px)',
      `transition:opacity ${FADE_MS}ms ease,transform ${FADE_MS}ms ease`,
      'opacity:0',
      'max-height:min(70vh, calc(100dvh - 120px))',
      'overflow:auto'
    ].join(';');

    this.root.append(
      this.titleEl,
      this.blurbEl,
      this.consentWrap,
      this.listEl,
      this.emptyEl,
      this.statusEl,
      this.closeBtn
    );
    mountRoot.appendChild(this.root);
    this._unsubLocale = onLocaleChange(() => this._refreshTexts());
    this._refreshTexts();
  }

  isOpen() {
    return this._open;
  }

  open() {
    if (this._open) return;
    this._open = true;
    this.root.hidden = false;
    this._statusText = '';
    this._renderList();
    this.root.getBoundingClientRect();
    this.root.style.opacity = '1';
    this.root.style.transform = 'translate(-50%, 0)';
  }

  close() {
    if (!this._open) return;
    this._open = false;
    this.root.style.opacity = '0';
    this.root.style.transform = 'translate(-50%, 8px)';
    window.setTimeout(() => {
      if (!this._open) this.root.hidden = true;
    }, FADE_MS);
  }

  _refreshTexts() {
    this.titleEl.textContent = t('PRESENCE_SIGNALS_PANEL_TITLE');
    this.blurbEl.textContent = t('PRESENCE_SIGNALS_PANEL_BLURB');
    this.emptyEl.textContent = t('PRESENCE_SIGNALS_PANEL_EMPTY');
    this.closeBtn.textContent = t('PRESENCE_SIGNALS_PANEL_CLOSE');
    this.consentText.textContent = t('PRESENCE_FREETEXT_L3_CONSENT_PROMPT');
    this.consentAllowBtn.textContent = t('PRESENCE_FREETEXT_L3_CONSENT_ALLOW');
    this.consentDenyBtn.textContent = t('PRESENCE_FREETEXT_L3_CONSENT_DENY');
    this._syncConsent();
    if (this._open) this._renderList();
  }

  _syncConsent() {
    const readEnabled = isPresenceFreeTextL3ReadEnabled();
    const state = readPresenceFreeTextL3Consent(this._storage);
    if (!readEnabled) {
      this.consentWrap.hidden = false;
      this.consentText.textContent = t('PRESENCE_FREETEXT_L3_NOT_IN_USE');
      this.consentAllowBtn.hidden = true;
      this.consentDenyBtn.hidden = true;
      return;
    }
    this.consentAllowBtn.hidden = false;
    this.consentDenyBtn.hidden = false;
    this.consentText.textContent = t('PRESENCE_FREETEXT_L3_CONSENT_PROMPT');
    this.consentWrap.hidden = state !== 'unset';
  }

  _showStatus(key) {
    this._statusText = t(key);
    this.statusEl.textContent = this._statusText;
    this.statusEl.hidden = !this._statusText;
  }

  _renderList() {
    const rows = listPresencePanelRows(this._storage);
    this.listEl.replaceChildren();
    this.emptyEl.hidden = rows.length > 0;
    this.statusEl.hidden = !this._statusText;
    for (const row of rows) {
      const li = document.createElement('li');
      li.className = 'presence-signals-panel__row';
      li.dataset.testid = 'presence-signals-panel-row';

      const meta = document.createElement('p');
      meta.className = 'presence-signals-panel__meta';
      const kindKey =
        row.kind === 'reflection_session' || row.kind === 'legacy_reflection'
          ? 'PRESENCE_SIGNALS_PANEL_KIND_REFLECTION'
          : 'PRESENCE_SIGNALS_PANEL_KIND_OBSERVATION';
      meta.textContent = `${t(kindKey)} · ${new Date(row.sortAt).toLocaleString()}`;

      const preview = document.createElement('p');
      preview.className = 'presence-signals-panel__preview';
      preview.textContent = row.preview || '—';

      if (row.legacy) {
        const legacy = document.createElement('p');
        legacy.className = 'presence-signals-panel__legacy';
        legacy.dataset.testid = 'presence-signals-panel-legacy-hint';
        legacy.textContent = t('PRESENCE_SIGNALS_PANEL_LEGACY_HINT');
        li.append(legacy);
      }

      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'presence-signals-panel__delete';
      del.textContent = t('PRESENCE_SIGNALS_PANEL_DELETE');
      del.addEventListener('click', () => this._onDelete(row));

      li.append(meta, preview, del);
      this.listEl.appendChild(li);
    }
  }

  /**
   * @param {import('../core/presencePanelRows.js').PresencePanelRow} row
   */
  _onDelete(row) {
    let result;
    if (row.kind === 'reflection_session' && row.presenceSessionId) {
      result = deletePresenceSession(this._storage, row.presenceSessionId);
    } else if (row.kind === 'legacy_reflection' && row.bundleCreatedAt != null) {
      result = deleteLegacyReflectionSession(this._storage, row.bundleCreatedAt);
    } else if (row.signalId) {
      result = deletePresenceSignalById(this._storage, row.signalId);
      if (
        !result.ok &&
        result.reason === DELETE_PRESENCE_SIGNAL_REJECT_LINKED_BUNDLE
      ) {
        this._showStatus('PRESENCE_SIGNALS_PANEL_DELETE_LINKED_REFLECTION');
        return;
      }
    }
    if (!result?.ok) {
      this._showStatus('PRESENCE_SIGNALS_PANEL_DELETE_FAILED');
      return;
    }
    this._statusText = '';
    this._renderList();
  }
}
