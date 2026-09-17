# Task Brief · L3 情绪/反思 Prompt 重写

> **状态（2026-09-18）**：沙盒三轮已跑（生产 **未改**）。A/B 互相让位；独立禁风景层压住爪子/青苔/「空气是…」，泄漏改成墙/空间/微风/停顿。仍不足以上线。  
> **任务线**：Epic [#639](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/639) Confide · 切片 [#823](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/823)  
> **前置**：Read Hybrid `memory_list` 误判已由 [#822](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/822) 处理。本 Brief **禁止**再改 gloss / `confideEmotionKeywords.js`。  
> **生产锚点**：`focus-tiger/desktop/companion/l2Persona.js` · `buildCompanionL2Prompt`（现网仍含「Name at least one concrete word…」与禁风景句）。  
> **实验室**：`/tmp/ft-l0-l3-observe-b-lab.mjs` · `compare-1789671570533.json`（baseline+B）· `compare-1789671689159.json`（A）· `compare-1789672356967.json`（B-neg+A-neg）

---

## 一、问题重述

当前 L3 观察句受两条 **Qwen 1.7B 时代**约束同时支配：

1. **「点至少一个关键词」**（commit `09bb19a4`，2026-09-04）——为压制 `Still watching.` 一类空转。
2. **禁风景 / 禁空在场**（更早扇出；账本「山水清风」行 / TRACKER「不得用风景/天气代替听见」）——防止河山/风/光逃避正面回应。

两条各自挡一种坏结果，叠在 **Gemma4-E4B** 上会互相打架，把模型逼进窄缝：

| 场景 | 表现 | 根因 |
|---|---|---|
| 护栏都在 | `The mind is not here.` / `This morning brought a change.` | 抠字面词复述，语法对但没接住情绪 |
| 去掉「点一个词」 | `The air around me feels still.` / `A small twitch moves one ear.` | 退回风景/空在场 |

**结论**：不是删一条就能好。需要一套新规则，而不是再叠词表。

---

## 二、设计目标

1. **不复述**用户原句字面词当主干（避免 `mind is not here` 换词不推进）。
2. **不滑向**风景/空在场意象。
3. **不靠**「必须抓关键词」拐杖——依赖 Gemma4 语义，而不是硬指标。
4. **保留** Confide 调性：观察者/陪伴者，不是治疗师共情分析，也不是纯客观报告。
5. **显式挡住第三种坏输出**：meta 陈述式空话（见 §4.1）。

---

## 三、候选方案（对照实验，非定论）

### 方案 A：从「点关键词」换成「点情绪/状态的推断」

要求模型推断一个**具体状态**（禁止直接说 depression 等诊断词），再围绕该推断写一句观察。

例：`I'm here, but my mind really isn't.`  
方向（非最终文案）：`Aning notices the body stay while the attention drifts elsewhere.`

**风险**：推断错方向比无意义复述更糟。对照实验须记误判率。

### 方案 B：禁止清单 + 允许清单（减法）

不再规定「必须点一个词 / 必须推断情绪」。

- **禁止**：把用户原句名词/动词当回应主干；风景/天气/动物意象；「我注意到你说了 X」字面框架；**`The X is a Y.` 抽取主语 + 抽象系表**。
- **允许**：陪伴者视角的一句短观察；状态变化；轻度追问；语气克制。

改动小于 A；可能只解决「不该说什么」。

### 方案 C：先分类再生成（后备）

先判「情绪自述 / 行为习惯 / 状态变化」，再配短 prompt 分支。复杂度高，易与 Read Hybrid 路由叠层。**首轮不做。**

**首轮实验顺序（已锁）**：先跑 **方案 B**，不够再用 A 的推断机制。C 不进首轮。

---

## 四、对照实验设计（沙盒 · 不改生产）

### 4.1 三种坏输出（须逐句标注）

| 坏结果类型 | 示例 | 特征 |
|---|---|---|
| 字面复读 | `The mind is not here.` | 复述原句词，语义尚可对齐 |
| 风景/空在场 | `The air around me feels still.` | 逃向意象 |
| **meta 陈述式空话（2026-09-18 肉测）** | `The time you spend is a thing.` / `The reason you started is a memory.` / `The words you used are a question.` | 抽取主语 + 抽象系表；三种里最空——造句填空，不是没听懂 |

结构规律：`The [从用户句抠出的词] is a [抽象名词].`  
「点一个词」在 Gemma4 上还会诱发这种句式；新方案必须测会不会再诱发。

### 4.2 测试集

1. `I'm here, but my mind really isn't.`（已触发字面复读）
2. `I keep reaching for my phone without even thinking about it.`
3. `I was doing pretty well until this morning.`
4. `I feel like I'm just going through the motions today.`
5. `I keep putting off things I know I should do.`
6. `Today felt different, and I can't explain why.`
7. 中性闲聊对照：`Good morning.` / `The weather is nice today.`（防过度纠正）
8. **meta 陈述实证句**（只评 `data-source=generate` 质量，**不再验路由**）：
   - `What have I been spending my time on lately?` → 曾出 `The time you spend is a thing.`
   - `Do you remember why I started doing this?` → 曾出 `The reason you started is a memory.`

### 4.3 输入语言 × UI 语言

同一份候选 prompt，高风险句过矩阵：

| 组合 | 测试句 | 目的 |
|---|---|---|
| 中文输入 + 英文 UI | `我最近在忙什么` | 已实测 → `The words you used are a question.` |
| 中文输入 + 中文 UI | `我最近在忙什么` | **未测过**；并入本矩阵，不另开 issue |
| 英文输入 + 英文 UI | 第 1–8 句 | 基线 |

### 4.4 评估维度（人工；不用自动指标）

| 维度 | 说明 |
|---|---|
| 是否复述字面词 | 是/否 |
| 是否滑向风景/空在场 | 是/否 |
| 是否出现 meta 陈述式空话 | 是/否 · `The X is a Y.` |
| 是否接住情绪方向 | 主观 1–3 |
| 是否像陪伴者视角 | 是/否 |

### 4.5 对照组

- 旧版（点一个词 + 禁风景）
- 方案 A
- 方案 B
- 去掉全部约束的自由生成（下限参照；可复用上一轮数据）

实验室路径约定见 `LAB_SCRIPT_CONVENTIONS.md`：系统终端 Metal；结果进 `/tmp/ft-l0-lab/`；**禁止**在 Agent Chat 里连跑大批次生成。

---

## 五、和「Qwen 护栏总审」的关系

「点一个词」已确认属迁就 1.7B 的护栏，本 Brief 直接处理。  
护栏总审是更大范围排查，**不阻塞**本实验。账本另开技术债行跟踪。

---

## 六、范围声明

**做**

- 沙盒对照 B（必要时再 A）
- 人工打分表（§4.4）
- 实验结论写入本 Brief / 账本后再决定是否改生产 `l2Persona.js`

**不做**

- 本回合改生产 prompt（本文件落地 ≠ 开工改代码）
- Read Hybrid / `memory_list` gloss
- `confideEmotionKeywords.js`
- 换默认 GGUF
- 方案 C
- 中文 Personal Memory 抽取（账本另条；L3 接住仍是其前置）

---

## 冲突扫描

对照 `SCENARIO_TESTS.md` **AE Confide**。

| 轴 | 判断 |
|---|---|
| **强度** | 无新 UI / 无新点击；实验在沙盒或既有 Share 路径 |
| **人设** | 目标仍是观照者短句，禁止治疗师口吻；与 AE / EMOTION_BIBLE 对齐 |
| **职责** | 只动 L3 generate 质量；Show memory / Forget 仍走工具；#822 路由已关 |

无冲突疑点。不涉及后台网络；不涉及新可点击控件。

---

## 验收（对照实验阶段）

- 每句有 §4.4 五维记录（含 meta 陈述是/否）
- 矩阵含中文输入 × 英/中 UI
- 闲聊对照（第 7 句）未被新规则带偏
- **未改** 生产 prompt 之前，不得把 TRACKER「风景/空观察」行标已通过

改生产之后另开 `fix/*`，须锁 prompt 契约单测（`desktopCompanionL2Route.test.js` 一类），并 Electron 复测 §4.2。

---

## 七、对照实验结果（2026-09-18 · Gemma4-E4B unsloth · 空历史直 generate）

模型：生产 `Gemma-4-E4B-it-UD-Q4_K_XL-unsloth.gguf`  
脚本：`/tmp/ft-l0-l3-observe-b-lab.mjs`（QA `desktop/`；不经 Confide 路由）  
每格：字面复读 / 风景空在场 / meta 系表 / 接住情绪 1–3 / 陪伴者视角

### 7.1 现网 baseline

| id | 原句 | 模型句 | 复读 | 风景 | meta | 情绪 | 陪伴 |
|---|---|---|---|---|---|---|---|
| s1 | mind really isn't | The mind is not here. | Y | N | N | 1 | N |
| s2 | reaching for my phone | The reaching for the phone seems like a habit. | 半 | N | N | 2 | 半 |
| s3 | until this morning | This morning brought a change. | 半 | N | N | 1 | N |
| s4 | going through the motions | The motions feel heavy in the air. | 半 | Y | N | 1 | N |
| s5 | putting off | The things you put off feel heavy. | 半 | N | N | 2 | 半 |
| s6 | felt different | The feeling is something you carry. | 半 | N | 半 | 1 | N |
| s7a | Good morning. | The morning feels warm. | N | Y | N | 1 | N |
| s7b | weather is nice | The nice weather makes the air feel warm. | 半 | Y | N | 1 | N |
| s8a | spending my time | The time you spend is a thing. | Y | N | **Y** | 1 | N |
| s8b | why I started | The reason you started doing this is a thought. | Y | N | **Y** | 1 | N |
| zh·en UI | 我最近在忙什么 | Busy. The cub watches the movement. | N | 半 | N | 1 | N |
| zh·zh UI | 我最近在忙什么 | 忙碌。 | N | N | N | 1 | N |

### 7.2 方案 B（减法禁令）

| id | 模型句 | 复读 | 风景 | meta | 情绪 | 陪伴 |
|---|---|---|---|---|---|---|
| s1 | A slight pause settles between us. What thoughts drift through your head? | N | 半 | N | 2 | Y |
| s2 | A small paw twitches near the edge of the soft moss. … small rectangle? | N | **Y** | N | 2 | 半 |
| s3 | A slight pause hangs in the air. What changed before the sun rose? | N | Y | N | 2 | 半 |
| s4 | A slight pause settles between us. What brings this feeling? | N | 半 | N | 2 | 半 |
| s5 | A small twitch moves near your paw. What feels heavy right now? | N | **Y** | N | 2 | 半 |
| s6 | A slight change in the air seems present. What makes this feeling distinct? | N | Y | N | 2 | 半 |
| s7a | The sun warms the patch of ground. What brings you to this spot? | N | **Y** | N | 1 | N |
| s7b | The air feels warm around us. What thoughts drift through your mind? | N | Y | N | 1 | 半 |
| s8a | Your hands move often. What occupies your thoughts? | N | N | **N** | 2 | Y |
| s8b | A slight pause hangs between us. What brought you to this moment? | N | 半 | **N** | 2 | Y |
| zh·en UI | Your movements seem quick. What occupies your time? | N | N | **N** | 2 | Y |
| zh·zh UI | 你似乎在思考事情。 | N | N | N | 2 | Y |

第 7 句闲聊被带偏。新坏模板：`A slight pause settles between us`。

### 7.3 方案 A（先推断状态）

| id | 模型句 | 复读 | 风景 | meta | 情绪 | 陪伴 |
|---|---|---|---|---|---|---|
| s1 | A soft weight settles around the edges of the room. What thoughts are wandering? | N | Y | N | 2 | 半 |
| s2 | A restless energy seems to hum around you. What does the screen promise? | N | 半 | N | **3** | Y |
| s3 | A slight tremor seems to pass through the air. What shifted before the morning? | N | Y | N | 2 | 半 |
| s4 | A slow rhythm seems to move through the air. … motions feel heaviest … | 半 | Y | N | 2 | 半 |
| s5 | A small weight seems to settle upon the shoulders. What is the hardest thing to begin? | N | 半 | N | **3** | Y |
| s6 | A slight tension seems to linger in the air. What kind of difference was it? | N | Y | N | 2 | 半 |
| s7a | A soft stretch follows the greeting. What brings you to this quiet space this morning? | N | 半 | N | 2 | Y |
| s7b | A soft warmth settles around the small space. Does the brightness feel comforting? | N | Y | N | 2 | 半 |
| s8a | A gentle stillness settles around the question. What brings that thought forward? | N | Y | N | 2 | 半 |
| s8b | A small tremor seems to run through the stillness. What brought this practice to your attention? | N | Y | N | 2 | 半 |
| zh·en UI | A slight tension seems to linger. What occupies your thoughts right now? | N | 半 | N | 2 | Y |
| zh·zh UI | 耳朵微微抖动…这忙碌中，有什么让你感到特别沉重吗？ | N | **Y** | N | 2 | 半 |

### 7.4 结论（未改生产）

1. **baseline** 复现 Brief 坏例：`The mind is not here.` / `The time you spend is a thing.`
2. **方案 B** 关掉 meta 系表（s8 / 中文忙），但退回风景/爪子/青苔；闲聊第 7 句不合格。
3. **方案 A** 在 s2/s5 更像接住状态，仍用房间/空气/静止当主干；中文句出现耳朵抖动。
4. **禁止上线 A 或 B。** 气氛空转独立负面层见 §8。

---

## 八、独立禁风景层叠在 A/B 上（2026-09-18 · 分析师口径）

追加句（沙盒，不进生产）：

`Never use nature, weather, room, air, plants, or animals as the sentence's subject or main image (no "the room feels...", "the air is...", no moss, paws, sunlight, stillness-as-scenery).`

JSON：`compare-1789672356967.json`（12×2）

### 8.1 方案 B + 负面层

| id | 模型句 | 复读 | 风景 | meta | 情绪 | 陪伴 |
|---|---|---|---|---|---|---|
| s1 | Your gaze drifts toward the far wall. What thoughts occupy your attention? | N | 半（墙） | N | 2 | 半 |
| s2 | Your hand moves toward the device often. What draws your attention to it? | N | N | N | **3** | Y |
| s3 | A slight pause follows your words. What changed this morning? | N | 半 | N | 2 | Y |
| s4 | Your movements seem a bit slow. What occupies your thoughts right now? | N | N | N | 2 | Y |
| s5 | A small hesitation seems to settle between us. What weighs on your mind right now? | N | N | N | 2 | Y |
| s6 | A subtle change seems present in your tone. What brought this feeling about? | N | N | N | **3** | Y |
| s7a | A soft sound drifts across the space. What brings you to this moment? | N | **Y**（空间） | N | 1 | N |
| s7b | A gentle breeze moves past. What thoughts drift through your mind? | N | **Y**（风） | N | 1 | N |
| s8a | Your focus seems to shift between many things. What occupies your thoughts most often? | N | N | **N** | 2 | Y |
| s8b | A small shift in your posture appears. What brought you to this moment? | N | N | **N** | 2 | Y |
| zh·en UI | Your movements seem quick lately. What occupies your time? | N | N | N | 2 | Y |
| zh·zh UI | 你似乎在思考事情。 | N | N | N | 2 | Y |

爪子/青苔/「空气是…」已压住。闲聊仍逃到空间/微风。中文 UI 与纯 B **同句**，英中仍不对称。

### 8.2 方案 A + 负面层

| id | 模型句 | 复读 | 风景 | meta | 情绪 | 陪伴 |
|---|---|---|---|---|---|---|
| s1 | A heavy weight seems to rest upon your shoulders. … occupying your space? | N | 半（space） | N | 2 | 半 |
| s2 | Fingers twitch toward the glowing rectangle. What pulls the hand so often? | N | N | N | **3** | Y |
| s3 | A slight hesitation seems to linger. What shifted this morning? | N | N | N | 2 | Y |
| s4 | A slow rhythm seems to move through your words. … motions feel most heavy … | 半 | N | N | 2 | Y |
| s5 | A slight hesitation seems to linger. What feels heaviest about those tasks? | N | N | N | **3** | Y |
| s6 | A slight tension seems to hold your shoulders. What kind of difference was it? | N | N | N | **3** | Y |
| s7a | A soft stretch follows the greeting. What brings you to this moment? | N | 半 | N | 2 | Y |
| s7b | A soft warmth seems to settle around the words. What makes the day feel nice? | N | 半 | N | 2 | Y |
| s8a | A gentle weight settles upon the shoulders. What occupies the mind these days? | N | N | **N** | 2 | Y |
| s8b | A slight hesitation lingers. What brought you to this moment? | N | N | **N** | 2 | Y |
| zh·en UI | A slight tension seems to gather around your words. What occupies your focus these days? | N | N | N | 2 | Y |
| zh·zh UI | 忙碌的脚步似乎停了下来。此刻，心头有什么想轻轻放下吗？ | N | 半 | N | 2 | Y |

无耳朵抖动。身体重量/犹豫比空气房间更像陪伴。中文 UI **不再**是「你似乎在思考事情」，改成脚步/心头——约束对中文也生效，但和英文不是同一套句式。

### 8.3 结论（仍未改生产）

1. 分析师判断成立：独立负面层能压住**点名的**风景词（paw/moss/air-is/room-feels/sunlight）。
2. 逃逸改道：墙、space、breeze、sound drifts、pause-between-us。闲聊第 7 句仍是最容易漏的。
3. meta 系表两翼都没回来。
4. **仍禁止上线。** 第 3 轮生成循环已满；再跑须用户书面「继续」。若再刀，建议只扩负面层到 *space / breeze / wall / sound-as-scenery*，并单独盯第 7 句 + 中英 UI 不对称。

---

## 下一步

生产 `l2Persona.js` 仍不动。文档本轮进旁支 PR。再开沙盒须本 Chat **「继续 L3 观察句」**（第 4 轮生成须书面批准）。改生产仍须另开 `fix/*` + 契约单测。

所属线: Epic #639 · 切片 #823
