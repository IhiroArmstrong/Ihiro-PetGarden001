import { COLORS } from '../utils/Constants.js';
import { t, onLocaleChange } from '../locales/i18n.js';

export class FocusHUD {
  constructor(rootElement) {
    this.root = rootElement;
    this._ensureElements();
    // 语言切换时重建标签（数值由 render 每帧回填）
    onLocaleChange(() => this._ensureElements());
  }

  _ensureElements() {
    if (!this.root) return;
    this.root.innerHTML = `
      <div class="hud-status">${t('HUD_LABEL_STATE')}: <span id="hud-state">${t('STATE_IDLE')}</span></div>
      <div class="hud-level">${t('HUD_LABEL_LEVEL')}: <span id="hud-level">0%</span></div>
      <div class="hud-time">${t('HUD_LABEL_TIME')}: <span id="hud-time">00:00</span></div>
    `;
    this.stateEl = this.root.querySelector('#hud-state');
    this.levelEl = this.root.querySelector('#hud-level');
    this.timeEl = this.root.querySelector('#hud-time');
  }

  _formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  _stateLabel(state) {
    const labelKeys = {
      IDLE: 'STATE_IDLE',
      FOCUSING: 'STATE_FOCUSING',
      BREAK: 'STATE_BREAK',
      CELEBRATE: 'STATE_CELEBRATE',
      DORMANT: 'STATE_DORMANT'
    };
    return labelKeys[state] ? t(labelKeys[state]) : state;
  }

  render(focusSession, stateManager) {
    if (!this.root) return;

    const level = focusSession.getFocusLevel();
    this.levelEl.textContent = `${Math.round(level * 100)}%`;
    this.timeEl.textContent = this._formatTime(focusSession.elapsedSeconds);
    this.stateEl.textContent = this._stateLabel(stateManager.state);
    this.stateEl.style.color = level > 0.5 ? COLORS.focusGoldMid : COLORS.textInk;
  }
}
