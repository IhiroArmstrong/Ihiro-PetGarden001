# Task Brief · Presence Signals · Slice 0–1 + 4 minimal + 5 disclosure

> **状态（2026-08-25）**：**开工 Presence Signals**（含 Slice 5 披露，与 #435 同支合入）。  
> **分支**：`feature/presence-signals-slice-0-1`  
> **排期（拍板）**：**5 → 3 → 2**（披露 → Reflection 双写 → Ritual + Leave 提示）

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

| 顺序 | Slice | 内容 |
|---|---|---|
| 1 | **3** | Reflection Q1–Q3 分拆双写；reflections freeText 90 天对齐 |
| 2 | **2** | Ritual chip 入账 + Leave 弱提示（须先过交互稿） |
| 3 | **6** | 查看/删除 UI + freeText L3 Consent |

### Slice 3 前置确认

1. `reflections.v1` freeText 保留与 presence-signals **同为 90 天**
2. 趋势样本只计 `emotionTag`；Q2 纯 freeText **不**抬高 `totalTagged`

---

## 验收（含 Slice 5）

1. 清 `presence-signals-disclosure-seen.v1` → 首次 Notice 点选 → 观察句下见披露行 → 第二次不再出现
2. 其余见原 Brief 验收项
3. 单测：恰好 3 条触发 breakdown；23:58 本地日边界
