# Task Brief · 今日方向 · ? 次级入口 + 选项版本轻提示

> **状态（2026-09-24）**：**in progress** — 实现中（分支 `feature/today-direction-help-and-options-version`）  
> **分支建议**：`feature/today-direction-help-and-options-version`（**禁止**与无关 cold-start 实验混支）  
> **关联**：`task-cold-start-goal-onboarding.md`（首卡 V1）· tracker `feature-cold-start-goal-onboarding.md` Step 2（菜单/首页球手动重开，**本分支前置已落地**）

## 产品拍板（分析师 2026-09-24 · 勿再问）

| 项 | 口径 |
|---|---|
| 叠层策略 | **禁止** ? 简介卡与四选卡同时弹两层；须「入口共存、展示顺序化」 |
| 「重新来过」信号 | **不做**系统自动猜测；用户主动点入口 = 明确意图 |
| ? 与「重新来过」 | **合并为一件事**：? 内次级入口既是路径也是信号 |
| 选项更新 | **唯一**需要「系统判断再问」的场景；轻提示、可跳过、不强制重走全流程 |
| 测试重置按钮 | **不算**生产信号；DEV / `?product=1` 专用 |

---

## 1. 背景

冷启动四选卡（「你今天想做什么？」）V1 已上线：首次 seen 后自动 gate 关闭。Step 2 已在旁支实现 **手动重开** 双入口（`⋯` Preferences →「重新选择今日方向」；宽/窄 Idle 首页最左文字球），调用 `coldStartGoalCardUI.open({ manual: true })`。

仍缺两块：

1. **? 按钮路径**：用户习惯从 ? 进产品简介，但未接四选卡；若硬叠两层会撞 overlay 仲裁（purpose tier 28 vs goal tier 10）。
2. **选项集合演进**：未来新增/替换可选项时，老用户无法感知；须版本号 + 轻提示，而非静默改选项或强制重弹首卡。

本 Brief 只覆盖上述 **① + ③**；②「明确重新来过」已并入 ①，**不单独实现**。

---

## 2. 范围声明

### 做

- **①** 在 `#onboarding-app-purpose`（? 产品简介卡）内增加次级入口 → 顺序关闭简介卡 → `open({ manual: true })` 打开四选卡。
- **③** 四选卡选项集合版本号 + 本地「已知晓版本」；Idle 就绪后若代码版本 > 本地版本 → 轻量提示；用户点进才开卡；跳过亦 mark 版本、不再追问。
- i18n：en + zh + ja（与 Step 2 菜单/球文案同批）。
- 单测 + 定向 e2e；`SHARED_RESOURCES.md` 登记新 localStorage key；tracker 碎片。

### 不做

- 不做「系统侦测用户想重来」的隐式逻辑（行为分析、会话重置推断等）。
- 不因纯文案微调 / 翻译修正 bump 选项版本号。
- 选项更新时**不**强制重走完整冷启动 gate（不删 `cold-start-goal-seen.v1`、不自动弹卡挡 flower bubble / Compass 队列）。
- 不在本任务改四选卡选项内容本身（除非 PO 另开 PR bump 版本做验收）。
- 不新增第四个手动入口位（首页球 + 菜单 + ? 内链已够；禁止再占 chrome）。

---

## 3. 设计细节 · ① ? 次级入口

### 3.1 交互序列（强制）

```
用户点 ? → 简介卡可见
用户点「重新选择今日方向」链 →
  1) _hidePurposeCard()（含 backdrop 淡出，约 OVERLAY_BACKDROP_FADE_MS）
  2) 在 onClose / rAF 或 fade 结束后调用既有 onTodayDirection()
     （= closeGrowthOverlayCards({ except: 'cold-start-goal' }) + open({ manual: true })）
  3) 四选卡单独占层；Esc / 点空白 /「只是看看」= 仅关卡，不导航，不写 seen（与 Step 2 一致）
```

**禁止**：简介卡仍 open 时同步 `open()` 四选卡。

### 3.2 入口位置与文案

| 位置 | 建议 |
|---|---|
| DOM | `#onboarding-app-purpose` → `.onboarding-app-purpose__actions` **之上**新增一行 `.onboarding-app-purpose__today-direction`（文字按钮/链接样式，与 `.onboarding-app-purpose__wellness-link` 同级视觉） |
| 可见条件 | `hasSeenColdStartGoalCard(localStorage) === true` **且** handler 已注入；首跑未 seen 时**隐藏**（避免与自动冷启动卡重复） |
| 文案 key | 复用 `TODAY_DIRECTION_MENU_LABEL`（en: "Choose today's direction again" / zh: "重新选择今日方向"）；若简介卡语境需更短，另增 `TODAY_DIRECTION_PURPOSE_LINK` 但三语须同批 |
| testid | `onboarding-purpose-today-direction` |

**我认为最合理的**：简介卡 wellness 区块下方、Privacy 按钮上方放一行 text-link；首跑隐藏；文案与菜单项一致以降低翻译面。

### 3.3 接线

- `main.js` 向 `OnboardingHintsUI` 构造参数注入 `onTodayDirection`（与 `idleChromeOrchestration` 共用同一 closure，**单一 SSOT**）。
- `OnboardingHintsUI` 内 click handler：`stopPropagation` → `_hidePurposeCard()` → `requestAnimationFrame` 或 `setTimeout(..., OVERLAY_BACKDROP_FADE_MS)` → `this.handlers.onTodayDirection?.()`。
- purpose 卡 open 时 `syncOverlaySnapshot` / `purposeCardOpen` 须正确归零后再开 goal 卡（避免 snapshot 双 true）。

### 3.4 点击反馈（0–1s）

- **0–1s 内**：简介卡 backdrop + 卡体开始淡出/隐藏；随后四选卡 backdrop + `#cold-start-goal-card` 出现（`is-visible`）。
- **挂起/失败**：无网络；若 handler 未注入则入口 hidden，不存在哑点击。

---

## 4. 设计细节 · ③ 选项版本轻提示

### 4.1 版本常量与存储

**代码侧**（`coldStartGoalGate.js` 或同级 gate 模块）：

```js
/** Bump ONLY when COLD_START_GOAL_CHOICES add/remove/replace an id — NOT copy/i18n tweaks. */
export const COLD_START_GOAL_OPTIONS_VERSION = 1;

export const COLD_START_GOAL_OPTIONS_SEEN_KEY =
  'focus-tiger.cold-start-goal-options-seen.v1';
```

| 函数 | 行为 |
|---|---|
| `getSeenColdStartGoalOptionsVersion(storage)` | 读 number；缺省 `0` |
| `markColdStartGoalOptionsVersionSeen(storage, version?)` | 写入 `String(version ?? COLD_START_GOAL_OPTIONS_VERSION)` |
| `shouldOfferColdStartGoalOptionsRefresh(storage)` | `hasSeenColdStartGoalCard && getSeen < OPTIONS_VERSION` |

**与 `cold-start-goal-seen.v1` 分工**：

| key | 含义 |
|---|---|
| `cold-start-goal-seen.v1` | 用户**至少见过一次**四选卡（首跑自动或手动） |
| `cold-start-goal-options-seen.v1` | 用户**已知晓**当前选项集合版本（看过提示或主动重选后 bump） |

首跑用户：`seen` 未写 → **不**出选项更新提示（仍走原有自动 gate）。

### 4.2 何时 bump 版本（开发指引 · 强制写进 PR）

在 **`COLD_START_GOAL_CHOICES` 数组变更 PR** 的 description 中必须包含：

1. `COLD_START_GOAL_OPTIONS_VERSION` +1  
2. 变更摘要（增/删/替换了哪个 choice id）  
3. 新选项的 `resolveColdStartGoalAction` 映射  
4. tracker 登记「选项版本 N 轻提示 + 手动重选」待测  

**不 bump**：仅改 `COLD_START_GOAL_*` / `TODAY_DIRECTION_*` 文案；改 zh/ja 翻译；改样式。

### 4.3 轻提示 UI

**候选**：

| 方案 | 描述 |
|---|---|
| A · 顶栏横幅 | `#ui-overlay` 顶部居中窄条（类比 `InAppReminderBannerUI`，**独立**组件/控制器，勿复用 reminder busy 逻辑） |
| B · 入口角标 | `?` 帮助钮 + 首页 `today-direction` 球 + 菜单行显示小圆点（无横幅） |

**我认为最合理的**：**方案 A 横幅**——文案可读、不依赖用户先发现 ?；Dismiss（× 或「稍后」）与 CTA（「看看」）并列；Dismiss 亦 `markColdStartGoalOptionsVersionSeen`。**busy 时 suppress**（Arrival / Focusing / Celebrate / Reflection / 微仪式），回 Idle 再评，与 reminder banner 同政策。

**文案 key 建议**：

- `TODAY_DIRECTION_OPTIONS_REFRESH_BANNER` — 「目标选项有更新，要重新看看吗？」  
- `TODAY_DIRECTION_OPTIONS_REFRESH_CTA` — 「看看」  
- `TODAY_DIRECTION_OPTIONS_REFRESH_DISMISS` — 「稍后」  

**行为**：

| 用户操作 | 结果 |
|---|---|
| 点 CTA | `markColdStartGoalOptionsVersionSeen` → `open({ manual: true })` → 隐藏横幅 |
| 点 Dismiss / × | `markColdStartGoalOptionsVersionSeen` → 隐藏横幅；**不**开卡 |
| 通过菜单/?/球手动开卡并完成任一非 browse 选择 | `markColdStartGoalOptionsVersionSeen`（选完即视为已知晓新选项） |
| 仅 browse / Esc 关卡 | **不** mark 版本（用户未确认新选项；下次 Idle 仍可提示） |

**评估时机**：`main.js` Idle 壳就绪、`shouldOfferColdStartGoalOptionsRefresh` 为 true、非 overlayBusy suppress 窗口；与 `syncInAppReminderBanner` 同级 hook，但**独立** evaluate 函数（如 `evaluateTodayDirectionOptionsRefreshBanner`）。

### 4.4 overlay / z-index

- 横幅 z-index 须查 `Z_INDEX.md` 与 `InAppReminderBannerUI` 同带（勿挡 `⋯` / 抽屉抓手）；登记 `OVERLAY_UI_SURFACE` 若新建可点击 surface。
- 横幅 **不**占用 `coldStartGoalOpen`；开卡仍走既有 growth card 合约。

---

## 5. 共用机制核对（COLLAB §7）

1. **overlayBusy**：四选卡已登记 `coldStartGoalOpen` / tier 10 growth；顺序化 ?→卡 须保证 `purposeCardOpen` 先 false。**结论**：? 链接触发前必须 `_hidePurposeCard()` 完成；`onTodayDirection` 已含 `closeGrowthOverlayCards`，不受影响的是 Confide/Journey 等其它 growth 卡——符合 Step 2 行为。  
2. **HUD 呼吸**：本任务不新增 breath 流程。**跳过**。  
3. **z≥17 遮罩**：goal 卡 backdrop z=17；purpose z≈26–28。**结论**：禁止双开；顺序关闭 purpose 后再开 goal，Support FAB / Ambient 音符仍走 idle-chrome dim 既有路径。  
4. **新建可点击叠层**：若新增 options refresh 横幅 → 须在 `overlayUiSurfaceContract` / `OVERLAY_UI_SURFACE` 登记一行（含 `mutationFeedback` 若有点击写盘）；e2e 断言 375 下 `⋯` 仍可点。

---

## 6. 功能冲突扫描（实现前）

对照 `SCENARIO_TESTS.md` 相邻场景：

| 轴 | 结论 |
|---|---|
| 强度 | 轻提示 + 可跳过；不阻断 Idle 主路径；与「不制造焦虑」一致 |
| 语气 | 观察式「有更新，要看吗」；禁止 FOMO / 评判旧选择 |
| 职责 | 与 Practice Identity / Confide 路由无重叠；仍不写持久画像，仅 session choice |

**无冲突疑点**；若 PO 要求选项更新后**强制**重选，须另开 Brief（与本任务「可跳过」冲突）。

---

## 7. 验收标准

### ① ? 次级入口

- [ ] seen 已写 → 点 ? → 简介卡见「重新选择今日方向」链 → 点链 → 简介关 → 四选卡开（e2e 录屏或 Playwright 断言 `#onboarding-app-purpose` hidden + `#cold-start-goal-card` visible）。
- [ ] seen 未写（清 `cold-start-goal-seen.v1` 首跑）→ ? 简介卡**无**该链；自动冷启动卡仍按 defer 队列出现。
- [ ] 链 → 选 focus/calm/study → 与 Step 2 相同导航；browse/Esc → 仅关卡。
- [ ] 375 + ≥1280 各测；? 锚点 remap 仍正确（窄 ActionBar ? / 宽热力图 ?）。

### ③ 选项版本

- [ ] 本地 `options-seen` < `OPTIONS_VERSION` 且 seen 已写 → Idle 见轻提示（非 busy）。
- [ ] Dismiss → 提示不再出现（同版本）；CTA → 开四选卡。
- [ ] DEV：临时 `OPTIONS_VERSION = 2` + fixture 用户 `options-seen = 1` → 提示出现；完成选择或 Dismiss 后消失。
- [ ] 首跑（seen 未写）→ **无**选项更新提示。
- [ ] bump 版本 PR 模板含 §4.2 四项（code review 可 grep）。

### 回归

- [ ] Step 2 菜单/首页球手动重开仍绿（`today-direction-manual-entry.spec.js`）。
- [ ] 冷启动 flower bubble → 首卡 defer 顺序不变。
- [ ] ? 仅出简介卡、不喷其它 onboarding tips（`OnboardingHintsUI` 既有约束）。

---

## 8. 建议文件 touch 列表

| 区域 | 文件 |
|---|---|
| Gate + 版本 | `src/core/coldStartGoalGate.js` · `coldStartGoalGate.test.js` · `localStateKeys.test.js` |
| ? 链 | `src/ui/OnboardingHintsUI.js` · `OnboardingHintsUI.test.js`（若有）· `src/main.js` |
| 轻提示 | 新 `TodayDirectionOptionsBannerUI.js` + `todayDirectionOptionsBanner.js`（evaluate/mark）· `main.js` sync hook |
| i18n | `src/locales/en.json` · `zh.json` · `ja.json` |
| 文档 | `docs/SHARED_RESOURCES.md`（新 key）· `docs/kb-live-entry-registry.md`（? 内链 live 条目，若适用） |
| e2e | 新 `e2e/today-direction-help-entry.spec.js` · 可选 `e2e/today-direction-options-refresh.spec.js` |
| tracker | `docs/tracker-entries/feature-today-direction-help-and-options-version.md` |

---

## 9. 开工口令

「开工今日方向 ? 入口与选项版本」

---

## 10. 风险

| 风险 | 缓解 |
|---|---|
| purpose / goal 双 open 回归 | 强制顺序 + e2e；禁止并行 open |
| 版本号滥用导致骚扰 | §4.2 PR 模板 + code review；仅 choice id 变更才 bump |
| 横幅与 reminder 叠 | 独立 evaluate；z-index 查表；busy suppress |
| ? 入口过多 | 首跑隐藏；与菜单/球共用同一 handler |

---

*版本：1.0 · 2026-09-24 · 分析师 ①+③ 实施 Brief*
