# Task Brief · Confide 知识库条目级 embedding 近义匹配

> **状态（2026-09-26）**：**PO 立项**（矩阵二拍漏检仍 ≈67% · 日志 `novel=0` 不挡立项）。**仍禁止在本 Chat / 未见开工口令时写运行时。**  
> **任务类**：B 类。实现须 **新开 Chat**，口令「按知识库条目 embedding Brief 开工」。  
> **交叉引用**：`task-confide-kb-routing-matrix.md`（二拍快照）· `task-confide-kb-routing-gate.md`（产品问闸门 · #937 已合）· `task-confide-kb-retrieval-wiring.md`（检索接线 · #924 已合）· `product-knowledge-base.md`

---

## 0. 大白话（给拍板用）

用户在倾诉里问「Sit 在哪」「接地练习怎么进」时，**已经**会用 embedding 判断「像在问产品」（#937 语义闸），也**已经**能用关键词在 catalog 里找短答（#924）。  
但换说法、加空格、英文变体仍经常**找不到对的条目**——矩阵 `probe` 漏检率二拍仍 **≈67%**。  
本 Brief 锁的是第三层：**在已通过 catalog 里，用向量近义选出哪一条**，而不是再堆正则。

---

## 一、目标

在 **产品问已通过语义闸** 且 **总开关 `FT_CONFIDE_KB_RETRIEVAL` 未关** 的前提下：

1. 用 **Qwen3-Embedding-0.6B**（与 Stage 2 / 产品闸同一 GGUF）对用户句与 catalog 条目做近义打分。  
2. **命中**：top-1 过阈值 → 原样短答（`data-source=product_knowledge`）；禁止 L3 转述。  
3. **未命中 / 低于阈值**：走现网 **诚实空态**（`product_knowledge_honesty`），**禁止** generate。  
4. **embedding 未就绪**：与 #937 一致——允许关键词 catalog 命中；否则诚实空态；**禁止** await 冷启动。

### 与已合层的分工（禁止混）

| 层 | 职责 | develop |
|---|---|---|
| 安全 / 边界 / 个人事实 | 正则 + 工具 | 已合 |
| **产品问闸门**（Library C 二分类） | 这句像不像问产品 | **#937 已合** |
| **条目检索（本 Brief）** | 在 catalog 里选哪条 | 关键词 v1（#924） |
| Stage 2 三桶 | 情绪 vs 功能 vs 灰 | 已合 · **不**改 |

---

## 二、非目标

- 不改语义闸阈值 / Library C 例句（除非实现 Issue 证明与条目层向量复用冲突）。  
- 不把 Stage 2 functional/emotional/gray 重训成四桶。  
- 不把急救型 / 未审核 / `yin_may_retrieve: 否` 条目放进向量索引。  
- 不在本刀为压矩阵 `probe` 漏检而无限加生产正则（矩阵 Brief 禁止）。  
- 不替代 `kb_retrieval_miss` 日志采集——**2026-10-12** 仍须再跑 `audit:confide-kb-matrix-probes` 补日志派生 `probe`。

---

## 三、方案（PO 默认 · 实现可微调阈值）

### 3.1 索引内容

对每个 **可检索** catalog 行（`yin_may_retrieve: 是` ∧ `审核状态: 已通过`），离线或首次 ready 时 embed：

- `title`（中/英标题字段）  
- `retrievalKeywords`（catalog 已有）  
- **不** embed 整段 `shortAnswer`（防 paraphrase 念稿；命中后仍只念 catalog 原文）

### 3.2 打分

- 用户句 embed **一次**；与闸门 / Stage 2 **复用同一向量**（禁止同句三次 embed）。  
- 对每条条目取向量 **max**(title, keywords 各短语) 或条目级单向量（实现 Issue 二选一，须单测锁）。  
- top-1 ≥ `FT_CONFIDE_KB_ENTRY_EMBED_MIN_SCORE`（默认保守，可比闸门略低——宁可 honesty 也不误命中）。  
- top-1 与 top-2 分差 < margin → 视同未命中（诚实空态）。

### 3.3 与关键词的关系

- **ready 路径**：embedding 分数 **优先**；关键词仅作冷启动 fallback 或并列取 max（实现 Issue 须写清，默认 **embedding 优先、关键词 fallback**）。  
- **off 开关**：`FT_CONFIDE_KB_RETRIEVAL=off` 仍回退「阿寅不做产品问答」层 5。

---

## 四、验收锚点（实现 Issue 可直搬）

| # | 用户句 | 期望 |
|---|---|---|
| E1 | `接地 练习 在 哪`（矩阵 `probe` · 空格） | `product_knowledge` · `KB-FUNC-0002` |
| E2 | `What is Today's shared sitting bar?` | `KB-FUNC-0004` |
| E3 | `倾诉能不能按 Esc 关掉？` | `KB-FUNC-0005` |
| E4 | `Sit 按钮在哪`（闸门=是 · catalog 无 Sit 专条） | `product_knowledge_honesty` · 非 generate |
| E5 | `有点烦` | **不进本层** · generate 照旧 |
| E6 | embedding `loading` + 产品问 | 关键词可命中则命中；否则 honesty · 非 generate |

矩阵 `must-*` 全绿 + `probe` 漏检率 **下降**（目标 <10%；未达不得宣称「修好漏检」，只可汇报降幅）。

---

## 五、开工门槛（二拍已满足项）

- [x] 矩阵首拍漏检 ≈71%（2026-09-22）  
- [x] 二拍审计已跑（2026-09-26 · `novel=0`）  
- [x] 二拍冻结夹具漏检 ≈67%（仍 ≥10%）  
- [x] 语义闸 + 诚实空态已合 develop（#937）  
- [x] catalog ≥15 条已通过（现 develop **19** 条）  
- [ ] 日志派生 `probe` 追加（**延后** 2026-10-12 · 不挡本 Brief 立项）

---

## 六、实现范围备忘（点头之后，不是现在）

- Electron 宽屏 + `l1LlamaWorkGate` 互斥（复用 embedding hold）。  
- 单测：矩阵 `probe` 行红绿对照 · 闸门/个人事实负例 · 未 ready 不 await。  
- 实验标定（A 类，可并行）：影子模式 `kb_entry_embed_shadow` 写 jsonl，不比对用户。  
- 文档：更新 `product-knowledge-base.md` 运行时句 · TEST_TRACKER 新行 · ISSUE_LEDGER 技术债收口。

---

## 七、口令

```
开工
按 focus-tiger/docs/task-briefs/task-confide-kb-entry-embedding.md 接条目级 embedding 近义匹配。不要改语义闸阈值。不要动 Stage 2 / with-prior。不要开 Electron。
Cursor Model: Composer 2.5 / Fast OFF
```
