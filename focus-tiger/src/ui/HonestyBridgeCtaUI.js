/**
 * Honesty 桥接邀请 UI：轻量底栏 + Yes/No 同级按钮（对齐 Reflection Skip/Continue）。
 * 独立于 HonestyCheckInUI；不自动开计时。
 */

import { t, onLocaleChange } from '../locales/i18n.js';

const PANEL_CSS = [
  'position:absolute',
  'left:50%',
  'bottom:118px',
  'width:min(420px,calc(100vw - 48px))',
  'transform:translate(-50%, 12px)',
  'padding:20px 22px 18px',
  'border:1px solid rgba(255,248,235,.65)',
  'border-radius:20px',
  'background:linear-gradient(165deg,rgba(255,253,247,.98) 0%,rgba(250,244,232,.95) 55%,rgba(244,234,216,.93) 100%)',
  'box-shadow:0 2px 0 rgba(255,255,255,.88) inset,0 -2px 0 rgba(139,115,85,.16) inset,0 2px 0 rgba(180,150,110,.35),0 14px 36px rgba(44,31,20,.18),0 4px 10px rgba(44,31,20,.1)',
  'color:#2c1f14',
  'transition:opacity 260ms ease,transform 260ms ease',
  'opacity:0',
  'pointer-events:auto',
  /* 须高于 session-start-dock(z16)，否则 Honesty / 微仪式入口会盖住 Yes/No */
  'z-index:18'
].join(';');

/** Reflection 同级按钮权重（不做主次强调）。 */
const EQUAL_BTN_CSS = [
  'flex:1',
  'padding:7px 16px',
  'font-size:13px',
  'color:#4a3a28',
  'background:rgba(255,255,255,.6)',
  'border:1px solid rgba(139,115,85,.3)',
  'border-radius:16px',
  'cursor:pointer'
].join(';');

export class HonestyBridgeCtaUI {
  /**
   * @param {HTMLElement} container
   * @param {object} [handlers]
   * @param {() => void} [handlers.onYes]
   * @param {() => void} [handlers.onNo]
   */
  constructor(container, handlers = {}) {
    this.container = container;
    this.handlers = handlers;
    this.root = null;
    this._visible = false;
    this._unsubscribeLocale = onLocaleChange(() => this._refreshTexts());
  }

  show() {
    this._ensureRoot();
    this._visible = true;
    this._render();
    this._fadeIn();
  }

  hide() {
    this._visible = false;
    if (!this.root) return;
    this.root.style.opacity = '0';
    this.root.style.transform = 'translate(-50%, 12px)';
    window.setTimeout(() => {
      if (!this._visible) this._teardown();
    }, 280);
  }

  dispose() {
    this._unsubscribeLocale();
    this._teardown();
  }

  _ensureRoot() {
    if (this.root) return;
    this.root = document.createElement('div');
    this.root.id = 'honesty-bridge-cta';
    this.root.style.cssText = PANEL_CSS;
    this.container.appendChild(this.root);
  }

  _fadeIn() {
    if (!this.root) return;
    this.root.getBoundingClientRect();
    this.root.style.opacity = '1';
    this.root.style.transform = 'translate(-50%, 0)';
  }

  _teardown() {
    this.root?.remove();
    this.root = null;
  }

  _refreshTexts() {
    if (!this.root || !this._visible) return;
    this._render();
  }

  _render() {
    if (!this.root) return;
    this.root.replaceChildren();

    const thanks = document.createElement('div');
    thanks.style.cssText =
      'font-size:13px;line-height:1.45;color:rgba(74,58,40,.78);text-align:center;margin-bottom:8px;';
    thanks.textContent = t('HONESTY_CHECKIN_THANKS');

    const prompt = document.createElement('div');
    prompt.style.cssText =
      'font-size:16px;line-height:1.55;color:#2c1f14;text-align:center;font-weight:600;margin-bottom:14px;';
    prompt.textContent = t('HONESTY_BRIDGE_PROMPT');

    const row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:8px;';

    const yesBtn = document.createElement('button');
    yesBtn.type = 'button';
    yesBtn.style.cssText = EQUAL_BTN_CSS;
    yesBtn.textContent = t('HONESTY_BRIDGE_YES');
    yesBtn.addEventListener('click', () => this.handlers.onYes?.());

    const noBtn = document.createElement('button');
    noBtn.type = 'button';
    noBtn.style.cssText = EQUAL_BTN_CSS;
    noBtn.textContent = t('HONESTY_BRIDGE_NO');
    noBtn.addEventListener('click', () => this.handlers.onNo?.());

    row.append(yesBtn, noBtn);
    this.root.append(thanks, prompt, row);
  }
}
