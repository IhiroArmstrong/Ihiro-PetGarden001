# Task Brief · 共享里程碑目录（V1 已拍板 · 无运行时）

> **状态（2026-09-20）**：**PO 已锁 V1 口径**（方案 [#892](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/892) 已合）。无运行时、无 Worker、无 UI。  
> **口令**：实现（数据模块 Batch 1 / 接线 / Collections 稀缺说明）须另开 Brief / 「开工」；禁止把本文件当开工许可。  
> **前置**：Prompt 1 行为稀缺 V1 已拍（[#891](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/891)）· Prompt 3 provenance 占位已合（[#890](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/890)）——二者都点名本目录，但此前无人设计。  
> **父线**：Epic [#632](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/632) Collections · [#640](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/640) Yin Evolution · [#643](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/643) Journey Log · 交叉 `GROWTH_METRICS_CHARTER.md` / `practice-aggregate-registry.md`。  
> **硬排除**：改 `scoreFormula.v3`；改 Glow 节点 math；改 Journey 写入钩；改 `JOURNEY_MEMORY_STREAK_*` locale（见 J-copy）；Collections 稀缺 UI；全球名次；随机稀有；把目录做成运行时云服务。

---

## 一句话

先把「什么叫走到了某扇门」写成**一张本地静态目录**，让芥子印 / score / Journey 记忆 / Glow 占位字段读同一套谓词。**口径已锁；代码仍未写。**

---

## 地面真相（四处各自怎么判）

基线：`origin/develop` tip `cefe816a`（#890 已合）。本方案分支由此切出。

### 1. 芥子须弥印（unlock-gate）

| 项 | 现网 |
|---|---|
| 门槛 | `score ≥ 21`（`MUSTARD_SEED_SEAL_SCORE_THRESHOLD` ← `memorialSealDirectory.js` 场景 `mustard-seed-sumeru`） |
| 公式 | `scoreFormula.v3`：`practiceDayCount + floor(scoreEligibleLifetimeMinutes / 60)` |
| 账本 | `resolvePracticeAggregateFromStorage()`（Batch 2 已收口） |
| 出卡 | baseline 三源仪式后 `shouldOfferMustardSeedSealAfterCeremony`；三首诗 **同一 score 门**，按完成场次逐首揭开 |
| 不是 | 连续 21 天。`?qaSeedStreak=21` 能开印，只因为 21 个练习日 × 1 分、莲花分钟为 0，**碰巧** score=21 |

静思典藏 `CA-01…` 是另一张**诗文目录**（`memorialSealDirectory.js` / `memorialSealCatalogCa.js`，各条自有 `scoreThreshold`）。本任务**不**把诗稿搬进共享里程碑目录；目录只引用 `catalogId` / `scoreThreshold`。

### 2. 成长度量 score（公式层，不是一扇门）

| 项 | 现网 |
|---|---|
| SSOT | `GROWTH_METRICS_CHARTER.md` · `computePracticeScore` |
| 窗口 | `practiceDayCount` = practice-days **≤90 日条数**（不是终身天数）；终身分钟看莲花池 |
| 消费者 | 芥子 / 静思典藏 / Idle·Sanctuary 徽章枚数 / 寅币兑换门槛（wire） |
| 徽章档 | `min + floor(score / 3)`，**不是**里程碑节点，禁止当 Collections 稀缺句 |

**同名漂移**：`practice-aggregate-registry.md` 正文仍有一处写成 `score = days + floor(lifetimeMinutes / 60)`，章程与代码已是 `scoreEligibleLifetimeMinutes`。目录实现时以章程 / `practiceAggregate.js` 为准，禁止再抄过期摘要。

### 3. Journey Log 记忆（presentation · 零公式消费者）

`JOURNEY_PRACTICE_MILESTONE_IDS`（`journeyPracticeMemory.js`）：

| 现网 id | 实际判定（git） | 叙事口径（`YIN_EVOLUTION` / 稀缺 Brief） |
|---|---|---|
| `first-practice` | 至少 1 个练习日 | 首次同坐 |
| `streak-7` / `21` / `100` | **连续日历练习日** ≥ N（`streakEndingOn` / `countRecentPracticeStreak`） | 文案写 **days of returning**；稀缺 Brief 要求 **≠ Glow 连坐** |
| `first-return` | 练习日出现间隔后的第一次回来 | 暂停后再来 |
| `practice-variety` | `sourcesSeen` ≥ 2（Sit / Honesty / Breath） | 第一种不同练习 |
| `first-lotus` | `bloomCountForMinutes(lifetimeMinutes) ≥ 1`（首朵 = **25 分钟**，不是 score） | 可选第一朵莲 |
| `come-back`（可重复） | 每次间隔后的回来日 | 关系记忆，不是一次性里程碑 |

Honesty **不写** Journey 行，但会写 practice-days → 记忆回填仍能从练习日推出 streak / first-practice。记忆层 **禁止**变成 score 解锁门。

### 4. MilestoneGlow provenance 占位（#890 · 已实现、未接线）

| 项 | 现网 |
|---|---|
| 节点 id | `streak-7` / `streak-21` / `streak-100` |
| 判定 | 连续练习日（`resolveMilestoneGlowNodeId`） |
| 存储 | `{ records: [{ id, origin?, journey_id?, rarity_basis? }] }`；旧 `{ played: [] }` 仍可读 |
| 写入 | `claimOffer` / `markPlayed` **今天谁都不传 meta**（`main.js` 两处只传 streak） |
| 语义 | 仪式动画，正交于 score；稀缺句禁止写成连坐竞赛 |

---

## 同名不同义 / 同义不同名（本次必须先点名）

这是上次「各触发点各挑账本」的同类风险。目录的第一件事是**给冲突命名**，不是假装四处已经对齐。

| 冲突 | 类型 | 现网 | 若不先锁会怎样 |
|---|---|---|---|
| **`streak-7` Glow vs Journey** | 同名；git 上**同义**（都是连续日）；产品文案想拆 | 两处都写 `streak-7` | UI 接线时有人按稀缺 Brief「必须分谓词 id」另造 `returning-7`，Journey 行为被悄悄改掉 |
| **score 21 vs 连续 21 日 vs 21 个练习日** | 同数不同义 | 芥子 = score；Glow/Journey = 连续日；`qaSeedStreak=21` = 窗口内 21 个练习日 | 稀缺句写成「第 21 日」却用 score 门，或反过来 |
| **首朵莲 vs score** | 同「成长」不同账本 | 莲 = 终身分钟 25；score 可因天数先到 21 | 把 `first-lotus` 误接到 score |
| **修行纪念印 600/3000/10800 分** | 尚未存在的平行表 | 只在 `task-practice-imprint-badges.md` | 实现人再手写一套分钟表 |
| **`memorialSealDirectory` vs 本目录** | 职责易混 | 前者是诗文/场景；后者应是谓词 | 把诗句或 `MS-01` 当 rarity_basis 字符串塞进 Glow |

**已有、可复用、不要重写的常量**

- `scoreFormula.v3` / `computePracticeScore` / `resolvePracticeAggregate`
- `MUSTARD_SEED_SEAL_SCORE_THRESHOLD`（21）与 CA 各条 `scoreThreshold`
- `MILESTONE_GLOW_STREAK_NODES` 的 **天数**（7/21/100）
- `LOTUS_POND_FIRST_BLOOM_MINUTES`（25）
- `PRACTICE_BASELINE_SOURCE_IDS`（variety）
- Journey **已持久化** 的 memory `id`（迁移不得改已写入字符串，除非另立项 remap）

**需要改写的（仅在拍板后的实现阶段）**

- 新增一份 **谓词主键**（见下），Glow/Journey 的 `streak-7` 降为 **surface alias**，不再当目录主键
- #890 三字段从「自由文本占位」收成 **闭集词汇**（见问题 3）
- 稀缺 Brief 里「7/21/100 returning ≠ Glow」与 **git 同谓词** 的矛盾，必须 PO 选一行，禁止实现人临场发挥

---

## 冲突扫描（对照 `SCENARIO_TESTS.md`）

相邻路径：场景 **AC** Collections · **Z** Journey Log · MilestoneGlow QA（`qaSeedStreak=6`）· 芥子出卡 · Idle 练习徽章条。

| 轴 | 疑点 | 本方案收口 |
|---|---|---|
| **a. 强度** | 目录本身无新仪式、无弹窗 | **本 PR 无用户路径。** 实现阶段仍禁止新庆祝叠在 Journey/Glow 之上。 |
| **b. 人设** | 把 Journey 见证写成稀缺排行 | 目录可挂 `copyPolicy`：Glow=仪式、Journey=记忆、imprint=累计。禁止用同一句话打三处。 |
| **c. 职责** | 四处「我走过一扇门」 | 目录 **不是第五个表面**。只共享谓词与 id；表面仍分家（#891 第 4 条）。 |

**c 轴重叠是现状，不是本文件发明的。** J1 / F1 已拍（见文末）。目录仍不是第五表面。Journey 英文「days of returning」与连续日算法不对齐 → **已知待办、不阻塞**（见下节）。

---

## 问题 1 · 静态配置表，还是运行时服务？

### 方案 A — 本地静态目录（推荐）

一份 `practiceMilestoneCatalog.js`（或先本 Brief 里的表，实现时再落模块）：每行稳定 `id` + 谓词 + `surfaces` + 文案策略。判定函数是纯函数，输入 `resolvePracticeAggregate()` / practice-days streak / lotus minutes。

**要**：离线、可单测、与 #891「V1 只做本机」一致。  
**不要**：Worker、远程改门槛。

### 方案 B — 运行时服务（云端门槛 / 全球序号）

每条 milestone 向 Worker `claim`。#891 已锁 **V1 不做全球名次**；现网 KV 不能当原子计数器。

### 我认为最合理的

**方案 A。** 方案 B 在本任务是不合理项：门槛全是本机可复现的算术，做成服务只会在 Arrival/呼吸窗口外再加后台网，且与离线 v1.0 门闩冲突。

---

## 问题 2 · 四处迁移时复用什么、改写什么？

建议目录分两层，避免「再抄一个 21」：

1. **谓词原语**（可复用）  
   `consecutive-practice-days(n)` · `practice-score-at-least(n)` · `lifetime-minutes-at-least(n)` · `first-baseline-day` · `first-return-after-gap` · `source-variety-at-least(n)` · `lotus-blooms-at-least(n)`
2. **里程碑行**（产品对象）  
   绑定一条原语 + `surfaces: glow | journey | mustard-seal | contemplative-archive | imprint` + `legacySurfaceIds`

**V1 建议行（文档契约，非代码）**

| catalog id（建议主键） | 谓词 | 现网表面 alias | 迁移 |
|---|---|---|---|
| `consecutive-practice-days-7` | 连续日 ≥ 7 | Glow `streak-7` · Journey `streak-7` | **复用天数常量**；主键不再用 `streak-7` |
| `consecutive-practice-days-21` | 连续日 ≥ 21 | 同上 21 | 同上。**禁止**与 score 21 合并 |
| `consecutive-practice-days-100` | 连续日 ≥ 100 | 同上 100 | 同上 |
| `practice-score-21` | score ≥ 21 | 芥子场景（三 case 共用） | **直接引用** directory 的 21，禁止第三份字面量 |
| `first-practice` | ≥1 练习日 | Journey 同名 | 复用 |
| `first-return` | 首次间隔后回来 | Journey 同名 | 复用 |
| `practice-variety` | sourcesSeen ≥ 2 | Journey 同名 | 复用 baseline 三源 |
| `first-lotus` | 莲朵 ≥ 1 | Journey 同名 | 复用 `bloomCountForMinutes` |
| `come-back` | 每次间隔回来 | Journey `kind: come-back` | 可重复；**不是**一次性成就卡 |
| `imprint-minutes-600` 等 | 终身分钟档 | **尚无运行时** | 标 `proposed`；实现 imprint 时登记，禁止另起表 |

静思典藏各 CA：**不**在 V1 复制 12 行诗文。目录用 `ref: memorialSealDirectory` + `catalogId`。

Journey 已写入的 `streak-7` **保持原字符串**（只增记忆，remap 成本高）。目录主键与持久化 alias 分开。

---

## 问题 3 · #890 的 `origin` / `journey_id` / `rarity_basis` 存什么？

#890 允许自由文本 / JSON，是为了**不堵 schema**。长期继续自由文本 = 实现人「这次先随便传个字符串」——正是本任务要挡住的。

### 方案 C — 三字段都保持自由文本

接线快，无法审计，稀缺 UI 无法稳定 i18n。

### 方案 D — `rarity_basis` = 目录主键；`origin` = 谓词族闭集；`journey_id` = 同行 Journey memory id 或省略

建议闭集：

| 字段 | 存 | 不存 |
|---|---|---|
| **`rarity_basis`** | catalog id，如 `consecutive-practice-days-7` | 说明句、稀有度形容词、「21 日」这种展示文案 |
| **`origin`** | 谓词族：`consecutive-practice-days` \| `practice-score` \| `lifetime-minutes` \| `first-event` \| `source-variety` \| `lotus-bloom` | 账本 key 路径散文、用户可见句 |
| **`journey_id`** | 若本事件同时写了 Journey 记忆：该 memory 的 `id`（现网即 `streak-7` 这类 **alias**） | 伪造的 Journey 行；Glow 专用节点若无记忆则 **省略** |

旧行继续空占位，**不回填**（#890 已锁）。

### 我认为最合理的

**方案 D。** 方案 C 只把坑从「没字段」挪到「有字段没规范」。`rarity_basis` 必须是目录 id，展示句走 locale，按 id 查。

---

## 问题 4 · 一次替换四处，还是扫描先行、分批切换？

### 方案 E — 一次性让四处改读目录

一次 PR 碰 Glow claim、Journey sync、芥子 resolve、徽章。回归面过大，且会逼着在同一 PR 里「顺便」改 Journey 语义。

### 方案 F — 先目录、旧逻辑继续跑、逐模块切换（推荐）

与 `practice-aggregate-registry` Batch 1–4 同一惯例：

| 批 | 做什么 | 不做什么 |
|---|---|---|
| **0（本 PR）** | 本 Brief 拍板 | 代码 |
| **1** | `practiceMilestoneCatalog.js` + 单测：原语求值 vs 现网 helper **对照相等** | 不改 `main.js` 调用 |
| **2** | Glow `claimOffer` 开始写 D 方案三字段 | 不改节点 math、不改播放 |
| **3** | Journey **只改注释/对照测试**；持久化 id 不变 | 不改记忆语义，除非 J1 拍成「拆开」 |
| **4** | 芥子 / 静思典藏读目录引用同一 21 | 不改出卡仪式 |
| **5** | imprint + Collections 稀缺说明 **只能**读目录 | 禁止第三套分钟表 |

每批登记 `practiceAggregateConsumerRegistry` / 章程（若引入新累计消费者）。CI：目录行的 alias 必须能映射到现网 id；禁止未登记字面量 `21` 出现在新 UI 文案逻辑里。

### 我认为最合理的

**方案 F。** 方案 E 会把「同名冲突」一次做进生产，无法单独回滚。

---

## 本目录不是什么

- 不是诗文库（那是 `memorialSealDirectory`）
- 不是 Journey 列表、不是 Glow 播放器、不是徽章条密度公式
- 不是全球计数器
- 不是改 `scoreFormula` 的借口
- 不是 Collections UI 开工许可（#891：实现另口令；本目录拍板后仍另口令）

---

## 建议实现形态（拍板后，非本 PR）

```text
resolvePracticeAggregate / practice-days streak / lotus minutes
        │
practiceMilestoneCatalog  （静态行 + 纯函数 evaluate）
        │
        ├── Glow claim  → 写 rarity_basis = catalog id
        ├── Journey     → 仍写 legacy alias；对照测试锁「同一谓词」
        ├── 芥子 / CA   → 仍读 directory.scoreThreshold；目录引用同一数字
        └── imprint / 稀缺说明 → 只读 catalog id → i18n
```

分支名（实现）：`feature/practice-milestone-catalog` · 独立 worktree · `--base develop`。

---

## 共用机制核对

本方案纯文档，**不**新增 overlay / HUD 呼吸驱动 / 遮罩 dim / 可点击叠层。

- overlayBusy：不受影响（无新叠层）。  
- HUD 呼吸：不受影响。  
- z-index / dim：不受影响。  
- `OVERLAY_UI_SURFACE`：不新增行。

---

## 后台网络

本方案文档：**不涉及后台网络**。  
目录实现（方案 A）：**不涉及**。  
方案 B 已标不合理。

---

## 点击反馈

不涉及可点击交互。

---

## 已知待办 · 不阻塞本次目录（J-copy）

> 处理方式对齐 `practice-aggregate-registry.md` 对 Arrival / RitualFlow 的 **intentional-exclude**：先写进清单，**不**在本批「统一判定」里顺手改掉。

**现象：** Journey 7/21/100 记忆的**产品叙事**是「回来的天数」；**运行时**与 MilestoneGlow 共用 `consecutive-practice-days`（连续日历练习日）。J1-a 如实承认这一算法现状，**不等于**承认文案已经诚实。

**现网句子（勿在本任务改 locale）：**

| 键 | EN | ZH | JA |
|---|---|---|---|
| `JOURNEY_MEMORY_STREAK_7` | Seven days of **returning** | **连续**七天归来 | 七日**続けて**戻った |
| `JOURNEY_MEMORY_STREAK_21` | Twenty-one days of returning | 连续二十一天归来 | 二十一日続けて戻った |
| `JOURNEY_MEMORY_STREAK_100` | A hundred days of returning | 一百天归来（未写「连续」） | 百日続けて戻った |

EN「returning」可被读成累计归来次数；ZH/JA 7·21 已偏连续。三语也不齐。用户可能读错——这是**已知小缺口**，不是目录 Batch 1 的范围。

**本目录任务禁止：** 改这些 locale、改 `syncJourneyPracticeMemories` 门槛、把 J1-b 偷运进数据模块。

**另开产品拍板（口令另给）须二选一，禁止第三套数字：**

- **改文案**：i18n 改成「连续 N 日同坐 / consecutive practice days」，算法不动。  
- **改逻辑**：Journey 改用与 Glow 不同的「归来次数 / 窗口练习日数」谓词（即原 J1-b）。须独立 Brief；90 日窗口不能叫终身。

登记：`practice-aggregate-registry.md` 行 `journey-streak-copy-drift`。未另拍板前，Batch 1 对照单测按 **连续日 = git 事实** 锁相等。

---

## PO 拍板（2026-09-20 · 实现闸已锁）

书面同意（1–3 + J1-a + F1 + J-copy 待办）。**锁口径 ≠ 开工**；Batch 1 仍须另口令。

1. **形态 = 方案 A**（本地静态目录）。全球 / Worker 门槛不做。  
2. **迁移 = 方案 F**（先目录、对照单测、再分批接线）。  
3. **#890 字段 = 方案 D**（`rarity_basis` = catalog id；`origin` = 谓词族闭集；`journey_id` = 可选 Journey alias）。旧行不回填。  
4. **J1-a**：V1 **同一谓词** `consecutive-practice-days-N`，Glow 与 Journey 两处表面；只分 `copyPolicy`，**不分**第二套天数门槛。J1-b 不进本任务。  
5. **F1**：Batch 1 数据模块对照绿之后，才允许 imprint / 稀缺说明 UI。禁止「先写说明句再补 id」。  
6. **J-copy（不阻塞）**：上节文案/算法不对齐列为已知待办；改文案或改逻辑须**另开产品拍板**。禁止假装已随 J1-a 修好。
