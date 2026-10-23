# Task Brief · T50 会话存在摘要 Phase 1（用摘要改结束句）

> **状态（2026-10-23）**：本回合口令「按这份 Brief 开工」已锁规格；**本文件所在 PR 只交 Brief，不改运行时**。实现须另开 `feature/t50-session-presence-phase-1`。  
> **代号**：**T50** Phase 1。**不是** Phase 0 影子、**不是** Presence Signals、**不是**练习观察纸、**不是**下次默认时长、**不是**键盘/跨窗口监控。  
> **类**：**B**（会改计时同坐结束后的姿态轻重、轻声选哪一句、从哪个已有句库桶抽句；用户仍看不到 SETTLED / DRIFTING / STRUGGLING 字样）。  
> **从属**：Phase 0 [`task-session-presence-summary-phase-0.md`](./task-session-presence-summary-phase-0.md) · [`DESIGN.md`](../DESIGN.md) Companion Mode · [`CALM_ACTION_WISDOM.md`](../CALM_ACTION_WISDOM.md) 四池分家 · [`PRINCIPLES.md`](../PRINCIPLES.md) 观照者不贴诊断 · [`EMOTION_BIBLE.md`](../EMOTION_BIBLE.md) 观察式  
> **地面真相**：Phase 0 已合 `origin/develop`（#1394）。`SessionPresenceCollector.finalize` 已压摘要；`estimateSessionPresence` 已有、零消费端。

## 一句话目标

一场正式计时同坐结束后，用 Phase 0 摘要的估计标签，只去偏现有结束通道：**结束姿态**、**轻声选句**、**句库分桶**。倒计时、下次默认时长、提醒、练习账本都不动。标签永不渲染。

## 已经定下的做法

1. **只读估计器**：消费端只调 `estimateSessionPresence(summary)`（现网阈值常量）。禁止另写一套离开次数判定。`acrossTools` / `stepAway` 高离开仍不得变成 DRIFTING（Phase 0 persona 合同继续有效）。  
2. **不新建仲裁层**：结束姿态只作为现有 `resolveSessionEndSpriteOccupancy` / `triggerSessionCompletionFeedback` / `LIGHT_COMPLETE_POOL` 的**一个偏置输入**。  
3. **不新开表面**：不新气泡、不新卡、不新 overlay。轻声仍走 `MomentWhisperUI.tryShow`；句库仍走已有 Calm Action 分池 getter。  
4. **不写新用户可见诊断句**：禁止 locale 出现 SETTLED / DRIFTING / STRUGGLING / 焦虑 / 分心 / 心流。只从已有 Five Moments 桶里选。  
5. **下次默认时长 v1 不做**（不当教练）。禁止改 `FocusSession` 默认分钟、上次时长记忆、开场推荐时长。

## 消费端合同（只准这两处；第三处明确不做）

| # | 消费端 | 本刀 | 锁法 |
|---|---|---|---|
| 1 | 会话结束姿态 + 轻声选句 | **做** | 姿态：见下表。轻声：Reflection 打开时把现在写死的 `maybeOfferMomentWhisper('reflect')` 换成按标签选出的 **一个** Five Moments key（仍受 `MOMENT_WHISPER_PLAYABLE`、一生一次、busy 门闩）。 |
| 2 | 句库分桶 | **做** | DRIFTING → Arrive / Transition 池；STRUGGLING → Recover 池。只偏置**若该拍子本来就会抽 CAW** 的那次 `resolveQuote`；禁止把 Recover 句塞进 Reflection 页脚 Daily Wisdom / CAW-L；禁止改 CMS 70 条正文。 |
| 3 | 下次默认时长 | **v1 不做** | 单测锁：Phase 1 模块不得 import / 调用时长偏好写入。 |

### 标签 → 姿态 / 轻声 / 句库

| 标签 | 结束姿态（达标完成） | 轻声 key（优先序） | 句库桶 |
|---|---|---|---|
| `SETTLED` | 现网不变：当日首次仍 Celebrating；已庆祝走轻量完成池，不偏置 | `reflect`（现网） | 不偏置 |
| `DRIFTING` | 当日首次仍 Celebrating（不惩罚）。已庆祝：轻量池**偏** `sessionComplete`（摆尾），不抽更重庆祝 | `arrive` → 否则 `reflect`。**不要**为了本刀去启用尚未 playable 的 `transition` 轻声 | Arrive + Transition CAW 池（Transition 卡若本拍子未开则只偏将来/已有 Transition 抽句；不新开 Transition 轻声） |
| `STRUGGLING` | 当日首次仍 Celebrating。已庆祝：轻量池**偏** `mindfulAcknowledge`（点头），不要换悲伤/灰败序列 | `recover` → 否则 `reflect` | Recover CAW 池 |
| `UNKNOWN` | 现网不变 | `reflect` | 不偏置 |
| 未达标 Rise（`endedEarly`，估计器多为 STRUGGLING） | **占用仍是 RISE_HOLD**，不改成完成庆祝 | 轻声可按 STRUGGLING 偏 `recover` | 同 STRUGGLING；不把未完成演成完成反馈 |

里程碑金辉（`preferMilestoneGlow`）仍压过轻量池偏置。鹦鹉彩蛋不因本标签必出或禁出。

诚实边界（写进实现注释即可，不对用户说）：系统只能判断「在不在本窗口、有没有暂停/提前起身」，**判断不了**别的 App 里是否专注。

## 接线落点（实现时对照，本 Brief PR 不改这些文件）

| 文件 | 职责 |
|---|---|
| `src/core/sessionPresenceSummary.js` | 已有 `estimateSessionPresence`；可把 `lastSummary` 留在 collector 上供消费 |
| **新建** `src/core/sessionPresenceConsumers.js` + `.test.js` | 纯函数：标签 → `{ whisperKey, cawPools, lightCompleteBias }`；persona 七行锁消费映射 |
| `src/core/session-completion-feedback.js` | 已庆祝路径接受 `lightCompleteBias` |
| `src/core/spriteChannelArbitration.js` | 不新 occupancy；最多把 bias 的 `emotionKey` 传入现有 `SESSION_END` |
| `src/main.js` | `finalize` 之后把标签交给结束反馈；`reflectionMoment.open` 里选轻声 key。**微仪式 / RitualFlow 完成路径不读本标签**（collector 只 begin 正式 `FocusSession`；消费后清掉，防脏标签） |
| `src/core/CalmActionArriveStore.js` / `CalmActionTransitionStore.js` / `CalmActionRecoverStore.js` | 仅当该拍子本就会 `resolveQuote` 时传入可选 pool 过滤；不改 Reflect store 的池 |

`main.js` 只做接线，逻辑进纯函数。

## 范围（out）

- 下次默认时长、开场推荐分钟、番茄默认档。  
- 键盘、跨窗、`powerMonitor`、新传感器。  
- Honesty 补登、微仪式、RitualFlow、呼吸练习平行结束通道。  
- 观察纸、成长旅程、莲花、今日已练、Journey Log、YPE、`presence-signals.v1`、漏斗指标。  
- 练习账本（Phase 0 禁碰表继续有效）。  
- 新 locale 切片、新 overlay、新 z-index、Support / 付款。  
- 用户可见标签、说教、催促再坐久一点。  
- Confide 发送链。  
- 把 `transition` 轻声从「暂不 play」改成默认 playable（那是 Transition 自己的刀）。

## 变体矩阵

本刀触及计时同坐**结束语（轻声）与结束姿态**，矩阵必填。

| 变体 | 入口 / 前置状态 | 预期（可见结果） | 自动化 |
|---|---|---|---|
| Web 计时 Sit · stay · 坐满 · 当日首次 | Arrival → Here & Now → 达标 | 0–1s 内仍走现网 Celebrating；轻声不因本刀变重 | 姿态：现有 completion 单测保持；标签映射单测 |
| Web 计时 Sit · stay · 坐满 · 当日已庆祝 · SETTLED | 同日第二场、离开 0–1 | 轻量完成池不偏置；轻声 `reflect`（若门闩允许） | `sessionPresenceConsumers` + completion 单测 |
| Web 计时 Sit · stay · 坐满 · 已庆祝 · DRIFTING | ≥3 次短离开（每次 ≥20s） | 轻量池偏摆尾；轻声优先 `arrive`；无 SETTLED 字样 | persona `stay-drifting` 消费单测 |
| Web 计时 Sit · stay · 提前起身 | Rise | 仍是起身 hold 池，**不是**完成庆祝；轻声可偏 `recover` | Rise occupancy 回归 + 消费者单测 |
| stay · 已庆祝 · STRUGGLING（暂停 ≥3） | 坐满但多次暂停 | 轻量池偏点头；轻声优先 `recover` | persona `stay-struggling` |
| Electron Open-ended · 坐满 | 桌面已有入口 | 与 Web 同一套标签映射；不新开入口 | 同一纯函数 |
| acrossTools · 高离开 · 坐满少暂停 | 心流模式 | 估计器不得 DRIFTING；姿态/轻声按 SETTLED 或 UNKNOWN 合同（Phase 0：宜 SETTLED） | persona `across-tools-busy` |
| stepAway · 长离开 | 离线空间 | 离开不驱动 DRIFTING | persona `step-away-offline` |
| 实际 &lt; 60s | 极短场 | UNKNOWN；不偏置 | persona `too-short` |
| 托盘隐藏 | SB-18 | 不因此 DRIFTING | 现网 leave 合同 |
| en / zh / ja | 同一入口 | 只换已有轻声 key 对应文案；不新增诊断句 | locale 不改则现网 i18n 回归 |
| 窄屏 375 / 宽屏 | 同一结束通道 | 不新分叉 | 矩阵无视口分叉 |

不新增商品/付款变体。

## 点击反馈（0–1 秒）

本次无可点击交互改动，点击反馈节跳过。

（结束是计时到点或点 Rise 的既有入口；本刀不改这些按钮的 0–1s 反馈，只改随后姿态/轻声选哪一句。）

## 边缘状态

| 边缘状态 | 预期 |
|---|---|
| 轻声该 key 已见过 / busy / 不可 play | 落到优先序下一个；全不可则本拍子不喷轻声（与现网门闩一致，不是 bug） |
| YPE 关掉 Moment Whisper | 现网 `ypeMayShowMomentWhisper` 继续否决 |
| 微仪式 / Ritual 结束也开 Reflection | **不得**套用上一场 Sit 的标签；消费后清空 |
| 心流模式切 App | 不改离开提醒；只可能改变结束轻声/姿态偏置（且不得因离开判 DRIFTING） |
| 叠层已开（Confide / Support） | 不新开轻声抢层；busy 则跳过 |
| 无摘要（collector 未 begin） | 行为 = 现网 reflect + 不偏置姿态 |
| 标签字样 | DOM / toast / TTS / 控制台产品文案均不得出现 SETTLED 等；控制台仍可打 Phase 0 `[SessionPresence]` 摘要对象 |

无付款/已购分支。

## 冲突扫描（`SCENARIO_TESTS.md`）

相邻：场景 AD 会话结束仍醒着 · Companion Mode · Re-focus / 离开提醒 · 场景 AF Presence Signals · 练习观察纸 · Reflection 打开 · Moment Whisper 一生一次 · Calm Action 四池。

| 轴 | 判断 |
|---|---|
| **a. 强度** | 不新增仪式或第二张卡。STRUGGLING 把已庆祝的摆尾偏成点头，是**更轻**不是更重。未达标仍不播完成庆祝。被动离开提醒不因本刀变重。 |
| **b. 语气** | 只复用观察式轻声与已有 CAW 分池；禁止监工句、禁止「你分心了」。 |
| **c. 职责** | 不替代用户声明的陪伴模式；不替代 Presence Signals；不把观察纸做成拓扑。结束通道仍是现有精灵占用，不平行再开一套。 |

无未决冲突。实现 PR 第三问复述本表。

## 共用机制核对

- **overlayBusy**：本刀不新建可点击叠层。轻声复用 `#moment-whisper`（现网 `MomentWhisperUI`）。核对后确认 **不**把轻声登记成新的 overlayBusy 源；Support FAB / 倾听耳 / Ambient 音符不被本刀改 dim。Confide 开着时现网 busy 门闩继续挡住轻声。  
- **HUD 呼吸 / 计时驱动**：不接线。倒计时与结束铃默认（T39）不在本刀。  
- **z-index / 遮罩 dim**：不改 `Z_INDEX.md`；轻声沿用现网层。  
- **新建可点击叠层**：无。  
- **后台网络**：不涉及。  
- **受保护路径**：不涉及 Support FAB / 付款 CTA。

## 已好清单（实现开工不变量）

- 当日首次达标仍 Celebrating（Honesty / 微仪式仍不占庆祝戳）。  
- 未达标 Rise 仍 hold 起身池，不播完成庆祝。  
- 场景 AD：结束进 Reflection 时阿寅仍醒着，不得改成披毯。  
- Phase 0 环缓与 `[SessionPresence]` 日志保留；禁碰练习账本 key。  
- `transition` 轻声保持暂不 playable。  
- 菜单逃生舱、付款栈不动。

## 验收（Phase 1 实现 PR，非本 Brief PR）

- [ ] persona 七行：估计器标签 + 消费映射单测绿（含 `across-tools-busy` 不得 DRIFTING）  
- [ ] 撤掉 `lightCompleteBias` / whisper 映射后，对应新单测会红  
- [ ] 无新 locale 诊断句；`git grep` 产品文案无 SETTLED/DRIFTING/STRUGGLING  
- [ ] 时长偏好写入路径无新调用  
- [ ] `cd focus-tiger && npm run test:smoke` 绿  
- [ ] 本 Brief PR：`npm run docs:check`；**零** `focus-tiger/src` diff

## 开工闸

- 本文件锁 B 类规格。口令「按这份 Brief 开工」= 允许 **下一支** 实现旁支写 `src/`。  
- **禁止**把本 Brief 与运行时塞进同一个 PR。  
- 实现旁支 **禁止**改 `GLOSSARY.md` / `SCHEDULING_GLOSSARY.md`（队列仍写 T50；Phase 1 状态由治理 PR 改）。  
- 实现须基于已含 Phase 0 的 `origin/develop`。
