/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Short, skippable fly-in when one new Idle practice badge is awarded.
 * Motion reference: local prototype only. Product gates live in badgeAwardMoment.js.
 */

import {
  acquireIdleOverlayChromeDim,
  ensureOverlayBackdropStyles,
  releaseIdleOverlayChromeDim
} from './overlayBackdrop.js';

const STYLE_ID = 'badge-award-moment-styles-v1';
const DIM_MS = 300;
const POP_MS = 800;
const SWEEP_MS = 800;
const FLY_MS = 550;
const POP_HOLD_MS = 650;
const SWEEP_HOLD_MS = 1100;
const FLY_SIZE = 168;

export class BadgeAwardMomentUI {
  /**
   * @param {HTMLElement} mountRoot
   */
  constructor(mountRoot) {
    this.mountRoot = mountRoot;
    this._playing = false;
    this._injectStyles();
  }

  isPlaying() {
    return this._playing;
  }

  /**
   * @param {{ src: string, landingEl: HTMLElement, onSettled?: () => void }} opts
   */
  play(opts) {
    if (this._playing || !opts?.src || !opts?.landingEl) {
      opts?.onSettled?.();
      return;
    }
    this._playing = true;
    const doc = this.mountRoot.ownerDocument || document;
    ensureOverlayBackdropStyles(undefined, doc);

    const dim = doc.createElement('div');
    dim.className = 'badge-award-moment__dim';
    dim.dataset.testid = 'badge-award-moment';
    dim.setAttribute('role', 'presentation');

    const fly = doc.createElement('div');
    fly.className = 'badge-award-moment__fly';
    const img = doc.createElement('img');
    img.alt = '';
    img.src = opts.src;
    img.draggable = false;
    const sweep = doc.createElement('div');
    sweep.className = 'badge-award-moment__sweep';
    const mask = `url("${opts.src}")`;
    sweep.style.webkitMaskImage = mask;
    sweep.style.maskImage = mask;
    fly.append(img, sweep);

    this.mountRoot.append(dim, fly);
    acquireIdleOverlayChromeDim(dim);

    let settled = false;
    let cancelled = false;
    /** @type {(() => void) | null} */
    let skipWait = null;
    const finish = () => {
      if (settled) return;
      settled = true;
      releaseIdleOverlayChromeDim(dim);
      dim.remove();
      fly.remove();
      doc.removeEventListener('keydown', onKey, true);
      this._playing = false;
      opts.onSettled?.();
    };
    const cancel = () => {
      cancelled = true;
      skipWait?.();
    };
    const onKey = (event) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      cancel();
    };
    dim.addEventListener('pointerdown', cancel);
    doc.addEventListener('keydown', onKey, true);

    const wait = (ms) =>
      new Promise((resolve) => {
        if (cancelled || ms <= 0) {
          resolve();
          return;
        }
        const timer = setTimeout(() => {
          skipWait = null;
          resolve();
        }, ms);
        skipWait = () => {
          clearTimeout(timer);
          skipWait = null;
          resolve();
        };
      });

    void (async () => {
      try {
        dim.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: DIM_MS,
          fill: 'forwards'
        });
        const pop = fly.animate(
          [
            { transform: 'translate(-50%, -50%) scale(0.15)', opacity: 0 },
            {
              transform: 'translate(-50%, -50%) scale(0.5)',
              opacity: 1,
              offset: 0.25
            },
            { transform: 'translate(-50%, -50%) scale(1.12)', offset: 0.7 },
            { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 }
          ],
          { duration: POP_MS, easing: 'cubic-bezier(.25,.9,.35,1)', fill: 'forwards' }
        );
        await wait(POP_HOLD_MS);
        if (!cancelled) {
          sweep.animate(
            [{ backgroundPosition: '120% 0' }, { backgroundPosition: '-20% 0' }],
            { duration: SWEEP_MS, easing: 'ease-in-out', fill: 'forwards' }
          );
          await wait(SWEEP_HOLD_MS);
        }
        pop.cancel();
        const landing = opts.landingEl.getBoundingClientRect();
        const view = doc.defaultView || window;
        const dx = landing.left + landing.width / 2 - view.innerWidth / 2;
        const dy = landing.top + landing.height / 2 - view.innerHeight * 0.46;
        const scale = Math.max(landing.width, 1) / FLY_SIZE;
        const flyMs = cancelled ? 1 : FLY_MS;
        const back = fly.animate(
          [
            { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
            {
              transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(${scale})`,
              opacity: 1
            }
          ],
          {
            duration: flyMs,
            easing: 'cubic-bezier(.5,0,.2,1)',
            fill: 'forwards'
          }
        );
        dim.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: flyMs,
          fill: 'forwards'
        });
        await back.finished.catch(() => {});
      } finally {
        finish();
      }
    })();
  }

  _injectStyles() {
    const doc = this.mountRoot?.ownerDocument || document;
    if (!doc?.getElementById || doc.getElementById(STYLE_ID)) return;
    const style = doc.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .badge-award-moment__dim {
        position: fixed;
        inset: 0;
        z-index: 19;
        background: rgba(44, 31, 20, 0.28);
        opacity: 0;
        pointer-events: auto;
      }
      .badge-award-moment__fly {
        position: fixed;
        left: 50%;
        top: 46%;
        width: ${FLY_SIZE}px;
        height: ${FLY_SIZE}px;
        z-index: 23;
        pointer-events: none;
        transform: translate(-50%, -50%);
      }
      .badge-award-moment__fly img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
        filter: drop-shadow(0 12px 18px rgba(44, 31, 20, 0.28));
      }
      .badge-award-moment__sweep {
        position: absolute;
        inset: 0;
        -webkit-mask-size: contain;
        mask-size: contain;
        -webkit-mask-repeat: no-repeat;
        mask-repeat: no-repeat;
        -webkit-mask-position: center;
        mask-position: center;
        background: linear-gradient(115deg, transparent 35%, rgba(255,255,255,.85) 48%, rgba(255,226,150,.45) 53%, transparent 65%);
        background-size: 260% 100%;
        background-position: 120% 0;
        mix-blend-mode: soft-light;
      }
    `;
    doc.head.appendChild(style);
  }
}
