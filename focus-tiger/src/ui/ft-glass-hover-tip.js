/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Self-drawn glass capsule hover tip — same visual / timing family as
 * `ConfideEarChromeUI` / wide listening ear. Replaces slow native `title`.
 */

const STYLE_ID = 'ft-glass-hover-tip-styles-v1';
export const FT_GLASS_HOVER_DELAY_MS = 120;
const TOUCH_FLASH_MS = 1200;

/** @typedef {'right'|'left'|'top'|'bottom'} GlassTipPlacement */

/**
 * @typedef {object} GlassHoverTipHandle
 * @property {(text: string) => void} setText
 * @property {(suppressed: boolean) => void} setSuppressed
 * @property {() => void} destroy
 */

/** @type {WeakMap<HTMLElement, GlassHoverTipHandle>} */
const handles = new WeakMap();

/**
 * @param {HTMLElement} host
 * @returns {GlassHoverTipHandle | undefined}
 */
export function getGlassHoverTipHandle(host) {
  return handles.get(host);
}

/**
 * @param {HTMLElement} host
 * @param {{ text?: string, placement?: GlassTipPlacement, tipId?: string }} [options]
 * @returns {GlassHoverTipHandle}
 */
export function attachGlassHoverTip(host, options = {}) {
  const existing = handles.get(host);
  if (existing) {
    if (options.text != null) existing.setText(options.text);
    return existing;
  }

  _injectStyles();

  const placement = options.placement || 'right';
  const tipId =
    options.tipId ||
    `ft-glass-tip-${Math.random().toString(36).slice(2, 10)}`;

  host.classList.add('ft-glass-tip-host');
  host.dataset.ftGlassTipPlacement = placement;
  if (host.hasAttribute('title')) {
    host.removeAttribute('title');
  }

  const tipEl = document.createElement('span');
  tipEl.id = tipId;
  tipEl.className = 'ft-glass-hover-tip';
  tipEl.setAttribute('role', 'tooltip');
  tipEl.dataset.testid = 'ft-glass-hover-tip';
  host.appendChild(tipEl);
  host.setAttribute('aria-describedby', tipId);

  /** @type {number | null} */
  let touchTimer = null;

  const onTouchFlash = () => {
    if (window.matchMedia('(hover: hover)').matches) return;
    host.classList.add('ft-glass-tip-host--touch-visible');
    if (touchTimer != null) window.clearTimeout(touchTimer);
    touchTimer = window.setTimeout(() => {
      host.classList.remove('ft-glass-tip-host--touch-visible');
      touchTimer = null;
    }, TOUCH_FLASH_MS);
  };

  host.addEventListener('pointerdown', onTouchFlash);

  const handle = {
    setText(text) {
      tipEl.textContent = text || '';
    },
    setSuppressed(suppressed) {
      host.classList.toggle('ft-glass-tip-host--suppressed', Boolean(suppressed));
    },
    destroy() {
      if (touchTimer != null) window.clearTimeout(touchTimer);
      host.removeEventListener('pointerdown', onTouchFlash);
      host.classList.remove(
        'ft-glass-tip-host',
        'ft-glass-tip-host--suppressed',
        'ft-glass-tip-host--touch-visible'
      );
      delete host.dataset.ftGlassTipPlacement;
      if (host.getAttribute('aria-describedby') === tipId) {
        host.removeAttribute('aria-describedby');
      }
      tipEl.remove();
      handles.delete(host);
    }
  };

  if (options.text != null) handle.setText(options.text);
  handles.set(host, handle);
  return handle;
}

/** @returns {void} */
function _injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
      .ft-glass-tip-host {
        position: relative;
      }
      .ft-glass-hover-tip {
        position: absolute;
        z-index: 1;
        max-width: min(220px, calc(100vw - 86px));
        padding: 5px 10px;
        border-radius: 999px;
        border: 1px solid rgba(139, 115, 85, 0.14);
        background: rgba(255, 252, 245, 0.62);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        box-shadow: 0 2px 10px rgba(44, 31, 20, 0.06);
        color: rgba(74, 58, 40, 0.78);
        font-size: 12px;
        font-weight: 500;
        letter-spacing: 0.01em;
        line-height: 1.3;
        white-space: nowrap;
        pointer-events: none;
        opacity: 0;
        transition: opacity 180ms ease, transform 180ms ease;
      }
      .ft-glass-tip-host[data-ft-glass-tip-placement="right"] .ft-glass-hover-tip {
        left: calc(100% + 8px);
        top: 50%;
        transform: translateY(-50%) translateX(-4px);
      }
      .ft-glass-tip-host[data-ft-glass-tip-placement="left"] .ft-glass-hover-tip {
        right: calc(100% + 8px);
        top: 50%;
        transform: translateY(-50%) translateX(4px);
      }
      .ft-glass-tip-host[data-ft-glass-tip-placement="top"] .ft-glass-hover-tip {
        left: 50%;
        bottom: calc(100% + 8px);
        transform: translateX(-50%) translateY(4px);
        white-space: normal;
        text-align: center;
      }
      .ft-glass-tip-host[data-ft-glass-tip-placement="bottom"] .ft-glass-hover-tip {
        left: 50%;
        top: calc(100% + 8px);
        transform: translateX(-50%) translateY(-4px);
        white-space: normal;
        text-align: center;
      }
      .ft-glass-tip-host:hover .ft-glass-hover-tip,
      .ft-glass-tip-host:focus-visible .ft-glass-hover-tip,
      .ft-glass-tip-host.ft-glass-tip-host--touch-visible .ft-glass-hover-tip {
        opacity: 1;
      }
      .ft-glass-tip-host[data-ft-glass-tip-placement="right"]:hover .ft-glass-hover-tip,
      .ft-glass-tip-host[data-ft-glass-tip-placement="right"]:focus-visible .ft-glass-hover-tip,
      .ft-glass-tip-host[data-ft-glass-tip-placement="right"].ft-glass-tip-host--touch-visible .ft-glass-hover-tip {
        transform: translateY(-50%) translateX(0);
        transition-delay: ${FT_GLASS_HOVER_DELAY_MS}ms;
      }
      .ft-glass-tip-host[data-ft-glass-tip-placement="left"]:hover .ft-glass-hover-tip,
      .ft-glass-tip-host[data-ft-glass-tip-placement="left"]:focus-visible .ft-glass-hover-tip,
      .ft-glass-tip-host[data-ft-glass-tip-placement="left"].ft-glass-tip-host--touch-visible .ft-glass-hover-tip {
        transform: translateY(-50%) translateX(0);
        transition-delay: ${FT_GLASS_HOVER_DELAY_MS}ms;
      }
      .ft-glass-tip-host[data-ft-glass-tip-placement="top"]:hover .ft-glass-hover-tip,
      .ft-glass-tip-host[data-ft-glass-tip-placement="top"]:focus-visible .ft-glass-hover-tip,
      .ft-glass-tip-host[data-ft-glass-tip-placement="top"].ft-glass-tip-host--touch-visible .ft-glass-hover-tip {
        transform: translateX(-50%) translateY(0);
        transition-delay: ${FT_GLASS_HOVER_DELAY_MS}ms;
      }
      .ft-glass-tip-host[data-ft-glass-tip-placement="bottom"]:hover .ft-glass-hover-tip,
      .ft-glass-tip-host[data-ft-glass-tip-placement="bottom"]:focus-visible .ft-glass-hover-tip,
      .ft-glass-tip-host[data-ft-glass-tip-placement="bottom"].ft-glass-tip-host--touch-visible .ft-glass-hover-tip {
        transform: translateX(-50%) translateY(0);
        transition-delay: ${FT_GLASS_HOVER_DELAY_MS}ms;
      }
      .ft-glass-tip-host--suppressed .ft-glass-hover-tip {
        display: none !important;
      }
      @media (prefers-reduced-motion: reduce) {
        .ft-glass-hover-tip {
          transition: none;
        }
        .ft-glass-tip-host[data-ft-glass-tip-placement="right"] .ft-glass-hover-tip,
        .ft-glass-tip-host[data-ft-glass-tip-placement="right"]:hover .ft-glass-hover-tip,
        .ft-glass-tip-host[data-ft-glass-tip-placement="right"]:focus-visible .ft-glass-hover-tip {
          transform: translateY(-50%) translateX(0);
        }
        .ft-glass-tip-host[data-ft-glass-tip-placement="left"] .ft-glass-hover-tip,
        .ft-glass-tip-host[data-ft-glass-tip-placement="left"]:hover .ft-glass-hover-tip,
        .ft-glass-tip-host[data-ft-glass-tip-placement="left"]:focus-visible .ft-glass-hover-tip {
          transform: translateY(-50%) translateX(0);
        }
        .ft-glass-tip-host[data-ft-glass-tip-placement="top"] .ft-glass-hover-tip,
        .ft-glass-tip-host[data-ft-glass-tip-placement="top"]:hover .ft-glass-hover-tip,
        .ft-glass-tip-host[data-ft-glass-tip-placement="top"]:focus-visible .ft-glass-hover-tip {
          transform: translateX(-50%) translateY(0);
        }
        .ft-glass-tip-host[data-ft-glass-tip-placement="bottom"] .ft-glass-hover-tip,
        .ft-glass-tip-host[data-ft-glass-tip-placement="bottom"]:hover .ft-glass-hover-tip,
        .ft-glass-tip-host[data-ft-glass-tip-placement="bottom"]:focus-visible .ft-glass-hover-tip {
          transform: translateX(-50%) translateY(0);
        }
      }
    `;
  document.head.appendChild(style);
}
