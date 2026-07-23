# DOC_CODE_CONTRACT.md — 文档-代码结构性对齐机制

创建日期：2026-07-22  
目的：把「文档已过时但没人发现」变成 **CI / 冒烟会主动报错**，而不是靠人工记得核对。

本机制分两层（另有一层**规则文档互相对齐**，见下）：

| 层 | 手段 | 检测命令 |
|---|---|---|
| **(a) 代码即文档** | 代码内 SSOT registry → 自动生成 md 机器块 → diff | `npm run docs:check` |
| **(b) 契约测试** | 行为断言即活文档；改坏契约 → 测试红 | `npm run test:smoke`（含门闩 / Store / 场景串联） |
| **(c) 规则权威对齐** | 每个规则主题一份 SSOT；非 SSOT 禁止完整复述 / 禁止矛盾短语 | `npm run rules:doc-check`（已并入 `docs:check`） |

`docs:check` **不替代** `test:smoke`：前者锁**结构**（字段、枚举、锚点表、规则权威），后者锁**行为**（门闩 false 时不得 begin、无静默 return）。

规则主题索引（写新流程规则前先查）：[`RULES_INDEX.md`](./RULES_INDEX.md)。真源：`scripts/rules-authority-registry.js`。

---

## 一、高风险契约清单（扫描结论）

> 扫描范围：`SCENARIO_TESTS.md`、`ARCHITECTURE.md`、`SHARED_RESOURCES.md`、`CORE_LOOP.md`、`EMOTION_BIBLE.md` 与 `src/core/*` 实现。  
> 评级：**高** = 跨模块共享 + 文档明确描述 + 历史上易「改 A 忘文档」。

### 已纳入强绑定

| ID | 契约 | 文档出处 | 绑定 | SSOT / 测试锚 |
|---|---|---|---|---|
| **G-01** | `arrivalGateReady` 及 Companion begin 门闩 | `SHARED_RESOURCES` §4、`SCENARIO_TESTS` A3–A4 / I / J | **(a)+(b)** | `sessionUiGateContractRegistry.js` + `SessionUiGate.test.js` + `scenario-smoke` A3–A4 / I / J |
| **G-02** | `completionPending` / `postSessionOverlayActive` 叠层门闩 | `SHARED_RESOURCES` §4 | **(a)+(b)** | 同上 registry + `SessionUiGate.test.js` |
| **G-03** | `resolveCompanionModeSelectCommit`（未通过不得写 storage） | `SHARED_RESOURCES` §4 | **(a)+(b)** | registry outcomes + `SessionUiGate.test.js` |
| **G-04** | `computePostSessionOverlayActive` 第三叠层扩展 | `SHARED_RESOURCES` §4 | **(a)+(b)** | registry + `SessionUiGate.test.js` |
| **H-01** | Onboarding hint id / localeKey / DOM anchor / `triggerMode` | `ONBOARDING_HINTS.md` | **(a)+(b)** | `onboardingHintRegistry.js` + `onboardingHintRegistry.test.js` |
| **L-01** | localStorage key 白名单 ↔ 各 Store `STORAGE_KEY` | `SHARED_RESOURCES` §1、`localStateKeys.js` 注释 | **(b)** | `localStateKeys.test.js`（集合相等 + 清空回归） |
| **S-01** | `StateManager` 合法状态迁移 | `ARCHITECTURE.md` 合法转移段 | **(a)+(b)** | `StateManager.js`（`STATES` + `LEGAL_STATE_TRANSITIONS`）+ `StateManager.test.js` |
| **F-01** | Companion 三模式 / `shouldSuppressAwayReminders` | `SCENARIO_TESTS` B / E / F | **(b)** | `FocusSession.js` 常量 + `scenario-smoke` B |
| **D-01** | `DailyCompletionStore` 形状与 `celebrated` 戳语义 | `SHARED_RESOURCES` §1.1、`SCENARIO_TESTS` A7–A8 / L | **(b)** | `DailyCompletionStore.test.js` + `scenario-smoke` A7–A8 |
| **D-02** | `PracticeDaysStore` 多日 `{ date, totalMinutes }` | `SHARED_RESOURCES` §1.2 | **(b)** | `PracticeDaysStore.test.js` |
| **D-03** | `HonestyBridgeStore` 当日 `shown` | `SCENARIO_TESTS` D、`HONESTY_BRIDGE_CTA.md` | **(b)** | `HonestyBridgeStore.test.js` + `scenario-smoke` D |
| **D-04** | `resolveSessionIntentionLatch`（空 pending 不抹闩） | `SHARED_RESOURCES` §1 intentions 行 | **(b)** | `SessionIntentionStore.test.js` + `scenario-smoke` C |
| **A-01** | 场景 A–D / I / J 主链路串联 | `SCENARIO_TESTS.md` | **(b)** | `scenario-smoke.test.js` |
| **V-01** | 跨视口可见性（状态 × 视口 × 用户可见宿主） | `SHARED_RESOURCES` §6 机器块、`DEV_WORKFLOW_QUALITY` §8.6 / N25 | **(a)+(b)** | `visibilityContractRegistry.js` + `visibility:doc-check` + `npm run test:e2e:visibility`（改 suppress/hide 时 CI 整表） |

### 暂未纳入（已知风险 / 不宜形式主义）

| ID | 契约 | 为何未绑 | 现状 |
|---|---|---|---|
| **E-01** | `EmotionController` / `EMOTION_KEYS` 全表 | 产品语义在 `EMOTION_BIBLE.md`（叙事+观感），键集合与 `spriteManifest` 交织；自动生成会噪音大 | **暂无 (a)**；部分行为有 `EmotionController.test.js`，序列观感仍人工 `TEST_TRACKER` |
| **E-02** | Idle 编排（呼吸×5→眨眼、cross-fade 不闪） | 像素级观感无法从 JSDoc 导出；契约在 `IdleOrchestrator` 实现细节 | **暂无自动化手段**；`DEV_WORKFLOW_QUALITY` §6.1 人工锁 |
| **C-01** | `CAPCUT_DISSOLVE_MS` / 帧停留 | 数值调参属观感，非枚举结构 | 常量 JSDoc + 人工回归；不进 `docs:check` |
| **N-01** | Arrival Practice 逐步 UI 文案 / 气泡时长 | 叙事文案在 locale + 产品稿，非机器枚举 | `ArrivalPractice.js` 步骤常量 + 人工 `SCENARIO_TESTS` A3 |
| **V-gap** | Visibility 表中 `gap-*` 行 | 已盘点、未全锁；禁止把 gap 当 locked | 见 `listVisibilityLockGaps()`；补锚后改 `lockStatus` 并 `visibility:doc-sync` |
| **P-01** | `ARCHITECTURE.md` 目录树 / 角色文件表 | 组织性文档，变更频率低，自动生成 ROI 低 | 人工维护；触及时在 PR 自检 |
| **R-01** | `SHARED_RESOURCES` §1 各 key「谁读写」叙述列 | 自然语言波及面，无法可靠从代码提取 | §1 表格**叙述列**仍手写；**key 列表**由 L-01 契约测试锁 |

---

## 二、已落地的 (a) 机制明细

### 统一入口

```bash
cd focus-tiger
npm run docs:check      # CI / test:smoke 末尾强制（含 visibility §6）
npm run hints:doc-sync  # ONBOARDING_HINTS 机器块
npm run gate:doc-sync   # SHARED_RESOURCES §4 机器块
npm run visibility:doc-sync  # SHARED_RESOURCES §6 可见性机器块
npm run state:doc-sync  # ARCHITECTURE 状态机机器块
npm run test:e2e:visibility  # 改 setSuppressed / park / hide 后：整表 e2e 锚点
```

### G-01～G-04：SessionUiGate

- **SSOT**：`src/core/sessionUiGateContractRegistry.js`
- **生成块**：`docs/SHARED_RESOURCES.md` 内 `<!-- session-ui-gate-contract:begin -->` … `end`
- **脚本**：`scripts/gate-contract-doc-check.js`
- **行为锁**：`SessionUiGate.test.js`、`scenario-smoke.test.js`

§4 **人工叙述表**（「谁设 / 谁读 / 波及」）保留在机器块之后，供开工查波及面；**字段 id / 行为 must** 以机器块为准。

### V-01：跨视口可见性

- **SSOT**：`src/core/visibilityContractRegistry.js`
- **生成块**：`docs/SHARED_RESOURCES.md` §6 内 `<!-- visibility-contract:begin -->` … `end`
- **脚本**：`scripts/visibility-contract-doc-check.js` + `scripts/run-visibility-e2e.js`
- **行为锁**：各行 `testAnchorWide` / `testAnchorNarrow`；CI：`.github/workflows/focus-tiger-visibility-contract.yml`
- **工作流**：`DEV_WORKFLOW_QUALITY.md` §8.6 / N25（验收 OK = 宽+窄自动化同任务）

### H-01：Onboarding hints

- **SSOT**：`src/core/onboardingHintRegistry.js`（含 `triggerMode`；**仅 click** 填 `tier`：`simple` / `detailed`）
- **生成块**：`docs/ONBOARDING_HINTS.md` 锚点表（含 `triggerMode` + `tier` 列；非 click 为 —）
- **脚本**：`scripts/hints-doc-check.js`
- **行为**：click 圆点 peek/static/done 见 `ONBOARDING_HINTS.md` §〇；auto 无圆点、无 tier；UI 须读 Registry，禁止散落 if/else

### S-01：StateManager 合法转移

- **SSOT**：`src/core/StateManager.js`（`STATES`、`LEGAL_STATE_TRANSITIONS`）
- **生成块**：`docs/ARCHITECTURE.md` 内 `<!-- state-machine-contract:begin -->` … `end`
- **脚本**：`scripts/state-machine-doc-check.js`
- **行为锁**：`StateManager.test.js`（非法转移 warn、BREAK 已删）

---

## 三、已落地的 (b) 机制明细

| 套件 | 命令 | 覆盖契约 |
|---|---|---|
| 门闩失败用例 | `test:smoke` → `SessionUiGate.test.js` | G-01～G-04 |
| 场景串联 | `test:smoke` → `scenario-smoke.test.js` | A-01、F-01、D-01、D-03 |
| Storage 白名单 | `test:smoke` → `localStateKeys.test.js` | L-01 |
| 状态机 | `npm test` → `StateManager.test.js` | S-01（行为） |
| Store 单元 | `npm test` → 各 `*Store.test.js` | D-01～D-04 |
| 浏览器壳 | `npm run test:e2e` | DOM 门闩（hint 可点、Offline 开表）— **不替代** G-01 逻辑锁 |

### 本地 pre-commit（husky）

仓库根目录已配置 **husky**，每次 `git commit` 前自动执行：

```bash
cd focus-tiger && npm run test:smoke   # 含 docs:check + 门闩/场景契约测试
```

| 项 | 说明 |
|---|---|
| **钩子文件** | `.husky/pre-commit`（仓库根） |
| **启用方式** | 克隆后于仓库根执行一次 `npm install`（`prepare` 脚本会安装 husky 并注册钩子） |
| **覆盖** | 结构对齐 `docs:check` + 行为契约 `test:smoke` 主体（不含 `test:e2e`） |

**绕过（不推荐）**：

```bash
git commit --no-verify -m "…"
```

仅用于：紧急热修、已知局部 WIP 且你**主动承担**未跑回归的风险。  
**禁止**习惯性 `--no-verify`——它与「文档-代码对齐」机制的目标直接冲突；若钩子因环境问题失败，应先修环境或修测试，而不是跳过。

**CI**：

- `.github/workflows/focus-tiger-doc-contract-check.yml`（结构 `docs:check` + 门闩行为切片；须先 `npm ci`）。`scenario-smoke` 经 `HonestyCheckInController` → `EmotionController` → `PoseManager` 依赖 `three`，缺安装会 `ERR_MODULE_NOT_FOUND`。
- `.github/workflows/focus-tiger-visibility-contract.yml`（改 `setSuppressed` / park / hide 相关路径时跑 **整表** `npm run test:e2e:visibility`，非仅本任务新用例）。

---

## 四、新增高风险契约 — 可执行 Checklist

在 PR / Task 收尾自检（复制使用）：

1. [ ] 该契约是否**跨模块**且**文档已写过**？若否 → 不必进本机制。  
2. [ ] 能否抽成 **枚举 / 字段表 / 纯函数裁决**？  
   - **能** → 优先 **(a)**：新建或扩展 `*ContractRegistry.js`，加 `scripts/*-doc-check.js`，注册到 `scripts/docs-check.js`。  
   - **不能**（观感 / 叙事）→ 标「暂无自动化」，写 `TEST_TRACKER` 人工步骤，勿凑假脚本。  
3. [ ] 是否有 **失败路径**（门闩未就绪、应 reject）？→ 必须 **(b)** 补失败用例，挂进 `test:smoke` 或说明为何不能。  
4. [ ] 跑 `npm run docs:sync`（若 (a)）+ `npm run docs:check` + `npm run test:smoke`。  
5. [ ] 更新本文件「已纳入」表一行；`SHARED_RESOURCES` / `ARCHITECTURE` 叙述段若有波及，人工补一句指针。  
6. [ ] **禁止**只改手写文档不改 SSOT；**禁止**只改 SSOT 不 `doc-sync`。

---

## 五、明确不需要重绑定的范围

- 产品定位、品牌措辞（`PRODUCT_POSITIONING.md`）  
- 情绪 Bible 叙事与文案池（`EMOTION_BIBLE.md` 正文）  
- 序列动画观感、帧率调参、Shader 视觉  
- Task 排期、Backlog、一次性调研  
- `TEST_TRACKER` 人工验收步骤（本机制**补充**而非替代）  
- Cloud / 部署脚本（与前端门闩无共享契约）

---

## 六、演示：最高风险项 G-01（故意制造文档漂移）

**项**：`arrivalGateReady === false` 时 `canBeginFocusOnCompanionModeSelect` 必须为 `false`。

### 1. 基线（应通过）

```bash
cd focus-tiger && npm run docs:check
```

### 2. 故意让文档与代码不一致

编辑 `docs/SHARED_RESOURCES.md` 机器块，将 `begin-focus-arrival-not-ready` 行的 `must` 改为：

`return true（故意写错）`

### 3. 检测（应失败）

```bash
npm run docs:check
# 期望：exit 1，提示 gate block out of sync
```

### 4. 修复

```bash
npm run gate:doc-sync
npm run docs:check
```

### 5. 行为层双保险（改代码不破契约）

若改 `FocusSession.canBeginFocusOnCompanionModeSelect` 使未就绪返回 `true`：

```bash
npm run test:smoke
# 期望：SessionUiGate.test.js / scenario-smoke A3–A4 失败
```

**(a)** 与 **(b)** 互补：只改文档 → `docs:check` 红；只改代码 → `test:smoke` 红。

---

## 七、演示：S-01 状态机（故意制造文档漂移）

**项**：`LEGAL_STATE_TRANSITIONS` 中 `IDLE` 的合法下一状态。

### 1. 基线（应通过）

```bash
cd focus-tiger && npm run docs:check
```

### 2. 故意让文档与代码不一致

编辑 `docs/ARCHITECTURE.md` 机器块，将 `IDLE` 行的 `allowed next` 改为：

`` `CELEBRATE` ``（代码真源仅为 `FOCUSING`, `DORMANT`）

### 3. 检测（应失败）

```bash
npm run docs:check
# 期望：exit 1，提示 state-machine block out of sync
```

### 4. 修复

```bash
npm run state:doc-sync
npm run docs:check
```

### 5. 行为层双保险

若改 `StateManager.js` 使 `IDLE → CELEBRATE` 合法：

```bash
npm test -- src/core/StateManager.test.js
# 期望：isLegalStateTransition rejects known illegal hops 等失败
```

---

## 八、与既有流程的关系

| 文档 | 关系 |
|---|---|
| `DEV_WORKFLOW_QUALITY.md` | 回归锁 / 冒烟分层；本文件是其「结构对齐」专章 |
| `SHARED_RESOURCES.md` | §4 含机器块；§1 key 叙述仍手写，key 集合由 L-01 锁 |
| `SCENARIO_TESTS.md` | 故事剧本；A–D 逻辑由 `scenario-smoke` 锁，不自动生成 |
| `ARCHITECTURE.md`「工程加固四步」 | Gate + 状态机机器块已落地；本文件为第 1 步的制度化延伸 |
