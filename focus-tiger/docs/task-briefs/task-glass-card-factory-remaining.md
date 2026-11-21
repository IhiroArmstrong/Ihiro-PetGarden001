# Task Brief · 玻璃卡工厂收口（其余 26 张旧卡）

> **状态（2026-11-21）**：口令「立刻开工」；PO 书面免点头。  
> **类**：**B**（叠层卡根改走共享暖米玻璃；观感仍是现网玻璃，不是新入口）。数字 z 不变。  
> **依赖**：#1825 引导冥想 + `check:glass-card-factory` 已合。  
> **不做**：Support 大卡进工厂 / 改 26/25/27；CSS `--z-*`；改 Stripe CTA 文案或结账 URL。

## 一句话目标

叠层登记过、仍手写卡根的 26 张旧卡全部改走 `createGlassCard()`。豁免表清空（只减不增）。`#yin-support-modal` 仍 keep-stylesheet-z，不进工厂。

## 范围（in）

- 26 个叠层 id 的卡根（提醒/收工钟是 `__panel`）走 `createGlassCard({ deck: true })`。  
- `GLASS_CARD_FACTORY_EXEMPT_IDS` 变为空表。  
- 倾诉卡仍在 `_syncConfideDock` 去掉拖拽标记（`GLASS_CARD_NO_DRAG`）。  
- Brief / task / tracker / issue 碎片。

## 范围（out）

- 不改 Support 26 / dim 25 / Sanctuary 27 数值。  
- 不改 overlay dim 选择器、菜单逃生舱、付款 CTA 文案或结账接口。  
- 不把非叠层 chrome（音符、热力图、Honesty 气泡）收进工厂。

## 变体矩阵

| 变体 | 入口 / 前置状态 | 预期（可见结果） | 自动化 |
|---|---|---|---|
| Help / Journey / 成长详情等一般叠层 | 菜单打开该卡 | 0–1 秒内见暖米玻璃卡，标题可拖（现网契约） | `check:glass-card-factory` + 本刀单测 |
| 倾诉卡 | 宽屏打开倾诉 | 卡可见；**不可拖**（去掉 `data-ft-glass-card`） | `glassCardDeck.test.js` + 源码 `_syncConfideDock` |
| Pro / 会员 / Sanctuary / 请茶 | Support 三卡 CTA | 卡根工厂玻璃；Subscribe / 解锁 / 请茶仍可点；已购仍淡化、不再开 Stripe | `test:payment-contract` |
| 提醒 / 收工钟 | 热力图旁时钟 | 展开的 **panel** 走工厂，外层图标壳仍手写 | `ReminderPreferenceUI` / `WorkEndPreferenceUI` 含 `createGlassCard` |

## 点击反馈（0–1 秒）

| 控件 / 入口 | 点击后 0–1 秒内用户看到什么 | 持久化时：挂起 / 成功 / 失败 |
|---|---|---|
| 菜单打开任一本刀叠层卡 | 该卡暖米玻璃可见 | — |
| Support → 加入会员 / 解锁 Sanctuary / 请茶 | 对应卡可见，主 CTA 可点 | 结账仍走现网三态，本刀不改 |
| 倾诉打开 | 倾诉卡居中可见，空白处拖不动 | — |

## 边缘状态

| 边缘状态 | 预期（含 0–1 秒反馈） |
|---|---|
| Lifetime / 会员已购 | Support 对应卡淡化，不得再开 Stripe |
| 倾诉 | 仍禁拖；最多两张玻璃叠层的其它卡规则不变 |
| Support 大卡 | 仍 stylesheet z 26，不进工厂、不进 18/19 |

## 共用机制核对

- **overlayBusy**：不改 occupancy / 第一幕 busy 门闩。  
- **HUD 呼吸**：不改 `overlayBreathing` 驱动者。  
- **z≥17 遮罩**：不改 dim。卡层仍 `Z.GLASS_CARD` = 18，低于 Support dim 25。  
- **新建可点击叠层**：不新增 `OVERLAY_UI_SURFACE` 行。  
- **受保护路径**：工厂只打在本刀 26 个明确 id；Support 不打 `data-ft-glass-card`、不进 18/19。Sanctuary / 会员 / 请茶只换卡根工厂，不改 CTA 选择器。

## 冲突扫描

相邻：场景 Help Center、倾诉、Support 三卡、玻璃最多两张。强度不变。人设不变。职责仍是「卡根必须走工厂」，不是新入口。无冲突疑点。

## 已好清单

- Support 大卡仍在遮罩之上，Subscribe 点到卡。  
- 玻璃叠层 inline 18/19 仍低于 Support dim 25。  
- 倾诉禁拖仍在。  
- #1816 标题拖拽契约仍在（本刀不撤 `data-ft-glass-drag-chrome`）。

## 验收

1. 豁免表长度为 0；Support 源码不含 `createGlassCard`。  
2. 上列 26 个 UI 文件均 `createGlassCard` + `deck: true`。  
3. `npm run test:smoke` 绿；`npm run test:payment-contract` 绿。
