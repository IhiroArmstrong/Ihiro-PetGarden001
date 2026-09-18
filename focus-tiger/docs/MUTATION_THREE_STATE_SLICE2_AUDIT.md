# 状态变更三态可见性 · Slice 2 存量审计

审计日期：2026-09-18  
基线：`origin/develop` tip `51b1ca21`（PR #843 Slice 1 已合）  
工单：[#839](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/839)（**不关**）  
权威 Brief：`docs/task-briefs/task-mutation-three-state-visibility.md`  
本文件只做对照报告。**未改运行时、未补 UI、未解冻 Z-dim。**

共用机制：本次不触及 overlayBusy / HUD 呼吸驱动 / z≥17 遮罩 / 新建可点击叠层。

---

## 方法

1. 按 `OVERLAY_UI_SURFACE`（`src/core/overlayUiSurfaceContract.js`，**36 行**）逐文件扫 `localStorage` / `sessionStorage` / `postCloudJson` / 写入函数。  
2. 另表扫 `src/**` 中 `postCloudJson(` / `postJson(` 调用点（测试文件除外），对照 path / body / 超时 / 错误映射。  
3. `SILENT_BEHAVIORS.md` 只在「按设计无反馈」时挂 `SB-xx`；表里没有的沉默标 **缺口**。  
4. IndexedDB：全 `src/` 仅 `audio/UserAmbientLibrary.js`（不在 O-04 表）。

精读（函数级）：Reminder 保存、Witness 选句、Circle 身份面板、Circle 加入/离开控件、`postFocusCircle` / `postFocusCircleWitness` / `postFocusCircleWasHereMark`、Newsletter 提交、Privacy YPE 勾选、Confide 记忆同意、Journey 备份状态、Presence 删除。其余行凭表面扫描定性，坐标写在表内。

---

## 判定桶

| 桶 | 含义 |
|---|---|
| **无持久化** | 该叠层文件不写 localStorage / IDB / 云；选择结果交给父层会话 |
| **见旗** | 同步 `markSeen` / 限频；pending N/A；失败几乎不可见 |
| **用户 mutation** | 用户点击会改变持久状态，须能区分挂起/成功/失败 |
| **表外** | 真实 mutation 不在 `OVERLAY_UI_SURFACE` 行上 |

契约列：Slice 1 后仅 **2 行**填了非 gap 键——`ReminderPreferenceUI` 的 `success`、`FocusCircleWitnessLeaveUI` 的 `fail`。其余 34 行 `mutationFeedback` 三键均为 grandfather `GAP`。

---

## 表 A · `OVERLAY_UI_SURFACE` 逐行

| # | file | 契约三键 | 有无持久化 mutation | pending | success | fail | `_render()` 冲成功？ | SB-xx | 桶 / 缺口 |
|---|---|---|---|---|---|---|---|---|---|
| 1 | ArrivalPracticeUI.js | GAP | 本文件无写盘；练习入账在父层 | — | — | — | — | Leave 未完成见 SB-08（微仪式；本行 Arrival Leave 另议） | 无持久化 |
| 2 | TigerReflectionMoment.js | GAP | 读 localStorage；入账/金句宿主在父层 | — | — | — | — | — | 无持久化（本文件） |
| 3 | RitualFlowUI.js | GAP | 本文件无写盘；chip/Leave 记账在 Presence 桥 | — | 设计无当下 toast | — | — | Leave 静默记账（场景 AF；非 SB 表「Ritual Leave」专条，属产品静默） | 无持久化（本文件）；Leave 成功不可见 = 已拍板静默，**未**挂 SB-xx |
| 4 | MicroRitualUI.js | GAP | 本文件无写盘 | — | — | — | — | **SB-08** Leave | 无持久化 |
| 5 | HonestyCheckInUI.js | GAP | 本文件只接 Controller；补登入账不在此 UI | — | — | — | — | — | 无持久化（本文件）；**表外** Controller |
| 6 | FocusDurationPickerUI.js | GAP | 本文件无写盘；时长回父层 | — | — | — | — | — | 无持久化 |
| 7 | CompanionModePicker.js | GAP | **有**：`writeStoredMode` → `localStorage.setItem`（约 L61–63 / L389） | 无（同步） | 无短确认；选项态变化 | 无 | `_render` 不冲选项 | — | 用户 mutation · 同步 · **缺失败/成功 token** |
| 8 | ColdStartGoalCardUI.js | GAP | **有**：`markColdStartGoalSeen` + sessionStorage 选择 | 无（同步） | 关卡即确认 | 无 | — | — | 见旗 + 会话选择 |
| 9 | FiveMomentsCompassUI.js | GAP | **有**：`markFiveMomentsCompassSeen` | 无 | Skip/Got it 关卡 | 无 | — | — | 见旗 |
| 10 | GroundExerciseChoiceUI.js | GAP | 本文件无写盘 | — | — | — | — | — | 无持久化 |
| 11 | MustardSeedSealCardUI.js | GAP | 读 localStorage（展示门槛）；写盘若有则在 gate | 未在 UI 声明 | — | — | — | — | 见旗/门槛（表面） |
| 12 | ConfideToYinUI.js | GAP | **有**：记忆同意 `saveYinPersonalMemoryConsent`（L772–791）；倾诉正文≠本契约云 mutation | 钮 `disabled`（`_memoryConsentSaving`） | 同意条藏起后续生成 | **无失败文案**（promise reject 只解锁钮） | 同意条 `_hideMemoryConsent` | SB-19 点空白不关卡 | 用户 mutation · **fail 缺口**；倾诉生成不在本表范围 |
| 13 | JourneyLogUI.js | GAP | **有**：练习备份 OTP/开关/删除（L406–475 三态文案）；列表行本身只读 | `JOURNEY_LOG_BACKUP_STATUS_SENDING` | SENT / ENABLED / DISABLED | ERR / CONSENT | 备份 status 独立于列表 `_render` | — | 用户 mutation（备份）· **O-04 仍 GAP** |
| 14 | FocusCoinsPanelUI.js | GAP | 本文件无 `postCloudJson`/setItem | — | — | — | — | — | 无持久化（本文件）；购入走 Support/Tip 表外路径 |
| 15 | DailyZenQuoteCardUI.js | GAP | 读 localStorage；存图为下载非账本 | — | Save image 下载 | — | — | — | 无账本 mutation |
| 16 | DigitalWallpapersCardUI.js | GAP | 本文件无写盘 | — | — | — | — | — | 无持久化 |
| 17 | ZenCinemaCardUI.js | GAP | 本文件无写盘 | — | — | — | — | — | 无持久化 |
| 18 | NewsletterCaptureUI.js | GAP | **有**：`provider.subscribe` + `markNewsletterSubmitted`（L199–236） | `NEWSLETTER_SUBMIT_PENDING` + 钮 disabled | `NEWSLETTER_FEEDBACK_OK`，表单隐藏 | generic / invalid | 成功后 `_success` 短路，不冲 | SB-19 点空白不关 | 用户 mutation · **UI 三态已齐** · 云无超时 · **O-04 仍 GAP** |
| 19 | PresenceSignalsPanelUI.js | GAP | **有**：同步删除 session/signal（L331–353） | 无（同步） | 行消失（无成功句） | `DELETE_FAILED` / linked | 成功清空 status 再 `_renderList` | — | 用户 mutation · 同步 · 成功=消失 |
| 20 | LanguagePreferenceUI.js | GAP | **有**：`setLocale(..., { persist: true })`（L181） | 无（同步） | 无「已保存」；语种点选即变 | 无 | `_render()` 重画选项，无闪确认 | — | 用户 mutation · 同步 · **缺成功/失败 token** |
| 21 | SupportYinModalUI.js | GAP | **有**：`postCloudJson` 结账（L574+）；`_busy` + 行内 status | 部分：Pro/Addon 行内 status；其它 kind **先 `close()` 再 await**（L519） | 跳转 Checkout / 已 settled | `_showInlineCheckoutError` | 关卡后主界面看不到挂起 | — | 用户 mutation · **挂起在关卡后不可见** · 无超时 |
| 22 | TipJarUI.js | GAP | **有**：create-tip / verify-tip；`_busy` + feedback | 钮 disabled | status「已请茶」类 | feedback `is-error`（含 429） | `_render` 读 storage | — | 用户 mutation · 有忙/错 · **O-04 GAP** · 无超时 |
| 23 | SanctuaryUnlockUI.js | GAP | **有**：checkout + OTP + verify | `_busy` | `markSanctuaryFromPayment` | catch 映射 | 重绘读 storage | — | 用户 mutation · 无超时 |
| 24 | MembershipUnlockUI.js | GAP | **有**：checkout + OTP + verify + device credential | `_busy` | `markMembershipFromPayment` | catch | 重绘读 storage | — | 用户 mutation · 无超时 |
| 25 | OnboardingHintsUI.js | GAP | **有**：hint `markSeen`；Privacy **YPE 云同意**（L2206–2214）与漏斗 opt-in（约 L2263）同步写盘 | 勾选无 pending | 无短确认 | 无 | 只 `_refreshYpeOptInCopy` | **SB-15** auto tip 取消；hint 见旗 | 见旗 + **用户 mutation（同意）缺三态**；Focus Circle **控件不在本行文件** |
| 26 | FlowerBlowWelcomeBubbleUI.js | GAP | 本文件无写盘 | — | — | — | — | — | 无持久化 |
| 27 | InAppReminderBannerUI.js | GAP | 本文件无写盘 | — | — | — | — | **SB-04** 忙碌期不展示 | 无持久化 |
| 28 | ContextualTeaTipBubbleUI.js | GAP | **有**：`markContextualTeaTipShown` / Dismissed | 无 | 气泡本身 | 无 | — | — | 见旗 |
| 29 | MomentWhisperUI.js | GAP | **有**：`markMomentWhisperSeen` | 无 | 气泡本身 | 无 | — | **SB-05** 该键已见；**SB-06** busy | 见旗 |
| 30 | FocusAwarenessCardUI.js | GAP | 本文件无写盘 | — | — | — | — | — | 无持久化 |
| 31 | CalmActionRecoverCardUI.js | GAP | 本文件无写盘 | — | — | — | — | — | 无持久化 |
| 32 | CalmActionArriveCardUI.js | GAP | **有**：`store.markShown()` | 无 | 卡本身 | 无 | — | — | 见旗 |
| 33 | TransitionMomentUI.js | GAP | 本文件无写盘 | — | — | — | — | — | 无持久化 |
| 34 | RecoverResetPracticeUI.js | GAP | 本文件无写盘 | — | — | — | — | — | 无持久化 |
| 35 | FocusCircleWitnessLeaveUI.js | fail token；pending/success GAP | **有**：`postFocusCircleWitness` 选句（L413–463） | `aria-busy` + 全钮 disabled | **成功即拆 picker**（无成功文案） | `FOCUS_CIRCLE_WITNESS_SUBMIT_ERROR` | 成功不走 `_render`，直接卸 DOM | — | 用户 mutation · 挂起=忙属性 · **云调用无超时** · 成功=消失 |
| 36 | ReminderPreferenceUI.js | success token；pending/fail GAP | **有**：同步 `setReminderPreference`（L255–294） | 无（同步） | `#reminder-preference-saved` 闪确认；`_savedFlashUntil` 在 `_render` 后仍显示 | 无（同步 setItem 失败未呈现） | **已修冲掉**（#838 + 时间戳） | — | 用户 mutation · 成功可见 · **开启勾选不闪确认** · pending/fail 仍 GAP |

**O-04 覆盖空洞（表外，但同属用户点击 mutation）：**

| 文件 | 动作 | pending | success | fail | 超时 | 备注 |
|---|---|---|---|---|---|---|
| `FocusCirclePanelUI.js` | `identity_set` | `FOCUS_CIRCLE_IDENTITY_SAVE_PENDING` + 钮 disabled | `…_SAVE_OK` | TIMEOUT / FAILED / INVALID | **有**（`withFocusCircleRequestTimeout`） | 不在 `OVERLAY_UI_FILE_SOURCES`；本地 draft **写在云成功之后**（L287–291） |
| `FocusCircleControlsUI.js` | create / join / leave / copy | `PRIVACY_SHEET_FOCUS_CIRCLE_WORKING` + 全钮 disabled | CREATED / JOINED / LEFT / COPIED | timeout / disabled / code / storage 等 | create/join：**有** | **Leave**：`leaveFocusCircle` **先清本地再打云**（membership.js L378–391）；UI **不读 `result.ok`**，一律 LEFT（Controls L274–287） |

---

## 表 B · `postCloudJson` 族（path / body / 超时 / 错误）

同一 path `FOCUS_CIRCLE_PATH`（`/api/focus-circle`）body 都带 `schemaVersion` + `action`，**超时与错误映射不同类**：

| 调用点 | path / action | JSON body | 超时 | 错误映射 | 挂起 UI | Slice 3 |
|---|---|---|---|---|---|---|
| `focusCircleMembership.js` `postFocusCircle` | `/api/focus-circle` create/join/leave/status | 有 | mutation **12s**；status **8s** | reason 码回 UI | Controls WORKING | **标杆** |
| `focusCircleIdentity.js` `postFocusCircleIdentitySet` | 同 path `identity_set` | 有 | **12s** | timeout vs failed | Panel PENDING | 已接超时；仍缺 O-04 行 |
| `focusCircleWitness.js` `postFocusCircleWitness` | 同 path witness_* | 有 | **无** | catch → `network` / 429 backoff；多 `skipped:true` | picker `aria-busy` 可无限 | **必须对齐超时** |
| `focusCircleWasHere.js` `postFocusCircleWasHereMark` | 同 path `was_here_mark` | 有 | **无** | catch → `network` | 未挂 O-04 | **必须对齐超时** |
| `focusCirclePresence.js` | 同 path | 有 | **无**（扫描 `timeout_near=false`） | catch | 后台/在场 | 后台豁免须书面，否则对齐 |
| `quietTogetherPresence.js` | lantern path | 有 | 无 | catch | 非点击？ | **BACKGROUND_NETWORK 豁免候选** |
| Newsletter `workerNewsletterProvider` | `/api/newsletter/subscribe` | email+locale | **无** | 400/429/502/503 → error 码；**UI 未分码**（一律 generic） | 有 pending | 加超时；错误码可接到 UI |
| Support / TipJar / Sanctuary / Membership UI | checkout / OTP / verify | 有 | **无** | HTTP/catch → 行内 error | 忙或关卡 | 加超时；禁止关卡后无挂起 |
| `membershipCheckout` / `proCheckout` / `companionAddonCheckout` / `sanctuaryEntitlementGate` | confirm-*-session | 有 | 无 | — | 父 UI | 与结账族同一中间件 |
| `cloudEntitlementProvider` | entitlement / portal | 有 | 无 | — | 混合 | 点 Manage 才走的保持点击三态 |
| `practiceBackupSync.js` | put/get/delete/otp/verify | 有 | **get 附近有 timeout 扫描命中**；put/delete/otp 无 | Journey 备份 UI 已三态 | Journey pending | put/delete/otp 补超时 |
| `tasteLayerSync.js` | emotion-weight / daily-message / quiet-line / confide-copy / calm-action-copy | 有 | 附近有 timeout | 后台 | 无用户挂起 | **豁免**：后台 + 同内容跳过写盘 |
| `growthMetricsConfigSync.js` | `/api/growth-metrics-config` | 有 | 附近有 timeout | 后台 | — | **豁免** 同上 |
| `ypePersonalizationSync.js` | ingest / delete | 有 | **无** | — | 同意后后台 ingest | ingest **豁免候选**；delete 若用户关同意则须失败可见 |
| `monetizationFunnelUpload.js` | funnel upload | 有 | 无 | — | 非点击 | **豁免** BACKGROUND_NETWORK |

`postCloudJson` 本体（`cloudApiClient.js`）**没有** Abort/超时；超时完全靠调用方 `withFocusCircleRequestTimeout` 这类包装。

---

## 写入后读回 / 本地-云顺序

| 点 | 顺序 | 结论 |
|---|---|---|
| 提醒 `setReminderPreference` | 同步写 → `_render` 再读 | 成功闪确认不依赖读回；失败无分支 |
| Circle **leave** | **先 `clearFocusCircleMembership` 再 `postFocusCircle(leave)`** | 云失败时本机已退出；UI 仍报 LEFT。对应账本扇出 (2) |
| Circle **identity** | 云 ok → 再 `writeFocusCircleIdentityDraft` | 本地 throw 时 status 可能停在 PENDING（无 catch） |
| Newsletter | 云 ok → `markNewsletterSubmitted` | 本地失败时已显示 OK |
| 见旗 `markSeen` | 同步 | 读回非必须；配额/配额满未呈现 |

IndexedDB：仅氛围库。Slice 3 本地中间件要么书面豁免，要么单独一行，**不要**假装 O-04 已覆盖。

---

## Slice 3 该走中间件 vs 豁免（供拍板）

**必须进中间件（点击 mutation · 缺超时或顺序危险）：**

1. Circle 同目录：`witness_*` / `was_here_mark` /（若非纯轮询）`presence` — 与 `postFocusCircle` 同一 timeout + reason 映射。  
2. `leaveFocusCircle`：禁止「先清本地、再忽略返回值」。  
3. 结账 / OTP / Newsletter subscribe：超时 → 失败呈现；挂起不得靠先关卡。  
4. 练习备份 put/delete/otp：与 get 看齐超时。

**书面豁免（后台 / 同内容跳过）：** `tasteLayerSync`、`growthMetricsConfigSync`、漏斗 upload、YPE ingest（非点击）、Circle status 轮询、氛围 IndexedDB 缓存。

**不必本轮补 O-04 UI 的 grandfather：** 见旗、无写盘叠层、Ritual Leave 产品静默（若保持静默须补 SB 或 TRACKER，不在本刀改白名单）。

**O-04 行补登记（中间件 PR 或紧随 process PR，仍禁止当功能专项）：** `FocusCirclePanelUI` / `FocusCircleControlsUI`（或声明由 Privacy 行派生并填三键 token）。Newsletter / Journey 备份 / 结账族 / Language / CompanionMode 仍可 grandfather，但 Slice 3 扫描器应对 **表外 Circle** 不再看不见。

---

## #839 关单对照（本刀只满足第 4 条）

| AND | 本审计后 |
|---|---|
| 1 三处正文 | Slice 1 已做 |
| 2 扫描器三键 + 错键锚 | Slice 1 已做 |
| 3 跨模块回归（提醒成功可见 **且** Circle 挂起或超时失败） | **未做** |
| 4 本审计稿入库 | **本文件** |

故 #839 与账本行保持 **跟进中**。禁止手关。

---

## 明确不做（本刀已遵守）

- 不改任何 `src/ui` / 扫描器行为  
- 不重开提醒 / Circle 功能专项  
- 不改 Confide / L3 生产路径  
- 不解冻 Z-dim  
- 不把挂起并进失败

---

## Slice 3 落地指针（2026-09-18）

运行时与扫描不在本审计稿正文展开。SSOT：`src/core/mutationM01Contract.js` + `scripts/mutation-m01-check.js` + `src/core/cloudApiClient.js` `CLOUD_JSON_DEFAULT_TIMEOUT_MS`。Ritual Leave 产品静默仍未挂 SB-xx（本刀不改白名单）。
