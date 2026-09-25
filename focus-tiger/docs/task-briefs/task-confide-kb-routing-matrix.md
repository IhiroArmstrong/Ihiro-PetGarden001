# Task Brief · Confide KB 路由回归矩阵（字面层）

> **类**：A（纯逻辑单测 + 文档；**不改**用户可见回复 / 等待 / live 正则）。  
> **状态（2026-09-22）**：本回合已按本文落地夹具。口令可复跑，不必 Electron。  
> **本条验收的是**：意图×问法变体落到哪个 `dataSource` / KB 编号。**不代表**：短答文案、embedding 近义匹配、with-prior、Stage 2b。

## 口令

```
开工
按 focus-tiger/docs/task-briefs/task-confide-kb-routing-matrix.md 固化 KB 路由矩阵。不要改 live 正则。不要开 Electron。不要动 Stage 2 / with-prior。
Cursor Model: Composer 2.5 / Fast OFF
```

## 做什么

1. 枚举问法维度：怎么/如何/在哪/是什么/哪些/会不会/包不包含/能不能；中文空格；语序/语气词；中英各一遍。  
2. 每个**已上线可检索** KB 条目至少 3 条 fixture；练习时长工具另锁 `practice_facts`。  
3. 断言 `dataSource` + `catalogId`，禁止断言回复正文。  
4. 2026-09-22 手测 bug 全部 `must-hit` / `must-miss`：寅币、备份内容（含空格「哪些数据」）、时长空格、观察翼产品问→诚实空态、裸词观察翼不进 KB、`会不会好一点` 不进 KB。  
5. 新变体默认**加 fixture**，禁止为单句再堆一条生产正则。

## 语义层（embedding 近义）何时动工

跑 `node --test src/core/confide/confideKbRoutingMatrix.test.js`。  
`probe` 行（有意不锁死的拉伸变体）的漏检率由 `evaluateKbRoutingMatrix().probeMissRate` 给出。

| 信号 | 动作 |
|---|---|
| `probe` ≥ 4 且漏检率 **≥ 10%** 连续两次矩阵扩面后仍在 | 开 KB embedding 近义 Brief（复用已装 Qwen3-Embedding；方向仍 `task-confide-kb-routing-gate.md` 方案 B） |
| 漏检率 **< 5%** 且 `must-*` 全绿 | 语义层继续往后放；只加 fixture |
| 漏检率 5–10% | 先加 fixture / 少量关键词，不单独立项 embedding |

脚本**不得**打印「可以开工 embedding」。

**2026-09-22 首拍**（本矩阵落地时）：`probe` 14 条、漏 10、漏检率约 **71%**。已超过 10% 阈值，但只算**第一次**快照；按上表须再扩一次 fixture 后仍 ≥10% 才开 embedding Brief。禁止本 PR 顺手改 live 正则去压 probe。

## 第二轮 probe 来源（强制 · 2026-09-25）

**禁止**靠团队头脑风暴凭空造问法补 `probe`。第二轮只允许两类来源：

| 优先级 | 来源 | 怎么做 |
|---|---|---|
| 1 | **Electron `turns.jsonl` · `kind:kb_retrieval_miss`** | `cd focus-tiger && npm run audit:confide-kb-matrix-probes`。导出尚未进矩阵的**真实未命中**句到 `/tmp/ft-l0-lab/kb-matrix-probe-candidates-*.csv`。PO 标期望 `catalogId` / `product_knowledge_honesty` 后，以 `lock: probe` 写入矩阵。 |
| 2 | **2026-09-22 手测种子** | 已在 `KB_ROUTING_MATRIX_REGRESSION_IDS`（寅币 / 备份 / 时长空格 / 观察翼诚实 / `会不会好一点`）。**不得重复收集**。 |

**样本不够时**：`novel`（日志里、矩阵里还没有的未命中句）**少于 5** → **不硬开第二轮**；与 with-prior / Stage 2b 的 **2026-10-12** 复核合并看（同一回合拉 shadow + prior + 本脚本）。满 6 周仍不够须书面「样本不够」。

**心理预期（PO / 分析师 2026-09-25）**：首拍 71% 漏检 → 第二轮走完流程后仍大概率 ≥10%，届时开 embedding 近义 Brief 是**审慎确认**而非悬念；真正要提前想的是**优先级排第几**（B 类改路由），不是「要不要开」。

脚本**不得**打印「可以开工 embedding」。

## 不要做

- 不改 `confideClassify` / Stage 2 / with-prior / 观察翼 generate 文案  
- 不加载 GGUF  
- 不把 with-prior、gray→功能桶扩面套进本矩阵（见 `task-confide-prior-asymmetric-replay.md` / `task-confide-stage2-semantic-cutover.md` 的样本量触发点）

## 验收

- `cd focus-tiger && node --test src/core/confide/confideKbRoutingMatrix.test.js`  
- 进 `test:smoke`（`*.test.js` 自动收）  
- TRACKER：「仅单元测试覆盖」
