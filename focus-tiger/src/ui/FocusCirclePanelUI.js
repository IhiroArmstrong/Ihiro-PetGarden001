/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * ⋯ / drawer → You are not alone → My circle.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import { FocusCircleControlsUI } from './FocusCircleControlsUI.js';
import {
  isFocusCirclePassiveShareEnabled,
  setFocusCirclePassiveShareEnabled
} from '../core/focusCirclePassiveShare.js';
import { readFocusCircleMembership } from '../core/focusCircleMembership.js';
import {
  formatFocusCirclePeerTraceLines,
  normalizeFocusCirclePeerTraces,
  sortFocusCirclePeerTracesForPanel
} from '../core/focusCirclePeerTraces.js';
import {
  FOCUS_CIRCLE_WITNESS_CHANGE_EVENT,
  isFocusCircleWitnessClientEnabled,
  postFocusCircleWitness
} from '../core/focusCircleWitness.js';
import {
  FOCUS_CIRCLE_NICKNAME_MAX_LEN,
  isFocusCircleIdentityClientEnabled,
  normalizeFocusCircleBadgeKey,
  normalizeFocusCircleNickname,
  postFocusCircleIdentitySet,
  readFocusCircleIdentityDraft,
  writeFocusCircleIdentityDraft
} from '../core/focusCircleIdentity.js';
import {
  GLASS_BLUR_CSS,
  GLASS_BORDER,
  GLASS_FILL,
  GLASS_RADIUS,
  GLASS_SHADOW
} from './glassPanelStyles.js';

const STYLE_ID = 'focus-circle-panel-ui-v1';
const FADE_MS = 220;

export class FocusCirclePanelUI {
  /**
   * @param {HTMLElement} mountRoot
   * @param {object} [handlers]
   * @param {() => void} [handlers.onOpen]
   * @param {() => void} [handlers.onClose]
   */
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    this._open = false;

    this.root = document.createElement('div');
    this.root.id = 'focus-circle-panel';
    this.root.className = 'focus-circle-panel';
    this.root.hidden = true;
    this.root.dataset.testid = 'focus-circle-panel';
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');

    this.titleEl = document.createElement('p');
    this.titleEl.className = 'focus-circle-panel__title';

    this.blurbEl = document.createElement('p');
    this.blurbEl.className = 'focus-circle-panel__blurb';

    this.identitySection = document.createElement('div');
    this.identitySection.className = 'focus-circle-panel__identity';
    this.identitySection.dataset.testid = 'focus-circle-identity-section';

    this.identityLabel = document.createElement('p');
    this.identityLabel.className = 'focus-circle-panel__identity-label';

    this.nicknameInput = document.createElement('input');
    this.nicknameInput.type = 'text';
    this.nicknameInput.className = 'focus-circle-panel__identity-input';
    this.nicknameInput.id = 'focus-circle-identity-nickname';
    this.nicknameInput.maxLength = FOCUS_CIRCLE_NICKNAME_MAX_LEN;
    this.nicknameInput.dataset.testid = 'focus-circle-identity-nickname';
    this.nicknameInput.autocomplete = 'off';
    this.nicknameInput.spellcheck = false;

    this.badgeFieldset = document.createElement('fieldset');
    this.badgeFieldset.className = 'focus-circle-panel__badge-fieldset';

    this.badgeLegend = document.createElement('legend');
    this.badgeLegend.className = 'focus-circle-panel__badge-legend';

    this.badgeOptions = ['none', 'tiger', 'yin'].map((value) => {
      const label = document.createElement('label');
      label.className = 'focus-circle-panel__badge-option';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'focus-circle-identity-badge';
      input.value = value;
      input.dataset.testid = `focus-circle-identity-badge-${value}`;
      const text = document.createElement('span');
      label.append(input, text);
      return { value, input, text, label };
    });
    this.badgeFieldset.append(
      this.badgeLegend,
      ...this.badgeOptions.map((row) => row.label)
    );

    this.identitySaveBtn = document.createElement('button');
    this.identitySaveBtn.type = 'button';
    this.identitySaveBtn.className = 'focus-circle-panel__identity-save';
    this.identitySaveBtn.dataset.testid = 'focus-circle-identity-save';
    this.identitySaveBtn.addEventListener('click', () => {
      void this._saveIdentity();
    });

    this.identityStatus = document.createElement('p');
    this.identityStatus.className = 'focus-circle-panel__identity-status';
    this.identityStatus.dataset.testid = 'focus-circle-identity-status';
    this.identityStatus.hidden = true;

    this.identityHint = document.createElement('p');
    this.identityHint.className = 'focus-circle-panel__hint';

    this.identitySection.append(
      this.identityLabel,
      this.nicknameInput,
      this.badgeFieldset,
      this.identitySaveBtn,
      this.identityStatus,
      this.identityHint
    );

    this.tracesSection = document.createElement('section');
    this.tracesSection.className = 'focus-circle-panel__traces';
    this.tracesSection.dataset.testid = 'focus-circle-peer-traces-section';

    this.tracesTitle = document.createElement('p');
    this.tracesTitle.className = 'focus-circle-panel__traces-title';

    this.tracesHint = document.createElement('p');
    this.tracesHint.className = 'focus-circle-panel__hint';

    this.tracesList = document.createElement('ul');
    this.tracesList.className = 'focus-circle-panel__traces-list';
    this.tracesList.dataset.testid = 'focus-circle-peer-traces-list';

    this.tracesEmpty = document.createElement('p');
    this.tracesEmpty.className = 'focus-circle-panel__traces-empty';
    this.tracesEmpty.dataset.testid = 'focus-circle-peer-traces-empty';
    this.tracesEmpty.hidden = true;

    this.tracesStatus = document.createElement('p');
    this.tracesStatus.className = 'focus-circle-panel__traces-status';
    this.tracesStatus.dataset.testid = 'focus-circle-peer-traces-status';
    this.tracesStatus.hidden = true;

    this.tracesSection.append(
      this.tracesTitle,
      this.tracesHint,
      this.tracesList,
      this.tracesEmpty,
      this.tracesStatus
    );

    this.passiveShareLabel = document.createElement('label');
    this.passiveShareLabel.className = 'focus-circle-panel__opt-in-label';
    this.passiveShareLabel.htmlFor = 'focus-circle-passive-share-toggle';

    this.passiveShareCheck = document.createElement('input');
    this.passiveShareCheck.type = 'checkbox';
    this.passiveShareCheck.id = 'focus-circle-passive-share-toggle';
    this.passiveShareCheck.className = 'focus-circle-panel__opt-in-check';
    this.passiveShareCheck.dataset.testid = 'focus-circle-passive-share-toggle';
    this.passiveShareCheck.addEventListener('change', () => {
      setFocusCirclePassiveShareEnabled(
        globalThis.localStorage,
        this.passiveShareCheck.checked === true
      );
    });

    this.passiveShareText = document.createElement('span');
    this.passiveShareText.className = 'focus-circle-panel__opt-in-text';

    this.passiveShareHint = document.createElement('p');
    this.passiveShareHint.className = 'focus-circle-panel__hint';

    this.passiveShareLabel.append(this.passiveShareCheck, this.passiveShareText);

    this.controlsMount = document.createElement('div');
    this.controlsMount.className = 'focus-circle-panel__mount';

    this.closeBtn = document.createElement('button');
    this.closeBtn.type = 'button';
    this.closeBtn.className = 'focus-circle-panel__close';
    this.closeBtn.addEventListener('click', () => this.closePanel());

    this.root.append(
      this.titleEl,
      this.blurbEl,
      this.identitySection,
      this.tracesSection,
      this.passiveShareLabel,
      this.passiveShareHint,
      this.controlsMount,
      this.closeBtn
    );
    mountRoot.appendChild(this.root);

    this.controls = new FocusCircleControlsUI(this.controlsMount);
    this._peerTracesFetchSeq = 0;
    this._onWitnessChange = () => {
      if (this._open) void this._refreshPeerTraces();
    };
    globalThis.addEventListener?.(
      FOCUS_CIRCLE_WITNESS_CHANGE_EVENT,
      this._onWitnessChange
    );
    this._unsubLocale = onLocaleChange(() => this._refreshTexts());
    this._injectStyles();
    this._refreshTexts();
  }

  destroy() {
    this._unsubLocale?.();
    globalThis.removeEventListener?.(
      FOCUS_CIRCLE_WITNESS_CHANGE_EVENT,
      this._onWitnessChange
    );
    this.controls.destroy();
    this.root.remove();
  }

  isOpen() {
    return this._open;
  }

  openPanel() {
    if (this._open) return;
    this._open = true;
    this.root.hidden = false;
    this.controls.refresh();
    this.controls.setStatusPollingActive(true);
    void this._refreshPeerTraces();
    this.root.getBoundingClientRect();
    this.root.style.opacity = '1';
    this.root.style.transform = 'translate(-50%, 0)';
    this.handlers.onOpen?.();
  }

  closePanel() {
    if (!this._open) return;
    this._open = false;
    this.controls.setStatusPollingActive(false);
    this.root.style.opacity = '0';
    this.root.style.transform = 'translate(-50%, 8px)';
    window.setTimeout(() => {
      if (!this._open) this.root.hidden = true;
    }, FADE_MS);
    this.handlers.onClose?.();
  }

  _refreshTexts() {
    this.titleEl.textContent = t('FOCUS_CIRCLE_PANEL_TITLE');
    this.blurbEl.textContent = t('FOCUS_CIRCLE_PANEL_BLURB');
    this.passiveShareText.textContent = t('FOCUS_CIRCLE_PASSIVE_SHARE_LABEL');
    this.passiveShareHint.textContent = t('FOCUS_CIRCLE_PASSIVE_SHARE_HINT');
    this.passiveShareCheck.checked = isFocusCirclePassiveShareEnabled(
      globalThis.localStorage
    );
    this.closeBtn.textContent = t('FOCUS_CIRCLE_PANEL_CLOSE');
    this.tracesTitle.textContent = t('FOCUS_CIRCLE_PEER_TRACES_TITLE');
    this.tracesHint.textContent = t('FOCUS_CIRCLE_PEER_TRACES_WINDOW_HINT');
    this.tracesEmpty.textContent = t('FOCUS_CIRCLE_PEER_TRACES_EMPTY');
    this.controls.refresh();
    this._refreshIdentityFields();
    this._renderPeerTracesList(this._peerTracesRows ?? []);
  }

  /**
   * @param {import('../core/focusCirclePeerTraces.js').FocusCirclePeerTraceRow[]} rows
   */
  _renderPeerTracesList(rows) {
    this._peerTracesRows = rows;
    this.tracesList.replaceChildren();
    const showSection = isFocusCircleWitnessClientEnabled({
      storage: globalThis.localStorage,
      search:
        typeof globalThis.location?.search === 'string'
          ? globalThis.location.search
          : ''
    });
    this.tracesSection.hidden = !showSection;
    if (!showSection) return;
    if (!rows.length) {
      this.tracesEmpty.hidden = false;
      return;
    }
    this.tracesEmpty.hidden = true;
    for (const trace of rows) {
      const item = document.createElement('li');
      item.className = 'focus-circle-panel__traces-item';
      item.dataset.testid = 'focus-circle-peer-trace-item';
      item.dataset.traceId = trace.traceId;
      const { leaveLine, respondLine } = formatFocusCirclePeerTraceLines({
        trace,
        t
      });
      const leaveEl = document.createElement('p');
      leaveEl.className = 'focus-circle-panel__traces-leave';
      leaveEl.textContent = leaveLine;
      item.append(leaveEl);
      if (respondLine) {
        const respondEl = document.createElement('p');
        respondEl.className = 'focus-circle-panel__traces-respond';
        respondEl.textContent = respondLine;
        item.append(respondEl);
      }
      this.tracesList.append(item);
    }
  }

  /**
   * @param {string} message
   * @param {boolean} isError
   */
  _showPeerTracesStatus(message, isError) {
    this.tracesStatus.hidden = false;
    this.tracesStatus.textContent = message;
    this.tracesStatus.dataset.error = isError ? '1' : '0';
  }

  async _refreshPeerTraces() {
    const seq = ++this._peerTracesFetchSeq;
    const membership = readFocusCircleMembership(globalThis.localStorage);
    if (
      !membership ||
      !isFocusCircleWitnessClientEnabled({
        storage: globalThis.localStorage,
        search:
          typeof globalThis.location?.search === 'string'
            ? globalThis.location.search
            : ''
      })
    ) {
      this.tracesStatus.hidden = true;
      this._renderPeerTracesList([]);
      return;
    }
    this.tracesStatus.hidden = true;
    try {
      const result = await postFocusCircleWitness({
        action: 'witness_peek',
        updateIdleSnapshot: false
      });
      if (seq !== this._peerTracesFetchSeq || !this._open) return;
      if (!result.ok) {
        if (result.reason === 'rate_limited') {
          this._showPeerTracesStatus(t('FOCUS_CIRCLE_PEER_TRACES_RATE_LIMITED'), true);
        } else if (result.reason !== 'disabled') {
          this._showPeerTracesStatus(t('FOCUS_CIRCLE_PEER_TRACES_LOAD_FAILED'), true);
        }
        this._renderPeerTracesList([]);
        return;
      }
      const rows = sortFocusCirclePeerTracesForPanel(
        normalizeFocusCirclePeerTraces(result.traces)
      );
      this._renderPeerTracesList(rows);
    } catch {
      if (seq !== this._peerTracesFetchSeq || !this._open) return;
      this._showPeerTracesStatus(t('FOCUS_CIRCLE_PEER_TRACES_LOAD_FAILED'), true);
      this._renderPeerTracesList([]);
    }
  }

  _refreshIdentityFields() {
    const enabled = isFocusCircleIdentityClientEnabled({
      storage: globalThis.localStorage,
      search:
        typeof globalThis.location?.search === 'string'
          ? globalThis.location.search
          : ''
    });
    this.identitySection.hidden = !enabled;
    if (!enabled) return;
    const draft = readFocusCircleIdentityDraft(globalThis.localStorage);
    this.nicknameInput.value = draft.nickname;
    for (const row of this.badgeOptions) {
      const selected =
        row.value === 'none' ? !draft.badgeKey : draft.badgeKey === row.value;
      row.input.checked = selected;
    }
    this.identityLabel.textContent = t('FOCUS_CIRCLE_IDENTITY_NICKNAME_LABEL');
    this.nicknameInput.placeholder = t('FOCUS_CIRCLE_IDENTITY_NICKNAME_PLACEHOLDER');
    this.badgeLegend.textContent = t('FOCUS_CIRCLE_IDENTITY_BADGE_LABEL');
    for (const row of this.badgeOptions) {
      row.text.textContent =
        row.value === 'none'
          ? t('FOCUS_CIRCLE_IDENTITY_BADGE_NONE')
          : t(`FOCUS_CIRCLE_IDENTITY_BADGE_${row.value.toUpperCase()}`);
    }
    this.identitySaveBtn.textContent = t('FOCUS_CIRCLE_IDENTITY_SAVE_BTN');
    this.identitySaveBtn.disabled = false;
    this.identityHint.textContent = t('FOCUS_CIRCLE_IDENTITY_PANEL_HINT');
    this.identityStatus.hidden = true;
  }

  async _saveIdentity() {
    const membership = readFocusCircleMembership(globalThis.localStorage);
    if (!membership) {
      this._showIdentityStatus(t('FOCUS_CIRCLE_IDENTITY_SAVE_NEED_MEMBERSHIP'), true);
      return;
    }
    const nicknameRaw = this.nicknameInput.value;
    const nickname = normalizeFocusCircleNickname(nicknameRaw);
    if (nicknameRaw.trim() && !nickname) {
      this._showIdentityStatus(t('FOCUS_CIRCLE_IDENTITY_SAVE_INVALID'), true);
      return;
    }
    const selectedBadge =
      this.badgeOptions.find((row) => row.input.checked)?.value ?? 'none';
    const badgeKey =
      selectedBadge === 'none' ? null : normalizeFocusCircleBadgeKey(selectedBadge);
    this.identitySaveBtn.disabled = true;
    this._showIdentityStatus(t('FOCUS_CIRCLE_IDENTITY_SAVE_PENDING'), false);
    try {
      const result = await postFocusCircleIdentitySet({
        circleId: membership.circleId,
        memberId: membership.memberId,
        nickname: nickname ?? null,
        badgeKey
      });
      if (!result.ok) {
        const failKey =
          result.reason === 'timeout'
            ? 'FOCUS_CIRCLE_IDENTITY_SAVE_TIMEOUT'
            : 'FOCUS_CIRCLE_IDENTITY_SAVE_FAILED';
        this._showIdentityStatus(t(failKey), true);
        return;
      }
      writeFocusCircleIdentityDraft(globalThis.localStorage, {
        nickname: nickname ?? '',
        badgeKey
      });
      this._showIdentityStatus(t('FOCUS_CIRCLE_IDENTITY_SAVE_OK'), false);
    } finally {
      this.identitySaveBtn.disabled = false;
    }
  }

  /**
   * @param {string} message
   * @param {boolean} isError
   */
  _showIdentityStatus(message, isError) {
    this.identityStatus.hidden = false;
    this.identityStatus.textContent = message;
    this.identityStatus.dataset.error = isError ? '1' : '0';
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .focus-circle-panel {
        position: fixed;
        left: 50%;
        bottom: 18%;
        z-index: 16;
        width: min(480px, calc(100vw - 32px));
        padding: 16px 18px;
        ${GLASS_BORDER};
        border-radius: ${GLASS_RADIUS};
        background: ${GLASS_FILL};
        ${GLASS_BLUR_CSS};
        box-shadow: ${GLASS_SHADOW};
        transform: translate(-50%, 8px);
        transition: opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease;
        opacity: 0;
        max-height: min(78vh, calc(100dvh - 120px));
        overflow: auto;
        color: #4a3a28;
      }
      .focus-circle-panel__title {
        margin: 0 0 6px;
        font-weight: 650;
        font-size: 15px;
      }
      .focus-circle-panel__blurb {
        margin: 0 0 10px;
        font-size: 13px;
        line-height: 1.45;
      }
      .focus-circle-panel__identity {
        margin: 0 0 12px;
        padding: 10px 0 0;
        border-top: 1px solid rgba(139,115,85,.12);
      }
      .focus-circle-panel__identity-label {
        margin: 0 0 6px;
        font-size: 12.5px;
        font-weight: 600;
      }
      .focus-circle-panel__identity-input {
        width: 100%;
        box-sizing: border-box;
        margin: 0 0 8px;
        padding: 7px 10px;
        border-radius: 10px;
        border: 1px solid rgba(139,115,85,.22);
        background: rgba(255,252,245,.92);
        font: inherit;
        font-size: 13px;
        color: #4a3a28;
      }
      .focus-circle-panel__badge-fieldset {
        margin: 0 0 8px;
        padding: 0;
        border: 0;
      }
      .focus-circle-panel__badge-legend {
        margin: 0 0 6px;
        padding: 0;
        font-size: 12px;
        font-weight: 600;
      }
      .focus-circle-panel__badge-option {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        margin: 0 10px 0 0;
        font-size: 12px;
        cursor: pointer;
      }
      .focus-circle-panel__identity-save {
        font: inherit;
        font-size: 12.5px;
        padding: 7px 12px;
        border-radius: 10px;
        border: 1px solid rgba(139,115,85,.22);
        background: rgba(255,252,245,.85);
        color: #4a3a28;
        cursor: pointer;
      }
      .focus-circle-panel__identity-save:disabled {
        opacity: 0.55;
        cursor: wait;
      }
      .focus-circle-panel__identity-status {
        margin: 6px 0 0;
        font-size: 11.5px;
        line-height: 1.35;
        color: rgba(74, 58, 40, 0.78);
      }
      .focus-circle-panel__identity-status[data-error="1"] {
        color: #8b3a2a;
      }
      .focus-circle-panel__traces {
        margin: 0 0 12px;
        padding: 10px 0 0;
        border-top: 1px solid rgba(139,115,85,.12);
      }
      .focus-circle-panel__traces-title {
        margin: 0 0 4px;
        font-size: 12.5px;
        font-weight: 650;
      }
      .focus-circle-panel__traces-list {
        margin: 0;
        padding: 0;
        list-style: none;
        display: grid;
        gap: 8px;
        max-height: min(32vh, 220px);
        overflow: auto;
      }
      .focus-circle-panel__traces-item {
        margin: 0;
        padding: 8px 10px;
        border-radius: 10px;
        background: rgba(255,252,245,.72);
        border: 1px solid rgba(139,115,85,.12);
      }
      .focus-circle-panel__traces-leave,
      .focus-circle-panel__traces-respond {
        margin: 0;
        font-size: 12.5px;
        line-height: 1.4;
      }
      .focus-circle-panel__traces-respond {
        margin-top: 4px;
        color: rgba(74, 58, 40, 0.72);
      }
      .focus-circle-panel__traces-empty,
      .focus-circle-panel__traces-status {
        margin: 6px 0 0;
        font-size: 11.5px;
        line-height: 1.35;
        color: rgba(74, 58, 40, 0.78);
      }
      .focus-circle-panel__traces-status[data-error="1"] {
        color: #8b3a2a;
      }
      .focus-circle-panel__opt-in-label {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        margin: 0 0 6px;
        font-size: 13px;
        line-height: 1.4;
        cursor: pointer;
      }
      .focus-circle-panel__opt-in-check {
        margin-top: 2px;
        flex-shrink: 0;
      }
      .focus-circle-panel__hint {
        margin: 0 0 10px;
        font-size: 11.5px;
        line-height: 1.4;
        color: rgba(74, 58, 40, 0.72);
      }
      .focus-circle-panel__close {
        margin-top: 12px;
        font: inherit;
        font-size: 13px;
        padding: 8px 12px;
        border-radius: 12px;
        border: 1px solid rgba(139,115,85,.22);
        background: rgba(255,252,245,.85);
        color: #4a3a28;
        cursor: pointer;
      }
      body.ft-wide-stage-focus-circle .focus-circle-panel,
      body.ft-narrow-stage-focus-circle .focus-circle-panel {
        opacity: 1;
        transform: translate(-50%, 0);
      }
    `;
    document.head.appendChild(style);
  }
}
