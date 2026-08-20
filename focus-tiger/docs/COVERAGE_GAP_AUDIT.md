# 功能 vs 测试覆盖 · 缺口审计

创建日期：2026-07-30  
权威路径：`focus-tiger/docs/COVERAGE_GAP_AUDIT.md`  
互补文档：`TEST_TRACKER.md`（逐功能验收）· `SCENARIO_TESTS.md`（用户故事剧本）· `DEV_WORKFLOW_QUALITY.md` §6.1（覆盖分层）

**用途**：审计「有没有完全没有自动化的功能模块」——不只是确认现有脚本能跑。  
近几轮工作重点是 CI 基建与 flaky；**全绿 ≠ 产品功能都有对应测试**。

**维护**：补上表内缺口（实现 Task 2/3 或扩 smoke）后，同回合更新本文件对应行；重大重排时同步 `TEST_TRACKER` §C。  
**扩 smoke 分类 / Honesty·i18n 发布口径**：§7–§10（2026-07-30）。**扩 smoke 脚本已落地**：`test:smoke` = `src/**/*.test.js` + `docs:check`（A+A′；无 `test:regression`）。

---

## 1. 先分清三条「绿」

| 命令 | 实际锁住什么 | 缺口 |
|---|---|---|
| `npm run test:smoke` | 门闩/控制器 + Idle chrome 编排 + HUD/热力图/hint 契约等（`package.json` 列出的文件） | 不含 Emotion/Idle 序列、Ambient 行为契约、多数业务 `*.test.js` |
| `npm run test:e2e:smoke` | **2 个 spec 的少数用例**（产品壳 + scenario A 开表一小撮） | 不含热力图 / 提醒 / Reflection / 微仪式 / 宽屏 ⋯ |
| `npm run test:e2e`（CI 全量） | `e2e/*.spec.js` 全量 DOM | 仍不到达标庆祝动画、真实切页 Recover、完整 Honesty 链、Ambient 播放 |

**图例**

| 标记 | 含义 |
|---|---|
| **DOM** | 全量 `test:e2e` 有用户链路断言 |
| **PR冒烟** | `test:e2e:smoke` |
| **smoke** | `test:smoke` |
| **unit\*** | 有 `*.test.js`，但**不在** `test:smoke`（靠 `npm test` / CI 全量才跑） |
| **人工** | 观感 / 时长 / Safari / 真实切页等，自动化刻意不锁 |

---

## 2. 功能模块 × 覆盖对照

按 Core Loop / 产品面（源自 `CORE_LOOP.md` · `SCENARIO_TESTS.md` · `TEST_TRACKER.md`）。

| 功能模块 | smoke | e2e（全量） | PR e2e 冒烟 | 其它 unit\* | 判定 | 主要缺口 |
|---|---|---|---|---|---|---|
| **产品壳 / 实验室壳** | 弱 | ✅ `product-shell.smoke` | ✅ | — | **有 DOM** | 观感人工 |
| **Idle chrome 窄宽（Facade / 编排 / ⋯ 菜单）** | ✅ 编排+Facade | ✅ `wide-idle-more-menu` + 375 热力图壳 | ❌ | — | **逻辑+DOM 较全** | 断点 375↔480、Safari 仍人工 |
| **Arrival Practice（Notice/Breath/Choose/⚡）** | ✅ 状态机+门闩 | ✅ 外侧取消 / tip 邻接 / 375 / ⚡开表 | ✅ 部分 | `ArrivalPractice.test` | **开表链路强** | 气泡时长、点头 pingpong、1s 叠化 = **纯人工** |
| **Companion 三选一（Here/Offline/Flow）** | ✅ A3–A4/I/J | ✅ A/I/K/J + 375 bow | ✅ A | `FocusSession` 等 | **开表强** | Offline 离开期间「无 Re-focus」无真实切页 e2e |
| **FocusSession 计时 + Focus HUD** | ✅ 达标判定片段 + HUD 映射 | ✅ hover 浮层；开表见 Focusing | 弱 | `FocusSession` / HUD | **部分** | 整场计时走动、Rise 手感、streak 环观感 |
| **达标反馈 Celebrating / SessionComplete** | ✅ A7–A8 分流 | ❌ | ❌ | `session-completion-feedback` | **仅逻辑** | 动画 DOM **零 e2e** → 只能人工 |
| **Reflection + 意图回显** | ✅ C（mock open） | ✅ `reflection-intention-echo` | ❌ | `SessionIntentionStore` / Reflection | **主路径有 DOM** | 三问内容、淡入、rise-stretch 观感 |
| **Recover / Re-focus** | ✅ B（抑制门闩+mock） | ❌ | ❌ | `MindfulReminder` / Attention | **仅逻辑** | 真实切标签 >60s、toast、nod-bow = **纯人工** |
| **Honesty 补登（选时长→呼吸→记账）** | ✅ D 控制器 | ✅ **真实链** `honesty-bridge-real-path`（+ 入口隐藏等） | ❌ | `HonestyCheckIn*` | **DOM 主路径已锁** | 排版/睡姿观感仍人工；`?honestyBreathMs=` 缩短墙钟 |
| **Honesty 桥接 CTA** | ✅ D Yes/No | ✅ 真实 Yes/No + 注入叠层用例 | ❌ | Bridge controllers | **真实+注入双覆盖** | 注入仍用于叠层/375 tip 邻接 |
| **DORMANT / 睡姿 / cloakWake** | ✅ D sleep→wake | ❌ | ❌ | `dormantIdle` / Trigger | **仅逻辑** | 披毯/睡姿序列纯人工 |
| **一分钟呼吸 / 微仪式** | — | ✅ `micro-ritual` | ❌ | `MicroRitual.test` | **DOM 主路径有** | Leave/记账边界已锁；观感人工 |
| **本周陪伴热力图** | ✅ store+UI 单测 | ✅ `weekly-practice-heatmap` | ❌ | — | **较强** | 真练习后变亮、Hint tip 尖角 |
| **应用内提醒 + 横幅** | — | ✅ `in-app-reminder` | ❌ | Preference / Banner / Quota\* | **设置+横幅有 DOM** | 取消勾选、整页刷新再出、defer（产品已拍板 suppress） |
| **Onboarding hints / ? 补救** | ✅ registry+store+dots | 部分（tip 邻接、park） | ❌ | — | **部分** | 文案/尖角/音乐 tip 锚多为人工 |
| **Ambient Soundscape** | ❌ | 弱（入口开面板、无 autoplay） | ❌ | `AmbientSoundscape*` | **几乎无行为锁** | 选曲播放、Rise 停音、opt-in = **主要靠人工** |
| **Idle 呼吸×5→眨眼编排** | ❌ | ❌ | ❌ | `IdleOrchestrator` / Sprite\* | **契约单测，无 e2e** | 「闪一下」只能 L-eyes 人工 |
| **LightProgression 光影** | ❌ | ❌ | ❌ | `LightProgression.test` | **仅 unit\*** | 金晕观感人工 |
| **Pointer / 摸头 / 靠近点头** | ❌ | ❌ | ❌ | `PointerInteraction` | **检测逻辑** | 产品壳无正式精灵；不挡合并 |
| **EmotionController / 情绪优先级** | ❌ | ❌ | ❌ | `EmotionController` 等\* | **仅 unit\*** | 时长带、素材抠图调试面板 = 人工 |
| **MilestoneGlow / IncenseComplete / 莲花池** | ✅ 池 math/store | Glow e2e + `lotus-pond-product` | ❌ | `MilestoneGlowStore` / `lotusPond*` | **池有 DOM；Glow 有 claim e2e；Incense 会话结束仍未接线** | 池螺旋观感仍人工；**空池第一朵被蒲团挡住**（2026-08-20，§6.18）；e2e 只锁 11→12 计数 |
| **舒展提醒 / Offline 暂停累计（场景 E）** | ✅ smoke E + MindfulReminder 入烟 | ❌ Offline 开表以外 | ❌ | Mindful\*（已入 smoke） | **逻辑已锁** | 真实离开墙钟仍人工 |
| **Flow 30min across-tools toast（场景 F）** | ✅ smoke F + AcrossTools 入烟 | ❌ | ❌ | AcrossTools\*（已入 smoke） | **逻辑已锁** | toast DOM / 真实 30min 仍人工 |
| **i18n 语言切换（场景 G）** | ✅ | ✅ `language-switch` | ❌ | registry+pref | **v1.0 en+ja** | Language 可点；zh/es/de/fr draft |
| **瞳孔跟随（场景 H）** | — | — | — | stub | **N/A 已废弃** | — |
| **Grow / 纪念奖励 / 3D 柜** | — | — | — | — | **Backlog，未接线** | 不期望有测 |
| **Quiet Line / 今日静语（含洞察种子 v2）** | — | 零星开卡 | ❌ | `dailyZenQuote` | **unit\* + 人工观感** | 新池换行/375；同日锁已单测 |
| **Journey Log（含 insightSpark）** | — | 菜单开卡零星 | ❌ | `journeyLogGate` | **unit\*** | 小符号观感人工；与 Tea/徽章零耦合已单测 |
| **Cloudflare Workers stub** | ❌ | ❌ | ❌ | — | **零（前端未接线）** | curl 人工 / 独立包 |
| **Retention 遥测占位** | ❌ | ❌ | ❌ | `RetentionTelemetry`\* | **仅 unit\*** | 无产品可见验收依赖 |
| **Sit 误开 Honesty（z-index）** | 门闩间接 | ❌ 无专条 | ❌ | — | **历史已过人工；无 e2e** | 回归靠门闩+人工 |

### 覆盖热力图（粗粒度）

```text
强（smoke+DOM）     Arrival开表 · Companion门闩 · Idle窄宽壳 · 热力图 · 提醒设置/横幅 · 微仪式主路径 · Reflection回显 · **Honesty真实补登→桥接** · **E/F 逻辑（舒展暂停 / AcrossTools idle）**
中（逻辑或注入）     Honesty桥接叠层(注入) · 达标分流 · Re-focus抑制 · DORMANT链 · Hints契约 · FocusHUD映射
弱/无               Ambient播放 · 庆祝动画 · 真实切页Recover · i18n · 光影观感 · Grow/3D
```

---

## 3. 「完全没有 / 几乎只能人工」优先看

产品主路径里仍几乎裸奔：

1. **Celebrating / SessionComplete 动画与 DOM** — 只有分流逻辑 smoke（且属下方「永不自动化」观感部分）
2. **真实 Recover（切标签 >60s）** — 只有抑制门闩（真实墙钟属「永不自动化」）
3. **Honesty 真实补登 → 桥接 → Yes → Arrival** — ✅ e2e `honesty-bridge-real-path`（2026-07-30）；叠层仍可 `__honestyBridge` 注入
4. **Ambient 实际发声与 Rise 停音** — 几乎只有「开面板 / 无 autoplay」→ 可进 smoke 扩容（行为契约，非听感）
5. **Idle / Choose / Rise 序列观感** — 刻意不进 e2e（见 §5）
6. **场景 E/F 细节**（舒展暂停、30min Flow toast）→ ✅ Task 2（smoke E/F；真实 30min / 切页仍人工）
7. **场景 G i18n** — ✅ v1.0 en+ja 可点切语 + unit/e2e；zh 延后；日文 375 人工
8. **MilestoneGlow / Incense 业务接线** — 无或已放弃
9. **Workers API** — 前端未接线，无测

**`unit*` 假安全感**：Emotion / IdleOrchestrator / Ambient / LightProgression / dormant / AcrossTools / 多数 Honesty 专测等，若合并门禁只跑 `test:pr-smoke`，**进不了默认绿**。扩 `test:smoke` 是防「只修 CI 基建幻觉」的廉价一步（§4 步骤 3）。

---

## 4. 已拍板后续顺序（2026-07-30）

不必立刻全补 e2e。更划算顺序（与 `TEST_TRACKER` §C 对齐；**Task 3 优先于 Task 2**，因 Honesty 故事洞最大）：

| 顺序 | 项 | 内容 | 对应 |
|---|---|---|---|
| **1** | **Task 3** | ✅ **已落地**（2026-07-30）：Playwright 真实 Honesty 补登 → 桥接 Yes → Arrival（`e2e/honesty-bridge-real-path.spec.js`；`?honestyBreathMs=`） | 场景 D/N |
| **2** | **Task 2** | ✅ **已落地**（2026-07-30）：smoke E/F + `MindfulReminderController` / `AcrossToolsIdleGuard` 并入 `test:smoke` | 场景 E/F |
| **3** | **扩 smoke** | ✅ **已落地**（2026-07-30）：`test:smoke` = `run-src-unit-tests.js` + `docs:check`（A+A′；B 空集；CI Node 20 安全）。实测 **319** pass · **~343ms**（改前 132/~158ms） | 防 PR 冒烟漏跑 |
| **可选** | — | e2e Rise 后再点 hint 回流 DOM（smoke J 目前只锁纯函数） | 场景 J |
| **不做** | — | 见下方「永不自动化 / 人工锁」 | — |

**优先级理由（简 · 与发布复盘对齐）**：Task 2/3 + **扩 smoke（§7）** 已落地；Honesty 产品可用性已确认（§8）；永不自动化见 §5；i18n 见 §9（v1.0 **en+ja**）。

---

## 5. 永不自动化 / 固定人工锁

下列项**禁止**为「凑绿」强行上像素或长墙钟 e2e；回归靠契约单测（若有）+ `TEST_TRACKER` 分列人工行。争论时以本表为准。

| 主题 | 为何不做自动化 | 人工锁去哪 |
|---|---|---|
| Idle 呼吸→眨眼「闪一下」 | L-eyes / 帧级叠化；e2e 不看像素 | `TEST_TRACKER` Idle 分列 · `IdleOrchestrator.test` 契约 |
| Celebrating / SessionComplete **动画像素** | 序列观感；逻辑分流已有 smoke A7–A8 | Celebrating / SessionComplete 人工行 |
| 真实切标签 **>60s** Re-focus | 墙钟长、与 demo 时长冲突 | Re-focus 人工行 · 场景 B |
| Choose pingpong + 1s 叠化观感 | 动画帧级 | Arrival Choose 行 |
| Notice 短句可读时长 | 时长观感 | Notice 行 |
| Safari / WebKit 布局专项 | Playwright 默认 Chromium | Companion Safari 人工 |
| Quiet Line 洞察种子句换行 / 375 | 观感与换行；DOM 仅开卡 | 场景 U2 仍须人工 · Quiet Line TRACKER 行 |
| Journey Log `insightSpark` 小符号 | 静默标记像素 | 场景 Z 仍须人工 · Journey Log TRACKER 行 |
| Ambient **听感** / 浏览器 autoplay 政策 | 环境相关 | Ambient 人工行 |
| 素材抠图 / 调试面板试播 | 实验室非产品壳 | 调试面板行 |

逻辑层仍可测（例：`triggerSessionCompletionFeedback` 返回值、`shouldSuppressAwayReminders`）——**禁止**把「逻辑已锁」写成「观感已验收」。

---

## 6. 相关命令速查

```bash
cd focus-tiger
npm run test:smoke          # PR 逻辑冒烟 + docs:check
npm run test:e2e:smoke      # 极窄 DOM 冒烟
npm run test:pr-smoke       # = smoke + e2e:smoke
npm test                    # 全部 *.test.js（含 unit*）
# 全量 e2e：CI 或 RUN_E2E_LOCAL=true（见 e2e-ci-guard）
```

---

## 7. 扩 smoke 分类（unit\* → 并入评估 · 2026-07-30）

> **分类回合**只落清单、不改脚本。实测当时：`npm test` 全量 **308** pass · **~345ms**；当时 `test:smoke` **121** pass · **~148ms**。  
> **落地（2026-07-30）**：`test:smoke` / `npm test` → `node scripts/run-src-unit-tests.js`（递归收集 `src/**/*.test.js` 再交给 `node --test`；**勿**用带引号的 glob——Node 20 CI 会当成字面路径失败）。确认：**319** pass · **~343ms**（改前本机 tip：**132** / **~158ms**）。**不建** `test:regression`。  
> 结论：**不需要**新建 `test:regression` 中间层——没有「慢到拖垮 PR 冒烟」的 unit\*。

### 7.1 已在 `test:smoke`（勿重复）

| 文件 | 备注 |
|---|---|
| `scenario-smoke` · `localStateKeys` · `SessionUiGate` · `sessionChromeSync` · `idleChromeOrchestration` · `IdleChromeFacade` | 门闩 / 壳 |
| `focusHudHalo` · `focusHudLive` · `sharedSittingProgress` · `PracticeDaysStore` · `WeeklyPracticeHeatmap` | HUD / 热力图 |
| `onboardingHintRegistry` · `OnboardingHintsStore` · `hintDiscoveryDots` · `outsideDismissGuard` | Hints |
| `sessionUiGateContractRegistry` · `visibilityContractRegistry` | 文档契约 registry |
| `MindfulReminderController` · `AcrossToolsIdleGuard` | Task 2 已入烟（含审计原先点名的 AcrossTools 阈值 mock） |

### 7.2 A 类 · 可原样并入 `test:smoke`（纯配置 · 零改测）

审计点名 + 同等「假安全感」业务契约。单测本身均亚秒；依赖 `three` 的经 `EmotionController` → `PoseManager` 链路在本机/`npm ci` 后可跑（勿在缺 `node_modules` 环境误判为测坏）。

| 文件 | 为何优先 |
|---|---|
| `src/core/EmotionController.test.js` | 情绪优先级 / 交叉淡入契约 |
| `src/character/IdleOrchestrator.test.js` | 呼吸×5→眨眼不闪契约 |
| `src/audio/AmbientSoundscapeController.test.js` | 停音 / pref / 选曲契约（非听感） |
| `src/effects/LightProgression.test.js` | 光影逻辑 |
| `src/core/dormantIdle.test.js` | 冷启动 / DORMANT 链 |
| `src/core/dormantTrigger.test.js` | 2h 阈值判定 |
| `src/core/HonestyCheckInController.test.js` | 补登控制器（成功 toast 回调等） |
| `src/core/HonestyBridgeCtaController.test.js` | 桥接 Yes/No |
| `src/core/HonestyBridgeStore.test.js` | 桥接存储 |
| `src/core/session-completion-feedback.test.js` | Celebrating 分流（逻辑；动画仍人工） |
| `src/core/ArrivalPractice.test.js` | Arrival 状态机 |
| `src/core/FocusSession.test.js` | 计时核心 |
| `src/core/DailyCompletionStore.test.js` | 日完成戳 |
| `src/core/MicroRitual.test.js` | 一分钟呼吸逻辑 |
| `src/core/StateManager.test.js` | 状态机 |
| `src/character/SpriteSequencePlayer.test.js` | cross-fade / freeze 契约 |

### 7.3 A′ 类 · 亦可原样并入（次优先 · 仍纯配置）

价值略低于主路径，但仍是「有测不进门禁」洞：

| 文件 | 备注 |
|---|---|
| `src/core/SessionIntentionStore.test.js` | Choose 意图 |
| `src/ui/TigerReflectionMoment.test.js` | Reflection 流 |
| `src/core/reminderPreference.test.js` · `ReminderQuotaManager.test.js` · `InAppReminderBannerController.test.js` | 提醒（e2e 已有 DOM；单测补逻辑） |
| `src/core/RetentionTelemetry.test.js` | 遥测占位 |
| `src/core/MoodController.test.js` | Mood 桥 |
| `src/character/CharacterConfig.test.js` · `companionGestureCatalog.test.js` · `spriteDisplayFit.test.js` | 角色配置 / 目录 |
| `src/input/AttentionSignals.test.js` | Recover 信号 |
| `src/input/PointerInteraction.test.js` | 摸头逻辑（产品壳无正式精灵；仍可锁检测） |

### 7.4 B 类 · 因慢 / 重依赖而不进 smoke → 评估 `test:regression`

**空集。** 无文件因时长或依赖重而需要第三层。若未来单测墙钟化或起真实浏览器，再单开中间层。

### 7.5 落地方式（已执行 · 2026-07-30）

1. ✅ `package.json` → `test:smoke` = `node scripts/run-src-unit-tests.js && npm run docs:check`（显式列文件，兼容 Node 20 CI）。  
2. ✅ 本地确认时长仍可接受（unit 段 ~343ms ≪ 拖慢门槛）。  
3. ✅ **未**建空的 `test:regression`。

---

## 8. Honesty 真实链路 · v1 阻塞评估（2026-07-30）

**问题**：补登→桥接→Yes→Arrival 是「功能坏了」还是「只缺 e2e」？

| 证据 | 结论 |
|---|---|
| `TEST_TRACKER` Honesty Check-in / 桥接 CTA / 场景 checklist **L267** | 用户书面 **已通过**（主路径可用） |
| `e2e/honesty-bridge-real-path.spec.js`（Task 3） | 真实入口→时长→呼吸→Yes→Arrival / No→Idle **已锁 DOM**（禁注入） |
| smoke D + Honesty\* unit\* | 控制器层有覆盖；unit\* 尚未全部进 smoke（见 §7） |

**产品结论**：**功能本身可用**（人工已验收 + 现有真实链 e2e）。  
→ **不是** v1 release-blocker（无需为「会不会通」再挡发布）。  
→ 剩余：Honesty unit\* **已随扩 smoke 进门禁**；排版/睡姿观感仍人工（§5）。

---

## 9. i18n · 多语言可行性 / 风险 / 覆盖补齐（2026-07-30 修订）

> **设计意图**：产品**希望有多语言**（工程保留 N locale + 可点切语架构）。  
> **2026-07-30 拍板（工程）**：可点切语 UI + 持久化 + A/B 自动化；六语槽位；**审完再露**。  
> **2026-07-30 修订（发版对外）**：**v1.0.0 = English + Japanese**（坐禅文化共鸣；可点切换）。中文**不着急**，zh 保持 draft、不进发布 checklist。  
> **落地含义**：catalog `en` + `ja` = `ready`；Language 菜单出现（≥2 ready）；`zh.json` 等仍进仓备后续 flip。

### 9.1 现状（已有 vs 缺）

| 层 | 状态 | 说明 |
|---|---|---|
| 字典 | ✅ en + ja；staged zh | key 对齐；zh **draft**（不进选择器） |
| 运行时 API | ✅ | `t` / `tPool` / `setLocale` / `getLocale` / `onLocaleChange` |
| UI 订阅刷新 | ✅ 主面 | 主路径已 `onLocaleChange` |
| 默认语言 | ✅ | `en` |
| **应用内切语 UI** | ✅ | `LanguagePreferenceUI`；`shouldOfferLanguagePicker()` → **露出** Language（en+ja） |
| **locale 持久化** | ✅ | `focus-tiger.locale.v1`（ready only） |
| **浏览器语言探测** | ❌ | 可选增强 |
| **自动化** | ✅ | `i18n.test.js` ∈ smoke；`language-switch.spec.js` 锁 en↔ja |

### 9.2 可行性（结论：高 · 工程）

多语言**运行时切换**工程上已可行。v1.0.0 产品面声称 **English + Japanese**；其余 locale 改 `ready` 须同批更新对外声称与人工面。

### 9.3 任务拆分 · 难度 / 风险 / 是否挡 v1

| 项 | 难度 | 风险 | 状态 / 建议 | 挡 v1？ |
|---|---|---|---|---|
| **A. unit\*** | **低** | 极低 | ✅ `i18n.test.js`（en+ja ready + staged zh 奇偶；**ja≠en 占位守卫**；**日文脚本守卫**=假名\|汉字，忌“仅假名”误杀到着/回復）；`npm run i18n:sync` 列缺口（无机翻写入） | — |
| **B. e2e** | **低** | 低 | ✅ 点 Language → 日本語 → English | — |
| **C. 切语 UI** | **中** | 低 | ✅ 面板 + 门闩 `≥2 ready` | — |
| **D. 冷启动** | **低** | 低 | ✅ 默认 en；记忆 ready；draft 忽略 | — |
| **E. 人工排版** | 人工 | 中 | **v1.0 须抽测日文 375**；zh **非**发布 checklist | 声称 ja 时须测 |
| **F. 扩语种** zh/es/de/fr | 内容 | 高 | 槽位已在；审完 + 决定声称 → `ready` | 仅声称后 |

### 9.4 对覆盖的正确姿态

> 切语架构 + en/ja 自动化已落地。  
> 下一语种上线 = catalog `ready` + 对外文案同步 + 人工 E + 切语 e2e 扩断言。

### 9.5 产品拍板（已定 · 2026-07-30 修订）

| 项 | 决定 |
|---|---|
| 工程入口 | **可点切语**（⋯ / 抽屉 + `LanguagePreferenceUI`） |
| v1.0.0 对外 | **English + Japanese**；不声称中文 |
| v1.0.0 选择器 | `en` + `ja` ready；Language 行可见 |
| 记忆 | 写 locale 偏好（ready only） |
| 后续 | zh / es / de / fr 槽位保留；审完再露 + 同批更新声称 |

### 9.6 六语意向（en / zh / es / ja / de / fr）· 风险诚实结论

| 面 | 说明 |
|---|---|
| **工程扩槽** | **低风险** — catalog 已含 6 id |
| **v1.0.0 对外** | **English + Japanese**（日语与坐禅习惯共鸣；中文延后） |
| **一次声称多语** | 仍偏高内容债 — 继续 **审完再露** |

| 阶段 | 做什么 | 用户看见 |
|---|---|---|
| **v1.0.0** | `en` + `ja` ready；Language 可点；zh draft staged | English / 日本語 |
| **后续** | 某语审完 → `ready`；更新发版说明 | 选择器增加该项 |
| **对外声称** | 未 ready → **禁止**写「已支持」 | — |

（「English only」发版拍板已被本条 **en+ja** 覆盖；六语槽与切语架构不变。）

---

## 10. 对发布计划的影响（与上列对齐）

**阻塞 v1（测试 / i18n 面）**

1. ✅ 按 §7 把 A+A′ unit\* **并入** `test:smoke`（`run-src-unit-tests.js`）  
2. Honesty 真实链：**已确认可用**（§8）  
3. 「永不自动化」清单：**§5**  
4. **i18n**：v1.0.0 **en+ja**；自动化锁切语；**日文 375 人工**进发布面；**不**挡在 zh 人工验收  

**不阻塞（post-v1.0 或并行内容轨）**

- Ambient 播放 e2e、Celebrating 动画 e2e、场景 E/F 真实墙钟 DOM  
- **zh/es/de/fr 审校达 ready 并决定对外声称**  

**仍阻塞 v1（产品面 · 非本审计）**：Electron 脚手架（壳已拍板，窗口未写）等——见 `PROCESS.md`。
