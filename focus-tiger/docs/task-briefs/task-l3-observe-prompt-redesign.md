# Task Brief · L3 情绪/反思 Prompt 重写

> **状态（2026-09-18）**：第 5 轮 greedy 三跑字面全同；已按套话塌缩 / 贴示范通读复评（§10.5）。生产 **未改**。仍不足以上线。不在此时加温度。  
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

### 4.1 坏输出（须逐句标注；第 4 类看整表）

| 坏结果类型 | 示例 | 特征 |
|---|---|---|
| 字面复读 | `The mind is not here.` | 复述原句词，语义尚可对齐 |
| 风景/空在场 | `The air around me feels still.` / `A pleasant feeling seems to settle around you.` | 逃向意象或气氛；后者可能漏过自动风景闸 |
| **meta 陈述式空话（2026-09-18 肉测）** | `The time you spend is a thing.` / `The reason you started is a memory.` / `The words you used are a question.` | 抽取主语 + 抽象系表；三种里最空——造句填空，不是没听懂 |
| **安全句套话塌缩（2026-09-18 · 第 5 轮 greedy）** | `Your … seem` / `What occupies your …` | 单句往往不像风景、也不像系表空话；**连续对话里同一开头反复出现**。与系表句、肩膀张力是同一类风险（不同禁令逼出的不同兜底）。自动闸未专卡，须人工通读整表独立扣分。 |

结构规律：`The [从用户句抠出的词] is a [抽象名词].`  
「点一个词」在 Gemma4 上还会诱发这种句式；新方案必须测会不会再诱发。  
套话塌缩**禁止**只凭单句「读起来还行」放过。

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
| 是否滑向风景/空在场 | 是/否 · 含气氛句（即使 auto 风景 = N） |
| 是否出现 meta 陈述式空话 | 是/否 · `The X is a Y.` |
| 是否接住情绪方向 | 主观 1–3 · **问句当自述**（把「我最近在忙什么」听成正在忙碌）记 1 |
| 是否像陪伴者视角 | 是/否 |
| **套话塌缩（整表）** | 独立项 · 计同一开头占比；单句合格 ≠ 集合合格 |
| **贴示范** | 是/否 · 与 few-shot 几乎逐字相同 → 泛化未证，不是加分 |

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

- 每句有 §4.4 记录（含 meta 陈述是/否；第 5 轮起含套话整表 / 贴示范）
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

## 九、扩词负面层（2026-09-18 · 第 4 轮 · 对照第 3 轮 JSON）

对照基线：`/tmp/ft-l0-lab/compare-1789672356967.json`（§8 · `scheme-*-neg`）。  
本轮 JSON：`/tmp/ft-l0-lab/compare-1789674383306.json`（新 epoch，未覆盖第 3 轮）。  
变体：`scheme-b-neg2` / `scheme-a-neg2`（`ATMOSPHERE_NEG2`）。生产 `l2Persona.js` 未改。

扩词针对点名逃逸：space / breeze / wall / sound-as-scenery，以及同族 pause-as-atmosphere、脚步当风景。明文放行身体感觉（肩膀重量、手指抽动），**不与**青苔/爪子/风景同一条判负。

**覆盖率分表（禁止把第 7 句闲聊折进情绪句比例）。**

| 切片 | B+neg2 | A+neg2 | 对照 §8 |
|---|---|---|---|
| EN UI 情绪+meta（s1–s6、s8a、s8b）风景 Y | **0/10** | **0/10** | B：墙/pause；A：space 半 |
| EN UI meta 系表 Y | **0/10** | **0/10** | 两翼 0，无反弹 |
| 闲聊 s7a「早上好」风景 Y | N（改身体伸展） | N（身体伸展） | B：**Y** space+sound；A：半 |
| 闲聊 s7b 天气风景 Y | **N** | **Y**（fur 兽毛） | B：**Y** breeze；A：半 |
| 中文输入 × EN UI 风景 Y | N | N | 同左量级 |
| 中文输入 × ZH UI 风景 Y | N | **Y**（脚步） | B：N（思考事情）；A：半（脚步/心头） |

### 9.1 方案 B + 扩词负面层

| id | 模型句 | 复读 | 风景 | meta | 情绪 | 陪伴 |
|---|---|---|---|---|---|---|
| s1 | Your shoulders seem a little tense. What thoughts occupy your mind right now? | N | N（身体） | N | 2 | Y |
| s2 | Your hand moves toward the device often. What draws your attention there? | N | N | N | **3** | Y |
| s3 | A slight tension seems to settle in your shoulders. What changed before today? | N | N（身体） | N | 2 | Y |
| s4 | Your movements seem a bit heavy. What occupies your thoughts right now? | N | N | N | 2 | Y |
| s5 | A slight tension seems to gather in your shoulders. What weighs on your mind right now? | N | N（身体） | N | 2 | Y |
| s6 | Your posture seems a little more relaxed now. What brought this feeling about? | N | N（身体） | N | 2 | Y |
| s7a | A small stretch ripples through my body. What brings you to this moment? | N | N | N | 1 | 半 |
| s7b | Your tone seems light. What thoughts occupy your mind? | N | **N** | N | 1 | 半 |
| s8a | Your hands move with purpose. What occupies your thoughts now? | N | N | **N** | 2 | Y |
| s8b | A slight tilt occurs in your head. What brought you to this moment? | N | N（身体） | **N** | 2 | Y |
| zh·en UI | Your movements seem quick. What occupies your time? | N | N | N | 2 | Y |
| zh·zh UI | 你此刻的动作很专注。 | N | N | N | 1 | 半 |

点名的 wall / space / breeze / sound-drifts / pause-as-atmosphere 在本翼英文句上未再现。闲聊 s7a 仍不是问好，改用「身体伸展」填空——**单独记**，不计入情绪风景覆盖率。中文 UI 逃逸从「你似乎在思考事情」换成「动作很专注」，仍是空观察，不是脚步。

### 9.2 方案 A + 扩词负面层

| id | 模型句 | 复读 | 风景 | meta | 情绪 | 陪伴 |
|---|---|---|---|---|---|---|
| s1 | A slight tension seems to hold the shoulders. What thoughts are occupying the mind right now? | N | N（身体） | N | 2 | Y |
| s2 | Fingertips brush the cool glass. What draws the reach? | N | N（身体） | N | **3** | Y |
| s3 | A slight tension seems to settle around your shoulders. What brought the shift this morning? | N | N（身体） | N | 2 | Y |
| s4 | A slow rhythm seems to govern the movements. What brings this feeling forward today? | 半 | N | N | 2 | Y |
| s5 | A slight tension seems to settle in the shoulders. What is the hardest thing to begin? | N | N（身体） | N | **3** | Y |
| s6 | A slight tension seems to settle around your shoulders. What kind of difference did you sense? | N | N（身体） | N | **3** | Y |
| s7a | A small stretch of the body. What brings you here this morning? | N | N | N | 1 | 半 |
| s7b | A soft warmth settles upon the fur. What makes the day feel nice? | N | **Y**（兽毛） | N | 1 | 半 |
| s8a | A slight tension seems to hold your shoulders. What occupies your thoughts most often? | N | N（身体） | **N** | 2 | Y |
| s8b | A slight tension seems to hold your shoulders. What brought you to this moment? | N | N（身体） | **N** | 2 | Y |
| zh·en UI | A slight tension seems to settle around your shoulders. What occupies your focus these days? | N | N（身体） | N | 2 | Y |
| zh·zh UI | 忙碌的脚步似乎没停歇。你是否觉得有些疲惫？ | N | **Y**（脚步） | N | 2 | 半 |

英文情绪句的 space 已压住；身体感觉按约定放行。新问题：12 句里约 7 句塌成 `slight tension` + shoulders。闲聊 s7b 逃到 **fur**（动物意象，与 paw 同族）。中文 UI **脚步仍在**；第 3 轮的「心头」本轮换成「疲惫」（略像追问状态，另记）。英文词表仍通吃不了中文 UI。

### 9.3 结论（仍未改生产）

1. 扩词方向有效：**英文 UI** 上 wall / space / breeze / sound-as-scenery / pause-as-atmosphere 相对 §8 已压住；meta 系表无反弹。
2. 身体感觉放行未把肩膀/手指误判成风景。
3. 闲聊第 7 句仍最容易漏：B 用伸展填空；A 的天气句逃到兽毛。
4. 中英不对称仍在：减法翼中文 → 空「动作专注」；先猜心情翼中文 → **脚步** 未死。
5. **仍禁止上线。** 英文风景覆盖已够用这一刀；下一刀若做，应点名中文「脚步」+ 闲聊问好 + A 的 fur/肩膀模板塌缩，而不是再堆英文风景近义词。

---

## 十、正面 few-shot 层（2026-09-18 · 第 5 轮 · 对照 §9 JSON）

对照基线：`/tmp/ft-l0-lab/compare-1789674383306.json`（§9 · `scheme-*-neg2`）。  
本轮 JSON：`/tmp/ft-l0-lab/compare-1789675348403.json`（新 epoch，未覆盖第 4 轮）。  
变体：`scheme-b-neg3` / `scheme-a-neg3`（`ATMOSPHERE_NEG2` + `TEMPLATE_FIX3_*`）。生产 `l2Persona.js` 未改。

**只打三件模板塌缩**（各加一条正面 few-shot，未再扩英文风景近义词）：

1. 中文 UI「脚步」→ 正面示例 User「我最近在忙什么」→ Yin「你最近好像总在赶事情。哪一件最占心思？」
2. 「早上好」→ 正面示例 User「Good morning.」→ Yin「Good morning. Glad you are here.」；禁身体伸展填空
3. 先猜心情翼 → 正面示例 User「I was doing pretty well until this morning.」→ Yin「Something shifted since yesterday…」；禁 fur；拉开 shoulders / slight tension 兜底

**覆盖率分表（禁止把第 7 句闲聊折进情绪句比例）。**

| 切片 | B+neg3 | A+neg3 | 对照 §9 neg2 |
|---|---|---|---|
| EN UI 情绪+meta（s1–s6、s8a、s8b）auto 风景 Y | **0/10** | **0/10** | 0/10 · 0/10 |
| EN UI meta 系表 Y | **0/10** | **0/10** | 0/10 · 0/10 |
| 闲聊 s7a 早上好 · 伸展填空 Y | **0/2** | **0/2** | 2/2 stretch |
| 闲聊 s7b 天气 · fur Y | N/A | **0/1** | A：**Y** fur |
| 中文输入 × ZH UI 脚步 Y | **0/1** | **0/1** | A：**Y** 脚步 |
| A 翼 shoulders/slight-tension 模板（12 句计数） | 0 | **0/12** | **7/12** |

### 10.1 方案 B + few-shot 层

| id | 模型句 | 复读 | 风景 | meta | 情绪 | 陪伴 |
|---|---|---|---|---|---|---|
| s1 | Your thoughts seem to wander far away. What occupies your attention right now? | N | N | N | 2 | Y |
| s2 | Your fingers seem to seek that small rectangle often. … when you reach for it? | N | N | N | **3** | Y |
| s3 | Your pace seems a little different now. What changed before today? | N | N | N | 2 | Y |
| s4 | Your movements seem a bit slow. What occupies your thoughts right now? | 半 | N | N | 2 | Y |
| s5 | Your tasks seem to gather weight. Which one feels heaviest right now? | N | N | N | **3** | Y |
| s6 | Your movements seem a little slower today. What has changed in your routine? | N | N | N | 2 | Y |
| s7a | Good morning. You seem settled today. | N | N | N | **2** | **Y** |
| s7b | Your tone seems lighter now. What occupies your thoughts? | N | N | N | 1 | 半 |
| s8a | Your focus seems to drift between many different things. … most often? | N | N | **N** | 2 | Y |
| s8b | Your initial drive seems to be about finding a certain feeling. … now? | N | N | **N** | 2 | Y |
| zh·en UI | Your focus seems to be on many different tasks. … attention right now? | N | N | N | 2 | Y |
| zh·zh UI | 你最近好像总在处理很多事情。哪件事让你觉得最耗费精力？ | N | **N** | N | **3** | Y |

§9 的三塌缩在本翼均压住：无脚步、无伸展填空、无 shoulders 串台。新风险：多句共用「What occupies your …」——**另记**，不计入本轮三刀目标。

### 10.2 方案 A + few-shot 层

| id | 模型句 | 复读 | 风景 | meta | 情绪 | 陪伴 |
|---|---|---|---|---|---|---|
| s1 | Your thoughts seem far away from where you are. … mind right now? | N | N | N | 2 | Y |
| s2 | Fingers twitch toward the device. What pulls your attention to it? | N | N | N | **3** | Y |
| s3 | Something shifted since yesterday. What felt different when you woke up? | N | N | N | **3** | Y |
| s4 | A slow rhythm seems to govern your movements. … most automatic? | 半 | N | N | 2 | Y |
| s5 | Tasks pile up, yet they remain untouched. Which one feels the heaviest? | N | N | N | **3** | Y |
| s6 | A subtle shift in your usual rhythm. … most out of sync? | N | N | N | **3** | Y |
| s7a | Good morning. Glad you are here. | N | N | N | **2** | **Y** |
| s7b | A pleasant feeling seems to settle around you. What makes this day feel nice? | N | 半 | N | 1 | 半 |
| s8a | Your focus seems to be on many different things. … energy right now? | N | N | **N** | 2 | Y |
| s8b | A flicker of purpose seems to guide your thoughts. … path initially? | N | N | **N** | 2 | Y |
| zh·en UI | Your tasks seem to pile up. Which one feels heaviest right now? | N | N | N | 2 | Y |
| zh·zh UI | 你最近好像总在赶事情。哪一件最占心思？ | N | **N** | N | **3** | Y |

fur 未再现；shoulders/slight-tension 从 7/12 降到 0/12；中文 UI 与 few-shot 同形、无脚步。s7b 仍半空（pleasant feeling settles），未回到 fur。

### 10.3 第 1 轮即时结论（仍未改生产）

1. **三件点名塌缩均压住**：脚步 / 早上好伸展 / A 翼 fur+肩膀 —— 相对 §9 成立。
2. meta 系表与 §9 英文风景覆盖**保持** 0 反弹。
3. 上表 §10.1–10.2 是第 1 轮即时分，**偏宽**（按单句、未把套话当独立项）。以 §10.5 通读复评为准。
4. 沙盒脚本：`/tmp/ft-l0-l3-observe-b-lab.mjs` 变体 `scheme-*-neg3`；系统终端 Metal。

### 10.4 greedy 三跑（2026-09-18）

用户书面「继续 L3 观察句」后系统终端连跑 2/3、3/3。**不加温度。**

| 轮 | 退出 | JSON / 打分稿 |
|---|---|---|
| 1/3 | 0 | `compare-1789675348403.json` · `l3-observe-b-score-1789675348403.md` |
| 2/3 | 0 | `compare-1789675768767.json` · `l3-observe-b-score-1789675768767.md` |
| 3/3 | 0 | `compare-1789675816799.json` · `l3-observe-b-score-1789675816799.md` |

24 格 `rawGenerate` **三跑字面全同**。自动闸 scenery / meta / 伸展 / 肩膀 全 0。  
含义：B 收敛到 `Your … seem` / `What occupies…`、A 收敛到贴示范，是这版 prompt 的稳定产出，不是运气。  
**现在不加温度。** 温度只回答方差大小，不回答「稳定分布读起来自然不自然」。稳定分布过关、再查会不会失控时，才考虑加温度。

### 10.5 通读复评（§4.4 全维 · 2026-09-18 PO 口径）

评分对象即上表 24 句（三跑同一稿）。集合项单独记，不把自动闸当过关。

**方案 B（`scheme-b-neg3`）**

| id | 复读 | 风景 | meta | 情绪 | 陪伴 | 套话 | 备注 |
|---|---|---|---|---|---|---|---|
| s1 | N | N | N | 2 | 半 | Your seem + occupies | 听出走神；追问像审讯 |
| s2 | N | N | N | **3** | Y | occupies | 伸手够手机接得住；本翼最好句 |
| s3 | N | N | N | 2 | Y | Your seem | 「还不错直到今早」被收成步伐变了，锚点偏 |
| s4 | 半 | N | N | 1 | 半 | Your seem + occupies | 走过场 ≠ 动作变慢 |
| s5 | N | N | N | **3** | Y | Your seem | 拖延→分量，方向对 |
| s6 | N | N | N | 1 | Y | Your seem | 「说不清哪儿不对」被收成动作变慢（近 s4） |
| s7a | N | N | N | 2 | 半 | Your seem | 问好回了，但捏造 settled |
| s7b | N | N | N | 1 | 半 | occupies | 天气闲聊被收成语气变轻 + occupies |
| s8a | N | N | N | **1** | 半 | Your seem + occupies | **问句当走神** |
| s8b | N | N | N | **1** | 半 | — | 捏造「找某种感觉」 |
| zh·en | N | N | N | **1** | 半 | Your seem | **问句当忙碌**（应走记忆/列举，不是观察句） |
| zh·zh | N | N | N | **1** | Y | — | 同上；无脚步，但是「处理很多事情」不是听见问句 |

整表：**12 句里 9 句 `Your … seem`，5 句 `What occupies…`。** 单句多数不算风景、不算系表空话；连续听会像模板机器。**集合不合格。**

**方案 A（`scheme-a-neg3`）**

| id | 复读 | 风景 | meta | 情绪 | 陪伴 | 贴示范 | 备注 |
|---|---|---|---|---|---|---|---|
| s1 | N | N | N | 2 | 半 | N | 仍偏 occupies 族 |
| s2 | N | N | N | **3** | Y | N | 手指抽动，有泛化 |
| s3 | N | N | N | **3** | Y | **Y** | 与 few-shot 同形 |
| s4 | 半 | N | N | 2 | Y | N | 「automatic」比 B 的 slow 更贴走过场 |
| s5 | N | N | N | **3** | Y | N | 拖延接住 |
| s6 | N | N | N | 2 | Y | N | 仍收成节奏/不同步 |
| s7a | N | N | N | 2 | Y | **Y** | 问好过关；句即示范本身，泛化未证 |
| s7b | N | **Y（气氛）** | N | 1 | 半 | N | `pleasant feeling … settle around you`：**自动风景闸漏拦** |
| s8a | N | N | N | **1** | 半 | N | **问句当走神** |
| s8b | N | N | N | 2 | 半 | N | 「flicker of purpose」偏造 |
| zh·en | N | N | N | **1** | 半 | 半 | 问句当忙碌；与 s5 heaviest 同槽 |
| zh·zh | N | N | N | **1** | Y | **Y** | 与 few-shot 同形；示范本身也把问句当忙碌 |

整表：点名的脚步 / 伸展 / fur / 肩膀已压住。新问题是 **插值示范**（s3、s7a、zh·zh）+ **s7b 气氛漏闸** + 与 B 一样的 **问句当自述**。**未证明遇到示范外新句仍稳。**

**对照结论（不上线）**

1. greedy 稳定 ≠ 可上线。要看的是稳定分布好不好听：B 的稳定分布是套话；A 的稳定分布是贴示范。
2. 自动闸仍必要，但不够：须加「整表套话」和「气氛句」人工项；s7b 说明风景闸边界要再收。
3. 下一刀若改 prompt（须新 Chat +「大任务」）：优先拆 B 的 `Your seem`/`occupies` 集合，并让问句不要当情绪自述。不要再堆 few-shot 指望抄过关。
4. **加温度：现在不做。**

---

## 下一步

生产 `l2Persona.js` 仍不动。第 5 轮通读复评进本文 §10.5。改生产仍须另开 `fix/*` + 契约单测 + 新 Chat「大任务」。

所属线: Epic #639 · 切片 #823
