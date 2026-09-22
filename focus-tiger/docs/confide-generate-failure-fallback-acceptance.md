# Confide generate 失败回落验收冻表（#930）

> **状态（2026-09-22）**：冻表 + 终端批量 + 单测锁 generate 失败路径不得回落 `fallback-02` 隐私免责声明。  
> **代码真源**：`src/core/confide/confideGenerateFailureFallbackFixtures.js`  
> **评估器**：`src/core/confide/confideGenerateFailureFallbackEvaluate.js`

## 测什么

| 路径 | 断言 |
|---|---|
| `generate_fail`（复合情绪 / 习惯句 · 进 generate） | `resolveCorpusFallbackAfterGenerateFailure` 在 **24 salt × 5 同面板连发** 下 **禁止** `fallback-02` / 隐私套话字面 |
| `corpus_control`（未匹配 · 正常语料检索） | 正常 `resolveConfideReply` **仍可用** `fallback-02`（不得误伤隐私夹克池） |

## 样本来源（去重后）

- L3 观察翼打乱配对夹具 emotion + habit（`l3ObserveShuffleFixtures.js`）
- 元问题冻表 `generate_skip_classify` 闲聊句（`confideMetaQueryAcceptanceFixtures.js`）
- Stage 2 真实肉测情绪句（`confideStage2RealMeatCandidates.js`）
- #930 复合变体（含「有点烦，不想练习」及空格 / 标点变体）

**规模**：generate_fail 行数 ≥20；每行 29 次回落检查（24 salt + 5 session repeat）；全表 checks 通常 **600+**。

## 终端批量（必跑 · 取代有限句肉眼）

```bash
cd focus-tiger && npm run test:confide-generate-failure-fallback
```

单测（CI / smoke 内）：

```bash
node --test src/core/confide/confideGenerateFailureFallbackEvaluate.test.js
```

已接入 `npm run test:smoke` / `test:pr-smoke`。

## 人工（Electron · 一次性 spot-check）

批量全绿后，宽屏 Confide ready 各抽 **1–2 句**确认：

1. **主路径**：「有点烦，不想练习」→ generate/sanitize 失败后只见 fallback-01 或 fallback-03，不见「你说的，留在这里。」
2. **对照**：未匹配闲聊仍可能语料检索到 fallback-02
3. **回流**：同面板再发一句复合情绪，连续失败仍不得 privacy 套话

**禁止**仅凭 1–3 句手工测试宣称该类无限提问空间已覆盖；须先跑本冻表。

## 与相邻测试的分工

| 测试 | 分工 |
|---|---|
| `confideReplyFlow.test.js` | 单元锁 hardExclude + 8 连发去重 |
| 本冻表 | 多样本 × 多 salt × 同面板连发批量 |
| `test:observe-shuffle-screen` | 真模型观察翼质量（GGUF · 不进 smoke） |
| Electron 肉眼 | UI 手感 / 竖线 / 秒表 spot-check |
