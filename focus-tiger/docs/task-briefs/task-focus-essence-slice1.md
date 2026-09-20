# Task Brief · Focus Essence Slice 1（L0 ledger + store + award helpers）

> **状态**：Slice 1 **已合**（#896）· Slice 2 **实现中**（`main.js` 双写，见 `feature-focus-essence-store-slice2.md`）· **无 UI**  
> **权威**：[`planning/focus-essence-coin-split-audit.md`](../planning/focus-essence-coin-split-audit.md)（PO 2026-09-20 已锁）· `GROWTH_METRICS_CHARTER.md` · `FOCUS_COINS.md`（Coin 侧不动）  
> **性质**：数据模型层 Essence 轨首片；与 Coin **同事件同点数同封顶**；**零用户可见面**  
> **禁止**：Coin↔Essence 兑换 · Essence 消费 SKU · Essence UI/HUD/toast · 改 `evaluateFocusCoinRedeem` · 与 `?focusCoins=0` 共用 gate · 回溯历史 Coin grant

---

## 0. 一句话

新建 **Focus Essence（精進 / Shōjin）** 独立账本与钱包：完成事件与 Coin 同规则累计 `essenceTotal`（只增、不可花）；本轮只落 L0/L1 模块与单测，不接 `main.js` 双写。

---

## 1. 已拍板（勿再开放）

见 `focus-essence-coin-split-audit.md` §7：

| 项 | 锁 |
|---|---|
| 载体 | 独立 `FocusEssenceStore` · key `focus-tiger.focus-essence.v1` |
| EN 外显 | `Focus Essence` |
| JA 外显 | **精進**（しょうじん / Shōjin） |
| 关闸 | 独立 `?focusEssence=0` · `isFocusEssenceAwardEnabled` |
| 历史 | `essenceTotal` **从 0 起**，不回溯 |
| grant 规则 | 首版 = `computeFocusCoinsGrant` 同事件/点数/封顶 |
| Collections | **一行不动** |

---

## 2. 已好清单（开工必守）

- Coin 钱包 / 兑换 / L3 抽屉 / duration hint **行为不变**。  
- `isEntitled` / Tea / Sanctuary / B 轨 **不变**。  
- 莲花池 / practice-score / Journey memories **不**写入 Essence。  
- `markLifetime`（Honesty 睡醒 / activeRecover 旗标）**仅 Coin 侧**；Essence **不**映射 W7。  
- 无新 locale 用户可见 key（内部/registry 可用 EN 名）。

**保护面**：Collections 结缘 · Coin 发点/兑换 · Idle chrome · 完成分流 · 备份 v4 现有 19 key 行为。

---

## 3. 冲突扫描（`SCENARIO_TESTS` 邻接）

| 轴 | 结论 |
|---|---|
| **强度** | 本轮无 UI；registry 标 `presentation-feedback` 预留，不当分数板露出 |
| **人设** | 无用户可见「精进值」文案；内部名 Focus Essence |
| **职责** | Essence 不替代 practice-score / 莲花 / Coin redeem / Journey |

**无冲突** — 纯后端模块，不挂主路径。

---

## 4. Slice 1 范围

| 做 | 不做 |
|---|---|
| `focusEssenceLedger.js` — grant 纯函数（无 redeem） | `main.js` 钩子双写（Slice 2） |
| `FocusEssenceStore.js` — `essenceTotal` 只增持久化 | `localStateKeys` 注册（Slice 3） |
| `focusEssenceAwardGate.js` — 独立 `?focusEssence=0` | backup whitelist（Slice 3） |
| `focusEssenceAward.js` — `applyFocusEssenceGrant` 等 | persona 回归（Slice 3 可首版） |
| L0/L1 单测 · `growthMetricsRegistry` 增 `focus-essence-earn` | UI · i18n 外显 · `window.__focusEssence`（可选，非必须） |

**分支**：`feature/focus-essence-store-slice1`  
**人日**：1–2（熟悉 Coin 轨开发者）

---

## 5. L0 必锁单测（不得拖到 Slice 2）

镜像 `focusCoinsLedger.test.js` grant 子集（**无 redeem 用例**）：

1. 未达标 / unreached timed → 0  
2. Stay 25 → 5；Across tools 25 → 2  
3. Honesty 30 → 3；同日第二次 → 0  
4. 时长池 36 封顶  
5. 昨日练习回声 +3（首笔 qualifying grant）  
6. passive Recover / dormantWake → 0  
7. Arrive / Reflect / activeRecover 会话与日封顶  

**Store / award 附加**：

8. `?focusEssence=0` → 完全不写盘  
9. grant 成功 → `essenceTotal` 增、**无** balance/ownedIds 字段  
10. `activeRecover` grant **不**写 lifetime 类旗标（Coin 专有）

---

## 6. 后台网络 / 点击反馈

**不涉及后台网络** · **不涉及可点击交互**

---

## 7. 文档 / 回归（Slice 1 合入时）

| 必更 |
|---|
| 本 Brief |
| `GROWTH_METRICS_CHARTER.md`（若 registry 行需对照表） |
| `TEST_TRACKER` 碎片 · `docs/tracker-entries/feature-focus-essence-store-slice1.md` |

自动化：`npm run test:smoke`（含新 spec）。

---

## 8. 验收一句话

`node --test src/core/focusEssenceLedger.test.js src/core/focusEssenceAward.test.js` 全绿；`audit:growth-metrics` 见 `focus-essence-earn` 轨；**无** `main.js` diff；Coin 路径零变化。
