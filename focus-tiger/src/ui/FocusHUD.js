import { COLORS } from '../utils/Constants.js';

export class FocusHUD {
  constructor(rootElement) {
    this.root = rootElement;
    this._ensureElements();
  }

  _ensureElements() {
    if (!this.root) return;
    this.root.innerHTML = `
      <div class="hud-status">状态：<span id="hud-state">沉静</span></div>
      <div class="hud-level">专注度：<span id="hud-level">0%</span></div>
      <div class="hud-time">时长：<span id="hud-time">00:00</span></div>
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
    const labels = {
      IDLE: '沉静',
      FOCUSING: '专注中',
      BREAK: '休息',
      CELEBRATE: '庆祝',
      DORMANT: '沉睡'
    };
    return labels[state] || state;
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
