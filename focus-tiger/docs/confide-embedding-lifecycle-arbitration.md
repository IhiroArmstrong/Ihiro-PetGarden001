# Confide · embedding 生命周期与其它工作的避让（现状说明）

> **2026-09-21** · 说明文档，**无新运行时**。三次症状不同、同窗：embedding 正在加载或刚加载完。  
> **2026-09-22**：工作闸规格见 `task-briefs/task-confide-embedding-work-gate.md`（待 PO 点头）。  
> **同日补正**：Confide 桌面状态条**没有**「向量就绪 / embedding ready」文案。`Model4E4` / `Model317` 只表示**主聊天 GGUF** 就绪（Prompt 10 / #872 故意过滤 `embedding_*`，避免幽灵 Downloading）。

## 对照实验（本回合能确认的）

| 观察 | 结论 |
|---|---|
| 卡住句的最后一条日志是 `semantic_live_classify` / `embed_not_ready`，后面没有 hybrid / generate | fail-open 分类已返回；卡在**之后**的聊天 `ensure` / 生成，不是分类在等 embedding |
| `l1Child`：`enqueue`（聊天）与 `enqueueShadow`（embedding）两条 Promise 链 | **不是**「生成命令排在 embedding 加载的同一条 stdin 队列后面」 |
| 两边都 `getLlama()` + `loadModel` | **仍可能**在同一 Node 子进程里互锁；聊天 `ensureReady` 原先无超时，会把 Thinking 拖死 |
| 历史 `semantic_live_classify` 仅此 1 条（且未就绪） | 本机还没有「embedding 已就绪后再发同句」的成功对照；步骤见工作闸 Brief §对照实验 |
| `#908` 后桌面壳 DevTools：`applyConfideStage2Route` → `process is not defined` | 分类 IPC 可成功，**路由决定在渲染进程必炸**；会断掉 generate / 语义改路由，直到 45s 看门狗 corpus 兜底。**不是**冷启动偶发 fail-open |

**优先假设（未完全证实）**：后台 `ensure-embedding` 占用 `getLlama` 时，下一次聊天 `ensure()` 永远等不到 ready。与「同一条队列排队」不完全相同，但是同一类「没有统一避让规则」。

**禁止**写「等状态条显示向量就绪后再发」——界面上没有这个信号。若要做「embedding 已就绪」对照，用下面替代信号（任选）：

1. `userData/companion-l2/turns.jsonl` 出现 `kind:semantic_live_classify` 且 `reason: "ok"`（不是 `embed_not_ready`）
2. 主模型已见 `Model4E4` 后，再额外等约 30–60 秒（embedding 在 shadow 链后台加载，无 UI）
3. 研发探针：`npm run test:semantic-live-coldstart-probe` 或 `npm run audit:confide-semantic-shadow`

若用上述信号确认 embedding 已 `ok` 后再发仍卡 → 停止往 embedding 猜，改查 UI Promise。若仍见 `process is not defined` → 先修渲染进程 env，再谈引擎互锁。

## 今天有哪些地方会碰上 embedding

| 模块 | 碰到未就绪时现在怎么做 | 缺口 |
|---|---|---|
| 状态条（Prompt 10） | 应用事件过滤，避免幽灵 Downloading；**不显示** embedding 就绪 | 已单点修 |
| Stage 1 shadow 分类（Prompt 11） | 等 ready 后再算 15s 分类超时 | 已单点修 |
| Stage 2 live 分类 | 未就绪立刻 fail-open，后台继续加载 | 已单点修 |
| Stage 2 路由决定（渲染进程） | **须**浏览器安全 env（禁止 `env = process.env` 默认参数） | `#908` 合入后至本刀前：每条消息必炸 |
| 观察翼套话打分 | embedding 未就绪则跳过 | 已单点修 |
| 聊天 `ensure` / hybrid / generate | **#912** 超时止血 + **#919 `l1LlamaWorkGate`** 禁止并行 `getLlama` | 聊天等 embedding 持闸不得超过 30s |
| 用户可见回复 | 不得等 embedding 冷启动（Stage 2 Brief 不变量） | 须保持 |
| 加载提示 / 面板并行预加载 | **现在不做**（闸合入后再一起评） | 加载提示可永远不做；禁止单独先上预加载 |

## 工作闸（#919 · 已接线）

`l1Child` 在 `loadModelHold` / `loadEmbeddingHold` 外包一层 `l1LlamaWorkGate`。两条 stdin 队列仍分离。不改 Stage 2 路由表。实验室 `l0Probe` / `l0Spike17Probe` 不进本闸。#912 仍是超时止血；本闸是调度契约。渲染进程 `process.env` 崩溃已由 #913 单点修。
