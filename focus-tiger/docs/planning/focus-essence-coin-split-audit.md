# Focus Essence × Focus Coin 数据模型拆分 · 只读审计与方案

> **状态**：方向锁（2026-09-20 · PO 拍板外显名/关闸/迁移）· **无运行时**  
> **范围**：数据模型层概念分离；**不做** Coin↔Essence 兑换比例；**不改**免费/付费逻辑；**不改** Collections 结缘流程  
> **权威邻接**：`FOCUS_COINS.md` · `GROWTH_METRICS_CHARTER.md` · `practice-aggregate-registry.md` · `SHARED_RESOURCES.md`

---

## 0. 大白话结论（给 PO）

现在「练完一场」只会往**一个可花余额**里加点，花点买清供时余额会减少——**花掉的部分在数据里就「消失」了**，没有单独的「成长积累」账本。

本方案建议：**新建独立 `FocusEssenceStore`**，与现有 `FocusCoinsStore` 并列；同一批完成钩子**双写**——成长归 Essence（只增、不可花）、消费归 Coin（可花余额）。本轮**不做任何 UI**，Collections 兑换逻辑**一行不动**。

---

## 1. 背景与目标

| 概念 | 语义 | 可否直接消费 |
|---|---|---|
| **Focus Coin（寅币 / 寅コイン）** | 可花余额，用于 Yin's Collections 结缘 | ✅ 可花 |
| **Focus Essence（精進 / Shōjin）** | 练习与仪式带来的成长积累，**不可直接消费** | ❌ 不可花 |

**本轮硬边界**：

- 不设计 Coin ↔ Essence 兑换比例或互转 API  
- 不改变 `isEntitled` / Tea / Sanctuary / B 轨逻辑  
- 不改变 `evaluateFocusCoinRedeem` / 清供 8 SKU / 价格 / 门槛  
- 不新增 Essence 的产品面展示（无 HUD、无抽屉、无 toast）

---

## 2. 现状审计：Focus Coin 数据模型

### 2.1 持久化形态

| 项 | 值 |
|---|---|
| **Storage key** | `focus-tiger.focus-coins.v1` |
| **Store 类** | `src/core/focusCoinsStore.js` → `FocusCoinsStore` |
| **备份** | Practice backup v4+ whitelist（`practiceBackupLocalIo.js` · `localBackupStorageRegistry.js`） |
| **清空** | `localStateKeys.js` → `clearAllFocusTigerLocalState()` |

**Wallet 字段（`emptyFocusCoinsWallet`）**：

```text
{
  balance: number,           // 可花余额（redeem 会减）
  ownedIds: string[],        // 已结缘 SKU（只增不减）
  equippedTitle: string|null,
  lifetimeMarks: {           // 兑换门槛旗标（honestyWake / activeRecover）
    honestyWake: boolean,
    activeRecover: boolean
  },
  dateKey: string,           // 本地自然日（日状态滚动）
  day: FocusCoinsDayState,   // 日封顶池：duration / honesty / ritual / echo
  session: FocusCoinsSessionState  // 单场旗标：arrive / reflect / activeRecover
}
```

**关键观察**：`balance` 同时承担「赚取」与「可消费」——redeem 后余额下降，**历史上赚了多少**在钱包里没有单调累计字段。产品文档 `FOCUS_COINS.md` §7 把「标记（徽章）」与「货币（钱包）」分成两层，但**货币层本身没有「终身赚取量」与「当前余额」的拆分**。

### 2.2 纯函数账本（L0）

| 模块 | 职责 |
|---|---|
| `focusCoinsLedger.js` | `computeFocusCoinsGrant` · `evaluateFocusCoinRedeem` · SKU catalog · 日封顶常量 |
| `focusCoinsAward.js` | `applyFocusCoinsGrant` · `applyBreathPracticeFocusCoinsGrant` · `maybeResetFocusCoinsSession` |
| `focusCoinsRedeem.js` | `buildFocusCoinRedeemContext` · `applyFocusCoinsRedeem` · `applyFocusCoinsEquipTitle` |
| `focusCoinsAwardGate.js` | `isFocusCoinsAwardEnabled` · `?focusCoins=0` 关闸 |
| `focusCoinsCosmetics.js` | `ownedIds` → `documentElement` data 属性（珍藏周边，非序列帧） |
| `focusCoinsSurface.js` | L3 面板行状态 / 缺口句（balance · ownedIds · aggregate 门槛） |

**发点公式 SSOT**：`focusCoinsL0.v1`（`growthMetricsRegistry.js` · id `focus-coins-earn`）

- Stay 5 分 = 1 点；Across/Honesty 10 分 = 1 点  
- 仪式：Arrive +2 · Reflect +2 · 主动 Recover +1 · 微仪式 +1  
- 同坐回声：昨日有练习 → 当日首次合格发点再 +3  
- 日封顶：时长 36 / Honesty 3 / 仪式 12 / 合计 48  

### 2.3 写入点（发点 / 消费 / 旗标）

全部经 `main.js` 单例 `focusCoinsStore`，flag 关则 `applyFocusCoinsGrant` 早退、**完全不写盘**。

| # | 触发路径 | 函数 / kind | 写入字段 |
|---|---|---|---|
| W1 | 计时达标完成 | `awardFocusCoins({ kind: TIMED, ... })` | `balance↑` · `day` · `session` |
| W2 | Reflection 达标 | `awardFocusCoins({ kind: REFLECT })` | 同上 |
| W3 | Arrival Choose 落库 | `awardFocusCoins({ kind: ARRIVE })` | 同上 |
| W4 | Honesty 呼吸成功 | `awardFocusCoins({ kind: HONESTY, durationMinutes })` | 同上 |
| W5 | 主动 Recover 成功 | `awardFocusCoins({ kind: ACTIVE_RECOVER })` | `balance↑` · `lifetimeMarks.activeRecover` |
| W6 | Breath 坐满 | `applyBreathPracticeFocusCoinsGrant` | TIMED + MICRO_RITUAL 两次 grant |
| W7 | Honesty 睡醒 | `focusCoinsStore.markLifetime({ honestyWake: true })` | **仅** `lifetimeMarks`（不发点） |
| W8 | 新 Sit / Arrival 轮次 | `resetFocusCoinsSession()` | **仅** `session` 清零 |
| W9 | Collections 结缘 | `applyFocusCoinsRedeem` → `commitRedeem` | `balance↓` · `ownedIds↑` |
| W10 | 佩戴称号 | `applyFocusCoinsEquipTitle` → `equipTitle` | `equippedTitle` |
| W11 | 练习备份导入 | `focusCoinsStore.reloadFromStorage()` | 全量重读 |

**实验室**：`window.__focusCoins.redeem` / `equipTitle` / `getBalance` / `getSnapshot`（`main.js`）。

### 2.4 读取点（UI / 门槛 / 治理）

| # | 消费者 | 读取字段 | 用途 |
|---|---|---|---|
| R1 | `FocusCoinsPanelUI.js` | `balance` · `ownedIds` · redeem context | L3 珍藏抽屉 |
| R2 | `focusCoinsSurface.js` | `balance` · `ownedIds` + aggregate | SKU 可兑 / 缺口句 |
| R3 | `focusCoinsCosmetics.js` | `ownedIds` · `equippedTitle` | DOM 周边（非主屏序列） |
| R4 | `idleChromeOrchestration.js` | `isFocusCoinsAwardEnabled()` | ⋯ 菜单「阿寅的珍藏」行显隐 |
| R5 | `focusCoinsDurationHint.js` | gate only | Focus/Breath 时长 chip 下静默 hint |
| R6 | `focusCoinsRedeem.js` | `balance` · `ownedIds` · `lifetimeMarks` + **aggregate** | 兑换评估 |
| R7 | `practiceBackup/*` | 整包 wallet JSON | 导出 / 导入 / 校验 |
| R8 | `growthPersonaRegression.js` | ledger 纯函数 | persona 夹具（`focus-coins-earn`） |
| R9 | `focusCoinsPersonaRegression.js` | 同上 | 5 条 coin earn persona |
| R10 | `EmotionController` / Collections wave | 间接（owned / gate） | 挥手点播等 |

**兑换门槛的「成长」来源**（非 Coin 余额）：

- `resolvePracticeAggregate()` → `lifetimeMinutes` · `practiceDayCount` · `score`（来自 `LotusPondStore` + `PracticeDaysStore`）  
- `lotusPondStore.getVisibleBloomCount()` → 莲花门槛  
- `lifetimeMarks` → Honesty 睡醒 / 主动 Recover 旗标  

即：**SKU 门槛已经用 Garden 轨 aggregate，不用 Coin 余额当成长分**——这与 Essence 新轨不冲突。

### 2.5 与邻近「成长」轨的关系（避免重复造轮子）

`GROWTH_METRICS_CHARTER.md` 已定义多轨：

| 轨 | 代表 | 与 Coin 关系 |
|---|---|---|
| **Garden 自动** | 莲花池 · 练习徽章 · 芥子印 | 永不经 Coin；分钟/分数驱动 |
| **Collections 结缘** | 清供 8 · `balance` 消费 | 本任务 Coin 侧 |
| **Session 反馈** | Celebrating · MilestoneGlow | 非累计分 |
| **Journey 意义层** | `journeyPracticeMemory` | 呈现用；**非** scoreFormula 消费者 |

**现状缺口**：完成钩子发点时，**可花余额**与**「我做了多少成长行为」的单调累计**共用一个 `balance`，花点后成长叙事在数据上不可追溯。

---

## 3. 候选 Essence 载体对比

### 3.1 方案 A — 复用 Journey Log（`focus-tiger.journey-log.v1`）

| 维度 | 评估 |
|---|---|
| 存什么 | 会话行 + `memories[]` 里程碑 + `sourcesSeen[]` |
| 优点 | 已有「见证/记忆」语义 |
| 缺点 | **非**数值累计账本；Arrival/Honesty 等路径覆盖不全；`YIN_EVOLUTION.md` 明确 **no scoreFormula consumer**；把 Essence 塞进 Journey 会污染叙事层 |
| 结论 | ❌ **不推荐** |

### 3.2 方案 B — 复用 PracticeDaysStore（`focus-tiger.practice-days.v1`）

| 维度 | 评估 |
|---|---|
| 存什么 | 90 天滚动 `{ date, totalMinutes }` |
| 优点 | 已是练习「出现」SSOT |
| 缺点 | **90 天窗口**非终身声誉；不含 Arrive/Reflect/Recover **仪式点**；与 Coin 发点事件集 **不对齐** |
| 结论 | ❌ **不推荐**（可作 Essence **辅助输入**，不作主载体） |

### 3.3 方案 C — 复用 LotusPondStore（`focus-tiger.lotus-pond.v1`）

| 维度 | 评估 |
|---|---|
| 存什么 | `lifetimeMinutes`（终身单调）+ score Eligible 变体 |
| 优点 | 终身单调；已是 Garden 成长核心 |
| 缺点 | **仅分钟**；不含仪式/回声/Honesty 半额等 Coin 事件维度；`FOCUS_COINS.md` §1.1 **花园 vs 珍藏**硬切——把「声誉值」写入莲花池易被误读为「花园轨」 |
| 结论 | ❌ **不推荐** |

### 3.4 方案 D — 在 FocusCoinsStore 内加字段（如 `lifetimeGranted`）

| 维度 | 评估 |
|---|---|
| 做法 | 同 key 增加 `essenceTotal`，grant 时 `balance` 与 `essenceTotal` 同步 `+N`，redeem 只减 `balance` |
| 优点 | 改动面小；日/会话防刷状态可复用 |
| 缺点 | **同一 JSON / 同一 Store 类**——概念上仍耦在「币钱包」；备份/治理/未来 Essence 独立公式时难拆 |
| 结论 | ⚠️ **可行但次优**（若极端追求最小 diff 可选） |

### 3.5 方案 E — 新建 `FocusEssenceStore`（推荐）

| 维度 | 评估 |
|---|---|
| Storage key（建议） | `focus-tiger.focus-essence.v1` |
| 做法 | 独立 store + 独立 ledger 模块；与 Coin **共享事件源、共享防刷日/会话状态（可抽取共享层）** |
| 优点 | 数据模型层**真正两概念**；`growthMetricsRegistry` 可增 `focus-essence-earn` 轨；UI/备份/flag 可分别演进；redeem **零触碰** |
| 缺点 | 多一个 key；grant 钩子需双写（或统一 `applyPracticeReward` 编排） |
| 结论 | ✅ **推荐** |

---

## 4. 三项决策建议

### 4.1 Essence 数据来源 → **方案 E：新建 `FocusEssenceStore`**

**我认为最合理的**：独立 store，而不是复用 Journey / PracticeDays / LotusPond。

理由摘要：

1. **事件对齐**：Essence 应与 `focus-coins-earn` **同一套完成钩子**（含仪式、回声、日封顶），三库现有语义均无法完整覆盖。  
2. **职责清晰**：Garden（莲花/分数）· Coin（可花）· Essence（不可花声誉）三轨并列，符合 `GROWTH_METRICS_CHARTER` 多轨治理。  
3. **兑换隔离**：门槛继续走 `resolvePracticeAggregate` + `lifetimeMarks`；Essence **不参与** `evaluateFocusCoinRedeem`。  
4. **演进空间**：日后 Essence 可改累计规则而 **不动** Coin 经济表（`FOCUS_COINS.md` §4 冻表）。

**建议 Essence _wallet 最小形态**（实现轮再定命名）：

```text
{
  essenceTotal: number,      // 终身单调累计（grant +N；redeem 不减）
  dateKey: string,
  day: EssenceDayState,     // 建议首版镜像 Coin 日池（同 caps）——防刷一致
  session: EssenceSessionState
}
```

**首版 grant 规则建议**：与 `computeFocusCoinsGrant` **同事件、同点数、同封顶**——仅写入目标从 `balance` 改为 `essenceTotal`。不做 Coin/Essence 比例分叉，降低回归风险。

**历史用户迁移**：建议 **essenceTotal 从 0 起算**（不回溯 `balance` 或估算终身赚取）。理由：无兑换比例、无 UI，回溯需假设「历史花费」且易与 persona 夹具冲突。

### 4.2 UI 展示 → **本轮不做**

| 项 | 建议 |
|---|---|
| 产品面 | **零 UI**——不增 HUD、不改 `FocusCoinsPanelUI`、不改 duration hint、不改菜单文案 |
| Flag | **独立** `?focusEssence=0` / `isFocusEssenceAwardEnabled`（**不**与 `?focusCoins=0` 共用）；默认开、本轮无用户可见面 |
| 实验室 | 可选 `window.__focusEssence.getTotal()`（仅 dev）；非必须 |
| TEST_TRACKER | 登记「仅单元测试覆盖」 |

### 4.3 Collections 兑换流程 → **本轮不动**

| 项 | 保持不变 |
|---|---|
| 入口 | `#yin-coin-panel` · `applyFocusCoinsRedeem` |
| 消费字段 | **仅** `balance` |
| SKU / 价格 / 门槛 | `FOCUS_COIN_CATALOG` · aggregate · `lifetimeMarks` |
| `ownedIds` / 称号 / 周边 | `focusCoinsCosmetics` 链路不变 |

Essence 在实现轮**不得**出现在 `buildFocusCoinRedeemContext` 或 `evaluateFocusCoinRedeem` 参数中。

---

## 5. 建议实现切片（供后续 Brief，本文不写代码）

### Slice 1 — 模型与 L0 单测

- `focusEssenceLedger.js`（纯函数，镜像 grant 语义；**无** redeem）  
- `FocusEssenceStore.js`（`essenceTotal` 只增）  
- `focusEssenceAward.js`（`applyFocusEssenceGrant` 等）  
- 单测 + `growthMetricsRegistry` 新增 `focus-essence-earn` 行  

### Slice 2 — 钩子双写

在 `main.js` 现有 `awardFocusCoins` 邻接点并行调用 `awardFocusEssence`（或抽取 `applyPracticeCompletionReward` 一次返回 `{ coins, essence }`）。  
**W7 `markLifetime`** 仅 Coin 侧门槛旗标——**不**映射 Essence（除非产品后续定义）。

### Slice 3 — 治理与备份

- `localStateKeys.js` 注册新 key  
- `practiceBackup` whitelist 下一 schema 版本加入 essence（与 coin **同批**导入策略）  
- `SHARED_RESOURCES.md` · 本 planning 文归档  
- `npm run audit:growth-metrics` persona（可首版复用 coin persona 的 **essence 期望值 = 原 points**）

### 明确不做（本轮）

- Coin↔Essence 兑换 · Essence 消费 SKU · Essence 门槛替换 aggregate · Essence UI · 改 Coin 日封顶数字 · 远程参数化 Essence

---

## 6. 冲突扫描（`SCENARIO_TESTS` 邻接）

| 轴 | 风险 | 处置 |
|---|---|---|
| **强度** | Essence 若将来展示，可能比 Coin 更像「分数板」 | 本轮无 UI；registry 标 `presentation-feedback` 预留 |
| **人设** | 「声誉值」文案若未来露出，易变监工 | 实现轮禁止新用户可见文案；Essence 内部名 Focus Essence |
| **职责** | 与 practice-score / 莲花 / Coin 三层重叠 | Essence **不**替代 `scoreFormula`；**不**进 redeem；**不**写 Journey memories |

---

## 7. PO 拍板（2026-09-20 · 已锁）

### 7.1 对外名称

产品对外只 claim **English + Japanese**；中文仅为 CMS 草稿，**不作为外显 SSOT**。

| 层 | 值 | 备注 |
|---|---|---|
| **工程 / EN 外显** | `Focus Essence` | 代码、registry、文档内部名；英文 UI 直接用此 |
| **JA 外显（锁）** | **精進**（しょうじん / Shōjin） | UI 展示用 **「精進」** 或 **「精進度」**（实现轮再定具体句式） |
| **Storage key** | `focus-tiger.focus-essence.v1` | 与外显名解耦，可先落地 |

**日语名选型理由（PO 原文摘要）**：

- 常用词（「日々精進します」），自带「积累、不可消费」语感，无需额外教育  
- 与现有禅意/佛教典故命名（芥子须弥、莲花池）同源（六波罗蜜·精进）  
- 与 Coin 侧轻快叫法（现网 ja：`寅コイン`）气质反差明显——并排即可感知「能花 / 不能花」  
- **单独使用「精進」「精進度」无「精進落とし」法事联想问题**（仅复合词才有）

**i18n 撞车审计（2026-09-20）**：

| 范围 | 结果 |
|---|---|
| `src/locales/ja.json` · `en.json` · `zh.json` | **未出现** `精進` / `精进` / `Focus Essence` / `ESSENCE` 相关 key |
| 全仓 `focus-tiger/` 正文 | **未出现** `精進` / `精进` |
| 邻接 Coin 日语面 | `YIN_COIN_*` 使用 **寅コイン** / **寅币**（`ja.json`）；与精進 **无语义冲突** |

实现轮新增 locale 时建议 key 前缀：`FOCUS_ESSENCE_*`（或 `SHOJIN_*`），**勿**复用 `YIN_COIN_*`。

### 7.2 关闸策略（锁）

- **独立** query：`?focusEssence=0`（及对称 `=1` 若需要）  
- **禁止**与 `?focusCoins=0` 共用同一 gate——两条轨可单独调试/隐藏  
- 实现：`focusEssenceAwardGate.js`（镜像 `focusCoinsAwardGate.js` 形态）

### 7.3 历史起点（锁）

- `essenceTotal` **从 0 起**，**不回溯**历史 Coin grant  
- **不开**迁移 Brief——无「向老用户展示过去错过多少精进值」产品诉求

---

## 8. 风险（仍有效）

| 风险 | 缓解 |
|---|---|
| 双写漏钩子 | 单测枚举 `GRANT_KIND` + 与 `awardFocusCoins` 共用事件表 |
| 备份版本分裂 | essence 跟 coin 同 schema bump，导入时成对 reload |
| 日后 Essence 要不同公式 | 独立 ledger 已预留；首版同点数是最小风险起点 |
| 用户问「我的成长去哪了」 | 本轮无 UI；未来展示用 **精進 / Focus Essence** 已定名 |

---

## 9. 附录：文件索引

| 类型 | 路径 |
|---|---|
| 产品 SSOT | `docs/FOCUS_COINS.md` |
| 成长治理 | `docs/GROWTH_METRICS_CHARTER.md` · `src/core/growthMetricsRegistry.js` |
| Coin store | `src/core/focusCoinsStore.js` |
| Coin ledger | `src/core/focusCoinsLedger.js` |
| 发点接线 | `src/core/focusCoinsAward.js` · `src/main.js` |
| 兑换 | `src/core/focusCoinsRedeem.js` |
| L3 UI | `src/ui/FocusCoinsPanelUI.js` |
| 练习聚合 | `src/core/practiceAggregate.js` |
| Journey（不复用） | `src/core/journeyPracticeMemory.js` |
| 莲花池（不复用） | `src/core/LotusPondStore.js` |
| 练习日（不复用） | `src/core/PracticeDaysStore.js` |
| 备份 | `src/core/practiceBackup/practiceBackupLocalIo.js` |

---

## Changelog

| 日期 | 说明 |
|---|---|
| 2026-09-20 | 初稿：只读审计 + Essence/Coin 拆分方案（无代码） |
| 2026-09-20 | PO 拍板：JA 外显 **精進** · EN `Focus Essence` · 独立 `?focusEssence=0` · `essenceTotal` 从 0 起；i18n 撞车审计无冲突 |
