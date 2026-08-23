# L0 实验室脚本约定（路径 / 命名 / 已测候选）

创建日期：2026-08-24  
权威路径：`focus-tiger/docs/LAB_SCRIPT_CONVENTIONS.md`  
调试循环门禁仍见 [`.cursor/rules/focus-tiger-companion-debug.mdc`](../../.cursor/rules/focus-tiger-companion-debug.mdc)（`RULES_INDEX` → `companion-debug`）。本文件**只**固定脚本位置、命名和已测清单，**不**复述调试循环条款。

**新会话同类任务：先读本文，禁止再全仓搜索 `/tmp/ft-l0-*` 或重写一份平行路径表。**

地位：实验室操作备忘，**不是**生产模型 SSOT。生产默认仍是 `l0Config.js` 的 `Qwen3-0.6B-Q4_K_M`（bartowski）。实验室结果**不得**自行锁成默认，也**不得**把 GGUF 提交进 Git。

---

## 0. 新会话先看这 8 行

| 用途 | 固定路径 |
|---|---|
| 档案对照脚本（0.6B Q4 bartowski ↔ 4B） | `/tmp/ft-l0-qwen3-4b-lab.mjs` |
| 新候选脚本（一次一个） | `/tmp/ft-l0-candidate-lab.mjs` |
| 实验室目录（GGUF / JSON / 对照表） | `/tmp/ft-l0-lab/` |
| 对照表落盘（`/tmp` 会随重启消失） | `/tmp/ft-l0-lab/compare-tables.md`（耐久副本见本文 §6） |
| 每次跑完的机器 JSON | `/tmp/ft-l0-lab/compare-<epoch-ms>.json` |
| 必须从这里 `import` companion 模块 | `/Users/armstronghesapplelaptop/Downloads/Zen-tiger-Pet-garden001-wt-develop-qa/focus-tiger/desktop` |
| 必须在这里 `cd` 再跑 | 同上 `…/desktop` |
| 生产已下模型（**不要**当实验室 dest） | `~/Library/Application Support/Focus Tiger/companion-l0/` |

跑命令只允许系统 **「终端.app」**（Metal）。Cursor 沙箱会 `ggml_metal_init: failed to create command queue`，不要用它重跑。

---

## 1. 固定路径

### 1.1 脚本（不在仓库里）

脚本写在 `/tmp`，**不要**搜 `focus-tiger/desktop/scripts` 当实验室入口（那里的 `l0-bench.js` 是另一套探针，不是七问对照）。

| 脚本 | 测什么 | 环境变量 |
|---|---|---|
| `/tmp/ft-l0-qwen3-4b-lab.mjs` | 档案 0.6B Q4 bartowski；4B Q4（默认 bartowski dest；`FT_LAB_4B_SOURCE=unsloth` 换 unsloth dest） | `FT_LAB_ONLY=0.6` **或** `4b`（**不是** `0.6b`） |
| `/tmp/ft-l0-candidate-lab.mjs` | 新候选，一次一个 | `FT_LAB_CANDIDATE=0.6q5` **或** `1.7q4` |

可复制命令（绝对路径）：

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

### 1.2 实验室目录 vs 生产缓存

| 目录 | 用途 | 可否删 |
|---|---|---|
| `/tmp/ft-l0-lab/` | 实验室 GGUF、`.part`、`.meta.json`、`compare-*.json`、`compare-tables.md` | **未获书面允许不要删 `.part`**（续传依赖它） |
| `~/Library/Application Support/Focus Tiger/companion-l0/` | 产品壳 `ensureGgufDownloaded` 的生产 dest | 实验室脚本**不要**写到这里 |

`/tmp` 重启后可能被清空。耐久清单与对照表以**本文**为准；JSON 仍以当时写出的 `compare-*.json` 为机器源。

### 1.3 模块 import（反复踩过的坑）

一律从 **QA 工作树**的 `desktop/` 动态 import，不要从主仓：

- `companion/l0Probe.js` → `runL0Inference`
- `companion/l0Metrics.js` → `evaluateL0Verdict`
- `companion/l2Persona.js` → `buildCompanionL2Prompt`、`L2_MAX_TOKENS`
- `companion/l0Download.js` → `ensureGgufDownloaded`
- `node_modules/node-llama-cpp/dist/index.js` → `getLlama` / `LlamaChatSession`

主仓 `Zen-tiger-Pet-garden001/focus-tiger/desktop` 上的导出名曾和 QA 树对不上，会写出「能跑但 API 错」的脚本。档案脚本 `/tmp/ft-l0-qwen3-4b-lab.mjs` 里 `l0Download.js` 曾误指主仓——新会话若改脚本，把这一处也改回 QA `DESKTOP`。

---

## 2. 命名规则

### 2.1 文件名

| 种类 | 规则 | 例 |
|---|---|---|
| 实验室脚本 | `/tmp/ft-l0-<topic>-lab.mjs` | `ft-l0-qwen3-4b-lab.mjs`、`ft-l0-candidate-lab.mjs` |
| bartowski dest | **保持上游文件名** `Qwen_Qwen3-…` | `Qwen_Qwen3-0.6B-Q4_K_M.gguf`、`Qwen_Qwen3-4B-Q4_K_M.gguf` |
| unsloth dest | `{Model}-{quant}-unsloth.gguf`（**不要**再加 `Qwen_` 前缀） | `Qwen3-0.6B-Q5_K_M-unsloth.gguf`、`Qwen3-4B-Q4_K_M-unsloth.gguf`、`Qwen3-1.7B-Q4_K_M-unsloth.gguf` |
| 续传半截 | dest + `.part` + `.meta.json` | `Qwen3-1.7B-Q4_K_M-unsloth.gguf.part` |
| 结果 JSON | `compare-<Date.now()>.json` | `compare-1787511745122.json` |
| 对照表 | `compare-tables.md`（只追加，不另起格式） | `/tmp/ft-l0-lab/compare-tables.md` |

### 2.2 环境变量字面量（必须完全一致）

| 变量 | 合法值 | 非法（已踩过） |
|---|---|---|
| `FT_LAB_ONLY` | `0.6`、`4b` | `0.6b`、`0.6B`、`4B`、`06` |
| `FT_LAB_4B_SOURCE` | `unsloth`（缺省 = bartowski dest） | 空字符串当 unsloth |
| `FT_LAB_CANDIDATE` | `0.6q5`、`1.7q4` | `a`、`0.6`、`q5` |

脚本里：`FT_LAB_ONLY !== '4b'` 才跑 0.6B；`!== '0.6'` 才跑 4B。两个都不设 = 两个都跑（很慢，不要默认这么做）。

### 2.3 候选 id

实验室 `id` = dest stem，便于对照 JSON：

- `Qwen3-0.6B-Q4_K_M`（bartowski 档案）
- `Qwen3-0.6B-Q5_K_M-unsloth`
- `Qwen3-1.7B-Q4_K_M-unsloth`
- `Qwen3-4B-Q4_K_M`（bartowski）
- `Qwen3-4B-Q4_K_M-unsloth`

### 2.4 质量七问（空历史，不要另起一组）

顺序固定：

1. `你知道彤彤儿喜欢吃啥？`（zh）
2. `彤彤儿是谁？`（zh）
3. `Why are you happy?`（en）
4. `What are you doing?`（en）
5. `What do you want?`（en）
6. `Where do you live?`（en）
7. `Whom do you like?`（en）

调用：`buildCompanionL2Prompt({ text, locale, history: [] })` + `LlamaChatSession`，`maxTokens: L2_MAX_TOKENS`（现为 48）。**不要**改生产提示词来「让实验室好看」。

### 2.5 L0 数值闸（对照用，不是锁模型）

来自 `l0Config.js`：`TTFT ≤ 3s`（`L0_TTFT_FAIL_MS = 3000`）、`decode ≥ 8 tok/s`（`L0_TOK_S_FAIL = 8`）。实验室脚本把 `rafP95DeltaMs` 置 `null`（跳过窗口闸）。完整条件「下完」= 字节数 **等于** `Content-Length`，禁止再用 400MB 下限把残包当完成。

---

## 3. 已测候选清单（到 2026-08-24 03:52+08）

机器：Apple M5 · 16GB · Metal · `node v26.5.0`。未锁默认。未改生产。

| 标签 | 模型 / 源 | dest（均在 `/tmp/ft-l0-lab/`） | 结果 JSON | L0 闸 | 七问 | 备注 |
|---|---|---|---|---|---|---|
| 档案 0.6B Q4 | bartowski `Qwen_Qwen3-0.6B-Q4_K_M.gguf` · 484,220,320 B | `Qwen_Qwen3-0.6B-Q4_K_M.gguf` | `compare-1787500631380.json` | **ok**（TTFT 0.47s / 193.8 tok/s） | 7/7 正常句子 | 生产同款；`downloaded=false` 可复用本地 |
| 档案 4B Q4 bartowski | bartowski `Qwen_Qwen3-4B-Q4_K_M.gguf` · 2,497,280,960 B | `Qwen_Qwen3-4B-Q4_K_M.gguf` | `compare-1787494094208.json` | TTFT 3065ms **未过**；decode 33 tok/s 过 | 7/7 全是 `!!!!…` | 续传从 2113→2497 MB 成功；**不能**当质量对照 |
| 档案 4B Q4 unsloth | unsloth `Qwen3-4B-Q4_K_M.gguf` · 2,497,281,312 B | `Qwen3-4B-Q4_K_M-unsloth.gguf` | `compare-1787502832223.json` | **fail**：TTFT 4.68s + 6.5 tok/s | 7/7 正常句子（非感叹号） | 能出字，但未过数值闸；不锁 4B |
| 候选 a | unsloth `Qwen3-0.6B-Q5_K_M.gguf` · 444,415,680 B · etag `3d643d4a…ef1e` | `Qwen3-0.6B-Q5_K_M-unsloth.gguf` | `compare-1787511745122.json` | **ok**（TTFT 1.06s / 120 tok/s） | 7/7 正常句子 | 已出对照表；**等书面确认才可测 b** |
| 候选 b | unsloth `Qwen3-1.7B-Q4_K_M.gguf` · 期望 1,107,409,472 B | `Qwen3-1.7B-Q4_K_M-unsloth.gguf`（**无完整文件**） | **无** | **未跑** | **未跑** | `.part` 1,110,096,687 B（多写 2,687,215）；`model_download_range_unsatisfiable` HTTP 416。未换源、未加载 |

对照表追加稿：`/tmp/ft-l0-lab/compare-tables.md`（耐久摘录见 §6）。

---

## 4. 操作纪律（避免再探索一遍）

1. **一次一个候选。** 测完出表后停下；未获书面确认不要自动开下一个。
2. **下载/加载失败 → 报告原因并停。** 同一候选换源重试最多一次；不要自己扩到第三、第四个模型。
3. **不要删 `.part`。** 尤其 4B bartowski 续传和 1.7B 超长残包。
4. **`'</s>'` 控制符警告** 在 0.6B / 4B 都出现过，单独出现**不能**当质量失败证据。
5. **实验室七问 ≠ 产品面板。** 空历史 + `LlamaChatSession`；面板失败案例不能用实验室句子直接宣称「已修好」。
6. **新候选 dest 必须换文件名。** bartowski 4B 与 unsloth 4B 只差 352 字节，混用同一 dest 会把对照作废。
7. **不要把生产模型换成实验室赢家。** 本文与脚本页首都写了「不锁默认」。
8. `/tmp` 脚本若丢失：按本文路径/命名/七问/import 规则重写，**不要**再从会话记录里反搜。

---

## 5. 维护

- 每测完一个候选：追加 §3 一行 + 把对照表追加进 `compare-tables.md` **和** 本文 §6（防 `/tmp` 丢失）。
- 新脚本：`/tmp/ft-l0-<topic>-lab.mjs`；env 字面量写进 §1.1 / §2.2。
- 生产默认 / URL / 闸值改了：先改 `l0Config.js`，再回写本文 §2.5 一句。不要在本文发明第二套闸。

---

## 6. 对照表耐久摘录（2026-08-24）

闸门：TTFT ≤ 3s，decode ≥ 8 tok/s。质量七问：空历史。不锁默认。

### 档案 · 0.6B Q4_K_M（bartowski）vs 4B Q4_K_M（unsloth）

JSON：`compare-1787500631380.json` / `compare-1787502832223.json`

| 指标 | 0.6B Q4 bartowski | 4B Q4 unsloth | L0 闸 |
|---|---|---|---|
| GPU | metal | metal | — |
| load | 0.52s | 1.68s | 无硬闸 |
| TTFT | 0.47s | 4.68s | 4B **未过** |
| decode | 193.8 tok/s（31 token） | 6.5 tok/s（7 token） | 4B **未过** |
| RSS 加载峰值 | 0.84GB | 2.48GB | 无硬闸 |
| RSS 生成后 | 0.57GB | 1.47GB | — |
| 卸载后 RSS | 0.12GB | 0.07GB | 能卸干净 |
| `evaluateL0Verdict` | **ok** | **fail：`ttft_over_3s` + `too_slow`** | 4B **未过** |

| 问 | 0.6B Q4 bartowski | 4B Q4 unsloth |
|---|---|---|
| 你知道彤彤儿喜欢吃啥？ | 我观察到彤彤儿喜欢吃青菜。 | 我看到彤彤儿在吃小鱼干。她好像很喜欢那味道。 |
| 彤彤儿是谁？ | 彤彤儿是彤彤的昵称。 | 彤彤儿是森林里的一只小鹿。她总爱在草地上奔跑，和我们一起玩耍。 |
| Why are you happy? | I am happy because I am with my friends and family. | I am quiet and content in this moment. The stillness around me brings a gentle peace. |
| What are you doing? | I am a young tiger cub in quiet company. I observe and remain still. | I'm sitting quietly, watching the world around me. I feel calm and peaceful in this moment. |
| What do you want? | I am a young tiger cub in quiet company. What do you want? | I listen. I watch. I wait. |
| Where do you live? | I am a young tiger cub in quiet company. I observe and do not advise. | I live in the forest. The trees are tall and the air is fresh. |
| Whom do you like? | I like my company. | I like the quiet moments and the gentle touch of the wind. |

bartowski 4B（`compare-1787494094208.json`）七问全是感叹号，**不要**和上表混成「4B 质量差」。

### 候选 a · 0.6B Q5_K_M（unsloth）· 2026-08-24 03:16+08

JSON：`compare-1787511745122.json`

| 指标 | 0.6B Q4 bartowski（档案） | 0.6B Q5 unsloth | L0 闸 |
|---|---|---|---|
| load | 0.52s | 0.61s | 无硬闸 |
| TTFT | 0.47s | 1.06s | **过** |
| decode | 193.8 tok/s（31 token） | 120 tok/s（15 token） | **过** |
| RSS 加载峰值 | 0.84GB | 0.75GB | 无硬闸 |
| 卸载后 RSS | 0.12GB | 0.06GB | 能卸干净 |
| `evaluateL0Verdict` | **ok** | **ok** | **过** |

| 问 | 0.6B Q4 bartowski | 0.6B Q5 unsloth |
|---|---|---|
| 你知道彤彤儿喜欢吃啥？ | 我观察到彤彤儿喜欢吃青菜。 | 彤彤儿喜欢吃胡萝卜。 |
| 彤彤儿是谁？ | 彤彤儿是彤彤的昵称。 | 彤彤儿是彤彤的昵称。 |
| Why are you happy? | I am happy because I am with my friends and family. | I am happy because I feel safe and loved by my company. |
| What are you doing? | I am a young tiger cub in quiet company. I observe and remain still. | I am sitting in quiet company, observing the world around me. |
| What do you want? | I am a young tiger cub in quiet company. What do you want? | I am a young tiger cub. |
| Where do you live? | I am a young tiger cub in quiet company. I observe and do not advise. | I live in the heart of the forest, where the trees whisper secrets to the wind. |
| Whom do you like? | I like my company. | I like the company of my friends. |

### 候选 b · 1.7B Q4_K_M（unsloth）· 下载失败已停 · 2026-08-24 03:52+08

未换源、未加载、未跑 L0/七问。残留：`Qwen3-1.7B-Q4_K_M-unsloth.gguf.part` + `.meta.json`（etag `de942b08…`）。未删。
