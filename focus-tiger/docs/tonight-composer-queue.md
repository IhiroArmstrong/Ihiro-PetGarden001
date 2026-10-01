# 今晚 Composer 连贯队列（分类已做完）

> 额度策略：分类 + 补测试草稿走 **Composer/Grok 池**；近十天对抗审计走 **Other Models 池**（另开对话，只读不改代码）。

---

## 已完成（本对话）

- [x] 127 行无自动化提及 → 三类分类（[tracker-no-auto-classification.md](./tracker-no-auto-classification.md)）
- [x] 再生脚本 [classify-tracker-no-auto.cjs](../scripts/classify-tracker-no-auto.cjs)
- [x] 桌面路由锚点单测草稿 [confideDesktopRoutingAnchors.test.js](../src/core/confide/confideDesktopRoutingAnchors.test.js)（批次 1+2 前置）

---

## Composer 下一项（同池，建议顺序）

| 序 | 任务 | 估占用 | 产出 |
|---|---|---|---|
| 1 | 跑 `node --test src/core/confide/confideDesktopRoutingAnchors.test.js` + `npm run test:smoke` 相关子集 | 小 | 确认锚点绿/红 |
| 2 | 若红：只修 **confideAcceptanceResolve / semantic gate / classify 顺序**，不改 prompt | 中 | fix 旁支 |
| 3 | 从 22 条「可自动化」里**只**加 **Privacy sheet 点空白关**（L597）或 **375 Honesty pill**（L974）之一的小 e2e 草稿 | 中 | 一个 spec 文件 |
| 4 | **不要**做：节日四行 e2e、全盘架构、Reflection 上线、Stripe 价格、无 Brief 运行时 |

**不要在本对话并行开多代理**；一个主题一个新对话。

---

## 强模型对话（Other Models · 另开）

**先做**：读 [tonight-composer-queue.md](./tonight-composer-queue.md) §5 + [tracker-no-auto-classification.md](./tracker-no-auto-classification.md) §5。

**只读审计**（约 40%）：

1. 安全路由：攻击/危机句是否仍能进 KB honesty 或 generate
2. 叠层互挡：Confide / Support / Witness / Focusing 同时开
3. 知识库检索：near-match、reminder functional、catalog 误 hit
4. 语音朗读：危机/攻击是否仍 text-only（TTS Brief）

**交付**：Markdown 报告，**无 commit**。

---

## 仍留你眼（不写测试）

- 短答语气、英/日 draft 池、1.7B hitch、Voice 听写质量
- 节日 wash、玻璃 dim、Safari Circle、支付观感
- TRACKER 359 行里已标自动化但仍「待人工测试」的版式项
