/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T44 — system notification when a timed sit completes and the window is not visible.
 */

import { t } from '../locales/i18n.js';
import { isDesktopShellRuntime, getDesktopShellBridge } from './desktopShell.js';

/**
 * @param {{
 *   documentHidden?: boolean,
 *   shellHidden?: boolean
 * }} snapshot
 * @returns {boolean}
 */
export function shouldOfferSessionEndSystemNotification(snapshot) {
  if (snapshot.shellHidden === true) return true;
  if (snapshot.documentHidden === true) return true;
  return false;
}

/**
 * @param {typeof globalThis} [globalObj]
 * @returns {Promise<'granted' | 'denied' | 'default' | 'unsupported'>}
 */
export async function ensureNotificationPermission(globalObj = globalThis) {
  const NotificationCtor = globalObj.Notification;
  if (!NotificationCtor) return 'unsupported';
  const perm = NotificationCtor.permission;
  if (perm === 'granted' || perm === 'denied') return perm;
  if (typeof NotificationCtor.requestPermission !== 'function') return 'default';
  try {
    const next = await NotificationCtor.requestPermission();
    return next === 'granted' || next === 'denied' ? next : 'default';
  } catch {
    return 'denied';
  }
}

/**
 * @param {{ title: string, body: string }} payload
 * @param {{
 *   desktopShell?: ReturnType<typeof getDesktopShellBridge>,
 *   NotificationCtor?: typeof Notification,
 *   requestPermission?: () => Promise<'granted' | 'denied' | 'default' | 'unsupported'>
 * }} [deps]
 * @returns {Promise<boolean>}
 */
export async function showSessionEndSystemNotification(payload, deps = {}) {
  const shell = deps.desktopShell ?? getDesktopShellBridge();
  if (shell && typeof shell.showSessionEndNotification === 'function') {
    try {
      await shell.showSessionEndNotification(payload);
      return true;
    } catch {
      return false;
    }
  }
  const NotificationCtor = deps.NotificationCtor ?? globalThis.Notification;
  if (!NotificationCtor) return false;
  const requestPermission =
    deps.requestPermission ??
    (() => ensureNotificationPermission(globalThis));
  const perm = await requestPermission();
  if (perm !== 'granted') return false;
  try {
    // eslint-disable-next-line no-new
    new NotificationCtor(payload.title, { body: payload.body, silent: false });
    return true;
  } catch {
    return false;
  }
}

/**
 * Fire-and-forget wrapper for session complete hook.
 *
 * @param {{
 *   documentHidden?: boolean,
 *   shellHidden?: boolean
 * }} visibility
 */
export function maybeNotifySessionEndSystem(visibility) {
  if (!shouldOfferSessionEndSystemNotification(visibility)) return;
  const title = t('SESSION_END_NOTIFICATION_TITLE');
  const body = t('SESSION_END_NOTIFICATION_BODY');
  void showSessionEndSystemNotification({ title, body });
}

/**
 * @param {() => Promise<{ hidden?: boolean } | null>} getShellVisibility
 * @returns {Promise<{ documentHidden: boolean, shellHidden: boolean }>}
 */
export async function readSessionEndVisibilitySnapshot(getShellVisibility) {
  const documentHidden =
    typeof document !== 'undefined' && document.hidden === true;
  let shellHidden = false;
  if (isDesktopShellRuntime() && typeof getShellVisibility === 'function') {
    try {
      const payload = await getShellVisibility();
      shellHidden = payload?.hidden === true;
    } catch {
      shellHidden = false;
    }
  }
  return { documentHidden, shellHidden };
}
