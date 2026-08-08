# Known-Risky 优先验收清单

创建日期：2026-08-04  
**最近刷新**：2026-08-07（对照 08-04～08-07 产品改动 / 技术方向双轨 / 已完成走查）  
权威路径：`focus-tiger/docs/KNOWN_RISKY_TEST_CHECKLIST.md`  
性质：**人工验收操作步骤**——对应 `DEVELOP_DEBT_INVENTORY.md` §1 `known-risky` 优先批（本表可先行扩列新产品面）。  
基线：验收前须 `git pull` 到当时 `origin/develop` tip，并跑 `npm run check:branch-freshness`（behind 须为 0 才可关单级验收）。

> **SSOT**：仅本 MD。  
> **不权威（勿当验收依据）**：同目录 `known-risky-test-checklist.csv`（历史薄导出，允许过期）。仓库根 `KnownRisky测试清单.numbers` 已于 **2026-08-05** 删除。  
> 批注与步骤只改本 MD；关单仍写 `TEST_TRACKER.md`。

---

## 0. 怎么用

| 问题 | 答案 |
|---|---|
| 开始测产品，优先测什么？ | **本表**（先做 §0.1 优先批，再扫全表） |
| 状态标签 / 判定依据？ | 仍看 `DEVELOP_DEBT_INVENTORY.md` §1；步骤以**本 MD**为准 |
| 关单写哪？ | `TEST_TRACKER.md` 对应行（书面反馈进「用户反馈」列） |
| 步骤里的 `【***测试OK】`？ | **走查批注**（写在本 MD）；不等于 TRACKER 关单 |
| CSV？ | **不权威**；不要对照 CSV 验收或改步骤（根目录 Numbers 已删） |

**公共前置（每条默认）**：`cd focus-tiger && npm run dev` → Safari `http://127.0.0.1:5173/?product=1`（窄屏 375×667）。

### 0.1 2026-08-07 起 · 建议优先顺序

| 优先 | # | 为什么现在先测 |
|---|---|---|
| **P0** | **18** Arrival CapCut 闪白 | `TEST_TRACKER` **release-blocker**（2026-08-06）；Notice→Breath / Choose→鞠躬 |
| **P0** | **2** Honesty 补登主路径 | 仍「有问题」开放；与 #3 桥接关单分离 |
| **P1** | **19–21** Breath 左球 / Focus 时长 chip / 吹花欢迎 | 08-06 新产品面；代码已合，关单级人工未齐 |
| **P1** | **14** Companion 开表（含时长 chip） | 门闩高回归 + 开表前多一步 chip |
| **P1** | **22–23** Zen Cinema / Quiet Line | 增长①③已合；待 tip 关单 |
| **P1** | **25** Tip Jar **任务 5 部署** | SSOT = `focus-tiger-cloud.ihiro.workers.dev`（Webhook/secrets 已有）；**须**把 #181 新 Price ID redeploy 到该 Worker |
| **P2** | **4–8、12–13、24** Ambient / Hints / DORMANT / Dispatcher / Glow / 星光斗篷 | 旧债或邻接易回归 |
| **P2** | **25 UI / #26** Tip 卡观感 · Sanctuary 脚手架 | A UI 可测；B 仅 gate——测边界，勿当完整付费完成 |
| **可跳过本轮** | **1、3、10、11** | 已 **verified**（改壳/叠层时再复测） |
| **可跳过本轮** | **17** Grow 脚手架 | Backlog；防误解抽查即可 |

### 0.2 相对 08-04 清单的产品语义变更（测前必读）

| 旧口径（易测错） | 现口径（2026-08-06+） |
|---|---|
| 左球 = Quick Start（立刻 Focusing） | 左球 = **Breath practice** → 时长 chip（1/3/5/10/20）；正式 Focus 仍走 **Sit → Arrival** |
| Companion 点选 → 立刻 Focusing | Companion 点选 → **先**出 Focus 时长 chip **15/25/45/60** → 再 Focusing（`?sessionMinutes=` 仍可跳过） |
| 抽屉 / ⋯ 有「一分钟呼吸」行 | **已去重**；呼吸入口只在左球 |
| 欢迎池仅书/点头 | Day1 / ≥3 日久别可 **吹花 + 头顶气泡**（压过 wellness 斗篷）；同日 XOR |
| 付费未定 | **双轨已锁**：A Buy Yin a Tea（不解锁内容）+ B Yin's Sanctuary Lifetime（真 entitlement）；②B 电子书**已取消** |
| 壳 = Electron/Tauri/PWA 三选一即将定 | **v1 默认纯 Web**；桌面壳**仍开放**；**可选 PWA 基础层**（`feature/pwa-basics`：manifest + network-only SW + 品牌图标已入库；**安装体验待人工验收**）。桌面壳选型仍开放，见技术方向 Brief |

---

## 1. 清单

| # | 功能/交互点 | 状态标签 | 需要的具体测试操作步骤 | 判定依据（摘） | 建议后续动作 |
|---|---|---|---|---|---|
| 1 | Idle 窄宽 chrome 总验收（三球 / ⋯ / 抽屉） | verified | 【前置】`cd focus-tiger && npm run dev` → Safari 打开 http://127.0.0.1:5173/?product=1；验收前确认本机已 `git pull` 到 origin/develop tip。<br><br>【宽屏 ≥900】<br>1) Idle：见宽屏三球（**左=Breath practice** · Sit · Honesty）+「⋯」，不是旧 Sit+⚡ pill。 【***测试OK】**（08-04；左球文案 08-06 已改，改壳时复测文案）<br>2) 点「⋯」：应代理 Honesty / How / Sound / 提醒 / **Zen Cinema / Quiet Line / Tip Jar** 等；行内若有脉冲点，点开文案不得误绑成「Tap to sit with Yin」。【***测试OK】**（原代理项）<br>3) 点 Sit → Arrival → Choose → Companion → **时长 chip** → Focusing；见 Focus HUD。【***测试OK】**（开表主链；chip 见 #20）<br>4) Rise → 回 Idle，壳仍正常（三球+⋯）。【***测试OK】<br><br>【窄屏 375×667 · Safari 响应式】<br>5) Idle：主画布三球 + 底栏抽屉；无宽窄双壳叠点。【***测试OK】<br>6) Sit → Arrival：Arrival 开着时 Sit 应隐藏；Breath 阶段勿再露主 Sit。【***测试OK】<br>7) Focusing 时点 ? / tip：375 主 tip + N-more 不叠团。【***测试OK】** tip `0494dd6`<br>8) 窄屏 Hints：**产品延期**维持现状（08-04）。<br>9) Companion/How 打开时 375↔480：面板不得被误关。【***测试OK】<br><br>**2026-08-04 关单**：Task3 **已通过**。改左球/⋯ 菜单后做**烟测**即可，勿整表重开除非壳大改。 | TEST_TRACKER Task3 **已通过**（2026-08-04） | 改壳 / ⋯ 增项时烟测 |
| 2 | Honesty Check-in（Idle 补登主路径） | known-risky | 【前置】产品壳 `?product=1`；可用实验室「重置全部本地状态」做干净开局。<br><br>【主路径】<br>1) 冷启动 Idle：闭目坐禅（不是睡着）+ 可点 Honesty / Mindful Check-in。<br>2) 点 Honesty → 选时长（如 10 或 20）→ 呼吸引导。<br>3) 呼吸进行中看底栏：应 **keepQuickStart**（现左球=Breath practice 可见策略按契约）——**不得**仍露满排三球挡流程。<br>4) 呼吸结束 → 成功 toast（「别处的静心，也算数」类）+ 桥接 CTA 同屏可读。<br><br>【回流】<br>5) 同日再走一遍 Idle Honesty → 呼吸 → toast + 再出桥接。<br><br>【?】<br>6) Honesty 时长面板打开时点左下「?」：现产品面应收窄为**简介 only**；不得指虚空喷 tip。<br><br>【通过标准】补登能记账；呼吸期 chrome 正确；? 不指空乱喷。 | 曾人工 OK + 真实链 e2e；2026-08-01 重回「有问题」：呼吸期底栏仍三球、? 锚虚空等。**与 #3 桥接关单无关**。 | **优先走查** → 补 chrome/叠层 e2e |
| 3 | Honesty 桥接 CTA | verified | （步骤同 08-04 关单稿；略）375 桥接三球 suppress + Yin zoom + Yes/No — **已通过** tip `3ea79b9` / `a76178f`。 | TEST_TRACKER 桥接行 **已通过** | 改桥接/叠层时复测 |
| 4 | Ambient Soundscape + 右上音符静音 | known-risky → **待 tip 关单** | 【前置】产品壳；重置后默认应无音乐（opt-in）。<br><br>【已走查 OK 的步（08-04～08-06）】宽屏悬停开清单 / 静音续播 / Off 不续播 / 窄屏尺寸不放大 / Focusing 可见清单 / Rise 停播 / 刷新偏好 —— 多轮 **测试 OK**；邻接 UX（Rise 后曲目高亮、断点续播、面板靠右、每曲 Play/Pause）**2026-08-06 tip 关单**（`ae6eca2`）。mint 脉冲 Hint **PR #156 tip 关单**。<br><br>【仍须盯】<br>1) 与 **Breath practice** 共用氛围：呼吸 ephemeral 停播后，Sit→Focus 选曲仍可闻、pref 非 Off（见 #19）。<br>2) 用户上传曲（配额/删除）与内置 12 曲交叉。<br><br>【通过标准】听感主路径不回归；Breath/Focus 音乐互不污染。 | 行为契约大体 OK；KnownRisky 行尚未正式改 verified（缺本表书面关单批注）。TRACKER mint 行已通过。 | **本表批注关单**或并入 TRACKER 后改 verified |
| 5 | 「本周陪伴」热力图 UI | known-risky | 步1–4（星期缩写/今日描边/亮格/Focusing park）**测试 OK**；今日标记合 `dc415d7`，用户**免 tip 复验**。<br>步5 weekly tip 尖角：**测试不行** → 并入 #7 Hints 再设计。 | 壳/数据 OK；Hint 几何挂再设计 | Hints 再设计；本条勿单点硬修 tip |
| 6 | 应用内提醒设置 + 横幅 | known-risky | 【设置】时钟入口 → 设即将到点 → 存/清。<br>【横幅】到点+今日未练 → gentle 横幅；忙碌 **suppress**；刷新再出须盯。<br>【邻接】横幅×鹦鹉信使（场景 A）曾 tip OK；回落叠化 tip `0494dd6` OK。 | TRACKER 仍「有问题」（软提示/面板语义等历史缺口） | 走查 → 按缺口补测或关子项 |
| 7 | Onboarding Hints · 脉冲悬停 + ? 简介 | known-risky | **产品面（08-04 收窄）**：只验 (1) 脉冲悬停 tip、移开即没；(2) ? 只出产品简介 / **Privacy 相关**（08-07 #163 可能已刷新文案），无本页 tip 喷洒。<br>weekly tip 几何：**再设计**（暂缓单点硬修）。 | 运行时已收窄；整体再设计批次；护栏试点 ≠ 关单 | 产品再设计 Brief 后再开修 |
| 8 | 冷启动「开场即睡」vs live DORMANT | known-risky | 【冷启动】硬刷新：须 Idle 闭目，**不得**立刻披斗篷（白天）。<br>【live】≥2h 切后台再回：允许披毯进睡。<br>【叠加 · 星光 wellness 2A】≥23 或 &lt;06 冷启动可 forceDormant；06–10 苏醒仪式；**吹花 Day1 须压过**斗篷（见 #21）。 | 双路径易回归（§6.7）；与星光/吹花交叉 | 走查三路径（白天冷启 / 深夜 / 吹花压过） |
| 9 | earWiggle / 摇耳摸头回 Idle | known-risky | 正放 → 倒放一次 → ~1s CapCut 回 Idle；禁入库定格假验收。 | TRACKER「有问题」 | 走查序列 |
| 10 | completionPending 时 Sit 静默 return | verified | Sit 在 pending 时须 disabled；e2e 已锁。 | 批 4 已修 | 改完成反馈时复测 |
| 11 | Visibility 契约 gap-* 行 | verified | `listVisibilityLockGaps()` 空；改 suppress 跑 visibility e2e。 | 批 4 收口 | 改壳时跑 visibility |
| 12 | 场景动画 Dispatcher（欢迎/深夜/好奇互斥） | known-risky | 冷启动欢迎 vs 深夜互斥；Rise 加权池（伸懒腰/茶/书）；`welcomeBack` 空实现属预期。<br>**新增**：吹花欢迎进 WELCOME 池（#21）——同日 XOR、压 wellness。 | 人工多为待测；Rise 池已接线 | 走查 Slice 表 + 吹花交叉 |
| 13 | MilestoneGlow 与 Celebrating 同刻 | known-risky | streak-7：只播 Glow（蝴蝶/鹦鹉 50/50），庆祝戳仍记账；Honesty 跨节点先 Glow 再桥接；21/100 星石。 | 产品已接线；TRACKER 待人工 | 走查同刻（可用实验室清节点） |
| 14 | Companion 点选→开表门闩（含 375 鞠躬 + **时长 chip**） | known-risky | 【主路径】Sit → Arrival → Choose → 鞠躬后 Companion 三选一在视口内 → 点 Here/Flow/Offline → **见 15/25/45/60 chip** → 点选即 Focusing。<br>【Offline】跳过 Arrival 后仍应出 chip（除非 `?sessionMinutes=`）。<br>【回流】Rise 后 hint→Here/Flow：门闩保持则立刻到 chip/开表；Sit 仍走完整 Arrival。<br>【375】鞠躬后三选一须在视口内。 | 多次「鞠躬后无三选一」回归；现多一步 chip 易漏测 | **优先走查回流**；保活门闩失败用例 |
| 15 | Emotion / playEmotion 返回值常忽略 | assumed-ok | 非产品走查主项；hold key SSOT 已部分收口。 | EDGE 部分 | 新情绪漏登记再升级 |
| 16 | main.js 完成路径 / pendingAutoStart* 闭包 | known-risky | 达标 / 未达标 Rise → Reflection → Idle；完成反馈期勿连点 Sit/左球造成半卡。 | EDGE #20–23 | 走查异常回流 |
| 17 | Grow / Milestone.js 等占位 TODO | known-risky | 确认无「假完整纪念柜」；MilestoneGlow ≠ Milestone.js 脚手架。 | Backlog 两套叙事 | **本轮可跳过** |
| 18 | Arrival CapCut 抗闪（Notice→Breath / Choose→鞠躬） | known-risky · **P0** | 【主路径】Sit → Notice 任选 → 切入 Breath 微笑 **约 1s 叠化、无闪白** → Choose 任选 → 鞠躬切入与回落 **无闪白**。<br>【回流】Rise 后再走一遍 Arrival。<br>【分列】Notice 后眨眼；Choose→鞠躬；鞠躬→Idle/Companion —— 三条分开记。 | **release-blocker** recorded=2026-08-06；本地修 `clear:false` + freeze；须 tip 复测。自动化不锁像素。 | **优先人工复测** → TRACKER 关单 |
| 19 | 首页 Breath practice 左球 + Extended Breath | known-risky | 【左球】Idle 宽+375：文案/aria 为 Breath practice；点开 → chip 1/3/5/10/20；**不是**立刻 Focusing。<br>【抽屉/⋯】不得再出现 Breath / 一分钟呼吸行。<br>【Arrival 开着】点球 → 取消 Arrival 再开 picker。<br>【Extended】选时长 → 吸呼+乐+toast+轻完成+Reflection；Leave 不记账；后台回前台墙钟满须完成。<br>【音乐回归】呼吸结束后 Sit→Focus 选曲可闻；Rise 停播；不得把 ambient-pref 改成 Off。 | 08-06 多轮书面 OK（含 tip `656dc50` / `3a782ff`）；关单级仍认 develop tip；presence 光效可选。 | tip 批注关单 / 与 #4 交叉 |
| 20 | Focus 开表前时长 chip + HUD 目标标注 | known-risky | 【chip】Companion 后见 **15/25/45/60**（与 Breath 档位差异化）→ 点选 Focusing；Leave 取消不开表。<br>【HUD】`#hud-time` 下淡字本场总时长（如 `15 min`）；Rise 后隐藏；en/ja。<br>【e2e】`?sessionMinutes=N` 跳过 picker——**产品无 query 路径须人工点 chip**。 | 08-06 feature tip 书面基本 OK；关单须 develop tip | tip 关单 |
| 21 | 吹花欢迎冷启动（Phase 2b/2c） | known-risky | 【Day1】清 `flower-welcome` + `scene-anim-daily` → 硬刷新 → 吹花+头顶白玉气泡（含深夜——**压过** wellness 斗篷）。<br>【同日再刷】不得再吹花/书/点头欢迎。<br>【久别 ≥3 日】再吹花；文案尽量不连同句（2c）。<br>【375】气泡完整在 ActionBar **下方**。<br>【`?flowerWelcome=0`】永不吹花。 | Phase 1–2c 已合；多轮 feature tip OK；关单级 develop tip 分列仍开 | tip 分列关单 |
| 22 | Zen Cinema（增长①） | known-risky | Idle → ⋯/抽屉 **Zen Cinema** → 确认卡（缩略图+片名）→ Watch 开系统浏览器 YouTube；Not now 关。<br>回流：关后再开；Rise 后再开。375 卡不挡主球。<br>**禁止** Reflection 边缘入口、App 内嵌播放器。 | PR #148 已合；TRACKER 待人工 | 走查 → tip 关单 |
| 23 | Quiet Line / 今日静语存图（增长③） | known-risky | Idle → ⋯/抽屉 **A Quiet Line** → 见当日金句 → Save image 下 PNG（文件名含日期）；同日再开句不变。<br>回流同 #22。375 不挡主球。<br>**禁止**一键社交分享卖点、soft-schedule、中文产品金句。 | PR #153 已合；TRACKER 待人工 | 走查 → tip 关单 |
| 24 | 星光斗篷 v5 + wellness 2A（50/50） | known-risky | DORMANT / Honesty 睡醒：classic vs starlight **约各半**且入睡/苏醒变体匹配。<br>Wellness：深夜 forceDormant / 清晨苏醒 / 白天禁 2h 开场即睡。<br>睡循环：经典 034→030 / 星光 067→063 @2fps；背部微鼓观感曾反复修。 | TRACKER 待人工；实验室多轮；产品 50/50 路径仍待测 | 走查产品路径 + 与 #8/#21 交叉 |
| 25 | Buy Yin a Tea / Tip Jar（A） | known-risky | 【UI】⋯/抽屉见 **Buy Yin a tea** → `#yin-tip-jar-card`；关卡回流；**不**解锁 Sanctuary/氛围。<br>【**任务 5 · 部署**】**SSOT**：`https://focus-tiger-cloud.ihiro.workers.dev`（Stripe Webhook 已指此；secrets 已在）。**勿**用今日误建的 `*.focus-tiger.workers.dev`。<br>【下一步】redeploy #181 新 Price ID 到 **ihiro**（现 Checkout：inactive price）。本地 `VITE_CLOUD_API_BASE_URL` → ihiro。<br>【验收】Test 卡 → `?tip=1`；verify-tip；零耦合。 | PR #161 UI；#181/#182 仓库配置；**ihiro 尚未吃到新 Price** | **redeploy → ihiro** 后验收款 |
| 26 | Yin's Sanctuary Lifetime（B） | known-risky · **脚手架** | 【现状】`sanctuaryEntitlementGate` + 零耦合单测已合（#162）；**尚无** Unlock UI / Stripe Lifetime / 氛围·动画消费。<br>【抽查】产品壳不得出现「已买断全库」假完成入口；Ambient 不得读 tip 状态解锁。<br>【通过标准】本轮可标「脚手架已知」；完整产品路径 **未实现** → 勿关单为已完成。 | Brief + `YIN_SANCTUARY.md`；Next=Checkout+UI+消费 | 排期 B 实现后再扩步骤 |

---

## 2. 与其它文档

| 文档 | 关系 |
|---|---|
| `DEVELOP_DEBT_INVENTORY.md` | 标签与判定依据 SSOT（本表 #18–26 为产品扩列，债务清单可随后对齐） |
| `TEST_TRACKER.md` | 反馈 / 关单 |
| `task-briefs/task-tech-direction-v1-shell-monetization.md` | v1 纯 Web / 双轨付费 / **可选 PWA 基础层**（图标已入库；安装待人工验收） |
| `DEV_WORKFLOW_QUALITY.md` §6.13–§6.15 | Focusing tip 叠团 · Arrival CapCut |

## 3. 维护

- 复测失败 → TRACKER「用户反馈」；禁止只改本表假装已修。
- 新产品面合入后：若属高回归 / 曾「有问题」/ release-blocker → **先加本表行**，再考虑是否回写债务清单 §1。
- 已 verified 行改壳后：优先 **烟测**，勿无故整表重开。

## 4. 变更摘要（2026-08-07）

| 动作 | 项 |
|---|---|
| 维持 verified | #1 Idle chrome · #3 桥接 · #10 Sit pending · #11 visibility gap |
| 步骤语义更新 | #1/#2/#14/#16（Breath 左球、Focus chip、⋯ 增项） |
| 判定刷新 | #4 Ambient（多轮 tip OK，待本表关单）· #5/#7 Hints 再设计 |
| **新增** | #18 Arrival 闪白 P0 · #19 Breath · #20 Focus chip/HUD · #21 吹花 · #22 Zen Cinema · #23 Quiet Line · #24 星光斗篷 · #25 Tip Jar · #26 Sanctuary 脚手架 |
| 明确非本表「壳已定 PWA 为最终桌面交付」 | 见 §0.2：v1=纯 Web；桌面壳仍开放；可选 PWA = **Add to Home Screen 基础层**（非桌面壳定案） |
