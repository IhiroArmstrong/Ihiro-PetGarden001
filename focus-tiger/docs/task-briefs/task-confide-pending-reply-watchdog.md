# Task Brief · Confide 生成顶层超时 + Thinking 胶囊

> **状态（2026-09-21）**：PO 书面点头（本 Chat「继续修 Confide Thinking（就在这里做）」）。**B 类**（改变最长等待与失败时可见回复）。  
> **范围**：止血 + 样式；统一 embedding 仲裁只出说明、本刀不实现。

## 做什么

1. 诊断：本机日志已证明卡住那句 `semantic_live_classify` 已 `embed_not_ready` 返回，其后无 `read_hybrid_classify` / `l3_generate`。子进程聊天队列与 embedding 队列分离，但两边都 `getLlama()`。`ensureReady` 原先无超时。对照实验「等 embedding 就绪再发」本回合无法在壳内代点；代码对照 + 日志作为证据。
2. 止血：Share 后 Thinking 最多 **45s**，超时走既有 corpus 失败句；`ensureReady` **30s** 超时；聊天 `phase === ready` 时不再重复 `ensure`（避免跟后台 embedding 抢 `getLlama`）。
3. 样式：Thinking 省略号不再改宽度。
4. 说明：`docs/confide-embedding-lifecycle-arbitration.md`（建议，不实现统一仲裁层）。

## 不做

- 不改 Stage 2 路由规则、不改句库语气
- 不实现统一 embedding 调度器
- 不把超时改成空白或新错误页

## 验收

- 单测：watchdog 纯函数；UI/runtime 字符串锁
- 人工 Electron：冷启动发情绪独白不得无限 Thinking；胶囊不左右顶文案
