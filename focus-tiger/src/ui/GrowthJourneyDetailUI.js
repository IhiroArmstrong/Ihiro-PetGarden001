/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Growth Journey detail — a quiet lower card opened from the home line.
 * Read-only. No percentages, no ninety-day count.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import { growthJourneyDetailModel } from '../core/growthJourneyDetail.js';
import { readJourneyLog } from '../core/journeyLogGate.js';
import {
  getPracticePaperSentence,
  getSitBreathFacts,
  isPracticePaperHidden,
  setPracticePaperHidden
} from '../core/practicePaperFacts.js';
import {
  awakenCheckInLabelLocaleKey,
  getPracticePaperCheckInRhythm
} from '../core/practicePaperCheckInRhythm.js';
import { AWAKEN_CHECKIN_STORAGE_KEY } from '../core/awakenCheckInStore.js';
import { getStorage } from '../utils/Storage.js';
import {
  clearEveningPracticeFactsLedger,
  getEveningPracticePaperFact,
  readEveningFactsConsent,
  setEveningPracticeFactsConsent
} from '../core/eveningPracticeFacts.js';
import { getLocalDateKey } from '../utils/localDate.js';
import {
  buildYinAdaptationNotebookLines
} from '../core/yinAdaptationNotebook.js';
import { buildCoPracticeContractRows } from '../core/coPracticeContractSurface.js';
import {
  hideYinAdaptationNotebookLine,
  isYinAdaptationEnabled,
  setYinAdaptationEnabled,
  suspendYinAdaptationRule
} from '../core/yinAdaptationStore.js';
import {
  GLASS_BLUR_CSS,
  GLASS_BORDER,
  GLASS_FILL,
  GLASS_RADIUS,
  GLASS_SHADOW
} from './glassPanelStyles.js';
import {
  createOverlayBackdrop,
  hideOverlayBackdrop,
  showOverlayBackdrop
} from './overlayBackdrop.js';
import { OVERLAY_OUTSIDE_DISMISS } from '../core/overlaySlotContractRegistry.js';
import {
  wideSecondaryDockCss,
  wideSecondaryDockPlacement
} from '../core/wideSecondaryDockCss.js';
import { Z } from './zIndexLayers.js';

const STYLE_ID = 'growth-journey-detail-styles-v1';
const FADE_MS = 220;

export class GrowthJourneyDetailUI {
  /**
   * @param {HTMLElement} mountRoot
   * @param {object} [handlers]
   * @param {() => void} [handlers.onOpen]
   * @param {() => void} [handlers.onClose]
   * @param {() => unknown} [handlers.getEligibleMinutes]
   * @param {() => unknown} [handlers.getLifetimeMinutes]
   * @param {() => unknown} [handlers.getStageFloor]
   * @param {() => Iterable<unknown>} [handlers.getPracticeDates]
   * @param {() => unknown} [handlers.getJourneyLog]
   * @param {() => Storage | null} [handlers.getStorage]
   * @param {() => string} [handlers.getTodayKey]
   * @param {() => void} [handlers.onOpenReminderSettings]
   * @param {() => void} [handlers.onOpenWorkEndSettings]
   * @param {() => void} [handlers.onOpenPrivacySettings]
   */
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    this._open = false;
    /** @type {ReturnType<typeof setTimeout> | null} */
    this._hideTimer = null;

    this.backdrop = createOverlayBackdrop(mountRoot, {
      id: 'growth-journey-detail-backdrop',
      testId: 'growth-journey-detail-backdrop',
      zIndex: Z.OVERLAY_DIM,
      outsideDismiss: OVERLAY_OUTSIDE_DISMISS.BLANK_CLOSES,
      onDismiss: () => this.close()
    });

    this.root = document.createElement('div');
    this.root.id = 'growth-journey-detail';
    this.root.className = 'growth-journey-detail';
    this.root.hidden = true;
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'growth-journey-detail-title');
    this.root.dataset.testid = 'growth-journey-detail';

    this.titleEl = document.createElement('p');
    this.titleEl.id = 'growth-journey-detail-title';
    this.titleEl.className = 'growth-journey-detail__title';

    this.track = document.createElement('div');
    this.track.className = 'growth-journey-detail__track';
    this.track.dataset.testid = 'growth-journey-detail-track';

    this.line = document.createElement('span');
    this.line.className = 'growth-journey-detail__line';
    this.line.setAttribute('aria-hidden', 'true');

    this.dot = document.createElement('span');
    this.dot.className = 'growth-journey-detail__dot';
    this.dot.setAttribute('aria-hidden', 'true');

    this.hereEl = document.createElement('p');
    this.hereEl.className = 'growth-journey-detail__here';
    this.hereEl.dataset.testid = 'growth-journey-detail-here';

    this.nextEl = document.createElement('p');
    this.nextEl.className = 'growth-journey-detail__next';
    this.nextEl.dataset.testid = 'growth-journey-detail-next';

    this.lotusRow = document.createElement('div');
    this.lotusRow.id = 'growth-journey-lotus-row';
    this.lotusRow.className = 'growth-journey-detail__lotus-row';
    this.lotusRow.dataset.testid = 'growth-journey-lotus-row';
    this.lotusRow.setAttribute('aria-hidden', 'true');
    this.lotusRow.hidden = true;

    this.lifetimeEl = document.createElement('p');
    this.lifetimeEl.className = 'growth-journey-detail__lifetime';
    this.lifetimeEl.dataset.testid = 'growth-journey-detail-lifetime';

    this.rhythmEl = document.createElement('div');
    this.rhythmEl.className = 'growth-journey-detail__rhythm';
    this.rhythmEl.dataset.testid = 'growth-journey-detail-rhythm';

    this.notebookEl = document.createElement('section');
    this.notebookEl.className = 'growth-journey-detail__notebook';
    this.notebookEl.dataset.testid = 'yin-adaptation-notebook';

    this.contractEl = document.createElement('section');
    this.contractEl.className = 'growth-journey-detail__contract';
    this.contractEl.dataset.testid = 'co-practice-contract';

    this.paperEl = document.createElement('section');
    this.paperEl.className = 'growth-journey-detail__paper';
    this.paperEl.dataset.testid = 'practice-paper';

    this._paperExpanded = false;

    this.closeBtn = document.createElement('button');
    this.closeBtn.type = 'button';
    this.closeBtn.className = 'growth-journey-detail__close';
    this.closeBtn.dataset.testid = 'growth-journey-detail-close';
    this.closeBtn.addEventListener('click', () => this.close());

    this.line.appendChild(this.dot);
    this.track.appendChild(this.line);
    this.root.append(
      this.titleEl,
      this.track,
      this.hereEl,
      this.nextEl,
      this.lotusRow,
      this.lifetimeEl,
      this.rhythmEl,
      this.notebookEl,
      this.contractEl,
      this.paperEl,
      this.closeBtn
    );
    mountRoot.appendChild(this.root);

    this._onKeyDown = (event) => {
      if (!this._open) return;
      if (event.key !== 'Escape') return;
      event.preventDefault();
      this.close();
    };
    document.addEventListener('keydown', this._onKeyDown);

    this._onResize = () => this._syncDock();
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('resize', this._onResize);
    }
    this._injectStyles();
    this._syncDock();
    this._unsubLocale = onLocaleChange(() => {
      if (this._open) this._refresh();
    });
    this._refresh();
  }

  _syncDock() {
    const width = typeof window !== 'undefined' ? window.innerWidth : 0;
    this.root.dataset.dock = wideSecondaryDockPlacement(width);
  }

  /** @returns {boolean} */
  isOpen() {
    return this._open;
  }

  /** Refresh detail copy when open (e.g. after settings panels save). */
  refreshIfOpen() {
    if (this._open) this._refresh();
  }

  open() {
    if (this._open) {
      this._refresh();
      return;
    }
    this._open = true;
    if (this._hideTimer != null) {
      clearTimeout(this._hideTimer);
      this._hideTimer = null;
    }
    showOverlayBackdrop(this.backdrop);
    this.root.hidden = false;
    this.root.getBoundingClientRect();
    this.root.classList.add('is-visible');
    this._refresh();
    this.closeBtn.focus({ preventScroll: true });
    this.handlers.onOpen?.();
  }

  close() {
    if (!this._open) return;
    this._open = false;
    this.root.classList.remove('is-visible');
    hideOverlayBackdrop(this.backdrop, { fadeMs: FADE_MS });
    this._hideTimer = setTimeout(() => {
      if (!this._open) this.root.hidden = true;
    }, FADE_MS);
    this.handlers.onClose?.();
  }

  _refresh() {
    const practiceDates = this.handlers.getPracticeDates?.() ?? [];
    const model = growthJourneyDetailModel({
      eligibleMinutes: this.handlers.getEligibleMinutes?.() ?? 0,
      lifetimeMinutes: this.handlers.getLifetimeMinutes?.() ?? 0,
      floor: this.handlers.getStageFloor?.() ?? null,
      practiceDates,
      translate: t
    });
    this.titleEl.textContent = t('GROWTH_JOURNEY_DETAIL_TITLE');
    this.closeBtn.textContent = t('GROWTH_JOURNEY_CLOSE');
    this.hereEl.textContent = model.here;
    this.nextEl.textContent = model.nextStep;
    this.nextEl.hidden = model.nextStep === '';
    this.lifetimeEl.textContent = model.lifetimeText;
    this.dot.style.left = `${model.position * 100}%`;

    this.track.querySelectorAll('.growth-journey-detail__stage').forEach((node) => {
      node.remove();
    });
    const count = Math.max(1, model.stages.length - 1);
    model.stages.forEach((stage, index) => {
      const label = document.createElement('span');
      label.className = 'growth-journey-detail__stage';
      if (index === 0) label.classList.add('is-first');
      if (index === model.stages.length - 1) label.classList.add('is-last');
      label.dataset.stage = stage.id;
      label.textContent = stage.label;
      label.style.left = `${(index / count) * 100}%`;
      this.track.appendChild(label);
    });

    this.rhythmEl.replaceChildren();
    for (const mark of model.rhythm) {
      const item = document.createElement('span');
      item.className = 'growth-journey-detail__mark';
      item.dataset.kind = mark.kind;
      if (mark.kind === 'paused') {
        const paused = document.createElement('span');
        paused.className = 'growth-journey-detail__paused';
        paused.textContent = t('GROWTH_JOURNEY_PAUSED');
        item.appendChild(paused);
      } else {
        const dot = document.createElement('span');
        dot.className = 'growth-journey-detail__day';
        dot.dataset.kind = mark.kind;
        item.appendChild(dot);
        if (mark.kind === 'returned') {
          const returned = document.createElement('span');
          returned.className = 'growth-journey-detail__returned';
          returned.textContent = t('GROWTH_JOURNEY_RETURNED');
          item.appendChild(returned);
        }
      }
      this.rhythmEl.appendChild(item);
    }

    this._refreshNotebook();
    this._refreshContract();
    this._refreshPaper(practiceDates);
  }

  /**
   * @param {{ key: string, params?: Record<string, string> }} status
   * @returns {string}
   */
  _formatContractStatus(status) {
    let text = t(status.key);
    if (status.params?.time) {
      text = text.replaceAll('{time}', status.params.time);
    }
    if (status.params?.date) {
      text = text.replaceAll('{date}', status.params.date);
    }
    return text;
  }

  _refreshContract() {
    this.contractEl.replaceChildren();
    const storage = this._storage();
    const rows = buildCoPracticeContractRows({ storage, now: Date.now() });

    const heading = document.createElement('p');
    heading.className = 'growth-journey-detail__contract-title';
    heading.textContent = t('CO_PRACTICE_CONTRACT_TITLE');
    this.contractEl.appendChild(heading);

    const intro = document.createElement('p');
    intro.className = 'growth-journey-detail__contract-intro';
    intro.textContent = t('CO_PRACTICE_CONTRACT_INTRO');
    this.contractEl.appendChild(intro);

    for (const row of rows) {
      const line = document.createElement('div');
      line.className = 'growth-journey-detail__contract-row';
      line.dataset.rowId = row.id;

      const label = document.createElement('p');
      label.className = 'growth-journey-detail__contract-label';
      label.textContent = t(row.labelKey);
      line.appendChild(label);

      const status = document.createElement('p');
      status.className = 'growth-journey-detail__contract-status';
      status.textContent = this._formatContractStatus(row.status);
      line.appendChild(status);

      if (row.hintKey) {
        const hint = document.createElement('p');
        hint.className = 'growth-journey-detail__contract-hint';
        hint.textContent = t(row.hintKey);
        line.appendChild(hint);
      }

      if (row.action && row.actionKey) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'growth-journey-detail__contract-action';
        btn.dataset.testid = `co-practice-contract-action-${row.id}`;
        btn.textContent = t(row.actionKey);
        btn.addEventListener('click', () => {
          if (row.action === 'reminder') {
            this.handlers.onOpenReminderSettings?.();
          } else if (row.action === 'work-end') {
            this.handlers.onOpenWorkEndSettings?.();
          } else if (row.action === 'privacy') {
            this.handlers.onOpenPrivacySettings?.();
          }
        });
        line.appendChild(btn);
      }

      this.contractEl.appendChild(line);
    }
  }

  _refreshNotebook() {
    const storage = this._storage();
    this.notebookEl.replaceChildren();

    const heading = document.createElement('p');
    heading.className = 'growth-journey-detail__notebook-title';
    heading.textContent = t('YIN_ADAPTATION_NOTEBOOK_TITLE');
    this.notebookEl.appendChild(heading);

    const toggleRow = document.createElement('label');
    toggleRow.className = 'growth-journey-detail__notebook-toggle';
    const toggle = document.createElement('input');
    toggle.type = 'checkbox';
    toggle.checked = isYinAdaptationEnabled();
    toggle.dataset.testid = 'yin-adaptation-toggle';
    toggle.addEventListener('change', () => {
      setYinAdaptationEnabled(toggle.checked);
      this._refresh();
    });
    const toggleText = document.createElement('span');
    toggleText.textContent = t('YIN_ADAPTATION_TOGGLE_LABEL');
    toggleRow.append(toggle, toggleText);
    this.notebookEl.appendChild(toggleRow);

    const lines = buildYinAdaptationNotebookLines({ storage });
    for (const line of lines) {
      const row = document.createElement('div');
      row.className = 'growth-journey-detail__notebook-line';
      row.dataset.ruleId = line.id;
      if (line.suspended) row.dataset.suspended = '1';
      const text = document.createElement('p');
      text.textContent = t(line.textKey);
      text.dataset.testid = `yin-adaptation-line-${line.id}`;
      row.appendChild(text);

      const actions = document.createElement('div');
      actions.className = 'growth-journey-detail__notebook-actions';
      const correct = document.createElement('button');
      correct.type = 'button';
      correct.className = 'growth-journey-detail__notebook-btn';
      correct.textContent = t('YIN_ADAPTATION_BTN_CORRECT');
      correct.dataset.testid = `yin-adaptation-correct-${line.id}`;
      correct.addEventListener('click', () => {
        suspendYinAdaptationRule(line.id);
        this._refresh();
      });
      const forget = document.createElement('button');
      forget.type = 'button';
      forget.className = 'growth-journey-detail__notebook-btn';
      forget.textContent = t('YIN_ADAPTATION_BTN_FORGET');
      forget.dataset.testid = `yin-adaptation-forget-${line.id}`;
      forget.addEventListener('click', () => {
        hideYinAdaptationNotebookLine(line.id);
        this._refresh();
      });
      actions.append(correct, forget);
      row.appendChild(actions);
      this.notebookEl.appendChild(row);
    }
  }

  _storage() {
    try {
      return this.handlers.getStorage?.() ?? globalThis.localStorage ?? null;
    } catch {
      return null;
    }
  }

  _todayKey() {
    return this.handlers.getTodayKey?.() ?? getLocalDateKey(new Date());
  }

  _appendEveningConsentControls(storage) {
    const consent = readEveningFactsConsent(storage);
    const wrap = document.createElement('div');
    wrap.className = 'growth-journey-detail__paper-evening-controls';
    wrap.dataset.testid = 'practice-paper-evening-controls';

    const disclosure = document.createElement('p');
    disclosure.className = 'growth-journey-detail__paper-evening-disclosure';
    disclosure.dataset.testid = 'practice-paper-evening-disclosure';
    disclosure.textContent = t('PRACTICE_PAPER_EVENING_DISCLOSURE');
    wrap.appendChild(disclosure);

    const label = document.createElement('label');
    label.className = 'growth-journey-detail__paper-evening-toggle';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = consent.enabled;
    input.dataset.testid = 'practice-paper-evening-consent';
    const labelText = document.createElement('span');
    labelText.textContent = t('PRACTICE_PAPER_EVENING_CONSENT_LABEL');
    label.append(input, labelText);
    wrap.appendChild(label);

    let pendingEnable = false;
    const confirmBtn = document.createElement('button');
    confirmBtn.type = 'button';
    confirmBtn.className = 'growth-journey-detail__paper-toggle';
    confirmBtn.dataset.testid = 'practice-paper-evening-confirm';
    confirmBtn.textContent = t('PRACTICE_PAPER_EVENING_CONFIRM');
    confirmBtn.hidden = true;
    confirmBtn.addEventListener('click', () => {
      if (!setEveningPracticeFactsConsent(this._storage(), true)) return;
      pendingEnable = false;
      this._refreshPaper(this.handlers.getPracticeDates?.() ?? []);
    });
    wrap.appendChild(confirmBtn);

    input.addEventListener('change', () => {
      if (input.checked && !consent.enabled) {
        input.checked = false;
        pendingEnable = true;
        confirmBtn.hidden = false;
        return;
      }
      if (!input.checked && consent.enabled) {
        if (!setEveningPracticeFactsConsent(this._storage(), false)) {
          input.checked = true;
          return;
        }
        pendingEnable = false;
        confirmBtn.hidden = true;
        this._refreshPaper(this.handlers.getPracticeDates?.() ?? []);
      }
    });

    if (consent.enabled) {
      const clearBtn = document.createElement('button');
      clearBtn.type = 'button';
      clearBtn.className = 'growth-journey-detail__paper-toggle';
      clearBtn.dataset.testid = 'practice-paper-evening-clear';
      clearBtn.textContent = t('PRACTICE_PAPER_EVENING_CLEAR');
      clearBtn.addEventListener('click', () => {
        if (!clearEveningPracticeFactsLedger(this._storage())) return;
        this._refreshPaper(this.handlers.getPracticeDates?.() ?? []);
      });
      wrap.appendChild(clearBtn);
    }

    this.paperEl.appendChild(wrap);
  }

  _refreshPaper(practiceDates) {
    const storage = this._storage();
    const today = this._todayKey();
    const hidden = isPracticePaperHidden(storage);
    this.paperEl.replaceChildren();

    if (hidden) {
      const showBtn = document.createElement('button');
      showBtn.type = 'button';
      showBtn.className = 'growth-journey-detail__paper-toggle';
      showBtn.dataset.testid = 'practice-paper-show';
      showBtn.textContent = t('PRACTICE_PAPER_SHOW');
      showBtn.addEventListener('click', () => {
        if (!setPracticePaperHidden(this._storage(), false)) return;
        this._refreshPaper(this.handlers.getPracticeDates?.() ?? []);
      });
      this.paperEl.appendChild(showBtn);
      return;
    }

    const sentence = getPracticePaperSentence(practiceDates, today);
    const rhythm = document.createElement('p');
    rhythm.className = 'growth-journey-detail__paper-rhythm';
    rhythm.dataset.testid = 'practice-paper-rhythm';
    rhythm.textContent = t(sentence.key);
    this.paperEl.appendChild(rhythm);

    const eveningFact = getEveningPracticePaperFact(storage, today);
    if (eveningFact?.show) {
      const evening = document.createElement('p');
      evening.className = 'growth-journey-detail__paper-evening';
      evening.dataset.testid = 'practice-paper-evening-fact';
      evening.textContent = t(eveningFact.localeKey).replaceAll(
        '{n}',
        String(eveningFact.count)
      );
      this.paperEl.appendChild(evening);
    }

    this._appendEveningConsentControls(storage);

    const subtitle = document.createElement('p');
    subtitle.className = 'growth-journey-detail__paper-subtitle';
    subtitle.textContent = t('PRACTICE_PAPER_SUBTITLE');
    this.paperEl.appendChild(subtitle);

    const log =
      this.handlers.getJourneyLog?.() ?? readJourneyLog(storage);
    const facts = getSitBreathFacts(log, today);

    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'growth-journey-detail__sit-breath';
    card.dataset.testid = 'practice-paper-sit-breath';
    card.setAttribute('aria-expanded', this._paperExpanded ? 'true' : 'false');
    const cardTitle = document.createElement('span');
    cardTitle.className = 'growth-journey-detail__sit-breath-title';
    cardTitle.textContent = t('PRACTICE_PAPER_CARD_TITLE');
    card.appendChild(cardTitle);

    const factsEl = document.createElement('div');
    factsEl.className = 'growth-journey-detail__sit-breath-facts';
    factsEl.dataset.testid = 'practice-paper-sit-breath-facts';
    factsEl.hidden = !this._paperExpanded;

    if (facts.uniqueDays === 0) {
      const empty = document.createElement('p');
      empty.textContent = t('PRACTICE_PAPER_CARD_EMPTY');
      factsEl.appendChild(empty);
    } else if (facts.incomplete) {
      const incomplete = document.createElement('p');
      incomplete.textContent = t('PRACTICE_PAPER_CARD_INCOMPLETE');
      factsEl.appendChild(incomplete);
    } else {
      const days = document.createElement('p');
      days.textContent = t('PRACTICE_PAPER_CARD_DAYS').replaceAll(
        '{days}',
        String(facts.uniqueDays)
      );
      factsEl.appendChild(days);
    }
    if (facts.lastMinutes != null) {
      const last = document.createElement('p');
      last.textContent = t('PRACTICE_PAPER_CARD_LAST').replaceAll(
        '{minutes}',
        String(facts.lastMinutes)
      );
      factsEl.appendChild(last);
    }
    card.addEventListener('click', () => {
      this._paperExpanded = !this._paperExpanded;
      this._refreshPaper(this.handlers.getPracticeDates?.() ?? []);
    });
    this.paperEl.appendChild(card);
    this.paperEl.appendChild(factsEl);

    this._appendCheckInRhythmBlock(today);

    const hideBtn = document.createElement('button');
    hideBtn.type = 'button';
    hideBtn.className = 'growth-journey-detail__paper-toggle';
    hideBtn.dataset.testid = 'practice-paper-hide';
    hideBtn.textContent = t('PRACTICE_PAPER_HIDE');
    hideBtn.addEventListener('click', () => {
      if (!setPracticePaperHidden(this._storage(), true)) return;
      this._paperExpanded = false;
      this._refreshPaper(this.handlers.getPracticeDates?.() ?? []);
    });
    this.paperEl.appendChild(hideBtn);

    const disclaimer = document.createElement('p');
    disclaimer.className = 'growth-journey-detail__paper-disclaimer';
    disclaimer.dataset.testid = 'practice-paper-disclaimer';
    disclaimer.textContent = t('PRACTICE_PAPER_DISCLAIMER');
    this.paperEl.appendChild(disclaimer);
  }

  _appendCheckInRhythmBlock(todayKey) {
    let rows = [];
    try {
      rows = getStorage(AWAKEN_CHECKIN_STORAGE_KEY, []);
    } catch {
      rows = [];
    }
    const block = getPracticePaperCheckInRhythm(rows, todayKey);
    if (!block) return;

    const section = document.createElement('section');
    section.className = 'growth-journey-detail__paper-check-in-rhythm';
    section.dataset.testid = 'practice-paper-check-in-rhythm';

    const title = document.createElement('p');
    title.className = 'growth-journey-detail__paper-check-in-rhythm-title';
    title.textContent = t('PRACTICE_PAPER_CHECKIN_RHYTHM_TITLE');
    section.appendChild(title);

    const slots = document.createElement('div');
    slots.className = 'growth-journey-detail__paper-check-in-slots';
    for (const slot of block.slots) {
      const cell = document.createElement('span');
      cell.className = 'growth-journey-detail__paper-check-in-slot';
      if (slot.label) {
        cell.textContent = t(awakenCheckInLabelLocaleKey(slot.label));
      }
      slots.appendChild(cell);
    }
    section.appendChild(slots);
    this.paperEl.appendChild(section);
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .growth-journey-detail {
        position: fixed;
        left: 50%;
        bottom: max(96px, env(safe-area-inset-bottom, 0px) + 72px);
        z-index: ${Z.GLASS_CARD};
        width: min(360px, calc(100vw - 40px));
        max-height: min(52vh, 420px);
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
      .growth-journey-detail.is-visible {
        opacity: 1;
        transform: translate(-50%, 0);
        pointer-events: auto;
      }
      ${wideSecondaryDockCss('.growth-journey-detail', { slide: true })}
      .growth-journey-detail__title {
        margin: 0 0 12px;
        font-size: 1.02rem;
        font-weight: 600;
      }
      .growth-journey-detail__track {
        position: relative;
        height: 46px;
        margin: 0 8px 8px;
      }
      .growth-journey-detail__line {
        position: absolute;
        left: 0;
        right: 0;
        top: 28px;
        height: 1px;
        background: rgba(44, 31, 20, 0.35);
      }
      .growth-journey-detail__dot {
        position: absolute;
        top: 50%;
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #2c1f14;
        transform: translate(-50%, -50%);
      }
      .growth-journey-detail__stage {
        position: absolute;
        top: 0;
        transform: translateX(-50%);
        font-size: 11px;
        line-height: 1.2;
        white-space: nowrap;
        color: rgba(44, 31, 20, 0.72);
      }
      .growth-journey-detail__stage.is-first {
        transform: none;
      }
      .growth-journey-detail__stage.is-last {
        transform: translateX(-100%);
      }
      .growth-journey-detail__here,
      .growth-journey-detail__next,
      .growth-journey-detail__lifetime {
        margin: 0 0 8px;
        font-size: 0.88rem;
        line-height: 1.4;
      }
      .growth-journey-detail__next {
        opacity: 0.84;
      }
      .growth-journey-detail__lotus-row {
        display: flex;
        flex-wrap: nowrap;
        align-items: flex-end;
        justify-content: flex-start;
        gap: 2px;
        width: 100%;
        margin: 0 0 8px;
        pointer-events: none;
        overflow: hidden;
      }
      .growth-journey-detail__lotus-row[hidden] {
        display: none;
      }
      .growth-journey-detail__rhythm {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px 0;
        margin: 0 0 12px;
        min-height: 12px;
      }
      .growth-journey-detail__mark {
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      .growth-journey-detail__mark + .growth-journey-detail__mark::before {
        content: "·";
        margin: 0 6px;
        color: rgba(44, 31, 20, 0.35);
      }
      .growth-journey-detail__day {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: rgba(44, 31, 20, 0.55);
      }
      .growth-journey-detail__paused,
      .growth-journey-detail__returned {
        font-size: 11px;
        line-height: 1.2;
        color: rgba(44, 31, 20, 0.62);
      }
      .growth-journey-detail__paper {
        margin: 4px 0 12px;
        padding-top: 8px;
        border-top: 1px solid rgba(44, 31, 20, 0.12);
      }
      .growth-journey-detail__contract {
        margin: 8px 0 10px;
        padding-top: 8px;
        border-top: 1px solid rgba(44, 31, 20, 0.12);
      }
      .growth-journey-detail__contract-title {
        margin: 0 0 6px;
        font-size: 0.92rem;
        font-weight: 600;
      }
      .growth-journey-detail__contract-intro,
      .growth-journey-detail__contract-label,
      .growth-journey-detail__contract-status,
      .growth-journey-detail__contract-hint {
        margin: 0 0 6px;
        font-size: 0.82rem;
        line-height: 1.4;
        color: #2c1f14;
      }
      .growth-journey-detail__contract-intro,
      .growth-journey-detail__contract-hint {
        opacity: 0.72;
      }
      .growth-journey-detail__contract-row {
        margin: 0 0 10px;
        padding-bottom: 8px;
        border-bottom: 1px solid rgba(44, 31, 20, 0.08);
      }
      .growth-journey-detail__contract-row:last-child {
        border-bottom: 0;
        padding-bottom: 0;
      }
      .growth-journey-detail__contract-action {
        appearance: none;
        border: 0;
        background: transparent;
        padding: 0;
        font: inherit;
        font-size: 0.8rem;
        color: rgba(44, 31, 20, 0.72);
        cursor: pointer;
        text-decoration: underline;
        text-underline-offset: 2px;
      }
      .growth-journey-detail__paper-rhythm,
      .growth-journey-detail__paper-evening,
      .growth-journey-detail__paper-subtitle,
      .growth-journey-detail__paper-disclaimer,
      .growth-journey-detail__paper-check-in-rhythm-title,
      .growth-journey-detail__paper-check-in-slot,
      .growth-journey-detail__sit-breath-facts p {
        margin: 0 0 8px;
        font-size: 0.86rem;
        line-height: 1.4;
        color: #2c1f14;
      }
      .growth-journey-detail__paper-subtitle,
      .growth-journey-detail__paper-disclaimer {
        opacity: 0.72;
        font-size: 0.78rem;
      }
      .growth-journey-detail__paper-check-in-rhythm {
        margin: 10px 0 0;
      }
      .growth-journey-detail__paper-check-in-rhythm-title {
        margin: 0 0 6px;
      }
      .growth-journey-detail__paper-check-in-slots {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }
      .growth-journey-detail__paper-check-in-slot {
        flex: 1 1 2.2em;
        min-width: 2.2em;
        text-align: center;
        min-height: 1.3em;
      }
      .growth-journey-detail__sit-breath {
        appearance: none;
        display: block;
        width: 100%;
        text-align: left;
        margin: 0 0 8px;
        padding: 10px 12px;
        font: inherit;
        color: #2c1f14;
        background: rgba(255, 248, 238, 0.55);
        border: 1px solid rgba(44, 31, 20, 0.14);
        border-radius: 12px;
        cursor: pointer;
      }
      .growth-journey-detail__sit-breath-title {
        font-size: 0.92rem;
        font-weight: 600;
      }
      .growth-journey-detail__paper-toggle {
        appearance: none;
        border: 0;
        background: transparent;
        padding: 0;
        margin: 0 0 8px;
        font: inherit;
        font-size: 0.8rem;
        color: rgba(44, 31, 20, 0.72);
        cursor: pointer;
        text-decoration: underline;
        text-underline-offset: 2px;
      }
      .growth-journey-detail__close {
        appearance: none;
        border: 0;
        background: transparent;
        padding: 0;
        font: inherit;
        font-size: 0.86rem;
        color: rgba(44, 31, 20, 0.72);
        cursor: pointer;
      }
    `;
    document.head.appendChild(style);
  }
}
