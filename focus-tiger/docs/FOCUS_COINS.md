# 同坐点（Focus Coins）· 产品设计 SSOT

> **状态：方向锁（2026-08-18）** — 六项拍板已书面同意；本文为语义权威。运行时未接线。  
> **内部名**：Focus Coins。**对外名（硬）**：**同坐点**。禁止金币 / 积分 / 商城 / 抽奖口吻。  
> **工程 Brief**：[`task-briefs/task-focus-coins.md`](./task-briefs/task-focus-coins.md)（L0–L3 切片 + 工作量分级）。  
> **禁止**：用同坐点满足任何 `isEntitled(featureKey)`；不建 entitlement gate key；L0–L2 **不**改 `SCENARIO_TESTS.md`（L3 表面若需场景附录另开）。

从属：`MVP_PRODUCT_DEFINITION.md` §五 · `FREE_PAID_MATRIX.md` · `FEATURE_CATALOG` · 场景 D / `HONESTY_BRIDGE_CTA.md` · `practiceBadgeAward.js`（`computePracticeScore`）· `PRINCIPLES.md` 宁静型游戏化。

---

## 0. 冲突扫描（实现前 · 已拍板）

对照 `SCENARIO_TESTS.md` 相邻路径。用户 2026-08-18 已同意六个方向问题；本扫描记录为何可往下排期，不是再开放口。

| 轴 | 相邻场景 | 风险 | 处置（已锁） |
|---|---|---|---|
| **a. 强度** | 场景 A 完成庆祝；被动 Re-focus；主动 Recover | 商城/钱包若比完成仪式更响，会把专注做成刷分 | 入口放抽屉次级；无倒计时/抽奖；日封顶静默；被动 Recover **0 点** |
| **b. 人设** | Honesty「别处也算数」；观察式文案 | 「赚/花」易变监工 | 对外「同坐点」；不怀疑补登；不展示真假专注分 |
| **c. 职责** | 练习徽章；芥子印；纪念莲花/香炉；Seasonal Theme（B）；Honesty 补登 | 两套账本 / 把免费纪念改成花钱买 / 积分买会员权益 | **同一账本两层**；自动纪念不拦截；B 轨逐条排除；Honesty 半额+日限 1 次发点 |

**PR 第三问可写**：对照 A / D / Idle 徽章 / 纪念 Backlog / Seasonal Theme；三轴有张力，用户已拍板隔离 + 克制表面。

---

## 1. 心智（第三轨，不是第三档付费）

| 轨 | 是什么 | 同坐点关系 |
|---|---|---|
| **A · Tea** | 打赏；不解锁 | 不得互兑 |
| **B · Lifetime ∪ Membership** | 进阶能力 / 场域 | **永远买不到** |
| **C · 同坐点** | 练习换来的情感货币 | 只买身份/空间变体/称号/稀有练习章 |

不是 `FEATURE_CATALOG` 的 `requiredTier`。SKU 命名空间：`cosmetic.*` / `title.*` / `badge.rare.*`。

---

## 2. 六项拍板（2026-08-18 · 硬）

1. **隔离清单按 §3 冻结**（对照真实 entitlement 逐条排除）。  
2. **Honesty 半额 + 自然日最多 1 次发点**（补登善意保留，货币收紧）。  
3. **连续日只 +3 同坐回声，不当解锁/惩罚门**。  
4. **商城不拦截自动纪念物**（莲花/香炉等仍免费自动出现；只卖变体/称号/稀有章）。  
5. **与练习徽章同一体系两层**（徽章=不可花的标记；同坐点=可消费货币；共用 `PracticeDaysStore` / `computePracticeScore`）。  
6. **对外名「同坐点」**，不改回「积分」。

---

## 3. 付费专属排除清单（Coins 禁止满足 `isEntitled`）

### 3.1 Catalog B 轨

| featureKey | 用户能感到的 | Coins |
|---|---|---|
| `ritual.morning.access` | Morning Ritual | 排除 |
| `ritual.emotional-reset.access` | Emotional Reset | 排除 |
| `ritual.work-transition.access` | Work Transition | 排除 |
| `ambient.deep.play` | 深度音效全库（免费仅 5 首） | 排除 |
| `emotion.premium.trigger` | 高级情绪（占位） | 排除；禁止当未接线权益后门 |
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
- `isEntitled` **永不**读同坐点余额。  
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

## 6. 消费目录（示例；全部不可现金买）

基础纪念物仍按纪念奖励 **自动、只增不减**。**莲花池 Slice A（#330）已按终身分钟自动开花**——`space.lotus-dew` 只叠在已有朵上，**禁止**把开花改成花点才出现。香炉等同理。同坐点只买变体 / 阿寅轻点缀 / 称号 / `badge.rare.*`。

不做 v1 换装柜、不多角色、不随机箱、不限时折扣。

| ID | 类型 | 名称 | 价格 | 额外门槛 | 现金 |
|---|---|---|---|---|---|
| `space.incense-tint-warm` | 空间变体 | 香炉暖烟 | 24 | 已有纪念香炉或练习分 ≥ 3 | 不可 |
| `space.lotus-dew` | 空间变体 | 莲叶晨露 | 48 | 已有首朵莲花 | 不可 |
| `yin-accent.wood-beads` | 阿寅点缀 | 木念珠 | 36 | — | 不可 |
| `yin-accent.folded-cloak` | 阿寅点缀 | 脚边叠好的浅灰披毯（≠ DORMANT 睡姿） | 60 | 至少 1 次 Honesty 睡醒 | 不可 |
| `title.sits-with-yin` | 称号 | 「与阿寅同坐」 | 18 | 练习日 ≥ 3 | 不可 |
| `title.returned-gently` | 称号 | 「又回来了」 | 30 | 至少 1 次主动 Recover | 不可 |
| `badge.rare.quiet-pebble` | 稀有练习章 | 静石小章（视觉独立于 Tea / Sanctuary 包） | 72 | — | 不可 |
| **`space.sumeru-cushion` + `title.long-sitter`** | **高门槛稀缺** | 金线蒲团「须弥坐」+「久坐的人」 | **360** | **`lifetimeMinutes ≥ 600` 且不可单用点或单用时长跳过** | **不可现金 / 会员赠送 / 请茶兑换** |

稀缺款与芥子须弥印（`score ≥ 21`、自动、不进商城）并列，不合并。兑换后只增不减；称号一次只装备一个。

明确不进目录：深度音效、三进阶仪式、节日主题、Enso、Sanctuary/Tea 章包、多端同步、Journey 无限历史、AI 次数、报表。

---

## 7. 与徽章：同一账本两层

| 层 | 语义 | 实现 |
|---|---|---|
| 标记 | 只增不减，不能花 | 免费练习章 min=1；Tea / Sanctuary 付费视觉包 min=3；芥子印独立 |
| 货币 | 可花余额，留下资产 | 新钱包；发点事件与涨章同一批完成钩子 |

Tea / Sanctuary `badgeIds` **禁止**被点写入。稀有章走 `badge.rare.*`。

Idle：现有章继续做「谁陪过你」；同坐点用极小数字或一粒香点，不开街机钱包。

---

## 8. 红线（守住「不异化」）

- 不做常驻换装柜。  
- 不做连续签到锁门。  
- 不做抽奖 / FOMO / 稀缺倒计时。  
- 不拦截自动纪念物。  
- 不把 B 权益假收费成「用点也能开」。

---

## 9. 从设计到可用 · 工作量分级

格式对齐桌面端侧智能体报告：先能证明，再给用户看，最后才谈上架。人天按 **1 名熟悉本仓库的前端**（无 Metal / 无双机型实测）。**这不是两三天糙快版。**

| 级别 | 交付物 | 含什么 | 不含 | 预估 |
|---|---|---|---|---|
| **L0 账本验证** | 纯函数 + 单测，实验室可调数字 | Companion 三档、Honesty 半额/日限、日封顶、回声、稀缺双门槛、`isEntitled` 不读余额的失败用例；SKU schema | 无产品钩子、无 Idle 数字、不改 storage 白名单、不改备份 6 key | **2–4 人日** |
| **L1 发点接线** | 完成一场坐，钱包会涨（可先无「店」） | 挂计时达标 / Honesty 呼吸成功 / Choose / Reflect / 主动 Recover；localStorage 白名单；flag 默认可关 | 无兑换 UI；不改场景剧本；不把钱包塞进练习备份 6 key | **4–6 人日**（高风险：Honesty / 完成记账邻接） |
| **L2 可兑原型** | 内部能花点留下痕迹 | 称号 + 稀有章 + 至少 1 个空间变体；稀缺款双条件；与 Tea/Sanctuary 章包隔离 | 新角色帧换装、完整纪念物美术、云备份升 schema | **4–6 人日**（无新序列）；新点缀美术另 **+3–8** |
| **L3 可给用户看的安静表面** | 抽屉「同坐点」+ 装备称号 | i18n en/ja、375 抽屉不挡主球、0–1s 按压、只增不减回流；可选并入练习备份 schema v2 | 换装柜、场景 D 改写、B 轨任何 key | **3–5 人日** |

**合计到「内部可用」（L0–L2）**：约 **10–16 人日** ≈ **2.5–4 周日历**（一人，含回归；L1 勿与其它 Honesty 大改叠车）。  
**到可给真实用户**：再加 L3；**不得**早于 L0 单测锁住防刷表。

**L0 失败判据**（任一条即停、改数字或砍范围，禁止带着错表接 L1）：

- 未达标 Rise 仍能发点  
- Honesty 同日第二次仍发点  
- `isEntitled('ambient.deep.play')` 可被余额或 SKU 满足  
- 稀缺款可只花点、或只靠时长、或会员跳过  

切片须走 `RISK_MITIGATION_PLAYBOOK.md`：L0 = Lab 逻辑；**L1 才碰产品钩子**；禁止先挂 Idle 数字再补防刷表。

---

## 10. 与桌面智能体排期对照（同一张表）

桌面数字摘自 2026-08-18 端侧 AI 陪伴智能体调研稿（L0–L3；该课题产品层仍待人设拍板）。人天口径相同（一人）。

| 课题 | L0 | L1 | L2 | L3 | 到内部可用 | 到可上架 / 给用户 | 现在能否开工 |
|---|---|---|---|---|---|---|---|
| **同坐点** | 2–4 人日 · 纯账本 | 4–6 · 发点钩子 | 4–6 · 兑换 | 3–5 · 安静表面 | **10–16 人日 · 约 2.5–4 周** | L3 后；无第三方模型风险 | **可以：先 L0**（方向已锁） |
| **桌面端侧智能体** | 2–4 · Metal 探针 | 4–7 · desktop-only 面板 | 8–12 · 人设混合路由 | 8–15 · 生产隔离 | **14–23 人日 · 约 3–5 周** | 依赖定位修订 + 桌面步骤 B 托盘 | **仅宜 L0 实测**；入口未拍板 |

**我认为最合理的统筹**：先开 **同坐点 L0**（不挡收费 DMG、不碰 Electron、回归面在单测里可锁死）。桌面智能体等机型实测 +「禅意倾听者」书面修订后再 L1。同坐点 **L1** 避开正在改 Honesty / 完成记账的其它 PR。两个课题都不要插队挡住桌面步骤 B（托盘 = 收费 DMG 前提）。

---

## 11. 工程落点（确认后按 Brief 做；本文不写代码）

- Store 建议：`focus-tiger.focus-coins.v1`（余额、流水、已兑 SKU、装备中的称号）。L1 才进 `localStateKeys`（L-01）。  
- 练习备份 6 key：**L1 不扩**；是否 schema v2 并入钱包放到 L3 再决。  
- Feature flag：表面挂载（对齐 Confide 的 mount 闸）；关 flag = 完全回到无同坐点正式路径。  
- 单测优先于 e2e；L3 若要 DOM 断言，单文件 spec，遵守本地 e2e 硬顶。

---

## 12. 明确不做（本系统）

换装柜 · 连续日解锁 · 抽奖/FOMO · 用点买 B 权益 · 请茶充点 · AI 次数包 · 报表 SKU · 改场景 D 剧本（除非 L3 另开场景附录）· 两三天「先上金币再补防刷」。
