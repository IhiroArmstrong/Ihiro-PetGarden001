# Task Brief · T44 空格起停 + 倾诉快捷键 + 系统通知

> **状态（2026-10-24）**：PO 口令「开工 T44」。拍板句见 [`GLOSSARY.md`](../GLOSSARY.md) 对照 **10**（不得改口）。  
> **类**：**B**（键盘行为 + 系统通知文案）。  
> **代号**：**T44**（执行序 7）。  
> **不是**：T47 收控件、T45 藏数字（#1402 已合）、T43 窗口形态、快捷键自定义 UI、每日提醒横幅改系统通知。

## 一句话

没在打字时，空格 = 和点 **Sit** 一样开始抵达，或专注中暂停/继续；⌘+E（Win/Linux 用 Ctrl+E）= 与菜单倾诉同一开门闩；定时坐满且你看不到窗口时，用系统通知轻声说「这一场到了」。

## 已经定下的做法

1. **空格 · Idle**：与 `#btn-focus` 同路径（含 Arrival 门闩）；禁止绕过仪式私自开表。  
2. **空格 · Focusing**：只 **暂停 / 继续**，不代替 Rise、不结束会话。  
3. **空格 · 其它状态**：忽略（Celebrate / 叠层打开 / `completionPending` / 微仪式选时长等）。  
4. **输入框**：`input` / `textarea` / `contenteditable` 内空格仍是空格。  
5. **防抖**：连续空格 ≥500ms 才第二次生效。  
6. **倾诉**：`Meta+E` / `Ctrl+E`；须 `canOpenConfidePanel`；聚焦时 `preventDefault` 避免浏览器默认行为。快捷键常量集中一处，便于以后改键。  
7. **系统通知**：仅 **自然坐满**（`beginSessionCompleteIfNeeded`）；文案观察式、不催促。  
8. **通知时机**：`document.hidden` 或桌面壳 `shell.hidden`（托盘/隐藏）时才发；前台仍靠老虎轻动（T45）。  
9. **权限**：Web 用 `Notification`；Electron 主进程 `Notification` IPC；拒绝权限则静默跳过，不挡庆祝。  
10. **登记** `SILENT_BEHAVIORS` **SB-23**：前台坐满不发系统通知 = 有意静默。

## 变体矩阵

| 变体 | 前置 | 预期 | 自动化 |
|---|---|---|---|
| Web Idle + Space | 无输入聚焦 | 等同点 Sit（Arrival 或后续开表） | 单测门闩 + 可选 e2e |
| Web Focusing + Space | 计时中 | 暂停；再按继续 | 单测 |
| Confide 输入框 + Space | 面板开 | 正常空格 | 单测 `isEditableTarget` |
| `?confide=1` + ⌘+E | Idle | 打开倾诉 | 单测 shortcut 解析 |
| Confide mount off 无 harness | Idle | 快捷键无反应 | 单测 |
| 坐满 + 页面前台 | Focusing | 无 Notification | 单测 `shouldOffer…` |
| 坐满 + `document.hidden` | Focusing | 尝试通知 | 单测 |
| Electron 托盘隐藏坐满 | 同左 | IPC 通知 | 主进程 handler 单测可选 |
| 多语言 en/zh/ja | 通知 | 切片文案 | locale 切片 |

## 点击反馈（0–1 秒）

本次无新增可点击控件；键盘触发走既有 Sit / 暂停 / 倾诉打开反馈。快捷键在门闩不允许时 **SB-23 同类静默**（与 `SILENT_BEHAVIORS` 登记一致）。

## 边缘状态

| 边缘 | 预期 |
|---|---|
| 付款 / Support 模态 | 空格不开始专注 |
| 读屏 | 不新增每秒播报 |
| Open-ended 坐满 | 同固定时长发通知规则 |
| Rise 早退 | 不发完成通知 |
| 诚实机制补登 | 不涉及 |

## 冲突扫描

强度：通知仅补充、不替代庆祝。语气：观察式。职责：不抢 T47/T50。相邻场景 A/C 无未决冲突。

## 共用机制

不碰 overlayBusy / z-index / 付款路径。后台网络：不涉及。

## 验收

- `npm run test:smoke`  
- 新单测：`productKeyboardShortcuts.test.js` · `sessionEndSystemNotification.test.js`  
- 手测：Electron 藏托盘坐满 10 分钟档见通知；前台只见老虎动。
