# Task Brief · T76 冷启动静修入口（指路 + 首次直坐）

> **状态（2026-11-03）**：**已点头**（方案 B + 五处修订）。本文件仍是口径锁；**B1** 按修订后的本文改运行时。**B2** 仍后做。  
> **代号**：**T76**。人话：第一次打开就能安静坐下来，并修好「想学习却被送去呼吸」的错路。  
> **槽位**：**P1**（B1 卡面 + 路由纠错 + 四选卡直坐）· **P2**（B2 帮助中心别名）。状态 **立即做**（B1）· B2 仍 **排队中**。  
> **类**：本 PR **A 类**。实现 **B 类**（改冷启动卡、首次开坐路由、帮助文案）。  
> **依赖**：`origin/develop` tip。版本机制沿用已合入的 [`task-today-direction-help-entry-and-options-version.md`](./task-today-direction-help-entry-and-options-version.md)（`COLD_START_GOAL_OPTIONS_VERSION` 现为 **1**）。  
> **不是**：**T71** 三层共修方向锁。**不是** T56 另开修行产品。**不是** T45 静坐画面。**不是** T72 环境场 / 静心模式。**不是** 新开禅修计时器。**不是** 首页第四球。

---

## 0. 大白话

用户嘴里说 mindfulness、meditation、要安静坐一会儿。产品里其实已经能同坐，但卡面上的词接不上，第一次点进去还要走完到达仪式。更糟的是：现在「专注一会儿」被送去 1 分钟呼吸，「学习/工作」被送去 20 分钟呼吸。

这一份只锁怎么改。点头之前不改界面。

---

## 1. 分析师拍板（2026-11-02 · 勿再问，除非书面改口）

| 项 | 口径 |
|---|---|
| 引擎 | **不**新开禅修 / 正念课 / 第二套计时。不加首页第四球。阿寅 **不是**禅师。 |
| 主线 | 冷启动**路由对反**是硬伤，优先于「补一个坐禅品牌」。 |
| 卡面词 | **必须上卡**（EN/JA）。**不要**第五项。第 1 项改名承接 mindfulness / meditation（日语 マインドフルネス・瞑想）。**不要**把 Zazen / 坐禅写上卡面。 |
| 副标 | 第 1 项必须有 **no guidance / ガイドなし**。日语用正向句：**ガイドなしで、阿寅と静かに座る**（待日语母语者过一眼；意思不变）。 |
| 四项 | 仍四项：默坐 / 跟呼吸 / 学习或工作 / 只是看看。 |
| 直坐范围 | **只要从这张四选卡**点了第 1 或第 3 项（自动首卡、⋯ 重开、版本横幅进来，都算），就跳过到达直接开坐。日常底栏 **Sit with Yin** 仍走到达。不再用「是不是第一次」当开关。 |
| 版本 | 改选项 id 时 **bump** `COLD_START_GOAL_OPTIONS_VERSION`（1→2），沿用已有轻横幅。禁止另造版本体系。 |
| 拆 PR | 口径修订与 **B1 同一个运行时 PR**（#1535 已合入 develop，不能再往那条 PR 追加）。卡面 + 纠错 + 直坐必须同批。**B2** 帮助中心另 PR · P2。 |
| 商店关键词 | 运营，**不进**本任务实现 PR。 |

**五项方案（不合理）**：与第 1 项同去向，制造选择负担，变相第二入口。

---

## 2. 代码实测基线（`origin/develop` · 2026-11-02）

对照 `coldStartGoalGate.js` · `handleColdStartGoalSelect` · `ArrivalPractice.js` · `SessionUiGate` · `focusDuration.js`。**不是**浏览器秒表；强制等待用代码常量。

### 2.1 现网四选项映射（缺陷）

| 选项 id | 卡面（en） | 实际去向 |
|---|---|---|
| `focus` | Focus for a bit | **1 分钟呼吸**（`selectDurationAndStart(1)`，**1 次点击**即开练） |
| `calm` | Quiet down | 打开「这次怎么陪你？」；**不会直接开坐** |
| `study-work` | Study or work | **20 分钟呼吸** |
| `browse` | Just looking around | 关卡，留 Idle |

### 2.2 「静一静」→ Here & Now → 第一次呼吸：点击与等待

新鲜安装、`arrivalGateReady === false`：

1. 点 Quiet down → 陪伴三卡  
2. 点 Here & Now → **启动到达**（门闩未就绪；此时此地 / 心流不得静默开表）  
3. 欢迎气泡 **自动 2000ms**（`ARRIVAL_WELCOME_MS`）  
4. 点 Notice → 观察句 **2400ms**（`ARRIVAL_NOTICE_REPLY_MS`）；若首次披露再 **+1600ms**  
5. 呼吸步 **自动 5000ms**（`ARRIVAL_BREATH_MS`）  
6. 点 Choose（图标）→ 点头后 `onReady`；预选模式可抑制再弹三卡  
7. **时长条** 10/15/25/45，再点一档才 `beginFocus`

**合计：约 5 次点击。** 强制等待 **≥ 9400ms**（无披露）或 **≥ 11000ms**（有披露），**尚未计入**点头动画与选时长。分析师目标 **≤2 次点击、≤10 秒进入坐** — 现网到达等待一项就可能超过 10 秒。

到达设计写「10–20 秒轻量仪式」且 **Sit 每次仍走到达**（`resolveSitClickWhenIdle` 不因门闩跳过）。左球 ⚡ 已改成呼吸练习，**不再**是「跳过到达立刻 Focus」的码头钮。离线空间可跳过到达，但语义是「去别处坐」，不能冒充同坐默坐。

### 2.3 首坐最短档

Focus 芯片 **10 / 15 / 25 / 45**，默认与最短 **10**（`FOCUS_DURATION_DEFAULT_MINUTES`）。**本任务不新增 5 分钟 Focus 档**（那是新练习刻度，另立项）。四选卡直坐：第 1 项 **10** 分钟、第 3 项 **25** 分钟，都在现有芯片里，不再多点时长条。

### 2.4 口径核对（首次跳过到达）

| 文档 | 结论 |
|---|---|
| [`PRODUCT_POSITIONING.md`](../PRODUCT_POSITIONING.md) | 仍是正念伙伴、专注陪伴。跳过的是**仪式步骤**，不是另做修行产品。 |
| [`CO_PRACTICE_POSITIONING.md`](../CO_PRACTICE_POSITIONING.md) | 「不另做入口」= 不去向第二套界面。直坐仍进现网 Focus / 此时此地。 |
| [`ARRIVE_MOMENT_DESIGN.md`](../ARRIVE_MOMENT_DESIGN.md) | 到达挂在 **Sit with Yin**。冷启动卡上的「我要坐」视为当次意图已表达。日常 Sit **保持**到达。跳过机制历史上由 ⚡ 承担；⚡ 已改呼吸，首次直坐补回「明确要坐则开坐」。 |
| 契约 C-11 / T64 | 卡面与结束后提示 **不得**写成禅师带练。副标 no guidance 即此条。 |

**方案 A**（保持完整到达）与卡面承诺冲突 → **（不合理）**。  
**方案 C**（压缩到达仍多一步）仅当 PO 否决 B 时备用。  
**本 Brief 锁定方案 B。**

---

## 3. 用户词 → 现有入口（内部对照；中文只作说明）

| 用户可能说的（不上第 1 项卡面主标题） | 落到 |
|---|---|
| mindfulness, meditation, マインドフルネス, 瞑想 | 第 1 项 → 同坐此时此地（四选卡直坐 10 分钟） |
| zazen, 坐禅, Zen practice（搜索 / 帮助别名） | **B2** 指向同坐；**不上卡面** |
| 短呼吸、跟呼吸 | 第 2 项 → 左球呼吸，现网 1 分钟立即开练 |
| 学习、工作、focus on work | 第 3 项 → 同坐 **心流状态** + 四选卡直坐 25 分钟 |
| 只是看看 | 第 4 项 → 跳过 |

---

## 4. 冷启动四项（EN/JA 卡面 SSOT）

卡面 locale **以 en / ja 为准**。中文工程字典可留内部说明句，**不作为对外卡面承诺**（现网冷启动卡本就以英日为主）。

| # | choice id（新） | 英文主标 | 英文副标 | 日语主标 | 日语副标（草稿，人审可改字、不得删「无指导」） | 去向 |
|---|---|---|---|---|---|---|
| 1 | `mindfulness` | Mindfulness & meditation | Sit quietly with Yin, no guidance | マインドフルネス・瞑想 | ガイドなしで、阿寅と静かに座る | 此时此地 + **10** 分钟，跳过到达与时长条 |
| 2 | `breath` | Follow your breath | （可无副标或一句 Short pause） | 呼吸に合わせる | （可短副标） | 现网呼吸 `selectDurationAndStart(1)` |
| 3 | `study-work` | Study or work | （可无） | 勉強・仕事 | （可无） | 心流状态 + **25** 分钟，跳过到达与时长条 |
| 4 | `browse` | Just looking | （可无） | 見てみるだけ | （可无） | 关卡，不导航 |

**删除** id：`focus`、`calm`（替换，故必须 bump 版本）。存量见 §4.2。

**禁止**：卡面主标写 Zazen、坐禅、禅堂、guided、teacher、zen master。

### 4.1 版本号（对齐旧 Brief）

1. `COLD_START_GOAL_CHOICES` 增删替换 id → `COLD_START_GOAL_OPTIONS_VERSION` **1 → 2**。  
2. PR 描述写：变更摘要、新 `resolveColdStartGoalAction`、tracker「选项版本 2 轻提示」。  
3. **不**另造 key。老用户 `seen` 已写且 options-seen &lt; 2 → 现网顶栏轻横幅；Dismiss 亦 mark 版本。  
4. **不 bump 的例外不适用本次**（本次是 id 替换，不是纯翻译）。  
5. 老用户只有 seen、没有 options-seen 时，迁移记成 **1**（他们看过的是旧四项），**不要**记成 2。这样版本横幅仍会出现。新用户点卡后直接记 2。

### 4.2 旧 id 存量（2026-11-03 代码核对）

`focus` / `calm` **不是**用户设置，也不是「今日方向」长期档案。唯一写入点是本标签页的 `sessionStorage` 键 `focus-tiger.cold-start-goal-choice.v1`（见 `setColdStartGoalSessionChoice`）。`localStorage` 只存「看过卡」和「看过哪一版选项」。

读取时：当前四项 id 才有效。读到 `focus` 或 `calm` → 当成没有选择，并删掉这条 session 值。`resolveColdStartGoalAction` 对这两个旧 id 返回 `null`，**不得**再打开 1 分钟或 20 分钟呼吸。没有别的模块用这两个字符串当冷启动选项（全仓对照后只剩本闸门与其测试）。

---

## 5. 四选卡直坐（方案 B · 范围硬闸）

### 5.1 何时生效

从这张四选卡点了 `mindfulness` 或 `study-work` 就生效。包含：

- 自动弹出的第一次冷启动卡  
- ⋯ / 首页「重新选择今日方向」（`open({ manual: true })`）  
- 版本更新横幅点进来的重选  

**不生效**（走现网）：

- 底栏 **Sit with Yin**（`resolveSitClickWhenIdle` 在门闩已就绪时仍返回 `start-arrival`）  
- 左球呼吸、Honesty、离线空间日常点选  
- 第 2 项呼吸、第 4 项看看  

同一句卡面承诺，从这张卡点进去必须同一种兑现。不再用「是不是第一次」把人送回完整到达。

### 5.2 行为

1. 关四选卡，写 seen + options-seen=2。直坐结束后 `COLD_START_GOAL` 源必须已释放（不新开 overlay id）。  
2. 模式：`mindfulness` → Here & Now（`stay`）；`study-work` → Flow State（`acrossTools`）。  
3. 时长用现有芯片，**不新开档**：第 1 项 **10** 分钟；第 3 项 **25** 分钟（学习/工作要的是做事的时间块；10 分钟只留给默坐新手）。`setTargetMinutes` 后 **不打开**时长条，也不把无尽坐偏好套到这一场。  
4. **不打开** Arrival。调用现网 `beginFocusWithMode`。  
5. 将 `arrivalGateReady` **置 true**（避免回流 Companion 再卡死）。**Sit 按钮仍每次到达**——门闩不改变 `resolveSitClickWhenIdle`。  
6. 0–1 秒内：卡消失，阿寅闭目同坐，计时已开始。  
7. 这条直坐结束之后（坐满或中途起身都算一次）：一句轻提示——下次可以从 Sit 先走到达，会更容易静下来。**禁止**模态、禁止强推。**终身一次**，不按天重复。

### 5.3 目标指标

- 从点第 1 / 第 3 项到 Focusing 开始：**1 次点击**、**≤10 秒**（关卡动画计入；不得再插入 Notice/Breath/Choose/时长条）。自动首卡和手动重开同一标准。  
- 自动化须在**撤掉直坐后门闩仍要求到达**的路径上变红（Sit 主路径不得被本刀跳过）。现网 `SessionUiGate.test.js` 已锁「门闩就绪仍 start-arrival」。

### 5.5 中途离开（2026-11-03 代码核对 · 本刀不改收尾）

对照 `FocusInput` 的 Rise、`journeyLogGate.resolveJourneyMinutes`、`scenario-smoke` 场景 C、`HINT_RISE_BUTTON`、`SessionEndFlow`、`session-end-observed-duration`：

| 核对 | 现网 |
|---|---|
| 好不好离开 | 专注中底栏按钮是 **Rise**（`BTN_FOCUS_STOP`）。点一次就结束，没有「你确定放弃吗」确认框。 |
| 算不算失败 | 没坐满不记「今日完成」（`hasCompletedToday` 仍为 false）。旅程日志仍记下墙上时钟分钟，至少 1 分钟。没有「失败 / 不够格」文案。研究事件 `early_rise` 只进 T54 账，不给用户看。 |
| 收尾语气 | 提示句是 “Rising early is welcome too.” 观察句是 “About {minutes} minutes this sitting.” / 「今回はおよそ {minutes} 分でした。」 |

10 分钟无指导对新手偏长，但离开口已经是欢迎起身，不是判失败。本刀不改 Rise、不改完成判定、不改收尾句。

### 5.4 若 PO 否决 B

退回方案 C：到达压成一屏可跳过。**不得**在否决前实现 C。

---

## 6. 非目标

- 不新练习种类、不改 Focus 芯片表、不把最短档改成 5。  
- 不改 T68 纪念画、不插队写 `src/` 于闸未过的画。  
- 不把 Yin 写成 zen master / 带练教练。  
- B2 之前不改 EDU-0003 短答（可在 B2 把「不是通用冥想课」改成「同坐即本产品的默坐；无语音指导」）。  
- 商店 ASO 关键词不进本 PR。

---

## 7. 实现切片（点头后）

| 刀 | 槽位 | 内容 | 分支建议 |
|---|---|---|---|
| 本 PR | 可选（文档） | Brief + 登记 T76 | `docs/t76-cold-start-quiet-sit` |
| **B1** | **P1** | 四选项 id/文案/路由 + VERSION=2 + 四选卡直坐（含本修订） | `feature/t76-cold-start-quiet-sit` · **必须同 PR** |
| **B2** | **P2** | 帮助中心 / EDU 别名：mindfulness, meditation, zazen, 坐禅, 瞑想 → 同坐 | `docs/` 或小 `feature/` · 点头后另 Chat |

口令「按 T76 Brief 开工」= **不写 `src/`，直到点头**。  
口令「按 T76 B1 开工」= 点头后新 Chat，基线 `origin/develop`。  
口令「按 T76 B2 开工」= B1 合入后或 PO 允许并行文档。  
口令「开工禅修模式 / 加第五项 / 第四球」= **不执行**。

---

## 8. 变体矩阵（A10）

| 变体 | 入口 / 前置状态 | 预期（可见结果） | 自动化 |
|---|---|---|---|
| EN 宽屏首次 | 清库 `?product=1` ≥480 | 四项英主标；点 1 → ≤1s 卡关且 Focusing 此时此地 10 分 | B1 补 e2e |
| JA 宽屏首次 | 语言日语 + 清库 | 第 1 项含 マインドフルネス・瞑想 与 ガイドなし | 同 spec locale |
| EN 窄屏 375 首次 | 同上 | 四项可点、不裁切；直坐同样 1 次点击 | 同 spec 375 |
| 第 2 项呼吸 | 首次点 Follow your breath | 1 分钟呼吸立即开始（现网微仪式） | 改写 `coldStartGoalGate.test.js` |
| 第 3 项学习 | 四选卡点 Study or work | Focusing 心流 + **25** 分，**不是** 20 分呼吸 | 单测映射 |
| 第 4 项 | Just looking | 关卡 Idle；阿寅可张望现网逻辑 | 现网 browse 测 |
| 老用户版本 2 | seen=1、options-seen 缺省或 1 | 缺省记成 1；Idle 顶栏轻横幅；不自动挡花/罗盘 | 单测 migrate |
| 手动重开四选 | 已 seen，⋯ 今日方向 | 点第 1 / 第 3 项 **同样直坐**；点第 2 项仍 1 分钟呼吸 | 单测不区分 manual |
| 日常 Sit | Idle 点 Sit with Yin | **仍** Welcome→Notice→Breath→Choose | 现网 `SessionUiGate` 负例不得删 |
| 直坐后再坐 | 已看过终身提示 | 不再出现那句轻提示 | 单测 hint 只消费一次 |

---

## 9. 点击反馈（0–1 秒）（A14）

| 控件 | 点击后 0–1 秒 | 持久化三态 |
|---|---|---|
| 第 1 / 3 项（自动首卡或手动重开） | 卡开始关；进入 Focusing（闭目同坐，非到达气泡） | seen + options-seen 写入成功无失败网路；写失败不得哑点击，应仍开坐并下轮可再问卡。忙碌中点卡须看见「现在不能开始」一类提示 |
| 第 2 项 | 呼吸相位文案出现（现网微仪式） | 同现网 |
| 第 4 项 / Esc / 空白 | 卡关，停留 Idle | 第 4 项不写导航；seen 规则与现网 browse 一致 |
| 版本横幅 CTA | 关横幅、开四选卡 | mark 版本 |
| 版本横幅 Dismiss | 横幅消失 | mark 版本；**SB**：非白名单不得无反馈 |
| 结束后轻提示 | 这条直坐结束后一句可见，可忽略 | 本机终身标记；无网。第二次结束不再出现 |

---

## 10. 边缘状态（A14）

| 边缘 | 预期 |
|---|---|
| Arrival / Reflection / 微仪式已开时点卡 | 现网 `handleColdStartGoalSelect` 忙碌 return：**须有可见反馈或不可点**，禁止新哑点击 |
| `?sessionMinutes=` | 第 1 项仍 10 分钟、第 3 项仍 25 分钟；查询串不得把直坐打成 1 分钟呼吸 |
| 无尽坐偏好已存 | 直坐仍是定点 10 或 25，不偷偷改成无尽（避免第一天无结束） |
| 旧 session 里的 `focus` / `calm` | 读到即丢掉，不导航 |
| Electron vs Web | 行为相同；无新桌面专用句 |
| 模型未 ready | 不涉及 Confide |

---

## 11. 共用机制核对

- **overlayBusy**：四选卡仍是已登记 `OVERLAY_SOURCES.COLD_START_GOAL`。直坐结束该源必须 false，否则会挡住 Focusing HUD / 切语问候。**需要联动**：关卡后再 `beginFocus`。不把直坐做成新 overlay id。  
- **HUD 呼吸 / 计时**：直坐走现网 `beginFocusWithMode`，HUD 消费者仍是 FocusSession。**不受影响**只要不另开第二套计时。到达呼吸步（`ARRIVAL_BREATH_MS`）在直坐路径 **不得**启动。  
- **z-index / dim**：不新建 z≥17 遮罩。四选卡关后不得留下 backdrop 挡住 Rise。对照 `Z_INDEX.md` Idle 常驻 chrome：Support FAB / 音符不因本刀改层。  
- **O-04 新叠层**：本次**不**新增 `OVERLAY_UI_SURFACE` 行。结束后轻提示用现网 toast / 非模态句，若误做成居中卡则须补登记——**禁止**。

---

## 12. 冲突扫描（实现前已扫 · 文档本回合）

相邻：场景 W 冷启动四选卡；Sit→到达；左球呼吸；Companion 此时此地 / 心流；场景 J 回流门闩。

- **强度**：四选卡直坐 **轻于** 日常到达。不比危机/倾诉更重。  
- **语气**：no guidance 与「不是禅师」一致；禁止指导式脚本。日语副标改成正向句，仍保留「无指导」。  
- **职责**：第 1 项与第 2 项去向不同（同坐 vs 呼吸），不是第五张同路卡。日常 Sit 仍负责到达。

无「须停手改产品哲学」的冲突。PO 已拍板：同一张四选卡的第 1 / 第 3 项一律直坐，避免卡面承诺和到达仪式互相矛盾。Sit 按钮不变。

---

## 13. 验收（点头后 B1 才跑代码）

- [ ] 清库首次：四项 EN/JA 与 §4 表一致。  
- [ ] 第 1 项 1 次点击进入此时此地 10 分钟 Focusing，无 Notice/Choose。自动首卡与手动重开相同。  
- [ ] 第 3 项进入心流 **25** 分钟 Focusing，**不是** 20 分钟呼吸。  
- [ ] 第 2 项 1 分钟呼吸。  
- [ ] Sit with Yin 仍完整到达。  
- [ ] 旧 `focus` / `calm` 不再导航。  
- [ ] 直坐结束后的轻提示终身只出现一次。  
- [ ] VERSION 2 横幅：老用户可见、可 Dismiss。缺 options-seen 的人记成 1 后仍看得到横幅。  
- [ ] `npm run test:smoke`；Sit 到达回归不得被本刀跳过。

B2：帮助搜索别名指向同坐；EDU 短答应「无语音指导的同坐」，不是「我们没有冥想」。

---

*版本：1.1 · 2026-11-03 · PO 点头方案 B，并写入五处修订（直坐不限首卡、第 3 项 25 分钟、中途离开核对、旧 id 兜底、提示终身一次）*
