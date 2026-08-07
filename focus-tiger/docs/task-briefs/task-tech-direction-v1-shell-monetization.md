# Task Brief · 技术方向纪要（v1 壳 / 商业化 / 健康同步）

> **状态（2026-08-07）**：产品/工程方向已落档；**本回合固化 Sanctuary 商业收敛**；**无运行时改动**（旧名改名清单待你确认后再改代码）。  
> **触发**：用户逐条确认收敛建议（对外名 / Lifetime / 改造并入 founder 分支 / 禁打卡解锁 / 长期三阶段 / 权益红线 / 增长包=阶段2）。  
> **权威**：本文件 + `PROCESS.md`「最近拍板」；根目录中文分析师草稿 **非 SSOT**。

## 权威边界（先读）

| 项 | 口径 |
|---|---|
| v1.0.0 交付默认形态 | **纯 Web**；**不上** App Store / Play 原生包 |
| 手机原生壳 | v1 **不实现**；未来默认 **Capacitor** |
| 桌面壳 | **仍开放**（Electron / Tauri / PWA·薄壳）；本纪要不取消 |
| 健康同步 | **非 v1**；未来 Capacitor |
| **对外付费名** | 只留 **Yin's Sanctuary**（按钮可短写 **Sanctuary**）；**禁止**并行：Supporter Pass / 创始人包 / Founder / Yin Pro |
| **收费形态** | **Lifetime 一次买断为主**；订阅仅可选项、**非** v1 首选 |
| **权益（v1）** | 仅 **深度音效 + 已划界的非核心高级表现**；不写课程 / 报表 / 换装大系统 |
| **解锁触发** | **禁止**任何连续/断签式解锁或惩罚；**不**留 `streak` 类接口空位（已决定不做，非延后） |
| 账号 | **无账号**；邮箱核验仅用于跨设备恢复 entitlement |
| v1.0 纯本地 | 核心练习不依赖联网；付费恢复可选云 |
| 增长内容包 | 与 **阶段 2 内容生态同一车道**（见 §七）；非平行待办 |
| 并行分支 | `feature/founder-supporter-pack` → **改造并入** Sanctuary（不暂停、不默认可直接合 develop） |

---

## 相对分析师草稿：纠正清单（历史）

| 草稿说法 | 纠正后口径 |
|---|---|
| 「v1 不要任何壳」 | 只锁不上手机商店包；桌面壳另议 |
| PWA + 连续打卡推送 | PWA 可选；**禁止**连续打卡叙事 |
| 永久废止创始人包 | 现已拍板：**改造并入** Sanctuary，旧名下架 |
| 增长包自动升优先级 | 并入阶段 2 车道；排期仍可延后，不平行开第二套 Backlog |
| `supporterGate` 名 | 改造时改为 Sanctuary / entitlement 命名（见 §八清单） |
| 高级动画付费无底线 | 核心 Sit/Arrival/Idle/Honesty/每日首次庆祝等 **不得付费墙** |

---

## 一、壳与发布形态

### 已锁定

1. v1 默认 **纯 Web**（Browser First）。  
2. 未来手机壳默认 **Capacitor**（非 Flutter/RN；非 Tauri 扛 HealthKit）。  
3. 桌面壳维持 `PROCESS` Backlog；Capacitor Electron 仅未来参考。

### v1 纯 Web 下不可用

HealthKit / Health Connect；StoreKit / Play Billing；「一键发到指定社交 App」核心承诺。

### PWA

可选缓存增强；不得默认成最终电脑版；SW 不得变成「无网不可用」。推送若做：禁强迫签到文案。

---

## 二、商业化 · Yin's Sanctuary（v1 主路径）

### 对外命名（硬）

| 用途 | 文案 |
|---|---|
| 正式产品名 | **Yin's Sanctuary** |
| 短按钮 / 菜单 | **Sanctuary**（可） |
| **禁止并行上架** | Supporter Pass、创始人包 / Founder Supporter、Yin Pro、Mindful Pass 等第二故事名 |

### 收费形态（硬）

- **主**：Lifetime / 一次买断（Stripe Checkout `mode=payment`）。  
- **次**：订阅仅作可选项，**不作为 v1 首选**，避免 SaaS 观感。  
- **定价数字**：另定；本 Brief **不写死**金额。

### 权益清单红线（硬 · 共识固化）

**只写**：

1. **深度音效**（内置 ambient 分层；免费保留足够温暖的子集）  
2. **已划界的非核心高级表现**（如部分增发/特效向动画——名单另定）

**不写 / 不因可收费自动进路线图**：

- 课程墙、AI Coach、情绪/心理报表、复杂专注看板  
- 换装大系统 / 多角色收集  
- 抽奖、付费加速、365 天成长路线  

**免费底线（硬）**：Sit、Arrival、基础 Idle（呼吸/眨眼）、Honesty、每日首次达标级庆祝等核心陪伴与反馈 **不得**付费墙。

### Entitlement 数据（改造目标 · 尚未改代码）

单条（或按 `itemId` 多条）形态：

```ts
{
  unlocked: boolean,
  unlockedVia: 'payment' | 'preview',
  unlockedAt: string, // ISO
  itemId: string
}
```

| 允许的 `unlockedVia` | 含义 |
|---|---|
| `payment` | Stripe（或等价）买断/可选订阅成功 |
| `preview` | 研发/预览赠送（非生产默认） |

**明确不做（已决定，非占位）**：

- **禁止** `unlockedVia: 'streak' | 'checkin' | 'login-days'` 等任何字段或接口空位  
- **禁止**「连续 N 天 / 断签则锁 / 打卡解锁」类触发器与惩罚  
- 阶段 2 若「练习沉淀后可遇见」，也 **不得**用连续/断签门闩实现（见 §五）

真内容解锁时：**禁止**沿用 Founder 分支的乐观 `?supporter=1` 无校验写锁；须服务端确认 Checkout Session（或等价）后再写 `unlocked`。

### `feature/founder-supporter-pack`：改造并入（不暂停）

**拍板**：改造并入 Sanctuary entitlement 路线；**不**以旧 Founder 名义合 develop；改名清单见 §八（**你确认后再改代码**）。

#### Stripe / Webhook / KV 复用评估

| 能力 | 复用程度 | 说明 |
|---|---|---|
| Stripe Checkout 创建会话 | **高** | `createCheckoutSession` 可改 Price / 文案 / success URL；Lifetime 仍走 `mode=payment` |
| Stripe Webhook → 写 KV | **高** | `checkout.session.completed` 流程可保留；value schema 须改为 entitlement（含 `itemId` 等） |
| 邮箱 verify / 跨设备恢复 | **高** | 无账号模型可保留；路由/键名从 supporter → sanctuary/entitlement |
| KV namespace | **中高** | 可复用绑定；建议新 key 前缀（如 `sanctuary:{email}`），勿与旧 `supporter:` 语义混读 |
| 限流 / CORS / secrets 模式 | **高** | `rateLimit`、`STRIPE_*`、`wrangler` 模式可沿用 |
| 前端 `supporterGate` 乐观回跳 | **低（须换）** | 徽章级乐观校验 **不可**直接用于音效/动画真权益 |
| UI 徽章/纪念文案 | **低** | 产品故事改为 Sanctuary；卡片与 i18n 全换 |
| 编排 proxy `supporter` | **中** | 键与 handler 改名（如 `sanctuary`），行为仍是 Idle ⋯/抽屉一项 |

**结论**：支付与恢复管线 **值得改造复用**；本地 gate / 文案 / 文档名 **必须重命名并升级校验强度**，不是改个显示名了事。

---

## 三、健康同步（Phase 1 · 非 v1）

不在 v1；未来 Capacitor；窄插件可选。不替代 Honesty。

---

## 四、增长内容包 ↔ 阶段 2（同一车道）

- Zen Cinema / Quiet Line / 电子书等 = **阶段 2「内容生态」的同一批**，**不是**另一条平行商业 Backlog。  
- 权威实现锁仍见 `task-growth-content-pack-decision.md`；①③ 已合；②A/②B 延后。  
- **②B「连续练习解锁」**与本纪要 **禁止连续/断签解锁** **冲突**：阶段 2 若保留电子书解锁，须改为符合 §五 的「遇见 / 支持解锁」，**禁止**按 streak 门闩实现；或取消 ②B。  
- 排期：仍可延后；**不**因本纪要自动插入近期 sprint。

---

## 五、阶段 2 设计原则（未来 · 非开工）

措辞方向（写入原则，非实现）：

> 练习沉淀后，用户可以 **遇见** 或 **支持解锁** 更多场域/内容；  
> **禁止**任何形式的「连续 / 断签」类型解锁或惩罚——不只是「解锁后不收回」，而是 **从源头不做这类触发器**。

| 允许（方向） | 禁止（硬） |
|---|---|
| 付费 / Lifetime 支持解锁 | 连续 N 天解锁 |
| 可选 preview 赠送 | 断签收回、断签羞辱 |
| 季节内容上架后由 Sanctuary 覆盖 | 打卡日历当付费门闩 |
| 「遇见」式叙事（非胁迫） | `streak` / check-in 解锁 API 空位 |

---

## 六、长期商业方向（方向记录 · **非当前任务范围**）

> 本节 = 战略备忘；**不进近期 sprint**；不授权开工阶段 2 付费场景/换装。

**商业本质**：Digital Companion & Emotional Value（对标 Finch / Endel 气质——卖陪伴与场域，不卖课程墙）。  
**对外包装**：只用 **Yin's Sanctuary** 一个名字；**不再引入**与其竞争的新付费品牌名。

| 阶段 | 范围 | 状态 |
|---|---|---|
| **阶段 1（v1 · 现在方向）** | 全功能免费体验；Sanctuary **Lifetime 为主**解锁深度音效 + 非核心高级情绪动画；无账号 | **方向已锁**；分层名单/定价另定；实现另开 feature |
| **阶段 2** | 内容生态扩展（季节场景、专属磬声、更丰富陪伴动作等）；含增长三件套车道；解锁须守 §五 | **非当前任务范围，不进近期 sprint** |
| （更远）手机壳 / Health | Capacitor 等 | 见 §一 / §三；非本商业章节开工令 |

---

## 七、本纪要明确不做（禁止顺手开工）

- Capacitor / 桌面壳脚手架（未另下令）  
- HealthKit / Health Connect  
- 未确认改名清单前的大规模重命名 PR（先等 §八确认）  
- 未拍板的定价文案上线  
- 把旧 Founder 名义直接合 develop  
- 任何 streak/打卡解锁接口  
- 付费锁核心练习路径  

## 实现开工口令（将来 · 须另开 feature）

建议在 **改造并入** 时用单一 feature（或清晰串联），例如：

- `feature/yin-sanctuary-entitlement`（由 `feature/founder-supporter-pack` 改道：Stripe/KV 复用 + gate 升级 + Sanctuary UI）  
- 分层名单与定价确认后，再接线 ambient / 非核心动画消费 entitlement  

---

## 八、旧命名 → Sanctuary：改名清单（**只列，待你确认后再改**）

> 范围：`feature/founder-supporter-pack` 相对 `origin/develop` 的改动面 + 本 docs 分支已出现的旧口径。  
> **本回合不改代码。**

### A. 产品/文档显示名（须统一为 Yin's Sanctuary / Sanctuary）

| 位置 | 现用旧名 | 建议 |
|---|---|---|
| `FOUNDER_SUPPORTER_PACK.md`（整文件） | Founder Supporter Pack | 改名为 `YIN_SANCTUARY.md`（或并入本 Brief + 实现 Brief），正文全面换名 |
| `PROCESS.md` / `ARCHITECTURE.md` / `ENV_CONFIG.md` / `SHARED_RESOURCES.md` / `Z_INDEX.md` / `cloud/README.md`（founder 分支） | Founder / supporter | Sanctuary |
| `TEST_TRACKER` 两行（Worker + 徽章 UI） | Founder Supporter Pack | Yin's Sanctuary |
| locales `en.json` / `ja.json` / `zh.json` | `SUPPORTER_*`、`Founder supporter` 等 | `SANCTUARY_*` + 新文案（权益改为音效/非核心表现，不再「仅徽章」） |
| Idle 菜单 proxy 文案 | Founder supporter | Sanctuary |

### B. 工程标识符（建议一并改，避免双名）

| 位置 | 现用 | 建议（待确认） |
|---|---|---|
| `src/core/supporterGate.js` (+ test) | `supporterGate`、`SupporterStatus`、`isSupporter` | `sanctuaryGate` / `entitlementGate`；状态用 §二 schema |
| `src/ui/SupporterPackUI.js` | 类名 / `#supporter-pack-card` | `SanctuaryUI` / `#yin-sanctuary-card` |
| `idleChromeOrchestration` proxy | `'supporter'` | `'sanctuary'` |
| `IdleChromeFacade` / `WideIdleMoreMenu` / `NarrowIdleShell` / `main.js` | `onSupporter`、`__supporterPack` | `onSanctuary` 等 |
| `localStateKeys` | `focus-tiger.supporter-status.v1` | 新 key（如 `focus-tiger.sanctuary-entitlement.v1`）；旧 key 迁移或弃读策略另写 |
| Query | `?supporter=1` | 若保留回跳，须改名且 **不得**无校验解锁真内容 |
| `cloud/.../supporterKv.ts` | 文件/函数名 | `sanctuaryKv` 或 `entitlementKv` |
| `verifySupporter.ts` 等路由 | `/api/verify-supporter` | `/api/verify-sanctuary`（或 verify-entitlement）；旧路径是否短暂别名另定 |
| KV key | `supporter:{email}` | `sanctuary:{email}`（或带 `itemId`） |
| `wrangler` 绑定名 | `SUPPORTER_KV` | 可保留绑定改语义，或 `SANCTUARY_KV`（运维成本另估） |
| 分支名 | `feature/founder-supporter-pack` | 改道后建议 `feature/yin-sanctuary-entitlement`（或等价） |

### C. 本 docs 分支（`docs/tech-direction-v1-shell-monetization`）已写旧口径、须随本 Brief 同步

| 位置 | 说明 |
|---|---|
| 本 Brief 早前「创始人包降级 / 待你决定暂停」段落 | **本版已改写**为改造并入 |
| `PROCESS.md` 最近拍板 / 开放决策里「创始人包降非主路径」 | 更新为 Sanctuary + 改造并入 |
| `MVP_PRODUCT_DEFINITION.md` 付费假设 | 更新主路径名为 Sanctuary；Lifetime 为主 |
| `TEST_TRACKER`「技术方向纪要」行 | 同步 Sanctuary 口径 |
| `task-growth-content-pack-decision.md` | 标注 = 阶段 2 同一车道；②B 与禁 streak 冲突 |

### D. `origin/develop` 主线

当前 **无** Founder/Supporter 运行时（仅文档纪要旧句）。改名执行主要在 **founder 功能分支改造** + **本纪要文档**。

---

## 待你决定（仍开放）

1. **§八改名清单**：是否按上表执行（尤其工程标识符是否全量改名，还是允许内部 `entitlement*` + 对外只显示 Sanctuary）  
2. 氛围曲目 / 非核心动画 **分层名单**（免费 vs Sanctuary）  
3. Lifetime **定价数字**；订阅是否甚至不做进 v1  
4. 是否现在立项可选 PWA  
5. 电子书 ②B：取消 vs 改成非 streak 的「支持/遇见解锁」  

确认 §八 后，再开改造实现（禁止本回合静默改代码）。
