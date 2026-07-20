/**
 * Arrival Practice UI —— Sit 之后的 Welcome / Notice / Breath / Choose 叠层。
 *
 * 跳过方案：每步 Skip + 全程「Skip — begin」；欢迎/呼吸可自动前进；不强制点选图标。
 * 结束经 `onReady({ skipped, chose })` 交给 `main.js` / `SessionUiGate`：
 * - `skipped: true` → 立刻开计时
 * - `chose: true` → 开门闩并（通常）播点头后展开 Companion
 *
 * 状态机纯函数在 `ArrivalPractice.js`；本类只负责 DOM 与定时器。
 * @see docs/ARRIVE_MOMENT_DESIGN.md
 * @see docs/SHARED_RESOURCES.md §4
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

/**
 * @typedef {object} ArrivalReadyInfo
 * @property {boolean} [skipped] Skip — begin / Sit 整体跳过 → 应直接开计时
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

const PANEL_CSS = [
  'position:absolute',
  'left:50%',
  'bottom:96px',
  'z-index:15',
  'width:min(460px,calc(100vw - 48px))',
  'transform:translate(-50%, 12px)',
  'padding:18px 20px 14px',
  'border:1px solid var(--color-surface-border, rgba(139,115,85,.2))',
  'border-radius:18px',
  'background:linear-gradient(180deg, var(--color-surface-warm-top, rgba(255,255,255,.96)) 0%, var(--color-surface-warm, #f8f1e4) 100%)',
  'box-shadow:0 10px 30px rgba(44,31,20,.12)',
  'color:var(--text-primary, #2c1f14)',
  'transition:opacity 240ms ease,transform 240ms ease',
  'opacity:0',
  'pointer-events:auto'
].join(';');

const CHIP_CSS = [
  'display:flex',
  'flex-direction:column',
  'align-items:center',
  'gap:4px',
  'padding:10px 6px',
  'border-radius:12px',
  'border:1px solid var(--color-surface-border, rgba(139,115,85,.22))',
  'background:rgba(255,255,255,.7)',
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
  'border:1px solid var(--color-surface-border, rgba(139,115,85,.28))',
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
   * 面板是否挂在 DOM 上（进行中）。
   * @returns {boolean}
   */
  isOpen() {
    return Boolean(this.root);
  }

  /**
   * 当前步骤；无面板时为 `null`。
   * @returns {'welcome' | 'notice' | 'breath' | 'choose' | 'ready' | null}
   */
  getStep() {
    return this.state?.step ?? null;
  }

  /**
   * Choose 结果（供会话意图回显）；未选则为 `null`。
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
   * 从 Welcome 开始一轮 Arrival；会触发 `onBegin` / `onWelcome`。
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
   * 关闭面板并清定时器。
   * @param {object} [options]
   * @param {boolean} [options.clearLight=true] 是否调用 `onClearLight`
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
   * 外部 Sit：整体 Skip — begin（`onReady({ skipped: true })`），由 Gate 立刻开计时。
   * 面板未开时为 no-op。
   * @returns {void}
   */
  skipToBegin() {
    if (!this.root) return;
    this._skipEntirely();
  }

  /**
   * 取消 locale 订阅并 hide。
   * @returns {void}
   */
  dispose() {
    this._unsubLocale();
    this.hide();
  }

  _finishReady({ chose = false, skipped = false } = {}) {
    if (chose) this.handlers.onChooseConfirmed?.();
    // 点选意图后还要播点头：先别清 Dolly/氛围，等淡入 idle 后再拉回。
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
    this.root.style.cssText = PANEL_CSS;
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

  _startBreath() {
    this._clearTimers();
    const startedAt = Date.now();
    this._breathInterval = window.setInterval(() => {
      const phaseEl = this.root?.querySelector('[data-arrival-breath-phase]');
      if (!phaseEl) return;
      const elapsed = Date.now() - startedAt;
      const inhale = Math.floor(elapsed / 2500) % 2 === 0;
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

    const footer = this._buildFooter();

    if (this.state.step === ARRIVAL_STEPS.WELCOME) {
      const bubble = document.createElement('div');
      bubble.style.cssText =
        'font-size:16px;line-height:1.55;color:#4a3a28;text-align:center;margin-bottom:12px;';
      bubble.textContent = t('ARRIVAL_WELCOME');
      this.root.append(bubble, footer);
      return;
    }

    if (this.state.step === ARRIVAL_STEPS.NOTICE) {
      // 点选后：收起整屏图标区，只留 Yin 观察式短句，避免「框还在那里不动」的卡住感。
      if (this._noticeReply) {
        const reply = document.createElement('div');
        reply.style.cssText =
          'font-size:15px;line-height:1.55;color:#6b4a32;text-align:center;padding:8px 4px 4px;';
        reply.textContent = this._noticeReply;
        this.root.append(reply, footer);
        return;
      }

      const title = document.createElement('div');
      title.style.cssText =
        'font-size:14px;line-height:1.5;color:#4a3a28;text-align:center;margin-bottom:12px;';
      title.textContent = t('ARRIVAL_NOTICE_PROMPT');

      const grid = this._iconGrid(NOTICE_OPTIONS, (opt) => {
        this.state = selectArrivalNotice(this.state, opt.id);
        const option = getNoticeOption(opt.id);
        this._noticeReply = option ? t(option.replyKey) : '';
        this.handlers.onNoticeSelected?.();
        this._renderNoticeReplyThenAdvance();
      });

      this.root.append(title, grid, footer);
      return;
    }

    if (this.state.step === ARRIVAL_STEPS.BREATH) {
      const title = document.createElement('div');
      title.style.cssText =
        'font-size:15px;line-height:1.5;color:#2c1f14;text-align:center;margin-bottom:10px;font-weight:560;';
      title.textContent = t('ARRIVAL_BREATH_GUIDE');

      const phaseEl = document.createElement('div');
      phaseEl.dataset.arrivalBreathPhase = '1';
      phaseEl.style.cssText =
        'font-size:15px;letter-spacing:.06em;color:#6b4a32;text-align:center;font-weight:560;';
      phaseEl.textContent = t('HONESTY_BREATH_INHALE');

      this.root.append(title, phaseEl, footer);
      this.handlers.onBreath?.();
      this._startBreath();
      return;
    }

    if (this.state.step === ARRIVAL_STEPS.CHOOSE) {
      this.handlers.onAfterBreath?.();
      const title = document.createElement('div');
      title.style.cssText =
        'font-size:14px;line-height:1.5;color:#4a3a28;text-align:center;margin-bottom:12px;';
      title.textContent = t('ARRIVAL_CHOOSE_PROMPT');

      const grid = this._iconGrid(CHOOSE_OPTIONS, (opt) => {
        const option = getChooseOption(opt.id);
        const label = option ? `${option.emoji} ${t(option.labelKey)}` : t(opt.labelKey);
        this.state = selectArrivalChoose(this.state, {
          text: label,
          source: 'icon'
        });
        this._finishReady({ chose: true });
      });

      const typedToggle = document.createElement('button');
      typedToggle.type = 'button';
      typedToggle.style.cssText = `${QUIET_BTN_CSS};margin-top:10px;width:100%;`;
      typedToggle.textContent = t('ARRIVAL_CHOOSE_WRITE_OWN');
      typedToggle.addEventListener('click', () => {
        this._showTyped = !this._showTyped;
        this._render();
      });

      this.root.append(title, grid, typedToggle);

      if (this._showTyped) {
        const input = document.createElement('input');
        input.type = 'text';
        input.style.cssText =
          'width:100%;box-sizing:border-box;margin-top:10px;padding:9px 12px;font-size:14px;border-radius:10px;border:1px solid rgba(139,115,85,.3);background:rgba(255,255,255,.75);color:#2c1f14;outline:none;';
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

      this.root.appendChild(footer);
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
    grid.style.cssText =
      'display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;';
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

  _buildFooter() {
    const footer = document.createElement('div');
    footer.style.cssText =
      'display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:14px;';

    const skipStep = document.createElement('button');
    skipStep.type = 'button';
    skipStep.style.cssText = QUIET_BTN_CSS;
    skipStep.textContent = t('ARRIVAL_SKIP_STEP');
    skipStep.addEventListener('click', () => this._onSkipStep());

    const skipAll = document.createElement('button');
    skipAll.type = 'button';
    skipAll.style.cssText = QUIET_BTN_CSS;
    skipAll.textContent = t('ARRIVAL_SKIP_BEGIN');
    skipAll.addEventListener('click', () => this._skipEntirely());

    footer.append(skipStep, skipAll);
    return footer;
  }

  _onSkipStep() {
    this._clearTimers();
    if (this.state.step === ARRIVAL_STEPS.NOTICE) {
      this.state = { ...this.state, noticeId: null };
      this.state = advanceArrivalStep(this.state);
      this._noticeReply = '';
      this._render();
      return;
    }
    if (this.state.step === ARRIVAL_STEPS.CHOOSE) {
      this.state = skipArrivalChoose(this.state);
      this._finishReady({ chose: false });
      return;
    }
    if (this.state.step === ARRIVAL_STEPS.WELCOME || this.state.step === ARRIVAL_STEPS.BREATH) {
      this.state = advanceArrivalStep(this.state);
      this._render();
    }
  }
}
