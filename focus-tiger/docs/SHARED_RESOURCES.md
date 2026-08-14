# SHARED_RESOURCES.md — 共享资源对照表

> **地位**：与 `DEV_WORKFLOW_QUALITY.md` §2.3 **高风险面**互补，不是替代。  
> - §2.3 = 已知踩过坑的具体点（事故清单）  
> - 本表 = 当前共享资源分别被谁用（开工查波及面）  
> **维护**：新增 emotion key / localStorage key / Idle 编排入口时顺手补一行（R3）。  
> **§4 机器块**：由 `sessionUiGateContractRegistry.js` 生成；`npm run gate:doc-sync`；详见 `DOC_CODE_CONTRACT.md`。  
> **工作流**：`DEV_WORKFLOW_QUALITY.md` §8（N19 / **N25**）；布局细则：`RESPONSIVE_LAYOUT.md`。  
> **可见性 SSOT**：下列机器块 = `visibilityContractRegistry.js`（状态 × 视口 × 用户可见宿主）。人工叙事摘要见机器块下方「非显隐类」补充。

---

## 1. localStorage keys

| Key | 模块 | 谁读写 / 影响场景 |
|---|---|---|
| `focus-tiger.daily-completions.v1` | `DailyCompletionStore` | **仅保留当日**（换本地日后惰性整表重置）；Honesty / 计时 / **微仪式**共用 `sessions[]`（无 source）；`celebrated` 戳（Celebrating vs SessionComplete；Honesty / 微仪式 **不**置戳）。字段见下 §1.1。**不足以**直接画「本周 7 格」热力图 |
| `focus-tiger.focus-session-end.v1` | `FocusSessionEndStore` | 最近一次专注结束 epoch ms；DORMANT 滚动窗口起点（达标 / Rise 写入；Honesty **不**写） |
| `focus-tiger.practice-days.v1` | `PracticeDaysStore` | 近日同坐（最多 **90** 条）；条目 `{ date, totalMinutes }`（见 §1.2）；HUD `streak-meter` + Idle `#weekly-practice-heatmap`（`getLastNDays`）；计时 / Honesty / **微仪式**经 `markToday(minutes)`；无断签惩罚文案。与 DailyCompletion **分 key** |
| `focus-tiger.milestone-glow.v1` | `MilestoneGlowStore` | 已播里程碑节点 id（如 `streak-7`）；只增不减；产品壳 `MilestoneGlow` 接线 |
| `focus-tiger.ritual-completions.v1` | `RitualCompletionStore` | 进阶 RitualFlow（Morning / Emotional Reset / Work Transition）完成记录；**不**走 MicroRitual / Focus / Journey Log / Reflection |)
| `focus-tiger.honesty-bridge.v1` | `HonestyBridgeStore` | 桥接 CTA 诊断标记（不限次出现）；场景 D·N |
| `focus-tiger.retention-funnel.v1` | `RetentionFunnelStore` | 留存漏斗占位戳：`firstOpenAt` / dayN 已打标记 / `firstSessionCompleteAt`；仅 `console.log` sink，无第三方。见 `RETENTION_FUNNEL.md` |
| `focus-tiger.intentions.v1` | `SessionIntentionStore` | Choose 意图历史；Reflection 回显。本场闩在 `main`：`onReady` 写入、`beginFocus` 空 pending **不抹**已闩意图（`resolveSessionIntentionLatch`） |
| `focus-tiger.reflections.v1` | `SessionEndFlow` | Reflection 非空答案最近 5 条 |
| `focus-tiger.companion-mode.v1` | `CompanionModePicker` / `FocusSession` | 上次 Companion 模式记忆 |
| `focus-tiger.reminder-quota.v1` | `ReminderQuotaManager` | Mindful / Re-focus / stretch 共享日额度（3） |
| `focus-tiger.reminder-preference.v1` | `reminderPreference` + `ReminderPreferenceUI`（Idle 热力图簇旁）+ `InAppReminderBannerUI`（`#ui-overlay` 顶部居中）+ `InAppReminderBannerController` + **Scene A** `parrotEarVisit`（`parrotMessengerGate`） | 应用内提醒**每日**时分偏好 `{ hour, minute }` 或 `null`（**无 `enabled` 字段**——存在即开启）；面板常显 `reminder.daily_blurb`；已过时分可存 + `past_time_note`；今日已练 + `practiced_today_note`（仍可改时；`#reminder-preference-status` 为 callout 衬底，与斜体 blurb 区分）；时间旁 **→** / Enter 保存（`#reminder-preference-confirm` + hint；短暂 `Saved`）；onboarding Hint `in-app-reminder`；`evaluateInAppReminderBanner` 返回候选（boolean + `reminder.gentle_waiting`）；横幅每次 **hidden→visible** 伴随 `parrotEarVisit`（欢迎池 live hold + pending flush，结束后补播；同页约 60s 再评到期；`__inAppReminder.parrotMessengerPlayed` / `pendingParrotMessengerAfterWelcome` / `resetParrotMessenger`）；不占浏览器 Notification；「今日已完成」含 Honesty / 微仪式；忙碌（Arrival/Focusing/Celebrate/Reflection/微仪式）**已拍板 `suppress`**（隐藏不排队；**不做** defer）；`main.js` 固定 `busyPolicy: 'suppress'`（2026-07-23） |
| `focus-tiger.hints-seen.v1` | `OnboardingHintsStore` | 分散式提示已读；实验室可单清 |
| `focus-tiger.ambient-nudge.seen.v1` | `AmbientSoundscapeUI` | Ambient 首次轻提示已读 |
| `focus-tiger.ambient-pref.v1` | `AmbientSoundscapeController` | 背景音乐开关偏好 + 上次曲目（默认关 / opt-in；曲目默认 Mer-Ka-Ba；可含 `user-*`） |
| `focus-tiger.session-cues.v1` | `sessionCuePreference` + `SessionCueController` + Soundscape | 开始/结束铃总开关（默认开）；**间隔节奏** `sessionIntervalMs`：`0`（默认）/ `180000` / `300000`；**觉察卡** `focusAwarenessCardEnabled`（默认开，可单独关）；资产 `/audio/cues/`；**不**走 Ambient entitlement / Sound Gate |
| IndexedDB `focus-tiger.user-ambient.v1` | `UserAmbientLibrary` | 用户上传氛围乐 blobs（非 localStorage；重置须 `clearAllUserAmbientTracks`） |
| `focus-tiger.locale.v1` | `localePreference` / `i18n.setLocale` | 上次选用的 **ready** 语言；**v1.0.0** ready = `en` / `ja`；draft（含 zh）不写入 |
| `focus-tiger.locale-greeting.v1` | `localeGreeting` / Dispatcher `LANGUAGE_CHANGED` | 切语问候同日限频：`{ dateKey, locales[] }`；ja→`bookReading`；en→`teaDrinking`（皆单程+CapCut）。**写入时机**：`playEmotion` 开播成功后 `markLocaleGreetingPlayed`（resolve 不预扣） |
| `focus-tiger.scene-anim-daily.v1` | `sceneAnimationDispatcher` | 欢迎池等同日额度：`{ dateKey, welcome }`（吹花与欢迎池同日 XOR 共用此旗） |
| `focus-tiger.flower-welcome.v1` | `flowerWelcomeGate` | 吹花门闩：`{ lastOpenDateKey, firstBubbleDone, lastCopyKey }`（Day1 / ≥3 日久别；文案轮换记账） |
| `focus-tiger.flower-welcome-flag.v1` | `flowerWelcomeGate` | 吹花产品路径开关（`0`/`1`）；亦可用 `?flowerWelcome=0\|1` |
| `focus-tiger.tip-jar.v1` | `tipJarGate` | Buy Yin a Tea 本地 tip 状态：`{ tipped, tipCount, lastTippedAt, email?, source?, badgeIds[], tipLog[] }`；`badgeIds` = 善意/练习徽章（付费起 3，免费练习起 1，只增不减；练习上涨可 sync）；`tipLog` = 茶室留痕；**不**解锁内容；与 Sanctuary **零耦合** |
| `focus-tiger.contextual-tea-tip.v1` | `contextualTeaTipGate` | 场景化请茶气泡：`{ lastShownLocalDay, lastShownReason, lastShownAt, dismissedCount }`；本地日一次；达标 / 里程碑触发；**不**解锁内容 |
| `focus-tiger.monetization-funnel.v1` | `MonetizationFunnelStore` | 付费意愿漏斗：`{ counts, events[] }`；Support→CTA→Checkout→完成；本地 + 可选 opt-in 回传。见 `MONETIZATION_INTENT_FUNNEL.md` |
| `focus-tiger.monetization-funnel-opt-in.v1` | `monetizationFunnelOptIn` | 意愿漏斗 opt-in：`{ enabled, consentedAt, clientId, lastUpload* }`；默认关 |
| `focus-tiger.newsletter-capture.v1` | `newsletter/newsletterCaptureGate` | Stay in touch 可选邮件留资标记：`{ submitted }`；**不**存邮箱明文；**不**挂钩 entitlement / tip / sanctuary；情境软提示 Phase 2。Cloud 配好时走 Worker `NEWSLETTER_KV` + Resend 欢迎信 / 退订；无 Cloud 或 `?newsletterMock=1` 仍 mock。见 `NEWSLETTER_CAPTURE.md` |
| `focus-tiger.sanctuary-entitlement.v1` | `sanctuaryEntitlementGate` | Yin's Sanctuary Lifetime：`{ unlocked, unlockedVia, unlockedAt, itemId, badgeIds[] }`；`badgeIds` = 尊贵徽章（付费起 3，最多 17，只增不减）；**不得**读 tip-jar 状态；**也**作统一 entitlement gate 的 lifetime 只读信号（`resolveLifetimeActive`） |
| `focus-tiger.entitlement-cache.v1` | `entitlement/entitlementState` + `membershipCheckout` | 统一付费门禁本地缓存：`{ lifetime, subscription }`（含 `periodEndsAt` / `lastVerifiedAt`）；Membership 成功页 / verify 写入 `subscription`；可用性优先，非防盗；宽限 7 天 |
| `focus-tiger.entitlement-ownership.v1` | `entitlement/entitlementOwnership` | persistent「已拥有」标记（仪式历史/纪念物等）；只增不减；订阅到期不收回 |
| `focus-tiger.entitlement-mock.v1` | `entitlement/mockEntitlementProvider` | mock provider 场景：`{ scenario, periodEndsAt, failFetch }`；亦可用 `?entitlementMock=`；**不**接 Stripe |
| `focus-tiger.membership-device.v1` | `membershipDeviceCredential` + Membership confirm/OTP verify | `{ email, deviceToken }`；cloud provider 轮询与 Billing Portal Manage；TTL 由 Worker KV 约束 |
| `focus-tiger.scene-anim-cooldown.v1` | `sceneAnimationDispatcher` | 生命感冷却：`{ late_night, curiosity, … }` 时间戳 |
| `focus-tiger.five-moments-compass-seen.v1` | `fiveMomentsCompassGate` / `FiveMomentsCompassUI` | Compass 首卡 / 指南已读（`'1'`）；⋯ /「?」打开亦 mark；DEV 重置清 |
| `focus-tiger.wellness-disclaimer-seen.v1` | `wellnessDisclaimerGate` / `OnboardingHintsUI` | Wellness 非诊疗首卡已读（`'1'`）；Got it / 点「?」打开简介 / Sit 亦 mark；`?wellnessFirst=1` 强制再出；DEV 重置清 |
| `focus-tiger.moment-whispers-seen.v1` | `momentWhispersGate` / `MomentWhisperUI` | Moment Whisper 各键已见 `{ arrive?, focus?, recover?, transition?, reflect? }`；一生一次；Transition 暂不 play |
| `focus-tiger.journey-log.v1` | `journeyLogGate` / `JourneyLogUI` | Journey Log 本地条目 `{ entries: { at, minutes, arrive, reflect }[] }`（Tea Log 模式；上限约 30；**非** HealthKit；与 tip-jar **零耦合**） |
| `focus-tiger.practice-backup.v1` | `practiceBackupOptIn` / Journey Log 角落引导 | 练习记忆云端备份 opt-in：`{ enabled, consentedAt, email, deviceToken, lastUpload* }`；整包 6 key 快照 → `PRACTICE_BACKUP_KV`；关闭须 OTP **删云端** |
| `focus-tiger.daily-wisdom.v1` | `DailyWisdomStore` / `resolveTodayWisdom` / `<daily-wisdom>` | Yin 每日一句：`{ dateKey, quoteId, recentIds[] }`；同日锁定；`recentIds` 滑动窗（默认 7）避近期重复；池条目 `{ id, text, attribution? }`（Yin 短句无署名；古典/文学句有 locale 署名）；entitlement featureKey **`content.daily-wisdom`**（`free` / `ongoing`，每次 resolve 走 `isEntitled` 姿势、非 paywall）；**不**写 entitlementOwnership；与 Quiet Line / `dailyZenQuote` **分池分 key**；**Phase A 落点** = Reflection 卡底部（`[data-testid=reflection-daily-wisdom]`）；Phase B 印花另支 |
| `focus-tiger.mustard-seed-seal.v1` | `mustardSeedSeal` / `MustardSeedSealCardUI` | 纪念印《芥子须弥》：`{ revealed, revealedAt, scoreAtReveal }`；门槛 = 统一练习 **score ≥ 21**；首次完成仪式后出卡（ZH + EN + 乐五斋诗稿 + 章）；菜单可重读；**不**绑 tip/Sanctuary；章 = `public/ui/support/mustard-seed-seal/yin-badge-square-gold-on-silver-alt.png`（2026-08-12 入库；EN 译维持现稿） |

一键清空：DEV「重置全部本地状态」→ `clearAllFocusTigerLocalState()`（`src/core/localStateKeys.js`）。
**验收**：L-logic（`localStateKeys.test.js` / `npm run test:smoke`），勿人工逐 key。
**排期 key**：无。`five-moments-compass-seen` / `moment-whispers-seen` / `journey-log` 已接线。

### 1.1 DailyCompletionStore 字段快照（2026-07-22 只读调研）

持久化形状（`DailyCompletionState` + `CompletionSession`，见 `src/core/DailyCompletionStore.js`）：

| 层级 | 字段 | 类型 | 含义 |
|---|---|---|---|
| 日态 | `dateKey` | `string` | 本地自然日 `YYYY-MM-DD`（`getLocalDateKey`） |
| 日态 | `sessions` | `CompletionSession[]` | 当日完成列表（计时与 Honesty **同一列表、无 source**） |
| 日态 | `celebrated` | `boolean`（可选，读时归一） | 当日是否已播过完整 Celebrating；与「有无完成」解耦 |
| 会话 | `completedAt` | `number` | 完成时刻 epoch ms |
| 会话 | `durationMinutes` | `number` | 正数分钟；≤0 不入账 |

公开读 API：`hasCompletedToday()`、`hasCelebratedToday()`、`getTodaySessions()`、`getTodayTotalMinutes()`、`getState()`。  
**无**：多日历史、按周查询、`达标` 布尔、会话来源标签。换日后旧日 `sessions` **被覆盖丢弃**。

相邻对照：多日陪伴节奏与时长见 **§1.2 `PracticeDaysStore`**（`getLastNDays`）；DailyCompletion **仍仅当日**，勿假设可画周热力图。

### 1.2 PracticeDaysStore 字段（2026-07-22 · 热力图 Store 层）

持久化 key 仍为 `focus-tiger.practice-days.v1`（原地迁移，不升 v2 key）。

| 字段 | 类型 | 含义 |
|---|---|---|
| `days` | `PracticeDayEntry[]` | 最多 **90** 条；按 `date` 升序；`slice(-90)` 裁剪 |
| `days[].date` | `string` | 本地自然日 `YYYY-MM-DD` |
| `days[].totalMinutes` | `number \| null` | 当日计时+Honesty **累计**分钟；`null` = 旧版 `string[]` 迁移（有练过、时长未知）；缺口日**不入库** |

公开 API：`markToday(durationMinutes?)`（同日累加）、`getRecentStreakDays()` / `getRingFilled()`（仍按「有条目」计连续日）、`getLastNDays(n)`（含今天共 n 天，**缺日补** `{ date, totalMinutes: 0 }`，旧→新）。  
迁移：`migratePracticeDaysEntries`；读到旧 `days: string[]` 时转 `{ date, totalMinutes: null }` 并写回。  
UI：Idle 常驻 `#weekly-practice-heatmap`（亮 = `null \|\| >0`）；非 Idle 隐藏。

---

## 2. EmotionController / `playEmotion`

| 资源 | 主要调用方 | 波及 |
|---|---|---|
| `EmotionController` 单例（`main.js` 注入） | `MoodController`、Honesty、MindfulReminder、PointerInteraction、调试面板、会话完成反馈 | 改优先级 / holdPose / 回落 idle 会影响全部响应情绪 |
| `idle` / IdleOrchestrator 接管 | `MoodController` IDLE、`IdleOrchestrator` | 呼吸×5→眨眼；勿另开 Idle 变体池 |
| `sleeping` | 调试「睡着了」/ live DORMANT（≥2h 后回前台等） | **不再**作零完成 / **冷启动**开场；`onAppReady` 默认 Idle；披毯仅 live 进 DORMANT |
| `dormantWake` | `HonestyCheckInController` | 补登睡→坐；holdPose；离开后溶解 |
| `celebrating` / `sessionComplete` | `triggerSessionCompletionFeedback`；微仪式直接 `playEmotion('sessionComplete')` | `hasCelebratedToday`：首次**计时**达标 Celebrating；已庆祝过 → SessionComplete；Honesty / **微仪式**不占戳、永不 Celebrating |
| `riseStretchCasual` / `teaDrinking` / `bookReading` | 中途 Rise 加权池 | 主动结束转场（holdPose）；勿与 blinkBreathe / magicBook 混淆 |
| `intentionNod`（intentionSet） | Arrival Choose 确认 | 与 Companion 展开时序 |
| `mindfulAcknowledge` / `stretchReminder` | `MindfulReminderController` | 被动提醒占共享额度；Offline/Flow 抑制离开类 |
| `triggerActiveRecover` / Tiger Anchor | `MindfulReminderController` + `ActiveRecoverAnchorUI` | 主动 Recover：**不**占额度；180s 冷却；Focusing only。冷却再点 → `acknowledgeActiveRecoverCooldownTap`（`nodBowMicro`，无 toast） |
| `nodGreeting` | 靠近自动已拆；**欢迎池试验 40%**（与 magicBookReading） | 勿接回默认靠近 |
| `magicBookReading` | 开场欢迎池试验（60%） | 已烘焙 pingpong；**硬切** Idle |
| `welcomeBack` | **停接线**（2026-08-02）：不播新旧挥手；键保留 | 素材仍入库；场景以后另议 |
| `goldenHaloPalms` | Honesty≥30 试验 | 替 breathHaloHq 产品路径；调试仍可播 HQ |
| `sceneAnimationDispatcher` | 场景语义事件 → 加权/冷却 → `playEmotion` | Slice A′+B；业务勿平行 if-else |
| 调试试播全表 | `#emotion-debug-ui` / `__spritePlayer` | 不含生产调度 |

完整键见 `EmotionController.js` 的 `EMOTIONS` / `EMOTION_KEYS`；情绪语义权威仍为 `EMOTION_BIBLE.md`。

---

## 3. IdleOrchestrator / SpriteSequencePlayer

| 资源 | 谁用 | 改动时保护 |
|---|---|---|
| `IdleOrchestrator` | `EmotionController` idle 路径 | 呼吸×N→一瞥；**同姿衔接硬切**（crossFadeMs=0）；叠化仅用于与其它情绪回落 idle |
| `SpriteSequencePlayer.play` | Emotion / Idle / 调试 | CapCut 溶解、`_resetCrossFade` 顺序、pingpong `frameHolds` |
| `CAPCUT_DISSOLVE_MS` (~1s) | Choose / Rise / IntentionSet 等不衔接切 | 禁止无故改短已调停顿 |
| `companionGestureCatalog` | 候选手势清单 | **不**进 Idle 随机池 |

---

## 4. 门闩 / 叠层共享状态（非 storage）

<!-- session-ui-gate-contract:begin -->

> **机器块 · 勿手改**。真源：`src/core/sessionUiGateContractRegistry.js`。刷新：`npm run gate:doc-sync`。

### 门闩字段（可变态）

| id | setter | readers | impact |
|---|---|---|---|
| `arrivalGateReady` | `setArrivalGateReady` | Gate ↔ Companion `setArrivalReady`（UI 投影） | Companion 点选是否可 begin；Sit 未就绪 → Arrival |
| `completionPending` | `setCompletionPending` | Gate；达标庆祝路径 | 禁止打断 / 禁止二次 begin；Companion 选项禁用 |
| `postSessionOverlayActive` | `setPostSessionOverlayActive` | main `resyncSessionChrome()` → `computePostSessionOverlayActive(sources)` | hint 是否 ignore；选项禁用。源含 Arrival / Reflection / 微仪式；Honesty 不列入 |

### 行为契约（失败即 bug）

| contractId | api | when | must | testAnchor |
|---|---|---|---|---|
| `begin-focus-arrival-not-ready` | `canBeginFocusOnCompanionModeSelect` | arrivalGateReady === false && mode 非 Offline Space | return false（Here & Now / Flow：禁止静默开表；UI 应启动 Arrival） | `SessionUiGate.test.js` |
| `offline-skip-arrival` | `canBeginFocusOnCompanionModeSelect / resolveAutoStartNeedsArrival` | mode === Offline Space（stepAway）&& arrivalGateReady === false | canBegin true；needsArrival 'ignore'（禁止进 Arrival Notice/Choose） | `SessionUiGate.test.js` |
| `begin-focus-gates-block` | `canBeginFocusOnCompanionModeSelect` | completionPending || arrivalOpen || isFocusing | return false | `SessionUiGate.test.js` |
| `sit-idle-always-arrival` | `resolveSitClickWhenIdle` | Idle 且非完成中 / 非 Focusing | return 'start-arrival'（Sit 始终仪式；开表走 Companion/⚡） | `SessionUiGate.test.js` |
| `arrival-gate-persists-across-focus` | `arrivalGateReady` | Arrival/⚡ 已 setArrivalGateReady(true) 后 beginFocus / Rise | 保持 true（回流 Here & Now / Flow 立刻 begin；禁止清门闩逼进 Notice） | `SessionUiGate.test.js` |
| `auto-start-needs-arrival` | `resolveAutoStartNeedsArrival` | Here & Now / Flow && arrivalGateReady === false | return 'start-arrival' | `SessionUiGate.test.js` |
| `hint-overlay-ignore` | `resolveCompanionHintClick` | postSessionOverlayActive === true | return 'ignore'（UI 应禁用，禁止可点无反馈） | `SessionUiGate.test.js` |
| `companion-commit-reject` | `resolveCompanionModeSelectCommit` | canBegin === false && needsArrivalAction === ignore | return 'reject'（禁止写 companion-mode storage） | `SessionUiGate.test.js` |
| `overlay-aggregate-some` | `computePostSessionOverlayActive` | 任一源为 true | return true（扩展第三叠层只追加源，不改聚合函数） | `SessionUiGate.test.js` |

### `resolveCompanionModeSelectCommit` 合法结果

- `commit-begin`
- `commit-arrival`
- `reject`

<!-- session-ui-gate-contract:end -->

| 状态 | 谁设 / 谁读 | 波及 |
|---|---|---|
| **`SessionUiGate`**（权威可变源） | `main.js` 装配；DEV `__sessionUiGate` | Arrival 门闩 / 完成中 / 叠层占用；单测见 `SessionUiGate.test.js` |
| **`sessionChromeSync`**（壳层投影） | `main.js` → `createSessionChromeSync`；投影标志经 `idleChromeOrchestration.resolveShellChromeProjection`；`isHonestyPhaseBusy` / `isHonestyUiBusy` | Idle Honesty/微仪式入口显隐 + `resyncSessionChrome`（含窄宽壳 `setSuppressed`）；单测 `sessionChromeSync.test.js` + `idleChromeOrchestration.test.js` |
| **`idleChromeOrchestration`**（双壳共享编排） | `listSecondaryChromeEntries` / `resolveRoleVisibility` / stage class 常量 | 窄抽屉与宽 ⋯ **同一业务列表**；禁止两壳各写漂移 if 树（Task 3 阶段 1） |
| **`IdleChromeFacade`**（统一入口） | `createIdleChromeFacade` → `main.js`；`setHandlers` 一次扇出；`applyShellProjection`；断点 `releaseInactivePresentation` | 禁止 main 分别 `setHandlers` 两套语义；resize 不得误关 Companion（Task 3 阶段 2–3 已落地） |
| `arrivalGateReady` | Gate `setArrivalGateReady` ↔ Companion `setArrivalReady`（经 `syncArrivalGateReady`） | Companion 点选是否可 begin；Arrival/⚡ 解锁后跨 Focusing→Rise **保持**；Sit 始终仪式 |
| `completionPending` | Gate；达标庆祝路径 | 禁止打断 / 禁止二次 begin；Companion 选项禁用 |
| `postSessionOverlayActive` | **单一入口** `sessionChromeSync.resyncSessionChrome()`：`computePostSessionOverlayActive(sources)` → Gate + Companion + 窄宽壳 | hint 是否 ignore；选项禁用。源默认含 Arrival / Reflection / **微仪式**；**Honesty 不列入**（仍可点 hint）。禁止 Reflection-only 与 Arrival-only 双路互盖 |
| `canBeginFocusOnCompanionModeSelect` | `FocusSession` 纯函数 + Gate 包装；Picker 经 handlers 注入真门闩 | Here & Now / Flow 须门闩；**Offline 跳过 Arrival**；未就绪 Here&Now/Flow 必须 false |
| Companion 点选写 storage | **仅** Gate 通过后（`commit-begin` / `commit-arrival`） | **禁止**先写 storage 再静默 return（`resolveCompanionModeSelectCommit`） |
| `resolveCompanionHintClick` | `FocusSession` + Gate 包装 | toggle 展开三选一；禁静默 ignore |
| `resolveSitClickWhenIdle` | Gate | Idle → 始终 `start-arrival`（开表走 Companion / ⚡） |

扩展第三种叠层：在 `sessionChromeSync` 的 `getPostSessionOverlaySources()` 数组追加 `() => other.isOpen()`，**不必**改 `computePostSessionOverlayActive`。

---

## 5. 用法（开工）

1. 本次改动 touch 上表哪一行？  
2. 「谁用」列还有谁 → 写入保护面并复测。  
3. 若属 §2.3 事故点 → 额外跑冒烟 + 对应 TEST_TRACKER 观感行。  
4. 若触及 Idle chrome / Arrival / Honesty / Hints → 对照 **§6 双壳不变量** + `DEV_WORKFLOW_QUALITY.md` **§8（375）** 与 **§9（宽屏）** 故事最小集。

---

## 6. 双壳共享契约（窄 / 宽不变量 · 2026-07-25）

> **地位**：跨 `NarrowIdleShell`（≤479）与宽屏 dock / ⋯（≥480）的**共享不变量**。改一侧必须勾另一侧。  
> **工作流**：`DEV_WORKFLOW_QUALITY.md` §8（N19 / **N25**）；布局细则：`RESPONSIVE_LAYOUT.md`。  
> **可见性 SSOT**：下列机器块 = `visibilityContractRegistry.js`（状态 × 视口 × 用户可见宿主）。人工叙事摘要见机器块下方「非显隐类」补充。

<!-- visibility-contract:begin -->

> **机器块 · 勿手改**。真源：`src/core/visibilityContractRegistry.js`。刷新：`npm run visibility:doc-sync`。
> 改 `setSuppressed` / park / hide 相关源时：CI 跑 `npm run test:e2e:visibility`（整表锚点）。

### 可见性契约（状态 × 视口 × 用户可见宿主）

| id | state | viewport | role | must | wideSelector | narrowSelector | lockStatus | testAnchorWide | testAnchorNarrow |
|---|---|---|---|---|---|---|---|---|---|
| `arrival-sit-hidden` | arrival-open | both | Sit | hidden | `#btn-focus` | `#ft-narrow-home-sit` | **locked** | `e2e/scenario-a.companion.spec.js › Arrival open: Sit hidden…; Quick Start stays` | `e2e/scenario-a.companion.spec.js › 375 Arrival: home Sit hidden; home Quick Start stays visible` |
| `arrival-quickstart-visible` | arrival-open | both | QuickStart | visible | `#quick-start-focus` | `#ft-narrow-home-quickstart` | **locked** | `e2e/scenario-a.companion.spec.js › Arrival open: Sit hidden…; Quick Start stays` | `e2e/scenario-a.companion.spec.js › 375 Arrival: home Sit hidden; home Quick Start stays visible` |
| `arrival-honesty-home-hidden` | arrival-open | narrow | Honesty | hidden | — | `#ft-narrow-home-honesty` | **locked** | — | `e2e/scenario-a.companion.spec.js › 375 Arrival: home Sit hidden; home Quick Start stays visible` |
| `arrival-breath-sit-still-hidden` | arrival-breath | both | Sit | hidden | `#btn-focus` | `#ft-narrow-home-sit` | **locked** | `e2e/scenario-a.companion.spec.js › Arrival Breath: Sit stays hidden; Quick Start stays (wide)` | `e2e/scenario-a.companion.spec.js › 375 Arrival Breath: home Sit stays hidden; Quick Start stays` |
| `micro-ritual-sit-unavailable` | micro-ritual-open | both | Sit | disabled | `#btn-focus` | `#ft-narrow-home-sit` | **locked** | `e2e/micro-ritual.spec.js › micro ritual: entry → breath → complete…` | `e2e/micro-ritual.spec.js › 375 micro ritual: home Sit unavailable while breath runs` |
| `honesty-bridge-entries-hidden` | honesty-bridge-visible | both | Honesty+MicroRitualEntry | hidden | `#honesty-idle-entry, #micro-ritual-idle-entry` | `#ft-narrow-home-honesty` | **locked** | `e2e/micro-ritual.spec.js › bridge CTA hides dock entries over Yes/No; No restores entries` | `e2e/micro-ritual.spec.js › 375 bridge: ActionBar time stays; tip click does not dismiss Yes/No` |
| `honesty-panel-entry-hidden` | honesty-check-in-open | both | HonestyEntry | hidden | `#honesty-idle-entry` | `#ft-narrow-home-honesty` | **locked** | `e2e/micro-ritual.spec.js › Honesty Check-in click hides entry until duration panel open` | `e2e/micro-ritual.spec.js › 375 Honesty panel: narrow home Honesty ball hidden` |
| `focusing-narrow-home-ctas-hidden` | focusing | narrow | HomeCtas+Grabber | hidden | — | `#ft-narrow-home-ctas, .ft-narrow-grabber` | **locked** | — | `e2e/weekly-practice-heatmap.spec.js › 375 Focusing restores FocusHUD and hides Sound FAB` |
| `focusing-focus-hud-visible` | focusing | both | FocusHUD | visible | `#focus-hud` | `#focus-hud` | **locked** | `e2e/helpers/product-shell.js › expectFocusSessionActive (#focus-hud visible)` | `e2e/weekly-practice-heatmap.spec.js › 375 Focusing restores FocusHUD…` |
| `choose-bow-companion-in-viewport` | after-choose-bow | both | CompanionPanel | in-viewport | `.session-start-dock__panel` | `.session-start-dock__panel` | **locked** | `e2e/scenario-a.companion.spec.js › scenario A4… (toBeVisible; 宽屏不 park)` | `e2e/scenario-a.companion.spec.js › 375 Choose bow: Companion staged in viewport…` |
| `companion-stage-honesty-entry-hidden` | companion-staged-narrow | narrow | HonestyIdleEntry | hidden | — | `#honesty-idle-entry` | **locked** | — | `e2e/scenario-a.companion.spec.js › 375 companion stage: Honesty dock entry stays hidden` |
| `idle-narrow-three-home-balls` | idle | narrow | HomeCtas | visible | — | `#ft-narrow-home-quickstart, #ft-narrow-home-sit, #ft-narrow-home-honesty` | **locked** | — | `e2e/weekly-practice-heatmap.spec.js › 375 viewport: narrow ActionBar + home CTAs…` |
| `heatmap-hidden-when-focusing` | focusing | both | WeeklyHeatmap | hidden | `#weekly-practice-heatmap` | `#weekly-practice-heatmap` | **locked** | `e2e/weekly-practice-heatmap.spec.js › non-Idle (Focusing) hides weekly heatmap` | `e2e/weekly-practice-heatmap.spec.js › 375 Focusing hides weekly heatmap` |

### 当前假绿缺口（须逐条补锚）

_（无）_

### Suppress / hide 变更触发路径（CI）

- `focus-tiger/src/ui/NarrowIdleShell.js`
- `focus-tiger/src/ui/WideIdleMoreMenu.js`
- `focus-tiger/src/ui/CompanionModePicker.js`
- `focus-tiger/src/ui/HonestyCheckInUI.js`
- `focus-tiger/src/ui/MicroRitualUI.js`
- `focus-tiger/src/ui/OnboardingHintsUI.js`
- `focus-tiger/src/main.js`
- `focus-tiger/src/core/idleChromeOrchestration.js`
- `focus-tiger/src/core/IdleChromeFacade.js`
- `focus-tiger/src/core/createIdleChromeFacade.js`
- `focus-tiger/src/core/sessionChromeSync.js`
- `focus-tiger/src/core/visibilityContractRegistry.js`
- `focus-tiger/e2e/scenario-a.companion.spec.js`
- `focus-tiger/e2e/weekly-practice-heatmap.spec.js`
- `focus-tiger/e2e/micro-ritual.spec.js`
- `focus-tiger/e2e/helpers/product-shell.js`

<!-- visibility-contract:end -->

### 非显隐类双壳不变量（仍须人工 / 另锚）

| 契约 | 不变量 | 波及 / 复测 |
|---|---|---|
| **Hints remap** | 控件 park 后，onboarding tip /「?」补救锚点必须 remap 到**当前可见宿主**（窄：ActionBar `?` 等；宽：⋯ 菜单等）。禁止仍指向 park 掉的旧按钮坐标。 | 改 park / ActionBar / ⋯ / Hints → 375 + ≥480 各点一次「?」补救 |
| **FocusHUD vs ActionBar（语义）** | **窄屏**：ActionBar（? · **本机墙钟** · ♪）在 Idle / Arrival / Focusing / 叠层 suppress 下**常显**；会话累计时长只在 `#focus-hud`。宽屏仍用 FocusHUD。细则显隐见机器块 `focusing-*` 行。 | Choose→鞠躬→点选后 Focusing；375 顶栏须见墙钟而非 `00:00` |

外侧取消邻接（点 tip 只关 tip、不关面板）属交互回归，见 `DEV_WORKFLOW_QUALITY.md` §8 N18；实现：`src/ui/outsideDismissGuard.js`（Arrival / Companion / Honesty 共用）。不单列为本表第三壳。
