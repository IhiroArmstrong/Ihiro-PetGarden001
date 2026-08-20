/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Desktop shell bridge (Electron preload → window.desktopShell).
 * Web builds have no bridge; helpers must no-op to browser behavior.
 */

/**
 * @param {object} [globalObj]
 * @returns {null | {
 *   isDesktop?: boolean,
 *   openExternal?: (url: string) => Promise<unknown>,
 *   cloudPostJson?: (path: string, body?: string | null) => Promise<unknown>,
 *   getVersion?: () => Promise<string>,
 *   quit?: () => Promise<unknown>,
 *   hide?: () => Promise<unknown>,
 *   show?: () => Promise<unknown>,
 *   getShellVisibility?: () => Promise<{ hidden?: boolean, hideReason?: string }>,
 *   onShellVisibility?: (cb: (payload: { hidden?: boolean, hideReason?: string }) => void) => () => void,
 *   companion?: {
 *     ensureReady?: () => Promise<unknown>,
 *     unload?: () => Promise<unknown>,
 *     getStatus?: () => Promise<unknown>,
 *     setFocusing?: (focusing: boolean) => Promise<unknown>,
 *     onStatus?: (cb: (payload: object) => void) => () => void
 *   }
 * }}
 */
export function getDesktopShellBridge(globalObj = globalThis) {
  try {
    const shell = globalObj && globalObj.desktopShell;
    return shell && typeof shell === 'object' ? shell : null;
  } catch {
    return null;
  }
}

/**
 * @param {object} [globalObj]
 * @returns {boolean}
 */
export function isDesktopShellRuntime(globalObj = globalThis) {
  return Boolean(getDesktopShellBridge(globalObj)?.isDesktop);
}

/**
 * Stripe Checkout / Customer Portal: Electron must not navigate the window.
 *
 * @param {string} url
 * @param {{
 *   desktopShell?: ReturnType<typeof getDesktopShellBridge>,
 *   assign?: (url: string) => void,
 * }} [deps]
 * @returns {Promise<'external' | 'navigate'>}
 */
export async function openCheckoutUrl(url, deps = {}) {
  const href = String(url || '').trim();
  if (!href) throw new Error('missing_checkout_url');
  const shell = deps.desktopShell ?? getDesktopShellBridge();
  if (shell && typeof shell.openExternal === 'function') {
    await shell.openExternal(href);
    return 'external';
  }
  const assign =
    deps.assign ||
    (typeof globalThis !== 'undefined' &&
    globalThis.location &&
    typeof globalThis.location.assign === 'function'
      ? (next) => globalThis.location.assign(next)
      : null);
  if (typeof assign !== 'function') {
    throw new Error('cannot_open_checkout');
  }
  assign(href);
  return 'navigate';
}

/**
 * Step B: tell AttentionSignals whether the shell is hide-to-tray (SB-18).
 *
 * @param {{ setHideReason?: (reason: unknown) => void } | null | undefined} signals
 * @param {{ hideReason?: unknown } | null | undefined} payload
 */
export function applyShellVisibilityToAttention(signals, payload) {
  if (!signals || typeof signals.setHideReason !== 'function') return;
  signals.setHideReason(payload?.hideReason === 'tray' ? 'tray' : 'none');
}

/**
 * @param {{ setHideReason?: (reason: unknown) => void } | null | undefined} signals
 * @param {ReturnType<typeof getDesktopShellBridge>} [shell]
 * @returns {() => void}
 */
export function bindDesktopShellAttention(signals, shell = getDesktopShellBridge()) {
  if (!signals || !shell || typeof shell.onShellVisibility !== 'function') {
    return () => {};
  }
  const unsub = shell.onShellVisibility((payload) => {
    applyShellVisibilityToAttention(signals, payload);
  });
  if (typeof shell.getShellVisibility === 'function') {
    void Promise.resolve(shell.getShellVisibility())
      .then((payload) => applyShellVisibilityToAttention(signals, payload))
      .catch(() => {});
  }
  return typeof unsub === 'function' ? unsub : () => {};
}
