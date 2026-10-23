/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Help Center — browsable user topics (menu + Idle chrome beside ?;
 * the question mark itself stays the purpose card).
 * Brief: docs/task-briefs/task-user-help-center.md
 *        docs/task-briefs/task-help-center-beside-question.md
 *        docs/task-briefs/task-help-center-operating-commands.md
 */

import { getLocale, setLocale, t, onLocaleChange } from '../locales/i18n.js';
import { listPickerLocales } from '../locales/localePreference.js';
import {
  HELP_CENTER_SECTIONS,
  findHelpCenterArticle,
  listHelpCenterArticlesForSection
} from '../core/helpCenterCatalog.js';
import {
  resolveHelpCenterAskSubmitPolicy,
  searchHelpCenterAskCards
} from '../core/helpCenterAskSearch.js';
import { getDesktopCompanionBridge } from '../core/desktopCompanionGate.js';
import { downloadPracticeExport } from '../core/practiceBackup/practiceBackupLocalIo.js';
import {
  classifyYinVoiceConfirmReply,
  nextPickerLocaleId
} from '../core/yinVoiceCommandEntry.js';
import { runYinVoiceCommand } from '../core/yinVoiceCommandRunner.js';
import {
  getSystemTtsBridge,
  mapLocaleToTtsLocale,
  speakSystemTts
} from '../core/systemTtsBridge.js';
import { VoiceInputChrome } from './VoiceInputChrome.js';
import { OVERLAY_OUTSIDE_DISMISS } from '../core/overlaySlotContractRegistry.js';
import {
  GLASS_BLUR_CSS,
  GLASS_BORDER,
  GLASS_FILL,
  GLASS_FILL_STRONG,
  GLASS_RADIUS,
  GLASS_SHADOW
} from './glassPanelStyles.js';
import {
  OVERLAY_BACKDROP_FADE_MS,
  createOverlayBackdrop,
  hideOverlayBackdrop,
  showOverlayBackdrop
} from './overlayBackdrop.js';
import { pushOverlayEscapeLayer } from '../core/overlayEscapeStack.js';
import { Z } from './zIndexLayers.js';

const STYLE_ID = 'help-center-ui-styles-v1';
const FADE_MS = OVERLAY_BACKDROP_FADE_MS;

export class HelpCenterUI {
  /**
   * @param {HTMLElement} mountRoot
   * @param {object} [handlers]
   * @param {() => void} [handlers.onOpen]
   * @param {() => void} [handlers.onClose]
   */
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    this._open = false;
    /** @type {string | null} */
    this._activeArticleId = null;
    /** @type {(() => void) | null} */
    this._popEscapeLayer = null;

    this.backdrop = createOverlayBackdrop(mountRoot, {
      id: 'help-center-backdrop',
      testId: 'help-center-backdrop',
      zIndex: Z.OVERLAY_DIM,
      outsideDismiss: OVERLAY_OUTSIDE_DISMISS.BLANK_CLOSES,
      onDismiss: () => this.close()
    });

    this.root = document.createElement('div');
    this.root.id = 'help-center';
    this.root.className = 'help-center';
    this.root.hidden = true;
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'help-center-title');
    this.root.dataset.testid = 'help-center';

    this.header = document.createElement('div');
    this.header.className = 'help-center__header';

    this.backBtn = document.createElement('button');
    this.backBtn.type = 'button';
    this.backBtn.className = 'help-center__back';
    this.backBtn.dataset.testid = 'help-center-back';
    this.backBtn.hidden = true;
    this.backBtn.addEventListener('click', () => this._showIndex());

    this.titleEl = document.createElement('p');
    this.titleEl.id = 'help-center-title';
    this.titleEl.className = 'help-center__title';

    this.closeBtn = document.createElement('button');
    this.closeBtn.type = 'button';
    this.closeBtn.className = 'help-center__close';
    this.closeBtn.dataset.testid = 'help-center-close';
    this.closeBtn.addEventListener('click', () => this.close());

    this.header.append(this.backBtn, this.titleEl, this.closeBtn);

    this.askSection = document.createElement('section');
    this.askSection.className = 'help-center__ask';
    this.askSection.dataset.testid = 'help-center-ask';

    this.askLabelEl = document.createElement('p');
    this.askLabelEl.className = 'help-center__ask-label';

    this.askRow = document.createElement('div');
    this.askRow.className = 'help-center__ask-row';

    this.askInput = document.createElement('input');
    this.askInput.type = 'search';
    this.askInput.className = 'help-center__ask-input';
    this.askInput.dataset.testid = 'help-center-ask-input';
    this.askInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        void this._submitAsk();
      }
    });

    this.askSubmitBtn = document.createElement('button');
    this.askSubmitBtn.type = 'button';
    this.askSubmitBtn.className = 'help-center__ask-submit';
    this.askSubmitBtn.dataset.testid = 'help-center-ask-submit';
    this.askSubmitBtn.addEventListener('click', () => void this._submitAsk());

    this.askRow.append(this.askInput, this.askSubmitBtn);

    this.askStatusEl = document.createElement('p');
    this.askStatusEl.className = 'help-center__ask-status';
    this.askStatusEl.dataset.testid = 'help-center-ask-status';
    this.askStatusEl.hidden = true;

    this.askResultsEl = document.createElement('div');
    this.askResultsEl.className = 'help-center__ask-results';
    this.askResultsEl.dataset.testid = 'help-center-ask-results';
    this.askResultsEl.hidden = true;

    this.operatingEl = document.createElement('div');
    this.operatingEl.className = 'help-center__operating';
    this.operatingEl.dataset.testid = 'help-center-operating';
    this.operatingEl.hidden = true;

    this.operatingLineEl = document.createElement('p');
    this.operatingLineEl.className = 'help-center__operating-line';
    this.operatingLineEl.dataset.testid = 'help-center-operating-line';

    this.operatingActionsEl = document.createElement('div');
    this.operatingActionsEl.className = 'help-center__operating-actions';

    this.operatingConfirmBtn = document.createElement('button');
    this.operatingConfirmBtn.type = 'button';
    this.operatingConfirmBtn.className = 'help-center__operating-confirm';
    this.operatingConfirmBtn.dataset.testid = 'help-center-operating-confirm';
    this.operatingConfirmBtn.addEventListener('click', () => {
      this.operatingActionsEl.hidden = true;
      this._resolveOperatingListen(this._operatingConfirmTranscript());
    });

    this.operatingCancelBtn = document.createElement('button');
    this.operatingCancelBtn.type = 'button';
    this.operatingCancelBtn.className = 'help-center__operating-cancel';
    this.operatingCancelBtn.dataset.testid = 'help-center-operating-cancel';
    this.operatingCancelBtn.addEventListener('click', () => {
      this.operatingActionsEl.hidden = true;
      this._resolveOperatingListen('cancel');
    });

    this.operatingActionsEl.append(this.operatingConfirmBtn, this.operatingCancelBtn);
    this.operatingEl.append(this.operatingLineEl, this.operatingActionsEl);

    this.askSection.append(
      this.askLabelEl,
      this.askRow,
      this.askStatusEl,
      this.operatingEl,
      this.askResultsEl
    );

    this._voiceInputChrome = new VoiceInputChrome({
      textarea: this.askInput,
      mountParent: this.askSection,
      mountBefore: this.askStatusEl,
      testIdPrefix: 'help-center-voice-input',
      onInputApplied: () => {
        this._askSearching = false;
        this._syncAskStatus();
      }
    });

    this.introEl = document.createElement('p');
    this.introEl.className = 'help-center__intro';
    this.introEl.dataset.testid = 'help-center-intro';

    this.confideNoteEl = document.createElement('p');
    this.confideNoteEl.className = 'help-center__confide-note';
    this.confideNoteEl.dataset.testid = 'help-center-confide-note';

    this.indexEl = document.createElement('div');
    this.indexEl.className = 'help-center__index';
    this.indexEl.dataset.testid = 'help-center-index';

    this.articleEl = document.createElement('article');
    this.articleEl.className = 'help-center__article';
    this.articleEl.hidden = true;
    this.articleEl.dataset.testid = 'help-center-article';

    this.articleTitleEl = document.createElement('h2');
    this.articleTitleEl.className = 'help-center__article-title';

    this.articleBodyEl = document.createElement('div');
    this.articleBodyEl.className = 'help-center__article-body';

    this.articleEl.append(this.articleTitleEl, this.articleBodyEl);

    this.root.append(
      this.header,
      this.askSection,
      this.introEl,
      this.indexEl,
      this.articleEl,
      this.confideNoteEl
    );

    /** @type {string[]} */
    this._askResultArticleIds = [];
    this._askSearching = false;
    this._askSubmitEpoch = 0;
    this._operatingEpoch = 0;
    /** @type {object | null} */
    this._operatingDecision = null;
    /** @type {((transcript: string) => void) | null} */
    this._operatingListenResolve = null;
    /** @type {ReturnType<typeof setTimeout> | null} */
    this._operatingListenTimer = null;
    /** @type {string | null} */
    this._operatingPendingReply = null;
    /** @type {(() => void) | null} */
    this._operatingSpeakWaitResolve = null;

    mountRoot.append(this.root);
    this._localeOff = onLocaleChange(() => {
      if (this._open) this._render();
    });
    this._injectStyles();
  }

  isOpen() {
    return this._open;
  }

  /**
   * @param {{ resume?: boolean }} [opts]
   * Menu re-open resets to the topic index. Idle chrome beside `?` passes
   * `resume: true` so an already-open card stays put and comes to front.
   */
  open({ resume = false } = {}) {
    if (this._open) {
      if (!resume) this._showIndex();
      return;
    }
    this._open = true;
    this._activeArticleId = null;
    this.root.hidden = false;
    showOverlayBackdrop(this.backdrop);
    this._popEscapeLayer?.();
    this._popEscapeLayer = pushOverlayEscapeLayer({
      id: 'help-center',
      dismiss: () => this.close()
    });
    this._showIndex();
    this.handlers.onOpen?.();
  }

  close() {
    if (!this._open) return;
    this._cancelOperatingListen('cancel');
    this._open = false;
    this._activeArticleId = null;
    this.root.hidden = true;
    this._popEscapeLayer?.();
    this._popEscapeLayer = null;
    hideOverlayBackdrop(this.backdrop, { fadeMs: FADE_MS });
    this.handlers.onClose?.();
  }

  _showIndex() {
    this._activeArticleId = null;
    this.backBtn.hidden = true;
    this.askSection.hidden = false;
    this.indexEl.hidden = false;
    this.articleEl.hidden = true;
    this.confideNoteEl.hidden = false;
    this._render();
  }

  /**
   * @param {string} articleId
   */
  _openArticle(articleId) {
    const row = findHelpCenterArticle(articleId);
    if (!row) return;
    this._activeArticleId = articleId;
    this.backBtn.hidden = false;
    this.askSection.hidden = true;
    this.indexEl.hidden = true;
    this.articleEl.hidden = false;
    this.confideNoteEl.hidden = true;
    this._render();
  }

  _syncAskStatus() {
    const searching = this._askSearching;
    this.askStatusEl.hidden = !searching;
    this.askStatusEl.textContent = searching ? t('HELP_CENTER_ASK_SEARCHING') : '';
    this.askSubmitBtn.disabled = searching;
  }

  async _fetchAskEmbeddingGate(text) {
    const companion = getDesktopCompanionBridge();
    if (!companion || typeof companion.semanticProductKnowledgeGate !== 'function') {
      return { embeddingState: 'not_ready' };
    }
    try {
      const gate = await companion.semanticProductKnowledgeGate({ text });
      if (gate?.ok) {
        return {
          embeddingState: 'ready',
          nearestId: gate.nearestId ?? null,
          nearestScore: gate.nearestScore ?? null,
          leadMargin: gate.leadMargin ?? null,
          helpNearestId: gate.helpNearestId ?? null,
          helpNearestScore: gate.helpNearestScore ?? null
        };
      }
      if (gate?.reason === 'embed_not_ready') {
        return { embeddingState: 'not_ready' };
      }
      return { embeddingState: 'error' };
    } catch {
      return { embeddingState: 'error' };
    }
  }

  async _submitAsk() {
    const text = String(this.askInput.value || '').trim();
    if (this._operatingListenResolve) {
      const replyKind = classifyYinVoiceConfirmReply(text);
      if (text && replyKind !== 'empty') {
        this._resolveOperatingListen(text);
        this.askInput.value = '';
        return;
      }
    }
    if (!text) {
      this._askResultArticleIds = [];
      this._hideOperatingPanel();
      this._renderAskResults();
      return;
    }
    const policy = resolveHelpCenterAskSubmitPolicy(text);
    if (policy.reason === 'safety') {
      this._askResultArticleIds = [];
      this._hideOperatingPanel();
      this._askSearching = false;
      this._syncAskStatus();
      this._renderAskResults(true);
      return;
    }
    if (policy.shouldExecute && policy.decision) {
      this._askSearching = false;
      this._askResultArticleIds = [];
      this._renderAskResults();
      this._syncAskStatus();
      await this._runOperatingCommand(policy.decision);
      return;
    }

    const epoch = ++this._askSubmitEpoch;
    this._hideOperatingPanel();
    this._askSearching = true;
    this._syncAskStatus();
    const embed = await this._fetchAskEmbeddingGate(text);
    if (epoch !== this._askSubmitEpoch || !this._open) return;
    const result = searchHelpCenterAskCards(text, embed);
    this._askResultArticleIds = result.articleIds;
    this._askSearching = false;
    this._syncAskStatus();
    this._renderAskResults(result.empty);
  }

  _operatingConfirmTranscript() {
    return this._operatingDecision?.command === 'forget_all'
      ? 'Yes, forget everything'
      : 'yes';
  }

  _hideOperatingPanel() {
    this.operatingEl.hidden = true;
    this.operatingLineEl.textContent = '';
    this.operatingActionsEl.hidden = true;
  }

  _syncOperatingLabels() {
    const forget = this._operatingDecision?.command === 'forget_all';
    this.operatingConfirmBtn.textContent = forget
      ? t('HELP_CENTER_OPERATING_FORGET_CONFIRM')
      : t('HELP_CENTER_OPERATING_CONFIRM');
    this.operatingCancelBtn.textContent = t('HELP_CENTER_OPERATING_CANCEL');
  }

  /**
   * @param {string} transcript
   */
  _resolveOperatingListen(transcript) {
    const said = String(transcript || '');
    this._operatingPendingReply = said;
    if (this._operatingSpeakWaitResolve) {
      const finishSpeak = this._operatingSpeakWaitResolve;
      this._operatingSpeakWaitResolve = null;
      finishSpeak();
    }
    if (!this._operatingListenResolve) return;
    const resolve = this._operatingListenResolve;
    this._operatingListenResolve = null;
    if (this._operatingListenTimer) {
      clearTimeout(this._operatingListenTimer);
      this._operatingListenTimer = null;
    }
    this._operatingPendingReply = null;
    resolve(said);
  }

  /**
   * @param {string} transcript
   */
  _cancelOperatingListen(transcript) {
    this._operatingEpoch += 1;
    this._resolveOperatingListen(transcript);
    this._operatingDecision = null;
    this._hideOperatingPanel();
  }

  /**
   * @param {object} decision
   */
  async _runOperatingCommand(decision) {
    const epoch = ++this._operatingEpoch;
    this._operatingPendingReply = null;
    this._operatingDecision = decision;
    this._syncOperatingLabels();
    await runYinVoiceCommand(decision, {
      show: (userText, sayKey) => {
        if (epoch !== this._operatingEpoch || !this._open) return;
        this._showOperatingLine(sayKey);
      },
      speakAndWait: (sayKey) => this._speakOperatingAndWait(sayKey),
      listen: (ms) => this._listenOperating(ms, epoch),
      writeBackup: () =>
        this.handlers.writeBackup
          ? this.handlers.writeBackup()
          : downloadPracticeExport(
              typeof localStorage !== 'undefined' ? localStorage : null
            ),
      openJourney: () => this.handlers.onOpenJourneyLog?.(),
      closeJourney: () => this.handlers.onCloseJourneyLog?.(),
      switchLanguage: (targetLocale) => this._switchOperatingLanguage(targetLocale)
    });
  }

  /**
   * @param {string} sayKey
   */
  _showOperatingLine(sayKey) {
    this.operatingEl.hidden = false;
    this.operatingLineEl.textContent = t(sayKey);
    this.operatingLineEl.dataset.lineId = sayKey;
    const waiting =
      sayKey === 'YIN_VOICE_BACKUP_RECAP' ||
      sayKey === 'YIN_VOICE_FORGET_RECAP' ||
      sayKey === 'YIN_VOICE_JOURNEY_OPENED' ||
      sayKey === 'YIN_VOICE_LANGUAGE_SWITCHED';
    this.operatingActionsEl.hidden = !waiting;
    this.operatingConfirmBtn.hidden =
      sayKey === 'YIN_VOICE_JOURNEY_OPENED' ||
      sayKey === 'YIN_VOICE_LANGUAGE_SWITCHED';
    this._syncOperatingLabels();
  }

  /**
   * @param {string} sayKey
   * @returns {Promise<boolean>}
   */
  async _speakOperatingAndWait(sayKey) {
    const line = t(sayKey);
    const spoke = speakSystemTts({
      text: line,
      locale: mapLocaleToTtsLocale(getLocale())
    });
    if (!spoke) return true;
    const bridge = getSystemTtsBridge();
    if (!bridge || typeof bridge.onStatus !== 'function') return true;
    return new Promise((resolve) => {
      let settled = false;
      let sawSpeaking = false;
      let unsub = () => {};
      const finish = () => {
        if (settled) return;
        settled = true;
        this._operatingSpeakWaitResolve = null;
        clearTimeout(timer);
        unsub();
        resolve(true);
      };
      const timer = setTimeout(finish, 20_000);
      this._operatingSpeakWaitResolve = finish;
      unsub = bridge.onStatus((payload) => {
        const status = payload && payload.status;
        if (status === 'speaking') sawSpeaking = true;
        if (sawSpeaking && (status === 'done' || status === 'error')) finish();
      });
    });
  }

  /**
   * @param {number} ms
   * @param {number} epoch
   * @returns {Promise<string>}
   */
  _listenOperating(ms, epoch) {
    if (epoch !== this._operatingEpoch || !this._open) return Promise.resolve('');
    if (this._operatingPendingReply != null) {
      const pending = this._operatingPendingReply;
      this._operatingPendingReply = null;
      return Promise.resolve(pending);
    }
    return new Promise((resolve) => {
      this._operatingListenResolve = (transcript) => resolve(transcript);
      this._operatingListenTimer = setTimeout(() => {
        this._resolveOperatingListen('');
      }, ms);
    });
  }

  /**
   * @param {string | null} targetLocale
   */
  _switchOperatingLanguage(targetLocale) {
    const ids = listPickerLocales().map((opt) => opt.id);
    const previous = getLocale();
    const requested =
      targetLocale && ids.includes(targetLocale) ? targetLocale : null;
    const next = requested || nextPickerLocaleId(previous, ids);
    if (!next || next === previous) return { changed: false, undo() {} };
    setLocale(next, { persist: true });
    return {
      changed: true,
      undo: () => setLocale(previous, { persist: true })
    };
  }

  /**
   * @param {boolean} [forcedEmpty]
   */
  _renderAskResults(forcedEmpty = false) {
    const ids = this._askResultArticleIds;
    this.askResultsEl.replaceChildren();
    if (!ids.length) {
      this.askResultsEl.hidden = true;
      if (forcedEmpty || String(this.askInput.value || '').trim()) {
        this.askResultsEl.hidden = false;
        const empty = document.createElement('p');
        empty.className = 'help-center__ask-empty';
        empty.dataset.testid = 'help-center-ask-empty';
        empty.textContent = t('HELP_CENTER_ASK_EMPTY');
        this.askResultsEl.append(empty);
      }
      return;
    }

    this.askResultsEl.hidden = false;
    const heading = document.createElement('p');
    heading.className = 'help-center__ask-results-label';
    heading.textContent = t('HELP_CENTER_ASK_RESULTS_LABEL');

    const list = document.createElement('ul');
    list.className = 'help-center__ask-list';

    for (const articleId of ids) {
      const row = findHelpCenterArticle(articleId);
      if (!row) continue;
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'help-center__ask-card';
      btn.dataset.testid = `help-center-ask-card-${articleId}`;
      btn.textContent = t(row.titleKey);
      btn.addEventListener('click', () => this._openArticle(articleId));
      li.append(btn);
      list.append(li);
    }

    this.askResultsEl.append(heading, list);
  }

  _render() {
    if (this._activeArticleId) {
      const row = findHelpCenterArticle(this._activeArticleId);
      if (!row) {
        this._showIndex();
        return;
      }
      this.titleEl.textContent = t('HELP_CENTER_TITLE');
      this.backBtn.textContent = t('HELP_CENTER_BACK_TO_TOPICS');
      this.closeBtn.textContent = t('HELP_CENTER_CLOSE');
      this.introEl.hidden = true;
      this.articleTitleEl.textContent = t(row.titleKey);
      this.articleBodyEl.textContent = t(row.bodyKey);
      return;
    }

    this.titleEl.textContent = t('HELP_CENTER_TITLE');
    this.closeBtn.textContent = t('HELP_CENTER_CLOSE');
    this.askLabelEl.textContent = t('HELP_CENTER_ASK_LABEL');
    this.askInput.placeholder = t('HELP_CENTER_ASK_PLACEHOLDER');
    this.askSubmitBtn.textContent = t('HELP_CENTER_ASK_SUBMIT');
    this.askSubmitBtn.setAttribute('aria-label', t('HELP_CENTER_ASK_SUBMIT_ARIA'));
    this._syncOperatingLabels();
    this._syncAskStatus();
    this.introEl.hidden = false;
    this.introEl.textContent = t('HELP_CENTER_INTRO');
    this.confideNoteEl.textContent = t('HELP_CENTER_CONFIDE_NOTE');
    this._renderAskResults();

    this.indexEl.replaceChildren();
    for (const section of HELP_CENTER_SECTIONS) {
      const articles = listHelpCenterArticlesForSection(section.id);
      if (!articles.length) continue;

      const sectionEl = document.createElement('section');
      sectionEl.className = 'help-center__section';

      const heading = document.createElement('h2');
      heading.className = 'help-center__section-title';
      heading.textContent = t(section.labelKey);
      sectionEl.append(heading);

      const list = document.createElement('ul');
      list.className = 'help-center__list';

      for (const article of articles) {
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'help-center__topic';
        btn.dataset.testid = `help-center-topic-${article.id}`;
        btn.textContent = t(article.titleKey);
        btn.addEventListener('click', () => this._openArticle(article.id));
        li.append(btn);
        list.append(li);
      }

      sectionEl.append(list);
      this.indexEl.append(sectionEl);
    }
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #help-center {
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        z-index: ${Z.GLASS_CARD};
        pointer-events: auto;
        width: min(420px, calc(100vw - 32px));
        max-height: min(78vh, 640px);
        overflow: auto;
        padding: 20px 18px 16px;
        border-radius: ${GLASS_RADIUS};
        background: ${GLASS_FILL};
        border: ${GLASS_BORDER};
        box-shadow: ${GLASS_SHADOW};
        backdrop-filter: ${GLASS_BLUR_CSS};
        -webkit-backdrop-filter: ${GLASS_BLUR_CSS};
        color: var(--ft-ink-primary, #2a2520);
        font-family: var(--ft-font-ui, system-ui, sans-serif);
      }
      .help-center__header {
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        gap: 8px;
        margin-bottom: 10px;
      }
      .help-center__title {
        margin: 0;
        font-size: 1.05rem;
        font-weight: 600;
        text-align: center;
      }
      .help-center__back,
      .help-center__close {
        border: none;
        background: transparent;
        color: inherit;
        font: inherit;
        cursor: pointer;
        padding: 4px 6px;
        border-radius: 8px;
      }
      .help-center__back:hover,
      .help-center__close:hover {
        background: ${GLASS_FILL_STRONG};
      }
      .help-center__back:active,
      .help-center__close:active {
        transform: scale(0.98);
      }
      .help-center__ask {
        margin: 0 0 14px;
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(42, 37, 32, 0.12);
      }
      .help-center__ask-label {
        margin: 0 0 8px;
        font-size: 0.82rem;
        font-weight: 600;
        letter-spacing: 0.02em;
      }
      .help-center__ask-row {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 8px;
        align-items: start;
      }
      .help-center__ask-input {
        width: 100%;
        box-sizing: border-box;
        border-radius: 10px;
        border: 1px solid rgba(42, 37, 32, 0.18);
        background: rgba(255, 252, 245, 0.92);
        padding: 10px 10px;
        font: inherit;
        font-size: 0.9rem;
        color: inherit;
      }
      .help-center__ask-submit {
        border: none;
        border-radius: 10px;
        padding: 10px 12px;
        font: inherit;
        font-size: 0.88rem;
        font-weight: 600;
        cursor: pointer;
        background: ${GLASS_FILL_STRONG};
        color: inherit;
      }
      .help-center__ask-submit:hover:not(:disabled) {
        filter: brightness(0.98);
      }
      .help-center__ask-submit:active:not(:disabled) {
        transform: scale(0.98);
      }
      .help-center__ask-submit:disabled {
        opacity: 0.65;
        cursor: wait;
      }
      .help-center__ask-status,
      .help-center__ask-empty,
      .help-center__ask-results-label,
      .help-center__operating-line {
        margin: 10px 0 0;
        font-size: 0.82rem;
        line-height: 1.45;
        opacity: 0.9;
      }
      .help-center__operating-actions {
        display: flex;
        gap: 8px;
        margin: 8px 0 0;
      }
      .help-center__operating-actions[hidden] {
        display: none;
      }
      .help-center__operating-confirm,
      .help-center__operating-cancel {
        border: ${GLASS_BORDER};
        background: ${GLASS_FILL_STRONG};
        border-radius: 10px;
        padding: 8px 12px;
        font: inherit;
        font-size: 0.86rem;
        cursor: pointer;
        color: inherit;
      }
      .help-center__operating-confirm:active,
      .help-center__operating-cancel:active {
        transform: scale(0.98);
      }
      .help-center__ask-list {
        list-style: none;
        margin: 6px 0 0;
        padding: 0;
      }
      .help-center__ask-card {
        display: block;
        width: 100%;
        text-align: left;
        border: none;
        background: transparent;
        padding: 10px 8px;
        margin: 0;
        border-radius: 10px;
        font: inherit;
        font-size: 0.92rem;
        cursor: pointer;
        color: inherit;
      }
      .help-center__ask-card:hover {
        background: ${GLASS_FILL_STRONG};
      }
      .help-center__ask-card:active {
        transform: scale(0.99);
      }
      .help-center__intro,
      .help-center__confide-note {
        margin: 0 0 12px;
        font-size: 0.88rem;
        line-height: 1.45;
        opacity: 0.92;
      }
      .help-center__confide-note {
        margin-top: 14px;
        padding-top: 12px;
        border-top: 1px solid rgba(42, 37, 32, 0.12);
        font-size: 0.82rem;
      }
      .help-center__section-title {
        margin: 14px 0 6px;
        font-size: 0.78rem;
        font-weight: 600;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        opacity: 0.75;
      }
      .help-center__list {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      .help-center__topic {
        display: block;
        width: 100%;
        text-align: left;
        border: none;
        background: transparent;
        padding: 10px 8px;
        margin: 0;
        border-radius: 10px;
        font: inherit;
        font-size: 0.92rem;
        cursor: pointer;
        color: inherit;
      }
      .help-center__topic:hover {
        background: ${GLASS_FILL_STRONG};
      }
      .help-center__topic:active {
        transform: scale(0.99);
      }
      .help-center__article-title {
        margin: 0 0 10px;
        font-size: 1rem;
        font-weight: 600;
      }
      .help-center__article-body {
        font-size: 0.9rem;
        line-height: 1.55;
        white-space: pre-wrap;
      }
    `;
    document.head.append(style);
  }

  destroy() {
    this._localeOff?.();
    this._voiceInputChrome?.destroy();
    this.close();
    this.root.remove();
    this.backdrop?.remove();
  }
}
