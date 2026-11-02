# Task Brief · 四通道英语句稿 + 句包 overlay（R · B 类）

> **状态**：**PO 点头（2026-11-02 · 句稿与审核字段修订后锁定）**。点头 ≠ 现网已换句。点头后实现第 1–3 步仍 **零用户可见新句**，直到第 4 步另一次书面 + 口令「部署」。  
> **类**：**B 类**（会改用户看得见的陪伴句；本文件锁规格与英语句稿）。  
> **父页**：[扩库说明书 #1537](task-constrained-generation-expanded-retrieval-spec.md) · [对比说明 #1533](task-constrained-generation-pool-vs-expanded-retrieval.md)。  
> **拍板**：说明书已条件点头；本页经 PO 条件点头 + 分析师 AI 审稿修订后锁定。实现 PR **仍零用户可见新句**，直到审核字段齐、哈希匹配、且 overlay 杀开关允许。  
> **代号**：待治理登记。不占用 **T54** / **T68** / **T70** / **T73**。本 PR **不改** [`GLOSSARY.md`](../GLOSSARY.md) / [`SCHEDULING_GLOSSARY.md`](../SCHEDULING_GLOSSARY.md)。  
> **不是**：阶段 1。**不是** 本机预生成池。**不是** 倾诉开放生成。**不是** 个性化骨架（说明书 §7 仍暂存）。**不是** UI 新叠层（句包 overlay ≠ overlayBusy 浮层）。**不是** 母语人工审。

---

## 0. 大白话

说明书已经定了：这四条短陪伴话先不要让模型现场编，先把英语句子加到每条路大约八句，审完再用云端句包发下去；没网还是用现在那一两句。

这一份把**要写哪些英语句子、怎么检查、怎么下发、本机记住最近用过哪几句、审核记录怎么跟句子绑死**写死。屏幕上现在还是旧句。点头 ≠ 已换句。**AI 审稿 ≠ 人审完成。**

---

## 1. 审核人（诚实口径 · 说明书 §4 · C-11）

对外写「人审」必须有**点名**的母语/近母语审稿人。AI 预检不能顶替。TRACKER / PR / 对外 **一律不写**「人审完成」，只写 **「AI 审稿 + 契约检查」**。

| 语言 | 2026-11-02 状态 | 本 Brief 允许 | 禁止 |
|---|---|---|---|
| **英语** | PO 书面口头授权分析师担任审稿人。审稿人 = **Claude（AI）**，**非母语人工审**。授权日 **2026-11-02**。机器能核对措辞和语气；母语习语语感不能替代 | 英语句稿进本文件与将来 content JSON；点头后可进仓库跑 `check:companion-contract`；审核字段按 §4.1 落盘 | 标「人审完成」；把 AI 审写成母语人审；未经哈希匹配把句子当已审 |
| **日语** | **未点名** | **不扩**；冻表维持现网 1–3 句 | 机器翻译顶人审；口令「日语也扩到 8–12」未点名前 **不执行** |
| **中文** | 草稿档 | 可不写或只作对照，**不进** 可见池 / overlay | 对外当正式 |

本文件英语句状态一律：**Claude（AI）审稿（2026-11-02），未经母语人工审**。

**软待办（不阻塞第 4 步）**：正式对外发布或有真实用户前，请一位英语母语者抽查约 **10** 条。不整批重审。未完成抽查 **不得** 把 AI 审稿默认当成终审。

找到日语审核人后：可并行 ja，每子类型 **4–6**（产能不够）或 **8–12**（产能够）；另开补丁或本 Brief 修订，不在未点名前预支日语句。若届时审稿人不是母语者，文档须如实写，禁止写「母语人审」。

---

## 2. 目标与非目标

### 2.1 点头后实现 PR 要做

1. 英语句源进仓库（路径见 §4），每子类型 **8** 条（含现网锚句；未满 8 不得声称该池扩库完成；超过 12 须另一次 PO 书面）。每条带 §4.1 审核字段。  
2. `check:companion-contract` **扫该源文件**；邀请切片仍过 `AWAKEN_FORBIDDEN_COPY`。CI：**已审但无审稿人名字**、**哈希与正文不匹配**、**缺审核字段** → 报红。  
3. 近邻 `expect=allow` 样本 **5** 条进 [`companion-contract-samples.js`](../../scripts/companion-contract-samples.js)（§6）。  
4. 句包 overlay：**独立 PR 边界**；源在 repo；部署脚本**只发布** `reviewed: true` 且有审稿人名字且哈希匹配的句子；展示前对**填槽后最终串** `matchForbiddenPatterns`；非空则丢该句、回退冻表。客户端对未带完整审核标记或哈希不符的句子 **一律不用**。  
5. 本机键 `focus-tiger.companion-channel-recent-ids.v1` 进 [`FOCUS_TIGER_LOCAL_STORAGE_KEYS`](../../src/core/localStateKeys.js)（删除所有数据白名单）+ [`SHARED_RESOURCES.md`](../SHARED_RESOURCES.md)。**不进** T54 研究分享。**不进** 练习云备份 / 本地 Backup 导出。  
6. 取用：同一用户 · 同一通道 · 同一子类型 · 同一正式语言；连续 **N** 次不得抽刚抽过的模板 id；**N = ⌊该子类型可见条数 ÷ 2⌋**；去重按模板 id 不按填槽后字符串。  
7. 杀开关：`?tasteLayer=0` 或本切片 `overlayLive !== true` → 行为 = 现网冻表。第 1–3 步期间 **`overlayLive` 必须 false**。翻 `true` 见 §8 第 4 步，不得只靠口头纪律。

### 2.2 非目标

- 本 Brief 修订 PR **零 `src/`**。  
- 不开阶段 1、不写路径 A 池化实现、不开放倾诉生成。  
- 不加第五通道；不扩归来问候 / Quiet Line / Calm Action 全日池。到达通道**只扩** `MOMENT_WHISPER_ARRIVE`，不把 Calm Action Arrive 日池混进同一计数。  
- 不改邀请「要 / 先不用」按钮字（只扩 **PROMPT** 问句）。  
- 不新建可点击 UI 叠层、不改 Support / 付款。  
- 不把「句子变多」写成「提升体验」（尚无真实用户度量）。结束低语与到达池的期望见 §5.1 / §5.5：**防完全重复，不是增加内容**。

---

## 3. 不重复取用（实现锁）

| 项 | 锁 |
|---|---|
| 键名 | **`focus-tiger.companion-channel-recent-ids.v1`** |
| 形状 | `{ [channelId]: { [subtypeId]: { [locale]: string[] } } }` 只存模板 id 环 |
| N | `Math.floor(visibleCount / 2)`；8 条 → 4；不足 2 条 → 退回冻表锚句，不得现场生成 |
| 槽位 | `{minutes}` 与 `{minuteUnit}` 只由代码填；去重看模板 id |
| 重置 | 必须出现在 `FOCUS_TIGER_LOCAL_STORAGE_KEYS`；漏登 = `localStateKeyLiteralScan` 红（T60 同类） |
| 隔离 | 不得与日签 `recentIds` / Quiet Line 当日锁混用同一把锁 |

---

## 4. Overlay 双闸（说明书 §5.1.1 · 本 Brief 必填）

句包 overlay = 云端下发**已审固定句**，不是新的屏幕浮层。

| 闸 | 锁 |
|---|---|
| **源文件** | `focus-tiger/content/companion-channel-copy/en.json`（点头后实现 PR 创建）。禁止只在控制台改 D1。ja 文件本刀不建。 |
| **部署前** | `npm run check:companion-contract` 必须 `collectLiveStrings` 扫上列 JSON（实现时改 [`check-companion-contract.js`](../../scripts/check-companion-contract.js)）。Redeploy 口令「部署」；合入 ≠ 现网。部署脚本只收录 §4.1 完整且哈希匹配的句子。 |
| **展示前** | overlay 解析后、用户可见前：对**最终展示字符串**（含 `{minutes}` / `{minuteUnit}` 已填）调用 [`matchForbiddenPatterns`](../../scripts/companion-contract-forbidden.js)。命中 → 丢该句，回退该通道冻表锚句。缺审核标记或哈希不符 → 当未审，不用。 |
| **字段** | 品味层预取增加独立字段 `companionChannelCopy`（`schemaVersion: 1`）。**禁止**与 Quiet Line / Confide 句库 / Calm Action / YPE / 付款同一实现 PR。 |
| **未知 schema / 非法 key / 空包** | 整包丢弃，干净用冻表。 |
| **时机** | 并进已错峰的 `prefetchTasteLayer`；**禁止**开口当拍拉网。 |
| **上线闸** | `overlayLive: true` **不是**口头翻布尔。须 §4.1 机械约束齐 + §8 第 4 步书面 + 口令「部署」。在此之前 content 可进仓库跑 CI，客户端不得采用 overlay。 |

填槽流水线：草稿/已审模板 → 模板过禁词表 → 开口时代码填槽（含单复数）→ 最终串再过同一张表 → 不过则冻表。

### 4.1 句级审核字段（机械闸 · 强制）

content JSON **每条**句子对象：

| 字段 | 锁 |
|---|---|
| `id` | 稳定模板 id |
| `text` | 模板正文（可含 `{minutes}` `{minuteUnit}`；**禁止**硬写 `minutes` 当单位） |
| `reviewed` | 布尔；未审不得发布 |
| `reviewer` | 非空字符串。本批英语 = **`Claude (AI)`** |
| `reviewerType` | **`ai`** / `native-human` / `non-native-human`。本批 = **`ai`** |
| `reviewedOn` | ISO 日 **`2026-11-02`**（本批） |
| `contentHash` | **SHA-256**（hex），对 `text` 的 UTF-8 NFC 规范化字节。**任何字符改动 → 哈希不匹配 → 审核自动作废**，须重审后重写本行字段 |

CI：

- `reviewed: true` 且（无 `reviewer` / `reviewer` 空白）→ **红**。  
- `reviewed: true` 且缺 `reviewerType` / `reviewedOn` / `contentHash` → **红**。  
- `contentHash` ≠ 当前 `text` 的 SHA-256 → **红**（防悄悄改句绕过审核）。  
- 部署脚本与客户端：**只用** `reviewed === true` ∧ 审稿人名字非空 ∧ 哈希匹配的句子。

### 4.2 `{minutes}` 单复数（强制）

- 模板 **禁止** 写死 `minutes` 当英语单位。用 `{minuteUnit}`（或实现时等价的单一填槽，须单测锁最终串）。  
- 代码按数量选：`1` → `minute`；其余（含 0、25、90）→ `minutes`。  
- 最短结束低语 30 秒就会进「约 1 分钟」，**1 很常见**。  
- 单测填槽样例：**1 / 25 / 90**。必须断言最终串含 **`1 minute`**（禁止 `1 minutes`），以及 `25 minutes` / `90 minutes`。**最终串同样过禁词表**。

---

## 5. 英语句稿（每子类型 8 条 · 含锚 · Claude AI 审稿 2026-11-02 · 非母语人工审）

id 稳定后实现不得改义只改标点。**A** = 现网锚，必须保留为冻表兜底。改 `text` 须重算 `contentHash` 并重审。

### 5.0 锚句「要」之后的实际流程（强制写清）

现网暂停锚句 `AWAKEN_INVITE_PAUSE_PROMPT`：**Three breaths, or feel the ground?**

| 用户动作 | 现网实际 |
|---|---|
| 点 **要**（en：Yes） | **不是**在「三次呼吸」与「感受地面」之间二选一。`AwakenInviteUI` 把 `kind === 'pause'` 交给 `onAccept` → `recoverResetPracticeUI.show(RESET_ROUTES.GROUND)`。始终打开现成的 **感受地面** 半高卡（脚底 / 座位 / 此刻），**不**打开已删除的呼吸路由，**不**打开环顾四周。 |
| 点 **先不用** 或 10s 自消 | 邀请退下；不自动开练习（**SB-20**）。 |

因此锚句里的 **or** 是一句冻表观察式问法，**不是**两按钮流程。本 Brief **冻结该锚句不动**。暂停池 **新句**一律写成**单一提议的是非问句**，不把「拒绝 / 继续坐」写进问句，以免和固定的「要 / 先不用」对不上。本刀 **不改** 点「要」后的 GROUND 路由。

### 5.1 结束低语 · 观察分钟（单池 8）

冻表键仍可叫 `SESSION_END_OBSERVED_MINUTES`（锚）；池内其余用 `SESSION_END_OBSERVED_MINUTES_2…8`。只填 `{minutes}` + `{minuteUnit}`。

**期望（诚实）**：8 条几乎是同义复述（约 N 分钟 / 这坐 / 刚才）。这一池的作用是防止「文字完全一样」的单调，**不是**增加内容。禁止把本池写成体验升级。

| id | en（Claude AI 审稿 · 2026-11-02） |
|---|---|
| `SESSION_END_OBSERVED_MINUTES` **A** | About {minutes} {minuteUnit} this sitting. |
| `SESSION_END_OBSERVED_MINUTES_2` | This sitting: about {minutes} {minuteUnit}. |
| `SESSION_END_OBSERVED_MINUTES_3` | About {minutes} {minuteUnit} just now. |
| `SESSION_END_OBSERVED_MINUTES_4` | The sitting lasted about {minutes} {minuteUnit}. |
| `SESSION_END_OBSERVED_MINUTES_5` | Around {minutes} {minuteUnit} in this sitting. |
| `SESSION_END_OBSERVED_MINUTES_6` | About {minutes} {minuteUnit} of sitting. |
| `SESSION_END_OBSERVED_MINUTES_7` | This time: about {minutes} {minuteUnit}. |
| `SESSION_END_OBSERVED_MINUTES_8` | Sitting time: about {minutes} {minuteUnit}. |

相对 #1538 草稿的审稿改动：`_5` *this sit* → *this sitting*；`_6` 去掉 *on the cushion*（桌面端未必坐垫）；`_7` *round* → *this time*（避免游戏计分联想）。

禁止：疗效、打分、内部标签、追问、「你完成得很好」。

### 5.2 专注中邀请 · 暂停（子类型 8 · 不可与延长互换）

只改 `AWAKEN_INVITE_PAUSE_PROMPT*`。Yes/No 键不扩。除锚句外，**一律单一提议是非问句**。

| id | en（Claude AI 审稿 · 2026-11-02） |
|---|---|
| `AWAKEN_INVITE_PAUSE_PROMPT` **A · 冻结** | Three breaths, or feel the ground? |
| `AWAKEN_INVITE_PAUSE_PROMPT_2` | A short pause? |
| `AWAKEN_INVITE_PAUSE_PROMPT_3` | Feel the ground for a moment? |
| `AWAKEN_INVITE_PAUSE_PROMPT_4` | Three quiet breaths, if you wish? |
| `AWAKEN_INVITE_PAUSE_PROMPT_5` | Rest here for a moment? |
| `AWAKEN_INVITE_PAUSE_PROMPT_6` | A pause, if you'd like one? |
| `AWAKEN_INVITE_PAUSE_PROMPT_7` | A few breaths here? |
| `AWAKEN_INVITE_PAUSE_PROMPT_8` | Feel the seat under you? |

禁止：催促、愧疚账、不可拒绝、自动开练习、诊断；禁止把「继续坐 / 先不用」写进问句。

### 5.3 专注中邀请 · 延长（子类型 8）

同样单一提议是非问句。点「要」= 现网 **+5 分钟**（`applyFocusSitAdjust` · `add`），不换句不换流程。

| id | en（Claude AI 审稿 · 2026-11-02） |
|---|---|
| `AWAKEN_INVITE_EXTEND_PROMPT` **A** | Sit a little longer? |
| `AWAKEN_INVITE_EXTEND_PROMPT_2` | Stay for a few more minutes? |
| `AWAKEN_INVITE_EXTEND_PROMPT_3` | Continue sitting a little? |
| `AWAKEN_INVITE_EXTEND_PROMPT_4` | A little longer, if you wish? |
| `AWAKEN_INVITE_EXTEND_PROMPT_5` | Stay with it a little longer? |
| `AWAKEN_INVITE_EXTEND_PROMPT_6` | Sit on for a short while? |
| `AWAKEN_INVITE_EXTEND_PROMPT_7` | Another few minutes here? |
| `AWAKEN_INVITE_EXTEND_PROMPT_8` | Keep sitting a little longer? |

相对 #1538 草稿：`_5` 去掉机上广播腔 *Remain seated*；`_8` *this sit* → *Keep sitting*。

### 5.4 离开后再聚焦（单池 8）

| id | en（Claude AI 审稿 · 2026-11-02） |
|---|---|
| `REFOCUS_ACKNOWLEDGE_1` **A** | Attention wandered for a while. Now it has returned here. |
| `REFOCUS_ACKNOWLEDGE_2` **A** | That moment has passed. Attention is back with this breath. |
| `REFOCUS_ACKNOWLEDGE_3` **A** | There was a moment elsewhere. Now there is this moment of return. |
| `REFOCUS_ACKNOWLEDGE_4` | Attention left for a while. It is here again. |
| `REFOCUS_ACKNOWLEDGE_5` | Attention was away for a stretch. It is back with this breath. |
| `REFOCUS_ACKNOWLEDGE_6` | For a while, attention was elsewhere. It is back here now. |
| `REFOCUS_ACKNOWLEDGE_7` | Attention moved around. It has come back to this place. |
| `REFOCUS_ACKNOWLEDGE_8` | Some time was spent elsewhere. Now there is this return. |

`_8` 略显生硬，审稿结论：**保留，无害**。禁止：「你又走神了」、诊断、加码成邀请。

### 5.5 到达后安静句 · 仅 Moment（单池 8）

不是 Calm Action Arrive 日池。**8 条全部通过。** 其中几条只是换词不换意。这一池的价值是避免文字完全重复，**不是**增加内容。

| id | en（Claude AI 审稿 · 2026-11-02） |
|---|---|
| `MOMENT_WHISPER_ARRIVE` **A** | A soft arriving. |
| `MOMENT_WHISPER_ARRIVE_2` | Here, for now. |
| `MOMENT_WHISPER_ARRIVE_3` | Arriving, quietly. |
| `MOMENT_WHISPER_ARRIVE_4` | This moment of arriving. |
| `MOMENT_WHISPER_ARRIVE_5` | Softly here. |
| `MOMENT_WHISPER_ARRIVE_6` | A quiet arrival. |
| `MOMENT_WHISPER_ARRIVE_7` | Arrived, without hurry. |
| `MOMENT_WHISPER_ARRIVE_8` | Here, gently. |

---

## 6. 近邻放行样本（实现 PR 写入检查器 · 5 条 allow）

| 建议 id | utterance | 方向 |
|---|---|---|
| `cc-r-allow-minutes-25` | About 25 minutes this sitting. | 填槽后练习事实，防 C-02 误伤 |
| `cc-r-allow-refocus-away` | For a while, attention was elsewhere. It is back here now. | 观察离座，防 C-01 / C-04 误伤 |
| `cc-r-allow-pause-short` | A short pause? | 可拒绝邀请；**单一提议**是非问（替换原 `cc-r-allow-pause-or` 的 *or keep sitting*） |
| `cc-r-allow-arrive-soft` | A soft arriving. | 到达许可，非打分 |
| `cc-r-allow-extend-wish` | A little longer, if you wish? | 可拒绝延长 |

另：单测须有填槽最终串 **`About 1 minute this sitting.`**（禁词表同样扫）。该条可只在单测、不必占 allow 五席。

维持坏样本 / 放行样本两比率各 1.0。不把危机句塞进本集。未扩日语 → 不假装日文样本已覆盖。

通过检查 **不等于** 陪伴已验证，也 **不等于** 阶段 1，也 **不等于** 人审完成。

---

## 7. 冲突扫描

对照场景 B（离开后再聚焦）、Y（结束低语）、觉照邀请、到达 Moment 安静句、倾诉、研究分享、陪伴契约、句包 overlay、防剽窃层。**不**对照 Calm Action Arrive 日池当本通道。

| 轴 | 结论 |
|---|---|
| **强度** | 无新点击、无新开口时刻。暂停点「要」仍只开现成 GROUND 卡，不比 Sit / 危机转介更重。新问句改成单一提议，与固定两钮对齐，认知更轻。 |
| **语气** | 观察式、可拒绝；禁词表不另开更松闸。AI 审稿 ≠ 正式母语气已过关。 |
| **职责** | 扩检索库，不替代安全线，不在到达瞬间加载模型。句包 overlay 走防剽窃层既有尺，不进支付云。不把暂停问句变成二选一路由。 |

无未决冲突。实现 PR 改 picker 时须再扫一次（同一三轴）。

---

## 变体矩阵

| 变体 | 入口 / 前置 | 预期 | 自动化 |
|---|---|---|---|
| en · overlayLive false / 审核字段不齐 | 四通道任一开口 | **仍是现网锚句**（1 或 3 条） | 单测：overlay 关闭 = 冻表 |
| en · overlayLive true 且审核齐且哈希匹配且有网 | 同上 | 从 8 条池取一句；连续 N 次不重复模板 id | 单测 recent-id + 禁词 + 审核字段 |
| en · 没网 / 未知 schema / 禁词命中 / 哈希不符 | 同上 | 冻表锚句 | 单测丢 overlay |
| ja | 同上 | **现网冻表规模**；不读 en 池 | 单测 ja 不扩 |
| zh | 同上 | 草稿冻表；不进 overlay | 单测 |
| 暂停 vs 延长 | Focusing 邀请 | 两池不可互换；暂停「要」= GROUND；延长「要」= +5 分钟 | 单测 subtype |
| 暂停锚句 or | 点「要」 | **仍只开 GROUND**，不分支 | 既有 `e2e/awaken-invite.spec.js`；本刀不改路由 |
| 结束低语 1 / 25 / 90 | Rise ≥30s | `1 minute` / `25 minutes` / `90 minutes`；骨架同一模板 id | 单测填槽后再扫禁词 |
| 宽屏 / 窄屏 / Electron | 同一入口 | **无分叉** | 记无分叉 |
| `?tasteLayer=0` | 任意 | 冻表 | 既有 taste 单测扩展 |
| 删除所有数据 | 设置重置 | recent-id 键被清 | `localStateKeyLiteralScan` + 清库名单 |
| `reviewed: true` 无名字 | CI | **红** | `check:companion-contract` |
| 改 text 不改 hash | CI / 客户端 | **红** / 不用该句 | 单测哈希 |

## 点击反馈（0–1 秒）

本次不新增可点击控件。现网邀请 Yes/No、低语点消、toast 自消保持原样。暂停点「要」0–1 秒内仍应看到现成感受地面半高卡（既有 T51 路径）。

本次无可点击交互改动，点击反馈节跳过。

## 边缘状态

| 边缘 | 预期 |
|---|---|
| 模型未 ready / 冷启动 | **无关**：本刀不加载模型 |
| overlay 拉取失败 / 慢 | 不挡 Sit / 开口；用冻表 |
| 审核字段不齐 / 哈希不符 | 当未审；用户只见冻表 |
| 池条数 &lt; 2 | 退回锚句 |
| 填槽后命中禁词 | 丢该句，冻表 |
| `1 minutes` | **禁止**；单测锁 `1 minute` |
| 已购 / 付款 | 不触及；Support FAB 不受影响 |

## 共用机制核对

本次不触及 overlayBusy / HUD 呼吸驱动 / z≥17 遮罩 / 新建可点击叠层，核对跳过。  
（句包 overlay 不是 `#ui-overlay` 新卡；不登记 `OVERLAY_SOURCE_CONTRACTS` 新行。点「要」后的 GROUND 卡是现网 `#recover-reset-practice`，本刀不改其 z。）

## 后台网络（实现 PR 必答；本 Brief 先锁口径）

1. **时机**：并进已错峰 `prefetchTasteLayer`（精灵预加载 + 欢迎/Idle 之后）。禁止与 Arrival / Honesty / Reflection 叠化抢窗。禁止开口当拍 `fetch`。  
2. **写盘**：JSON 相同则不另存 overlay 副本，只更新 cloud-ok。recent-id 只在开口取用后写模板 id。  
3. **慢网**：失败不得挡 Sit / 开口；低速网看 Idle 呼吸（TRACKER 人工）。

不涉及本 Brief 文档 PR 的后台请求。

---

## 8. 实现顺序（点头后 · 新 Chat）

1. content JSON（§5 句稿 + §4.1 审核字段与哈希）+ 检查器扫描 + allow 样本 + recent-id 白名单（用户仍见冻表）。  
2. picker + `{minutes}` 单复数填槽后再扫（仍 `overlayLive: false`）。  
3. overlay 管道（独立 PR）但仍 `overlayLive: false`。客户端丢弃未审 / 哈希不符句。  
4. **`overlayLive: true`**：仅当第 1–3 步已落、哈希匹配、杀开关可用，**且**你另一次书面说「部署」。AI 审稿已授权本批英语，**仍禁止**对外写「人审完成」。母语者抽 10 条是软待办，**不阻塞**第 4 步。

口令「按本 Brief 开工」= 只执行第 1–3 步，**不**执行第 4 步。  
口令「开始阶段 1 红队」「按预生成池评估写实现 Brief」→ **不执行**。

## 9. 明确不做

- 本修订 PR 不改 `src/`、不 Redeploy、不上 overlay。  
- 不改 GLOSSARY / SCHEDULING。  
- 不启动 T54。不把 AI 审稿写成母语人审。  
- 不改暂停锚句，不改点「要」后的 GROUND 路由。  
- 日语冻表维持。阶段 1 继续禁止。
