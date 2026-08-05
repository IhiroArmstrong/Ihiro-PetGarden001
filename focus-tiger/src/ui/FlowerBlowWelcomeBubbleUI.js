/**
 * 变花吹散鼓励气泡（Phase 2a Lab）。
 * 气质：随风喃喃 — 白玉毛玻璃 + 头顶悬浮；非 Toast/Modal。
 * 驻留 3.0–3.5s；点气泡或空白处可消；≤3.5s 强制销毁。
 *
 * 样式与共享 Arrival 暖米 glass（glassPanelStyles）分离：吹花场景粉紫高光
 * 需要更高对比可读性（分析师 2026-08-05）。
 */

import {
  FLOWER_BLOW_BUBBLE_FADE_MS,
  FLOWER_BLOW_BUBBLE_HOLD_MS,
  splitFlowerBlowBubbleSentences
} from './flowerBlowWelcomeCopy.js';
import { homeClearanceTopCss } from './homeChromeClearance.js';

const ROOT_ID = 'flower-blow-welcome-bubble';

/** 白玉高透毛玻璃（Lab；勿回写到 Arrival 暖米 panel） */
const JADE_SURFACE = [
  'background:rgba(255,255,255,0.90)',
  'backdrop-filter:blur(16px)',
  '-webkit-backdrop-filter:blur(16px)',
  'border:1px solid rgba(255,255,255,0.72)',
  'border-radius:20px',
  'box-shadow:0 10px 30px rgba(0,0,0,0.08),0 2px 6px rgba(0,0,0,0.04)'
].join(';');

const PRIMARY_CSS =
  'margin:0;padding:0;color:#2C2C2E;font-size:15px;font-weight:560;line-height:1.55;letter-spacing:0.01em';

const SECONDARY_CSS =
  'margin:6px 0 0;padding:0;color:#727277;font-size:12.5px;font-weight:400;line-height:1.45;letter-spacing:0.01em';

/**
 * @param {string | { text?: string, role?: string }} line
 * @returns {{ text: string, role: 'primary' | 'secondary' }}
 */
function normalizeLine(line) {
  if (typeof line === 'string') {
    return { text: line.trim(), role: 'primary' };
  }
  const text = String(line?.text || '').trim();
  const role = line?.role === 'secondary' ? 'secondary' : 'primary';
  return { text, role };
}

export class FlowerBlowWelcomeBubbleUI {
  /**
   * @param {HTMLElement} container typically `#ui-overlay`
   */
  constructor(container) {
    this.container = container;
    /** @type {HTMLElement | null} */
    this.root = null;
    /** @type {ReturnType<typeof setTimeout> | null} */
    this._holdTimer = null;
    /** @type {ReturnType<typeof setTimeout> | null} */
    this._fadeTimer = null;
    /** @type {((ev: MouseEvent) => void) | null} */
    this._outsideHandler = null;
    this._visible = false;
  }

  /**
   * @param {Array<string | { text: string, role?: string }>} lines
   * @param {{ holdMs?: number, onHidden?: () => void }} [opts]
   */
  show(lines, opts = {}) {
    const normalized = (lines || [])
      .map(normalizeLine)
      .filter((l) => l.text);
    if (!normalized.length) return false;

    this.hide({ immediate: true });

    const root = document.createElement('div');
    root.id = ROOT_ID;
    root.setAttribute('role', 'status');
    root.setAttribute('aria-live', 'polite');
    root.dataset.ftFlowerBlowBubble = '1';
    root.style.cssText = [
      'position:absolute',
      'left:50%',
      // 窄屏须让开 ActionBar（time/Calm）；宽屏仅 safe-area
      `top:${homeClearanceTopCss()}`,
      'bottom:auto',
      'z-index:17',
      'max-width:min(340px,calc(100vw - 48px))',
      'width:max-content',
      'padding:14px 22px',
      'text-align:center',
      'opacity:0',
      'transform:translate(-50%,10px)',
      `transition:opacity 400ms ease-out,transform 400ms ease-out`,
      'pointer-events:auto',
      'cursor:pointer',
      JADE_SURFACE
    ].join(';');

    for (let i = 0; i < normalized.length; i += 1) {
      const { text, role } = normalized[i];
      const p = document.createElement('p');
      p.dataset.role = role;
      p.style.cssText = role === 'secondary' ? SECONDARY_CSS : PRIMARY_CSS;
      const sentences = splitFlowerBlowBubbleSentences(text);
      if (sentences.length <= 1) {
        p.textContent = sentences[0] || text;
      } else {
        // 一句一行：比 CSS 硬折更符合 EN「句后再起」习惯，也避免孤儿短行
        for (let s = 0; s < sentences.length; s += 1) {
          const span = document.createElement('span');
          span.style.cssText =
            'display:block' + (s > 0 ? ';margin-top:2px' : '');
          span.textContent = sentences[s];
          p.appendChild(span);
        }
      }
      root.appendChild(p);
    }

    // 细尖角：指向阿寅（视觉「对你说」）
    const tail = document.createElement('span');
    tail.setAttribute('aria-hidden', 'true');
    tail.dataset.ftFlowerBlowTail = '1';
    tail.style.cssText = [
      'position:absolute',
      'left:50%',
      'bottom:-6px',
      'width:12px',
      'height:12px',
      'transform:translateX(-50%) rotate(45deg)',
      'background:rgba(255,255,255,0.90)',
      'border-right:1px solid rgba(255,255,255,0.72)',
      'border-bottom:1px solid rgba(255,255,255,0.72)',
      'box-shadow:2px 2px 5px rgba(0,0,0,0.05)',
      'pointer-events:none'
    ].join(';');
    root.appendChild(tail);

    root.addEventListener('click', (ev) => {
      ev.stopPropagation();
      this.hide();
    });

    this.container.appendChild(root);
    this.root = root;
    this._visible = true;
    this._onHidden = typeof opts.onHidden === 'function' ? opts.onHidden : null;

    // force reflow → 自下轻微上飘入位（随花瓣上浮叙事）
    root.getBoundingClientRect();
    root.style.opacity = '1';
    root.style.transform = 'translate(-50%,0)';

    const holdMs =
      Number.isFinite(opts.holdMs) && opts.holdMs > 0
        ? opts.holdMs
        : FLOWER_BLOW_BUBBLE_HOLD_MS;
    this._holdTimer = window.setTimeout(() => this.hide(), holdMs);

    this._outsideHandler = (ev) => {
      const t = ev.target;
      if (!(t instanceof Node)) return;
      if (this.root?.contains(t)) return;
      if (t instanceof Element) {
        if (t.closest('#emotion-debug-ui')) return;
        if (t.closest('button, a, input, select, textarea, [role="button"]')) {
          return;
        }
      }
      this.hide();
    };
    window.setTimeout(() => {
      document.addEventListener('pointerdown', this._outsideHandler, true);
    }, 0);

    return true;
  }

  /**
   * @param {{ immediate?: boolean }} [opts]
   */
  hide(opts = {}) {
    window.clearTimeout(this._holdTimer);
    window.clearTimeout(this._fadeTimer);
    this._holdTimer = null;
    this._fadeTimer = null;
    if (this._outsideHandler) {
      document.removeEventListener('pointerdown', this._outsideHandler, true);
      this._outsideHandler = null;
    }

    const root = this.root;
    const finish = () => {
      if (root?.parentNode) root.parentNode.removeChild(root);
      if (this.root === root) this.root = null;
      const was = this._visible;
      this._visible = false;
      const cb = this._onHidden;
      this._onHidden = null;
      if (was && cb) cb();
    };

    if (!root) {
      this._visible = false;
      return;
    }

    if (opts.immediate) {
      finish();
      return;
    }

    root.style.opacity = '0';
    root.style.transform = 'translate(-50%,-8px)';
    this._fadeTimer = window.setTimeout(finish, FLOWER_BLOW_BUBBLE_FADE_MS);
  }

  isVisible() {
    return this._visible;
  }
}
