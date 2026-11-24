# Task Brief · Yin Membership 年订阅 SKU（方案稿，不写付款代码）

> **状态（2026-11-24）**：**已锁**。PO 口令「按年付 Brief 开工第 1 刀」。第 1 刀 = Stripe 年付 Price 环境变量 + `plan=yearly` 结账；**不改 Support 主按钮**。  
> **类**：第 1 刀偏 **A**（无新 CTA）；第 4 刀起为 **B**。  
> **挂靠**：Mac 首发定价两阶段稿（仓库唯一正文）[`Mac 首发定价与转化验证 Brief.md`](../../../Mac%20首发定价与转化验证%20Brief.md) 的**阶段二**。首包（12 月 8 日）本包不收款，本 SKU **不进首包**。  
> **口令**：`先出年订阅 Brief，只出方案不写付款代码`（本回合）。实现口令须另下，且本 Brief 第 8 节拍板项已书面锁。  
> **不是**：Pro $12.99 / AI 加购 $29.99（Plan A 新结账已 410）；**T86** 官网研究字典；Mac App Store / StoreKit。

## 大白话总结

会员现在只有按月约 $6.99。我们要加一档年付约 $47.99，和一次买断约 $89.99 一起当主推；月付只当对照。买了买断的人，原来的订阅等到当前周期结束再停，不退款。App 仍然只问「现在有没有权」，不重写整套权益。首包先不收款；这条等首包发出后再做。

---

## 1. 地面事实（方案所依，开工前复核 `origin/develop`）

| 项 | 事实 |
|---|---|
| 会员结账 | `POST /api/create-membership-checkout-session` 只绑 `STRIPE_MEMBERSHIP_PRICE_ID`（月付）。Plan A 的 410 **不**挡这条。 |
| 买断结账 | `POST /api/create-sanctuary-checkout-session`；KV 与会员分开。 |
| 权益 | `isEntitled` = 买断 ∪ 订阅；缓存已有 `planId`、`periodEndsAt`。 |
| 卡面 | 会员文案写死 billed monthly · `$6.99`。 |
| 买断后停订 | webhook 已认识 `cancel_at_period_end`，**没有**「买断成功 → 取消订阅」的主动调用。 |
| 首包 | 隐私口径「本包不收款」；邮箱云端找回关闸。Sandbox 才有测试笔，Live 真实客户按 0 计。 |

---

## 2. 已锁方向（PO 2026-11-24 同意 Cursor 建议，数字仍以 Mac Brief 第 8 节书面拍板为准）

| 项 | 锁 |
|---|---|
| 年价 | **$47.99**（备选 $49.99 不上架；**不建议 $59.99**；首发不同时试多价） |
| 月价 | 维持 **$6.99**（对照锚点，不是主按钮） |
| 买断 | 维持 **$89.99**；不涨已售 |
| 权益 | 不重写 Entitlement；年付 = 同一会员通道第二个 Price |
| 买断覆盖订阅 | **当期结束停止续费、不退款**（Stripe `cancel_at_period_end`） |
| 已买断 | 不再展示任何订阅 CTA |
| 不做 | 季度、MAS、Pro/加购捆绑、涨 Lifetime、为年付先重构 KV schema |

**默认高亮（建议，待 Mac Brief 第 8 节第 5 项拍板）**：B 臂默认高亮**年付**，买断并列第二主推；月付弱样式。理由：年付才是「月 vs 买断」之间缺的那档；买断高亮会更容易把年付吃掉。若拍板改成高亮买断，价格仍固定，只改默认样式。

---

## 3. 和 Mac 首发 Brief 的关系（两阶段，互不挡死）

| 阶段 | 做什么 | 不做什么 |
|---|---|---|
| **一** 首包不收款 | 留存 D1/D7/D30、首次坐、累计 3 次、功能使用 | 不测 Checkout / 付费成功；**不上本年 SKU** |
| **二** 年订阅上线后 | 本 Brief 的支付 + 入口 + 停续费；再测付费转化与「年付+买断主推」 | 不以阶段一留存「通过」为上线门闩 |

阶段一留存用于 Setapp / iOS 决策。年付是现网 SKU 缺口，**不**等留存达标才做。阶段一若样本不够，书面记「样本不够」，仍可开阶段二。

现网留存是本地 `RetentionFunnelStore` → `console.log`（`[RetentionTelemetry]`），**没有**云端聚合。阶段一「数据先跑起来」若没有另定收集办法（邀请制口头回收、本机导出、或日后正式 sink），团队**看不到**可汇总的 D7/D30。收集办法不在本 SKU Brief 范围，须在 Mac 首发 Brief 阶段一写清，否则阶段一无法判门槛。

---

## 4. 实现刀序（点头并另下口令后才写代码；一 PR 一刀）

1. **Stripe**：同一 Membership 产品下新增 `interval=year` Price；Worker `STRIPE_MEMBERSHIP_YEARLY_PRICE_ID`。月价 id 不动。  
2. **结账**：`create-membership-checkout-session` 接受 `plan: monthly | yearly`（缺省不得默默改成月付主推——缺省策略与 UI 主按钮一致，建议 **yearly**）。webhook / confirm 把 `planId` 写成 `yin-membership-monthly` | `yin-membership-yearly`（现网默认 `yin-membership` 视为月付，grandfather）。权益判断仍只看 active + 到期。  
3. **买断停订**：Sanctuary 支付成功且该邮箱有 `subscriptionId` → Stripe 设 `cancel_at_period_end=true`。失败须可重试/可客服补，不得假装已停。周期内会员权继续有效，与买断并集。文案写清：已买断，订阅将在本期结束后不再扣款，本期不退款。  
4. **应用内**（受保护路径：Support FAB、加入会员、会员卡）：年付主 CTA；月付对照；已买断隐藏订阅。须 `npm run test:payment-contract`。  
5. **官网定价页**：与应用内同一三栏逻辑。不并入 T86。  
6. **后置**：老月付「改年付每年省 $X」（存量近 0 时可等有 Live 订阅再做）。

生产 Worker 须单独口令「部署」后，阶段二才算可测 Checkout。

---

## 5. 变体矩阵（A10）

| 变体 | 入口 / 前置状态 | 预期（可见结果） | 自动化 |
|---|---|---|---|
| 未购 · 年付 | Support 会员卡 / 菜单 Subscription · 宽屏与 375 | 主按钮年付 $47.99；0–1s CTA 忙碌后进 Stripe yearly；成功回跳会员已开通 | `test:payment-contract` + 本刀补结账 plan 单测 |
| 未购 · 月付 | 同卡弱入口 | 对照 $6.99/月；进现网月付 Price；不得成为唯一入口 | 契约：月 CTA 存在但非主按钮 |
| 未购 · 买断 | Support Sanctuary | 仍 $89.99 一次；与年付并列主推，不绑 Pro | 现网 sanctuary 契约保持 |
| 已年付 / 已月付 | 会员卡 | 已订阅态 + Manage 门户；可展示买断；不得再开同轨第二次订阅 Checkout | 现网 Manage 锁 |
| 已买断 | Support / 会员 | 订阅 CTA 不出现或不可点；不得新开月/年 Checkout | 已购淡化契约 |
| 订阅中再买断 | Sanctuary 付清 | 买断立即有效；订阅 `cancel_at_period_end`；本期不退款；卡面说明本期结束后不再扣 | 本刀补 Worker 单测 |
| 已买断再点订阅 | 任何订阅 CTA | 不进 Stripe | 契约 |
| Electron vs Safari | 同 SKU | 结账均走 Stripe；本刀不做 MAS | 不测 MAS |
| en / ja | 价格与续费披露 | 切片文案；不念硬推销 | locale 切片单测 |
| 请茶 / 单件 $1.99 / 限量套 $9.95 | 各入口 | **不变** | 回归：茶价 < 月费 |
| Pro / 加购 | Support 第四/五卡 | 仍关新结账；本刀不重开 | Plan A 锁 |

---

## 6. 点击反馈（0–1 秒）（A14）

| 控件 / 入口 | 点击后 0–1 秒内用户看到什么 | 持久化：挂起 / 成功 / 失败 |
|---|---|---|
| 年付主 CTA | 按压 + disabled + 忙碌句；不得整卡被遮罩点关 | 挂起=忙碌；成功=离开去 Stripe；失败=卡仍开、错误句、可再点 |
| 月付对照 CTA | 同上，弱样式 | 同左 |
| 买断 CTA | 沿用现网 Sanctuary | 沿用 |
| 已买断时的订阅钮 | 不可点或隐藏；若可见须立刻说明已买断 | 禁止静默 `return` |
| Manage | 忙碌句 → 打开门户或失败句 | 现网 RCA：opening / opened / 失败须具体 |

---

## 7. 边缘状态（A14）

| 边缘状态 | 预期 |
|---|---|
| 已买断 | Support 订阅卡不新开结账；买断卡淡化 |
| 订阅仍在本期、买断已生效 | 两权并集；只停**续费** |
| 停订 API 失败 | 买断仍有效；可见「订阅可能仍会扣一次，请用 Manage 取消」类句；不得假装已停 |
| 宽限 7 天 | 沿用现网 `ENTITLEMENT_GRACE_MS` |
| 无邮箱 | 沿用现网：Checkout 仍可收集邮箱 |
| 窄屏 375 | 年/月/买断仍可点；付款大卡仍居中 |
| 本包不收款构建 | 不得露出可完成的 Live Checkout（首包政策；本 SKU 不进该构建） |
| 离线 | 不得假成功写权益 |

---

## 8. 共用机制核对

- **overlayBusy**：会员卡 / Sanctuary / Support 沿用现网互斥 `except: membership` 等；本刀不新建 overlay 状态。结论：不改 sceneAnim 忙碌表。  
- **HUD 呼吸**：不触及。  
- **z-index**：Support `#yin-support-modal` 走 `GLASS_CARD_KEEP_STYLESHEET_Z`；会员卡 z17/18、Sanctuary z26/27 不改数字。结论：只改卡内 CTA/文案，不改共享层 `pointer-events`。  
- **O-04 新建叠层**：不新建。  
- **受保护路径**：`#yin-support-fab`、Join Membership、Sanctuary Unlock、结账 URL。结论：改 CTA 文案与年付按钮须跑 `test:payment-contract`；Pro/请茶 CTA 不得误伤。

---

## 9. 冲突扫描（方案级）

对照 Support 三卡、仪式锁开会员卡、Plan A 停 Pro/加购、请茶零耦合。年付是会员通道加档，不是新付费墙，不挡免费 Sit。语气禁止 FOMO / 倒计时。疑点：**默认高亮年付 vs 买断** 只改样式，须 PO 在 Mac Brief 第 8 节第 5 项书面锁，实现不得自行改口。

---

## 10. 验收（方案稿）

- 本文件已入库；PO 书面点头第 2 节价格与停续费策略后，状态改为「已锁」。  
- **无运行时代码**（本回合）。  
- 实现回合另开 `feature/membership-yearly-*`，一刀一 PR，`--base develop`。

## 11. 实现口令（拟，未授权）

「按 `task-membership-yearly-sku.md` 开工第 1 刀：只加 Stripe 年付 Price 与结账 `plan=yearly`，不改 Support 主按钮文案。」  
未听到该口令前禁止写付款代码。
