/**
 * Ambient top-right note label visibility (pinned vs hover residual).
 * Product (2026-08-06): unread → always-visible small label; click → markSeen;
 * after done → hover shows label, leave hides.
 *
 * @param {{ done?: boolean, hovering?: boolean, panelOpen?: boolean }} state
 * @returns {{ visible: boolean, localeKey: string | null, mode: 'pinned' | 'hover' | 'hidden' }}
 */
export function resolveAmbientNoteLabelState({
  done = true,
  hovering = false,
  panelOpen = false
} = {}) {
  if (panelOpen) {
    return { visible: false, localeKey: null, mode: 'hidden' };
  }
  if (!done) {
    return {
      visible: true,
      localeKey: 'HINT_AMBIENT_SOUNDSCAPE',
      mode: 'pinned'
    };
  }
  if (hovering) {
    return {
      visible: true,
      localeKey: 'AMBIENT_NOTE_HOVER',
      mode: 'hover'
    };
  }
  return { visible: false, localeKey: null, mode: 'hidden' };
}
