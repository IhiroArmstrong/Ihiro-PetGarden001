# Task Brief · 技术方向纪要（v1 壳 / 商业化 / 健康同步）

> **状态（2026-08-07 夜 · Prompt 收紧）**：产品/工程方向已落档；**商业化 = 双轨并行（A 打赏 + B Sanctuary）**；本文件为 SSOT Brief 草稿固化。**无本回合运行时 / 支付代码改动**——你过目确认后再落地实现与合 PR。  
> **触发**：用户 Cursor prompt——双轨并行细则、founder→Tea 复用评估、B 仅 Lifetime、禁 24h 漏斗进 v1、情境化打赏红线。  
> **权威**：本文件 + `PROCESS.md`「最近拍板」+ `MVP_PRODUCT_DEFINITION.md` §五；中文分析师草稿 **非 SSOT**。

---

## 权威边界（先读）

| 项 | 口径 |
|---|---|
| v1.0.0 交付默认形态 | **纯 Web**；**不上** App Store / Play 原生包 |
| 手机原生壳 | v1 **不实现**；未来默认 **Capacitor** |
| 桌面壳 | **仍开放**（Electron / Tauri / PWA·薄壳） |
| 健康同步 | **非 v1**；**禁止**写入 B 付费权益 |
| **商业双轨（硬）** | **A** Buy Yin a Tea + **B** Yin's Sanctuary。**两者都要**，不二选一 |
| **A** | 打赏；情绪反馈 + 可选徽章；**不解锁**任何内容 |
| **B** | 深度美学/音效解锁；**新的技术线**（真 entitlement） |
| **B 收费形态（v1 硬）** | **仅 Lifetime 一次买断**；**不做** Monthly/Yearly 订阅（不做续费/取消/宽限期） |
| **B 权益（v1）** | ① 深度音效全库 ② 高级情绪动画/场景（已划界、非核心） ③ 尊贵徽章/身份标识 |
| **A→B 24h 体验卡** | **非 v1**；阶段 2 候选（见 §2.7） |
| **解锁触发** | **禁止**连续/断签式解锁或惩罚；不留 `streak` 解锁接口空位 |
| 账号 | **无账号**；邮箱仅恢复 tip / Sanctuary 购买记录 |
| 并行分支 | `feature/founder-supporter-pack` **保留并重新定位为 A**；B 另开技术线 |

---

## 相对历史口径：纠正清单

| 旧口径 | 纠正后 |
|---|---|
| 只留 Sanctuary 单 SKU / 创始包并入 | **A + B 双轨**；founder 分支 = **A Tea**，不推倒 |
| Lifetime 为主、订阅非首选 | **v1 完全不做订阅**；仅 Lifetime |
| 可选「请茶→24h 体验卡」漏斗 | **v1 不做**；记阶段 2 候选 |
| Pass 权益含 Apple Health | **删除**；纯 Web 做不到 |
| B 可复用 A 的 simple boolean | **禁止**；B 独立 entitlement + 服务端校验 |

---

## 一、壳与发布形态

1. v1 默认 **纯 Web**。  
2. 未来手机壳默认 **Capacitor**。  
3. 桌面壳维持 `PROCESS` Backlog。  

**v1 纯 Web 不可用（不得写入付费卖点）**：HealthKit / Health Connect；StoreKit / Play Billing；系统 Widget / Live Activities；「一键发到指定社交 App」核心承诺。

---

## 二、商业化 · 双轨详规

### 2.0 为什么两者不冲突（心理 + 梯队）

| | **A · Buy Yin a Tea** | **B · Yin's Sanctuary** |
|---|---|---|
| 心理触发 | **利他与感激**（Altruism & Gratitude）——「太治愈了，想回馈」 | **自我效能与美学享受**（Self-improvement & Aesthetic Enjoyment）——要更深场域/音效/身份 |
| 用户梯队 | 轻度 / 预算敏感：小额打破零付费壁垒 | 深度美学 / 深度专注：为工具与场域价值买单 |
| 超级粉丝 | 已购 B 后仍可**额外请茶**（情绪时刻） | 收入支柱 |
| 产品角色 | **情绪润滑剂**（Emotional Revenue） | **收入支柱**（Base Revenue） |

设计得当则互补；冲突只来自 **UI 混成「买了还要买啥」**——靠入口位置与文案层级拆开（§2.3）。

### 2.1 选择 A — Buy Yin a Tea（打赏）

| 项 | 口径 |
|---|---|
| 商品性质 | 小额 **一次性** tip；可多次请茶 |
| 卖点 | 心理满足 + **可选茶饮徽章**；**不解锁**音效/动画/场景 |
| 定价数字 | **不锁**；待定 |
| 本地/云记录（轻量） | `{ tipped: true, tipCount, lastTippedAt }`（可加 email 绑定用于找回）；**禁止**挂到内容解锁 gate |
| 工程分支 | **`feature/founder-supporter-pack` 保留并改道**（见 §2.6） |

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

### 2.2 选择 B — Yin's Sanctuary（Unlock / Pass）

| 项 | 口径 |
|---|---|
| 正式名 | **Yin's Sanctuary**（短写 Sanctuary；可称 Pass / Lifetime） |
| 商品性质 | **仅 Lifetime 一次买断**（Stripe `mode=payment`） |
| **v1 不做** | Monthly / Yearly 订阅及一切续费/取消/宽限期生命周期 |
| 定价数字 | **不锁**；待定 |
| 工程 | **新的技术线**；不复用 A 的 simple boolean / 乐观 query 解锁真内容 |

#### B 权益清单（v1 · 只准这些）

1. **深度音效全库**（免费保留足够温暖的子集）  
2. **高级情绪动画 / 场景**（已划界、**非核心**路径；名单另定）  
3. **尊贵徽章 / 身份标识**  

**明确删除 / 禁止写入**：Apple Health 深度同步；课程墙；AI Coach；报表；换装大系统；抽奖加速；365 天路线。

**免费底线（硬）**：Sit、Arrival、基础 Idle、Honesty、每日首次庆祝等 **不得**付费墙。

### 2.3 UI 防混淆（入口 / 视觉层级）

| | A Tea | B Sanctuary |
|---|---|---|
| 层级 | **微交互 / 情境提示**（小、可忽略） | **主商业门**（锁项处、明确权益卡） |
| 位置 | 里程碑底条 · Honesty 归来轻提示 · About **最底部** Tip Jar | Soundscape / 场景 **锁项**点击 → Unlock 卡；（未来）设置顶 Banner；Idle ⋯ **可有一项但不挡 Sit** |
| 文案 | “Buy Yin a tea?” / Thank Yin | “Unlock Yin's Sanctuary” + 权益三条 |
| 已购 B | 可默认高阶茶徽章；**仍可**请茶 | 锁项打开；真校验后解锁 |

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

### 2.6 `feature/founder-supporter-pack` → A Tea：复用评估

| 能力 | 复用度 | 说明 |
|---|---|---|
| Stripe Checkout 一次性 `mode=payment` | **高** | 改 Price / 文案 / success URL 即可对应「请茶」档位 |
| Webhook → KV | **高** | value 改为 tip 轻量 schema（`tipCount` 等）；key 建议 `tea:{email}` 或保留前缀改语义 |
| 邮箱 verify / 跨设备恢复 | **高** | 无账号模型可留 |
| 限流 / CORS / secrets / wrangler | **高** | 可沿用 |
| 前端 gate | **中** | `supporterGate.js` → 建议 `tipJarGate.js`（或通用 `purchaseReceiptGate`）；**仅** tip/徽章，**禁止**被 ambient 消费 |
| UI / i18n / 菜单 proxy | **低～中** | Founder → Buy Yin a Tea；入口从常驻菜单改为 **情境触发 + About 底**（须改编排，非纯改名） |
| 乐观 `?supporter=1` | **仅 A 可接受** | 徽章无内容价值时与现强度说明一致；**不得**拷到 B |

**结论**：技术形态 **直接对应 Tea，不推倒**；主要工作 = 改名/改文案 + 触发点从常驻改为情境化 + tip schema 轻量化。B 另开 feature，共享 Stripe 账号与 Workers 模式，**分 Price、分 KV schema、分校验强度**。

### 2.7 阶段 2 候选（非 v1）· 请茶 → 24h 体验卡

> **想法**：未购 B 的用户打赏后，赠送短时（如 24h）深度音效/场景体验，作为 A→B 转化漏斗。  
> **v1 范围**：**不做**。v1 先让 A/B **两个入口独立跑**，不做互相导流，避免范围膨胀。  
> **阶段 2** 再评估；若做，须禁焦虑倒计时话术，并单独过红线审查。

---

## 三、健康同步（非 v1）

未来 Capacitor；不替代 Honesty；**不进 B 权益文案**。

---

## 四、增长内容 / 低风险增发（与 Stripe 无关）

下列 **不依赖 Stripe secrets**，可与支付线并行排期：

| 项 | Brief | 风险感 |
|---|---|---|
| 「?」简介文案 + 应用内 Privacy | `task-in-app-privacy-and-purpose-copy.md` | **低**（文案 + 只读叠层） |
| Reflection 通用共鸣 | `task-reflection-echo-copy-pool.md` | **低**（文案池；触 Reflection UI，须回流测） |
| 壁纸免费赠送 | `task-digital-wallpapers-gift.md` | **低**（静态资源 + 存图；对齐 Quiet Line） |

> **说明**：先前「等 Stripe secrets」**只针对**真收款验收 / Tea·Sanctuary 上线，**不是**上述三项的前置。

增长包 Zen Cinema / Quiet Line / 电子书车道见 `task-growth-content-pack-decision.md`。

---

## 五、阶段 2 设计原则（摘要）

允许：付费 / Lifetime / Tea tip / 未来可选 tea-trial。  
禁止：连续 N 天解锁、断签收回/羞辱、打卡日历当付费门闩。

---

## 六、本纪要明确不做（v1）

- 订阅制及续费生命周期  
- A→B 24h 体验卡导流  
- Apple Health / Widget 当付费卖点  
- 用 A 乐观 boolean 解锁 B 内容  
- 打赏强制弹窗 / 「不打赏就怎样」  
- 付费锁核心练习路径  
- 未拍板定价数字上线  
- Capacitor / 壳脚手架（未另下令）  

---

## 七、实现开工口令（过目确认后）

1. **改道** `feature/founder-supporter-pack` → Buy Yin a Tea（文案 + 情境触发 + tip schema）  
2. **新开** `feature/yin-sanctuary-lifetime`（Lifetime Checkout + 真校验 + 音效/高级表现消费）  
3. 低风险增发可另开：`feature/in-app-privacy-purpose-copy` / `feature/reflection-echo-copy-pool` / `feature/digital-wallpapers-gift`  

---

## 待你决定（仍开放）

1. **本 Brief 是否确认落地**（确认后可开/更新 docs PR 合 `develop`；再开实现）  
2. A/B **定价数字**（不锁亦可先改道文案）  
3. 深度音效 / 高级动画 **分层名单**  
4. 低风险三项（Privacy / Reflection echo / 壁纸）是否作为下一实现优先（**建议可以**，与 Stripe 无关）  
5. 电子书 ②B：取消 vs 非 streak 改设计  
6. 可选 PWA 是否立项  

确认前：**禁止**静默改支付运行时代码。
