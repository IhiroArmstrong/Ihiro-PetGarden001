# ONBOARDING_HINTS.md — 分散式即时提示（完整版）+ 常驻补救入口

创建日期：2026-07-19（v3：按 SCENARIO_TESTS 故事补全「下一步该干啥」；对齐产品文案 Here & Now / Offline Space / Flow State）  
最后更新：2026-07-27（窄屏抽屉关闭：补救目录折叠为一次性 `narrow-drawer-menu`；抽屉锚 tip 不得乱指主球）
结论：不做集中式引导浮层/coachmark 教程，改为两层机制配合：
1. **即时提示**：每个功能第一次真正出现时，用阿寅自己的文字气泡多带一句极简说明，用完即隐藏。
2. **补救入口**：界面角落一个极小的常驻「?」图标，点击后用同样的气泡样式，把当前场景该有的提示再说一遍——防止用户第一次没看进去就永久错过。

原则：不强迫用户读说明书；尽量做成**傻瓜交互式**开头——每一步只回答「此刻点哪里 / 可以跳过吗 / 点了会发生什么」。

---

## 一、完整提示点清单（按 Kelly 首日旅程 + 回流）

文案为过观察式四项自检后的**可上线稿**（描述可做之事，不评判用户状态）。

| hintId | 场景（对应故事） | 提示 EN / ZH | 自动出现时机 | 完成操作后记已读 | 补救可调 |
|---|---|---|---|---|---|
| `dormant-open` | （历史）睡着开场 | 保留 id；开场已改 Idle，基本不自动触发 | — | — | 兼容 |
| `honesty-optional` | A1 / D Honesty 提示 | "This check-in is optional — Sit still works." / 「这段补登可以略过，直接同坐也行。」 | 首次见到 Honesty 入口（含窄屏 Honesty 圆球） | 点 Sit 忽略，或点进补登 | 是 |
| `honesty-bridge` | Honesty 桥接 Yes/No | "Yes begins Arrival; No stays with idle. Either is fine." / 「选 Yes 进入到达练习；选 No 继续闲坐。都可以。」 | 首次桥接面板可见 | 点 Yes / No | 是 |
| `sit-button` | A2 主 CTA | "Tap to sit with Yin." / 「点击与阿寅同坐。」 | 空闲且从未开过会话 | 点 Sit | 是 |
| `quick-start` | Idle ⚡ Quick Start | "Skip Arrival — begin with your last way of sitting." / 「跳过到达练习——用上次的同坐方式立刻开始。」 | Idle 且 ⚡ / 窄屏闪电球可见 | 点 ⚡ / Quick Start 球 | 是 |
| `how-shall-we-sit` | 故事 I | "Or begin from here." / 「也可以从这里开始。」 | 首次看到 How shall we sit? | 点该钮展开三选一或完成 Arrival | 是 |
| `notice` | A3b | "A tap is enough — or skip ahead." / 「点一下就好，也可以跳过。」 | 首次 Notice | 点选图标或 Skip | 是 |
| `breathing` | A3c | "Just breathe with Yin. Nothing else to do." / 「跟着阿寅呼吸就好，不用做别的。」 | 首次呼吸 beat | 呼吸结束或 Skip | 是 |
| `choose` | A3d | "Choose one — or type your own." / 「选一个，也可以自己写。」 | 首次 Choose | 确认/Skip | 是 |
| `companion-mode` | A4 面板 | "Pick one — the timer starts." / 「选一个，计时就会开始。」 | 首次展开三选一 | 点选任一模式 | 是 |
| `companion-stay` | A4 Here & Now | "Yin stays quiet nearby unless you are away a while." / 「你在时阿寅不多打扰；离开一阵才会轻轻留意。」 | 首次看到该选项（面板打开） | 点选 Here & Now | 是 |
| `companion-away` | E Offline Space | "Check-ins pause while you are away. Sit again when ready to begin." / 「离开时提醒会暂停。准备开始时再点同坐。」 | 首次看到该选项 | 点选 Offline Space | 是 |
| `companion-across-tools` | F Flow State | "Away reminders stay off in this mode." / 「这个方式下，离开提醒会保持关闭。」 | 首次看到该选项 | 点选 Flow State | 是 |
| `ambient-gated` | Idle 下 Sound | "Track selection opens once you sit." / 「同坐开始后，曲目选择才会打开。」 | Idle / 桥接等非 Focusing 表面 | 开计时 / 点气泡 | 是 |
| `ambient-soundscape` | 背景音乐 opt-in | "Music stays off until you tap — tap the note to play." / 「音乐默认关闭——点音符按钮才会播放。」 | 首次 FOCUSING 或展开曲目面板 | 开关音乐 / 关面板 | 是 |
| `rise-button` | C Rise | "Rising early is welcome too." / 「中途起身，也完全可以。」 | 首次 FOCUSING 见到 Rise | 点 Rise 或完成本场 | 是 |
| `reflection` | A10 / C | "Answer if you like — skipping is fine." / 「愿意就答；跳过也可以。」 | 首次进入 Reflection | 答完/跳过关闭 | 是 |
| `idle-after-session` | A11 结束后 | "Sit again whenever you like." / 「想再坐的时候，随时可以。」 | 首次会话结束回到空闲 | 再次 Sit 或离开页 | 是 |
| `weekly-heatmap` | Idle 左下 7 格 | "A quiet week of shared sitting — lit days you practiced." / 「近日同坐的日子——亮起的格，是你来过的日子。」 | Idle 热力图可见 | 开计时 / 点气泡 | 是 |
| `in-app-reminder` | Idle 热力图旁时钟 | "Set a daily time — Yin leaves a gentle note if you haven't practiced yet." / 「设一个每天的时分——若还没同坐，阿寅会留下一句轻提示。」 | Idle 热力图簇可见 | 开面板 / 开计时 / 点气泡 | 是 |
| `micro-ritual` | Idle 一分钟呼吸 | "A minute of breath — soft practice, no full Focus." / 「一分钟呼吸——轻轻练一下，不必完整同坐。」 | Idle 入口可见 | 点入口 / 开计时 | 是 |
| `help-affordance` | 补救入口自身 | "Not sure what to tap next? Start here." / 「不知下一步点什么？先点这里。」 | 首次空闲见到左下角「?」 | 点「?」或点气泡 | 是 |
| `help-remedy` | 点「?」补救 | "All the tips… Click a tip to dismiss it; tap ? anytime you want them again." / 「本页…点一下气泡即可关掉；下次需要时再点问号。」 | （仅点「?」，不自动） | 点气泡关闭 | 否 |
| `help-fallback` | 补救兜底 | "Sit with Yin when you are ready." / 「准备好了，就与阿寅同坐。」 | （仅补救，不自动） | — | 是 |

共 **22** 个可自动提示 + **1** 个点「?」元文案（含关闭说明）+ **1** 个兜底。旧稿「Stay here / I'll step away」已改为产品键名。

<!-- onboarding-hints-registry:anchors:begin -->

> **机器块 · 勿手改**。真源：`src/core/onboardingHintRegistry.js`。刷新：`npm run hints:doc-sync`。

| hintId | localeKey | selector | placement | tip | anchorGroup |
|---|---|---|---|---|---|
| `dormant-open` | `HINT_DORMANT_OPEN` | `#btn-focus` | above | bottom | — |
| `honesty-optional` | `HINT_HONESTY_OPTIONAL` | `#honesty-idle-entry` | above | bottom | — |
| `honesty-bridge` | `HINT_HONESTY_BRIDGE` | `#honesty-bridge-cta` | above | bottom | — |
| `sit-button` | `HINT_SIT_BUTTON` | `#btn-focus` | above | bottom | — |
| `quick-start` | `HINT_QUICK_START` | `#quick-start-focus` | above | bottom | — |
| `how-shall-we-sit` | `HINT_HOW_SHALL_WE_SIT` | `.session-start-dock__hint` | right | left | — |
| `notice` | `HINT_NOTICE` | `#arrival-practice, #btn-focus` | above | bottom | — |
| `breathing` | `HINT_BREATHING` | `#arrival-practice, #btn-focus` | above | bottom | — |
| `choose` | `HINT_CHOOSE` | `#arrival-practice, #btn-focus` | above | bottom | — |
| `companion-mode` | `HINT_COMPANION_MODE` | `.session-start-dock__panel, .session-start-dock__hint` | above | bottom | — |
| `companion-stay` | `HINT_COMPANION_STAY` | `.session-start-dock__panel` | above | bottom | — |
| `companion-away` | `HINT_COMPANION_AWAY` | `.session-start-dock__panel` | above | bottom | — |
| `companion-across-tools` | `HINT_COMPANION_ACROSS` | `.session-start-dock__panel` | above | bottom | — |
| `ambient-gated` | `HINT_AMBIENT_GATED` | `.ambient-soundscape__fab` | left | right | `ambient` |
| `ambient-soundscape` | `HINT_AMBIENT_SOUNDSCAPE` | `.ambient-soundscape__mute` | below | top | `ambient` |
| `rise-button` | `HINT_RISE_BUTTON` | `#btn-focus` | above | bottom | — |
| `reflection` | `HINT_REFLECTION` | `#tiger-reflection-moment` | above | bottom | — |
| `idle-after-session` | `HINT_IDLE_AFTER_SESSION` | `#btn-focus` | above | bottom | — |
| `weekly-heatmap` | `HINT_WEEKLY_HEATMAP` | `#weekly-practice-heatmap` | right | left | — |
| `in-app-reminder` | `HINT_IN_APP_REMINDER` | `#reminder-preference-toggle` | right | left | — |
| `micro-ritual` | `HINT_MICRO_RITUAL` | `#micro-ritual-idle-entry` | right | left | — |
| `focus-hud-ring` | `HINT_FOCUS_HUD_RING` | `#focus-hud .ft-hud__gauge` | below | top | `focus-hud` |
| `focus-hud-progress` | `HINT_FOCUS_HUD_PROGRESS` | `#focus-hud .ft-hud__bar` | below | top | `focus-hud` |
| `focus-hud-streak` | `HINT_FOCUS_HUD_STREAK` | `#focus-hud .ft-hud__streak` | left | right | `focus-hud` |
| `narrow-drawer-menu` | `HINT_NARROW_DRAWER_MENU` | `.ft-narrow-grabber` | above | bottom | — |
| `help-affordance` | `HINT_HELP_AFFORDANCE` | `#onboarding-hint-help` | right | left | — |
| `help-remedy` | `HINT_HELP_REMEDY` | `#onboarding-hint-help` | right | left | — |
| `help-fallback` | `HINT_HELP_FALLBACK` | `#btn-focus` | above | bottom | — |

<!-- onboarding-hints-registry:anchors:end -->

### 音乐提示（对应 ambient-soundscape 文案）

提示说明**默认有背景音乐**与一键开关；**不**在 hint 中承诺光效变化（`presenceBoost` 等为底层叠加，用户未感知时不写进引导文案）。

---

## 二、补救入口设计

- **位置**：左下角常驻「?」（与右下 Sound 对仗）；**约 52px、暖米金立体钮**（与 How shall we sit? 同系），可发现但不抢 Sit。
- **首次空闲**：自动气泡 `help-affordance`（「不知下一步点什么？先点这里」），锚在「?」**右侧**、尖角指向「?」；点「?」或点气泡即记已读。
- **交互**：点「?」同时做三件事：
  1. 展示**情境主条** tip（`resolvePrimaryRemedyHintId`）+ **「更多提示」芯片**（`#ft-hint-catalog-chip`）。**窄屏 Idle（抽屉关闭）**：芯片一次性展开 `narrow-drawer-menu`（文案列出抽屉内功能：呼吸 / How shall we sit? / Sound / Reminder / 近日同坐格），**禁止**再出「还有 3 条 / 2 条」倒计时，也**禁止**在抽屉未开时用尖角去指抽屉内控件（会误指主球）。**宽屏 / 抽屉已开**：仍可逐条展开其余 tip（同时最多主条 + 1）。窄屏抬离主球带时须**堆叠错开**（`_liftBubblesAboveNarrowHomeCtas`），且须 **lift→separate**（禁止 separate 后再统一抬到同一 Y，会把错开抵消）；
  2. 弹出一张**非遮罩**的 App 用途简介卡（`#onboarding-app-purpose`）：标题 + 一句定位式「能帮你做什么」（对齐 `PRODUCT_POSITIONING`：gamified mindfulness companion / regular practice, at your own pace；文案键 `HINT_APP_PURPOSE_*`）；点「知道了 / Got it」关闭；
  3. 补救期间 `syncVisibleAutos` 不会清掉这些气泡。
- **与即时提示**：即时「用完即隐藏」；补救不受已读限制。简介卡**不是**分步教程 / 遮罩 coachmark（仍遵守第三节禁令）。

### 气泡视觉（与按钮/输入框区分）

- 漫画说话框：圆角 + **小尖角**指向对应控件（Rise → `#btn-focus`；**默认音乐 / Soundscape** → 右上 `.ambient-soundscape__mute`（窄屏 Idle remap `#ft-narrow-mute-btn`）；**Idle Sound gated** 历史锚 → 右下 `.ambient-soundscape__fab`（宽屏 FAB 已藏，gated 文案主要经菜单/抽屉 Sound 路径；宽屏以右上音符开面板）；Reflection → 面板**上方**，不挡 Skip）。
- **`honesty-optional`**：锚 **Sit 按钮右侧**（窄屏自动翻至左侧），避免盖住 Honesty 提示 / 桥接面板。
- **浅绿灰填充**（`#eef6f1` → `#dceae2`）+ 斜体衬线，**刻意区别于** Continue / Companion / 输入框的米黄暖卡片（2026-07-21 曾误迁奶油色，已恢复薄荷绿）。
- **自动提示互斥（2026-07-21 · RESPONSIVE_LAYOUT P1）**：自动路径同一时刻**最多 1 条**（`selectExclusiveAutoHintIds`：`help-affordance` > Sit/Rise 等场景关键 > How shall we sit? / Sound 等）；用户关掉后串行下一条。点「?」**补救**：窄屏抽屉关闭时主条 + 一次性「更多提示」→ 抽屉说明；宽屏/抽屉开着时可逐条展开。抽屉锚 tip（热力图 / 呼吸 / How / Sound gated / 提醒）在抽屉关闭时不自动出现。
- App 用途简介卡同系薄荷绿，略大、无尖角，锚在「?」上方。

### 点击关闭（硬性）

- **所有**提示气泡（含「?」补救拉出的）**必须**允许鼠标点击气泡本身后**立刻消失**。
- 自动出现的提示：点击 = 记已读（`hints-seen`）+ 隐藏，之后该条不再自动出现；「?」仍可再调。
- 补救提示：点击仅隐藏，不改已读状态（补救本就不看已读）。
- 不另做「知道了」按钮；点气泡即关闭。键盘 Enter / Space 同等。

---

## 三、实现约束（不变）

1. 不新建教程浮层（遮罩、高亮、箭头、分步导航）。
2. 不做集中式引导流程；每条独立触发。
3. 每条独立记忆已读。
4. 操作提示气泡无需单独「知道了」；**点击气泡立刻关闭**。例外：点「?」弹出的 **App 用途简介卡**可有「知道了 / Got it」关闭钮（非分步教程）。
5. 「?」安静但可发现（立体、约 52px）；不做帮助中心（无目录式 FAQ）。

### anchor 校验分层（2026-07-22 拍板 · Registry）

| 层级 | 手段 | 状态 |
|---|---|---|
| **(1) Registry SSOT** | `onboardingHintRegistry.js` 派生 `HINT_IDS` / `HINT_LOCALE_KEYS` / `ONBOARDING_HINT_ANCHORS`；`onboardingHintRegistry.test.js` 锁 1:1 + locale + `anchorGroup` 内 selector 互异 | **已落地** |
| **(2) md 锚点块同步** | `npm run hints:doc-check`（`test:smoke` + CI 独立 required check）；`npm run hints:doc-sync` 刷新 §一后机器块 | **已落地** |
| **(3) DOM 视觉位置** | Playwright `boundingBox` 验证气泡尖角是否对准锚控件 | **Backlog** — 见 `PROCESS.md`「Hints anchor e2e bounding rect」 |

**新增 hint 工作流**：改 `onboardingHintRegistry.js` → `npm run hints:doc-sync` → 补 locales → `npm run test:smoke`。若 anchor 与已有 hint 相邻/可能重叠，评估 `anchorGroup`（见 registry 文件头 PR checklist）。

---

## 四、数据存储

```
localStorage key: focus-tiger.hints-seen.v1
结构：{ [hintId: string]: true }
hintId：见第一节表
规则：首次对应操作完成后写入 true；**用户点击气泡关闭也写入 true**（自动提示）；补救入口不受已读限制。
```

---

## 五、Cursor 实现 Prompt

```
基于 ONBOARDING_HINTS.md v3，实现分散式即时提示 + 常驻补救入口：

1. 新增本地存储 focus-tiger.hints-seen.v1（第四节）；hintId 以第一节完整表为准（含 dormant-open、honesty-optional、how-shall-we-sit、ambient-gated、idle-after-session 等）。
2. 各位置在现有 UI 旁用安静气泡追加一行小字；仅未读时自动出现；完成对应操作后 markSeen 并隐藏。
3. 常驻角落「?」补救入口：按当前场景 resolve hintId 并强制展示；永不因已读而隐藏入口本身。
4. **点击气泡立刻消失**（硬性）：自动提示点击 = markSeen + 隐藏；补救点击仅隐藏。pointer-events 可点；无需单独「知道了」按钮。
5. 禁止教程类 UI（遮罩、高亮、箭头、分步导航）。
6. 文案用第一节已过观察式自检的中英稿，写入 locales。
7. ~~确认 Ambient 播放时 Rim 有可见缓亮（累计 presenceBoost + 正在播放 lift）；补单测。~~ **（2026-07-22 关包）**：用户书面砍掉「音乐会加亮」宣传；不再以可见缓亮为验收口径。
8. 实验室 debug 面板增加「清空 hints-seen」；仅非 ?product=1。
9. 单元测试：首次显示、已读不再自动显示、补救始终可调、hintId 互不干扰、resolveScene、点击关闭。
10. 更新 TEST_TRACKER.md；更新 PRODUCT_MOMENTS.md 说明为何不做集中式引导。
11. 产品壳 ?product=1 仍显示「?」与即时提示（属于产品表面，不是实验室调试条）。
```