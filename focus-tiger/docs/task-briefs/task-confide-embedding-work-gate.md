# Task Brief · Confide companion 工作闸（getLlama 一层互斥）

> **状态（2026-09-22）**：PO 已点头；运行时在 #919（`l1LlamaWorkGate` + `l1Child` 接线）。对照实验仍可选，不挡合入。  
> **实现类**：**B**（可能改变「等回复」的时长；不得改变 Stage 2 路由表与答句内容）。  
> **对照**：`spriteChannelArbitration` 的形状（调用方只报意图、一处拍板），**不是**抄它的 500 行矩阵。目标体量：纯函数闸 **约百行级** + 单测；禁止做成 `overlaySlotArbitration` 那种大表。  
> **现状说明**：`docs/confide-embedding-lifecycle-arbitration.md`。止血：#912（ensure 超时 + ready 跳过重复 ensure）+ #913（渲染进程 `process is not defined`）。**闸从未开工。**

## 一句话

聊天模型（Gemma）和向量模型（Qwen3-Embedding）共用同一把 `getLlama()`，现在两条队列可以同时去抢。本刀只在 `l1Child.js` 加一层互斥：同一时刻只允许一边进 `getLlama` / `loadModel`。

## 背景（已确认 vs 未证实）

已确认：

- 聊天 `enqueue` 与 embedding `enqueueShadow` **不是**同一条 stdin 队列。
- 两边仍各自 `getLlama()` + `loadModel`（`l1Hold.js` / `l1EmbeddingHold.js`）。
- Stage 2 分类未就绪立刻 fail-open；卡死发生在**分类之后**的聊天 `ensure` / 生成。
- #912 只止血，不是调度。
- `l1SemanticShadowEmbeddingGate.js` 只管影子分类超时预算，**不是**本闸。

未证实（闸合入**前**用对照实验回答，见 §对照实验）：

- embedding 已经 `reason: ok` 之后再发同句，聊天是否仍会互锁。

## 做什么

1. 抽出小模块（建议名 `desktop/companion/l1LlamaWorkGate.js`，与现有 `l1Hold` / `l1SemanticShadowEmbeddingGate` 同族驼峰；测试 `l1LlamaWorkGate.test.js`）。
2. 只两种意图：`chat`（主聊天加载 / generate 前 ensure）与 `embedding`（向量加载）。调用方报告意图；闸回答现在能不能进 `getLlama`。
3. 硬规则：
   - **禁止**两边并行 `getLlama` / `loadModel`。
   - **聊天优先**：embedding 排队等聊天；不得让聊天去「等向量冷启动完才能回话」（Stage 2 不变量仍在）。
   - 若 embedding **已经**握着闸，聊天等待 **不得超过**现网 #912 的 `ensureReady` 30s；超时走既有失败路径（corpus / 看门狗），禁止新错误页。
   - 两条 Promise 链 **保持分离**（禁止把 `enqueue` 与 `enqueueShadow` 合成一条总队列——那会把分类排到生成后面，比现状更糟）。
4. 接线只在 `l1Child.js`：在调用 `loadModelHold` / `loadEmbeddingHold`（及它们内部的 `getLlama`）外面包闸。不把闸散进渲染进程、不改 `applyConfideStage2Route`。
5. 单测用假时钟 / 假 `getLlama`（禁止单测加载原生 addon）：重叠持有必须失败；聊天插队时 embedding 等待；释放后第二边才能进入。

## 明确不做

- 不改 Stage 2 路由表、语义桶、with-prior、不对称回放（#917）。
- 不加「向量正在加载」用户文案。
- 不在打开面板时预加载 embedding。
- 不把 `l0Probe` / `l0Spike17Probe` 实验室路径并进本闸（那些不走产品 `l1Child`）。
- 不合并超时政策（45s UI 看门狗、30s ensure、15s 分类超时保持原数）。
- 不把本闸做成精灵占用 / 叠层占用的「第三张总表」。

## 加载提示 / 预加载（闸之后才评）

两条**绑在一起评**，本 Brief **不交付**：

| 项 | 现在 | 闸做好之后 |
|---|---|---|
| 加载提示 | 可以永远不做（fail-open 已够用） | 再评一次收益；默认倾向仍是不做 |
| 面板打开时预加载 embedding | **禁止**单独先上（会加重争用） | 只有闸在、且对照实验证明争用可调度时，才允许再开一页 Brief |

## 对照实验（闸合入前 · 与「随便点开 Electron」不是一回事）

**目的**：确认 #912/#913 止血之后，**向量已经成功分过类**时，再发同一句还会不会把聊天卡死。

**不是**：打开倾诉随便聊两句看「还能不能回」。看门狗已经会在约 45 秒丢套话，那看起来像「没坏」，回答不了互锁问题。

### 大白话步骤

1. 用已经合进主干的桌面版打开倾诉（宽屏）。
2. 发**一句**你上次卡住时用过的话（没有就用同一句情绪独白）。
3. **先别连发。** 去本机记录文件  
   `~/Library/Application Support/focus-tiger-desktop/companion-l2/turns.jsonl`  
   看**最后一条** `semantic_live_classify`：
   - `reason` 是 `embed_not_ready` → 再等一会儿（约半到一分钟），**不要**看状态条——上面没有「向量好了」。
   - `reason` 是 `ok` → 进入下一步。
4. 看到 `ok` 之后，**再发同一句话**。
5. 看结果（计时即可，不必开 DevTools）：
   - **互锁已淡**：十几秒内有正常答句（或至少出现 generate / hybrid 记录，而不是干等到顶）。
   - **互锁仍在**：一直转圈，直到大约 45 秒才出那句失败套话；或 `turns.jsonl` 里这条之后没有 generate。
6. 把结论写回本 Brief / ISSUE_LEDGER（「止血后仍互锁」或「止血后不再互锁」）。**无论哪种，本闸 Brief 仍成立**：前者是修争用；后者是把「禁止并行 getLlama」写成契约，免得预加载以后再踩。

界面上没有「向量就绪」灯。禁止用状态条 `Model4E4` 当本实验的完成信号（那只表示聊天模型好了）。

## 已好清单（实现时必须守住）

- Stage 2：embedding 未就绪 → 立刻字面 fail-open，用户可见分类**不得**等向量冷启动。
- #912：Thinking 最长约 45s；`ensureReady` 30s 超时；`phase === ready` 不再重复 ensure。
- #913：渲染进程不得再 `process is not defined`。
- Prompt 10：状态条继续过滤 `embedding_*`，不得冒出幽灵 Downloading。
- 安全阀 / aggression 等规则桶仍立刻 corpus，不经本闸改路由。

## 共用机制核对

本次不触及 overlayBusy / HUD 呼吸驱动 / z≥17 遮罩 / 新建可点击叠层，核对跳过。

实现 PR 须在 `SHARED_RESOURCES.md` 补一行：companion child 的 `getLlama` 由 `l1LlamaWorkGate` 独占，消费者为 `l1Hold`（聊天）与 `l1EmbeddingHold`（向量）；禁止第三处产品路径再裸调。

## 冲突扫描（对照 `SCENARIO_TESTS`）

- **场景 AE · Electron**：倾诉能聊、Share 后有回复。本闸只串行化底层加载，不改入口、文案、安全阀。强度：不得比现网 45s 看门狗更重。语气：无新文案。职责：不是精灵占用、不是叠层占用、不是影子分类超时闸。
- **场景 AD**：不改睡/醒。
- **#917 不对称回放**：影子日志规则，不碰 `getLlama`。

结论：无产品路径冲突。实现前若对照实验证明「ok 后再发也不卡」，仍做闸当契约，但不得借机加预加载。

## 验收

- 单测：互斥、聊天优先、超时不永久持有。不进全量 e2e；不进日常 `test:smoke` 也可（纯 desktop companion 单测，`node --test` 该文件）。
- 人工：仅 Electron；对照实验步骤见上。Web Safari 无 llama，测不了。
- 文档：本 Brief + 生命周期说明改为「闸已立项」；ISSUE_LEDGER 加载提示行改为等本闸合入后再评，不再写「等统一仲裁」。

## 口令（点头后另开 Chat）

```
大任务
按 focus-tiger/docs/task-briefs/task-confide-embedding-work-gate.md 实现 l1Child 一层 getLlama 互斥闸 + 单测。
不改 Stage 2 路由表。不加加载提示。不预加载 embedding。
Cursor Model: Composer 2.5 / Fast OFF
```
