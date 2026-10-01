# Cursor prompt · Confide with-prior 不对称规则回放

> **类**：A（影子 / 离线审计）。**不改**用户看到的回复、等待或 live 路由。  
> **状态（2026-09-21）**：本回合已按本文执行；口令可复跑。  
> **本条验收的是**：历史 `turns.jsonl` 上「gray→明确桶保留、明确桶→gray 丢弃」套上去之后 help/harm 是否改善。**不代表**：with-prior 已进真路由，也不代表用户茶句会变。

## 口令

```
开工
按 focus-tiger/docs/task-briefs/task-confide-prior-asymmetric-replay.md 做不对称规则回放。不要改 applyConfideStage2Route。不要开 Electron。只读既有 jsonl。
Cursor Model: Composer 2.5 / Fast OFF
```

## 规则（写进纯函数，禁止手算改桶）

对 `kind: semantic_shadow_classify` 且 `ok:true` 且 `hadPriorTurn` 且 `semanticCoarse` / `semanticCoarseWithPrior` 均非空的行：

1. **help**：alone=`gray` 且 with-prior ∈ {`emotional`,`functional`} → 采用 with-prior。  
2. **harm**：alone ∈ {`emotional`,`functional`} 且 with-prior=`gray` → **仍用 alone**（丢掉稀释）。  
3. **other**（如 emotional↔functional）：本刀 **仍用 alone**（不在本规则里放行）。  
4. 禁止重新 embed；禁止再让用户发新句子。

## 要跑的命令

```bash
cd focus-tiger && node --test src/core/confide/auditConfideSemanticPriorAsymmetric.test.js
cd focus-tiger && npm run audit:confide-prior-asymmetric
```

本机默认日志：`~/Library/Application Support/focus-tiger-desktop/companion-l2/turns.jsonl`。  
结果 JSON：`/tmp/ft-l0-lab/semantic-prior-asymmetric-<epoch>.json`。  
Agent **禁止**把整份 `turns.jsonl` 读进 Chat；只汇报脚本终端摘要 + JSON 里的计数。

## 汇报必须有的数字

- `eligible` / `naiveHelp` / `naiveHarm` / `naiveOther` / `naiveSame`
- `ruleHelp` / `ruleHarm`（套规则后 harm 必须为 0，否则函数写错）
- `naiveHelp÷(help+harm)` vs `ruleHelp÷(help+harm)`
- 列出 harm 样例原文（≤10 条，来自 JSON `forks` 里 `naiveFork=harm`）

## 产品结论怎么写

- 若规则后 **只剩 help、harm=0**，且 eligible 不是个位数：可以建议另开 **Stage 2b 小范围 Brief**（仍须 PO 拍板；本 prompt **不得**改 live）。  
- 若 help 仍很少、或 other（含 F2 功能污染）很多：写明「不对称规则挡得住稀释，仍挡不住桶对调/功能误拉」，**不要**建议一律 with-prior。  
- **禁止**根据 DevTools `data-source` 解释本回放。

## 不要做

- 面板打开时预加载 embedding / 加 0.6B 加载 UI（见 `ISSUE_LEDGER`；等 `task-confide-embedding-work-gate` 合入后再一起评，禁止单独先上预加载）
- 改 `applyConfideStage2Route` / 状态条 / Confide 文案
- 为凑样本再让用户 Electron 连发 20 句

## 重新评估触发点（2026-09-22 · 不是问法矩阵）

本债卡住的是**多轮真实样本**，不是「怎么/在哪」变体覆盖率。禁止用 KB 路由矩阵代替本回放。

| 门闩 | 数字 |
|---|---|
| 日历 | Stage 2 窄刀在 `origin/develop` 满 **3 周**；首次复核日 **2026-10-12** |
| 样本量 | `audit:confide-prior-asymmetric` **eligible ≥ 30** |
| 人工 | PO 抽 **≥ 12** 条（help / harm / other；other 若很少则全看） |
| 才开 Stage 2b with-prior Brief | ruleHarm 保持 0 **且** other（含 F2）不主导 |
| 延期 | 满 **6 周** eligible 仍少于 15 → 必须书面汇报「样本不够」，不得当已遗忘 |

回放脚本仍**不得**写「可以切 with-prior live」。
