# Confide · embedding 生命周期与其它工作的避让（现状说明）

> **2026-09-21** · 说明文档，**无新运行时**。三次症状不同、同窗：embedding 正在加载或刚加载完。

## 对照实验（本回合能确认的）

| 观察 | 结论 |
|---|---|
| 卡住句的最后一条日志是 `semantic_live_classify` / `embed_not_ready`，后面没有 hybrid / generate | fail-open 分类已返回；卡在**之后**的聊天 `ensure` / 生成，不是分类在等 embedding |
| `l1Child`：`enqueue`（聊天）与 `enqueueShadow`（embedding）两条 Promise 链 | **不是**「生成命令排在 embedding 加载的同一条 stdin 队列后面」 |
| 两边都 `getLlama()` + `loadModel` | **仍可能**在同一 Node 子进程里互锁；聊天 `ensureReady` 原先无超时，会把 Thinking 拖死 |
| 历史 `semantic_live_classify` 仅此 1 条（且未就绪） | 本机还没有「embedding 已就绪后再发同句」的成功对照；该实验仍须你在壳里补做 |

**优先假设（未完全证实）**：后台 `ensure-embedding` 占用 `getLlama` 时，下一次聊天 `ensure()` 永远等不到 ready。与「同一条队列排队」不完全相同，但是同一类「没有统一避让规则」。

若你等状态条 embedding 就绪后再发仍卡 → 停止往 embedding 猜，改查 UI Promise。

## 今天有哪些地方会碰上 embedding

| 模块 | 碰到未就绪时现在怎么做 | 缺口 |
|---|---|---|
| 状态条（Prompt 10） | 应用事件过滤，避免幽灵 Downloading | 已单点修 |
| Stage 1 shadow 分类（Prompt 11） | 等 ready 后再算 15s 分类超时 | 已单点修 |
| Stage 2 live 分类 | 未就绪立刻 fail-open，后台继续加载 | 已单点修 |
| 观察翼套话打分 | embedding 未就绪则跳过 | 已单点修 |
| 聊天 `ensure` / hybrid / generate | **本刀**：ready 则跳过重复 ensure；ensure 30s 超时；UI 45s 看门狗 | 仍不是统一调度 |
| 用户可见回复 | 不得等 embedding 冷启动（Stage 2 Brief 不变量） | 须保持 |

## 建议（先说清楚，本刀不实现）

**我认为最合理的**是照精灵占用 / 浮层仲裁那次：做一层很小的 **companion child 工作闸**（聊天 hold / embedding hold / 禁止并行 `getLlama`），生产者只报「我要加载哪边」，消费者只问「现在能不能跑」。不要再给每个调用方各写一套超时。

本刀只止血（超时 + 已就绪跳过 ensure）。统一闸另开 Brief。
