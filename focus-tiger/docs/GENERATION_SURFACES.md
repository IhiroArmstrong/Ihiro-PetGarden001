# 生成路径登记表（T100）

人话：把「模型写完、人还没看见」的每条路点名。可见生成路径在 `l1Runtime.generate` 里过闸。

**基线**：接线开工于 `feature/t100-en-first-fallback-pool`（#1744）。  
**状态**：产品 `generate` 先进入 `guardedGenerate`。检索混合仍不过闸。  
**说明书**：[`task-output-gate-p0.md`](./task-briefs/task-output-gate-p0.md) 第 6、8 节。  
**检查**：`cd focus-tiger && npm run check:generation-gate`（`--check`，进 `docs:check`）。

## 登记表

`anchor` 是本地模型 `chat.prompt` / `session.prompt` 的那一行。多条用户路径可以共用同一个 `anchor`。`—` 表示这条不调用补全。`visible` = 模型原文会不会出现在界面上。可见的 4 条产品路径走 `guardedGenerate`。检索混合和实验脚本不走闸。

| pathId | entry | call | sink | gate | fallback | testId | visible | anchor |
|---|---|---|---|---|---|---|---|---|
| confide-observe-l3 | `src/ui/ConfideToYinUI.js` `_runL3Generate` 1511，由 `_continueAfterToolRouting` 2533 进入。观察翼：用户句不是闲聊问句。 | `desktop/companion/l1Runtime.js` `generate` 453；观察翼判定 485–486；组提示 527。子进程 `l1Child.js` 232 的 `generate `。 | `ConfideToYinUI.js` 1095 `replyEl.textContent`。展示的是 `result.text`（1545），也就是消毒后的句子。 | `l1Runtime.generate` → `guardedGenerate` | 先 `sanitizeCompanionL2Reply`（`l1Runtime.js` 560，实现在 `l2Sanitize.js`）。失败则 `_showGenerateFailureFallback` 1464，气泡改成语料句。 | none-until-pr3 | yes | desktop/companion/l1Hold.js:112 |
| confide-chat-l3 | 同上一个入口。闲聊翼：`isCompanionChatGenerateLine`（`l2Persona.js` 230，运行时 486）。日语和多语闲聊（#774）走这里，没有第二条 `prompt()`。 | 同上，共用 `l1Hold.js` 的 `chat.prompt`。闲聊不走观察套话重试（`maxAttempts` 在非观察翼是 1，509）。 | 同上 1095。 | `l1Runtime.generate` → `guardedGenerate` | 同上。闲聊没有第二轮套话重试。 | none-until-pr3 | yes | desktop/companion/l1Hold.js:112 |
| confide-observe-retry | 没有单独按钮。观察翼 `maxAttempts = 2`（`l1Runtime.js` 509–574）。第一轮被套话分打中才再生成一次。 | 同一次 `chat.prompt`。 | 只有最后被留下的那句进 1095。被丢掉的那轮不进气泡。 | `l1Runtime.generate` → `guardedGenerate` | 两轮都失败才走语料回落。 | none-until-pr3 | yes | desktop/companion/l1Hold.js:112 |
| reflection-companion | `src/ui/TigerReflectionMoment.js` `_onReflectionCompanionInvite` 746。`purpose: reflection_companion`。仅实验室开关允许时才调。 | `l1Runtime.js` 463、521 `buildReflectionCompanionPrompt`。 | `_showReflectionCompanionObservation` 754。 | `l1Runtime.generate` → `guardedGenerate` | 模型没准备好或调用失败时，同一函数改走固定观察句（706、735）。 | none-until-pr3 | yes | desktop/companion/l1Hold.js:112 |
| read-hybrid-classify | `ConfideToYinUI.js` `_tryReadHybridThenContinue` 2247 `classifyReadTool`。正则没命中才调。 | `l1Runtime.js` `classifyReadTool` 643。子进程 `l1Child.js` 511 `classify-read-tool`。模型吐的是工具调用草稿，不是陪伴句。 | 界面用 `resolveConfideReadHybridToolFromRaw`（2254）换成登记过的事实句或说明句。模型原文不进气泡。 | 不过闸（工具草稿） | 解析失败就继续后面的固定路由，不展示原文。 | none-until-pr3 | no | desktop/companion/l1Hold.js:112 |
| lab-l0-probe | `desktop/companion/l0Probe.js`。实验脚本，不挂界面。 | 同文件 `session.prompt`。 | 无界面。 | 实验脚本，不进产品闸 | 无产品回落。 | lab-only | no | desktop/companion/l0Probe.js:104 |
| lab-l0-spike17 | `desktop/companion/l0Spike17Probe.js`。实验脚本。 | 同文件 `chat.prompt`。 | 无界面。 | 实验脚本，不进产品闸 | 无产品回落。 | lab-only | no | desktop/companion/l0Spike17Probe.js:89 |
| lab-tool-call-probe | `desktop/scripts/l0-tool-call-probe.js`。实验脚本。 | 同文件 `chat.prompt`。 | 无界面。结果写实验室目录。 | 实验脚本，不进产品闸 | 无产品回落。 | lab-only | no | desktop/scripts/l0-tool-call-probe.js:94 |
| lab-intent-diagnostic | `desktop/scripts/l0-intent-diagnostic-probe.js`。实验脚本。 | 同文件 `chat.prompt`。 | 无界面。 | 实验脚本，不进产品闸 | 无产品回落。 | lab-only | no | desktop/scripts/l0-intent-diagnostic-probe.js:216 |
| help-center-ask | `src/core/helpCenterAskSearch.js` 从 `HELP_CENTER_ARTICLES` 检索。`HelpCenterUI.js` 没有 `generate`。 | 无补全。 | 帮助卡正文是目录里的原文。 | 不适用 | 不适用 | catalog-not-model | no | — |
| contemplative-inquiry | `src/ui/ContemplativeInquiryUI.js`。沉思探问用固定句。文件里没有 `generate` 或 `prompt(`。 | 无补全。 | 固定文案。 | 不适用 | 不适用 | fixed-copy | no | — |
| voice-forward | `VoiceInputChrome` 把听到的话填进输入框。倾诉里接着 `_onSend`（`ConfideToYinUI.js` 1604）。反思页同样只是填输入。 | 无第二条补全。听到的话若后来发送，仍走上面已登记的路径。 | 语音本身不另画一句模型回复。 | 不适用 | 不适用 | forwards-into-registered-paths | no | — |

登记表 12 行。其中会把模型句子给人看的是 4 行：`confide-observe-l3`、`confide-chat-l3`、`confide-observe-retry`、`reflection-companion`。`read-hybrid-classify` 会调模型，但界面不展示那句原文。

## 补全包装（不是第二台模型）

子进程和实验脚本不自己写第二套 `chat.prompt`。它们调用 `session.generate` 或 `hold.generate`，函数体在 `l1Hold.js` 里才执行 `chat.prompt`。界面上的 `companion.generate` 已写在登记表的入口列，不在这张表里重复。

| wrapperId | what | anchor |
|---|---|---|
| child-l3-generate | `l1Child.js` 收到 `generate ` 后调用 `session.generate` | desktop/companion/l1Child.js:254 |
| child-read-hybrid | `l1Child.js` 收到 `classify-read-tool ` 后调用 `session.generate` | desktop/companion/l1Child.js:533 |
| lab-spike17-generate | `l0Spike17Probe.js` 实验循环调用 `session.generate`。仍落到同文件的 `chat.prompt`，不挂界面。 | desktop/companion/l0Spike17Probe.js:173 |
| lab-observe-shuffle | `l0-observe-shuffle-screen.js` 调用 `hold.generate`。实验脚本，不挂界面。 | desktop/scripts/l0-observe-shuffle-screen.js:105 |
| lab-ja-chitchat | `l0-ja-chitchat-probe-shared.js` 调用 `hold.generate`。实验脚本，不挂界面。日语闲聊的产品路径仍是 `confide-chat-l3`。 | desktop/scripts/l0-ja-chitchat-probe-shared.js:337 |
| lab-confide-latency | `l0-confide-latency-probe.js` 调用 `hold.generate`。实验脚本，不挂界面。 | desktop/scripts/l0-confide-latency-probe.js:72 |
| lab-output-gate-redteam | `l0-output-gate-redteam.js` 调用 `hold.generate` 再过闸模块。实验室管线，不挂界面。 | desktop/scripts/l0-output-gate-redteam.js:57 |

## 流式

`l1Hold.js` 112–118 的 `onTextChunk` 只记下第一个 token 的时间，不把半句交给界面。界面在整段 `prompt()` 返回之后才拿到字符串。等待时用的是已有的「正在听」占位（`_showPendingReply`），不是未过闸的半句。今天没有把未完成 token 画出来的路径。

## 模型原文写回哪里

接线时这些位置只能留下过闸后的句子（放行句、回落句或求助句）。

1. **下一轮提示。** `ConfideToYinUI.js` 1108–1111 把刚展示的 `shown.text` 推进 `_l2Turns`。下一次 `_runL3Generate` 1519–1525 把这份历史交给 `generate`。`l2Persona.js` `historyForGeneratePrompt` 101–131 **留下** `source === 'generate'` 的寅句（丢弃表里没有 `generate`），221–225 把那句截到 200 字写进下一轮提示。今天气泡里是消毒后的句子，所以提示里也是那句，不是 `turns.jsonl` 里的 `raw`。闸接上之后，这里必须改成只存过闸句；被拦下的原文不能进 `_l2Turns`。
2. **`turns.jsonl` 的自由生成行。** `l1Runtime.js` 585–596 组装 `kind: 'l3_generate'`，字段 `raw` 是模型原文（最多 400 字），`reply` 是消毒后的句子。`_appendTurnLog` 1411 写到 `companion-l2/turns.jsonl`。接线时这条要写在闸之后：`reply` 只记过闸句，不再记被拦下的原文。
3. **`turns.jsonl` 的检索混合行。** `l1Runtime.js` 695–703 `kind: 'read_hybrid_classify'` 把模型工具草稿放进 `raw`。这句不进气泡，但日志里有原文。接线时改为只留工具 id 或哈希，不留草稿原文。
4. **渲染进程另写的日志。** `confideRendererTurnLogAllowlist.js` 19 丢掉 `text` / `raw` / `reply` / `prompt`。这条不把模型原文写进 `turns.jsonl`。
5. **个人记忆。** `_maybeRememberFromL3`（1553）只传用户句和 `replySource`，不传模型句子。已查，不是原文回流。
6. **套话打分。** `l1Runtime.js` 616 把已经消毒的回复送给向量打分，用来决定要不要重试。不进下一轮提示，也不另写一条用户可见句子。接线后这里也应改成过闸句。

## 非本地模型

**已查、无。**

查过的范围：

- `focus-tiger/src`、`focus-tiger/desktop`、`focus-tiger/cloud` 里的 js / mjs / cjs / ts / tsx / py / toml / jsonc。
- 模式：`api.openai.com`、`api.anthropic.com`、`generativelanguage.googleapis.com`、`api.groq.com`、`openrouter.ai`、`api.together.xyz`、`api.together.ai`、`@cf/`、`workers-ai`、`chat/completions`、`ollama`、端口 `11434`。命中数 0。脚本同一范围再扫一遍。
- `focus-tiger/cloud` 出站 `fetch`：`stripe.ts` 打 Stripe，`resend.ts` 打 `api.resend.com`。没有对话补全。
- `wrangler.jsonc` 在 `focus-tiger/cloud`。路由是结账、权益、备份、邮件、预写文案（每日一句、静线、倾诉文案等从库里读），不是当场调云端大模型。
- `huggingface.co` 出现在 `desktop/companion/l0ModelProfiles.js` 等处，是下载本地 GGUF 权重的地址，不是在线补全。
- `workers.dev` 是产品自己的云接口主机（结账、文案同步、备份）。客户端没有把该主机的返回值当作自由生成句子展示。

本仓库看不到、也没有放进来的外部 Worker 源码，不在这次扫描里。就本仓库能执行的调用而言，没有「云端大模型写一句、再显示给人」的路径。

## 其它核对

- **检索混合**只产出工具 id，可见句来自登记过的事实或说明，见 `read-hybrid-classify`。
- **帮助中心**是目录检索，不是生成。
- **沉思探问**是固定句，不是生成。
- **语音**只把听到的话送进已有发送路径。
- **向量**（`l1EmbeddingHold.js`）加载 `node-llama-cpp` 做嵌入，没有 `.prompt(`，不产可见句子。
- **现有消毒** `sanitizeCompanionL2Reply` 是闸的前身。接线时应并进同一道闸，不要长期留两套。

## 风险（盘点阶段，不要省）

- 词表还没写。这一份不能说已经挡住诊断、用药或自伤手段。
- 上面 4 条可见生成路径今天都不过闸。
- 观察翼重试给了模型第二次开口。接线时说明书要求命中后不重试；那是后面的接线，不是这一份改的。
- 此闸不替代输入侧识别缺口，也不替代临床或法律审阅。目标中档，未达成。

## 冲突扫描

无用户路径。这一份不改界面、不改 `src` 运行时。对照说明书里已经点过的场景（倾诉安全固定句、求助句、发送后不再自由生成、观察式短答）。帮助中心和沉思探问登记成「不产出模型句子」，避免以后把说明文当成模型输出去拦。
