# Task Brief · 产品问答贴近事实卡

> **状态（2026-10-15）**：PO 已同意方向（「有限事实卡 + 按意思贴近」）。本文件是那一刀的规格。**不改发送链。** 实现须另说「按这份 Brief 开工」，并且新开 Chat。
> **2026-10-15 续刀**：#1250 已合；未见英文批 `sealed-v1` 未过关（0037 30%、0038 0%）。下一刀只改检索短语判定（能力说明按句切开，短答仍整段），并重写 0037/0038 能力说明使它更像「这张卡覆盖哪类事实」。**禁止**把失败句写入 keywords。过关必须另开新封存文件 + 新手写出题编号。
> **2026-10-16**：#1255 已合。新未见英文批 `sealed-v2`（出题编号 `fc-en-unseen-v2-2026-10-16-session-c`）未过关：0037 20%、0038 0%、闲聊不进空态 100%。该文件已作废。**禁止**写「换说法已经接住」。下一刀仍不得把失败句写入 keywords。
> **类别**：B 类。会改变宽屏倾诉里产品短答从哪一句来。
> **跟进号**：**CR-49**。不取代 **CR-47**（操作问法 ∧ 产品对象，否则生成）。
> **原则**：`PRINCIPLES.md` **R-Confide-No-Symptom-List**。禁止按症状加说法名单。测试纪律 `testing-strategy.mdc`（`confide-class-blind`）。

## 0. 大白话

现在的「按意思找」其实是在跟每张卡的关键词名单比。名单里没有的说法就对不上，于是每次修 bug 都再加几个词。换背景音乐、为什么要打卡，会永远加不完。

下一刀改成：拿用户的话去跟**事实卡正文**比。够近就念那张卡的短答。不够近，就说没有短答，并只记下「最近的是哪张卡、有多近」。不把原句存下来。缺的是一整张能力说明时，去写卡，不去改正则。

## 一、现在代码在比什么

`catalogEntryEmbeddingText`（`kbNearMatch.js`）只把 `keywords` 用换行拼起来。短答正文不参与近义。所以近义分高不高，取决于名单里有没有近似问法。

0.80 命中线、0.62 中间带、吃面和「能不能聊」走现写，都仍然有效。见 `task-confide-kb-embedding-near-match.md`。本刀不放低 0.80。

## 二、比对面改成什么

每张可检索卡只贡献能力说明和短答，**按句切开能力说明** 再嵌入（短答仍整段一条，避免各卡共用的「Open More」抢邻居）：

1. **能力说明**：这张卡在回答哪一种产品事实。写成「whether / where …」这类事实覆盖句，不是用户原话，也不是同义问法列表。若有两句，检索时分成两条短语。
2. **已审核短答** `shortAnswerEn`（整段一条向量）。

没有能力说明的旧卡，近义文本就只用短答。实现时若某张旧卡因此从「能命中」变成「不能命中」，只允许给那张卡补一句能力说明，不允许把失败句写进 `keywords`。

`keywords` 不再进入 `catalogEntryEmbeddingText`。已有关键词的字面命中可以留着，本刀不删。**禁止**为新问法追加关键词。`task-confide-kb-embedding-near-match.md` 第九节「把 how can I take a breath 补进检索面」从本 Brief 起作废。

## 三、不够近时

已经确认是产品问、又没有卡够近：仍是诚实空态（没有手册，去菜单找）。禁止改成自由生成。这与 CR-47 一致：动机句、不想练、陈述想练，不是产品问，走生成；那是 CR-47 的实现，**本刀不写**。

空态日志只许：`nearestId` + 分数（以及已有的路由种类名）。禁止写入用户原句、哈希还原句、或「为了记缺口编的问法」。内容上的下一步是看最近卡片是不是错的邻居；错邻居且分数低于 0.80，表示缺卡，不表示要给那张错卡加词。

## 四、先写的两张卡（实现时入库，本文件先锁文案）

编号用目录里下一个空号（现网最大到 `KB-FUNC-0036`，预计 **0037 / 0038**，实现时再核对，禁止复用）。`yin_may_retrieve: 是`。每张卡的 `keywords` 只留界面上已经有的控件名，不加问法变体。

### 0037 · 背景音乐在哪

能力说明：Where the idle-screen control turns background music or ambient sound on or off, and that it stays off until the person turns it on.

短答（en）：Tap the music control on the idle screen to turn background music on or off. It stays off until you turn it on. A sit may play music for that sit without switching this on for next time.

控件名仅：`background music`。依据：`AMBIENT_MUSIC_ON_ARIA` / `HINT_AMBIENT_SOUNDSCAPE`。不写曲目名单，不写上传步骤。

### 0038 · 打卡不是强迫签到

能力说明：Whether check-in or a daily streak is required. Missing a day takes nothing away.

短答（en）：You do not have to check in. Sit with Yin works without it. Honesty Check-in, under More (⋯) or the drawer → Practice, only records quiet time you already did somewhere else. It is optional, and missing a day does not take anything away.

控件名仅：`Honesty Check-in`。不改 `KB-FUNC-0020` 的「入口在哪」短答。0020 回答在哪，0038 回答要不要。

## 五、明确不做

- 不放低 0.80，不把 0.62–0.80 整段改成现写。
- 不实现 CR-47，不改 `resolveProductKnowledgeGateAction` 的问法收窄。
- 不改危机层、不改安全金句、不改 Stage 2b。
- 不新开可执行工具（改音乐、替用户打卡都不进 `CONFIDE_EXECUTABLE_INTENTS.md`）。
- 不把「为什么要冥想」写成第三张卡。那句仍归 CR-47：生成。
- 窄屏和网页仍不做向量（CR-40）。

## 六、冲突扫描

对照场景 AE：真功能问没有近条时仍不许现编步骤。本刀只改「近」的算法比对哪段文字。动机句走生成是 CR-47，尚未接线；本刀不宣称那些句子已经会生成。

`KB-FUNC-0020` 与 0038 职责分开：在哪 / 要不要。无第二项待决。

## 七、共用机制核对

本次不触及 overlayBusy / HUD 呼吸驱动 / z≥17 遮罩 / 新建可点击叠层，核对跳过。

## 八、点击

不新增控件。发送后 0–1 秒仍是现有等待，然后短答或诚实空态。没有新的静默。

## 九、验收（实现会话才跑）

英文第一优先。已经写在本文件里的两句只作回归，不能当成泛化证明。

修前会红、修后会绿的机制测试：

- `catalogEntryEmbeddingText` 含短答，不含 `keywords` 里多出来的问法。
- 给一张卡只加失败句的关键词、不加能力说明 → 近义文本不变。
- 两句能力说明会切成两条检索短语；短答不按句切开。
- 0037 / 0038 的近义文本含上面的能力说明。
- 诚实空态日志对象没有 `text` 字段。

关单还要一批本 Brief 没写过的英文问法（另一个会话出题）：背景音乐的换说法应落在 0037；「要不要打卡」的换说法应落在 0038；吃饭闲聊仍不得进空态。没这批之前不得写「换说法已经接住」。

## 十、开工

口令：「按事实卡贴近 Brief 开工」。口令之前禁止改 `kbNearMatch.js`、目录 JSON 和发送链。
