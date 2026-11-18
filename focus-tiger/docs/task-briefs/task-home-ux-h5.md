# Task Brief · 首页短问候轮换（H5）

> **状态（2026-11-18）**：**已锁**。H4 #1761 已合；PO 书面：后续可连贯执行两个 PR，Brief 无需再点头。  
> **人话**：阿寅旁边多一句很短的问候，每天换一句，不催、不开练习。  
> **类**：**B 类**（改宽屏 Idle 可见文案）。  
> **依赖**：`origin/develop` tip（含 H2 / H4）。方向锁 [`HOME_UX_ARCHITECTURE.md`](../HOME_UX_ARCHITECTURE.md)。  
> **不是**：Quiet Line 日签。**不是**切语播喝茶/看书。**不是**倾诉 companion_greeting。**不是** H6 窄屏骨架。**不是**往 `src/main.js` 加行。

---

## 0. 大白话

首页中央已经有阿寅和「开始练习」。这一刀只在按钮上方加一句短问候，按本地日历日从四句里轮换；点不到、也不自动坐下。

---

## 1. 冲突扫描（实现前）

对照 [`SCENARIO_TESTS.md`](../SCENARIO_TESTS.md)：

| 邻接 | 三轴 | 结论 |
|---|---|---|
| 场景 A / Sit · Begin Practice | 职责 | 问候不是 CTA。坐下仍走 Begin Practice / Sit 球 |
| Quiet Line | 职责 | 日签仍在 Inspiration 卡；本刀不读那池 |
| 切语问候动画 | 职责 | `localeGreeting` 仍只在换语言时播动作，不改文案轨 |
| 场景 AE / Confide greeting | 职责 | 倾诉管道不改 |
| 场景 Q / Support | 职责 | FAB 不改 |
| T42 / 菜单逃生舱 | 强度 | 不新遮罩；问候 `pointer-events: none` |

无未拍板冲突。

---

## 2. H5 要做

1. 宽屏 Idle：`#ft-home-idle-greeting` 在 `#ft-home-begin-practice` 上方。  
2. 文案走切片 `home-idle-greeting.json` 四句；`pickHomeIdleGreetingKey` 按本地日锁定。  
3. Sit 隐藏或 Arrival keepQuickStart 时问候一并隐藏。  
4. 不可点；不写 overlayBusy。  
5. 三语切片。禁愧疚账、禁疗效、禁时段词。

## 3. H5 不做

窄屏三块、纪念物槽、Support、自动坐下、往 `src/main.js` 加行、新 overlay。

---

## 变体矩阵

| 变体 | 入口 / 前置状态 | 预期（可见结果） | 自动化 |
|---|---|---|---|
| 宽屏 Idle | ≥480、Idle | 问候可见且非空；Begin Practice 仍在 | e2e + 单测 |
| 同日早晚 | 同一本地日 | 同一句 | `homeIdleGreeting.test.js` |
| 跨日 | 另一本地日 | 可换句 | 单测池旋转 |
| Arrival keepQuickStart | `.is-arrival-quick` | 问候隐藏 | 源码锁 CSS |
| 窄屏 | &lt;480 | 本刀不画（仍走 H6） | 现网 `park` 仅宽屏 |
| 三语 | en / zh / ja | 切片四句 | locale slice 测 |
| 付款 | 任意 | Support 不变 | 本刀不改保护选择器 |

## 点击反馈（0–1 秒）

| 控件 / 入口 | 点击后 0–1 秒内用户看到什么 | 持久化 |
|---|---|---|
| 问候行 | 设计不可点（`pointer-events: none`）；不是静默成功 | — |
| Begin Practice | 现网到达 / Sit | — |

## 边缘状态

| 边缘状态 | 预期 |
|---|---|
| Focusing | 问候随 home CTAs 隐藏 |
| `prefers-reduced-motion` | 无轮换动画 |
| 已购 Lifetime | 不改 Support |

## 共用机制核对

- **overlayBusy**：不新增忙碌源。问候不是 overlay。  
- **HUD 呼吸**：不接。  
- **z-index / dim**：不新 `position: fixed`。挂在既有 dock 内。  
- **后台网络**：不涉及。

## 验收

- 宽屏 Idle 见一句短问候 + Begin Practice。  
- 同一天不换句；问候点不了。
