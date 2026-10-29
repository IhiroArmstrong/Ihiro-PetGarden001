# Task Brief · 平台阶段 1 · Ritual Recipe（坐的配方）

> **状态（2026-10-29）**：PO 口令「立刻开工」= **A1b**（Default sitting 接开坐；行为 = 现网）+ 设计锁 Deep / ADHD / Evening `promptId` / `soundId`。**不**开 A2 编辑 UI。A1a + A5 骨架已合 #1467。  
> **类**：本刀 **A**（无新可点击控件；Default sitting 行为必须 = 现在）。A2 / A3c / A4 入口 / Privacy 开关属后续 **B** 刀，须另 Brief 或扩本节后再点头。  
> **真源**：[`RITUAL_RECIPE_A1_SPEC.md`](../RITUAL_RECIPE_A1_SPEC.md)（A1 Spec v0.2 薄 schema）。  
> **资源清单 v0**：[`ritual-recipe-asset-catalog-v0.md`](../ritual-recipe-asset-catalog-v0.md)。  
> **埋点看板判读**：[`RITUAL_RECIPE_ANALYTICS.md`](../RITUAL_RECIPE_ANALYTICS.md)。  
> **不是**：配方市场、Health、Slack/Raycast、按段 sound/room、Recover 滑杆、练习备份混桶、Confide / Electron 大任务同 PR。

## 一句话

把「怎么坐」收成一份可校验、可迁移、独立存储的配方；先锁 Default = 改造前行为，并接上默认关闭的埋点事件名。

## 地面真相

1. `TASKS.md` **没有**「坐的配方」条目。功能 PR **不得**改 `TASKS.md` 已有段落（`tasks:check`）；本线进度写 [`task-entries/ritual-recipe-phase1.md`](../task-entries/ritual-recipe-phase1.md)。总表新节须 **单独只改 TASKS.md 的文档 PR**（或先放宽 `assemble-tasks` 的 before 守卫）。  
2. Focus chip 偏好在 `focus-tiger.focus-duration-pref.v1`；氛围乐在 `ambient-pref.v1`（开坐播、Rise 停、**不**写 `enabled:true`）。  
3. Recover 冷却现网 180s 常量；Arrive / Transition / Reflect 步进时长在代码常量，不进 v1 配方。

## 冲突扫描（对照 `SCENARIO_TESTS.md`）

相邻：场景 **T**（Focus chip / Leave）、Ambient 开坐播停、练习备份导入覆盖、Recover 轻触、Five Moments Compass、Privacy 多路 opt-in（漏斗 / T54 / YPE）。

| 轴 | 判断 |
|---|---|
| **a. 强度** | 本刀无新打断、无新叠层。配方不进备份，避免「导入练习把坐法覆盖」比预览采用更重。 |
| **b. 语气** | 无新用户文案。后续付费房间降级句须观察式，不得监工。 |
| **c. 职责** | 配方存储 ≠ 练习备份 JSON、≠ `focus-duration-pref` 写回（chip 本场覆盖待会上锁）、≠ T54/漏斗埋点。Shortcuts 仅官方 `templateId`，不替代 Sit。 |

**结论：无用户路径冲突。** A1b 把 Default 接到开坐，chip / 氛围乐偏好 / Recover 180s 与现网同一结果。

## 范围（in）· 本刀 A1b + 三套模板设计锁

| 序号 | 内容 |
|---|---|
| **A1b** | Default sitting 驱动现网：chip/open 本场覆盖、顶层 `soundId=null` 不改偏好、Recover 180s；开坐发 `recipe_session_started`（仍默认关） |
| **0.3** | 资源清单 v0.1：锁 Deep / ADHD / Evening `promptId` / `soundId`；**不**做选择入口（A4） |

## 明确不做（本刀 + 阶段 1 整条）

- 本刀：**不**加编辑 UI、模板选择入口、导入预览 UI、Privacy 开关、Worker 短链；**不**把 chip 写回配方。  
- 阶段 1：**不做** Health、Slack/Raycast、按段音效/房间、Recover 文案编辑、Arrive/Transition `durationSec`、`skippable`、UGC 广场。

## 开发顺序（一条主链 + 两条并行）

一次 PR 一条线：**不要** A1+A2+A3 同 PR。

| 序号 | 任务 | 估时 | 依赖 |
|---|---|---|---|
| **A1a** | Schema + 校验 + 迁移 + 独立存储 | 1–1.5 周 | spec |
| **A1b** | Default sitting 驱动现网（chip/open、顶层 sound/room、Recover 180s） | 1–1.5 周 | A1a |
| **A1c** | `promptId` → locale/池；未知 → null | 与 A1b 重叠 | 资源清单 v0 |
| **A5** | 埋点事件；默认关 | 3–5 天 | 与 A1a 并行 |
| **A5b** | 服务端 `recipe_share_opened` | 随 A3 | A3b |
| **A4** | 官方 4 模板 | ~1 周 | A1b + 清单 |
| **A2** | 编辑 UI（无 Recover 滑杆） | 2–3 周 | A1 + A4 |
| **A3a** | 文件导入/导出 | ~1 周 | A1a |
| **A3b** | Worker 短链；拒写未知 id；**先 deploy 白名单再发 app** | ~1 周 | A1a + 同源清单 |
| **A3c** | 分享 UI + `editToken` 本地 | 叠 A3b | A3b |
| **B1** | Mac Shortcuts，仅官方 `templateId` | 1–2 周 | A4 + URL 定稿 |

**会上待定（不挡 A1b）：** chip = 本场覆盖不写回配方（本刀已按现网继续写 duration pref）；付费房间降级文案。三套 `promptId` / `soundId` **已设计锁**。

## 用户场景 / 验收叙事

**阶段 1 定位：** 开放「坐的配方」配置与官方模板、文件/链接分享、Mac Shortcuts；**不**开放配方市场。核心路径仍是 **开坐 → 各段引导 → 结束 / Recover**。

**范围外（本线不做）：** Apple Health、Slack/Raycast、按段 sound/room、Recover 滑杆（冷却仍为 180s 常量）；Arrive / Transition / Reflect 仍为代码常量。

### 主链 · 用户能感知什么

| 交付 | 用户侧变化 | 验收叙事（一句话） |
|------|------------|-------------------|
| **A1a** | 无新界面 | 存储与校验就绪；Default 行为未变。 |
| **A1b** | 仍像现网 Default 坐 | **Default sitting = 改造前行为**（Focus 默认 chip/open、整场 sound/room、开坐播 / Rise 停、Recover 180s）。 |
| **A1c** | 无单独入口 | 模板/编辑所选 `promptId` 映射到现有 locale/池；未知 id → null，不裸崩。 |
| **A4** | Settings/Compass（或等价入口）**选官方模板** | Default / Deep / ADHD / Evening 开坐时按模板跑 Focus 模式与时长、引导语、整场 sound/room；Default 与现网一致。 |
| **A2** | **编辑「我的配方」**（本地独立存储，不进练习备份） | 可改 Focus 模式/分钟、各段 `promptId`、整场 sound/room；逐段/整份恢复默认；**无** Recover 滑杆。 |
| **A3a** | **导出 / 导入 JSON** | 小 JSON + 预览/采用（§7）；未知 id 拒写或与 Worker 白名单一致降级。 |
| **A3b–c** | **创建分享链**、对方打开并导入 | 短链 GET 计数；创建方本地存 `editToken`；**先 deploy 白名单再发 app**。 |
| **B1** | **Mac Shortcuts** | `focus-tiger://app?…` 按 **官方 `templateId` 仅** 开坐，无需先进 App 再点 Compass。 |

**会上待定、不挡 A1 代码、需在 A2/A3 前收口：**

- 开表 **chip** = 本场覆盖、**不写回**配方（若已定）。
- **付费 room** 降级统一文案。
- Deep / ADHD / Evening 的 `promptId` / `soundId`（Default 先映射现网；资源清单 v0 白名单）。

### 典型用户故事（按 persona）

1. **老用户 / 不折腾** — 不选模板、不编辑 → 体验与现网 **Default 坐** 相同（A1b 硬承诺）。
2. **换氛围** — 选 **Deep / ADHD / Evening** 再开坐（A4）。
3. **微调** — 改 Focus、引导语、整场 sound/room，改乱可恢复默认（A2）；可选：开坐前 chip **仅本场** 覆盖（交互定稿后写入验收）。
4. **传播坐法** — 导出 JSON 或发 **短链**，对方导入/打开；**无** 公开市场浏览（A3）。
5. **Mac 重度** — Shortcuts 一键 **官方模板开坐**（B1）。

### 并行轨 · 用户是否「看见」

| 交付 | 用户侧 |
|------|--------|
| **A5 埋点** | 默认关；opt-in 后仅多 **匿名使用统计** 类开关（§9 事件）。无新 sitting 功能。本刀只接门闩，**不加** Privacy 开关。 |
| **资源清单 v0** | 编辑/模板下拉仅在白名单内；未部署 id 回退/null（A1c）。 |
| **上线前** | `PRIVACY_NOTICE.md`：分享、限速 IP、埋点 opt-in（与 A3/A5 一致）。本刀不改隐私声明正文。 |

### 里程碑 · 对外可说的「多看到什么」

| 节点 | 全体用户 | 内测 / 灰度 |
|------|----------|-------------|
| W2 | 基本无 | A1a + 埋点事件名/方案落地 |
| W4–5 | 仍 Default 观感 | Default 对照现网；**文件导入/导出** |
| W6–7 | **四模板 + 最小编辑** | **分享短链** |
| W8–9 | **Mac Shortcuts（官方模板）** | 小范围灰度：`source` / 分享 / `recipe_edited` |
| 上线前 | 隐私说明可见 | 同左 |

### 与 §13 / 任务映射（验收勾选用）

- **A1 完成：** §13 + 「Default sitting = 改造前行为」。
- **A4 完成：** 四套官方模板可选且开坐行为可区分；Default 不变。
- **A2 完成：** 编辑项与 spec 一致；恢复默认可用；无 Recover 滑杆。
- **A3 完成：** 导入/导出/分享链 + 预览/采用 + 未知 id 策略 + 分享打开计数。
- **B1 完成：** Shortcuts 仅官方 `templateId`；URL 参数与文档一致。
- **A5 完成：** §9 事件、默认关、opt-in；看板文档含 opt-in 偏差说明。本刀完成事件名 + 门闩单测；Privacy 开关与上送另刀。

## 变体矩阵

本次不新增练习种类、商品类型、宽窄视口分叉或多语言入口差异，变体矩阵跳过。

## 点击反馈（0–1 秒）

本次无可点击交互改动，点击反馈节跳过。

## 边缘状态

本次不触及可点击、付款或练习结束路径，边缘状态跳过。A1a 校验边角见 spec §5（体积、版本、废弃字段、Recover 迁移）由单测覆盖。

## 共用机制核对

本次不触及 overlayBusy / HUD 呼吸驱动 / z≥17 遮罩 / 新建可点击叠层，核对跳过。

存储：新增 `focus-tiger.ritual-recipe.v1` 与 `focus-tiger.ritual-recipe-analytics-opt-in.v1`；**禁止**写入练习备份白名单；DEV 重置须清。

## 后台网络

不涉及后台网络。A3b Worker 另刀。`recipe_share_opened` 为服务端 GET 计数，不依赖埋点 opt-in。

## 验收（本刀）

- `node --test src/core/ritualRecipe/*.test.js src/audio/sittingAudioWiring.test.js src/core/MindfulReminderController.test.js` 绿  
- Default sitting = 改造前：10 分默认、chip 写 duration pref 不写配方、`soundId=null` 走现网开坐播、Recover 180s  
- Evening 与 Default 同分，靠 `dreamland` + evening prompt 区分；ADHD 全段 prompt null + `rain`  
- 埋点：未 opt-in 时开坐不上送 `recipe_session_started`

## 保护面

不改 chip 写盘目标（仍 `focus-duration-pref`）、Ambient `enabled` 持久化、练习备份 schema、Privacy sheet、Confide。不新增可点击入口。
