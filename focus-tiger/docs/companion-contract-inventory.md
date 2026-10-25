# T55 陪伴契约 · PR-1 现状盘点（按通道）

> **状态（2026-10-25）**：只读对照。以 `origin/develop` tip `2b71d968`（#1417 Brief 已合）上的代码为准。  
> **代号**：**T55**。状态 **排队中** · 槽位 **可选**（不以「立即做」写本任务）。独立于 **T54**（仍搁置 · 未排期）。**不挡 T34**。  
> **类**：A 类。本文件不改运行时、不改文案。契约正文 SSOT：[`COMPANION_CONTRACT.md`](./COMPANION_CONTRACT.md)（PR-2）。字面检查：`npm run check:companion-contract`（PR-3）。  
> **Brief**：[`task-briefs/task-companion-contract.md`](./task-briefs/task-companion-contract.md)

现网是**并行通道**，不是一级升一级。本表禁止按 L0–L3 列。空格写「尚未实现」，不编。

**同一时刻只有一个开口**：目标，**尚未实现**。现网多通道可并行；叠层让位走既有 `overlaySlotArbitration` / `yieldBusy`，本步不另建。

---

## 1. 开口通道（Yin 什么时候开口）

| 通道 | 触发 | 冷却 / 限频 | 用户不理时 | 所在文件与行 | 测试 | 相关红线 |
|---|---|---|---|---|---|---|
| **结束低语** | 两处共用 `#moment-whisper`，**并行于邀请 / Re-focus**。（1）Rise 且经过 ≥30s：观察分钟句 `SESSION_END_OBSERVED_MINUTES`（`formatObservedSessionDurationLine`）。（2）打开 Reflection：按 T50 标签选 Moment 键（`SETTLED`/`UNKNOWN`→`reflect`；`DRIFTING`→`arrive` 否则 `reflect`；`STRUGGLING`→`recover` 否则 `reflect`）。**标签名不进界面**。 | （1）每场 Rise 可再出，不记 Five Moments 已见。（2）Moment 键 **一生一次**（`momentWhispersGate` · **SB-05**）；`transition` 键现网不播。busy 叠层跳过（**SB-06**）。 | 约 3.5s 淡出（`HOLD_MS` 3500）；可点消。无追问。 | `sessionEndObservedDuration.js` L9–36；`main.js` `maybeOfferSessionDurationWhisper` ~1445 / Rise ~5353；`sessionPresenceConsumers.js` L24–61；`main.js` Reflection `open` ~3962；`MomentWhisperUI.js` L19–28、L75、L126–162 | `sessionEndObservedDuration.test.js`；`sessionPresenceConsumers.test.js`（标签不出现在源码展示面）；`momentWhispersGate.test.js` | C-02（分钟是练习事实）；C-03（观察句）；**C-09**（`SETTLED`/`DRIFTING`/`STRUGGLING` 只作内部估计） |
| **专注中邀请** | Focusing 且 Here & Now：离开达标且本场 Re-focus 槽已用过后可问停一下（`AWAY_INVITE` / `AWAKEN_INVITE_PAUSE_PROMPT`）。Flow / Offline：**离开不邀**（**SB-03**）；到点可问「要再坐一会儿吗」（`extend`，+5 分钟，须用户点头）。长坐舒展到期可问停一下（`LONG_SIT_INVITE`）。托盘收起不出（**SB-18**）。已有邀请可见则不再出。 | 一小时最多 1 次（`AWAKEN_MAX_PER_HOUR`）；两次主动开口间隔 ≥10 分钟（`AWAKEN_COOLDOWN_MS`）。`yieldBusy` 时让位（与 Re-focus 叠喊：Brief/DESIGN 目标）。 | 10s 自消（`AWAKEN_AUTO_DISMISS_MS` · **SB-20**）；「先不用」同退。**不**自动开练习。点「要」才进已有接地/呼吸或加时。 | `InterventionOrchestrator.js` L8–77、L88–146；`AwakenInviteUI.js` L11、L112–115、L161–167；文案 `locales/slices/awaken-invite.json` | `InterventionOrchestrator.test.js`（含禁词只扫本切片）；`AwakenInviteUI.test.js`；e2e `e2e/awaken-invite.spec.js` | **C-01 / C-04 / C-08**（可拒绝、不催促、不带缺席账）；C-09（状态名 `NEUTRAL`/`FLOW_PROTECT`/`AWAY_INVITE`/`LONG_SIT_INVITE` 不进文案）；禁词正则见 §3，**不含** C-04 字面 |
| **离开后再聚焦提示** | Here & Now：切走再回来。离开 &lt;20s：完全静默（**SB-01**）。20–60s：只记账（**SB-02**）。&gt;60s：观察 toast 池 `REFOCUS_ACKNOWLEDGE_*` + `nod-bow`。Flow / Offline / 托盘：**无**（**SB-03** / **SB-18**）。主动 Recover（点阿寅）是另一条，不占本槽。 | 每场最多 1 次（`REFOCUS_PER_SESSION_LIMIT` · **SB-13**）；与 mindful / stretch 合计占每日提醒池 3 次（**SB-12**）。强情绪在场则静默让位且不补发（**SB-10**）。 | toast 走现网提醒时长后自消；无追问、不加码成邀请。 | `AttentionSignals.js` L9–10、L137；`MindfulReminderController.js` L14、L151–171、L250–282；场景 B `SCENARIO_TESTS.md`；池 `en.json` `REFOCUS_ACKNOWLEDGE_1–3`（L102–104） | `MindfulReminderController.test.js`；`AttentionSignals.test.js`；`scenario-smoke.test.js` smoke B | **C-01 / C-03 / C-04**：观察「注意力出去走了一会儿」离诊断与愧疚边界最近；**不是**诊断，也不得滑成「你又走神了」。与邀请并行时现网靠 `displayEligible` / `refocusSlotConsumed` / `yieldBusy` 错开，**不是**全局单开口锁。运行时无邀请正则；PR-3 检查器先扫本池 |
| **到达后的安静句** | Arrival Practice **完成**后、Companion / Sit 前（**不是** Quick Start 跳过）。`CalmActionArriveStore` 当日抽一条 Arrive 池许可句。延迟 520ms 再出。 | 同一次 Arrival 流程只出一次（`_shownThisFlow`）；句 id 按日历日锁定。与 Quiet Line 日锁分 key。 | 约 6.2s 持有后淡出（`HOLD_MS` 6200）；控件是 button，可点消。无追问。 | `CalmActionArriveCardUI.js` L7–8、L16–18、L61–70；`CalmActionArriveStore.js` L7–78；池 `src/content/calm-action-wisdom/` | `CalmActionArriveStore.test.js`；`CalmActionArriveCardUI` 契约测 | C-03 / 措辞：许可、降低门槛，**不是**打分。规范 SSOT `CALM_ACTION_WISDOM.md`（运行时已接线 Arrive / Recover / Reflect；Focus / Transition 未接） |
| **归来问候** | 练习日有空档后再坐，三条**并行表面**（不是阶梯）。文案本身不报缺席天数、不说「你错过了」。（1）Journey 见证记忆行：en `You came back.` / zh `你又回来了。` / ja `また戻ってきた。`（`JOURNEY_MEMORY_COME_BACK`）。（2）练习观察纸节奏第 5 句：en `Welcome back.` / zh `欢迎回来。` / ja `おかえりなさい。`（`PRACTICE_PAPER_RHYTHM_5`；近 7 天有坐、上一个 7 天没有、且总练习日多于近窗）。（3）成长旅程详情节奏点：en `You returned` / zh `你回来了` / ja `戻ってきた`（`GROWTH_JOURNEY_RETURNED`；空档标 paused 后，下一练习日标 returned）。冷启动挥手 `welcomeBack` **已停接线**，不算现网开口。Honesty 完成句 `HONESTY_CHECKIN_THANKS`（「欢迎回来。阿寅醒来了。」）是补登致谢，**不是**本通道。 | （1）同日一条 Come Back，可在之后的缺口日再出。（2）打开观察纸时按当日窗口现算，无独立冷却。（3）节奏条只读已记下的练习日。 | 用户不点也仍写在 Journey / 纸上；不是限时淡出邀请。无追问。 | （1）`journeyPracticeMemory.js` L59–60、L173–174、L316–326；locale `en.json` L705 / `zh.json` L700 / `ja.json` L700。（2）`practicePaperFacts.js` L24–33、L123–125；`locales/slices/practice-paper.json` en L9 / zh L29 / ja L49。（3）`growthJourneyDetail.js` L46–71；`GrowthJourneyDetailUI.js` L253–257；locale `GROWTH_JOURNEY_RETURNED` `en.json` L359 / `zh.json` L357 / `ja.json` L357 | （1）`journeyPracticeMemory.test.js`「records come-back after a gap」L79–101、locale key L189–193。（2）`practicePaperFacts.test.js`「hits line 5 on a return after a gap」L93–96。（3）`growthJourneyDetail.test.js`「marks a calendar gap as paused, then returned」L75 | **C-04**（允许问候，禁止带缺席/天数/愧疚账）。契约写「允许问候、禁止带账」时以这三句为锚。相邻：节奏条 `GROWTH_JOURNEY_PAUSED`（歇过）是练习事实空档标，不是问候 |

---

## 2. 文案池（各一行）

这些池**不是**升级阶梯。有的要用户点开才说话，有的会自动淡出。禁词检查范围见 §3。

| 池 | 现网怎么露 | 语气（代码/文档已写的） | 所在 | 测试 | 相关红线 |
|---|---|---|---|---|---|
| **Quiet Line** | 用户从 ⋯ / 抽屉打开今日静语卡；同日一句锁定；可存明信片。Yin **不**主动弹出。Journey 日卡可复用同日句。 | 诗性、观察、几乎不给建议。与 Daily Wisdom / Calm Action / 典藏**分池**。 | `dailyZenQuote.js` L6–27、L48–51；locale `DAILY_ZEN_QUOTE_*` + `DAILY_ZEN_QUOTE_INSIGHT_*`；可选 overlay `/api/quiet-line` | `dailyZenQuote.test.js`；`tasteLayerOverlay.test.js` | 观察式邻接。PR-3 检查器扫本池 |
| **Calm Action Wisdom** | Arrive 卡（上表）；Active Recover 后许可卡（toast 后再出，`HOLD_MS` 5200）；Reflect 有接线。Focus / Transition **尚未**接本池。CMS 70 条；产品句 **en+ja**，zh 草稿。 | 许可、降低门槛、行动提示；不说教。**禁止**替换 `REFOCUS_ACKNOWLEDGE` / `ACTIVE_RECOVER` / `MOMENT_WHISPER`。 | `CALM_ACTION_WISDOM.md` §一；`src/content/calm-action-wisdom/`；`CalmActionRecoverCardUI.js` L7–21 | Store / Card 单测；`tasteLayerSync.test.js` 池对照 | C-04 / 禁临床标签在内容规范里；运行时仍无邀请正则；PR-3 检查器扫本池 |
| **Whisper（Moment Whisper）** | 进 Arrive / Focus / Recover / Reflect 时，阿寅旁一生一次淡出句（`#moment-whisper`）。Transition 键登记但现网不播。结束低语可复用同一 UI 播观察分钟句（不记已见）。 | 认出、观察、非 Banner、非 Hint auto。 | `MomentWhisperUI.js` `COPY_KEYS` L23–28；locale `MOMENT_WHISPER_*`；`momentWhispersGate.js` L16–31、L104–110 | `momentWhispersGate.test.js`；场景 Y | C-03。PR-3 检查器扫本池 |

相邻、本步不当「开口通道主行」：Daily Wisdom（Reflection 底、14 id 冻结）；节日 `#seasonal-theme-whisper`（一日一次 · **SB-14**）；Transition Calm Action 轻提示（`TransitionMomentUI`）；主动 Recover 中置 toast（场景 X，用户点了才出）。

---

## 3. 现网禁词与练习事实（避免 C-02 误伤）

### 3.1 `AWAKEN_FORBIDDEN_COPY`

```
/焦虑|分心诊断|心流指数|分数|\banxiety\b|\bflow index\b|\bscore\b/i
```

- 锚点：`InterventionOrchestrator.js` L21–23。  
- **只**在 `InterventionOrchestrator.test.js` 扫 `locales/slices/awaken-invite.json` 的 en/zh/ja。  
- **不是** C-01–C-10 全表。其它开口通道与三个文案池**没有**接这条正则。缺口留给 PR-3，本步不扩。

口径文档：`DESIGN.md`「觉照邀请」禁止对外「心流指数」「状态分类器」「检测到焦虑」。内部词不得进用户可见文案。

### 3.2 练习事实，不是给人打分

主界面 **近日同坐环**（HUD `streak-meter` / Idle `#weekly-practice-heatmap`）= **练习事实**。一天一格/一点，记录「这天有没有坐」，**不是**给人打分、排名或心流指数。C-02 检查器**不得**把「近日同坐 / Recent days / 一天只亮一点」判成违规。

| 表面 | 存什么 | 用户看见什么 | 锚点 |
|---|---|---|---|
| **近日同坐环** | `focus-tiger.practice-days.v1` 最多 90 日 `{ date, totalMinutes }` | 7 点环；悬停 `HINT_FOCUS_HUD_STREAK`（en: one lit dot per day, not per session） | `PracticeDaysStore.js`；`FocusHUD.js` L40–41、L67；`SHARED_RESOURCES.md` 该 key |
| **今日同坐条** | 当日已完成分钟 + 当前会话 / 25 分软顶 | 进度条，不是百分评价人 | `sharedSittingProgress.js`；`DESIGN.md` FocusHUD |
| **莲花计入分钟** | `focus-tiger.lotus-pond.v1` 终身只增分钟 | 成长旅程可见朵数；详情圆点读莲花分钟。无五维分数 | `LotusPondStore`；`GROWTH_JOURNEY.md` |

内部 `focusLevel` / DOM `#hud-level` 仍可能写百分比供 e2e；正式 Focusing 视觉藏跳动分秒与百分数（**SB-22** / T45）。那是壳层计时，**仍不是**给用户的表现分。若 PR-3 扫 HUD 字符串，须把练习事实与「Focus % 计分牌」文案分开：后者产品已禁止常驻。

T50 标签 `SETTLED` / `DRIFTING` / `STRUGGLING`：**硬规则 C-09**。只偏置结束低语选哪一句和姿态；`sessionPresenceSummary.js` 写明 labels must not reach UI。盘点未见把这些名字画到界面上。

---

## 4. 倾诉（Confide）——只引用，不收编

| 归哪 | 现网 | 本契约 |
|---|---|---|
| 安全路由（危机、资源、产品问不走情绪回复） | Confide 发送链；默认仍关的安全分级 | **C-10 交接点**。不重写、不并入禁词样本（Brief §8.3） |
| 措辞边界 | 复述护栏 **T32**（#1369 已合；本盘点不改发送链） | 以后契约 §C 可引用 |
| **诚实边界（PR-2 必写）** | 字面检查只覆盖发布出去的固定文案 | **管不到倾诉里本地模型现场生成的句子**；那里最可能越界。Brief §4 原样写入契约，本步不扩检查器 |

---

## 5. 存量只记录、不改

| id | 记录 | 本步 |
|---|---|---|
| S-01 | 运行时 `AWAKEN_FORBIDDEN_COPY` 仍窄、只测邀请切片 | PR-3 契约表并列扫描；不改运行时正则 |
| S-02 | 开口通道固定文案现由 `check:companion-contract` 先扫 Re-focus 再扫其余池 | PR-3 已接线 |
| S-03 | 「同一时刻只有一个开口」尚未实现；邀请与 Re-focus 靠门槛/让位，结束低语仍可与其它叠层时间靠近 | 标明尚未实现；不改仲裁 |
| S-04 | Calm Action Focus / Transition 池 CMS 有、运行时未接 | 记录；不开新通道 |
| S-05 | 队列账本尚未登记 T55（#1418 冲突）。本 PR **不**改 `GLOSSARY.md` / `SCHEDULING_GLOSSARY.md`。T55 写法：**排队中 · 可选** | 治理小 PR 另做，不混进契约 |

未在本表当「违规」：近日同坐环、莲花分钟、观察式「你离开了」同类描述、上表归来问候三句（不带缺席天数）——这些是 **C-02 / C-04 近邻放行** 对象。

---

## 6. 计划 → 现状 → 还差 → 下一步

| | |
|---|---|
| **计划** | 按通道列出现网开口；文案池各一行；练习事实单独标出；归来问候有文件/行/测试 |
| **现状** | 五条通道 + 三池已对到文件与行；PR-3 字面检查已接线；PR-4 样本集见 `scripts/companion-contract-samples.js`；零 `src/` 运行时改动 |
| **还差** | PO 确认两比率达标线（本步建议 1.0 / 1.0） |
| **下一步** | 合入 PR-4 后 T55 第一步收口。不挡 T34 |

---

## 冲突扫描（文档盘点）

对照 [`FEATURE_CONFLICT_REVIEW.md`](./FEATURE_CONFLICT_REVIEW.md) 与场景 **B**（Re-focus）、**X**（主动 Recover）、**Y**（Moment Whisper）、觉照邀请（T51 / DESIGN）、Arrival 后许可句、Journey Come Back / 观察纸节奏 5 / 成长旅程 returned。本 PR 只登记、不改路径。

- 强度：无新仪式。  
- 语气：无新文案。  
- 职责：通道保持并行，不画成阶梯。
