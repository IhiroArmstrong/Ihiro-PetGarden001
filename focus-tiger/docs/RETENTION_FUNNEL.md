# RETENTION_FUNNEL.md — 留存故事（漏斗节点骨架）

创建日期：2026-07-22  
最近代码核对：2026-07-22（骨架 + 本地 `console.log` 埋点占位；**未**接第三方分析）

**权威路径**：`focus-tiger/docs/RETENTION_FUNNEL.md`

定位：这份文档和 `SCENARIO_TESTS.md` / `TEST_TRACKER.md` 不是替代关系——

| 文档 | 层级 |
|---|---|
| `TEST_TRACKER.md` | 每个功能点单独验收 |
| `SCENARIO_TESTS.md` | 把功能点串成一次真实使用故事（操作剧本） |
| **本文档** | 把「第一次打开 → 首次完成 → 次日/多日回访 → 惰性桥接」串成**留存漏斗故事**；节点即待观测事件 |

建议一起用：走完一个留存故事后，对照下方事件是否在控制台出现 `[RetentionTelemetry]` 日志（占位阶段）；正式分析工具选定后再替换 sink，**勿**在业务里散落第三方 SDK 调用。

**重要提示**：下列事件默认状态为 **待埋点 / 占位已接**（见各行「实现」列）。占位只做本地 `console.log`，不上传、不改变任何用户可见 UI。走到「未接线」节点时看不到日志 = 已知缺口，不要当新 bug。

**自动化**：占位逻辑单测见 `src/core/RetentionTelemetry.test.js`（并入常规 `npm test`）。**不**要求人工在 UI 上验收埋点本身；正式接入第三方后另开任务。

---

## 用哪个链接测？（占位日志）

| 链接 | 用途 |
|---|---|
| [http://localhost:5173/?product=1](http://localhost:5173/?product=1) | 产品壳；打开 DevTools → Console，过滤 `RetentionTelemetry` |
| [http://localhost:5173/](http://localhost:5173/) | 实验室同样会打日志；DEV「重置全部本地状态」会清掉留存戳（见 `SHARED_RESOURCES`） |

演示会话时长：`DEMO_SESSION_MINUTES = 1`（便于走到「首次完成」）。

---

## 漏斗故事骨架（关键节点）

> 下列节点按用户生命周期大致排序。**不必一次走完**；每节点可单独对照。

### R0 · 首次打开 — `app_first_open`

| 字段 | 说明 |
|---|---|
| 事件名 | `app_first_open` |
| 触发语义 | 安装后**第一次**进入 App（本机尚无留存戳） |
| 建议 payload | `{ firstOpenAt: number }`（epoch ms） |
| 实现 | **占位已接**：`RetentionFunnelStore.noteAppOpen()` ← `main.js` 启动（`onAppReady` 附近） |
| 状态 | 待正式分析工具 |

**人工对照（可选）**：清空 `focus-tiger.*` localStorage 后刷新 → 应见一次 `app_first_open`；再刷新 → **不应**再打该事件。

---

### R1 · 首次完成 — `first_session_complete`

| 字段 | 说明 |
|---|---|
| 事件名 | `first_session_complete` |
| 触发语义 | 用户**生平第一次**写入完成记录（计时达标 **或** Honesty 补登，同一 `DailyCompletionStore`） |
| 建议 payload | `{ secondsSinceFirstOpen: number, durationMinutes: number }` |
| 实现 | **占位已接**：`HonestyCheckInController` 在 `recordCompletion` 成功后调用 `noteSessionComplete`（计时路径 `onTimedSessionCompleted` / 补登路径 `_onBreathComplete`） |
| 状态 | 待正式分析工具 |

**人工对照（可选）**：全新用户 → 走完一场达标（或 Honesty 补登）→ 见一次带 `secondsSinceFirstOpen` 的日志；同日/跨日再完成 → **不应**再打。

---

### R2 · 次日回访 — `day1_return`

| 字段 | 说明 |
|---|---|
| 事件名 | `day1_return` |
| 触发语义 | 相对 `app_first_open` 的本地自然日，**第 1 个完整日后**的某一天首次打开 |
| 建议 payload | `{ daysSinceFirstOpen: 1, firstOpenDateKey: string, openDateKey: string }` |
| 实现 | **占位已接**：每次 `noteAppOpen()` 按日历差判定；每个 dayN **至多打一次** |
| 状态 | 待正式分析工具 |

---

### R3 · 多日回访 — `day3_return` / `day7_return` / `day30_return`

| 字段 | 说明 |
|---|---|
| 事件名 | `day3_return` · `day7_return` · `day30_return` |
| 触发语义 | 相对首次打开，本地自然日差 ≥ 3 / 7 / 30 且该档尚未打过时，在打开时各打一次 |
| 建议 payload | `{ daysSinceFirstOpen: number, firstOpenDateKey: string, openDateKey: string }` |
| 实现 | **占位已接**：同 `noteAppOpen()` |
| 状态 | 待正式分析工具 |

> **口径备注（待产品拍板）**：当前占位采用「打开时若 `daysSinceFirstOpen >= N` 且该档未打过 → 打 `dayN_return`」（迟到打开仍计入该档）。若日后改为「必须恰好在第 N 天打开才算」，改 `RetentionFunnelStore` 判定即可，本文档同步改口径。

---

### R4 · 场景 D 惰性桥接 — `dormant_bridge_shown` / `dormant_bridge_accepted`

| 字段 | 说明 |
|---|---|
| 事件名 | `dormant_bridge_shown` · `dormant_bridge_accepted` |
| 触发语义 | Honesty 补登结束后桥接 CTA **展示** / 用户点 **Yes**（接受 → 完整 Arrival） |
| 建议 payload | shown：`{}`（可后续加 source）；accepted：`{}` |
| 实现 | **占位已接**：`HonestyBridgeCtaController._reveal` / `_answer(true)` 经可选 `trackEvent` |
| 对照剧本 | `SCENARIO_TESTS.md` 场景 D · `HONESTY_BRIDGE_CTA.md` |
| 状态 | 待正式分析工具 |

**未埋（有意）**：`dormant_bridge_declined`（No）— 本骨架未列；若产品要拒答率，另开任务。

---

## 实现落点清单（插入点 · 2026-07-22）

| 事件 | 建议插入点（模块 / 时机） | 本次 |
|---|---|---|
| `app_first_open` | `main.js` App 就绪（`honestyCheckIn.onAppReady()` 前后） | ✅ 占位 |
| `day1/3/7/30_return` | 同上，每次冷/热启动 `noteAppOpen` | ✅ 占位 |
| `first_session_complete` | `HonestyCheckInController`：计时达标 `onTimedSessionCompleted`；Honesty `_onBreathComplete`（二者均已 `recordCompletion`） | ✅ 占位 |
| （备选，未用） | `DailyCompletionStore.recordCompletion` 内部 — 更集中但会耦合 Store↔遥测；测试注入更重 | ⏭ 未接 |
| `dormant_bridge_shown` | `HonestyBridgeCtaController._reveal` | ✅ 占位 |
| `dormant_bridge_accepted` | `HonestyBridgeCtaController._answer(true)` | ✅ 占位 |

Sink：`src/core/RetentionTelemetry.js` → `trackRetentionEvent` → **仅** `console.log('[RetentionTelemetry]', …)`。  
持久化：`focus-tiger.retention-funnel.v1`（首次打开戳、已打 dayN / first_session 标记）；纳入 DEV 一键重置白名单。

---

## 与场景故事的交叉引用

| 留存节点 | 操作故事 |
|---|---|
| R0–R1 | 场景 A（全新用户 → 当日首次达标） |
| R4 | 场景 D / N（Honesty 补登 → 桥接 Yes/No） |
| R2–R3 | 尚无独立场景剧本；测回访须拨时钟或跨日真机 |

---

## 明确排除（本骨架不做）

- 不新增任何用户可见 UI / 调试面板按钮。
- 不接入 Amplitude / PostHog / GA / Cloudflare Analytics 等第三方。
- 不把留存事件写进情绪主线或改变 DORMANT / Honesty 产品语义。
- 不把「单元测试通过」当成「留存漏斗已产品验收」。

---

## 下一步（待拍板后再做）

1. 选定分析工具 → 把 `trackRetentionEvent` 的 sink 换成正式 SDK（保持事件名稳定）。
2. 是否补 `dormant_bridge_declined`、是否改 dayN「恰好第 N 天」口径。
3. 是否在 `SCENARIO_TESTS` 增补「跨日回访」故事 R（与本文档对齐）。
