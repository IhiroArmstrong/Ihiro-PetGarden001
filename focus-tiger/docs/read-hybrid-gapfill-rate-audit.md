# Read Hybrid 补漏率审计（#841 合入后 · 2026-09-18）

> **只读。禁止改 `_onSend` / `mayUseConfideReadHybrid`。禁止把 Gate 0.D E′ prompt 挂上 send。**  
> 层序对照：`CONFIDE_EXECUTABLE_INTENTS.md` Tool Registry（正则优先 → regex miss 才 `classifyReadTool`）。  
> 延迟行：`ISSUE_LEDGER.md` Confide L3 生成延迟。P0 中文 aggression **另线**：`task-briefs/task-confide-aggression-zh-p0.md`。

## 1. 问的是什么

在 `kind=read_hybrid_classify` 里：

1. `tool ≠ none` 占多少（Hybrid 自称要动工具的比例）；
2. 这些句子里，**现网正则本就会命中**的有多少（假补漏 / 正则洞）；
3. 正则正确 miss、Hybrid 才补上的有多少（真补漏）。

数字出来之前，**不**拍「跳过 Hybrid」或「扩 regex」。

## 2. 本机 `turns.jsonl` 地面真相

路径：Electron `userData/companion-l2/turns.jsonl`（本机 `focus-tiger-desktop`）。

| 项 | 数 |
|---|---|
| 总行 | 162 |
| `kind=read_hybrid_classify` | **0** |
| 含 `kind` / `timing` 的行 | **0** |
| 唯一 schema | `at, locale, text, raw, reply, ok, reason`（#841 之前的 generate 落盘） |
| 时间窗 | `2026-08-22T10:54Z` … `2026-09-18T09:17Z`（北京时间 17:17） |

`#841` 合入时间：`2026-09-18 18:47 +0800`（`dbd3088e`）。**最后一条对话早于合入约 1.5 小时。**  
因此：**合入后对话日志尚未产生**，`tool≠none` 比例与「正则本该命中 vs 真补漏」在产品 jsonl 上 **样本量为 0**。

`read_hybrid_classify` 行自 **2026-09-19** 起另记 `text`（用户原句，截断 400 字；仍不改 send / 不挂 E′）。合入前旧行只有 `promptChars` + `raw`，无法把 tool 对回 `matchConfideExecutableTool`。

## 3. 旁证（旧 generate 行 · 不是 Hybrid 补漏率）

对 162 条旧 generate 的 `text` 用 **当前 develop 正则**回放（不落用户原句）：

| 回放 | 条数 |
|---|---|
| `confideClassify` fallback | 157 |
| safety | 2 |
| sad | 1 |
| aggression（现网 EN 规则） | 2 |
| 中文攻击字面（`想打人` 等） | **4**（现网仍 fallback → 可进观察翼 / L3） |
| `matchConfideExecutableTool` → `query_practice_duration` | 3 |
| `isMemoryListQuestion` | 0 |
| 任一 send 前层正则（boundary / presence / reflective / practice / exec） | 17 |

含义：这是「已经进了 generate 的句子，用今天的正则会不会提前拦住」，**不是** Hybrid `tool≠none` 补漏率。3 条练习时长问句仍出现在 generate 日志里，只说明历史上正则或接线有漏，不能拿来拍跳过 Hybrid。

## 4. 层序（现网事实 · 未改）

```text
Safety → aggression → 情绪桶 → fallback
_onSend: suppress → boundary → companion presence → preference
       → matchConfideExecutableTool（CI regex）
       → regex miss + fallback → classifyReadTool（Read Hybrid）
       → 仍未命中 → L3
```

Gate 0.D / E′ **不在**这条链上。Read Hybrid 只在 fallback + 宽屏 + generate 开 + 正则已 miss 时跑。

## 5. 肉测协议（develop tip · 含 #859 原句 + #861 正例门闩）

**壳**：`origin/develop` tip · Electron 宽屏 · `npm run desktop:dev`（`focus-tiger-desktop` userData）。

**会话脚本**（建议 ≥15 轮 fallback 闲聊 + 5 轮正例门闩句）：

| 批次 | 例句 | 预期 |
|---|---|---|
| 闲聊（≥15） | `今天好累` / `有点烦` / `睡不着` … | #861 后 **不**写 `read_hybrid_classify`（直进 generate） |
| 正例门闩（5） | `列出记忆` · `你还记得什么` · `我最近在忙什么` · `为什么开始做这件事` · `我练了多久` | 仍写 `read_hybrid_classify`；`练了多久` 可能 regex 直命中、不进 Hybrid |
| 可选对照 | `我想打游戏` | 跳过 classify（#861 反例） |

**抽数**（肉测后）：

```bash
cd /Users/armstronghesapplelaptop/Downloads/Zen-tiger-Pet-garden001/focus-tiger && npm run audit:read-hybrid-gapfill
```

默认只统计 **带 `text` 字段** 且 `at ≥ 2026-09-19` 的 `read_hybrid_classify` 行（`--all` 可含旧行）。

## 6. 已做 / 仍缺

| 项 | 状态 |
|---|---|
| #841 `read_hybrid_classify` + timing 落盘 | 已合 develop |
| #859 分类行记 `text`（截断 400） | 已合 develop（`128b344d`） |
| #861 `shouldRunConfideReadHybridClassify` 正例门闩 | 已合 develop（`bdd167b1`）；明显闲聊跳过 classify |
| 第一轮肉测（17 句 · 无 `text`） | **旁证**：14 条 classify · tool≠none **1/14 ≈ 7%**（`列出记忆`）；不可算假/真补漏 |
| 带 `text` 的第二轮肉测（2026-09-19 Electron · tip `db670f9`） | **已抽**：`analyzed 3`（since 当天 UTC；skipped no-text 24、before-since 88）。tool≠none **1/3=33.3%**；regex replay 命中 **0/3**；假补漏 **0**；真补漏 **1**（`列出记忆` → `query_memory_list`）；would skip classify **1**。样本仍偏少，但真补漏已钉在「列出记忆」regex 洞，不是 gloss 过宽。 |

**我认为最合理的**：下一刀运行时只补 `列出记忆` 进 `isMemoryListQuestion`（真补漏、无 #822 冲突），并收 `忙啥` 进与 `忙什么` 同一诚实桶。**不要**把 `我最近在忙什么` 改回 `memory_list`（与 #822 关单冲突，须 PO 先拍）。闲聊 3s 是 L3 generate，不是 Hybrid。P0 中文 aggression（#847）另线。

**2026-09-19 已开工**（`fix/confide-meta-regex-and-acceptance`）：上两刀 regex 已合入旁支；肉测终止条件见 `docs/confide-meta-query-acceptance.md`（32 句冻表 + 单测）。

## 7. 不合理（仍作废）

把 E′ 挂上 send、或把 `我最近在忙什么` 改回 `memory_list`（与 #822 关单冲突）而未先经 PO、或凭第一轮无 `text` 旁证扩 gloss。
