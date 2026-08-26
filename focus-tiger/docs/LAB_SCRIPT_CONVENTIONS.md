# L0 实验室脚本约定（路径 / 命名 / 陷阱 / 候选索引）

创建日期：2026-08-24  
权威路径：`focus-tiger/docs/LAB_SCRIPT_CONVENTIONS.md`  
索引：`PROCESS.md` 文首权威列表；`RULES_INDEX.md` → `companion-debug`（一行指针）。  
调试循环门禁仍见 [`.cursor/rules/focus-tiger-companion-debug.mdc`](../../.cursor/rules/focus-tiger-companion-debug.mdc)。本文**不**复述那份条款。

**新会话同类任务：先读本文，禁止再全仓搜索 `/tmp/ft-l0-*` 或另写一份平行路径表。**

## 收录范围

只收**长期稳定、值得复用**的定位信息：

1. 脚本与目录的固定路径  
2. 调用方式与环境变量字面量  
3. 命名规则  
4. 已踩过的技术陷阱  
5. 已测候选的**指路索引**（模型 + 量化 + 结果文件路径）

**不收录**（交给各次交接摘要或结果文件本身）：

- 某次任务的进展 / 待办 / 「下一步等谁拍板」  
- 具体数值、七问原文回复、对照表单元格（数据留在 `compare-*.json` / `compare-tables.md`）

地位：实验室操作备忘，**不是**生产模型 SSOT。生产默认仍看 `l0Config.js`。实验室结果不得自行锁成默认；GGUF **不得**提交进 Git。

---

## 1. 固定路径

| 用途 | 路径 |
|---|---|
| 实验室根目录 | `/tmp/ft-l0-lab/` |
| 档案对照脚本（0.6B Q4 bartowski ↔ 4B） | `/tmp/ft-l0-qwen3-4b-lab.mjs` |
| 新候选脚本（一次跑一个 key） | `/tmp/ft-l0-candidate-lab.mjs` |
| 每次跑完的机器 JSON | `/tmp/ft-l0-lab/compare-<epoch-ms>.json` |
| 对照表（只追加，不另起格式） | `/tmp/ft-l0-lab/compare-tables.md` |
| 必须 `cd`、必须从这里 `import` | `/Users/armstronghesapplelaptop/Downloads/Zen-tiger-Pet-garden001-wt-develop-qa/focus-tiger/desktop` |
| 生产已下模型（**不要**当实验室 dest） | `~/Library/Application Support/Focus Tiger/companion-l0/` |

脚本在 `/tmp`，不在仓库。`focus-tiger/desktop/scripts/l0-bench.js` 是另一套探针，不是七问对照入口。

`/tmp` 重启后可能被清空。丢了脚本：按本文路径 / 命名 / import 规则重写，不要从旧会话记录反搜。

QA `desktop/` 里要 import 的模块：`companion/l0Probe.js`、`l0Metrics.js`、`l2Persona.js`、`l0Download.js`，以及 `node_modules/node-llama-cpp/dist/index.js`。

---

## 2. 调用方式与环境变量

一律在系统 **「终端.app」** 跑（需要 Metal）。先 `cd` 到上面的 QA `desktop/`。

| 变量 | 合法值 | 作用 |
|---|---|---|
| `FT_LAB_ONLY` | `0.6` 或 `4b` | 档案脚本只跑 0.6B 或只跑 4B |
| `FT_LAB_4B_SOURCE` | `unsloth`（缺省 = bartowski dest） | 档案脚本换 4B 的 URL / dest |
| `FT_LAB_CANDIDATE` | `0.6q5` 或 `1.7q4` | 候选脚本选哪一条 |
| `FT_TOOL_CALL_GGUF` | 可选 · 绝对路径 | tool-call 探针 GGUF；缺省 = `~/Library/Application Support/Focus Tiger/companion-l0/Qwen3-1.7B-Q4_K_M.gguf` |
| `FT_TOOL_CALL_MAX_TOKENS` | 可选 · 整数 | tool-call 探针 `maxTokens`；缺省 = `L0_MAX_TOKENS` |

脚本判断：`FT_LAB_ONLY !== '4b'` 才跑 0.6B；`!== '0.6'` 才跑 4B。两个都不设 = 两个都跑。

```bash
cd /Users/armstronghesapplelaptop/Downloads/Zen-tiger-Pet-garden001-wt-develop-qa/focus-tiger/desktop && FT_LAB_ONLY=0.6 node /tmp/ft-l0-qwen3-4b-lab.mjs
```

```bash
cd /Users/armstronghesapplelaptop/Downloads/Zen-tiger-Pet-garden001-wt-develop-qa/focus-tiger/desktop && FT_LAB_ONLY=4b node /tmp/ft-l0-qwen3-4b-lab.mjs
```

```bash
cd /Users/armstronghesapplelaptop/Downloads/Zen-tiger-Pet-garden001-wt-develop-qa/focus-tiger/desktop && FT_LAB_4B_SOURCE=unsloth FT_LAB_ONLY=4b node /tmp/ft-l0-qwen3-4b-lab.mjs
```

```bash
cd /Users/armstronghesapplelaptop/Downloads/Zen-tiger-Pet-garden001-wt-develop-qa/focus-tiger/desktop && FT_LAB_CANDIDATE=0.6q5 node /tmp/ft-l0-candidate-lab.mjs
```

```bash
cd /Users/armstronghesapplelaptop/Downloads/Zen-tiger-Pet-garden001-wt-develop-qa/focus-tiger/desktop && FT_LAB_CANDIDATE=1.7q4 node /tmp/ft-l0-candidate-lab.mjs
```

**Confide tool-call 探针（2026-08-26 · 仓库内脚本）**：

```bash
cd focus-tiger/desktop && npm run companion:tool-call
```

结果：`/tmp/ft-l0-lab/tool-call-<epoch>.json`。过门必要条件：`writeFalsePositives === 0`。fixture：`src/core/confide/confideToolCallFixtures.js`。**禁止**未过门就把 Qwen tool-call 接进 Confide send。

质量七问（空历史，不要另起一组）：`你知道彤彤儿喜欢吃啥？` / `彤彤儿是谁？` / `Why are you happy?` / `What are you doing?` / `What do you want?` / `Where do you live?` / `Whom do you like?`。调用 `buildCompanionL2Prompt({ text, locale, history: [] })` + `LlamaChatSession`，`maxTokens: L2_MAX_TOKENS`。不要改生产提示词来迁就实验室。

L0 闸值以 `l0Config.js` 为准（TTFT / decode）。实验室脚本把 `rafP95DeltaMs` 置 `null`。下完 = 字节数等于 `Content-Length`。

---

## 3. 命名规则

| 种类 | 规则 | 例 |
|---|---|---|
| 实验室脚本 | `/tmp/ft-l0-<topic>-lab.mjs` | `ft-l0-qwen3-4b-lab.mjs`、`ft-l0-candidate-lab.mjs` |
| bartowski dest | **保持上游文件名** `Qwen_Qwen3-…` | `Qwen_Qwen3-0.6B-Q4_K_M.gguf` |
| unsloth dest | `{Model}-{quant}-unsloth.gguf`（不要再加 `Qwen_`） | `Qwen3-0.6B-Q5_K_M-unsloth.gguf` |
| 续传半截 | dest + `.part` + `.meta.json` | `Qwen3-1.7B-Q4_K_M-unsloth.gguf.part` |
| 结果 JSON | `compare-<Date.now()>.json` | `compare-1787511745122.json` |
| 对照表 | 固定名 `compare-tables.md`，只追加 | `/tmp/ft-l0-lab/compare-tables.md` |
| 实验室 `id` | dest stem | `Qwen3-4B-Q4_K_M-unsloth` |

---

## 4. 已知技术陷阱

1. **bartowski 与 unsloth 不得写同一 dest。** 两份 4B Q4 只差几百字节；混用同一文件名会把换源对照作废。unsloth 必须用 `*-unsloth.gguf`。
2. **超量 `.part` 会 416。** `ensureGgufDownloaded` 要求字节精确等于 `Content-Length`。`.part` 比源文件长时 Range 起点越界 → `model_download_range_unsatisfiable`（HTTP 416），不能 finalize。不要靠删了重下自动修；先看 `.meta.json` 再决定。
3. **未获允许不要删 `.part`。** 续传依赖它；半截文件不是垃圾。
4. **「下完」不是 400MB 下限。** 用下限会把 4B 残包判成完成。
5. **`FT_LAB_ONLY` 字面量必须是 `0.6` / `4b`。** `0.6b`、`0.6B`、`4B` 都不会按预期过滤。
6. **从 QA 树 import，不要从主仓。** 主仓 `desktop/companion` 导出名曾和 QA 树对不上。档案脚本里 `l0Download.js` 若仍指向主仓，改回 QA `DESKTOP`。
7. **Cursor 沙箱没有 Metal。** 会 `ggml_metal_init: failed to create command queue`；CPU 回退还可能去编 llama。只在系统终端跑。
8. **`'</s>'` 控制符警告不是质量失败证据。** 0.6B 与 4B 都出现过；有警告仍可能出正常句子。
9. **实验室七问 ≠ 产品面板。** 空历史 + `LlamaChatSession`；不能用实验室句子宣称面板已修好。
10. **实验室 dest ≠ 生产缓存。** 不要把 `/tmp/ft-l0-lab/` 和下到 `~/Library/Application Support/Focus Tiger/companion-l0/` 的文件当成同一份。
11. **tool-call 探针 ≠ 生产路由。** 探针只评 JSON tool id；过门后仍须另开 hybrid 任务才能把 Qwen 接进 regex miss 补漏。

---

## 5. 已测候选索引（只指路）

数据在 JSON / `compare-tables.md`。本表只给模型 + 量化 + 文件位置。`/tmp` 若被清，以当时仍存在的文件为准。

| 模型 | 量化 | 源 | dest（`/tmp/ft-l0-lab/`） | 结果文件 |
|---|---|---|---|---|
| Qwen3-0.6B | Q4_K_M | bartowski | `Qwen_Qwen3-0.6B-Q4_K_M.gguf` | `compare-1787500631380.json` |
| Qwen3-4B | Q4_K_M | bartowski | `Qwen_Qwen3-4B-Q4_K_M.gguf` | `compare-1787494094208.json` |
| Qwen3-4B | Q4_K_M | unsloth | `Qwen3-4B-Q4_K_M-unsloth.gguf` | `compare-1787502832223.json` |
| Qwen3-0.6B | Q5_K_M | unsloth | `Qwen3-0.6B-Q5_K_M-unsloth.gguf` | `compare-1787511745122.json` |
| Qwen3-1.7B | Q4_K_M | unsloth | `Qwen3-1.7B-Q4_K_M-unsloth.gguf`（无完整文件；见同名 `.part` + `.meta.json`） | 无 JSON（下载未完成） |

对照表总稿：`/tmp/ft-l0-lab/compare-tables.md`。

新测完一个候选：只在本表追加一行路径，**不要**把数字或答句抄进本文。对照表继续只追加到 `compare-tables.md`。
