# 坐禅小老虎 · 项目组织与协作流程
# Focus Tiger · PROCESS.md

本文档记录开发组织纪律。完整协作约定（角色分工、Task Brief 书写规范、文档更新规则、日常协作流程）见 **COLLAB.md**。

权威文档索引另见：`PRODUCT_POSITIONING.md` / `MVP_PRODUCT_DEFINITION.md` / `PRINCIPLES.md` / `ARCHITECTURE.md` / `DESIGN.md` / **`RESPONSIVE_LAYOUT.md`** / `EMOTION_BIBLE.md` / `CHARACTER_BIBLE.md` / `TASKS.md` / `TEST_TRACKER.md` / **`DEV_WORKFLOW_QUALITY.md`**（如何改善开发工作流来保证开发质量）/ **`EDGE_CASES.md`**（静默失败与边角观察册）/ **[`SILENT_BEHAVIORS.md`](./SILENT_BEHAVIORS.md)**（设计上就该没反应的白名单）/ **[`INTERACTION_FEEDBACK_PRINCIPLES.md`](./INTERACTION_FEEDBACK_PRINCIPLES.md)**（点击接收反馈 vs 结果反馈；`RULES_INDEX` → `interaction-feedback`）/ **`DEVELOP_DEBT_INVENTORY.md`**（存量验证债务）/ **[`KNOWN_RISKY_TEST_CHECKLIST.md`](./KNOWN_RISKY_TEST_CHECKLIST.md)**（known-risky **优先人工验收步骤**）。**规则主题 → 唯一权威来源**见 **[`RULES_INDEX.md`](./RULES_INDEX.md)**。**产品 z-index 登记**见 **[`Z_INDEX.md`](./Z_INDEX.md)**。**Git 分支与合并门禁**见仓库根目录 **[`WORKFLOW.md`](../../WORKFLOW.md)**（`main` = 稳定可发布，`develop` = 日常开发；**SemVer / 稳定 tag** 见同文件「语义化版本与稳定发布点」，`RULES_INDEX` → `git-semver-release`）。**预览浏览器与能耗**见 [`.cursor/rules/focus-tiger-browser-energy.mdc`](../../.cursor/rules/focus-tiger-browser-energy.mdc)（`RULES_INDEX` → `browser-energy`）。**本地 Cursor 高能耗（索引 / 并行 Agent / Cloud）**见下文「本地 Cursor 能耗」。

---

## 回归锁工作法（2026-07-19 · 方法级强制；2026-07-20 增补「防改坏」；2026-07-22 升格 §7「AI 修复验收规范」）

> **叙事全文**：`DEV_WORKFLOW_QUALITY.md`（原则 / 规范 / 指引 / 注意事项；两次讨论整合，后续可逐步完善）。  
> **背景**：两类事故反复出现——（1）「上次已修 → 再测又无正确效果」（假修好）；（2）「重写编排/转场后，原先已好的观感坏了」（把好的改坏，例 Idle 眨眼闪一下）。  
> 常见根因不是神秘回滚，而是 Agent **只验 Happy Path、门闩静默失败、无保护面重写、修复长期未 commit**。  
> 完整门禁见 `.cursor/rules/focus-tiger-regression-lock.mdc`（alwaysApply）。  
> **Bug close 口径**：§A–C = 研发收尾；**声称「已修复」以 §D（= `DEV_WORKFLOW_QUALITY.md` §7）为准**——本地 commit / 本地冒烟绿 **不等于** 修复完成。

### A. 防假修好（交互修复收尾）

1. 主路径 + **至少一条回流路径**（Rise 后再进、叠层后再开、同日第二场等）  
2. 用户可点控件不得对应逻辑静默 `return`（未就绪则禁用）  
3. 门闩类失败用例 + **确认修复 bug 须留回归锚**（不限门闩；无法自动化 → TEST_TRACKER 人工锁）  
4. 同主题 TEST_TRACKER 行步骤不得互斥  
5. 声称修好前先跑 **`npm run test:smoke` 与 `npm run test:e2e`**（不过不得声称修好；全绿 ≠ 序列观感通过；**禁止**仅用「已绿」总结句——须附命令与 pass/fail 或 CI 链接）  
6. **本地 commit / 汇报 / push / 禁自动合 main**：见 `.cursor/rules/focus-tiger-regression-lock.mdc`「Commit 汇报与分支门禁」（`RULES_INDEX` → `git-agent-commit`）；**不在此复述**  
7. **相关项目文档同批纳入（N15）** 与 **「待你决定 / 待你知道」（N14）**：见同上 regression-lock / `DEV_WORKFLOW_QUALITY.md`。列多个方案时须给最合理项：`RULES_INDEX` → `recommend-most-reasonable`

### B. 防把好的改坏（重写 / 改转场开工必做）

1. **改前列「已好清单」**：用户或文档已认可什么（例：呼吸→眨眼不闪、Sit 不打开 Honesty）。改完逐条自检；写不进单测的进 TEST_TRACKER 必测回归。  
2. **重写 ≠ 从零设计**：换实现须**继承**旧观感契约（不闪、不硬切、溶解期定格、顶点停留等），除非任务书明确「允许牺牲某某」。  
3. **单测锁契约、不锁实现细节**（例：眨眼切入必须 `crossFade + freezeUntilCrossFadeEnds`）。  
4. **任务声明保护面**：开工回复 / Task Brief 写清本次保护面（不动 / 必须复测的邻接体验）。一次一任务管改动范围；保护面管别踩坏邻接。  
5. **新增 `position: fixed` 全屏/半屏容器**：须检查是否遮挡/截断既有浮层（Reminder / 横幅 / tip 等），并给受影响组件补 **375 e2e**——不能只测新壳。权威条款与 Bug1/Bug2 教训见 **`TEST_TRACKER.md` 文首**「`position: fixed` 全屏/半屏容器 ↔ 既有浮层」。

### C. 高风险面（门闩 + 序列衔接）

触及门闩/叠层/Sit·Rise **或** Idle 呼吸↔眨眼、`play()` cross-fade、Choose/Rise 叠化、pingpong 顶点停留时，默认高回归风险，须显式复检。清单以规则文件为准。

**禁止**：用「单元测试绿了 / 我改过了」代替回流验收与已好清单；禁止在未过门禁时写「已修好」；**禁止**在未完成 §D checklist 时写「已修复」。

### D. AI 修复验收规范（Bug close · 2026-07-22 · 强制）

> 叙事全文：`DEV_WORKFLOW_QUALITY.md` §7。与 §A 并行：**§A = 研发收尾最低线；§D = 向用户声称 Bug 已修复的充分必要条件**。

1. **人工复测**仅作体验确认，不能作唯一正确性证据；用户可感知 Bug 须有自动化断言 DOM/界面文本等可见状态  
2. **「已绿」须可验证**：附实际命令 + 原始 pass/fail，或 CI run 链接；禁止自然语言自证  
3. **新增回归用例须红绿对照**：修复前必失败（附输出）→ 修复后必通过；Bug 存在时不失败 → 重写用例  
4. **push + CI 是声称已修复的硬性前提**：须 commit hash + 远端分支名 + CI 状态/链接；本地 commit 不算修复完成  
5. **文档口径须与覆盖层一致**：「已自动化/已覆盖/已锁住」须标明单元/集成/用户链路；同步核对 `SCENARIO_TESTS.md` / `TEST_TRACKER.md`  
6. 报告「已修复」时回复须含 **「Bug 修复验收（§7 checklist）」** 五项；任一项「未完成」→ 不得写「已修复」

**一句话**：防假修好靠回流路径；防把好的改坏靠「改前不变量 + 重写继承契约 + 衔接进高风险表」；**Bug close 靠 §7 五证（红 / CI 绿 / push / 文档口径 / 人工体验确认）**。

---

## 当前进度速览

> **维护规则**：每次完成具有实质性进展的 Task（不含纯粹的 debug / 微调）后，主动更新本速览对应部分，尤其是「已完成功能」「下一步计划」；若产生新的「待确认事项」，同步补入列表。本章节置于靠前位置，便于新对话快速对齐，无需每次加载全部文档。

**最后更新时间**：2026-08-15（UTC+8） · Enso 改页面左下角 + Membership 订阅授章

**当前技术路线**：主线为 **2D PNG 序列帧动画**（素材来源：图生视频 + 抽帧，见 `ARCHITECTURE.md`）；既有 **3D 多姿态 GLB** 资产与 `PoseManager` / `DynamicMotion` 等代码**完整保留**，改用于未来「奖励系统」塑胶公仔展示，不再作为主界面情绪表现载体。

**近期落地（待人工测试）**：

- **Membership 订阅授章（2026-08-15 · `fix/membership-prestigious-badges`）**：订阅 confirm 后 Idle 右侧 `#yin-tip-kindness-badges` ≥3 枚尊贵章（`lifetime∪subscription`）；**不**把 Sanctuary Lifetime SKU 标已买。TRACKER 待人工。

- **Quiet Line Save image 明信片（2026-08-15 · `fix/quiet-line-save-postcard`）**：下载 PNG 改为上图下字（当日图库静帧 + 暖纸金句）；不再导出暗紫纯文字卡。TRACKER 待人工。

- **Sanctuary Enso 改页面左下角（2026-08-15 · `fix/enso-mark-bottom-left`）**：不再钉蒲团中央。宽屏真左下角约 52px；375 约 44px、抬到三球之上。装饰层（`pointer-events: none`）。TRACKER 待人工。
- **Wellness 免责改「?」查阅 + Enso 再缩（2026-08-15）**：冷启动**不再**自动弹出「Not therapy or medical care」；点「?」简介卡仍见同一免责。Enso 曾缩到蒲团可见径约 10%；**随后用户改口挪到页面左下角**（见上行）。TRACKER 待人工。
- **菜单订阅 CTA（2026-08-15 · #296 已合）**：未解锁进阶仪式时，⋯ / 抽屉在 Stay in touch 下出米色 **Subscribe for more scenes**（点开 Membership 卡）；已解锁则为普通钮 **You're subscribed**（同样打开 Membership 卡）。邮件留资提交后改称 **We'll keep in touch**，避免与付费订阅撞车。不恢复 Tea/Sanctuary 三项目录。TRACKER 待人工。
- **Stay in touch 卡面（2026-08-15 · #295 已合）**：除 known-error 修复说明外，留邮箱也会收到更好的最新版（latest release）说明；仍非推销名单。欢迎信定稿不改字。TRACKER 待人工。
- **Wellness 免责 · 非诊疗（2026-08-14 · #293 已合）**：文案含 medical device / 非诊疗 + diagnose/treat/cure/prevent；Privacy Sheet 交叉引用。**2026-08-15**：默认落点改为「?」，不再冷启动弹窗。
- **朴素顿悟 Phase 1 · Quiet Line 洞察种子（2026-08-14 · #292 已合）**：经典金句 ∪ **14** 句生产种子（`INSIGHT_1`–`14`）混合抽取；新 key `focus-tiger.daily-zen-quote-pool-v2.v1` 同日锁；当场打开顿悟向句时 Journey Log 静默 `insightSpark` 小符号。**不做** Whisper / Recover toast / Reflection 三问 / 徽章耦合。候选 #6 天气备选仍不上。TRACKER 待人工（375 换行 + 符号）。
- **GitHub 默认分支改为 `develop`（2026-08-14）**：Cloud / 新 clone / 新 PR 默认 base / Dependabot / `schedule` YAML 均跟 `develop`。`main` 仍是发布线（合入须明确下令）。夜间全量 e2e 不再需要为 cron 把 workflow 同步到 `main`。权威：`ENV_CONFIG.md` §3。
- **Git 合入与人工测试解耦（2026-08-14）**：任务完成后本机/Cloud 默认 push 旁支 + 开 PR；CI 绿即可合 `develop`；TEST_TRACKER 保持「待人工测试」；口令「批量人工测试」出模块清单；生产 Worker 仍须明确「部署」。权威：`WORKFLOW.md` + `git-agent-commit`。
- **场景 Z 0–1s（2026-08-14）**：先补开卡句，再补运行时 `:active` 按压（⋯/抽屉 Journey 行、Compass 芯片、关钮/备份链）。列表行只读（Daily Card 未接线）。#292 已加静默 `insightSpark` 小符号。S/T/W 仍未补。
- **FB-01 冷却微点头（2026-08-14）**：冷却期内再点阿寅 → `nodBowMicro`（比完整 nod-bow 幅度更小，无 toast、不延长冷却）。SB-07 = 邀请隐退 + invisible hit 仍在。场景 D 补 Honesty/桥接 0–1s 句。S/T/W/Z 未一次补完。
- **点击反馈 follow-up（2026-08-14）**：存量 0–1s 补句改优先级表（禁「随改写再补」）；P0 已写 Q/U/X。SB-07 收窄为专用触点隐退；冷却期内再点阿寅列为 **FB-01**（待补接收反馈，非白名单）。无运行时。
- **点击反馈原则 + 沉默白名单（2026-08-14）**：`INTERACTION_FEEDBACK_PRINCIPLES.md` 与 `SILENT_BEHAVIORS.md` 入库；PR 模板 / Cursor 规则须答「点击后 0–1 秒内看到什么」；不在白名单的沉默测试时当 bug。索引 `interaction-feedback`。无运行时改动。
- **体验 Bugs 叠层（2026-08-14 · #283 已合 tip `b027f3d`）**：Journey 备份点选须有发送/开启提示；Enso 缩小约 40% 贴住蒲团；⋯/抽屉去掉与右上重复的三项付费；Five Moments 单行可点跳转；Quiet Line 用动画静帧作底；Stay in touch 强调邮箱可达；仪式 Continue/Leave 同款钮；Sanctuary marks 改右侧。TRACKER 待人工（关单须 tip `b027f3d`）。
- **Stay in touch · 真实 Resend（2026-08-13 · #280 已合）**：Cloud 配好时 `createWorkerNewsletterProvider` → `POST /api/newsletter/subscribe`（`NEWSLETTER_KV` 自建名单 + 欢迎信 `waitUntil` + 退订 GET/POST）。无 Cloud / `?newsletterMock=1` 仍 mock。欢迎文案 + 第一封群发草稿（未接线）见 `NEWSLETTER_CAPTURE.md`。TRACKER 待人工（`NEWSLETTER_KV` 已建；**redeploy 暂缓**，待 Resend 真实发信测通）。
- **Focus 间隔磬 + 觉察卡 · 安全路径（2026-08-13 · #278 已合 tip `41e9748`）**：节奏 off/3/5（默认 off）；底部觉察句 + 独立开关；cues 短磬不接 Gate。TRACKER 分列待人工（关单须 tip `41e9748` 或更新后的 develop tip）。
- **Focus 计时开始/结束提示音（2026-08-12 · #275 已合 tip `0d05b10`）**：`session-start-bell` / `session-end-chime`；Soundscape「计时提示音」；duck 35%。TRACKER 待人工（产品自排）。
- **练习记忆云端快照备份 A（2026-08-12 · #272 已合 tip `a195584`；矩阵 #273 tip `ef5ff3e`）**：6 key 整包；OTP 身份；关闭=删云端；生产 Worker Version `f9755950-49c9-4677-99d6-76fd2d9d7012`。**2026-08-13**：生产已补 `RESTORE_OTP_PEPPER` + `RESEND_API_KEY`；用户书面 practice-backup OTP 收到码且 Enable 成功。TRACKER 仍待人工（空库恢复 / 关备份删云端；非关单）。
- **练习记忆云端策略拍板（2026-08-12 · #266 已合 tip `4698348`）**：A **免费**快照备份/恢复优先（防 Safari/ITP 等本机静默清库）；B **付费**多端无缝同步可后排；身份 **唯一复用邮箱 OTP**（一套身份、两种用途；不做 device id 跨端）。首版备份/恢复、非实时双向同步。未绑邮箱 = 无云端兜底 + 须温和提示。权威：`FREE_PAID_MATRIX` 两行 + 下文 Backlog「练习记忆云端备份」。运行时见上行 #272。
- **意愿漏斗 opt-in 回传（2026-08-12 · #262 已合 tip `582e79f`）**：Privacy 明示同意；默认关；匿名 counts → Worker；不挡支付。TRACKER 待人工。
- **Ambient Deep 15s 试听（2026-08-12 · #258 已合 tip `2b3db1c`）**：未授权 Deep → 定时试听 + fade；结束后可忽略 Unlock 提示；不持久 preferred=deep。TRACKER 待人工。
- **意愿漏斗本地统计（2026-08-12 · #255 已合 tip `fea9c11`）**：Support→CTA→Checkout→完成；仅本地；实验室可读。**opt-in 回传见上行 #262**。
- **芥子须弥方金章素材（2026-08-12 · #256 已合 tip `5440a53`）**：独立方章替换 tip 复用。
- **Web 轻量版本更新提示（2026-08-12 · #263 已合 tip `38edfe0`）**：仅发现新版本时左下轻提示 → 点一下刷新；非补丁包。Brief `task-web-soft-update-prompt.md`。TRACKER 待人工（`?forceUpdatePrompt=1`）。
- **Sanctuary Enso Mark 接线（2026-08-12 · #254 已合 tip `0adc0d3`）**：蒲团正面金石圆相；`lifetime∪subscription`；Focusing 淡化；点按不开店。TRACKER 待人工（宽+375）。
- **场景化请茶气泡（2026-08-12 · #253 已合 tip `c10acb7`）**：达标 / 里程碑后 `#contextual-tea-tip-bubble` → TipJar；本地日一次；可忽略；不解锁。TRACKER 待人工。
- **产品阶段 + 经济可持续原则（2026-08-11 · #252 文档）**：`PRINCIPLES.md`——非 MVP-only；短长期收益平衡；委婉/硬推销案例锚定。Brief：Deep **15s 试听**、Journey **Daily Card**、Wisdom→Reflection（A/B）、Sanctuary **Enso**（素材 `sanctuary-enso-mark.png` = 0025；**UI 已接线见上行**）。
- **Ambient 深度曲 entitlement（2026-08-11 · #251 已合 tip `5969872`）**：免费温暖 5 首；其余内置曲 B 锁；用户自传仍免费；Support upsell。TRACKER 待人工。
- **Membership cloud provider + Portal（2026-08-11 · #240 已合 tip `755d465`）**：confirm **与** OTP verify 均签发 `deviceToken`；`/api/membership-entitlement` + Billing Portal；卡内 **Manage** only。**OTP secrets 已补**（2026-08-13）；Sanctuary/Membership Restore 真实收信仍待人工。TRACKER §C4 待人工。
- **Entitlement restore OTP（2026-08-11 · #232 已合）**：Sanctuary/Membership 禁裸邮箱；Resend `waitUntil`；practice-backup 真实收信 **2026-08-13 已通**。Sanctuary/Membership Restore 仍待人工。
- **节日主题引擎 · Phase 3 已合（2026-08-11 · #238 · tip `2c83fd0`；记入 #239）**：圣诞文案桶 + `winter-quiet-wash` + 总开关开 / `contentReady=true`；仅 entitled；无新 PNG 姿态。Phase 1–2 = #233/#234。TRACKER 圣诞观感行仍待人工。下一步 Phase 4 须另授权。
- **Tea / Sanctuary Sandbox 支付试跑（2026-08-11）**：Workbench webhook Tea + Sanctuary 均 **200 / stored**（`product` 分流 OK）。**非整行关单**：邮箱 restore / 零耦合 UI / Membership 仍待测。
- **三种支付人工步骤清单（2026-08-11）**：`docs/PAYMENT_MANUAL_TEST_CHECKLIST.md` — Tea/Sanctuary/Membership 的 Restore（删本地 key→邮箱拉回）与零耦合逐步操作；KnownRisky #25–26/#28 已挂链。Webhook OK ≠ Restore 已测。
- **付费成功回跳致谢（2026-08-11 · #231 已合）**：Tea=`teaDrinking` · Sanctuary=`mindfulAcknowledge` · Membership=`sessionComplete`；Checkout 回跳跳过冷启动欢迎（防盖掉）。单测 `paymentCheckoutThanks.test.js`。TRACKER 致谢专行待人工复测（合前用户曾反馈「只回首页」）。
- **向阿寅倾诉 · Confide MVP（2026-08-10 · #225 已合）**：分类 safety→情绪→fallback；禅意 18 + safety-01 **ok**；面板 `#confide-to-yin-card` 已接线；**`CONFIDE_USER_MOUNT_ENABLED=false`**（真实用户菜单仍关）。QA：`?product=1&confide=1`。待评估：地区热线具体资源。TRACKER 待人工。
- **Yin Membership 订阅 Checkout（2026-08-10 · #224 已合）**：Worker `mode: subscription` + `MEMBERSHIP_KV` + create/confirm/verify；成功页非乐观 confirm 后写统一 entitlement cache。权威 `YIN_MEMBERSHIP.md`。
- **Yin Membership webhook 生命周期（2026-08-10 · Prompt 9 · `feature/yin-membership-webhook`）**：扩展既有 `/api/stripe-webhook`（subscription checkout / invoice.paid|payment_failed / subscription.updated|deleted）写 `MEMBERSHIP_KV`；`verify-membership` 按 `periodEndsAt+7d` 收紧；`subscription_data.metadata`；反查 `membership-sub:`。Test Mode + Stripe CLI 验收；TRACKER 待人工。
- **Stay in touch / Join our community（2026-08-10 · PR #215 已合 tip `d280a1a`）**：Idle ⋯ / 抽屉紧邻 tip-jar；可选邮件留资（本地只记 `submitted`、不存邮箱）+ 社群静态占位外链；提交后菜单行 **We'll keep in touch** 不可再开。**不**挂钩 entitlement / tip / sanctuary；情境软提示 Phase 2。真实发信见文首 2026-08-13 条。
- **芥子须弥纪念印（#246 + 金章 #256 已合 tip `5440a53`）**：统一练习 score≥21；完成仪式后出卡；菜单可重读；章 = `mustard-seed-seal/yin-badge-square-gold-on-silver-alt.png`；EN 译维持现稿。Brief `task-mustard-seed-seal.md`。TRACKER 待人工（须验方章）。
- **Daily Wisdom / Yin 每日一句（2026-08-10 · PR #212 已合 tip `62f15a9`；古典扩库本支）**：内容池 `src/content/daily-wisdom/`（en/ja；Yin 短句 + 可选 `attribution` 古典/文学句同池）+ `DailyWisdomStore`（同日锁 + `recentIds`）+ 可插拔 Lit `<daily-wisdom>`（有署名时 `<cite>`）；entitlement **`content.daily-wisdom`**（`free` / `ongoing`，`resolveTodayWisdom` 内 `isEntitled` 姿势）。**Phase A 挂 Reflection 底部**（本支 `feature/daily-wisdom-reflection-mount`；与 Quiet Line 分池；**Phase B 印花未做**）。TRACKER 待人工。
- **统一 entitlement gate 地基（2026-08-10 · PR #210 已合 tip `623aec0`）**：`src/core/entitlement/` — catalog（ongoing/persistent）+ `isEntitled` / `getFeatureAccess` + lifetime ∪ subscription 互相覆盖 + 双宽限 7 天 + ownership + mock provider；只读 `isSanctuaryUnlocked`；**不**迁 Sanctuary、**不**接 Stripe/Worker。产品 UI 尚未接线。TRACKER「仅单元测试覆盖」。
- **Immersive Presence / 全屏陪伴 + Document PiP 探针（2026-08-09 · `feature/immersive-companion-mvp`）**：Focusing 可选进入应用内沉浸壳（计时+阿寅+Rise）；Chromium 桌面可选实验浮动小窗。**≠** Companion Mode 三选一。见 `DESIGN.md`；TRACKER 新行待人工。
- **SCENARIO_TESTS 二次增量（2026-08-09 晚）**：升格 **X** Tiger Anchor · **Y** Compass+Whisper · **Z** Journey Log；**Q** 补统一徽章 Q4。对齐 #199–#206。权威 `SCENARIO_TESTS.md`。
- **统一练习徽章体系（2026-08-09 · `feature/unified-practice-badges`）**：免费练习起 1；Tea/Sanctuary 付费起 3；练习上涨自动加枚；Sanctuary 独立 `badgeIds` + 17 枚视觉；Idle 阿寅旁优先 Sanctuary 章。Brief `task-unified-practice-badges.md`。TRACKER 待人工。
- **Sanctuary 尊贵徽章素材入库（2026-08-09 · PR #202 已合）**：17 枚 → `public/ui/support/sanctuary-badges/`；本支接线授予。
- **主动 Recover · Tiger Anchor（2026-08-09 · 本支）**：Focusing 轻触阿寅 → `triggerActiveRecover()`（nod-bow + 中置 toast + LightProgression）；不占被动提醒额度；**180s** 冷却隐退；零 MicroRitual。TRACKER 新行待人工（含 375）。
- **SCENARIO_TESTS 增量升格（2026-08-09）**：正式故事补 **Q**（Support/Tea/Sanctuary）· **S**（Breath 左球）· **T**（Focus 时长 chip）· **U**（Cinema/Quiet Line/Wallpapers）· **V**（吹花欢迎）· **W**（Privacy/?）；**R** 跨日回访仍建议。权威 `SCENARIO_TESTS.md`；逐功能仍走 `TEST_TRACKER`。
- **Support Yin 统一入口（2026-08-08 · #187 + UX #194 已合 tip）**：右上角 `#yin-support-fab` → `#yin-support-modal` 双卡；菜单两项**暂留**。**关单级**与其它未关单项共用同一 `origin/develop` tip worktree（见 `TEST_TRACKER`「主干一次性关单验收」/ KnownRisky #27）——**勿**再专开 Support-only QA tree。**UX polish 已合**（#194）。**善意徽章 + 茶室留痕已合**（#196 · tip **`5d08797`**）：9 枚高清 PNG；打赏按练习授 3–9；Tip 卡 + 阿寅身旁；再 tip 无新练习不加枚，但有 Tea Log + `nodGreeting`/`teaDrinking` 致谢。**场景化请茶气泡（#253 已合 tip `c10acb7`）**。**意愿漏斗本地统计（#255 已合）**；**Ambient Deep 15s 试听（#258 已合 tip `2b3db1c`）**；**意愿漏斗 opt-in 回传（#262 已合 tip `582e79f`）**。
- **主干 tip 验收盘点（2026-08-08）**：`origin/develop` tip **`beb9147`**（含 #187 Support + #188 PWA 延后 QA）。TRACKER 约 96 行仍开；**本批**按 KnownRisky §0.1（P0 闪白/Honesty → P1 Breath/chip/吹花/增长/付费/Support → P2 旧债）；实验室/长墙钟/PWA 安装**不排**本批。操作 SSOT：`KNOWN_RISKY_TEST_CHECKLIST.md`。
- **Tip / Sanctuary 云部署（2026-08-08）**：#181 Price + `$89.99`；#182 曾误写旁路账号 KV（已纠回 `ihiro` 的 KV id）。**SSOT** = `https://focus-tiger-cloud.ihiro.workers.dev`。同日 **redeploy 成功**（Version `eb921e5f…`）：新 Tip/Sanctuary Price ID 已上线；secrets/Webhook 沿用。**须人工** Test 卡验金额。
- **合入核对（2026-08-07）**：**#163 Privacy** 已合 `develop`（`af6f65f`）。**#164 Reflection** 误合 **`main`**（`30ef3c9`）；**`main` 先不动**（下次正规 develop→main 发版）。纠正 PR **#175** 把共鸣补回 `develop`。发版备忘：见 `WORKFLOW.md`「发版核对备忘 · main 已提前含 #164」——届时共鸣路径 diff「无变化」为预期。开 PR 须 `--base develop`（`git-pr-base-develop`）。
- **壁纸赠送（#178）**：已合 develop；Idle ⋯ Wallpapers 免费静帧。
- **Buy Yin a Tea（#161）+ Sanctuary scaffold（#162）+ Unlock UI（#179）**：已合 develop；门闩分离。**Ambient 深度曲按 `isEntitled('ambient.deep.play')` 已接线**（`feature/ambient-entitlement-free-subset`：免费温暖 5 首，其余锁）。
- **双轨变现纪要（2026-08-07 · PR #160 已合；2026-08-10 修订）**：双轨 = A Buy Yin a Tea（tip · 不解锁）∪ B 进阶内容解锁；B 下 **Sanctuary Lifetime** 买断 ∪ **Yin Membership** 订阅互覆盖；门闩与 tip 零耦合。
- **商业化口径修正（2026-08-10 · #216 已合 tip `9e698ee`）**：推翻「v1 仅 Lifetime / 无订阅」；Yin Membership 纳入 v1；仍称双轨（非三档）。SSOT：`MVP_PRODUCT_DEFINITION` §五 + `task-tech-direction-v1-shell-monetization.md`。
- **功能×免费/付费对照表（2026-08-10 · #219 草稿合入；#220 升 SSOT tip `e196e56`）**：`docs/FREE_PAID_MATRIX.md`（**方向锁 / SSOT**）；对账文档口径 vs 代码接线；无价格列。
- **吹花鼓励 · Phase 1–2c（2026-08-06）**：Phase 1–2b 已合 develop（含 #139 Day1 压过 wellness、#141 窄屏气泡避让）。**Phase 2c**（本支）：文案轮换 `lastCopyKey`、e2e `flower-welcome.spec.js` 门闩、10fps 锁定、TEST_TRACKER 分列。
- **吹花鼓励 · Phase 1 Lab（2026-08-05 · PR #124）**：合入 `develop` tip **`a50c507`**。`conjureFlowersBlowAway` 入库 + CapCut；产品冷启动未改。用户书面（feature tip）：Lab **测试 OK**。**Phase 2a**（本支 / PR #129）：Lab 头顶白玉气泡 + 观察式文案 + locale 主次字；feature tip 观感 **基本 OK**，待合 develop。
- **Ambient 内置清单 +6 曲（2026-08-05 · PR #125）**：合入 tip；**关单**。邻接 UX（Rise 后曲目高亮 / 断点续播 / 面板靠右 / 音符开播 / 每曲 Play/Pause / Idle 靠右）→ PR #131+#132；**2026-08-06 tip 关单**（用户「关单 OK」；功能 tip `ae6eca2`）。
- **Focus 开表前时长 15/25/45/60（2026-08-06）**：Companion 点选后出 chip（与 Breath 1/3/5/10/20 差异化）；`?sessionMinutes=` 仍可跳过供 e2e。分支 `feature/focus-duration-picker`。
- **首页左球 → Breath practice（2026-08-06）**：原 Quick Start 跳过 Arrival 开表改为开时长 picker；抽屉/⋯ 去掉重复 Breath 行；右上音符加 `AMBIENT_NOTE_HOVER`（脉冲未读时不叠 title）。分支 `feature/home-breath-practice-ball`。Extended Breath（PR #143）人工听感主路径已 OK。
- **KnownRisky #3 / Honesty 桥接（2026-08-04）**：PR #118 合入 tip **`3ea79b9`**；375 回归复测 OK → KnownRisky **verified**；`TEST_TRACKER` 桥接 → **已通过**（覆盖分工已写）。
- **KnownRisky #1 Idle 窄宽 chrome 关单（2026-08-04）**：tip `4698eb3` 步1–6、9 OK；步7 tip `0494dd6`/:5176 OK；步8 窄屏 Hints **产品延期维持现状**。`TEST_TRACKER` Task3 / Facade / ⋯薄荷绿 → **已通过**；债务清单 Idle chrome → **verified**。
- **Focusing×? tip 叠团专修（2026-08-04 · PR #109）**：合入 `0494dd6`；develop tip 窄屏 Focusing×? **测试 OK**（已并入 KnownRisky #1）。工作流 **§6.13**。
- **「本周陪伴」今日标记 + 窄屏 toast 避让（2026-08-05）**：PR #120 合入 `develop` tip `dc415d7`（星期缩写/今日描边/Dormant 可见；窄屏底部文案 clearance belt）。Hints tip 几何仍属 #7 再设计。
- **KnownRisky 验收清单入库（2026-08-04）**：`KNOWN_RISKY_TEST_CHECKLIST.md` 步骤 SSOT；#1 已关单（见上行）。
- **星光斗篷 v5 + 经典并存（2026-08-04）**：入库 v5 + 物理倒序苏醒；与旧 `cloak-sleep` **约 50/50**。Wellness 2A 冷启动：深夜 forceDormant / 清晨苏醒仪式 / 白天禁 2h 开场即睡。**Expand A**：仅深夜 Idle→DORMANT（**已关**白天 Idle 无操作披毯 · plan A · PR #108）。**Expand B** / **2B** / **2h→DORMANT** 保留。删除未接线调试键 `wakeUp`。睡循环：原始双持 pingpong（经典 034→030 / 星光 067→063 @2fps）。工作流：`DEV_WORKFLOW_QUALITY` §6.11。
- **FocusHUD 否决「随风浮动」（2026-08-04）**：冷启动毛玻璃隐退保留；**禁止**整卡位移动画，以免与静置 chrome 不统一。见 `DESIGN` FocusHUD / `TEST_TRACKER` 冷启动首屏行。
- **CapCut 短叠化统一 + 轻完成池撤 blink（2026-08-03 · PR #102 已合）**：关单矩阵内短淡入→1s CapCut + 硬切保持 — **测试 OK**。**范围不含**鹦鹉等 companion oneshot 回落（2026-08-04 仍见闪白 → `DEV_WORKFLOW_QUALITY` **§6.12**）。轻完成池无 `curiousTilt` — 须以后慢慢碰概率。
- **鹦鹉耳边造访入库 + 场景 A/B（2026-08-03 · PR #96 已合）**：`parrotEarVisit`；场景 A 横幅×信使；场景 B 稀有池 + streak-7 50/50。Welcome 优先顺序曾 OK（§6.10）。**2026-08-04**：刷新后鹦鹉→Idle **闪白** → 根因 **§6.12**；同日晚 tip `0494dd6` 人工回落叠化关单。**后补** `fix/parrot-idle-capcut`：companion oneshot 抗闪契约 + 单测 P3/P4（非重开关单）。
- **Hints 接线 SSOT（2026-08-03）**：`HINTS_WIRING.md` + 库存硬闸 + PR 批次钉。**③ 簇 A 已验证** → 格式生效。**④ 视觉护栏试点已合（PR #93）**；同日用户拍板 **保持观察、暂不扩** linux 软快照 / peeked / 更多 id。⑤ 仍 Backlog。
- **MilestoneGlow 琉璃星石变体入库（2026-08-03）**：`meditation-star-reward`（63 帧）进 `MilestoneGlow` 变体池——`streak-7` 仍金辉+蝴蝶；`streak-21` / `streak-100` 播星石。分支 `feature/milestone-glow-star-variant`。
- **PR 收口 + stash 归档（2026-08-01 晚）**：[#66](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/66) chrome Quick-only / Rise 闪 + ja 阿寅、[#67](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/67) welcome wave pingpong、[#68](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/68) stash PRD 归档均已合 `develop`。本地 5 条旧 stash 已清；唯一 PRD 草稿进 `docs/archive/stashed-prds-2026-07-24/`。已合入 `fix/*` worktree 已拆除。
- **PR #2 冲突已清（2026-08-02 · #70 合 develop）**：PR #2 = `MERGEABLE`；behind main=0；resolve worktree 已拆。**合 main 仍须五条件清单 + 你明确下令**。Brief：`task-pr2-develop-into-main.md`。
- **分支健康度普查（2026-08-01）**：`PROCESS`「分支健康度」+ `COLLAB` 摘要；`npm run check:all-branches-health`（双周提醒，不进 CI Required）。防换名重写残留（假 ahead）；开分支可用 `--topic` 查重叠。
- **375 修红 · micro-ritual Sit tip + 抽屉挡 ♪（2026-07-31）**：A) 呼吸开始后才 sync onboarding autos（修过早 sync 导致 `sit-button` 残留）；B) ActionBar 高于抽屉 backdrop，点 ♪ 关抽屉开 Soundscape；去掉 e2e `force: true`。Brief `fix-375-e2e-reds.md`。
- **MilestoneGlow 产品路径接线（2026-07-31）**：连续练习 **streak-7**（及预留 21/100）达成时产品壳播 `MilestoneGlow`；与 Celebrating 同刻只播 Glow、庆祝戳仍记账；Honesty 补登跨节点时先 Glow 再桥接。`MilestoneGlowStore` + e2e `milestone-glow-product.spec.js`。
- **场景动画 Dispatcher · A′+B 实现（2026-08-01）**：`sceneAnimationDispatcher` + EmotionController 合十/光环/陪伴手势；切语 ja=`palmsTogether`；Honesty 20/30；欢迎/完成/微仪式/舒展池；深夜+好奇冷却。分支 `feature/scene-animation-dispatcher-slice-b`。
- **场景→动画 · 设计师整合 + 库存全业务政策（2026-08-01）**：文档已合 develop（PR #64）；Honesty 20/30、Dispatcher、一批落地口径见接线表。
- **场景→动画接线表 · v1.0.0 Slice A（2026-07-31 拍板）**：正式稿 `SCENE_ANIMATION_WIRING.md`；**Slice A 升格为 v1.0.0 必交付**（ja 合十 / en 鞠躬；Honesty Idle 补登短点头；微仪式完成已接线核对）。Brief `task-briefs/task-scene-animation-wiring-v1-slice-a.md`；**实现** PR #59 已合 `develop`。docs 见 PR #58。Slice B/C / A′ 见 Backlog。
- **MilestoneGlow 正式路径可接线（2026-07-31 拍板）**：用户书面——长期里程碑金辉+蝴蝶**本就是产品需要**，正式路径**完全可以接线**；不再以「仅调试预览」为终态。Brief `task-briefs/task-milestone-glow-product-wire.md`；实现另开 `feature/milestone-glow-product-wire`（排在 Ambient ⑤⑥⑩ 自动化之后或并行）。旧「7/30 前仅复测调试节奏」口径废止，改为**接线任务**；4 fps 观感随接线验收。
- **用户上传氛围乐 · v1.0.0 必交付（2026-07-31）**：升格出「仅 Backlog」；砍法已锁（mp3/m4a、合计 ≤64MiB 且 ≤10 首、单文件 ≤20MiB、用户曲整段在上且**最近在上**、可删自传）。Brief `task-user-ambient-upload-v1.md`；已合 **`develop`**（PR #51 / `UserAmbientLibrary` + Soundscape 上传/删除 + unit/e2e）。
- **Ambient 窄宽对账填表（2026-07-31）**：`audit-narrow-wide-ambient-parity.md` 10 项已按 `develop` 代码+既有 e2e/unit 填状态（1–4/7–9 ✅；5–6/10 ⚠️ 缺 DOM 听感断言；另记 micro-ritual tip / 抽屉挡 ♪ 既有红）。未重跑 Playwright（本机缺 Chromium）。
- **Five Moments 用户可感表面（2026-08-09）**：用户拍板 **B Compass → A′ Whisper → D′ Journey Log**（Tea Log 模式本地留痕；**非** HealthKit）。不做常驻五点轴 / 教导 Banner。父决策 `task-briefs/task-five-moments-surface-plan.md`；叙事 `PRODUCT_MOMENTS` §5.6。**B #201 / A′ #203 / D′ #205 均已合**——本排期表面三件套完成。与 `feature/active-recover-*` 并存时勿抢 Hints/locales 大文件无同步。
- **增长向内容包决策锁（2026-08-06）**：分析师+调查对齐后用户「合理则办」。顺序 ① YouTube ⋯平级 → ③ 签文 `COPY_POOLS`+存图 → ②A 电子书下载 → ②B 独立 `ebook-unlocked`（文案与 Glow streak-7 叙事刻意分开）。无 Settings/Culture Space；不绑壳/分享卖点。Brief `task-growth-content-pack-decision.md`。**① / ③ 已合 develop**（PR #148 / #153）；**②A/②B 延后**（同日晚用户书面：电子书非最急，延迟安排——勿默认下一优先）。**2026-08-07 晚**：壁纸赠送另 Brief；付费双轨见技术方向纪要。
- **付费双轨 A Tea + B 进阶解锁（2026-08-07 锁双轨；2026-08-10 修订付费方式）**：打赏与解锁都要；B = **Sanctuary Lifetime** ∪ **Yin Membership**（互覆盖；非「仅 Lifetime / 无订阅」）；24h 漏斗非 v1；founder→Tea。Brief `task-tech-direction-v1-shell-monetization.md`。
- **宽屏首页三球（2026-07-31）**：产品拍板已落地实现——宽屏 Idle 首页三球 + ⋯（代替 Sit+⚡ pill；Honesty 出 ⋯）。分支 `feature/wide-home-three-ball`（PR #50）；e2e `wide-idle-more-menu.spec.js`。§8+§9 壳故事已于 2026-08-04 KnownRisky #1 / Task3 关单。
- **CI 定时全量 + Plan A 收口（2026-07-31 … 2026-08-02）**：**PR smoke** 已在每次 PR→`develop` 跑通（**无** API Key）。**全量 e2e** 夜间 `schedule`（UTC 02:00）+ 手动 dispatch：当时 YAML 合入 **`main`**（120m · [#47](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/47)；Plan A 分片+JUnit · [#63](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/63)），**测 `develop` tip**。#15 稳定红已修（[#74](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/74)）；验绿 [#30712008401](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/actions/runs/30712008401)（JUnit 68 tests / 0 fail）。**基建任务完成**。**2026-08-14**：默认分支改为 `develop`，夜间 YAML 现跟 `develop`（见上条「GitHub 默认分支」）。残留 = 偶发 goto flake 根因（另项）+ 是否挂 PR 门（另议）。隔离：`ENV_CONFIG.md` + `.env.example`。
- **发布前安全网 · 工程收口（2026-07-30）**：`pr-smoke` Required-safe + build 校验 + Dependabot/audit + 用户/隐私文档已合 **PR #40**。**同日你已在 GitHub 把 `test:pr-smoke` 勾成 `develop` Required**（与 `pre-merge with develop` 并列）。崩溃监控 / 打包产物 CI / 用户文档人工过目仍开。见 Backlog「发布前安全网」。
- **i18n v1.0.0 English + Japanese（2026-07-30 修订）**：对外 en+ja 可点切换；中文不着急（zh draft）；六语槽保留。见 `COVERAGE_GAP_AUDIT.md` §9 / `PRODUCT_POSITIONING`。
- **i18n A+B+C 架构已落地（2026-07-30）**：`LanguagePreferenceUI` + `focus-tiger.locale.v1` + unit/e2e；发版面按上条 en+ja。见审计 §9。
- **i18n「审完再露」拍板（2026-07-30）**：未 `ready` **不进**选择器、不发版声称；拒机翻先上。
- **扩 smoke 已落地（2026-07-30）**：`test:smoke` = `run-src-unit-tests.js` + `docs:check`（A+A′；**319** pass · ~343ms；不建 `test:regression`；Node 20 CI 不用带引号 glob）。见 `COVERAGE_GAP_AUDIT.md` §7。
- **扩 smoke 分类 + Honesty 发布口径（2026-07-30）**：审计 §7–§8——unit\* 均可原样并入 smoke；Honesty 真实链**可用、不挡 v1**。见 `COVERAGE_GAP_AUDIT.md`。
- **自动化缺口 · Task 2 已落地（2026-07-30）**：smoke E/F + MindfulReminder / AcrossTools 并入 `test:smoke`。
- **自动化缺口 · Task 3 已落地（2026-07-30）**：真实 Honesty→桥接→Yes→Arrival e2e（`honesty-bridge-real-path` + `?honestyBreathMs=`）。见 `COVERAGE_GAP_AUDIT.md` §8。
- **功能 vs 测试覆盖缺口审计（2026-07-30）**：落盘 `COVERAGE_GAP_AUDIT.md`；Task 3→2 + 扩 smoke **已落地**。`TEST_TRACKER` §C / `SCENARIO_TESTS` / `RULES_INDEX` 已挂指针。
- **语义化版本与稳定发布点拍板（2026-07-30）**：SemVer；首稳 **`v1.0.0`**；稳定版 = `main` 上 **annotated tag**，开发阶段**不**切 `release/*`（除非未来并行维护多条已发布大版本）。SSOT：`WORKFLOW.md`「语义化版本与稳定发布点」；`RULES_INDEX` → `git-semver-release`。无运行时改动，无 TEST_TRACKER 行。
- **v1.0 纯本地 / v1.1 云端 + 打包选型时机（2026-07-30 拍板）**：**v1.0.0** = 纯本地可用小发布（核心不依赖联网）；**v1.1** 跟进云端算法；代码保留云端可扩展性（`cloud/` 骨架保留、前端暂不接线）。打包选型（Electron / Tauri / PWA）仍为 **v1 阻塞**，但**开会时机已定**：v1.0.0 功能冻结前约 1 周、或你说「准备打 v1.0 / 要桌面包」时立刻开；不挡当前 UI 主线、不拖到 tag 后才选。见开放决策 / Backlog；`MVP_PRODUCT_DEFINITION` / `ARCHITECTURE` / `cloud/README` 已同步。无运行时改动。
- **响应式 Task 3 收口（2026-07-30）**：阶段 0–2 已合 #31/#32/#33；阶段 3 文档 + main 只经 `idleChrome`（无分壳 `setHandlers`）。关单级人工须单独跑 §8 375 + §9 W1–W8（勿与场景 O 混验）。误建空支 `fix/ambient-menu-hint-ux` 已删。
- **响应式 Task 3 阶段 2（2026-07-30）**：PR #33 已合；`IdleChromeFacade` / `createIdleChromeFacade`。
- **Onboarding hints · click 圆点 + tier peeked/static/done（2026-07-30）**：Registry `triggerMode`/`tier`；首次 Idle 右上音符薄荷绿圆点（`ambient-soundscape`）；simple peek→静止弱化，操作→done；detailed 进用途简介卡才 done。
- **冷启动禁开场即睡（2026-07-26）**：用户书面——每次第一次试用又见披斗篷睡着；要第一幕有精神的 Idle。根因：2h 滚动 DORMANT 在 `onAppReady` 对陈旧 `focus-session-end` 重播 `cloakSleep`（7/21 Idle 开局只锁了「无结束戳」路径；7/25「开场即睡另案」未留回归锚）。现 `onAppReady` → `syncDormantState({ allowEnterDormant: false })`。**同日拍板**：回前台且 ≥2h → **继续披毯进睡**（live sync 保留；≠冷启动）。单测 A1b + `dormantIdle`；`TEST_TRACKER`「开场即睡」行。工作流根因写入 `DEV_WORKFLOW_QUALITY` §6.7。
- **验收基线 + 新鲜度门禁（2026-07-29）**：关单级人工验收 **只认 `origin/develop` tip**（`TEST_TRACKER` 文首 / `RULES_INDEX` → `qa-develop-tip`）；Agent 正式邀测或声称 develop 行为前须跑 `npm run check:branch-freshness`（regression-lock「分支新鲜度」/ `branch-freshness`）。`Z_INDEX.md` 入 `RULES_INDEX`（`z-index-registry`）；PR 模板加 fixed 壳 / 375 邻接勾选。核实后删除空壳长命分支 `feature/wide-idle-more-menu`、`feature/onboarding-hints-followup`（ahead=0，已是 develop 祖先）。
- **标「已通过」覆盖分工（2026-08-02）**：`TEST_TRACKER` 关单须写清 e2e/自动化已锁哪些场景 + 人工已覆盖哪些场景（`RULES_INDEX` → `qa-pass-coverage-split`）；**禁止** e2e 绿或笼统「测试 OK」直接标「已通过」。门禁摘要见 regression-lock。
- **本地 Cursor 能耗护栏（2026-07-26；2026-07-31 收紧；2026-08-11 补限时）**：根目录 `.cursorignore` + `.cursorindexingignore` 已合入 `develop`（PR #3）。Cloud 启用须提醒「独立会话」；起过 Vite/Playwright 须在收尾提醒确认已关（`focus-tiger-browser-energy.mdc`）。**2026-07-31**：取消窄屏/口头开 IDE Browser 特例；`deny-ide-browser-mcp` 硬禁 `cursor-ide-browser`（Safari 响应式 / Playwright 代窄屏）。**2026-08-11**：临时解禁路径的连续开放时长上限、续开不清零与精确时间戳汇报 → 以 [`.cursor/rules/focus-tiger-browser-energy.mdc`](../../.cursor/rules/focus-tiger-browser-energy.mdc) **当前生效条文**为准（本文档**不复述具体数值**）。非产品 UI，无需 TEST_TRACKER 人工项。

- **窄屏主屏三主钮（2026-07-26 / 图标 v3 · 07-27）**：375 主画布 **Quick Start · Sit with Yin · Honesty** PNG 图腾（`public/icons/`）；抽屉不含这三项（留呼吸 / How / Sound / Reminder + 7 格）。Hints remap 到 `#ft-narrow-home-*`。**2026-07-27**：换 **v3** cream 底图腾（替 v2，`?v=4`）；逻辑/门闩不变。e2e 已锁；待人工观感（边距略疏）。
- **跨视口可见性契约（2026-07-26）**：`visibilityContractRegistry.js` + `SHARED_RESOURCES` §6 机器块 + N25（验收 OK 须同任务双视口自动化）；改 suppress/hide → CI `test:e2e:visibility` 整表。详见 `DEV_WORKFLOW_QUALITY` §8.6 / `DOC_CODE_CONTRACT.md` V-01。
- **窄屏故事矩阵（2026-07-25）**：`DEV_WORKFLOW_QUALITY.md` §8——根因（验收停在壳切换、外侧取消未锁 tip、双壳契约滞后）+ N17–N20（375 故事最小集 / 点 tip 只关 tip / 双壳不变量 / 关单须注明 375）。不变量落盘 `SHARED_RESOURCES` §6、`RESPONSIVE_LAYOUT` §6.2b；`TEST_TRACKER` 文首已挂口径。
- **宽屏故事矩阵（2026-07-25）**：确认先前**无**对称标准（仅有 `SCENARIO_TESTS` + §6.2 一行 + 散落行）。新增 `DEV_WORKFLOW_QUALITY.md` §9 + N21–N24（清场/Popover 故事最小集、邻接可点物、改宽勾窄、关单须注明宽屏故事）。与 §8 共用「壳烟测 ≠ 故事」。**2026-07-29**：原 `feature/wide-idle-more-menu` 已删（内容已在 develop 祖先链）；完整 W1–W8 关单验收改在 **`origin/develop` tip** 上单独排期，勿与其它修混验。
- **wide-idle 宽屏清场验收（2026-07-25 晚 · 历史）**：P0 ①–⑥⑧ 宽屏曾在该分支 **测试 OK**；⑦ 场景 O 另线已收口进 develop。分支本身已于 2026-07-29 删除（无独有未合入 commit）。
- **规则主题权威索引（2026-07-23）**：新增 `RULES_INDEX.md` + `rules-authority-registry.js` + `rules:doc-check`（并入 `docs:check` / CI）。每个工作流规则主题指定唯一 SSOT；非权威处改为短引用。收敛 `WORKFLOW` / regression-lock / `PROCESS` / docs.mdc / `DEV` / `COLLAB` 上 commit / 跨会话等平行复述。冲突不以 mtime 为准。
- **合并门禁拍板（2026-07-23 · PR #2；「临时本机全量」已废止）**：当时曾接受本机 smoke+全量 e2e + CI 仅 doc-contract；**该临时门槛已废止 / 已由 CI 收口**（见 Backlog「CI 全量…」与 `RULES_INDEX` → `e2e-local-budget`）。提醒忙碌策略拍板 **`suppress`**。MilestoneGlow（L136）书面为**已知问题、不挡此次合并**，预计 **2026-07-30 前**复测。
- **TEST_TRACKER 合并前清理（2026-07-22）**：EyeTracking → **已放弃/不适用**；微仪式吸呼同拍行 → 代码核对 `736fdc1` 撤销到位后 **关单（已通过）**；`lookAtCursor` / `wakeUp` / `snoringZZZ` → **不挡合并（仅调试）**（产品壳不可见）。仍开、须人工：场景 **C/O/P**（用户正走）；MilestoneGlow 见上行「已知不挡」。不采用书面豁免开 PR（本条 MilestoneGlow 为合并门禁显式记录，非豁免开 PR）。
- **Hints anchor 校验分层（2026-07-22）**：方案 (1) `HINT_IDS` ↔ `ONBOARDING_HINT_ANCHORS` 双向对齐单测已落地；方案 (2) 语义分组暂缓；方案 (3) e2e bounding rect 写入 Backlog（`PROCESS.md`）
- **Hints 补登记 + 关闭说明（2026-07-22）**：用户拍板——热力图 / 一分钟呼吸 / Honesty 桥接 / Idle Sound（`ambient-gated`）写入 `ONBOARDING_HINTS`；`help-remedy` 英中文增加「点气泡关掉；下次点 ?」。点「?」补救须铺齐；桥接场景不出 micro-ritual tip。
- **Honesty 补登成功 toast（2026-07-22）**：用户拍板——成功记账也加轻量确认（对齐微仪式）。`HONESTY_CHECKIN_RECORDED`（EN `Quiet time elsewhere counts, too.` / ZH「别处的静心，也算数。」）居中 toast ≈4.5s + 桥接并存；abort 仍只出 `HONESTY_PENDING_LOST`。单测锁 `notifyRecorded`。**同日书面**：文案锁定现稿，勿改。
- **A 类开放行书面验收批次（2026-07-22）**：用户书面——FocusHUD 金环/今日同坐/streak、米色 How shall we sit?、hint 侧面、Sound gated、Hints 薄荷绿+用途简介、Choose pingpong+叠化、Honesty Idle 补登、LightProgression、Ambient Rim（砍宣传）均 **测试 OK** → 已关 `TEST_TRACKER`。同日续：**Reflection / Safari** 主路径顺利后关包；随后用户反馈「多日点 Reading 从未见意图回显」→ 已加固闩逻辑 + e2e（待人工复测回显米色条）。「?」朱红用途见 2026-07-23 / 7-30 click 圆点拍板（不再挂 tip 未读；见开放决策已关项）。
- **Reflection 意图回显加固（2026-07-22）**：根因候选为 `beginFocusWithMode` 用 `pendingChoose?.text ?? ''` 在二次开表时抹掉已选意图；现改为 Arrival `onReady` 立刻闩上 + 空 pending 不抹 + 回显样式加强；e2e `reflection-intention-echo.spec.js`
- **CI doc-contract 缺依赖红（2026-07-22）**：远端 `develop` 推上后 workflow **failure**（缺 `npm ci` → `three` `ERR_MODULE_NOT_FOUND`）。修于 `7b90283`；CI 绿 [`29919097318`](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/actions/runs/29919097318)（**success**）。红绿归档见 `DEV_WORKFLOW_QUALITY.md` §7.7
- **跨会话指令冲突处理（2026-07-22）**：开 PR / 合并 `main` / push 前若距上次同类操作超过约 10–15 分钟，须先查仓库客观状态（开放 PR、tip、CI、`origin/*`）；发现更晚活动须先问用户。写入 `WORKFLOW.md` + `focus-tiger-regression-lock.mdc`（不要求读其他会话对话）
- **Commit 汇报门禁对齐（2026-07-22）**：废止「不必询问 commit」口径；改为可自动 commit 到当前工作分支 + **同回合汇报** hash/分支/文件；禁止静默提交与自动合并进 `main`。已对齐 `focus-tiger-regression-lock` / `WORKFLOW.md` / `focus-tiger-docs` / `DEV_WORKFLOW_QUALITY` / 本文
- **姊妹分支同步纪律（2026-07-25）**：宽/窄屏长期并存失步事故升格为 §6.6 / N17；操作 SSOT 在 `WORKFLOW.md`「长期并存功能分支的同步纪律」（`git-sibling-branch-sync`）；禁止平行 `DEV_WORKFLOW_QUALITY_SUPPLEMENT*`
- **自动化口径核对（2026-07-22）**：通读 `SCENARIO_TESTS` / `TEST_TRACKER`，凡「已自动化/已覆盖/已锁住」改为标明单元 / 控制器集成 / DOM 用户链路及测到源头或仅下游；修正 Offline/K 过时故事、Skip — begin 已有 e2e A2/A3、smoke J≠Reflection、e2e 约 20 条等
- **「一分钟呼吸」微仪式 · Idle 接入（2026-07-22）**：`#micro-ritual-idle-entry`（青绿立体 secondary，Sit 上方）→ 60s 吸/呼 + smiling@4fps + 光环 **4s（不同拍）** → 记账 + SessionComplete + 中置 toast；HUD 直播；桥接时入口隐藏。**同日晚**：用户书面——撤销吸呼同拍；四钮改同族立体质感（次级同尺寸，Sit 略大）。e2e：`micro-ritual.spec.js`；**质感和谐待复测**
- **「?」朱砂未读点（2026-07-22 → 7-23/7-30 已修订）**：7-22 曾书面保留「?」角朱砂表示 tip 未读；**现已废止**——onboarding 改薄荷绿 click 圆点（PR #30）；朱红留给真正通知/alert。见开放决策已关项与 `TEST_TRACKER` click 圆点行。
- **「一分钟呼吸」微仪式 · 方案调研（2026-07-22）**：方案文档 `MICRO_RITUAL_PLAN.md`（已实现，见上行）
- **应用内提醒偏好 + 横幅 UI 已接入（2026-07-22）**：设置入口改为 **Idle 热力图簇旁的小型时钟图标**（`ReminderPreferenceUI`，挂 `WeeklyPracticeHeatmap` cluster，Idle-only）；点击展开轻量面板，含「开启提醒」+ 时间选择器，标题键 `reminder.setting_title`。**2026-07-25**：面板常显「每日时分」说明（`reminder.daily_blurb`）+ 已过/已练软提示；onboarding Hint `in-app-reminder`。横幅 `InAppReminderBannerUI` 挂 `#ui-overlay` 顶部居中；`reminderPreference` 本地存 `{ hour, minute }` 或 `null`（**无 `enabled` 字段**，存在即开启）；`evaluateInAppReminderBanner` 在「已设置 + 已过提醒时分 + 今日未完成」时返回 `{ shouldShow, messageKey: 'reminder.gentle_waiting' }`；已接冷启动 / `visibilitychange` 回前台 / 状态切换重评；关闭后本页会话内不再重复；DEV：`window.__inAppReminder`。**2026-07-23**：忙碌策略拍板 **`suppress`**。
- **留存漏斗骨架（2026-07-22）**：`docs/RETENTION_FUNNEL.md` + 本地 `RetentionTelemetry`（`console.log` 占位，无 UI、无第三方；正式工具暂不选型）；事件：`app_first_open` / `first_session_complete` / `day1|3|7|30_return`（窗口内首次返回）/ `dormant_bridge_shown|accepted|declined` / **`micro_ritual_complete`**
- **Cloudflare Workers 骨架（2026-07-22）**：`focus-tiger/cloud/` 独立包（`wrangler` + TS）；stub `POST /api/daily-message` / `POST /api/emotion-weight` + 字段校验 + 内存限流；**未接前端**。本地 `cd cloud && npm run dev`；接口字段待人工 review（见 `cloud/README.md`）
- **「本周陪伴」7 格热力图 UI（2026-07-22；今日标记 2026-08-04）**：Idle 常驻左下（`?` 上方）；`getLastNDays(7)` 最右=今日；亮格=`null|/>0`；星期缩写 + 今日软描边；e2e `weekly-practice-heatmap.spec.js`
- **PracticeDaysStore 多日时长（2026-07-22）**：`days: { date, totalMinutes }[]`（旧 `string[]` → `totalMinutes: null`）；`getLastNDays(n)` 补缺口 0；写入仍走既有 `onPracticeDay`；见 `SHARED_RESOURCES` §1.2
- **「本周陪伴」热力图 · 第 1 步调研（2026-07-22）**：`DailyCompletionStore` 仅当日不够；数据源改 `PracticeDaysStore`
- **静默失败排查 · 批 1–3（2026-07-22）**：StateManager warn-only；Honesty 禁 `?? 30`；门闩一体包（`resyncSessionChrome` 可扩展源 + Picker Gate 通过后才写 storage；删 BREAK）。批 2–3 待人工验收。
- **开场 Idle + 背景音乐 opt-in（2026-07-25 修订；2026-07-26 冷启动加固；2026-07-29 Soundscape）**：登录 / **刷新**后第一幕为闭目坐禅（不上 Sleeping / 不披毯，即使本地有 ≥2h 结束戳）；**不**默认开播背景音乐——须点右上音符（或菜单/抽屉 Sound）打开 Soundscape 选曲才出声；宽屏藏右下 Sound FAB；Rise / 达标结束自动停播
- **Honesty 首屏措辞（2026-07-21）**：邀请式补登提示仍挂零完成；开场视觉已改 Idle
- **UI Kit / 主 CTA（2026-07-21）**：产品壳 **Sit / Sound** 由朱红改为**蒲团橙**（与 Yin 坐垫同系）；v6 产品舞台 + Companion 暖米文案面；成就/图鉴仍仅探索（Backlog）
- **Hints 薄荷绿恢复 + 「?」用途简介（2026-07-21）**：提示气泡从奶油米黄改回浅绿灰（与控件米黄区分）；点「?」另出非遮罩 App 用途简介卡
- **FocusHUD 金环+呼吸光（2026-07-21）**：左上角弱化数字感——金环进度 + 中心呼吸光点跟 focusLevel（已弃香炉碗/烟）；琥珀金加对比、光点明显一张一缩、整块约 2×；% 悬停才露；时长默认淡；见 `DESIGN.md` UI Kit 节
- **FocusHUD 今日同坐 progress-bar（2026-07-21）**：UI Kit 软条挂入 HUD 下方；「今日同坐」= 已完成+当前会话 / 25 分钟软顶；专注中轻脉冲；**不**接线 daily-quest-card
- **Companion 预选回流开表（2026-07-21）**：先点 Here & Now / Flow → Arrival → Skip begin / Choose 后**自动 Focusing**（`pendingAutoStartMode`）；不再逼点 Sit。e2e A2/A3
- **Choose 后 Companion 点选开表（2026-07-25）**：Sit→Choose 鞠躬后**展开三选一**，点 Here & Now / Flow / Offline → 立刻 Focusing（L249；不再鞠躬后静默用记忆模式开表）
- **Arrival 门闩跨 Rise 保持（2026-07-25）**：解锁后 Focusing/Rise **不清** `arrivalGateReady`；回流 hint→Here & Now 立刻开表（Scenario J）；Sit 仍始终走 Arrival

- **Idle 两段 pingpong（2026-07-20 验收通过）**：`idleBreathClosed` ×2 → `idleBlinkArc` ×1；同源 51 帧素材；段间硬切；用户书面测试 OK
- **N15（2026-07-21）**：Bug 修复 = 代码/措施 + **相关文档同批** + **立刻本地 commit**（强制；见 `DEV_WORKFLOW_QUALITY.md`）
- **Celebrating / 同日 SessionComplete（2026-07-21）**：**已复测通过**（首次舞 + 同日二次只摆尾）
- **DEV 一键重置**：改为 **L-logic**（`localStateKeys.test.js` 并入 `test:smoke`）；另有「重置并 idle 坐禅」快捷入口
- **cloak-sleep 进 DORMANT（2c）**：已接线；当日首次/转换播披毯→sleeping；**2026-07-22** 人工 OK（含 sleep→wake）；**2026-07-25** 睡姿改为 cloak-sleep 030–034 双拍 pingpong（待复测衔接）
- **Rise → `rise-stretch-casual` one-shot**（Reflection 期间 holdPose）；`blink-breathe` 仅调试
- **Skip — begin → 直接开计时 / Rise**（修半卡 Sit）；Choose 后 Companion **底部横排矮条**（点头后再展开，不挡鞠躬）
- **Idle 编排**：闭目 pingpong ×2 → 睁眼弧 ×1（取代旧 breath×5→idle-eye-glance 切序列）
- **「?」补救**：加大立体化 + 首次 `help-affordance` 气泡
- **Sit 误开 Honesty**：抬 Sit dock z-index + 抬高 Honesty 面板（点击层叠抢点，**不是**没 commit）
- **Choose**：去合十，改 16:9 `intentionNod`；确认瞬间立刻开门闩（修 Reading 后偶发无 Rise）
- **pingpong 顶点停留**：`rise-stretch-casual` / `blink-breathe` / `breath-halo-hq` 末帧补约 2 拍
- **文档根指针收敛**：`SCENARIO_TESTS` / `HONESTY_BRIDGE_CTA` / `ONBOARDING_HINTS` 权威均在 `focus-tiger/docs/`；仓库根同名文件仅为指针；720 底稿归档
- **3D Idle 警示/历史备份入库**：`tiger-meditate-closed.webp-292k.glb`、`tiger-meditate-closed.crimson-trim-307k.glb`（非正式运行时；见 `ASSET_INVENTORY.md`）
- **NEW_ASSETS_2026-07-18-B**：眼动/哈欠入库 Prompt 归档（正式 Idle 不调度）
- **CapCut 式叠代**：跨动画有转场一律 **1s**（`CAPCUT_DISSOLVE_MS`）；短淡入已退役。**仅**设计为无需转场的硬切（显式 `0`）保持。
- Honesty 拍板 B；Companion 短句提示
- **开发质量工作流文档**：`DEV_WORKFLOW_QUALITY.md`（含 N6/N15 立刻 commit + 文档同步；§6.1 场景冒烟已落地）
- **场景 A–D 控制器冒烟**：`src/core/scenario-smoke.test.js` · `npm run test:smoke`（逻辑层；观感仍人工分列）
- **Playwright 场景 A/I/K DOM（Task 1）**：hint→Arrival；Here & Now / Offline / Flow **点选即开表**（含 Arrival 后预选）— `e2e/scenario-a.companion.spec.js`
- **Offline Space 跳过 Arrival（2026-07-25）**：点选 Offline → **立刻 Focusing**，**不**进 Notice/Choose；Here & Now / Flow 门闩未就绪仍走 Arrival；差异在仪式与离开提醒，不在二次 Sit
- **dormantWake 试替（2026-07-21；人工 OK 2026-07-22）**：Honesty 睡醒改 `cloak-sleep` **倒放** @6fps；披毯入睡 + sleep→wake 串联已书面通过
- **DEV 一键重置本地状态** + **`docs/SHARED_RESOURCES.md`**（原 §6.3 / 6.4，已落地）
- **下一步（渐进）**：Playwright 扩更多 DOM 场景步骤；序列观感仍靠契约单测 + TEST_TRACKER 分列人工行
- **RESPONSIVE_LAYOUT.md（2026-07-21）**：移动浏览器权威基线——功能对等（竖/横屏逐步可操作、禁按钮失灵）、竖屏 P1 + 可建议横屏；`TEST_TRACKER` / `DEV_WORKFLOW_QUALITY` 已挂窄屏验收
- **响应式 UI 两项已立项（2026-07-21 用户拍板）**：① **Task 1 代码已落地**（互斥 + Sit 防截断，待人工）→ `task-responsive-narrow-onboarding-sit.md`；② 横屏建议 UI → `task-responsive-landscape-suggest.md`（Task 1 人工后再做）。见 `TASKS.md` 响应式节
- **工程加固四步（2026-07-21 拍板）**：见 `ARCHITECTURE.md` — ① JSDoc ② SessionUiGate ③ 回归锁 ④ Lit 试点 **`OnboardingHintsUI` 已接线**；**复测通过后先停试点、不扩面**（须另拍板才扩）；待人工复测尖角/补救全铺；禁止全仓 Lit / 动 Emotion·Idle
- **SessionUiGate**：`arrivalGateReady` / `completionPending` / 叠层占用收束；失败用例并入 `npm run test:smoke`

**已完成并验收通过的功能**（按仓库/对话实际交付填写，不含未落地的设计）：

- Companion Mode：Here & Now / Flow **选中即开计时**（须 Arrival 门闩就绪）；**Offline 跳过 Arrival 即开**；**「How shall we sit?」随时展开三选一**（`resolveCompanionHintClick` → toggle；**Sit** 未就绪时仍走 Arrival）
- Honesty `dormantWake`：选时长即播 `cloak-sleep` **倒放**（**6 fps**）定格末帧；暂不接闭眼呼吸淡入 / 金光 / halo
- 3D 场景骨架与专注基础环：Renderer / Scene、`FocusSession` 计时、随 focusLevel 变化的金色视觉反馈（历史实现为材质插值，按 2026-07-15 视觉原则该做法已废弃，重构并入「奖励柜」任务）、`StateManager` + HUD、主按钮「Sit with Yin / Rise」（与阿寅同坐 / 起身）交互
- 多姿态 GLB：`PoseManager` 预加载、包围盒归一化对齐、姿态切换过渡；调试与正式入口已收敛到 `EmotionController`
- 闭目坐禅 3D Idle 运行时已换为「单色暖浅灰棉麻禅修服 / 茶服风、无红边」：源文件（gitignore）`art-reference/models/sources/yin-meditate-closed-monochrome-grey-cotton-linen-robe.source.glb`；运行时稳定路径仍为 `public/models/tiger-meditate-closed.glb`（约 **1.6MB**：贴图 1024/512 + lossless WebP + Draco、不减面；避免默认 WebP 压到 ~300KB 损伤织物细节）。旧「灰棉麻 + 深红镶边」保留为历史备份；2D 主线与图生视频 / 奖励柜 3D 统一以 `CHARACTER_BIBLE.md` Costume 为准
- IdleOrchestrator：闭目坐禅 = `idle-breathing`（**2.5 fps**）×5 → 单次眨眼 → 往复；张望/喝茶等为候选手势（非 Idle 池）
- Ambient Sound FAB：进应用即可见（body、z-index 22）；未 FOCUSING 点击提示须先进入专注模式；FOCUSING 才可开面板
- 双唤醒视觉分离：Honesty `dormantWake` 走 `cloak-sleep` 倒放；调试 `wakeUp` 用伸懒腰（stretch-reminder 同源）；Honesty 暂不接金光/halo
- IdleOrchestrator 五变体池曾接入后又撤回：现为候选陪伴手势目录（`companionGestureCatalog`），正式 Idle 仍仅呼吸×眨眼
- 动态效果层：`DynamicMotion`（呼吸起伏、绕 Y 轴旋转、庆祝悬浮）— **仅 3D 奖励柜**；2D 主界面调试面板已移除对应开关
- 「今日一炷香」完成反馈：`IncenseGreeting`（莲花渐显 + 金色粒子），经 `playEmotion('incenseComplete')` 触发
- `EmotionController.playEmotion()` 统一情绪桥：业务侧不直连 PoseManager / DynamicMotion；映射表含已实现态 + 大量占位态
- 鼠标/指针刺激检测：`PointerInteraction`（靠近 / 点头 / 抚摸分阈值 / 绕圈 / 静止歪头 → `playEmotion`；Celebrating 期间摸头忽略）
- 眼睛跟随：`EyeTracking` 实时瞳孔跟随 **已废弃（2026-07-19）**，原因见 `CORE_LOOP.md`；看向某处改由 Idle 离散张望 gaze-p1～p4
- 文档体系：`PRODUCT_POSITIONING` / `MVP_PRODUCT_DEFINITION` / `PRINCIPLES` / `ARCHITECTURE` / `DESIGN` / `EMOTION_BIBLE` / `PROCESS` / `CHARACTER_BIBLE` / `TASKS` / `COLLAB`
- 工程路径命名已清理：`focus-tiger/` 内受 Git、代码、构建或工具链处理的文件名统一为 ASCII 英文；原中文/特殊省略号命名的参考图和历史任务稿已改为英文 kebab-case，中文内容仍保留在文档正文中
- `PRINCIPLES.md` 已新增「路径必须使用英文 ASCII」硬性规则：未来新增文件/目录统一采用小写 `kebab-case`，用户素材与压缩包须先按语义重命名再入库；always-applied 项目规则已同步。现存路径审计未发现中文、空格、括号或省略号，但严格 kebab-case 审计发现 281 个历史遗留路径，暂仅记录、不在本 Task 重命名
- 产品定位文档 `PRODUCT_POSITIONING.md` 已纳入项目：确立正念伙伴（非传统电子宠物）、regular practice at your own pace、宁静型游戏化、三级完成反馈与只增不减的共同经历/纪念奖励；产品语义层级高于 `DESIGN.md`
- `.cursor/rules/focus-tiger-docs.mdc`：项目级规则 `alwaysApply`，权威文档摘要兜底
- 多语言骨架：`src/locales/i18n.js`（`t` / `tPool`）；`en` / `ja` ready，`zh` draft staged；**v1.0.0 对外 English + Japanese**（可点切语；中文延后）
- 角色分工写入 `PROCESS.md`（Architect / Three.js / Gameplay / UI / QA）
- Git 半自动同步护栏：`PROCESS.md`「Git 同步节奏」、`./scripts/git-sync-safe.sh`；Agent `stop` 的 macOS 系统通知钩子已于 **2026-07-21 关闭**（脚本仍保留于 `.cursor/hooks/remind-git-sync.sh`，hooks.json 的 `stop` 为空；**不**自动 push）
- `wave-hello` 挥手序列已替换为新服装正式版（19 帧，`frame_001.png` ～ `frame_019.png`）；旧深红袈裟 14 帧素材已下线移除；`SpriteSequencePlayer` 对接与 `playEmotion('welcomeBack')` 接线保持不变（分层路径规范见 `ARCHITECTURE.md`）
- `CHARACTER_BIBLE` Master Character Prompt 已按 `wave-hello`、`tilt-think` 等正式素材同步为暖浅灰棉麻单肩斜襟服装，补全颜色、织纹、光泽与剪裁约束，并明确排除旧版深红布料、红色镶边及未获批准的服装莲花刺绣；`DESIGN.md` 材质说明同步更新
- `SpriteSequencePlayer` 首版：单 `<img>` 预加载换帧、rAF 帧率控制、循环/末帧停留、立即打断、播放完成回调、逐帧额外停留配置；`waveHello` 已经 `playEmotion('welcomeBack')` 接线，第 8 帧抬手顶点额外停留 400ms，并完成 Vite 浏览器运行验收（播放、循环、停止、播完淡出回落 `Idle`）
- 角色/装扮可替换架构预留：`CharacterConfig.js` 为外观标识与素材路径拼接唯一出口（默认 `tiger-cub` / `monk-robe-default`）；素材按 `sprites/{characterId}/{outfitId}/{animationName}/frame_NNN.png` 分层入库；清单只存动作名 + 帧数，播放器按当前外观实时解析路径（本阶段不做换装 UI）
- 三类非模态提醒运行时链路：`ReminderQuotaManager` 按用户本地自然日持久化共享额度（`MindfulAcknowledge` / `stretchReminder` / `Re-focus Acknowledge` 合计每日最多 3 次）；`AttentionSignals` 合并并去重 visibility + blur/focus 离开事件（20s 候选记账、超过 60s 回归展示）；`MindfulReminderController` 实现 20 分钟阶段确认、活跃累计 2 小时舒展提醒、Re-focus 每会话最多 1 次及强反馈静默让位；三类提醒复用 `MindfulAcknowledgeToast` 非模态 UI 与观察式中英文文案池。新增 11 项单元测试并通过，生产构建通过
- Tiger Reflection Moment（结束反思）MVP：会话结束后（正常完成在庆祝完整播放并回归坐姿后留白淡入；主动结束不播完成反馈、短暂留白后淡入）逐题展示三问（今天注意到什么 / 有哪些情绪来访 / 下次想把注意力带回什么），每题独立可跳、Skip 与 Continue 同级、Esc 整体划过；无提交/必填/进度数字等表单元素；仅非空答案本地保存最近 5 条（`focus-tiger.reflections.v1`），全部跳过不落记录，不做标签化/统计。`TigerReflectionMoment` + `ReflectionFlowState` + `SessionEndFlow` + `Storage` JSON 封装，5 项单元测试与浏览器全路径验收通过
- Honesty Check-in / DORMANT：`DORMANT_IDLE_HOURS`（默认 **2**）滚动窗口——距最近一次专注结束（达标或 Rise）≥ 该时长 → 惰性进入 `STATES.DORMANT`；新用户无结束记录不触发；当日首次进 DORMANT 播 `cloakSleep` 正放再 `sleeping`。Honesty 从睡态补登仍走 `dormantWake`；`DailyCompletionStore` 与正常计时共用；不占共享提醒池。`getLocalDateKey` 抽至 `utils/localDate.js`
- `Celebrating` 2D 正式素材：`celebrate-dance`（57 帧，`loopMode: none`）一次性叙事弧线（起身→慢速舞+小金光→施礼）；播完 EmotionController 回归 idle-breathing；会话结束时序改由序列 `onComplete` 驱动（不再固定 4s）
- `Sleeping` / DORMANT 2D 正式素材：同源 `cloak-sleep` 末尾 **030–034**（每帧两拍、`loopMode: pingpong`，先 034→030）持续循环；与披毯入睡末帧同姿；旧 `sleeping/` 8 帧目录保留未删
- 2D 主线默认隐藏 3D canvas（`PoseManager.setCanvasHidden`）；透明精灵后不再露出垫底模型；GLB 仍保留给奖励柜
- `idle-breathing` **约 2.5 fps**（放慢 2×）+ 每 5 循环眨眼一次；`sleeping` **约 2 fps**
- `Smiling` / `Blink` 接入 `blink-smile`；Idle 自发变体含 blink-smile；Honesty 唤醒后接 `haloBreathing` 奖励呼吸
- 一炷香莲花/金斑改 DOM 叠层（`#incense-fx-overlay` z-index 4），保证在 2D Yin 前方
- Honesty Check-in UI：Mindful Check-in 标题加粗加深、呼吸面板与 Sit with Yin 按钮立体化
- `dormantWake` 2D 正式素材：同源 `dormant-wake` 16 帧一次性正放（深睡→完全清醒坐姿）；呼吸引导期间保持 sleeping，sleeping→wake 与 wake→idle-breathing 均采用 180ms 双图层 cross-fade；末帧短暂停留，完整回落由序列 `onComplete` 驱动，既有 FocusVisualizer 金光继续作 Rim Light 重构前占位
- `nodGreeting` 2D 正式素材：`nod-greeting` 23 帧一次性点头致意；`PointerInteraction` 靠近检测（半径/滞后/节流）已就绪并改接本键，播完回归 idle-breathing；原 `lookAtCursor` 保留为兼容占位
- `curiousTilt` 静止好奇：默认视觉改为 `blink-smile`（替代托腮 `tilt-think`）；靠近区静止 4 秒触发，冷却 6 秒；**1s CapCut** 进出（2026-08-03）
- `SessionComplete` 正式动作层：`session-complete` 28 帧完整叙事摆尾（约 2s、`loopMode: none`；光环/粒子已烧录）；完成前查询 `DailyCompletionStore`，每日首次只触发 `Celebrating`，同日后续只触发 `sessionComplete`；播放期归零 FocusVisualizer / Rim Light，播完回归 idle-breathing 后再进入 Reflection Moment
- `MilestoneGlow` 调试预览：`milestone-glow` 27 帧完整叙事（金光+蝴蝶已烧录，无独立 DOM 层）；末帧固定停留 2.5s 后回落；播放期同样归零实时金光；真实里程碑判定仍属 Backlog「纪念奖励系统」
- Session Intention / Arrival Practice v2 MVP：Sit → 欢迎（blink-smile）/ Notice 点选（不落库）/ ~5s 呼吸 / Choose（图标+打字，`intentions.v1`+source）→ Companion Mode → 再 Sit 计时；Skip / Skip — begin；Reflection 按来源回显；见 `CORE_LOOP.md` / `ARRIVE_MOMENT_DESIGN.md`
- 光影物理渐进（2D）：`LightProgression` — Arrival 冷→暖、三层视差 Dolly（背景 1.06 / Yin 1.12）、4s 呼吸光环、Choose 坐垫光晕；日常 `focusLevel`→DOM Rim；Recover/Re-focus 扰动+约20%亮度下降、5s平复；原则写入 `PRINCIPLES` / `ARCHITECTURE`；详规 `LIGHT_PROGRESSION_DESIGN.md` / `task-briefs/task-light-progression-parallax-rim.md`；初稿 Re-focus 安慰句未过观察式自检，继续用 `REFOCUS_ACKNOWLEDGE` 池
- `MindfulAcknowledge` 正式动作层：`nod-bow` 13 帧克制点头鞠躬（`loopMode: none`）；20 分钟阶段确认与 Re-focus 通过同一 `mindfulAcknowledge` key 播放，Re-focus 仅传 `subtype: 'refocus'`；**主动 Recover** 传 `subtype: 'activeRecover'`（不占提醒额度；180s 冷却；Tiger Anchor UI）；强反馈检查仍在申请额度和播放动作之前，冲突时静默让位且不补发；播完回归 idle-breathing
- `stretchReminder` 正式动作层：17 帧 `stretch-reminder` 坐姿张臂舒展序列（`loopMode: none`），复用既有活跃累计 2 小时触发、共享额度、非模态文案与强反馈让位链路，播完回归 idle-breathing。归属判定依据：该序列从清醒坐姿起势并向外张臂，现有 16 帧 `dormant-wake` 从侧卧熟睡过渡为清醒打坐；起始姿态、动作弧线、构图和帧数均不同，故按情况 A 独立入库，不替换 Honesty Check-in 动作
- 播放器层候选素材（尚未绑定 emotion key / 业务触发）：`halo-breathing` 30 帧与 `blink-smile` 12 帧已按统一 `frame_NNN.png` 规范入库；播放器新增 `startFrame` 子序列支持，并注册 halo 方案 A（001–006 once → 007–030 pingpong）、方案 B（001–030 pingpong）及 blink-smile forward 技术试播定义。端点检查显示 halo 030→007 差异约为相邻帧中位数的 2.46 倍，blink-smile 012→001 约为 4.22 倍，二者均暂不接入正式调度
- 2026-07-18 五套新素材（见 `docs/NEW_ASSETS_2026-07-18.md`）：`celebrate-dance-v2` 作 Celebrating 50/50 变体；`palms-together` 接 `intentionSet`（Choose 确认，与坐垫 CSS 光晕叠加）；`breath-halo-expand` 作 MilestoneGlow 简化备选（仅登记）；`lotus-front-rising` / `lotus-chest-halo` 仅入库（纪念奖励 Backlog）
- 2026-07-19 12:56：上述及相关共 **14** 套序列用新抠图算法整批重出并覆盖入库（帧数/接线不变；旧版作废）；见 `ASSET_INVENTORY.md`
- 美术/动画全量盘点（2026-07-18）：`docs/ASSET_INVENTORY.md` + Canvas `focus-tiger-emotion-asset-inventory`；19 目录 / 407 帧；相对 07-17 新增 5 套

**明确未完成（勿当作已验收）**：

- 完整 Focus Confidence V1 运行时信号链路（可信度分值与 idle 检测）仍未实现；Re-focus 所需的最小 visibility + blur/focus 信号切片已由 `AttentionSignals` 落地
- 大部分互动情绪的真实动画（摸头/绕圈等）；正式瞳孔 PNG 已接入
- Session Intention / Arrival Practice v2（✅）：Sit → 欢迎/Notice/呼吸/Choose → Companion Mode → 再 Sit 计时；Notice 不落库；Choose `intentions.v1`+source；Reflection 按来源回显；见 `ARRIVE_MOMENT_DESIGN.md` / `CORE_LOOP.md`
- `SessionComplete` 的非模态观察式文案尚未实现；情绪键、2D 动作、完成事件分流与自动回落已完成
- `MilestoneGlow` 真实里程碑判定与业务触发尚未实现（27 帧素材与调试预览键已接入；FOCUSING 日常光环呼吸律动仍待正式 Rim Light 路径），归属 Backlog「纪念奖励系统」
- 角色/装扮可替换**完整功能**（用户可选换装 UI、多套角色/装扮素材）尚未实现；`CharacterConfig` 架构扩展点与素材路径/情绪触发解耦已落地
- DORMANT 唤醒仪式的 Rim Light 正式重构仍待替换既有 FocusVisualizer / setFocusLevel 占位光效；`dormantWake` 真实 2D 睡醒序列已接入
- Phase 0 清单中的持久化（除当日完成记录外）/ PWA 等（见 `TASKS.md`；DORMANT 唤醒仪式已摘出，见上条）

**正在进行 / 最近决定的事项**：

- **响应式 UI Task 1（代码已落地 · 待人工）**：窄屏 onboarding 互斥 + Sit 不截断 — Brief `task-responsive-narrow-onboarding-sit.md`；`TEST_TRACKER` 两行待复测
- **响应式 UI Task 2（待开发，排在 Task 1 人工验收后）**：竖屏横屏建议条 — Brief `task-responsive-landscape-suggest.md`

- 技术路线已从「3D 多姿态 GLB 主线」切换为「2D PNG 序列主线」；3D 定位为奖励柜
- `EMOTION_BIBLE` 持续扩充：互动清单、MindfulAcknowledge、自主/响应分层、多语言规范
- `CHARACTER_BIBLE` 已归档 Master Character Prompt，并澄清 Rive / 双莲花 / 蒲团 / Suffix Prompt
- 指针检测与眼睛跟随的**检测/跟随逻辑已接线**，视觉表现多为占位，待后续真实素材
- **产品市场定位已明确**：优先面向海外市场，产品名统一为 `Focus Tiger`，UI 默认语言由中文改为英文，中文作为可切换语言保留；dev-only 调试面板不纳入字典并保持原样
- **无互动约 10 分钟已拍板**：保留加权随机（70% 继续冥想 / 30% 挥手），挥手分支使用已入库的 `wave-hello`；具体触发计时源仍待与 Focus Confidence 决策口径统一
- **架构决策已落地**：为应对角色/装扮市场接受度不确定性，提前预留「角色/装扮可替换」扩展点（`CharacterConfig`）；当前仍固定单一角色（小老虎僧袍造型），不做用户可选换装 UI，仅解耦素材路径与情绪触发逻辑
- **非模态提醒额度与 Re-focus 阈值已拍板并实现（2026-07-16）**：正念阶段确认 / 伸懒腰判定维持会话墙钟 20 分钟、活跃累计 2 小时（离开时暂停、两场会话间隔 ≥30 分钟重置累计）；三类提醒共用本地自然日额度、合计每日最多 3 次；Re-focus 每场会话最多 1 次；离开满 20 秒只内部记账，超过 60 秒并返回才允许展示。具名常量与单元测试已落地
- **已确认（2026-08-14 修订）**：Git 采用「Task 后 commit + **默认** push 旁支/开 PR；CI 绿合 `develop`；人工测试事后批量关单」。禁止 post-commit 钩子自动 push；禁止直推 `develop`/`main`；生产 Worker 须明确「部署」
- **Git 提醒已关闭（2026-07-21）**：此前 `stop` hook 曾用 `followup_message`（耗 credits），后改为 macOS `display notification` 且只返回 `{}`；现按用户要求从 `hooks.json` 卸下，不再发系统通知；脚本保留便于日后挂回
- **Agent 终端权限收紧（2026-07-26）**：仓库级 `.cursor/permissions.json` 取代裸 `git`/`gh` always；`beforeShellExecution` 硬门禁破坏性 git/gh（见「Git 同步节奏」）
- **已确认并实现**：新增 `welcomeBack` 情绪键；`SpriteSequencePlayer` 首版使用单 `<img>` 预加载换帧；2D overlay 覆盖于现有 3D canvas 之上
- **视觉原则修正已拍板（2026-07-15）**：角色本体固有色恒定不变，金色进度改由外围光环/环境光反射（Rim Light）表达，禁止本体重着色。改动范围：只改文档确立新原则（`DESIGN` / `PRINCIPLES` / `ARCHITECTURE` / `EMOTION_BIBLE` / `TASKS` 已同步），2D 主线金色表达定义为「金色光晕 overlay + 粒子」写入 `ARCHITECTURE`；3D shader（`TigerCharacter` 灰→金插值、`Constants` 命名）仅留 TODO 标注不重构，重构并入未来「奖励柜」任务；历史任务书保留原文 + 顶部注记
- **产品定位 V1.0 已定稿（2026-07-15）**：角色对外统一为 Mindful Companion，不采用喂养、健康退化、照料责任或宠物收集叙事；`daily practice` 改为 `regular practice, at your own pace`；庆祝统一为「短暂、温暖、有情感」；每次完成轻量确认、每日首次达标完整庆祝、长期里程碑纪念奖励；「小老虎更健康」改为共同经历增加、环境细节解锁与永久纪念物
- **产品定位与核心成长模型已升级（2026-07-16）**：`PRINCIPLES` 新增中英一句话定位与差异化表达——Focus Tiger 不是又一个番茄钟 App，而是 AI 时代帮助人类重新训练注意力、觉察力与内在自由的正念陪伴伙伴；核心逻辑升级为「觉察 Awareness → 专注 Focus → 心流 Flow → 内在成长 Growth（小老虎陪伴）」，并明确专注不是最终目标，而是训练觉察能力的一种方式；该模型作为 `EmotionController`、`MindfulAcknowledge` 等后续功能的上位指导原则
- **Session Intention 已拍板（2026-07-15）**：开始专注前可选单行意图输入（可跳过、不减反馈、仅会话内显示 + 结束语回显、本地保存最近几条），不参与达标判定、不做待办管理器；已立项为 `TASKS.md` Phase 1 任务十，排队开发（建议排在 `SessionComplete` 之后衔接结束语）；定量公开目标维持现状（目标时长 + 一炷香），Focus Confidence 分值继续不直接展示
- **环境细节解锁方向已拍板（2026-07-15）**：莲花池（5 天首朵、10 天第二朵、逐步至满池）、小香炉（3 天，一炷香烟从香炉升起）、蒲团刺绣（30 天）、夜间小灯笼 + 白天小茶盏（60 天成对）；不采用背景远景类添加（保持极简空灵）；只增不减、永久保留；详见 Backlog「纪念奖励系统」，具体实现待该任务排期
- **核心正念原则与语言规范已确立（2026-07-15）**：`PRINCIPLES` 新增「观照者而非情绪本身」——一次性/响应性情绪必须自动回归坐姿呼吸基底；`EMOTION_BIBLE` 新增观察式措辞规范（描述现象、不贴标签、不追因、不建议）及六场景中英示例，未来所有非模态文案必须通过四项自检
- **Re-focus Acknowledge 最小运行时已落地（2026-07-16）**：作为 MindfulAcknowledge 特化子类型，用户从超过 60 秒的页面离开返回时复用统一非模态文案条，按观察式文案呈现；与强反馈冲突时静默让位、不补发。该最小链路不等同于完整 Focus Confidence V1，后者的 idle 检测与可信度分值仍未实现
- **MilestoneGlow 里程碑金辉时刻已定稿（2026-07-15，仅文档）**：长期里程碑节点（连续 7/21/100 天、累计时长等）的仪式性反馈，比 `Celebrating` 更隆重一档（优先级 110）；10s 分镜定稿：呼吸律动金光 → 全身金色 Rim Light 勾勒 → **一只金光蝴蝶**环绕（原「几只萤火虫」已修订）；老虎全程闭目坐禅不做动作，与每日 `Celebrating` 的社交性庆祝分工明确；蝴蝶为一次性过场、随金光淡去不留驻；视频源已产出，抽帧与实现归属 Backlog「纪念奖励系统」。同时拍板：分镜前段的「金光随呼吸律动」（吸气收敛/呼气晕染，同步 4s 呼吸循环）定义为 FOCUSING 光环**通用行为**，已写入 `DESIGN` / `ARCHITECTURE` / `EMOTION_BIBLE`
- `waveHello` 真实序列已通过 `EmotionController.playEmotion('welcomeBack')` 接线，支持 rAF 帧率控制、循环/末帧停留、立即打断、预加载及播放完成回落 `Idle`
- **结束反思两项措辞/时序已确认（2026-07-16）**：反思问题三采用「下次想把注意力带回什么」而非「明天」，避免暗示每日义务（与 regular practice, at your own pace 一致）；`IncenseGreeting` 产品语义为「今日一炷香完成」，**不**在用户主动提前结束时播放，主动结束路径直接回归坐姿后淡入反思面板
- **MVP 产品定义补充已校正并纳入（2026-07-16）**：新增 `MVP_PRODUCT_DEFINITION.md`，将首要用户、JTBD、竞争替代品、成功指标、付费与隐私从旧补充稿整理为产品策略基线；删除“每日回来”“小老虎随用户成长/退化”“AI Coach/情绪分析默认进入 Premium”等与当前原则冲突的表达，并把未经验证的人群、数字目标、价格和付费形态明确标为假设
- **Honesty Check-in / DORMANT 唤醒仪式已定稿（2026-07-16）**：DORMANT 改为「当日自然日尚无任何已完成会话」；可忽略提示 `Did you practice elsewhere?` → 选 10/20/30+ 分钟 → 10s 呼吸引导 → `WakeUp`（伸懒腰 + 既有 Rim Light）；补登与正常计时一视同仁、无验证语气、不占共享提醒池、不设每日次数上限。旧「连续 3 天 + 1 分钟唤醒且不计会话」口径废止；`PRINCIPLES` 新增「诚实机制」，`DESIGN` / `EMOTION_BIBLE` / `TASKS` 任务五已同步
- **新增设计并排期开发「打卡返还 & 唤醒仪式（Honesty Check-in）」功能**：允许用户手动补登在其他场景完成的专注/正念练习，体现产品「诚实机制」设计原则，与核心视觉原则（Rim Light 金光反射）对接；**MVP 运行时已落地**（情绪键 `dormantWake`、当日完成记录、可忽略提示与 10s 呼吸引导）；光效暂用 `FocusVisualizer` / `setFocusLevel` 占位，Rim Light 重构后替换
- **Honesty Check-in 拍板四项（2026-07-16）**：新建 `dormantWake` 不复用 `wakeUp`；`30+` 按 30 分钟记账；`getLocalDateKey` 抽至 `utils/localDate.js`；未达标 End Focus 保持 DORMANT、不写完成记录、无失败/未完成类文案
- **Companion Mode（专注会话陪伴模式）已定稿并实现 MVP（2026-07-16）**：Start 后先选 Stay here / I'll step away；`FocusSession` 墙钟计时；step-away 下 `suppressAwayReminders` 关闭 Re-focus（仍暂停活跃累计）；达标复用 `celebratePending → CELEBRATE → SessionEndFlow`；回页 `visibilitychange` 校正完成。与 Honesty Check-in 独立
- **Companion Mode 三选一扩展已定稿（2026-07-16，仅文档）**：识别 Focus Confidence「标签可见=专注」对知识工作多工具切换的系统性误判；新增第三子模式 **I'm working across tools**（关离开类提醒、宽松 idle 兜底建议 ≥30 分钟、墙钟计时）；对策为用户自主声明（诚实机制）而非技术探测。运行时 UI / 代码待交互拍板后另开任务
- **Companion Mode 三选一运行时已落地（2026-07-16）**：Sit 下提示「How will we do this?」向上展开；选模式只预选不开始；Sit 才计时；`localStorage` `focus-tiger.companion-mode.v1`；across-tools 用 `suppressAwayReminders` + `AcrossToolsIdleGuard`（30min）
- **核心交互按钮文案已更新（2026-07-16）**：`BTN_FOCUS_START` / `BTN_FOCUS_STOP` → Sit with Yin / Rise（与阿寅同坐 / 起身）；正常完成与中途结束共用「起身」，不做完成/放弃区分。原则见 `EMOTION_BIBLE`「核心交互动词」
- **产品命名 Backlog 已记录（2026-07-16）**：当前阶段保持「Focus Tiger」不更名；建议副标题承载更深定位；完整更名待用户反馈后评估（见 Backlog「产品命名」）
- **角色正式名落定（2026-07-16）**：中文「阿寅」、英文「Yin」（`CHARACTER_BIBLE` + i18n `CHARACTER_NAME`）；`characterId` 仍为 `tiger-cub`；用户自定义改名标为远期 Backlog（`DESIGN`「老虎的名字」）；文档通称「小老虎」不替换
- **禅意背景音（Ambient Soundscape）功能已确认排期开发（2026-07-16）**：追踪 Focus Tiger 自身播放音频的实际时长，并转化为金光 / Rim Light 强度增强信号；与 Companion Mode 独立、互不依赖；设计原则见 `DESIGN.md`「禅意背景音」
- **禅意背景音 MVP 已落地（2026-07-16）**：角落展开 UI；**Mer-Ka-Ba**（Jesse Gallagher）/ **Meditation Impromptu 02**（Kevin MacLeod）等，YouTube Audio Library；`presenceBoost` 叠视觉；归因见 `public/audio/ambient/ATTRIBUTION.md`
- **禅意背景音内置清单扩容（2026-08-05）**：PR #125 合入 tip **`dd09711`**——Mer-Ka-Ba 后 Jesse Gallagher×4 + Reed Mathis Somnia×2；合计 12 内置曲；ambient 目录约 188MB
- **无角色语音原则已落档（2026-07-16）**：沟通仅文字（非模态文案等）；禁止真人配音与 lip-sync；长期原则、非 Backlog（见 `PRINCIPLES.md`）

**下一步计划**：

- **可靠性 · 练习记忆云端快照备份（免费 A · #272 已合 · 勿漏关单）**：运行时已合 tip `a195584`；Worker 已 redeploy；**OTP secrets 已补**（2026-08-13 用户书面绑邮箱收码 + Enable 成功）。**下一步**：TRACKER 空库恢复 / 关备份删云端（关单只认 develop tip）。**≠** v1.1 云端算法、**≠** B 多端无缝。
- **内容 · Daily Wisdom → Reflection Phase A（Phase A 已挂 Reflection · 关单级见 TRACKER）**：Brief `task-daily-wisdom-reflection-mount.md`；**禁止**塞 Phase B 印花进同一 PR。
- **付费 · 意愿漏斗 opt-in 回传（#262 已合 tip `582e79f`）**：Privacy 明示同意；默认关；关单级人工见 TRACKER。
- **付费 · Ambient Deep 15s 试听（#258 已合 tip `2b3db1c`）**：转化层试听 + Unlock 提示；关单级人工见 TRACKER。
- **增长 · Journey Daily Card（Save image · 勿漏）**：Brief `task-journey-daily-card.md`；免费；**Log 上限免费/付费统一 30（有意取舍）**。
- **内容 · Daily Wisdom Phase B 静默印花（A 之后 · 勿漏）**：`feature/daily-wisdom-sanctuary-seal`。
- **身份 · Sanctuary Enso Mark（页面左下角）**：**#254 已合** tip `0adc0d3`；2026-08-15 改钉页面左下角（宽屏真角落 / 375 抬过三球）。关单级人工见 TRACKER。
- **付费 · 转化路径梳理（Backlog · 不挡上列 · 勿漏）**：单独立项盘点「新用户为何第一次付费」——免费用户可见价值时刻、15s 试听后 Unlock 文案、Support 漏斗等。静默印花/Enso **不够**单独支撑经济可持续（见 `PRINCIPLES` 案例锚定诚实边界）。
- **付费 · 场景化请茶气泡（#253 已合 tip `c10acb7`）**：达标 / 里程碑 → `#contextual-tea-tip-bubble` → TipJar；本地日一次；可忽略；不解锁。关单级人工见 TRACKER。
- **付费 · 意愿漏斗本地统计（#255 已合 tip `fea9c11`）**：`MONETIZATION_INTENT_FUNNEL.md`；Support→CTA→Checkout→完成；实验室「意愿漏斗」；**仅本地**——回传见上行 opt-in。
- **付费 · 节日主题引擎（Seasonal Theme · 2026-08-11）**：**B 轨**；Phase 1–3 已合 develop（#233 / #234 / #238）；圣诞窗已放出。下一步 **Phase 4**（其它节日配置/素材；情人节调性审）须另开。权威：`task-briefs/task-seasonal-theme-engine-v1.md`。
- **付费 · Ambient 深度曲 entitlement（#251 已合 tip `5969872`）**：免费温暖 5 首；其余内置曲 B 锁；用户自传仍免费。关单级人工见 TRACKER。
- **付费 · 进阶仪式统一 gate**：三个进阶仪式已读 `isEntitled`；Ambient 深库见上行。
- **场景→动画接线 · A′+B Dispatcher（2026-08-01）**：PR #59 / #65 等已合 `develop`；关单级人工见 `TEST_TRACKER` 场景动画行。
- **用户上传氛围乐（v1.0.0 必交付 · 2026-07-31）**：已合 **`develop`（PR #51）**；Brief `task-user-ambient-upload-v1.md`。关单级人工见 `TEST_TRACKER` 对应行。
- **自动化缺口补齐（2026-07-30 · Task 3+2 + 扩 smoke 已落地）**：`test:smoke` 已含全 unit\*；永不自动化 §5；Honesty/i18n 口径 §8–§9。排期 `TEST_TRACKER` §C。
- **v1 阻塞 · 本地桌面 APP 打包选型（壳未拍板；开会时机已定）**：Electron / Tauri / PWA·薄壳仍待选；**合理时机** = `v1.0.0` 纯本地功能冻结前约 1 周，或你说「准备打 v1.0 / 要桌面包」时立刻开短决策——不挡当前 UI 主线、**禁止**拖到 tag 之后才选。「高于 CI 细节」= 与 CI 工程 Backlog **争排期时先开本决策**（非等 CI 做完）。见 Backlog「本地桌面 APP 打包选型」。
- **PR #2 合并进 `main`（技术可合 · 产品门禁未齐）**：冲突已清、#70 已合、`MERGEABLE`。**合 main 仍须你明确下令** + 五条件清单（人工走查 / 「有问题」处置 / 范围认知等）。Brief：`task-pr2-develop-into-main.md`。
- **PR #2 合并进 `main` 后立刻开工（工程）**：降低 visibility CI flaky 率（见 Backlog「降低 visibility CI flaky 率」）；勿因合并绿灯而搁置。夜间全量 e2e / Plan A **已收口**（见上「CI 定时全量」）；与 visibility flaky **并列**的剩余工程主要是 flaky 根因——**但**若与「本地桌面 APP 打包选型」争排期，**先排打包选型讨论**（实现可后置）。
- **hints 拆分线 / 旧 stash PRD（2026-08-01 已清）**：原 `stash · chore/split-hints-from-pr2` 已随本地 stash 清空处理；PRD 草稿归档见 `docs/archive/stashed-prds-2026-07-24/`（非 SSOT）。回 hints 拆分时读归档即可，勿再找已删除的 stash。
- 为 Ambient Soundscape 替换正式 CC0/授权禅意音效；有合适素材后再补第三曲（磬等）
- 为 Honesty Check-in 的 `dormantWake` 接入真实伸懒腰 2D 序列，并将占位光效替换为 Rim Light 正式路径（待核心视觉重构）
- Companion Mode 与 Session Intention 已在同一预开始 dock 视觉合并（意图在上、三选一在下）；暂不另建独立 BeginPanel 类
- 为已完成动作层的 `SessionComplete` 补非模态观察式文案（每日首次仍由 `Celebrating` 替代）
- 按同一 manifest / player 接口逐步接入后续 2D 情绪序列
- 补正式瞳孔 PNG，调 `EyeTracking` 锚点与偏移 → **已放弃（2026-07-19）**，见 `CORE_LOOP.md`；勿再排期返工
- 后续独立实现完整 Focus Confidence V1（idle 检测与可信度分值），不得把页面切换直接解释为用户心理状态；须遵守 Companion Mode 三选一与 across-tools 边界
- 扩展 PointerInteraction：鼻子 Boop、拉尾巴、抚摸分阶段递进（文档已有，代码未全覆盖）
- 按需推进 `TASKS.md` Phase 0 未完项（勿与 2D 主线混做；**PWA 任务六**须服从「本地桌面 APP 打包选型」，勿单独默认成最终交付形态）
- **v1.1**：云端算法接入（见 Backlog「v1.1 云端算法」）；不进 v1.0.0 范围
- **B · 练习记忆多端无缝同步（可后排）**：免费快照之后；评估是否作 Sanctuary/Membership 付费点（见 Backlog「练习记忆云端备份」§B）

**已知的开放决策 / 待确认事项**：

- **星光斗篷拓展（2026-08-04）**：2A wellness + Expand A（**仅深夜**；白天无操作披毯已关）/ B + 长离 2B；2h→DORMANT 保留互补。
- **语义化版本与稳定发布点（2026-07-30 已拍板）**：SemVer；首稳 `v1.0.0`；稳定版 = `main` annotated tag；开发阶段不切 `release/*`。见 `WORKFLOW.md` / `RULES_INDEX` → `git-semver-release`（非开放项，留此一行防重复开议题）。
- **v1.0 纯本地 / v1.1 云端（2026-07-30 已拍板）**：**v1.0.0** 先发纯本地小发布——核心练习路径**不依赖**联网与云端关键算法，优先保障可离线完整体验；**v1.1** 快速跟进云端算法。代码保留云端可扩展性（保留 `cloud/` 骨架与前后端解耦；**禁止**在 v1.0 把核心门闩绑死在必须成功的云请求上）。隐私仍遵守 `MVP_PRODUCT_DEFINITION`「未来云同步须明示同意」。非开放项，留此一行防重复开议题。
- **场景→动画接线 · Slice A 已合（2026-07-31 / 08-01）**：产品稿 + A 实现已合；**A′ 合十修复 + Slice B 库存消化**见 Backlog。
- **用户上传氛围乐（2026-07-31 已拍板）**：**v1.0.0 必交付**；砍法与 Brief 见上「最近拍板」/ Backlog；**实现已合 `develop`（PR #51）**（非开放产品决策，留此防重复开议题）。
- **本地桌面 APP 打包选型（2026-07-30 · 壳未拍板 · 开会时机已定）**：候选仍为 Electron / Tauri / PWA·薄壳。**何时开讨论（流程已定，勿再问）**：`v1.0.0` 纯本地功能冻结前约 1 周，或你说「准备打 v1.0 / 要桌面包」时立刻开短决策；不打断当前 UI/情绪主线；**禁止** tag 后再选型。**「高于 CI 细节」** = 与「CI 全量 smoke+e2e / 降 visibility flaky」**争排期时先开本决策**；**不是**等 CI 做完才谈（CI 也不是本决策的前置）。云端/离线产品面已拍板（见上条）。详情见 Backlog。**2026-08-07 澄清**：技术方向纪要锁定的是 **v1 不上手机商店原生包**（未来手机壳默认 Capacitor）；**不**取消本桌面壳开放项，亦**不**把 PWA 默认成最终电脑版交付。见 Brief `task-tech-direction-v1-shell-monetization.md`。
- **v1 技术方向 · 壳/付费/健康（2026-08-07 起；2026-08-10 付费方式修订）**：v1 纯 Web；健康非 v1。付费 **双轨**：A Tip/Tea（不解锁内容）+ B 进阶内容解锁。B 下 **Sanctuary Lifetime** 买断 ∪ **Yin Membership** 订阅互覆盖（同一套权益；catalog `subscription` 档为正式产品决定）。共享 Stripe payment 层，**分离** tip 与解锁路径。对外文案走 i18n。**②B 电子书取消**。SSOT：`task-briefs/task-tech-direction-v1-shell-monetization.md`。
- **「?」未读线索 / 朱红用途（2026-07-23 / 7-30 已拍板）**：onboarding 探索性 tip 用薄荷绿 click 圆点（`triggerMode=click` / PR #30）；朱红 `--color-highlight` 留给真正通知/alert，**不再**挂在「?」钮内表示 tip 未读。详见 `ONBOARDING_HINTS.md` §〇 / `TEST_TRACKER` click 圆点 tier 行。
- **应用内提醒横幅 · 忙碌策略（2026-07-23 已拍板）**：固定 **`suppress`**（Arrival / Focusing / Celebrate / Reflection / 微仪式期间隐藏横幅、不排队；**不做** `defer`）。入口在热力图旁；见 `TEST_TRACKER` L186、`SCENARIO_TESTS` 场景 P3、`SHARED_RESOURCES`。
- **「本周陪伴」7 格热力图（视觉验收）**：Idle 左下已挂；请人工看亮/暗对比是否「不羞辱」（暗格仅为浅色，非惩罚）
- across-tools 宽松 idle 兜底频率微调（当前常量 30 分钟，可再拍板）
- Idle 五变体相对权重已写入 EMOTION_BIBLE（gaze 1.0 / tea 0.5 / yawn 0.3 / ear 0.2）；试玩后可再调
- **回归姿态（2026-07-19 已拍板软化）**：一次性情绪播完回归「类似坐禅」即可，不强制像素对齐默认闭目 idle 第 1 帧（见 `PRINCIPLES.md`）
- **EyeTracking**：已正式放弃（2026-07-19），原因见 `CORE_LOOP.md`；勿再开返工任务
- **14 套新抠图（2026-07-19 12:56 已入库）**：含 `palms-together` 等，待人工复测透明边/灰斑是否干净
- 打坐呼吸 ↔ `tilt-think` 若仍跳跃：是否用眨眼类首尾相接循环替代托腮素材（`curiousTilt` 默认已改 `blink-smile`）

**最近拍板（2026-08-12）**：**Web 轻量版本更新提示**——先做「发现新版本 → 点一下刷新」；入口**仅在有新版本时出现**（不常驻）。**不是**补丁包下载；桌面壳真更新器等打包选型。非阻断（Focus/Arrival 不弹窗强刷）；与 Stripe 解耦；不做推送。Brief：`task-briefs/task-web-soft-update-prompt.md`。**实现已合** [#263](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/263)（tip `38edfe0`）；docs-only #261 已关（superseded）。

**最近拍板（2026-08-12 · 练习记忆云端：免费兜底 vs 付费无缝）**：

1. **A 免费优先**：练习史 / Journey Log（+ 必要里程碑戳）→ **定期/关键后静默云端快照 + 空库/清机恢复**；解决「不出问题」（含 Safari/ITP 本机静默清库）；**首版不做**实时双向同步。  
2. **B 付费可后排**：多端无缝陪伴记忆 = 体验升级，可作 Sanctuary / Membership 权益；**禁止**把防丢失做成付费墙，也**禁止**把完整无缝默认真全体免费。  
3. **身份**：唯一复用既有 **邮箱 OTP**（与付费 restore **一套身份、两种用途**）；**不做**匿名 device id 跨端。  
4. **未绑邮箱**：无云端兜底；本机清理风险用户自行承担；实现 A 时须 **温和、非打断**提示（例 Journey Log 角落绑定引导；非弹窗；文案另定）。  
5. **与 v1.0 纯本地**：核心练习仍可离线；A 为可选增强（有网+已绑邮箱才备份）。隐私明示同意仍适用。  
权威表：`FREE_PAID_MATRIX`；详情 Backlog「练习记忆云端备份」；实现 Brief：`task-practice-memory-cloud-backup-a.md`。政策 **#266** tip `4698348`；运行时 **#272** tip `a195584`；矩阵 redeploy 注 **#273** tip `ef5ff3e`。**OTP secrets 已补**（2026-08-13 用户书面绑邮箱收码 + Enable 成功；非关单）。TRACKER 仍待空库恢复 / 关备份。

**最近拍板（2026-08-10 · Yin Membership 纳入 v1）**：推翻「B 仅 Lifetime / v1 无订阅」。**双轨**心智不变：A 打赏·不解锁 + B 进阶内容解锁。B 下两种付费方式并存——**Sanctuary Lifetime** 一次买断 ∪ **Yin Membership** 订阅；**lifetime ∪ subscription 互相覆盖**（同一套进阶权益，非三档）。订阅到期：已生成内容永久可看，只停新解锁与进阶使用。AI Coach 红线不变。A→B 24h 体验卡仍非 v1。SSOT：`MVP_PRODUCT_DEFINITION` §五 + monetization Brief。

**最近拍板（2026-08-07 夜 · 双入口命名纠正）**：纠正「单名合并」——**A Tip/Tea** 与 **B Sanctuary** **并存**。founder **不**改名为 Sanctuary，改道 **`feature/yin-tip-jar`**（Tea/Tip i18n + `tipGate`）；B **新建** `sanctuaryEntitlementGate`；共享 payment、分离 gate/UI/storage。**②B 电子书直接取消**。Brief §八双表待确认后再改代码。

**最近拍板（2026-08-07 夜 · Prompt 收紧双轨 · 命名嗣后纠正 · 付费方式已被 2026-08-10 修订）**：A Tea + B Sanctuary 并行；当时写「B 仅 Lifetime；24h 漏斗非 v1」。**「仅 Lifetime / 无订阅」已废止**（见上条 08-10）；24h 漏斗非 v1 **仍有效**。

**最近拍板（2026-08-07 晚 · 双轨付费 · 历史）**：曾写 Lifetime 为主、订阅非首选、可选 24h 漏斗——夜 Prompt 曾改为「无订阅 + 漏斗非 v1」。**「无订阅」已被 2026-08-10 废止**；漏斗非 v1 仍有效。

**最近拍板（2026-08-07 · Sanctuary 单名收敛 · 已废止）**：曾锁「对外只留 Yin's Sanctuary、founder 并入」。**已被双入口并存取代**；本条仅作历史，禁止再当 SSOT。

**最近拍板（2026-08-07）**：技术方向纪要初稿——v1 纯 Web；未来手机壳 Capacitor；桌面壳仍开放；健康非 v1。

**最近拍板（2026-08-06）**：增长向内容包（YouTube → 签文 → 电子书 A）口径已锁；**可延后增发**。①/③ 已合；**②A 延后**；**②B 已于 2026-08-07 取消**（不改造）。Brief：`task-briefs/task-growth-content-pack-decision.md`。

**最近拍板（2026-08-05）**：吹花鼓励冷启动微仪式——策略 C + 同日 XOR 欢迎池；观察式文案；时机/交互/flag 见 `FLOWER_BLOW_WELCOME_DESIGN.md`；**先 Phase 1 Lab，再产品接线**（须走 Dispatcher，禁止平行硬调）。

**最近拍板（2026-08-04）**：FocusHUD **否决「随风浮动」**——只保留毛玻璃隐退（Arrival 式半透明）；禁止整卡 `translate`/微旋转漂浮，以免与静置 chrome 风格不统一。见 `DESIGN.md` FocusHUD；`TEST_TRACKER`「冷启动首屏呼吸感」。

**最近拍板（2026-08-01）**：场景动画——Honesty **≤20 / ≥30**；日语合十；勿接已取代；**Dispatcher 必做**；设计师其余项**一批**进 A′+B（非整碎）；驳回完成池 dance；Milestone/stretch/en 鞠躬已接线免重做。Brief `task-scene-animation-inventory-wire-slice-b.md`。

**最近拍板（2026-07-31）**：**场景→动画接线表**正式产品稿；**Slice A** 已实现并合 develop（PR #59）。

**最近拍板（2026-08-10）**：**向阿寅倾诉（Confide to Yin）**——禅意倾听者；检索不生成；**危机安全阀** `safety_redirect` 优先（#223）。禅意 18 + safety-01 人审 **ok**。运行时：`feature/confide-to-yin` 分类/语料/面板已接线；**产品挂载仍关**（`CONFIDE_USER_MOUNT_ENABLED=false`）。**待评估**：safety 是否附加具体地区热线/链接（不阻塞）。Brief `task-briefs/task-confide-to-yin-v1.md`。

**最近拍板（2026-08-09）**：远期玩法/商业种子入库 Backlog（**不排期、不开工**）——① **本地个人混音（Soundscape Mixer）**；② **UGC 创作者生态（约束版）**；③ **异步无声共修（Global Lanterns）**。评估结论：混音可接 Sanctuary/本地氛围深化；UGC 平台层暂缓；共修气质契合但须极薄、可关。详见下文三条 Backlog。

**最近拍板（2026-07-31）**：用户上传氛围乐 = **v1.0.0 必交付**；砍法 mp3/m4a + 合计 ≤64MiB 且 ≤10 首 + 单文件 ≤20MiB；用户曲整段在内置之上且**最近在上**；可删自传；不做云/EQ/在线库/拖拽。Brief `task-user-ambient-upload-v1.md`。**澄清（2026-08-09）**：已交付的是「上传 + **单曲选播**」，**不是**多层音效混音；混音见 Backlog「本地个人混音」。

**最近拍板（2026-07-30）**：v1.0.0 = 纯本地小发布；v1.1 = 云端算法跟进；代码保留云端扩展点、v1.0 不绑死云请求；打包壳选型开会时机 = 冻结前约 1 周或你点名要桌面包时。

**最近拍板（2026-07-18）**：Recover 家族 = Re-focus + 主动 Recover；`welcomeBack` 为 Idle 偶遇、不进家族；代码/限频继续分开（见 `CORE_LOOP.md`）。  
**最近拍板（2026-08-09）**：主动 Recover = Focusing Tiger Anchor（轻触阿寅）；零 MicroRitual；不占被动额度；冷却 **180s**；`triggerActiveRecover()` + `ActiveRecoverAnchorUI`。

**Backlog（仅列名，详情见下文 Backlog 章节）**：

- **场景→动画接线（v1.0.0 必交付 Slice A · 其余 Slice B/C）**
- **本地桌面 APP 打包选型（v1 阻塞 · 壳未拍板；开会时机已定）**
- **v1.1 云端算法**（v1.0 不接线；保留 `cloud/` 可扩展）
- **练习记忆云端备份（免费 A · #272 已合；OTP secrets / TRACKER 待；B 无缝可后排）**
- 纪念奖励系统（金牌/环境细节 + 3D 塑胶公仔展示）
- **荷花成长场景**（复用 `IncenseComplete` 立体荷花 + 金斑浮动；荷花持续增加至布满画面）
- Focus Confidence 未来数据源扩展（含：多工具切换 vs visibility 冲突 → Companion Mode 三选一 / across-tools 决策点）
- **系统级健康中枢读取**（HealthKit Mindful Minutes / Health Connect MindfulnessSession；Phase 1；**非 v1**；未来壳默认 Capacitor；补充诚实机制、非替代；详见 `ARCHITECTURE.md` Backlog + `task-tech-direction-v1-shell-monetization.md`）
- Browser First（插件 / 系统级监控等）
- 节奏敲击正念小游戏（「数字木鱼」）
- 角色/装扮可替换性完整功能（用户可选换装 UI、多套装扮/角色素材产出）— 架构扩展点已预留，功能本体待市场反馈后排期
- 角色边界待观察事项
- **Hints 视觉护栏 · ④ 试点**（**已合 · 观察中** · 2026-08-03 拍板暂不扩）：`e2e/hints-visual-guardrail.spec.js`；扩 linux 软快照 / peeked / 更多 id **勿默认开工**；**人工观感验收仍是关单权威**
- **Hints anchor e2e bounding rect**（几何层已并入 ④ 试点；全量 id 扩面同观察门闩）
- **Hints viewport-context 解耦**（锚点判断少直接摸 Session chrome / 窄宽壳状态；架构项）— ⑤；先 Brief/试点，勿立刻全改
- **CI 全量 `test:smoke` + `test:e2e`**（**夜间+手动全量 + Plan A 已收口**；残留 flaky 根因 / 是否挂 PR 门另议；排期次于打包选型）
- **降低 visibility CI flaky 率**（PR #2 合并后立刻处理；接受「绿 + 高 flaky」不挡合并，但不得遗忘；**决策优先级次于**打包选型）
- **PR #2 · develop→main**（冲突已清 / MERGEABLE；合 main 待五条件 + 口令；Brief `task-pr2-develop-into-main.md`）
- **发布前安全网**（`test:pr-smoke` Required **已勾**；崩溃/错误监控；打包产物验证 CI；用户文档人工过目）
- **双轨付费实现（A Tea + B 进阶解锁）**（方向已锁；Unlock/Tip UI 已合；**Support 统一入口**已合；**场景化请茶 #253**已合；**意愿漏斗本地 #255**已合；**Ambient 15s 试听 #258**已合；**意愿漏斗 opt-in #262**已合；B 下 Lifetime ∪ Yin Membership；**下一**：Daily Wisdom A / Membership 订阅产品化等；见 `task-tech-direction-v1-shell-monetization.md`）
- **付费 · 意愿漏斗 opt-in 回传**（#262 已合 tip `582e79f`；明示同意；默认关；Brief `task-monetization-intent-funnel-opt-in.md`）
- **Web 轻量版本更新提示**（#263 已合 tip `38edfe0`；Brief `task-web-soft-update-prompt.md`；TRACKER 待人工）
- **应用内 Privacy +「?」简介文案**（Brief `task-in-app-privacy-and-purpose-copy.md`）
- **Reflection 通用情绪共鸣**（Brief `task-reflection-echo-copy-pool.md`；**已合 develop** #175）
- **向阿寅倾诉（Confide to Yin）**（Brief `task-confide-to-yin-v1.md`；safety-01 ok；面板已接线；**挂载仍关**；待评估地区资源；种子 `confide-corpus-seed.md`）
- **阿寅壁纸免费赠送**（Brief `task-digital-wallpapers-gift.md`；实现中 `feature/digital-wallpapers-gift`）
- **本地个人混音（Soundscape Mixer）**（多层本地音效/用户曲叠播；**非**已交付的单曲上传选播；远期）
- **UGC 创作者生态（约束版）**（本地配方/明信片种子可研；社区 Gallery / 分成 / Pro Pass **默认不做**；远期）
- **付费转化路径梳理（获客向 · 2026-08-12）**：在 Enso / Wisdom 印花 / Daily Card 等**存量体验**任务之后，单独立项盘点——免费用户在哪些时刻看见清晰付费价值、Deep 15s 试听后 Unlock 文案、Support 漏斗完整性。**不挡**当前四任务；防止「经济可持续」原则只落成老用户彩蛋（见 `PRINCIPLES` 案例锚定诚实边界）
- **异步无声共修（Global Lanterns）**（匿名灯火 + 可选无声赠茶；可关；不进 Focusing；远期）
- **stash · chore/split-hints-from-pr2**（**已关闭 2026-08-01**；PRD 见 `docs/archive/stashed-prds-2026-07-24/`）

---

## 分阶段开发纪律

原则不变：**一次只做一个任务**，做完充分测试再继续，禁止跨阶段并行开发。

（详见 PRINCIPLES.md 原则一。）

---

## Task Brief 存放约定

各 Task Brief 统一存放于 `docs/task-briefs/`（目录结构见 ARCHITECTURE.md）。

命名建议：`task{编号}-brief-{关键词}`

---

## 本地 Cursor 能耗（索引 · 并行 Agent · Cloud）

> 预览浏览器限时规则以 [`.cursor/rules/focus-tiger-browser-energy.mdc`](../../.cursor/rules/focus-tiger-browser-energy.mdc) **当前生效条文**为准，本文档**不复述具体数值**。本节管 **Process Explorer 里 Shared / Agent / Renderer 偏高** 时的治本操作。


### 先读 Process Explorer 再动手

`Cmd+Shift+P` → **Developer: Open Process Explorer**。常见分层：

| 现象 | 含义 | 优先动作 |
|---|---|---|
| `window` / `gpu-process` + **Agents** 偏高 | 本地 Agent / Renderer 在算 | 等本批 Agent 跑完；勿再叠开新本地 Agent |
| 某 worktree 下有 `npm run dev` / Playwright | 子进程在烧 CPU/GPU | 测完立刻停 Vite / 测完停 e2e；勿过夜挂着 |
| 多个 `…-wt-…` 窗口同时开着 | 每个窗口 ≈ 一套 extension-host + 索引 watcher | 关掉当前不用的 worktree 窗口（目录可留盘） |
| 空闲仍长期偏高 | 多半是索引扫大素材 | 收紧根目录 ignore 后 **Resync Index** |

本仓大头：`focus-tiger/public/sprites`（约数百 MB、六百余 PNG）已进 Git，**单靠 `.gitignore` 挡不住 Cursor 索引**。

### 收紧 ignore（具体操作）

仓库根已提供两份文件（gitignore 语法）：

1. **[`.cursorignore`](../../.cursorignore)** — AI **完全看不见**（索引 / `@` / Agent 读都挡）。放：`node_modules`、`dist`、Playwright 浏览器缓存、zip、`.env` 等。
2. **[`.cursorindexingignore`](../../.cursorindexingignore)** — **只退出索引**；需要时仍可 `@` 或打开。放：`public/sprites|audio|models|…`、`art-reference/`、`package-lock.json`。

合入 / 拉取后，对**每个仍打开的** Cursor 窗口：

1. `Cursor Settings` → **Indexing & Docs**（或 Indexing）→ **Resync Index** / Re-index  
2. Process Explorer 再看空闲时 Shared CPU 是否明显下降  
3. 若某 worktree 窗口长期不用：直接 **关闭该窗口**（比只停 Agent 更省）

改 ignore 后**不必**重启整个 Cursor；Resync 即可。改完若某 Agent 需要读某帧路径，用 `@focus-tiger/public/sprites/…` 显式拉取（因在 indexingignore，不会被语义搜索挖出来）。

### 本地 Agent vs worktree 窗口（不是同一物）

- **worktree 窗口** = Cursor 打开的一个工作目录（常对应 `git worktree`，如 `…-wt-wide-idle`）。有自己的 extension-host / 文件监视 / 索引负载。  
- **Agent** = 挂在某个窗口上的 AI 会话（本地 Agent 吃本机 CPU；Cloud Agent 吃远端）。  
- 并行写仍须一任务一 worktree（见 `WORKFLOW.md`）；**能耗上**同时开 3–4 个本地 Agent + 多个 worktree 窗口 = Process Explorer 里 Shared 飙高的正常原因，**正确性可以隔离，电量不会**。

建议：日常本地 **≤1–2 个写 Agent**；其余长任务丢 **Cloud Agent**。任务跑完关掉多余窗口；Vite / Playwright 由 Agent 或你手动停掉。

### 同一帐号：本机 Cursor + Cloud Agent

| 面 | 结论 |
|---|---|
| 帐号 / 额度 | 同一 Cursor 帐号可同时用本机与 Cloud；额度共享，无「两头不能同登」问题 |
| 对话记忆 | **不共享**——Cloud 读不到本机 Agent 聊天原文，反之亦然 |
| 代码统一 | 靠 **Git 分支 + push/PR + 权威 md**（`TEST_TRACKER` / `PROCESS` 等）衔接；与远端同事协作相同 |
| jobs 衔接 | 用 PR 描述 / 分支名 / `TEST_TRACKER`「用户反馈」列当交接面；不要假设「Cloud 会接着本机 Agent 的上下文继续」 |
| 冲突风险 | 避免本机与 Cloud **同时改同一分支或同一共享契约文件**；Cloud 开 PR → 本机 review/merge，或本机先 push 再让 Cloud 基于新 tip |

**强制提醒（用户 2026-07-26 拍板 · alwaysApply 见 `focus-tiger-browser-energy.mdc`）**：启用 / 建议 / 正在跑 Cloud 时，Agent 须在用户可见回复中写明：

> **这是一个新的、和本机完全独立的会话**——两边不会自动同步对话上下文。

并按「检查最新 git 状态、避免同时改同一分支或共享契约文件」协调；**禁止**假设两边会自动接上下文。

长任务、重 e2e、大范围搜索优先 Cloud；本机留给短改 + Safari 人工验收。

### 任务结束：开发服务器 / 测试进程收尾提醒

用户拍板养成习惯（2026-07-26）：凡任务起过 **Vite / Playwright**（或同类长期进程），收尾「待你知道」须提醒：

> **进程收尾**：这次若起过开发服务器 / Playwright，请到终端或 Process Explorer 确认已关，避免后台持续耗电。

门禁条文 SSOT：`.cursor/rules/focus-tiger-browser-energy.mdc`「进程收尾提醒」。

---

## 分支健康度（即时纪律 + 双周普查）

> **SSOT（本节目）**。协作摘要见 [`COLLAB.md`](./COLLAB.md)「分支寿命与健康度」。主题索引 → [`RULES_INDEX.md`](./RULES_INDEX.md) → `git-branch-health`。  
> **由来（2026-08-01）**：`feature/hints-click-trigger` 停更后被换名分支平行重写合入（PR #30），旧 tip 未删，表现为「假 ahead + 大 behind」——周检若只清 `ahead=0` 空壳会漏掉。

**不进 CI Required**：`npm run check:all-branches-health` 是例行提醒（有需审查时 exit 2），**禁止**接成 merge 门禁。

### 即时纪律（合入 / 换名 / 开 PR）

1. **优先刷新原分支**：同主题默认 `checkout` 旧支 → merge/rebase `origin/develop` → 继续；只有冲突不可控才换名新开。  
2. **换名须 Supersedes + 当日删旧支**：新分支 / PR 正文写明 `Supersedes: <旧分支名>`；开 PR 或合入**当天**删除/归档旧远端 tip（勿只删 PR head、留下前任分支）。  
3. **合入后删清单 = PR head ∪ Supersedes**：与 `COLLAB`「合并后即删」一致；空壳（`ahead=0` 且已是 develop 祖先）亦删。  
4. **开 PR 前血统检查**（Agent）：tip 是否已是 `origin/develop` 祖先？develop 是否已有同 subject？硬 merge 是否会回退大模块？任一项异常 → 先汇报，禁止盲目开 PR。  
5. **开 PR 前 `--base` 自查**（硬性）：日常 PR 须 `--base develop`；开完核对 `baseRefName`。SSOT：`WORKFLOW.md`「开 PR 前 · `--base` 自查」（`RULES_INDEX` → `git-pr-base-develop`）。

### 开分支前（防闷头重写）

新建 `feature/*` / `fix/*` 前，若任务主题与近期分支/PR 明显重叠：

```bash
cd focus-tiger && npm run check:all-branches-health -- --topic <keywords>
```

命中「可能平行实现」→ **先问用户**再 `worktree add`，勿直接开干。

### 例行（双周清单）

每 **1～2 周**（可与下班前 Git 同步同日）跑一次：

```bash
cd focus-tiger && npm run check:all-branches-health
```

扫 `origin` 上 `feature/*` `fix/*` `docs/*` `chore/*`（排除 `archive/*` `backup/*` `main` `develop`）；附录列出仅本地同前缀分支。对每支输出：behind / ahead、最后提交、有无 open PR、需审查标记与（若可）主题重叠提示。

### 「需审查」判定（MVP · 收紧后）

任一条即标 `needs_review`（提醒，非 CI 红）：

| 条件 | 含义 |
|---|---|
| `behind ≥ 50` 且 `ahead > 0` | **假 ahead / 重写残留**（不依赖时间——可捕 hints 类） |
| `behind ≥ 50` 且无 open PR | 重漂移且无人跟进 |
| 无 open PR 且 `ahead > 0` 且最后提交 **≥ 7 天** | 停更未合入 tip |
| tip 已是 develop 祖先（`ahead=0`）且无 open PR | 空壳长命，可删 |
| 分支名词与近 **30 天**已合入 PR 的 head/标题有实义重叠，且 tip 仍 `ahead>0` 或非祖先 | **可能已被平行实现** → 优先核实能否归档 |

「≥ 14 天未更新」仅作升级措辞，**不是**唯一门槛（「behind>50 且 2 周」会漏掉约一周内的换名重写）。

关键词重叠：停用词（`fix`/`feat`/`docs`/`chore`/…）+ 过短 token；命中 ≥2 个实义词或 1 个较长专名再标注。二期可再加同 subject / patch-id（本 MVP 不做）。

有需审查时：先确认有无独有价值（常为文档缺口）→ 需要则从 `origin/develop` 新开短分支 salvage → **补完并合入后再**删/归档旧支（补缺口与归档分两步，勿图省事直接扔）。

---

## Git 同步节奏（本地 ↔ GitHub）

> **政策 SSOT**：Agent commit / 汇报 / 默认 push+PR / 禁自动合 main / 禁未授权生产部署 → [`.cursor/rules/focus-tiger-regression-lock.mdc`](../../.cursor/rules/focus-tiger-regression-lock.mdc)「Commit 汇报与分支门禁」。合入 `develop`（CI 绿即可）与生产 Worker → 仓库根 [`WORKFLOW.md`](../../WORKFLOW.md)。主题索引 → [`RULES_INDEX.md`](./RULES_INDEX.md)。本节只写**操作顺序**，不复述门禁条文。

Git **默认不会**在每次 `commit` 后由 hook 自动 push；`commit` 只写本地。本项目**不启用**「post-commit 钩子自动 push」或「保存即 commit」。**任务收尾**时 Agent **默认** push 当前旁支并开 `--base develop` 的 PR（本机与 Cloud 相同；禁止直推 `develop`/`main`）。

**五档（解耦）**：

| 档 | 默认 |
|---|---|
| 本地 commit | 任务验证通过后可自动 |
| push 旁支 + 开 PR | 任务完成后默认做，不必每次口头授权 |
| 合入 `develop` | CI 绿即可；**不等**人工测试 |
| 标「已通过」/ 声称「已修复」 | 仍须你人工测试（§7 + `qa-pass-coverage-split`） |
| 合 `main` / 生产 Worker Redeploy | 须明确下令；Worker 须说「部署」 |

**Cursor Agent 终端权限（仓库级）**：见 [`.cursor/permissions.json`](../../.cursor/permissions.json)（细粒度 `terminalAllowlist`：只读/本地 git、只读 gh、`npm run|test|install`；**禁止**裸 `git` / `gh`）。破坏性 / 有远程影响的命令另由 [`.cursor/hooks/gate-destructive-shell.sh`](../../.cursor/hooks/gate-destructive-shell.sh)（`beforeShellExecution`，`failClosed`）强制确认——弹出 **Run** 不等于「等人工测完」；也不依赖 Auto-review 的 `autoRun.block_instructions`。

#### 已知问题 · `gate-destructive-shell` × `zsh ENOENT`（2026-08-07 · 待排查）

> **现象**：Cursor 报 `Hook ".cursor/hooks/gate-destructive-shell.sh" failed … spawn /bin/zsh ENOENT`，且因 **`failClosed: true`** 该次 Shell 调用被**硬拦**。  
> **匹配范围**（`.cursor/hooks.json`）：仅当命令匹配  
> `git (push|reset|clean|rebase|merge)` / `gh pr merge` / `gh repo delete` 等时才会跑本 hook——**不是**所有 Shell、也不是所有 `git`（例如 `git status` / `git commit` / `git log` 不经此闸）。  
> **匹配过宽（已知误伤）**：正则里的 `merge\b` 也会命中 **`git merge-base`**（`merge` 与 `-base` 之间是词界），导致只读的祖先查询被当成破坏性 `merge` 去问闸。后续修 matcher 时应收窄（例如要求 `merge` 后为空格/行尾，或显式排除 `merge-base`）。  
> **失效含义（重要）**：  
> 1. Hook **脚本能跑通**时：返回 `permission: ask` → 弹确认卡；**防护有效**。  
> 2. Hook **进程起不来**（本例：`spawn /bin/zsh ENOENT`）且 `failClosed`：Cursor **拒绝执行**该命令 → **不是**「跳过闸门静默放行」。push/merge 等会失败，而不是在无防护下偷偷成功。  
> 3. 因此：**不是「所有 push 永久失效」**；是「命中 matcher 的命令，在 hook runner 偶发起不来 zsh 时被硬拦」。同会话里先前多次 `git push` 成功，说明闸门多数时候可用；ENOENT 为**间歇 / 环境**问题（Cursor 钩子宿主找不到 `/bin/zsh`），待日后排查（PATH、Cursor hooks runtime、是否应用了错误的 shell）。  
> 4. **临时绕过**：本机终端手动 `git push` / `gh pr create`（不经 Agent hooks）即可，与 2026-08-07 Sanctuary Unlock 本地 commit 待手推场景一致。

### 推荐流程（任务收尾默认 push + PR）

完成一个**有实质性进展**的 Task（非纯 debug / 微调）后：

1. 更新 `PROCESS.md`「当前进度速览」对应字段  
2. 更新 `TEST_TRACKER.md`（新增/修正验收行；UI 默认「待人工测试」——已合入后也保持此状态直到你关单）  
3. **同步相关权威文档**（N15：按触及面更新对应权威 md；禁止只改代码）  
4. 按 regression-lock「Commit 汇报与分支门禁」完成本地 commit + 同回合汇报  
5. 可选推送前体检：`./scripts/git-sync-safe.sh`  
6. **默认** push 当前旁支 + 开/更新 `--base develop` 的 PR（不必再等口头授权；禁止直推 develop/main）  
7. **合入 `develop`**：CI 绿即可合并（见 `WORKFLOW.md` / `git-develop-small-pr-run-merge`）；**不要**等人工测试，也**不要**默认只写「请上 GitHub 手合」  
8. **合并进 `main`**：见 `WORKFLOW.md`（永远须你明确指令）  
9. **生产 Worker Redeploy**：须你明确说「部署」（`prod-worker-deploy`）

完成消息须说明「本次有 N 项需要你测试」（见 `TEST_TRACKER.md`）；需要一批测完时用口令「批量人工测试」。

### 口令：「请安排下班前的 Git 同步」

你说这句（或同等的下班前 / 批量 Git 同步）时，Agent 应按 regression-lock 第 7 条执行（**补漏**尚未推送的旁支 commit；**禁止**直推 `develop`/`main`；「先给 diff 等确认」的仍不推）：

1. 确认在短命旁支（`feature/*` / `fix/*` / `docs/*` 等）上；若误在 `develop` 攒了 commit → **先**迁到旁支，**再**同步  
2. 该旁支上尚未推送的 commit → `push` **仅该旁支** → 无 PR 则开 **`--base develop`**；已有 PR 则让 CI 自然更新  
3. 「先给 diff 等确认」类 → **单独成组列出，不随本次推送**  
4. 回复 **「Git 同步汇总」**（含第 6 条分级项 + 旁支名/PR + **性质标注**：本次推送有无「业务逻辑/代码改动」）  
5. **不做**：直推 `develop`/`main`、合并进 `main`、生产 Worker 部署、顺手推进**无关** PR。本回合正在收尾的 develop PR 仍走 `git-develop-small-pr-run-merge`。

完整门禁条文见 regression-lock SSOT；此处不复述。  
**禁止**再使用「可推 develop / feature / fix」这种把主干与旁支并列的写法。

### 明确不做的自动化

| 方式 | 本项目态度 |
|---|---|
| `post-commit` 钩子自动 `push` | ❌ 禁止 |
| 保存文件自动 commit | ❌ 禁止 |
| CI 自动 commit 业务代码 | ❌ 禁止 |
| IDE「定时同步远程」 | ❌ 不推荐 |

允许的辅助：推送前检查脚本、Agent 收尾提醒、Project Rules 兜底文案。

---

## 后续 Backlog（暂缓事项,已记录、未开工）

### Backlog:纪念奖励系统（金牌/环境细节 + 3D 塑胶公仔展示）

整合此前讨论的两个想法，合并为一个后续奖励系统功能：

- 用户达成明确的长期练习里程碑（如连续练习天数、累计专注时长等，具体规则待设计）后，获得**只增不减**的纪念奖励；中断不撤回奖励，不制造断签压力
- 奖励呈现形式包括：
  - **金牌/徽章**：需要独立的持久化存储架构记录历史成就，以及一个「成就墙」展示页面
  - **环境细节/温和动作**：解锁永久保留的纪念物、环境细节或新表达；默认状态始终完整、温暖，不以缺失或退化反衬奖励
  - **3D 塑胶公仔展示**：复用已保留的 3D 多姿态模型资产与绕 Y 轴旋转展示效果（见 `ARCHITECTURE.md`「已有 3D 资产的保留与新定位」），用户可在奖品展示场景中 360 度观赏获得的虚拟公仔

**环境细节解锁 · 已确认方向（2026-07-15 拍板，节点数字为初始建议，实现任务中可统一微调）**：

| 方向 | 初始建议节点 | 说明 |
|---|---|---|
| 莲花池 | 5 天首朵莲花；10 天旁边多开一朵小莲花/花苞 | 后续随成就逐步增加，直至莲花满池；`EMOTION_BIBLE` 原「7 天出现莲花」并入此口径统一。**素材进展（2026-07-18）**：莲花池首朵素材已到位（`lotus-front-rising`，7 帧，已登记 manifest）；触发逻辑（连续/累计天数追踪、断签是否重置）待排期，**勿因素材到位顺手实现**。 |
| 小香炉 | 3 天 | 老虎身前出现小香炉；此后「一炷香」反馈的烟从香炉里升起 |
| 蒲团刺绣 | 30 天 | 蒲团边缘出现一圈细小刺绣纹样；与 `outfitId` 架构天然兼容 |
| 夜间小灯笼 | 60 天 | 夜晚使用时老虎身边多一盏暖光小灯 |
| 白天小茶盏（推荐）/ 莲上蜻蜓（备选） | 60 天（与夜灯成对） | 白天使用时手边一盏冒着淡淡热气的茶（茶烟与香炉烟同一套写意粒子语言，「备了茶/点了灯」成对陪伴语义）；备选为偶尔停在莲花上的小蜻蜓 |

**明确不采用**：背景远景类添加（远山石、松枝等）——保持极简空灵的水墨背景。

**关键约束（区别于「养成」）**：只增不减、永久保留、默认态本来就是完整的；用户中断多久细节都不消失或褪色；它们是「纪念物」而非「维护对象」。

此功能涉及独立的成就数据持久化架构、新增 UI 页面（成就墙/展示柜），复杂度较高，**不纳入当前 2D 情绪系统主线开发范围**。待 2D 主线（情绪清单实现、交互检测）稳定完成后，另行评估排期与具体设计方案。勿在当前阶段情绪/交互任务中顺带实现。

### Backlog:Focus Confidence 未来数据源扩展路线图

以下信号源已在设计讨论中识别,但因涉及独立产品级工程(插件开发、移动端系统权限、第三方硬件SDK集成等),暂不纳入当前开发范围,留待后续单独立项评估资源投入:

- IDE插件类:VSCode插件、Cursor插件(检测编码专注状态)
- 文档协作类:Notion插件、Google Docs编辑检测
- 移动端系统级:手机前台APP检测、手机静止检测、Apple Focus Mode / Android Focus Mode 集成(需要系统级权限申请)
- 穿戴设备类:心率数据(需要硬件SDK集成)
- 长期探索类:EEG脑机接口(明确为远期方向,非当前技术可行范围)

每一项启动前需先评估:所需权限/API的用户隐私合规性、开发与维护成本、是否需要用户额外安装第三方软件。不应假设"技术上可行"等同于"应当实现",需结合当前团队人力(参见PROCESS.md团队现状说明)综合判断。

**已识别决策点（2026-07-16）——多工具切换 vs visibility 检测冲突**：

知识工作场景下，高质量心流也会产生大量标签页 / 工具切换，与真正分心在浏览器隐私沙盒内无法区分；原「标签可见 = 专注」假设会对这类用户系统性误判（缺陷全文见 `DESIGN.md`「Focus Confidence」与「专注会话陪伴模式」背景）。

**对策（已定稿，诚实机制延伸，非技术猜测）**：Companion Mode 升格为三选一，新增 **I'm working across tools**，由用户自主声明会话语境，关闭离开类分心判定；不依赖探测其他 App / 标签内容。运行时三选一 UI 待确认交互后另开任务实现。未来若评估「生产力网站白名单」等短信号源，**不得**绕过或削弱该用户声明边界。

### Backlog:系统级健康中枢读取（Phase 1 规划）

> 全文与架构约束见 **`ARCHITECTURE.md` → Backlog「未来数据源扩展 — 系统级健康中枢读取」**。此处仅作排期索引。

> **2026-08-09 澄清**：应用内 **Journey Log**（Tea Log 模式本地留痕）已排期为 Five Moments 表面 **D′**（`task-journey-log-d.md`），**不是**本 Backlog 的替代实现，也**不得**对外称为 Health Log / HealthKit。

- **Phase 0**：**不实现**（手动 Honesty Check-in + Companion Mode 跑通核心体验）。
- **Phase 1**：评估 iOS HealthKit（Mindful Minutes）与 Android Health Connect（`MindfulnessSessionRecord`；注意 Android 14+ 覆盖滞后）；可选授权，与手动打卡并存；正念分钟可叠金光（复用 Ambient `presenceBoost` 模式）。
- **不强制**健康数据授权；不替代诚实机制。

### Backlog:Browser First 长期产品方向

**背景**：用户在使用 Cursor、VSCode、Notion、Google Docs、Figma、GitHub 等生产力工具时，理论上系统已经「知道」用户在工作，这比要求用户主动打开产品页面、手动开始计时更符合「陪伴感」而非「打开 APP」的产品定位。

**可行性分层评估（按「价值>复杂度」原则拆分）**：

1. **短期可扩展（复杂度低，已在现有技术路线内）**：检测当前浏览器活跃标签页的域名，判断是否为预设的「生产力网站」白名单（如 Notion 网页版、Google Docs、GitHub 网页版等），纯网页 JS 可实现，可作为 Focus Confidence 信号来源的自然扩展，可在后续迭代中评估纳入。

2. **中长期方向（复杂度高，需独立立项）**：开发 Chrome Extension，实现「浏览器角落常驻老虎」的陪伴体验，减少用户需要主动打开产品页面的摩擦。涉及独立的插件开发、发布审核流程，复杂度显著高于当前网页产品。

3. **暂不可行/需谨慎评估（复杂度很高，涉及隐私敏感权限）**：检测用户是否在使用 Cursor、VSCode 等桌面应用程序（而非网页），这已超出浏览器沙盒能力范围，需要操作系统级别的应用活跃状态监控权限。此类权限申请对用户信任度要求极高，且用户对「专注工具监控其电脑上所有应用活动」的隐私顾虑值得高度重视（参考：项目开发过程中，团队自身也对开发工具请求系统级权限保持了必要的警惕）。此方向需要独立于当前项目的产品/工程投入，不建议在当前阶段纳入路线图讨论范围之外的实质开发。

**处理方式**：第 1 项可在后续 Focus Confidence 相关迭代中按「价值>复杂度」原则评估纳入；第 2、3 项记录为长期方向，不纳入当前开发排期。

### Backlog:产品命名（Focus Tiger 是否更名）

**当前阶段决策（2026-07-16）**：产品名称 **Focus Tiger** 经讨论后**保持不变**。

**理由**：

1. 与已确立的核心成长模型「觉察 Awareness → 专注 Focus → 心流 Flow → 内在成长 Growth」一致——Focus 是旅程中真实的第一阶段，而非虚假包装；
2. 保留「Focus」关键词有助于产品早期通过自然搜索被发现；
3. 改动技术标识符（仓库名、类名、`focus-tiger` 路径与存储键等）成本需要进一步评估。

**建议的深化方式（非更名）**：通过副标题承载更深定位，例如：

> Focus Tiger — a mindful companion for presence, awareness, and flow

**后续**：是否进行完整产品更名，留待获得真实用户反馈后重新评估。与之区分：核心交互按钮已采用「Sit / Rise」仪式动词（见 `EMOTION_BIBLE`「核心交互动词」），**不影响**本条产品名决策。

### Backlog:用户自定义角色改名

`DESIGN.md`「老虎的名字」保留用户可自定义改名设想（沿用 v4.0 命名交互逻辑）。**当前阶段不开发**；默认显示固定为正式名「阿寅 / Yin」（i18n `CHARACTER_NAME`）。排期前须另开 Task，明确存储、校验与观察式文案边界。

### Backlog:场景→动画接线（Slice A 已合 · A′+B 一批 · C 荷花）

> **2026-07-31**：正式稿 + Slice A；权威 `SCENE_ANIMATION_WIRING.md`；A 实现 PR #59 已合。  
> **2026-08-01**：用户拍板 Honesty **20/30**、日语合十、勿接已取代、**Dispatcher 必做**、设计师其余项**一批**进 A′+B（不拆碎）；驳回完成池 dance。Brief：`task-scene-animation-inventory-wire-slice-b.md`。

**问题**：库存动画偏闲；切语合十有代码漂移；缺统一调度易堆 if-else。

**切片**：

| 切片 | 内容 | 排期 |
|---|---|---|
| **Slice A** | 切语问候 + Honesty Idle 短点头 + 微仪式核对 | **已合 develop**（PR #59） |
| **A′ + B（一批）** | 日语真合十 + Dispatcher + 欢迎/完成/微仪式同档池 + Honesty 长档 halo + 舒展/深夜/好奇（冷却） | **实现中** `feature/scene-animation-dispatcher-slice-b` |
| **Slice C** | Transition、荷花 `lotus-*`、Grow | 大 Backlog；MilestoneGlow **已接线**免重做 |

**约束**：反馈分级；禁完成池 dance；Focusing 跳过问候；生命感冷却默认 1h；勿接已取代目录。

- **复杂度评级**：中（Dispatcher + 多场景映射；不碰状态机主语义）
- **价值定位**：消化库存、仪式感与陪伴感；架构一次收口
- **排期口令**：「开工场景动画 Dispatcher / Slice B」；worktree `feature/scene-animation-dispatcher-slice-b`

### 已交付:Focus 间隔磬 + 觉察观照卡（mid-session）

> **Brief**：`task-briefs/task-session-interval-bell-and-awareness-card.md`  
> **合入**：#278 tip **`41e9748`**（2026-08-13）。  
> **口径**：节奏 off / 3min / 5min（默认 off）；达标前 **30s** 跳过；底部觉察卡可单独关；cues 短磬、**不**接 Ambient Gate；**不**改 Moment Whisper / Quiet Line。  
> **人工**：TEST_TRACKER「间隔磬」「觉察卡」仍待测。

### Backlog:用户上传氛围乐（v1.0.0 必交付 · 多首 · 最近在上 · 可删自传）

> **2026-07-31**：正式重开后**升格为 v1.0.0 范围内必交付**（不再是「仅 Backlog / 可不做」）。权威：`DESIGN.md`「禅意背景音」§5；实现 Brief：`docs/task-briefs/task-user-ambient-upload-v1.md`。**实现已合 `develop`（PR #51）**。

**已拍板砍法**：

- 多首允许；用户曲**整段**在内置曲之上；用户曲彼此 **最近在上**；
- 仅可删自传；格式仅 **mp3 / m4a**；
- 容量：合计 ≤ **64 MiB** 且最多 **10** 首；单文件 ≤ **20 MiB**；
- 存储：IndexedDB + Object URL；刷新可播；重置须清用户曲；
- **不做**：云同步、均衡器、在线曲库、复杂排序拖拽、**多层同时混音**（混音另见下条 Backlog）；
- 测试：单测锁 pref + 清单合并；e2e fixture 上传→置顶→删除→刷新仍在。

- **复杂度评级**：中（存储 + 清单 UI + 删除 + 偏好 trackId 兼容；不碰情绪主线）
- **价值定位**：强个性化陪伴；与「内置曲扩充」互补
- **排期**：**已交付**（PR #51）；关单级人工见 `TEST_TRACKER`「用户上传氛围乐」

### Backlog:本地个人混音（Soundscape Mixer · 远期）

> **2026-08-09 入库**：策略评估后用户同意纳入 Backlog。**尚未排期、未立项 Brief、未开工**。  
> **与已交付能力的边界**：「用户上传氛围乐」= 上传多首后 **一次选播一首**；本条 = 同时叠播多条本地音轨（如雨声 + 磬 + 用户曲）并调相对音量，保存为个人配方。

**候选范围（待 Brief 再砍）**：

- 仅本机：内置组件轨 + 用户已上传曲，可多层叠加、简易电平；配方存 IndexedDB；
- 可挂 **Yin's Sanctuary** 深度音效权益讨论（不得挡核心 Sit / 基础单曲陪伴）；
- **不做（本条默认）**：社区发布、创作者分成、云同步配方、订阅 Pro Pass、代币。

- **复杂度评级**：中高（多 `Audio`/`WebAudio` 轨 + UI + 与现有 opt-in / Rise 停播契约回归）
- **价值定位**：深化「场域」个性化；承接 Sanctuary 音效深度，而非社交平台
- **排期**：待核心陪伴与双轨付费验证后再评估；口令示例：「评估/开工本地 Soundscape Mixer」

### Backlog:UGC 创作者生态（约束版 · 远期）

> **2026-08-09 入库**：Soundscape/场景 DIY、Community Gallery、正念明信片、Creator 分成与艺术家联名等设想。**不排期**。

**姿态（评估结论，入库约束）**：

- **可研种子**：本地配方导出、Reflection/菜单侧「正念卡片」存图（延续 Wallpapers / Quiet Line；**禁止**一键社交分享作核心卖点）；
- **默认不做**：社区 Gallery、排行/Popular、创作者分成、茶包代币、**Pro Pass 订阅**（创作者生态概念，**≠** Yin Membership；与「无账号」基线及平台级复杂度冲突——默认不做社区订阅通行证）；
- 艺术家联名轨若未来做，优先作 **Sanctuary 内容包 / 一次性 IAP**，不先建 UGC 平台。

- **复杂度评级**：平台级高（账号、审核、CDN、版权、结算）
- **价值定位**：长期相邻赛道；**不是**当前差异化主线
- **排期**：核心留存与付费假设成立后再单独立项

### Backlog:异步无声共修（Global Lanterns · 远期）

> **2026-08-09 入库**：全球静坐灯火 + 无声赠茶 / 特色灯火小额。品牌契合度高于 UGC 平台；**不排期**。

**姿态（评估结论，入库约束）**：

- 仅 Idle / Arrive 背景级存在感；**禁止**进入 Focusing 主视线；必须 **可关**；
- 匿名聚合（诚实：假灯火不得冒充真共修；真 presence 须去标识）；
- **禁止**人数炫耀、排行、连续同坐天数、聊天/关注；
- 特色灯火若付费，贴近 **A · Buy Yin a Tea** 可忽略情绪轨，**不得**作 Sanctuary 门槛或「不买看不见共修」。

- **复杂度评级**：中（轻量 presence 后端或先做可关视觉隐喻实验）
- **价值定位**：无压力 Co-presence；卖同频温暖而非社交压力
- **排期**：建议 v1.1+ 可选氛围实验；口令示例：「评估异步共修灯火」

### Backlog:节日主题引擎（Seasonal Theme · B 轨 · 2026-08-11 排期）

通用节日配置引擎：按 `dateRule`（fixed / nth-weekday / solar-term / lookup-table）在窗口内为 **已解锁 B 轨**（Sanctuary Lifetime ∪ Yin Membership）用户切换 App **内部**装饰（姿态/背景/文案池）。圣诞节为首实例；新增节日 = 配置 + 素材，零引擎专支。

| 项 | 口径 |
|---|---|
| Brief | `task-briefs/task-seasonal-theme-engine-v1.md`（Phase 1–3 已合 #233/#234/#238） |
| Catalog | `theme.seasonal.access`（ongoing；lifetime∪subscription 互覆盖） |
| 硬限制 | **不**远程更新 PWA 主屏幕图标 |
| 不做 | 运行时 AI 文案；用户自定义节日；节日付费 CTA；tip 解锁 |
| Phase | 1–3 **已合** → **4** 其它节日配置（未开） |

- **复杂度评级**：中（日期规则 + 双闸 + entitlement；素材另排）
- **价值定位**：B 轨美学场域；强化「正念伙伴随节气/节日安静换装」，非街机活动页
- **排期**：Phase 4 须书面授权；**不**挤占 P0 Arrival 闪白 / Honesty 等主路径债

### Backlog:节奏敲击正念小游戏（「数字木鱼」）

独立于专注检测体系之外的**可选玩法**：用户可主动进入一个「跟随节奏敲击」模式（如按空格键跟随音乐节奏），类似传统敲木鱼 / 数呼吸类正念练习的数字化版本。系统检测按键间隔的规律性，给予平静的视觉反馈（如老虎随节奏轻轻点头、金光随节奏起伏）。

**与 Focus Confidence 的明确区分**：此为用户主动选择的独立小游戏玩法，**不作为**判断「用户是否在专心工作」的信号来源。持续敲击本身与深度专注工作在行为上是互斥的，不适合作为工作专注度的检测依据。

- **复杂度评级**：低（浏览器键盘事件监听 + 节奏规律性分析，技术成熟）
- **价值定位**：锦上添花的可选玩法，非核心刚需
- **排期**：待 2D 情绪系统主线稳定后，再评估是否开发

### Backlog:本地桌面 APP 打包选型（v1 阻塞 · 壳未拍板；开会时机已定）

> **背景（2026-07-30）**：产品目标含「本地可以跑的电脑版 APP」。壳选型（Electron / Tauri / PWA）仍为 **v1 阻塞**。  
> **「优先级高于 CI 细节」如何理解（易混 · 同日澄清）**：**不是**「等 CI 工程出现/做完再谈打包」。本仓库「CI 细节」= 已列进 Backlog 的两项工程护栏——（1）**CI 全量 `test:smoke` + `test:e2e`**；（2）**降低 visibility CI flaky 率**（排期锚点：PR #2 → `main` 合并后开工）。「高于」= **争同一段日历/Agent 注意力时，先开打包壳短决策，再/并排做 CI 工程**；CI 仍要做，不挡、也不充当打包选型的前置条件。  
> **产品面已拍板（同日）**：**v1.0.0 纯本地**（核心不依赖联网）；**v1.1** 跟进云端算法；代码保留云端可扩展性。详见下条「v1.1 云端算法」与开放决策「v1.0 纯本地 / v1.1 云端」。

**候选（壳未选型）**：

| 路径 | 要点 |
|---|---|
| **Electron** | Web 技术栈原样打包；生态成熟；体积大；路径/菜单/`file://` 等适配面明确 |
| **Tauri** | 更轻量；团队若无 Rust 经验则有学习成本 |
| **PWA / 薄壳** | 「双击图标能跑」成本最低；体验通常弱于原生壳；与 `TASKS.md` 任务六相关但**不得**默认当成最终桌面交付形态 |

**何时开选型讨论（流程已定 · 2026-07-30）**：

1. **触发 A**：`v1.0.0` 纯本地功能冻结前约 **1 个工作周**；或  
2. **触发 B**：你口头说「准备打 v1.0 / 要桌面包 / 开打包选型」时 **立刻**开短决策。  
3. **禁止**：拖到 `v1.0.0` tag 之后才选型；为选型打断当前 UI/情绪主线（可并行记议题，但不当周强插实现脚手架）。  
4. **产出**：一次短会话选定壳 → 再开脚手架 Task；同步 `ARCHITECTURE.md` / `TASKS.md` 任务六。

**适配面提示（选型后可能触及）**：资源与用户数据路径、原生菜单与窗口生命周期、自动更新；v1.1 再接 API base URL / CORS（v1.0 无云请求硬依赖）。

- **状态**：壳 **开放**；开会时机与云端/离线产品面 **已定**。
- **不在范围**：本条不立项写脚手架；不替代 Browser First；不把手机原生 App 混入。
- **与 2026-08-07 技术方向纪要的关系**：手机商店壳 / Capacitor **不**并入本条拍板；本条仍只解「本地电脑版」。详见 `task-briefs/task-tech-direction-v1-shell-monetization.md`。

### Backlog:练习记忆云端备份（免费 A 快照 · B 无缝可后排）

> **拍板（2026-08-12）**：产品面已定（**#266** tip `4698348`）。**A 运行时已合**：**#272** tip `a195584`（Brief `task-briefs/task-practice-memory-cloud-backup-a.md`）；矩阵/redeploy 注 **#273** tip `ef5ff3e`。生产 Worker Version `f9755950-…`；**OTP secrets 已补**（2026-08-13 用户书面绑邮箱收码 + Enable 成功）。对账表：`FREE_PAID_MATRIX`「练习记忆 · 云端快照备份 / 恢复」与「练习记忆 · 多端无缝同步」。

#### 动机

- 练习史 / Journey Log 等「不该丢」数据今日多在 **localStorage**；关标签页不丢，但 **Safari / ITP 等**可在用户一段时间未主动访问后**静默清空**本机存储。
- 正念产品「一周不打开」是正常节奏——本机静默清库是**典型风险**，不是边角。

#### A · 免费兜底（近期评估优先）

- **模型**：本机权威日常写入 → **定期或关键后静默上传快照** → 换设备 / 清机 / 空库后 **恢复最近一次备份**。
- **首版不做**实时双向同步、不做多端冲突合并。
- **覆盖（立项时列清单）**：练习史、Journey Log、必要里程碑戳等；hints / 冷却 / 当日门闩等可继续纯本机。
- **身份**：**唯一复用邮箱 OTP**（与付费 restore **一套身份、两种用途**）；**禁止**用匿名 device id 做跨端身份基础。
- **未绑邮箱**：
  - 矩阵口径：**无云端兜底**；Safari/ITP 等本机清理风险由用户自行承担。
  - **实现备注（勿漏）**：须有**温和、非打断**提示（例：Journey Log 页面角落「绑定邮箱可获得云端备份」；**禁止**弹窗警告打断主路径）。文案另定。目的：让用户在丢数据前知道「现在只在本机」；绑邮箱同时为后续 B 档付费转化铺垫身份基础。
- **与 v1.0 纯本地**：核心练习路径仍可离线完成；A 为**可选增强**（无网 / 未绑邮箱 → 本机照常，只是没有云兜底）。隐私明示同意（发什么、为何、多久）仍适用。
- **与「v1.1 云端算法」**：**分开**——本条是可靠性/防丢失；云端算法是 daily-message / emotion-weight 等可选增强。可并行评估，勿互相阻塞或混写成同一 Task。

#### B · 付费无缝（可后排）

- **含义**：多设备近实时一致陪伴记忆（体验升级，不是「本来就不该丢」）。
- **档位**：`lifetime∪subscription`（Sanctuary / Membership）；须冲突策略；合理性与可行性评估过关再排期。
- **经济可持续**：禁止把完整无缝默认真全体免费基础设施；亦禁止把 A 档防丢失塞进付费墙。

#### 不做（本条默认）

- 匿名 device id 跨端同步身份  
- 首版实时双向同步 / CRDT 级合并  
- 未明示同意就上传练习相关字段  
- 把 A 与 B 混成「一个同步功能」却不分免费/付费  

- **状态**：产品口径 **已拍板**；A **运行时已合 develop**（#272）；生产路由+KV **已 redeploy**；**OTP secrets 已补**（2026-08-13）；TRACKER 仍待空库恢复 / 关备份（关单只认 develop tip）。  
- **口令示例**：「补 practice-backup OTP secrets」/「测练习记忆云端备份」

### Backlog:v1.1 云端算法（v1.0 纯本地之后）

> **拍板（2026-07-30）**：先发布可用的纯本地 **v1.0.0** 小产品，再快速跟进 **v1.1** 云端算法——符合「先发布再迭代」。优先保障用户体验（离线可完成核心练习）；代码须保留将来云端可扩展性。
>
> **相邻（2026-08-12）**：练习史防丢失见上条「练习记忆云端备份」——**不是**本条的子集；排期可交错，文档勿混写。

- **v1.0.0 范围**：**不**把核心路径绑在必须成功的云请求上；`cloud/` stub **保留**、**不接前端**（现状）；不因「将来要上云」阻塞本地发布。
- **v1.1 范围（立项时再拆 Task）**：接入 `cloud/`（或后继）关键算法（如 daily-message / emotion-weight 等正式逻辑）；CORS、鉴权、字段与隐私明示同意（见 `MVP_PRODUCT_DEFINITION`）；离线时可选增强失效须有明确降级（核心本地路径仍可用）。
- **可扩展性约束（v1.0 开发期间也遵守）**：前后端解耦；禁止在 EmotionController / 门闩主路径硬编码「无网即失败」；新增云能力须经可选客户端适配层，默认本地实现。
- **排期**：**v1.0.0 tag 之后**优先评估跟进；不挡当前 Phase 0 / 桌面壳选型。

### Backlog:CI 全量 `test:smoke` + `test:e2e`（勿长期依赖本机手跑）

> **历史背景（2026-07-23 · PR #2 合并门禁拍板；已废止）**：当时 `develop`→`main` **曾临时接受**「本机 `npm run test:smoke` + `npm run test:e2e` 全绿 + CI 仅 `focus-tiger doc-contract check`」。该「临时本机全量」门槛 **已废止 / 已由 CI 收口**（见下方「已落地」）；现行边界见 `WORKFLOW.md`「CI 与本地 e2e 边界」与 `RULES_INDEX` → `e2e-local-budget`（本地硬顶 1 spec；全量仅 CI 或 `RUN_E2E_LOCAL=true`）。

#### 已落地（2026-07-28 … 2026-07-31 核实）

| 项 | 状态 |
|---|---|
| PR→`develop` 轻量冒烟 | ✅ `pr-smoke.yml`（`test:smoke` + `test:e2e:smoke` + build）；Required 已勾；**解放本地 Agent** |
| 全量 e2e workflow | ✅ `focus-tiger-e2e-full.yml`：`workflow_dispatch` + `schedule` cron `0 2 * * *`（UTC）；**120m** + `--workers=1` |
| 定时任务是否按 120 跑 | ✅ **YAML 已在 `main`**（PR #47，2026-07-31）。下一 schedule / dispatch 应按 120；#11 及更早仍为合并前 60m cancel |
| Plan A（分片+清单） | ✅ **#63→main**；基建验 [#15](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/actions/runs/30707227694)（~55m + JUnit，非 2h cancel） |
| #15 稳定红 | ✅ **#74→develop**；dispatch 绿 [#30712008401](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/actions/runs/30712008401)（JUnit **68 / 0 fail** / 1 skipped） |
| Actions Secrets（API Key） | **当前不需要**：workflow **无** `secrets.*`；套件打本地静态壳。v1.1 云 E2E 再配 |
| 环境/密钥隔离文档 | ✅ `docs/ENV_CONFIG.md` + `.env.example`（client + cloud） |

#### 基建收口（2026-08-02）

夜间自动跑 + Plan A 清单能力 **已完成**（PR #2 前工程护栏里「勿长期只靠本机手跑全量」的主目标已满足）。**2026-08-14**：GitHub 默认分支改为 `develop`；`schedule` 现读 **`develop` YAML**、checkout **`develop` tip**——以后改 timeout/shard **不必**再同步 `main`。

#### 仍待办（非基建阻塞）

1. ~~把 120m workflow 同步到 `main`~~ ✅ PR #47。
2. ~~合入 Plan A 并再同步 workflow→`main`~~ ✅ PR #63。
3. ~~修 #15 稳定红~~ ✅ PR #74 + 验绿 [#30712008401](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/actions/runs/30712008401)。
4. 全量套件 **偶发** flaky 根因（goto / 断言噪声）：与「降低 visibility flaky」互补；Plan A **有清单**，不声称压掉全部 flake。
5. （可选）是否把全量 e2e 挂到 PR→`main` / 合并门——**另议**；现设计为非 PR 门闩、夜间+手动。

- **验收（已满足）**：夜间或 dispatch 的远端 run 给出 **JUnit 可读的 pass/fail**（shard cancel 时已跑完的 shard 仍有 artifact）。
- **不在范围**：不替代场景 C/O/P 等人工观感；不把「CI 绿」写成序列观感通过；不为当前套件虚构 API Key；本机不跑全量 e2e 马拉松。
- **排期**：Plan A / 夜间全量 = **已收口**；残留 flaky 根因相对「本地桌面 APP 打包选型」仍次优先。
- **勿混淆**：本 Backlog 的「全量」≠ PR 的 `test:pr-smoke`。

### Backlog:发布前安全网（v1.0.0 tag 前）

> **背景（2026-07-30 核实）**：轻量 PR 基建主体已在 `develop`（`pr-smoke` / `pre-merge` / 模板）。当时因 `paths` 过滤**未**把 `test:pr-smoke` 设成 Required；Dependabot、CI build、用户向说明、崩溃监控亦未齐。打包产物 CI **等壳选型后再立**。

#### 已落地（工程 · 本回合）

1. **`pr-smoke` Required-safe**：每次 PR→`develop` 都上报 job `test:pr-smoke`；无 `focus-tiger/**`（及本 workflow）改动时 **no-op 绿**；有产品改动时跑 smoke + **`npm run build`** + `dist/index.html` / `dist/assets` 校验。
2. **Dependabot**：`.github/dependabot.yml`（`focus-tiger` / `cloud` npm + Actions）。
3. **周更 `npm audit`**：`.github/workflows/dependency-audit.yml`（`audit-level=high`；schedule + dispatch；**非** PR Required）。
4. **用户向文档**：根 `README.md`；`focus-tiger/docs/USER_GUIDE.md`；`focus-tiger/docs/PRIVACY_NOTICE.md`（对齐 MVP §六「上线前须有简明隐私说明」）。

#### 仍待你 / 后续

| 项 | 谁做 | 说明 |
|---|---|---|
| **把 `test:pr-smoke` 勾成 develop Required** | ✅ **已完成（2026-07-30）** | 你已 Save：`develop` Required = `pre-merge with develop` + **`test:pr-smoke`**。图1 无 Required 徽章 ≠ 没跑；勾选后 smoke **红则无法合并**（硬门闩）。 |
| **用户指南 / 隐私短文人工过目** | 你 | `TEST_TRACKER` 对应行；关单级仍认 `origin/develop` tip。 |
| **错误监控 / 崩溃上报** | 后续立项 | v1.0 纯本地默认**不**接 Sentry；若加须 opt-in + 字段审查（MVP §六）。在「用户崩溃你怎么知道」有答案前，至少保留本机复现路径 + Issues。 |
| **打包产物验证 CI** | 壳选型后 | Electron / Tauri / PWA 拍板后再写「安装包可启动」门禁；选型见 Backlog「本地桌面 APP 打包选型」。 |

- **不在范围**：不替代全量 e2e Backlog；不把 Dependabot PR 自动合并。
- **排期**：Required 勾选 ✅ 已完成；监控 / 打包 CI = tag 前评估，可与打包选型同周。

### Backlog:降低 visibility CI flaky 率（PR #2 合并后立刻处理）

> **背景（2026-07-26/27 · 用户拍板）**：visibility 契约 e2e（`test:e2e:visibility`）在 CI 上已能 **job 绿**，但接受「**绿 + 高 flaky**」（例：[run 30207794029](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/actions/runs/30207794029) ≈ `7 passed` + `25 flaky` / 32）。不挡 PR #2 合并进 `main`；**合并后立刻**作为下一任务处理，禁止因合并完成而搁置遗忘。与「CI 全量 smoke + e2e」互补：本项修 **visibility** workflow 稳定性；全量夜间+Plan A **已收口**（见上节），两边剩余工作都偏 **flaky 根因**。**决策优先级次于**「本地桌面 APP 打包选型」（见上条）。

- **目标**：把 visibility suite 的 flaky（首轮红、retry 翻绿）压到可接受水平（建议目标：连续 2～3 次 CI run 上 flaky ≤ 约 20%，且无「仅靠 retry 才绿」的系统性风暴）；墙钟须稳定落在 job `timeout-minutes` 内。
- **处理方向（优先序，可组合）**：
  1. **Workers**：先试 `workers: 1`（或保持 2 并对比）；4 workers 曾压垮 `vite preview` → 大量 `domcontentloaded` 超时。
  2. **导航策略**：继续收紧——一律 `openFreshProductShell` / `domcontentloaded`；禁止默默 `page.goto`/`reload` 走 `load`；必要时对 `goto` 做有界重试（与 seed 不冲突：勿用会跨 reload 清 `focus-tiger.*` 的 `addInitScript`）。
  3. **预算**：在「不靠无限拉长 timeout 掩盖」前提下，核对 `navigationTimeout` / 单测 `timeout` / job 上限是否匹配真实 preview 冷启动。
  4. **可观测性**：区分「产品断言失败」vs「preview/导航环境噪声」；失败日志须一眼看出类别。
- **验收**：新 CI run 链接 + pass/flaky/fail 计数；文档写明是否仍依赖 `retries: 1`。
- **不在范围**：不把「降 flaky」写成产品观感验收通过；不替代 Class-2 visibility gap（`honesty-bridge-entries-hidden` 等）的产品补锁。
- **排期**：**PR #2 → `main` 合并后立刻开工**（可与「CI 全量 smoke + e2e」同周并行）；建议分支名 `fix/visibility-ci-flaky` 或并入全量 CI 工程 PR 的首个 commit 组。

### Backlog:stash · chore/split-hints-from-pr2（**已关闭 · 2026-08-01**）

> **原背景（2026-07-27）**：曾留 stash `On chore/split-hints-from-pr2: temp prd untracked`。  
> **关闭（2026-08-01）**：本地 5 条 stash 已 `clear`；其中 PRD 草稿已归档至 `docs/archive/stashed-prds-2026-07-24/`（非 SSOT）。回 hints 拆分线时读该归档即可，**勿**再查找已删除 stash。

### Backlog:Hints anchor e2e bounding rect（Onboarding 提示 DOM 视觉校验）

> **背景（2026-07-22 拍板）**：层级 1 对齐单测已落地；本项为层级 3 几何。  
> **进度（2026-08-03）**：与 **④ 视觉护栏试点**合并——`hints-visual-guardrail.spec.js` 已锁 sit/help 几何 + mint；PR #93 已合。  
> **扩面门闩（同日拍板）**：**保持观察**——全量关键 id / peeked / linux 软快照 **勿默认开工**。  
> **不在范围 / 权威**：不替代人工观感关单（见 Brief `task-hints-visual-guardrail-pilot.md`）。

### Backlog:角色边界待观察事项（暂不处理,后续观察）

1. **`input/` 目录混放**：`FocusInput.js`（Gameplay 角色）与 `UIControls.js`（UI 角色）同处 `input/` 目录。当前两文件职责边界清晰、无跨界耦合迹象，暂不拆分子目录。若后续发现有跨文件耦合修改的情况，再考虑拆分为 `input/gameplay/` 与 `input/ui/` 子目录。

2. **`character/Actions.js` 与 `TigerCharacter.js` 职责轻微交叠**：`Actions.js` 负责行为枚举与播放控制，`TigerCharacter.js` 负责材质/光效参数与动画播放；与 `MoodController` 之间的信号消费边界，需要在每次涉及这两个文件的具体 Task Brief 中明确写出边界，不作为一次性目录重构处理。

---

## 角色协作机制（Role-Based Development）

为提升代码质量与模块边界清晰度，后续所有开发任务将明确声明执行角色。各角色职责边界如下：

### Architect（架构师）

- **职责**：设计模块边界、文件目录结构、模块间接口约定；`main.js` 作为跨角色装配层，其改动权限归本角色专属
- **禁止**：不编写具体实现代码，只产出设计文档更新（`ARCHITECTURE.md`）或伪代码/接口签名
- **对应文件范围**：`docs/`（含 `ARCHITECTURE.md` 及各模块间接口定义）、`src/main.js`、`src/render-compare.js`、`render-compare.html`、`utils/Constants.js`（跨模块共享常量，由本角色维护接口约定）
- **装配层约定**：其它角色如需将自己负责的模块接入主循环/初始化流程，应提交该模块对外暴露的初始化接口/调用方式说明，由 Architect 角色决定具体如何接入 `main.js`，不应由其它角色直接修改 `main.js`

### Three.js Engineer（渲染工程师）

- **职责**：模型加载、姿态管理（`PoseManager.js`）、动态效果层（旋转/呼吸/悬浮等）、Shader、粒子系统、材质
- **禁止**：不改动业务逻辑（专注计时、达标判断、每日状态重置等 `FocusSession` / `StateManager` 相关代码）
- **对应文件范围**：`character/`（不含 `MoodController.js`，已迁至 `core/`）、`effects/`、`feedback/`（`FocusVisualizer.js`、`TransitionFX.js`、`Ambience.js` 均为视觉渲染层）、`core/Renderer.js`、`core/Scene.js`、`core/PostProcessing.js`、`environment/`、`utils/Loaders.js`、`utils/configurePBRTextures.js`、`utils/Easing.js`、`assets/shaders/`、`scripts/generate-particle-glow.mjs`、`scripts/capture-poster.mjs`

### Gameplay Engineer（玩法工程师）

- **职责**：`FocusSession`（专注会话计时）、`StateManager` / `MoodController`（状态机、姿态触发信号）、`Milestone`（每日目标、一炷香判定逻辑）、Focus Confidence 计算逻辑
- **禁止**：不直接操作 Three.js 渲染细节（如具体的 shader 参数、粒子视觉效果实现），只负责产出"该显示什么状态"的信号，交由 Three.js Engineer 角色的代码消费
- **对应文件范围**：`core/FocusSession.js`、`core/StateManager.js`、`core/Milestone.js`、`core/MoodController.js`、`input/FocusInput.js`、`utils/Storage.js`

### UI Engineer（界面工程师）

- **职责**：HUD、按钮、debug 面板、PWA 配置、响应式布局（窄屏基线见 **`RESPONSIVE_LAYOUT.md`**）
- **禁止**：不改动 3D 场景内部逻辑
- **对应文件范围**：`input/UIControls.js`、`ui/`（`FocusHUD.js`、`RewardToast.js`、`Screenshot.js`）、`index.html`、`vite.config.js`

### QA Engineer（质量检查）

- **职责**：每个 Task 完成后，独立执行一轮检查，不参与该 Task 的编码过程
- **检查清单**：
  1. 控制台是否有报错/警告
  2. 是否有内存泄漏迹象（如粒子/精灵等临时对象未被正确清理）
  3. 是否符合 `PRINCIPLES.md` 中已定义的硬性原则（如"不制造焦虑原则""性能红线优先"）
  4. 边界情况测试（如状态快速切换、多个信号同时触发、姿态切换过程中触发其它事件等）
  5. 是否有跨角色越界修改（比如渲染相关任务是否意外改动了业务逻辑代码）
- QA 角色不需要等所有角色都完成后才执行，而应在**每个独立 Task 完成后立即执行一次**，再进入下一个 Task

### 使用方式

后续每次发起开发任务时，任务描述开头需注明：**"本任务以 [角色名] 身份执行"**。

任务执行前，Cursor 须先确认该任务内容是否落在声明角色的职责边界内。若任务内容涉及跨角色的改动，须在开始写代码前明确指出：**"这部分内容超出 [XX 角色] 职责范围，涉及到 [YY 角色] 负责的文件/逻辑"**，并等待确认后再继续，而不是默认自行处理。

任务完成后，如涉及功能性改动（非纯文档/纯 UI 调整），需要额外发起一次 QA 角色的独立检查请求；QA 检查通过后再进入下一个 Task。
