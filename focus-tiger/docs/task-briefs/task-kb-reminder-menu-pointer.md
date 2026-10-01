# Task Brief · KB-FUNC-0033 提醒菜单指路 + 功能桶字面分类

> **状态（2026-09-29）**：PO 书面「合理则办」放行。窄刀：只做 Reminder 功能问法，不扩 Stage 2b 路由，不动 Language。
> **口令**：本 Brief。

## 做什么

1. 入库 **KB-FUNC-0033**（⋯ → Preferences → When should I remind you），`yin_may_retrieve: 是`。
2. `提醒我练习` / `Remind me to practice` 等 **Reminder 功能问法** → 字面粗桶 **functional**（`confideReminderFeatureQuestion.js` + `resolveConfideLiteralCoarseBucket`）。
3. 倾诉命中 → `data-source=product_knowledge` 念 catalog 短答（与 0029–0032 同模式）。

## 明确不做

- 不扩 Stage 2b gray→功能桶路由
- 不起草 Language 短答
- 不把情绪句 / 闲聊拧进功能桶
- 不改 stretch / companion away reminders 语义

## 验收

- 单测：`confideReminderFeatureQuestion.test.js` · `previewConfideLiteralSource.test.js` · `confideProductKnowledge.test.js` · `confideKbRoutingMatrix.js`
- 人工：Electron 宽屏 Confide 发「提醒我练习」「Remind me to practice」→ `product_knowledge` + 菜单指路短答；「有点烦」仍 generate
