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
import {
  resolveConfideReply,
  resolveCorpusFallbackAfterGenerateFailure
} from '../core/confide/confideReplyFlow.js';
import {
  CONSECUTIVE_GENERATE_FALLBACK_WARN_AT,
  lastRepeatableYinReplyText,
  nextGenerateFailStreak
} from '../core/confide/confideReplyUniqueness.js';
import { buildPracticeFactsReply } from '../core/confide/confidePracticeFacts.js';
import { buildPresenceFactsReply } from '../core/confide/confidePresenceFacts.js';
import { formatMemoryListReply } from '../core/confide/confideMemoryList.js';
import {
  CONFIDE_TOOL_ID,
  isConfideHybridExecutableReadTool,
  matchConfideExecutableTool
} from '../core/confide/confideExecutableTools.js';
import { mayUseConfideReadHybrid, resolveConfideReadHybridToolFromRaw } from '../core/confide/confideReadHybrid.js';
import { listShippedConfideVerbalHintChips } from '../core/confide/confideVerbalHintChips.js';
import { buildConfideReadHybridPrompt } from '../core/confide/confideToolCallParse.js';
import {
  readYpeCompanionStyle,
  ypeBuildJourneyInsights,
  ypeInsightsForGenerate,
  ypeMayUseCompanionGenerate
} from '../core/yinPersonalizationEngine.js';
import { readJourneyLog } from '../core/journeyLogGate.js';
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
  forgetYinPersonalMemoryEntry,
  hasYinPersonalMemoryBridge,
  recordYinPersonalMemoryOptOut,
  rememberYinPersonalMemoryFromConfide,
  saveYinPersonalMemoryConsent,
  suppressYinPersonalMemoryPostRecall
} from '../core/yinPersonalMemoryBridge.js';
import {
  canRememberYinPersonalMemory,
  shouldOfferYinMemoryConsent
} from '../core/yinPersonalMemory/yinPersonalMemoryConsent.js';
import {
  formatVerbalForgetReply,
  resolveVerbalForgetTarget
} from '../core/yinPersonalMemory/yinPersonalMemoryVerbalForget.js';
import {
  formatConfideBoundaryReply,
  shouldHandleConfideBoundary
} from '../core/confide/confideBoundaryRespect.js';
import {
  formatConfideCompanionPresenceReply,
  shouldHandleConfideCompanionPresence
} from '../core/confide/confideCompanionPresence.js';
import {
  formatConfidePreferenceHonestyReply,
  shouldHandleConfidePreferenceHonesty
} from '../core/confide/confidePreferenceHonesty.js';
import {
  buildConfideTurnId,
  formatMemorySuppressReply,
  shouldHandlePostRecallMemorySuppress,
  shouldHandleStandaloneMemorySuppress
} from '../core/yinPersonalMemory/yinPersonalMemorySuppress.js';

const STYLE_ID = 'confide-to-yin-card-styles-v3';
const FADE_MS = 220;

export class ConfideToYinUI {
  /**
   * @param {HTMLElement} mountRoot
   * @param {object} [handlers]
   * @param {() => void} [handlers.onOpen]
   * @param {() => void} [handlers.onClose]
   * @param {(info: { route: string, lineId: string, source?: string }) => void} [handlers.onReplied]
   * @param {() => boolean} [handlers.canOpen]
   * @param {() => void} [handlers.onOpenMemoryPanel]
   * @param {(memoryId: string) => void} [handlers.onMemoryForgotten]
   * @param {() => void} [handlers.onMemoryRemembered]
   */
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    this._open = false;
    this._sessionExclude = new Set();
    this._generateFailStreak = 0;
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

    this.chipWrap = document.createElement('div');
    this.chipWrap.className = 'confide-to-yin__chips';
    this.chipWrap.dataset.testid = 'confide-to-yin-verbal-chips';
    this.chipWrap.hidden = true;

    this.chipIntro = document.createElement('p');
    this.chipIntro.className = 'confide-to-yin__chips-intro';

    this.chipRow = document.createElement('div');
    this.chipRow.className = 'confide-to-yin__chips-row';
    this.chipWrap.append(this.chipIntro, this.chipRow);

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

    this.memoryConsentTitle = document.createElement('p');
    this.memoryConsentTitle.className = 'confide-to-yin__memory-consent-title';
    this.memoryConsentTitle.dataset.testid = 'confide-to-yin-memory-consent-title';

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
    this.memoryConsentWrap.append(
      this.memoryConsentTitle,
      this.memoryConsentCopy,
      this.memoryConsentActions
    );

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

    this.memoryListLink = document.createElement('button');
    this.memoryListLink.type = 'button';
    this.memoryListLink.className = 'confide-to-yin__memory-list-link';
    this.memoryListLink.dataset.testid = 'confide-to-yin-memory-list-link';
    this.memoryListLink.hidden = !hasYinPersonalMemoryBridge();
    this.memoryListLink.addEventListener('click', () => this.handlers.onOpenMemoryPanel?.());

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
      this.chipWrap,
      this.statusWrap,
      this.memoryConsentWrap,
      this.inputEl,
      this.userEl,
      this.replyEl,
      this.memoryListLink,
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
    this._sessionExclude = new Set();
    this._generateFailStreak = 0;
    this._pendingL3Send = null;
    this._memoryConsentSaving = false;
    this._hideMemoryConsent();
    this._sendEpoch += 1;
    this._sending = false;
    this._syncSendEnabled();
    this._syncGenerateLayerForViewport({ ensure: true });
    void this._refreshMemoryState().then(() => {
      if (!this._open) return;
      this._maybeOfferMemoryConsentOnOpen();
    });
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
    this._sessionExclude = new Set();
    this._generateFailStreak = 0;
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
    this._renderVerbalHintChips();
    this.inputEl.placeholder = t('CONFIDE_PANEL_PLACEHOLDER');
    this.sendBtn.textContent = t('CONFIDE_PANEL_SEND');
    this.cancelBtn.textContent = t('CONFIDE_PANEL_CANCEL');
    this.closeBtn.textContent = t('CONFIDE_PANEL_CLOSE');
    this.memoryConsentCopy.textContent = t('YIN_MEMORY_CONSENT_BLURB');
    this.memoryConsentTitle.textContent = t('YIN_MEMORY_CONSENT_TITLE');
    this.memoryConsentAllowBtn.textContent = t('YIN_MEMORY_CONSENT_ALLOW');
    this.memoryConsentDenyBtn.textContent = t('YIN_MEMORY_CONSENT_DENY');
    if (this.memoryListLink) {
      this.memoryListLink.textContent = t('YIN_MEMORY_PANEL_LINK');
      this.memoryListLink.hidden = !hasYinPersonalMemoryBridge();
    }
    this._renderDesktopStatus();
  }

  _renderVerbalHintChips() {
    const chips = listShippedConfideVerbalHintChips({
      hasMemoryBridge: hasYinPersonalMemoryBridge()
    });
    this.chipRow.replaceChildren();
    if (chips.length === 0) {
      this.chipWrap.hidden = true;
      this.chipIntro.textContent = '';
      return;
    }
    this.chipWrap.hidden = false;
    this.chipIntro.textContent = t('CONFIDE_CHIP_INTRO');
    for (const chip of chips) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'confide-to-yin__chip';
      btn.dataset.testid = 'confide-to-yin-verbal-chip';
      btn.dataset.chipId = chip.id;
      btn.textContent = t(chip.fillKey);
      btn.addEventListener('click', () => this._fillVerbalHintChip(chip.fillKey));
      this.chipRow.append(btn);
    }
  }

  /**
   * @param {string} fillKey
   */
  _fillVerbalHintChip(fillKey) {
    const fill = t(fillKey);
    this.inputEl.value = fill;
    this._syncSendEnabled();
    this.inputEl.focus();
  }

  _syncSendEnabled() {
    const ok = canSubmitConfideText(this.inputEl.value);
    const consentPending =
      Boolean(this.memoryConsentWrap) && !this.memoryConsentWrap.hidden;
    this.sendBtn.disabled = this._sending || !ok || consentPending;
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
            : shown.source === 'presence_facts'
              ? 'presence_facts'
              : shown.source === 'memory_list'
                ? 'memory_list'
                : shown.source === 'memory_forget'
                ? 'memory_forget'
                : shown.source === 'memory_suppress'
                  ? 'memory_suppress'
                  : shown.source === 'boundary'
                    ? 'boundary'
                    : shown.source === 'companion_presence'
                      ? 'companion_presence'
                      : shown.source === 'preference_honesty'
                        ? 'preference_honesty'
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

  /**
   * @param {string} text
   * @param {{ route: string, line: object }} hit
   */
  async _handleVerbalForget(text, hit) {
    const resolved = resolveVerbalForgetTarget(this._memoryState, text);
    if (!resolved) return;

    if (resolved.outcome === 'forgotten' && resolved.memoryId) {
      this._memoryState = await forgetYinPersonalMemoryEntry(resolved.memoryId);
      this.handlers.onMemoryForgotten?.(resolved.memoryId);
    }

    const replyText = formatVerbalForgetReply(
      resolved.outcome,
      resolved.summary,
      t
    );
    this._showReply(
      {
        route: hit.route,
        text: replyText,
        source: 'memory_forget'
      },
      text
    );
  }


  /**
   * @param {string} text
   * @param {object} hit
   */
  async _handleMemorySuppressStandalone(text, hit) {
    if (hasYinPersonalMemoryBridge()) {
      const turnOrdinal = Math.floor(this._l2Turns.length / 2);
      this._memoryState = await recordYinPersonalMemoryOptOut({
        turnId: buildConfideTurnId(turnOrdinal),
        scope: 'turn'
      });
    }
    this._showReply(
      {
        route: hit.route,
        text: formatMemorySuppressReply('turn_opt_out', t),
        source: 'memory_suppress'
      },
      text
    );
  }

  /**
   * @param {string} text
   * @param {object} hit
   */
  async _handleMemorySuppressPostRecall(text, hit) {
    if (!hasYinPersonalMemoryBridge()) {
      this._showReply(
        {
          route: hit.route,
          text: formatMemorySuppressReply('no_match', t),
          source: 'memory_suppress'
        },
        text
      );
      return;
    }
    const currentTurnOrdinal = Math.floor(this._l2Turns.length / 2);
    const previousTurnOrdinal = currentTurnOrdinal - 1;
    const result = await suppressYinPersonalMemoryPostRecall({
      previousTurnOrdinal,
      currentTurnOrdinal
    });
    this._memoryState = result.state;
    if (result.outcome === 'suppressed') {
      const removed = result.state.memories.length;
      void removed;
      this.handlers.onMemoryForgotten?.('post-recall');
    }
    this._showReply(
      {
        route: hit.route,
        text: formatMemorySuppressReply(result.outcome, t),
        source: 'memory_suppress'
      },
      text
    );
  }

  _hideMemoryConsent() {
    if (!this.memoryConsentWrap) return;
    this.memoryConsentWrap.hidden = true;
    this._syncSendEnabled();
  }

  /** First open only — before any L3 send (SCENARIO AG · Slice 1a). */
  _maybeOfferMemoryConsentOnOpen() {
    if (!hasYinPersonalMemoryBridge()) return;
    if (!shouldOfferYinMemoryConsent(this._memoryState)) return;
    this._pendingL3Send = null;
    this.memoryConsentWrap.hidden = false;
    this.memoryConsentAllowBtn.disabled = this._memoryConsentSaving;
    this.memoryConsentDenyBtn.disabled = this._memoryConsentSaving;
    this._syncSendEnabled();
  }

  /**
   * @param {{ text: string, hit: object, locale: string, corpusText: string }} payload
   */
  _offerMemoryConsentBeforeL3(payload) {
    this._pendingL3Send = payload;
    this.memoryConsentWrap.hidden = false;
    this.memoryConsentAllowBtn.disabled = this._memoryConsentSaving;
    this.memoryConsentDenyBtn.disabled = this._memoryConsentSaving;
    this._syncSendEnabled();
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
      this.handlers.onMemoryRemembered?.();
    });
  }

  /**
   * @param {{ hit: object, locale: string, text: string, corpusText: string }} payload
   */
  _showGenerateFailureFallback(payload) {
    const { hit, locale, text, corpusText } = payload;
    if (hit?.line?.id) this._sessionExclude.add(hit.line.id);
    this._generateFailStreak = nextGenerateFailStreak(
      this._generateFailStreak,
      false
    );
    if (this._generateFailStreak >= CONSECUTIVE_GENERATE_FALLBACK_WARN_AT) {
      console.info('[focus-tiger][confide] consecutive generate fallback', {
        streak: this._generateFailStreak
      });
    }
    const picked = resolveCorpusFallbackAfterGenerateFailure({
      locale,
      localDate: formatLocalDateYmd(),
      salt: this._l2Turns.length,
      excludeIds: this._sessionExclude,
      history: this._l2Turns,
      failedLineId: hit?.line?.id || ''
    });
    if (picked) {
      this._sessionExclude.add(picked.line.id);
      this._showReply(
        {
          route: picked.route,
          line: picked.line,
          text: picked.text,
          source: 'corpus'
        },
        text
      );
      return;
    }
    this._showReply(
      {
        route: hit?.line ? hit.route : 'fallback',
        line: hit?.line,
        text: corpusText,
        source: 'corpus'
      },
      text
    );
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
      this._companion.generate({
        text,
        locale,
        history,
        companionStyle: readYpeCompanionStyle(
          typeof localStorage !== 'undefined' ? localStorage : null
        ),
        patternInsights: ypeInsightsForGenerate(
          readYpeCompanionStyle(
            typeof localStorage !== 'undefined' ? localStorage : null
          ),
          ypeBuildJourneyInsights(
            readJourneyLog(typeof localStorage !== 'undefined' ? localStorage : null)
          )
        )
      })
    )
      .then((result) => {
        if (!this._open || epoch !== this._sendEpoch) return;
        if (result?.ok && result.text) {
          this._generateFailStreak = nextGenerateFailStreak(
            this._generateFailStreak,
            true
          );
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
        this._showGenerateFailureFallback({
          hit,
          locale,
          text,
          corpusText
        });
      })
      .catch(() => {
        if (!this._open || epoch !== this._sendEpoch) return;
        this._showGenerateFailureFallback({
          hit,
          locale,
          text,
          corpusText
        });
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
      salt: this._l2Turns.length,
      excludeIds: this._sessionExclude,
      excludeNormalizedTexts: [lastRepeatableYinReplyText(this._l2Turns)].filter(
        Boolean
      ),
      locale: getLocale()
    });
    if (!hit) return;
    const locale = getLocale();
    const corpusText = confideLineText(hit.line, locale);
    const turnOrdinal = Math.floor(this._l2Turns.length / 2);
    if (
      shouldHandlePostRecallMemorySuppress({
        route: hit.route,
        text,
        state: this._memoryState,
        hasBridge: hasYinPersonalMemoryBridge(),
        turnOrdinal
      })
    ) {
      void this._handleMemorySuppressPostRecall(text, hit);
      return;
    }
    if (
      shouldHandleStandaloneMemorySuppress({
        route: hit.route,
        text,
        state: this._memoryState,
        hasBridge: hasYinPersonalMemoryBridge(),
        turnOrdinal
      })
    ) {
      void this._handleMemorySuppressStandalone(text, hit);
      return;
    }
    if (
      shouldHandleConfideBoundary({
        route: hit.route,
        text,
        memoryState: this._memoryState,
        hasBridge: hasYinPersonalMemoryBridge()
      })
    ) {
      this._showReply(
        {
          route: hit.route,
          text: formatConfideBoundaryReply(t),
          source: 'boundary'
        },
        text
      );
      return;
    }
    if (shouldHandleConfideCompanionPresence({ route: hit.route, text })) {
      this._showReply(
        {
          route: hit.route,
          text: formatConfideCompanionPresenceReply(t),
          source: 'companion_presence'
        },
        text
      );
      return;
    }
    if (shouldHandleConfidePreferenceHonesty({ route: hit.route, text })) {
      this._showReply(
        {
          route: hit.route,
          text: formatConfidePreferenceHonestyReply(t),
          source: 'preference_honesty'
        },
        text
      );
      return;
    }
    const tool = matchConfideExecutableTool({
      route: hit.route,
      text,
      memoryState: this._memoryState,
      hasBridge: hasYinPersonalMemoryBridge()
    });
    if (tool) {
      this._executeConfideTool(tool, hit, text);
      return;
    }
    const routePayload = { text, hit, locale, corpusText };
    if (
      mayUseConfideReadHybrid({
        route: hit.route,
        regexTool: null,
        hasBridge: Boolean(this._companion) || hasDesktopCompanionBridge(),
        hasClassifyFn:
          Boolean(this._companion) &&
          typeof this._companion.classifyReadTool === 'function',
        wideViewport: this._viewportAllowsGenerateLayer(),
        focusing: Boolean(this._companionStatus?.focusing)
      })
    ) {
      void this._tryReadHybridThenContinue(routePayload);
      return;
    }
    this._continueAfterToolRouting(routePayload);
  }

  /**
   * @param {{ id: string }} tool
   * @param {object} hit
   * @param {string} text
   */
  _executeConfideTool(tool, hit, text) {
    if (tool.id === CONFIDE_TOOL_ID.QUERY_PRACTICE_DURATION) {
      const factsText = buildPracticeFactsReply(
        this._practiceDaysStore,
        typeof localStorage !== 'undefined' ? localStorage : null,
        t,
        text
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
    if (tool.id === CONFIDE_TOOL_ID.QUERY_PRESENCE_TREND) {
      const storage =
        typeof localStorage !== 'undefined' ? localStorage : null;
      const factsText = buildPresenceFactsReply(storage, t, text);
      this._showReply(
        {
          route: hit.route,
          text: factsText,
          source: 'presence_facts'
        },
        text
      );
      return;
    }
    if (tool.id === CONFIDE_TOOL_ID.QUERY_MEMORY_LIST) {
      const factsText = formatMemoryListReply(this._memoryState, t);
      this._showReply(
        {
          route: hit.route,
          text: factsText,
          source: 'memory_list'
        },
        text
      );
      return;
    }
    if (tool.id === CONFIDE_TOOL_ID.FORGET_MEMORY_ENTRY) {
      void this._handleVerbalForget(text, hit);
    }
  }

  /**
   * Regex miss → L0 read-only classify → registry execute or fall through.
   * @param {{ text: string, hit: object, locale: string, corpusText: string }} payload
   */
  _tryReadHybridThenContinue(payload) {
    const { text, hit, locale, corpusText } = payload;
    this._sending = true;
    const epoch = this._sendEpoch;
    this.sendBtn.disabled = true;
    this._renderDesktopStatus();
    void Promise.resolve(
      this._companion.classifyReadTool({
        prompt: buildConfideReadHybridPrompt(text)
      })
    )
      .then((result) => {
        if (!this._open || epoch !== this._sendEpoch) return 'aborted';
        const tool =
          result?.ok && result.raw
            ? resolveConfideReadHybridToolFromRaw(result.raw)
            : null;
        if (tool && isConfideHybridExecutableReadTool(tool)) {
          this._executeConfideTool(tool, hit, text);
          return 'sync';
        }
        return this._continueAfterToolRouting(payload);
      })
      .catch(() => {
        if (!this._open || epoch !== this._sendEpoch) return 'aborted';
        return this._continueAfterToolRouting(payload);
      })
      .then((outcome) => {
        if (epoch !== this._sendEpoch) return;
        if (outcome === 'l3') return;
        this._sending = false;
        this._syncSendEnabled();
        this._renderDesktopStatus();
      });
  }

  /**
   * @param {{ text: string, hit: object, locale: string, corpusText: string }} payload
   * @returns {'l3' | 'consent' | 'sync'}
   */
  _continueAfterToolRouting(payload) {
    const { text, hit, locale, corpusText } = payload;
    const wantGenerate = ypeMayUseCompanionGenerate({
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
      return 'sync';
    }
    if (
      hasYinPersonalMemoryBridge() &&
      shouldOfferYinMemoryConsent(this._memoryState)
    ) {
      this._offerMemoryConsentBeforeL3({ text, hit, locale, corpusText });
      return 'consent';
    }
    this._runL3Generate({ text, hit, locale, corpusText });
    return 'l3';
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
      .confide-to-yin__chips {
        margin: -4px 0 12px;
      }
      .confide-to-yin__chips-intro {
        margin: 0 0 8px;
        font-size: 0.76rem;
        line-height: 1.4;
        opacity: 0.78;
      }
      .confide-to-yin__chips-row {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .confide-to-yin__chip {
        appearance: none;
        margin: 0;
        padding: 6px 10px;
        border-radius: 999px;
        border: 1px solid rgba(139, 115, 85, 0.28);
        background: ${GLASS_FILL_STRONG};
        color: inherit;
        font: inherit;
        font-size: 0.76rem;
        line-height: 1.3;
        cursor: pointer;
        transition: transform 120ms ease, opacity 120ms ease;
      }
      .confide-to-yin__chip:active {
        opacity: 0.92;
        transform: translateY(1px);
      }
      .confide-to-yin__memory-consent {
        margin: 10px 0 4px;
        padding: 10px 12px;
        border-radius: 12px;
        background: ${GLASS_FILL_STRONG};
        border: 1px solid rgba(122, 83, 64, 0.18);
      }
      .confide-to-yin__memory-consent-title {
        margin: 0 0 6px;
        font-size: 0.9rem;
        font-weight: 600;
        line-height: 1.35;
        color: #2c1f14;
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
      .confide-to-yin__memory-list-link {
        appearance: none;
        border: none;
        background: transparent;
        color: inherit;
        font: inherit;
        font-size: 0.78rem;
        opacity: 0.76;
        cursor: pointer;
        padding: 0;
        margin: 4px 0 10px;
        text-align: left;
        text-decoration: underline;
        text-underline-offset: 2px;
        transition: transform 120ms ease, opacity 120ms ease;
      }
      .confide-to-yin__memory-list-link:active {
        opacity: 1;
        transform: translateY(1px);
      }
      .confide-to-yin__memory-list-link[hidden] {
        display: none !important;
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
      .confide-to-yin__reply[data-source='presence_facts']::before,
      .confide-to-yin__reply[data-source='companion_presence']::before,
      .confide-to-yin__reply[data-source='preference_honesty']::before,
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
