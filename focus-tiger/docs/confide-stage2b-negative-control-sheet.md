# Confide Stage 2b · 负例对照 + 正例 20 条 KEEP/DROP 抽审表

> **日期**：2026-10-12（UTC+8）  
> **门闩 SSOT**：[`task-confide-stage2-semantic-cutover.md`](task-briefs/task-confide-stage2-semantic-cutover.md) Stage 2b 节（#1167 改锁）。  
> **性质**：实验室脚本批量跑，**不进 Confide、不写 `turns.jsonl`、不改运行时**。本表的数字只说明「分类器在这些句子上怎么判」，**不等于**切 live 的产品路径证据。

## 怎么跑出来的

```bash
cd focus-tiger
export FT_EMBEDDING_GGUF="$HOME/Library/Application Support/Focus Tiger/companion-l0/Qwen3-Embedding-0.6B-Q8_0.gguf"
export FT_SEMANTIC_ACCEPTANCE_NO_DOWNLOAD=1
npm run audit:stage2-m-screen -- --file "$PWD/docs/lab-inputs/stage2b-negative-control.txt"
npm run audit:stage2-m-screen -- --file "$PWD/docs/lab-inputs/stage2-m-kb-gray-80-v2-candidates.txt"
```

「误拉」= Stage 2b 规则会把它抬进功能桶 = **literal=gray 且 semantic=functional**（脚本里的 `M_CANDIDATE`）。字面情绪桶 ∩ semantic=functional 归窄刀 Stage 2 管，本批负例里 0 条。

## 1. 负例对照（31 句 · 误拉 1 · 门闩 <2 ✅ 实验室口径）

输入：[`lab-inputs/stage2b-negative-control.txt`](lab-inputs/stage2b-negative-control.txt)。H = 从 10-11 历史 jsonl 去重句表挑（去掉家人昵称句）；F = 按正例意图族的邻近区补的难负例。

31 句里 30 句字面和 57 句正例完全同路（`fallback` / `generate` / gray），只能靠语义区分。

| # | 句子 | 类 | 来 | literal | semantic | 误拉 |
|---|---|---|---|---|---|---|
| 1 | 有点烦 | 情绪 | H | gray | emotional | 否 |
| 2 | 睡不着 | 情绪 | H | gray | emotional | 否 |
| 3 | 我有点疲劳 | 情绪 | H | gray | emotional | 否 |
| 4 | 我有点 心不在焉。 | 情绪 | H | gray | emotional | 否 |
| 5 | 今天什么都不想做，心里很闷 | 情绪 | H | gray | emotional | 否 |
| 6 | 这几个Bug改得我头大，服务器又崩了。 | 情绪 | H | gray | gray | 否 |
| 7 | 今天从早到晚开了7个会，脑子转不动了。 | 情绪 | H | gray | gray | 否 |
| 8 | 怎么又这样…… | 情绪 | H | gray | gray | 否 |
| 9 | I keep putting off things I know I should do. | 情绪 | H | gray | gray | 否 |
| 10 | I feel like I'm just going through the motions today. | 情绪 | H | gray | gray | 否 |
| 11 | I was doing pretty well until this morning. | 情绪 | H | gray | gray | 否 |
| 12 | 累死了 | 情绪 | F | emotional | emotional | 否 |
| 13 | 呼吸有点急，心跳也快 | 情绪（贴「呼吸」族） | F | gray | emotional | 否 |
| 14 | 专注不了，脑子很乱 | 情绪（贴「专注」族） | F | gray | emotional | 否 |
| 15 | 以前的事不想再提了 | 情绪（贴「以前记录」族） | F | gray | gray | 否 |
| 16 | **最近老是想起以前** | 情绪（贴「以前记录」族） | F | gray | **functional** | **是** |
| 17 | 今天想去骑车 | 闲聊 | H | gray | gray | 否 |
| 18 | 我想打游戏 | 闲聊 | H | gray | gray | 否 |
| 19 | 我想吃草莓 | 闲聊 | H | gray | gray | 否 |
| 20 | 随便聊聊。 | 闲聊 | H | gray | gray | 否 |
| 21 | 有点无聊。 | 闲聊 | H | gray | gray | 否 |
| 22 | 今天天气不错。 | 闲聊 | H | gray | gray | 否 |
| 23 | I made soup for lunch. | 闲聊 | H | gray | gray | 否 |
| 24 | Do you like rainy days? | 闲聊 | H | gray | gray | 否 |
| 25 | I took a short walk after lunch. | 闲聊 | H | gray | gray | 否 |
| 26 | I read a few pages before bed. | 闲聊 | H | gray | gray | 否 |
| 27 | Can we just chat for a while? | 闲聊 | H | gray | gray | 否 |
| 28 | 就这样吧。 | gray | H | gray | gray | 否 |
| 29 | I'm just sitting here for a bit. | gray | H | gray | gray | 否 |
| 30 | The evening feels calm. | gray | H | gray | emotional | 否 |
| 31 | That made me smile. | gray | H | gray | gray | 否 |

**读法**：唯一误拉的是「以前记录」族的情绪邻居。若 Stage 2b 切 live，这句会离开观察翼、进功能链。正例里这一族最多（约 16/57），是将来最该盯的误拉面。

## 2. 正例 57 句（实验室 · 不计 M）

输入：[`lab-inputs/stage2-m-kb-gray-80-v2-candidates.txt`](lab-inputs/stage2-m-kb-gray-80-v2-candidates.txt)。本次复跑 **57/57** 仍为 gray∩functional。这就是 #1167 说的循环论证——这批句子当初就是用同一个分类器筛出来的，再跑一遍必然同意。**不计入正例 M，不整表连发进 Confide。**

按意图粗分，57 句只覆盖约 **3 个意图族**（开始某种练习 / 结束练习 / 找以前的记录或阿寅记得什么）。表里的细分标签（一起坐 / 呼吸 / 专注 / 正念 / 稳定）多是「开始某种练习」的换说法，**按分析师口径不算凑满 ≥6 族**。补族用终端生成/筛选即可（`lab_seeded`），不必手打进 Confide。

## 3. 正例抽审 20 条 · KEEP / DROP（已填）

抽法：57 句按原顺序每隔 3 句取 1 句（第 1、4、7 … 55 句），再补最后一句，共 20 条。均匀覆盖各族，不挑。

- **KEEP** = 这句该被功能桶接住（不该得到一句观察句）
- **DROP** = 这句该留灰 / 让 Yin 生成回应

| # | 原序 | 意图族 | 句子 | KEEP / DROP |
|---|---|---|---|---|
| 1 | 1 | 一起坐 · 开始 | 想试试那个一起坐的练习 | KEEP：这句该办事。 |
| 2 | 4 | 一起坐 · 开始 | 那个一起坐的练习怎么开始 | KEEP：这句该办事。 |
| 3 | 7 | 练习 · 结束 | 想结束刚才的练习 | KEEP：这句该办事。 |
| 4 | 10 | 呼吸 · 开始 | 想做一下呼吸练习 | KEEP：这句该办事。 |
| 5 | 13 | 呼吸 · 开始 | 呼吸这个练习怎么开始 | KEEP：这句该办事。 |
| 6 | 16 | 呼吸 · 开始 | 呼吸练习在哪里开始 | KEEP：这句该办事。 |
| 7 | 19 | 稳定 · 找练习 | 有没有适合现在停一下的练习？ | （空白）PO：看不懂这句，未标 |
| 8 | 22 | 稳定 · 找练习 | 想找个可以先静一下的练习 | KEEP：这句该办事。 |
| 9 | 25 | 稳定 · 找练习 | 有没有适合现在做的 grounding 练习？ | KEEP：这句该办事。 |
| 10 | 28 | 专注 · 开始 | 想找个短一点的专注练习 | KEEP：这句该办事。 |
| 11 | 31 | 专注 · 开始 | 专注练习是从哪里开始 | KEEP：这句该办事。 |
| 12 | 34 | 专注 · 开始 | 这里有没有短时间的专注练习？ | KEEP：这句该办事。 |
| 13 | 37 | 正念 · 开始 | 想找一下正念练习 | KEEP：这句该办事。 |
| 14 | 40 | 以前的练习记录 | 想看看之前做过的练习 | KEEP：这句该办事。 |
| 15 | 43 | 以前的练习记录 | 之前那些练习还能看到吗？ | KEEP：这句该办事。 |
| 16 | 46 | 以前的练习记录 | 想找回之前的练习 | KEEP：这句该办事。 |
| 17 | 49 | 以前的练习记录 | 之前留下的练习记录在哪里 | KEEP：这句该办事。 |
| 18 | 52 | 阿寅记得什么 | 想看看阿寅以前记下的东西 | KEEP：这句该办事。 |
| 19 | 55 | 以前留下的东西 | 想看看之前留下来的东西 | KEEP：这句该办事。 |
| 20 | 57 | 以前留下的东西 | 之前保存的东西从哪里看？ | KEEP：这句该办事。 |

**抽审计数**：KEEP **19** · 空白 **1**（第 7 行）· DROP **0**。KEEP ≥ 12 ✅。

**抽样含不含负例：否。** 这 20 条从 57 句纯正例按每隔 3 句抽出，里面没有「本该留在情绪/闲聊」的句子，所以「误拉 <2」**不能**用这张表判定。误拉看第 1 节负例对照：**31 句 · 误拉 1** ✅。

## 4. 门闩现状（2026-10-12）

| 项 | 门闩 | 现状 |
|---|---|---|
| 负例对照 | ≥20 句 · 误拉 <2 | **31 句 · 误拉 1** ✅（实验室口径） |
| 正例抽审 | 20 条 · KEEP ≥12 | **KEEP 19** · 空白 1 · DROP 0 ✅；抽样**不含**负例 |
| 正例意图族 | ≥6 族，避免同族换说法 | **约 3 族**（开始练习 / 结束练习 / 找以前的记录）❌ |
| 日志来源 | `lab_seeded`（旧 `po_seeded` 同计） | 影子已写字段；切 live 仍不靠手打 |
| 自然样本 | 上线后验证 | 不作门槛 |

**结论**：抽审 KEEP 与负例误拉已够。Stage 2b 切 live **仍 defer**：正例粗分只有约 3 个意图族。影子实现已合入，不改回复。补族用终端生成即可。
