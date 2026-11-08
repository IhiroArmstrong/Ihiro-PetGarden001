/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T82 S2 — Settings › Practice Study consent card (independent of Privacy T54).
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  grantCoPracticeResearchConsent,
  hasCoPracticeResearchConsent,
  readCoPracticeResearchConsent
} from '../core/coPracticeResearchConsent.js';
import { buildCoPracticeResearchConsentPreviewJson } from '../core/coPracticeResearchUpload.js';
import { revokeCoPracticeResearchAndDeleteRemote } from '../core/coPracticeResearchUpload.js';
import {
  GLASS_BLUR_CSS,
  GLASS_BORDER,
  GLASS_FILL,
  GLASS_RADIUS,
  GLASS_SHADOW
} from './glassPanelStyles.js';
import { Z } from './zIndexLayers.js';

const STYLE_ID = 'practice-study-consent-panel-ui-v1';
const FADE_MS = 220;
const PREVIEW_STUDY_ID = '00000000-0000-4000-8000-00000000c0de';

/**
 * @param {{ adult?: boolean, layer1?: boolean }} opts
 */
export function canEnrollCoPracticeResearch(opts = {}) {
  return opts.adult === true && opts.layer1 === true;
}

export class PracticeStudyConsentPanelUI {
  /**
   * @param {HTMLElement} mountRoot
   * @param {object} [handlers]
   * @param {() => void} [handlers.onOpen]
   * @param {() => void} [handlers.onClose]
   */
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    this._open = false;
    this._joinPending = false;
    this._leavePending = false;

    this.root = document.createElement('div');
    this.root.id = 'practice-study-consent-panel';
    this.root.className = 'practice-study-consent-panel';
    this.root.hidden = true;
    this.root.dataset.testid = 'practice-study-consent-panel';
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');

    this.titleEl = document.createElement('p');
    this.titleEl.className = 'practice-study-consent-panel__title';
    this.titleEl.dataset.testid = 'practice-study-consent-title';

    this.introEl = document.createElement('p');
    this.introEl.className = 'practice-study-consent-panel__body';

    this.collectHeading = document.createElement('p');
    this.collectHeading.className = 'practice-study-consent-panel__subhead';
    this.collectBody = document.createElement('p');
    this.collectBody.className = 'practice-study-consent-panel__body';

    this.neverHeading = document.createElement('p');
    this.neverHeading.className = 'practice-study-consent-panel__subhead';
    this.neverBody = document.createElement('p');
    this.neverBody.className = 'practice-study-consent-panel__body';

    this.sampleHeading = document.createElement('p');
    this.sampleHeading.className = 'practice-study-consent-panel__subhead';

    this.samplePre = document.createElement('pre');
    this.samplePre.className = 'practice-study-consent-panel__sample';
    this.samplePre.dataset.testid = 'practice-study-consent-sample-json';

    this.enrolledEl = document.createElement('p');
    this.enrolledEl.className = 'practice-study-consent-panel__enrolled';
    this.enrolledEl.dataset.testid = 'practice-study-consent-enrolled';
    this.enrolledEl.hidden = true;

    this.checksWrap = document.createElement('div');
    this.checksWrap.className = 'practice-study-consent-panel__checks';
    this.checksWrap.dataset.testid = 'practice-study-consent-checks';

    this.adultCheck = this._makeCheck('practice-study-adult-check', 'practice-study-adult');
    this.layer1Check = this._makeCheck(
      'practice-study-layer1-check',
      'practice-study-layer1'
    );

    this.statusEl = document.createElement('p');
    this.statusEl.className = 'practice-study-consent-panel__status';
    this.statusEl.setAttribute('role', 'status');
    this.statusEl.setAttribute('aria-live', 'polite');

    this.actions = document.createElement('div');
    this.actions.className = 'practice-study-consent-panel__actions';

    this.joinBtn = document.createElement('button');
    this.joinBtn.type = 'button';
    this.joinBtn.className = 'practice-study-consent-panel__btn practice-study-consent-panel__btn--primary';
    this.joinBtn.dataset.testid = 'practice-study-join';
    this.joinBtn.addEventListener('click', () => void this._onJoin());

    this.notNowBtn = document.createElement('button');
    this.notNowBtn.type = 'button';
    this.notNowBtn.className = 'practice-study-consent-panel__btn';
    this.notNowBtn.dataset.testid = 'practice-study-not-now';
    this.notNowBtn.addEventListener('click', () => this.closePanel());

    this.leaveBtn = document.createElement('button');
    this.leaveBtn.type = 'button';
    this.leaveBtn.className = 'practice-study-consent-panel__btn';
    this.leaveBtn.dataset.testid = 'practice-study-leave';
    this.leaveBtn.hidden = true;
    this.leaveBtn.addEventListener('click', () => void this._onLeave());

    this.closeBtn = document.createElement('button');
    this.closeBtn.type = 'button';
    this.closeBtn.className = 'practice-study-consent-panel__close';
    this.closeBtn.dataset.testid = 'practice-study-close';
    this.closeBtn.addEventListener('click', () => this.closePanel());

    this.checksWrap.append(this.adultCheck.label, this.layer1Check.label);
    this.actions.append(this.joinBtn, this.notNowBtn, this.leaveBtn);

    this.root.append(
      this.titleEl,
      this.introEl,
      this.collectHeading,
      this.collectBody,
      this.neverHeading,
      this.neverBody,
      this.sampleHeading,
      this.samplePre,
      this.enrolledEl,
      this.checksWrap,
      this.statusEl,
      this.actions,
      this.closeBtn
    );
    mountRoot.appendChild(this.root);

    this.adultCheck.input.addEventListener('change', () => this._syncJoinEnabled());
    this.layer1Check.input.addEventListener('change', () => this._syncJoinEnabled());

    this._unsubLocale = onLocaleChange(() => this._refreshTexts());
    this._injectStyles();
    this._refreshTexts();
    this._renderState();
  }

  _makeCheck(id, testId) {
    const label = document.createElement('label');
    label.className = 'practice-study-consent-panel__check-label';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = id;
    input.dataset.testid = testId;
    input.className = 'practice-study-consent-panel__check';
    const span = document.createElement('span');
    label.append(input, span);
    return { label, input, span };
  }

  destroy() {
    this._unsubLocale?.();
    this.root.remove();
  }

  isOpen() {
    return this._open;
  }

  openPanel() {
    if (this._open) return;
    this._open = true;
    this._refreshTexts();
    this._renderState();
    this.root.hidden = false;
    this.root.getBoundingClientRect();
    this.root.style.opacity = '1';
    this.root.style.transform = 'translate(-50%, 0)';
    this.handlers.onOpen?.();
  }

  closePanel() {
    if (!this._open) return;
    this._open = false;
    this.root.style.opacity = '0';
    this.root.style.transform = 'translate(-50%, 8px)';
    window.setTimeout(() => {
      if (!this._open) this.root.hidden = true;
    }, FADE_MS);
    this.handlers.onClose?.();
  }

  _syncJoinEnabled() {
    const ok = canEnrollCoPracticeResearch({
      adult: this.adultCheck.input.checked,
      layer1: this.layer1Check.input.checked
    });
    this.joinBtn.disabled = !ok || this._joinPending;
  }

  async _onJoin() {
    if (!canEnrollCoPracticeResearch({
      adult: this.adultCheck.input.checked,
      layer1: this.layer1Check.input.checked
    })) {
      return;
    }
    const storage = globalThis.localStorage;
    this._joinPending = true;
    this.statusEl.textContent = t('PRACTICE_STUDY_JOIN_PENDING');
    this._syncJoinEnabled();
    try {
      grantCoPracticeResearchConsent(storage);
      globalThis.dispatchEvent(
        new CustomEvent('ft:co-practice-research-consent-granted')
      );
      this._renderState();
      this.statusEl.textContent = '';
      this.closePanel();
    } catch {
      this.statusEl.textContent = t('PRACTICE_STUDY_JOIN_FAILED');
    } finally {
      this._joinPending = false;
      this._syncJoinEnabled();
    }
  }

  async _onLeave() {
    if (!globalThis.confirm(t('PRACTICE_STUDY_LEAVE_CONFIRM'))) return;
    this._leavePending = true;
    this.statusEl.textContent = t('PRACTICE_STUDY_LEAVE_PENDING');
    try {
      await revokeCoPracticeResearchAndDeleteRemote({
        storage: globalThis.localStorage
      });
      this.statusEl.textContent = t('PRACTICE_STUDY_LEFT');
      this._renderState();
    } finally {
      this._leavePending = false;
    }
  }

  _renderState() {
    const storage = globalThis.localStorage;
    const enrolled = hasCoPracticeResearchConsent(storage);
    const preview = buildCoPracticeResearchConsentPreviewJson({
      storage,
      previewStudyId: PREVIEW_STUDY_ID,
      previewOnly: true
    });
    this.samplePre.textContent = preview || '—';
    this.enrolledEl.hidden = !enrolled;
    this.enrolledEl.textContent = enrolled ? t('PRACTICE_STUDY_ENROLLED') : '';
    this.checksWrap.hidden = enrolled;
    this.joinBtn.hidden = enrolled;
    this.notNowBtn.hidden = enrolled;
    this.leaveBtn.hidden = !enrolled;
    if (!enrolled) {
      this.adultCheck.input.checked = false;
      this.layer1Check.input.checked = false;
    } else {
      const state = readCoPracticeResearchConsent(storage);
      void state;
    }
    this._syncJoinEnabled();
  }

  _refreshTexts() {
    this.titleEl.textContent = t('PRACTICE_STUDY_PANEL_TITLE');
    this.introEl.textContent = t('PRACTICE_STUDY_INTRO');
    this.collectHeading.textContent = t('PRACTICE_STUDY_COLLECT_HEADING');
    this.collectBody.textContent = t('PRACTICE_STUDY_COLLECT_BODY');
    this.neverHeading.textContent = t('PRACTICE_STUDY_NEVER_HEADING');
    this.neverBody.textContent = t('PRACTICE_STUDY_NEVER_BODY');
    this.sampleHeading.textContent = t('PRACTICE_STUDY_SAMPLE_HEADING');
    this.adultCheck.span.textContent = t('PRACTICE_STUDY_CHECK_ADULT');
    this.layer1Check.span.textContent = t('PRACTICE_STUDY_CHECK_LAYER1');
    this.joinBtn.textContent = t('PRACTICE_STUDY_JOIN');
    this.notNowBtn.textContent = t('PRACTICE_STUDY_NOT_NOW');
    this.leaveBtn.textContent = t('PRACTICE_STUDY_LEAVE');
    this.closeBtn.textContent = t('PRACTICE_STUDY_CLOSE');
    if (hasCoPracticeResearchConsent(globalThis.localStorage)) {
      this.enrolledEl.textContent = t('PRACTICE_STUDY_ENROLLED');
    }
    const preview = buildCoPracticeResearchConsentPreviewJson({
      storage: globalThis.localStorage,
      previewStudyId: PREVIEW_STUDY_ID,
      previewOnly: true
    });
    if (preview) this.samplePre.textContent = preview;
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .practice-study-consent-panel {
        position: fixed;
        left: 50%;
        bottom: 18%;
        z-index: ${Z.DOCK};
        width: min(520px, calc(100vw - 32px));
        padding: 16px 18px;
        ${GLASS_BORDER};
        border-radius: ${GLASS_RADIUS};
        background: ${GLASS_FILL};
        ${GLASS_BLUR_CSS};
        box-shadow: ${GLASS_SHADOW};
        transform: translate(-50%, 8px);
        transition: opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease;
        opacity: 0;
        max-height: min(82vh, calc(100dvh - 96px));
        overflow: auto;
        color: #4a3a28;
      }
      .practice-study-consent-panel__title {
        margin: 0 0 8px;
        font-weight: 650;
        font-size: 15px;
      }
      .practice-study-consent-panel__subhead {
        margin: 10px 0 4px;
        font-weight: 600;
        font-size: 13px;
      }
      .practice-study-consent-panel__body {
        margin: 0 0 8px;
        font-size: 13px;
        line-height: 1.45;
      }
      .practice-study-consent-panel__sample {
        margin: 0 0 10px;
        padding: 8px 10px;
        font-size: 11px;
        line-height: 1.35;
        max-height: 160px;
        overflow: auto;
        background: rgba(255,252,245,.65);
        border-radius: 10px;
        border: 1px solid rgba(139,115,85,.15);
        white-space: pre-wrap;
        word-break: break-word;
      }
      .practice-study-consent-panel__check-label {
        display: flex;
        align-items: flex-start;
        gap: 0.55rem;
        font-size: 0.92rem;
        line-height: 1.35;
        margin: 6px 0;
        cursor: pointer;
      }
      .practice-study-consent-panel__check {
        margin-top: 0.2rem;
        flex: 0 0 auto;
      }
      .practice-study-consent-panel__enrolled {
        margin: 8px 0;
        font-weight: 600;
        font-size: 13px;
      }
      .practice-study-consent-panel__status {
        margin: 6px 0;
        min-height: 1.2em;
        font-size: 12px;
      }
      .practice-study-consent-panel__actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 8px;
      }
      .practice-study-consent-panel__btn {
        font: inherit;
        font-size: 13px;
        padding: 8px 12px;
        border-radius: 12px;
        border: 1px solid rgba(139,115,85,.22);
        background: rgba(255,252,245,.85);
        color: #4a3a28;
        cursor: pointer;
      }
      .practice-study-consent-panel__btn--primary {
        font-weight: 600;
      }
      .practice-study-consent-panel__btn:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }
      .practice-study-consent-panel__close {
        margin-top: 10px;
        font: inherit;
        font-size: 12px;
        padding: 6px 10px;
        border: none;
        background: transparent;
        color: #6b5a44;
        cursor: pointer;
        text-decoration: underline;
      }
      body.ft-wide-stage-practice-study .practice-study-consent-panel,
      body.ft-narrow-stage-practice-study .practice-study-consent-panel {
        bottom: max(18%, env(safe-area-inset-bottom, 0px));
      }
    `;
    document.head.appendChild(style);
  }
}
