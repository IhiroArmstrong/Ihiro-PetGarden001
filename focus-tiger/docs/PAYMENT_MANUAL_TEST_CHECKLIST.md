# 三种支付 · 人工验收操作清单（Restore / 零耦合 / 致谢）

> **用途**：把 TRACKER / KnownRisky 里「还须 restore / 零耦合」写成**可照做的步骤**。  
> **前置**：Safari；产品壳；Cloud 已指向 ihiro Worker。  
> **日期**：2026-08-11  
> **测完后**：把结果写回 `TEST_TRACKER.md`「用户反馈」列（日期 + 原话要点）；**不要**混进「测试步骤」列。

---

## 0. 每次开测前（共用）

1. 终端：

```bash
cd /Users/armstronghesapplelaptop/Downloads/Zen-tiger-Pet-garden001/focus-tiger && npm run check:branch-freshness && npm run dev
```

2. Safari 打开：`http://127.0.0.1:5173/?product=1`  
3. 确认本机 `focus-tiger/.env.local` 有：  
   `VITE_CLOUD_API_BASE_URL=https://focus-tiger-cloud.ihiro.workers.dev`  
4. Stripe **Sandbox / Test Mode**；卡号用 Stripe 测试卡（如 `4242…`）。  
5. 关单级验收须在 **`origin/develop` tip**（`behind=0`）。feature 分支自检只算阶段性。

### 0.1 怎么「假装换一台设备」（测 Restore 必备）

付完后本机会已有本地解锁。测 Restore 前须**清掉本机对应 key**，再靠邮箱从云端拉回：

| 测哪一种 | Safari → 开发 → 存储 → 本地存储 → 本站，删这些 key |
|---|---|
| Tea | `focus-tiger.tip-jar.v1` |
| Sanctuary | `focus-tiger.sanctuary-entitlement.v1` |
| Membership | `focus-tiger.entitlement-cache.v1` |

删完后**硬刷新**页面（或关标签再开 `?product=1`）。

---

## A. Buy Yin a Tea（打赏 · 不解锁内容）

### A1 · 付完主路径（你已测过 webhook OK；致谢须 #231 合入后再验）

1. Idle → 宽屏点 **⋯**（或窄屏开抽屉）→ **Buy Yin a Tea**  
   （或右上 **Support Yin** → 喝茶那张卡 → CTA）  
2. 卡面点购买 → Stripe Checkout → 付 **约 US$9.99**（Test）  
3. 完成后应回到 `http://127.0.0.1:5173/?product=1…`  
4. **期望**：阿寅播 **喝茶** `teaDrinking`（不是冷启动魔法书/点头欢迎）  
5. 再开 Tip 卡：见徽章 / Tea Log；**不要**指望 Rituals 解锁

### A2 · 邮箱 Restore（**未测 · 请测**）

1. 记下 Checkout 用的邮箱（收据邮箱）  
2. 按 **§0.1** 删掉 `focus-tiger.tip-jar.v1` → 硬刷新  
3. Idle → **Buy Yin a Tea** 打开卡  
4. 下方 **Restore on another device** 输入同一邮箱 → 点 **Restore**  
5. **期望**：出现类似 “Tip status restored…”；卡内仍见已打赏状态 / 徽章  
6. **失败样例**：乱邮箱 → “No tip found…”；不崩溃、不解锁 Sanctuary

### A3 · 零耦合：Tip **不得**解锁 Sanctuary / Rituals（**未测 · 请测**）

在 **只付过 Tea、没付 Sanctuary/Membership** 的状态下：

1. Idle → **⋯** → **Yin's Sanctuary**  
   - **期望**：仍是未解锁 / 仍可点 Unlock；**不是**已开通 Lifetime  
2. Idle → **⋯** → **Rituals** 分组（Morning / Emotional Reset / Work Transition）  
   - **期望**：三项 **disabled**，旁有 “Available with subscription”（或等价锁文案）  
3. （可选）开 Sanctuary 卡 → 用 **Tea 的邮箱** 点 Sanctuary 的 Restore  
   - **期望**：**找不到** Sanctuary unlock（Miss），不得误开 Lifetime

---

## B. Yin's Sanctuary Lifetime（买断 · 进阶内容）

### B1 · 付完主路径（webhook OK 已记；confirm + 致谢待完整验）

1. Idle → **⋯** → **Yin's Sanctuary**（或 Support 左卡）  
2. 点 Unlock → Checkout → 付 **约 US$89.99**（Test）  
3. 回跳后 **期望**：  
   - 服务端 confirm 成功 → 本地解锁  
   - 阿寅播 **点头鞠躬** `mindfulAcknowledge`（#231）  
   - 卡内 / 阿寅旁可出现尊贵徽章（≥3）

### B2 · 邮箱 Restore（**未测 · 请测** · 现为 OTP）

1. 记下付款邮箱  
2. 按 **§0.1** 删 `focus-tiger.sanctuary-entitlement.v1` → 硬刷新  
3. 再开 **Yin's Sanctuary** 卡 → 输入邮箱 → **Send code** → 查收 6 位码 → **Verify & restore**  
4. **期望**：恢复解锁；Rituals 三项可点（Lifetime 覆盖 subscription 档）  
5. 无码 / 错码 / 错邮箱 → 不得解锁

### B3 · 零耦合：Sanctuary **不读** Tip；与 Tip 互不顶替（**未测 · 请测**）

1. 仅 Sanctuary、**清掉** Tip key（或从未付 Tea）：Tip 卡仍可购买；付 Sanctuary **不等于**自动记一笔 Tea  
2. 若本机曾付 Tea：删 Tip key 后用 Tea 邮箱 Restore Tip，**不得**改掉 Sanctuary 解锁状态  
3. Rituals：Sanctuary 解锁后应可进；这是 **B 轨权益**，不是 Tip

---

## C. Yin Membership（订阅 · 与 Lifetime 互覆盖进阶）

> **其它 Agent 已部分测过**：Sandbox 订阅 Checkout / webhook；曾出现 `502 subscription missing current_period_end`（dahlia API），`#229` 已修 period 读取。  
> **下列 Restore / 零耦合 / 完整致谢仍算未测完。**

### C1 · 付完主路径（部分完成 · 请补全）

1. Idle → Support / **⋯** → **Yin Membership** → 开 `#yin-membership-card`  
2. 点 **Subscribe**（须再点一次；开卡后勿误触立刻进 Stripe）  
3. Stripe **subscription** Checkout → 付完回跳（URL 带 `membership_session=cs_…`）  
4. **期望**：  
   - confirm 成功 → 本地 subscription 缓存  
   - 本地写入 `focus-tiger.membership-device.v1`（有 `email`+`deviceToken`）  
   - 阿寅播 **轻摆尾** `sessionComplete`（#231）  
   - **⋯ → Rituals** 三项可点（不再全锁）
   - Idle **屏幕右侧** `#yin-tip-kindness-badges` ≥ **3** 枚尊贵章（与 Lifetime 同视觉；**不**把 Sanctuary 卡标成已买）
   - 再开 Membership 卡见 **Manage**（仅卡内；无菜单第二入口）
5. Stripe Workbench：该笔 `checkout.session.completed`（subscription）应为 **200**，响应勿长期 `502`

### C2 · 邮箱 Restore（**未测 · 请测** · 现为 OTP）

1. 记下订阅邮箱  
2. 按 **§0.1** 删 `focus-tiger.entitlement-cache.v1` **与** `focus-tiger.membership-device.v1` → 硬刷新  
3. 开 Membership 卡 → 输入邮箱 → **Send code** → 查收 6 位码 → **Verify & restore**  
4. **期望**：恢复订阅态；Rituals 可点；device 凭证写回；**Manage** 可用  
5. 无码 / 错码 / 错邮箱 → Miss

### C3 · 零耦合（**未测 · 请测**）

1. **仅 Membership**：  
   - Rituals **应**可开（subscription）  
   - **Yin's Sanctuary** 卡仍可显示「未买 Lifetime」（Membership ≠ 自动买断 Lifetime SKU；以卡面文案为准）
   - Idle 右侧仍应见 ≥3 枚 B 轨尊贵章（与 Lifetime 互覆盖；**不是**把 Sanctuary 卡标已买）  
2. **仅 Tea**：Rituals 仍锁（同 A3）  
3. Tip Restore / Sanctuary Restore **不得**用 Membership 邮箱误写成另一轨解锁

### C4 · Manage / Provider（Prompt 10 · **未测 · 请测**；须 Worker 已含本路由）

1. **主路径**：C1 付完后开 Membership 卡 → **Manage** → 进 Stripe Customer Portal → 返回产品页  
2. **回流**：删掉 `membership-device.v1` 后 Manage 应提示先 Restore（不得静默无反应）；OTP restore 后再 Manage  
3. Provider：有凭证时刷新不丢订阅；无网 / 错 token 时本地宽限内仍 entitled（`refreshEntitlement` grace）

### C5 · Prompt 9 生命周期（另排；本清单不强制一次测完）

取消订阅、扣款失败、续费推进 `periodEndsAt` → 见 `YIN_MEMBERSHIP.md` Webhook 节；与本表 Restore 分开记 TRACKER「Prompt 9」行。

---

## D. 三种致谢（合入 #231 后验）

| 支付 | 回跳后应看到的动画 | 不应看到 |
|---|---|---|
| Tea | 喝茶 `teaDrinking` | 冷启动魔法书 / 点头欢迎盖掉喝茶 |
| Sanctuary | 鞠躬 `mindfulAcknowledge` | 庆祝舞 / 里程碑星石 |
| Membership | 摆尾 `sessionComplete` | 同上 |

Cancel（`tip=cancel` / `sanctuary=cancel` / `membership=cancel`）→ **不**播致谢、**不**写解锁。

---

## E. 测完怎么勾 TRACKER

| 测完哪块 | 写回哪一行 |
|---|---|
| A2 + A3 | Tip Jar（A）+ Tip 部署 |
| B2 + B3 | Sanctuary Unlock UI |
| C2 + C3（+ C1 补全） | Membership Checkout（+ Prompt 9 若测了 webhook） |
| C4 Manage / Provider | Membership cloud provider / Portal（Prompt 10） |
| D | 付费成功回跳致谢动画 |

每条反馈写：**日期 + 测了哪一步 + OK / 有问题（现象）**。
