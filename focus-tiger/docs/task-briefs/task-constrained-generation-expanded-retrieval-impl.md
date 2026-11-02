# Task Brief · 四通道英语句稿 + 句包 overlay（R · B 类）

> **状态**：**待 PO 点头**。点头前 **禁止** 改 `focus-tiger/src/**`、**禁止** 上线 overlay、**禁止** 标「人审完成」。  
> **类**：**B 类**（会改用户看得见的陪伴句；本文件先锁规格与英语草稿）。  
> **父页**：[扩库说明书 #1537](task-constrained-generation-expanded-retrieval-spec.md) · [对比说明 #1533](task-constrained-generation-pool-vs-expanded-retrieval.md)。  
> **拍板前提**：说明书已条件点头；本页点头后才允许实现 PR。实现 PR **仍零用户可见新句**，直到英语审核人**点名签字** 且 overlay 杀开关允许。  
> **代号**：待治理登记。不占用 **T54** / **T68** / **T70** / **T73**。本 PR **不改** [`GLOSSARY.md`](../GLOSSARY.md) / [`SCHEDULING_GLOSSARY.md`](../SCHEDULING_GLOSSARY.md)。  
> **不是**：阶段 1。**不是** 本机预生成池。**不是** 倾诉开放生成。**不是** 个性化骨架（说明书 §7 仍暂存）。**不是** UI 新叠层（句包 overlay ≠ overlayBusy 浮层）。

---

## 0. 大白话

说明书已经定了：这四条短陪伴话先不要让模型现场编，先把英语句子加到每条路大约八句，审完再用云端句包发下去；没网还是用现在那一两句。

这一份把**要写哪些英语句子、怎么检查、怎么下发、本机记住最近用过哪几句**写死。屏幕上现在还是旧句。点头 ≠ 已换句。授权 Agent 写稿 ≠ 母语人审。

## 1. 审核人（诚实口径 · 说明书 §4）

对外写「人审」必须有**点名**的母语/近母语审稿人。AI 预检不能顶替。

| 语言 | 2026-11-02 状态 | 本 Brief 允许 | 禁止 |
|---|---|---|---|
| **英语** | PO 说「审核人授权给 Agent」= **委托起草 + 仓库 CI**，**不是** §4.1 点名母语审稿人 | 英语草稿进本文件；点头后可进仓库 content 跑 `check:companion-contract` | 标「人审完成」；上 overlay；合 main 当正式句 |
| **日语** | **未点名** | **不扩**；冻表维持现网 1–3 句 | 机器翻译顶人审；口令「日语也扩到 8–12」未点名前 **不执行** |
| **中文** | 草稿档 | 可不写或只作对照，**不进** 可见池 / overlay | 对外当正式 |

本文件英语句状态一律：**作者 + AI 预检，未经母语审稿**。

找到日语审核人后：可并行 ja，每子类型 **4–6**（产能不够）或 **8–12**（产能够）；另开补丁或本 Brief 修订，不在未点名前预支日语句。

## 2. 目标与非目标

### 2.1 点头后实现 PR 要做

1. 英语句源进仓库（路径见 §4），每子类型 **8** 条（含现网锚句；未满 8 不得声称该池扩库完成；超过 12 须另一次 PO 书面）。  
2. `check:companion-contract` **扫该源文件**；邀请切片仍过 `AWAKEN_FORBIDDEN_COPY`。  
3. 近邻 `expect=allow` 样本 **5** 条进 [`companion-contract-samples.js`](../../scripts/companion-contract-samples.js)（§6）。  
4. 句包 overlay：**独立 PR 边界**；源在 repo；部署前同表扫描；展示前对**填槽后最终串** `matchForbiddenPatterns`；非空则丢该句、回退冻表。  
5. 本机键 `focus-tiger.companion-channel-recent-ids.v1` 进 [`FOCUS_TIGER_LOCAL_STORAGE_KEYS`](../../src/core/localStateKeys.js)（删除所有数据白名单）+ [`SHARED_RESOURCES.md`](../SHARED_RESOURCES.md)。**不进** T54 研究分享。**不进** 练习云备份 / 本地 Backup 导出。  
6. 取用：同一用户 · 同一通道 · 同一子类型 · 同一正式语言；连续 **N** 次不得抽刚抽过的模板 id；**N = ⌊该子类型可见条数 ÷ 2⌋**；去重按模板 id 不按填槽后字符串。  
7. 杀开关：`?tasteLayer=0` 或本切片 `overlayLive !== true` → 行为 = 现网冻表。人审未点名 → **`overlayLive` 必须 false**。

### 2.2 非目标

- 本 Brief PR **零 `src/`**。  
- 不开阶段 1、不写路径 A 池化实现、不开放倾诉生成。  
- 不加第五通道；不扩归来问候 / Quiet Line / Calm Action 全日池。到达通道**只扩** `MOMENT_WHISPER_ARRIVE`，不把 Calm Action Arrive 日池混进同一计数。  
- 不改邀请「要 / 先不用」按钮字（只扩 **PROMPT** 问句）。  
- 不新建可点击 UI 叠层、不改 Support / 付款。  
- 不把「句子变多」写成「提升体验」（尚无真实用户度量）。

---

## 3. 不重复取用（实现锁）

| 项 | 锁 |
|---|---|
| 键名 | **`focus-tiger.companion-channel-recent-ids.v1`** |
| 形状 | `{ [channelId]: { [subtypeId]: { [locale]: string[] } } }` 只存模板 id 环 |
| N | `Math.floor(visibleCount / 2)`；8 条 → 4；不足 2 条 → 退回冻表锚句，不得现场生成 |
| 槽位 | `{minutes}` 只由代码填；去重看模板 id |
| 重置 | 必须出现在 `FOCUS_TIGER_LOCAL_STORAGE_KEYS`；漏登 = `localStateKeyLiteralScan` 红（T60 同类） |
| 隔离 | 不得与日签 `recentIds` / Quiet Line 当日锁混用同一把锁 |

---

## 4. Overlay 双闸（说明书 §5.1.1 · 本 Brief 必填）

句包 overlay = 云端下发**已审固定句**，不是新的屏幕浮层。

| 闸 | 锁 |
|---|---|
| **源文件** | `focus-tiger/content/companion-channel-copy/en.json`（点头后实现 PR 创建）。禁止只在控制台改 D1。ja 文件本刀不建。 |
| **部署前** | `npm run check:companion-contract` 必须 `collectLiveStrings` 扫上列 JSON（实现时改 [`check-companion-contract.js`](../../scripts/check-companion-contract.js)）。Redeploy 口令「部署」；合入 ≠ 现网。 |
| **展示前** | overlay 解析后、用户可见前：对**最终展示字符串**（含 `{minutes}` 已填）调用 [`matchForbiddenPatterns`](../../scripts/companion-contract-forbidden.js)。命中 → 丢该句，回退该通道冻表锚句。 |
| **字段** | 品味层预取增加独立字段 `companionChannelCopy`（`schemaVersion: 1`）。**禁止**与 Quiet Line / Confide 句库 / Calm Action / YPE / 付款同一实现 PR。 |
| **未知 schema / 非法 key / 空包** | 整包丢弃，干净用冻表。 |
| **时机** | 并进已错峰的 `prefetchTasteLayer`；**禁止**开口当拍拉网。 |
| **上线闸** | `overlayLive: true` **仅当** Brief §1 英语审核人已点名签字。在此之前 content 可进仓库跑 CI，客户端不得采用 overlay。 |

填槽流水线：草稿/人审模板 → 模板过禁词表 → 开口时代码填槽 → 最终串再过同一张表 → 不过则冻表。

结束低语须单测填槽样例：**1 / 25 / 90** 分钟。

---

## 5. 英语句稿（每子类型 8 条 · 含锚 · 未经母语审稿）

id 稳定后实现不得改义只改标点。**A** = 现网锚，必须保留为冻表兜底。

### 5.1 结束低语 · 观察分钟（单池 8）

冻表键仍可叫 `SESSION_END_OBSERVED_MINUTES`（锚）；池内其余用 `SESSION_END_OBSERVED_MINUTES_2…8`。只填 `{minutes}`。

| id | en（草稿 · AI 预检） |
|---|---|
| `SESSION_END_OBSERVED_MINUTES` **A** | About {minutes} minutes this sitting. |
| `SESSION_END_OBSERVED_MINUTES_2` | This sitting: about {minutes} minutes. |
| `SESSION_END_OBSERVED_MINUTES_3` | About {minutes} minutes just now. |
| `SESSION_END_OBSERVED_MINUTES_4` | The sitting lasted about {minutes} minutes. |
| `SESSION_END_OBSERVED_MINUTES_5` | Around {minutes} minutes in this sit. |
| `SESSION_END_OBSERVED_MINUTES_6` | About {minutes} minutes on the cushion. |
| `SESSION_END_OBSERVED_MINUTES_7` | This round: about {minutes} minutes. |
| `SESSION_END_OBSERVED_MINUTES_8` | Sitting time: about {minutes} minutes. |

禁止：疗效、打分、内部标签、追问、「你完成得很好」。

### 5.2 专注中邀请 · 暂停（子类型 8 · 不可与延长互换）

只改 `AWAKEN_INVITE_PAUSE_PROMPT*`。Yes/No 键不扩。

| id | en（草稿 · AI 预检） |
|---|---|
| `AWAKEN_INVITE_PAUSE_PROMPT` **A** | Three breaths, or feel the ground? |
| `AWAKEN_INVITE_PAUSE_PROMPT_2` | A short pause, or keep sitting? |
| `AWAKEN_INVITE_PAUSE_PROMPT_3` | Feel the ground for a moment? |
| `AWAKEN_INVITE_PAUSE_PROMPT_4` | Three quiet breaths, if you wish? |
| `AWAKEN_INVITE_PAUSE_PROMPT_5` | Rest the sit, or stay with it? |
| `AWAKEN_INVITE_PAUSE_PROMPT_6` | A pause is here, if you want it. |
| `AWAKEN_INVITE_PAUSE_PROMPT_7` | A few breaths here, or continue? |
| `AWAKEN_INVITE_PAUSE_PROMPT_8` | Feel the seat under you, or sit on? |

禁止：催促、愧疚账、不可拒绝、自动开练习、诊断。

### 5.3 专注中邀请 · 延长（子类型 8）

| id | en（草稿 · AI 预检） |
|---|---|
| `AWAKEN_INVITE_EXTEND_PROMPT` **A** | Sit a little longer? |
| `AWAKEN_INVITE_EXTEND_PROMPT_2` | Stay for a few more minutes? |
| `AWAKEN_INVITE_EXTEND_PROMPT_3` | Continue sitting a little? |
| `AWAKEN_INVITE_EXTEND_PROMPT_4` | A little longer, if you wish? |
| `AWAKEN_INVITE_EXTEND_PROMPT_5` | Remain seated a while more? |
| `AWAKEN_INVITE_EXTEND_PROMPT_6` | Sit on for a short while? |
| `AWAKEN_INVITE_EXTEND_PROMPT_7` | Another few minutes here? |
| `AWAKEN_INVITE_EXTEND_PROMPT_8` | Keep this sit a little longer? |

### 5.4 离开后再聚焦（单池 8）

| id | en（草稿 · AI 预检） |
|---|---|
| `REFOCUS_ACKNOWLEDGE_1` **A** | Attention wandered for a while. Now it has returned here. |
| `REFOCUS_ACKNOWLEDGE_2` **A** | That moment has passed. Attention is back with this breath. |
| `REFOCUS_ACKNOWLEDGE_3` **A** | There was a moment elsewhere. Now there is this moment of return. |
| `REFOCUS_ACKNOWLEDGE_4` | Attention left for a while. It is here again. |
| `REFOCUS_ACKNOWLEDGE_5` | A stretch of time was away. This breath is back. |
| `REFOCUS_ACKNOWLEDGE_6` | There was a while away from here. Attention is back. |
| `REFOCUS_ACKNOWLEDGE_7` | Attention moved around. It has come back to this place. |
| `REFOCUS_ACKNOWLEDGE_8` | Some time was spent elsewhere. Now there is this return. |

禁止：「你又走神了」、诊断、加码成邀请。

### 5.5 到达后安静句 · 仅 Moment（单池 8）

不是 Calm Action Arrive 日池。

| id | en（草稿 · AI 预检） |
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
| `cc-r-allow-refocus-away` | There was a while away from here. Attention is back. | 观察离座，防 C-01 / C-04 误伤 |
| `cc-r-allow-pause-or` | A short pause, or keep sitting? | 可拒绝邀请 |
| `cc-r-allow-arrive-soft` | A soft arriving. | 到达许可，非打分 |
| `cc-r-allow-extend-wish` | A little longer, if you wish? | 可拒绝延长 |

维持坏样本 / 放行样本两比率各 1.0。不把危机句塞进本集。未扩日语 → 不假装日文样本已覆盖。

通过检查 **不等于** 陪伴已验证，也 **不等于** 阶段 1。

---

## 7. 冲突扫描

对照场景 B（离开后再聚焦）、Y（结束低语）、觉照邀请、到达 Moment 安静句、倾诉、研究分享、陪伴契约、句包 overlay、防剽窃层。**不**对照 Calm Action Arrive 日池当本通道。

| 轴 | 结论 |
|---|---|
| **强度** | 无新点击、无新开口时刻。只是同一通道里多几句将来已审的固定句。不比 Sit / 危机转介更重。 |
| **语气** | 草稿保持观察式、可拒绝；禁词表不另开更松闸。母语审未做 → 不得当正式语气已过关。 |
| **职责** | 扩检索库，不替代安全线，不在到达瞬间加载模型。句包 overlay 走防剽窃层既有尺，不进支付云。 |

无未决冲突。实现 PR 改 picker 时须再扫一次（同一三轴）。

---

## 变体矩阵

| 变体 | 入口 / 前置 | 预期 | 自动化 |
|---|---|---|---|
| en · overlayLive false / 未人审 | 四通道任一开口 | **仍是现网锚句**（1 或 3 条） | 单测：overlay 关闭 = 冻表 |
| en · 人审点名且 overlayLive true 且有网 | 同上 | 从 8 条池取一句；连续 N 次不重复模板 id | 单测 recent-id + 禁词 |
| en · 没网 / 未知 schema / 禁词命中 | 同上 | 冻表锚句 | 单测丢 overlay |
| ja | 同上 | **现网冻表规模**；不读 en 池 | 单测 ja 不扩 |
| zh | 同上 | 草稿冻表；不进 overlay | 单测 |
| 暂停 vs 延长 | Focusing 邀请 | 两池不可互换 | 单测 subtype |
| 结束低语 1 / 25 / 90 分钟 | Rise ≥30s | 只替换数字，骨架同一模板 id | 单测填槽后再扫禁词 |
| 宽屏 / 窄屏 / Electron | 同一入口 | **无分叉** | 记无分叉 |
| `?tasteLayer=0` | 任意 | 冻表 | 既有 taste 单测扩展 |
| 删除所有数据 | 设置重置 | recent-id 键被清 | `localStateKeyLiteralScan` + 清库名单 |

## 点击反馈（0–1 秒）

本次不新增可点击控件。现网邀请 Yes/No、低语点消、toast 自消保持原样。

本次无可点击交互改动，点击反馈节跳过。

## 边缘状态

| 边缘 | 预期 |
|---|---|
| 模型未 ready / 冷启动 | **无关**：本刀不加载模型 |
| overlay 拉取失败 / 慢 | 不挡 Sit / 开口；用冻表 |
| 人审未点名 | overlayLive 假；用户只见冻表 |
| 池条数 &lt; 2 | 退回锚句 |
| 填槽后命中禁词 | 丢该句，冻表 |
| 已购 / 付款 | 不触及；Support FAB 不受影响 |

## 共用机制核对

本次不触及 overlayBusy / HUD 呼吸驱动 / z≥17 遮罩 / 新建可点击叠层，核对跳过。  
（句包 overlay 不是 `#ui-overlay` 新卡；不登记 `OVERLAY_SOURCE_CONTRACTS` 新行。）

## 后台网络（实现 PR 必答；本 Brief 先锁口径）

1. **时机**：并进已错峰 `prefetchTasteLayer`（精灵预加载 + 欢迎/Idle 之后）。禁止与 Arrival / Honesty / Reflection 叠化抢窗。禁止开口当拍 `fetch`。  
2. **写盘**：JSON 相同则不另存 overlay 副本，只更新 cloud-ok。recent-id 只在开口取用后写模板 id。  
3. **慢网**：失败不得挡 Sit / 开口；低速网看 Idle 呼吸（TRACKER 人工）。

不涉及本 Brief 文档 PR 的后台请求。

---

## 8. 实现顺序（点头后 · 新 Chat）

1. content JSON + 检查器扫描 + allow 样本 + recent-id 白名单（用户仍见冻表）。  
2. picker + 填槽后再扫（仍 overlayLive false）。  
3. overlay 管道（独立 PR）但仍 `overlayLive: false`。  
4. 英语审核人**点名签字**后，另一次书面才允许 `overlayLive: true` + 口令「部署」。

口令「按本 Brief 开工」= 只执行第 1–3 步，**不**执行第 4 步。  
口令「开始阶段 1 红队」「按预生成池评估写实现 Brief」→ **不执行**。

## 9. 明确不做

- 本 PR 不改 `src/`、不 Redeploy、不上 overlay。  
- 不改 GLOSSARY / SCHEDULING。  
- 不启动 T54。不把 Agent 授权读成母语人审。
