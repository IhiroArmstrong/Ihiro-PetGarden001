# 寅币（Focus Coins）· 产品设计 SSOT

> **状态：方向锁（2026-08-19 · #353 已合 `develop`）** — 花园 vs 珍藏切开；叠层 SKU 退役。L0–L3 已接线；L3 抽屉入口是 **Yin's Collections / 阿寅的珍藏**。`?focusCoins=0` 关闸完全不写。  
> **内部名**：Focus Coins。**货币对外名（硬）**：**寅币** / **Focus Coins**（2026-08-19 取代「同坐点」；旧文案可视为别名，新产品面只用寅币）。禁止金币 / 积分 / Shop / Purchase 口吻。  
> **个人中心对外名（硬）**：**阿寅的珍藏** / **Yin's Collections**（日文 **阿寅の蒐集**）。不要 Desk / Study / Sanctuary（后者已是 Lifetime 买断名）。百宝箱只作气质比喻，不作产品名。  
> **工程 Brief**：[`task-briefs/task-focus-coins.md`](./task-briefs/task-focus-coins.md)。  
> **禁止**：用寅币满足任何 `isEntitled(featureKey)`；不建 entitlement gate key；**禁止**修改或覆盖已有 PNG 序列 / 蒲团 / 莲花朵（叠层一律退役）。

> **L1 硬闸**：开会碰 Honesty / 完成记账邻接的分支前必须书面扫并行 PR；口头注意不算过闸（2026-08-18 分析师）。L1 **#338 已合**。  
> **L0–L2 不改** `SCENARIO_TESTS.md`（L3 表面若需场景附录另开）。  
> **≠ 云端品味层**：服务端记账是可花点之后的防刷；与权重/文案上云分轨（见 `PROCESS` Backlog「云端品味层」）。

从属：`MVP_PRODUCT_DEFINITION.md` §五 · `FREE_PAID_MATRIX.md` · `FEATURE_CATALOG` · 场景 D / `HONESTY_BRIDGE_CTA.md` · `practiceBadgeAward.js`（`computePracticeScore`）· `PRINCIPLES.md` 宁静型游戏化。

---

## 0. 冲突扫描（实现前 · 已拍板）

对照 `SCENARIO_TESTS.md` 相邻路径。用户 2026-08-18 已同意六个方向问题；2026-08-19 补花园 / 珍藏切开。

| 轴 | 相邻场景 | 风险 | 处置（已锁） |
|---|---|---|---|
| **a. 强度** | 场景 A 完成庆祝；被动 Re-focus；主动 Recover | 钱包若比完成仪式更响，会把专注做成刷分 | 入口放珍藏次级；无倒计时/抽奖；日封顶静默；被动 Recover **0 点** |
| **b. 人设** | Honesty「别处也算数」；观察式文案 | 「赚/花」易变监工 | 对外「寅币 / 结缘」；不怀疑补登；不展示真假专注分 |
| **c. 职责** | 练习徽章；芥子印；莲花池；Seasonal Theme（B） | 两套进化叠在主坐席 / 用点买会员权益 | **花园自动 · 珍藏结缘**；B 轨逐条排除；Honesty 半额+日限 1 次发点 |

---

## 1. 心智（第三轨，不是第三档付费）

| 轨 | 是什么 | 寅币关系 |
|---|---|---|
| **A · Tea** | 打赏；不解锁 | 不得互兑 |
| **B · Lifetime ∪ Membership** | 进阶能力 / 场域 | **永远买不到** |
| **C · 寅币** | 练习换来的情感货币 | 只在 **Yin's Collections** 结缘身份/记忆；**不**兑花园 |

不是 `FEATURE_CATALOG` 的 `requiredTier`。可兑 SKU：`title.*` / `badge.rare.*` / `collection.*` / `gesture.*`。

### 1.1 花园 vs 珍藏（2026-08-19 · 硬）

| 层 | 落点 | 怎么来 | 禁止 |
|---|---|---|---|
| **花园（Grow / 莲花池）** | 主坐席 | 终身分钟自动、只增不减 | 进寅币店；改成花钱才开花 |
| **珍藏（C 轨）** | 独立个人中心 **Yin's Collections** | 寅币结缘：称号、稀有章、瓷器/青铜器静物卡、可点播闲笔 | 把瓷器叠回主坐席当第二套花园 |
| **周边 chrome** | Idle 阿寅**右侧** `#yin-tip-kindness-badges` | 练习/Tea/Sanctuary 枚数自动涨 | 把徽章扣进蒲团帧或改 PNG 序列 |

芥子须弥印、练习徽章枚数：**继续自动出现，永远不进店**。香炉/刺绣/灯盏若做，也走花园，不兑币。

练习徽章条（Idle 右侧 `#yin-tip-kindness-badges`）是主画面周边 chrome，**不是**产品名叫「百宝箱」。英文产品名只认 **Yin's Collections**；中文 **阿寅的珍藏**。百宝箱仅作气质比喻。

**铁律**：不能修改或添加覆盖到已有动画（含晨露滤镜、须弥金线、念珠披毯、蒲团扣子）。只能周边 DOM，或珍藏卡面。结缘动作第一批只用已入库 `wave-hello`（案头点播）；抛三色球未入库，后置。

### 1.2 已废止（另一路 L3 草稿 · 勿复活）

#352 曾按当时目录把 **8 条全列**进抽屉（香炉暖烟 / 莲叶晨露 / 木念珠 / 叠好的披毯 / 与阿寅同坐 / 又回来了 / 静石小章 / 须弥坐），并讨论「池/座/炉/身侧分区叠层」。那是合入前的过渡稿。**#353 之后作废**，不要再当待拍板项。

| 提案 | 处置 |
|---|---|
| 8 条叠层围着阿寅 / 晨露盖花 / 须弥金晕盖 `#sprite-stage` / 念珠披毯贴身体 | **不要**。铁律禁止改/盖序列帧。叠层 SKU 新兑 `retired-overlay` |
| 把旧 8 个 SKU id 原价原门槛改名成清供器物（暖烟→香薰炉、晨露→莲盏…） | **不采纳**。商店换成新目录（称号 + 静石 + 青瓷/青铜卡 + 挥手），不再绑花园门槛去兑匣中物 |
| 产品名叫清供匣 / Yin Coin / Yin's Desk | **不要**。对外只认 **Yin's Collections / 阿寅的珍藏**。清供匣、百宝箱仅比喻 |
| 寅币 8 件并进 `#yin-tip-kindness-badges` 或提前做成就墙 | **不要**。练习章条继续只管练习/请茶/Sanctuary；成就墙仍是 Backlog |
| `yin-coin-flat-draft.png` 0.5–1 日手绘精修 | **未批准**。占位 24px 色点继续用；看见线稿再另拍板 |

L3 抽屉 `#yin-coin-panel` **留下当珍藏的门**（#352 壳 + #353 目录）。四页签 / 挥手点播接线仍是下一步，不是再开第二座花园。

---

## 2. 六项拍板（2026-08-18 · 仍有效） + 2026-08-19 补条

1. **隔离清单按 §3 冻结**。  
2. **Honesty 半额 + 自然日最多 1 次发点**。  
3. **连续日只 +3 余温回声，不当解锁/惩罚门**。  
4. **不拦截自动纪念物**（莲花等仍免费自动出现）。  
5. **与练习徽章同一体系两层**（徽章=不可花的标记；寅币=可消费货币）。  
6. **货币对外名寅币 / Focus Coins**（2026-08-19 修订；不再用「同坐点」作新产品面）。  
7. **个人中心 = 阿寅的珍藏 / Yin's Collections**。结缘 = Bond / 縁を結ぶ。  
8. **叠层 SKU 退役**（晨露、香炉暖烟、木念珠、披毯、须弥坐金线）。已兑 `ownedIds` 保留但不再生效主画面。  
9. **`emotion.premium.trigger` 从 B 轨 catalog 删除**，避免会员与结缘动作抢动画。

---

## 3. 付费专属排除清单（Coins 禁止满足 `isEntitled`）

### 3.1 Catalog B 轨

| featureKey | 用户能感到的 | Coins |
|---|---|---|
| `ritual.morning.access` | Morning Ritual | 排除 |
| `ritual.emotional-reset.access` | Emotional Reset | 排除 |
| `ritual.work-transition.access` | Work Transition | 排除 |
| `ambient.deep.play` | 深度音效全库（免费仅 5 首） | 排除 |
| `content.advanced.daily-unlock` | 进阶每日解锁（占位） | 排除 |
| `theme.seasonal.access` | 节日主题 | 排除 |
| `ritual.*.history\|memento\|copy-unlocked\|sfx-unlocked` | 仪式持久物 | 排除 |

到期降级只认付费 entitlement。Coins 不得续期、补档、或把 `ongoing` 租成「用点开一天」。

### 3.2 非 catalog 的 B / 付费身份

Sanctuary Unlock · Yin Membership · Sanctuary 尊贵徽章包 · Enso 印 · Daily Wisdom Sanctuary 印花（Phase B）· **多端无缝同步** · Support 的 Sanctuary/Membership 卡。

### 3.3 点名效率项（对照现状后仍排除）

| 项 | 现网归属 | Coins |
|---|---|---|
| 数据分析 | **不是** B。复杂报表在 MVP §五不进路线图；Journey Log 基础 **free** | 排除；也不倒逼做成付费 SKU |
| Sanctuary | B 买断 + 互覆盖进阶内容 | 排除整包 |
| 多端同步 | B（未接线）；免费 A 只有快照兜底 | 排除无缝同步；禁止把备份改成点墙 |
| AI 对话额度 | **无此 SKU**。Confide 本地检索、默认未挂载；AI Coach 是红线 | 排除；禁止发明次数包 |

### 3.4 免费底线与 A 轨

Sit / Arrival / Honesty / Reflection / Breath / 基础 Idle / 每日首次庆祝 / Journey Log / Daily Wisdom 基础句 / 壁纸 / Quiet Line / 自传氛围乐 / 练习记忆快照：**保持免费**。

Tea 善意章不得用点买，请茶也不得充点。

### 3.5 工程隔离

- **不**给 Coins 增加 `FEATURE_CATALOG` key。  
- `isEntitled` **永不**读寅币余额。  
- 与 tip gate、Sanctuary gate **零耦合**。

---

## 4. 赚取

只在**已入账完成**时发，不在墙钟 `tick` 上发。挂在控制器钩子（计时达标 / Honesty 呼吸成功 / Arrival Choose / Reflection / 主动 Recover），**不**为发点改 D-01 `DailyCompletionStore` 形状（该表无 source 字段）。

### 4.1 时长

**有效分钟** = 入账 `durationMinutes`，再经 Companion 分档与日封顶。

| 来源 | 规则 |
|---|---|
| 计时达标 · Stay here | 每 **5** 分钟 = 1 点（向下取整） |
| 计时达标 · Across tools | 每 **10** 分钟 = 1 点 |
| 计时达标 · Offline / Honesty 补登 | 每 **10** 分钟 = 1 点；Honesty **自然日最多 1 次发点**；`30+` 按 30 入账 |
| 未达标 Rise | **0**（已有 `onIncompleteSessionEnded`） |

### 4.2 仪式（不惩罚 Skip）

| 节点 | 何时 | 点 | 上限 |
|---|---|---|---|
| Arrive | 未整体跳过且 Choose 有落库 | +2 | 每场计时 1 次 |
| Reflect | 三问至少答 1 题（非 Skip-all） | +2 | 每场计时 1 次 |
| Recover · 主动 | Tiger Anchor 一次 | +1 | 每场 1；自然日 3 |
| Recover · 被动 Re-focus | — | **0** | — |
| 微仪式 | 呼吸结束已记账 | +1 | 自然日 1 |

桥接 Yes 本身不加层；随后计时按 Companion 档发。睡醒 `dormantWake` **不加分**。同日再 Honesty：练习可记，**不再发点**。

### 4.3 同坐回声（非 streak 门）

昨日有练习记录 → 今日第一次合格发点再 **+3**。断日不扣点、不收回资产、无「别断签」文案。

### 4.4 日封顶

| 池 | 上限 |
|---|---|
| 时长点 | **36** |
| Honesty 点 | **3** |
| 仪式点 | **12** |
| **全日合计** | **48** |

超顶：练习与徽章分仍涨，只停发点。无「今日已满快买会员」文案。

---

## 5. 防刷 × 场景 D

Honesty **不是**挂机检测，是别处练习的信任补登。完整 Focus Confidence V1 **未实现**。防刷用已有诚实结构：未达标=0、Companion 分档、Honesty 半额+日限、被动 Recover=0、日封顶。日后 Confidence 只允许作 Stay 档静默折扣，禁止真假专注展示。

---

## 6. 消费目录（全部不可现金买）

基础纪念物按终身分钟 **自动、只增不减**。莲花池 Slice A **不进店**。2026-08-19 起：**叠在花园/序列上的 SKU 退役**（`retired-overlay`）；商店只卖珍藏卡与称号。

| ID | 类型 | 名称 | 价格 | 门槛 | 状态 |
|---|---|---|---|---|---|
| `title.sits-with-yin` | 称号 | 「与阿寅同坐」 | 18 | 练习日 ≥ 3 | **可兑** |
| `title.returned-gently` | 称号 | 「又回来了」 | 30 | 至少 1 次主动 Recover | **可兑** |
| `title.long-sitter` | 称号 | 「久坐的人」 | 360 | `lifetimeMinutes ≥ 600`（不可会员跳过） | **可兑**（不再附金线蒲团） |
| `badge.rare.quiet-pebble` | 稀有章 | 静石小章 | 72 | — | **可兑** |
| `collection.porcelain.qing-vase` | 珍藏静物 | 青瓷瓶（卡面，无声） | 40 | — | **可兑**；不上主坐席 |
| `collection.bronze.ritual-vessel` | 珍藏静物 | 青铜礼器（卡面，无声） | 56 | — | **可兑**；不上主坐席 |
| `gesture.wave-hello` | 闲笔 | 挥手（已入库 `wave-hello`） | 48 | — | **可兑**；L3 珍藏点播；不改 PNG |
| `space.lotus-dew` 等叠层 | — | 晨露 / 暖烟 / 念珠 / 披毯 / 须弥金线 | — | — | **退役**；新兑 `retired-overlay` |

信件 / 静默小册：**后置**（须静态文案 + Quiet Line 历史归档）。抛三色球：**未入库，后置**。

店底须知（L3 文案）：「案头雅物皆由同坐岁月所化，不可借金钱相求。」Lifetime 用户也靠坐禅攒寅币。

---

## 7. 与徽章：同一账本两层

| 层 | 语义 | 实现 |
|---|---|---|
| 标记 | 只增不减，不能花 | 免费练习章 min=1；Tea / Sanctuary 付费视觉包 min=3；芥子印独立 |
| 货币 | 可花余额，留下资产 | 钱包；发点与涨章同一批完成钩子 |
| 周边展示 | Idle 右侧徽章条 | `#yin-tip-kindness-badges`（**不是**改动画；Focusing 隐藏） |
| 珍藏归档 | Yin's Collections | L3 四页签：结缘点缀 / 陪伴称号 / 记忆小册（后置）/ 勋章印记 |

Tea / Sanctuary `badgeIds` **禁止**被点写入。稀有章走 `badge.rare.*`。

---

## 8. 红线（守住「不异化」）

- 不做常驻换装柜、不改已有 PNG 序列。  
- 不做连续签到锁门。  
- 不做抽奖 / FOMO / 季节限时掉落（C 轨）。  
- 不拦截自动纪念物。  
- 不把 B 权益假收费成「用点也能开」。  
- 不把珍藏静物叠回莲花池。

---

## 9. 从设计到可用 · 工作量分级

格式对齐桌面端侧智能体报告：先能证明，再给用户看，最后才谈上架。人天按 **1 名熟悉本仓库的前端**（无 Metal / 无双机型实测）。**这不是两三天糙快版。**

| 级别 | 交付物 | 含什么 | 不含 | 预估 |
|---|---|---|---|---|
| **L0 账本验证** | 纯函数 + 单测，实验室可调数字 | Companion 三档、Honesty 半额/日限、日封顶、回声、稀缺双门槛、`isEntitled` 不读余额的失败用例；SKU schema | 无产品钩子、无 Idle 数字、不改 storage 白名单、不改备份 6 key | **2–4 人日 · 已实现** `focusCoinsLedger.js` |
| **L1 发点接线** | 完成一场坐，钱包会涨（可先无「店」） | 挂计时达标 / Honesty 呼吸成功 / Choose / Reflect / 主动 Recover；localStorage 白名单；flag 默认可关 | 无兑换 UI；不改场景剧本；不把钱包塞进练习备份 6 key | **4–6 人日 · #338 已合**（TRACKER 待人工；高风险邻接：Honesty / 完成记账） |
| **L2 可兑原型** | 内部能花点留下痕迹 | 称号 + 稀有章 + 珍藏静物；叠层 SKU 退役；`title.long-sitter` 双门槛 | 新角色帧换装、主画面叠层 | **已接线 + 2026-08-19 退役叠层** |
| **L3 可给用户看的安静表面** | **Yin's Collections** 个人中心 | #352 抽屉已合；本支改为商店目录（不含退役叠层）+ 结缘语汇 + 挥手 | 换装柜、改 PNG、信件/小册、抛球、B 轨 key | **已接线 · 本支改名/过滤** |

**合计到「内部可用」（L0–L2）**：约 **10–16 人日** ≈ **2.5–4 周日历**（一人，含回归；L1 勿与其它 Honesty 大改叠车）。  
**到可给真实用户**：再加 L3；**不得**早于 L0 单测锁住防刷表。

**L0 失败判据**（任一条即停、改数字或砍范围，禁止带着错表接 L1）：

- 未达标 Rise 仍能发点  
- Honesty 同日第二次仍发点  
- `isEntitled('ambient.deep.play')` 可被余额或 SKU 满足  
- 稀缺称号 `title.long-sitter` 可只花点、或只靠时长、或会员跳过  
- 退役叠层（晨露等）仍能新兑成功  
- `emotion.premium.trigger` 仍在 `FEATURE_CATALOG`  

切片须走 `RISK_MITIGATION_PLAYBOOK.md`：L0 = Lab 逻辑；**L1 才碰产品钩子**；禁止先挂 Idle 数字再补防刷表。

---

## 10. 与桌面智能体排期对照（同一张表）

桌面数字摘自 2026-08-18 端侧 AI 陪伴智能体调研稿（L0–L3；该课题产品层仍待人设拍板）。人天口径相同（一人）。

| 课题 | L0 | L1 | L2 | L3 | 到内部可用 | 到可上架 / 给用户 | 现在能否开工 |
|---|---|---|---|---|---|---|---|
| **寅币 / Yin's Collections** | 2–4 人日 · 纯账本 **（L0 已合 #335）** | 4–6 · 发点钩子 **（L1 #338 已合）** | 4–6 · 兑换 **（L2 #339 已合）** | 3–5 · Collections 表面 **（#352 已合；本支改名/过滤）** | **10–16 人日 · 约 2.5–4 周** | L3 后；无第三方模型风险 | 叠层已退役；L1 TRACKER 待人工 |
| **桌面端侧智能体** | 2–4 · Metal 探针 | 4–7 · desktop-only 面板 | 8–12 · 人设混合路由 | 8–15 · 生产隔离 | **14–23 人日 · 约 3–5 周** | 依赖定位修订 + 桌面步骤 B 托盘 | **仅宜 L0 实测**；入口未拍板 |

**我认为最合理的统筹**：先开 **寅币 L0**（不挡收费 DMG、不碰 Electron、回归面在单测里可锁死）。桌面智能体等机型实测 +「禅意倾听者」书面修订后再 L1。寅币 **L1 硬闸**：开分支前必须书面扫 Honesty / `DailyCompletionStore` / `PracticeDaysStore` 邻接是否有并行 PR（分析师 2026-08-18；口头注意不算过闸）。两个课题都不要插队挡住桌面步骤 B（托盘 = 收费 DMG 前提）。

---

## 11. 工程落点

- **L0（已合 #335）**：`src/core/focusCoinsLedger.js` + 单测。  
- **L1（已合 #338）**：`FocusCoinsStore` + `applyFocusCoinsGrant` 挂计时达标 / Honesty 呼吸成功 / Choose / 达标 Reflect / 主动 Recover / 微仪式。已进 `localStateKeys`（L-01）。`?focusCoins=0` 关闸。  
- **L2（已合 #339）**：`applyFocusCoinsRedeem` 写入 `ownedIds`。叠层 SKU 新兑 `retired-overlay`；晨露/金线滤镜不再上主画面。可兑称号、稀有章、瓷器/青铜器静物、挥手闲笔。`title.long-sitter` 仍双门槛。控制台 `__focusCoins.redeem(skuId)`。Tea / Sanctuary `badgeIds` 不写。  
- **L3（#352 已合；本支修订）**：⋯ / 抽屉 **Yin's Collections / 阿寅的珍藏** → `#yin-coin-panel`（Journey 同族玻璃，z=18）。目录只列 `listShopFocusCoinSkus()`（不含退役叠层）。不足/未达门槛：按压 + 具体缺口句 + toast。称号 Wear。结缘动词 Bond。`?focusCoins=0` 隐藏菜单行。练习备份 6 key **仍不扩**。  
- Feature flag：`FOCUS_COINS_AWARD_ENABLED`（默认开）+ 查询串覆盖；关 = 完全不写钱包（发点与兑换），L3 菜单行亦不出现。  
- 单测优先于 e2e；L3 DOM 以 `focusCoinsSurface.test.js` / `FocusCoinsPanelUI.test.js` 为主；完整用户链路须人工。

---

## 12. 明确不做（本系统）

换装柜 · 连续日解锁 · 抽奖/FOMO · 用点买 B 权益 · 请茶充点 · AI 次数包 · 报表 SKU · 改已有 PNG / 蒲团扣子 / 花园叠层 · 两三天「先上金币再补防刷」。
