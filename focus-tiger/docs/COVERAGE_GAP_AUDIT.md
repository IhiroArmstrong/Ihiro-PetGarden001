# 功能 vs 测试覆盖 · 缺口审计

创建日期：2026-07-30  
权威路径：`focus-tiger/docs/COVERAGE_GAP_AUDIT.md`  
互补文档：`TEST_TRACKER.md`（逐功能验收）· `SCENARIO_TESTS.md`（用户故事剧本）· `DEV_WORKFLOW_QUALITY.md` §6.1（覆盖分层）

**用途**：审计「有没有完全没有自动化的功能模块」——不只是确认现有脚本能跑。  
近几轮工作重点是 CI 基建与 flaky；**全绿 ≠ 产品功能都有对应测试**。

**维护**：补上表内缺口（实现 Task 2/3 或扩 smoke）后，同回合更新本文件对应行；重大重排时同步 `TEST_TRACKER` §C。  
**扩 smoke 分类 / Honesty·i18n 发布口径**：§7–§10（2026-07-30；分类回合**不改** `package.json`）。

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
| **MilestoneGlow / IncenseComplete** | ❌ | ❌ | ❌ | — | **无自动化 / 业务未接线** | Glow 有问题行；Incense 已放弃接线 |
| **舒展提醒 / Offline 暂停累计（场景 E）** | ✅ smoke E + MindfulReminder 入烟 | ❌ Offline 开表以外 | ❌ | Mindful\*（已入 smoke） | **逻辑已锁** | 真实离开墙钟仍人工 |
| **Flow 30min across-tools toast（场景 F）** | ✅ smoke F + AcrossTools 入烟 | ❌ | ❌ | AcrossTools\*（已入 smoke） | **逻辑已锁** | toast DOM / 真实 30min 仍人工 |
| **i18n 语言切换（场景 G）** | ❌ | ❌ | ❌ | — | **零自动化** | 只能人工 `__i18n` |
| **瞳孔跟随（场景 H）** | — | — | — | stub | **N/A 已废弃** | — |
| **Grow / 纪念奖励 / 3D 柜** | — | — | — | — | **Backlog，未接线** | 不期望有测 |
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
7. **场景 G i18n** — 零（低 ROI；暂不排自动化）
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
| **3** | **扩 smoke** | **分类已落 §7**（A/A′ 可原样并入；B=`test:regression` 空集）。**改 `package.json` 待下一回合** | 防 PR 冒烟漏跑 |
| **可选** | — | e2e Rise 后再点 hint 回流 DOM（smoke J 目前只锁纯函数） | 场景 J |
| **不做** | — | 见下方「永不自动化 / 人工锁」 | — |

**优先级理由（简 · 与发布复盘对齐）**：Task 2/3 已落地。余下最便宜且堵「假安全感」的是 **扩 smoke（§7）**；Honesty 产品可用性已确认（§8）；永不自动化见 §5。

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

> **本回合只落分类，不改 `package.json`。** 实测：`npm test` 全量 **308** pass · **~345ms**；现行 `test:smoke` **121** pass · **~148ms**（另加 `docs:check`）。  
> 结论：**不需要**新建 `test:regression` 中间层——没有「慢到拖垮 PR 冒烟」的 unit\*；并入成本 = 改脚本清单（零业务改动）。

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

### 7.5 建议落地方式（下一回合改代码时）

1. 先把 **§7.2** 整批追加进 `package.json` → `test:smoke`（或改成 `node --test "src/**/*.test.js" && npm run docs:check`，等价「smoke = 全 unit + docs」）。  
2. 本地确认 `npm run test:pr-smoke` 时长仍可接受（预期 unit 段仍 \<1s）。  
3. **不要**为凑层数建空的 `test:regression`。

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
→ 剩余：扩 smoke 纳入 Honesty unit\*（门禁假安全感）；排版/睡姿观感仍人工（§5）。

---

## 9. i18n · 多语言可行性 / 风险 / 覆盖补齐（2026-07-30 修订）

> **设计意图（用户确认）**：产品**希望有多语言**（非「v1 只发单语言」）。  
> **纠正**：不得把「零自动化」默认解释成「推 post-v1」——**缺口应补覆盖**；缺的是测试与切语 UI，不是字典骨架。  
> **2026-07-30 拍板**：v1 = **可点切语**（选 1：C+D）；下一回合开做 **A+B+C**（e2e 走 UI）。目标语种意向见 §9.6。

### 9.1 现状（已有 vs 缺）

| 层 | 状态 | 说明 |
|---|---|---|
| 字典 | ✅ en/zh | `en.json` / `zh.json` **各 171 key，1:1 对齐**；总英文量约 **5.3k 字符** |
| 运行时 API | ✅ | `t` / `tPool` / `setLocale` / `getLocale` / `onLocaleChange`（`src/locales/i18n.js`） |
| UI 订阅刷新 | ✅ 主面 | Arrival / Honesty / Bridge / Companion / HUD / Ambient / Reflection / Hints / 窄宽壳 / Sit·Rise 等已 `onLocaleChange` |
| 默认语言 | ✅ | `en`（海外市场） |
| **应用内切语 UI** | ❌ → v1 做 | 拍板可点切换（§9.5） |
| **locale 持久化** | ❌ → v1 做 | `focus-tiger.locale.v1`（与 C/D 同批） |
| **浏览器语言探测** | ❌ | 可选；默认仍建议 **记忆优先，否则 en**（海外默认） |
| **自动化** | ❌ → 下一回合 A+B | 无 `i18n*.test.js`；无切语 e2e |

### 9.2 可行性（结论：高 · 工程）

多语言**运行时切换**在工程上已基本可行：字典齐、订阅面广、切换不必整页重载。  
相对「从零做 i18n」，当前是 **补齐产品入口 + 锁回归 +（可选）扩语种字典**，不是重写文案体系。

### 9.3 任务拆分 · 难度 / 风险 / 是否挡 v1

| 项 | 难度 | 风险 | 状态 / 建议 | 挡 v1？ |
|---|---|---|---|---|
| **A. unit\***：全启用 locale 的 key 奇偶、`setLocale` 通知、`t` 缺键回退 | **低** | 极低 | **下一回合做**；并入 `test:smoke` | 是（声称多语言时） |
| **B. e2e** | **低–中** | 低 | **下一回合做**：点切语 UI → 断言关键文案；回流切回 en | 是 |
| **C. 切语 UI** + `focus-tiger.locale.v1` | **中** | 中（壳位 / 375） | **下一回合做**（拍板选 1） | 是 |
| **D. 冷启动** | **低–中** | 中 | 与 C 同批：优先读存储；无则 **en**（探测系统语为可选增强） | 同 C |
| **E. 人工排版** | 人工 | 中 | 每启用一种语言抽 375；德文偏长、日文换行 | 声称该语可用 → 人工必测 |
| **F. 扩语种字典** es/ja/de/fr | **内容高** | **高（质量）** | 见 §9.6；**工程扩槽位低风险** | 仅当对外声称该语已就绪 |

### 9.4 对「零覆盖」的正确姿态

> 零自动化 → **补 A+B**（下一回合与 C 同批）。  
> 切语 UI（C）已拍板进 v1，**不再**属 post-v1。

### 9.5 产品拍板（已定 · 2026-07-30）

| 项 | 决定 |
|---|---|
| 入口 | **v1 可点切语**（⋯ / 窄屏抽屉等次要入口；具体壳位实现时定） |
| 自动化 | 下一回合 **A + B + C**（B 以点 UI 为主；可保留 `__i18n` 作 DEV 兜底） |
| 记忆 | 写 locale 偏好；刷新后保持 |

### 9.6 六语意向（en / es / zh / ja / de / fr）· 风险诚实结论

用户希望：在**没有项目风险**的前提下，支持 **英语、西班牙语、汉语、日语、德语、法语**。

| 面 | 有无「项目风险」 | 说明 |
|---|---|---|
| **工程扩槽**（`DICTIONARIES` + 选择器列 6 项 + A 奇偶按「已启用 locale」） | **低** | 与做 2 语同构；不挡下一回合 A+B+C 开工 |
| **en + zh 质量与可点切换** | **低–中** | 字典已齐；风险在壳 UI / 375，可用自动化+人工压 |
| **一次发齐 es/ja/de/fr 并对外声称「支持六语」** | **有 · 偏高** | 见下 |

**为何四语「齐发声称」有风险（不是吓阻，是内容债）**

1. **文案质量**：观察式正念措辞（`EMOTION_BIBLE` / `PRINCIPLES`）忌机翻腔、忌说教；现成高质量只有 **en/zh**。四语 × 171 key ≈ **4×5.3k 字符** 的审校量，无母语审 = 品牌与正念语气风险。  
2. **维护倍率**：此后每条新 UI 键默认 ×6；漏译会静默回退 en（或露 key），易造成「半西语半英语」体验。  
3. **布局**：德语往往更长；日/汉断行与 EN 不同 → E 人工面随语种线性增加。  
4. **定位文档**：`PRODUCT_POSITIONING` 仍写「英文默认、中文可切」——扩六语须同批改定位，避免对外口径打架。

**推荐落地（降低风险、仍朝六语走）· 2026-07-30 已拍板「审完再露」**

| 阶段 | 做什么 | 选择器里用户看见 |
|---|---|---|
| **v1 下一回合（A+B+C）** | 架构按 **N locale** 设计；**完整启用 en + zh**；切语 UI + 持久化 + 自动化 | **English / 中文**（必有） |
| **六语槽位** | 可增加 `es` / `ja` / `de` / `fr` 文件与注册；**未审校完不进选择器**（**禁止**灰项 Coming soon 充数——未 `ready` = 用户不可见） | 仅 `ready` 语种 |
| **字典补齐** | 四语可先机翻草稿进仓 + 状态 `draft`；**母语/你书面审过** → `ready` 后才露出 | 随 ready 增加 |
| **对外声称** | 未 `ready` 的语言 **禁止**写进发版说明「已支持」 | — |

→ **拍板**：六语为方向；**审完再露**（非机翻先上）。下一回合 A+B+C 以 **en+zh** 为可点完整集；四语不挡该工程开工。

（旧稿「终端用户实质单语言 → 自动化 post-v1」与「C 可 post-v1」**作废**。）

---

## 10. 对发布计划的影响（与上列对齐）

**阻塞 v1（测试 / i18n 面）**

1. 按 §7 把 A（及可选 A′）unit\* **并入** `test:smoke`（可与 i18n A 同批或紧随）  
2. Honesty 真实链：**已确认可用**（§8）  
3. 「永不自动化」清单：**§5**  
4. **i18n A+B+C**（§9.5 已拍板；下一回合做）  
5. **en+zh** 人工抽测（E）；其他语种仅在 `ready` 后加入声称与人工面  

**不阻塞（post-v1 或并行内容轨）**

- Ambient 播放 e2e、Celebrating 动画 e2e、场景 E/F 真实墙钟 DOM  
- **es/ja/de/fr 审校达 ready**（工程槽可先留；声称与选择器露出跟 ready）  

**仍阻塞 v1（产品面 · 非本审计）**：桌面壳打包选型等——见 `PROCESS.md`。
