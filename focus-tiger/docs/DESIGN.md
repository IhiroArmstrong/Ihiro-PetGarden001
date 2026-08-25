# 坐禅小老虎 · 产品设计
# Focus Tiger · DESIGN.md

本文档记录角色设定、状态语义、交互机制与当前玩法。品牌定位与长期方向见层级更高的 `PRODUCT_POSITIONING.md`；任务序列见 `TASKS.md`。

**布局与窄屏**：桌面为主舞台；主流手机浏览器须功能完整、竖屏 P1 可用基线。断点、验收矩阵与横屏建议策略见 **`RESPONSIVE_LAYOUT.md`**（权威）。

**节日主题（规划 · 2026-08-11）**：通用 Seasonal Theme 引擎将在节日窗口为 **B 轨**（Sanctuary Lifetime ∪ Yin Membership）用户切换 App **内部**氛围（姿态/背景/文案）；**不**改变主屏幕 PWA 图标；**不**付费墙 Sit/Arrival/基础 Idle。权威 Brief：`docs/task-briefs/task-seasonal-theme-engine-v1.md`（实现前本文件不描述运行时行为）。

---

## 📌 版本5.0重大更新说明（必读，这是一次架构级转向，不是常规迭代）

本次更新**不是在4.x基础上增删功能**，而是产品定位的重新收窄。原因：
三个健康指标(睡眠/运动/专注)分散了产品的情感焦点，"盆景表达健康水平"这个
隐喻虽然美，但让用户很难在3秒内读懂"我现在做得怎么样"。收窄到单一指标后，
产品应该做的是把"专注、抓住当下"这一件事做深，而不是做广。

### 明确废除的设计（不是"移到二期"，是彻底不做）
```
❌ 睡眠指标 + 月亮/夜空场景系统
❌ 运动指标 + 瀑布/溪流场景系统
❌ 盆景三分区世界观(夜空区/古树区/溪流区)
❌ 三种果实喂养机制(活力浆果/心流薄荷/月光饴糖)
❌ "离家出走"叙事 + 三封分场景的信
❌ 小猫「月见」这个角色设定
❌ 纯SVG+CSS技术路线
```

### 保留但需要重新设计的机制(原本绑定在"三指标"上，现在要适配单指标)
```
✅ 反脆弱/宽恕机制 → 保留核心思想，但简化为"沉睡态"，不再需要"离家出走+信"
   这套叙事装置(原本需要"角色离开某个场景区域"才成立，单一角色+单一场景
   下不再适用，见下方"防挫败感机制"章节的新设计)
✅ 连续打卡/里程碑系统 → 保留，改为围绕"累计专注时长/连续专注天数"计算
✅ 奇遇系统 → 降级为Phase 1可选项，先不设计具体内容，避免过早膨胀范围
✅ 高频曝光策略(锁屏/推送) → 保留，内容改为"小老虎当前状态(自然休憩/金色庆祝)"
✅ 截图分享 → 保留，改名为"金光时刻分享"
```

---

## 💡 核心产品概念（v5.0）

### 设计哲学
> 不做健康数据仪表盘，只做一件事：帮用户在这一刻，抓住当下。
> 一只小老虎，是这份专注最直接的镜子——默认/中性状态：老虎保持本体固有色（自然原色），呈现趴卧休憩(打盹)姿态，不做负面色彩处理；达标/庆祝状态：老虎本体固有色**不变**，周围金色光环/环境光增强，在角色表面（尤其衣物边缘、褶皱高光处）产生金色环境光反射（Rim Light 边缘高光），配合悬浮、金光粒子等庆祝效果。

### 产品公式(收窄版)
```
一只坐禅小老虎（唯一角色，无需命名多个居民）
+ 一个极简的心流场景（水墨雾气 + 莲花台 + 光环，无需分区场景）
+ 一个指标：专注心流（focusLevel，由专注会话时长驱动）
+ 金色环境光/光环随专注渐强的实时视觉反馈（不是数字进度条，是老虎周围与表面反光的变化；本体固有色始终不变）
+ 连续专注的里程碑成就感
= 用户每次想"抓住当下"时，第一反应是打开它看一眼小老虎的状态
```

### 与v4.0的核心差异
```
v4.0：数据驱动一个世界的兴衰(月亮圆缺/瀑布枯荣/植物荣枯)，用户是"照料者"
v5.0：数据驱动一只角色的状态(自然休憩/金色庆祝/打盹/欢呼)，用户是"同修者"

这个差异很关键：不再是"我有没有把它照顾好"的责任感产品，
而是"我们一起专注"的陪伴感产品。文案基调也要跟着从
"月见很委屈/月见挂点滴"这种略带愧疚感的语言，
转向更平静的"它在等你，不急"式陪伴语言。
```

---

## 🐯 坐禅小老虎设计规范

### 角色定位
```
唯一角色，不设"居民/主人"的养成关系，更接近"共同专注的伙伴"
姿态：坐禅打坐姿势为基础形态，不像小猫那样有多个场景专属姿势
      (不需要"钓鱼""瘫倒草地"这类场景绑定动作，因为没有多场景了)
```

### 视觉状态：金色环境光/光环渐变的核心表达

> **设计原则澄清（2026-07-15 修正）**：产品核心视觉**不是**"老虎从灰/原色渐变到金色"。
> 老虎本体固有色（orange/white/black tiger stripes、面部五官等原始配色）在整个专注过程中**始终保持恒定**，不做色相/明度渐变。
> 随专注进度变化的是：角色**周围**的金色光环/光晕强度，以及该光环对角色**表面**产生的金色环境光反射（衣物边缘、褶皱高光处的 Rim Light 边缘高光）。
> **正式服装同步（2026-07-17）**：衣着以 `CHARACTER_BIBLE.md` 及最新 `wave-hello`、`tilt-think` 素材为准，是低饱和暖浅灰（light stone gray / light greige）的棉麻单肩斜襟禅修服 / 茶服风；布面有细密交织纹与轻微竹节肌理，主体偏哑光，仅在凸起纤维和层叠褶皱边缘保留克制的自然微光，以承接金色 Rim Light。不得生成旧版深红/藏红布料、红色镶边或高亮丝绸质感。
>
> **3D Idle 模型同步（2026-07-18）**：`public/models/tiger-meditate-closed.glb` 已替换为无红边、单色暖浅灰棉麻版本（源：`yin-meditate-closed-monochrome-grey-cotton-linen-robe.source.glb`）。旧「灰棉麻 + 深红镶边」仅历史备份（`tiger-meditate-closed.crimson-trim-307k.glb`），不代表正式衣着。奖励柜等 3D 展示须与圣经一致。
>
> **压缩质量校正（2026-07-19）**：勿用默认 `optimize --texture-compress webp` 压到 ~300KB（织物细节会损）。正式运行时约 **1.6MB**（1024/512 贴图 + lossless WebP + Draco、不减面），与其它姿态 ~2MB 级视觉预算同档；完整配方见 `art-reference/models/sources/README.md`。若本机已装 Khronos `ktx`，可改回 KTX2/UASTC 以更接近 legacy 2.1MB。

```
这是整个产品唯一的核心视觉语言，必须做到位，其他细节可以简化。

默认/中性状态：老虎保持本体固有色，呈现趴卧休憩(打盹)姿态，不做负面色彩处理；
达标/庆祝状态：本体固有色不变，金色光环与表面环境光反射增强，配合悬浮、金光粒子等庆祝效果。

状态一・自然休憩(IDLE，未开始专注 / 专注中断)
  毛色：本体固有色，条纹自然可见
  姿态：闭眼打坐或趴卧休憩，呼吸缓慢
  光环：无

状态二・金光渐显(FOCUSING，专注进行中)
  毛色：本体固有色不变
  光环：随focusLevel增强，从无到淡淡的金色光晕，专注度越高光环越明显
        （金色参考色阶：过渡态蜜金 #e0b979 → 满值纯金 #f0c060）
  表面反射：随光环增强，衣物边缘/褶皱高光处出现渐强的金色 Rim Light 边缘高光
  呼吸律动(2026-07-15 拍板，光环通用行为)：金光强弱同步角色 4 秒呼吸循环——
        吸气时金光微微收敛、亮部聚焦；呼气时金光向外柔和晕染。
        光环本身是活的、有呼吸的，不是死板静止的光圈；律动幅度叠加在
        focusLevel 决定的基础强度之上，不改变 focusLevel → 强度的映射本身

状态三・金辉庆祝(CELEBRATE，当日首次达成一次专注目标)
  毛色：本体固有色不变，表面金色反射叠加短暂的高光脉冲
  动作：短暂、温暖、有情感的庆祝；以舒展、轻跳或鼓掌为主，不做街机式狂欢
  光环：向外扩散一次金色光波(TransitionFX负责，只播一次，不循环)
  时长：3-5秒后自动回落到"自然休憩"或下一次FOCUSING起点，不停留在庆祝态

状态四・打瞌睡(DORMANT；2026-07-21 起零完成开场不再自动进入；2026-07-26 冷启动亦不进睡)
  判定：不再由「当日零完成」或**页面冷启动**自动触发；登录 / 刷新后第一幕固定 Idle 闭目坐禅（uplifting）
  惰性进睡：距最近一次专注结束 ≥ `DORMANT_IDLE_HOURS`（默认 2h）时，在 **Rise 后** 或 **tab 实际 hidden ≥2h 的回前台** live sync 进入 DORMANT 并播披毯（**2026-08-18**：Welcome / Idle 后短切 tab 不得用陈旧戳披毯；修正 2026-07-26「任意回前台」口径）；调试面板仍可显式切入
  毛色：保持本体固有色，眼睛完全闭合，呈蜷缩打瞌睡姿态(区别于打坐的挺直坐姿)
  （历史口径「零完成 → Sleeping」已由 2026-07-21 产品反馈废止：看起来 not uplifting；
   「刷新即披毯」为 2026-07-25/26 开场即睡事故，冷启动已禁进睡）
  语气克制，不做委屈/生病的拟人化苦情设计
  (v4.0"挂点滴"式的苦情设计不再适用，见下方"防挫败感机制"章节)
```

### 老虎的名字
```
正式名（默认显示，2026-07-16 落定）：
  中文：阿寅
  English：Yin
  （命名说明与阴阳彩蛋见 CHARACTER_BIBLE.md「角色正式名称」；
   i18n 键 CHARACTER_NAME；与 characterId 'tiger-cub' 无关）

用户可自定义改名（远期 Backlog，本次不开发）：
  沿用 v4.0 的命名交互逻辑设想；未实现前一律显示正式名「阿寅 / Yin」
```

### 动作清单(Actions.js)
```
坐禅    → 基础姿态，循环呼吸动画；**登录后第一幕默认**
完整庆祝 → CELEBRATE状态触发，舒展/轻跳/鼓掌+光环扩散，每日首次达标播放一次
打瞌睡  → 仅调试 / 显式 DORMANT；**不再**作为零完成自动开场
眨眼    → 闭目坐禅：`idle-breathing`（约 2.5fps）×5 完整循环后插一次 `blink-smile`，再 ×5…（偶尔看看）；无其它 Idle 变体（见 PRINCIPLES）
唤醒起身 → Honesty 自睡态：`dormant-wake`；自 Idle 补登不播睡醒。FOCUSING 长离≥30min 回前台亦可 `dormantWake`（2B）。已删调试键 `wakeUp`。
睡着了  → 调试睡态循环；**约 2 fps** 极缓（持续态节奏原则）
```

### 动作幅度的场景边界（主界面 vs 奖励柜）

> **2026-07-16 定稿（长期设计边界，非临时限制）**  
> 用于判断「这个新动作该放在哪里」，避免「因为有趣就直接加进主界面」。

**「克制剧烈动作」只约束主专注界面，不约束奖励系统展示场景。**

| 场景 | 用户心理预期 | 动作幅度原则 |
|---|---|---|
| **主专注界面**（专注 / 正念练习时的实时反馈） | 安静陪伴、无所住相 | **克制**：最大幅度为当日首次达标的 **Celebrating**；正式 2D 资产为 `celebrate-dance`（起身 → 小金光慢速舞 → 施礼）一次性弧线，播完回归 idle-breathing。**不**在此之上再加更娱乐化 / 街机式动作。新增主界面动作须 ≤ 该庆祝态强度，并保持观察式、不打扰调性 |
| **奖励系统 / 塑胶公仔展示柜**（未来；用户主动进入的独立观赏场景；复用 3D GLB + `PoseManager` / `DynamicMotion`） | 娱乐性观赏、陈列把玩 | **不受**「克制剧烈动作」约束；可引入更丰富、更具娱乐性 / 表现力的动作 |

**设计新动作时的自检**：若动作偏娱乐、幅度明显超过 `celebrate-dance` 庆祝弧线 → 默认归属奖励柜 / 纪念展示，**禁止**仅因「好玩」塞进主专注情绪表。主界面情绪清单仍以 `EMOTION_BIBLE.md` 为准；奖励柜动作另开任务立项，不与主线 `playEmotion` 混用同一套「安静陪伴」验收标准。

---

## 🎯 专注心流机制设计规范

### FocusSession：专注会话如何计算focusLevel
```
MVP阶段(Phase 0)的输入来源：手动开始/结束的专注计时器(番茄钟模式)

一次专注会话：
  用户点击「与阿寅同坐 / Sit with Yin」 → 进入FOCUSING状态 → 计时开始
  focusLevel = min(当前会话已专注分钟数 / 目标分钟数, 1.0)
  目标分钟数：开表前 chip **10 / 15 / 25 / 45**（默认与最短 **10**；2026-08-18 拍板）。与 Breath practice **1/3/5/10/20** 分轨：Focus 10 仍走 Sit→Arrival→Companion；Breath 10 是左球微仪式（无 Arrival）。picker 须可见一句最短档说明（`focus_duration.hint`）；更短歇息走 Breath 1/3/5。`?sessionMinutes=` 可覆盖（e2e / 调试，非正式产品档）

  会话中途暂停/退出App超过X秒(建议30秒，具体阈值Phase 0测试后定) → 
  视为中断，focusLevel停止增长，老虎颜色停在中断时刻的状态，不倒退
  (不做惩罚式倒退，只是不再前进，这是保留"防挫败感"精神的关键设计)

会话达到目标分钟数 → 本次会话计入里程碑统计，并按以下层级反馈：
  - 每次完成：轻量 SessionComplete（微笑/点头/合十/一次呼吸）
  - 当日首次达标：由完整 CELEBRATE 替代 SessionComplete，不叠加播放
  - 同日后续完成：继续轻量 SessionComplete，不重复完整庆祝

  Session Intention / Arrival Practice（✅ v2，见 TASKS.md 任务十 / ARRIVE_MOMENT_DESIGN.md）：
  点击 Sit with Yin 后进入 Arrival Practice（欢迎 → Notice 状态点选入账 presence-signals → ~5s 呼吸 →
  Choose 图标/打字会落库回显）→ Companion Mode → 再 Sit 开始计时；全程可跳过；
  不参与达标判定；Notice 写入 `focus-tiger.presence-signals.v1`（封闭标签；非临床量表）

Tiger Reflection Moment（结束反思，已实现·MVP）：
  会话结束后可选的轻量反思环节，三个问题逐个淡入展示：
    Q1 What did you notice today? / 今天你注意到了什么？
    Q2 What emotion visited you? / 今天有哪些情绪来访？
    Q3 What would you like to return to next? / 下次想把注意力带回什么？
  （Q3 刻意用"下次"而非"明天"，避免暗示每日义务，
   与 regular practice, at your own pace 一致）

  时序衔接：
    正常完成 → 完成反馈（Celebrating 等）完整播放、回归基础坐姿 →
               短暂留白 → 反思面板淡入（不与庆祝粒子同屏）
    主动结束 → 不播放 IncenseComplete / Celebrating 等完成反馈
               （避免"尚未完成却播放完成反馈"的语义错误）→
               回归坐姿、短暂留白 → 反思面板淡入

  非评判约束（硬性）：
    不是表单、不是日报：无提交按钮、无必填校验、无"1/3"式进度数字
    （仅三个弱化圆点示意位置）；每题独立可跳，Skip 与 Continue
    视觉同级；Esc 可整体划过；任何跳过路径零提示、零劝导文案

  数据处理（MVP）：
    仅非空答案本地保存最近 5 条（localStorage，复用 Storage 封装）；
    全部跳过则不落任何记录；**趋势/Confide 只读 `presence-signals.v1`（SSOT）**；
    本 key 为会话 bundle 回顾；V2 可收敛为从 presence-signals 聚合

向阿寅倾诉（Confide to Yin · 2026-08-10 拍板 · 2026-08-18 桌面窄例外 · 2026-08-22 第二入口）：
  与 Reflection 分轨。Idle 入口：**宽屏左上倾听耳** + **窄屏 ActionBar 耳钮** + ⋯/抽屉行（桌面与 Web **同一张卡** `#confide-to-yin-card`）。文案：向阿寅倾诉 / Confide to Yin / 寅に打ち明ける。禅意倾听者；
  本地规则分类 + 人工语料检索；匹配失败固定兜底。Web / PWA 仍禁运行时生成。
  仅 Electron：安全阀与语料都未接住时允许受约束短生成——不是全面允许生成。
  权威：`PRODUCT_POSITIONING.md`「禅意倾听者」；Web Brief `task-confide-to-yin-v1.md`；
  桌面 Brief `task-desktop-on-device-companion.md`（本段不等于已上线）
```

### 专注会话陪伴模式（Companion Mode）

> **2026-07-16 定稿；三选一运行时已落地**（按钮下提示 + 向上展开；选模式只预选；Sit 才开始；`localStorage` `focus-tiger.companion-mode.v1`）  
> 情绪侧例外见 `EMOTION_BIBLE.md` 第六 / 八部分。与 Honesty Check-in **场景不同、机制独立，禁止合并实现**。

#### 背景与已知设计缺陷

既有 Focus Confidence 相关机制（离开检测、`Re-focus Acknowledge` 等）默认把「离开本页 / 标签不可见」理解为需要被温和看见的分心。这在「本页静坐陪伴」场景下大致成立，但存在两类合理例外，且其中一类暴露了**技术检测的固有局限**：

1. **I'll step away**：用户主动在 Focus Tiger 之外（其他冥想 App、线下打坐等）练习，同时希望本页继续计时陪伴——离开页面是预期行为。
2. **I'm working across tools**（新增）：知识工作（编程、项目管理、创作等）天然需要在多个工具 / 标签页之间频繁切换（编辑器、文档、设计工具、参考资料等）。高质量心流同样会产生大量 visibility / blur 信号，与真正的分心（刷社交媒体等）在浏览器能力范围内**无法区分**——隐私沙盒不允许探测其他 App 或标签页内容。若仍把「标签页活跃于本页」等同于「专注」，会对这类用户产生**系统性误判**。

**产品对策**：不假装技术能判定「切换是心流还是分心」，而采用**用户自主声明会话模式**（诚实机制的延伸）：开始前由用户选择本次练习语境，系统按声明关闭或保留离开类提醒。这比用 visibility 硬猜更诚实、也更不制造焦虑。

#### 1. 会话模式选择（开始前 · 三选一）

可整合进已拍板、待开发的 Check-in / Session Intention 流程。

**当前交互（已落地）**：主入口仍为 **Sit with Yin / 与阿寅同坐**（蒲团橙立体主 CTA）。其旁 **⚡ Quick Start**（`#quick-start-focus`）可跳过 Arrival、用记忆 Companion 模式立刻 Focusing。次要立体钮 **How shall we sit? / 这次怎么陪你？**（暖米金）向上展开三选项。**须先完成 Arrival Practice（或点 ⚡）**，Here & Now / Flow 三选一才可在门闩就绪后展开开表；门闩未就绪时点这两项：**启动 Arrival**（禁止静默无反馈）。**Offline Space：点选即开计时，跳过 Arrival Notice/Choose**（别处练习语境，无「当下觉察」仪式）。Sit 默认走 **Welcome → Notice → Breath → Choose**（轻量气泡/字幕，**非**重型模态；**无**面板内 Skip / Skip — begin）。**完整走完 Choose** 后立刻开门闩；**点头鞠躬播完**后三模式均立即 Focusing（或展开 Companion，视路径）。**Here & Now / Flow State：选中或 Arrival 鞠躬后立即开始 Focus 与计时**；**Offline Space：选中即 Focusing，不经 Arrival**。三模式差异在**会话内**行为与是否走仪式，不在二次 Sit。**专注中隐藏模式提示与三选一面板与 ⚡**（Sit 按钮变为 Rise 并保留可见）。**Arrival/⚡ 解锁后的门闩跨 Focusing→Rise 保持**：回流再点 Here & Now / Flow → **立刻 Focusing**（不得再逼进 Notice）。**Sit** 在 Idle 下始终走 Arrival（重新抵达）；冷启动未解锁时 Here & Now / Flow 仍启动 Arrival。

**对外短名（用户可见，2026-07-16 文案定稿）**

| 对内 id | EN 标题 | ZH 标题 |
|---|---|---|
| `stay` | Here & Now | 此时此地 |
| `stepAway` | Offline Space | 离线空间 |
| `acrossTools` | Flow State | 心流状态 |

Honesty Check-in 对外称 **Mindful Check-in / 正念登入**；入口提示与时长/呼吸/完成文案见 `locales`（`HONESTY_*`）。

| 选项（默认英文） | 含义 |
|---|---|
| **Stay here with me**（默认） | 原有逻辑：Focus Confidence / 离开检测 / Re-focus 等正常生效 |
| **I'll step away — wait quietly** | 去别处冥想 / 练习：关闭离开类分心提醒；老虎安静墙钟陪伴 |
| **I'm working across tools**（已落地） | 多工具深度工作：关闭「标签切换 / 失焦 = 分心」判定；保留宽松 idle 兜底；墙钟计时 |

中文建议（实现时接入 i18n，可微调）：「留在这里陪我」/「我要去别处一下——请安静等我」/「我在多个工具间工作」。

呈现：**不得**做成强制问卷或带「正确选项」暗示。Skip / 不选时回落到默认 **Stay here with me**。三选一具体 UI（列表 / 卡片等）待实现时拍板。

#### 2. 「I'll step away」子模式行为规则

**提醒（本次会话内）**

- `MindfulAcknowledge` 中依赖「离开页面 / 失焦」的检测与展示：**不触发**；
- `Re-focus Acknowledge`（含任何「欢迎回来」类回归提醒）：**不触发**；
- 不占用、也不因本模式而改写共享提醒池的全局规则；只是本会话不申请这类离开相关展示；
- 非离开类的阶段性确认（如 20 分钟墙钟认可、2 小时舒展）默认**仍可按既有规则运行**；若产品后续希望 step-away 下也静音，须另开任务拍板。

**计时 / 达标 / 活跃累计**

- 墙钟差值计时（见下节「共享计时规则」）；
- 达标复用 `celebratePending → CELEBRATE → SessionEndFlow`；
- `setAttentionAway` **仍生效**，以暂停 2 小时舒展的活跃累计；Ambient Soundscape 可用，规则与 Stay 相同。

#### 3. 「I'm working across tools」子模式行为规则（已落地）

适用于编程 / 项目管理 / 创作等需要多工具切换的深度工作；与 step-away **同属 Companion Mode 家族**，不是独立产品线。

1. **关闭**「标签页切换 / 失焦 = 分心事件」的判定：离开类 `MindfulAcknowledge`、`Re-focus Acknowledge` **均不因** visibility / blur 触发（`suppressAwayReminders`）；
2. **保留宽松 idle 兜底**（常量 `ACROSS_TOOLS_IDLE_THRESHOLD_MS`，当前 **30 分钟**）：连续无鼠标 / 键盘 / 指针活动达阈值后，展示一次观察式非模态文案；**不**因正常多任务切换惩罚；
3. **计时**与 step-away 一致（墙钟差值）；
4. 与 Ambient Soundscape、2 小时舒展活跃累计：与 step-away 一致（`setAttentionAway` 仍暂停活跃累计）。

#### 4. 共享计时与完成反馈（Stay 以外的陪伴子模式）

- **必须**采用墙钟差值：`startedAtMs` + 当前时间；**禁止**以后台被节流的 interval / rAF 累加为唯一真值；
- `focusLevel` / HUD 在不可见期间可冻结显示，**达标判定以墙钟为准**；回页 `visibilitychange → visible` 时复用同一 `beginSessionCompleteIfNeeded()`；
- 达标反馈与 Stay here **同一套路径**（不为任一 companion 子模式单独处理）；完成记账一视同仁。

#### 5. 与 Honesty Check-in（DORMANT 唤醒）的边界

| | Companion Mode（step-away / across-tools） | Honesty Check-in |
|---|---|---|
| 会话是否已开始 | 是：用户已主动开始 Focus Tiger 计时 | 否：Focus Tiger 未跑过本次练习 |
| 产品角色 | 正在运行的安静陪伴计时（语境由用户声明） | 事后补登「别处已完成」 |
| 离开 / 多工具 | 预期或工作常态，关闭离开类分心提醒 | 无关（当时可能不在会话中） |
| 完成如何成立 | 墙钟达到目标后回页触发完成反馈 | 用户选择时长 + 呼吸仪式后等价记账 |

二者**不得**共用同一入口或互相覆盖；用户自主声明模式与 Honesty Check-in 同属「诚实优先于技术猜测」，但场景与入口仍须分离。

### 全屏陪伴 / Immersive Presence（MVP 意愿探针 · 2026-08-09）

> **命名**：对外「Fullscreen companion / 全屏陪伴」；对内 `ImmersivePresenceUI`。  
> **禁止**与上一节 **Companion Mode**（Here & Now / Offline Space / Flow State）混名或合并入口。

#### 目的

验证用户是否愿意进入「更沉浸的陪伴态」（阿寅打坐 + 计时 + Rise），以及（可选）是否喜欢桌面角落浮动阿寅。**不是**系统 Widget / Live Activities；不得写成付费卖点。

#### 1. 应用内全屏陪伴（移动 + 桌面同一套）

- **何时出现**：仅 `FOCUSING` 且未进入完成叠层；Rise / 达标结束自动退出。
- **进入**：用户点「Fullscreen companion」；可选尝试浏览器 Fullscreen API（失败仍保留 CSS 沉浸壳）。
- **沉浸壳**（`body.ft-immersive-presence`）：弱化次要 chrome（Support / 徽章 / 语言 / hints / 热力图 / Moments 卡等）；**保留** FocusHUD 计时、Rise、右上 mute、Active Recover、离开按钮。
- **回流**：离开按钮 / Escape（非 PiP 时）/ 结束 Focusing。

#### 2. Document PiP 浮动阿寅（实验 · Chromium 桌面）

- 按钮文案标明 **experimental**；仅 `documentPictureInPicture` 可用时显示。
- 小窗内：当前精灵帧镜像 + 计时 + 实验标签；**不是**无边框系统级桌宠。
- Safari / 不支持时：不显示浮动按钮；用户仍可用全屏陪伴。
- PiP 随打开它的标签页存活；关闭主会话须收起。

#### 3. 与壳选型的关系

本探针**不**等于已做系统托盘桌宠。电脑版壳已拍板 **Electron**；**收费 DMG 的托盘常驻**是另一条路径（见 `task-electron-desktop-scaffold.md`），**禁止**把本节 PiP 升级成关 App 仍活的桌宠。PiP 仍是浏览器实验，加大投入另议。

### Idle Document PiP 陪伴浮窗（实验原型 · 2026-08-16）

> **命名**：对内 `IdleCompanionPipUI` / `idleCompanionPipGate`。  
> **禁止**与上一节 Focusing **Immersive Presence** 浮动钮、以及 Companion Mode 三选一混入口。  
> **地位**：轻量原型，验证「切到其他窗口/App 时仍能看见阿寅安静呼吸」。**不是**最终形态；待观察使用数据后再决定是否加大投入。**不是** Electron 收费 DMG 的托盘（那条见脚手架 Brief）；本入口不做关浏览器后仍常驻。

#### 1. 何时出现

- **入口**：仅 Idle 主界面（热力图簇旁小圆钮）。用户主动点开，**不**自动弹出。
- **Feature detect**：仅 `documentPictureInPicture.requestWindow` 可用时挂载入口（桌面 Chrome / Edge）。Safari / Firefox / 不支持的环境 **完全不出现入口**——不报错、不写「暂不支持」。
- 离开 Idle（进入 Focusing 等）→ 入口隐藏；若浮窗已开则一并关闭。原页面会话状态不受浮窗持有。

#### 2. 浮窗内容

- 只镜像当前 Idle 呼吸/陪伴序列帧（复用主界面精灵，不新做美术）。
- **无**计时、打卡、按钮、Reflection / Journey Log / Tip Jar。关闭走系统 PiP 窗或再点入口。

#### 3. 使用记录

- localStorage `focus-tiger.idle-companion-pip.v1`：`{ used, usedAt }`。只记「是否曾打开过」，**不得**用于提醒、激励或限频文案。

### 禅意背景音（Ambient Soundscape）

> **2026-07-16 定稿；MVP 运行时已落地**（`AmbientSoundscapeController` + 角落 UI；曲目：Mer-Ka-Ba / Meditation Impromptu 02）  
> **2026-07-21**：默认开播 Mer-Ka-Ba；右下角显眼「打开/关闭音乐」随时可点（不再门闩于 FOCUSING）。  
> **2026-08-05**：内置清单扩至 12 曲——Mer-Ka-Ba 后接 Jesse Gallagher×4 + Reed Mathis Somnia×2，再接既有 Meditation Impromptu / Aakash Gandhi×4；归因见 `ATTRIBUTION.md`。  
> 与 Companion Mode **天然互补**，但**不是** Companion Mode 的子功能：Stay here / step-away / working-across-tools 均可选用。

#### 背景与动机

Companion Mode（尤其 **I'll step away**）下，用户常离开 Focus Tiger 页面、在别处练习。页面可见性与前台 rAF 会被浏览器节流，视觉反馈容易「断档」。本功能提供可选的禅意背景音，在增强陪伴感的同时，用**本页自播音频的实际播放时长**作为一条更连续的「用户在场」置信信号，并把该信号按比例叠加进金光 / Rim Light 强度——让陪伴感在切到后台时仍有一条不易被节流的反馈通道。

#### 技术边界（硬性）

- **仅追踪 Focus Tiger 自己播放的音频**：播放、暂停、静音、切换曲目等状态，全部来自本应用内的音频控件与播放器；
- **不涉及、也不可能探测其他 App**（如 Calm、系统媒体会话中的第三方内容）的播放状态——浏览器隐私沙盒**不允许**跨 App / 跨源音频探测；
- 设计与实现**禁止**假设、暗示或依赖「用户正在听其他 App」这类能力；文案与 UI 亦不得写成「我们听到了你在别处播放的声音」。

本信号回答的是：「Focus Tiger 自己的背景音是否正在真正播出」，不是「用户是否在别的 App 里练习」。

#### 1. 可选性与呈现

- **内置曲目**（面板顺序）：**Mer-Ka-Ba** → **Divine Life Society** / **Lord Of The Dawn** / **Maestro Tlakaelel** / **The Inner Sound**（Jesse Gallagher）→ **Somnia Variation 3** / **Somnia Variation 10**（Reed Mathis）→ **Meditation Impromptu 02**（Kevin MacLeod）→ **Dreamland** / **Invisible Beauty** / **Kiss the Sky** / **Frozen in Love**（Aakash Gandhi）；工程 id 见 `AMBIENT_TRACKS`（`singing-bowl` / `rain` 等稳定标识）；均来自 YouTube Audio Library（用户提供）；归因见 `public/audio/ambient/ATTRIBUTION.md`；
- **默认关闭（opt-in）**（2026-07-25 拍板；**Idle / 冷启动仍有效**）：登录 / 打开产品后**不**自动播背景音乐。偏好存 `focus-tiger.ambient-pref.v1`（无存储时 `enabled: false`；默认曲目仍为 Mer-Ka-Ba）；
- **开坐即播**（2026-08-15 书面：Breath practice 已自动有乐，Focusing 不得只响磬）：点时长 chip 进入 **Focusing 或 Breath practice** 时，自动播 preferred（若为 Off 则默认 Mer-Ka-Ba）。**不**把 `enabled: true` 写入偏好——刷新 / 冷启动仍静音。会话中仍可用音符静音或换曲；
- UI：**右上米色圆形音符钮**（窄屏 Idle 为 ActionBar ♪）与菜单 / 抽屉 **Sound** **同效**——打开曲目/音量面板；图标斜杠反映「偏好开着」而非点一下静音。宽屏**不**再露出右下 Sound FAB（避免与右上音符重复）；窄屏 FAB 仍 park / Focusing 藏起；
- **音量条**（2026-08-15）：Soundscape 内标 **Volume / 音量 + 百分数 + 喇叭图标**，避免被看成播放进度；音乐与三种坐禅磬声**共用同一条**（默认 45%）；
- 浏览器若拦截自动播放：在面板内选曲后点按解锁；不得因未开音乐削弱完成反馈。

#### 2. 播放时长作为独立「在场置信信号」

- 追踪该音频的**实际播放时长**（真正处于可闻播放态的累计秒数；实现上以 `<audio>` 的 `timeupdate` 为心跳，配合可闻态墙钟段累计）；
- **不计入**：从未开启、暂停、静音（含音量为 0 且未真正出声的等价态）、会话未运行等期间；
- **不是**「控件保持打开的墙钟时长」——只有真实播出才累加；
- 该信号仅在**当前会话内**使用；曲目开关偏好可长期存储；
- **会话结束（Rise / 达标 / Breath 完成或 Leave）自动停播**（2026-07-25 拍板）：本场同坐结束即收掉背景音；**不**把「关」写入偏好（保留上次曲目 id）。下一场开坐仍按「开坐即播」再起（与 Breath 一致）；Idle / 冷启动不播；
  - **达标 + 计时提示音（2026-08-12）**：氛围仍在播且结束铃开 → **duck≈35% → 播结束铃 → ~1.5s 淡出并停**（不「恢复再杀」）；早退 Rise / Breath **Leave** **不**播结束铃，仍硬停；
- **计时提示音（免费 · 2026-08-12 / 间隔 2026-08-13 / Breath 同线 2026-08-15 / 听感 2026-08-21）**：Focusing **与 Breath practice** 共用开始磬 / 间隔磬 / 达标结束铃（Soundscape「计时提示音」总开关，默认开；音量跟氛围条，**再乘 `SESSION_CUE_RELATIVE_GAIN=0.5`**，避免瞬态磬压过持续音乐）。**正念磬声间隔**独立三档：无（默认纯净陪伴）/ 每 3 分 / 每 5 分；第一声在 3:00 或 5:00（开表那一瞬不播间隔磬）。产品 Focus 最短 **10 分钟**，故正式档总会听到间隔（调试 `?sessionMinutes=` 短于 3/5 与 Breath 短档除外）；资产 `session-interval-bell.mp3`（短 one-shot，**不**接 Ambient Gate 长循环）；剩余 &lt; **30s** 跳过；氛围可闻时 duck→unduck。面板须**可见**写出各开关含义（勿只靠 `title` 悬停）。工作流根因：旧实现只接 `beginFocusWithMode`，呼吸练习时长 chip 是平行路径，从未 `playStart`。
- **觉察观照卡（mid-session · 2026-08-13）**：间隔磬同拍时在 Focusing **底部**浮现观察式短句（`FOCUS_AWARENESS_*`）；可单独关；**不**写入 Moment Whisper；设计理念长句不进 UI；
- 该信号与 Page Visibility / blur / idle 等既有 Focus Confidence 信号**并列、独立**；不替代墙钟会话计时，也不单独决定会话是否达标。

#### 3. 数据流向：音频时长 → 光效强度（锦上添花）

```
会话墙钟进度 → focusLevel（主路径，既有；HUD / 达标不变）
本页 Ambient 实际播放时长 → presenceBoost（叠加路径）
visualLevel = min(1, focusLevel + presenceBoost)
→ setFocusLevel / FocusVisualizer（占位光效；Rim Light 正式重构后仍走同一数值入口）
```

**换算系数（2026-07-16 已拍板）**

| 参数 | 值 | 说明 |
|---|---|---|
| 等效比 | 每实际播放 **1 分钟** 音频 ≈ **12 秒** 专注进度的光效贡献 | 即音频时长权重 `12/60 = 0.20` |
| 公式 | `presenceBoost = min( playedSeconds × (12/60) / (targetMinutes × 60) , 0.20 )` | |
| 上限 | `MAX_PRESENCE_BOOST = 0.20` | 听满一整场最多 +0.20，不喧宾夺主 |

- 与现有「专注进度 → 金光」机制**共同作用**：**不替代**、不改写 `focusLevel = 已专注 / 目标` 的主映射；
- 未开启背景音时，光效完全回落到既有 `focusLevel` 路径。

#### 4. 与 Companion Mode 的互补关系

| | Companion Mode 墙钟计时 | Ambient Soundscape |
|---|---|---|
| 主要解决 | 后台标签节流导致计时/可见性不可靠 | 后台时视觉反馈断档、陪伴感变弱 |
| 达标判定 | 墙钟达到目标（真值） | **不参与**达标判定 |
| 光效角色 | `focusLevel` 主驱动 | 可选叠加增强 |
| 后台特性 | 回页时用时间戳校正 | 自播音频通常较少被后台节流，可作更连续的实时反馈源 |

二者可同时使用：用户 step-away 并开启背景音（如 Mer-Ka-Ba）时，计时仍走墙钟，光效在主进度之外可获得来自「本页音频仍在播」的轻微增强。Stay here 会话同样可选用背景音，规则相同。

#### 5. MVP 明确不做 / 用户上传（v1.0.0 必交付）

- 不做音量精细调节以外的均衡器等复杂控件（简易音量条即可）；
- 不做背景音使用数据的统计 / 趋势分析；
- 不做云同步用户曲、在线曲库、复杂排序拖拽；
- **不做多层同时混音**（雨+磬+用户曲叠播等）——属远期 Backlog「本地个人混音」，**不是**上传氛围乐的范围；
- 第三曲（磬等）待有合适 CC0 素材后再补（内置库可继续扩充；与用户上传并行）。

**用户上传氛围乐（2026-07-31 升格 · v1.0.0 必交付；实现已合）**：推翻此前「不做用户上传音乐」。权威 Brief：`docs/task-briefs/task-user-ambient-upload-v1.md`；排期入口 `PROCESS.md` Backlog「用户上传氛围乐」。**能力边界**：多首入库后 **单曲选播**（一次一条），不是混音台。

| 项 | 已拍板 |
|---|---|
| 多首 | 允许 |
| 清单 | 用户曲**整段**在内置曲之上；用户曲彼此 **最近在上** |
| 删除 | 仅自传；内置不可删 |
| 格式 | 仅 **mp3 / m4a** |
| 容量 | 合计 ≤ **64 MiB** 且最多 **10** 首；单文件 ≤ **20 MiB**（先触达拒绝） |
| 存储 | IndexedDB + Object URL；刷新后可播；一键重置须清用户曲 |
| 播放 | 继承 opt-in / Rise 停播 / 手势解锁 |

---

### Milestone：里程碑与成就
```
连续专注天数(至少完成一次达标会话即算当天成立；中断不撤回既有奖励、不制造断签压力)
  → 3天/7天/21天/100天节点，给予只增不减的纪念反馈
    （如纪念物、环境细节、新的温和动作；具体节点与形式仍待统一设计）
  → 里程碑达成瞬间的仪式性反馈已定稿为 MilestoneGlow「里程碑金辉时刻」
    （10s 一次性序列：呼吸律动金光 → 全身金色 Rim Light 勾勒 → 一只金光蝴蝶环绕；
    比 CELEBRATE 更隆重一档但气质是静观仪式而非社交庆祝，老虎全程闭目坐禅；
    分镜与设计约束见 EMOTION_BIBLE 第五部分，实现归属 Backlog「纪念奖励系统」）

累计专注总时长
  → 里程碑节点待定(如10小时/50小时)，作为长期成就展示，不强制做勋章系统，
    Phase 0先只做数字记录，视觉化展示留到Phase 1

Phase 0范围声明：本任务只需要Milestone.js正确计算和存储这些数字，
不需要在这一阶段设计具体的里程碑视觉呈现，避免范围膨胀。
```

---

## 🎨 UI Kit 设计实验（2026-07-21）

> **路径**：`focus-tiger/ui-kit/`（`tokens.css` + Shadow DOM Web Components + `demo.html`）  
> **产品壳 token**：`src/styles/design-tokens.css`（已挂 `index.html`）  
> **配色权威（2026-07-21 采纳）**：**Companion Mode 三选一文案框**（暖米卡片 + `#2c1f14` 标题 + `rgba(74,58,40,0.78)` 说明）为统一颜色模式；UI Kit 与产品壳同源。  
> **预览（产品舞台）**：在 `focus-tiger/` 下 `python3 -m http.server 8765` → `http://127.0.0.1:8765/ui-kit/demo.html?v=20260721e`（Yin poster + Companion 三选一，效果一目了然）。组件清单在舞台右下角「Component lab」。  
> **真产品壳**：`npm run dev` → `/?product=1`。

### 与产品定位的对齐

- **阿寅唯一高保真焦点**：组件只做从僧袍灰 / 蒲团橙 / 朱砂 / 金晕提炼的安静 chrome，不与角色抢视觉权重。
- **宁静型游戏化**：`mode="calm" | "celebrate"`；celebrate ≤ **1.2s** 后自动回 calm；禁止常驻闪烁、跳动、强对比色块。
- **数值默认弱化**：HUD / 光点隐喻优先，悬停或达成时刻才露出数字；文案第二人称陪伴式，禁止经验值 / 等级 / 连击黑话。
- **Token**：`--color-bg` `#E8E6E1`（页底，与 Yin 和谐）、`--color-panel` `#E4E1DB`（**仅控件**）、`--color-surface-warm` `#F8F1E4`（**文案/选项卡**）、`--text-primary` `#2C1F14`、`--text-secondary` `rgba(74,58,40,0.78)`。
- **对比度**：文案容器用 surface-warm + text-primary/secondary；`--color-panel` 不用于长文案底。

### 明确不接线（仍属 Backlog）

`achievement-modal` / `collection-shelf` / `daily-quest-card` → 纪念奖励系统排期前**只作视觉探索**，不得顺手挂进主会话路径。**已纳入产品壳（2026-07-21）**：`progress-bar`（今日同坐）、`streak-meter`（近日同坐 7 点环，非打卡竞速）、`notification-badge`（见下）、主次钮视觉（Sit = primary；「How shall we sit?」= secondary 描边）。Honesty Bridge Yes/No **仍同级**（见 `HONESTY_BRIDGE_CTA.md`），不套 primary/secondary 权重差。

**`notification-badge` 用法（2026-07-23）**：

| 用法 | 属性 | 颜色 | 说明 |
|---|---|---|---|
| 默认 / 稀缺通知 | （无 `tone`）+ 可选 `pulse` 一次 | `--color-highlight` 朱红 | 里程碑等；**勿**作 onboarding 常驻线索 |
| Onboarding **click** 线索 | `tone="hint"` + `pulse="loop"` | `#5c7a6c` | 未读脉冲 |
| Onboarding **peeked**（simple） | `tone="hint"` + `state="static"` | 同色 opacity≈0.4，约 5px | 已看文案、相关操作前；无动效 |

Sit / Sound 主 CTA 为**蒲团橙**立体钮（2026-07-21 由朱红改），与 Companion 暖米文案面统一在 Yin 色系内。

**产品壳 FocusHUD（2026-07-21；同日改版；2026-08-04 毛玻璃）**：左上角为**金环进度 + 中心呼吸光点**（无香炉碗/烟）；环与光点用偏深琥珀金、高不透明度；光点 **scale 一张一缩**（约 4s）；整块约 **2×** 原尺寸以便扫视/老花可读。环填充跟 `focusLevel`；时长默认半透明，专注中或悬停才加重；**本场目标**以更淡小字标在 elapsed 下方（如 `10 min`，方案 A）；百分比仅悬停/键盘 focus 露出。禁止常驻 `Status: / Focus: N%` 计分牌文案。其下挂 UI Kit **`progress-bar`**：「今日同坐 / Today's shared sitting」= 当日已完成分钟 + 当前会话分钟 / 默认 25 分钟软顶（一炷香轻量目标）；专注中轻脉冲。同行挂 **`streak-meter`** 7 点环（近日同坐；悬停浮层「近日同坐的日子」，须盖过下方今日同坐条；空心点保持浅描边可见；满圈短金息 ≤1.2s）。与 Companion 三选一分工：三选一 = 怎么坐；进度条 = 今日多久；光点圈 = 近日节奏。**壳面（2026-08-04）**：Arrival 式暖米半透明 + `backdrop-filter` 隐退为轻量 HUD（冷启动首屏包）。**禁止「随风浮动」位移动画**（`translate` / 微旋转漂浮）——其它 chrome 静置，单卡漂会风格不统一（2026-08-04 用户书面否决）。回归：`focusHudHalo` / `sharedSittingProgress` / `PracticeDaysStore` + e2e `#hud-state` / `#hud-time`。

**「本周陪伴」7 格热力图（2026-07-22；窄屏壳 2026-07-24；主 CTA 上屏 2026-07-26；宽屏三球 2026-07-31；今日标记 2026-08-04）**：仅 **Idle / Dormant** 可见（深夜披毯回家仍可看近七日；Focusing / 微仪式隐藏）。**宽屏**：左下角（`#onboarding-hint-help` 上方）；主 CTA 为 **三球（Quick · Sit · Honesty）+ ⋯**（`#ft-wide-home-ctas` / `#ft-wide-more-btn`），Sit+⚡ 文案 pill park。**窄屏（≤479px）**：`NarrowIdleShell` ActionBar + 主画布三 PNG 图腾圆球（顺序 **Quick Start · Sit with Yin · Honesty**；全宽 `space-evenly`；约 72px；Arrival 期仅留 Quick Start）+ 上滑抽屉（次要项）；7 格在抽屉内只读展示。数据 `PracticeDaysStore.getLastNDays(7)`（滚动近 7 日，**最右 = 今日**）；亮格 = `totalMinutes === null \|\| totalMinutes > 0`；暗格浅洗。每格下方星期缩写（`HEATMAP_DOW_*`）；今日格 `data-today="1"` 软描边 + 星期字略加重——禁止无提示裸格。Focusing / 微仪式隐藏。窄屏底部 soft 文案（toast / 桥接 / Arrival 等）须清过首页三球带：`homeChromeClearance.js` + `NarrowIdleShell` clearance belt。`#weekly-practice-heatmap` / `#ft-narrow-idle-shell` / `#ft-narrow-home-ctas` / `#ft-wide-home-ctas`。

---

## 🌫️ 视觉反馈系统设计规范

### 场景构成(替代原盆景三分区)
```
单一场景，不再分区：
  地面 → 一片简洁的莲花台(莲花模型，象征禅意)
  角色 → 坐禅小老虎，居中
  环境 → 水墨风格的雾气/柔光背景，随focusLevel轻微变化明暗
  光环 → 环绕老虎的粒子/光晕，随focusLevel增强(见下方FocusVisualizer)

不需要昼夜循环、不需要天气系统、不需要多场景切换 —— 
这些都是三指标时代遗留的复杂度，单指标产品应该更"静"。
```

### FocusVisualizer：focusLevel → 视觉参数映射
```
focusLevel 0.0 - 0.3：背景偏冷灰，几乎无光效，老虎呈自然休憩态
focusLevel 0.3 - 0.7：背景开始泛暖，出现细小金色粒子(数量随进度增加)
focusLevel 0.7 - 1.0：背景明显转暖，光环清晰，粒子密度达到上限
focusLevel = 1.0(达标一次)：触发TransitionFX的一次性金色光波
```

---

## 🛡️ 防挫败感机制（v5.0重新设计，替代原"生病→离家出走"叙事）

### 为什么v4.0的设计不再适用
```
v4.0的"挂点滴→离家出走→留信→唤回"是建立在"角色可以离开某个场景区域"
这个叙事装置上的。v5.0只有一个角色、一个场景，没有"区域"可以离开，
硬套这套叙事会显得别扭(老虎能离开去哪？盆景都没了)。
```

### DORMANT 唤醒仪式（Honesty Check-in Ritual）

> **2026-07-16 定稿**：取代原「连续 N 天未专注 → 1 分钟唤醒且不计会话」口径。  
> 上位原则见 `PRINCIPLES.md`「诚实机制（Honesty System）」；情绪键与观察式文案见 `EMOTION_BIBLE.md`。

#### 1. 与「零完成」的关系（2026-07-21）

- **开场视觉**：当日零完成 → **Idle 闭目坐禅**（不上 Sleeping / 不自动进 DORMANT）。
- **Honesty 提示**：零完成仍可展示可忽略补登提示（非强制）；从 Idle 点进选时长 → 呼吸引导 → 记账（**不**播 `dormantWake`）。
- **DORMANT / Sleeping**：仅调试面板或显式状态；从睡态补登仍播 `dormantWake`。
- **离开「零完成」**：当日任意一次已完成记录后，Honesty 自动提示不再出现。

#### 2. 触发时机与呈现

用户打开 App，若当日零完成：

- 展示一个**不打扰、可忽略**的轻量提示（非强制弹窗、不反复追问）；
- 触发口径是「当日零完成」（含**当日首次打开**、**首次安装**），**不是**「离开 App 很久才回来」；故文案须用**邀请式能力说明**，禁止盘问「你今天是不是在别处练过」。
- 英文（`HONESTY_CHECKIN_PROMPT`）：`Yin is sitting with you. Quiet time elsewhere can live here too.`
- 中文：`阿寅正闭目同坐。别处的静心，也可以记在这里。`
- 用户可直接忽略（不点击），正常使用 App 其他功能；忽略不触发任何提示或劝导。

#### 3. 交互流程

1. 用户点击提示后，展示时长选项：`[10 mins]` / `[20 mins]` / `[30+ mins]`；
2. 选择后，进入约 **10 秒**的呼吸引导；若当前已在 Idle，**不**播睡醒；仅调试睡态下立刻播 `dormant-wake`；
3. 呼吸引导结束后记账（**勿**再播一遍睡醒）；本次打卡按所选时长**等同于完成一次专注会话**；
   并出轻量 toast `HONESTY_CHECKIN_RECORDED`（「别处的静心，也算数」），再出桥接邀请；
4. 视觉边界：睡醒只用 Honesty / 长离 2B 的 `dormantWake`；**不得**再引入已删的调试键 `wakeUp`（曾 stretch 末帧闭眼）。2h 舒展走 `stretchReminder`。

#### 4. 频率与限频边界

- **不占用**此前拍板的「共享提醒池每日 3 次」额度：本功能是用户主动发起，不是系统主动提醒，性质不同，不得混用同一限频逻辑。
- 用户可在一天内多次使用（若确实多次在别处完成练习），**不设人为次数上限**。
- 首次完成后当日 Honesty 自动提示不再出现；同日后续仍可通过空闲 **Mindful Check-in** 入口再补登。

#### 5. 语言与完成反馈

- 全程遵循观察式语言；禁止「确定吗？」「请如实填写」等验证性 / 怀疑性语气。
- 完成后反馈文案（示例，须接入 i18n）：
  - 英文：`Thank you for bringing that calm back here.`
  - 中文：`谢谢你把那份平静带回来。`

#### 6. Honesty 桥接 CTA（2026-07-19 拍板）

> 详规：`HONESTY_BRIDGE_CTA.md`。**加桥接，非合并**——不把 Honesty 改成选时长即开计时。

- 补登仪式（呼吸 + `dormantWake`）与 thanks 结束后，可出现一次轻量邀请（观察式：`Want to sit for a bit now too?` /「要不要现在也坐一会儿？」）。
- **Yes** → 完整 Arrival Practice → Companion Mode（与 Sit 门闩未就绪路径相同）；**不**自动开 Ambient / timer。
- **No / 忽略** → idle；无二次挽留。
- **当日最多展示一次**（与 Yes/No 无关）；独立存储键，不占共享提醒池。
- 与 Companion Mode 边界不变：Honesty = 事后补登；桥接 = 可选进入正式会话入口。

---


## 🎯 MVP最终目标

**用户故事：**
> 下午写方案写到心烦意乱，打开App，
> 阿寅正安静地打坐着，身边还没有光环。
> 点击「与阿寅同坐」，25分钟计时开始，
> 阿寅周围的金色光晕一点点亮起，僧袍褶皱边缘映出渐强的金色反光。
> 25分钟后，阿寅起身，光环向外扩散一圈金色的波纹。
>
> 用户合上电脑，那一刻的专注，被看见了。

**成瘾路径：**
```
想要"抓住当下"的瞬间
→ 打开App，看一眼阿寅现在是自然休憩还是金色庆祝(0.5秒感知)
→ 点击「与阿寅同坐」，进入陪伴式计时
→ 看着金色光环实时增强(过程本身有反馈感，不用等到结束才知道)
→ 达标触发庆祝(即时满足)
→ 即使某天忘了，阿寅也只是睡着，不会真的失去它
→ 习惯形成，无需意志力
```

---

## 姿态-信号映射表（MoodController 状态机设计）

| 姿态 | 触发信号 | 说明 |
|---|---|---|
| IDLE_CLOSED_EYES | 默认态 / 当日尚未产生显著专注数据 | 日常展示,叠加旋转+呼吸+可能的金粒子(专注一般时) |
| SLEEPING | 距最近一次专注结束 ≥ `DORMANT_IDLE_HOURS`（默认 2h，滚动窗口）且经 **live** 仲裁（**Rise 后**，或回前台且 **tab hidden ≥2h**，或本地深夜 ≥23 / &lt;06）进入 DORMANT；播 `cloak-sleep` 过渡。**白天冷启动 `onAppReady` 与短切 tab 不进睡**。付款致谢压过深夜披毯。禁止在 Reflection 开着时进睡 | 叠加打呼噜 ZZZ 图标漂浮效果,rotation.x 微倾 |
| IDLE_SMILING | 当日已触发过一次 CELEBRATING | 持续展示至当天结束,次日重置回 IDLE_CLOSED_EYES |
| CELEBRATING | 专注数据首次达标(当日) | 一次性播放,播放完自动切换为 IDLE_SMILING |
| T_POSE | 仅调试用 | 不面向最终用户 |

### 庆祝动画触发规则（防重复刷屏）

庆祝动画(CELEBRATING)每个自然日只播放一次,以日期戳判断当天是否已触发过。同一天内后续的"达标"信号仅做静默数据记录,不重复触发视觉庆祝动画,避免体验廉价化及被恶意反复触发。次日该日期戳重置,允许再次触发一次庆祝。

### 每日总结氛围与实时姿态的关系

每日总结氛围(雪花=当日专注水平尚未显著 / 花瓣=专注水平较高)与实时姿态(IDLE_CLOSED_EYES / SLEEPING / IDLE_SMILING / CELEBRATING)是两条独立的信号轴线,可同时叠加显示,不互斥、不合并进同一状态机。

---

## 新玩法:今日一炷香(每日轻量引导)

**目的**:解决冷启动引导问题——新用户打开产品时,当前设计缺少"接下来该做什么"的轻量提示,这个玩法用极低压力的方式给出当日目标。

**触发时机**:每天用户第一次打开产品时触发。

**呈现方式**:老虎旁边出现一句轻量文案,例如:
- "今天,我们一起坐25分钟。"
- "今天只需:15分钟。"
- "今天,一起完成一个小目标。"

文案应遵循"不制造焦虑原则"(参见PRINCIPLES.md):语气轻柔、无倒计时压迫感、无"未完成"的负面视觉暗示,可视为该原则的典型落地案例。

### 完成后的反馈(已定稿)

不新增GLB姿态资源,完全基于现有的 IDLE_CLOSED_EYES(坐禅闭眼)姿态,叠加两个独立的Object3D程序化效果实现:

1. **轻微低头动作**:在IDLE_CLOSED_EYES姿态基础上,叠加一个短暂的rotation.x微小前倾变换(建议角度5-8度左右,具体数值以视觉效果自然为准),用一个短时长的缓动动画(如0.6-1秒)完成"低头→缓慢恢复"的过程,不循环、播放一次。

2. **香烟意象**:一缕淡淡的烟雾状粒子,从模型头顶或身前一炷香的位置(具体锚点位置由实现时的模型观察确定)缓慢向上飘散、逐渐扩散变淡直至消失。建议用少量(个位数到十几个)半透明灰白色粒子,配合缓慢的上升位移+透明度衰减+轻微横向飘移实现,不需要复杂的烟雾模拟,写意即可,持续时间与低头动作大致同步或略长。

此反馈明确独立于 CELEBRATING 姿态之外,不消耗/复用后者的视觉资源,以保持两种反馈的强度区分:"今日一炷香"完成是轻量确认,当日首次达到专注目标才是完整庆祝。

**当日状态**:一炷香完成后,当天不再重复弹出该引导语,视为已完成(具体计数逻辑与"庆祝动画每日限一次"的日期戳机制一并设计,复用同一套"当日状态"判断基础设施)。

---

## Focus Confidence(专注可信度)模型

**核心设计哲学**:系统不对用户的状态做"是否专注"的二元判断,而是基于多种可获得的信号,估算一个"专注可信度"分值(0-100),该分值本身**不直接展示给用户**,而是通过视觉表现(粒子稳定度、金光效果等)间接传达。这与"不制造焦虑原则"及"数据是配角、老虎是主角"的产品定位一致。

#### 已知设计缺陷：标签可见 ≠ 专注（知识工作多工具切换）

现有信号链路（visibility / blur / idle）容易被简化为「本标签页可见 ≈ 专注」。这对**知识工作**（编程、项目管理、创作等）**不成立**：高质量心流同样需要频繁切换多个工具 / 标签页，与真正分心在浏览器内**无法区分**（隐私沙盒不允许探测其他 App / 标签页内容）。因此「标签页活跃 = 专注」会对这类用户产生系统性误判。

**已采纳对策（诚实机制延伸，非技术猜测）**：通过 Companion Mode **用户自主声明**会话语境——尤其第三子模式 **I'm working across tools**——关闭离开类分心判定，而不是继续用 visibility 硬猜。缺陷背景与三选一规则见上文「专注会话陪伴模式」。完整 Focus Confidence V1 实现时必须遵守该边界；不得把多工具切换默认记为 Interruption 惩罚信号。

**与 Companion Mode 的关系（2026-07-16，三选一扩展）**：

- **Stay here with me**（默认）：本节信号模型可按既有设计运行；
- **I'll step away — wait quietly** / **I'm working across tools**：本会话内**不得**把「离开页面 / 失焦」解释为需要 Re-focus 或离开类 MindfulAcknowledge 的分心事件；计时一律用墙钟时间戳差值；across-tools 另保留宽松 idle 兜底（阈值待拍板，建议 ≥30 分钟）。

**当前阶段(V1)可实现的信号来源**(全部为网页端原生能力,无需插件、无需额外权限、不涉及敏感内容记录):

| 信号 | 实现方式 | 说明 |
|---|---|---|
| 用户主动开始专注 | 已有(点击开始按钮) | 基础可信度锚点 |
| 番茄钟/计时完成 | 已有 | 加分信号 |
| 浏览器标签是否切走 | Page Visibility API (`visibilitychange`) | Stay 模式下可用；**不得**在 step-away / across-tools 下当作分心惩罚依据 |
| 窗口是否失焦 | `window.blur` / `window.focus` 原生事件 | 同上 |
| 长时间无操作(idle) | 监听 mousemove/keydown 等事件,超时未触发判定为idle | 仅判断"有无活动",不记录具体输入内容；across-tools 下仅作宽松兜底 |
| 本页禅意背景音实际播放时长 | 已落地（见上文「禅意背景音」） | 独立在场置信信号；仅追踪 Focus Tiger 自播音频；**默认开播 Mer-Ka-Ba**，可随时一键关闭；作光效叠加而非达标真值 |

**Interruptions(干扰事件)机制**:
系统不直接告知用户"你不专注",而是客观记录中性事件"今日中断次数:N次"。V1阶段的Interruption事件来源限定为:标签页切换(visibilitychange触发)、窗口失焦(blur事件)、长时间idle超时。这个列表设计为可扩展结构,未来可持续加入新的事件源而不改变核心机制。**在 Companion Mode 的 step-away / across-tools 子模式下，visibility / blur 不得计入此类中断叙事。**

**Flow Continuity(连续性,内部指标,不向用户展示数值)**:
基于一段专注时段内的Interruption频率与分布,计算一个连续性百分比。该数值**严禁**以数字形式展示给用户(如"连续性72%"),而应转化为视觉表现驱动动态效果层的参数,例如:
- 连续性高 → 金色粒子效果稳定、持续、不间断
- 连续性较低 → 金色粒子出现短暂停滞后自动恢复,而非直接消失或转为负面视觉(如变灰、变暗)

此机制需要与既有的"动态效果层"(粒子系统)对接,Continuity数值作为粒子系统的一个驱动参数,而非独立的展示模块。在 across-tools 子模式下，不得因正常多工具切换压低 Continuity 并制造「你不专心」的视觉暗示。
