# Task Brief · 技术方向纪要（v1 壳 / 商业化 / 健康同步）

> **状态（2026-08-10 修订）**：双轨仍为 **A Tip/Tea（不解锁）+ B 进阶内容解锁**；B 下 **Sanctuary Lifetime** 买断 ∪ **Yin Membership** 订阅并存、互覆盖。founder → `feature/yin-tip-jar`；§2.6 **Gate 零耦合**（tip ↔ 解锁）为 Code Review 必检条款。  
> **触发**：推翻「v1 仅 Lifetime / 无订阅」；订阅纳入 v1，仍维持双轨心智（非「三档并存」）。  
> **权威**：本文件 + `PROCESS.md` + `MVP_PRODUCT_DEFINITION.md` §五。

---

## 权威边界（先读）

| 项 | 口径 |
|---|---|
| v1.0.0 交付默认形态 | **纯 Web**；**不上** App Store / Play 原生包 |
| 手机原生壳 | v1 **不实现**；未来默认 **Capacitor** |
| 桌面壳 | **已拍板 Electron**（2026-08-16；Mac DMG / electron-builder）。Tauri 日后备选；PWA 非电脑版终局。见 `PROCESS.md` + `task-desktop-shell-electron.md` |
| 健康同步 | **非 v1**；**禁止**写入 B 付费权益 |
| **商业双轨（硬）** | **A** Buy Yin a Tea（不解锁）+ **B** 进阶内容解锁。**两者都要**，不二选一。**不是**「三档并存」 |
| **A** | 打赏；情绪反馈 + 可选徽章；**不解锁**任何内容 |
| **B** | 深度美学/音效/进阶仪式等解锁；真 entitlement |
| **B 付费方式（v1 硬）** | **Sanctuary Lifetime** 一次买断 **∪** **Yin Membership** 订阅；二者解锁**同一套**进阶内容；**lifetime ∪ subscription 互相覆盖** |
| **B 权益（v1）** | ① 深度音效全库 ② 高级情绪动画/场景（已划界、非核心） ③ 尊贵徽章/身份标识 ④ 进阶仪式等（catalog `requiredTier: 'subscription'` 为正式产品决定） |
| **订阅到期降级（v1 硬）** | 已生成内容（历史、已解锁纪念物、已播放仪式）**永久可看**；到期只停「新内容持续解锁」与「进阶功能继续使用」 |
| **A→B 24h 体验卡** | **非 v1**；阶段 2 候选（见 §2.7） |
| **解锁触发** | **禁止**连续/断签式解锁或惩罚；不留 `streak` 解锁接口空位 |
| 账号 | **无账号**；邮箱仅恢复 tip / Sanctuary 购买记录 |
| 并行分支 | **A**：`feature/founder-supporter-pack` → 改道 **`feature/yin-tip-jar`**（Tea/Tip 语义）；**B**：另开 **`feature/yin-sanctuary-lifetime`**（不复用 tip gate） |
| **工程命名** | 对内可用中性 `tipGate` / `sanctuaryEntitlementGate`；**对外文案只走 i18n**，不强制与变量名逐字一致 |
| 电子书 ②B | **已取消**（不改造成非 streak）；解锁只跟付费（B）绑定 |

---

## 相对历史口径：纠正清单

| 旧口径 | 纠正后 |
|---|---|
| 只留 Sanctuary 单名 / founder 并入 Sanctuary | **已废止**。现为 **A Tip + B 进阶解锁双入口并存**；founder **不**改名为 Sanctuary |
| Lifetime 为主、订阅非首选 | **已废止（2026-08-10）**。现为 Lifetime 买断 **∪** Yin Membership 订阅并存（同一套 B 权益） |
| v1 完全不做订阅；仅 Lifetime（B） | **已废止（2026-08-10）**。Yin Membership 正式纳入 v1；catalog `subscription` 档为产品决定 |
| 可选「请茶→24h 体验卡」漏斗 | **v1 不做**；记阶段 2 候选 |
| Pass 权益含 Apple Health | **删除**；纯 Web 做不到 |
| B 可复用 A 的 tip boolean / 乐观 query | **禁止**；B 独立 entitlement + 服务端校验 |
| 电子书 ②B 连续练习解锁 / 非 streak 改造 | **直接取消**；不保留改造选项 |

---

## 一、壳与发布形态

1. v1 默认 **纯 Web**。  
2. 未来手机壳默认 **Capacitor**。  
3. 桌面壳 **已拍板 Electron**（Mac DMG · #326）；脚手架规格 `task-electron-desktop-scaffold.md`（运行时另开实现回合）。PWA 不是电脑版终局。  

**v1 纯 Web 不可用（不得写入付费卖点）**：HealthKit / Health Connect；StoreKit / Play Billing；系统 Widget / Live Activities；「一键发到指定社交 App」核心承诺。

---

## 二、商业化 · 双轨详规

### 2.0 为什么两者不冲突（心理 + 梯队）

| | **A · Buy Yin a Tea** | **B · 进阶内容解锁** |
|---|---|---|
| 心理触发 | **利他与感激**（Altruism & Gratitude）——「太治愈了，想回馈」 | **自我效能与美学享受**（Self-improvement & Aesthetic Enjoyment）——要更深场域/音效/身份 |
| 用户梯队 | 轻度 / 预算敏感：小额打破零付费壁垒 | 深度美学 / 深度专注：为工具与场域价值买单 |
| 超级粉丝 | 已购 B（Lifetime 或 Membership）后仍可**额外请茶**（情绪时刻） | 收入支柱（Lifetime 买断 ∪ Yin Membership 订阅） |
| 产品角色 | **情绪润滑剂**（Emotional Revenue） | **收入支柱**（Base Revenue） |

设计得当则互补；冲突只来自 **UI 混成「买了还要买啥」**——靠入口位置与文案层级拆开（§2.3）。

### 2.1 选择 A — Buy Yin a Tea（打赏）

| 项 | 口径 |
|---|---|
| 商品性质 | 小额 **一次性** tip；可多次请茶 |
| 卖点 | 心理满足 + **可选茶饮徽章**；**不解锁**音效/动画/场景 |
| 定价数字 | **不锁**；待定 |
| 本地/云记录（轻量） | `{ tipped: true, tipCount, lastTippedAt }`（可加 email 绑定用于找回）；**禁止**挂到内容解锁 gate |
| 工程分支 | **`feature/founder-supporter-pack` → 改名为 `feature/yin-tip-jar`**（对外 Tea/Tip；对内 `tipGate`）；**禁止**改成 Sanctuary 命名 |

#### 打赏触发（情境化 · 硬）

三类植入，**不得**主界面常驻抢戏：

1. **里程碑时刻**（例：当周第 7 次练习、个人最长专注记录）——可在庆祝 / Reflection **底部轻露**  
2. **Honesty Check-in / 休整归来**——唤醒后轻度互动  
3. **关于页 / About & Credits 底部** Tip Jar  

**形态（硬 · 过红线）**：

- **一次性温和提示**；用户可忽略 / 关掉  
- **不是**强制弹窗、不是挡主路径的 modal 墙  
- **禁止**任何「不打赏就怎样」暗示  
- 对齐商业化红线：不用衰败/离开逼付费、不用倒计时/抽奖、不用稀缺 FOMO  

### 2.2 选择 B — 进阶内容解锁（Sanctuary Lifetime ∪ Yin Membership）

| 项 | 口径 |
|---|---|
| 正式名（买断 SKU） | **Yin's Sanctuary** / Sanctuary Lifetime |
| 正式名（订阅 SKU） | **Yin Membership** |
| 内容层级 | **同一层**进阶解锁（深度音效 / 高级表现 / 徽章 / 进阶仪式等）；**禁止**把订阅理解成「少一档」或买断「多一档」 |
| 买断 | Sanctuary Lifetime：Stripe `mode=payment`；一次买断 |
| 订阅 | Yin Membership：Stripe 订阅；**v1 正式纳入**（续费/取消/宽限期按 entitlement 双宽限等实现） |
| 互覆盖 | lifetime ∪ subscription **互相覆盖**任一 `requiredTier` 为 paid 的进阶键（free 仍 free） |
| 到期降级 | 已生成 / 已拥有（persistent ownership）**永久可看**；ongoing 访问在订阅失效（含宽限结束后）停止 |
| 定价数字 | **不锁**；待定 |
| 工程 | Sanctuary lifetime gate + 统一 `src/core/entitlement/`；**不**复用 tip-jar 的 tip 状态解锁内容 |

#### B 权益清单（v1 · 内容面）

1. **深度音效全库**（免费保留足够温暖的子集）  
2. **高级情绪动画 / 场景**（已划界、**非核心**路径；名单另定）  
3. **尊贵徽章 / 身份标识**  
4. **进阶仪式等**（Morning / Emotional Reset / Work Transition 等；catalog 标 `subscription` 为正式产品决定）  
5. **节日主题引擎（Seasonal Theme）**（2026-08-11 排期）：节日窗口内 App **内部**装饰/姿态/文案；**Sanctuary Lifetime ∪ Yin Membership** 解锁；catalog 建议 `theme.seasonal.access`（ongoing）。权威 Brief：`task-seasonal-theme-engine-v1.md`。**不**含主屏幕 PWA 图标远程更换。

**明确删除 / 禁止写入**：Apple Health 深度同步；课程墙；AI Coach；报表；换装大系统；抽奖加速；365 天路线。

**免费底线（硬）**：Sit、Arrival、基础 Idle、Honesty、每日首次庆祝等 **不得**付费墙。

### 2.3 UI 防混淆（入口 / 视觉层级）

| | A Tea | B 进阶解锁（Lifetime ∪ Membership） |
|---|---|---|
| 层级 | **微交互 / 情境提示**（小、可忽略） | **主商业门**（锁项处、明确权益卡；可同时呈现买断与订阅） |
| 位置 | 里程碑底条 · Honesty 归来轻提示 · About **最底部** Tip Jar | Soundscape / 场景 **锁项**点击 → Unlock 卡；（未来）设置顶 Banner；Idle ⋯ **可有一项但不挡 Sit** |
| 文案 | “Buy Yin a tea?” / Thank Yin | Sanctuary Lifetime / Yin Membership + **同一套**权益说明（勿暗示订阅少一档） |
| 已购 B | 可默认高阶茶徽章；**仍可**请茶 | 锁项打开；lifetime 或 subscription 任一生效即解锁 |

**禁止**：Idle 首页两个平铺主 CTA；让用户以为「请茶 = 买了全库」；强迫已购 Pass 再请茶才能用核心功能。

### 2.4 B Entitlement schema（方向 · 真校验）

```ts
{
  unlocked: boolean,
  unlockedVia: 'payment' | 'preview',
  unlockedAt: string, // ISO
  itemId: string // e.g. 'yin-sanctuary-lifetime'
}
```

- `payment`：Checkout Session **服务端确认**后写入  
- `preview`：研发赠送  
- **v1 不出现** `tea-trial`（24h 漏斗非 v1）  
- **禁止** `streak` / `checkin` / `login-days`

### 2.5 A Tip 记录 schema（轻量 · 不进内容 gate）

```ts
{
  tipped: boolean,
  tipCount: number,
  lastTippedAt: string // ISO
}
```

徽章展示只读 tip 状态；**Ambient / 动画 dispatcher 禁止读 tip 决定是否解锁内容**。

### 2.6 共享支付层 vs 分离 gate（硬）

| 层 | 归属 | 说明 |
|---|---|---|
| **公共 payment 工具** | 可抽 `cloud/` 共享 | Stripe Checkout 创建会话、Webhook 验签、CORS、限流、secrets 模式——**tip-jar 与 sanctuary 各自调用** |
| **A tipJarGate** | 仅打赏 | 状态判断、`localStorage` key、UI 入口、KV tip schema **独立**（文件名亦可简写 `tipGate.js`，与本表等价） |
| **B sanctuaryEntitlementGate** | 仅解锁 | 状态判断、`localStorage` key、UI 入口、KV entitlement schema **独立** |

**禁止**：合并成一个「统一付费入口」或一个 gate 同时管 tip + unlock。

#### 硬技术约束 · Gate 零耦合（Code Review 必检 · 2026-08-07 用户确认）

> **条款（可审查原文）**：  
> `sanctuaryEntitlementGate` 及其相关模块（UI、cloud sanctuary 路由、ambient/动画消费侧）**不得** `import`、读取或以任何方式依赖 `tipJarGate` / `tipGate` 的状态（`tipped` / `tipCount` / `lastTippedAt` 等）。  
> 两者的「是否已解锁内容 / 是否已打赏」判断逻辑必须 **完全独立运算**。  
> **不允许**「打赏过给折扣 / 额外权益 / 试用时长」这类隐性耦合逻辑，**除非未来单独立项拍板**（例：阶段 2 的 A→B 24h 体验卡须另开 Brief，不得在未立项时塞进任一门闩）。

**Code Review 检查项（合 tip-jar / sanctuary PR 时勾选）**：

- [ ] `rg`：`sanctuaryEntitlementGate` / `SanctuaryUnlockUI` / sanctuary cloud 路由 **无** `tipJar`、`tipGate`、`tip-jar`、`tipped`、`tipCount`、`supporterGate` 引用  
- [ ] `rg`：`tipJarGate` / `TipJarUI` / tip cloud 路由 **无** `sanctuary`、`unlockedVia`、`sanctuary-entitlement` 引用（支付公共层文件名除外，且公共层不得读 tip 写 sanctuary）  
- [ ] Ambient / Emotion / 场景 dispatcher **只读 B** entitlement；**零** tip 分支  
- [ ] 无「if tipped then discount / bonus unlock」类逻辑  
- [ ] 单元测试静态隔离断言已绿（见下「硬约束 · 单元测试兜底」）

Ambient / 动画 **只读 B**；**禁止**读 A tip 决定内容解锁（上列条款的产品侧说法）。


#### 第4点确认表 · Gate 独立性（合并 docs PR 前请过目）

> **现状（诚实）**：两套 gate **尚未**作为已实现的双模块并存。  
> - `origin/develop`：**无** Tea / Sanctuary gate 运行时。  
> - `feature/founder-supporter-pack`：仅有 **一套** `supporterGate.js` + `SupporterPackUI.js`（将改道为 A）。  
> - Sanctuary：**计划新建**，代码里 **还不存在**。  
> 因此「现在是否已经完全独立」的答案是：**目标架构已锁为完全独立；实现上目前只有 A 的前身，B 为零耦合（因未出生）。** 合并本 docs 后，改道/新建须按下表执行，验收时用 `rg` 确认无交叉 import。

| | **A · Tea / Tip Jar（计划）** | **B · Sanctuary（计划）** |
|---|---|---|
| Gate 文件 | `src/core/tipJarGate.js`（由 `supporterGate.js` 改道；可别名 `tipGate.js`） | `src/core/sanctuaryEntitlementGate.js`（**新建**） |
| UI 组件 | `src/ui/TipJarUI.js` / `#yin-tip-jar-card` | `src/ui/SanctuaryUnlockUI.js` / `#yin-sanctuary-card` |
| **localStorage key** | **`focus-tiger.tip-jar.v1`** | **`focus-tiger.sanctuary-entitlement.v1`** |
| **数据结构** | `{ tipped: boolean, tipCount: number, lastTippedAt: string \| null, email?: string \| null, source?: 'checkout-return' \| 'email-restore' \| 'manual' \| null }` | `{ unlocked: boolean, unlockedVia: 'payment' \| 'preview', unlockedAt: string \| null, itemId: string }`（例 `itemId: 'yin-sanctuary-lifetime'`） |
| 读内容解锁？ | **禁止**（Ambient/动画不得读 A） | **是**（仅 B） |
| 校验强度 | 徽章级；乐观 `?tip=1` 可接受 | **必须**服务端确认 Checkout Session |
| Import 规则 | **不得** import B gate/UI | **不得** import A gate/UI |
| 今日已有代码 | `supporterGate.js` key=`focus-tiger.supporter-status.v1`；schema=`{ supporter, email, purchasedAt, verifiedAt, source }` —— 改道时 **换新 key**，勿与 B 共用 | **无文件** |

**前身对照（仅 A，改道前）**：

```text
文件: focus-tiger/src/core/supporterGate.js
key:  focus-tiger.supporter-status.v1
值:   { supporter, email, purchasedAt, verifiedAt, source }
UI:   SupporterPackUI.js
```

**改道后 A（目标）**：

```text
文件: focus-tiger/src/core/tipJarGate.js
key:  focus-tiger.tip-jar.v1
值:   { tipped, tipCount, lastTippedAt, email?, source? }
UI:   TipJarUI.js
```

**新建 B（目标）**：

```text
文件: focus-tiger/src/core/sanctuaryEntitlementGate.js
key:  focus-tiger.sanctuary-entitlement.v1
值:   { unlocked, unlockedVia, unlockedAt, itemId }
UI:   SanctuaryUnlockUI.js
```

唯一允许共享：`cloud/` 支付工具层（建 Checkout / 验签 / 限流）——**分 Price、分 success URL、分 webhook 分支、分 KV value**；前端两套 gate **零互相 import**。

#### 硬约束 · 单元测试兜底（B 模块开工时一并做 · 非本 docs 回合）

等 `sanctuaryEntitlementGate.js` **真正写出来后**，须在 **A 与 B 各自的单元测试**里各加至少一条断言：

- 模块源码（或依赖图）中 **没有** `import` / `require` 对方（例：读 `tipJarGate.js` 文本不得匹配 `sanctuaryEntitlement`；读 `sanctuaryEntitlementGate.js` 不得匹配 `tipJar` / `tipGate` / `supporterGate`）；  
- 可用简单静态字符串检查或小型依赖图扫描，**不必**上重量级 bundler 分析。  

目的：把「互相禁止 import」从 Brief 一句话变成 **有测试兜底的硬约束**。可放在 `feature/yin-sanctuary-lifetime` 开工时同批落地，**现在不必实现**。

### 2.7 `feature/founder-supporter-pack` → A Tip Jar：复用评估

| 能力 | 复用度 | 说明 |
|---|---|---|
| Stripe Checkout 一次性 `mode=payment` | **高** → 抽进公共层后由 tip 调用 | 改 Price / 文案 / success URL 对应「请茶」 |
| Webhook 验签骨架 | **高** → 公共层 | tip 与 sanctuary **分 handler / 分 Price id / 分 KV value** |
| 邮箱 verify 模式 | **高** | tip 用 tip schema；sanctuary 用 entitlement schema——**分路由或分 path** |
| 限流 / CORS / secrets / wrangler | **高** | 公共配置 |
| 前端 `supporterGate` | **中** → 改 `tipGate` | **仅** tip/徽章；禁止被 ambient 消费 |
| UI / i18n / 菜单 | **低～中** | Founder/Supporter → Tea/Tip（i18n）；入口改为情境 + About 底 |
| 乐观 `?supporter=1` | **仅 A 可接受** | 徽章无内容价值；**不得**拷到 B |

**结论**：分支 **改道为 tip-jar，不推倒、不改名为 Sanctuary**。B **新建**，只共享 payment 工具层。

### 2.8 阶段 2 候选（非 v1）· 请茶 → 24h 体验卡

> **想法**：未购 B 的用户打赏后，赠送短时（如 24h）深度音效/场景体验，作为 A→B 转化漏斗。  
> **v1 范围**：**不做**。v1 先让 A/B **两个入口独立跑**。  
> **阶段 2** 再评估；若做，须禁焦虑倒计时话术。

---

## 三、健康同步（非 v1）

未来 Capacitor；不替代 Honesty；**不进 B 权益文案**。

---

## 四、增长内容 / 低风险增发（与 Stripe 无关）

下列 **不依赖 Stripe secrets**，可与支付线并行排期：

| 项 | Brief | 风险感 |
|---|---|---|
| 「?」简介文案 + 应用内 Privacy | `task-in-app-privacy-and-purpose-copy.md` | **低** |
| Reflection 通用共鸣 | `task-reflection-echo-copy-pool.md` | **低** |
| 壁纸免费赠送 | `task-digital-wallpapers-gift.md` | **低** |

增长包 Zen Cinema / Quiet Line / **仅 ②A 电子书免费下载** 见 `task-growth-content-pack-decision.md`。  
**②B 电子书连续练习解锁：已取消**（2026-08-07）——解锁只跟付费（B Sanctuary）绑定，不再叠加练习时长/频率门槛。

---

## 五、阶段 2 设计原则（摘要）

允许：Tea tip（A）/ Sanctuary Lifetime 与 Yin Membership（B · 同一套进阶权益）/ 未来可选 tea-trial。  
禁止：连续 N 天解锁、断签收回/羞辱、打卡日历当付费门闩、任何 streak 解锁 API。

---

## 六、本纪要明确不做（v1）

- A→B 24h 体验卡导流  
- Apple Health / Widget 当付费卖点  
- 用 A tip 状态解锁 B 内容  
- 打赏强制弹窗 / 「不打赏就怎样」  
- 付费锁核心练习路径  
- 把 tip-jar 分支改名为 Sanctuary / 合并成单入口  
- 把 Lifetime 与 Membership 做成**不同内容层级**（「订阅少一档」心智）  
- 电子书 ②B（已取消）  
- 未拍板定价数字上线  
- Capacitor 手机壳脚手架（未另下令）；桌面 Electron 脚手架规格见 `task-electron-desktop-scaffold.md`（本纪要不自动写窗口代码）  

---

## 七、实现开工口令（§八确认 + 过目后）

1. **改道** `feature/founder-supporter-pack` → `feature/yin-tip-jar`（Tea/Tip i18n + `tipGate` + 情境触发 + tip schema）  
2. **新开 / 推进** Sanctuary Lifetime（`sanctuaryEntitlementGate` + Lifetime 真校验 + 音效/高级表现消费）  
3. **推进** Yin Membership 订阅（Stripe 订阅 + 统一 `entitlement` 消费；与 Lifetime 互覆盖）  
4. 低风险增发可另开：Privacy / Reflection echo / 壁纸  

---

## 八、改名清单（双表 · **已确认可执行** · 2026-08-07）

> 原则：对内可用中性标识符；**对外展示措辞只走 i18n**（Tea / Sanctuary）。  
> **禁止**把 tip-jar 标识符改成 Sanctuary；**禁止**把两套 gate 合成一套。  
> **零耦合条款**见 §2.6「硬技术约束 · Gate 零耦合」——改代码 / Review 均须遵守。

### 表 A · 打赏（Tip / Tea）— 由 `feature/founder-supporter-pack` 改道

| 现用（Founder/Supporter） | 建议对内 | 对外 i18n（示例方向） |
|---|---|---|
| 分支 `feature/founder-supporter-pack` | **`feature/yin-tip-jar`** | — |
| 文档 `FOUNDER_SUPPORTER_PACK.md` | `YIN_TIP_JAR.md`（或 `BUY_YIN_A_TEA.md`） | — |
| `supporterGate.js` / `isSupporter` 等 | `tipJarGate.js`（可简写 `tipGate.js`）/ `hasTipped` / `readTipStatus` | — |
| `SupporterPackUI.js` / `#supporter-pack-card` | `TipJarUI.js` / `#yin-tip-jar-card` | Buy Yin a Tea / Thank Yin |
| locales `SUPPORTER_*` | `TIP_*` 或 `TEA_*` 键名 | 文案：Tea / Tip Jar；**禁用** Founder / Supporter / Sanctuary |
| orchestration proxy `'supporter'` | `'tip-jar'` 或 `'tea'` | 菜单若保留：短写 Tea（主推仍是情境触发，非常驻抢戏） |
| `onSupporter` / `__supporterPack` | `onTipJar` / `__tipJar` | — |
| `focus-tiger.supporter-status.v1` | `focus-tiger.tip-jar.v1` | 值：`{ tipped, tipCount, lastTippedAt }`（+ 可选 email） |
| Query `?supporter=1` | `?tip=1` 或 `?tea=1`（仍仅徽章级乐观；文档写明强度） | — |
| `cloud/.../supporterKv.ts` | `tipKv.ts`（或公共 kv 工具 + tip 专用 put） | — |
| `/api/verify-supporter` | `/api/verify-tip`（或 `/api/verify-tea`） | — |
| KV `supporter:{email}` | `tea:{email}` 或 `tip:{email}` | tip schema，**非** unlock |
| `SUPPORTER_KV` 绑定名 | 可沿用绑定改语义，或 `TIP_KV`（运维另估） | — |
| TEST_TRACKER「Founder Supporter Pack」两行 | 「Buy Yin a Tea / Tip Jar」 | — |
| PROCESS/ARCH/ENV/SHARED/Z_INDEX 中 Founder 字样 | Tip / Tea | — |

**本轨禁止出现的词（产品文案与对外名）**：Sanctuary、Founder、Supporter Pass、Yin Pro。

### 表 B · Sanctuary（解锁）— **新建**，不改自 tip 分支文件名硬改

| 项 | 建议对内 | 对外 i18n（示例方向） |
|---|---|---|
| 新分支 | `feature/yin-sanctuary-lifetime` | — |
| 新文档 | `YIN_SANCTUARY.md` | Yin's Sanctuary / Sanctuary Pass |
| 新 gate 模块 | `sanctuaryEntitlementGate.js`（或 `entitlementGate.js` 若仅服务 B） | — |
| 新 UI | `SanctuaryUnlockUI.js` / `#yin-sanctuary-card` | Unlock Yin's Sanctuary + 权益三条 |
| locales | `SANCTUARY_*` | Sanctuary / Lifetime；**禁用** Tea/Tip 混称「已解锁全库」 |
| orchestration（若 Idle ⋯ 有入口） | proxy `'sanctuary'`（**可有但不挡 Sit**；主入口仍在锁项处） | Sanctuary |
| storage | `focus-tiger.sanctuary-entitlement.v1` | `{ unlocked, unlockedVia, unlockedAt, itemId }` |
| cloud 路由 | `/api/create-sanctuary-checkout`、`/api/verify-sanctuary`（名称待定） | — |
| KV | `sanctuary:{email}`（可含 `itemId`） | entitlement schema |
| 校验强度 | **必须**服务端确认 Checkout Session；**禁止**乐观 query 解锁真内容 | — |

**本轨禁止**：复用 `tipGate` / tip localStorage / `?tip=` 写 `unlocked`；在 tip UI 里卖全库解锁。  
**另见** §2.6 零耦合条款全文（Code Review 必检）。

### 表 C · 仅公共 payment 层（新建或从 founder cloud 抽）

| 项 | 建议 |
|---|---|
| `cloud/src/lib/stripe.ts` 等 | 保留/抽为共享：建 Checkout、验 webhook 签名 |
| CORS / rateLimit / secrets | 共享 |
| tip vs sanctuary | **分 Price ID、分 success URL、分 webhook 业务分支、分 KV value** |

### 表 D · `origin/develop` 与本 docs 分支

| 位置 | 动作 |
|---|---|
| 本 Brief / PROCESS / MVP / TEST_TRACKER | 已按双轨 + tip-jar 命名更新（本回合） |
| `task-growth-content-pack-decision.md` | ②B **取消** |
| develop 运行时 | 尚无 Founder 代码；改名执行在 tip-jar 分支 + 新建 sanctuary 分支 |

---

## 待你决定（仍开放）

1. A/B **定价数字**（仍不锁）  
2. 深度音效 / 高级动画 **分层名单**  
3. 可选 PWA 是否立项  

**已拍板（2026-08-10）**：推翻「v1 仅 Lifetime / 无订阅」；**双轨**维持（A 不解锁 + B 进阶解锁）；B 下 **Lifetime ∪ Yin Membership** 互覆盖；catalog `subscription` 档为正式产品决定；到期降级 = 已生成永久可看、只停新解锁与进阶使用。A→B 24h 体验卡仍非 v1。

**已拍板（2026-08-07）**：§八双表执行；§2.6 零耦合条款（Code Review 必检）；②B 取消；Privacy → Reflection echo → 壁纸 **可与 tip-jar 改道并行**。（「B 仅 Lifetime」已被 2026-08-10 拍板废止。）

本回合起允许改 tip-jar / sanctuary 运行时代码（须守零耦合）。
