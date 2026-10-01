# Confide with-prior · PO 抽审表（可提前做）

> **状态（2026-09-26）**：本机 `eligible=45`（≥30 已达标）。**抽审不受 2026-10-12 日历门闩限制**——样本够了就可以标；10-12 当天再重跑脚本核对数字是否仍达标。  
> **本条验收的是**：不对称规则（gray→明确桶保留、明确桶→gray 丢掉）在真实多轮里是否产品上说得通。**不代表**改 live 路由；开 Stage 2b with-prior Brief 仍须 10-12 复核 + 本表关单。  
> **权威**：`task-confide-prior-asymmetric-replay.md` · `ISSUE_LEDGER` with-prior 行 · `confide-semantic-shadow-prior-turn-audit.md`

## 0. 刷新数字（标之前跑一遍）

```bash
cd focus-tiger && npm run audit:confide-prior-asymmetric
```

记下终端里的 `eligible` / `ruleHarm` / `naiveOther`。若 `eligible` 掉到 <30，暂停抽审、先正常用 Electron 攒多轮。

日志路径（本机）：`~/Library/Application Support/focus-tiger-desktop/companion-l2/turns.jsonl`

## 1. 你怎么判（填表用）

看每一行的 **alone**（只看当前句） vs **withPrior**（看了上一轮拼接） vs **ruledBucket**（不对称规则最终采用的桶）。

| PO 判定 | 含义 | 对开 Brief 的影响 |
|---|---|---|
| **Y** | 同意 `ruledBucket`；规则判对了 | 加分 |
| **N_PRIOR** | 应采纳 `withPrior`，规则错挡了 | harm 行出现 → 等同产品侧 ruleHarm |
| **N_ALONE** | 应只用 `alone`，规则错放了 with-prior | help 行出现 → 规则过度激进 |
| **F2** | 功能短句被上一轮情绪/闲聊带偏（或反过来） | 计入 other 观察；不单独否决，但须数是否「主导」 |
| **CTX** | 缺上一轮原文，本次无法判 | 须回 jsonl 补上下文后重标 |

**怎么找上一轮**：在 `turns.jsonl` 里按表中 `at` 时间找同会话、该 shadow 行之前的最近一对 user+yin；或看该行 `contextualText`（若有）。

### help 子类（PO 备注用，不替代判定码）

| 子类 | 含义 | 本批样例 |
|---|---|---|
| **help-emotion** | 上下文帮着看清情绪（gray→emotional） | H1–H3 |
| **help-kb** | 上下文帮着把字面模糊的功能问句判对（gray→functional） | H4–H5 |

## 2. 必审 A 区 — help + harm 全看（10 条）

Brief 要求 help/harm **全看**；本批 `naiveOther=0`，无 other 叉。下表来自 **2026-09-26** 本机回放，**共 10 条**。

### A1 · help（规则会采用 with-prior → `ruledBucket`）— 5 条

| # | 当前句 | alone | withPrior | ruled | PO 判定 | 备注 |
|---|---|---|---|---|---|---|
| H1 | “I’m here, but my mind really isn’t.” | gray | emotional | emotional | **Y** | help-emotion：接在情绪对话里「人在心不在」是正念/情绪观察表达 |
| H2 | 刚刚和甲方对了一下午方案，心好累，什么都不想说。 | gray | emotional | emotional | **Y** | help-emotion：字面已带「心好累」，alone=gray 意外，ruled=emotional 符合句意 |
| H3 | 好吧 | gray | emotional | emotional | **Y** | help-emotion · **低信息量 but context 生效**：alone 几乎零信息，with-prior 错挡代价最小；最能证明上下文在起作用 |
| H4 | 怎么开始坐？ | gray | functional | functional | **Y** | help-kb：上下文把字面模糊功能问判对；与 H1–H3 不同类，须分开记账 |
| H5 | 俺 如何 能够 获得 更多的 寅币？ | gray | functional | functional | **Y** | help-kb：同 H4 |

### A2 · harm（规则会丢掉 with-prior、保住 alone）— 5 条

| # | 当前句 | alone | withPrior | ruled | PO 判定 | 备注 |
|---|---|---|---|---|---|---|
| D1 | 我有点不高兴 | emotional | gray | emotional | **Y** | 明确情绪句被 with-prior 稀释成 gray；规则守住 alone |
| D2 | 今天什么都不想做，心里很闷」 | emotional | gray | emotional | **Y** | 同 D1 |
| D3 | 好累 | emotional | gray | emotional | **Y** | **jsonl 已查**（`2026-09-21T15:16:25.700Z`）：上一轮 User「今天什么都不想做，心里很闷」→ Yin「Going through the day on autopilot.」→ User「好累」。接续情绪句，alone=emotional 合理；with-prior 被拼回 gray 是典型稀释，规则守住 emotional。**非 F2** |
| D4 | How to get more focus coins? | functional | gray | functional | **Y** | **KB 同族**：functional 被上下文带偏 gray，规则纠正回 functional |
| D5 | 备份能够 备份 哪些数据？ | functional | gray | functional | **Y** | **KB 同族**：同 D4 |

#### KB 同族洞察（H4/H5 + D4/D5）

同一枚硬币的两面：功能问句在 with-prior 链路上对上下文噪声敏感——

- **help-kb**（H4/H5）：字面 gray → 上下文纠正成 functional  
- **harm-kb**（D4/D5）：字面 functional → 上下文带偏 gray → 规则再纠正回 functional  

本批不对称规则两次都兜住了，**但不能**仅凭整体 harm=0 就认为 functional/KB 类问句已稳定。若未来开 with-prior live，须单独盯防 KB 类问句稳定性（与 Stage 2 M、KB 矩阵漏检可能同根）。

## 3. 抽检 B 区 — same 叉补到 ≥12（再抽 7 条）

`same` 共 35 条；下表为分层抽检。三方一致，风险低；S7 用真实 KB 类 gray/gray 问句。

| # | 当前句 | alone | withPrior | ruled | PO 判定 | 备注 |
|---|---|---|---|---|---|---|
| S1 | 谁是胖墩？ | gray | gray | gray | **Y** | 闲聊 |
| S2 | 小姐姐喜欢吃胖粉吗？ | gray | gray | gray | **Y** | 闲聊 |
| S3 | “I keep reaching for my phone without even thinking about it.” | gray | gray | gray | **Y** | 情绪灰区 |
| S4 | “I was doing pretty well until this morning.” | gray | gray | gray | **Y** | 情绪灰区 |
| S5 | I feel like I'm just going through the motions today. | gray | gray | gray | **Y** | 情绪灰区 |
| S6 | I'm here, but where is my mind? | gray | gray | gray | **Y** | 情绪灰区 |
| S7 | Sit 按钮在哪 | gray | gray | gray | **Y** | KB 类 gray/gray（`2026-09-25` jsonl；注：「接地练习在哪？」本批为 alone=functional，不适合作 same 抽检） |

## 4. 关单汇总（PO 填）

| 检查项 | 门闩 | 你的结论 |
|---|---|---|
| 已标条数 | ≥ 12 | **17 / 17**（A10 + B7） |
| A 区 harm 行 PO 判 **N_PRIOR** | 0 条 | **0** 条 |
| A 区 help 行 PO 判 **N_ALONE** | 尽量少；>2 须书面说明 | **0** 条 |
| **F2** 污染 | 不主导（无统一口径时：>5 条须暂缓 Brief） | **0** 条 |
| **建议** | ruleHarm=0 且 other/F2 不主导 → 10-12 可开 Stage 2b with-prior Brief | **开** |

**建议附注（10-12 复核须带上）**：H4/H5/D4/D5 四条 KB 同族样本显示 functional 类问句对上下文噪声敏感；本批规则两次兜住，但若未来开 with-prior live，须单独盯防 KB 类问句稳定性，不能只看整体 harm=0。

**PO 签名 / 日期**：PO 草稿 2026-09-26（正式签字：__________）

## 5. 与 Stage 2 扩面（gray→功能桶）的关系

- **独立债**：扩面看 **M**（literal=gray ∩ semantic=functional 互异句 ≥25）；本机 2026-09-26：**M=9**，10-12 前仍靠正常多轮对话攒，禁止刷关键词。
- **可能同根**：A 区 H4/H5、D4/D5 与 KB 路由「字面 gray、语义 functional」同族——with-prior 抽审里标到的 KB 句，可记下来给 10-12 的 M 标注用，但**不合并**两次门闩。

## 6. 10-12 当天复核清单（到日再跑）

1. `npm run audit:confide-prior-asymmetric` → `eligible` 仍 ≥30？`ruleHarm` 仍 0？
2. 本表是否已关单（≥12 条、无 harm 行 N_PRIOR）？→ **本批已满足，到日重跑数字即可**
3. 另算 M（gray∩functional 互异句）是否 ≥25 — 见 `task-confide-stage2-semantic-cutover.md` Stage 2b 节
4. 两项都达标 → 分别开 Brief；任一项不够 → 书面「样本不够」，禁止默默悬着
