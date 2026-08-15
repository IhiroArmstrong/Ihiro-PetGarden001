# ONBOARDING_HINTS.md — Hint 产品面（收窄版）

创建日期：2026-07-19（v3）  
**最后更新：2026-08-15（Focus HUD 三控件：无脉冲点，悬停控件本身出 tip，同「?」）**

## 产品面（强制 · 2026-08-04）

从现在起，**运行时只保留两件事**，其它 Hint 路径不再作为产品承诺：

1. **脉冲点悬停**：鼠标停在薄荷绿脉冲点上 → 看该条 tip；**指针离开 → tip 立刻消失**。  
   **例外（2026-08-15）**：`focus-hud-ring` / `focus-hud-progress` / `focus-hud-streak` **不画**薄荷绿脉冲；鼠标停在对应 HUD 控件（金环 / 今日同坐条 / 近日同坐环）上 → 仍出该条 tip，移开即收——与左下「?」无脉冲也能悬停出文案同一办法。  
2. **「?」看产品简介**：点击或悬停左下 / ActionBar「?」→ **只**出 `#onboarding-app-purpose`（What this space is for）；**禁止**同屏喷本页其它 tips / More tips 芯片。

已取消（代码可留死路径，产品勿再验）：自动 tip 喷洒、点「?」补救铺开、`help-remedy` / catalog 芯片、Focusing「还有 N 条」。

原则：不强迫用户读说明书；发现路径靠脉冲点悬停，空间定位靠「?」简介卡。

> **Five Moments 显性化（2026-08-09）**：Moment Whisper / Compass **不是** Hint `auto` 喷洒，不得借机恢复已取消的补救铺开。权威排期与边界见 `PRODUCT_MOMENTS.md` §5.6 与 `task-briefs/task-five-moments-surface-plan.md`。Whisper = `#moment-whisper` 一生一次淡出句（`momentWhispersGate`）；与 Hint registry **分轨**。

> **与脉冲点重复的悬停 Hint（2026-08-05）**：若某控件**已有**薄荷绿脉冲 tip，禁止再叠原生 `title` / 控件自绘 hover 卡等与 tip 同义的悬停文案（例：`streak-meter` 的 `title` + `.label` 与 `focus-hud-streak`）。**例外（2026-08-11）**：首页左球 `quick-start` **不再**画薄荷绿脉冲，始终保留 `title`（Breath practice / QUICK_START_ARIA）。**例外（2026-08-15）**：Focus HUD 三条 **不再**画薄荷绿脉冲，但未读时仍由 hint tip 拥有悬停（`pulse-owns-tip` 去重 `.label`）；**脉冲已 done / 无脉冲且无宿主悬停 tip**时，须保留残余悬停，不得静默清空。

> **场景接线（何时出、互斥、宽窄门闩、批次政策）**：权威见 **[`HINTS_WIRING.md`](./HINTS_WIRING.md)**。registry / 文案键仍以下方机器块为准；**运行时策略以上方「产品面」为准**。

---

## 〇、触发模式与圆点层级（Registry）

真源：`onboardingHintRegistry.js`。UI **禁止**散落 if/else 硬编码模式/层级。

### `triggerMode`（怎么出现）

| 模式 | 默认表现（**2026-08-04 运行时**） |
|---|---|
| **`auto`** | Registry 仍登记；**运行时不再主动弹出**气泡 |
| **`click`** | 控件旁薄荷绿圆点；**悬停**出 tip，移开即收。例外：`help-affordance` 悬停/点击「?」只出产品简介；`focus-hud-*` 不画圆点，悬停 HUD 控件出 tip |
| **`manual`** | 从不自动出现 |
| **`legacy`** | 基本不调度 |

### `tier`（仅 `triggerMode: click`；其余省略 = null）

**auto / manual / legacy 不填 `tier`**：无圆点，不适用 peek / static / done 圆点语义。

| tier | 已读语义（混合 α+β） |
|---|---|
| **`simple`** | 悬停或点圆点 → 预览 tip；关框（点外 / 点气泡 / 失焦）→ **`peeked`**：圆点改**静止弱化**（约 5–6px、opacity ≈0.4、无动效）。相关操作 `markSeen` → **`done`**，圆点**彻底移除** |
| **`detailed`** | 悬停/点圆点 → 浅层预览（仍脉冲）；点「了解此空间」或二次点圆点 / Enter → 详情页（用途简介卡）→ **`done`**，圆点移除。仅关预览 ≠ 已读 |

存储：`focus-tiger.hints-seen.v1` 值为 `'peeked' \| 'done'`（旧 `true` 迁为 `done`）。

**click（圆点触发）**：`how-shall-we-sit` · `ambient-soundscape`（首次登录右上音符）· `ambient-gated` · `rise-button` · `idle-after-session` · `weekly-heatmap` · `language-preference` · `micro-ritual` · `in-app-reminder` · `quick-start` · `focus-hud-*` · `help-affordance`

**auto（registry 保留；运行时不喷）**：`sit-button` · `honesty-optional` · `honesty-bridge` · `notice` · `breathing` · `choose` · `companion-mode` · `companion-stay` · `companion-away` · `companion-across-tools` · `reflection`

### click 七条 tier 定稿

| hintId | tier |
|---|---|
| `help-affordance` | **detailed**（运行时：? → 简介卡，不出 tip 气泡） |
| `how-shall-we-sit` · `ambient-gated` · `rise-button` · `idle-after-session` · `weekly-heatmap` · `micro-ritual` | **simple** |

### 触屏 / 键盘（摘要）

- **触屏 simple**：点圆点 = 预览；点外或点气泡 = peeked 静止。
- **触屏 detailed**：第一次点圆点 = 预览 +「了解此空间」；点 CTA 或再点圆点 = 详情 → done。点「?」开简介卡 = done。
- **键盘**：Tab/focus = 预览；simple 失焦/Esc/点气泡 = peeked；detailed Enter（圆点上或 CTA）= 详情 → done。

### auto 主动弹出（保留）

`sit-button` · `honesty-optional` · `honesty-bridge` · `notice` · `breathing` · `choose` · `companion-mode` · `companion-stay` · `companion-away` · `companion-across-tools` · `ambient-soundscape` · `reflection` — **无 tier**。

---

## 一、完整提示点清单（按 Kelly 首日旅程 + 回流）

文案为过观察式四项自检后的**可上线稿**（描述可做之事，不评判用户状态）。

| hintId | 场景（对应故事） | 提示 EN / ZH | 自动出现时机 | 完成操作后记已读 | 补救可调 |
|---|---|---|---|---|---|
| `dormant-open` | （历史）睡着开场 | 保留 id；开场已改 Idle，基本不自动触发 | — | — | 兼容 |
| `honesty-optional` | A1 / D Honesty 提示 | "This check-in is optional — Sit still works." / 「这段补登可以略过，直接同坐也行。」 | 首次见到 Honesty 入口（含窄屏 Honesty 圆球） | 点 Sit 忽略，或点进补登 | 是 |
| `honesty-bridge` | Honesty 桥接 Yes/No | "Yes begins Arrival; No stays with idle. Either is fine." / 「选 Yes 进入到达练习；选 No 继续闲坐。都可以。」 | 首次桥接面板可见 | 点 Yes / No | 是 |
| `sit-button` | A2 主 CTA | "Tap to sit with Yin." / 「点击与阿寅同坐。」 | 空闲且从未开过会话 | 点 Sit | 是 |
| `quick-start` | Idle 首页左球 · Breath practice | "Breath practice — soft sit with Yin, no full Focus." / 「呼吸练习——轻轻陪阿寅坐一会儿，不必完整同坐。」 | Idle 且左球可见 | 点左球开时长 picker | 是 |
| `how-shall-we-sit` | 故事 I | "Or begin from here." / 「也可以从这里开始。」 | 首次看到 How shall we sit? | 点该钮展开三选一或完成 Arrival | 是 |
| `notice` | A3b | "A tap is enough — or skip ahead." / 「点一下就好，也可以跳过。」 | 首次 Notice | 点选图标或 Skip | 是 |
| `breathing` | A3c | "Just breathe with Yin. Nothing else to do." / 「跟着阿寅呼吸就好，不用做别的。」 | 首次呼吸 beat | 呼吸结束或 Skip | 是 |
| `choose` | A3d | "Choose one — or type your own." / 「选一个，也可以自己写。」 | 首次 Choose | 确认/Skip | 是 |
| `companion-mode` | A4 面板 | "Pick one — the timer starts." / 「选一个，计时就会开始。」 | 首次展开三选一 | 点选任一模式 | 是 |
| `companion-stay` | A4 Here & Now | "Yin stays quiet nearby unless you are away a while." / 「你在时阿寅不多打扰；离开一阵才会轻轻留意。」 | 首次看到该选项（面板打开） | 点选 Here & Now | 是 |
| `companion-away` | E Offline Space | "Check-ins pause while you are away. Sit again when ready to begin." / 「离开时提醒会暂停。准备开始时再点同坐。」 | 首次看到该选项 | 点选 Offline Space | 是 |
| `companion-across-tools` | F Flow State | "Away reminders stay off in this mode." / 「这个方式下，离开提醒会保持关闭。」 | 首次看到该选项 | 点选 Flow State | 是 |
| `ambient-gated` | Idle 下 Sound | "Track selection opens once you sit." / 「同坐开始后，曲目选择才会打开。」 | Idle / 桥接等非 Focusing 表面 | 开计时 / 点气泡 | 是 |
| `ambient-soundscape` | 背景音乐 opt-in（首次登录右上） | "If your environment allows, tap here to play music — it may make the experience better." / 「若环境允许，点这里播放音乐，体验可能更好。」 | Idle 右上音符薄荷绿圆点；点圆点出说明 | 点音符开 Soundscape / 选曲 / 关面板 | 是 |
| `rise-button` | C Rise | "Rising early is welcome too." / 「中途起身，也完全可以。」 | 首次 FOCUSING 见到 Rise | 点 Rise 或完成本场 | 是 |
| `reflection` | A10 / C | "Answer if you like — skipping is fine." / 「愿意就答；跳过也可以。」 | 首次进入 Reflection | 答完/跳过关闭 | 是 |
| `idle-after-session` | A11 结束后 | "Sit again whenever you like." / 「想再坐的时候，随时可以。」 | 首次会话结束回到空闲 | 再次 Sit 或离开页 | 是 |
| `weekly-heatmap` | Idle 左下 7 格 | "A quiet week… The outlined square is today." / 「近日同坐…描边的那格是今天。」 | Idle 热力图可见 | 开计时 / 点气泡 | 是 |
| `language-preference` | Idle 右下地球 | "Choose a language — English or 日本語." / 「言語を選べます…」 | 宽屏 Idle 地球 FAB 可见 | 开语言面板 / 点气泡 | 是 |
| `in-app-reminder` | Idle 热力图旁时钟 | "Set a daily time — Yin leaves a gentle note if you haven't practiced yet." / 「设一个每天的时分——若还没同坐，阿寅会留下一句轻提示。」 | Idle 热力图簇可见 | 开面板 / 开计时 / 点气泡 | 是 |
| `micro-ritual` | （legacy id）同左球 Breath practice | 与 `HINT_QUICK_START` / `HINT_MICRO_RITUAL` 同义；入口已迁首页左球；抽屉/⋯ 不再列 | `microRitualEntryVisible`（现恒假）时才进列表；开练习时与 quick-start 同 markSeen | 点左球 | 是 |
| `help-affordance` | 补救入口自身 | "Not sure what to tap next? Start here." / 「不知下一步点什么？先点这里。」 | 首次空闲见到左下角「?」 | 点「?」或点气泡 | 是 |
| `help-remedy` | 点「?」补救 | "All the tips… Click a tip to dismiss it; tap ? anytime you want them again." / 「本页…点一下气泡即可关掉；下次需要时再点问号。」 | （仅点「?」，不自动） | 点气泡关闭 | 否 |
| `help-fallback` | 补救兜底 | "Sit with Yin when you are ready." / 「准备好了，就与阿寅同坐。」 | （仅补救，不自动） | — | 是 |

共 **23** 个可自动提示 + **1** 个点「?」元文案（含关闭说明）+ **1** 个兜底。旧稿「Stay here / I'll step away」已改为产品键名。

<!-- onboarding-hints-registry:anchors:begin -->

> **机器块 · 勿手改**。真源：`src/core/onboardingHintRegistry.js`。刷新：`npm run hints:doc-sync`。

| hintId | localeKey | triggerMode | tier | selector | placement | tip | anchorGroup |
|---|---|---|---|---|---|---|---|
| `dormant-open` | `HINT_DORMANT_OPEN` | `legacy` | — | `#btn-focus` | above | bottom | — |
| `sit-button` | `HINT_SIT_BUTTON` | `auto` | — | `#btn-focus` | above | bottom | — |
| `quick-start` | `HINT_QUICK_START` | `click` | `simple` | `#quick-start-focus` | above | bottom | — |
| `how-shall-we-sit` | `HINT_HOW_SHALL_WE_SIT` | `click` | `simple` | `.session-start-dock__hint` | right | left | — |
| `honesty-optional` | `HINT_HONESTY_OPTIONAL` | `auto` | — | `#honesty-idle-entry` | above | bottom | — |
| `honesty-bridge` | `HINT_HONESTY_BRIDGE` | `auto` | — | `#honesty-bridge-cta` | above | bottom | — |
| `notice` | `HINT_NOTICE` | `auto` | — | `#arrival-practice, #btn-focus` | above | bottom | — |
| `breathing` | `HINT_BREATHING` | `auto` | — | `#arrival-practice, #btn-focus` | above | bottom | — |
| `choose` | `HINT_CHOOSE` | `auto` | — | `#arrival-practice, #btn-focus` | above | bottom | — |
| `companion-mode` | `HINT_COMPANION_MODE` | `auto` | — | `.session-start-dock__panel, .session-start-dock__hint` | above | bottom | — |
| `companion-stay` | `HINT_COMPANION_STAY` | `auto` | — | `.session-start-dock__panel` | above | bottom | — |
| `companion-away` | `HINT_COMPANION_AWAY` | `auto` | — | `.session-start-dock__panel` | above | bottom | — |
| `companion-across-tools` | `HINT_COMPANION_ACROSS` | `auto` | — | `.session-start-dock__panel` | above | bottom | — |
| `ambient-gated` | `HINT_AMBIENT_GATED` | `click` | `simple` | `.ambient-soundscape__fab` | left | right | `ambient` |
| `ambient-soundscape` | `HINT_AMBIENT_SOUNDSCAPE` | `click` | `simple` | `.ambient-soundscape__mute` | below | top | `ambient` |
| `rise-button` | `HINT_RISE_BUTTON` | `click` | `simple` | `#btn-focus` | above | bottom | — |
| `reflection` | `HINT_REFLECTION` | `auto` | — | `#tiger-reflection-moment` | above | bottom | — |
| `idle-after-session` | `HINT_IDLE_AFTER_SESSION` | `click` | `simple` | `#btn-focus` | above | bottom | — |
| `weekly-heatmap` | `HINT_WEEKLY_HEATMAP` | `click` | `simple` | `#weekly-practice-heatmap` | right | left | — |
| `language-preference` | `HINT_LANGUAGE_PREFERENCE` | `click` | `simple` | `#language-preference-fab` | left | right | — |
| `in-app-reminder` | `HINT_IN_APP_REMINDER` | `click` | `simple` | `#reminder-preference-toggle` | right | left | — |
| `micro-ritual` | `HINT_MICRO_RITUAL` | `click` | `simple` | `#quick-start-focus, #ft-wide-home-quickstart, #ft-narrow-home-quickstart` | above | bottom | — |
| `focus-hud-ring` | `HINT_FOCUS_HUD_RING` | `click` | `simple` | `#focus-hud .ft-hud__gauge` | below | top | `focus-hud` |
| `focus-hud-progress` | `HINT_FOCUS_HUD_PROGRESS` | `click` | `simple` | `#focus-hud .ft-hud__bar` | below | top | `focus-hud` |
| `focus-hud-streak` | `HINT_FOCUS_HUD_STREAK` | `click` | `simple` | `#focus-hud .ft-hud__streak` | left | right | `focus-hud` |
| `narrow-drawer-menu` | `HINT_NARROW_DRAWER_MENU` | `manual` | — | `.ft-narrow-grabber` | above | bottom | — |
| `wide-more-menu` | `HINT_WIDE_MORE_MENU` | `manual` | — | `#ft-wide-more-btn` | above | bottom | — |
| `help-affordance` | `HINT_HELP_AFFORDANCE` | `click` | `detailed` | `#onboarding-hint-help` | right | left | — |
| `help-remedy` | `HINT_HELP_REMEDY` | `manual` | — | `#onboarding-hint-help` | right | left | — |
| `help-fallback` | `HINT_HELP_FALLBACK` | `manual` | — | `#btn-focus` | above | bottom | — |

<!-- onboarding-hints-registry:anchors:end -->

### 音乐提示（对应 ambient-soundscape 文案）

音乐 **默认关闭（opt-in）**。首次 Idle：右上音符见**薄荷绿脉冲**；悬停展开 tip（`HINT_AMBIENT_SOUNDSCAPE`），移开即收。**仅选曲**后永久 `markSeen`（mint 消）；点音符开面板**不清** mint。done 后悬停残余用原生 `title`（`AMBIENT_NOTE_HOVER`）；未读时由 mint tip 压掉原生 title，避免双文案。**不**再使用常驻 `#ambient-note-label` 自绘气泡（2026-08-06 用户书面：点后长文案气泡行为不对，改回脉冲点 Hint）。**不**在 hint 中承诺光效变化。

---

## 二、「?」入口（产品简介 · 非补救喷洒）

- **常驻**：左下角极小「?」（窄屏 ActionBar `#ft-narrow-help-btn` 代理）。
- **点击或悬停**：只打开 `#onboarding-app-purpose` 产品简介卡；点「知道了 / Got it」或框外空白关闭；悬停打开时指针离开 ? / 卡 → 收起。
- **Privacy 链（2026-08-07）**：简介卡上次要文字链 → `#onboarding-privacy-sheet` 只读说明（本地优先；不承诺具名云保管同步）；**Back** 回到简介卡。简介正文含 no pressure / no ads / local-first 气质（见 locales `HINT_APP_PURPOSE_BODY`）。
- **Wellness 免责（2026-08-14）**：简介卡正文下独立区块 `#onboarding-app-purpose` → `.onboarding-app-purpose__wellness`（en + ja：练习专注 / 正念 / 缓和日常压力；不是医疗器械或心理诊疗；不能替代咨询师 / 治疗师 / 医生；**not intended to diagnose, treat, cure, or prevent any disease**）。气质克制、不制造焦虑；**禁止**写成治疗临床病症。叙事：`PRODUCT_POSITIONING.md` / `PRINCIPLES.md`。
- **Wellness 查阅入口（2026-08-15）**：默认**不**在冷启动 Idle 自动弹出 `#onboarding-wellness-first`（用户书面：开场警告牌会吓跑人）。常驻入口仍是 **「?」简介卡**同一免责区块。Privacy Sheet 有一句交叉引用链回简介免责。QA：`?wellnessFirst=1` 仍可强制 Got it 卡；`=0` 关闭。点「?」亦记已读。
- **禁止**：同屏再出本页其它 tip、`help-remedy`、More tips 芯片、Focusing「还有 N 条」；简介卡内嵌整篇隐私长文。
- **实现**：`OnboardingHintsUI.openPurposeOnly()`（`showRemedy()` 现为同义薄包装）；文案守卫 `privacyNoticeCopy.js`。

> **历史（已废）**：曾用点「?」把当前场景 tips 再铺一遍作补救；2026-08-04 用户书面取消——乱、叠、难关单。Store 内 `resolveRemedy*` 可暂留供单测/文档考古，**产品路径不得再调用铺开**。

---

## 三、硬性禁令（保留）

- **禁止**做集中式多步 coachmark / 遮罩教程 /「下一步」强制路径。
- **禁止**怀疑性 / 焦虑文案（对齐 PRINCIPLES）。
- tip 气泡仍须可点关；脉冲点悬停路径以**移开即消失**为准。

---

## 四、存储与实验室

规则：simple 关预览 → peeked；操作完成 → done；实验室「清空」清全部。简介卡点击「?」→ `help-affordance` done。

---

## 五、实现清单（收窄后）

基于本文件产品面：

1. click 脉冲点悬停预览；移开立刻收。
2. 「?」→ `openPurposeOnly`（简介卡）；永不 `showRemedy` 铺 tip。
3. `maybeShowAuto` / `syncVisibleAutos`：**不**再画 auto 气泡；仍同步 click 圆点。
4. 文案仍走 locale + registry。
5. e2e：`onboarding-remedy-contract.spec.js` 锁「? → purpose only / 无 tip 喷洒」。

---

## 机器可读锚点块

> 下列机器块由 `npm run hints:doc-sync` 从 registry 生成；改锚点先改 `onboardingHintRegistry.js`。见上文 §一表格（`<!-- onboarding-hints-registry:anchors -->`）。

### 气泡视觉（保留）

- 漫画说话框：圆角 + **小尖角**指向对应控件。
- **浅绿灰填充**（`#eef6f1` → `#dceae2`）+ 斜体衬线。
- App 用途简介卡同系薄荷绿，略大、无尖角，锚在「?」附近。

### 点击 / 悬停关闭（硬性）

- 脉冲点悬停 tip：**指针离开脉冲点 → tip 立刻消失**。Focus HUD 三条：离开对应控件即收。
- tip 气泡仍允许点击立刻关掉。
- 「?」简介卡：Got it / 框外空白关闭；悬停打开则离开 ? / 卡即收。

---

## 六、实现约束（不变）

1. 不新建教程浮层（遮罩、高亮、箭头、分步导航）。
2. 不做集中式引导流程；每条独立触发。
3. 每条独立记忆已读。
4. 「?」安静但可发现；不做帮助中心（无目录式 FAQ）。
5. **禁止**把点「?」再做成「本页 tip 喷洒」补救。

### anchor 校验分层（2026-07-22 拍板 · Registry）

| 层级 | 手段 | 状态 |
|---|---|---|
| **(1) Registry SSOT** | `onboardingHintRegistry.js` 派生；单测锁 1:1 | **已落地** |
| **(2) md 锚点块同步** | `hints:doc-check` / `hints:doc-sync` | **已落地** |
| **(3) DOM 视觉位置 / 色** | mint RGB + tip 几何护栏 | **④ 试点**（? 喷 tip 相关断言已改「purpose only」） |

---

## 七、验收口径（人工）

1. 悬停右上音符（或其它薄荷绿脉冲）→ tip；移开 → tip 立刻没。  
   Focus HUD：卡上**无**薄荷绿碎点；悬停金环 / 今日同坐条 / 近日同坐环 → 对应 tip，移开即收。  
2. 点或悬停「?」→ **只**见产品简介；**不得**见 Sit / weekly / HUD 等 tip 满屏。  
3. 375 Focusing 点「?」→ 仍只见简介，无 tip 叠团。  
4. Rise 后再点「?」→ 仍只见简介。

自动化：`e2e/onboarding-remedy-contract.spec.js`（purpose only）+ mint 存续行。

**新增 hint 工作流**：先对照 **`HINTS_WIRING.md`** 选场景行与批次簇 → 改 `onboardingHintRegistry.js` → `npm run hints:doc-sync` → 补 locales → 视需要改 Store → `npm run test:smoke`。**禁止**再把新 tip 绑回点「?」喷洒。

---

## 八、数据存储

```
localStorage key: focus-tiger.hints-seen.v1
结构：{ [hintId: string]: 'peeked' | 'done' }  （旧 true 读入迁为 'done'）
- done：click 圆点移除（相关操作完成 / 点「?」记 help-affordance）
- peeked：仅 click+simple；圆点静止弱化
规则：simple 预览关框 → peeked；实验室「清空」清全部。
```
