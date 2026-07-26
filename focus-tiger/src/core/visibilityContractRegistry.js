/**
 * 跨视口可见性契约 — 机器可读真源（SSOT）。
 *
 * 派生：`SHARED_RESOURCES.md` §6 机器块（`npm run visibility:doc-sync`）。
 * 行为断言：各 `testAnchorWide` / `testAnchorNarrow` 指向的 Playwright 用例。
 * 改 `setSuppressed` / park / hide 类开关时：CI 须跑 `npm run test:e2e:visibility`
 *（整表锚点，非仅本任务新增用例）。
 *
 * @see docs/DOC_CODE_CONTRACT.md
 * @see docs/SHARED_RESOURCES.md §6
 * @see docs/DEV_WORKFLOW_QUALITY.md §8.5 / N25
 */

/**
 * @typedef {'visible' | 'hidden' | 'disabled' | 'in-viewport'} VisibilityMust
 */

/**
 * @typedef {'wide' | 'narrow' | 'both'} VisibilityViewport
 */

/**
 * Lock status for structural gap tracking:
 * - `locked` — required viewports have e2e anchors
 * - `gap-narrow` — wide locked (or N/A), narrow user-visible host not locked
 * - `gap-wide` — narrow locked, wide not locked
 * - `gap-both` — neither viewport locked
 * - `manual` — intentionally human-only (rare; must justify in notes)
 *
 * @typedef {'locked' | 'gap-narrow' | 'gap-wide' | 'gap-both' | 'manual'} VisibilityLockStatus
 */

/**
 * @typedef {object} VisibilityContract
 * @property {string} id 稳定契约 id
 * @property {string} state 产品状态（arrival-open / micro-ritual-open / …）
 * @property {VisibilityViewport} viewport
 * @property {string} role 人读角色（Sit / QuickStart / …）
 * @property {VisibilityMust} must
 * @property {string} [wideSelector] ≥480 用户可见 DOM（dock / HUD 等）
 * @property {string} [narrowSelector] ≤479 用户可见 DOM（home ball / ActionBar 等）
 * @property {string} [testAnchorWide] Playwright 文件或「文件 › 用例」摘要
 * @property {string} [testAnchorNarrow]
 * @property {VisibilityLockStatus} lockStatus
 * @property {string} source TEST_TRACKER / W3 / SHARED §6 / 用户书面
 * @property {string} notes
 */

/**
 * Suppress / hide 相关源文件：改动时 CI 必须跑整表 e2e 锚点。
 * @type {ReadonlyArray<string>}
 */
export const VISIBILITY_SUPPRESS_TRIGGER_PATHS = Object.freeze([
  'focus-tiger/src/ui/NarrowIdleShell.js',
  'focus-tiger/src/ui/CompanionModePicker.js',
  'focus-tiger/src/ui/HonestyCheckInUI.js',
  'focus-tiger/src/ui/MicroRitualUI.js',
  'focus-tiger/src/ui/OnboardingHintsUI.js',
  'focus-tiger/src/main.js',
  'focus-tiger/src/core/visibilityContractRegistry.js',
  'focus-tiger/e2e/scenario-a.companion.spec.js',
  'focus-tiger/e2e/weekly-practice-heatmap.spec.js',
  'focus-tiger/e2e/micro-ritual.spec.js',
  'focus-tiger/e2e/helpers/product-shell.js'
]);

/** @type {ReadonlyArray<VisibilityContract>} */
export const VISIBILITY_CONTRACTS = Object.freeze([
  {
    id: 'arrival-sit-hidden',
    state: 'arrival-open',
    viewport: 'both',
    role: 'Sit',
    must: 'hidden',
    wideSelector: '#btn-focus',
    narrowSelector: '#ft-narrow-home-sit',
    testAnchorWide:
      'e2e/scenario-a.companion.spec.js › Arrival open: Sit hidden…; Quick Start stays',
    testAnchorNarrow:
      'e2e/scenario-a.companion.spec.js › 375 Arrival: home Sit hidden; home Quick Start stays visible',
    lockStatus: 'locked',
    source: 'L174 / W3 / SHARED §6 Sit 显隐',
    notes: 'Arrival Notice/Breath/Choose 全程 Sit 不得盖 Notice 图标格'
  },
  {
    id: 'arrival-quickstart-visible',
    state: 'arrival-open',
    viewport: 'both',
    role: 'QuickStart',
    must: 'visible',
    wideSelector: '#quick-start-focus',
    narrowSelector: '#ft-narrow-home-quickstart',
    testAnchorWide:
      'e2e/scenario-a.companion.spec.js › Arrival open: Sit hidden…; Quick Start stays',
    testAnchorNarrow:
      'e2e/scenario-a.companion.spec.js › 375 Arrival: home Sit hidden; home Quick Start stays visible',
    lockStatus: 'locked',
    source: 'L174 / W3 / SHARED §6 Quick Start 显隐',
    notes:
      '窄屏用户可见宿主是 home ball；禁止只断言已 park 的 #quick-start-focus。Arrival 用 setSuppressed(..., { keepQuickStart })'
  },
  {
    id: 'arrival-honesty-home-hidden',
    state: 'arrival-open',
    viewport: 'narrow',
    role: 'Honesty',
    must: 'hidden',
    narrowSelector: '#ft-narrow-home-honesty',
    testAnchorNarrow:
      'e2e/scenario-a.companion.spec.js › 375 Arrival: home Sit hidden; home Quick Start stays visible',
    lockStatus: 'locked',
    source: 'W3 窄屏 keepQuickStart（仅 ⚡）',
    notes: '宽屏 dock Honesty 入口在 Arrival 期历史仍可显示；本条仅锁窄屏主球'
  },
  {
    id: 'arrival-breath-sit-still-hidden',
    state: 'arrival-breath',
    viewport: 'both',
    role: 'Sit',
    must: 'hidden',
    wideSelector: '#btn-focus',
    narrowSelector: '#ft-narrow-home-sit',
    lockStatus: 'gap-both',
    source: 'W3 / DEV §8.2「Breath 仍见 Sit」教训',
    notes:
      '现有 e2e 只在 Notice 瞬间断言 Sit hidden，未钉 Breath/Inhale 阶段。须补宽+窄锚点'
  },
  {
    id: 'micro-ritual-sit-unavailable',
    state: 'micro-ritual-open',
    viewport: 'both',
    role: 'Sit',
    must: 'disabled',
    wideSelector: '#btn-focus',
    narrowSelector: '#ft-narrow-home-sit',
    testAnchorWide:
      'e2e/micro-ritual.spec.js › micro ritual: entry → breath → complete…',
    lockStatus: 'gap-narrow',
    source: 'TEST_TRACKER 一分钟呼吸 / 场景 O ⑤',
    notes:
      '宽屏锁 #btn-focus:disabled。窄屏 Focusing 壳会藏整排 home CTAs，但无 375 e2e 断言 #ft-narrow-home-sit 不可点/不可见'
  },
  {
    id: 'honesty-bridge-entries-hidden',
    state: 'honesty-bridge-visible',
    viewport: 'both',
    role: 'Honesty+MicroRitualEntry',
    must: 'hidden',
    wideSelector: '#honesty-idle-entry, #micro-ritual-idle-entry',
    narrowSelector: '#ft-narrow-home-honesty',
    testAnchorWide: 'e2e/micro-ritual.spec.js › bridge CTA hides dock entries over Yes/No; No restores entries',
    lockStatus: 'gap-narrow',
    source: 'L183 Honesty 桥接叠层',
    notes:
      '宽屏锁 dock 两入口 hidden。窄屏 Honesty 已上主球；桥接可见时须锁 #ft-narrow-home-honesty（及抽屉呼吸若可见）'
  },
  {
    id: 'honesty-panel-entry-hidden',
    state: 'honesty-check-in-open',
    viewport: 'both',
    role: 'HonestyEntry',
    must: 'hidden',
    wideSelector: '#honesty-idle-entry',
    narrowSelector: '#ft-narrow-home-honesty',
    testAnchorWide:
      'e2e/micro-ritual.spec.js › Honesty Check-in click hides entry until duration panel open',
    lockStatus: 'gap-narrow',
    source: 'Honesty Check-in 流程：一点即藏入口',
    notes: '窄屏主球须与 dock 入口同语义'
  },
  {
    id: 'focusing-narrow-home-ctas-hidden',
    state: 'focusing',
    viewport: 'narrow',
    role: 'HomeCtas+Grabber',
    must: 'hidden',
    narrowSelector: '#ft-narrow-home-ctas, .ft-narrow-grabber',
    testAnchorNarrow:
      'e2e/weekly-practice-heatmap.spec.js › 375 Focusing restores FocusHUD and hides Sound FAB',
    lockStatus: 'locked',
    source: '场景 O / RESPONSIVE_LAYOUT Focusing',
    notes: 'Focusing 期见 #focus-hud；home 三球与 grabber 须藏（CSS ft-narrow-focusing）'
  },
  {
    id: 'focusing-focus-hud-visible',
    state: 'focusing',
    viewport: 'both',
    role: 'FocusHUD',
    must: 'visible',
    wideSelector: '#focus-hud',
    narrowSelector: '#focus-hud',
    testAnchorWide: 'e2e/helpers/product-shell.js › expectFocusSessionActive (Rise 文案)',
    testAnchorNarrow:
      'e2e/weekly-practice-heatmap.spec.js › 375 Focusing restores FocusHUD…',
    lockStatus: 'gap-wide',
    source: 'SHARED §6 FocusHUD vs ActionBar / S2',
    notes:
      '窄屏已锁 HUD 可见。宽屏多数用例只断言 #btn-focus 文案 Rise，未显式 toBeVisible(#focus-hud)'
  },
  {
    id: 'choose-bow-companion-in-viewport',
    state: 'after-choose-bow',
    viewport: 'both',
    role: 'CompanionPanel',
    must: 'in-viewport',
    wideSelector: '.session-start-dock__panel',
    narrowSelector: '.session-start-dock__panel',
    testAnchorWide:
      'e2e/scenario-a.companion.spec.js › scenario A4… (toBeVisible only)',
    testAnchorNarrow:
      'e2e/scenario-a.companion.spec.js › 375 Choose bow: Companion staged in viewport…',
    lockStatus: 'gap-wide',
    source: 'SHARED §6 Companion 鞠躬后 stage / ca20d07',
    notes:
      '窄屏已锁 toBeInViewport + ft-narrow-stage-companion。宽屏 A4 仅属性可见（宽屏通常不 park，风险较低，但仍非视口锚）'
  },
  {
    id: 'idle-narrow-three-home-balls',
    state: 'idle',
    viewport: 'narrow',
    role: 'HomeCtas',
    must: 'visible',
    narrowSelector:
      '#ft-narrow-home-quickstart, #ft-narrow-home-sit, #ft-narrow-home-honesty',
    testAnchorNarrow:
      'e2e/weekly-practice-heatmap.spec.js › 375 viewport: narrow ActionBar + home CTAs…',
    lockStatus: 'locked',
    source: 'L284 窄屏主屏三主钮',
    notes: '顺序 Quick · Sit · Honesty；Honesty 不得 false-disabled'
  },
  {
    id: 'heatmap-hidden-when-focusing',
    state: 'focusing',
    viewport: 'both',
    role: 'WeeklyHeatmap',
    must: 'hidden',
    wideSelector: '#weekly-practice-heatmap',
    narrowSelector: '#weekly-practice-heatmap',
    testAnchorWide:
      'e2e/weekly-practice-heatmap.spec.js › non-Idle (Focusing) hides weekly heatmap',
    lockStatus: 'gap-narrow',
    source: '本周陪伴热力图',
    notes: '现用例默认视口（通常 ≥480）。375 Focusing 路径未断言热力图 hidden'
  }
]);

/**
 * Playwright spec files that lock at least one visibility contract.
 * Used by `npm run test:e2e:visibility`.
 * @returns {string[]}
 */
export function listVisibilityE2eSpecFiles() {
  const files = new Set();
  for (const c of VISIBILITY_CONTRACTS) {
    for (const anchor of [c.testAnchorWide, c.testAnchorNarrow]) {
      if (!anchor) continue;
      const file = anchor.split(' › ')[0]?.trim();
      if (file?.startsWith('e2e/') && file.endsWith('.spec.js')) {
        files.add(file);
      }
    }
  }
  return [...files].sort();
}

/**
 * Contracts still missing at least one required viewport lock.
 * @returns {ReadonlyArray<VisibilityContract>}
 */
export function listVisibilityLockGaps() {
  return VISIBILITY_CONTRACTS.filter(
    (c) =>
      c.lockStatus === 'gap-narrow' ||
      c.lockStatus === 'gap-wide' ||
      c.lockStatus === 'gap-both'
  );
}
