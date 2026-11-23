# Task Brief：Thought Drop · What Yin remembers 点击可见

**任务号**：不新开代号。会话 B · P2 · 12/3 检查点。  
**人话**：在觉察一句卡片里点「What Yin remembers」，1 秒内必须看见记忆面板。没有桌面记忆桥时给一句提示，不许假装点了。  
**类别**：**B**（点了之后用户看见的叠层）。PO 2026-11-22 D3 点头。  
**不是**：伤害他人句池 / #1830 / 白名单路由（会话 A）。不是玻璃卡工厂改造。不是隐藏链接（那是 12/3 仍未修好时的退路）。

---

## 0. 大白话

点链之后 Thought Drop 卡不动、不闪、不关。处理函数其实接上了，记忆面板也 `open()` 了，但叠层表没有 `yin-memory`，置顶落空，面板停在觉察一句后面。用户看起来像死链。

## 1. 已拍板（D3）

- 点击后 **0–1 秒**内 `#yin-personal-memory` 可见，且 z 高于 Thought Drop。  
- 没有桥接：可见提示，禁止静默。  
- 加 e2e：Thought Drop 打开 → 点链 → 记忆面板可见。  
- 先用测试复现根因再修。

## 2. 冲突扫描

相邻：觉察一句、记忆面板 #430、玻璃卡叠层 18/19、Support 付款栈、#1821 同一次 pointerdown 忽略。

| 轴 | 结论 |
|---|---|
| a. 强度 | 只让已有面板露出来，不加仪式。 |
| b. 语气 | 无桥接提示是操作说明，不是陪伴句。 |
| c. 职责 | 记忆列表仍只在该面板；不改 Forget / Consent。 |

无未决冲突。

## 3. 变体矩阵（A10）

| 变体 | 入口 | 预期 | 自动化 |
|---|---|---|---|
| Electron 有桥 | 点链 | 0–1s 见记忆卡且在前 | 单测 elevate + e2e 桩桥 |
| 已打开但被挡住 | 再点链 | 仍置顶，不得因 `_open` 直接 return | `open()` 幂等 |
| 网页无桥 | 链隐藏；若仍调用 open | toast | 单测 `no-bridge` |
| 付款卡 | 不改 Support z | 不压 Subscribe | 不碰受保护路径 |

## 4. 点击反馈（0–1 秒）（A14）

| 控件 | 0–1 秒 | 持久化 |
|---|---|---|
| What Yin remembers | `#yin-personal-memory.is-visible`，叠在 Thought Drop 前 | 无 |
| 无桥仍被调用 | 中置 toast `YIN_MEMORY_PANEL_UNAVAILABLE` | 无 |

不在 `SILENT_BEHAVIORS.md`。

## 5. 边缘状态（A14）

| 边缘 | 预期 |
|---|---|
| 同一次 pointerdown | 仍走 #1821 `_ignoreOutsideUntil`，不得刚开就关 |
| Thought Drop 保持开 | `closeGrowthOverlayCards({ except: 'yin-memory' })` 仍可留一张其它卡（max 2） |
| 窄屏 Web | 无桥则链隐藏 |

## 6. 共用机制核对

- overlayBusy：记忆卡已在 `glassOverlayCards`；本刀不改消费者名单。  
- HUD 呼吸：不改 Focusing 驱动。  
- z-index：记忆卡从登记 18 在置顶时用 `GLASS_CARD_FRONT`（19），仍低于 Support 遮罩 25。禁止给 `#yin-support-modal` 写 inline z。  
- 新建可点击叠层：无新 overlay id。  
- 不涉及后台网络。

## 7. 范围锁

- 不改 `shouldUseNoticingFixedLine`、不改 aggression 句池。  
- 不把 `yin-personal-memory` 加进 `GLASS_CARD_ELEMENT_IDS`（须工厂卡；本刀只置顶）。  
- 不改 `src/main.js` 行数上限以外的逻辑；打开路径抽到 `src/ui/`。
