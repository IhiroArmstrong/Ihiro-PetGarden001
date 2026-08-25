# Task Brief · Presence Signals · Slice 0–1 + 4 minimal + 5 disclosure

> **状态（2026-08-26）**：Slice 0–1 + 4 + 5 已合；Slice 3 已合（#436）；Slice 2 已合（#441）。  
> **排期（拍板）**：**5 → 3 → 2 → 6**（披露 → Reflection 双写 → Ritual 回顾 → 查看/删除面板）

---

## 产品拍板（2026-08-25）

| 项 | 决定 |
|---|---|
| 平台 | Web + Electron 同存 `localStorage` |
| Consent | 写入 `emotionTag` 不需重型 Consent；**freeText 被 L3 读取**须 Consent（Slice 6） |
| reflections.v1 | 双写（Slice 3）；**趋势 SSOT = `presence-signals.v1`** |
| freeText 保留 | **90** 天（presence-signals 与 reflections 须对齐，Slice 3 前确认） |
| 趋势门槛 | 窗口内 **tagged** 行 &lt; 3 → insufficient；**freeText-only 不计入样本** |
| 默认窗口 | **14** 本地自然日（`presenceSignalWindowBounds`） |
| 披露 | 首次 Notice 入账：Arrival 观察句下非阻塞一行（一生一次） |

---

## 已合入本支（#435）

- Slice 0 文档 · Slice 1 Notice 入账 · Slice 4 Confide `presence_facts`
- **Slice 5**：`presence-signals-disclosure-seen.v1` + Arrival 首次披露行

## 后续 Slice

| 顺序 | Slice | 内容 | 状态 |
|---|---|---|---|
| 1 | **3** | Reflection Q1–Q3 分拆双写；reflections freeText 90 天对齐 | **已合** #436 |
| 2 | **2** | Ritual chip 入账 + Leave 事后回顾（方案 C） | **已合** #441 · `task-presence-signals-slice-2.md` |
| 3 | **6** | 查看/删除 UI + freeText L3 Consent | Ritual 之后 |

### Slice 6 前置条件（面板 Slice 开工前须满足）

1. **双写联动删除**：一次 Reflection 会话产生 1 条 `reflections.v1` bundle + 最多 3 条 `presence-signals`（`reflection_q1`…`q3`）。用户在面板点「删除这条记录」时，**两侧须一并删除**（写入时保留 bundle ↔ signal 关联 id，或按会话时间戳批量匹配）。只删 presence-signals 或只删 reflections = 删除承诺未兑现。
2. freeText 被 L3 读取前须 Consent（见上表 Consent 行）。
3. **localStorage 全量容量快照**：Slice 6 开工前须做一次 DevTools → Application → Local Storage 全 key 体积核实（估算见 Slice 3 Brief §后续跟进）。

### Slice 3 前置确认（已满足）

1. `reflections.v1` freeText 保留与 presence-signals **同为 90 天**
2. 趋势样本只计 `emotionTag`；Q2 纯 freeText **不**抬高 `totalTagged`

---

## 验收（含 Slice 5）

1. 清 `presence-signals-disclosure-seen.v1` → 首次 Notice 点选 → 观察句下见披露行 → 第二次不再出现
2. 其余见原 Brief 验收项
3. 单测：恰好 3 条触发 breakdown；23:58 本地日边界
