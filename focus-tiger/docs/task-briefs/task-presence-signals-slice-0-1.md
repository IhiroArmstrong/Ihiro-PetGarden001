# Task Brief · Presence Signals · Slice 0–1 + 4 minimal

> **状态（2026-08-25）**：**开工 Presence Signals**（Slice 0 文档 + Slice 1 Notice 入账 + Slice 4 Confide 只读）。  
> **分支**：`feature/presence-signals-slice-0-1`  
> **对照**：`confidePracticeFacts.js`（Slice 0 练习事实先例）· `YIN_PERSONAL_MEMORY.md`（分桶：Presence ≠ Memory）

---

## 产品拍板（2026-08-25）

| 项 | 决定 |
|---|---|
| 平台 | Web + Electron 同存 `localStorage`（与 PracticeDays 一致） |
| Consent | **写入**封闭 `emotionTag` 不需重型 Consent；**读取/引用 freeText**（Confide L3）须 Consent（后续 Slice） |
| reflections.v1 | **双写**（后续 Slice）；**趋势 SSOT = `presence-signals.v1`** |
| freeText 保留 | 默认 **90** 天，到期剥离 `freeText` 字段（`emotionTag` 保留） |
| 趋势门槛 | 窗口内 tagged 行 **&lt; 3** → 只答「数据不足」，不做趋势描述 |
| 默认窗口 | **14** 个本地自然日（含今天）；`at` ISO + 设备时区边界（`presenceSignalWindowBounds`） |
| Ritual Leave | 已选 chip 可入账，但须**可见弱提示**（Slice 2；本切片仅文档登记） |

---

## 冲突扫描

对照 `SCENARIO_TESTS.md` · 场景 AE（Confide）· Arrival Notice。

| 轴 | 判断 |
|---|---|
| **a. 强度** | Confide 趋势答句比开 Journey Log 更轻；禁止为 Notice 入账弹模态 Consent |
| **b. 人设** | 描述性（「3 次 calm、2 次 stressed」）✅；诊断（「焦虑缓解」）❌ |
| **c. 职责** | `presence-signals` ≠ Journey Log ≠ Yin Memory ≠ `reflections.v1` bundle |

---

## Slice 0（文档）

- `DESIGN.md` · `SHARED_RESOURCES.md` · 本 Brief
- SSOT、保留期、窗口、门槛、Consent 分层

## Slice 1（写入 · Arrival Notice）

- `presenceSignalsGate.js`：`appendArrivalNoticeSignal`
- `ArrivalPracticeUI` → `main.js` 点选即 append
- 封闭词表与 `NOTICE_OPTIONS` id 对齐

## Slice 4 minimal（Confide 只读）

- `confidePresenceFacts.js`：趋势意图 + `buildPresenceTrendReply`
- `ConfideToYinUI`：`data-source=presence_facts`（层 3 之前，同 practice_facts）
- 负例：safety / sad 桶优先；&lt;3 条 insufficient；0 条 none

## 不做（本切片）

- Reflection / Ritual 双写
- 用户查看/删除 UI
- 首次入账非阻塞告知气泡
- freeText Confide L3 引用 / Consent 门闩
- 练习云备份

## 后续 Slice（排期）

| Slice | 内容 |
|---|---|
| 2 | Ritual chip 点选入账 + Leave 弱提示 |
| 3 | Reflection Q1–Q3 分拆双写 |
| 5 | 查看/删除 + 首次告知 |
| 6 | L3 引用 freeText（Consent 挂读取侧） |

---

## 验收

1. Sit → Arrival → Notice 点 Calm → `localStorage['focus-tiger.presence-signals.v1']` 新增 1 条 `arrival_notice` + `emotionTag: calm`
2. Confide：「我情绪这两周改善了吗？」→ `presence_facts`；≥3 条时有描述性 breakdown；&lt;3 条 insufficient
3. 「I feel depressed, has my mood improved?」→ sad 语料，不走 presence_facts
4. `npm run test:smoke` 绿
