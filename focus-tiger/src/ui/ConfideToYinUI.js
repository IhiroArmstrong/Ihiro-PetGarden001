/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Confide to Yin · light Idle panel.
 * Web / narrow: retrieve-not-generate. Electron wide L2: fallback may generate.
 */

import { t, getLocale, onLocaleChange } from '../locales/i18n.js';
import { canSubmitConfideText } from '../core/confide/confideClassify.js';
import { shouldSubmitConfideOnEnter } from '../core/confide/confideEnterSend.js';
import { confideLineText } from '../core/confide/confideCorpus.js';
import { CONFIDE_ROUTE } from '../core/confide/confideRoutes.js';
import { resolveConfideReply } from '../core/confide/confideReplyFlow.js';
import {
  formatPracticeDurationReply,
  shouldAnswerWithPracticeFacts,
  summarizePracticeFacts
} from '../core/confide/confidePracticeFacts.js';
import { shouldUseDesktopCompanionGenerate } from '../core/desktopCompanionL2Route.js';
import { formatLocalDateYmd } from './reflectionEchoCopy.js';
import {
  GLASS_BLUR_CSS,
  GLASS_BORDER,
  GLASS_FILL,
  GLASS_FILL_STRONG,
  GLASS_RADIUS,
  GLASS_SHADOW
} from './glassPanelStyles.js';
import {
  canRegisterDesktopCompanionGeneration,
  desktopCompanionDownloadPercent,
  desktopCompanionModelLabel,
  desktopCompanionStatusCopyKey,
  hasDesktopCompanionBridge,
  shouldCloseDesktopCompanionGenerateLayer
} from '../core/desktopCompanionGate.js';
import {
  fetchYinPersonalMemoryState,
  hasYinPersonalMemoryBridge,
  rememberYinPersonalMemoryFromConfide,
  saveYinPersonalMemoryConsent
} from '../core/yinPersonalMemoryBridge.js';
import {
  canRememberYinPersonalMemory,
  shouldOfferYinMemoryConsent
} from '../core/yinPersonalMemory/yinPersonalMemoryConsent.js';

const STYLE_ID = 'confide-to-yin-card-styles-v3';
const FADE_MS = 220;

export class ConfideToYinUI {
  /**
   * @param {HTMLElement} mountRoot
   * @param {object} [handlers]
   * @param {() => void} [handlers.onOpen]
   * @param {() => void} [handlers.onClose]
   * @param {(info: { route: string, lineId: string }) => void} [handlers.onReplied]
   * @param {() => boolean} [handlers.canOpen]
   */
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    this._open = false;
    this._sessionExclude = new Set();
    this._companion = null;
    this._unsubCompanion = null;
    this._generateLayerOpen = false;
    this._companionStatus = null;
    this._sending = false;
    this._sendEpoch = 0;
    this._l2Turns = [];
    this._practiceDaysStore = handlers.practiceDaysStore || null;
    this._memoryState = null;
    this._pendingL3Send = null;
    this._memoryConsentSaving = false;

    this.root = document.createElement('div');
    this.root.id = 'confide-to-yin-card';
    this.root.className = 'confide-to-yin';
    this.root.hidden = true;
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'confide-to-yin-title');
    this.root.dataset.testid = 'confide-to-yin-card';

    this.titleEl = document.createElement('p');
    this.titleEl.id = 'confide-to-yin-title';
    this.titleEl.className = 'confide-to-yin__title';

    this.blurbEl = document.createElement('p');
    this.blurbEl.className = 'confide-to-yin__blurb';

    this.statusWrap = document.createElement('div');
    this.statusWrap.className = 'confide-to-yin__desktop-status';
    this.statusWrap.dataset.testid = 'confide-to-yin-desktop-status';
    this.statusWrap.hidden = true;

    this.statusEl = document.createElement('p');
    this.statusEl.className = 'confide-to-yin__desktop-status-copy';
    this.statusEl.dataset.testid = 'confide-to-yin-desktop-status-copy';

    this.modelEl = document.createElement('p');
    this.modelEl.className = 'confide-to-yin__desktop-model';
    this.modelEl.dataset.testid = 'confide-to-yin-desktop-model';
    this.modelEl.hidden = true;

    this.progressEl = document.createElement('progress');
    this.progressEl.className = 'confide-to-yin__desktop-progress';
    this.progressEl.dataset.testid = 'confide-to-yin-desktop-progress';
    this.progressEl.max = 100;
    this.progressEl.value = 0;
    this.progressEl.hidden = true;

    this.statusWrap.append(this.statusEl, this.modelEl, this.progressEl);

    this.memoryConsentWrap = document.createElement('div');
    this.memoryConsentWrap.className = 'confide-to-yin__memory-consent';
    this.memoryConsentWrap.dataset.testid = 'confide-to-yin-memory-consent';
    this.memoryConsentWrap.hidden = true;

    this.memoryConsentCopy = document.createElement('p');
    this.memoryConsentCopy.className = 'confide-to-yin__memory-consent-copy';

    this.memoryConsentActions = document.createElement('div');
    this.memoryConsentActions.className = 'confide-to-yin__memory-consent-actions';

    this.memoryConsentAllowBtn = document.createElement('button');
    this.memoryConsentAllowBtn.type = 'button';
    this.memoryConsentAllowBtn.className =
      'confide-to-yin__btn confide-to-yin__btn--primary confide-to-yin__memory-consent-allow';
    this.memoryConsentAllowBtn.dataset.testid = 'confide-to-yin-memory-consent-allow';
    this.memoryConsentAllowBtn.addEventListener('click', () =>
      this._onMemoryConsentChoice(true)
    );

    this.memoryConsentDenyBtn = document.createElement('button');
    this.memoryConsentDenyBtn.type = 'button';
    this.memoryConsentDenyBtn.className =
      'confide-to-yin__btn confide-to-yin__btn--ghost confide-to-yin__memory-consent-deny';
    this.memoryConsentDenyBtn.dataset.testid = 'confide-to-yin-memory-consent-deny';
    this.memoryConsentDenyBtn.addEventListener('click', () =>
      this._onMemoryConsentChoice(false)
    );

    this.memoryConsentActions.append(
      this.memoryConsentAllowBtn,
      this.memoryConsentDenyBtn
    );
    this.memoryConsentWrap.append(this.memoryConsentCopy, this.memoryConsentActions);

    this.inputEl = document.createElement('textarea');
    this.inputEl.className = 'confide-to-yin__input';
    this.inputEl.dataset.testid = 'confide-to-yin-input';
    this.inputEl.rows = 3;
    this.inputEl.maxLength = 280;
    this.inputEl.addEventListener('input', () => this._syncSendEnabled());
    this.inputEl.addEventListener('keydown', (event) => {
      if (!shouldSubmitConfideOnEnter(event)) return;
      event.preventDefault();
      this._onSend();
    });

    this.userEl = document.createElement('p');
    this.userEl.className = 'confide-to-yin__user';
    this.userEl.dataset.testid = 'confide-to-yin-user';
    this.userEl.hidden = true;

    this.replyEl = document.createElement('p');
    this.replyEl.className = 'confide-to-yin__reply';
    this.replyEl.dataset.testid = 'confide-to-yin-reply';
    this.replyEl.hidden = true;

    this.actions = document.createElement('div');
    this.actions.className = 'confide-to-yin__actions';

    this.sendBtn = document.createElement('button');
    this.sendBtn.type = 'button';
    this.sendBtn.className =
      'confide-to-yin__btn confide-to-yin__btn--primary';
    this.sendBtn.dataset.testid = 'confide-to-yin-send';
    this.sendBtn.addEventListener('click', () => this._onSend());

    this.cancelBtn = document.createElement('button');
    this.cancelBtn.type = 'button';
    this.cancelBtn.className = 'confide-to-yin__btn confide-to-yin__btn--ghost';
    this.cancelBtn.dataset.testid = 'confide-to-yin-cancel';
    this.cancelBtn.addEventListener('click', () => this.close());

    this.closeBtn = document.createElement('button');
    this.closeBtn.type = 'button';
    this.closeBtn.className = 'confide-to-yin__btn confide-to-yin__btn--ghost';
    this.closeBtn.dataset.testid = 'confide-to-yin-close';
    this.closeBtn.addEventListener('click', () => this.close());

    this.actionEnd = document.createElement('div');
    this.actionEnd.className = 'confide-to-yin__actions-end';
    this.actionEnd.append(this.sendBtn, this.closeBtn);
    this.actions.append(this.cancelBtn, this.actionEnd);
    this.root.append(
      this.titleEl,
      this.blurbEl,
      this.statusWrap,
      this.memoryConsentWrap,
      this.inputEl,
      this.userEl,
      this.replyEl,
      this.actions
    );
    mountRoot.appendChild(this.root);

    this._onKeyDown = (event) => {
      if (!this._open) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        this.close();
      }
    };
    document.addEventListener('keydown', this._onKeyDown);

    this._unsubLocale = onLocaleChange(() => this._applyCopy());
    this._onResize = () => this._syncGenerateLayerForViewport();
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('resize', this._onResize);
    }
    this._injectStyles();
    this._applyCopy();
    this._syncSendEnabled();
  }

  /** @returns {boolean} */
  isOpen() {
    return this._open;
  }

  open() {
    if (this._open) return;
    if (this.handlers.canOpen && !this.handlers.canOpen()) return;
    this.handlers.onOpen?.();
    this._open = true;
    this.root.hidden = false;
    this.inputEl.value = '';
    this.userEl.hidden = true;
    this.userEl.textContent = '';
    this.replyEl.hidden = true;
    this.replyEl.textContent = '';
    this.replyEl.dataset.route = '';
    this._l2Turns = [];
    this._pendingL3Send = null;
    this._memoryConsentSaving = false;
    this._hideMemoryConsent();
    this._sendEpoch += 1;
    this._sending = false;
    this._syncSendEnabled();
    this._syncGenerateLayerForViewport({ ensure: true });
    void this._refreshMemoryState();
    requestAnimationFrame(() => {
      this.root.classList.add('is-visible');
      this.inputEl.focus();
    });
  }

  close() {
    if (!this._open) return;
    this._open = false;
    this._sendEpoch += 1;
    this._sending = false;
    this._l2Turns = [];
    this._pendingL3Send = null;
    this._memoryConsentSaving = false;
    this._hideMemoryConsent();
    this.hideGenerateLayer({ unload: false });
    this.root.classList.remove('is-visible');
    window.setTimeout(() => {
      if (!this._open) this.root.hidden = true;
    }, FADE_MS);
    this.handlers.onClose?.();
  }

  /**
   * @param {object | null} companion
   */
  bindDesktopCompanion(companion) {
    this._unsubCompanion?.();
    this._companion = companion && typeof companion === 'object' ? companion : null;
    if (!this._companion || typeof this._companion.onStatus !== 'function') {
      this._unsubCompanion = null;
      return;
    }
    this._unsubCompanion = this._companion.onStatus((payload) => {
      this._companionStatus = payload || null;
      this._renderDesktopStatus();
    });
    if (typeof this._companion.getStatus === 'function') {
      void Promise.resolve(this._companion.getStatus())
        .then((payload) => {
          this._companionStatus = payload || null;
          this._renderDesktopStatus();
        })
        .catch(() => {});
    }
    void this._refreshMemoryState();
  }

  /**
   * Same ledger as Journey Log (created later in main.js).
   * @param {import('../core/PracticeDaysStore.js').PracticeDaysStore | null} store
   */
  bindPracticeDaysStore(store) {
    this._practiceDaysStore = store || null;
  }

  /**
   * @param {{ unload?: boolean }} [opts]
   */
  hideGenerateLayer({ unload = false } = {}) {
    this._generateLayerOpen = false;
    this.statusWrap.hidden = true;
    this.progressEl.hidden = true;
    if (unload && this._companion && typeof this._companion.unload === 'function') {
      void this._companion.unload();
    }
  }

  _viewportAllowsGenerateLayer() {
    return canRegisterDesktopCompanionGeneration({
      hasBridge: Boolean(this._companion) || hasDesktopCompanionBridge(),
      widthPx: typeof window !== 'undefined' ? window.innerWidth : 0
    });
  }

  /**
   * @param {{ ensure?: boolean }} [opts]
   */
  _syncGenerateLayerForViewport({ ensure = false } = {}) {
    const allowed = this._viewportAllowsGenerateLayer();
    if (this._open && this._generateLayerOpen && shouldCloseDesktopCompanionGenerateLayer({
      generateLayerOpen: true,
      widthPx: typeof window !== 'undefined' ? window.innerWidth : 0
    })) {
      this.hideGenerateLayer({ unload: true });
      if (this.handlers.canOpen && !this.handlers.canOpen()) this.close();
      return;
    }
    if (!this._open || !allowed) {
      if (!allowed) this.hideGenerateLayer({ unload: false });
      return;
    }
    this._generateLayerOpen = true;
    this.statusWrap.hidden = false;
    this._renderDesktopStatus();
    if (ensure && this._companion && typeof this._companion.ensureReady === 'function') {
      void this._companion.ensureReady();
    }
  }

  _renderDesktopStatus() {
    if (!this._generateLayerOpen) return;
    const key = desktopCompanionStatusCopyKey(this._companionStatus, {
      sending: this._sending
    });
    this.statusEl.textContent = t(key);
    const modelLabel = desktopCompanionModelLabel(this._companionStatus);
    this.modelEl.textContent = modelLabel;
    this.modelEl.hidden = !modelLabel;
    const percent = desktopCompanionDownloadPercent(this._companionStatus);
    if (
      this._sending ||
      percent == null ||
      this._companionStatus?.phase !== 'downloading'
    ) {
      this.progressEl.hidden = true;
      return;
    }
    this.progressEl.hidden = false;
    this.progressEl.value = percent;
  }

  destroy() {
    document.removeEventListener('keydown', this._onKeyDown);
    if (typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
      window.removeEventListener('resize', this._onResize);
    }
    this._unsubCompanion?.();
    this._unsubLocale?.();
    this.root.remove();
  }

  _applyCopy() {
    this.titleEl.textContent = t('CONFIDE_PANEL_TITLE');
    this.blurbEl.textContent = t('CONFIDE_PANEL_BLURB');
    this.inputEl.placeholder = t('CONFIDE_PANEL_PLACEHOLDER');
    this.sendBtn.textContent = t('CONFIDE_PANEL_SEND');
    this.cancelBtn.textContent = t('CONFIDE_PANEL_CANCEL');
    this.closeBtn.textContent = t('CONFIDE_PANEL_CLOSE');
    this.memoryConsentCopy.textContent = t('YIN_MEMORY_CONSENT_BLURB');
    this.memoryConsentAllowBtn.textContent = t('YIN_MEMORY_CONSENT_ALLOW');
    this.memoryConsentDenyBtn.textContent = t('YIN_MEMORY_CONSENT_DENY');
    this._renderDesktopStatus();
  }

  _syncSendEnabled() {
    const ok = canSubmitConfideText(this.inputEl.value);
    this.sendBtn.disabled = this._sending || !ok;
  }

  /**
   * @param {{ route: string, line?: { id?: string }, text: string, source: string }} shown
   * @param {string} userText
   */
  _showReply(shown, userText) {
    const asked = typeof userText === 'string' ? userText.trim() : '';
    this.userEl.textContent = asked;
    this.userEl.hidden = !asked;
    this.replyEl.textContent = shown.text;
    this.replyEl.hidden = false;
    this.replyEl.dataset.route = shown.route;
    this.replyEl.dataset.lineId = shown.line?.id || '';
    this.replyEl.dataset.source = shown.source;
    this._l2Turns.push({ role: 'user', text: asked });
    this._l2Turns.push({
      role: 'yin',
      text: shown.text,
      source:
        shown.source === 'generate'
          ? 'generate'
          : shown.source === 'practice_facts'
            ? 'practice_facts'
            : 'corpus'
    });
    if (this._l2Turns.length > 16) this._l2Turns = this._l2Turns.slice(-16);
    this.inputEl.value = '';
    this._syncSendEnabled();
    this.handlers.onReplied?.({
      route: shown.route,
      lineId: shown.line?.id || '',
      source: shown.source
    });
  }


  async _refreshMemoryState() {
    if (!hasYinPersonalMemoryBridge()) {
      this._memoryState = null;
      return;
    }
    this._memoryState = await fetchYinPersonalMemoryState();
  }

  _hideMemoryConsent() {
    if (!this.memoryConsentWrap) return;
    this.memoryConsentWrap.hidden = true;
  }

  /**
   * @param {{ text: string, hit: object, locale: string, corpusText: string }} payload
   */
  _offerMemoryConsentBeforeL3(payload) {
    this._pendingL3Send = payload;
    this.memoryConsentWrap.hidden = false;
    this.memoryConsentAllowBtn.disabled = this._memoryConsentSaving;
    this.memoryConsentDenyBtn.disabled = this._memoryConsentSaving;
  }

  /**
   * @param {boolean} granted
   */
  _onMemoryConsentChoice(granted) {
    if (this._memoryConsentSaving) return;
    this._memoryConsentSaving = true;
    this.memoryConsentAllowBtn.disabled = true;
    this.memoryConsentDenyBtn.disabled = true;
    void saveYinPersonalMemoryConsent(granted)
      .then((state) => {
        this._memoryState = state;
        this._hideMemoryConsent();
        const pending = this._pendingL3Send;
        this._pendingL3Send = null;
        if (pending) this._runL3Generate(pending);
      })
      .finally(() => {
        this._memoryConsentSaving = false;
        if (this.memoryConsentWrap && !this.memoryConsentWrap.hidden) {
          this.memoryConsentAllowBtn.disabled = false;
          this.memoryConsentDenyBtn.disabled = false;
        }
      });
  }

  /**
   * Silent Remember after successful L3 generate (Slice 1b).
   * @param {{ userText: string, route: string, replySource: string }} payload
   */
  _maybeRememberFromL3(payload) {
    if (!hasYinPersonalMemoryBridge() || !canRememberYinPersonalMemory(this._memoryState)) {
      return;
    }
    const turnOrdinal = Math.floor(this._l2Turns.length / 2);
    void rememberYinPersonalMemoryFromConfide({
      userText: payload.userText,
      route: payload.route,
      replySource: payload.replySource,
      turnOrdinal
    }).then((state) => {
      this._memoryState = state;
    });
  }

  /**
   * @param {{ text: string, hit: object, locale: string, corpusText: string }} payload
   */
  _runL3Generate(payload) {
    const { text, hit, locale, corpusText } = payload;
    this._sending = true;
    const epoch = this._sendEpoch;
    this.sendBtn.disabled = true;
    this._renderDesktopStatus();
    const history = this._l2Turns.slice();
    void Promise.resolve(
      this._companion.generate({ text, locale, history })
    )
      .then((result) => {
        if (!this._open || epoch !== this._sendEpoch) return;
        if (result?.ok && result.text) {
          this._showReply(
            {
              route: 'generate',
              text: result.text,
              source: 'generate'
            },
            text
          );
          this._maybeRememberFromL3({
            userText: text,
            route: hit.route,
            replySource: 'generate'
          });
          return;
        }
        this._sessionExclude.add(hit.line.id);
        this._showReply(
          { route: hit.route, line: hit.line, text: corpusText, source: 'corpus' },
          text
        );
      })
      .catch(() => {
        if (!this._open || epoch !== this._sendEpoch) return;
        this._sessionExclude.add(hit.line.id);
        this._showReply(
          { route: hit.line ? hit.route : 'fallback', line: hit.line, text: corpusText, source: 'corpus' },
          text
        );
      })
      .finally(() => {
        if (epoch !== this._sendEpoch) return;
        this._sending = false;
        this._syncSendEnabled();
        this._renderDesktopStatus();
      });
  }

  _onSend() {
    if (this._sending) return;
    const text = this.inputEl.value;
    if (!canSubmitConfideText(text)) return;
    const hit = resolveConfideReply({
      text,
      localDate: formatLocalDateYmd(),
      salt: this._sessionExclude.size,
      excludeIds: this._sessionExclude
    });
    if (!hit) return;
    const locale = getLocale();
    const corpusText = confideLineText(hit.line, locale);
    if (shouldAnswerWithPracticeFacts(hit.route, text)) {
      const factsText = formatPracticeDurationReply(
        summarizePracticeFacts(this._practiceDaysStore),
        t
      );
      this._showReply(
        {
          route: hit.route,
          text: factsText,
          source: 'practice_facts'
        },
        text
      );
      return;
    }
    const wantGenerate = shouldUseDesktopCompanionGenerate({
      route: hit.route,
      generateEnabled: Boolean(this._companionStatus?.generateEnabled),
      generateLayerOpen: this._generateLayerOpen,
      hasGenerateFn: typeof this._companion?.generate === 'function'
    });
    if (!wantGenerate) {
      this._sessionExclude.add(hit.line.id);
      this._showReply(
        { route: hit.route, line: hit.line, text: corpusText, source: 'corpus' },
        text
      );
      return;
    }
    if (
      hasYinPersonalMemoryBridge() &&
      shouldOfferYinMemoryConsent(this._memoryState)
    ) {
      this._offerMemoryConsentBeforeL3({ text, hit, locale, corpusText });
      return;
    }
    this._runL3Generate({ text, hit, locale, corpusText });
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .confide-to-yin {
        position: fixed;
        left: 50%;
        bottom: max(96px, env(safe-area-inset-bottom, 0px) + 72px);
        z-index: 18;
        width: min(360px, calc(100vw - 40px));
        max-height: min(70vh, 520px);
        overflow: auto;
        transform: translate(-50%, 10px);
        padding: 16px 16px 14px;
        box-sizing: border-box;
        color: #2c1f14;
        background: ${GLASS_FILL};
        ${GLASS_BLUR_CSS};
        border: ${GLASS_BORDER};
        border-radius: ${GLASS_RADIUS};
        box-shadow: ${GLASS_SHADOW};
        opacity: 0;
        transition: opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease;
        pointer-events: none;
      }
      .confide-to-yin.is-visible {
        opacity: 1;
        transform: translate(-50%, 0);
        pointer-events: auto;
      }
      .confide-to-yin__title {
        margin: 0 0 8px;
        font-size: 1.05rem;
        font-weight: 600;
        letter-spacing: 0.01em;
      }
      .confide-to-yin__blurb {
        margin: 0 0 12px;
        font-size: 0.88rem;
        line-height: 1.45;
        opacity: 0.92;
      }
      .confide-to-yin__memory-consent {
        margin: 10px 0 4px;
        padding: 10px 12px;
        border-radius: 12px;
        background: ${GLASS_FILL_STRONG};
        border: 1px solid rgba(122, 83, 64, 0.18);
      }
      .confide-to-yin__memory-consent-copy {
        margin: 0 0 10px;
        font-size: 13px;
        line-height: 1.45;
        color: #5a4030;
      }
      .confide-to-yin__memory-consent-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .confide-to-yin__desktop-status {
        margin: 0 0 12px;
        padding: 10px 12px;
        border-radius: 12px;
        background: ${GLASS_FILL_STRONG};
      }
      .confide-to-yin__desktop-status[hidden] {
        display: none;
      }
      .confide-to-yin__desktop-status-copy {
        margin: 0;
        font-size: 0.82rem;
        line-height: 1.4;
        opacity: 0.92;
      }
      .confide-to-yin__desktop-model {
        margin: 6px 0 0;
        font-size: 0.72rem;
        line-height: 1.3;
        letter-spacing: 0.02em;
        opacity: 0.72;
      }
      .confide-to-yin__desktop-model[hidden] {
        display: none;
      }
      .confide-to-yin__desktop-progress {
        display: block;
        width: 100%;
        margin-top: 8px;
        height: 8px;
        border: none;
        border-radius: 999px;
        overflow: hidden;
        background: rgba(44, 31, 20, 0.12);
      }
      .confide-to-yin__desktop-progress[hidden] {
        display: none;
      }
      .confide-to-yin__input {
        width: 100%;
        box-sizing: border-box;
        margin: 0 0 12px;
        padding: 10px 12px;
        border-radius: 12px;
        border: ${GLASS_BORDER};
        background: ${GLASS_FILL_STRONG};
        color: inherit;
        font: inherit;
        resize: vertical;
        min-height: 72px;
      }
      .confide-to-yin__user {
        margin: 0 0 8px;
        padding: 10px 12px;
        border-radius: 12px;
        border: 1px solid #d4a24a;
        background: ${GLASS_FILL_STRONG};
        font-size: 0.92rem;
        line-height: 1.45;
      }
      .confide-to-yin__user[hidden] {
        display: none;
      }
      .confide-to-yin__reply {
        position: relative;
        margin: 0 0 12px;
        padding: 10px 12px 10px 16px;
        border-radius: 12px;
        background: ${GLASS_FILL_STRONG};
        font-size: 0.92rem;
        line-height: 1.45;
      }
      .confide-to-yin__reply::before {
        content: '';
        display: none;
        position: absolute;
        left: 0;
        top: 8px;
        bottom: 8px;
        width: 3px;
        border-radius: 999px;
      }
      .confide-to-yin__reply[data-source='generate']::before,
      .confide-to-yin__reply[data-source='practice_facts']::before,
      .confide-to-yin__reply[data-route='${CONFIDE_ROUTE.FALLBACK}']::before {
        display: block;
        background: #d4a24a;
      }
      .confide-to-yin__reply[data-route='${CONFIDE_ROUTE.SAFETY_REDIRECT}']::before {
        display: block;
        background: #7a5340;
      }
      .confide-to-yin__actions {
        display: flex;
        gap: 8px;
        justify-content: space-between;
        align-items: center;
      }
      .confide-to-yin__actions-end {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .confide-to-yin__btn {
        appearance: none;
        border: ${GLASS_BORDER};
        border-radius: 999px;
        padding: 8px 14px;
        font: inherit;
        cursor: pointer;
        background: ${GLASS_FILL_STRONG};
        color: inherit;
      }
      .confide-to-yin__btn:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }
      .confide-to-yin__btn--primary {
        background: #2c1f14;
        color: #f7f1e8;
        border-color: transparent;
      }
      .confide-to-yin__btn--ghost {
        background: transparent;
      }
    `;
    document.head.appendChild(style);
  }
}
