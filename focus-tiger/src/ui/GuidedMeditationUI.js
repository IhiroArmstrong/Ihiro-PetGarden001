/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Idle menu → Guided Meditation list + in-app video player.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import { OVERLAY_OUTSIDE_DISMISS } from '../core/overlaySlotContractRegistry.js';
import {
  GUIDED_MEDITATION_LESSONS,
  findGuidedMeditationLesson,
  resolveGuidedMeditationCredit,
  sumPlayedSeconds
} from '../core/guidedMeditationLessons.js';
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

export class GuidedMeditationUI {
  /**
   * @param {HTMLElement} mountRoot
   * @param {object} [handlers]
   * @param {() => void} [handlers.onOpen]
   * @param {() => void} [handlers.onClose]
   * @param {(payload: { durationMinutes: number, sourceId: string, lessonId: string }) => void} [handlers.onPracticeDay]
   */
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    this._open = false;
    /** @type {string | null} */
    this._lessonId = null;
    /** @type {(() => void) | null} */
    this._popEscapeLayer = null;
    this._credited = false;

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

    this.lessonTitleEl = document.createElement('p');
    this.lessonTitleEl.className = 'guided-meditation__lesson-title';

    this.statusEl = document.createElement('p');
    this.statusEl.className = 'guided-meditation__status';
    this.statusEl.dataset.testid = 'guided-meditation-status';

    this.video = document.createElement('video');
    this.video.className = 'guided-meditation__video';
    this.video.dataset.testid = 'guided-meditation-video';
    this.video.setAttribute('playsinline', '');
    this.video.setAttribute('controls', '');
    this.video.preload = 'metadata';
    this.video.addEventListener('waiting', () => this._setStatus('loading'));
    this.video.addEventListener('playing', () => this._setStatus('playing'));
    this.video.addEventListener('pause', () => {
      if (!this.video.ended && this._lessonId) this._setStatus('paused');
    });
    this.video.addEventListener('ended', () => this._tryCredit());
    this.video.addEventListener('error', () => this._setStatus('need-network'));

    this.playerActions = document.createElement('div');
    this.playerActions.className = 'guided-meditation__player-actions';

    this.pauseBtn = document.createElement('button');
    this.pauseBtn.type = 'button';
    this.pauseBtn.className = 'guided-meditation__btn';
    this.pauseBtn.dataset.testid = 'guided-meditation-pause';
    this.pauseBtn.addEventListener('click', () => this._togglePause());

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

    this.playerActions.append(this.pauseBtn, this.endBtn, this.backBtn);
    this.playerEl.append(
      this.lessonTitleEl,
      this.statusEl,
      this.video,
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
      if (document.hidden && !this.video.paused) this.video.pause();
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
    this._stopVideo();
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
   * product=1 / e2e: apply played seconds without waiting on the real cut.
   * @param {string} lessonId
   * @param {number} playedSec
   * @returns {boolean}
   */
  creditFromTestHook(lessonId, playedSec) {
    const lesson = findGuidedMeditationLesson(lessonId);
    if (!lesson) return false;
    this._lessonId = lessonId;
    this._credited = false;
    return this._applyCredit(lesson, playedSec);
  }

  destroy() {
    this._unsubLocale?.();
    this._popEscapeLayer?.();
    this._popEscapeLayer = null;
    document.removeEventListener('visibilitychange', this._onVisibility);
    this._stopVideo();
    this.backdrop.remove();
    this.root.remove();
  }

  _showList() {
    this._stopVideo();
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
    const lesson = findGuidedMeditationLesson(lessonId);
    if (!lesson) return;
    this._lessonId = lessonId;
    this._credited = false;
    this.listEl.hidden = true;
    this.playerEl.hidden = false;
    this.lessonTitleEl.textContent = t(lesson.titleKey);
    this._setStatus('loading');
    this.video.src = lesson.videoUrl;
    this.video.load();
    void this.video.play().catch(() => this._setStatus('need-network'));
    this._refreshTexts();
  }

  _togglePause() {
    if (this.video.paused) {
      void this.video.play().catch(() => this._setStatus('need-network'));
    } else {
      this.video.pause();
    }
    this._refreshTexts();
  }

  _tryCredit() {
    const lesson = findGuidedMeditationLesson(this._lessonId || '');
    if (!lesson) return false;
    return this._applyCredit(lesson, sumPlayedSeconds(this.video));
  }

  /**
   * @param {import('../core/guidedMeditationLessons.js').GuidedMeditationLesson} lesson
   * @param {number} playedSec
   */
  _applyCredit(lesson, playedSec) {
    if (this._credited) return true;
    const credit = resolveGuidedMeditationCredit({
      kind: lesson.kind,
      durationSec: lesson.durationSec,
      nominalMinutes: lesson.nominalMinutes,
      playedSec
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

  _stopVideo() {
    this.video.pause();
    this.video.removeAttribute('src');
    this.video.load();
  }

  /**
   * @param {'loading' | 'playing' | 'paused' | 'need-network' | 'incomplete' | 'credited'} state
   */
  _setStatus(state) {
    this.statusEl.dataset.state = state;
    const keys = {
      loading: 'GUIDED_MEDITATION_STATUS_LOADING',
      playing: 'GUIDED_MEDITATION_STATUS_PLAYING',
      paused: 'GUIDED_MEDITATION_STATUS_PAUSED',
      'need-network': 'GUIDED_MEDITATION_STATUS_NEED_NETWORK',
      incomplete: 'GUIDED_MEDITATION_STATUS_INCOMPLETE',
      credited: 'GUIDED_MEDITATION_STATUS_CREDITED'
    };
    this.statusEl.textContent = t(keys[state] || keys.loading);
  }

  _refreshTexts() {
    this.titleEl.textContent = t('GUIDED_MEDITATION_MENU_LABEL');
    this.closeBtn.textContent = t('GUIDED_MEDITATION_CLOSE');
    this.pauseBtn.textContent = this.video.paused
      ? t('GUIDED_MEDITATION_RESUME')
      : t('GUIDED_MEDITATION_PAUSE');
    this.endBtn.textContent = t('GUIDED_MEDITATION_END');
    this.backBtn.textContent = t('GUIDED_MEDITATION_BACK');
    if (this._lessonId) {
      const lesson = findGuidedMeditationLesson(this._lessonId);
      if (lesson) this.lessonTitleEl.textContent = t(lesson.titleKey);
      const state = this.statusEl.dataset.state;
      if (state) this._setStatus(/** @type {any} */ (state));
    }

    this.listEl.replaceChildren();
    for (const lesson of GUIDED_MEDITATION_LESSONS) {
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
      .guided-meditation__video {
        width: 100%;
        border-radius: 10px;
        background: #1a1612;
        max-height: 42vh;
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
