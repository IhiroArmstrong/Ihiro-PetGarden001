/**
 * 分散式即时提示气泡 + 角落「?」补救入口。
 * @see ONBOARDING_HINTS.md
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  HINT_LOCALE_KEYS,
  createHintsSeenStore,
  resolveHintForScene
} from '../core/OnboardingHintsStore.js';

export class OnboardingHintsUI {
  /**
   * @param {HTMLElement} mountRoot 通常 document.body
   * @param {object} [options]
   * @param {ReturnType<typeof createHintsSeenStore>} [options.store]
   * @param {() => object} [options.getScene]
   */
  constructor(mountRoot, { store = createHintsSeenStore(), getScene = () => ({}) } = {}) {
    this.store = store;
    this.getScene = getScene;
    /** @type {string | null} */
    this._autoHintId = null;
    /** @type {ReturnType<typeof setTimeout> | null} */
    this._hideTimer = null;

    this.bubble = document.createElement('div');
    this.bubble.id = 'onboarding-hint-bubble';
    this.bubble.setAttribute('role', 'status');
    this.bubble.setAttribute('aria-live', 'polite');
    this.bubble.hidden = true;

    this.helpBtn = document.createElement('button');
    this.helpBtn.type = 'button';
    this.helpBtn.id = 'onboarding-hint-help';
    this.helpBtn.className = 'onboarding-hint-help';
    this.helpBtn.textContent = '?';
    this.helpBtn.setAttribute('aria-label', t('HINT_HELP_ARIA'));
    this.helpBtn.addEventListener('click', () => this.showRemedy());

    mountRoot.append(this.bubble, this.helpBtn);
    this._injectStyles();
    this._unsubLocale = onLocaleChange(() => {
      this.helpBtn.setAttribute('aria-label', t('HINT_HELP_ARIA'));
      if (this._autoHintId && !this.bubble.hidden) {
        this._paint(this._autoHintId, { remedy: false });
      }
    });
  }

  /**
   * 未读则自动展示；已读则 no-op。
   * @param {string} hintId
   */
  maybeShowAuto(hintId) {
    if (!HINT_LOCALE_KEYS[hintId]) return false;
    if (this.store.isSeen(hintId)) return false;
    this._autoHintId = hintId;
    this._paint(hintId, { remedy: false });
    return true;
  }

  /**
   * 标记已读并隐藏（若当前正显示该条）。
   * @param {string} hintId
   */
  markSeen(hintId) {
    this.store.markSeen(hintId);
    if (this._autoHintId === hintId) {
      this.hideBubble();
    }
  }

  /** 补救：按当前场景强制展示（忽略已读）。 */
  showRemedy() {
    const scene = this.getScene() || {};
    const hintId = resolveHintForScene(scene);
    this._autoHintId = hintId;
    this._paint(hintId, { remedy: true });
  }

  hideBubble() {
    window.clearTimeout(this._hideTimer);
    this._hideTimer = null;
    this.bubble.hidden = true;
    this.bubble.textContent = '';
    this._autoHintId = null;
  }

  clearSeen() {
    this.store.clear();
  }

  dispose() {
    this._unsubLocale();
    window.clearTimeout(this._hideTimer);
    this.bubble.remove();
    this.helpBtn.remove();
  }

  /**
   * @param {string} hintId
   * @param {{ remedy?: boolean }} [opts]
   */
  _paint(hintId, { remedy = false } = {}) {
    const key = HINT_LOCALE_KEYS[hintId] || HINT_LOCALE_KEYS['help-fallback'];
    this.bubble.textContent = t(key);
    this.bubble.hidden = false;
    this.bubble.dataset.hintId = hintId;
    this.bubble.dataset.remedy = remedy ? '1' : '0';
    window.clearTimeout(this._hideTimer);
    // 补救稍长一点；自动提示保持安静，操作后会 markSeen
    this._hideTimer = window.setTimeout(
      () => {
        if (this.bubble.dataset.remedy === '1') this.hideBubble();
      },
      remedy ? 8000 : 12000
    );
  }

  _injectStyles() {
    if (document.getElementById('onboarding-hint-styles')) return;
    const style = document.createElement('style');
    style.id = 'onboarding-hint-styles';
    style.textContent = `
      #onboarding-hint-bubble {
        position: fixed;
        left: 50%;
        bottom: 118px;
        transform: translateX(-50%);
        z-index: 24;
        max-width: min(420px, calc(100vw - 48px));
        padding: 8px 14px;
        border-radius: 14px;
        border: 1px solid rgba(139, 115, 85, 0.22);
        background: rgba(255, 252, 245, 0.92);
        box-shadow: 0 6px 18px rgba(44, 31, 20, 0.1);
        color: #5c4a32;
        font-size: 12.5px;
        line-height: 1.45;
        text-align: center;
        pointer-events: none;
      }
      #onboarding-hint-bubble[hidden] {
        display: none !important;
      }
      .onboarding-hint-help {
        position: fixed;
        left: 16px;
        bottom: 28px;
        z-index: 22;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 1px solid rgba(139, 115, 85, 0.35);
        background: linear-gradient(180deg, #fff8ec 0%, #f0dfc4 100%);
        color: #5c3d2e;
        font-size: 16px;
        font-weight: 600;
        line-height: 1;
        cursor: pointer;
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.9) inset,
          0 2px 0 rgba(160, 118, 72, 0.28),
          0 6px 14px rgba(44, 31, 20, 0.12);
        opacity: 0.88;
      }
      .onboarding-hint-help:hover {
        opacity: 1;
        filter: brightness(1.03);
      }
      .onboarding-hint-help:active {
        transform: translateY(1px);
      }
    `;
    document.head.appendChild(style);
  }
}
