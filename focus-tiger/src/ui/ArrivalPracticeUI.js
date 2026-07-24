/**
 * Arrival Practice UI —— Sit 之后的 Welcome / Notice / Breath / Choose。
 *
 * 设计对齐 `ARRIVE_MOMENT_DESIGN.md` v2：轻量观察式气泡 / 字幕，**不是**重型模态卡片。
 * 无每步 Skip / Skip — begin；快速开表改走 dock 旁 ⚡ Quick Start（`skipToBegin`）。
 *
 * 结束经 `onReady({ skipped, chose })` 交给 `main.js` / `SessionUiGate`：
 * - `skipped: true` → Quick Start → 立刻开计时
 * - `chose: true` 且无预选自动模式 → 开门闩并（通常）播点头后展开 Companion
 *
 * 状态机纯函数在 `ArrivalPractice.js`；本类只负责 DOM 与定时器。
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  ARRIVAL_BREATH_MS,
  ARRIVAL_NOTICE_REPLY_MS,
  ARRIVAL_STEPS,
  ARRIVAL_WELCOME_MS,
  CHOOSE_OPTIONS,
  NOTICE_OPTIONS,
  advanceArrivalStep,
  createArrivalPracticeState,
  getChooseOption,
  getNoticeOption,
  selectArrivalChoose,
  selectArrivalNotice,
  skipArrivalChoose,
  skipArrivalPracticeEntirely
} from '../core/ArrivalPractice.js';
import {
  MICRO_RITUAL_BREATH_PHASE_MS,
  isInhalePhase
} from '../core/MicroRitual.js';

/**
 * @typedef {object} ArrivalReadyInfo
 * @property {boolean} [skipped] Quick Start / 整体跳过 → 应直接开计时
 * @property {boolean} [chose] 走完 Choose → 应展开 Companion（点头可并行）
 */

/**
 * @typedef {object} ArrivalPracticeUIHandlers
 * @property {(info?: ArrivalReadyInfo) => void} [onReady] 流程结束（面板已 hide）
 * @property {() => void} [onWelcome] 欢迎 beat 开始（可播 smiling）
 * @property {() => void} [onCancel] 外部关闭（若接线）
 * @property {() => void} [onBegin] Arrival 开始（光影冷灰氛围）
 * @property {() => void} [onNoticeSelected] Notice 点选后（背景微暖）
 * @property {() => void} [onBreath] 呼吸 beat（推近 + 光环）
 * @property {() => void} [onAfterBreath] 离开呼吸进入 Choose
 * @property {() => void} [onChooseConfirmed] Choose 确认（坐垫光晕等）
 * @property {(done: () => void) => void} [onIntentionSetPlay]
 *   Choose 确认后播点头；调用 `done` 后再 `onReady`。缺省则立即 onReady。
 * @property {() => void} [onClearLight] 结束/跳过时清氛围
 */

const ROOT_CSS = [
  'position:absolute',
  'left:50%',
  // 须高于 dock（⚡ + How shall we sit?）；Sit 在 Arrival 中会隐藏，仍给足余量防重叠
  'bottom:max(148px, calc(env(safe-area-inset-bottom, 0px) + 132px))',
  'z-index:15',
  'width:min(420px,calc(100vw - 40px))',
  'transform:translate(-50%, 8px)',
  'padding:0',
  'border:none',
  'border-radius:0',
  'background:transparent',
  'box-shadow:none',
  'color:var(--text-primary, #2c1f14)',
  'transition:opacity 240ms ease,transform 240ms ease',
  'opacity:0',
  'pointer-events:auto',
  'display:flex',
  'flex-direction:column',
  'align-items:center',
  'gap:12px'
].join(';');

const SUBTITLE_CSS = [
  'max-width:100%',
  'padding:10px 16px',
  'border-radius:18px',
  'background:rgba(255,252,245,0.72)',
  'backdrop-filter:blur(8px)',
  '-webkit-backdrop-filter:blur(8px)',
  'border:1px solid rgba(139,115,85,0.14)',
  'box-shadow:0 4px 18px rgba(44,31,20,0.06)',
  'font-size:15px',
  'line-height:1.55',
  'color:#4a3a28',
  'text-align:center'
].join(';');

const CHIP_CSS = [
  'display:flex',
  'flex-direction:column',
  'align-items:center',
  'gap:4px',
  'padding:8px 4px',
  'border-radius:14px',
  'border:1px solid rgba(139,115,85,0.16)',
  'background:rgba(255,252,245,0.55)',
  'cursor:pointer',
  'color:var(--text-primary, #2c1f14)',
  'font-size:11px',
  'line-height:1.3',
  'min-width:0'
].join(';');

const QUIET_BTN_CSS = [
  'padding:6px 12px',
  'font-size:12px',
  'color:var(--text-secondary, rgba(74,58,40,.78))',
  'background:transparent',
  'border:1px solid rgba(139,115,85,0.22)',
  'border-radius:14px',
  'cursor:pointer'
].join(';');

export class ArrivalPracticeUI {
  /**
   * @param {HTMLElement} container 通常为 `#ui-overlay`
   * @param {ArrivalPracticeUIHandlers} [handlers]
   */
  constructor(container, handlers = {}) {
    this.container = container;
    /** @type {ArrivalPracticeUIHandlers} */
    this.handlers = handlers;
    /** @type {HTMLElement | null} */
    this.root = null;
    this.state = createArrivalPracticeState();
    /** @type {string} Notice 观察式短句（展示用） */
    this._noticeReply = '';
    /** @type {boolean} Choose 是否显示自由输入 */
    this._showTyped = false;
    /** @type {number | null} */
    this._timer = null;
    /** @type {number | null} */
    this._breathInterval = null;
    this._unsubLocale = onLocaleChange(() => this._render());
  }

  /**
   * @returns {boolean}
   */
  isOpen() {
    return Boolean(this.root);
  }

  /**
   * @returns {'welcome' | 'notice' | 'breath' | 'choose' | 'ready' | null}
   */
  getStep() {
    return this.state?.step ?? null;
  }

  /**
   * @returns {{ text: string, source: 'icon' | 'typed' } | null}
   */
  getChooseResult() {
    if (!this.state.chooseText) return null;
    return {
      text: this.state.chooseText,
      source: this.state.chooseSource === 'icon' ? 'icon' : 'typed'
    };
  }

  /**
   * 从 Welcome 开始一轮 Arrival（含 Notice → Breath → Choose）。
   * @returns {void}
   */
  start() {
    this._clearTimers();
    this.state = createArrivalPracticeState();
    this._noticeReply = '';
    this._showTyped = false;
    this._ensureRoot();
    this._render();
    this._fadeIn();
    this.handlers.onBegin?.();
    this.handlers.onWelcome?.();
    this._timer = window.setTimeout(() => {
      if (this.state.step === ARRIVAL_STEPS.WELCOME) {
        this.state = advanceArrivalStep(this.state);
        this._render();
      }
    }, ARRIVAL_WELCOME_MS);
  }

  /**
   * @param {object} [options]
   * @param {boolean} [options.clearLight=true]
   * @returns {void}
   */
  hide({ clearLight = true } = {}) {
    this._clearTimers();
    if (clearLight) this.handlers.onClearLight?.();
    if (this.root) {
      this.root.remove();
      this.root = null;
    }
  }

  /**
   * Quick Start：整体跳过仪式并 `onReady({ skipped: true })`。
   * @returns {void}
   */
  skipToBegin() {
    if (!this.root) return;
    this._skipEntirely();
  }

  /**
   * @returns {void}
   */
  dispose() {
    this._unsubLocale();
    this.hide();
  }

  _finishReady({ chose = false, skipped = false } = {}) {
    if (chose) this.handlers.onChooseConfirmed?.();
    this.hide({ clearLight: !chose });
    const payload = { chose: Boolean(chose), skipped: Boolean(skipped) };
    if (chose && typeof this.handlers.onIntentionSetPlay === 'function') {
      this.handlers.onIntentionSetPlay(() => this.handlers.onReady?.(payload));
      return;
    }
    this.handlers.onReady?.(payload);
  }

  _skipEntirely() {
    this.state = skipArrivalPracticeEntirely(this.state);
    this._finishReady({ chose: false, skipped: true });
  }

  _ensureRoot() {
    if (this.root) return;
    this.root = document.createElement('div');
    this.root.id = 'arrival-practice';
    this.root.className = 'arrival-practice arrival-practice--bubble';
    this.root.style.cssText = ROOT_CSS;
    this.container.appendChild(this.root);
  }

  _fadeIn() {
    if (!this.root) return;
    this.root.getBoundingClientRect();
    this.root.style.opacity = '1';
    this.root.style.transform = 'translate(-50%, 0)';
  }

  _clearTimers() {
    window.clearTimeout(this._timer);
    window.clearInterval(this._breathInterval);
    this._timer = null;
    this._breathInterval = null;
  }

  _subtitle(text) {
    const el = document.createElement('div');
    el.className = 'arrival-practice__subtitle';
    el.style.cssText = SUBTITLE_CSS;
    el.textContent = text;
    return el;
  }

  _startBreath() {
    this._clearTimers();
    const startedAt = Date.now();
    this._breathInterval = window.setInterval(() => {
      const phaseEl = this.root?.querySelector('[data-arrival-breath-phase]');
      if (!phaseEl) return;
      const elapsed = Date.now() - startedAt;
      const inhale = isInhalePhase(elapsed, MICRO_RITUAL_BREATH_PHASE_MS);
      phaseEl.textContent = t(
        inhale ? 'HONESTY_BREATH_INHALE' : 'HONESTY_BREATH_EXHALE'
      );
    }, 200);
    this._timer = window.setTimeout(() => {
      this._clearTimers();
      if (this.state.step === ARRIVAL_STEPS.BREATH) {
        this.state = advanceArrivalStep(this.state);
        this._render();
      }
    }, ARRIVAL_BREATH_MS);
  }

  _render() {
    if (!this.root) return;
    this.root.replaceChildren();

    if (this.state.step === ARRIVAL_STEPS.WELCOME) {
      this.root.append(this._subtitle(t('ARRIVAL_WELCOME')));
      return;
    }

    if (this.state.step === ARRIVAL_STEPS.NOTICE) {
      if (this._noticeReply) {
        this.root.append(this._subtitle(this._noticeReply));
        return;
      }

      this.root.append(this._subtitle(t('ARRIVAL_NOTICE_PROMPT')));
      const grid = this._iconGrid(NOTICE_OPTIONS, (opt) => {
        this.state = selectArrivalNotice(this.state, opt.id);
        const option = getNoticeOption(opt.id);
        this._noticeReply = option ? t(option.replyKey) : '';
        this.handlers.onNoticeSelected?.();
        this._renderNoticeReplyThenAdvance();
      });
      this.root.append(grid);
      return;
    }

    if (this.state.step === ARRIVAL_STEPS.BREATH) {
      this.root.append(this._subtitle(t('ARRIVAL_BREATH_GUIDE')));
      const phaseEl = document.createElement('div');
      phaseEl.dataset.arrivalBreathPhase = '1';
      phaseEl.className = 'arrival-practice__breath-phase';
      phaseEl.style.cssText =
        'font-size:14px;letter-spacing:.06em;color:rgba(107,74,50,0.88);text-align:center;font-weight:520;';
      phaseEl.textContent = t('HONESTY_BREATH_INHALE');
      this.root.append(phaseEl);
      this.handlers.onBreath?.();
      this._startBreath();
      return;
    }

    if (this.state.step === ARRIVAL_STEPS.CHOOSE) {
      this.handlers.onAfterBreath?.();
      this.root.append(this._subtitle(t('ARRIVAL_CHOOSE_PROMPT')));

      const grid = this._iconGrid(CHOOSE_OPTIONS, (opt) => {
        const option = getChooseOption(opt.id);
        const label = option
          ? `${option.emoji} ${t(option.labelKey)}`
          : t(opt.labelKey);
        this.state = selectArrivalChoose(this.state, {
          text: label,
          source: 'icon'
        });
        this._finishReady({ chose: true });
      });
      this.root.append(grid);

      const typedToggle = document.createElement('button');
      typedToggle.type = 'button';
      typedToggle.style.cssText = QUIET_BTN_CSS;
      typedToggle.textContent = t('ARRIVAL_CHOOSE_WRITE_OWN');
      typedToggle.addEventListener('click', () => {
        this._showTyped = !this._showTyped;
        this._render();
      });
      this.root.append(typedToggle);

      if (this._showTyped) {
        const input = document.createElement('input');
        input.type = 'text';
        input.style.cssText =
          'width:100%;box-sizing:border-box;padding:9px 12px;font-size:14px;border-radius:12px;border:1px solid rgba(139,115,85,.28);background:rgba(255,252,245,.8);color:#2c1f14;outline:none;';
        input.placeholder = t('SESSION_INTENTION_PLACEHOLDER');
        input.addEventListener('keydown', (event) => {
          if (event.key !== 'Enter') return;
          const text = input.value.trim();
          if (!text) {
            this.state = skipArrivalChoose(this.state);
            this._finishReady({ chose: false });
          } else {
            this.state = selectArrivalChoose(this.state, {
              text,
              source: 'typed'
            });
            this._finishReady({ chose: true });
          }
        });
        this.root.appendChild(input);
        window.setTimeout(() => input.focus({ preventScroll: true }), 30);
      }
    }
  }

  _renderNoticeReplyThenAdvance() {
    this._render();
    this._clearTimers();
    this._timer = window.setTimeout(() => {
      this.state = advanceArrivalStep(this.state);
      this._noticeReply = '';
      this._render();
    }, ARRIVAL_NOTICE_REPLY_MS);
  }

  /**
   * @param {readonly { id: string, emoji: string, labelKey: string }[]} options
   * @param {(opt: { id: string, emoji: string, labelKey: string }) => void} onPick
   */
  _iconGrid(options, onPick) {
    const grid = document.createElement('div');
    grid.className = 'arrival-practice__icons';
    grid.style.cssText =
      'display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;width:100%;';
    for (const opt of options) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.style.cssText = CHIP_CSS;
      const emoji = document.createElement('span');
      emoji.style.fontSize = '22px';
      emoji.textContent = opt.emoji;
      const label = document.createElement('span');
      label.textContent = t(opt.labelKey);
      btn.append(emoji, label);
      btn.addEventListener('click', () => onPick(opt));
      grid.appendChild(btn);
    }
    return grid;
  }
}
