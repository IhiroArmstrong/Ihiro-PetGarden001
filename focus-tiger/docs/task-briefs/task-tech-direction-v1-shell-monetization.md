# Task Brief · 技术方向纪要（v1 壳 / 商业化 / 健康同步）

> **状态（2026-08-07）**：产品/工程方向已落档为本 Brief；**无运行时改动**；**未**开工 Capacitor / Stripe / Health 脚手架。  
> **触发**：用户要求「先写技术方向纪要」，并以根目录草稿 `focus-tiger-tech-direction-memo-分析师意见.md` 为参考、纠正不合适处。  
> **权威**：本文件 + `PROCESS.md`「最近拍板 / 开放决策」；根目录中文文件名草稿 **非 SSOT**（勿入库；确认后可删）。

## 权威边界（先读）

| 项 | 口径 |
|---|---|
| v1.0.0 交付默认形态 | **纯 Web**（现有 Vite + 产品壳 `?product=1`）；**不上** App Store / Play 原生包 |
| 手机原生壳 | v1 **不实现**；若未来上架，**默认候选 = Capacitor**（非 Flutter / RN 重写；非用 Tauri 扛 HealthKit） |
| 桌面壳（Electron / Tauri / PWA·薄壳） | **仍开放**；开会时机不变（冻结前约 1 周或你点名要桌面包）。**本纪要不取消**该 v1 阻塞项 |
| 健康同步 | **非 v1**；维持 `ARCHITECTURE.md` Phase 1；未来若做 → Capacitor 插件路径 |
| 付费 | 方向锁定见 §2；**价格 / 一次买 vs 订阅未定**；须守 `MVP_PRODUCT_DEFINITION` 商业化红线 |
| v1.0 纯本地 | 核心练习路径 **不依赖**联网；付费凭证恢复可走可选云路径，**禁止**「无网则无法 Sit」 |
| 增长内容包 | 已锁 Brief `task-growth-content-pack-decision.md`；本纪要 **不自动**把其升成「必须立刻排期」 |
| 并行分支 | `feature/founder-supporter-pack`（含 `supporterGate` / Stripe）**未合 develop**；与 §2 主路径变更须你拍板如何处置 |

---

## 相对分析师草稿：纠正清单

| 草稿说法 | 纠正后口径 |
|---|---|
| 「v1 乃至下一阶段不需要**任何**壳」 | **过宽**。锁定的是：**不上手机商店原生包**；桌面壳仍按既有 Backlog 另议，不得用本节悄悄结案 |
| 「建议尽快做 PWA + 用推送做连续打卡」 | **过满 / 气质风险**。PWA 仅为可选增强，**不得**默认成最终桌面交付，也**不得**替代桌面壳拍板；推送若做须守提醒限频与「不制造焦虑」，**禁止**「连续打卡」强迫叙事 |
| 「不再采用创始人纪念包」写成永久废案 | 收紧为：v1 **主验证路径**改为审美 enrichment；创始人包 **不再当 v1 主路径**。永久废止须你另句确认（尤其已有并行实现分支） |
| 市场收入/下载数字写成既成事实 | 标为 **分析师引用，非本仓库已验证数据**；可作讨论背景，不作 SSOT 指标 |
| 「商店合规 = Capacitor 成本」混写 | **同意内核**：合规来自上架，与壳品牌无关。但 v1 选择纯 Web 的主因还应包括：**加快验证、避开审核周期**，而不只是法律诉讼细节 |
| 增长三件套因不上架「上调为主要获客」 | **相对权重可记一笔**；**禁止**自动推翻「可延后 / 电子书延后 / 勿挤占主路径债」。要提前排期须另行拍板 |
| 支付模块命名 `supporterGate` | 若主路径不再是「支持者包」，工程命名宜 `entitlementGate`（或等价）；勿与已废弃产品叙事绑死 |
| 「高级情绪动画付费」未划免费底线 | **必须**写明：Sit / Arrival / 基础 Idle 呼吸眨眼 / 每日首次庆祝级反馈 / Honesty 等 **核心路径不得付费墙** |

---

## 一、壳与发布形态

### 已锁定

1. **v1.0.0（及当前下一阶段默认）**：继续以 **纯 Web** 发布（Browser First）；**不**打包 Capacitor / Cordova / Flutter / React Native 上架。  
2. **未来若做手机原生壳**：默认候选 **Capacitor**（继承现有 Web；HealthKit / Health Connect 与 Store 内购插件同路线）。**不建议**为壳重写 Flutter/RN。  
3. **桌面壳**：维持 `PROCESS.md` Backlog「本地桌面 APP 打包选型」——候选 Electron / Tauri / PWA·薄壳；时机不变。Capawesome「Capacitor Electron」仅作**未来参考笔记**，本次不选型、不脚手架。

### 明确不做 / 纯 Web 下技术上不可用（v1）

- Apple HealthKit / Google Health Connect（含正念 session）  
- StoreKit / Google Play Billing 原生内购  
- 「一键分享到指定社交 App」作为核心承诺（与增长包一致；`navigator.share` 至多渐进增强）

### PWA（可选，非本纪要开工令）

- 可作「添加到主屏幕 / 缓存增强」候选；`TASKS.md` 任务六仍服从桌面壳选型，**不得**默认成最终电脑版交付。  
- service worker：**只能增强缓存**，不得变成「无网不可用」（已拍板 v1.0 纯本地口径）。  
- 若评估 Web Push：须单独 Brief；文案禁止强迫签到/断签羞辱；并知晓部分地区 iOS PWA 推送能力受限（分析师草稿所述缺口可作风险备注，非开工依据）。

### 何时重开手机壳

纯 Web 侧已有可复述的付费/留存信号，且团队愿意承担原生编译、签名、商店审核与（若做健康）Swift/Kotlin 窄插件维护时，再开短决策。默认仍走向 Capacitor，而非重写。

---

## 二、商业化方向（v1 主验证路径）

### 已锁定（方向，非定价）

- **v1 主验证付费价值** = **场域与陪伴的丰富程度**：  
  - 氛围音乐库 **深度分层**（免费保留足够温暖的子集；付费解锁更多内置曲——具体名单待细化）；  
  - **非核心**高级表现 / 特效类动画的分层（例：部分 Lab/增发仪式向表现）——**具体名单待细化**。  
- **坚持免费底线（硬）**：专注计时、Arrival、基础 Idle、诚实补登、每日首次达标级庆祝等 **核心陪伴与反馈** 不得锁在付费墙后。  
- **商业化红线不变**（`MVP_PRODUCT_DEFINITION`）：不卖数据、不衰败逼付、不倒计时/抽奖/强迫签到、不停付撤回已有练习记录、不毁免费用户完整基础体验。  
- **仍排除自动进路线图**：AI Coach、情绪分析报表、抽奖加速、365 天成长路线等。

### 与「创始人纪念包」关系

- **不再**把「支持者身份 + 永久纪念包」当作 **v1 主验证路径**。  
- `MVP_PRODUCT_DEFINITION` 中的「一次性支持 / 创始用户包」仍可作为 **假设清单中的备选**，但本纪要将其 **降级**：不挡主路径拍板；是否永久废止 / 是否改造成「审美解锁的一种包装」→ **待你决定**。  
- 并行分支 `feature/founder-supporter-pack`（Stripe + `supporterGate` + UI）**未合 develop**：本方向确认后，须你明确 **暂停合入 / 改造成 entitlement 路线 / 归档**，禁止在未拍板时默组合入。

### 支付实现（方向笔记 · 未立项）

- 纯 Web 阶段：Stripe Checkout（一次买或订阅 **未定**）为候选。  
- `cloud/` Workers + 凭证持久化：仅服务 **可选** entitlement / 换设备恢复；**禁止**绑死核心 Sit。  
- 换设备恢复：邮箱核验类轻量方案可议；**不**因此先建完整账号系统。  
- 门闩模块：独立 entitlement 层；**禁止**耦入 `SessionUiGate` / `MilestoneGlowStore` / `localeRegistry`。

分析师所引 Finch / Calm / Headspace 等市场数字：**外部引用，非本仓库验证指标**。

---

## 三、健康同步（Phase 1 · 非 v1）

- **决定**：正式确认 **不在 v1 范围**（与 `ARCHITECTURE.md` Phase 0/1 一致）；记入 Backlog，不替代 Honesty。  
- **未来技术预记**：Capacitor；优先考虑 **窄范围**自研插件（仅正念 session 读写）以降低社区大插件跟版风险——实现时另开 Brief，本次不脚手架。  
- **行政前提**（非 Agent 可代劳）：Mac / Xcode、Developer 账号、HealthKit entitlement、真机与商店沟通。

---

## 四、对增长内容包的影响

- 不上架商店 ⇒ 商店推荐 **不是** v1 获客假设。  
- 相对而言，已锁内容包（Zen Cinema / Quiet Line / 电子书等）的 **叙事权重可升高**。  
- **但**：不得自动改写 `task-growth-content-pack-decision.md` 的「可延后 / 电子书延后 / 勿挤占壳选型与主路径债」。要提前排期 → 你另行口头/书面拍板。

---

## 五、本纪要明确不做（禁止顺手开工）

- Capacitor / 桌面壳脚手架  
- HealthKit / Health Connect 接入  
- 未拍板的付费墙实现、定价文案上线  
- 用本纪要默认可合并 `feature/founder-supporter-pack`  
- 把 PWA 推成「已拍板必做」或最终电脑版形态  
- 付费锁核心情绪反馈或 Sit 主路径  

## 实现开工口令（将来 · 须另开 feature）

分别立项，例如：

- `feature/entitlement-ambient-tier`（氛围分层）  
- `feature/entitlement-animation-tier`（非核心动画分层 · 须先划免费底线清单）  
- `feature/pwa-cache-enhance`（若你点名 PWA）  
- `feature/capacitor-shell`（仅在重开手机壳之后）  

---

## 待你决定（写入本 Brief 时仍开放）

1. 氛围曲目 / 动画分层的具体免费 vs 付费名单  
2. Stripe：一次性 vs 订阅，以及价格带  
3. 是否现在单独立项可选 PWA（缓存增强）  
4. 增长包是否因本纪要 **提前**排期（默认：否，维持可延后）  
5. `feature/founder-supporter-pack`：暂停 / 改道 entitlement / 归档  
6. 「创始人纪念包」是永久不做，还是仅降级为非 v1 主路径  

确认本 Brief 后，开放决策条目以 `PROCESS.md` 同步为准。
