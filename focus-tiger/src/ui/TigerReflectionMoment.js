/**
 * Tiger Reflection Moment —— 专注会话结束后的可选轻量反思环节。
 *
 * 设计约束（DESIGN.md「结束反思」/ PRINCIPLES「观照者而非情绪本身」）：
 * - 不是表单、不是日报：三个问题逐个淡入，每题独立可跳，无必填、无校验、无提交语义；
 * - 任何跳过路径都没有提示或劝导文案，Skip 与 Continue 视觉同级；
 * - 问题三使用「下次」而非「明天」，避免暗示每日义务
 *   （regular practice, at your own pace）。
 * - 若本次填写了 Session Intention，开头回显一句纯展示文字，不参与三问跳过/记录。
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  ReflectionFlowState,
  REFLECTION_QUESTION_KEYS
} from './ReflectionFlowState.js';
import { normalizeIntentionText, formatIntentionEcho, intentionEchoKey } from '../core/SessionIntentionStore.js';
import {
  formatLocalDateYmd,
  pickReflectionEchoKey,
  shouldShowReflectionEcho
} from './reflectionEchoCopy.js';
import {
  GLASS_BLUR_CSS,
  GLASS_BORDER,
  GLASS_BORDER_STRONG,
  GLASS_FILL,
  GLASS_FILL_STRONG,
  GLASS_RADIUS,
  GLASS_SHADOW
} from './glassPanelStyles.js';

export { ReflectionFlowState, REFLECTION_QUESTION_KEYS };
export { REFLECTION_ANSWER_FIELDS } from './ReflectionFlowState.js';
export { formatIntentionEcho } from '../core/SessionIntentionStore.js';
export {
  pickReflectionEchoKey,
  shouldShowReflectionEcho,
  REFLECTION_ECHO_KEYS
} from './reflectionEchoCopy.js';

const FADE_MS = 260;

/**
 * After Continue with a non-empty answer → locale key for companion echo.
 * Skip / blank Continue → null (no new echo).
 * @param {object} opts
 * @param {boolean} opts.submit
 * @param {string} [opts.rawAnswer]
 * @param {number} [opts.stepIndex] index of the question just answered
 * @param {string} [opts.localDate]
 * @returns {string | null}
 */
export function companionEchoKeyAfterAdvance({
  submit,
  rawAnswer = '',
  stepIndex = 0,
  localDate = formatLocalDateYmd()
} = {}) {
  if (!submit || !shouldShowReflectionEcho(rawAnswer)) return null;
  const trimmed = String(rawAnswer).trim();
  return pickReflectionEchoKey({
    localDate,
    salt: stepIndex + trimmed.length
  });
}

export class TigerReflectionMoment {
  /**
   * @param {HTMLElement} container
   * @param {object} [options]
   * @param {(result: Record<string, string>, hasAnyAnswer: boolean) => void} [options.onDone]
   */
  constructor(container, { onDone } = {}) {
    this.container = container;
    this.onDone = onDone;
    /** @type {ReflectionFlowState | null} */
    this.flow = null;
    this.root = null;
    this.echoEl = null;
    /** Companion echo after a non-empty Continue (distinct from intention echo). */
    this.companionEchoEl = null;
    this.questionEl = null;
    this.inputEl = null;
    this.dotEls = [];
    this.continueBtn = null;
    this.skipBtn = null;
    this.skipAllBtn = null;
    /** @type {string} */
    this._sessionIntention = '';
    /** @type {'icon' | 'typed' | null} */
    this._intentionSource = null;
    /** @type {string | null} */
    this._companionEchoKey = null;

    this._onKeyDown = (event) => {
      if (event.key === 'Escape') this._dismiss();
    };
    this._unsubscribeLocale = onLocaleChange(() => this._refreshTexts());
  }

  isOpen() {
    return Boolean(this.flow);
  }

  /**
   * @param {object} [options]
   * @param {string} [options.intention]
   * @param {'icon' | 'typed' | string} [options.intentionSource]
   */
  open({ intention = '', intentionSource = 'typed' } = {}) {
    if (this.root) return;
    this._sessionIntention = normalizeIntentionText(intention);
    this._intentionSource =
      this._sessionIntention && intentionSource === 'icon' ? 'icon' : 'typed';
    this.flow = new ReflectionFlowState();
    this._buildDom();
    this._renderStep({ instant: true });

    // 强制回流提交初始样式后再改终态，保证过渡生效；
    // 不用 requestAnimationFrame（页面失焦时会被浏览器节流，面板会停在透明态）。
    this.root.getBoundingClientRect();
    this.root.style.opacity = '1';
    this.root.style.transform = 'translate(-50%, 0)';
    this.inputEl.focus({ preventScroll: true });
    document.addEventListener('keydown', this._onKeyDown);
  }

  dispose() {
    this._unsubscribeLocale();
    this._teardownDom();
  }

  _buildDom() {
    this.root = document.createElement('div');
    this.root.id = 'tiger-reflection-moment';
    this.root.style.cssText = [
      'position:absolute',
      'left:50%',
      'bottom:96px',
      'z-index:15',
      'width:min(460px,calc(100vw - 48px))',
      'transform:translate(-50%, 12px)',
      'padding:14px 18px 12px',
      GLASS_BORDER,
      `border-radius:${GLASS_RADIUS}`,
      `background:${GLASS_FILL}`,
      GLASS_BLUR_CSS,
      `box-shadow:${GLASS_SHADOW}`,
      'color:#2c1f14',
      `transition:opacity ${FADE_MS}ms ease,transform ${FADE_MS}ms ease`,
      'opacity:0',
      'pointer-events:auto'
    ].join(';');

    this.echoEl = document.createElement('div');
    this.echoEl.dataset.testid = 'reflection-intention-echo';
    this.echoEl.style.cssText = [
      'font-size:14px',
      'line-height:1.55',
      'font-weight:600',
      'color:#5c4330',
      'margin-bottom:12px',
      'padding:8px 10px',
      'border-radius:10px',
      'background:rgba(212,165,116,.14)',
      'border:1px solid rgba(139,115,85,.18)'
    ].join(';');

    this.companionEchoEl = document.createElement('div');
    this.companionEchoEl.dataset.testid = 'reflection-companion-echo';
    this.companionEchoEl.hidden = true;
    this.companionEchoEl.style.cssText = [
      'font-size:13px',
      'line-height:1.55',
      'font-weight:500',
      'color:#6b5340',
      'margin:0 0 10px',
      'padding:0 2px',
      'opacity:0.92'
    ].join(';');

    this.questionEl = document.createElement('div');
    this.questionEl.style.cssText = [
      'font-size:15px',
      'line-height:1.6',
      'color:#4a3a28',
      'margin-bottom:12px',
      `transition:opacity ${FADE_MS}ms ease`
    ].join(';');

    this.inputEl = document.createElement('input');
    this.inputEl.type = 'text';
    this.inputEl.style.cssText = [
      'width:100%',
      'padding:9px 12px',
      'font-size:14px',
      'color:#2c1f14',
      'background:rgba(255,255,255,.55)',
      GLASS_BORDER_STRONG,
      'border-radius:10px',
      'outline:none',
      'box-sizing:border-box'
    ].join(';');
    this.inputEl.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') this._advance({ submit: true });
    });

    const footer = document.createElement('div');
    footer.style.cssText =
      'display:flex;align-items:center;justify-content:space-between;margin-top:14px;';

    const dots = document.createElement('div');
    dots.style.cssText = 'display:flex;gap:6px;';
    this.dotEls = REFLECTION_QUESTION_KEYS.map(() => {
      const dot = document.createElement('span');
      dot.style.cssText =
        'width:5px;height:5px;border-radius:50%;background:rgba(139,115,85,.25);transition:background 200ms ease;';
      dots.appendChild(dot);
      return dot;
    });

    const buttons = document.createElement('div');
    buttons.style.cssText = 'display:flex;gap:8px;';
    const buttonCss = [
      'padding:7px 16px',
      'font-size:13px',
      'color:#4a3a28',
      `background:${GLASS_FILL_STRONG}`,
      GLASS_BORDER_STRONG,
      'border-radius:16px',
      'cursor:pointer',
      'box-shadow:0 1px 0 rgba(255,255,255,.7) inset'
    ].join(';');

    this.skipBtn = document.createElement('button');
    this.skipBtn.type = 'button';
    this.skipBtn.style.cssText = buttonCss;
    this.skipBtn.addEventListener('click', () => this._advance({ submit: false }));

    this.skipAllBtn = document.createElement('button');
    this.skipAllBtn.type = 'button';
    this.skipAllBtn.style.cssText = buttonCss;
    this.skipAllBtn.addEventListener('click', () => this._skipAll());

    this.continueBtn = document.createElement('button');
    this.continueBtn.type = 'button';
    this.continueBtn.style.cssText = buttonCss;
    this.continueBtn.addEventListener('click', () => this._advance({ submit: true }));

    buttons.appendChild(this.skipBtn);
    buttons.appendChild(this.skipAllBtn);
    buttons.appendChild(this.continueBtn);
    footer.appendChild(dots);
    footer.appendChild(buttons);

    if (this._sessionIntention) {
      this.root.appendChild(this.echoEl);
    }
    this.root.appendChild(this.questionEl);
    this.root.appendChild(this.inputEl);
    this.root.appendChild(this.companionEchoEl);
    this.root.appendChild(footer);
    this.container.appendChild(this.root);
    this._refreshTexts();
  }

  _refreshTexts() {
    if (!this.root || !this.flow || this.flow.isDone()) return;
    if (this.echoEl && this._sessionIntention) {
      this.echoEl.textContent = formatIntentionEcho(
        t(intentionEchoKey(this._intentionSource)),
        this._sessionIntention
      );
      this.echoEl.hidden = false;
    } else if (this.echoEl) {
      this.echoEl.hidden = true;
      this.echoEl.textContent = '';
    }
    if (this.companionEchoEl) {
      if (this._companionEchoKey) {
        this.companionEchoEl.textContent = t(this._companionEchoKey);
        this.companionEchoEl.hidden = false;
      } else {
        this.companionEchoEl.textContent = '';
        this.companionEchoEl.hidden = true;
      }
    }
    this.questionEl.textContent = t(REFLECTION_QUESTION_KEYS[this.flow.stepIndex]);
    this.skipBtn.textContent = t('REFLECTION_SKIP');
    this.skipAllBtn.textContent = t('REFLECTION_SKIP_ALL');
    this.continueBtn.textContent = t('REFLECTION_CONTINUE');
  }

  _renderStep({ instant = false } = {}) {
    if (!this.flow || this.flow.isDone()) return;

    const applyStep = () => {
      this._refreshTexts();
      this.inputEl.value = '';
      this.dotEls.forEach((dot, i) => {
        dot.style.background =
          i === this.flow.stepIndex
            ? 'rgba(139,115,85,.6)'
            : 'rgba(139,115,85,.25)';
      });
      this.questionEl.style.opacity = '1';
      this.inputEl.focus({ preventScroll: true });
    };

    if (instant) {
      applyStep();
      return;
    }
    this.questionEl.style.opacity = '0';
    window.setTimeout(applyStep, FADE_MS * 0.6);
  }

  _advance({ submit }) {
    if (!this.flow || this.flow.isDone()) return;
    const stepIndex = this.flow.stepIndex;
    const raw = this.inputEl?.value ?? '';
    let justEchoed = false;
    if (submit) {
      this.flow.submit(raw);
      const key = companionEchoKeyAfterAdvance({
        submit: true,
        rawAnswer: raw,
        stepIndex
      });
      if (key) {
        this._companionEchoKey = key;
        justEchoed = true;
      }
    } else {
      this.flow.skip();
      // Skip does not emit a new companion echo (prior Continue echo may remain).
    }

    if (this.flow.isDone()) {
      if (justEchoed && this.companionEchoEl && this._companionEchoKey) {
        this.companionEchoEl.textContent = t(this._companionEchoKey);
        this.companionEchoEl.hidden = false;
        window.setTimeout(() => this._finish(), 900);
        return;
      }
      this._finish();
    } else {
      this._renderStep();
    }
  }

  /** 一次跳过全部剩余问题；已填答案保留，未填不落库。 */
  _skipAll() {
    if (!this.flow || this.flow.isDone()) return;
    this.flow.abandonRest();
    this._finish();
  }

  /** Esc 或外部关闭：剩余问题视作跳过，已答内容保留，无任何提示。 */
  _dismiss() {
    if (!this.flow) return;
    this.flow.abandonRest();
    this._finish();
  }

  _finish() {
    const flow = this.flow;
    this.flow = null;
    this._sessionIntention = '';
    this._intentionSource = null;
    this._companionEchoKey = null;
    document.removeEventListener('keydown', this._onKeyDown);

    if (this.root) {
      this.root.style.opacity = '0';
      this.root.style.transform = 'translate(-50%, 12px)';
      window.setTimeout(() => this._teardownDom(), FADE_MS + 40);
    }
    if (flow) {
      this.onDone?.(flow.getResult(), flow.hasAnyAnswer());
    }
  }

  _teardownDom() {
    document.removeEventListener('keydown', this._onKeyDown);
    this.root?.remove();
    this.root = null;
    this.echoEl = null;
    this.companionEchoEl = null;
    this.questionEl = null;
    this.inputEl = null;
    this.dotEls = [];
    this.continueBtn = null;
    this.skipBtn = null;
    this.skipAllBtn = null;
  }
}
