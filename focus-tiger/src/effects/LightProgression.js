/**
 * 光影物理渐进（2D DOM/CSS）—— Arrival 视差 Dolly + 呼吸光环 + 日常 DOM Rim + Recover。
 * 纯视觉层：不改跳过/存储/触发逻辑；不引入 GSAP / 3D 相机 / Shader。
 * 见 docs/LIGHT_PROGRESSION_DESIGN.md 与 task-briefs/task-light-progression-parallax-rim.md。
 */

export const ARRIVAL_WARM_TRANSITION_MS = 1500;
export const RECOVER_SETTLE_MS = 5000;
export const RECOVER_BRIGHTNESS_DIP = 0.8;

/** 与 DESIGN「金光呼吸律动」一致的周期（秒）。 */
export const GOLD_BREATH_PERIOD_SEC = 4;

/** 呼吸 beat 视差：背景慢、中景 Yin 快（UI 不缩放）。 */
export const DOLLY_BG_SCALE = 1.06;
export const DOLLY_YIN_SCALE = 1.12;
export const DOLLY_IN_MS = 2800;
export const DOLLY_OUT_MS = 1200;

const STYLE_ID = 'light-progression-keyframes';

function ensureKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
@keyframes ft-recover-ripple {
  0% { opacity: 0.55; filter: brightness(0.8) blur(0px); transform: scale(1); }
  35% { opacity: 0.72; filter: brightness(0.78) blur(0.6px); transform: scale(1.012); }
  70% { opacity: 0.45; filter: brightness(0.85) blur(0.2px); transform: scale(0.997); }
  100% { opacity: 0; filter: brightness(1) blur(0); transform: scale(1); }
}
@keyframes ft-breath-halo {
  0%, 100% { opacity: 0.18; transform: translate(-50%, 0) scale(0.94); }
  50% { opacity: 0.48; transform: translate(-50%, 0) scale(1.05); }
}
@keyframes ft-cushion-glow {
  0% { opacity: 0; transform: translate(-50%, 0) scale(0.7); }
  35% { opacity: 0.85; transform: translate(-50%, 0) scale(1.05); }
创建 创建 100% { opacity: 0; transform: translate(-50%, 0) scale(1.15); }
}
`;
  document.head.appendChild(style);
}

/**
 * @param {number} t 0..1
 * @returns {string} CSS background
 */
export function arrivalBackdropForWarmth(t) {
  const cold = { r: 232, g: 230, b: 225 };
  const warm = { r: 242, g: 228, b: 200 };
  const clamp = Math.max(0, Math.min(1, t));
  const r = Math.round(cold.r + (warm.r - cold.r) * clamp);
  const g = Math.round(cold.g + (warm.g - cold.g) * clamp);
  const b = Math.round(cold.b + (warm.b - cold.b) * clamp);
  return `radial-gradient(ellipse at 50% 42%, rgb(${r},${g},${b}) 0%, #e8e6e1 72%)`;
}

/**
 * 视差 Dolly 目标缩放。
 * @param {'bg' | 'yin'} layer
 * @param {boolean} dollyIn
 */
export function dollyScaleForLayer(layer, dollyIn) {
  if (!dollyIn) return 1;
  return layer === 'bg' ? DOLLY_BG_SCALE : DOLLY_YIN_SCALE;
}

/**
 * 日常 DOM Rim 基础不透明度（不含呼吸调制）。
 * focusLevel &lt; 0.08 时视为熄灭，避免 idle 微光干扰。
 * @param {number} focusLevel 0..1
 */
export function rimBaseOpacity(focusLevel) {
  const level = Math.max(0, Math.min(1, Number(focusLevel) || 0));
  if (level < 0.08) return 0;
  return 0.12 + level * 0.58;
}

/**
 * 在基础 opacity 上叠加 4s 呼吸调制（吸气略收敛、呼气略晕开感用振幅表达）。
 * @param {number} baseOpacity
 * @param {number} elapsedSec
 * @param {number} [periodSec]
 */
export function rimOpacityWithBreath(
  baseOpacity,
  elapsedSec,
  periodSec = GOLD_BREATH_PERIOD_SEC
) {
  if (baseOpacity <= 0) return 0;
  const phase = (elapsedSec / periodSec) * Math.PI * 2;
  const breath = 0.5 + 0.5 * Math.sin(phase);
  // 振幅随基础亮度略增：约 ±18% 相对起伏
  const amp = 0.18 * baseOpacity;
  return Math.max(0, Math.min(1, baseOpacity - amp + amp * 2 * breath));
}

export class LightProgression {
  /**
   * @param {object} deps
   * @param {HTMLElement} deps.appEl `#app`
   * @param {() => (HTMLElement | null | undefined)} [deps.getSpriteOverlay]
   */
  constructor({ appEl, getSpriteOverlay = () => null }) {
    this.appEl = appEl;
    this.getSpriteOverlay = getSpriteOverlay;
    this._backdrop = null;
    this._breathHalo = null;
    this._cushion = null;
    this._recoverVeil = null;
    this._rimGlow = null;
    this._recoverTimer = null;
    this._breathActive = false;
    this._warmth = 0;
    this._rimElapsed = 0;
    this._focusLevel = 0;
    ensureKeyframes();
    this._ensureBackdrop();
    this._ensureRimGlow();
  }

  /** Arrival 开始：冷灰氛围。 */
  beginArrival() {
    this.clearArrivalEffects();
    this._setWarmth(0, false);
    this._backdrop.style.opacity = '1';
  }

  /** Notice 点选后：冷→暖过渡（约 1–2s）。 */
  onNoticeSelected() {
    this._setWarmth(1, true);
  }

  /**
   * 呼吸 beat：三层视差推近（背景慢 / Yin 快 / UI 不动）+ 4s 光环脉动。
   * 光环在角色外围，不染皮毛固有色。
   */
  beginBreath() {
    this._breathActive = true;
    this._applyDolly(true);
    this._ensureBreathHalo();
    this._breathHalo.style.display = 'block';
    this._breathHalo.style.animation = `ft-breath-halo ${GOLD_BREATH_PERIOD_SEC}s ease-in-out infinite`;
  }

  endBreath() {
    this._breathActive = false;
    this._applyDolly(false);
    if (this._breathHalo) {
      this._breathHalo.style.animation = 'none';
      this._breathHalo.style.display = 'none';
    }
  }

  /** Choose 确认：坐垫处一次性 fade-in 光晕（播完自行隐藏，不被 clear 打断）。 */
  onChooseConfirmed() {
    this.endBreath();
    this._ensureCushion();
    const el = this._cushion;
    el.style.display = 'block';
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = 'ft-cushion-glow 1.6s ease-out forwards';
    const onEnd = () => {
      el.removeEventListener('animationend', onEnd);
      el.style.display = 'none';
      el.style.animation = 'none';
    };
    el.addEventListener('animationend', onEnd);
  }

  /** Arrival 结束或跳过：清背景/呼吸氛围；坐垫光晕若在播则让其自然结束。 */
  clearArrivalEffects() {
    this.endBreath();
    this._setWarmth(0, false);
    if (this._backdrop) this._backdrop.style.opacity = '0';
  }

  /**
   * Recover / Re-focus：扰动 + 约 20% 亮度下降，5s 后平复。
   * 挂在既有 Re-focus 链路上；文案仍走 REFOCUS_ACKNOWLEDGE 观察式池。
   */
  playRecoverDisturbance() {
    this._ensureRecoverVeil();
    window.clearTimeout(this._recoverTimer);
    const veil = this._recoverVeil;
    veil.style.display = 'block';
    veil.style.animation = 'none';
    void veil.offsetWidth;
    veil.style.animation = `ft-recover-ripple ${RECOVER_SETTLE_MS}ms ease-out forwards`;
    this._recoverTimer = window.setTimeout(() => {
      veil.style.display = 'none';
      veil.style.animation = 'none';
    }, RECOVER_SETTLE_MS + 40);
  }

  /**
   * 日常专注金晕（2D 主线主观感）。主循环每帧调用。
   * @param {number} focusLevel 已含 presenceBoost、已处理 suppress 的 visualLevel
   * @param {number} [deltaSec]
   */
  updateFocusGlow(focusLevel, deltaSec = 1 / 60) {
    this._focusLevel = Math.max(0, Math.min(1, Number(focusLevel) || 0));
    this._rimElapsed += Math.max(0, deltaSec);
    const el = this._ensureRimGlow();
    const base = rimBaseOpacity(this._focusLevel);
    const opacity = rimOpacityWithBreath(base, this._rimElapsed);
    el.style.opacity = String(opacity);
    // 范围随进度略扩，仍是外围叠层
    const spread = 0.92 + this._focusLevel * 0.14;
    el.style.transform = `translate(-50%, 0) scale(${spread})`;
  }

  dispose() {
    window.clearTimeout(this._recoverTimer);
    this.clearArrivalEffects();
    this._backdrop?.remove();
    this._breathHalo?.remove();
    this._cushion?.remove();
    this._recoverVeil?.remove();
    this._rimGlow?.remove();
    this._backdrop = null;
    this._breathHalo = null;
    this._cushion = null;
    this._recoverVeil = null;
    this._rimGlow = null;
  }

  /**
   * @param {boolean} dollyIn
   */
  _applyDolly(dollyIn) {
    const ms = dollyIn ? DOLLY_IN_MS : DOLLY_OUT_MS;
    const ease = 'cubic-bezier(0.33, 0.1, 0.25, 1)';

    const backdrop = this._ensureBackdrop();
    backdrop.style.transition = [
      `opacity ${ARRIVAL_WARM_TRANSITION_MS}ms ease`,
      `background ${ARRIVAL_WARM_TRANSITION_MS}ms ease`,
      `transform ${ms}ms ${ease}`
    ].join(', ');
    backdrop.style.transformOrigin = '50% 42%';
    backdrop.style.transform = `scale(${dollyScaleForLayer('bg', dollyIn)})`;

    const overlay = this.getSpriteOverlay();
    if (overlay) {
      overlay.style.transition = `transform ${ms}ms ${ease}`;
      overlay.style.transformOrigin = '50% 55%';
      overlay.style.transform = `translateZ(0) scale(${dollyScaleForLayer('yin', dollyIn)})`;
    }
  }

  _ensureBackdrop() {
    if (this._backdrop?.isConnected) return this._backdrop;
    const el = document.createElement('div');
    el.id = 'light-progression-backdrop';
    el.style.cssText = [
      'position:absolute',
      'inset:0',
      'z-index:0',
      'pointer-events:none',
      'opacity:0',
      'transform:scale(1)',
      'transform-origin:50% 42%',
      `transition:opacity ${ARRIVAL_WARM_TRANSITION_MS}ms ease, background ${ARRIVAL_WARM_TRANSITION_MS}ms ease, transform ${DOLLY_IN_MS}ms cubic-bezier(0.33, 0.1, 0.25, 1)`,
      `background:${arrivalBackdropForWarmth(0)}`
    ].join(';');
    this.appEl.insertBefore(el, this.appEl.firstChild);
    this._backdrop = el;
    return el;
  }

  _ensureBreathHalo() {
    if (this._breathHalo?.isConnected) return this._breathHalo;
    const root = this._fxRoot();
    const el = document.createElement('div');
    el.id = 'light-progression-breath-halo';
    el.style.cssText = [
      'position:absolute',
      'left:50%',
      'bottom:22%',
      'width:min(52vw,340px)',
      'height:min(28vw,180px)',
      'border-radius:50%',
      'background:radial-gradient(ellipse,rgba(240,192,96,.55) 0%,rgba(224,185,121,.2) 45%,rgba(224,185,121,0) 72%)',
      'pointer-events:none',
      'display:none',
      'transform:translate(-50%,0)',
      'will-change:opacity,transform'
    ].join(';');
    root.appendChild(el);
    this._breathHalo = el;
    return el;
  }

  _ensureCushion() {
    if (this._cushion?.isConnected) return this._cushion;
    const root = this._fxRoot();
    const el = document.createElement('div');
    el.id = 'light-progression-cushion';
    el.style.cssText = [
      'position:absolute',
      'left:50%',
      'bottom:14%',
      'width:min(36vw,240px)',
      'height:min(12vw,72px)',
      'border-radius:50%',
      'background:radial-gradient(ellipse,rgba(255,220,120,.9) 0%,rgba(212,160,48,.4) 40%,rgba(212,160,48,0) 70%)',
      'pointer-events:none',
      'display:none',
      'transform:translate(-50%,0)',
      'will-change:opacity,transform'
    ].join(';');
    root.appendChild(el);
    this._cushion = el;
    return el;
  }

  _ensureRecoverVeil() {
    if (this._recoverVeil?.isConnected) return this._recoverVeil;
    const root = this._fxRoot();
    const el = document.createElement('div');
    el.id = 'light-progression-recover';
    el.style.cssText = [
      'position:absolute',
      'inset:0',
      'pointer-events:none',
      'display:none',
      'background:radial-gradient(ellipse at 50% 48%,rgba(232,230,225,.35) 0%,rgba(200,196,188,.15) 55%,transparent 78%)',
      'will-change:opacity,filter,transform'
    ].join(';');
    root.appendChild(el);
    this._recoverVeil = el;
    return el;
  }

  /** 日常 focusLevel 金晕：角色周围外围叠层（z 在 sprite 之上、UI 之下）。 */
  _ensureRimGlow() {
    if (this._rimGlow?.isConnected) return this._rimGlow;
    const el = document.createElement('div');
    el.id = 'light-progression-rim';
    el.style.cssText = [
      'position:fixed',
      'left:50%',
      'bottom:10%',
      'width:min(70vw,460px)',
      'height:min(58vw,420px)',
      'z-index:2',
      'pointer-events:none',
      'opacity:0',
      'transform:translate(-50%,0) scale(1)',
      'transform-origin:50% 70%',
      'background:radial-gradient(ellipse at 50% 58%,rgba(240,192,96,.42) 0%,rgba(224,185,121,.16) 38%,rgba(224,185,121,0) 68%)',
      'filter:drop-shadow(0 0 28px rgba(240,192,96,.22))',
      'will-change:opacity,transform',
      'transition:opacity 180ms linear'
    ].join(';');
    // 挂在 #app、位于 sprite-overlay(z:3) 之下：环境金晕在角色后方/周围，不盖住皮毛。
    this.appEl.appendChild(el);
    this._rimGlow = el;
    return el;
  }

  _fxRoot() {
    let root = document.getElementById('light-progression-fx');
    if (root?.isConnected) return root;
    root = document.createElement('div');
    root.id = 'light-progression-fx';
    root.style.cssText =
      'position:fixed;inset:0;z-index:4;pointer-events:none;overflow:hidden;';
    document.body.appendChild(root);
    return root;
  }

  /**
   * @param {number} warmth 0..1
   * @param {boolean} animate
   */
  _setWarmth(warmth, animate) {
    this._warmth = warmth;
    const el = this._ensureBackdrop();
    if (!animate) {
      el.style.transition = 'none';
      el.style.background = arrivalBackdropForWarmth(warmth);
      void el.offsetWidth;
      el.style.transition = [
        `opacity ${ARRIVAL_WARM_TRANSITION_MS}ms ease`,
        `background ${ARRIVAL_WARM_TRANSITION_MS}ms ease`,
        `transform ${DOLLY_IN_MS}ms cubic-bezier(0.33, 0.1, 0.25, 1)`
      ].join(', ');
      return;
    }
    el.style.background = arrivalBackdropForWarmth(warmth);
  }
}
