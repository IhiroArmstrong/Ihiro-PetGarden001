# Task Brief · Support 降视觉优先级（H4）

> **状态（2026-11-18）**：**已锁**。H2 #1758 已合；PO 书面：后续可连贯执行，「立刻开工 / 继续 H4」。  
> **人话**：首页右上「支持阿寅」平时收成小标，不跟「开始练习」抢第一眼。点下去仍是原来的付款三卡。  
> **类**：**B 类**（改 Idle 右上 Support 按钮默认观感）。  
> **依赖**：`origin/develop` tip（含 H2）。方向锁 [`HOME_UX_ARCHITECTURE.md`](../HOME_UX_ARCHITECTURE.md) · [`SANCTUARY_UI_ART_DIRECTION.md`](../SANCTUARY_UI_ART_DIRECTION.md) **D.8**。  
> **不是**：H3 纪念物一件+件数。**不是**把 Support 搬进 ⋯。**不是**去掉标签（禁止纯 icon）。**不是**改五卡 / 结账 URL。**不是**往 `src/main.js` 加行。**不必等** H3 #1759 合入。

---

## 0. 大白话

Support 功能留下。这一刀只让 Idle 默认少占视线：看得见头像小标，鼠标悬停、键盘焦点、或已经打开三卡时，再展开完整「Support Yin」药丸。

---

## 1. 冲突扫描（实现前）

对照 [`SCENARIO_TESTS.md`](../SCENARIO_TESTS.md)：

| 邻接 | 三轴 | 结论 |
|---|---|---|
| 场景 Q / Support | 职责 | 仍是 `#yin-support-fab` → 同一模态与五卡。只改默认视觉重量 |
| 场景 A / Begin Practice | 强度 | 主坐下入口仍是中央文字钮；本刀不把 Support 做成更大 CTA |
| T47 专注中收控件 | 职责 | Focusing 时 FAB 仍隐藏（现网 `setFabVisible`） |
| 菜单逃生舱 | 强度 | 不改 ⋯ |
| T42 次级不挡脸 | 强度 | 不改 FAB 坐标；不新遮罩 |

无未拍板冲突。H3 填右栏纪念物槽，本刀不碰该槽。

---

## 2. H4 要做

1. Idle 默认：`.yin-support-fab__label` 视觉收起（`max-width: 0` + 透明），标签仍在 DOM。  
2. `aria-label` 保持 Support Yin（三语现网键）。禁止无障碍名称丢失。  
3. `:hover` / `:focus-visible` / `[aria-expanded='true']` 展开完整药丸。  
4. 点击路径不变：0–1 秒见 `#yin-support-modal`。  
5. 须跑 `npm run test:payment-contract`。

## 3. H4 不做

搬家到别的角落、塞进菜单目录、改 z-index 数字、改结账、改已购淡化、H3 收藏、问候轮换、窄屏三块骨架、往 `src/main.js` 加行。

---

## 变体矩阵

| 变体 | 入口 / 前置状态 | 预期（可见结果） | 自动化 |
|---|---|---|---|
| 宽屏 Idle | ≥480，未悬停 | 小标；完整文案不可见；钮仍可点 | 源码锁 CSS + `aria-label` |
| 悬停 / 键盘焦点 | 同上 | 0–1 秒见完整药丸 | 源码锁选择器 |
| 三卡已开 | `aria-expanded=true` | 药丸保持展开 | 源码锁 |
| 窄屏 | ≤640 | 同收起/展开；位置仍在音符左侧 | 源码锁 media |
| 三语 | en / zh / ja | 文案键不改 | 既有 locale 键测 |
| 付款 | 点 FAB | 五卡 CTA 中心点仍命中自己 | `test:payment-contract` |
| Focusing | 现网隐藏 | FAB `hidden`，不是哑点击 | 沿用场景 Q1 回流 |

## 点击反馈（0–1 秒）

| 控件 / 入口 | 点击后 0–1 秒内用户看到什么 | 持久化 |
|---|---|---|
| `#yin-support-fab` | `:active` 压缩 + `#yin-support-modal` 展开 | — |
| Maybe later / 遮罩 | 现网关卡 | — |
| 未购 CTA | 现网结账忙碌 + 关模态 | 现网 Stripe |
| 已购 Sanctuary CTA | 仍 disabled，不开 Stripe | — |

## 边缘状态

| 边缘状态 | 预期 |
|---|---|
| 已购 Lifetime | 卡面淡化契约不改 |
| Focusing | FAB 隐藏 |
| `prefers-reduced-motion` | 药丸展开不带动画时长 |
| 标签视觉收起 | 屏幕阅读仍读 `aria-label`；不是 `display:none` 卸掉名称 |

## 共用机制核对

- **overlayBusy**：不新增忙碌源；开合仍走现网 Support 模态。**核对结论**：不改 `overlayBusy` 消费者，HUD 呼吸计时不受影响。  
- **HUD 呼吸**：不接。  
- **z-index / dim**：不改 `#yin-support-fab` / `#yin-support-modal` / `#yin-support-backdrop` 登记数字。FAB 保持 `pointer-events: auto`。  
- **付款**：选择器与结账 URL 不变。

## 验收

- Idle 默认不跟 Begin Practice 抢一行大药丸。  
- 点 FAB 仍开三卡；付款契约绿。  
