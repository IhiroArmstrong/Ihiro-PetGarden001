/**
 * SessionUiGate 行为契约 — 机器可读真源（SSOT）。
 *
 * 派生：`SHARED_RESOURCES.md` §4 机器块（`npm run gate:doc-sync`）。
 * 行为断言：`SessionUiGate.test.js` + `scenario-smoke.test.js`（方案 b）。
 *
 * @see docs/DOC_CODE_CONTRACT.md
 * @see docs/SHARED_RESOURCES.md §4
 */

/**
 * @typedef {object} SessionUiGateFieldContract
 * @property {string} id 门闩字段 id（与 SessionUiGate 内部态一致）
 * @property {string} setter Gate setter 方法名
 * @property {string} readers 主要读取方（叙述性，供文档）
 * @property {string} impact 改动波及（叙述性，供文档）
 */

/** @type {ReadonlyArray<SessionUiGateFieldContract>} */
export const SESSION_UI_GATE_FIELDS = Object.freeze([
  {
    id: 'arrivalGateReady',
    setter: 'setArrivalGateReady',
    readers: 'Gate ↔ Companion `setArrivalReady`（UI 投影）',
    impact: 'Companion 点选是否可 begin；Sit 未就绪 → Arrival'
  },
  {
    id: 'completionPending',
    setter: 'setCompletionPending',
    readers: 'Gate；达标庆祝路径',
    impact: '禁止打断 / 禁止二次 begin；Companion 选项禁用'
  },
  {
    id: 'postSessionOverlayActive',
    setter: 'setPostSessionOverlayActive',
    readers:
      'main `resyncSessionChrome()` → `computePostSessionOverlayActive(sources)`',
    impact:
      'hint 是否 ignore；选项禁用。源含 Arrival / Reflection / 微仪式；Honesty 不列入'
  }
]);

/**
 * @typedef {object} SessionUiGateBehaviorContract
 * @property {string} id 契约 id（稳定，供测试 / 文档引用）
 * @property {string} api 裁决函数或 Gate 方法
 * @property {string} when 触发条件（人读摘要）
 * @property {string} must 必须通过的行为（失败即 bug）
 * @property {string} testAnchor 锁定该契约的测试文件
 */

/** @type {ReadonlyArray<SessionUiGateBehaviorContract>} */
export const SESSION_UI_GATE_BEHAVIOR_CONTRACTS = Object.freeze([
  {
    id: 'begin-focus-arrival-not-ready',
    api: 'canBeginFocusOnCompanionModeSelect',
    when: 'arrivalGateReady === false && mode 非 Offline Space',
    must: 'return false（Here & Now / Flow：禁止静默开表；UI 应启动 Arrival）',
    testAnchor: 'SessionUiGate.test.js'
  },
  {
    id: 'offline-skip-arrival',
    api: 'canBeginFocusOnCompanionModeSelect / resolveAutoStartNeedsArrival',
    when: 'mode === Offline Space（stepAway）&& arrivalGateReady === false',
    must: "canBegin true；needsArrival 'ignore'（禁止进 Arrival Notice/Choose）",
    testAnchor: 'SessionUiGate.test.js'
  },
  {
    id: 'begin-focus-gates-block',
    api: 'canBeginFocusOnCompanionModeSelect',
    when: 'completionPending || arrivalOpen || isFocusing',
    must: 'return false',
    testAnchor: 'SessionUiGate.test.js'
  },
  {
    id: 'sit-idle-not-ready',
    api: 'resolveSitClickWhenIdle',
    when: 'arrivalGateReady === false',
    must: "return 'start-arrival'（不得 'begin-focus'）",
    testAnchor: 'SessionUiGate.test.js'
  },
  {
    id: 'auto-start-needs-arrival',
    api: 'resolveAutoStartNeedsArrival',
    when: 'Here & Now / Flow && arrivalGateReady === false',
    must: "return 'start-arrival'",
    testAnchor: 'SessionUiGate.test.js'
  },
  {
    id: 'hint-overlay-ignore',
    api: 'resolveCompanionHintClick',
    when: 'postSessionOverlayActive === true',
    must: "return 'ignore'（UI 应禁用，禁止可点无反馈）",
    testAnchor: 'SessionUiGate.test.js'
  },
  {
    id: 'companion-commit-reject',
    api: 'resolveCompanionModeSelectCommit',
    when: 'canBegin === false && needsArrivalAction === ignore',
    must: "return 'reject'（禁止写 companion-mode storage）",
    testAnchor: 'SessionUiGate.test.js'
  },
  {
    id: 'overlay-aggregate-some',
    api: 'computePostSessionOverlayActive',
    when: '任一源为 true',
    must: 'return true（扩展第三叠层只追加源，不改聚合函数）',
    testAnchor: 'SessionUiGate.test.js'
  }
]);

/**
 * Companion 点选提交结果枚举（与 `resolveCompanionModeSelectCommit` 一致）。
 * @type {ReadonlyArray<string>}
 */
export const COMPANION_MODE_SELECT_COMMIT_OUTCOMES = Object.freeze([
  'commit-begin',
  'commit-arrival',
  'reject'
]);
