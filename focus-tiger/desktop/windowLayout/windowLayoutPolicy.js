/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Electron companion-window / fullscreen-sit layout (no Electron import).
 */

import fs from 'node:fs';
import path from 'node:path';

export const COMPANION_WIDTH = 420;
export const COMPANION_HEIGHT = 720;
export const COMPANION_MARGIN = 24;
export const DEFAULT_REGULAR_BOUNDS = Object.freeze({
  width: 1100,
  height: 760
});

export const DEFAULT_WINDOW_LAYOUT_PREFS = Object.freeze({
  lastLayout: 'regular',
  normalBounds: null
});

/**
 * @param {unknown} raw
 * @returns {{ width: number, height: number, x?: number, y?: number } | null}
 */
export function normalizeBounds(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const width = Number(raw.width);
  const height = Number(raw.height);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 200 || height < 200) {
    return null;
  }
  /** @type {{ width: number, height: number, x?: number, y?: number }} */
  const out = { width: Math.round(width), height: Math.round(height) };
  const x = Number(raw.x);
  const y = Number(raw.y);
  if (Number.isFinite(x) && Number.isFinite(y)) {
    out.x = Math.round(x);
    out.y = Math.round(y);
  }
  return out;
}

/**
 * @param {unknown} raw
 * @returns {{ lastLayout: 'regular' | 'companion', normalBounds: ReturnType<typeof normalizeBounds> }}
 */
export function normalizeWindowLayoutPrefs(raw) {
  const row = raw && typeof raw === 'object' ? raw : {};
  return {
    lastLayout: row.lastLayout === 'companion' ? 'companion' : 'regular',
    normalBounds: normalizeBounds(row.normalBounds)
  };
}

/**
 * @param {unknown} workArea
 * @returns {{ x: number, y: number, width: number, height: number }}
 */
export function companionBoundsForWorkArea(workArea) {
  const area = workArea && typeof workArea === 'object' ? workArea : {};
  const areaW = Math.max(1, Number(area.width) || 1);
  const areaH = Math.max(1, Number(area.height) || 1);
  const areaX = Number.isFinite(Number(area.x)) ? Number(area.x) : 0;
  const areaY = Number.isFinite(Number(area.y)) ? Number(area.y) : 0;
  const width = Math.min(COMPANION_WIDTH, areaW);
  const height = Math.min(COMPANION_HEIGHT, areaH);
  return {
    x: Math.round(areaX + Math.max(0, areaW - width - COMPANION_MARGIN)),
    y: Math.round(areaY + Math.max(0, areaH - height - COMPANION_MARGIN)),
    width: Math.round(width),
    height: Math.round(height)
  };
}

/**
 * @param {unknown} bounds
 * @returns {boolean}
 */
export function isCompanionBounds(bounds) {
  const width = Number(bounds?.width) || 0;
  const height = Number(bounds?.height) || 0;
  return width >= 360 && width <= 480 && height >= 600 && height <= 800;
}

/**
 * @param {{
 *   action: 'companion' | 'fullscreen',
 *   isFullScreen?: boolean,
 *   currentBounds?: unknown,
 *   prefs?: unknown,
 *   workArea?: unknown
 * }} input
 * @returns {{
 *   layout: 'regular' | 'companion' | 'fullscreen',
 *   setFullScreen: boolean | null,
 *   setBounds: ReturnType<typeof normalizeBounds>,
 *   waitForLeaveFullScreen: boolean,
 *   persist: ReturnType<typeof normalizeWindowLayoutPrefs>
 * }}
 */
export function planWindowLayout(input) {
  const action = input?.action === 'fullscreen' ? 'fullscreen' : 'companion';
  const isFullScreen = input?.isFullScreen === true;
  const currentBounds = normalizeBounds(input?.currentBounds);
  const prefs = normalizeWindowLayoutPrefs(input?.prefs);
  const companionNow = isCompanionBounds(currentBounds);

  if (action === 'fullscreen') {
    const nextFull = !isFullScreen;
    return {
      layout: nextFull ? 'fullscreen' : companionNow ? 'companion' : 'regular',
      setFullScreen: nextFull,
      setBounds: null,
      waitForLeaveFullScreen: false,
      persist: {
        lastLayout: companionNow ? 'companion' : prefs.lastLayout === 'companion' ? 'companion' : 'regular',
        normalBounds:
          !isFullScreen && currentBounds && !companionNow
            ? currentBounds
            : prefs.normalBounds
      }
    };
  }

  if (!isFullScreen && companionNow) {
    return {
      layout: 'regular',
      setFullScreen: false,
      setBounds: prefs.normalBounds || { ...DEFAULT_REGULAR_BOUNDS },
      waitForLeaveFullScreen: false,
      persist: {
        lastLayout: 'regular',
        normalBounds: prefs.normalBounds
      }
    };
  }

  return {
    layout: 'companion',
    setFullScreen: false,
    setBounds: companionBoundsForWorkArea(input?.workArea),
    waitForLeaveFullScreen: isFullScreen,
    persist: {
      lastLayout: 'companion',
      normalBounds:
        currentBounds && !companionNow ? currentBounds : prefs.normalBounds
    }
  };
}

/**
 * @param {string} userDataDir
 * @returns {string}
 */
export function windowLayoutPrefsPath(userDataDir) {
  return path.join(userDataDir, 'window-layout.json');
}

/**
 * @param {string} userDataDir
 * @returns {ReturnType<typeof normalizeWindowLayoutPrefs>}
 */
export function loadWindowLayoutPrefs(userDataDir) {
  try {
    return normalizeWindowLayoutPrefs(
      JSON.parse(fs.readFileSync(windowLayoutPrefsPath(userDataDir), 'utf8'))
    );
  } catch {
    return { ...DEFAULT_WINDOW_LAYOUT_PREFS };
  }
}

/**
 * @param {string} userDataDir
 * @param {{ lastLayout?: string, normalBounds?: unknown }} prefs
 * @returns {ReturnType<typeof normalizeWindowLayoutPrefs>}
 */
export function saveWindowLayoutPrefs(userDataDir, prefs) {
  const next = normalizeWindowLayoutPrefs(prefs);
  fs.mkdirSync(userDataDir, { recursive: true });
  fs.writeFileSync(windowLayoutPrefsPath(userDataDir), `${JSON.stringify(next)}\n`);
  return next;
}
