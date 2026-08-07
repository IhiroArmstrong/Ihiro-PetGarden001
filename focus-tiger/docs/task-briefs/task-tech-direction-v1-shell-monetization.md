# Task Brief · 技术方向纪要（v1 壳 / 商业化 / 健康同步）

> **状态（2026-08-07 晚修订）**：产品/工程方向已落档；**商业化 = 双轨并行（A 打赏 + B Sanctuary）**；**无本回合运行时改动**。  
> **触发**：用户书面「打赏和解锁付费两个付款意愿都要」——覆盖同日早前「只留 Sanctuary 一个付费名 / 创始包并入」口径。  
> **权威**：本文件 + `PROCESS.md`「最近拍板」+ `MVP_PRODUCT_DEFINITION.md` §五；根目录中文分析师草稿 **非 SSOT**。

## 权威边界（先读）

| 项 | 口径 |
|---|---|
| v1.0.0 交付默认形态 | **纯 Web**；**不上** App Store / Play 原生包 |
| 手机原生壳 | v1 **不实现**；未来默认 **Capacitor** |
| 桌面壳 | **仍开放**（Electron / Tauri / PWA·薄壳）；本纪要不取消 |
| 健康同步 | **非 v1**；未来 Capacitor（**不得**写成 v1 Pass 已交付权益） |
| **商业双轨（硬）** | **A** = Buy Yin a Tea（微打赏）；**B** = Yin's Sanctuary（解锁付费）。**两者都要**，不二选一 |
| **B 对外名** | **Yin's Sanctuary**（短写 **Sanctuary**）；可称 Pass / Lifetime 作形态，**禁止**再并行 Founder / Yin Pro 等第三故事名 |
| **A 对外名** | **Buy Yin a Tea**（Tip Jar）；徽章级感谢，**不是**第二套内容解锁墙 |
| **B 收费形态** | **Lifetime 一次买断为主**；订阅仅可选项、**非** v1 首选 |
| **B 权益（v1）** | 仅 **深度音效 + 已划界的非核心高级表现**；不写课程 / 报表 / 换装大系统 |
| **解锁触发** | **禁止**任何连续/断签式解锁或惩罚；**不**留 `streak` 类接口空位 |
| 账号 | **无账号**；邮箱核验仅用于跨设备恢复 entitlement / 打赏记录（若需要） |
| v1.0 纯本地 | 核心练习不依赖联网；付费恢复可选云 |
| 增长内容包 | 与 **阶段 2 内容生态同一车道**（见 §七）；非平行待办 |
| 并行分支 | `feature/founder-supporter-pack` → **改道为 A（Tea）管线**；另开 / 同里程碑接 **B（Sanctuary entitlement）**（Stripe 可共享基建） |

---

## 相对历史口径：纠正清单

| 旧口径 | 纠正后 |
|---|---|
| 「v1 不要任何壳」 | 只锁不上手机商店包；桌面壳另议 |
| PWA + 连续打卡推送 | PWA 可选；**禁止**连续打卡叙事 |
| 只留 Sanctuary；创始包并入、禁止第二付费名 | **废止「只能一个 SKU」**；改为 **A Tea + B Sanctuary** 双轨（不同心理触发） |
| 增长包自动升优先级 | 并入阶段 2 车道；排期仍可延后 |
| Pass 卖点含 Apple Health | **v1 纯 Web 不可用**；Health 仅未来壳；**禁止**写入 v1 B 权益清单 |
| 高级动画付费无底线 | 核心 Sit/Arrival/Idle/Honesty/每日首次庆祝等 **不得付费墙** |

---

## 一、壳与发布形态

### 已锁定

1. v1 默认 **纯 Web**（Browser First）。  
2. 未来手机壳默认 **Capacitor**（非 Flutter/RN；非 Tauri 扛 HealthKit）。  
3. 桌面壳维持 `PROCESS` Backlog；Capacitor Electron 仅未来参考。

### v1 纯 Web 下不可用

HealthKit / Health Connect；StoreKit / Play Billing；系统 Widget / Live Activities；「一键发到指定社交 App」核心承诺。

### PWA

可选缓存增强；不得默认成最终电脑版；SW 不得变成「无网不可用」。推送若做：禁强迫签到文案。

---

## 二、商业化 · 双轨（A 打赏 + B Sanctuary）

> **心理机制（产品话术依据，非工程）**  
> - **A**：利他与感激（Altruism & Gratitude）——「产品治愈了我，想回馈」。  
> - **B**：自我效能与美学享受（Self-improvement & Aesthetic Enjoyment）——要更深的场域 / 音效 / 身份。  
> 二者覆盖不同 Willingness-to-Pay 梯队；设计得当可互补，**不是**二选一。

### 2.1 选择 A — Buy Yin a Tea（微打赏 / Tip Jar）

| 项 | 口径 |
|---|---|
| 商品性质 | 小额 **一次性** consumable / tip（可多次请茶） |
| 核心卖点 | 心理满足、感谢陪伴；限时或永久的 **茶饮小徽章**（无实质内容墙） |
| 定价区间（假设，非承诺） | 如 $0.99 / $1.99 / $4.99 — **数字另定** |
| UI 角色 | **情境化情绪入口**；**切忌**常驻主界面抢戏 |
| 建议触发 | ① 里程碑 / 长 Deep Work 后 Reflection **底部轻露**；② Honesty / 休整归来后轻度互动；③ About & Credits **最底部** Tip Jar |
| 转化漏斗（可选） | 未购 B 的用户请茶后，可 **赠送短时**（如 24h）任意深度音效/场景体验卡 → 引导试 B；**不得**用焦虑倒计时话术 |
| 与 B 关系 | 已购 B 的账户可 **默认拥有最高茶饮徽章/尊贵状态**；仍允许超级粉丝 **额外再请茶** |
| 工程 | 优先改道 `feature/founder-supporter-pack`（徽章级乐观校验 **仅**适用于 A；见该分支强度说明） |

### 2.2 选择 B — Yin's Sanctuary（主商业入口 / Unlock）

| 项 | 口径 |
|---|---|
| 正式名 | **Yin's Sanctuary**；短写 **Sanctuary**；形态可写 Pass / Lifetime |
| 商品性质 | **Lifetime 为主**；Monthly/Yearly 订阅仅可选项、非 v1 首选 |
| 核心卖点 | 解锁 **全部已划界**深度美术场景（阶段到位后）、深度环境音效库、尊贵状态；**v1 硬权益**仍先锁在「深度音效 + 非核心高级表现」 |
| 定价区间（假设，非承诺） | 如 $4.99/月、$35.99/年、$89.99 Lifetime — **数字另定** |
| UI 角色 | **主商业门**：音效面板锁项、场景锁项、（未来）设置顶 Banner；Idle ⋯ 可有一项但不挡 Sit |
| 收入角色 | **收入支柱（Base Revenue）** |
| 工程 | Stripe Checkout + Workers/KV entitlement；**真内容解锁须服务端确认 Session**（禁止套用 A 的乐观 `?…=1`） |

### 2.3 UI 防混淆（硬）

| 做 | 不做 |
|---|---|
| 文案区分：「Thank Yin / Buy a tea」vs「Unlock Sanctuary」 | 两个平铺主 CTA 抢 Idle 首页 |
| A 情境触发；B 锁项门 + 明确权益列表 | 让用户以为「请茶 = 买了全库」 |
| Pass 用户默认高阶茶徽章 | 强迫已购 Pass 再买茶才能用核心功能 |

### 2.4 权益清单红线（B · 硬）

**只写（v1）**：

1. **深度音效**（内置 ambient 分层；免费保留足够温暖的子集）  
2. **已划界的非核心高级表现**（如部分增发/特效向动画——名单另定）

**不写 / 不因可收费自动进路线图**：

- 课程墙、AI Coach、情绪/心理报表、复杂专注看板  
- 换装大系统 / 多角色收集  
- 抽奖、付费加速、365 天成长路线  
- **Apple Health / Widget** 作为 v1 已交付卖点  

**免费底线（硬）**：Sit、Arrival、基础 Idle（呼吸/眨眼）、Honesty、每日首次达标级庆祝等核心陪伴与反馈 **不得**付费墙。

### 2.5 Entitlement 数据（B · 改造目标）

```ts
{
  unlocked: boolean,
  unlockedVia: 'payment' | 'preview' | 'tea-trial',
  unlockedAt: string, // ISO
  itemId: string
}
```

| `unlockedVia` | 含义 |
|---|---|
| `payment` | Stripe 买断 / 可选订阅成功（B） |
| `preview` | 研发/预览赠送 |
| `tea-trial` | 可选：A 打赏后的短时体验卡（若做漏斗） |

**禁止**：`streak` / `checkin` / `login-days` 等字段或接口空位。

### 2.6 `feature/founder-supporter-pack` 处置

| 旧计划 | 新计划（2026-08-07 晚） |
|---|---|
| 改造并入 Sanctuary，取消独立打赏名 | **保留为 A（Buy Yin a Tea）**；改对外文案与菜单名；徽章级强度可保留 |
| — | **另建 / 同里程碑**接 B Sanctuary entitlement（复用 Checkout/Webhook/KV 模式，**schema 与校验强度分开**） |

Stripe / Webhook / 限流 / 邮箱恢复：**高复用**；gate / i18n / proxy 键：**A/B 分名**，禁止混成一个「买了就全开」的模糊状态。

---

## 三、健康同步（Phase 1 · 非 v1）

不在 v1；未来 Capacitor；窄插件可选。不替代 Honesty。

---

## 四、增长内容包 ↔ 阶段 2（同一车道）

- Zen Cinema / Quiet Line / 电子书 / **壁纸赠送** 等 = **阶段 2「内容生态」同一批**，也可作 v1 低成本增长增发。  
- 权威实现锁仍见 `task-growth-content-pack-decision.md`；①③ 已合；②A/②B 延后。  
- **②B「连续练习解锁」**与 **禁止连续/断签解锁** **冲突**：须改设计或取消。  
- 排期：仍可延后；**不**因本纪要自动插入近期 sprint（壁纸 / Reflection 共鸣另见独立 Brief）。

---

## 五、阶段 2 设计原则（未来 · 非开工）

> 练习沉淀后，用户可以 **遇见** 或 **支持解锁** 更多场域/内容；  
> **禁止**任何形式的「连续 / 断签」类型解锁或惩罚。

| 允许（方向） | 禁止（硬） |
|---|---|
| 付费 / Lifetime / Tea tip | 连续 N 天解锁 |
| 可选 preview / tea-trial | 断签收回、断签羞辱 |
| 季节内容由 Sanctuary 覆盖 | 打卡日历当付费门闩 |

---

## 六、长期商业方向（方向记录 · **非当前任务范围**）

**商业本质**：Digital Companion & Emotional Value。  
**包装**：**A + B 双轨**；B 侧只用 **Yin's Sanctuary** 一个解锁品牌名。

| 阶段 | 范围 | 状态 |
|---|---|---|
| **阶段 1（v1）** | 全功能免费底线；**A Tea** + **B Sanctuary（Lifetime 为主）**；无账号 | **方向已锁**；分层名单/定价另定 |
| **阶段 2** | 内容生态（场景、音效库加深、增长包车道）；解锁守 §五 | **非近期 sprint** 默认 |
| （更远）手机壳 / Health / Widget | Capacitor 等 | 见 §一 / §三 |

---

## 七、本纪要明确不做（禁止顺手开工）

- Capacitor / 桌面壳脚手架（未另下令）  
- HealthKit / Widget / Live Activities 当 v1 卖点实现  
- 未拍板的定价文案上线  
- 把旧 Founder 名义直接合 develop（须先改 Tea 文案与双轨文档对齐）  
- 任何 streak/打卡解锁接口  
- 付费锁核心练习路径  
- 把 A/B 混成单一模糊 SKU  

## 实现开工口令（将来 · 须另开 feature）

- `feature/buy-yin-a-tea`（或由 `feature/founder-supporter-pack` 改道 A）  
- `feature/yin-sanctuary-entitlement`（B：真校验 + 音效/非核心动画消费）  
- 可同 Stripe 账号、分 Price / 分 KV schema  

---

## 八、旧命名对照（待实现时执行 · 本回合只文档）

| 旧 | A Tea | B Sanctuary |
|---|---|---|
| Founder Supporter Pack / `supporter*` | Buy Yin a Tea / `teaTip*` 或保留 gate 仅徽章 | — |
| 「唯一付费名 Sanctuary」 | 并列合法 SKU | Yin's Sanctuary |
| 乐观 `?supporter=1` | **仅** A 徽章可接受 | **禁止**用于 B 真内容 |

---

## 待你决定（仍开放）

1. A/B **定价数字**与是否做「请茶 → 24h 体验卡」漏斗  
2. 氛围曲目 / 非核心动画 **分层名单**  
3. Lifetime vs 是否完全不做订阅进 v1  
4. 是否现在立项可选 PWA  
5. 电子书 ②B：取消 vs 非 streak 改设计  
6. Founder 分支：本周改道 A 文案，还是等 Stripe secrets 后再改  

确认定价/分层后，再开实现（禁止本回合静默改支付代码）。
