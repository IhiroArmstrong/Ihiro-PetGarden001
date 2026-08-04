# Known-Risky 优先验收清单

创建日期：2026-08-04  
权威路径：`focus-tiger/docs/KNOWN_RISKY_TEST_CHECKLIST.md`  
性质：**人工验收操作步骤**——对应 `DEVELOP_DEBT_INVENTORY.md` §1 `known-risky` 优先批。  
基线：验收前须 `git pull` 到当时 `origin/develop` tip，并跑 `npm run check:branch-freshness`（behind 须为 0 才可关单级验收）。

> **SSOT**：本 MD。由根目录 `KnownRisky测试清单.numbers` **全量同步**（含步骤内 `【***测试OK】` 等批注）。  
> 同目录 `known-risky-test-checklist.csv` 为薄导出。Numbers 确认无新批注后可删。

---

## 0. 怎么用

| 问题 | 答案 |
|---|---|
| 开始测产品，优先测什么？ | **本表**（= 债务清单里风险最高的一批） |
| 状态标签 / 判定依据？ | 仍看 `DEVELOP_DEBT_INVENTORY.md` §1；本表步骤与 Numbers 同步 |
| 关单写哪？ | `TEST_TRACKER.md` 对应行（书面反馈进「用户反馈」列） |
| 步骤里的 `【***测试OK】`？ | **走查批注**（你在 Numbers 里写的）；不等于 TRACKER 关单 |

**公共前置（每条默认）**：`cd focus-tiger && npm run dev` → Safari `http://127.0.0.1:5173/?product=1`（窄屏 375×667）。

---

## 1. 清单（与 Numbers 同行）

| # | 功能/交互点 | 状态标签 | 需要的具体测试操作步骤 | 判定依据（摘） | 建议后续动作 |
|---|---|---|---|---|---|
| 1 | Idle 窄宽 chrome 总验收（三球 / ⋯ / 抽屉） | verified | 【前置】`cd focus-tiger && npm run dev` → Safari 打开 http://127.0.0.1:5173/?product=1；验收前确认本机已 `git pull` 到 origin/develop tip。<br><br>【宽屏 ≥900】<br>1) Idle：见宽屏三球（Quick · Sit · Honesty）+「⋯」，不是旧 Sit+⚡ pill。 【***测试OK】<br>2) 点「⋯」：应代理 Honesty / How / Sound / 提醒等；行内若有脉冲点，点开文案不得误绑成「Tap to sit with Yin」（曾有的 Bug）。【***测试OK】<br>3) 点 Sit → Arrival → Choose（如 Reading）→ Companion 点选 → Focusing；见 Focus HUD。【***测试OK】<br>4) Rise → 回 Idle，壳仍正常（三球+⋯）。【***测试OK】<br><br>【窄屏 375×667 · Safari 响应式】<br>5) Idle：主画布三球 + 底栏抽屉；无宽窄双壳叠点。【***测试OK】<br>6) Sit → Arrival：Arrival 开着时 Sit 应隐藏；Breath 阶段勿再露主 Sit。【***测试OK】<br>7) Focusing 时点 ? / tip：行为应符合预期（曾报 Focusing tip 问题）。<br>**【2026-08-04 复测不通过 · 叠团】**；专修 PR #109 合入。 **2026-08-04 用户书面（`origin/develop` tip `0494dd6` · `:5176`）**：375 Focusing×? 主 tip + N-more 不叠团 — **【***测试OK】**。**2026-08-04 KnownRisky #1 批注**：【***5176 测试OK】（与 tip `0494dd6` 一致）。<br>8) Sit options / How：若有脉冲点指引，窄屏应有、且不指错控件。<br>**2026-08-04 用户书面（tip `4698eb3`）**：窄屏 Hints 更不易设计 → **大致维持现状、其它方面延迟考虑；可先看宽屏 hints**（产品延期，不按缺陷开修）。<br><br>【断点】<br>9) Companion/How 打开时，DevTools 在 375↔480 来回改宽：面板不得被误关。 【***测试OK】（tip `4698eb3`）<br><br>【通过标准】§8 375 故事最小集 + §9 W1–W8 能走通；发现的 Bugs 记回 TEST_TRACKER「用户反馈」。<br>**2026-08-04 关单**：tip `4698eb3` 步1–6、9 OK；步7 见 tip `0494dd6`/:5176；步8 产品延期。→ `TEST_TRACKER` Task3 **已通过**。 | TEST_TRACKER Task3 **已通过**（2026-08-04 · tip `4698eb3` + 步7 tip `0494dd6`）；步8 产品延期维持窄屏 Hints 现状。 | 暂不处理（步8 延期）/ 改壳时复测 |
| 2 | Honesty Check-in（Idle 补登主路径） | known-risky | 【前置】产品壳 `?product=1`；可用实验室「重置全部本地状态」做干净开局。<br><br>【主路径】<br>1) 冷启动 Idle：闭目坐禅（不是睡着）+ 可点 Honesty / Mindful Check-in。<br>2) 点 Honesty → 选时长（如 10 或 20）→ 呼吸引导。<br>3) 呼吸进行中看底栏：应仅保留 Quick Start（keepQuickStart），**不得**仍露满排三球挡流程。<br>4) 呼吸结束 → 成功 toast（「别处的静心，也算数」类）+ 桥接 CTA 同屏可读。<br><br>【回流】<br>5) 同日再走一遍 Idle Honesty → 呼吸 → toast + 再出桥接。<br><br>【? 补救】<br>6) Honesty 时长面板打开时点左下「?」：气泡尖角须指到可见锚点，不得指虚空。<br><br>【通过标准】补登能记账；呼吸期 chrome 正确；? 不指空。 | 曾人工 OK + 真实链 e2e；2026-08-01 重回「有问题」：呼吸期底栏仍三球（应 keepQuickStart）、? 补救锚虚空等。真实链绿 ≠ 叠层/chrome 契约稳。**与 #3 桥接关单无关**：#3 清单不含本条步骤；用户 #3 提交已完整。 | 走查回流（另条）→ 补 chrome/叠层 e2e |
| 3 | Honesty 桥接 CTA | verified | 【前置】产品壳；先完成一次 Honesty 补登进入桥接。<br><br>【主路径】<br>1) 补登结束立刻出现桥接：顶行 thanks +「要不要现在也坐一会儿？」Yes/No。 【***测试OK】<br>2) 观感：气泡应为暖米半透明（约能看见阿寅下半身/蒲团），不得近乎不透明大白板挡角色。 【***测试OK】<br>3) 桥接可见时：Honesty Check-in /「一分钟呼吸」入口须隐藏，不得叠在 Yes/No 上。 【***测试OK】<br>4) 点 Yes → 完整 Arrival → Companion（不要直接开表）。 【***测试OK】<br>5) 另一次：点 No → 回 Idle，两入口恢复。 【***测试OK】<br><br>【回流 + 375】<br>6) 同日再补登应再出桥接。 【***测试OK】<br>7) 375×667：toast 与桥接同屏不互挡到不可读。 【***测试OK】<br><br>【通过标准】叠层/透明度/入口 suppress 都对；Yes/No 语义正确。 【***测试OK】<br>**2026-08-04 关单**：用户称「第2行」=本条步骤（完整记录）；tip **`a76178f`**（`:5176` · behind=0）。「时长→呼吸→toast→?」属清单 **#2**，非本行漏测。→ `TEST_TRACKER` 桥接行 **已通过**。 | TEST_TRACKER 桥接 **已通过**（2026-08-04 · tip `a76178f`）。 | 改桥接/叠层时复测 |
| 4 | Ambient Soundscape + 右上音符静音 | known-risky | 【前置】产品壳；重置后默认应无音乐（opt-in）。<br><br>【宽屏】<br>1) 右上音符：关=可点开播；**桌面悬停**即可开清单（不静音；冷开先 Off）；有声且清单已开时再点=静音；音符约 **+50%**（宽屏专用）。 【***测试OK】（2026-08-04）<br>2) 选曲后有声 → 点音符静音 → 再点音符：应续播同一曲。 【***测试OK】（2026-08-04）<br>3) 面板显式 Off：再开不应自动续播。 【***测试OK】（2026-08-04）<br>1b) Sit→选曲→悬停开清单换曲音乐不停→清单开着再点静音。 【***测试OK】（2026-08-04 晚 · 宽屏 · 分支自检）<br><br>【窄屏 375】<br>4) ActionBar ♪：**悬停**开清单；抽屉打开时悬停亦须开面板。**音符保持原尺寸（不放大）**。 【***测试OK】（2026-08-04 晚 · 分支自检：尺寸不放大 + Focusing 可见清单）<br><br>【Focusing / Rise】<br>5) Sit 开计时后：**悬停/点击** ♪ 须弹出**看得见的**选曲清单（换曲不中断）。 【***测试OK】（2026-08-04 晚 · 宽屏 + 窄屏 Focusing 分支自检）<br>6) Rise 或达标结束 → 音乐须自动停；面板收起。 【***测试OK】（2026-08-04）<br><br>【回流】<br>7) 刷新后仍尊重静音/关偏好；再 Sit 后可按偏好再开。 【***测试OK】（2026-08-04） | **2026-08-04**：步1–3、6–7 OK。屏外 panel / 窄屏勿放大已修。**同日晚**：宽屏悬停换曲 + 窄屏尺寸/Focusing 清单 — 分支自检全部 **测试 OK**（`fix/soundscape-first-open-off-icon-size`）。合入 `origin/develop` tip 后再做关单级验收。 | 合 develop → tip 复验关单 |
| 5 | 「本周陪伴」热力图 UI | known-risky | 【前置】产品壳 Idle。<br><br>【主路径】<br>1) Idle 见「本周陪伴」7 格热力图。【***测试OK】（2026-08-04 · Numbers 第7行 / 清单#5）<br>2) 宽屏：通常在左下「?」上方；窄屏：在抽屉/ActionBar 相关挂点，勿只剩看不见。【***测试OK】<br>3) 非 Idle（Focusing）：热力图应隐藏或按契约 park（不得挡 HUD）。【***测试OK】<br><br>【真数据】<br>4) 完成一场短计时（演示 1 分钟）或 Honesty 补登后回 Idle：今日格应变亮（或保持亮）。【变亮本身 OK】；**展示缺口**：【需要优化】「谁能知道哪个格子是今天？毫无提示。这样不对。」→ 已开 `fix/weekly-heatmap-today-marker`（星期缩写 + 今日软描边；合入后本步通过标准改为：能一眼认出今天）。<br><br>【Hint】<br>5) 清空 hints 已读后，点「?」：weekly-heatmap tip 应立刻出现且尖角靠近热力图（不得等「More tips」才出、不得指空）。**【测试不行】**；用户书面：Hints 问题很多，**需要再设计**（见清单 #7 / TEST_TRACKER 点?补救行）。<br><br>【通过标准】能一眼认出今天；亮暗合理；Focusing 不挡；tip 几何可接受（tip 项待 Hints 再设计）。 | **2026-08-04 走查**：步1–3 OK；步4 变亮 OK、今日标记缺口已开 fix；步5 Hint **不行**→再设计。场景 O 曾大段 OK；e2e 锁壳与 seed。 | 合入今日标记 → tip/Hints 再设计批次（勿单点硬修尖角） |
| 6 | 应用内提醒设置 + 横幅 | known-risky | 【前置】产品壳 Idle。<br><br>【设置】<br>1) 点热力图簇旁小型时钟图标 → 打开提醒偏好面板。<br>2) 设一个「即将到点」或稍晚的时分并保存；见 daily blurb / 状态文案。<br>3) 取消/清空偏好 → 存储清空，入口仍可用。<br><br>【横幅】<br>4) 到点且今日未练完时回前台：应出 gentle 横幅；关闭后同日不无故重复刷屏。<br>5) Focusing / Arrival / Reflection / 微仪式等忙碌中：横幅应 suppress（隐藏，不排队）——产品拍板。<br><br>【回流】<br>6) 整页刷新后再到条件：行为符合偏好（曾有「刷新再出」类缺口须盯）。<br><br>【通过标准】设置可写可读；忙碌 suppress；无异常刷屏。 | 有问题：入口/软提示/busy suppress 与壳改动邻接；e2e 有主路径+suppress，负例与刷新再出仍人工。 | 走查 → 按缺口补测试 |
| 7 | Onboarding Hints · ? 补救 / Lit 试点 | known-risky | 【前置】产品壳；实验室可「清空引导提示已读」。<br><br>【自动 tip / 圆点】<br>1) 冷 Idle：通常先见 Sit 相关 tip；薄荷绿 click 圆点（如音符）行为：peek → 静止弱化 → 操作后 done。<br><br>【? 补救】<br>2) 点左下「?」：此刻可见控件各出 tip；藏在 ⋯/抽屉里的折进「More tips」芯片。<br>3) 点 tip 气泡本身 → 立刻消失。<br>4) 宽屏：weekly-heatmap 等可见项 tip 尖角须贴锚；窄屏抽屉未开时 tip 不得乱指抽屉内控件。<br><br>【回流】<br>5) Rise 后再 Focusing 点「?」仍可用。<br>6) Lit 薄荷绿气泡观感可接受（护栏试点 ≠ 替代本条人工观感）。<br><br>【通过标准】尖角/park/互斥不乱；文案可读。<br>**2026-08-04（经清单#5 步5）**：weekly-heatmap tip 路径 **【测试不行】**；用户书面「Hints 问题很多；需要再设计」。 | 有问题：? 补救尖角/park、Lit 薄荷绿观感；**2026-08-04 产品方向**：整体再设计（非单点 tip）。部分覆盖：见 HINTS_WIRING.md——簇 A 格式已验；④ 视觉护栏试点已合（PR #93），用户拍板保持观察、暂不扩 linux/peeked/更多 id（PR #95）；护栏 ≠ 人工观感关单；簇间互斥+尖角仍高耦合。 | **产品再设计批次**（暂缓单点 tip 几何）；扩护栏前先读 HINTS_WIRING |
| 8 | 冷启动「开场即睡」vs live DORMANT | known-risky | 【前置】需要本地有「≥2h 前」的 focus-session-end 戳。做法示例：先完成一场会话，用 DevTools/实验室改存储时间戳，或按 TEST_TRACKER「开场即睡」行说明准备。<br><br>【冷启动】<br>1) 硬刷新 / 重新打开 `?product=1`：阿寅须 Idle 闭目坐禅（有精神），**不得**立刻披斗篷睡着。<br>2) Honesty 小钮仍可出现（零完成时）。<br><br>【live DORMANT · 对照】<br>3) 保持 ≥2h 条件，把页签切到后台再回前台：应允许披毯进睡（live 路径 ≠ 冷启动）。<br><br>【通过标准】冷启动永不「开场即睡」；回前台 live 路径仍可睡。 | 有问题行仍开；历史「修好又失效」（DEV_WORKFLOW_QUALITY §6.7）。契约：onAppReady 禁进睡 / 回前台≥2h 仍披毯——双路径易回归。 | 走查双路径 → 保持失败用例 |
| 9 | earWiggle / 摇耳摸头回 Idle | known-risky | 【前置】产品壳；触发方式以当前好奇池/调试为准（若产品路径难触发，用实验室调试面板播 `earWiggleHeadTouch`，但最终仍要以「回 Idle」观感为准）。<br><br>【序列】<br>1) 播放摇耳/摸头：须见到正放 → 倒放一次 → 约 1s CapCut 溶回闭目 Idle。<br>2) 禁止只停在入库定格、禁止倒放后再正放循环。<br><br>【回流】<br>3) 叠化结束后应稳定在 Idle 呼吸，不闪切。<br><br>【通过标准】pingpong+CapCut 契约肉眼成立。 | 有问题：须正放→倒放→CapCut；易被「入库定格」假验收。与停接的 welcomeBack 同契约族。 | 走查序列 → 契约单测加固 |
| 10 | completionPending 时 Sit 静默 return | known-risky | 【说明】偏门闩体验；若难稳定制造 completionPending，可在达标庆祝/完成反馈刚出现、尚未进完 Reflection 时立刻点 Sit。<br><br>【步骤】<br>1) 走完一场到达完成反馈（Celebrating 或 SessionComplete）窗口。<br>2) 在叠层/完成尚未清完时点 Sit with Yin。<br>3) 期望：Sit **不可点**（禁用/隐藏），或有明确不可用反馈；**禁止**可点但点了完全没反应（静默 return）。<br><br>【通过标准】无「点了没反应」；未就绪即不可用。 | EDGE_CASES #5 仍 P1：门闩挡住但按钮未禁用 → 「点了没反应」体验债（回归锁红线）。 | 补测试（禁用态）+ 小修（另任务） |
| 11 | Visibility 契约 gap-* 行 | known-risky | 【说明】本条偏工程契约；人工用双视口抽查「改壳后显隐是否还对」。<br><br>【步骤】<br>1) 宽屏：Focusing 时 `#focus-hud` 可见。<br>2) 375：Honesty 桥接可见时，Honesty/微仪式入口隐藏。<br>3) Choose 鞠躬后：Companion 三选一须在视口内（尤其 375）。<br>4) Focusing 时热力图按契约隐藏/park。<br><br>【通过标准】宽窄各抽查通过；若只一侧对、一侧错 → 记 gap 回归。 | SHARED_RESOURCES §6 / DOC_CODE_CONTRACT V-gap：桥接藏入口、FocusHUD 宽屏可见、鞠躬后 Companion 视口等未全锁；改 suppress 时易只绿一侧视口。 | 补测试（收 gap） |
| 12 | 场景动画 Dispatcher（欢迎/深夜/好奇互斥） | known-risky | 【前置】产品壳；对照 SCENE_ANIMATION_WIRING。<br><br>【冷启动欢迎 vs 深夜】<br>1) 当日首次打开：可播欢迎池（如 magicBookReading / nodGreeting）；同 tick **不应**再叠深夜茶/哈欠。<br>2) 欢迎已跳过的冷启动，才允许 boot 深夜检。<br><br>【Rise 池 · 已接线】<br>3) Focusing 中 Rise：应出现加权池之一（伸懒腰 / 喝茶 / 看书），不要魔法书/庆祝舞；然后进 Reflection。<br><br>【welcomeBack】<br>4) 页内久无互动：挥手 welcomeBack 目前为空实现属预期，不要当 Bug 重开。<br><br>【通过标准】互斥/池内容符合接线表；异常闪切记反馈。 | 已合 develop；welcomeBack 刻意空实现（2026-08-02）；冷启动欢迎与深夜同 tick 互斥、硬切 vs CapCut 混用——文档多口径，人工多为「待测」。部分覆盖：中途 Rise 加权池（riseStretchCasual/teaDrinking/bookReading）已接线（PR #94 / SCENE_ANIMATIO… | 走查 Slice A/B 表 → 扩 dispatcher 失败用例；Rise 池见接线表 |
| 13 | MilestoneGlow 与 Celebrating 同刻 | known-risky | 【前置】需要接近连续练习里程碑（如 streak-7）。可用实验室/存储注入或真实多日；演示时长可用 `?sessionMinutes=1`。<br><br>【同刻】<br>1) 当日首次计时达标且同时跨里程碑：应优先播 MilestoneGlow（金辉/星石），庆祝戳仍记账；不要同刻双动画打架。<br>2) 非里程碑的当日首次达标：仍应 Celebrating 舞。<br><br>【Honesty 跨节点】<br>3) 若 Honesty 补登跨过里程碑：先 Glow，再桥接。<br><br>【通过标准】只播一档仪式动画；记账与桥接顺序正确。 | 产品已接线；「同刻只播 Glow、庆祝戳仍记账 / Honesty 跨节点先 Glow 再桥接」跨模块时序；TEST_TRACKER 仍待人工；历史曾「已知不挡合并」。 | 走查同刻路径 → 保持 e2e |
| 14 | Companion 点选→开表门闩（含 375 鞠躬） | known-risky | 【前置】产品壳；含 375。<br><br>【主路径】<br>1) Sit → Arrival → Choose → 鞠躬后：须自动/立刻出现 Companion 三选一（Here / Offline / Flow），且在视口内。<br>2) 点 Here 或 Flow：立刻 Focusing（门闩就绪时）。<br>3) Offline：立刻 Focusing，**不得**再出 Notice/Choose。<br><br>【回流】<br>4) Rise 后：hint→Here/Flow 若门闩仍保持，应立刻开表；Sit 仍走完整 Arrival。<br>5) 面板打开时点外侧空白应收起。<br><br>【通过标准】无「鞠躬后没有三选一」；回流不静默。 | 有强 smoke/e2e，但多次「鞠躬后无三选一」回归（L250/L254 族）；arrivalGateReady + stage + 窄宽壳隐式耦合（G-01 高风险契约）。 | 走查回流（Rise 后再选）→ 门闩失败用例已有则保活 |
| 15 | Emotion / playEmotion 返回值常忽略 | known-risky | 【说明】建议后续动作=暂不处理（观察）。非产品走查主项。<br><br>【若抽查】<br>1) 实验室调试面板连播若干情绪：强情绪/hold 期间勿被弱情绪打断。<br>2) 控制台无异常连环错误即可。<br><br>【通过标准】本轮可标「跳过（工程观察）」；发现问题再升级。 | EDGE_CASES #17–19：hold/强情绪 key 散落；新情绪漏登记难查；E-01 未进 docs:check。 | 暂不处理（观察）或补 warn 契约 |
| 16 | main.js 完成路径 / pendingAutoStart* 闭包 | known-risky | 【说明】异常回流走查；大重构暂不处理。<br><br>【步骤】<br>1) 达标自动完成 → Reflection → 答完/Skip all → Idle。<br>2) 未达标 Rise → Reflection → Idle。<br>3) 完成反馈期间勿连点 Sit/⚡ 造成半卡状态；若出现，记录复现步骤。<br><br>【通过标准】两条回流都能回 Idle；无卡死在半开表。 | EDGE_CASES #20–23：完成反馈、自动开表、叠层标志多 writer 历史；批 3 后仍标「可顺带收口」。 | 走查异常回流；大重构暂不处理 |
| 17 | Grow / Milestone.js 等占位 TODO | known-risky | 【说明】建议后续动作=暂不处理（Backlog）。纪念奖励未完整产品化。<br><br>【若抽查（防误解）】<br>1) 确认产品壳没有「假的完整纪念柜/成长养成」入口被当成已上线。<br>2) MilestoneGlow 产品路径（上行）≠ Milestone.js 脚手架 TODO。<br><br>【通过标准】本轮可标「跳过（Backlog）」；勿当缺陷开修脚手架。 | 代码仍 TODO(Task 3) 会话时长/连续天等；与已接线 MilestoneGlowStore 两套叙事并存，易误以为纪念奖励已完整。 | 暂不处理（Backlog）或文档标明「脚手架」 |

---

## 2. 与其它文档

| 文档 | 关系 |
|---|---|
| `DEVELOP_DEBT_INVENTORY.md` | 标签与判定依据 SSOT |
| `TEST_TRACKER.md` | 反馈 / 关单 |
| `DEV_WORKFLOW_QUALITY.md` §6.13 | Focusing×? tip 叠团 · 记入≠开修 |

## 3. 维护

- Numbers 若再改步骤/批注 → **再跑全量同步**写回本 MD（或直接改本 MD 后弃 Numbers）。
- 复测失败 → TRACKER「用户反馈」；禁止只改本表假装已修。

