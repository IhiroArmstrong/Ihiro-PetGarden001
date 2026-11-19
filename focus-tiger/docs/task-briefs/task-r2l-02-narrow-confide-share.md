# Task Brief · R2L-02 窄窗发送钮被首页三球挡住

> **状态**：PO 2026-11-19「立刻开工」+ 免 Brief 点头；本文件锁范围  
> **代号**：R2L-02（术语表已有；不得自编 T 号）  
> **类**：**B 类**（窄窗可点击：发送钮须点得着）  
> **旁支**：`fix/r2l-02-narrow-confide-share`  
> **不是**：改发送路由 / 换 embedding / 帮助中心长文 / 付款栈 / 抬 `#confide-to-yin-card` z-index

## 0. 大白话

手机窄窗打开觉察一句（Thought Drop）后，底部 Sit / 闪电 / Honesty 三球盖在发送钮上，点发送等于点了首页球。回车还能发。本刀只让卡片开着时三球不抢点击。

## 1. 目标

1. 390px：卡片 `.is-visible` 时 `#ft-narrow-home-ctas` `visibility: hidden` + `pointer-events: none`（与抽屉开时同形）。  
2. 发送钮中心 `elementFromPoint` 不得落到 `#ft-narrow-home-ctas`。  
3. 不改 z 数字；不碰 Support FAB / 三卡模态。

## 2. 非目标

- 宽屏倾听耳路径（本就不挡）  
- 同意层文案、安全层、生成闸  
- 帮助中心旧名

## 3. 冲突扫描

对照 **AE** 倾诉卡、窄屏三球 Sit/Honesty、菜单逃生舱。

| 轴 | 判断 |
|---|---|
| **强度** | 叠层打开时首页球不可点，与抽屉开时一致 |
| **语气** | 无新文案 |
| **职责** | 只修点击命中；不改回复内容 |

无未决冲突。

## 变体矩阵

| 变体 | 入口 / 前置 | 预期 | 自动化 |
|---|---|---|---|
| 390×844 Idle | `?confide=1` → 窄耳钮开卡 | 发送钮中心不是三球 | 本刀 e2e |
| 390 抽屉开 | 原 `is-sheet-open` | 三球仍隐藏 | 既有 CSS |
| 宽屏 1280 | 倾听耳开卡 | 行为不变 | 既有 confide-wide-dock |

## 点击反馈（0–1 秒）

| 控件 | 0–1 秒 |
|---|---|
| 窄窗发送 | 钮本身按下；不得落到 Sit/Honesty/闪电 |
| 卡片关闭后三球 | 恢复可点 |

不在 `SILENT_BEHAVIORS`：挡发送是 bug，不是设计静默。

## 边缘状态

| 边缘 | 预期 |
|---|---|
| 首次同意层盖在卡内 | 三球仍不抢点；同意走完后发送可点 |
| Enter 发送 | 保持可用（本刀不改） |
| 卡片关闭 | 三球恢复 |

## 共用机制核对

本次不新增 overlayBusy 源、不改 HUD 呼吸、不改 z≥17 遮罩数字。核对 `SHARED_RESOURCES.md` §4.1：既有倾诉开态仍算 overlayBusy，无新例外。核对 `Z_INDEX.md` Idle 常驻 chrome：不把倾诉卡抬过 Support；用关掉 `#ft-narrow-home-ctas` 点击穿透。不新建可点击叠层。

## 后台网络

不涉及后台网络。

## 验收

- `NarrowIdleShell.test.js` 锁 `:has(#confide-to-yin-card.is-visible)`  
- `e2e/r2l-02-narrow-confide-share.spec.js` 390px `elementFromPoint`  
- `cd focus-tiger && npm run test:smoke`  
- `npm run test:e2e:changed -- e2e/r2l-02-narrow-confide-share.spec.js`
