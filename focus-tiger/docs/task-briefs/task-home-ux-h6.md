# Task Brief · 窄屏同一套结构（H6）

> **状态（2026-11-18）**：**已锁**。H5 #1764 已合；PO 书面：继续 H6，Brief 无需再点头。  
> **人话**：手机宽度下也看到同一句问候和「开始练习」，菜单仍从底下抽出来。  
> **类**：**B 类**（改窄屏 Idle 入口）。  
> **依赖**：`origin/develop` tip（含 H5）。方向锁 [`HOME_UX_ARCHITECTURE.md`](../HOME_UX_ARCHITECTURE.md)。  
> **不是**：把窄屏改成宽屏侧栏。**不是** H3 纪念物。**不是** H8 设置子页。**不是**往 `src/main.js` 加行。**不是**动 Support FAB。

---

## 0. 大白话

宽屏已经有问候和开始练习。这一刀只把这两样接到窄屏三球上面；底边抽屉、三球、逃生舱留下。

---

## 1. 冲突扫描（实现前）

对照 [`SCENARIO_TESTS.md`](../SCENARIO_TESTS.md)：

| 邻接 | 三轴 | 结论 |
|---|---|---|
| 场景 A / 375 Sit | 职责 | Begin Practice `data-proxy=sit`，与 Sit 球同一代理 |
| 场景 A / 问候 | 职责 | 同一 `pickHomeIdleGreetingKey` 池；不可点 |
| 菜单逃生舱 | 强度 | 抓手 / 抽屉不删 |
| T42 次级不挡脸 | 强度 | 不改宽屏侧栏；窄屏仍底边 sheet |
| 场景 Q / Support | 职责 | FAB 不改 |
| H2 右栏 | 职责 | 窄屏仍不画 `#ft-home-zone-memories` |

无未拍板冲突。

---

## 2. H6 要做

1. 窄屏 Idle：`#ft-narrow-home-idle-greeting` + `#ft-narrow-home-begin-practice` 在三球之上。  
2. Begin Practice 点了走现网 Sit（`btn-focus`）。Sit 隐藏时问候和钮一并隐藏。  
3. 问候 `pointer-events: none`。  
4. 底边抽屉不改成侧栏。  
5. 抬高底部文案净空，避免 toast 压住新叠层。

## 3. H6 不做

宽屏改布局、纪念物槽、Support、把右栏搬到窄屏、新 overlay、往 `src/main.js` 加行。

---

## 变体矩阵

| 变体 | 入口 / 前置状态 | 预期 | 自动化 |
|---|---|---|---|
| 窄屏 Idle | ≤479、Idle | 问候非空 + Begin Practice + 三球 | 源码锁 |
| 点 Begin Practice | Sit 可用 | 0–1 秒见到达 | sit 代理 |
| Arrival keepQuickStart | `.is-arrival-quick` | 问候与 Begin 隐藏 | CSS 源码锁 |
| 宽屏 | ≥480 | 仍用 H5 `#ft-home-*`，无窄屏重复 id | 分 id |
| 三语 | en / zh / ja | 同 H5 切片 | 既有 slice |
| 付款 | 任意 | Support 不变 | 未动保护选择器 |

## 点击反馈（0–1 秒）

| 控件 | 0–1 秒 | 持久化 |
|---|---|---|
| Begin Practice | 与 Sit 球相同：到达或现网 Sit | — |
| 问候 | 不可点 | — |
| 三球 | 现网 | — |
| 抽屉抓手 | 现网底边名单 | — |

## 边缘状态

| 边缘 | 预期 |
|---|---|
| Focusing | 问候与 home CTAs 隐藏 |
| Sit 禁用 | Begin Practice disabled |
| `prefers-reduced-motion` | 无新动画 |
| 已购 Lifetime | 不改 Support |

## 共用机制核对

- **overlayBusy**：不新增忙碌源。核对结论：问候不是 overlay；HUD 呼吸不受影响。  
- **HUD 呼吸**：不接。  
- **z-index / dim**：不新 `position: fixed` 层；仍用窄屏壳既有层。  
- **后台网络**：不涉及。

## 验收

- 375 Idle 见问候 + 开始练习 + 三球。  
- 点开始练习进到达。抽屉仍从底下出来。
