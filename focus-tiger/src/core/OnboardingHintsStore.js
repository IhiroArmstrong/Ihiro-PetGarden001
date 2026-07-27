/**
 * 分散式即时提示已读记忆：focus-tiger.hints-seen.v1
 * @see ONBOARDING_HINTS.md
 */

import { HINT_IDS, HINT_LOCALE_KEYS } from './onboardingHintRegistry.js';

export const HINTS_SEEN_STORAGE_KEY = 'focus-tiger.hints-seen.v1';

/** @typedef {import('./onboardingHintRegistry.js').OnboardingHintRegistryEntry['id']} HintId */

export { HINT_IDS, HINT_LOCALE_KEYS };

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
 * Idle 表面补充 tip（热力图 / 一分钟呼吸 / Sound gated / Quick Start）。
 * @param {string[]} ids
 * @param {object} scene
 * @returns {void}
 */
export function appendIdleChromeHintIds(ids, scene = {}) {
  if (!Array.isArray(ids)) return;
  if (scene.honestyIdleEntryVisible && !ids.includes('honesty-optional')) {
    ids.push('honesty-optional');
  }
  if (scene.weeklyHeatmapVisible && !ids.includes('weekly-heatmap')) {
    ids.push('weekly-heatmap');
  }
  if (scene.weeklyHeatmapVisible && !ids.includes('in-app-reminder')) {
    ids.push('in-app-reminder');
  }
  if (scene.microRitualEntryVisible && !ids.includes('micro-ritual')) {
    ids.push('micro-ritual');
  }
  if (scene.quickStartVisible && !ids.includes('quick-start')) {
    ids.push('quick-start');
  }
  if (!ids.includes('ambient-gated') && !ids.includes('ambient-soundscape')) {
    ids.push('ambient-gated');
  }
}

/**
 * Focusing 表面 HUD 三控件 tip。
 * @param {string[]} ids
 * @returns {void}
 */
export function appendFocusHudHintIds(ids) {
  if (!Array.isArray(ids)) return;
  for (const id of ['focus-hud-ring', 'focus-hud-progress', 'focus-hud-streak']) {
    if (!ids.includes(id)) ids.push(id);
  }
}

/**
 * 窄屏 Idle 抽屉内才有准锚的 tip（抽屉关闭时不得指主球 / grabber 乱指）。
 * @see ONBOARDING_HINTS.md
 */
export const DRAWER_PARKED_HINT_IDS = Object.freeze([
  'how-shall-we-sit',
  'weekly-heatmap',
  'micro-ritual',
  'in-app-reminder',
  'ambient-gated'
]);

/** @param {string} id */
export function isDrawerParkedHintId(id) {
  return DRAWER_PARKED_HINT_IDS.includes(id);
}

/**
 * 窄屏 park 且抽屉未开：去掉抽屉锚 tip（自动路径不乱指）。
 * @param {string[]} ids
 * @param {object} scene
 * @returns {string[]}
 */
export function filterHintsForNarrowDrawer(ids, scene = {}) {
  if (!Array.isArray(ids) || ids.length === 0) return [];
  const drawerOpen = scene.narrowSheetOpen || scene.narrowDrawerOpen;
  if (!scene.narrowPark || drawerOpen) return [...ids];
  return ids.filter((id) => !isDrawerParkedHintId(id) && id !== 'narrow-drawer-menu');
}

/**
 * 补救入口：当前 UI 场景 → 应展示的 hintId。
 * @param {object} scene
 * @param {boolean} [scene.honestyVisible]
 * @param {boolean} [scene.honestyBridgeVisible]
 * @param {boolean} [scene.arrivalOpen]
 * @param {string | null} [scene.arrivalPhase] welcome|notice|breath|choose
 * @param {boolean} [scene.companionExpanded]
 * @param {boolean} [scene.isFocusing]
 * @param {boolean} [scene.reflectionOpen]
 * @param {boolean} [scene.ambientPanelOpen]
 * @param {boolean} [scene.isDormant]
 * @param {boolean} [scene.arrivalReady]
 * @param {boolean} [scene.hasEverCompletedSession]
 * @param {boolean} [scene.weeklyHeatmapVisible]
 * @param {boolean} [scene.microRitualEntryVisible]
 * @param {boolean} [scene.honestyIdleEntryVisible]
 * @param {boolean} [scene.quickStartVisible]
 * @param {boolean} [scene.narrowPark]
 * @param {boolean} [scene.narrowSheetOpen]
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
  if (scene.honestyBridgeVisible) return 'honesty-bridge';
  if (scene.honestyVisible) return 'honesty-optional';
  if (scene.isDormant) return 'dormant-open';
  if (scene.hasEverCompletedSession) return 'idle-after-session';
  if (scene.arrivalReady) return 'companion-mode';
  return 'sit-button';
}

/**
 * 点「?」补救：当前场景最相关的 **1** 条（图7 / 图9 情境单条）。
 * Idle → Sit；窄屏抽屉开着仍以 Sit 为主（抽屉内可见）；Companion → Pick one。
 * @param {Parameters<typeof resolveHintForScene>[0]} scene
 * @returns {string}
 */
export function resolvePrimaryRemedyHintId(scene = {}) {
  if (scene.reflectionOpen) return 'reflection';
  if (scene.isFocusing) return 'rise-button';
  if (scene.ambientPanelOpen) return 'ambient-soundscape';
  if (scene.arrivalOpen) {
    const phase = scene.arrivalPhase;
    if (phase === 'breath') return 'breathing';
    if (phase === 'choose') return 'choose';
    return 'notice';
  }
  if (scene.companionExpanded) return 'companion-mode';
  if (scene.honestyBridgeVisible) return 'honesty-bridge';
  if (scene.honestyVisible) return 'honesty-optional';
  // 窄屏抽屉开着：主路径仍是 Sit（在抽屉列表里）；尖角可 remap 到 grabber/行
  if (scene.narrowSheetOpen) return 'sit-button';
  if (scene.isDormant) return 'dormant-open';
  if (scene.hasEverCompletedSession) return 'idle-after-session';
  // Idle（含窄屏 park：Sit tip remap → grabber）
  return 'sit-button';
}

/**
 * 补救目录：全量列表去掉主条（供「还有 N 条」芯片**逐条**展开）。
 * 窄屏 park + 抽屉关闭：折叠为一次性 `narrow-drawer-menu`（禁止 3 more / 2 more 乱指）。
 * @param {Parameters<typeof resolveHintForScene>[0]} scene
 * @returns {string[]}
 */
export function resolveRemedyCatalogHintIds(scene = {}) {
  const primary = resolvePrimaryRemedyHintId(scene);
  const drawerOpen = scene.narrowSheetOpen || scene.narrowDrawerOpen;
  if (scene.narrowPark && !drawerOpen) {
    const peek = resolveRemedyHintIds({ ...scene, narrowPark: false }).filter(
      (id) => id !== primary && id !== 'narrow-drawer-menu'
    );
    return peek.length > 0 ? ['narrow-drawer-menu'] : [];
  }
  return resolveRemedyHintIds(scene).filter(
    (id) => id !== primary && id !== 'narrow-drawer-menu'
  );
}

/**
 * 自动提示互斥优先级（数值越高越优先同时展示）。
 * 窄屏 / 全局自动路径：同一时刻最多 1 条；点「?」补救不受此限。
 * @see RESPONSIVE_LAYOUT.md §4.5 / task-responsive-narrow-onboarding-sit.md
 */
export const AUTO_HINT_PRIORITY = Object.freeze({
  'help-affordance': 100,
  reflection: 95,
  'sit-button': 90,
  'rise-button': 90,
  'dormant-open': 90,
  'idle-after-session': 88,
  notice: 85,
  breathing: 85,
  choose: 85,
  'companion-mode': 85,
  'honesty-bridge': 82,
  'honesty-optional': 80,
  'how-shall-we-sit': 70,
  'quick-start': 68,
  'focus-hud-ring': 66,
  'focus-hud-progress': 65,
  'focus-hud-streak': 64,
  'micro-ritual': 58,
  'in-app-reminder': 57,
  'ambient-soundscape': 60,
  'weekly-heatmap': 56,
  'ambient-gated': 55,
  'companion-stay': 50,
  'companion-away': 50,
  'companion-across-tools': 50,
  'narrow-drawer-menu': 45,
  'help-remedy': 40,
  'help-fallback': 30
});

/**
 * 从候选自动 hint 中选出至多 maxConcurrent 条（按 AUTO_HINT_PRIORITY，同权保留原序）。
 * @param {string[]} candidateIds
 * @param {{ maxConcurrent?: number }} [opts]
 * @returns {string[]}
 */
export function selectExclusiveAutoHintIds(candidateIds, { maxConcurrent = 1 } = {}) {
  const max = Math.max(0, Number(maxConcurrent) || 0);
  if (max === 0 || !Array.isArray(candidateIds) || candidateIds.length === 0) return [];
  const seen = new Set();
  /** @type {{ id: string, i: number, p: number }[]} */
  const ranked = [];
  for (let i = 0; i < candidateIds.length; i++) {
    const id = candidateIds[i];
    if (!id || seen.has(id)) continue;
    seen.add(id);
    ranked.push({ id, i, p: AUTO_HINT_PRIORITY[id] ?? 40 });
  }
  ranked.sort((a, b) => b.p - a.p || a.i - b.i);
  return ranked.slice(0, max).map((row) => row.id);
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
    appendFocusHudHintIds(ids);
  } else if (scene.ambientPanelOpen) {
    ids = ['ambient-soundscape'];
  } else if (scene.arrivalOpen) {
    // Notice/Breath/Choose 自动出 1 条阶段 tip；§8 N18 outsideDismissGuard 已修
    // 「点 tip 被外侧取消误吃 Notice」，故安全恢复自动展示。补救「?」仍经
    // resolveHintForScene / remedy 列表。
    const phase = scene.arrivalPhase;
    if (phase === 'breath') ids = ['breathing'];
    else if (phase === 'choose') ids = ['choose'];
    else ids = ['notice'];
  } else if (scene.honestyBridgeVisible) {
    // 桥接 Yes/No：不自动出 tip（图4：游离 tip 易挡/误关）；? 补救仍可出 honesty-bridge
    ids = [];
  } else if (scene.companionExpanded) {
    ids = ['companion-mode'];
  } else if (scene.honestyVisible) {
    ids = ['honesty-optional'];
  } else if (scene.isDormant) {
    ids = ['dormant-open'];
    appendIdleChromeHintIds(ids, scene);
  } else if (scene.hasEverCompletedSession) {
    ids = ['idle-after-session'];
    appendIdleChromeHintIds(ids, scene);
  } else {
    ids = ['sit-button', 'how-shall-we-sit'];
    appendIdleChromeHintIds(ids, scene);
  }

  const skipHelpAffordance =
    scene.reflectionOpen ||
    scene.isFocusing ||
    scene.arrivalOpen ||
    scene.honestyBridgeVisible;
  if (!skipHelpAffordance && !ids.includes('help-affordance')) {
    ids.push('help-affordance');
  }
  return filterHintsForNarrowDrawer(ids, scene);
}

/**
 * 点「?」补救：当前场景应展示的全部操作提示（忽略已读；不含 help-affordance / help-remedy）。
 * UI 默认只先画 `resolvePrimaryRemedyHintId`；其余经「还有 N 条」展开本列表。
 * @param {Parameters<typeof resolveAutoHintIds>[0]} scene
 * @returns {string[]}
 */
export function resolveRemedyHintIds(scene = {}) {
  const ids = resolveAutoHintIds(scene).filter(
    (id) => id !== 'help-affordance' && id !== 'help-remedy'
  );
  if (scene.arrivalOpen) {
    const phase = scene.arrivalPhase;
    const arrivalId =
      phase === 'breath' ? 'breathing' : phase === 'choose' ? 'choose' : 'notice';
    if (!ids.includes(arrivalId)) ids.push(arrivalId);
  }
  if (scene.honestyBridgeVisible) {
    // 自动不出 tip；? 补救仍须 honesty-bridge + Idle 入口说明
    if (!ids.includes('honesty-bridge')) ids.unshift('honesty-bridge');
    if (scene.hasEverCompletedSession) {
      if (!ids.includes('idle-after-session')) ids.push('idle-after-session');
    } else {
      for (const id of ['sit-button', 'how-shall-we-sit']) {
        if (!ids.includes(id)) ids.push(id);
      }
    }
    appendIdleChromeHintIds(ids, scene);
  }
  if (scene.companionExpanded) {
    for (const id of ['companion-stay', 'companion-away', 'companion-across-tools']) {
      if (!ids.includes(id)) ids.push(id);
    }
  }
  if (scene.quickStartVisible && !ids.includes('quick-start')) {
    ids.push('quick-start');
  }
  // HUD chrome is on-screen in Idle and Focusing — ? must explain it for first visit.
  appendFocusHudHintIds(ids);
  return ids;
}
