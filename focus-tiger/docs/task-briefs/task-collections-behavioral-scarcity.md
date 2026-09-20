# Task Brief · Collections 行为稀缺度展示（V1 已拍板 · Slice 1 进行中）

> **状态（2026-09-20）**：**PO 已锁 V1 口径**。**Slice 1 已开工**（`feature/collections-behavioral-scarcity`）：只读「修行纪念」分区 + 本机说明句；无 Worker、无全球名次。  
> **硬前置**：共享里程碑目录 `task-shared-milestone-catalog.md`（**V1 已拍**）。未做目录 Batch 1 对照单测前，**禁止**开工本任务 UI / 接线。  
> **口令**：实现须另开代码 Brief / 「开工」；禁止把本文件当开工许可。  
> **父线**：Epic [#888](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/888) Collection Value & Behavioral Scarcity；耦合 [#632](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/632) Focus Coin & Collections、[#627](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/627) 账本口径、[#640](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/640) Yin Evolution、[#643](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/643) Journey Log。  
> **原则**：`PRINCIPLES.md`「数字资产 / Collection 价值原则」（[#886](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/886) **已合** `ae0d2ec5`）· 宁静型游戏化 / 不制造焦虑 / 诚实机制 / **不商业化自律本身**。全球行为人数仍是原则里的**概念储备**；V1 **不**实现全球排行。  
> **硬排除**：算法随机稀有度；Focus Coin 兑换门槛或任何货币化；把自律本身做成付费墙。  
> **产品用词**：设计师提案里的「案上雅舍 / 多宝阁」**不是**产品名。已上船分组是 **案上陪伴 / 静候结缘**（寅币清供行）。对外只认 **Yin's Collections / 阿寅的珍藏**。

---

## 一句话

给「成就类」收藏物加**可解释的行为说明**（你真的走过哪道门），不是抽卡稀有、也不是全球竞赛榜。

---

## 地面真相（纠正任务书前置假设）

任务书写：`resolvePracticeAggregate()` 骨架已在，读取侧 Batch 1「尚未开工」。

**git 事实（`origin/develop` tip `1ead3acb`，本方案分支落后数 0）**：Batch 1–4 **已合入**。

| 批次 | PR | 读侧 |
|---|---|---|
| 1 | [#681](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/681) | Confide `practice_facts` 时长 / 对比 / showing-up → `resolvePracticeAggregate` |
| 2 | [#682](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/682) | Idle / Sanctuary 徽章 score、芥子须弥 / 静思典藏 score → aggregate；寅币兑换 / Support tea-first **wire-only** |
| 3 | [#683](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/683) | 纪念印自动出卡接 baseline 三源仪式 |
| 4 | [#684](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/684) | `practiceAggregateConsumerRegistry` + `audit:practice-coverage` CI |

SSOT：`practice-aggregate-registry.md` 机器块（status `ok`）· `GROWTH_METRICS_CHARTER.md` `scoreFormula.v3`。

**半覆盖白名单漏洞**：已用 registry + CI 锁 P0/P1 消费者。**本任务若再自选 Journey / 90 天窗口 / 仅 Sit 行，会重开同一洞。**  
**不必再等 Batch 1。** 也**禁止**临时第二数据源。

仍须诚实写出的缺口（不是「Batch 1 没做」）：

- `practiceDayCount` 仍是 practice-days **≤90 日窗口条数**，不是终身天数；终身分钟以莲花池为准。
- Journey Log **仍不是**累计解锁账本（Honesty 补登故意不写 Journey 行）。
- Idle 徽章条、纪念印、寅币门槛是**三套表面**，公式已收口到 aggregate，**展示入口未合并**。

---

## 冲突扫描（对照 `SCENARIO_TESTS.md`）

相邻路径：场景 **AC** Collections 抽屉 · Idle 练习徽章条 · 芥子须弥出卡 · 场景 **Z** Journey Log · MilestoneGlow · Yin Evolution 方向锁。

| 轴 | 疑点 | 本方案收口 |
|---|---|---|
| **a. 强度** | 「全球第 N / 前 100」比每日 Celebrating、比 Journey 静默入账更像竞赛 HUD | **V1 禁止**全球名次与倒计时；说明句只出现在用户**主动打开**珍藏时。禁止新庆祝弹窗。 |
| **b. 人设** | 排行榜口气 vs 观照者；PRINCIPLES 禁 FOMO / 稀缺倒计时（付费向） | 文案用「走过 / 同坐 / 留下」，不用「击败 / 仅剩 / 限量抢」。全球人数若有，用**同行者数量**，不用名次。 |
| **c. 职责** | Idle 徽章条、勋章印记页签、Journey 六条记忆、清供「案上陪伴」四套「我有东西」 | **稀缺说明挂成就物，不另开列表；不写进清供结缘行；不改 Journey 列表职责。** |

有 **c 轴重叠**，实现前须 PO 拍板（本文件即拍板材料）。**无用户路径的机械文档**不适用于本文——本文会锁未来用户路径。

---

## 问题 1 · 统计范围

### 方案 A — 本机个人成就（本地账本）

只读 `resolvePracticeAggregate()`（+ 共享里程碑目录的谓词）。标签例：

- 「这是你留下的第 21 日同坐印」
- 「累计陪伴已过 100 小时」

**要**：现有 lotus / practice-days / daily-completions，无新云、无新身份。  
**不要**：声称「全球」。离线 v1.0 核心路径不被绑死。

### 方案 B — 全局真实第 N 位（服务端原子计数）

任务书举例「全球完成前 100 次专注的用户」。工程上**现在做不到诚实**，原因不是缺 Worker，而是缺**计数原语 + 身份 + 隐私同意**：

| 现网 | 事实 |
|---|---|
| Cloudflare Worker + **9 个 KV** | entitlement / OTP / 备份 / YPE / 品味 / 花园参数。**无 D1**（`INFRA_SNAPSHOT.md` / `wrangler.jsonc`）。 |
| KV | **非事务、非原子计数器**。并发 `get+put` 会丢次数。Lantern presence 是 TTL 在场快照，不是终身序号。 |
| Tip / Sanctuary / Membership | 校验付款，按邮箱/会话写 entitlement。**不是**「第 N 位请茶」。 |
| YPE ingest | 同意后的个性化事件，**不是**排行。 |
| 练习备份 | 身份 = **邮箱 OTP**（2026-08-12 拍板：**不做 device id 跨端**）。未绑邮箱 = 无稳定人。 |
| v1.0 | 核心练习**不得**依赖必须成功的云请求。 |

若未来做全球统计，最低诚实栈：

1. **Durable Object**（每 `milestoneId` 一把序号锁）或 **D1 `UPDATE … SET n=n+1`**——**不要**用 KV 冒充原子。  
2. 身份只复用 **备份邮箱**（或日后明示同意的账号）；禁止新造指纹 device id。  
3. **首次跨越**才 `claim`；备份恢复必须幂等，禁止导入再占一个全球名额。  
4. 客户端上报可伪造——产品已选诚实机制，对外只能称「**已记录的完成**」，不能称「经验证的全球竞赛」。  
5. 后台网络三问：禁止在 Arrival / Honesty / Reflection 叠化或 Idle 呼吸刚开始时上报；内容未变不重写；失败不得卡序列。

### 方案 C — 匿名同行人数（弱全球感，仍要服务端）

只展示「已有人走过这扇门」（cohort count），**不**展示你的名次。仍要原子计数 + 去重身份，但语气比「前 100 名」更接近观照。

### 我认为最合理的

**V1 只做方案 A。方案 B 标为概念储备（不合理作为本任务实现）。方案 C 仅在身份 + Durable Object/D1 立项且 PO 要「全球感」时作为 B 的替代。**

理由：任务书要的「全球稀缺感」与现网身份/计数/v1.0 离线门闩冲突；强行用 KV + 匿名 install id 会做出**假全球**（清站点、换浏览器、恢复备份都会重算），比不做更伤诚实机制。本机真实第几次 / 累计多久，已经满足「稀缺来自行为、不是随机」。

---

## 问题 2 · 展示位置

现网 Collections（`#yin-coin-panel`，场景 AC）：

| 分区 | 实际是什么 | 能否挂成就稀缺标签 |
|---|---|---|
| **案上陪伴** / **静候结缘** | 寅币**清供 8** 结缘（P0 分组已合） | **不要。** 用户本任务排除兑换/货币化；此处是「我选择留下的器物」，不是成就证明。 |
| Idle `#yin-tip-kindness-badges` | 练习 / 请茶 / Sanctuary **枚数 chrome** | **不要**再做第二排成就列表（`FOCUS_COINS.md`：清供不得并进徽章条；成就墙仍 Backlog）。 |
| 四页签 **勋章印记** | Brief `task-practice-imprint-badges.md` · **待开工** | **要。** 成就物的归档表面。 |
| Journey Log | 叙事行；Yin Evolution 六条记忆的预定落点 | **不要**当稀缺货架；记忆句可与同一目录**共享谓词**，列表仍在 Journey。 |

任务书草稿里的「案上雅舍 / 多宝阁」是**设计师提案用词**，仓库产品名**没有**这两词。已上船的分组叫 **案上陪伴 / 静候结缘**。`FOCUS_COINS.md`：对外只认 **Yin's Collections / 阿寅的珍藏**；百宝箱 / 清供匣仅比喻。

### 方案 D — 挂在清供「案上」专区

把成就标签混进已结缘香炉行。职责与寅币结缘缠在一起，且与「不做货币化」打架。

### 方案 E — 独立徽章列表（新菜单或新 overlay）

与 Idle 徽章条、未来勋章印记 **三重职责**。Yin Evolution：**不再堆徽章**、禁止 Stage HUD。

### 方案 F — 同一珍藏抽屉内的「修行纪念印 / 勋章印记」分区（推荐）

- 四页签壳未开工前：在 `#yin-coin-panel` **清供列表下方**加只读分区「修行纪念」（未解锁灰位可极少、勿 FOMO 进度条）。  
- 四页签开工后：迁入 **勋章印记** 页签，本分区不留第二入口。  
- 标签是卡面**说明句**，不是新货币、不是 Wear 清供。

### 我认为最合理的

**方案 F。** 方案 D（不合理）混货币化货架；方案 E（不合理）叠第三套徽章墙。F 呼应已有「收藏分组」方向，但不占用「案上陪伴」这个已有语义。

---

## 问题 3 · 数据来源（还等不等 Batch 1）

| 选项 | 结论 |
|---|---|
| 等 Batch 1 收口再接线 | **（不合理）** Batch 1–4 已在 `origin/develop`。再等是按过期 Brief 施工。 |
| 本任务临时接 Journey / 仅 Sit / 90 天窗口 | **（不合理）** 半覆盖白名单重演；芥子印曾把窗口分钟当终身（`scoreFormula.v1` 课）。 |
| 范围内先接 **唯一** `resolvePracticeAggregate()`，并登记新消费者 | **要。** 新 id 建议 `collections-behavioral-scarcity`，挂 `practiceAggregateConsumerRegistry.js`，`audit:practice-coverage` 必绿。门槛读 `score` / `lifetimeMinutes` / 章程已列字段，**禁止**自己 `readJourneyLog` 做解锁。 |

实现时还须遵守 `GROWTH_METRICS_CHARTER.md`：新累计消费者先声明公式版本与 persona；**禁止**本任务改 `scoreFormula.v3`。

---

## 问题 4 · 与 Journey / Yin Evolution 是否同一批里程碑

**共享「谓词与账本」，不共享「表面」。**

```text
practiceAggregate（账本 SSOT）
        │
        ├── 解锁 / 印 / 徽章枚数     → Garden + Collections 成就物
        └── 同一谓词的叙述句         → Journey P0 六条记忆（YIN_EVOLUTION）
```

| 层 | 权威 | 本任务 |
|---|---|---|
| 分数公式 | `GROWTH_METRICS_CHARTER` `scoreFormula.v3` | **只读** |
| 纪念印门槛 | `memorialSealDirectory.js`（芥子 / 静思典藏 `scoreThreshold`） | 成就卡引用同一门槛，禁止平行 `21` |
| 修行纪念印档 | `task-practice-imprint-badges.md`（建议 600 / 3000 / 10800 分 或 score 21 / 42 / 84） | 稀缺说明挂这些档，**不另起一套分钟表** |
| Idle 徽章枚数 | `practiceBadgeAward` `score/3` | **不**当 Collections 稀缺文案（那是 chrome 密度） |
| MilestoneGlow | **连续** 7 / 21 / 100 **仪式动画** | **正交**。对外稀缺句禁止改写成「连坐竞赛」 |
| Journey / Evolution 六条 | First practice · 7/21/100 **days of returning** · First return after pause · First different practice · 可选 First lotus | **关系记忆**，落 Journey，**零公式消费者**、禁止 score→阶段。git 上 7/21/100 与 Glow **同为连续日**（J1-a **已拍**）。EN「days of returning」与算法不对齐见目录 Brief **J-copy**（已知待办、不阻塞）；禁止实现人临场另造 id |
| Confide / YPE / Personal Memory | 倾诉与 Pack | **不**进收藏稀缺 |

共享谓词表已单独立项：`task-shared-milestone-catalog.md`（2026-09-20 **V1 已拍**）。没有这份目录，就会再出现「芥子一套、徽章一套、Journey 一套」。本任务实现 **不得** 顺手发明第三套门槛数字。

Yin Evolution 铁律仍然有效：**见证不得锁付费**；Collections 成就说明对所有练习者可见。

---

## V1 范围（拍板后才写代码）

**做**

1. 里程碑目录（文档或纯数据模块）与 imprint / 芥子门槛对齐。  
2. Collections 内只读成就分区 + 本机行为说明句（en/zh/ja）。  
3. registry 新消费者 + 章程 persona 一行（若门槛用 score/分钟）。  
4. 场景 AC 附录：打开珍藏可见说明；关再开仍在；`?focusCoins=0` 若整面板隐藏则成就分区随面板走，**不得**另开菜单。

**不做**

- Worker / KV / D1 / Durable Object 序号。  
- 「全球第 N」「前 100 名」。  
- 随机稀有、限量倒计时、寅币价、结缘门槛改写。  
- 新独立徽章 overlay、成就墙、3D 柜。  
- 改 PNG / 主坐席叠层。  
- 改 `scoreFormula`、Glow 节点 math、Journey 写入钩。

**预估（实现，非本 PR）**：2–4 人日（目录 + 分区 UI + i18n + 单测）；四页签壳仍可后置。

**分支（实现）**：`feature/collections-behavioral-scarcity` · 独立 worktree · `--base develop`。

---

## 后台网络

本方案文档：**不涉及后台网络**。  
V1 实现：**不涉及**（纯本地）。  
若 PO 将来拍方案 C/B：须在实现 Brief 答 `BACKGROUND_NETWORK.md` 三问；上报不得与叠化/呼吸抢窗口。

---

## 点击反馈（实现时）

V1 无新购买。打开 Collections 既有 0–1s 淡入后，成就分区随面板出现即可。不可点的灰位若存在，须挂 `SILENT_BEHAVIORS.md` 或改为「尚未走到」观察句（禁止哑点击）。

---

## PO 拍板（2026-09-20 · 实现闸已锁）

书面同意下列五项（分析师 Prompt 1 跟进）。实现仍须另口令，本锁 **不等于** 开工。

1. **V1 = 本机说明 + 勋章印记 / 珍藏分区（方案 A + F）**；全球名次 / 「前 100」**不做**。理由：无可靠原子计数器、无稳定全球身份、须保持离线可用；假全球（清浏览器 / 换设备 / 恢复备份重占名额）比不做更伤可信度。  
2. 成就标签 **不进入「案上陪伴」清供行**。与「不商业化自律本身」对齐：成就与用币香炉混排，容易读成「稀有度可以花钱换」。  
3. 数据 **只**走 `resolvePracticeAggregate()` + 共享里程碑目录。Batch 1–4 已在 develop，**不再等**；禁止临时第二账本。  
4. Journey 六条记忆 **只共享判定、不共享收藏界面**（账本共用、职责切开）。  
5. 文档叙事顺序：原则 [#886](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/886)（`ae0d2ec5` · 07:10Z）先于方案 [#887](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/887)（`a8d38e85` · 07:11Z）合入 develop。二者无技术依赖；此顺序便于回溯「照哪条原则设计」。
