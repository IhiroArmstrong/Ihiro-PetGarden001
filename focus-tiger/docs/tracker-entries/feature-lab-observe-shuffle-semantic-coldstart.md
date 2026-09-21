# TEST_TRACKER 碎片 · feature/lab-observe-shuffle-semantic-coldstart

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 分支/文件 | 日期 |
|---|---|---|---|---|---|---|---|---|
| L3 观察翼打乱配对实验室批量（Prompt 13 层 B） | 纯后端 | 仅单元测试覆盖 | **不进 smoke。** 系统终端.app（Metal）：`cd focus-tiger && npm run test:observe-shuffle-screen`。真 Gemma4 + Qwen3-Embedding；12 句 generate 后 embedding 自动重配，终端报 `hits/12`（过关 ≥8/12）。JSON：`/tmp/ft-l0-lab/observe-shuffle-*.json`。单测：`l3ObserveShuffleScreen.test.js`。缺 L3/embedding GGUF 时 exit 2。 | — | — | — | `l0-observe-shuffle-screen.js` · `l3ObserveShuffleScreen.js` | 2026-09-21 |
| Stage 2 live 冷启动实验室探针（Prompt 8） | 纯后端 | 仅单元测试覆盖 | **不进 smoke。** 系统终端.app（Metal）：`cd focus-tiger && npm run test:semantic-live-coldstart-probe`。须见 `embed_not_ready` 后 `ok` 两行，以及 `live=` / `failOpen=` / `semanticOk=`。JSON + turns：`/tmp/ft-l0-lab/semantic-live-coldstart-*`。可 `npm run audit:confide-semantic-shadow -- --file <turns.jsonl>` 复核。单测：`semanticLiveColdstartProbe.test.js`。 | — | — | — | `l0-semantic-live-coldstart-probe.js` · `semanticLiveColdstartProbe.js` | 2026-09-21 |
