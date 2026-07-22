/**
 * FocusHUD 直播层：正式 Focusing 或微仪式等「算专注」墙钟覆盖。
 * 纯函数，供单测锁契约（不启 FocusSession 也可让仪表推进）。
 */

/**
 * @param {{
 *   state: string,
 *   sessionElapsedSeconds: number,
 *   sessionFocusLevel: number,
 *   liveElapsedSeconds?: number | null,
 *   treatAsFocusing?: boolean,
 *   focusLevelOverride?: number | null
 * }} input
 */
export function resolveFocusHudLiveView({
  state,
  sessionElapsedSeconds,
  sessionFocusLevel,
  liveElapsedSeconds = null,
  treatAsFocusing = false,
  focusLevelOverride = null
}) {
  const treat = treatAsFocusing === true;
  const liveOverride =
    Number.isFinite(liveElapsedSeconds) && liveElapsedSeconds != null
      ? Math.max(0, liveElapsedSeconds)
      : null;
  const levelOverride =
    Number.isFinite(focusLevelOverride) && focusLevelOverride != null
      ? Math.min(1, Math.max(0, focusLevelOverride))
      : null;

  const focusing = treat || state === 'FOCUSING';
  const elapsedSeconds =
    liveOverride != null ? liveOverride : Math.max(0, sessionElapsedSeconds || 0);
  const level =
    levelOverride != null
      ? levelOverride
      : Math.min(1, Math.max(0, sessionFocusLevel || 0));
  const displayState = treat ? 'FOCUSING' : state;
  const liveSessionMinutes = focusing ? elapsedSeconds / 60 : 0;

  return {
    focusing,
    displayState,
    elapsedSeconds,
    level,
    liveSessionMinutes
  };
}
