/**
 * 分散式即时提示已读记忆：focus-tiger.hints-seen.v1
 * @see ONBOARDING_HINTS.md
 */

export const HINTS_SEEN_STORAGE_KEY = 'focus-tiger.hints-seen.v1';

/** @typedef {string} HintId */

export const HINT_IDS = Object.freeze([
  'dormant-open',
  'honesty-optional',
  'sit-button',
  'how-shall-we-sit',
  'notice',
  'breathing',
  'choose',
  'companion-mode',
  'companion-stay',
  'companion-away',
  'companion-across-tools',
  'ambient-gated',
  'ambient-soundscape',
  'rise-button',
  'reflection',
  'idle-after-session',
  'help-affordance',
  'help-remedy',
  'help-fallback'
]);

/** @type {Record<string, string>} hintId → i18n key */
export const HINT_LOCALE_KEYS = Object.freeze({
  'dormant-open': 'HINT_DORMANT_OPEN',
  'honesty-optional': 'HINT_HONESTY_OPTIONAL',
  'sit-button': 'HINT_SIT_BUTTON',
  'how-shall-we-sit': 'HINT_HOW_SHALL_WE_SIT',
  'notice': 'HINT_NOTICE',
  'breathing': 'HINT_BREATHING',
  'choose': 'HINT_CHOOSE',
  'companion-mode': 'HINT_COMPANION_MODE',
  'companion-stay': 'HINT_COMPANION_STAY',
  'companion-away': 'HINT_COMPANION_AWAY',
  'companion-across-tools': 'HINT_COMPANION_ACROSS',
  'ambient-gated': 'HINT_AMBIENT_GATED',
  'ambient-soundscape': 'HINT_AMBIENT_SOUNDSCAPE',
  'rise-button': 'HINT_RISE_BUTTON',
  'reflection': 'HINT_REFLECTION',
  'idle-after-session': 'HINT_IDLE_AFTER_SESSION',
  'help-affordance': 'HINT_HELP_AFFORDANCE',
  'help-remedy': 'HINT_HELP_REMEDY',
  'help-fallback': 'HINT_HELP_FALLBACK'
});

/**
 * @param {unknown} raw
 * @returns {Record<string, true>}
 */
export function normalizeHintsSeen(raw) {
  if (!raw || typeof raw !== 'object') return {};
  /** @type {Record<string, true>} */
  const out = {};
  for (const id of HINT_IDS) {
    if (raw[id] === true) out[id] = true;
  }
  return out;
}

/**
 * @param {() => unknown} [read]
 * @param {(value: Record<string, true>) => void} [write]
 */
export function createHintsSeenStore(
  read = () => {
    try {
      return JSON.parse(localStorage.getItem(HINTS_SEEN_STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  },
  write = (value) => {
    try {
      localStorage.setItem(HINTS_SEEN_STORAGE_KEY, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  }
) {
  let cache = normalizeHintsSeen(read());

  return {
    isSeen(hintId) {
      return cache[hintId] === true;
    },
    markSeen(hintId) {
      if (!HINT_IDS.includes(hintId)) return false;
      if (cache[hintId]) return false;
      cache = { ...cache, [hintId]: true };
      write(cache);
      return true;
    },
    clear() {
      cache = {};
      write(cache);
    },
    getAll() {
      return { ...cache };
    }
  };
}

/**
 * 补救入口：当前 UI 场景 → 应展示的 hintId。
 * @param {object} scene
 * @param {boolean} [scene.honestyVisible]
 * @param {boolean} [scene.arrivalOpen]
 * @param {string | null} [scene.arrivalPhase] welcome|notice|breath|choose
 * @param {boolean} [scene.companionExpanded]
 * @param {boolean} [scene.isFocusing]
 * @param {boolean} [scene.reflectionOpen]
 * @param {boolean} [scene.ambientPanelOpen]
 * @param {boolean} [scene.isDormant]
 * @param {boolean} [scene.arrivalReady]
 * @param {boolean} [scene.hasEverCompletedSession]
 */
export function resolveHintForScene(scene = {}) {
  if (scene.reflectionOpen) return 'reflection';
  if (scene.isFocusing) return 'rise-button';
  if (scene.ambientPanelOpen) return 'ambient-soundscape';
  if (scene.arrivalOpen) {
    const phase = scene.arrivalPhase;
    if (phase === 'notice') return 'notice';
    if (phase === 'breath') return 'breathing';
    if (phase === 'choose') return 'choose';
    return 'notice';
  }
  if (scene.companionExpanded) return 'companion-mode';
  if (scene.honestyVisible) return 'honesty-optional';
  if (scene.isDormant) return 'dormant-open';
  if (scene.hasEverCompletedSession) return 'idle-after-session';
  if (scene.arrivalReady) return 'companion-mode';
  return 'sit-button';
}

/**
 * 当前场景应自动展示的 hintId 列表（不含已读过滤；补救「?」见 resolveHintForScene）。
 * Reflection / FOCUSING / Arrival 进行中不抢戏 help-affordance。
 * @param {Parameters<typeof resolveHintForScene>[0]} scene
 * @returns {string[]}
 */
export function resolveAutoHintIds(scene = {}) {
  /** @type {string[]} */
  let ids = [];
  if (scene.reflectionOpen) {
    ids = ['reflection'];
  } else if (scene.isFocusing) {
    ids = ['rise-button', 'ambient-soundscape'];
  } else if (scene.ambientPanelOpen) {
    ids = ['ambient-soundscape'];
  } else if (scene.arrivalOpen) {
    const phase = scene.arrivalPhase;
    if (phase === 'breath') ids = ['breathing'];
    else if (phase === 'choose') ids = ['choose'];
    else ids = ['notice'];
  } else if (scene.companionExpanded) {
    ids = ['companion-mode'];
  } else if (scene.honestyVisible) {
    ids = ['honesty-optional'];
  } else if (scene.isDormant) {
    ids = ['dormant-open'];
  } else if (scene.hasEverCompletedSession) {
    ids = ['idle-after-session'];
  } else {
    ids = ['sit-button', 'how-shall-we-sit'];
  }

  const skipHelpAffordance =
    scene.reflectionOpen || scene.isFocusing || scene.arrivalOpen;
  if (!skipHelpAffordance && !ids.includes('help-affordance')) {
    ids.push('help-affordance');
  }
  return ids;
}

/**
 * 点「?」补救：当前场景应展示的全部操作提示（忽略已读；不含 help-affordance / help-remedy）。
 * @param {Parameters<typeof resolveAutoHintIds>[0]} scene
 * @returns {string[]}
 */
export function resolveRemedyHintIds(scene = {}) {
  const ids = resolveAutoHintIds(scene).filter(
    (id) => id !== 'help-affordance' && id !== 'help-remedy'
  );
  if (scene.companionExpanded) {
    for (const id of ['companion-stay', 'companion-away', 'companion-across-tools']) {
      if (!ids.includes(id)) ids.push(id);
    }
  }
  return ids;
}
