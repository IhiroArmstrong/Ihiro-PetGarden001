# Tiger Emotion Bible · 情绪资源规范

本文档是坐禅小老虎**所有情绪/状态表现的唯一权威定义来源**。后续无论底层采用何种渲染技术（3D 多姿态 GLB、Rive、PNG 序列精灵动画等），都必须完整实现本清单中定义的状态与叠加规则。

技术选型与实现细节见 `ARCHITECTURE.md`；产品语义与玩法见 `DESIGN.md`。本文档只回答：**有哪些状态、何时触发、如何叠加、谁优先**。

---

## 架构前提：两层正交模型

角色视觉分为两个互不替代的正交层（见 `ARCHITECTURE.md`「姿态系统架构」）：

| 层级 | 职责 | 承载方式（当前实现参考） |
|---|---|---|
| **姿态层** | 表达角色当前所处的离散「模式」 | 多个独立 GLB，切换显隐 + cross-fade |
| **动态效果层** | 在任意姿态之上叠加连续或短暂的程序化效果 | Object3D 变换、粒子、Shader 等 |

**规则**：姿态层同一时刻只允许一个「基底姿态」可见；动态效果层可与基底姿态及彼此叠加（见下文优先级）。

### 动作幅度的场景边界（主界面 ≠ 奖励柜）

「克制剧烈动作」**仅适用于主专注界面**的实时反馈，**不适用于**未来奖励系统（塑胶公仔展示柜）场景。产品语义全文见 `DESIGN.md`「动作幅度的场景边界」。

- **主专注界面**：最大幅度止于 `Celebrating`；其正式 2D 资产为 `celebrate-dance`（起身 → 慢速舞 + 小金光 → 施礼）一次性弧线。禁止在此之外再加更娱乐化 / 街机式动作进入本表 / `playEmotion` 主路径。
- **奖励柜（未来，用户主动进入）**：可复用 3D GLB + `DynamicMotion`，允许更丰富、更具表现力的动作；与专注练习场景心理预期不同，不套用主界面克制标准。

立项新动作时先问「放主界面还是奖励柜」，避免边界模糊。

---

## 第一部分：情绪状态清单表

### 1.1 姿态层（基底状态）

同一时刻仅有一个基底姿态生效。切换须 cross-fade（0.3–0.5s），禁止闪切。

| 状态名（英文标识符） | 中文名称 | 是否循环播放 | 触发条件 | 优先级 | 当前已有实现 |
|---|---|---|---|---|---|
| `Idle` | 日常静息（坐禅闭眼） | 是（姿态本身静态循环展示；可叠加动态层） | **默认开场与日常基底**（含当日零完成 / 登录后第一幕）；非庆祝播放中 / 非调试 Sleeping / 非当日已庆祝后的持续微笑态时 | **10**（最低基底优先级） | **已实现**：GLB `tiger-meditate-closed.glb`（2026-07-18：单色暖浅灰棉麻、无红边），`PoseManager` 中 `IDLE_CLOSED_EYES`；2D 主线默认隐藏 canvas，正式情绪由 `idle-breathing` 等序列承载；Idle 自发变体见下文「IdleOrchestrator 自发变体」 |
| `Sleeping` | 瞌睡（睡着了） | 是（`loopMode: 'pingpong'`） | **不再**作为零完成 / **冷启动**自动开场；仅调试面板「睡着了」、或 live sync 进 `STATES.DORMANT`（≥2h 空闲后回前台等）时；语气克制，不做委屈/生病拟人化 | **60**（覆盖 `Idle`；被一次性庆祝/唤醒打断后按规则回落） | **已实现（2D 主线）**：同源 `cloak-sleep` 末尾 **030–034**，每帧连播两拍、先倒序 034→030 再 pingpong 往复，**约 2 fps**；`playEmotion('sleeping')`。与 `cloakSleep` 正放末帧同姿衔接。产品口径（2026-07-21 / **2026-07-26**）：登录 / 刷新后第一幕必须是 Idle 闭目坐禅（有精神），Sleeping / 披毯看起来 not uplifting；`onAppReady` 禁进 DORMANT。原 `sleeping/` 8 帧目录保留未删 |
| `Smiling` | 坐禅微笑基底（观照者回归态） | 是（`blink-smile` pingpong） | 当日已触发过一次 `Celebrating` 且庆祝动画播放完毕后自动回归；角色恢复稳定坐姿与呼吸，只保留温和微笑，不继续庆祝表演；次日日期戳重置后回到 `Idle` | **50**（覆盖 `Idle`，低于 `Sleeping`） | **已实现（2D 主线）**：`blink-smile` 12 帧 pingpong；`playEmotion('smiling')`；3D `tiger-meditate-smile.glb` 仅作垫底且主线默认隐藏 canvas。日期戳持续基底仍待完整接通 |
| `Celebrating` | 完整庆祝（短暂、温暖、有情感） | 否（一次性播放，不循环） | 专注数据**当日首次达标**（如番茄钟/会话达到目标分钟数）；每个自然日仅触发一次，以日期戳判断；同日后续完成仍触发轻量 `SessionComplete`，不重复完整庆祝 | **100**（最高；播放期间临时夺取基底姿态，播完回归 `Idle` / idle-breathing） | **已实现（2D 主线）**：两套变体素材——`celebrate-dance`（57 帧）与 `celebrate-dance-v2`（60 帧）；`playEmotion('celebrating')` 每次触发时 50/50 随机选用其一（MVP 不做轮换记账）；`loopMode: none`，播完由 EmotionController 回归 idle-breathing。3D `tiger-happy-jump.glb` 仍作垫底。日期戳防刷与 `Smiling` 持续基底仍待完整接通。本序列即主界面 Celebrating 的正式幅度上限；禁止另加更娱乐化的街机式狂欢动作 |

### 1.2 一次性反馈（不改变基底姿态枚举，叠加于当前姿态）

| 状态名（英文标识符） | 中文名称 | 是否循环播放 | 触发条件 | 优先级 | 当前已有实现 |
|---|---|---|---|---|---|
| `IncenseComplete` | 一炷香完成（轻量反馈） | 否 | 「今日一炷香」小目标完成时触发；当日首次打开产品的轻量引导完成后反馈；当天不重复弹出引导，复用「当日状态」日期戳基础设施 | **80**（高于基底姿态；与 `Celebrating` 独立，强度低于完整庆祝） | **已实现**：`IncenseGreeting.js` DOM 叠层（z-index 4，莲花 + 金色粒子，位于 2D Yin 之上）；**待实现**：与 Milestone / 每日首次打开流程正式接线（当前有调试入口）。**产品方向（2026-07-19）**：立体荷花 + 金光斑点浮动须**保留**，并复用于后续「荷花持续增加、最终布满画面」的成长场景（勿删本效果模块） |
| `SessionComplete` | 每次专注完成的轻量情绪确认 | 否（约 3.5s） | 每次完成用户设定的专注会话均触发；温和摆尾致意（光环/粒子已烧录在帧内）；若本次同时满足「当日首次达标」，由 `Celebrating` 替代，不叠加播放 | **70**（高于基底姿态、低于 `IncenseComplete` / `Celebrating`） | **已实现（2D 主线）**：`session-complete` 28 帧（**8 fps** ≈3.5s，ONE_SHOT light 带）；`playEmotion('sessionComplete')`；同日后续达标接线完成；播放期临时归零 FocusVisualizer / Rim Light，播完回归 idle-breathing 后恢复 |
| `WakeUp` | 唤醒起身（伸懒腰变体） | 否（17 帧一次性） | 调试入口 / 历史多日沉睡叙事键 | **90** | **已实现（2D）**：播 `stretch-reminder` 同源伸懒腰（情绪键 `wakeUp`，**8 fps**）→ idle；**不**接 halo。与 Honesty `dormantWake` **刻意区分** |
| `dormantWake` | Honesty Check-in 唤醒（睡态揭毯 → 合掌坐姿） | 否（34 帧 **`cloak-sleep` 倒放**） | 用户选时长后**立刻**播放（与呼吸倒计时同期）；播完**定格末帧**至倒计时结束；按所选时长等同一次已完成会话 | **90**（高于 `Sleeping`，低于 `Celebrating`） | **已实现（2D 主线）**：选时长 → `cloak-sleep` **倒放**（**6 fps** ≈5.7s）→ 定格末帧（素材 frame_001）；倒计时结束离 DORMANT。离开定格默认 **520ms** cross-fade。Arrival Breath 不再落入 idle——改放慢 `Smiling`（见 0.50）。**2026-07-21**：试替原 `dormant-wake` 正放 |
| `MilestoneGlow` | 里程碑金辉时刻（仪式性纪念反馈） | 否（约 10s 一次性序列） | 长期里程碑节点达成时触发（连续练习 7/21/100 天、累计时长节点等；具体节点与 Backlog「纪念奖励系统」统一设计）；每个节点仅播放一次 | **110**（最高；比 `Celebrating` 更隆重一档，冲突时 `Celebrating` 不叠加、不补发，当日庆祝日期戳照常记账） | **素材与调试预览已接入**：主候选 `milestone-glow` / `deep-breath-glow`（27 帧，**4 fps**，2026-07-19 放慢 2×；闭目呼吸 + 金光 + 金色蝴蝶已烧录）；简化备选 **`breath-halo-hq`**（16 帧，**pingpong** 循环，2026-07-20：正放扩展 + 倒放收回，完整一吸一呼）——已登记 manifest，**不接业务触发**。实际使用哪套等里程碑逻辑排期再定。`playEmotion('milestoneGlow')` 仅供调试；备选可点调试「breath-halo-hq 备选」；播放期归零实时金光。**待实现**：真实里程碑判定与业务触发，归属 Backlog「纪念奖励系统」 |
| `IntentionSet` | Arrival Choose 确认点头 | 否（nod-bow **pingpong** 一整轮，约 7s） | 用户在 Arrival Practice 完成 Choose（图标点选或打字确认）的瞬间；跳过 Choose 不触发 | **55**（高于 `Idle`，低于完成反馈；**门闩与 Companion 在确认瞬间立即打开**，动画并行不挡流程） | **已实现（2D 主线）**：**16:9 `nod-bow` pingpong**（正放鞠躬→倒放回坐姿）；进出与前后动画用 **约 1s CapCut 叠化**（`CAPCUT_DISSOLVE_MS`）。旧 `palms-together` 仅调试保留。 |

### 1.3 动态效果层（可叠加）

可叠加在任意（或指定）基底姿态之上；与姿态层并行，不占用基底姿态槽位。

| 状态名（英文标识符） | 中文名称 | 是否循环播放 | 触发条件 | 优先级 | 当前已有实现 |
|---|---|---|---|---|---|
| `Breathing` | 呼吸起伏（3D） | 是 | **仅 3D 奖励柜**：默认开启；叠加于任意 3D 基底姿态。2D 主线呼吸由 `idle-breathing` 帧序列承载，不走本项 | **1** | **已实现（3D）**：`DynamicMotion.js`；**2D 调试 UI 已移除开关** |
| `Rotation` | 缓慢旋转（3D） | 是 | **仅 3D 奖励柜**：绕 Y 轴缓慢旋转，增加陈列感；2D 主线不做同等替代 | **1** | **已实现（3D）**：`DynamicMotion.js`；**2D 调试 UI 已移除开关** |
| `Hover` | 庆祝悬浮（3D） | 是 | **仅 3D 奖励柜**：基底为 `Celebrating` 时整体上抬 + 缓慢上下摆动 | **2**（附属于庆祝态） | **已实现（3D）**：`DynamicMotion.js`；**2D 调试 UI 已移除开关** |
| `Blink` | 眨眼 | 否（单次触发后自动结束） | 调试可手工播 | **5**（微表情；不抢占基底姿态） | **已实现（2D）**：调试 `blink-smile`；**Idle「偶尔看看」改用 `idle-eye-glance`**（闭↔睁↔闭，避免 blink-smile 睁眼与闭目 idle 叠化闪一下） |
| `SnoringZZZ` | 打呼噜 ZZZ | 是 | 仅当基底姿态为 `Sleeping` 时叠加：ZZZ 图标漂浮 + `rotation.x` 微倾 | **3**（附属于瞌睡态） | **待实现**：`DESIGN.md` 已定义语义，无代码 |

### 1.4 调试专用（不面向用户）

| 状态名（英文标识符） | 中文名称 | 是否循环播放 | 触发条件 | 优先级 | 当前已有实现 |
|---|---|---|---|---|---|
| `T_Pose` | T-Pose 站立 | — | 仅开发调试 | — | **已实现**：`PoseManager` 调试面板 |

### 1.5 一次性情绪时长标准（2026-07-19）

一次性（非循环）情绪应落在舒适时长带内，**不以「素材原始秒数」为真值**。舒适参考：`dormantWake` ≈5.3s、`nodGreeting` ≈3.8s、`milestoneGlow` 叙事段 ≈6.8s。

常量：`src/character/spriteManifest.js` → `ONE_SHOT_DURATION_SEC`。

| 档位 | 目标秒数 | 典型键 |
|---|---|---|
| **ack（确认 / 仪式）** | **3.5–7s**（目标约 5.5s） | `IntentionSet`、`nodGreeting`、`dormantWake`、`MindfulAcknowledge` / `nodBow`、`stretchReminder`、`WelcomeBack` |
| **light（轻量完成）** | **2.5–4s** | `SessionComplete`（须短于 `Celebrating`） |
| **celebrate** | 约 **4–6s** 叙事弧 | `Celebrating`（现 ~5s @12fps） |
| **milestone** | 可更长（仪式） | `MilestoneGlow`（叙事 + 末帧停留） |

帧数不够时，按优先级选用：

1. **放慢 fps**（首选，动作仍连贯）  
2. **重复可循环段**（如挥手摇摆段播两遍）  
3. **正倒放或连贯其它序列**（如合十正放→倒放落闭目，末帧可接 idle）

持续循环（`Idle` / `Sleeping`）不按此带，各自有独立节奏（见 PRINCIPLES）。

### 1.6 序列衔接：CapCut 式叠代（2026-07-20）

两个情绪序列**无法自然衔接**时（画幅不同、姿态跳变、末/首帧对不齐），**禁止闪切**，一律用叠代溶解：

1. 定格 A 末帧 + B 首帧  
2. 双层透明度交叉淡化，默认 **`CAPCUT_DISSOLVE_MS` = 1000ms**  
3. 溶解完成后再推进 B 的帧动画（`freezeUntilCrossFadeEnds`）

| 常量 | 值 | 用途 |
|---|---|---|
| `CAPCUT_DISSOLVE_MS` | 1000 | 无法衔接时的默认叠代 |
| `MICRO_CROSS_FADE_MS` | 180 | 同源可衔接（idle 内眨眼、同画幅 IntentionNod 等） |

`EmotionController._finishOneShot`：一次性 → idle **默认** CapCut；同源微表情须显式传 `returnCrossFadeMs: MICRO_CROSS_FADE_MS`。权威表述见 `PRINCIPLES.md`；实现见 `ARCHITECTURE.md`「播放机制」与 `SpriteSequencePlayer`。

---

## 第二部分：优先级裁决规则

当多个状态的触发条件同时满足时，按以下规则裁决（数字越大越优先；同层内遵守「一次性 > 持续基底」）：

```
MilestoneGlow (110)  >  Celebrating (100)  >  WakeUp (90)  >  IncenseComplete (80)
    >  SessionComplete (70)  >  Sleeping (60)  >  IntentionSet (55)  >  Smiling (50)  >  Idle (10)

动态效果层：Blink (5) 可穿插于 Idle/Smiling；SnoringZZZ 附属于 Sleeping。
3D 奖励柜另有 Breathing / Rotation / Hover（DynamicMotion）；2D 主界面不暴露、不叠加。
```

**关键场景说明**（均来自已确认产品设计，非新增玩法）：

1. **完成反馈分级**：每次完成均有轻量 `SessionComplete`；当日首次达标时由完整 `Celebrating`（`celebrate-dance` / `celebrate-dance-v2` 50/50 变体，一次性弧线）取代（不叠加）；同日后续完成继续播放 `SessionComplete`，不重复完整庆祝。所有一次性反馈结束后自动回到 `Idle`（idle-breathing）坐姿呼吸基底；`Smiling` 日期戳持续基底仍待完整接通。
2. **当日尚未完成任何练习 / 冷启动第一幕（2026-07-21；2026-07-26 加固）**：开场与刷新默认 **`Idle` 闭目坐禅**（不上 `Sleeping`、不播 `cloakSleep`）；可忽略 Honesty 提示仍可出现。`Sleeping` / `DORMANT` 可由 live 2h 惰性 sync 或调试切入；从睡态 Honesty 仍可 `dormantWake`，从 Idle 补登不播睡醒。
3. **一炷香完成 vs 专注达标**：`IncenseComplete` 与 `Celebrating` **相互独立**、强度分级（轻量确认 vs 完整庆祝），不共用完整庆祝资源；可同一天先后发生，各自遵守「每日一次」类限制。
4. **每日总结氛围**（雪花 / 花瓣）与实时姿态是**两条独立信号轴**（`DESIGN.md`），可同时叠加，不并入本表姿态状态机。
5. **专注金光**（`focusLevel` 驱动的金色光环/环境光反射强度、金粒子）由 `FocusVisualizer` / 动态效果层驱动，**不是**独立基底姿态；与 `Idle` 等姿态正交叠加。角色本体固有色恒定不变（2026-07-15 视觉原则，见 DESIGN.md「视觉状态」章节）。**金光呼吸律动**为光环通用行为：金光强弱同步 4 秒呼吸循环（吸气时微微收敛、亮部聚焦；呼气时向外柔和晕染），不是死板静止的光圈（2026-07-15 拍板，定义见 DESIGN.md）。**例外（播放期互斥）**：`Celebrating` / `SessionComplete` / `MilestoneGlow` 等已烧录金光的一次性叙事动画播放期间，临时归零实时金光层，播完回落后再恢复（见 `PRINCIPLES.md`「金色光效分层原则」）。
6. **禅意背景音 → 光效叠加（MVP 已落地；2026-07-21 默认开播）**：Ambient Soundscape（见 `DESIGN.md`「禅意背景音」）**默认播放 Mer-Ka-Ba**，右下角显眼「打开/关闭音乐」随时可关；会话内实际播放时长按比例叠加 Rim Light（`12s/分钟` 等效、上限 `0.20`）；**不替代** `focusLevel`，不参与达标。技术边界：只追踪 Focus Tiger 自己的播放器。本信号**不是**情绪姿态键。
7. **里程碑仪式 vs 每日庆祝**：`MilestoneGlow`（仪式性、静观，老虎全程闭目坐禅不做动作）与 `Celebrating`（社交性、互动感，睁眼看向用户）分工明确、不叠加。若里程碑达成与当日首次达标同刻发生，只播 `MilestoneGlow`，`Celebrating` 不补发但日期戳照常记账（避免同日稍后再触发完整庆祝）。序列结束后金光与蝴蝶一同淡去，回归坐姿呼吸基底，遵守「观照者而非情绪本身」闭环。

---

## 第三部分：标识符对照（迁移用）

实现代码中历史命名与本文档规范名的对应关系：

| 本文档标识符 | 代码 / GLB 现有键名 | 资源文件 |
|---|---|---|
| `Idle` | `IDLE_CLOSED_EYES` | `tiger-meditate-closed.glb` |
| `Sleeping` | `sleeping`（2D）/ `SLEEPING`（3D 垫底） | 2D：`cloak-sleep/frame_030–034`（双拍 pingpong）；旧 `sleeping/frame_001–008` 保留未删；GLB `tiger-sleeping.glb` |
| `Smiling` | `IDLE_SMILING` | `tiger-meditate-smile.glb` |
| `Celebrating` | `celebrating` → `celebrateDance` / `celebrateDanceV2`（2D，50/50）/ `CELEBRATING`（3D 垫底） | `public/sprites/.../celebrate-dance/frame_001–057.png`；`.../celebrate-dance-v2/frame_001–060.png`；GLB `tiger-happy-jump.glb` |
| `IncenseComplete` | （效果模块，非姿态键） | `IncenseGreeting` |
| `SessionComplete` | `sessionComplete` → `sessionComplete`（2D） | `public/sprites/.../session-complete/frame_001–028.png` |
| `MindfulAcknowledge` | `mindfulAcknowledge` → `nodBow`（2D；`subtype: 'refocus'` 复用） | `public/sprites/.../nod-bow/frame_001–013.png`；**pingpong×1**（正放→倒放回坐姿）+ ~1s CapCut Idle（与 `IntentionSet` 同契约） |
| `stretchReminder` | `stretchReminder` → `stretchReminder`（2D） | `public/sprites/.../stretch-reminder/frame_001–017.png` |
| `Blink` | `BLINK` | 待制作 |
| `Breathing` | （`DynamicMotion` 配置项） | 程序化，无独立资产 |
| `WakeUp` | `WAKE_UP` | 2D：`stretch-reminder` 同源（调试伸懒腰唤醒） |
| `WelcomeBack` | `welcomeBack`（**停接线**） | 素材仍在：`wave-hello` / `wave-hello-pingpong`；**不播** |
| `magicBookReading` | `magicBookReading` → 同名序列 | `public/sprites/.../magic-book-reading/frame_001–046.png`（开场欢迎池试验） |
| `goldenHaloPalms` | `goldenHaloPalms` → 同名序列 | `public/sprites/.../golden-halo-palms/frame_001–094.png`（Honesty≥30 试验） |
| `nodGreeting` | `nodGreeting` → `nodGreeting`（2D） | `public/sprites/.../nod-greeting/frame_001–023.png` |
| `CuriousTilt` | `curiousTilt` → `blinkSmile`（2D；原 `tiltThink` 已停用） | `public/sprites/.../blink-smile/`（默认）；`tilt-think` 仅存量素材 |
| `MilestoneGlow` | `milestoneGlow` → `milestoneGlow`（2D；仅调试） | 主候选 `.../milestone-glow/frame_001–027.png`；备选 `.../breath-halo-hq/frame_001–016.png`（manifest `breathHaloHq`，调试保留）；旧 `breath-halo-expand` 已归档；真实里程碑触发待 Backlog「纪念奖励系统」实现 |
| `IntentionSet` | `intentionSet` → `intentionNod`（2D nod-bow） | `public/sprites/.../nod-bow/frame_001–013.png`（16:9）；Arrival Choose 确认瞬间；旧 palms-together 仅调试 |
| `T_Pose` | `T_POSE` | `tiger-stand-eyes-closed.glb` |

> **`WelcomeBack`（挥手欢迎）说明**：属**响应行为**（互动反应层），非基底姿态。**2026-08-02 晚拍板：新旧挥手暂时停接线**——`playEmotion('welcomeBack')` 不播序列；不进冷启动欢迎池；调试情绪入口已撤；入库素材钮仅保留「停接线·仅素材」标签供以后对照。建议场景（回前台 / Idle≈10min 30%）**以后另议**。优先级低于 `Celebrating`。
>
> **与 Recover 的边界（2026-07-18 拍板）**：`WelcomeBack` 是 Idle **生命感偶遇**，**不是** Five Moments / CORE_LOOP 的 Recover。Recover 家族只含会话内注意力回归（Re-focus Acknowledge + 未来主动 Recover）。本键不占提醒池、不并入 Recover 叙事；禁止改写成「分心回归」文案。见 `CORE_LOOP.md`「Recover 与 welcomeBack 边界」。

> **`nodGreeting`（点头致意）说明**：属**响应行为**素材，**不再**由靠近区自动触发（2026-07-19）；**冷启动开场欢迎池成员**（与 `magicBookReading` 加权；挥手已撤）。调试面板「点头致意」可手工播；**正放一次**后 CapCut 回 `idle-breathing`（**不加**倒放）。**fps 6** + 末帧多停约 2 拍。默认 Idle = 呼吸×5→眨眼；禁止把点头编入自主节奏。

> **`magicBookReading` / `goldenHaloPalms`（2026-08-02 试验）**：已烘焙 pingpong 帧，正放一次；**fps 4**（相对初入库 8 放慢 50%）。`magicBookReading` 末帧可接 Idle → **回落硬切（无 CapCut）**；`goldenHaloPalms` 仍 CapCut。开场池 / Honesty≥30 试接线；验收前勿标永久产品定稿。

> **`CuriousTilt`（静止好奇）说明**：属**响应行为**。鼠标位于老虎靠近区、位移不超过 6px 且持续静止 4 秒后触发 `curiousTilt`。**视觉（2026-07-19）**：改播 `blink-smile` 单次（替代原 `tilt-think` 托腮，因与 idle 硬切跳跃过大）；180ms cross-fade 进出，播完回归 `idle-breathing`。触发后冷却 6 秒。`tilt-think` 素材仍入库，仅调试可手工试播，不再作本键默认视觉。

> **IdleOrchestrator（2026-07-20 确认）**：属**自主行为**，不注册独立 emotion key。
>
> **正式默认（唯一）**
> 1. `idle-breathing` 完整 pingpong **×5**（约 **2.5 fps**）
> 2. 单次一瞥 `idle-eye-glance`（`loopMode: none`；180ms cross-fade + freeze）
> 3. 回到步骤 1 —— **偶尔看看 = 闭目基底上的睁眼一瞥**（勿用 `blink-smile`，其首末睁眼与 idle 不衔接）
>
> **禁止**把张望 / 哈欠 / 喝茶 / 摇耳等挂进 Idle 随机池或自动插入（衔接多有问题；产品决定逐条验收后再接线景）。
>
> **候选陪伴手势（已入库 · 非 Idle）** — 见 `companionGestureCatalog.js`；调试用「入库素材 / 组合试播」，**勿**经 IdleOrchestrator。未来可接 Rise / Recover / 互动等场景：
>
> | id / 序列 | 建议场景用途 |
> |---|---|
> | `gazeLookAround`（p1→p2→p3→p4） | 看向某处、生命感；产品好奇池与调试「组合试播」整段**同抗闪契约**：离开 Idle `clear:false`、段间硬切、产品播完 CapCut 回 Idle（调试可定格不回） |
> | `teaDrinking` | 会话间隙温馨确认（非完成庆祝） |
> | `yawnStretch` | 久无互动轻提示；≠ stretchReminder |
> | `earWiggleHeadTouch` | 亲密回应 / 偶发俏皮（**正放+倒放一次**烘焙 → ~1s CapCut Idle；禁 player pingpong） |
> | `cloakSleep` | **进 DORMANT 过渡（已接线）**：live 非 DORMANT→DORMANT 时披毯→`sleeping`；**冷启动 `onAppReady` 不播**；≠ Rise |
> | `blinkBreathe` | 调试候选；**Rise 主路径已改** `riseStretchCasual` |
> | `riseStretchCasual` | **已接线 Rise（中途主动结束）**：`playEmotion('riseStretchCasual')` pingpong（正放伸懒腰→随意坐→倒放回闭目）；Reflection 结束后回 Idle / Sleeping；**不**用于达标 Celebrating / SessionComplete |

---

## 第四部分：资产与验收检查项

实现任一渲染技术栈时，须能验收以下行为（摘自 `DESIGN.md` + `ARCHITECTURE.md`）：

- [ ] 五种用户向基底/反馈状态均可触发：`Idle`、`Sleeping`、`Smiling`、`Celebrating`、`IncenseComplete`
- [ ] `Blink` 可在静息/微笑态随机叠加，单次播放
- [ ] `Breathing`（及默认 `Rotation`）在任意姿态下持续可见
- [ ] `Celebrating` 每日最多一次；播完进入 `Smiling` 直至次日
- [ ] 每次完成专注均获得 `SessionComplete` 轻量确认；当日首次达标由 `Celebrating` 替代，不叠加
- [ ] `IncenseComplete` 轻量反馈，不替代 `Celebrating`
- [ ] 所有一次性 / 响应性情绪反馈均完成「触发 → 表现 → 自动回归**类似坐禅的**坐姿呼吸基底」闭环，无卡态（**不**刻板要求像素级对齐默认闭目 `idle-breathing` 第 1 帧；见 `PRINCIPLES.md` 2026-07-19 修订）
- [ ] `Sleeping` 可叠加 `SnoringZZZ`；Honesty Check-in 后 `dormantWake` → 非 DORMANT 基底，并按所选时长等价记账
- [ ] 姿态切换 cross-fade，锚点对齐，无跳动
- [ ] 粒子/氛围系统与姿态独立，可多发射器同屏叠加

---

## 第五部分：互动反应清单（按刺激源分类）

下列互动反应是情绪表现的**刺激驱动层**：在既有基底情绪状态之上，由指针/会话/时间/里程碑等外部刺激触发的短暂、持续或情境化反馈。实现时仍通过 `EmotionController`（或同等统一接口）调度，并遵守 `PRINCIPLES.md`「不制造焦虑原则」。

**措辞/表现已按修正版定稿**（不以原始负面/焦虑版本为准）：鼠标绕圈、专注中断、长时间无互动、摸头与庆祝互斥规则；以及本文升级后的「伙伴式亲密互动」设计。角色定位是正念伙伴，不是需要喂养、维持健康或承担照料责任的传统电子宠物。

### 鼠标/指针类交互

| 刺激源 | 老虎反应 | 备注 |
|---|---|---|
| 鼠标靠近 | **默认不反应**（不再自动点头） | **2026-07-19**：用户反馈开局默认态不应出现点头 → 已从 `PointerInteraction` 靠近链路拆除 `nodGreeting`。素材与调试「点头致意」保留；勿再把靠近点头编入 Idle 自主节奏。 |
| 眼睛跟随鼠标（持续追踪） | — | **已放弃，原因见 `CORE_LOOP.md`「已废弃：EyeTracking 实时瞳孔跟随鼠标」**。不再做实时瞳孔叠层跟随；看向某处改由 Idle 离散张望（gaze-p1～p4）等序列表达。 |
| 鼠标停留并点击头顶 | 微笑、眯眼 | |
| 抚摸头顶（按住左键滑动） | **分阶段递进**（见下表） | 欢呼（`Celebrating`）播放期间摸头**忽略、不排队**。阈值可按手感微调 |
| 轻点鼻子（Boop） | 眨眼 | 单次点击 |
| 连续快速点击鼻子 | 单一层级的轻松「无奈」卖萌（如表情 / 「嗷？」文字气泡） | **禁止**随点击次数递增越来越负面/不耐烦；不模拟「惹恼」或情绪升级 |
| 轻微拖拽尾巴 | 尾巴弹回原位，老虎回头看一下拖拽方向 | 仅检测小幅度拖拽，不做暴力/用力拖拽判定 |
| 鼠标快速绕圈 | 眼睛跟随转动两圈，随后无辜地眨眨眼 | **表现调整**：避免「晕眩不适」（画面旋转、痛苦表情），保持轻松卡通与「安详陪伴」调性；若实现须用序列帧，**勿**复活已废弃的实时瞳孔叠层 |
| 鼠标长时间不动（老虎附近） | 温和眨眼（2D `blink-smile`） | 靠近区内位移 ≤6px、持续 4 秒触发 `curiousTilt`；**仅 smiling**（闭目 idle 已有呼吸×5→眨眼节奏，再插会打断）。冷却 6 秒。原托腮已停用（2026-07-19） |

#### 抚摸头顶 · 分阶段递进反应

| 抚摸持续时长 | 反应 |
|---|---|
| 0–1 秒（刚开始） | 微笑 |
| 1–3 秒（持续） | 眼睛眯起 |
| 3 秒以上（持续较久） | 眼睛完全眯起、耳朵放松下垂、尾巴轻摇、身体轻轻左右晃动 |

初始阈值以上表为参考，实现后可根据实际手感微调。规则不变：若当前正在播放 `Celebrating`，抚摸交互被忽略，不排队。

#### 眼睛跟随鼠标 · 已放弃

**已放弃，原因见 `CORE_LOOP.md`「已废弃：EyeTracking 实时瞳孔跟随鼠标」。**  
不再维护独立瞳孔叠层 / 实时跟随实现要点。角色视线变化用 Idle 张望序列（gaze-p1～p4）等一次性动画表达。

> **`lookAtCursor`**：历史靠近占位键；靠近自动点头已拆除（见上）。持续瞳孔跟随语义已放弃（同上）；键保留为兼容空操作，勿再接视觉。

### 专注会话相关

| 刺激源 | 老虎反应 | 备注 |
|---|---|---|
| 用户开始专注会话 | 坐正，进入冥想姿势 | 对应 `Idle` 状态 |
| 专注持续 5 分钟 | 做一次深呼吸动作 | |
| 完成一次专注会话 | 微笑、点头、合十或做一次呼吸 | 每次完成均触发轻量 `SessionComplete`；若为当日首次达标，则由完整 `Celebrating` 替代 |
| 同日后续完成专注会话 | 双手合十或温和点头 | 继续使用 `SessionComplete`，不重复完整庆祝 |
| 用户中断专注 | 安静等待、偶尔张望 | **措辞与表现修正**：不以「托腮思考、略显失落」为设计；按「不制造焦虑原则」定为**中性等待感**，不表现因用户离开而产生的失落/难过，强调「我在这里陪着你」而非「你让我失望了」 |
| 用户重新回来 | 开心挥手欢迎 | 情绪键 `welcomeBack`（2D 序列 `wave-hello`）；一次性播放，播完回落 `Idle` |
| 当日尚未完成任何练习 | **Idle 闭目坐禅**（不上 Sleeping）+ 可忽略 Honesty 轻量提示 | 提示文案：`Quiet time elsewhere can live here too.` / 「别处的静心，也可以记在这里。」（邀请式；含首日）；可忽略、非强制 |
| 用户完成 Honesty Check-in | 已在 Idle：选时长 → 呼吸引导 → 记账（**不**播 dormantWake）+ 短 `mindfulAcknowledge`（Slice A）。仅睡态：选时长 → `dormantWake` → 离 DORMANT（**不**叠 nod） | 按所选时长等同一次已完成会话；轻量 toast `HONESTY_CHECKIN_RECORDED` + 桥接；**不占用**共享提醒池。见 `SCENE_ANIMATION_WIRING.md` Slice A |
| 应用内切换语言（ready locale 实际变化） | → `ja`：合十 `palmsTogether`；→ `en`：单程喝茶 `teaDrinking`（无倒放，末 ~1s CapCut）；同日同目标语最多 1 次；Focusing/Celebrating/叠层忙碌跳过不补发 | **Slice A 已实现**；详规 `SCENE_ANIMATION_WIRING.md` / `localeGreeting.js`；**禁止** Celebrating；EN 不用 nod-bow / 已试过的 magic-book |

#### DORMANT 唤醒仪式（Honesty Check-in Ritual）

产品语义与交互全文见 `DESIGN.md`「DORMANT 唤醒仪式（Honesty Check-in Ritual）」；上位原则见 `PRINCIPLES.md`「诚实机制」。本节只固定情绪与文案边界。

- **情绪闭环**：选时长 → **立刻** `dormantWake` 坐起（**3 fps**，呼吸倒计时同期开始）→ **定格末帧**至倒计时结束 → 记账并离开 DORMANT。**不再**在呼吸引导期间保持 `sleeping`。**2026-07-19 暂不接**闭眼坐禅呼吸淡入 / `haloBreathing` / TransitionFX 金光 / FocusVisualizer 叠光。
- **视觉对接**：唤醒时的金色效果必须走既有光环 / Rim Light / FocusVisualizer 路径，禁止另起独立光效；Rim Light 重构未就绪时可用 `setFocusLevel` 占位。
- **限频**：用户主动发起，不扣减 `MindfulAcknowledge` / `stretchReminder` / `Re-focus Acknowledge` 共享提醒池。
- **文案键（已接入 i18n）**：
  - 提示：`HONESTY_CHECKIN_PROMPT` — EN `Yin is sitting with you. Quiet time elsewhere can live here too.` / ZH `阿寅正闭目同坐。别处的静心，也可以记在这里。`（邀请式；禁止盘问）
  - 完成（桥接顶行）：`HONESTY_CHECKIN_THANKS` — EN `Welcome back. Yin is awake.` / ZH `欢迎回来。阿寅醒来了。`
  - 记账确认 toast：`HONESTY_CHECKIN_RECORDED` — EN `Quiet time elsewhere counts, too.` / ZH `别处的静心，也算数。`（成功路径；与微仪式 toast 同级轻量；abort 用 `HONESTY_PENDING_LOST`）
- **禁止**：任何验证性、怀疑性、次等标记类文案或 UI；未达标主动结束时亦不出现「未完成 / 失败」类提示，安静返回即可。

### 时间/作息相关

| 刺激源 | 老虎反应 | 备注 |
|---|---|---|
| 夜晚使用 | 披着小毯子，动作放缓 | live 进 DORMANT 播 `cloakSleep`→`sleeping`（冷启动不播；见 Sleeping 行） |
| 清晨使用 | 打哈欠、伸懒腰 | |
| 无互动约 10 分钟 | **加权随机**（非五五开）：**70%** 闭眼继续冥想（不主动引起注意）；**30%** 看向用户方向并挥挥手（挥手复用情绪键 `welcomeBack`） | **中间层级·已确认**。设计原则：轻量、不打扰；禁止频繁弹窗或紧迫感呼唤。**备注**：挥手相对主动、引人注意；若与安静冥想等概率随机，长期使用会显得频繁呼唤用户，与「不打扰、不干扰专注」原则存在张力。以安静冥想为主、挥手为偶尔小变化，既保留生命感随机性，又不破坏安静陪伴基调。 |
| 无互动约 24 小时 | 自然进入睡眠状态，打呼噜 | **长时间层级**。沿用「不制造焦虑」修正：角色有独立生活节奏，中性「无互动时长」触发；非「不专注」评判或因果报应 |

### 里程碑/长期共同经历

| 刺激源 | 老虎反应 | 备注 |
|---|---|---|
| 连续练习达到里程碑节点 | 播放一次 `MilestoneGlow` 里程碑金辉时刻（见下） + 解锁只增不减的环境纪念细节 | 已确认方向（初始建议节点）：3 天小香炉、5 天首朵莲花、10 天第二朵莲花（后续逐步至满池）、30 天蒲团刺绣、60 天夜间小灯笼 + 白天小茶盏；详见 `PROCESS.md` Backlog「纪念奖励系统」；只增不减、中断不撤回、不制造断签压力；节点数字实现时可统一微调 |

#### MilestoneGlow · 里程碑金辉时刻（分镜定稿，2026-07-15）

比 `Celebrating` **更隆重一档**的仪式性反馈，用于长期里程碑节点（连续练习 7/21/100 天、累计时长节点等），一年仅发生数次，10 秒时长不会廉价化。与 `Celebrating` 的气质分工：每日庆祝是「小老虎替你高兴」（社交性——睁眼、看你、轻拍、摆尾）；`MilestoneGlow` 是「时间的重量被看见」（仪式性——他不睁眼、不做动作、继续坐禅，只是金光与蝴蝶来到他身边）。

**10 秒分镜**（视频源已按此产出）：

| 时间 | 画面 |
|---|---|
| 00–04s | 闭目坐禅，有节律深呼吸；金色边缘光（Rim Light）与环境光配合呼吸动画（4 秒循环）强弱律动——吸气时金光微微收敛、亮部聚焦，呼气时金光向外柔和晕染 |
| 05–08s | 本体固有色不变，轮廓被一层神圣、温暖的金色边缘高光完美勾勒；衣服褶皱、皮毛与衣服边缘、蒲团边缘均反射细腻金色辉光，如晨曦中熠熠生辉的雕塑 |
| 09–10s | 金光中飞来**一只金光蝴蝶**环绕（2026-07-15 修订：原「几只萤火虫」改为单只蝴蝶） |

**设计约束**：

- 本体固有色全程不变，金色全部来自 Rim Light / 环境反射（2026-07-15 视觉原则）；
- 无跳跃、无爆发，符合宁静型游戏化；老虎在最高荣耀时刻依然只是呼吸打坐——金光来了、蝴蝶来了、然后离开，他还是观照者本身（`PRINCIPLES.md`「观照者而非情绪本身」的最强反馈示范）；
- 金光蝴蝶是**一次性过场效果**：10 秒后随金光一同淡去、不留驻，不违反「背景保持极简空灵」拍板（该拍板针对永久性背景添加）；与纪念奖励的永久物（莲花、香炉等）区分——蝴蝶是「时刻」，莲花是「纪念物」，一个流走、一个留下，呼应「情绪来了又走，经历只增不减」；
- 序列结束后自动回归坐姿呼吸基底，无卡态；
- 00–04s 的「金光随呼吸律动」不专属本序列，已定义为 FOCUSING 光环的**通用行为**（见 DESIGN.md「视觉状态」），本序列为其增强版。

---

## 第六部分：阶段性正念认可 MindfulAcknowledge（区别于 Celebrating）

这是比 `SessionComplete`（完成摆尾）和 `Celebrating`（完整庆祝）都**更轻量、更安静**的阶段性反馈，用于正念确认，**不追求视觉强度**。实现时通过 `EmotionController.playEmotion('mindfulAcknowledge' | 'stretchReminder')` 触发动作，文案只引用字典标识符，不写死在业务逻辑里。

| 刺激源 | 反应 | 文案标识符（实际文案见语言字典） |
|---|---|---|
| 连续专注达到 **20 分钟**（**会话墙钟时长**，已确认） | 13 帧小幅点头鞠躬 `nod-bow`（**非**跳跃 / **非**粒子爆发） | `MINDFUL_FOCUS_MILESTONE`（轮换文案池，3–5 句） |
| 活跃专注累计达到 **2 小时**（已确认规则见下） | 17 帧坐姿张臂舒展 `stretch-reminder`（一次性、非跳跃） | `STRETCH_REMINDER`（轮换文案池，3–5 句） |

对应情绪键：`mindfulAcknowledge` 已接 `nod-bow` 13 帧一次性序列；Re-focus 以 `subtype: 'refocus'` 复用同一键与动作，不新建独立 key。`stretchReminder` 已接 `stretch-reminder` 17 帧一次性序列。

> **素材归属判定（2026-07-17）**：`stretch` 与现有 16 帧 `dormant-wake` 本质不同。前者从清醒坐姿起势，双臂向外张开舒展后回到闭眼坐姿；后者从侧卧熟睡过渡为清醒打坐。两者起始姿态、动作弧线、构图与帧数均不同，因此 `stretch` 独立归属 `stretchReminder`，不得替换或复用到 `dormantWake`。Honesty Check-in 仍沿用 `sleeping` → 10s 呼吸 → `dormantWake` 的现有链路；Rim Light / FocusVisualizer 保持现有占位方案。

### 设计原则

- 文案应保持**简短、平静、非命令式**语气，不使用感叹号堆砌或过度亢奋措辞。
- 文案与动作应**同时出现**，短暂停留后**自动消失**；不需要用户点击关闭；**不是**打断式模态弹窗。
- 每个触发场景配备 **3–5 句轮换文案**，随机选取展示，避免长期使用后显得机械重复。
- 强度分级：`MindfulAcknowledge`（克制点头鞠躬）＜ `SessionComplete` / `IncenseComplete`（轻量完成）＜ `Celebrating`（当日首次达标的完整庆祝）。

### 判定与限频规则

#### 1. 20 分钟阶段性认可 · 判定基准

- **按会话墙钟时长**：用户主动开始的**这一次**专注会话，从开始时刻起累计经过的时长达到约 20 分钟即触发。
- **不与** Focus Confidence 可信度分值挂钩对齐。
- **理由**：Focus Confidence 是多信号加权的连续分值，不适合作为离散的「整点触发一次性提示」的判定基准（时机易不可预测）；更适合用于连续渐变视觉（如粒子稳定度），不适合本场景。

#### 2. 2 小时伸懒腰提醒 · 判定基准

- **按活跃专注累计时长**判定，**不是**页面打开时长。
- 用户暂时离开等中断：**不重置**累计，而是**暂停**计数；返回后从暂停点继续累加。
- 仅当中断时长超过阈值（**初始建议：30 分钟无任何活动**）时，才视为「已充分休息」，届时**重新从零累计**。

#### 3. 提醒共享限频池（2026-07-16 已拍板并实现）

- `MindfulAcknowledge`、`stretchReminder` 与 `Re-focus Acknowledge` 共用同一个**本地自然日提醒池**，三类提醒合计每天最多展示 **3 次**，不再采用「每种类型各自每日最多 3 次」的旧口径；
- 三类提醒展示前统一向 `ReminderQuotaManager` 申请额度；任意一种成功展示均从同一计数器扣减 1 次，达到 3 次后当天不再展示任何一类提醒；
- 额度用尽只抑制动作/非模态文案 UI，内部计时与候选事件记录仍可继续；
- 日期边界按用户本地时区的 `YYYY-MM-DD` 自然日键处理，并持久化到 `localStorage`；跨午夜后的下一次额度申请惰性重置，存储不可用时退回本次运行期内存计数；
- `Re-focus Acknowledge` 每场专注会话最多处理 **1 次**符合展示门槛的离开—回归事件；若该次因强反馈冲突或每日额度耗尽而静默，也不排队、不在本会话后续事件补发。

#### 4. Companion Mode 例外（2026-07-16；三选一已落地）

见 `DESIGN.md`「专注会话陪伴模式」。下列子模式关闭离开类提醒（Stay here 除外）：

**I'll step away — wait quietly** / **I'm working across tools**

- `MindfulReminderController.startSession({ suppressAwayReminders: true })`：**关闭**全部 `Re-focus Acknowledge`（`handleAttentionReturn` 早退）；
- `setAttentionAway` **仍生效**，以暂停 2 小时舒展的活跃累计；
- 20 分钟墙钟认可通过 `getSessionElapsedSeconds` 与 `FocusSession` 墙钟对齐，默认仍可触发；
- **across-tools 另有**：`AcrossToolsIdleGuard`（默认 30 分钟无指针/键盘活动）触发一次观察式非模态文案（`ACROSS_TOOLS_IDLE` 池）；不因切页惩罚；
- 本例外**不**改变共享提醒池的每日上限数字本身。

交互：按钮下提示展开三选一；选模式只预选；Sit 才开始；记忆键 `focus-tiger.companion-mode.v1`。产品语义全文以 `DESIGN.md` 为准。

---

## 第七部分：语言设计原则：观察式措辞规范

文案是「观照者而非情绪本身」原则成本最低、影响最深的落地层。`MindfulAcknowledge`、`stretchReminder`、`SessionComplete`、未来 `Re-focus Acknowledge` 及所有非模态提示均须遵守本节。

**通道约束（长期原则）**：角色与系统对用户的沟通**仅限文字**；禁止角色语音、真人配音与 lip-sync 口型动画。技术上即使可复用「图生视频 + 抽帧」预生成带声口型序列，亦不采用。原则全文与四条理由见 `PRINCIPLES.md`「无角色语音原则」。

### 观察式（要求）与定性式（禁止）

**观察式表达**描述一个被注意到的现象：注意力、念头、情绪或时间「升起」「路过」「出去又回来」。它为「我」与当下现象保留距离，强调现象是流动、暂时的；不追问原因、不做归因、不给未经请求的建议，也不要求用户解释或确认。

**定性式表达**直接替用户判断状态、给人格或情绪贴标签，例如「你很烦躁」「你不专心」「你今天很自律」。这会让产品从陪伴者变成评判者，必须禁止。

这种语言距离感可视为认知解离（cognitive defusion）在产品文案层面的朴素借鉴：帮助用户练习「我注意到一个念头 / 情绪」，而不是「我就是这个念头 / 情绪」。产品不因此宣称提供心理治疗、诊断或临床干预。

### 核心交互动词：容纳，而非抓取

产品避免使用 **「Focus」** 这类隐含「用力抓取 / 二元对立」（专注 vs 不专注）意味的动词，作为**核心交互按钮**文案。转而采用 **「Sit / Rise」**（中文：「与阿寅同坐」/「起身」）这类呼应打坐仪式、传达「容纳而非抓取」的动作语言，与角色蒲团打坐的视觉设定相呼应。

- 开始会话与结束会话（无论自然完成或中途起身）共用仪式动词，**不做**「完成 / 放弃」的成败区分文案；
- 此原则适用于**未来新增的核心交互按钮命名**；
- 本节仅为交互文案设计原则，**不影响**产品名称「Focus Tiger」（产品名决策见 `PROCESS.md` Backlog「产品命名」）。

> **检测边界**：当前 Focus Confidence 的 `visibility` / `blur` / `idle` 信号只能观察页面与窗口行为，**不能据此推断用户烦躁、焦虑或其它心理状态**。下表「烦躁信号」示例只用于说明措辞方法；除非未来有用户主动提供或其它可靠且合规的输入，不得把切换标签页等行为翻译成情绪诊断。

### 中英文对照示例

| 场景 | 定性式禁止写法 | 观察式中文写法 | 观察式英文写法 |
|---|---|---|---|
| 检测到烦躁信号（仅在有可靠输入时） | 「你好像有点烦躁。」 / “You seem irritated.” | 「有一点起伏被注意到了。它正在慢慢经过。」 | “A little stirring was noticed. It is passing through.” |
| 走神次数较多 | 「你走神了 5 次。」 / “You lost focus five times.” | 「注意力出去走了 5 趟，也回来了 5 次。」 | “Attention wandered five times, and returned five times.” |
| 专注时长达标 | 「你今天很专注！」 / “You were very focused today!” | 「今天陪你坐了 47 分钟。这段时间被好好看见了。」 | “We sat together for 47 minutes today. That time was noticed.” |
| 长时间未活动 | 「你太久没有专注了。」 / “You have been unfocused for too long.” | 「这里安静了一阵子。你回来时，阿寅还在。」 | “It was quiet here for a while. Yin was still here when you returned.” |
| 完成一炷香 | 「任务完成，做得真棒！」 / “Task complete. Great job!” | 「今天这一炷香，静静走完了。」 | “Today’s incense has quietly reached its end.” |
| 重新回到专注 | 「你终于回来了，刚才不够专心。」 / “You are finally back. You were distracted.” | 「刚才注意力出去走了一会儿。现在，它又回到这里了。」 | “Attention wandered for a while. Now it has returned here.” |

表格中的数字与具体句子是写作示例，不代表新增检测能力、触发阈值或已上线文案。正式文案仍须进入 `src/locales/en.json` / `zh.json`，并准备多个变体轮换。

### 新文案自检清单

1. 是否只描述被观察到的现象，而没有替用户贴情绪、人格或能力标签？
2. 是否隐含评判、命令、催促、原因归纳或未经请求的建议？
3. 是否要求用户确认、解释、点击回应或证明自己已经调整？
4. 中英文两版是否传达同等的观察距离感，而不是一版克制、一版带评价？

### 与触发频率的边界

本节只规范**怎样说**，不决定**何时说、一天说几次**。原有 20 分钟阶段认可与 2 小时伸展提醒的判定基准继续有效；三类非模态提醒的共享自然日限频已于 2026-07-16 拍板为合计每天最多 3 次，详见第六部分「提醒共享限频池」。

---

## 第八部分：回归专注确认（Re-focus Acknowledge）

### 定位

`Re-focus Acknowledge` 是 `MindfulAcknowledge` 机制下的一个**特化子类型**，不是新的基底情绪状态，也不另起 UI 系统。当用户从一次相对明显的分心状态重新回到专注页面时，小老虎给予一句极简、非模态、不追问的陪伴反馈。

在产品叙事上，它属于 Five Moments / CORE_LOOP 的 **Recover 家族**（被动强度）；与 Idle 偶遇挥手 `welcomeBack` **不是同一件事**（2026-07-18 拍板，见 `CORE_LOOP.md`）。

其目的不是宣布「你刚才不专心」，而是以「命名而不评判」的方式轻轻看见：注意力曾离开，现在又回来了。

**Companion Mode**：若本场为 **I'll step away — wait quietly** 或 **I'm working across tools**，则本机制**整场不因**标签切换 / 失焦触发（前者离开是预期陪伴；后者多工具切换不可被判定为分心）。详见第六部分 §4 与 `DESIGN.md`「专注会话陪伴模式」。

### 依赖前提与当前范围

完整设计依赖 Focus Confidence V1 运行时信号链路（Page Visibility / `window.blur` / idle 检测）。2026-07-16 已先实现本机制所需的最小信号切片：`AttentionSignals` 合并 Page Visibility 与 `window.blur/focus`，完成同一次离开事件去重、时长计算和回归通知；**完整 Focus Confidence 分值与 idle 检测仍未实现**。

运行时复用 `mindfulAcknowledge` 情绪动作入口（以 `subtype: 'refocus'` 区分），并复用统一非模态文案条；不新增基底情绪状态。中英文轮换文案已进入语言字典。

### 触发判断逻辑（2026-07-16 已拍板并实现）

1. **分心事件最小定义**：
   - 页面 `visibilityState` 变为 `hidden`，或窗口触发 `blur`；
   - 持续时间达到 **20 秒**才在内部记为候选离开事件，不展示 UI；具名常量为 `DISTRACTION_LOG_THRESHOLD_MS = 20000`；
   - 必须排除用户主动点击「起身 / Rise」、会话自然结束、浏览器关闭等明确结束路径；
   - `idle` 可作为 Focus Confidence 的补充信号，但不能单独推断用户的具体情绪或分心原因。
2. **反馈触发门槛**：
   - 只有离开时长**超过 60 秒**并重新返回时才允许展示；具名常量为 `REFOCUS_DISPLAY_THRESHOLD_MS = 60000`；
   - 零星几秒的标签切换、系统弹窗或短暂失焦不反馈，避免产品显得监视或过度敏感。
3. **频率控制**：
   - 与 `stretchReminder`、普通 `MindfulAcknowledge` 共用同一本地自然日提醒池，三类合计每天最多展示 **3 次**；
   - 单次专注会话最多展示 **1 次**；具名常量为 `REFOCUS_PER_SESSION_LIMIT = 1`；
   - 达到每日或单会话上限后仍可继续内部记账，但不展示动作或文案。

### 呈现方式

- 三类提醒复用统一的 `MindfulAcknowledgeToast` 非模态文案条，不为 Re-focus 单独新建 UI；
- Re-focus 动作复用 `mindfulAcknowledge` 的 `nod-bow` 序列，仅以 `subtype: 'refocus'` 区分文案语境，不新建情绪键；
- 只在用户重新获得页面焦点 / 可见性的瞬间呈现，不在分心过程中追加提示；
- 不弹窗、不追问「为什么」、不要求点击确认、不要求用户解释；
- 动作与文案短暂停留后自动消失，并回归基础坐姿呼吸状态；
- 每条文案遵循「**察觉 + 接纳 + 回归**」三段结构，并准备多个中英文变体轮换。

### 文案变体示例（前三条已进入语言字典）

| 中文 | English |
|---|---|
| 「刚才有一阵什么牵走了注意力。没关系，现在它又回来了。」 | “Something drew attention away for a moment. That is okay. Now it has returned.” |
| 「注意力出去走了一会儿。这里没有催促，回来就好。」 | “Attention wandered for a while. There was no hurry. It is here again.” |
| 「刚才那一段已经经过了。此刻，又回到这一口呼吸。」 | “That moment has passed. Now attention is back with this breath.” |
| 「有一会儿去了别处，也有这一刻重新回来。」 | “There was a moment elsewhere, and now there is this moment of return.” |

### 优先级与冲突规则

- 若触发时刻与 `Celebrating`、`WakeUp`、`IncenseComplete` 或其它更强反馈冲突，`Re-focus Acknowledge` **静默让位**；
- 被让位后不排队、不补发，避免稍后出现「事后追加评判」的观感；
- 若同一时刻恰好完成会话并触发 `SessionComplete`，优先显示完成反馈，回归确认静默丢弃；
- 该反馈结束后必须回到基础坐姿呼吸状态，遵守 `PRINCIPLES.md`「观照者而非情绪本身」闭环。

---

## 第九部分：多语言文案架构

### 架构原则

项目 UI 中**所有面向用户展示的文案**（含本文档定义的提示语）**不得硬编码在业务逻辑代码中**。

- 文案统一放在独立语言字典文件：`locales/en.json`、`locales/zh.json` 等。
- 业务逻辑只引用**文案标识符**（如 `MINDFUL_FOCUS_MILESTONE_1`）。
- 由统一的文案获取函数（见 `src/locales/i18n.js`）根据**当前语言设置**从对应字典取出实际文字。

### 当前阶段

- 产品名统一为 **Focus Tiger**，产品默认面向海外市场，**英文（`en`）为默认语言**。
- `src/locales/en.json` 与 `src/locales/zh.json` 保持完整同构；中文作为可切换备选语言保留。
- 文档/代码注释可保留中文或英文（不影响 UI）。
- 所有面向用户的 UI 展示文案必须走字典机制；dev-only 调试面板不纳入产品字典。
- `i18n.js` 缺键时回退默认语言英文；运行时语言切换须刷新已渲染 UI，不能要求重新加载页面。

### 文案标识符命名规范

- 全大写下划线：`MINDFUL_FOCUS_MILESTONE`、`STRETCH_REMINDER`。
- 同一场景轮换文案用数字后缀：`_1`、`_2`、`_3`…
- 避免与情绪/交互标识符（camelCase，如 `petHead`）混淆：文案键用 `SCREAMING_SNAKE`。

### 非模态提醒文案池（0.12 已完成观察式改写）

> 0.10 识别出的「做得很好」「继续，慢慢来」「站起来走走」等评价/指令式历史文案已于 2026-07-16 从 `en.json` / `zh.json` 移除。当前三类文案池均使用观察式措辞，中英字典保持同构。

**MINDFUL_FOCUS_MILESTONE**（阶段性专注确认；安静、平和、不夸张）：

1. 「二十分钟，一呼一吸地走到了这里。」
2. 「这一段安静，被轻轻看见了。」
3. 「注意力已经在这里停留了一会儿。」
4. 「安静的此刻，又来了一口呼吸。」

**STRETCH_REMINDER**（过久工作温和邀请；非命令）：

1. 「身体安静了一阵子。此刻，也容得下一点舒展。」
2. 「两个安静的小时经过了。这里也留有舒展的空间。」
3. 「一段长长的静止已经经过。准备好时，身体可以动一动。」

**REFOCUS_ACKNOWLEDGE**（回归专注确认；观察式、不追问）：

1. 「注意力出去走了一会儿。现在，它又回到这里了。」
2. 「刚才那一段已经经过了。此刻，又回到这一口呼吸。」
3. 「有一会儿去了别处，也有这一刻重新回来。」

使用：`t('MINDFUL_FOCUS_MILESTONE_1')` 或 `tPool('MINDFUL_FOCUS_MILESTONE')` 随机取一句。

---

## 第十部分：自主行为与响应行为的分层模型

与语言无关的行为架构补充（实现时与 `PointerInteraction` / 未来 AutonomousScheduler 对齐；**不含**已废弃的实时 `EyeTracking`）。

### 自主行为（Autonomous Behavior）

角色在**无任何用户交互**时仍保持的持续性生命感表现：

| 行为 | 节奏建议 |
|---|---|
| 缓慢呼吸 | 持续（`idle-breathing`） |
| 眨眼（偶尔看看） | Idle：呼吸 pingpong ×5 → `idle-eye-glance` 单次 → 再 ×5… |
| 一瞥 / 张望 A·B / 哈欠 | **正式 Idle 已删除**；素材可留库，默认不调度 |
| 睁眼看向用户 | 每 5–10 秒随机；每次停留 0.8–1.5 秒（确认式短暂眼神交流，非机械固定间隔）——部分由张望/一瞥素材承载 |
| 耳朵轻微抖动 | 每 15–30 秒随机 |
| 尾巴轻摆 | 持续，幅度很小 |
| 微笑 | 始终保持的基础表情（在睁眼/微笑基底态时） |

### 响应行为（Responsive Behavior）

由用户交互触发：鼠标靠近、摸头、点击鼻子、拉尾巴、完成专注、连续工作过长提醒、`MindfulAcknowledge` 等。

### 优先级规则

**响应行为优先于自主行为。**  
例：Celebrating / 摸头递进播放期间，自主眨眼/看向用户应让位或暂停。实时瞳孔跟随（`EyeTracking`）已放弃，见 `CORE_LOOP.md`。

### 核心设计原则（不打扰）

所有自主行为节奏应保持「**不打扰**」：

- 不频繁挥手、不持续跳动、不长时间凝视用户。
- 默认状态下，角色应**绝大多数时间沉浸在自己的呼吸节律中**。
- 只是偶尔以有意图的、温柔的眼神短暂看向用户，而非机械地反复执行固定动作。

本「不打扰 / 克制」约束作用于**主专注界面**；奖励柜场景的动作幅度边界见上文「动作幅度的场景边界」与 `DESIGN.md` 同名小节——娱乐性动作不得因「有趣」越界进入主界面。

---

## 文档维护

| 版本 | 日期 | 说明 |
|---|---|---|
| 0.1 | 2026-07-13 | 初版：基于 `DESIGN.md` v5.0 姿态映射、「今日一炷香」、防挫败沉睡/唤醒机制及当前代码实现状态整理 |
| 0.2 | 2026-07-14 | 新增第五部分「互动反应清单」；四处措辞/表现按不制造焦虑原则修正版定稿 |
| 0.3 | 2026-07-14 | 升级「宠物感」互动：摸头分阶段、靠近参数、无互动中间层、眼睛持续跟随、Boop、拉尾巴 |
| 0.4 | 2026-07-14 | 新增第六～八部分：MindfulAcknowledge、多语言文案架构、自主/响应行为分层；落地 `locales/zh.json` + i18n 骨架 |
| 0.5 | 2026-07-14 | 确认 10 分钟无互动为 70%/30% 加权随机；英文翻译时机写入 PROCESS Backlog（当前不启动） |
| 0.6 | 2026-07-14 | MindfulAcknowledge：确认墙钟 20 分钟、活跃累计 2 小时（中断暂停/30 分钟重置）、每类每日限 3 次 |
| 0.7 | 2026-07-14 | 新增响应行为情绪键 `WelcomeBack`（挥手欢迎）：立项 + 标识符对照 + 触发源标注；接入首组 2D `wave-hello` 序列作为 2D 播放器验证动作 |
| 0.8 | 2026-07-15 | 本地化方向更新：产品名统一为 Focus Tiger，英文改为默认语言、中文保留切换；英文/中文词典同构，HUD / 按钮 / 提示接入 i18n |
| 0.9 | 2026-07-15 | 对齐 PRODUCT_POSITIONING：角色统一为正念伙伴而非传统电子宠物；新增 SessionComplete 每次完成轻量确认；Celebrating 收敛为每日首次达标的短暂温暖庆祝；长期成长改为只增不减的共同经历与纪念奖励 |
| 0.10 | 2026-07-15 | 新增「观察式措辞」强制规范与 Re-focus Acknowledge 设计；确立情绪自动回归坐姿呼吸基底；因新增回归提示，原 0.6「各类每日 ≤3 次」独立限频口径重新开放为共享限频池待拍板 |
| 0.11 | 2026-07-15 | 立项 `MilestoneGlow` 里程碑金辉时刻（优先级 110，10s 分镜定稿，金光蝴蝶版）；「金光随呼吸律动」定义为 FOCUSING 光环通用行为；明确 MilestoneGlow 与 Celebrating 的仪式性/社交性分工与冲突规则 |
| 0.12 | 2026-07-16 | 拍板并实现三类非模态提醒共享每日总额度 3 次、Re-focus 每会话最多 1 次、20s 候选记账 / 超过 60s 回归展示；新增统一非模态 UI 与观察式中英文文案池 |
| 0.13 | 2026-07-16 | Honesty Check-in：`Sleeping`/`dormantWake` 触发改为「当日零完成 → DORMANT」与补登仪式；互动表新增提示/唤醒行；明确不占共享提醒池、会话等价记账、观察式文案键；与历史 `wakeUp` 拆键 |
| 0.14 | 2026-07-16 | Honesty Check-in MVP 运行时落地：`DailyCompletionStore` + `HonestyCheckInController` / UI；情绪键 `dormantWake`；`getLocalDateKey` 抽至 `utils/localDate.js` |
| 0.15 | 2026-07-16 | 新增 Companion Mode 例外：step-away 会话关闭离开类 MindfulAcknowledge 与全部 Re-focus；产品语义见 DESIGN「专注会话陪伴模式」 |
| 0.16 | 2026-07-16 | 交叉引用 DESIGN「禅意背景音」：本页自播时长可作金光叠加信号；非情绪键、不改优先级表；禁止跨 App 音频探测 |
| 0.17 | 2026-07-16 | 第七部分补充「核心交互动词：容纳而非抓取」；主按钮文案 Sit with Yin / Rise（与阿寅同坐 / 起身）；不影响产品名 Focus Tiger |
| 0.18 | 2026-07-16 | 角色正式名落定：中文「阿寅」、英文「Yin」；观察式示例改用专名；显示名见 CHARACTER_BIBLE / i18n `CHARACTER_NAME`（`tiger-cub` 仍为 characterId） |
| 0.19 | 2026-07-16 | Ambient Soundscape MVP：自播时长 → presenceBoost 叠光效；非情绪键；见 DESIGN 换算系数 |
| 0.20 | 2026-07-16 | Companion Mode 三选一扩展：新增 across-tools；visibility 分心误判缺陷见 DESIGN；Re-focus 在 step-away / across-tools 下不因切页触发 |
| 0.21 | 2026-07-16 | 交叉引用 PRINCIPLES「无角色语音原则」：沟通仅文字，禁止配音 / lip-sync；非 Backlog |
| 0.22 | 2026-07-16 | 新增「动作幅度的场景边界」：主界面克制至 Celebrating；奖励柜可娱乐化（含跳舞）；见 DESIGN |
| 0.23 | 2026-07-16 | Companion Mode 三选一运行时：across-tools + idle 兜底；交互见 DESIGN |
| 0.24 | 2026-07-17 | `Celebrating` 接入 `celebrate-dance`（57 帧一次性）；`Sleeping`/DORMANT 接入 `sleeping`（8 帧 forward 循环）；播完庆祝回归 idle-breathing；场景边界改为以该庆祝弧线为上限 |
| 0.25 | 2026-07-17 | `dormantWake` 接入同源 16 帧睡醒序列；`sleeping` → wake 与 wake → idle 均采用 180ms cross-fade，序列完成回调替代固定 2.8s 回落计时 |
| 0.26 | 2026-07-17 | 鼠标靠近正式视觉改为 `nodGreeting`（23 帧一次性点头致意）；`PointerInteraction` 靠近检测已就绪并改接本键；播完回归 idle-breathing |
| 0.27 | 2026-07-17 | `wave-hello` 素材整体替换为新服装正式版（19 帧）；旧深红袈裟 14 帧下线；`frameCount` 14→19；触发键与一次性播放逻辑不变 |
| 0.28 | 2026-07-17 | 2D 主线默认隐藏 3D canvas；`idle`/`sleeping` 降帧；`Smiling`/`Blink` 接 `blink-smile`；Honesty 唤醒后接 `haloBreathing`；一炷香改 DOM 叠层（莲花/金斑在 Yin 前）；Honesty UI 标题与按钮立体化 |
| 0.29 | 2026-07-17 | `CuriousTilt` 接入 `tilt-think`（20 帧一次性）；修复静止检测依赖 `pointermove`、鼠标完全静止时无法触发的问题；靠近区静止 4 秒触发，冷却 6 秒，播完回归 idle-breathing |
| 0.30 | 2026-07-17 | `SessionComplete` 接入 `session-complete`（28 帧一次性摆尾）；同日后续达标触发并与每日首次 `Celebrating` 互斥；播完回归 idle-breathing |
| 0.36 | 2026-07-18 | 拍板：Recover 家族 = Re-focus + 未来主动 Recover；`welcomeBack` 为 Idle 偶遇、明确不进家族；代码/限频继续分开（叙事边界见 CORE_LOOP） |
| 0.35 | 2026-07-18 | Arrival Practice v2：Sit 后门闩式欢迎/Notice（不落库）/呼吸/Choose；Companion Mode 仍独立；Reflection 按 icon\|typed 回显；`CORE_LOOP.md` 七步状态机入库 |
| 0.31 | 2026-07-17 | `MindfulAcknowledge` 接入 `nod-bow`（13 帧克制点头鞠躬）；20 分钟确认与 Re-focus（`subtype: 'refocus'`）复用同一动作；保留强反馈冲突时静默让位、不补发；`stretchReminder` 继续占位 |
| 0.32 | 2026-07-17 | 判定 17 帧 `stretch` 与 16 帧 `dormant-wake` 为不同动作；前者接入 `stretchReminder`（坐姿张臂舒展，一次性），后者继续专用于 Honesty Check-in 唤醒；光效路径不变 |
| 0.37 | 2026-07-18 | `Celebrating` 第二变体 `celebrate-dance-v2`（60 帧）50/50 随机；新增 `IntentionSet`（`palms-together`）接 Arrival Choose；`breath-halo-expand` / `lotus-front-rising` / `lotus-chest-halo` 仅入库备选（见 `NEW_ASSETS_2026-07-18.md`） |
| 0.38 | 2026-07-18 | Idle 闭目 3D `tiger-meditate-closed.glb` 替换为无红边单色暖浅灰棉麻禅修服/茶服风；正式衣着权威见 `CHARACTER_BIBLE` Costume；旧深红镶边仅备份 |
| 0.39 | 2026-07-19 | IdleOrchestrator：张望 A（gaze-p1+p2）/ 张望 B（gaze-p3+p4）/ yawn-stretch 犯困变体；180ms cross-fade 回落；yawn 权重建议 0.3 待确认（见 `NEW_ASSETS_2026-07-18-B.md`） |
| 0.40 | 2026-07-19 | 闭目坐禅硬约束：默认 idle 池移除眨眼/一瞥/张望；仅保留 yawn-stretch；睁眼变体导出为 `IDLE_OPEN_EYE_VARIANTS` 供显式启用 |
| 0.40 | 2026-07-19 | 回归姿态软化：类似坐禅即可，不强制像素对齐闭目 idle 第 1 帧（`PRINCIPLES`）；`curiousTilt` 仅 idle/smiling 可触发；EyeTracking 用户反馈后暂停主线；IncenseComplete 莲花+金斑须保留给后续荷花布满成长场景 |
| 0.45 | 2026-07-19 | 14 套序列（含 `palms-together` / dance-v2 / nod-bow / session-complete / stretch / milestone-glow / gaze×4 / yawn 等）用新抠图算法整批重出并替换；旧版作废 |
| 0.41 | 2026-07-19 | **正式放弃** EyeTracking 实时瞳孔跟随（`eyeTracking` / 持续跟随语义的 `lookAtCursor`）；原因与结论见 `CORE_LOOP.md`；Idle gaze-p1～p4 不受影响 |
| 0.42 | 2026-07-19 | Companion：Here & Now / Flow State 选中即开计时；Offline Space 仍须 Sit。`curiousTilt` 视觉改 `blink-smile`（停用托腮 `tilt-think` 默认） |
| 0.43 | 2026-07-19 | `nodGreeting` 放慢至 6fps + 末帧多停 2 拍；`wakeUp` 曾误接 `dormant-wake`；Honesty `dormantWake` 6fps、暂不接金光/halo |
| 0.44 | 2026-07-19 | 靠近区**不再**自动触发 `nodGreeting`（开局默认态不得点头）；素材与调试入口保留 |
| 0.44 | 2026-07-19 | `wakeUp` 改接伸懒腰（`stretch-reminder` 同源，独立键）；Honesty 独占 `dormant-wake`，两调试按钮动画不再重复 |
| 0.44 | 2026-07-19 | 调试姿态 `holdPose` 定格末帧；回归原则改为「类似坐禅即可」，不连贯勿硬切默认闭目（见 `PRINCIPLES`） |
| 0.45 | 2026-07-19 | `Sleeping` 至少放慢 3×（4→**1 fps**）；持续态极缓写入 PRINCIPLES；DESIGN Honesty 独占 dormant-wake / wakeUp 伸懒腰 / 暂不接金光 |
| 0.46 | 2026-07-19 | Idle：呼吸×5→眨眼往复（2.5fps）；删除哈欠/张望等其它默认变体；`maxCycles` 接入 SpriteSequencePlayer |
| 0.47 | 2026-07-19 | Honesty：选时长即 `dormantWake` 坐起 → 1s 淡入 idle-breathing（倒计时不再保持 sleeping）；`wave-hello` 去顶点 hold、摇摆段播两遍 |
| 0.48 | 2026-07-19 | Honesty：去掉闭眼呼吸淡入（衔接不成），`dormantWake` 再慢 2×（6→**3 fps**）定格末帧；Companion：Arrival 门闩未就绪时禁用三选一点选，杜绝「选了却不开计时」静默失败 |
| 0.49 | 2026-07-19 | Honesty 定格 → Arrival：离开 `dormantWake` 默认 520ms cross-fade |
| 0.50 | 2026-07-19 | Arrival Breath「Let's arrive together」：放慢 `blink-smile`（**4 fps**）并保持微笑；**不**落入 idle-breathing；合十仍仅 Choose/`IntentionSet` |
| 0.51 | 2026-07-19 | `IntentionSet`：合十正放→倒放回闭目第 1 帧（4fps≈6.8s）；新增「一次性情绪时长标准」与 `ONE_SHOT_DURATION_SEC`；放慢 `sessionComplete`/`nodBow`/`stretchReminder`/`waveHello` |
| 0.52 | 2026-07-20 | `IntentionSet`：960×960 相对 idle 1056×864 的 `displayFit` 同大同落点 + 280ms 淡入；见 `spriteDisplayFit.js` |
| 0.53 | 2026-07-20 | Arrival Dolly：Choose/合十期间保持推近，idle 淡入后再拉回；避免与 displayFit 叠成跳动 |
| 0.54 | 2026-07-20 | Idle：恢复 PRINCIPLES——默认仅呼吸×5→眨眼；调试面板列出全部 `SPRITE_SEQUENCES` 逐条试播 |
| 0.55 | 2026-07-20 | IntentionSet→idle：CapCut 式 **1s** 叠代溶解（定格两帧交叉淡化）后再呼吸 / 拉 Dolly |
| 0.56 | 2026-07-20 | 候选陪伴手势（gaze/tea/yawn/ear/`blink-breathe`）入库 `companionGestureCatalog`，**不**进 Idle 池；调试「组合试播」去掉 `restart idle`（修闭目帧假闪） |
| 0.57 | 2026-07-20 | `breath-halo-hq` / `blink-breathe` 改 pingpong；张望 A+B 合并为单一组合试播；`blinkBreathe` 接入 Rise 点击 |
| 0.58 | 2026-07-20 | **CapCut 式叠代**定为硬性衔接标准（§1.6 / PRINCIPLES / ARCHITECTURE）；`_finishOneShot` 默认 `CAPCUT_DISSOLVE_MS` |
| 0.59 | 2026-07-20 | pingpong 顶点补 2 拍停留；Choose 改 16:9 `intentionNod`（去合十）；Sit dock 抬 z-index 防 Honesty 抢点；Choose 确认立刻开门闩 |
| 0.60 | 2026-07-20 | Rise 主路径改 `riseStretchCasual`（`rise-stretch-casual` pingpong）替换 `blinkBreathe`；倒放回闭目衔接 idle |
| 0.61 | 2026-07-20 | `cloak-sleep` 入库-only（`cloakSleep`）；**2b 拍板**：当日首次进 DORMANT 播一次→`sleeping`；**2c 未接线** |
| 0.62 | 2026-07-21 | `HONESTY_CHECKIN_PROMPT`：盘问式「Practiced elsewhere today?」→ 邀请式「Quiet time elsewhere can live here too.」；明确触发=当日零完成（含首访），非「离开很久」 |
| 0.63 | 2026-07-21 | `dormantWake` 试替：`cloak-sleep` **倒放**（34 帧 @ 6fps）取代 `dormant-wake` 正放；末帧定格合掌坐姿；原 dormant-wake 素材保留 |
| 0.64 | 2026-07-22 | Honesty 成功记账轻量 toast `HONESTY_CHECKIN_RECORDED`（对齐微仪式；abort 仍用 `HONESTY_PENDING_LOST`） |
| 0.65 | 2026-07-25 | `Sleeping` 睡姿循环改 `cloak-sleep` 末尾 030–034 双拍 pingpong（先 034→030），接续披毯入睡末帧；弃用旧 `sleeping/` 8 帧主线 |
| 0.66 | 2026-07-25 | `Sleeping` 节奏 **1→2 fps**（用户反馈过慢；仍属极缓） |
| 0.67 | 2026-07-26 | 冷启动 `onAppReady` 禁进 DORMANT / 不播 `cloakSleep`（开场即睡回归）；**拍板**回前台 ≥2h live sync **继续披毯进睡** |
| 0.68 | 2026-07-31 | 交叉引用 `SCENE_ANIMATION_WIRING.md`：场景→动画接线表；v1.0.0 Slice A（切语合十/鞠躬、Honesty Idle 短点头）；互动表补语言切换行 |
| 0.69 | 2026-08-01 | 场景接线表整合设计师建议：库存须进业务（A′+B 一批 / C）；完成池禁止混入 Celebrating；日语切语目标仍为合十；Honesty 分界锁定 ≤20 / ≥30；Dispatcher 必做 |
| 0.70 | 2026-08-01 | Slice A′+B 实现：`palmsTogether` 切语；`breathHaloHq` Honesty≥30；`sceneAnimationDispatcher` 事件/加权/冷却；完成与微仪式同档轻量池（禁 dance） |
| 0.71 | 2026-08-01 | `WelcomeBack`：`waveHello` 改为 pingpong×1 再 CapCut 回 Idle；`nodGreeting` 对照末帧后仍正放一次（不加倒放） |
| 0.72 | 2026-08-02 | `WelcomeBack` 改 `waveHelloWelcome` 烘焙正+倒一次（禁 player pingpong：倒放后会再正放） |
| 0.73 | 2026-08-02 | 误诊「仅正放」撤回；根因 oneshot `_finish` hide 跳过 CapCut；`WelcomeBack`/`earWiggle` 烘焙正+倒一次 + CapCut |
| 0.74 | 2026-08-02 | 冷启动欢迎池撤出 `welcomeBack`；开场仅 `nodGreeting`（挥手观感未验收） |
| 0.75 | 2026-08-02 | 入库试验：`wave-hello-pingpong` / `magic-book-reading` / `golden-halo-palms`；欢迎池加权重开；Honesty≥30 → `goldenHaloPalms` |
| 0.78 | 2026-08-02 | `MindfulAcknowledge`：nod-bow 改 pingpong×1 + CapCut（对齐 IntentionSet；修 Honesty＜30 / 切语 EN 鞠躬无法回 Idle） |
| 0.79 | 2026-08-02 | 切语 EN：`magicBookReading` 单程 + CapCut（告别 nod-bow 过密）；ja 仍 `palmsTogether` |
| 0.80 | 2026-08-02 | 切语 EN 看书：QA 去掉末尾叠化 → 与欢迎池同 **硬切** Idle |
| 0.81 | 2026-08-02 | 切语 EN：改 `teaDrinking` 单程 + CapCut（看书硬切已 OK；换茶） |

**变更原则**：新增情绪状态须先在本文档立项并说明触发/优先级，再进入技术选型与实现；不得仅在代码中「悄悄」增加未文档化的状态。UI 文案须走语言字典，不得硬编码进触发逻辑。
