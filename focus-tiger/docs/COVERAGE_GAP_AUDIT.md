# 功能 vs 测试覆盖 · 缺口审计

创建日期：2026-07-30  
权威路径：`focus-tiger/docs/COVERAGE_GAP_AUDIT.md`  
互补文档：`TEST_TRACKER.md`（逐功能验收）· `SCENARIO_TESTS.md`（用户故事剧本）· `DEV_WORKFLOW_QUALITY.md` §6.1（覆盖分层）

**用途**：审计「有没有完全没有自动化的功能模块」——不只是确认现有脚本能跑。  
近几轮工作重点是 CI 基建与 flaky；**全绿 ≠ 产品功能都有对应测试**。

**维护**：补上表内缺口（实现 Task 2/3 或扩 smoke）后，同回合更新本文件对应行；重大重排时同步 `TEST_TRACKER` §C。

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
| **3** | **扩 smoke** | 把其余关键 `unit*` 提升进 `test:smoke`：Emotion 优先级、Ambient 停音契约（AcrossTools 已随 Task 2 入烟） | 防 PR 冒烟漏跑 |
| **可选** | — | e2e Rise 后再点 hint 回流 DOM（smoke J 目前只锁纯函数） | 场景 J |
| **不做** | — | 见下方「永不自动化 / 人工锁」 | — |

**优先级理由（简）**：Task 3 补最大产品故事洞；Task 2 成本低且不依赖墙钟；扩 smoke 成本最低，但应在 Task 2/3 排期明确后做，避免只堆基建文件名、不补故事。

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
