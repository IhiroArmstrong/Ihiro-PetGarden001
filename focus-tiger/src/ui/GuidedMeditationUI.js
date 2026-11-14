/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Idle menu → Guided Meditation script list + step player (no video).
 */

import { t, onLocaleChange, getLocale } from '../locales/i18n.js';
import { OVERLAY_OUTSIDE_DISMISS } from '../core/overlaySlotContractRegistry.js';
import {
  findGuidedMeditationScriptLesson,
  GUIDED_MEDITATION_SCRIPT_LESSONS,
  isGuidedMeditationAvailable
} from '../core/guidedMeditationScriptCatalog.js';
import { createGuidedMeditationScriptEngine } from '../core/guidedMeditationScriptEngine.js';
import {
  canSpeakGuidedMeditation,
  speakGuidedMeditationSentence,
  stopGuidedMeditationSpeech
} from '../core/guidedMeditationSpeech.js';
import { resolveGuidedMeditationCredit } from '../core/guidedMeditationLessons.js';
import {
  GLASS_BLUR_CSS,
  GLASS_BORDER,
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

const STYLE_ID = 'guided-meditation-styles-v1';
const FADE_MS = OVERLAY_BACKDROP_FADE_MS;
const DUCK_SPEAK = 0.45;

export class GuidedMeditationUI {
  /**
   * @param {HTMLElement} mountRoot
   * @param {object} [handlers]
   * @param {() => void} [handlers.onOpen]
   * @param {() => void} [handlers.onClose]
   * @param {(payload: { durationMinutes: number, sourceId: string, lessonId: string }) => void} [handlers.onPracticeDay]
   * @param {() => { duckTo?: Function } | null} [handlers.getAmbient]
   */
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    this._open = false;
    /** @type {string | null} */
    this._lessonId = null;
    /** @type {(() => void) | null} */
    this._popEscapeLayer = null;
    this._credited = false;
    this._voiceOn = true;
    /** @type {ReturnType<typeof createGuidedMeditationScriptEngine> | null} */
    this._engine = null;
    /** @type {object | null} */
    this._snap = null;

    this.backdrop = createOverlayBackdrop(mountRoot, {
      id: 'guided-meditation-backdrop',
      testId: 'guided-meditation-backdrop',
      zIndex: Z.OVERLAY_DIM,
      outsideDismiss: OVERLAY_OUTSIDE_DISMISS.BLANK_CLOSES,
      onDismiss: () => this.close()
    });

    this.root = document.createElement('div');
    this.root.id = 'guided-meditation';
    this.root.className = 'guided-meditation';
    this.root.hidden = true;
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'guided-meditation-title');
    this.root.dataset.testid = 'guided-meditation';

    this.titleEl = document.createElement('p');
    this.titleEl.id = 'guided-meditation-title';
    this.titleEl.className = 'guided-meditation__title';

    this.panel = document.createElement('div');
    this.panel.className = 'guided-meditation__panel';

    this.listEl = document.createElement('div');
    this.listEl.className = 'guided-meditation__list';
    this.listEl.dataset.testid = 'guided-meditation-list';

    this.playerEl = document.createElement('div');
    this.playerEl.className = 'guided-meditation__player';
    this.playerEl.hidden = true;
    this.playerEl.dataset.testid = 'guided-meditation-player';

    this.companionEl = document.createElement('p');
    this.companionEl.className = 'guided-meditation__companion';
    this.companionEl.dataset.testid = 'guided-meditation-companion';

    this.lessonTitleEl = document.createElement('p');
    this.lessonTitleEl.className = 'guided-meditation__lesson-title';

    this.statusEl = document.createElement('p');
    this.statusEl.className = 'guided-meditation__status';
    this.statusEl.dataset.testid = 'guided-meditation-status';

    this.sentenceEl = document.createElement('p');
    this.sentenceEl.className = 'guided-meditation__sentence';
    this.sentenceEl.dataset.testid = 'guided-meditation-sentence';

    this.ringEl = document.createElement('div');
    this.ringEl.className = 'guided-meditation__ring';
    this.ringEl.dataset.testid = 'guided-meditation-silence-ring';
    this.ringEl.hidden = true;
    this.ringEl.setAttribute('aria-hidden', 'true');

    this.playerActions = document.createElement('div');
    this.playerActions.className = 'guided-meditation__player-actions';

    this.pauseBtn = document.createElement('button');
    this.pauseBtn.type = 'button';
    this.pauseBtn.className = 'guided-meditation__btn';
    this.pauseBtn.dataset.testid = 'guided-meditation-pause';
    this.pauseBtn.addEventListener('click', () => this._togglePause());

    this.prevBtn = document.createElement('button');
    this.prevBtn.type = 'button';
    this.prevBtn.className = 'guided-meditation__btn guided-meditation__btn--ghost';
    this.prevBtn.dataset.testid = 'guided-meditation-prev';
    this.prevBtn.addEventListener('click', () => this._engine?.skip(-1));

    this.nextBtn = document.createElement('button');
    this.nextBtn.type = 'button';
    this.nextBtn.className = 'guided-meditation__btn guided-meditation__btn--ghost';
    this.nextBtn.dataset.testid = 'guided-meditation-next';
    this.nextBtn.addEventListener('click', () => this._engine?.skip(1));

    this.voiceBtn = document.createElement('button');
    this.voiceBtn.type = 'button';
    this.voiceBtn.className = 'guided-meditation__btn guided-meditation__btn--ghost';
    this.voiceBtn.dataset.testid = 'guided-meditation-voice';
    this.voiceBtn.addEventListener('click', () => this._toggleVoice());

    this.endBtn = document.createElement('button');
    this.endBtn.type = 'button';
    this.endBtn.className = 'guided-meditation__btn';
    this.endBtn.dataset.testid = 'guided-meditation-end';
    this.endBtn.addEventListener('click', () => {
      this._tryCredit();
      this._showList();
    });

    this.backBtn = document.createElement('button');
    this.backBtn.type = 'button';
    this.backBtn.className = 'guided-meditation__btn guided-meditation__btn--ghost';
    this.backBtn.dataset.testid = 'guided-meditation-back';
    this.backBtn.addEventListener('click', () => this._showList());

    this.playerActions.append(
      this.pauseBtn,
      this.prevBtn,
      this.nextBtn,
      this.voiceBtn,
      this.endBtn,
      this.backBtn
    );
    this.playerEl.append(
      this.companionEl,
      this.lessonTitleEl,
      this.statusEl,
      this.sentenceEl,
      this.ringEl,
      this.playerActions
    );

    this.closeBtn = document.createElement('button');
    this.closeBtn.type = 'button';
    this.closeBtn.className =
      'guided-meditation__btn guided-meditation__btn--ghost';
    this.closeBtn.dataset.testid = 'guided-meditation-close';
    this.closeBtn.addEventListener('click', () => this.close());

    this.panel.append(this.listEl, this.playerEl, this.closeBtn);
    this.root.append(this.titleEl, this.panel);
    mountRoot.appendChild(this.root);

    this._onVisibility = () => {
      if (document.hidden) this._engine?.pause();
    };
    document.addEventListener('visibilitychange', this._onVisibility);

    this._injectStyles();
    this._unsubLocale = onLocaleChange(() => this._refreshTexts());
    this._refreshTexts();
  }

  /** @returns {boolean} */
  isOpen() {
    return this._open;
  }

  open() {
    if (!isGuidedMeditationAvailable()) return;
    if (this._open) {
      this._refreshTexts();
      return;
    }
    this._open = true;
    this._popEscapeLayer?.();
    this._popEscapeLayer = pushOverlayEscapeLayer({
      id: 'guided-meditation',
      dismiss: () => this.close()
    });
    showOverlayBackdrop(this.backdrop);
    this.root.hidden = false;
    this.root.getBoundingClientRect();
    this.root.classList.add('is-visible');
    this._showList();
    this.closeBtn.focus({ preventScroll: true });
    this.handlers.onOpen?.();
  }

  close() {
    if (!this._open) return;
    this._open = false;
    this._stopEngine();
    this._popEscapeLayer?.();
    this._popEscapeLayer = null;
    hideOverlayBackdrop(this.backdrop);
    this.root.classList.remove('is-visible');
    window.setTimeout(() => {
      if (!this._open) this.root.hidden = true;
    }, FADE_MS + 40);
    this.handlers.onClose?.();
  }

  /**
   * product=1 / e2e: apply effective seconds without waiting on the real script.
   * @param {string} lessonId
   * @param {number} playedSec
   * @param {{ completed?: boolean }} [opts]
   * @returns {boolean}
   */
  creditFromTestHook(lessonId, playedSec, opts = {}) {
    const lesson = findGuidedMeditationScriptLesson(lessonId);
    if (!lesson) return false;
    this._lessonId = lessonId;
    this._credited = false;
    return this._applyCredit(lesson, playedSec, opts.completed === true);
  }

  destroy() {
    this._unsubLocale?.();
    this._popEscapeLayer?.();
    this._popEscapeLayer = null;
    document.removeEventListener('visibilitychange', this._onVisibility);
    this._stopEngine();
    this.backdrop.remove();
    this.root.remove();
  }

  _showList() {
    this._stopEngine();
    this._lessonId = null;
    this._credited = false;
    this.listEl.hidden = false;
    this.playerEl.hidden = true;
    this._refreshTexts();
  }

  /**
   * @param {string} lessonId
   */
  _openLesson(lessonId) {
    const lesson = findGuidedMeditationScriptLesson(lessonId);
    if (!lesson || !isGuidedMeditationAvailable()) return;
    this._stopEngine();
    this._lessonId = lessonId;
    this._credited = false;
    this.listEl.hidden = true;
    this.playerEl.hidden = false;
    this.lessonTitleEl.textContent = t(lesson.titleKey);
    this._refreshTexts();

    this._engine = createGuidedMeditationScriptEngine({
      lesson,
      voiceEnabled: this._voiceOn,
      speak: (text, { onFinished }) =>
        speakGuidedMeditationSentence({
          text,
          locale: getLocale(),
          onFinished,
          widthPx: window.innerWidth
        }),
      stopSpeak: () => {
        stopGuidedMeditationSpeech();
      },
      onState: (snap) => this._onEngineState(snap)
    });
    this._engine.start();
  }

  _onEngineState(snap) {
    if (this._credited) return;
    this._snap = snap;
    this.sentenceEl.textContent = snap.sentence || '';
    const silent = snap.phase === 'silence';
    this.ringEl.hidden = !silent;
    if (snap.phase === 'speaking') {
      this._duckAmbient(DUCK_SPEAK);
      this._setStatus(
        canSpeakGuidedMeditation({ widthPx: window.innerWidth }) && this._voiceOn
          ? 'speaking'
          : 'web-text'
      );
    } else if (snap.phase === 'silence') {
      this._duckAmbient(1);
      this._setStatus('silence');
    } else if (snap.phase === 'paused') {
      this._duckAmbient(1);
      this._setStatus('paused');
    } else if (snap.phase === 'done') {
      this._duckAmbient(1);
      this._tryCredit();
    }
    this._refreshControlLabels();
  }

  _togglePause() {
    const phase = this._snap?.phase;
    if (phase === 'paused') this._engine?.resume();
    else this._engine?.pause();
  }

  _toggleVoice() {
    this._voiceOn = !this._voiceOn;
    this._engine?.setVoiceEnabled(this._voiceOn);
    if (!this._voiceOn) stopGuidedMeditationSpeech();
    this._refreshControlLabels();
  }

  _tryCredit() {
    const lesson = findGuidedMeditationScriptLesson(this._lessonId || '');
    if (!lesson) return false;
    const snap = this._engine?.getSnapshot?.() || this._snap;
    return this._applyCredit(
      lesson,
      Number(snap?.effectiveSec) || 0,
      snap?.completed === true
    );
  }

  /**
   * @param {import('../core/guidedMeditationScriptCatalog.js').GuidedMeditationScriptLesson} lesson
   * @param {number} playedSec
   * @param {boolean} completed
   */
  _applyCredit(lesson, playedSec, completed) {
    if (this._credited) return true;
    const credit = resolveGuidedMeditationCredit({
      delivery: 'script',
      completed,
      playedSec,
      nominalMinutes: lesson.nominalMinutes
    });
    if (!credit) {
      this._setStatus('incomplete');
      return false;
    }
    this._credited = true;
    this.handlers.onPracticeDay?.({
      durationMinutes: credit.durationMinutes,
      sourceId: 'guided-meditation',
      lessonId: lesson.id
    });
    this._setStatus('credited');
    return true;
  }

  _stopEngine() {
    this._engine?.abort();
    this._engine = null;
    this._snap = null;
    stopGuidedMeditationSpeech();
    this._duckAmbient(1);
    this.ringEl.hidden = true;
  }

  _duckAmbient(ratio) {
    const ambient =
      this.handlers.getAmbient?.() || globalThis.__ambientSoundscape;
    if (ambient && typeof ambient.duckTo === 'function') {
      ambient.duckTo(ratio, { fadeMs: 240 });
    }
  }

  /**
   * @param {'speaking' | 'silence' | 'paused' | 'web-text' | 'incomplete' | 'credited'} state
   */
  _setStatus(state) {
    this.statusEl.dataset.state = state;
    const keys = {
      speaking: 'GUIDED_MEDITATION_STATUS_SPEAKING',
      silence: 'GUIDED_MEDITATION_STATUS_SILENCE',
      paused: 'GUIDED_MEDITATION_STATUS_PAUSED',
      'web-text': 'GUIDED_MEDITATION_STATUS_WEB_TEXT',
      incomplete: 'GUIDED_MEDITATION_STATUS_INCOMPLETE',
      credited: 'GUIDED_MEDITATION_STATUS_CREDITED'
    };
    this.statusEl.textContent = t(keys[state] || keys.speaking);
  }

  _refreshControlLabels() {
    const paused = this._snap?.phase === 'paused';
    this.pauseBtn.textContent = paused
      ? t('GUIDED_MEDITATION_RESUME')
      : t('GUIDED_MEDITATION_PAUSE');
    this.endBtn.textContent = t('GUIDED_MEDITATION_END');
    this.backBtn.textContent = t('GUIDED_MEDITATION_BACK');
    this.prevBtn.textContent = t('GUIDED_MEDITATION_PREV');
    this.nextBtn.textContent = t('GUIDED_MEDITATION_NEXT');
    this.voiceBtn.textContent = this._voiceOn
      ? t('GUIDED_MEDITATION_VOICE_ON')
      : t('GUIDED_MEDITATION_VOICE_OFF');
  }

  _refreshTexts() {
    this.titleEl.textContent = t('GUIDED_MEDITATION_MENU_LABEL');
    this.closeBtn.textContent = t('GUIDED_MEDITATION_CLOSE');
    this.companionEl.textContent = t('GUIDED_MEDITATION_COMPANION_HINT');
    this._refreshControlLabels();
    if (this._lessonId) {
      const lesson = findGuidedMeditationScriptLesson(this._lessonId);
      if (lesson) this.lessonTitleEl.textContent = t(lesson.titleKey);
      const state = this.statusEl.dataset.state;
      if (state) this._setStatus(/** @type {any} */ (state));
    }

    this.listEl.replaceChildren();
    if (!isGuidedMeditationAvailable()) return;
    for (const lesson of GUIDED_MEDITATION_SCRIPT_LESSONS) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'guided-meditation__btn guided-meditation__btn--choice';
      btn.dataset.testid = `guided-meditation-lesson-${lesson.id}`;
      btn.dataset.lessonId = lesson.id;
      const lang = document.createElement('span');
      lang.className = 'guided-meditation__lang';
      lang.textContent = t('GUIDED_MEDITATION_LANG_EN');
      const label = document.createElement('span');
      label.className = 'guided-meditation__label';
      label.textContent = t(lesson.titleKey);
      const blurb = document.createElement('span');
      blurb.className = 'guided-meditation__blurb';
      blurb.textContent = t(lesson.blurbKey);
      btn.append(lang, label, blurb);
      btn.addEventListener('click', () => this._openLesson(lesson.id));
      this.listEl.appendChild(btn);
    }
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .guided-meditation {
        position: fixed;
        left: 50%;
        bottom: calc(env(safe-area-inset-bottom, 0px) + 8vh);
        transform: translateX(-50%) translateY(12px);
        width: min(94vw, 520px);
        z-index: ${Z.GLASS_CARD};
        opacity: 0;
        pointer-events: none;
        transition: opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease;
      }
      .guided-meditation.is-visible {
        opacity: 1;
        pointer-events: auto;
        transform: translateX(-50%) translateY(0);
      }
      .guided-meditation__title {
        margin: 0 0 12px;
        text-align: center;
        font-size: 1.05rem;
        font-weight: 600;
        color: var(--ft-text-primary, #2c2418);
      }
      .guided-meditation__panel {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 16px;
        border-radius: ${GLASS_RADIUS};
        background: ${GLASS_FILL_STRONG};
        border: ${GLASS_BORDER};
        box-shadow: ${GLASS_SHADOW};
        backdrop-filter: ${GLASS_BLUR_CSS};
      }
      .guided-meditation__list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .guided-meditation__btn {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
        width: 100%;
        min-height: 48px;
        border: none;
        border-radius: 12px;
        font-size: 1rem;
        cursor: pointer;
        padding: 10px 12px;
        background: rgba(255, 252, 245, 0.92);
        color: var(--ft-text-primary, #2c2418);
      }
      .guided-meditation__btn:active { transform: scale(0.98); }
      .guided-meditation__btn--ghost {
        align-items: center;
        background: transparent;
        color: var(--ft-text-muted, #6b5f52);
      }
      .guided-meditation__player-actions .guided-meditation__btn {
        align-items: center;
      }
      .guided-meditation__lang {
        font-size: 0.75rem;
        color: var(--ft-text-muted, #6b5f52);
      }
      .guided-meditation__blurb {
        font-size: 0.85rem;
        color: var(--ft-text-muted, #6b5f52);
      }
      .guided-meditation__companion {
        margin: 0 0 4px;
        font-size: 0.85rem;
        color: var(--ft-text-muted, #6b5f52);
      }
      .guided-meditation__sentence {
        margin: 0 0 8px;
        font-size: 1.02rem;
        line-height: 1.45;
        color: var(--ft-text-primary, #2c2418);
      }
      .guided-meditation__ring {
        width: 36px;
        height: 36px;
        margin: 4px auto 10px;
        border-radius: 50%;
        border: 2px solid rgba(120, 96, 72, 0.35);
        box-shadow: 0 0 0 0 rgba(120, 96, 72, 0.25);
        animation: guided-meditation-breathe 4s ease-in-out infinite;
      }
      @keyframes guided-meditation-breathe {
        0%, 100% { transform: scale(0.92); opacity: 0.55; }
        50% { transform: scale(1.08); opacity: 1; }
      }
      .guided-meditation__status {
        margin: 0 0 8px;
        font-size: 0.9rem;
        color: var(--ft-text-muted, #6b5f52);
      }
      .guided-meditation__lesson-title {
        margin: 0 0 6px;
        font-weight: 600;
      }
      .guided-meditation__player-actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
    `;
    document.head.appendChild(style);
  }
}
