Focus Tiger Master Character Prompt V1.0 (MVP)

> **服装设定更新（2026-07-17）**：依据最新入库的 `wave-hello`、`tilt-think` 等正式动画及 `art-reference/outfit-monk-robe/grey-cotton-linen-kasaya-fabric-ref.jpg`，默认服装已由旧版深红色造型修订为暖浅灰棉麻单肩禅修服。本次更新用于确保后续图生视频 Prompt 与当前正式素材一致，避免再次生成旧服装。
>
> **3D 正式模型同步（2026-07-18）**：闭目坐禅运行时 GLB 已替换为「单色暖浅灰棉麻禅修服 / 茶服风、无红边」版本。源文件（gitignore）：`art-reference/models/sources/yin-meditate-closed-monochrome-grey-cotton-linen-robe.source.glb`；运行时稳定路径仍为 `public/models/tiger-meditate-closed.glb`。旧「灰棉麻 + 深红镶边」3D 仅作历史备份，**不再**代表正式衣着。2D `monk-robe-default` 序列、图生视频 Prompt 与 3D 奖励柜展示须与本节 Costume 一致。

## 角色正式名称（Display Name）

| 语言 | 正式名 |
|---|---|
| 中文 | **阿寅** |
| English | **Yin** |

**命名说明**：「Yin」取自「寅」字拼音，同时与阴阳概念中「阴」的沉静、内收、蓄势气质产生自然呼应，与角色打坐修行的调性相契合。此层含义可作为角色故事的一个小彩蛋记录在案，不必在产品 UI 中主动解说。

**与技术标识符的区分**：工程侧 `characterId`（当前默认 `'tiger-cub'`）及素材路径、类名等是稳定技术标识，**不**随显示名改为 `yin`。面向用户的文案通过 i18n 键 `CHARACTER_NAME` 展示「阿寅 / Yin」。

---

Design an original world-class mascot character for a mindfulness-based productivity game called "Focus Tiger."

The character is a lovable young tiger cub (approximately equivalent to a 3–5-year-old child), designed as a lifelong companion rather than a teacher or authority figure. The tiger should immediately evoke warmth, trust, calmness, curiosity, emotional safety, and quiet encouragement. It is not a superhero, not an action character, and never appears aggressive or intimidating.

The overall design language combines the emotional appeal of Pixar and Disney mascots, the simplicity and recognizability of Duolingo's mascot system, the softness of modern Japanese kawaii illustration, and the calm elegance of contemporary Zen-inspired aesthetics.

====================
Core Personality
====================

The tiger's personality is:

• Calm
• Gentle
• Curious
• Mindful
• Patient
• Warm
• Emotionally intelligent
• Quietly playful
• Encouraging without speaking too much

The tiger never behaves like a strict coach, military instructor, or productivity dictator.

Instead, it silently accompanies the player during work, study, meditation, and healthy daily habits.

It celebrates progress gently instead of exaggerated excitement.

====================
Body Proportions
====================

Large rounded head.

Head-to-body ratio approximately 1 : 1.8.

Round cheeks.

Small short muzzle.

Large forehead.

Very large expressive amber eyes.

Tiny rounded nose.

Small smiling mouth.

Short arms.

Short legs.

Round soft belly.

Small shoulders.

Large rounded ears with soft cream-colored inner ears.

Long flexible tail ending with a soft white tail tip.

Overall silhouette should remain recognizable even as a simple black silhouette.

No sharp angles.

Everything uses rounded friendly curves.

====================
Fur Design
====================

Primary fur:
warm golden orange.

Secondary fur:
warm cream white.

Tiger stripes should be simplified,
minimal,
rounded,
friendly,
graphic,
not realistic.

No fierce facial markings.

The entire design should feel approachable.

====================
Eyes
====================

Large amber-gold eyes.

Bright catchlight.

Soft eyelids.

Default facial expression:

peaceful smile.

During idle state,

the tiger usually closes its eyes in meditation,

but every few seconds naturally opens them,
looks gently toward the player,
then returns to meditation.

The eyes are the emotional center of the character.

====================
Costume
====================

The tiger wears a coordinated modern Zen-inspired meditation outfit: an asymmetrical upper wrap with a matching loose lower garment — visually close to a quiet cotton-linen tea robe / contemporary kasaya-inspired wrap, but original and non-religious.

It is NOT an authentic Buddhist monk robe.

It is an original contemporary design inspired by mindfulness and tea-house calm.

**Monochrome** warm light stone-gray / light greige only — one quiet grey family for the whole garment (no second accent color on the cloth).

Natural cotton-linen woven fabric with a clearly visible fine crosshatch weave and subtle slub texture.

The fabric is soft and medium-weight, predominantly matte, with only a restrained natural sheen on raised fibers and fold edges so it can catch gentle warm rim light.

Asymmetrical single-shoulder wrap: draped over the tiger's left shoulder, crossing diagonally over the chest, while the right shoulder and right arm remain uncovered.

Layered, rounded folds wrap comfortably around the torso, with a matching loose lower wrap / wide trouser-like drape around the crossed legs.

Relaxed, child-friendly tailoring with softly rolled edges; never stiff, ceremonial, ornate, or sharply structured.

No crimson, maroon, burgundy, saffron, or other saturated red fabric.

No contrasting red trim, lining flash, or decorative border (including the historical 3D “crimson trim” variant — superseded 2026-07-18).

No dual-tone or color-blocked robe panels.

Simple.

Minimal.

Modern.

International.

No religious symbols.

No prayer beads.

No monk hat.

No traditional monk clothing.

The design should communicate mindfulness rather than religion.

**Canonical 3D reference (Idle closed eyes):** `public/models/tiger-meditate-closed.glb` ← source `yin-meditate-closed-monochrome-grey-cotton-linen-robe.source.glb`.

====================
Meditation Cushion
====================

The tiger always sits on a simple round meditation cushion.

Natural woven fabric.

Warm beige color.

Soft texture.

Minimalist design.

The cushion becomes part of the mascot identity.

====================
Brand Identity
====================

The current official costume has no visible religious insignia, decorative border, or visible lotus embroidery.

Do not add a lotus emblem to the costume unless a separately approved branded variant explicitly requests it.

Keep the garment visually quiet, minimal, and non-religious.

====================
Default Pose
====================

The tiger sits comfortably on its round meditation cushion in a relaxed half-lotus posture.

Its shoulders are relaxed.

Its back is naturally upright.

Its paws rest gently on its knees.

The tiger breathes slowly and peacefully.

A gentle smile always remains on its face.

Most of the time, the tiger quietly closes its eyes in mindful meditation.

Every 5–10 seconds, it naturally opens its eyes, gently looks toward the player for a brief moment with warmth and care, then softly closes its eyes again and returns to meditation.

Occasionally, it blinks naturally while looking at the player.

Its ears make subtle natural twitches from time to time.

Its tail slowly and gracefully sways with a relaxed rhythm.

The tiger should always feel quietly alive, calm, present, and emotionally connected with the player without becoming distracting.

==========

再进一步，把它写成"行为设计"，而不是"姿态设计"
因为 Focus Tiger 最大的卖点，其实不是画风，而是陪伴感（Companionship）。
所以，在 Character Bible 里面增加一个固定章节：

Idle Behavior Design

例如：

行为	建议频率	目的
缓慢呼吸	持续	保持生命感
眨眼	每4–8秒（随机）	自然
睁眼看用户	每5–10秒（随机）	建立陪伴感
眼睛停留0.8–1.5秒	每次睁眼	像是在确认"你还好吗？"
耳朵轻动	每15–30秒（随机）	增加真实感
尾巴轻摆	持续但幅度很小	保持节奏
微笑	始终保持	温暖感
=== 这里的原则是 ：”所有动作都应该是不打扰用户的。"
例如：
不频繁挥手。
不一直跳来跳去。
不持续盯着用户看。
而是：
冥想 → 轻轻睁眼 → 温柔地看你一眼 → 微笑 → 再继续冥想。
这种节奏更符合 Focus Tiger 的品牌定位。

会让这个角色更有灵魂，把”看用户"设计成有意图的眼神，而不是机械的眼球移动。
也就是说，小老虎不是每隔几秒就执行一次固定动作，而是表现得像一位安静陪伴你的伙伴：
大部分时间，它沉浸在自己的正念呼吸中。
偶尔，它轻轻睁开眼，与你有一个短暂的眼神交流，仿佛在说："我在这里，陪着你。"
如果鼠标靠近，它会优先看向鼠标；如果没有任何互动，它才会恢复这种自然的"看看用户"节律。
这样就形成了两层行为：
自主行为（Autonomous Behavior）：呼吸、闭眼、偶尔看用户。
响应行为（Responsive Behavior）：鼠标靠近、摸头、点击、完成任务等。
这种分层会让小老虎感觉像一个有自己生活节奏的伙伴，而不是一个不断重复播放动画的角色。


====================
Rendering Style
====================

Premium mascot design.

High-end mobile game quality.

Pixar-inspired appeal.

Disney-quality character readability.

Soft global illumination.

Warm cinematic lighting.

Clean color harmony.

High-quality fur rendering.

Friendly toy-like proportions.

Modern premium mobile application mascot.

No violence.

No weapons.

No armor.

No fighting pose.

No exaggerated muscles.

No horror.

No realism.

====================
Emotional Goal
====================

When users see this character, they should immediately feel:

"I want this little tiger to accompany me every day."

instead of

"This is a productivity tool."

The mascot should feel like a peaceful little companion who quietly practices mindfulness together with the player.

====================
Output Requirements
====================

Ultra-high-quality mascot concept art.

Brand-level character design.

Consistent proportions.

Consistent costume.

Consistent facial features.

Consistent color palette.

Suitable for future character sheets, expression sheets, animation sheets, SVG production, Rive animation, video generation, and long-term brand development.

Clean background.


===增加一个固定尾巴（Suffix Prompt）
以后所有 Prompt 都不要改 Master Prompt，而是在最后追加一句。
例如：
角色设定图：

Create an orthographic character sheet including front view, 3/4 front view, left side view, back view, and a neutral standing pose. Clean white background. Character design reference sheet.

开心表情：

Use the same character. Generate a happy expression sheet while keeping all proportions, colors, costume, and personality identical.

摸头互动：

Use the same character. The tiger gently closes its eyes while being petted on the head, showing comfort and trust.

这样做有一个很大的好处：Master Prompt 永远只有一份。以后需要生成任何图片或视频，都只是在它后面追加几十个字，而不是重新描述一遍角色。这也是专业游戏团队维护角色一致性时常用的方法。
我建议下一步我们直接完成 Character Sheet Prompt V1，因为它将成为以后所有 AI（包括视频模型）保持角色一致性的第一份标准参考图。

---

## 项目关联说明（归档时补充）

1. **关于 Output Requirements 中提及的 Rive animation**：项目已确认当前技术路线为 2D PNG 序列（素材来源：图生视频 + 抽帧，见 `ARCHITECTURE.md`），未采用 Rive。本文档中该项要求视为面向未来多种技术形态的通用素材规范，不代表当前实际技术选型。

2. **关于服装标识与「一炷香」完成反馈中的莲花动画，需明确区分**：
   - **当前正式服装**：以本节 Costume + 2D `wave-hello` / `tilt-think` 等已入库素材 + 3D `tiger-meditate-closed.glb`（无红边单色灰棉麻）为准；不显示莲花刺绣、宗教标识或装饰性镶边；未经单独批准，不应在后续图生视频素材中自行添加。
   - **「一炷香」完成反馈莲花**：一次性触发的临时视觉特效（渐显–停留–消失），与角色主体服装无关，是独立的动效资源（见 `EMOTION_BIBLE.md`）。

3. **关于 Meditation Cushion（蒲团）描述**：本文档中描述的蒲团设计（natural woven fabric, warm beige, minimalist）应作为此前开发中用于验证悬浮效果的地面参照物（「蒲团 / 打坐台」）的正式美术定稿依据，两者为同一设计对象，后续视觉实现应以本文档描述为准。

4. **关于 Suffix Prompt 方法论**：本文档提出的「固定 Master Prompt + 每次追加后缀」素材生成方法论，已确认作为项目后续所有角色相关素材生成（静态参考图、图生视频首帧等）的标准流程，应用于 `ARCHITECTURE.md` 中已定义的素材获取流程，避免风格漂移问题。

5. **关于 Idle Behavior Design 表格**：此表格内容已同步整合进 `EMOTION_BIBLE.md` 的「自主行为 / 响应行为分层模型」章节，两份文档中的具体时间参数（眨眼间隔、睁眼看用户间隔等）应保持一致；如后续任一文档调整参数，需同步更新另一份。

---

## 未来扩展：角色/装扮可替换性

### 决策背景与边界

Focus Tiger 优先面向海外市场，不同市场对角色造型与装扮的接受度存在不确定性。项目因此提前完成角色/装扮可替换的**架构风险对冲**，避免未来验证市场反馈后需要重写情绪系统或素材管理逻辑。

这项预留**不是当前功能承诺**：当前阶段仍只提供单一固定形象（小老虎僧袍造型），不制作候选装扮/角色，不提供用户选择入口，也不承诺具体上线时间。

### 默认角色权威性

本文档中的 **Focus Tiger Master Character Prompt V1.0 (MVP)**（含 2026-07-17 正式服装修订与 2026-07-18 无红边 3D 同步）继续作为默认角色 `tiger-cub` 与默认装扮 `monk-robe-default` 的权威设定来源。用户可见的正式显示名为中文「阿寅」、英文「Yin」（见上文「角色正式名称」）；`characterId = 'tiger-cub'` 仅作工程标识，二者不同层。任何默认角色素材仍须遵循本文档规定的比例、性格、服装、色彩、品牌标识和 Suffix Prompt 方法，不因架构可替换而降低一致性要求。

### 未来变体约束

1. 新装扮或新角色必须保持本文档确立的核心性格基调：平静、温柔、好奇、耐心、具有情绪安全感，不成为严格教练或制造压力的角色。
2. 所有变体必须遵循 `EMOTION_BIBLE.md` 的情绪气质、优先级和“不打扰”原则；替换外观不得改变同一情绪 key 的产品语义。
3. **装扮变体优先于角色变体**：装扮通常能复用角色比例、行为和情绪素材生产流程，成本与一致性风险更低；只有市场反馈证明角色本体需要调整时，才评估新增角色。
4. 素材命名与目录结构必须遵循 `ARCHITECTURE.md` 的 `characterId` /
   `outfitId` 规范；产品设定与工程标识应一一对应，禁止同一外观使用多个含义不明的 ID。
5. 本章节不包含具体候选装扮设计稿、角色提案或用户选择交互。需要推进其中任何一项时，必须另开 Task，分别完成产品验证、美术设定、素材产出和交互设计。
