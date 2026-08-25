# 「今日算不算练过」语义对照审计

> **状态**：只读审计（2026-08-25）  
> **范围**：Focus Tiger 全项目「今日完成 / 练习 / 入账」相关 Store、写点与读方  
> **结论前置**：**并非**所有功能各用一套互不知情的口径——计时达标、Honesty 补登、微仪式（Breath practice）三条主路径在 `DailyCompletionStore` 与 `PracticeDaysStore` 上**已共用同一写入钩**；真正需要区分的，是**不同 Store 承载的不同产品语义**（庆祝戳、Journey 留痕、留存首次、DORMANT 窗口等），以及**少数路径只写其中一部分**。

---

## 1. 写点总览：谁写、什么条件下写

### 1.1 核心完成账本（今日「算练过」的主口径）

| Store / Key | 模块 | 谁写 | 写入条件 | 今日语义 |
|---|---|---|---|---|
| `focus-tiger.daily-completions.v1` | `DailyCompletionStore` | `HonestyCheckInController.onTimedSessionCompleted`；`_onBreathComplete`；`main.completeMicroRitual` | 计时**达标**；Honesty 呼吸结束记账；微仪式墙钟到点 | `sessions.length > 0` → `hasCompletedToday()` |
| 同上 · `celebrated` 字段 | 同上 | `main.beginSessionCompleteIfNeeded` → `markCelebratedToday` | **仅**计时达标且触发 Celebrating / MilestoneGlow 时 | `hasCelebratedToday()`：当日是否已播完整庆祝舞（与有无完成记录**解耦**） |
| `focus-tiger.practice-days.v1` | `PracticeDaysStore` | `main` 中 `onPracticeDay`（计时/Honesty）；`completeMicroRitual` | 与上表三条路径同步；`markToday(minutes)` 同日累加分钟 | 当日有条目且 `totalMinutes === null \|\| > 0` → 热力图亮格 |
| `focus-tiger.lotus-pond.v1` | `LotusPondStore` | 同上 `onPracticeDay` / `completeMicroRitual` | 同上 | 终身累计分钟（非「今日」布尔，但同钩写入） |

**写入钩位置（`main.js`）**：

- 计时达标：`finishCompletedSession` → `honestyCheckIn.onTimedSessionCompleted` → `recordCompletion` + `onPracticeDay` + `onSessionRecorded`
- Honesty：`HonestyCheckInController._onBreathComplete` → 同上三回调
- 微仪式：`completeMicroRitual` → 直接 `recordCompletion` + `markToday` + 莲花分钟

### 1.2 同会话、不同语义（不按「今日练过」布尔读，但共享完成时刻）

| Store / Key | 模块 | 谁写 | 写入条件 | 语义 |
|---|---|---|---|---|
| `focus-tiger.journey-log.v1` | `journeyLogGate` | `main.commitPendingJourneyDraft`（Reflection 关闭时） | Focus **达标或提前 Rise** 后走 Reflection（含 Skip）；微仪式完成后走 Reflection。**Honesty / RitualFlow 不写** | 按**条**留痕（分钟 + arrive/reflect 标志），非按日布尔 |
| `focus-tiger.focus-session-end.v1` | `FocusSessionEndStore` | `onTimedSessionCompleted`；`onIncompleteSessionEnded` | 计时达标 **或** 提前 Rise 结束。**Honesty 不写** | 最近一次专注**结束**时刻（供 DORMANT 2h 窗口） |
| `focus-tiger.retention-funnel.v1` | `RetentionFunnelStore` | `onSessionRecorded` → `noteSessionComplete` | 生平**首次** `recordCompletion`（计时或 Honesty）。微仪式**不走**此钩 | `first_session_complete` 事件；非「今日」 |
| 同上 · 独立事件 | `main.completeMicroRitual` | 微仪式到点 | `micro_ritual_complete`（可同日多次；不去重） |
| `focus-tiger.focus-coins.v1` | `FocusCoinsStore` | `awardFocusCoins` / `applyBreathPracticeFocusCoinsGrant` | 分 kind 发点（计时 Stay 档、Honesty 档、微仪式 +1 等）；有日 cap | 当日发点池状态，不是「练过」布尔 |
| `focus-tiger.contextual-tea-tip.v1` | `contextualTeaTipGate` | `main.beginSessionCompleteIfNeeded` 后 `tryOffer` | **仅**计时达标（`session-complete` / `milestone`） | 本地日一次请茶气泡，与完成账本无关 |
| `focus-tiger.ritual-completions.v1` | `RitualCompletionStore` | `completeRitualFlow` | 进阶 RitualFlow（Morning 等）完成 | 仪式完成史；**不算**练习日 |
| `focus-tiger.milestone-glow.v1` | `MilestoneGlowStore` | Honesty 完成 / 计时达标前 `claimOffer` | 连续练习日达节点 | 已播里程碑 id；读 streak 来自 `PracticeDaysStore` |

### 1.3 非持久化 / 辅助信号

| 信号 | 位置 | 谁写 | 条件 | 注意 |
|---|---|---|---|---|
| `pendingJourneyDraft` | `main.js` 内存 | `stashPendingJourneyDraft` | Focus 结束（达标或 Rise）；微仪式完成 | Reflection 取消（`sessionEndFlow.cancelPending`）会清空，**不入账** |
| `hasEndedAnySession` | `main.js` 内存 | Rise / Reflection 结束 | 含**未达标 Rise** | **不能**当「练过」；Support Modal 已明确不用此旗 |

---

## 2. 读取方：认什么、是否知道其它写点

| 功能 / 读方 | 认的依据 | 是否知晓其它写点 |
|---|---|---|
| **应用内提醒**（横幅 + 设置面板软提示） | `DailyCompletionStore.hasCompletedToday()` | 注释写明含计时/Honesty/微仪式；**不知** Journey Log / `celebrated` / RitualFlow |
| **本周 7 格热力图** + HUD 连续日圆点 | `PracticeDaysStore.getLastNDays` / `getRingFilled` | **不知** DailyCompletion；与写入钩同步，但 key 分离 |
| **HUD「今日同坐」进度条** | `DailyCompletionStore.getTodayTotalMinutes()` | **不知** PracticeDays；理论上与 `markToday` 分钟同源 |
| **完成反馈**（Celebrating vs SessionComplete） | `DailyCompletionStore.hasCelebratedToday()` | 知 `sessions` 存在但**故意解耦**；Honesty/微仪式不占戳 |
| **Journey Log 面板** | `journey-log.v1` entries | **零耦合** tip/Sanctuary/练习徽章；**不知** DailyCompletion |
| **阿寅 Confide 练习时长问答** | `PracticeDaysStore.getPracticeDayEntries` | 注释写明与 Journey Log 同账本；**不知**今日完成布尔 |
| **Support Modal 请茶优先** | 莲花终身分钟 ∪ 练习日条数（`supportModalLead`） | 显式**不用** DailyCompletion；**不用** `hasEndedAnySession` |
| **芥子须弥纪念印 / 练习徽章 score** | `practiceBadgeAward`（练习日数 + 莲花小时） | 长期 score，非今日 |
| **寅币昨日连续加成** | `practicedYesterday(practiceDaysStore)` | 只读 PracticeDays |
| **留存 `first_session_complete`** | `RetentionFunnelStore` | 仅计时+Honesty 首次；**不含**微仪式 |
| **DORMANT 披毯** | `FocusSessionEndStore` + 仲裁层 | Honesty **不**刷新结束戳 |
| **场景化请茶气泡** | 计时达标触发 | Honesty/微仪式**不**触发 |
| **练习云备份 v1** | 6 key 白名单 | 含 `practice-days` + `journey-log`；**不含** `daily-completions` |

---

## 3. 口径不一致 → 用户可感知后果

以下按**真实代码路径**列出；背景例「提醒说没练、热力图已亮」在**三条主完成路径**上**不应**出现（同钩双写）。若出现，优先查 localStorage 损坏、换日边界、或 QA seed。

### 3.1 跨 Store（设计性分叉）

| 场景 | 用户看到什么 | 根因 |
|---|---|---|
| Honesty 补登成功 | 提醒消失、热力图亮、HUD 分钟增加；Journey Log **无新行** | Journey Log Brief 明确 Honesty 不入账 |
| 仅做进阶 RitualFlow | 热力图不亮、提醒仍可能出、Support 仍 Tea 优先 | RitualFlow 写 `ritual-completions`，不走练习钩 |
| 提前 Rise（未达标）+ 填/跳过 Reflection | Journey Log **有**行（按实际分钟）；提醒仍说「还没同坐」、热力图不亮 | Rise 不写 DailyCompletion/PracticeDays |
| 微仪式完成 | 提醒/热力图/HUD 均算「今日已练」；留存控制台**不会**打 `first_session_complete` | 微仪式走 `micro_ritual_complete` |
| 同日第二次计时达标 | 仍算「今日已练」；第二次起 **SessionComplete** 轻反馈，不再 Celebrating | `celebrated` 与 `sessions` 解耦 |
| Honesty 或微仪式作为当日**第一次**完成 | 无 Celebrating 舞（设计：保留给计时首次达标） | `celebrated` 仅计时路径置戳 |
| 计时达标 | 可能弹场景化请茶；Honesty/微仪式不会 | `contextualTeaTip` 只挂计时完成 |
| 云备份恢复后 | 热力图/Journey 恢复；**提醒「今日已练」状态可能丢失** | 备份含 `practice-days` **不含** `daily-completions` |

### 3.2 同 Store 内子字段

| 场景 | 后果 |
|---|---|
| 当日先 Honesty 再计时达标 | `hasCompletedToday` 已为 true；若尚未 `celebrated`，计时达标仍会 Celebrating |
| 当日先计时 Celebrating 再 Honesty | 第二次完成不再 Celebrating；提醒仍抑制 |

### 3.3 长期 / 分析向（用户通常不直接看到）

| 场景 | 后果 |
|---|---|
| 老用户 `practice-days` 迁移行 `totalMinutes: null` | 热力图亮但 Confide 汇总分钟为「天数-only」文案 |
| `hasEndedAnySession` vs 练习账本 | 仅影响 onboarding 等内部场景；Support Modal 已规避 |

### 3.4 目前**不应**出现的错位（同钩保障）

| 场景 | 说明 |
|---|---|
| 提醒 vs 热力图（计时/Honesty/微仪式完成后） | 两 Store 同钩写入，应一致 |
| HUD 今日分钟 vs 热力图亮格 | 同源分钟；除非只写了单边（代码路径上不应） |

---

## 4. 功能对照表

| 功能 / 文案触点 | 「今日已练 / 已完成」依据 | 与提醒（DailyCompletion）一致？ | 与热力图（PracticeDays）一致？ | 备注 |
|---|---|:---:|:---:|---|
| 应用内提醒横幅 | `hasCompletedToday()` | — | ✅ 三主路径 | 文案：`reminder.practiced_today_note` |
| 提醒设置面板软提示 | 同上 | — | ✅ | 今日已练仍可改时间 |
| 本周热力图 | `PracticeDays` 当日条目 | ✅ | — | `totalMinutes null` 亦亮 |
| HUD 连续 7 点 | `getRingFilled` | ✅ | — | 按连续练习日 |
| HUD 今日同坐条 | `getTodayTotalMinutes()` | ✅ | ✅ | 展示分钟非布尔 |
| Celebrating 舞 | `hasCelebratedToday()` | ❌ 更窄 | ❌ | 仅计时首次达标 |
| Journey Log 列表 | 无「今日」布尔；按条 | ❌ | ❌ | Rise 可入、Honesty 不入 |
| Honesty 补登 toast | 写完即 `hasCompletedToday` | ✅ | ✅ | 无 Journey 行 |
| 微仪式完成 | 同 Honesty 路径写两 Store | ✅ | ✅ | 无 Celebrating；有 Journey（Reflection 后） |
| 提前 Rise | 不算练过 | — | — | Journey 可有行 |
| RitualFlow | 不算练过 | — | — | 独立仪式史 |
| Support 请茶优先 | 终身/历史练习日 | ❌ 终身 | 部分 | 不用今日布尔 |
| Confide「练了多久」 | 历史 `PracticeDays` | ❌ | — | 非今日问题 |
| 寅币发点 | 独立日 cap | 部分 | 部分 | 发点 ≠ 练过 |
| 留存首次完成 | 计时∪Honesty 首次 | 微仪式❌ | — | 分析口径 |
| DORMANT 2h | 最近 Focus **结束** | Honesty❌ | — | 结束 ≠ 完成 |

图例：✅ = 三主路径（计时/Honesty/微仪式）下与列口径一致；❌ = 故意更窄或不同语义。

---

## 5. 是否存在可统一的「基准口径」

### 5.1 候选定义

| 口径 | 定义 | 现网接近度 |
|---|---|---|
| **最广（产品「同坐」）** | 计时达标 **∪** Honesty **∪** 微仪式完成 | **已是** `DailyCompletion.hasCompletedToday()` 与 `PracticeDays.markToday` 的语义；提醒/热力图/HUD 已对齐 |
| **中等（有头有尾留痕）** | 最广 **∪** Journey Log 入账路径（含未达标 Rise） | Journey Log 更宽（Rise）且更窄（无 Honesty）——**不能**直接作单一布尔 |
| **最严（计时达标）** | 仅 `FocusSession.hasReachedTarget()` 完成 | 与诚实机制、微仪式产品定义冲突 |

### 5.2 建议

**产品层 SSOT（只读聚合，不必新 Store）**：

> **「今日已同坐练习」** = `DailyCompletionStore.hasCompletedToday()`  
> （等价于：当日 `PracticeDays` 有练习条目且非纯 0 分钟占位——三主路径下两者同步。）

**应单独命名的子语义（不要混进上面那句）**：

| 子语义 | 建议权威 | 用途 |
|---|---|---|
| 今日是否已 Celebrating | `hasCelebratedToday()` | 动效分级 only |
| 今日是否有 Journey 留痕 | Journey Log 按 `journeyLogDateKey(at)` 过滤 | 回顾叙事 only |
| 今日是否有 Focus 会话结束 | `FocusSessionEndStore` 当日戳 | DORMANT only |
| 生平首次练习完成 | `RetentionFunnelStore` | 分析 only |

若统一用户可见文案「你今天已经练过了」→ **应指最广口径**（已是提醒实现）。需在文案规范中写明：**不含**仅 Rise、**不含**仅 RitualFlow、**不含**仅 Arrival。

### 5.3 若强制统一各功能到最广口径，谁会变、是否合理

| 功能 | 变化 | 合理性评估 |
|---|---|---|
| Journey Log 纳入 Honesty | 列表多行 | ✅ 若产品要「所有诚实练习可追溯」；与 Brief「Honesty 不入」冲突，需产品拍板 |
| Journey Log 排除 Rise | Rise 不再留痕 | ⚠️ 损失「来过但提前结束」叙事 |
| `first_session_complete` 含微仪式 | 分析事件变 | ✅ 若「首次完成」= 任何产品认定练习 |
| 云备份纳入 `daily-completions` | 恢复后提醒状态一致 | ✅ 技术债，建议补第 7 key 或恢复时从 `practice-days` 推导今日布尔 |
| Celebrating 扩到 Honesty/微仪式 | 首次完成即舞 | ❌ 与 `PRINCIPLES` 反馈分级、现有 Honesty 轻反馈冲突 |
| RitualFlow 点亮练习日 | 热力图亮 | ⚠️ 仪式≠同坐；需产品定义 |
| DORMANT 认 Honesty 刷新 2h | 补登后推迟披毯 | ✅ 体验更一致；小改动 |

---

## 6. 是否建议新建统一 Store / 仲裁层

### 6.1 不建议完整「练习仲裁层」（对标精灵通道级）

**理由**：

1. **写入侧已集中**：三主路径在 `main.js` / `HonestyCheckInController` 共用钩，问题主要在**读方语义混用**，不是多入口竞态写坏数据。
2. **子语义本应分离**：Celebrating、Journey、DORMANT、留存并非同一布尔；硬塞进单 Store 会重演 `celebrated` vs `sessions` 式字段膨胀。
3. **精灵通道解决的是运行时互斥**（睡/欢迎/付款抢精灵）；本问题是**产品名词对齐**，复杂度低一个数量级。

### 6.2 建议的轻量方案（若要做）

| 方案 | 内容 | 工作量粗估 |
|---|---|---|
| **A. 文档 SSOT + 注释** | 本文 + `SHARED_RESOURCES` 链入；UI 文案规范引用 | **0.5d**（已完成审计文档） |
| **B. 只读聚合函数** | 如 `resolveTodayPracticeStatus({ now })` 返回 `{ practiced, celebrated, journeyEntryToday, focusEndedToday }` | **1–2d**（纯读、单测、逐步替换读方） |
| **C. 写入编排器** | 单函数 `recordPracticeCompletion({ source, minutes, flags })` 内部分发各 Store | **2–4d**（需回归三路径 + 微仪式 + e2e） |
| **D. 新统一 Store** | 不推荐；迁移双写、备份 schema、历史数据 | **>1w**，且收益低于 B+C |

对比 **精灵通道**（`spriteChannelArbitration`：跨冷启动/visibility/付款/叠层、多模块改、TRACKER 级人工验收）：本任务 **B 档约为精灵通道 10–20% 工程量**；**C 档约 25–35%**；**完整新 Store 更重且无必要**。

### 6.3 优先修复项（若只修用户可感知缝隙）

1. **云备份不含 `daily-completions`** → 恢复后提醒与热力图错位（技术一致性问题）。
2. **文案层**区分「今日已同坐」vs「今日已庆祝」vs「Journey 有记录」——避免运营/翻译混用一句「练过了」。
3. **Journey Log 是否纳入 Honesty**——唯一需产品拍板的功能分歧；代码现状是故意不写。

---

## 7. 完成路径 × 写点矩阵（速查）

| 路径 | DailyCompletion `sessions` | `celebrated` | PracticeDays | Lotus | Journey Log | `first_session` | FocusSessionEnd | 提醒抑制 | 热力图亮 |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 计时达标 | ✅ | ✅ 首次 | ✅ | ✅ | ✅（Reflection 后） | ✅ 首次 | ✅ | ✅ | ✅ |
| Honesty | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ 首次 | ❌ | ✅ | ✅ |
| 微仪式 | ✅ | ❌ | ✅ | ✅ | ✅（Reflection 后） | ❌ | ❌ | ✅ | ✅ |
| 提前 Rise | ❌ | ❌ | ❌ | ❌ | ✅（Reflection 后） | ❌ | ✅ | ❌ | ❌ |
| RitualFlow | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 仅 Arrival / 离开 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 8. 相关权威文档

| 文档 | 关联 |
|---|---|
| `SHARED_RESOURCES.md` §1.1 / §1.2 | DailyCompletion / PracticeDays 字段 |
| `MICRO_RITUAL_PLAN.md` | 微仪式记账与 Celebrating 排除 |
| `RETENTION_FUNNEL.md` | `first_session_complete` vs `micro_ritual_complete` |
| `task-journey-log-d.md` | Journey 写入边界 |
| `task-support-modal-tea-first.md` | Support 不认 DailyCompletion |
| `reminderPreference.js` 文件头 | 提醒认 `hasCompletedToday` |

---

## 9. 产品拍板（2026-08-25）

| 议题 | 决定 |
|---|---|
| Journey Log 纳入 Honesty | **维持现状**（Brief 已定；Honesty 轻量不留痕） |
| 链入 `RULES_INDEX` / `SHARED_RESOURCES` | **已登记** |
| `resolveTodayPracticeStatus()` 只读聚合 | **先不做**（无紧迫改造需求） |
| 下一步 | **方案 A 已合入** `fix/practice-backup-daily-completion-reconcile`（§9.1） |

### 9.1 修复方案：练习云备份恢复后提醒与热力图错位

**状态（2026-08-26）**：**方案 A 已实现** — `practiceBackupDailyCompletionReconcile.js`；`applyPracticeBackupSnapshot` 恢复后调用；单测 `practiceBackupDailyCompletionReconcile.test.js` + `practiceBackupSync` 回归。

**问题复述**：白名单 6 key 含 `practice-days`、**不含** `daily-completions`。用户同日练过后清库/换机恢复 → 热力图亮（`practice-days` 已还原）、提醒仍可能催练（`hasCompletedToday()` 为 false）。

**触发路径**：`applyPracticeBackupSnapshot` → `writePracticeBackupStoresRaw` 只写 6 key；`reminderPreference` 读 `DailyCompletionStore`。

#### 方案 A（已落地）· 恢复时派生，不改 schema

| 项 | 内容 |
|---|---|
| 做法 | 在 `applyPracticeBackupSnapshot`（或紧邻的 `normalizeSnapshotStoresForApply` 之后）增加 `reconcileDailyCompletionAfterRestore(storage, now)`：若 `getLocalDateKey(now)` 在已恢复的 `practice-days.days` 中有条目且 `totalMinutes !== 0`（`null` 视为有练过），且本地 `daily-completions` 当日 `sessions` 为空 → 写入合成态 `{ dateKey, sessions: [{ completedAt: now, durationMinutes: max(1, totalMinutes\|\|1) }], celebrated: false }` |
| 优点 | **零** Worker redeploy；旧 v1 云端快照立刻受益；改动面小（`practiceBackupSync` + 单测） |
| 代价 | `celebrated` / 多段 `sessions` / 真实 `completedAt` **不可从** `practice-days` 还原；极端情况同日第二次计时达标可能再播 Celebrating（可接受） |
| 测试 | 单测：空库 + 含今日 `practice-days` 快照 → restore 后 `hasCompletedToday()===true`；无今日条目 → 仍为 false；已有 `daily-completions` 不覆盖 |
| 工作量 | **≈0.5–1d** |

#### 方案 B（可选二期）· 白名单扩第 7 key + `schemaVersion: 2`

| 项 | 内容 |
|---|---|
| 做法 | `PRACTICE_BACKUP_STORE_KEYS` 增 `focus-tiger.daily-completions.v1`；客户端 `practiceBackupSnapshot.js` + 云端 `practiceBackupKv.ts` 升到 **v2**；解析器 **同时接受 v1（6 key）与 v2（7 key）**；上传一律 v2 |
| 优点 | 完整保留 `sessions[]` + `celebrated`；上传即一致 |
| 代价 | **须 Worker redeploy**；`isPracticeBackupStoreEmpty` / 指纹 / 多处「6 key」断言与文档同步；`focusCoinsAward.test.js` 等硬编码 `length === 6` 改 7 |
| 与 A 关系 | v1 快照恢复仍走 A 派生；v2 快照直写 `daily-completions` |
| 工作量 | **≈1.5–2.5d**（含 cloud 单测 + 文档 + 生产 deploy 口令） |

#### 建议落地顺序

1. ~~**方案 A**~~ **已完成**（`fix/practice-backup-daily-completion-reconcile`）。  
2. 验收：Honesty 完成 → 等 Idle 备份上传 → DEV 清 6 key → 触发空库恢复 → 提醒面板出 `practiced_today_note`、横幅不出。  
3. 若产品要保留 Celebrating 戳跨恢复：**再开** 方案 B，不阻塞 A 上线。

#### 明确不做（本缝隙修复范围内）

- 不把 `lotus-pond` / `focus-coins` / `retention-funnel` 扩进备份（另有产品决策）。  
- 不顺手改 Journey Log / Honesty 边界。  
- 不引入 `resolveTodayPracticeStatus()` 抽象层。

#### 文案跟进（独立小任务，可与 A 并行）

| 触点 | 建议 |
|---|---|
| `reminder.practiced_today_note` | 保持「已同坐」语义（已是） |
| 产品内部 | 文档/评审区分 **已同坐** / **已庆祝（Celebrating）** / **Journey 有留痕** 三句，避免运营混写「练过了」 |

---

*审计方法：静态代码阅读 + `SHARED_RESOURCES` / Brief 交叉。§9 为 2026-08-25 产品拍板与备份缝隙方案。*
