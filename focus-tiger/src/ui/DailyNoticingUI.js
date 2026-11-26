/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { t, onLocaleChange, getLocale } from '../locales/i18n.js';
import { OVERLAY_OUTSIDE_DISMISS } from '../core/overlaySlotContractRegistry.js';
import {
  buildDailyNoticingPromptOrder,
  pickDailyNoticingClosingId,
  DAILY_NOTICING_PROMPT_IDS
} from '../core/dailyNoticing/dailyNoticingPromptRotation.js';
import {
  readDailyNoticingHistory,
  readDailyNoticingForDate,
  recentDailyNoticingPrimaryPromptIds,
  writeDailyNoticingDayRecord
} from '../core/dailyNoticing/dailyNoticingMemory.js';
import { routeDailyNoticingAnswer } from '../core/dailyNoticing/dailyNoticingAnswerRoute.js';
import { pushOverlayEscapeLayer } from '../core/overlayEscapeStack.js';
import {
  GLASS_BLUR_CSS,
  GLASS_BORDER,
  GLASS_FILL_STRONG,
  GLASS_RADIUS,
  GLASS_SHADOW,
  createGlassCard
} from './glassPanelStyles.js';
import {
  OVERLAY_BACKDROP_FADE_MS,
  createOverlayBackdrop,
  hideOverlayBackdrop,
  showOverlayBackdrop
} from './overlayBackdrop.js';
import { Z } from './zIndexLayers.js';

const STYLE_ID = 'daily-noticing-card-styles-v1';
const ROOT_ID = 'daily-noticing-card';
const FADE_MS = OVERLAY_BACKDROP_FADE_MS;

export class DailyNoticingUI {
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    this._storage =
      handlers.storage ??
      (typeof localStorage !== 'undefined' ? localStorage : null);
    this._open = false;
    this._step = 'prompt';
    this._promptOrder = [];
    this._promptIndex = 0;
    this._answeredPromptIds = [];
    this._crisisRouted = false;
    this._crisisLineText = '';
    this._helpOpen = false;
    this._popEscapeLayer = null;

    this.backdrop = createOverlayBackdrop(mountRoot, {
      id: 'daily-noticing-backdrop',
      testId: 'daily-noticing-backdrop',
      zIndex: Z.OVERLAY_DIM,
      outsideDismiss: OVERLAY_OUTSIDE_DISMISS.BLANK_CLOSES,
      onDismiss: () => this.close()
    });

    this.root = createGlassCard({
      id: ROOT_ID,
      className: 'daily-noticing-card',
      deck: true
    });
    this.root.hidden = true;
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'daily-noticing-title');
    this.root.dataset.testid = ROOT_ID;

    this.titleEl = document.createElement('p');
    this.titleEl.id = 'daily-noticing-title';
    this.titleEl.className = 'daily-noticing-card__title';
    this.bodyEl = document.createElement('div');
    this.bodyEl.className = 'daily-noticing-card__body';
    this.bodyEl.dataset.testid = 'daily-noticing-body';
    this.actions = document.createElement('div');
    this.actions.className = 'daily-noticing-card__actions';
    this.root.append(this.titleEl, this.bodyEl, this.actions);
    mountRoot.appendChild(this.root);
    this._injectStyles();
    this._unsubLocale = onLocaleChange(() => {
      if (this._open) this._renderStep();
    });
  }

  isOpen() {
    return this._open;
  }

  _dateKey() {
    const fromHandler = this.handlers.getLocalDateKey?.();
    if (typeof fromHandler === 'string' && fromHandler) return fromHandler;
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  open() {
    if (this._open) {
      this._renderStep();
      return;
    }
    const dateKey = this._dateKey();
    const history = readDailyNoticingHistory(this._storage);
    const existing = readDailyNoticingForDate(this._storage, dateKey);
    const recent = recentDailyNoticingPrimaryPromptIds(history, dateKey);
    this._promptOrder = buildDailyNoticingPromptOrder(dateKey, recent);
    this._promptIndex = 0;
    this._answeredPromptIds = existing?.promptIds?.length ? [...existing.promptIds] : [];
    if (existing?.promptIds?.[0]) {
      const idx = this._promptOrder.indexOf(existing.promptIds[0]);
      if (idx >= 0) this._promptIndex = idx;
    }
    this._step = 'prompt';
    this._crisisRouted = false;
    this._helpOpen = false;
    this._open = true;
    this._popEscapeLayer?.();
    this._popEscapeLayer = pushOverlayEscapeLayer({
      id: ROOT_ID,
      dismiss: () => this.close()
    });
    showOverlayBackdrop(this.backdrop);
    this.root.hidden = false;
    this.root.getBoundingClientRect();
    this.root.classList.add('is-visible');
    this._renderStep();
    this.handlers.onOpen?.();
  }

  close() {
    if (!this._open) return;
    this._open = false;
    this._popEscapeLayer?.();
    this._popEscapeLayer = null;
    hideOverlayBackdrop(this.backdrop);
    this.root.classList.remove('is-visible');
    window.setTimeout(() => {
      if (!this._open) this.root.hidden = true;
    }, FADE_MS + 40);
    this.handlers.onClose?.();
  }

  _currentPromptId() {
    return this._promptOrder[this._promptIndex] || DAILY_NOTICING_PROMPT_IDS[0];
  }

  _persistRecord(patch) {
    writeDailyNoticingDayRecord(this._storage, {
      dateKey: this._dateKey(),
      promptIds: patch.promptIds ?? [...this._answeredPromptIds],
      skipped: patch.skipped,
      crisisRouted: patch.crisisRouted ?? this._crisisRouted
    });
  }

  _btn(labelKey, testId, kind, onClick) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `daily-noticing-card__btn daily-noticing-card__btn--${kind}`;
    btn.dataset.testid = testId;
    btn.textContent = t(labelKey);
    btn.addEventListener('click', onClick);
    return btn;
  }

  _renderStep() {
    this.titleEl.textContent = t('DAILY_NOTICING_CARD_TITLE');
    this.bodyEl.replaceChildren();
    this.actions.replaceChildren();

    if (this._step === 'crisis') {
      const p = document.createElement('p');
      p.className = 'daily-noticing-card__copy';
      p.dataset.testid = 'daily-noticing-crisis-copy';
      p.textContent = this._crisisLineText;
      this.bodyEl.appendChild(p);
      const helpBtn = document.createElement('button');
      helpBtn.type = 'button';
      helpBtn.className = 'daily-noticing-card__link';
      helpBtn.dataset.testid = 'confide-to-yin-help-resources';
      helpBtn.textContent = t('CONFIDE_HELP_RESOURCES_ENTRY');
      helpBtn.addEventListener('click', () => {
        this._helpOpen = !this._helpOpen;
        this._renderStep();
      });
      this.actions.appendChild(helpBtn);
      if (this._helpOpen) {
        const panel = document.createElement('div');
        panel.className = 'daily-noticing-card__help-panel';
        panel.dataset.testid = 'confide-to-yin-help-resources-panel';
        panel.textContent = t('CONFIDE_CONSENT_CRISIS_BODY');
        this.bodyEl.appendChild(panel);
      }
      this.actions.appendChild(
        this._btn('DAILY_NOTICING_DONE', 'daily-noticing-done', 'primary', () =>
          this.close()
        )
      );
      return;
    }

    if (this._step === 'closing') {
      const p = document.createElement('p');
      p.className = 'daily-noticing-card__copy';
      p.dataset.testid = 'daily-noticing-closing';
      p.textContent = t(pickDailyNoticingClosingId(this._dateKey()) );
      this.bodyEl.appendChild(p);
      this.actions.appendChild(
        this._btn('DAILY_NOTICING_DONE', 'daily-noticing-done', 'primary', () =>
          this.close()
        )
      );
      return;
    }

    const q = document.createElement('p');
    q.className = 'daily-noticing-card__prompt';
    q.dataset.testid = 'daily-noticing-prompt';
    q.textContent = t(this._currentPromptId());
    this.bodyEl.appendChild(q);
    const input = document.createElement('textarea');
    input.rows = 3;
    input.className = 'daily-noticing-card__input';
    input.dataset.testid = 'daily-noticing-input';
    input.setAttribute('aria-label', t('DAILY_NOTICING_INPUT_LABEL'));
    input.placeholder = t('DAILY_NOTICING_INPUT_PLACEHOLDER');
    this.bodyEl.appendChild(input);

    this.actions.appendChild(
      this._btn('DAILY_NOTICING_CONTINUE', 'daily-noticing-continue', 'primary', () => {
        const text = input.value;
        const route = routeDailyNoticingAnswer({
          text,
          localDate: this._dateKey(),
          locale: getLocale()
        });
        if (route.kind === 'crisis') {
          this._crisisRouted = true;
          this._crisisLineText = route.lineText;
          this._step = 'crisis';
          this._persistRecord({
            promptIds: [...this._answeredPromptIds, this._currentPromptId()],
            crisisRouted: true
          });
        } else {
          const id = this._currentPromptId();
          if (!this._answeredPromptIds.includes(id)) this._answeredPromptIds.push(id);
          this._step = 'closing';
          this._persistRecord({ promptIds: [...this._answeredPromptIds] });
        }
        this._renderStep();
      })
    );
    if (this._promptIndex < this._promptOrder.length - 1) {
      this.actions.appendChild(
        this._btn('DAILY_NOTICING_ANOTHER', 'daily-noticing-another', 'secondary', () => {
          this._promptIndex += 1;
          this._renderStep();
        })
      );
    }
    this.actions.appendChild(
      this._btn('DAILY_NOTICING_SKIP', 'daily-noticing-skip', 'ghost', () => {
        this._persistRecord({ skipped: true, promptIds: [] });
        this.close();
      })
    );
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .daily-noticing-card { position: fixed; left: 50%; bottom: calc(env(safe-area-inset-bottom, 0px) + 16vh);
        transform: translateX(-50%) translateY(12px); width: min(92vw, 380px); z-index: ${Z.GLASS_CARD};
        opacity: 0; pointer-events: none; transition: opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease; }
      .daily-noticing-card.is-visible { opacity: 1; pointer-events: auto; transform: translateX(-50%) translateY(0); }
      .daily-noticing-card__title { margin: 0 0 10px; text-align: center; font-size: 1.05rem; font-weight: 600; }
      .daily-noticing-card__prompt, .daily-noticing-card__copy { margin: 0 0 12px; font-size: 1rem; line-height: 1.45; }
      .daily-noticing-card__input { width: 100%; box-sizing: border-box; border-radius: 10px; border: ${GLASS_BORDER};
        padding: 10px 12px; font: inherit; resize: vertical; background: rgba(255, 252, 245, 0.94); }
      .daily-noticing-card__actions { display: flex; flex-direction: column; gap: 8px; padding: 14px;
        border-radius: ${GLASS_RADIUS}; background: ${GLASS_FILL_STRONG}; border: ${GLASS_BORDER};
        box-shadow: ${GLASS_SHADOW}; backdrop-filter: ${GLASS_BLUR_CSS}; }
      .daily-noticing-card__btn { width: 100%; min-height: 46px; border: none; border-radius: 12px; font-size: 1rem; cursor: pointer; }
      .daily-noticing-card__btn:active { transform: scale(0.98); }
      .daily-noticing-card__btn--primary { background: rgba(255, 252, 245, 0.96); }
      .daily-noticing-card__btn--secondary { background: rgba(240, 234, 224, 0.9); }
      .daily-noticing-card__btn--ghost { background: transparent; color: var(--ft-text-muted, #6b5f52); }
      .daily-noticing-card__link { background: transparent; border: none; text-decoration: underline; cursor: pointer; min-height: 40px; }
      .daily-noticing-card__help-panel { margin-top: 10px; padding: 10px 12px; border-radius: 10px; font-size: 0.92rem;
        line-height: 1.4; background: rgba(255, 252, 245, 0.92); border: ${GLASS_BORDER}; }
    `;
    document.head.appendChild(style);
  }
}