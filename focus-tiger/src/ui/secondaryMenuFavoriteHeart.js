/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import {
  attachGlassHoverTip,
  getGlassHoverTipHandle
} from './ft-glass-hover-tip.js';
import {
  isMenuFavorite,
  toggleMenuFavorite,
  MENU_FAVORITES_MAX,
  readMenuFavoritesState
} from '../core/menuFavoritesStore.js';
import { isSecondaryChromeEntryFavoritable } from '../core/menuFavoritesEligibility.js';

const STYLE_ID = 'ft-menu-favorite-heart-styles-v1';

export function ensureMenuFavoriteHeartStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .ft-secondary-menu-row {
      display: flex;
      align-items: stretch;
      width: 100%;
      gap: 0;
    }
    .ft-secondary-menu-row > .ft-wide-more__item,
    .ft-secondary-menu-row > .ft-narrow-sheet__item {
      flex: 1 1 auto;
      min-width: 0;
    }
    .ft-menu-favorite-btn {
      flex: 0 0 auto;
      align-self: center;
      min-width: 44px;
      min-height: 44px;
      margin: 0;
      padding: 0;
      border: none;
      background: transparent;
      cursor: pointer;
      color: inherit;
      opacity: 0.72;
      font-size: 1.05rem;
      line-height: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .ft-menu-favorite-btn:hover:not(:disabled) {
      opacity: 1;
    }
    .ft-menu-favorite-btn:disabled {
      opacity: 0.35;
      cursor: default;
    }
    .ft-menu-favorite-btn.is-favorited {
      opacity: 0.92;
    }
    .ft-menu-favorite-btn .ft-menu-favorite-glyph {
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);
}

/**
 * @param {HTMLElement} li
 * @param {HTMLButtonElement} rowBtn
 * @param {import('../core/idleChromeOrchestration.js').SecondaryChromeEntry} item
 * @param {{ t: (key: string) => string, storage?: Storage | null, onToggled?: () => void }} ctx
 */
export function attachSecondaryMenuFavoriteHeart(li, rowBtn, item, ctx) {
  void rowBtn;
  ensureMenuFavoriteHeartStyles();
  if (!isSecondaryChromeEntryFavoritable(item) || !item.proxy) return;

  li.classList.add('ft-secondary-menu-row');

  const storage =
    ctx.storage ??
    (typeof localStorage !== 'undefined' ? localStorage : null);

  const heart = document.createElement('button');
  heart.type = 'button';
  heart.className = 'ft-menu-favorite-btn';
  heart.dataset.testid = `menu-favorite-${item.proxy}`;
  heart.dataset.favoriteProxy = item.proxy;

  const glyph = document.createElement('span');
  glyph.className = 'ft-menu-favorite-glyph';
  glyph.setAttribute('aria-hidden', 'true');
  heart.appendChild(glyph);

  const syncVisual = () => {
    const favorited = isMenuFavorite(item.proxy, storage);
    heart.classList.toggle('is-favorited', favorited);
    glyph.textContent = favorited ? '♥' : '♡';
    heart.setAttribute('aria-pressed', favorited ? 'true' : 'false');
    const count = readMenuFavoritesState(storage).itemIds.length;
    const atCap = !favorited && count >= MENU_FAVORITES_MAX;
    heart.disabled = atCap;
    const tipKey = atCap
      ? 'MENU_FAVORITE_FULL_TIP'
      : favorited
        ? 'MENU_FAVORITE_REMOVE_TIP'
        : 'MENU_FAVORITE_ADD_TIP';
    heart.setAttribute(
      'aria-label',
      ctx.t(favorited ? 'MENU_FAVORITE_ARIA_REMOVE' : 'MENU_FAVORITE_ARIA_ADD')
    );
    const tipText = ctx.t(tipKey);
    const tipHandle = getGlassHoverTipHandle(heart);
    if (tipHandle) {
      tipHandle.setText(tipText);
    } else {
      attachGlassHoverTip(heart, {
        placement: 'left',
        tipId: `ft-menu-fav-tip-${item.proxy}`,
        text: tipText
      });
    }
  };

  attachGlassHoverTip(heart, {
    placement: 'left',
    tipId: `ft-menu-fav-tip-${item.proxy}`,
    text: ctx.t('MENU_FAVORITE_ADD_TIP')
  });

  syncVisual();

  heart.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (heart.disabled) return;
    toggleMenuFavorite(item.proxy, storage);
    syncVisual();
    ctx.onToggled?.();
  });

  li.appendChild(heart);
}