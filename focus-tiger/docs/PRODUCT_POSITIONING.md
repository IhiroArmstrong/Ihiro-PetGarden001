# Focus Tiger · 产品定位
# PRODUCT_POSITIONING.md

> 版本：1.4
> 最后更新：2026-08-24

本文档定义 Focus Tiger 的**品牌定位、核心使命与产品方向**，回答「为什么做、为用户创造什么价值、哪些方向符合品牌」。首要用户、JTBD、竞争替代品、成功指标、付费与隐私假设见 `MVP_PRODUCT_DEFINITION.md`（**付费双轨**：A Buy Yin a Tea（不解锁）+ B 进阶内容解锁；B 下 **Sanctuary Lifetime** 买断 ∪ **Yin Membership** 订阅互覆盖，细则见 `task-briefs/task-tech-direction-v1-shell-monetization.md`。**节日主题（Seasonal Theme）**属 B 轨时段氛围权益，见 `task-briefs/task-seasonal-theme-engine-v1.md`）。

在产品语义文档中，本文档层级高于 `DESIGN.md`；`DESIGN.md` 负责把定位转化为当前阶段的具体玩法。`PRINCIPLES.md` 仍是不可违反的硬性红线，任何定位表达和功能提议均不得绕过其「不制造焦虑」「永不消失」「价值优先于复杂度」等约束。

文档职责顺序：

1. `PRODUCT_POSITIONING.md`：品牌定位、使命、长期方向；
2. `PRINCIPLES.md`：不可违反的产品与开发红线；
3. `MVP_PRODUCT_DEFINITION.md`：首要用户、JTBD、竞争、验证指标、付费与隐私假设；
4. `PRODUCT_MOMENTS.md`：一天中的 Five Moments 产品叙事框架（Arrive / Focus / Recover / Transition / Reflect），位于定位之下、任务排期之上；
5. `CORE_LOOP.md` / `ARRIVE_MOMENT_DESIGN.md`：单次会话七步状态机与 Arrival Practice 交互详规；
6. `DESIGN.md`：当前产品语义、体验循环与玩法；
7. `EMOTION_BIBLE.md` / `CHARACTER_BIBLE.md`：情绪行为与角色设定；
7a. `SCENE_ANIMATION_WIRING.md`：场景 → 动画接线表（哪一用户时刻播哪一档；v1.0.0 Slice A 范围）；
8. `ARCHITECTURE.md`：技术实现和模块边界；
9. `PROCESS.md` / `TASKS.md`：阶段范围、协作流程与排期。

---

## 一、核心主题（Core Theme）

**中文定位**

Focus Tiger：一只陪伴你练习专注与觉察的小老虎。

它不是监督者、老师或效率管理者，也不是需要用户喂养、维持健康或承担照料责任的传统电子宠物。它是一位安静的**数字正念伙伴（Mindful Digital Companion）**，陪伴用户：

- 回到当下；
- 培养专注能力；
- 为进入心流创造条件；
- 通过微小、可持续的练习，逐渐变得更稳定、更清醒。

**English positioning**

> Focus Tiger is a mindful digital companion that helps people cultivate focus, presence, and flow through regular practice, at their own pace.

对外英文为默认表达。**v1.0.0 发版对外定位为 English + Japanese**（可点切换）；中文等语种字典可保留在工程内（draft），待审校并决定声称后再露出。

---

## 二、核心使命（Mission）

> **Helping people return to the present moment.**

现代人长期面对信息过载、无限刷屏、注意力碎片化、多任务切换与焦虑。Focus Tiger 不追求「让用户完成更多」，而是帮助用户：

> 更专注地做真正重要的事，并觉察自己是否回到了当下。

这里的「觉察」不是系统对用户作出「真的专注 / 不够专注」的二元评判。产品应创造练习条件、提供温和反馈，但不对用户的人格、自律程度或专注真假打分。

---

## 三、产品哲学（Product Philosophy）

### 1. Focus is a skill, not a personality trait

专注力不是固定天赋，而是可以通过一次次练习逐渐培养的能力。

### 2. Awareness before productivity

觉察优先于效率。产品首先关心用户是否有机会停下来、回到当下，而不是完成了多少任务。

### 3. Companion, not controller

小老虎通过呼吸、眼神、动作和情绪回应提供陪伴，不催促、不训诫、不监督，不以负面状态迫使用户回来。

### 4. Growth through small moments

一次专注、一次深呼吸、一次主动放下干扰，都是有效练习。产品鼓励**regular practice, at your own pace**，不把每日签到或连续天数变成压力。

### 5. Progress without judgment

用户成长体现为练习经历的积累和对当下的觉察，而不是人格等级、健康评分或失败记录。

---

## 四、当前产品边界

Focus Tiger 的长期主题可以覆盖专注、觉察与心流，但**当前产品仍只把「专注陪伴」这一件事做深**：

- 当前核心输入是用户主动开始的一次专注会话，默认 **10** 分钟但允许调整（档 **10 / 15 / 25 / 45**）；
- 当前主体验是小老虎在专注过程中安静陪伴，并在完成后给予分级情绪反馈；
- 当前不扩展为睡眠、运动、情绪治疗或综合健康数据仪表盘；
- 当前不承诺 AI 教练、心理咨询、儿童产品或企业员工管理功能；
- **Wellness disclaimer（2026-08-14；2026-08-15 改落点）**：应用内须说明本产品是专注力 / 正念练习空间，用于 build focus skill、practice mindfulness、reduce everyday stress；**不是**医疗器械、心理诊疗或诊断，**不能**替代持证咨询师、治疗师或医生；并含标准化兜底句 **not intended to diagnose, treat, cure, or prevent any disease**。落点：（1）**常驻查阅（默认）**：**?** → `#onboarding-app-purpose` 免责区块（不在冷启动自动弹出，以免吓跑用户）；（2）Privacy Sheet 一句交叉引用；（3）QA 仅 `?wellnessFirst=1` 可强制 `#onboarding-wellness-first` Got it 卡。文案键 `HINT_APP_PURPOSE_WELLNESS_*`（en + ja）。禁止把功能写成治疗焦虑、抑郁或其它临床病症。危机语料 `confide` `safety-01` 须与此边界一致（指向真实求助渠道 + 不能代替专业帮助），不另写一套。红线见 `PRINCIPLES.md`「一般身心练习，不是诊疗」。
- 当前不因长期愿景而提前实现多角色、换装 UI、多场景、成就墙或复杂成长树；
- **向阿寅倾诉**（规划中）：用户主动触发时，阿寅是**禅意倾听者**（机锋 / 茶友），不是答疑教练。**默认**本地分类 + 人工语料检索。**唯一已拍板例外**：仅限 Electron **宽屏**、用户主动打开的同一入口、仪式文案与 Confide 语料都未接住时，才允许受约束短生成——**不是**全面允许生成；**窄屏 / 手机没有本地智能体**（见下「禅意倾听者」；Web/PWA Brief `task-confide-to-yin-v1.md`；桌面例外 Brief `task-desktop-on-device-companion.md`）。

长期愿景不是当前功能承诺。任何扩展仍须遵守 `PRINCIPLES.md` 的「价值优先于复杂度」与 `PROCESS.md` 的立项流程。

---

## 五、核心体验循环（Focus Loop）

```
开始一次专注练习
      ↓
小老虎安静陪伴
      ↓
完成本次专注
      ↓
获得温和、可感知的情绪反馈
      ↓
练习经历被记录，共同经历逐渐积累
      ↓
用户在合适的时候再次回来
```

产品不应演化成复杂待办或项目管理工具。

**Session Intention / Arrival Practice（✅ v2，2026-07-18）**：点击 Sit with Yin 后进入 Arrival Practice（欢迎 → Notice 不落库 → 呼吸 → Choose 落库回显）→ Companion Mode → 再 Sit 开始。可整体/分步跳过。详规见 `ARRIVE_MOMENT_DESIGN.md` / `CORE_LOOP.md`。

---

## 六、小老虎的角色定义

### Mindful Companion，而非传统电子宠物

小老虎的心理角色更接近：

- 一位安静的朋友；
- 一个与你一起练习的人；
- 一个提醒你回到当下的小生命。

摸头、轻点鼻子（Boop）、眼睛跟随、挥手等互动可以保留，因为它们增强生命感与情感连接；但所有用户可见文案和系统机制必须避免：

- 喂养、饥饿、生病或健康下降；
- 因用户离开而悲伤、失望或责备；
- 要求用户承担照料责任；
- 把角色包装成需要不断收集的宠物；
- 用稀缺、退化或失去制造回访压力。

内部工程命名中的历史 `pet` 字样可按成本逐步清理，不要求为改名而破坏稳定代码；面向用户的产品语义必须统一为 companion / mindful companion。

### 禅意倾听者（Confide to Yin · 2026-08-10 拍板；2026-08-18 窄范围例外）

阿寅在主动倾诉场景中的角色是**禅意倾听者**，不是 AI Coach。

**默认（仍有效，未被废止）**：

- **少即是多**：日常 90% 用规则 / 模板与既有姿态短句；仅用户主动「向阿寅倾诉」时进入更贴合的回应。
- **检索不生成**：该 10% 场景 = 本地情绪桶分类 → 从人工语料库取一句；**禁止**模型现场写对用户说的话。
- **分类不得发挥**：规则 / 关键词匹配；匹配失败走**固定兜底路由**（安静点头 / 抿茶类）；**禁止**模糊打分硬凑标签。
- **AI 合法位置（默认）**：离线扩写候选语料，经人 review 后入库——AI 造内容，不直接对话。
- **入口（v1）**：Idle ⋯ / 抽屉显式项 + **宽屏左上倾听耳 / 窄屏 ActionBar 耳钮**（同一张卡）；不占用轻触阿寅（留给其它轻反馈）。Web / PWA **只有**这一条检索路径。

#### 桌面端窄范围例外（2026-08-18 拍板 · **非**全面推翻）

> **批复措辞（硬）**：**仅限桌面端受约束生成、其余场景仍然检索不生成。**  
> 禁止把本条读成「全面允许生成」或拿去扩大到 Web、PWA、Whisper、Recover、提醒、Arrival、Reflection。用户需求可以开一个小口子，**不能**废掉「可控、安全、不让阿寅乱说话」的精神。

| 0.4 问 | 批复 |
|---|---|
| 是否修订「禁止运行时生成」 | **窄例外，不是废止。** Web / 移动端 PWA / 已审仪式文案 **仍检索不生成**。 |
| 与 Confide 入口 | **合并成一个** Idle 菜单项（禁止并排「倾诉」和「AI 阿寅」）。**端侧生成只挂宽屏 ⋯**（产品壳 `≥480px`）。窄屏抽屉 **没有**本地智能体；若 v1 Confide 检索已挂载，窄屏仍只走检索不生成。 |
| 触发 | **仅用户主动、仅 Idle。** 不主动开口；Focusing / 切走回来 / 到点提醒 **不得**生成。 |
| 视口 | **本地小模型智能体 = Electron + 宽屏。** 手机浏览器、未来 Capacitor、以及把窗口拖到窄屏壳（`≤479px` 抽屉）都 **不提供**该能力——统一内存 / 散热 / 原生库都跑不顺，不是「功能对等漏做」。 |

生成只允许落在路由最后一层，且须同时满足：Electron 壳内、**当前为宽屏壳**、用户已打开该面板、安全阀未命中、产品仪式池未承担、Confide 情绪桶未命中。层序锁死：

```text
0 安全（safety_redirect，固定转介句；模型不调用）
  → 1 产品仪式（Arrival / Whisper / Recover / Re-focus / 提醒 / Reflection……已审 i18n）
  → 2 Confide 语料桶（anxious / tired / stuck / sad / scattered）
  → 3 仅 Electron **且宽屏**：自由倾诉短生成（约束：短句、承接不建议、不诊断、不呼吸指令、超长截断）
```

**2026-08-22 拍板（情绪不得落入生成兜底）**：带情绪色彩的输入必须停在第 0 层或第 2 层已审语料，**禁止**落到第 3 层生成。日常自述 `depressed` / 抑郁等**并入现有 `sad` 桶**（观察句），**不**升格为最高危机热线，也**不**新开临床诊断桶。单独 `help me` 仍太宽，不进词表。关单级「能聊」：栏杆允许的范围内须接住该句意图；**禁止**不同问题吐同一句套话；有输出 ≠ pass。

技术边界（已认可，实现另 Brief）：`node-llama-cpp` 只在 Electron 主进程（L1 用 Node 子进程 hold，避免 Electron ABI）；模型首次下载不进 DMG；Focusing 时卸载；**窄屏壳不加载、不露出生成入口**。**低配（总内存 ≤8.5 GiB，Mac 与 Windows 同样）默认不出入口。** **L1（2026-08-20 · #362 已合）**：宽屏面板 + 下载进度已接线。**L2（2026-08-20 · 口令已执行）**：Electron 宽屏 fallback 可短生成；Web 仍检索。Checkout 未接。关单级「能聊」**2026-08-25 用户书面已关**（1.7B 问答基本可以）。**付费（2026-08-20）**：**Focus Tiger Pro US$12.99/月**（将来第四卡）含 Base（B 轨）+ 本地智能体（非 Lifetime 路径；Stripe Price 已记、Checkout 未接）。**已买 Sanctuary Lifetime** 走一次性加购 **`companion.addon.lifetime`**（US$29.99 · 将来第五卡 · Price `price_1U6GnXFuIhgJPGLiNlXs0IKe` 已记、Checkout 未接；不进 `isEntitled`）。**一旦接线须两卡同批。** 本地模型仍只 Electron（无壳 = 无本地 AI）；付款可走 Web，接 Checkout 另开。

详规：Web 检索 `task-briefs/task-confide-to-yin-v1.md`；桌面例外 `task-briefs/task-desktop-on-device-companion.md`；种子稿 `confide-corpus-seed.md`。**本拍板不等于已上线功能。**

**Personal Memory（2026-08-24 · 方向锁）**：专有陪伴来自本地外部记忆 + 语言层，**不是**微调。SSOT `YIN_PERSONAL_MEMORY.md`。注入优先级 **Safety > Corpus > Memory 检索 > Qwen**（记忆只在层 3）；危机/情绪桶永不入库；**不进**练习云备份。仪式场景 generate **仍未拍板**。Slice 0–1e 运行时另见 TRACKER / 场景 AG。

**Yin Personalization Engine（2026-08-26 · 方向锁 · L0/L1 本地运行时）**：横跨 Presence / Memory / Journey / Moment 的编排层（何时沉默、取哪几条、政策档）。SSOT `YIN_PERSONALIZATION_ENGINE.md`。运行时 `yinPersonalizationEngine.js`（现网门闩收口，行为不变）。**≠** 品味层（全局手感）**≠** Qwen runtime。核心原则：云端可以让阿寅更懂这个人，但不能让没网时阿寅消失。L2 State Pack **未拍板**。

---

## 七、宁静型游戏化（Calm Gamification）

### Reward Presence, Not Addiction

游戏化用于确认用户的练习，而不是制造新的注意力依赖。

**禁止：**

- 强迫签到；
- 红点轰炸；
- 无限抽奖或概率奖励；
- 稀缺倒计时与错失恐惧；
- 亢奋的等级、连击或刷屏式庆祝；
- 通过角色变差、环境衰败或奖励消失来惩罚中断。

自主行为中的随机节奏（例如偶尔挥手或眨眼）用于保持自然生命感，**不属于随机奖励**；里程碑奖励必须由明确、可解释的练习记录触发。

---

## 八、情绪反馈分级

所有完成都应被温柔地看见，但强反馈必须节制。

### 1. 每次完成：轻量情绪确认

- 每次完成专注会话，都给予简短、平静、非打断式反馈；
- 可使用微笑、点头、合十、一次呼吸或简短文案；
- 不使用强粒子爆发或高强度跳跃；
- 不要求用户点击关闭。

### 2. 每日首次达标：完整庆祝

- 每个自然日首次达到目标时，触发一次 `Celebrating`；
- 语义统一为：**短暂、温暖、有情感的庆祝**；
- 可以舒展、轻跳、鼓掌并出现一轮金色光效，但不是街机式狂欢；
- 同日后续完成仍有轻量确认，不重复完整庆祝。

### 3. 长期里程碑：纪念奖励

- 长期练习可解锁纪念物、环境细节、新的温和动画或奖励柜中的纪念公仔；
- 奖励只增不减，不因中断而撤回；
- 具体里程碑数字、奖励形式与商业化方式须另开任务统一设计。

---

## 九、成长的正确表达

Focus Tiger 不采用「用户专注 → 小老虎更健康；用户离开 → 小老虎不健康」的养成模型。

「共同成长」应表达为：

- 共同经历逐渐增加；
- 环境出现新的温暖细节；
- 获得永久保留的纪念物；
- 解锁新的温和动作或表达；
- 用户回看自己投入过的时间与练习轨迹。

默认状态始终完整、温暖、安全。成长是额外惊喜，不是从缺陷恢复，也不制造照料负担。

---

## 十、主要场景原则

### 进入专注

用户主动开始一段专注时间；小老虎坐好、呼吸，安静地表达「我们一起开始」。

### 专注过程中

小老虎不打扰，只保持呼吸、眨眼、偶尔短暂看向用户。所有自主行为遵守低频、克制、有生命感的节奏。

### 完成专注

按「每次轻量确认 / 每日首次完整庆祝 / 长期里程碑纪念奖励」三级反馈执行。

### 长期陪伴

产品不要求用户每天回来。无论中断多久，小老虎都不会死亡、离开或责怪用户；它只是安静地等待，在用户准备好时继续陪伴。

---

## 十一、品牌定义

**中文**

> Focus Tiger 是一款通过宁静型游戏化陪伴，帮助人们培养专注力、觉察力，并为进入心流创造条件的数字正念伙伴。

**English**

> Focus Tiger is a calm, gamified mindfulness companion that helps people cultivate focus, presence, and the conditions for flow through regular practice, at their own pace.

### Ownership & credit

Focus Tiger™ is a product of Twinsology.

**公开营销域（2026-08-20 拍板）**：`https://twinsology.com`（Slice 0 静态页在 `marketing-site/`；现网 DNS 未绑；练习壳不因本条搬家）。详见 `task-briefs/task-marketing-site.md`。

Created by Ihiro Armstrong Hao Hoh / Twinsology.

Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.

应用内「?」简介卡末尾用 **creator-first colophon**（欧美独立产品 About 气质；专有名词保持英文，不随语种翻译）：

> Focus Tiger™  
> Created by Ihiro Armstrong Hao Hoh / Twinsology  
> © 2026 Ihiro Armstrong Hao Hoh. All rights reserved.

源码文件头与 `LICENSE` 用公司+作者并列的所有权句（见 `src/core/copyrightNotice.js`）。

---

## 十二、长期愿景（Vision）

在 AI 帮助人们变得更快、更自动、更高效的时代，Focus Tiger 选择帮助人保留自己的觉察、专注与内在平静。

这一叙事可作为品牌长期方向，但**不代表**产品已是生成式 AI 教练。若有「向阿寅倾诉」类陪伴，须遵守上文「禅意倾听者」：**默认检索人工语料**；**仅** 2026-08-18 已写明的桌面窄例外允许受约束短生成（且只在 Electron **宽屏**）——不得据此主张全面运行时对话，也不得在窄屏 / 手机做本地智能体。

未来可以研究专注训练、冥想、数字健康、AI 时代的注意力教育等方向；儿童注意力与企业心理健康涉及完全不同的用户、合规、隐私和商业路径，只能作为远期市场假设，必须分别验证并独立立项。

---

## 十三、不可由定位稿绕过的约束

- 英文为默认产品语言，中文作为可切换语言同步维护；
- 用户可见文案必须接入 i18n，不得硬编码；
- 不制造焦虑，不使用健康退化、离开、死亡或失去奖励叙事；
- 不把 Focus Confidence 显示为真假专注评分；
- 老虎本体固有色恒定，金色进度由光环、环境反射与粒子表达；
- 当前主线为 2D PNG 序列，3D 资产保留给奖励柜；
- **既有序列帧不可改、不可盖**（2026-08-20）：禁止改已入库 PNG；禁止为结缘物在 `#sprite-stage` 叠滤镜/器物；结缘物只走周边 DOM 或珍藏卡面（见 `PRINCIPLES.md`）；既有专注金光叠层不在此禁；
- 当前阶段仍是单一角色与默认装扮，不提供换装 UI；
- 一次只做一个任务，长期愿景不得自动进入当前开发范围。

