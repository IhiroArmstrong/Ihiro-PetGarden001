---
本项目文档已拆分为以下结构，请在需要时查阅对应文件：
- 产品定位(品牌使命与长期方向): /docs/PRODUCT_POSITIONING.md
- 文化探索方向锁(From App to Culture；App 社交塑造 Slack；废除证据门): /docs/FROM_APP_TO_CULTURE.md
- 陪伴成长意义层(Yin Evolution；关系叙事；不改分数公式): /docs/YIN_EVOLUTION.md
- 成长旅程方向锁(首页短轨迹 + 阶段下限；无运行时): /docs/GROWTH_JOURNEY.md
- 成长旅程实现说明(阶段门槛与首页短轨迹已落地；详情本刀): /docs/GROWTH_JOURNEY_IMPLEMENTATION.md
- 项目原则(硬性红线): /docs/PRINCIPLES.md
- 架构设计(模块职责边界): /docs/ARCHITECTURE.md
- 产品设计(角色设定与状态语义): /docs/DESIGN.md
- 协作流程(Task Brief规范): /docs/PROCESS.md（完整协作约定另见 /docs/COLLAB.md）
- 本文件仅包含任务序列与验收标准
---

# 坐禅小老虎 · 开发任务清单
# Focus Tiger · TASKS.md
# 版本：5.0 · 重大产品转向：单指标(专注心流) + 单一正念伙伴(小老虎) + 3D技术路线

> 产品定位、设计规范、架构说明已迁至 PRODUCT_POSITIONING.md / DESIGN.md / ARCHITECTURE.md / PRINCIPLES.md，本文档仅保留任务序列。

---

## ✅ 已完成

- [x] 早期原型：life_pet_garden.html（六节点+手动打卡，v1.0思路，已废弃）
- [x] 早期原型：zen_pet_demo.html（三节点+SVG宠物+离家出走信，v4.0前身，已废弃）
- [x] 盆景+小猫「月见」完整设计（v3.0-v4.1，含喂养/奇遇/商业化/社交四模块设计）
      —— 该版本设计文档保留归档，部分文案基调仍可复用，但核心机制已废弃
- [x] 小猫SVG美术资产迭代（cat_mascot_macaron.svg，共4轮修改）—— 随小猫角色废弃一并归档
- [x] 【v5.0】重大产品转向决策：砍睡眠/运动指标，砍盆景世界观，
      改为单指标(专注心流)+单角色(坐禅小老虎)+3D技术路线
- [x] 【v5.0】项目目录结构初稿评审（focus-tiger/项目骨架，已指出职责重叠/
      提前建network占位/缺渲染管理层三个问题，待v5.0设计定稿后重新细化）
- [x] 【v5.1】性能原则调整：从"优先保性能"改为"设底线，底线内放心追求视觉
      效果"，新增首屏Poster过渡策略；目录结构补充 docs/ / art-reference/ /
      public/ 三个根目录，GLB与贴图统一走public/而非src/assets的import方式
- [x] 【2D主线】SessionComplete 轻量完成反馈：28 帧 `session-complete`
      温和摆尾序列；同日后续达标触发，每日首次由 Celebrating 替代且不叠加；
      播完回归 idle-breathing，金光复用 Rim Light / FocusVisualizer

---

## 🔄 分阶段开发路线图

> 开发纪律见 PROCESS.md / PRINCIPLES.md 原则一：一次只做一个任务，禁止跨阶段并行。

---

## 📍 Phase 0：MVP核心循环（必须全部完成才可进入下一阶段）

[需遵守 PRINCIPLES.md 性能红线 / ARCHITECTURE.md 技术路线与目录结构]

### 任务一：3D场景基础搭建 ⭐️ 最高优先级
```
目标：Renderer + Scene 跑通，能看到静态的老虎(自然原色休憩态)坐在莲花台上

验收标准(含性能红线，这是3D路线新增的验收维度)：
  - 移动端首次加载时间 < 3秒(4G网络实测)
  - GLB+贴图总体积 < 3MB
  - 无交互，纯静态展示，用于先确认美术方向是否成立
```
（性能红线详见 PRINCIPLES.md；目录与模块边界详见 ARCHITECTURE.md）

### 任务二：金色专注视觉反馈 Shader 与 FocusSession 计时器
> **注记（2026-07-15）**：本任务当年按"自然原色→金色材质渐变"实现并已验收；该视觉方案后被新原则取代——角色本体固有色恒定，金色改由光环/环境光反射表达（见 DESIGN.md「视觉状态」）。3D 侧重构并入未来「奖励柜」任务。
```
目标：手动点击"开始专注"，金色专注视觉反馈随时间渐强，25分钟后触发CELEBRATE

不做：里程碑系统、唤醒仪式、任何数据持久化(这些是后续任务)
```
（视觉状态语义详见 DESIGN.md「视觉状态：金色环境光/光环渐变的核心表达」）

### 任务三：StateManager 状态机 + MoodController 动作联动
```
目标：IDLE/FOCUSING/BREAK/CELEBRATE四态之间正确流转，
      老虎播放对应动作(坐禅/欢呼)，不能出现状态与动画不同步的情况
```
（状态机与 MoodController 边界详见 ARCHITECTURE.md 单向数据流）

### 任务四：localStorage 数据持久化
```
存储内容：
  - 累计专注时长
  - 连续专注天数
  - 老虎的名字
  - 当日已完成会话记录 / 最近完成时间戳
    （用于判断自然日是否仍处于 DORMANT；含 Honesty Check-in 等价完成）

每日重置：无需重置累计指标本身(专注是累计型)；
         每个自然日开始时按「当日是否已有完成记录」重新判定 DORMANT
```
（Milestone 计算规则详见 DESIGN.md「Milestone：里程碑与成就」；
 DORMANT / Honesty Check-in 详见 DESIGN.md「DORMANT 唤醒仪式」）

### 任务五：沉睡态(DORMANT) + Honesty Check-in 唤醒仪式（✅ 2D 主链路已实现；Rim Light 正式路径待替换占位）
```
目标：当日自然日尚无任何已完成会话 → DORMANT（打瞌睡）；
     用户可忽略或点击「Quiet time elsewhere can live here too.」补登 10/20/30+ 分钟；
     10s 呼吸引导后 dormantWake（16 帧睡醒过渡 + 既有 FocusVisualizer），并按所选时长等同一次已完成会话。

已落地：DailyCompletionStore、HonestyCheckInController/UI、dormantWake 情绪键、
       getLocalDateKey → utils/localDate.js、未达标 End Focus 安静回 DORMANT；
       DORMANT 视觉 `sleeping` 8 帧 forward 循环；
       `dormant-wake` 16 帧一次性正放，前后 180ms cross-fade，播完回归 idle-breathing。
待替换：Rim Light 正式光效（当前 setFocusLevel 占位）。
```
（定稿详见 DESIGN.md「DORMANT 唤醒仪式」/ PRINCIPLES.md「诚实机制」/ EMOTION_BIBLE dormantWake）

### 任务六：PWA配置（Add to Home Screen 基础 · 2026-08-07 立项）
```
范围（已拍板）：Web App Manifest + 最小 network-only Service Worker；
  让用户「添加到主屏幕」/ 安装，并为日后推送打地基。
  不做：推送订阅/发送、复杂离线优先、Capacitor / 原生壳。

manifest.webmanifest：
  name / short_name: "Focus Tiger"（不带中文）
  theme_color / background_color: #e8e6e1
  display: standalone
  start_url: /?source=pwa
  icons: pwa-192 / pwa-512 / pwa-maskable-512 + apple-touch-icon（已入库；见 public/icons/pwa-icons.md）

service worker（方案 A）：几乎不缓存——fetch 一律走网络，不写 Cache Storage；
  不预缓存 sprites / 音频 / 3D。发版后旧内容卡死风险近零。
  生产构建才注册；dev 不注册（避免打坏 Vite HMR）。

状态（2026-08-08）：骨架 + 品牌图标已合入 `develop`（#180）；**安装体验 / SW 发版抽查延后到 PR #2→`main` + 稳定版后再办**（勿现在邀测；勿自行标已通过）。`feature/pwa-basics` worktree 已拆。
```
> **2026-07-30 口径（2026-08-16 修订 · 2026-08-17 脚手架 · 2026-08-18 步骤 B）**：本项**不是**「本地电脑版 APP」的终局。电脑版 Mac DMG 壳已拍板 **Electron**（#326）；脚手架规格 `task-electron-desktop-scaffold.md`（收费 DMG 必须有托盘）。**步骤 A 窗口代码已提交**；**步骤 B 托盘 + SB-18 已接线**（待 Mac 场景 AB）。PWA 继续只服务浏览器安装。**v1.0.0 纯本地 / v1.1 云端**仍有效：核心路径不依赖联网；service worker 只能增强，不得变成「无网不可用」。  
> **2026-08-07**：可选 PWA 基础层已立项；旧「离线缓存 3D」口径作废，以本任务块与 PRD 为准。  
> **2026-08-12**：相关但**独立**的「Web 轻量版本更新提示」（仅有新版本时出现 → 点一下刷新）已拍板；**不**扩大本任务为推送/补丁包。见 `PROCESS.md` + Brief `task-web-soft-update-prompt.md`。

---

## 📍 Phase 1：留存优化期（Phase 0全部验收通过后启动）

### 任务七：里程碑视觉化
```
连续天数/累计时长达标时的专属庆祝效果(比普通CELEBRATE更隆重)
具体视觉呈现留到本阶段设计，Phase 0只需正确记录数字
```
（里程碑规则详见 DESIGN.md；Phase 0 范围边界见该节「Phase 0范围声明」）

### 任务八：金光时刻截图分享
```
一键生成当前老虎状态的分享图，文案基调待定(需先确认产品调性文案)
```

### 任务九：高频曝光策略
```
Layer 1：手机锁屏小组件 —— 内容为老虎当前状态(自然休憩/金色庆祝)
Layer 2：推送通知 —— 语气克制，不制造焦虑，"它在等你"式陪伴语言，
         不做"你又没做到"式提醒
```
（需遵守 PRINCIPLES.md 不制造焦虑原则）

### 任务十：Session Intention / Arrival Practice（✅ v2 MVP）
```
Arrive 在 Sit 之后、计时之前的 Arrival Practice（见 ARRIVE_MOMENT_DESIGN.md v2 / CORE_LOOP.md）：

已实现：
  - 欢迎 beat（blink-smile + 文字气泡）→ Notice 6 图标（点选 → `presence-signals.v1`）→ ~5s 呼吸（无倒计时）
    → Choose 6 图标 + 次要打字 → Companion Mode 三选一 → 再点 Sit 开始计时
  - 全程 Skip + Skip — begin；Sit 二次点击可整体跳过仪式
  - Choose → focus-tiger.intentions.v1（source: icon|typed）；Notice → presence-signals.v1（arrival_notice）
  - Reflection 按来源回显（达标与未达标均回显）；Notice 不回显

明确不做：待办化、**诊断式**情绪分析、强制不可跳过流程、角色语音
```
（叙事层级见 PRODUCT_MOMENTS.md / CORE_LOOP.md）

### 任务十一：Tiger Reflection Moment（结束反思，✅ 已实现·MVP）
```
会话结束后可选的三问轻量反思（逐题淡入、每题独立可跳、Esc 整体划过），
非表单/非日报：无提交、无必填、无进度数字；仅非空答案本地保存最近 5 条。
正常完成在庆祝完整播放后留白淡入；主动结束不播完成反馈直接淡入。
问题三用"下次"而非"明天"（避免每日义务暗示）。
详细规范见 DESIGN.md「Tiger Reflection Moment」。
```

### 排队 · Five Moments 用户可感表面（2026-08-09 拍板）

> 叙事：`PRODUCT_MOMENTS.md` §5.6。父决策：`task-briefs/task-five-moments-surface-plan.md`。  
> **一次只做一个**；顺序强制如下。

| 序 | 代号 | 内容 | Brief | 状态 |
|---|---|---|---|---|
| **1** | B | Compass（⋯ + 可跳过首卡 +「?」可开指南） | `task-five-moments-compass-b.md` | **已合**（#201） |
| **2** | A′ | Moment Whisper（每键一生一次）+「?」桥接 | `task-five-moments-whisper-a.md` | **已合**（#203） |
| **3** | D′ | Journey Log（本地 · Tea Log 模式；非 HealthKit） | `task-journey-log-d.md` | **已合**（#205） |

不做：常驻 5-Dot 顶栏、教导 Banner、HealthKit 写入冒充。

---

## 📍 可靠性 · 练习记忆云端备份（2026-08-12 · #272 已合）

> 政策 #266；**≠** 云端品味层（旧称 v1.1 云端算法）、**≠** B 多端无缝。

| 阶段 | 内容 | Brief / 分支 | 状态 |
|---|---|---|---|
| **Brief** | 免费 A：静默快照 + 空库恢复；复用邮箱 OTP | `task-practice-memory-cloud-backup-a.md` | **已立项**（#270） |
| **实现** | Worker put/get/delete + 客户端 debounce / Idle flush / 空库恢复 / Journey 角落 | `feature/practice-memory-cloud-backup-a` | **#272 已合** tip `a195584`；Worker redeploy `f9755950-…` |
| **关单前置** | 生产 OTP secrets + TRACKER 端到端 | — | **secrets 已补**（2026-08-13）；TRACKER 仍待空库恢复 / 关备份（关单只认 develop tip） |
| **A′ 恢复派生** | v1 快照恢复后从 `practice-days` 派生 `daily-completions`（提醒与热力图对齐） | `fix/practice-backup-daily-completion-reconcile` | **#437 已合** |
| **B schema v2** | 白名单第 7 key + Worker redeploy；完整保留 `celebrated` / `sessions` | Backlog | 非前置；仅当需跨恢复保留 Celebrating 戳 |

---

## 📍 寅币（Focus Coins · Yin's Collections）

> 练习货币；对外 **寅币 / Focus Coins**；个人中心 **阿寅的珍藏 / Yin's Collections**。**不**建 entitlement key。权威 `FOCUS_COINS.md`。

| 级 | 内容 | Brief / 分支 | 状态 |
|---|---|---|---|
| **文档** | 花园 vs 珍藏、铁律、清供 8 | `FOCUS_COINS.md` · `task-focus-coins.md` | **本支** |
| **经济评估** | 日封顶通胀/紧缩（Step A–D） | `task-yin-coin-daily-cap-economy.md` | **Step D = A 已锁**（冻表、不远程、不改价）；persona CI 已接线 |
| **L0** | 纯账本单测 | `feature/focus-coins-l0-ledger` | **#335 已合** |
| **L1** | 完成钩子写入钱包 | `feature/focus-coins-l1-award` | **#338 已合**（TRACKER 待人工） |
| **L2** | 清供卡面可兑；叠层视觉拆掉 | `feature/focus-coins-l2-redeem` | **#339 已合**；2026-08-20 清供改名 |
| **L3** | **Yin's Collections** 抽屉；挥手点播走珍藏底栏 | `feature/yin-coin-l3-surface` | **#352+#353+#354 已合** |
| **挥手点播** | 珍藏挥手点播 Play；抽屉仍清供 8 | `feature/focus-coins-wave-playback` | **#356 已合** |
| **凭证卡** | 已拥有清供存一张竖图（器物、日期、累计分钟） | `task-collection-earned-piece-card.md` | **本支** · 待人工 |

合计 L0–L2 ≈ **10–16 人日**。与桌面智能体对照见 `FOCUS_COINS.md` §10。文化 meaning layer / Practice Identity **不**在本表开工，见 `FROM_APP_TO_CULTURE.md` §13。

## 📍 Yin's Art Collection（购买 · 与寅币珍藏分开）

| 级 | 内容 | Brief | 状态 |
|---|---|---|---|
| **静物** | 九张透明底；第一批五件与价格 | `task-yin-art-collection-stills.md` | **#1076 已合** · 无购买 |
| **结账** | 独立入口、详情、单独付款、登录后恢复 | `task-yin-art-collection-checkout.md` | **#1081 已合** · 生产 Worker `f72a4c10-…`（旧五件货架；菜单入口已撤） |
| **22 张收款** | 每张 $1.99；购买打开 Stripe；不卖旧五件 | `task-art-collection-live-checkout.md` | **#1090 已合** · 生产 Worker `3a028faf-…`（2026-10-08 部署） |
| **高清下发** | 付清后下载、本机离线缓存、轻购买者标记；预览仍进包 | `task-art-collection-hd-delivery.md` | **#1098 已合** · 生产 Worker `3a028faf-…`（2026-10-08 部署） |
| **收藏卡** | 已买下的一张存图；句子是「我选的」 | `task-art-collection-chosen-piece-card.md` | **本支** · 待人工 |
| **限量套装** | 一套 5 件；一版 100 套（500 件）；请茶谢礼在套外 | `task-art-collection-limited-sets.md` | **#1099 已合** · 生产 Worker `3a028faf-…`（用户口令「部署」· 2026-10-08） |
| **珍藏过渡** | 第一次结缘器物后，成功卡上一句安静英文，打开 Yin's Art Collection，只一次 | `task-collections-art-bridge.md` | **本支** |

---

## 📍 From App to Culture（2026-08-27 · 方向锁 · 2026-09-04 修订）

> 安静实践文化；App 社交塑造 Slack。**本表无运行时。** 权威 `FROM_APP_TO_CULTURE.md`。

| 项 | 状态 |
|---|---|
| 战略锁本文 | **方向锁**（证据门 **已废除**） |
| 设计师 Quiet Social / Identity / Rituals | **PO 评审已写入** §13 · 工程须口令 |
| Slack 实验室接线 Join our community | ✅ **已接线**（2026-08-29 · `communityLink.js`） |
| Global Lanterns / Quiet Together MVP | **本旁支开工** · Brief `task-quiet-together-lanterns-mvp.md` · 生产须部署 |
| Circle / Identity Runtime / 公开 Ambient | Circle **刀 2a #556 已合 + 生产已部署** · Brief `task-focus-circle-mvp.md` |
| 请你坐在旁边（一次码） | **运行时本旁支** · 同时最多 5 张未使用 · Brief `task-beside-seat-invite.md` |

---

## 📍 防剽窃层（2026-09-02 方向锁）

> SSOT：`ANTI_PLAGIARISM_LAYER.md`。品味云 ∪ YPE 云 ∪ 句包 overlay。**≠** 支付 / 备份 / Confide 路由。

| 序 | 内容 | Brief | 状态 |
|---|---|---|---|
| **0** | 概念 + 准入四问 | `ANTI_PLAGIARISM_LAYER.md` | **#542 已合** |
| **0b** | 冻表 vs 现网可分叉 | `ANTI_PLAGIARISM_LAYER.md` §3.1 | **已合文档** |
| **0c** | 值得保护四测（准入≠值得） | `ANTI_PLAGIARISM_LAYER.md` §3.2 · `PRINCIPLES.md` | **#599 已合** |
| **0d** | 兑现清单（现网 ≠ 冻表） | `ANTI_PLAGIARISM_LAYER.md` §3.2.2 | **#600 已合** |
| **0e** | C 表主线依赖 + 部署核对（不增 Epic） | `ANTI_PLAGIARISM_LAYER.md` §3.2.2 C/C′ · `task-lines-epic-draft` #8/#11/#13/#21 | **本切片（文档）** |
| **1** | Quiet Line 句包 overlay | `task-quiet-line-copy-overlay.md` | **#543 已合**（生产须「部署」） |
| **2** | YPE V2 + `algorithmVersion`（契约内真正政策） | `task-ype-v2-secret-transform.md` | **#545 已合 develop**（生产须「部署」） |
| **3** | Confide 句库 overlay | `task-confide-copy-overlay.md` | **#548 已合**（生产 overlay 已 Redeploy） |
| **3b** | Confide 在场 EN 分叉 | — | **#550 已合**（`CONFIDE_COMPANION_PRESENCE`） |
| **3c** | Confide boundary EN 分叉 | `task-confide-boundary-prod-fork.md` | **#551 已合 + 生产 Redeploy** |
| **后排** | 日签 14→N；伸懒腰 / 好奇池 | — | 不开工 |
| **权重分叉** | Rise 60/25/15 · Honesty ≤29/≥30 等 | — | **2026-09-07 拍板：暂不分叉**（roadmap D3） |

**执行排期 SSOT**：[`taste-layer-calm-action-roadmap.md`](./taste-layer-calm-action-roadmap.md)（Recover→Arrive→overlay→后排三池 · 2026-09-07）。

**我认为最合理的下一刀**：**Calm Action Reflect**（口令「开工 Calm Action Reflect」· `task-calm-action-reflect-runtime.md` · C4）。较弱：Transition / Focus 标语 / 日签扩容 / 伸懒腰 / 好奇池仍后排；权重生产分叉在无调参目标前不做。

## 📍 苹果 DMG 发布准备（Epic #5 · #631）

> SSOT 草案：`planning/task-lines-epic-draft.md` #5 · `PROCESS.md` Backlog「本地桌面 APP 打包」。

| 序 | 内容 | Brief / 权威 | 状态 |
|---|---|---|---|
| **—** | 脚手架步骤 A/B（窗口 + 托盘 + SB-18） | `task-electron-desktop-scaffold.md` | 步骤 A/B 已接线 · 待 Mac 场景 AB |
| **P0** | **官网 DMG 自动更新器**（第一份收费包出门前） | `task-electron-desktop-updater.md` | **#758 已合** |
| **P1** | **V8 字节码编译**（bytenode） | `ANTI_PLAGIARISM_LAYER.md` §7 | **编译脚本已加**（2026-10-01）· 须用 Electron 的 V8 编译 · 默认打包仍是可读 JS |
| **P1b** | **Voice Input V1**（Speak to type · 倾诉强制本机） | `task-voice-input-v1.md` | **Brief 已锁 · 探针/倾诉/意图回顾已合 develop** |
| **P1c** | **System TTS V1**（系统播报 + 全局声音开关 · 默认关） | `task-system-tts-v1.md` | **#1013 已合** · 听感仍待人工 |
| **P2** | **Confide 回复朗读**（倾诉文字 + 可选系统声） | `decisions/tts-v1-decision-memo.md` §决策 1 | **#995 已合** |

**官网 DMG 自动更新器 · 拍板摘要（2026-09-12）**：

- 官网直销无商店更新托底；第一份收费 DMG **必须**带检查更新代码（老包补不进这段逻辑）。
- **不重开** Electron vs Tauri。MVP：检测 → 空闲左下芯片 → 后台下载 → 用户确认后重启安装。网页 #263 仍只刷新。
- 失败须有 Retry / Not now；`urgency: required` 只预留、MVP 当 optional。渠道 `direct` 才开自建更新；Setapp / MAS 编译期关掉。
- 验收不得等两次正式发版：单测状态机 + DEV 假通路 + 本地 generic feed；公证双包是发版彩排。
- 发布检查清单写在 Brief 内（可勾选），禁止只停留在散文。

**Voice Input V1 · 拍板摘要（2026-09-24）**：

- Speak to type，不是语音条 / 实时 Voice Agent。共享组件一次做成；首发只挂倾诉、Arrival 手写意图、Reflection 三问。
- 仅 Electron 英语听写；界面英日切换不改。倾诉 **禁止**注入云 STT（硬约束）。
- 第一口令「开工 Voice Input 探针」（系统听写 + 麦克风权限）；探针前不做云厂商对照表。

**System TTS V1 · 拍板摘要（2026-09-26）**：

- 分两刀：本期只做**系统播报**（专注结束、仪式提示）+ **全局声音开关（默认关）**；倾诉回复朗读下一期。
- macOS 本机 `AVSpeechSynthesizer`；在 `macos-speech-helper.swift` 加 `speak`，与 STT 共用桥、开关独立。
- 朗读语言跟随界面语言（英/日）；危机句/安全转介不朗读。决策 `decisions/tts-v1-decision-memo.md`。
- 第一口令「开工 System TTS 探针」；探针及格后再挂产品播报点。

**V8 字节码编译 · 拍板摘要（2026-09-10）**：

- Electron + DMG 打包后，前端代码进 `app.asar`（Mac 右键应用→显示包内容可见）。**asar 不是加密**——`npx asar extract app.asar output/` 可原样解压；门槛从「F12 看源码」变成「装 DMG + 解压 asar」，对懂技术的竞品仍 <10 分钟。
- **不是「安全」**，只是提高门槛。可选加深：代码混淆（terser/obfuscator）→ 难读但仍可扒逻辑；**V8 字节码编译（bytenode）** → 不再是直接可读源码，需额外反编译功夫，Electron 生态里相对成熟、成本不高。
- **再往上**（核心逻辑写 C++/Rust 原生模块）防护力更强，但工程复杂度显著上升；对 score/徽章/纪念印公式这类保护对象 **大概率不值得**。
- **建议不变**：真正护城河是阿寅人设、美术、内容库（版权能覆盖、更难简单复制）。若只想加一道「防随手抄」门槛，**V8 字节码编译是性价比比较合理的选项**；不建议为防剽窃做到原生模块量级。**耦合** Epic #21。

## 📍 Calm Action Wisdom 运行时（2026-09-07 · 用户拍板）

> SSOT 内容：`CALM_ACTION_WISDOM.md`（70 条 · 无 overlay）。**执行次序** → [`taste-layer-calm-action-roadmap.md`](./taste-layer-calm-action-roadmap.md)。

| 序 | 表面 | Brief | 状态 |
|---|---|---|---|
| **C1** | **Recover**（打断后 S/M；不替换 toast） | `task-briefs/task-calm-action-recover-runtime.md` | **#625 已合**（TRACKER 待人工） |
| **C2** | **Arrive**（C1 §7 关单后立刻排；建议 B1 冷启动 gate 已拍板） | `task-briefs/task-calm-action-arrive-runtime.md` | **#665 已合**（TRACKER 待人工） |
| **C4** | **Reflect 完成页** | `task-briefs/task-calm-action-reflect-runtime.md` | **#672 / #675 已合** |
| C3+ | Focus S 标语 / Transition | 另 Brief | 未立项 |
| **D** | Calm Action overlay | `task-briefs/task-calm-action-copy-overlay.md` | **#670 已合**（生产已部署） |
| **—** | 日签 14→N | 另 PR · 另口令 | 后排（≠ Calm Action） |

**2026-09-07 拍板**：Recover 第一刀 · Arrive 第二刀（不无限延后）· 权重表暂不分叉。

---

## 📍 静思典藏层（2026-09-06 · 内容锁 · 无新运行时）

> SSOT：`CONTEMPLATIVE_ARCHIVE.md`。**≠** Quiet Line / Daily Wisdom / Calm Action Wisdom。

| 项 | 状态 |
|---|---|
| 层级名 Contemplative Archive / 静思典藏 | **已写入规范** |
| 第一枚纪念印 《芥子须弥》三 case | **现网已接线**；TRACKER 待人工关单 |
| 12 条候选表 | **已入库**（无运行时） |
| 第 2 枚印（古池 · score 30） | **未立项**；须另 Brief + 口令 |

---

## 📍 前景卡背景 dim 推广（2026-09-08 · 排期锁）

> SSOT：`task-briefs/task-overlay-backdrop-dim-rollout.md`。标杆：纪念印 Phase B（#614 已合）。**会话主路径永久排除 dim**（Arrival / Reflection 等轻量观照，用户 2026-09-08 拍板）。

| 切片 | 内容 | Brief | 任务线 | 状态 |
|---|---|---|---|---|
| **—** | 排期 + 清单 | `task-overlay-backdrop-dim-rollout.md` | #645 · #637 · #630 | **本支文档** |
| **0** | `overlayBackdrop` 共享 helper |  rollout §Slice 0 | #645 | **已合 #655** |
| **1a** | Quiet Line 背景 dim | `task-quiet-line-backdrop-dim.md` | #637 · #645 | **已合 #656** |
| **1b** | Wallpapers 背景 dim | `task-wallpapers-backdrop-dim.md` | #645 | **已合 #659** |
| **2** | Compass + Yin Coin + Zen Cinema | `task-growth-panels-backdrop-dim.md` | #633 · #632 | **已合 #660** |
| **3** | 付费族 SB-19 视觉-only dim | `task-paid-panels-backdrop-dim.md` | #630 · #639 | **#661 已合** |

**已有 dim（不必重做）**：纪念印 · Journey Log · Support · Membership · ? 钉住 + Privacy · 宽/窄菜单抽屉。

**永久排除**：Arrival · Honesty · 微仪式 · Reflection · Ritual · Companion · 时长选择 · Whisper/气泡族 · Sound/Reminder chrome。

**我认为最合理的下一刀**：Slice 0 helper → Slice 1a Quiet Line（与纪念印同族 Save image 卡）。

---

## 📍 云端品味层（2026-08-18 政策锁）

> 旧称「v1.1 云端算法」。**支付云 ≠ 品味云**。权威 `PROCESS.md` Backlog「云端品味层」。

| 阶段 | 内容 | Brief / 分支 | 状态 |
|---|---|---|---|
| **政策** | 只上云权重覆盖 + 日签/文案池；播放器永远本地；窄冻结后开工；`schemaVersion` 降级；**四问筛选尺**（2026-08-20） | `task-cloud-taste-layer.md` | **#337 已合** · 窄冻结已拍板 · 四问已拍板 |
| **实现** | 可选拉取 + 本地降级；不接 Sit 门闩 | 口令「开工云端品味层」 | **#349 已合**；**2026-08-20 本机 deploy** Version `5b5b3451-4c35-4d9b-b27b-622b72ed673e`（现网 v1） |
| **下一刀** | Quiet Line / 今日静语句包 overlay | `task-quiet-line-copy-overlay.md` | **#543 已合**；生产 Redeploy 另须「部署」；日签扩容 / 伸懒腰·好奇池后排 |

---

## 📍 Yin Personalization Engine（2026-08-26 方向锁）

> 编排 SSOT：`YIN_PERSONALIZATION_ENGINE.md`。**≠** Memory store / 品味层 / Qwen runtime / 练习备份（同属防剽窃层、不同路由）。L0/L1 已开工。L2 **契约**已合 #454。Consent **附录有条件通过**。身份键 **已拍**（#456）。算法契约 V1。**Worker ingest 源码已合**。V2 见 `task-ype-v2-secret-transform.md`。

| 级 | 内容 | 文档 | 状态 |
|---|---|---|---|
| **架构** | Cloud Brain / Local Runtime；State Pack；隐私特征白名单；L0/L1/L2 | `YIN_PERSONALIZATION_ENGINE.md` | **方向锁**（#451）· **L2 契约收口 2026-08-26** |
| **L0** | 现有沉默/层序收成政策接口（行为不变） | `task-yin-personalization-engine-l0.md` | **已合 #452** |
| **L1** | 本地检索契约 ≤3 条；计数型 insight；三档政策 | `task-yin-personalization-engine-l1.md` | **已合 #453** |
| **L2 契约** | H.3 V1 五键；Pack 无 rankHint / 无 memoryHints；异步增强 | `YIN_PERSONALIZATION_ENGINE.md` | **已拍板（文档）** |
| **L2 同意 UI** | 第四条独立同意；Privacy 开关；本机 `ype_profile_id`；无 Worker | `task-l2-personalization-consent.md` | **#458 已合** |
| **L2 同意文案** | 关即删；HINT+DETAIL 附录 | 同上 | **已进 locale（en/ja/zh）** |
| **L2 身份键** | 本机随机 `ype_profile_id`；第二设备新档案；删除不连带 | `task-l2-personalization-identity.md` | **已拍（#456）** |
| **L2 算法 V1** | 五键 → Pack 闭包；回声选档；`patternInsights=[]`；不按完成率改档 | `task-l2-personalization-algorithm.md` | **契约已锁** · Worker 签发已合 |
| **L2 算法 V2** | 同一五键上的秘密闭包 + `algorithmVersion`；白名单 insight；仍禁止用户可见打分 / 用完成率改档 | `task-ype-v2-secret-transform.md` | **#545 已合 develop**；生产须「部署」 |
| **L2 运行时 V1** | Worker ingest / delete / Pack 签发 + 客户端 sync | `task-l2-personalization-algorithm.md` | **源码已合**；生产 KV/Redeploy 见 TRACKER |

**我认为最合理的下一刀**：防剽窃层序 3 Confide 句 overlay。YPE 现网生效须部署 Worker；阈值允许与 git 分叉（§3.1）。

## 📍 Yin Personal Memory（2026-08-24 方向锁 · 2026-08-25 排 Slice 0）

> 外在记忆 SSOT：`YIN_PERSONAL_MEMORY.md`。**≠** Journey Log / 练习云备份 / `turns.jsonl`。运行时须口令「开工 Yin Personal Memory」。

| 级 | 内容 | Brief | 状态 |
|---|---|---|---|
| **架构** | 四类记忆 + Remember/Use/Forget；Safety > Corpus > Memory > Qwen | `YIN_PERSONAL_MEMORY.md` | **方向锁 · 无 store** |
| **Slice 0** | Confide「练了多久」用本机练习字段精确应答，禁止 Qwen 编造时长 | `task-yin-memory-slice-0-practice-facts.md` | **#424 已合** · tracker 待人工 |
| **Slice 1a** | Consent 门闩 + userData store 骨架（`yin-personal-memory.json`） | `task-yin-memory-slice-1a-consent-store.md` | **已合 #427** |
| **Slice 1b** | Remember 管道（L3 成功后静默入库） | `task-yin-memory-slice-1b-remember.md` | **已合 #428** |
| **Slice 1c** | What Yin remembers 列表 + Forget UI | `task-yin-memory-slice-1c-list-forget.md` | **已合 #430** |
| **Slice 1d** | 层 3 注入 | `task-yin-memory-slice-1d-l3-inject.md` | **已合 #431** · tracker 待人工；仪式 generate **仍未拍板** |
| **Slice 1e** | 口头 Forget Confide 路由 | `task-yin-memory-slice-1e-verbal-forget.md` | **已合 #434** · tracker 待人工 |
| **Slice 1f** | Don't save this · memory suppress | `task-yin-memory-slice-1f-dont-save-this.md` | **#489 已合** · tracker 待人工 |

**我认为最合理的下一刀运行时**：**口令 1C validation**（非 shipping）。Gate 0.2 #472 已关单；**1B #503 已合**；**1A 本旁支**。Phase 1 仍须**分项口令**。较弱：把 validation 当 shipping；V2 Journey Delete · Reflection **shipping**。

---

## 📍 Local AI Phase 1（2026-08-28 · PO 正式拍板）

> **SSOT**：`LOCAL_AI_SCENARIO_EXPANSION_PO_DECISION.md` · `LOCAL_AI_SCENARIOS_V1.md` · **`LOCAL_AI_PHASE1_TASK_PLAN.md`**（执行计划 · Gate 0.2 A/B/C）  
> **会审输入**：#462 · 设计师预审 #475 · PO 决策 #476  
> **硬规则**：Brief 存在 ≠ 开工；**Validation ≠ Shipping**

| 轨 | 内容 | Brief | PO | 状态 |
|---|---|---|---|---|
| **1A** | NL Actions MVP：Forget（CI-01）+ Show memory read | `task-local-ai-phase1-nl-actions-mvp.md` | **CORE** | **#506 已合** |
| **1B** | Ask Journey / Presence · Retrieve + bounded Describe + **Temporal Compare** | `task-local-ai-phase1-ask-journey-presence-mvp.md` | **CORE** | **#503 已合** |
| **1C** | Reflection Companion · 用户点 → one observation | `task-local-ai-reflection-companion-validation.md` | **Candidate · validation only** | lab `?reflectionCompanion=1` · PR #486/#507 已合 · tracker 待人工 · Epic #810/#815 |
| **1C-ship** | Reflection Companion · shipping（去 lab） | `task-local-ai-reflection-companion-shipping.md` | **骨架 · 未批准** | Issue **#811** / QA **#816** · 待 PO 口令 |
| **V2** | `DELETE_TODAY_JOURNEY_ENTRY` | — | Future Candidate · **NOT MVP** | **无** implementation task |
| **—** | Don't save this | `YIN_PERSONAL_MEMORY_PERSISTENCE_POLICY.md` | ✅ Slice 1f | tracker 待人工 |
| **0.D** | Yin Intent Diagnostic（只输出 intent JSON） | `LOCAL_AI_PHASE1_TASK_PLAN.md` §6.1 | **换模型前必做** | Phase 1–2B/E′ **#495–#520** · 字面预筛 **#523** · 三门禁 **#524** · 切片 3 **#525** · Tier 2 **#526** · **PO 不立项 Phase 3 / 不换模**；语用残差不另开生产任务 |

**Ceiling**：C2 + 少量 C3 · **C4 NO** · V4 MUST NOT ENTER 已锁 · V5 全禁。

**我认为最合理的 Phase 1 开工顺序**：① #472 **已关单** → ② **1B #503 已合** → ③ **1A #506 已合** → ④ **1C validation 本旁支**（非 shipping）。Forget 端到端补测不挡。较弱：未 validation 就 ship Reflection generate；0.D 后再 Benchmark Llama。

---

## 📍 产品知识库规模化生产（2026-09-22 · PO 已拍板）

> **SSOT**：`task-briefs/task-kb-scaled-production.md`。条目字段仍以 `product-knowledge-base.md` 为准。检索接线 / 路由闸门另见对应 Brief。  
> **硬规则**：Epic / Test Tracker / PR **只做候选主题**；可念短答只从 locale / 规则源码起草；运营数字不进短答正文。内部手册 ≠ 阿寅可念库。拍板 ≠ 开工脚本。

| 步 | 内容 | 状态 |
|---|---|---|
| **0** | 算法 Brief + 三默认 | **PO 已拍板**（2026-09-22） |
| **1** | 静态圈定存活入口 | **已合 develop** (#929) · `kbLiveEntryRegistry.js` + `audit:kb-live-entries` · 25 行存活清单 · 无运行时 |
| **2** | 存活清单 vs 已通过 KB 缺口 | **已合 develop** (#931) · `audit:kb-live-gap` · 12 batch-2 候选 · 6 registry 漂移已修 |
| **矩阵** | KB 路由回归夹具（意图×问法；断言 dataSource/KB 编号） | **已合 develop** (#938) · `confideKbRoutingMatrix.js` · 不改 live · 无 GGUF |
| **3** | 已审条目扩问法（0011/0012/0013/0004/0008 等） | **已合 develop** (#932) · 事实不变 · catalog 关键词 |
| **4** | 权威源起草 → PO tone spot-check → catalog | **0019/0020 已合 develop** (#939 · 闸门 18) · **0021 Daily quote 已合 develop** (#940 · 闸门 **19**) · **0022 Zen Cinema 待审草稿**（`docs/kb-batch2-zen-cinema-draft` · PR #962）· **0023 Wallpapers 待审草稿**（`docs/kb-batch2-wallpapers-draft`） |
| **手册** | `docs/internal-handbook/` 内部版 | **雏形已开**（2026-10-01）· 只从存活清单生成 |

**0022 / 0023** 已入库 catalog（见 `product-knowledge-base.md`）。不要再按「待审草稿」重开。

---

## 📍 Presence Signals（2026-08-25 · 陪伴观察账本）

> **≠** Yin Memory · **≠** Journey Log · **≠** `reflections.v1` 趋势 SSOT。Arrival Notice（calm / stressed / sad 等）及后续 Ritual / Reflection 封闭标签入账 `focus-tiger.presence-signals.v1`。Confide 趋势问句 → **CI-02** `presence_facts`（描述性 breakdown，禁止诊断）。

| 级 | 内容 | Brief | 状态 |
|---|---|---|---|
| **Slice 0–1 + 4** | 文档 + Arrival Notice 写入 + Confide 只读趋势 | `task-presence-signals-slice-0-1.md` | **已合 develop** · tracker 待人工 |
| **Slice 2** | Ritual chip 入账 + Leave 弱提示 | 见 Brief §后续 | 排期 |
| **Slice 3** | Reflection Q1–Q3 双写 | 见 Brief §后续 | 排期 |
| **Slice 5–6** | 查看/删除 UI · L3 freeText（读取 Consent） | 见 Brief §后续 | **#487 已合** |

**我认为最合理的下一刀**：Slice 0–1 与 Slice 6 已在主干。剩下的是 Slice 2 或 Slice 3，另口令。

---

## 📍 工程提醒（跨会话门闩）

| 提醒 | 触发 | 动作 | 权威 |
|---|---|---|---|
| **stash · `chore/split-hints-from-pr2: temp prd untracked`** | 回到 hints 拆分 / `chore/split-hints-from-pr2` | 先 `stash list` + `stash show` 核内容，再决定保留或丢弃；**禁止未核就 drop** | `PROCESS.md` Backlog「stash · chore/split-hints-from-pr2」 |
| **场景→动画接线 · v1 Slice A** | v1.0.0 冻结前 / 点名开工 | 实现 `feature/scene-animation-wiring-v1-slice-a`；产品稿已落盘 | `SCENE_ANIMATION_WIRING.md` · Brief `task-scene-animation-wiring-v1-slice-a.md` |

---

## 📍 响应式 / 移动浏览器（2026-07-21 立项）

> 权威基线：`RESPONSIVE_LAYOUT.md`。用户 2026-07-21 书面同意两项 **分拆** UI Task，**一次只做一个**。

| 顺序 | Task | Brief | 状态 |
|---|---|---|---|
| **1** | 窄屏 Onboarding 互斥 + Sit 主 CTA 不截断 | `task-briefs/task-responsive-narrow-onboarding-sit.md` | **代码已落地** · 待人工复测 |
| **2** | 竖屏横屏建议 UI（§6.4） | `task-briefs/task-responsive-landscape-suggest.md` | **代码已落地** · 2026-10-01 PO 取消人工验收门闩 · 真机可测时再关单 |
| **3** | **窄宽屏合并为响应式单代码线**（消分叉漏修） | `task-briefs/task-responsive-single-chrome-line.md` | **代码已落地 · 待双视口人工验收**（2026-07-30）。PR #31（Brief/阶段0）· #32（编排）· #33（facade）已合 `develop`。阶段 3：文档收口 + main 去掉分壳别名。关单须 **§8 + §9** 分测（见 TEST_TRACKER「Task 3 单代码线」行）；**禁止**与场景 O 混验。 |

**共同验收**：375×667 竖屏 + 横屏各走通 `RESPONSIVE_LAYOUT.md` §五 相关路径；`TEST_TRACKER` 分列登记。Task 3 另须 §8 + §9 故事最小集（见 Brief）。

> **2026-07-25 架构拍板（用户同意倾向 + 排期约束）**：窄屏抽屉与宽屏 ⋯ 菜单长期分分支维护是分叉漏修的结构性成因；值得合并成响应式单线，但须等本次宽屏修复人工验收 + push 后再开重构，避免与未验收修复叠风险。见 `PROCESS.md` 速览 / `RESPONSIVE_LAYOUT.md`。  
> **2026-07-30**：触发条件已齐；Brief 已交付并进 develop（PR #30）；同日开 feature 做阶段 0。

---

## 📍 Web2 岁月印记（2026-08-24 · 拒 Web3）

> 用户拍板：纪念走 Web2（修行纪念印 / 静默画卷 / 实体优先权），**禁止** mint / wallet / token / SBT。映射见下表；**不**新开链上立项。

| 采纳项 | 接哪条 Brief / 现网 | 排期 | 状态 |
|---|---|---|---|
| 高精度禅意徽章 · **累计**门槛 · 少连坐话术 | `task-practice-imprint-badges.md` + 壳 `task-yin-collections-four-tabs.md`（页签 **勋章印记**） | **P1** | **#906 已合** · 四页签壳 **#905 已合** |
| **共享里程碑目录**（谓词 SSOT） | `task-shared-milestone-catalog.md`（跨芥子 / score / Journey / Glow 占位字段） | **P0** · Batch 1 数据模块另口令 | **口径已锁** · 无运行时 |
| 成就物 · **行为稀缺说明**（非随机、非货币） | `task-collections-behavioral-scarcity.md`（2026-09-20 **V1 已拍**：本机说明 + 勋章分区；不进「案上陪伴」；全球名次不做） | **P1** · 实现另口令；**等目录 Batch 1** | **口径已锁** · 无运行时 |
| 现网仪式/印（不重复立项） | `MilestoneGlow`（7/21/100 动画）· `mustardSeedSeal`（score≥21 诗稿）· Idle 练习徽章 | — | **已接线** · TRACKER 待人工 |
| Idle 身旁章 · **颁发那一下**（飞入动效） | `task-badge-award-moment.md` | **P2** · 庆祝链稳定后 | **实现中** · `feature/badge-award-moment` |
| 纪念奖励环境细节（茶盏/香炉/蒲团） | `PROCESS.md` Backlog「纪念奖励系统」表 | **P2** · 2D 主线稳定后 | 未接线 |
| 年终 / 深练 **Save image 画卷** | `task-mindfulness-scroll-export.md` ← 依赖 `task-journey-daily-card.md` | **P1b** · 触发 B | **本旁支** · 记忆小册 Save image；年末自动触发仍不做 |
| 单日日記卡（存图管线） | `task-journey-daily-card.md` | **P1a** · 无链依赖，可先开 | **代码已落地** · 2026-10-01 · 待人工关单 |
| 实体周边优先权（账号+门槛） | `task-companion-merch-priority.md` | **P0 运营** Phase 0 手工可即刻；Phase 1 产品壳在 imprint 后 | Phase 0 文档锁 |
| 用户感知句「岁月印记 / 修行纪念」 | 各 Brief + `FOCUS_COINS.md` §0.1；i18n 禁 Web3 词 | 随各 PR 文案 | 已写入 Brief |

**我认为最合理的开工顺序**：① 共享目录口径 **已锁** → ② 目录数据模块对照单测（Batch 1，另口令）→ ③ `feature/journey-daily-card`（存图管线，可并行）→ ④ `feature/yin-collections-four-tabs` + `feature/practice-imprint-badges` + 稀缺说明 V1（挂同一勋章分区）→ ⑤ `feature/mindfulness-scroll-export`；周边 Phase 0 不等代码。全球名次不做进 V1。禁止跳过②直接写稀缺 UI。Journey「回来天数」文案 vs 连续日算法见目录 Brief **J-copy**（不阻塞 ②）。

---

## 艺术品退款撤销拥有（2026-10-03）

- [x] 退款完成后撤销艺术品拥有，并停止再发高清。Brief：`docs/task-briefs/task-art-collection-refund-revoke.md`。**#1086 已合** · 生产 Worker `f72a4c10-150d-4b74-ae41-d1d710bb2b07`。Stripe 那边还要勾上 `charge.refunded`，代码才会收到退款。
- 这是接通艺术品真实收款的前置条件。22 张方案的购买按钮这一刀仍不收款。

## 📍 Phase 2 及以后：待评估

```
以下内容明确不在本次v5.0设计范围内，待Phase 0-1验证核心体验后再评估是否需要：
  - 奇遇系统(随机访客等惊喜机制)
  - 环境/角色皮肤商业化
  - 社交/多人共修功能（App 内 SNS **禁止**本探索期；Slack 实验室与 Lanterns 见 `FROM_APP_TO_CULTURE.md`）

原因：单指标单角色产品的核心价值在于"简单直接"，
过早引入这些曾经为"三指标盆景世界"设计的扩展机制，
有把产品重新做复杂的风险，需要等核心体验跑通后再决策。
```

---

## 📍 状态片（2026-10-09）

上面的段落是既有排期，不再往里面改状态。新任务的进度，以及已部署、已备份，写 `docs/task-entries/` 里单独的文件。功能 PR 不要改本文件。说明见 `docs/task-entries/readme.md`。

<!-- task-entries:begin -->
### `co-practice-gift-art` · feature · 方向锁已合 #1472 · 未排期发画 · 下一刀 T67 补账 · 2026-10-30

共修纪念画方向锁已合。PO 改口：C 为节奏稳定代理；B 只数专注中邀请被接受并坐完。发画仍未排期。下一刀 **T67** 只补账、不出画。

### `t66-mindflow-nebula-v0` · note · Brief 已点头 · 代码已合 #1475 · 关单级手测待批 · 2026-10-30

T66 心念流 / 隐迹星云 v0：可选 180×180 粒子画布；三种状态；无 embedding。Brief [`task-mindflow-nebula-v0.md`](../task-briefs/task-mindflow-nebula-v0.md)。PR [#1475](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1475)。

### `t67-co-practice-session-join-ledger` · feature · Brief 待点头 · 排队中 · 可选 · 2026-10-30

T67 共修场次接合账（原 #1474 docs 误占 T66，2026-10-30 治理改号）。只补场次 id 与出示默认分钟流水。不发画、不改 T57/T58 可见行为。SSOT Brief `task-co-practice-session-join-ledger.md`。方向锁 `CO_PRACTICE_GIFT_ART.md`。

### `confide-dock-suspend-no-drag` · feature · 实现旁支 · PR 待合 · 2026-10-29

T41 倾诉贴边 **暂时停用**（各宽度居中 + 倾诉卡禁拖）；置顶与 T42 不变。Brief [`task-briefs/task-confide-dock-suspend-no-drag.md`](../task-briefs/task-confide-dock-suspend-no-drag.md) · 账本 [`issue-entries/fix-confide-dock-suspend-no-drag.md`](../issue-entries/fix-confide-dock-suspend-no-drag.md)。

### `ritual-recipe-phase1` · feature · 进行中（A1a+A5 已合 #1467 · A1b 已合 #1469 · A4 已合 #1471 · A2 本支） · 2026-10-29

平台阶段 1：坐的配方。Brief [`task-ritual-recipe-phase1.md`](../task-briefs/task-ritual-recipe-phase1.md)。A4 Brief [`task-ritual-recipe-a4-official-templates.md`](../task-briefs/task-ritual-recipe-a4-official-templates.md)。A2 Brief [`task-ritual-recipe-a2-edit-my-recipe.md`](../task-briefs/task-ritual-recipe-a2-edit-my-recipe.md)。真源 [`RITUAL_RECIPE_A1_SPEC.md`](../RITUAL_RECIPE_A1_SPEC.md)。顺序 A1a → A1b/A1c → A4 → **A2**；A5 与 A1a 并行；A3 在 A1a 后；B1 在 A4 后。一次 PR 一条线。总表新节因 `tasks:check` 不能进功能 PR，另开只改 `TASKS.md` 的文档 PR。

### `t55-companion-contract` · feature · 已完成 · 已合 develop（PR-1 #1419 · PR-2 #1425 · PR-3 #1426 · PR-4 #1429 · 补丁 #1431） · 2026-10-29

**T55** 陪伴契约。A 类。Brief [`task-companion-contract.md`](../task-briefs/task-companion-contract.md)。`npm run check:companion-contract` 进 `docs:check`。合入后补丁：近邻再加同坐环悬停与分钟/天数练习事实；§D 写明 34/34 是回归不是覆盖率/验证、对外不引用；日文样本目前不算覆盖。「已知漏网」一栏另开小任务。不改运行时。不是 T54。

### `t55-more01-c11-samples` · note · 排队中 · 可选（PO 2026-10-29 点名） · 2026-10-29

**T55-more01** 陪伴契约 C-11 回归样本。A 类。in：`companion-contract-samples` + `companion-contract-forbidden` C-11 字面模式；check 仍 1.0/1.0（39/39 · 10/10）。out：Confide 现场句、语义模型。验收：`npm run check:companion-contract`。不是 T55 主任务重开。

### `t55-more02-known-gaps-registry` · note · 排队中 · 可选（PO 2026-10-29 点名） · 2026-10-29

**T55-more02** 陪伴契约已知漏网登记。A 类。[`companion-contract-known-gaps.md`](../companion-contract-known-gaps.md)。out：语义检查器。验收：PO 过目表。不是 T55-more01 样本集。

### `t63-co-practice-contract-surface` · feature · 已合 develop #1463 · 2026-10-29

共修契约面：成长旅程详情里说明 Yin 可能开口的地方，并可去已有开关处关/降。不新增劝睡。规格 [`task-co-practice-contract-surface.md`](../task-briefs/task-co-practice-contract-surface.md)。

### `t64-co-practice-copy-align` · feature · 已合 develop #1460 · 2026-10-29

共修文案对齐：问号简介 `HINT_APP_PURPOSE_BODY` / `HINT_APP_PURPOSE_WELLNESS_BODY`（切片 `co-practice-copy.json`），补「不是禅师」+「一起练习、不催不评判」。卷/超卖扫描见 [`t64-co-practice-locale-scan.md`](../t64-co-practice-locale-scan.md)。规格 [`task-co-practice-copy-align.md`](../task-briefs/task-co-practice-copy-align.md)。

### `t61-user-set-work-end-time` · note · 搁置 · 未排期（Brief 待点头） · 2026-10-28

用户自设收工时间 + 到点陪伴式邀请。B 类。须 **T60 → T57 → T58** 已合后才写代码。盘点 [`late-night-behavior-inventory.md`](../late-night-behavior-inventory.md) §2、§6。**不是** T58。

### `t62-evening-practice-facts-practice-paper` · note · 已合 develop #1459 · 2026-10-28

晚间练习事实进练习纸。与 **T61** 分开（T61 已合 #1455/#1456）。新本地 ledger + 单独同意 + T60 重置名单；**不进** T54 研究分享。盘点 §3。完整规格 [`task-evening-practice-facts-practice-paper.md`](../task-briefs/task-evening-practice-facts-practice-paper.md)。

### `t65-practice-paper-check-in-rhythm` · feature · 已合 develop #1461 · 2026-10-28

观察纸露出 T52 顺/乱/倦近七日节律。不加新键、不打分。单测 `practicePaperCheckInRhythm.test.js`；e2e `practice-paper-check-in-rhythm.spec.js`。

### `late-night-behavior-inventory` · note · 盘点已写（A 类；无运行时） · 2026-10-27

T56 跟进：作息提醒未实现。只读盘点现网深夜行为；不改 T60→T57→T58 顺序。**T61/T62** 已治理登记（2026-10-28）。

### `co-practice-positioning` · feature · 已完成（口径 + C-11；无运行时） · 2026-10-26

人机共修只加口径。适应层等 Brief 点头后再写代码。

### `t53-awaken-input-rhythm` · feature · 旁支实现中 · 2026-10-26

T53 输入节奏：默认关；无 Input Monitoring 退回 T51（SB-21）。只记间隔与退格，不记键值/标题。叠在已合 T52 之后。

### `t54-research-consent` · feature · 立即做 · 可选（实现中） · 2026-10-26

**T54** 阶段 2 第二刀：Privacy 研究数据分享开关（改进产品层）。B 类。默认关。不改招呼。不开 90 天。Brief [`task-t54-research-consent.md`](../task-briefs/task-t54-research-consent.md)。影子流水 #1430 已合。PO 已点头文案。不是 T50 / T51 / T52。不是 T4。

### `t56-analyst-followup` · note · 口径补丁待合（无运行时） · 2026-10-26

分析师点头一页纸与 T57，T58 改稿后再点头。T59 另开文案 Brief。

### `t56-analyst-six-point-confirm` · note · T58 改稿已在 develop（#1439）；补 T59 样式 / T60 Brief / T58 分享禁入 · 2026-10-26

#1439 合入的是改后 T58，不是冷却两倍旧稿。本支只补分析师后续三条规格，不写运行时。

### `t59-still-last-duration-copy` · note · Brief 待点头（无运行时） · 2026-10-26

时长记忆已在。只补「还是上次那个」一句。B 类。位置：时长条旁低对比小字、无动画、375 不裁切。en 人审可改为 Same as last time。不是 T58。

### `t60-reset-whitelist-t52-keys` · note · Brief 待点头（无运行时） · 2026-10-26

把 T52 打卡键补进删除白名单，并钉住时长偏好键已在名单内。排在 T58 开工前。不是 T58。

### `cold-start-sound-entry` · feature · Brief 已锁 · 待开工（禁止改 src，口令「按本 Brief 开工」） · 2026-10-25

冷启动全静音后的声音入口。B 类。规格见 [`task-briefs/task-cold-start-sound-entry.md`](../task-briefs/task-cold-start-sound-entry.md)。不是 T39、不是 T34、不是 System TTS 音色。无 T 代号（未改 GLOSSARY）。

### `t54-shadow-pipeline` · feature · 排队中 · 可选（影子流水） · 2026-10-25

**T54** 阶段 2 第一条：本机计时专注流水 + Worker 白名单接收口。A 类。不改招呼文案。Brief [`task-t54-stage2-shadow-pipeline.md`](../task-briefs/task-t54-stage2-shadow-pipeline.md)。不是 T50 / T51 / T52。不是 90 天实验。

### `session-end-observed-duration` · feature · 实现中 · feature/session-end-observed-duration · 2026-10-24

**结束报时长（观察式）**。T45 藏跳秒后的结束句：Rise 轻声 + Reflection 顶行 + Voice 可选朗读。Brief [`task-session-end-observed-duration.md`](../task-briefs/task-session-end-observed-duration.md)。**不是** T47。

### `t40-desktop-system-font` · feature · 立即做 · P1 · 实现旁支 · 2026-10-24

T40：电脑版 Electron 全局 UI 切系统无衬线（旧金山/苹方等）；Web 仍 Nunito。PO 2026-10-24 B 波第一刀 + 免 Brief 点头。Brief [`task-briefs/task-desktop-system-font.md`](../task-briefs/task-desktop-system-font.md)。

### `t43-companion-window-fullscreen-sit` · feature · 立即做 · P1 · 实现旁支 · 2026-10-24

T43：电脑版两个系统窗口动作（适中陪伴窗、全屏静坐）。不自绘红绿灯。Web 无入口。PO 2026-10-24 立刻开工 + 免 Brief 点头。Brief [`task-briefs/task-companion-window-fullscreen-sit.md`](../task-briefs/task-companion-window-fullscreen-sit.md)。

### `t44-keyboard-system-notification` · feature · 实现中（feature/t44-keyboard-system-notification） · 2026-10-24

T44：空格起停、倾诉 ⌘+E、坐满系统通知。Brief [`task-keyboard-shortcuts-system-notification.md`](../task-briefs/task-keyboard-shortcuts-system-notification.md)。不是 T47。

### `awaken-invite-lock` · feature · T50 口径本 PR；T51–T53 Brief 待点头 · 2026-10-23

觉照：行为节奏只定时机、不定性。邀请不自动开练习。输入节奏默认关。

### `t39-session-start-end-bell-default-off` · feature · 实现中（fix/t39-session-bells-default-off） · 2026-10-23

T39 开始铃结束铃默认关。规格见 `task-briefs/task-session-start-end-bell-default-off.md`。不是 T27、不是 T45。间隔磬默认仍关、不绑总开关。

### `t41-window-pin-confide-dock` · feature · 立即做 · P1 · 实现旁支 · 2026-10-23

T41：电脑版始终在最前（默认关）+ 宽屏倾诉贴底/靠右。设置仍用玻璃卡。PO 2026-10-23 书面免 Brief 点头后开工。Brief [`task-briefs/task-window-pin-confide-dock.md`](../task-briefs/task-window-pin-confide-dock.md)。

### `t42-wide-secondary-dock` · feature · 立即做 · P1 · 实现旁支 · 2026-10-23

T42：宽屏帮助中心与成长旅程详情卡靠右/贴底，窄屏仍可居中。断点与 T41 倾诉相同。PO 2026-10-23 书面免 Brief 点头后开工。Brief [`task-briefs/task-wide-secondary-dock.md`](../task-briefs/task-wide-secondary-dock.md)。

### `t45-sitting-picture` · feature · 实现中（feature/t45-sitting-picture） · 2026-10-23

T45 静坐画面：正式 Focusing 视觉藏跳动分秒。规格见 `task-briefs/task-sitting-picture.md`。白名单 SB-22。不是 T47、不是 T44。

### `t50-session-presence-summary` · feature · Phase 0 已合 #1394 · Phase 1 Brief 待合 · 2026-10-23

**T50** 会话存在摘要。Phase 0：计时同坐结束打 `[SessionPresence]` + 环缓，不改结束句。Phase 1 Brief：用摘要偏置结束姿态 / 轻声选句 / 句库分桶；下次默认时长 v1 不做。不是 Presence Signals，不是观察纸。

- Phase 0 Brief [`task-session-presence-summary-phase-0.md`](../task-briefs/task-session-presence-summary-phase-0.md)
- Phase 1 Brief [`task-session-presence-summary-phase-1.md`](../task-briefs/task-session-presence-summary-phase-1.md)

### `t51-awaken-invite` · feature · 进行中 · 本旁支 feature/t51-awaken-invite-orchestrator · 2026-10-23

T51 觉照邀请编排：只邀请、不自动开练习。不改 T50。

### `t34-help-center-operating` · feature · 立即做 · T34 · Brief 已点头 · 实现中 · 2026-10-22

T34：Help Center 问卡提交接入 T10 同一封闭指令集。疑问句仍列卡。封闭集祈使走 B/C 确认，禁止静默写盘。不改倾诉发送链。

### `docs-language-support-matrix` · note · 立即做 · 2026-10-21

**T35 / T37** 语言矩阵与短答草稿；**T36** Brief 待 PO 冻结例外。权威 [`LANGUAGE_SUPPORT.md`](../LANGUAGE_SUPPORT.md)。

### `t25-wide-more-five-icon-show` · feature · 实现旁支 · 待合 develop · 2026-10-21

T25：宽屏底栏 ⋯ 须先出五组图标。#1307 已合。本刀删 `#sprite-stage` AABB 相交退化；矮窗 &lt;520 与顶缘 &lt;12px 仍直接列表。用户已确认点的是 ⋯ 不是指南针。Brief [`task-briefs/task-wide-more-five-icon-show.md`](../task-briefs/task-wide-more-five-icon-show.md)。

### `t26-help-center-beside-question` · feature · 立即做 · P1 · 实现旁支（T25 已合） · 2026-10-21

T26：Help Center 钮放在问号右边。简介与帮助中心互斥。菜单 Preferences 行保留。2026-10-21 Brief 已点头；T25 已合 develop。Brief [`task-briefs/task-help-center-beside-question.md`](../task-briefs/task-help-center-beside-question.md)。

### `t27-stop-practice-breath-phase-tts` · feature · 实现中 · P2 · fix/stop-practice-breath-phase-tts · 2026-10-21

T27：任何练习中间停 inhale/exhale 系统语音。结束句与其它播报保留。`HONESTY_BREATH_*` 文案保留。2026-10-21 Brief 已点头。Brief [`task-briefs/task-stop-practice-breath-phase-tts.md`](../task-briefs/task-stop-practice-breath-phase-tts.md)。

### `t32-paraphrase-echo-guard` · feature · 进行中 · fix/confide-paraphrase-echo-guard · 2026-10-21

T32 复述提问护栏：答句实词无新内容则 sanitize 拒收，走现网陪伴短句。禁止田野原句进拒收表。

### `t33-generate-path-diagnosis` · feature · 诊断已交 · docs/t33-generate-path-diagnosis · 2026-10-21

T33 只读：麦克风类碎片走观察翼 generate（茶句来自 corpus 回落）；Why meditation 已在问答翼 generate。不改运行时。

### `t34-confide-speak-displayed-replies` · feature · 立即做 · T34 · Brief 已点头 · 实现中 · 2026-10-21

T34：语音可用时，倾诉屏上每一句回复都朗读（含危机转介）。不改路由。停止办法保留。从 T29 拆出出声逻辑。

### `t36-confide-ja-not-yet-open` · feature · 立即做 · 2026-10-21

**T36** 日语倾诉暂未开放。冻结安全例外已写进 [`CONFIDE_NOW.md`](../CONFIDE_NOW.md)。Brief [`task-confide-ja-not-yet-open.md`](../task-briefs/task-confide-ja-not-yet-open.md)。

### `confide-object-normalize-redirect-tts` · feature · 立即做 · T29 · Brief 已点头 · 实现中（fix/confide-object-normalize-redirect-tts） · 2026-10-20

CR-47 对象闸通用归一（相邻两词拼接、连字符、受保护的单复数）+ Help Center 跳转句朗读 +「I'm here to listen」。不碰安全通道。权威 `task-briefs/task-confide-object-normalize-redirect-tts.md`。

### `confide-operational-verb-tighten` · feature · 立即做 · T30 · 实现中（fix/confide-operational-verb-tighten） · 2026-10-20

CR-47 how-to 收紧：认知动词（understand / know）走生成，不跳 Help Center、不念卡。不碰安全通道。权威 `task-briefs/task-confide-operational-verb-tighten.md`。叠 T29 #1362。

### `electron-qa-2026-10-20` · note · 账本已记 · 未改运行时 · 2026-10-20

Electron 壳抽测四条：扇形三图标根因、Help Center 问号旁钮、练习中 inhale/exhale 语音、练习纸 vs 健康地图。代号 **T25–T28**。旁路 [`issue-entries/docs-electron-qa-2026-10-20.md`](../issue-entries/docs-electron-qa-2026-10-20.md)。

### `t31-confide-personal-fact-badge-row` · feature · 实现中 · 旁支 fix/confide-personal-fact-badge-row · 2026-10-20

T31 个人事实补徽章行。问枚数 / 我有哪些时读 Idle 徽章包，不靠当天问法表。下载徽章与寅币句不走本行。Brief：`task-briefs/task-confide-personal-fact-badge-row.md`。

### `practice-paper` · feature · 方向锁已合 #1345 · 第一刀一卡随 T24 文档 · 2026-10-19

练习观察纸（Practice Paper）。挂在成长旅程详情下半部。T18 方向锁 #1343 · #1345 已合。第一刀一张 Sit & Breath 卡，读 Journey Log 全部行（不按 `arrive` 拆、不读练习日总账填卡）。界面规格见 T24 Brief。

### `t17-confide-fact-card-accept-retired` · note · 搁置 · T17 倾诉验收退役 · 2026-10-19

#1339 代码仍在发送链（`resolveConfideFactFirstSpeak`，`ConfideToYinUI` 发送时调用），T23 合入前仍可能对用户念卡。验收已退役。不按 10/24 提前关掉。

### `t21-product-ask-entry-split` · feature · 已完成 · T21 · #1347 已合 develop · 2026-10-19

产品知识问答迁出 Confide。Brief [`task-confide-product-ask-entry-split.md`](../task-briefs/task-confide-product-ask-entry-split.md)。T22 第一版：Help Center 内文字+语音列卡。T23 可点后才跳。已撤回 10/24 关 #1339 默认。本线不受加一砍一挡。

### `t22-yin-listening-product-ask` · feature · 立即做 · T22 · 实现中（feature/help-center-ask-cards） · 2026-10-19

Help Center 顶部问卡：文字或 Speak to type（字进框、可见可改、再提交）后列 2–3 张可点卡或「没有合适的卡」。检索 = 关键词/句式 + 已有 embedding，不用 1.7B。祈使句不执行办理。不改倾诉发送链。

### `t23-confide-product-ask-redirect` · feature · 立即做 · T23 · T22 #1348 已可点 · 2026-10-19

T22 可点（#1348）后：CR-47 高置信度跳到 Help Center 问卡句。问卡 DOM 不在则保持现网诚实空态/短答。黄金脚本 v1.1：情绪句、个人事实、危机句不得被跳转。T22 手测不是硬闸。

### `t24-practice-paper-ui` · feature · 界面第一刀实现中 · feature/practice-paper-ui · 2026-10-19

T24 练习观察纸界面第一刀。#1352 一卡规格已合。一张 Sit & Breath 卡，读 Journey Log 全部行。不按 `arrive` 拆。本片不改 TASKS 总表。

### `confide-g2-fact-rank-margin-diag` · feature · 诊断完成 · T15 · 结论=修好（不先缩到约10张卡）· 不占额 · 不新增封存批 · 2026-10-18

T15：作废未见 v1/v2 回放 + 可见开发集（10 句改写 + 41 张卡自检索）。读口 `npm run audit:g2-fact-rank-margin`。仓外 JSON `g2-fact-rank-margin-1792235369700.json`。禁止原句。不改发送链。

结论：**修好，不要先缩到约 10 张卡。** 41 张卡自检索 41/41 第一、余量最小 0.122。换说法时正确卡经常已经是第一，卡在 0.80。查询端 Instruct 前缀让排名略升、0.80 更差，现网不要加。单用「排名+余量」会把无卡句误接成卡（v2 ≥0.02 时 4/5）。0.80 从未命中错卡、无卡误命中 0。

**四批英文占比（2026-10-18，无 CJK 且含拉丁字母；卡自检索取每卡首条检索短语）：** 作废未见 v1 **33/33（100%）** · v2 **33/33（100%）** · 可见改写 **10/10（100%）** · 卡自检索 **40/41（97.6%）**。英文为主体，T17 英文复核前置满足。

### `confide-t17-fact-card-rank-margin` · feature · 实现中 · T17 · 判定一刀 · 2026-10-18

T17：事实卡近邻门在 0.80 与 0.62 之间增加「同形状轴排名第一 + 领先余量 ≥0.05 + 语义产品问确认」放行；不调 0.80 常数。验收：`node --test src/core/confide/confideGoldenScriptV1.test.js` 英文 60 句；无卡英文句 0 误接（手测/黄金脚本）。依赖 T15 四批英文占比行（#1338）。

### `confide-cr45-shadow-caliber-split` · feature · 已完成 · #1309 合 develop · T7 · 2026-10-17

CR-45 **影子**（口令：按补锁后的 CR-45 Brief 开工影子）+ 五带 holdout 读口（`task-confide-routing-holdout-caliber-split.md`）。合并对结构判据见 Brief §6.5 / `confideCr45MixedReplyShadow.js`。带 C 硬闸只报数、不调线。不改发送链、不切 live、不跑 en/b-v6。

### `confide-cr52-product-ask-not-emotion` · feature · 实现中（Brief 已点头 · 误伤 2%） · 2026-10-17

CR-52：产品问不得进情绪路径。PO 已点头（规格误伤 2%；关单计语料与 generate 两路；上线后只计数不记原句）。实现旁支 `fix/confide-product-ask-not-emotion`。

### `confide-g2-fact-arrival-diagnostic-v3` · note · 未见批 v3 已跑 · 4/10 · 关单不过 · 不占过关额度 · 2026-10-17

CR-51 关单向仓外 `diagnostic-unseen-v3`（`g2-fact-unseen-v3-2026-10-17-session-t5`）。n=10；0038 2/5；好处 2/5。相对 v2 有升，未达明显上来。禁止写入原句。不改发送链。不是 G2 整项过关。

### `confide-g2-unseen-v4-contract` · note · v4 出题合同已写入 Brief · 出题未排期 · 2026-10-17

T5 仓外未见批 v4 出题合同写入 `task-briefs/task-confide-ask-shape-axis.md` 第九节。复现探测，不是关单重考，不占五带额度。出题须另口令 + 新开未见会话；本会话已见 v3 失败原句，不得出题。

### `confide-golden-script-v1` · feature · 实现中（旁支待 PR） · 2026-10-17

可见冻结黄金脚本：英文≥60、中文≥20，含 2026-10-15 手测 11 句、英文夸张/明确危机/否定。权威 `fixtures/confide-golden-script-v1.json` + `docs/CONFIDE_GOLDEN_SCRIPT.md`。CI `confideGoldenScriptV1.test.js`。不改发送链。禁止把整句抄进分类器。

### `confide-mixed-emotion-then-product` · feature · 规格已补锁 · 影子进行中 · live 等 CR-11 · CR-45 · 2026-10-17

CR-45：混合句先接情绪再答产品。PO 2026-10-17 有条件采用；影子可先于 CR-11（见 T7）；**live** 接线仍等 CR-11。权威 `task-briefs/task-confide-mixed-emotion-then-product.md`。不调 0.01。不是 CR-51。

### `confide-routing-holdout-caliber-split` · feature · Brief 已点头（附修改）· 未跑 en/b-v6 · 点头≠占额 · 2026-10-17

T6：路由盲测考核口径拆成五带。Brief `task-confide-routing-holdout-caliber-split.md`。不改发送链。

### `confide-voided-caliber-curves` · feature · 已完成 · T8 · #1311 · 不占额 · 2026-10-17

T8：已作废中文路由卷（zh/b-v2 · b-v5 · b-v6）可用 `npm run audit:routing-class-holdout:curves` 做五带曲线回放，不调用 `authorizeHoldoutRun`。`confide-routing-blind-en/b-v6` 在加载模型前硬拒。不改发送链、不切 CR-11 live。

### `confide-voided-replay-labels` · feature · 已完成 · T9 刀 B 读数补丁 · 2026-10-17 · 2026-10-17

T9：在 T8 `--curves-only` 回放上强制 PO 读数规则与「作废卷回放，非过关证据」标注（`confideRoutingVoidedReplayLab.js`）。刀 B：zh/b-v6 读数块显式写出带 A 三类 `pass_criteria_met` 与带 C `hard_gate_met`；`merge_pass_share_of_passes=n/a` 时提示「无过线样本，无法判断」；0.5 阈值旁注暂定口径；带 C 红句只写 `~/Documents/ft-private/voided-replay-band-c-red/`（stdout 仅路径）。只回放已 voided 的 zh/b-v2 · b-v5 · b-v6；en/b-v6 仍硬拒。不改发送链。

### `fix-locale-slice-index-frozen-during-tests` · feature · 进行中 · 2026-10-17

并行 `test:smoke` 期间冻结 `localeSliceModules.js`。原子写不够：压测若仍改共享索引，holdout CLI 会误报缺 `LOCALE_SLICES`。无用户路径。

### `pr-smoke-demote-menu-reachability` · feature · 进行中 · T12 · 2026-10-17

从每个 PR 的必跑 `test:e2e:smoke` 拿掉 `menu-full-reachability`（种类 1 时序不稳）。nightly、合入 develop 后、以及改菜单路径的 PR 仍跑。不改产品代码。

### `wide-menu-community-slice` · feature · 已合 develop #1305 · 待人工测试 · 纯归类（不含扇形） · 2026-10-17

宽屏菜单三刀之第二刀（归类）：Join our community 挪进 You are not alone；今日方向与 Stay in touch 留在 Preferences。Brief `task-briefs/task-wide-menu-radial-index.md`。

### `wide-menu-pay-slice` · feature · 已合 develop #1289 · 待人工测试 · 不得再因口令重开 · 2026-10-17

宽屏菜单三刀之第一刀（付费）：去掉 Rituals 上方会员状态行；未购仪式锁可点并打开 `#yin-membership-card`；Preferences 增加 Subscription。Brief `task-briefs/task-wide-menu-radial-index.md`。

### `wide-menu-radial-slice` · feature · 已合 develop #1307（#1293/#1295/#1308）· 待人工测试 · 不得再因口令重开第三刀 · 2026-10-17

宽屏菜单三刀之第三刀（扇形）：宽屏 `⋯` 五组图标索引 + 点击后玻璃列表；`innerHeight < 520px` 或几何压脸时退化为手风琴列表；resize 断点收口（#1308）。Brief `task-briefs/task-wide-menu-radial-index.md`。混支 #1292 已关未合。

### `yin-voice-command-entry` · feature · 进行中（PR #1321 · 未合 develop） · 2026-10-17

T10 Yin 语音指令入口。Brief：`docs/task-briefs/task-yin-voice-command-entry.md`。挂靠 Voice Input / Voice Command / Operating Layer，不另起 Epic。

第一刀（#1321）：称呼词只认原始转写里的 Yin；备份要先听完复述再等 10 秒；超时会说出「没听到，这次先不备份」。切语言的撤销仍是 5 秒。按键说话是 Control+Shift+Y，再按一次才提交。专注中 Rise / I'm done 结束这场坐，单独 Stop 不结束。

### `zen-cinema-film-catalog` · feature · 进行中 · 旁支 feature/zen-cinema-film-catalog · 2026-10-17

Zen Cinema 从单支确认卡改为策展列表（Wallpapers 同款点选网格）。本刀加入 `what-is-zen`（`https://youtu.be/xawM6cgJSrE`）。后续加片只改 `ZEN_CINEMA_FILMS` + 封面 + 片名键。

### `a11-2-presence-glass` · feature · 本支 feat/a11-2-presence-glass · A11.2 在场信号卡暖米玻璃 · 2026-10-16

A11 holdout `#presence-signals-panel` 卡根改走 `createGlassCard` / `GLASS_FILL`。D.2 人时、侧停、`···` Remove、存储不变。不做 A12。

### `a11-shared-glass-card` · feature · A11.1 已合 #1276 · A11.2 另见 a11-2-presence-glass · 2026-10-16

根因盘点 A11：`createGlassCard()` + `check-glass-card-roots`（#1147 深色语音卡夹具必须红）。A11.1 不换肤。在场信号卡换肤见 `a11-2-presence-glass`。不做 A12/A13。

### `a12-z-index-constants` · feature · 已合 develop #1281 · Z-dim (a) 扫描 + src 常量化 · 2026-10-16

根因盘点 A12：`zIndexLayers.js` 与 `Z_INDEX.md` 对账；`src/` 手写 z-index 改走常量；豁免只留 `index.html`。不做 A13。不改层级数值。

### `a13-glass-card-screenshots` · feature · 已合 develop #1285 · 12 处暖米玻璃 RGB e2e · 2026-10-16

根因盘点 A13：关键卡暖米玻璃运行时契约 + 可选软截图。依赖 A11/A12。不替代人工叠层观感。

### `a7-6-boot-arrival-focus-ready` · feature · 本支 chore/a7-6-boot-arrival-focus-ready · 2026-10-16

A7.6：抽出 `src/boot/boot-arrival-focus-ready.js`（Arrival 赋值、`FocusInput` 袋、第一幕占用写入、品味预取 starter、摘遮罩、`__FT_APP_READY__`）。清掉最后一条 A6 豁免 `focusInput`。构造与第一幕播放仍在 `init()` 现网位置。不改付款路径。

### `a7-init-split` · feature · 已合 #1258（A7.1–A7.6） · 2026-10-16

根因盘点 A7：`main.js` `init()` 分段拆分。Brief 已锁；A7.1–A7.6 已合 develop（#1258 段 7 `boot-arrival-focus-ready.js`）。段 1 Kernel 仍暂留 `init()`。不与功能 PR 混线。

### `a8-visible-text-poison` · feature · 本支 feat/a8-visible-text-poison · 2026-10-16

根因盘点 A8（R5）：页面防呆。① `VISIBLE_TEXT_POISON_RE` SSOT + 启动冒烟 / 产品壳 e2e / A1 菜单可达共用；② `appendDomChild` / `setDomText` 在 dev/test 对 nullish 抛错。不改用户可见路由/文案。验收：`visibleTextPoison.test.js` · `test:e2e:startup` · `test:e2e:smoke` 产品壳行。

### `a9-commerce-product-registry` · feature · 已合 develop #1272 · slice 1（商品 checkout 登记表） · 2026-10-16

根因盘点 A9（R6）第一刀：新增 `commerceProductRegistry.js` SSOT，覆盖全部 `DESKTOP_CHECKOUT_KINDS`（付款回跳 query、产品壳 thanks、Support 卡、已购变淡旗标、高清/编号规则指针）。`commerceProductRegistry.test.js` 穷举缺字段即失败；平行名单契约测试改为读登记表。练习结束语音 / 存图命名仍留 slice 2。不改用户可见路由/文案。

### `a9-practice-experience-registry` · feature · 已合 develop #1275 · slice 2（练习结束语音 + 存图命名） · 2026-10-16

根因盘点 A9（R6）第二刀：新增 `practiceExperienceRegistry.js` SSOT，逐行声明练习种类（结束语音接线、可选仪式存图）与可下载 PNG 命名策略。`practiceExperienceRegistry.test.js` + `practiceEndVoiceParallelListContract` / `practiceSaveImageParallelListContract` 穷举缺字段或缺源码锚点即失败。商品 checkout 登记表见 slice 1 `commerceProductRegistry.js`。不改用户可见路由/文案。

### `confide-ask-shape-axis` · feature · 实现中 · CR-51 · 2026-10-16

CR-51：问法形状轴扩档。`why-compare` 新档；`whether-required` 排到动机闸之前。不改 0038 / EDU-0003 事实键。权威 `task-briefs/task-confide-ask-shape-axis.md`。PO 已点头开工。

### `confide-cr50-asked-fact-keys` · feature · 本支已跑 v2 · 停手不再改卡 · 2026-10-16

CR-50 续刀：只改 0038 / EDU-0003 事实键与记录三档原型，再跑未见批 v2。Brief `task-briefs/task-confide-asked-fact-keys.md`。不调 0.80，不加说法名单。

### `confide-cr50-fact-first` · feature · 实现中 · 发送链 · 2026-10-16

CR-50：字面命中与近邻同一道门；miss 后帮助中心短摘；查本机记录走语义工具、不得生成。Brief `task-confide-g2-fact-first.md`。不调 0.80，不上本地是/否。

### `confide-fact-card-capability-phrases` · feature · 已合 develop（#1255）· 关单仍欠未见批过关 · 2026-10-16

CR-49 续刀。检索改为能力说明按句切开、短答仍整段；重写 0037/0038 能力说明为「覆盖哪类事实」。不把失败句写入 keywords，不放低 0.80。#1255 后新未见英文批 `sealed-v2` 未过关。

### `confide-fact-card-en-paraphrase-holdout-v2` · note · 未见英文问法批已跑 · 未过关 · 不得写换说法已接住 · 2026-10-16

CR-49 关单前第二份盲测。`origin/develop` `b0d47bc`（含 #1255 `428fa0e9`）。封存 `fact-card-en-paraphrase/sealed-v2`，出题编号 `fc-en-unseen-v2-2026-10-16-session-c`。一次有效跑分已消耗。汇总：bgm-0037 4/20；checkin-optional-0038 0/20；chitchat-not-honesty 20/20。字面命中未进 0037；0038 有错误邻居与跳过，无正确命中。不把原句写入仓库或 keywords。

### `confide-fact-key-ask-role` · note · 已合 develop #1259 · 关单待 sealed-v3 · 2026-10-16

CR-49 第三刀已上线：事实键 + 问法形状轴（`confideProductAskRole.js` · `l1EmbeddingHold` · 目录 0020/0037/0038）。权威 `task-briefs/task-confide-fact-key-ask-role.md`。未见英文泛化仍须新封存 `sealed-v3`。

### `confide-g2-fact-arrival-diagnostic-v1` · note · 未见批 v1 已跑 · 9/33 · 不占过关额度 · 2026-10-16

CR-50 关单向「事实到没到」：仓外 `diagnostic-unseen-v1` 已出题并真跑（`g2-fact-unseen-v1-2026-10-16-session-e`）。汇总 9/33；错卡不念类 5/5。读口 `audit:g2-fact-arrival`。禁止写入原句。

### `confide-g2-fact-arrival-diagnostic-v2` · note · 未见批 v2 已跑 · 13/33 · 不占过关额度 · 2026-10-16

CR-50 事实键续刀后仓外 `diagnostic-unseen-v2`（`g2-fact-unseen-v2-2026-10-16-session-f`）。汇总 13/33；记录 4/5；0038 1/5；好处 0/5。禁止写入原句。不据此再改卡；下一刀形状轴。

### `confide-g2-fact-first` · note · Brief 待点头 · 无运行时 · 2026-10-16

CR-50：先听懂要什么事实再取。只读名次已入账（库内有答案 1/5 进前三；无卡组 3/20 被念，均为字面命中）。权威 `task-briefs/task-confide-g2-fact-first.md`。实现另点头。

### `root-cause-hardening` · feature · 盘点已落 · A1–A8·A22 已合 · A9 已合 #1272·#1275 · A10·A14·A18–A21 已合 #1267 · A11 已合 #1276·#1278 · A12 已合 #1281 · A13 已合 #1285 · **未开工** A15–A17 · Brief #1190 · 2026-10-16

2026-10-09 至 10-11 的修复归为 6 类、19 条根因，对应 22 项根治行动（A1–A22），分五个阶段，一项一个 PR。计划与对照表见 `docs/root-cause-audit-2026-10-12.md`，账本见 `ISSUE_LEDGER.md` 文首扇出行。**已合 develop：** A1 #1173 · A2 #1179 · A3 #1181 · A4 #1184 · A5 #1186 · A6 #1189 · A7 #1258（A7.1–A7.6）· A8 #1268 · A9 #1272（商品登记表）· #1275（练习登记表）· A10/A14/A18–A21 #1267 · A11 #1276（工厂+扫描）· #1278（在场玻璃）· A12 #1281 · A13 #1285 · A22 #1171。**刻意未排期（PO 2026-10-16）：** A15 入库脚本 · A16 5173 版本角标 · A17 PR 范围提醒（高风险/流程刀暂放下）。

### `a7-4-boot-session-chrome` · feature · 本支 chore/a7-4-boot-session-chrome · 2026-10-15

A7.4：抽出 `src/boot/boot-session-chrome.js` 状态袋（`SessionUiGate` / Choose-pending 盒 / Arrival 自动开表旗 / chrome sync 绑定）。清掉 A6 豁免 `sessionUiGate` · `postChooseChrome` · `syncArrivalGateReady` · `syncHonestyIdleEntry` · `pendingAutoStartMode` · `arrivalChoseThisRun` · `suppressCompanionOpenAfterNod`。Gate 与 `createSessionChromeSync` 仍在现网同一位置构造。不改付款路径、不改第一幕占用与 Loading 遮罩时机。

### `a7-5-boot-ambient-hints` · feature · 本支 chore/a7-5-boot-ambient-hints · 2026-10-15

A7.5：抽出 `src/boot/boot-ambient-hints.js` 状态袋（环境声 / session cues / `OnboardingHintsUI` / pending Choose）。清掉 A6 豁免 `ambientSoundscape` · `sessionCues` · `onboardingHints` · `pendingChoose`。`onboardingHintHost` 仍给 overlayBusy 早读。控制器与 Hints UI 仍在现网同一位置构造。不改付款路径、不改第一幕占用与 Loading 遮罩时机。

### `confide-fact-card-en-paraphrase-holdout` · note · 未见英文问法批已跑 · 未过关 · 不得写换说法已接住 · 2026-10-15

CR-49 关单前盲测。`origin/develop` `365ebee`（#1250）。封存 `fact-card-en-paraphrase/sealed-v1`，出题编号 `fc-en-unseen-v1-2026-10-15-session-b`。一次有效跑分已消耗。汇总：bgm-0037 6/20；checkin-optional-0038 0/20；chitchat-not-honesty 20/20。不把原句写入仓库或 keywords。

### `confide-fact-card-near-match` · feature · 实现中（旁支待 PR） · 2026-10-15

产品问近义比对改为事实卡能力说明 + 短答，不再把 keywords 问法名单送进 embedding。入库 `KB-FUNC-0037`（背景音乐开关）与 `KB-FUNC-0038`（打卡不是强迫签到）。不改发送链、不放低 0.80、不实现 CR-47。Brief：`task-briefs/task-confide-fact-card-near-match.md`。跟进 CR-49。

### `confide-no-symptom-list` · feature · 原则已写入 · 检索机制未开工 · 2026-10-15

禁止按症状加说法名单（R-Confide-No-Symptom-List）。不改发送链。下一刀若做：产品问答对有限事实卡做语义贴近，未命中走诚实空态，不把问法写进代码。

### `confide-product-ask-operational-gate` · feature · 发送链已改 · 待合入 · 2026-10-15

产品问收窄为「操作问法 ∧ 产品对象」（CR-47）。`resolveProductKnowledgeGateAction`：无操作问法则 `skip`（生成）；诚实空态只留给确认后的产品问且目录无近条。未扩中文豁免词表。权威 `task-briefs/task-confide-product-ask-operational-gate.md`。危机修辞不在本片。

### `confide-rhetorical-crisis-exemption` · feature · 实现中 · 2026-10-15

危机层在语义命中之后确认：自指求死仍转介；修辞或亲昵（想死你了、dying to）不转介。不降低 0.78，不改 safety-01，不与产品问闸 CR-47 同一个实现。权威 `task-briefs/task-confide-rhetorical-crisis-exemption.md`。竖线合入后再测。

### `confide-routing-arbitration-v1` · feature · Brief 已合 #1208 · 函数 A 门槛 0.01 已冻 · #1222 已合 · b-v2/b-v5 已跑未过关已作废 · 额度用满 · 未切 live · 2026-10-15

路由仲裁 v1：一次打分、一个决定。合并 Prompt 16 / 18、情绪否决、目录误命中。#1200 本机开关仅对照臂，切 live 时删除。权威 `task-briefs/task-confide-routing-arbitration-v1.md`。R-0 评测见 `PRINCIPLES.md`。

### `confide-routing-intent-feasibility` · feature · 研究脚本已入库 · 未接线 · 0.01 未动 · 2026-10-15

R 路由研究：作废 b-v2/b-v5 + 开发集 v2 上，同一向量做「在问功能 / 在倾诉」模板分组交叉验证，对照现网与函数 A。诚实空态 42 句里函数 A 失败句只报 A/B 计数。合并回应补条见 `task-confide-mixed-reply-mood-floor.md`。

### `confide-safety-caliber-holdout-gates` · note · 本 PR · 口径与门闩 · 2026-10-15

字面短语冻结。审计脚本 63/58 直接读标签。s-v1/s-v2/b-v2/b-v5 作废、额度用满。封存与打分带手写出题编号。

### `confide-safety-routing-fix` · feature · 字面短语已冻结不再加 · s-v1 9/44 未过关已作废 · s-v2 已作废 · 安全额度用满 · 2026-10-15

安全路由修复（CR-43）。第一步字面分类已合 #1226（夹具 46/63，误捕 1/35）。字面续补 #1230 开发集明确危机 ≥90%（57/63）、逃避误捕 ≤2/35 且不得为纯逃避句。关单独立盲测 s-v1（明确危机 ≥40；非危机 ≥40＝逃避 ≥20＋口语夸张或指向他人 ≥20；≥90% / 误捕 ≤2/40 且不得纯逃避或纯口语夸张；灰区只报告），与 a-v2 解耦；本实现会话不跑封存。语义危机层 Brief：`task-briefs/task-confide-semantic-crisis-layer.md`（CR-44），不夹带。权威 `task-briefs/task-confide-safety-routing-fix.md`。

### `confide-semantic-crisis-layer` · feature · 运行时已合 develop · 第八节复核已记（PO 授权大模型） · 2026-10-15

安全路由第二步（CR-44）：语义危机层接到真实发送链（#1232）。方案 S1。阈值默认余弦 0.78。日文 fail-open。2026-10-15 PO 授权大模型勾 Brief 第八节：金句与现网 15 条原型不改句；字面熟人说法过、语义层豁免另点头。不改 safety-01。权威 `task-briefs/task-confide-semantic-crisis-layer.md`。

### `confide-tiered-response-support-entry` · feature · Brief 待 PO 点头 · 无运行时 · 2026-10-15

CR-46：分档回应（高档 safety-01 不改；中档轻句占位 + 同一资源指引）与倾诉卡常驻支持入口。阈值只在开发集定。验收改路径清单，不改明确危机 ≥90% 关单。权威 `task-briefs/task-confide-tiered-response-support-entry.md`。

### `docs-confide-en-first-qa` · note · 进行中（原则已写 · 发送链未改） · 2026-10-15

锁 Confide 功能测试英文第一优先（`PRINCIPLES.md` R-0）。记下 2026-10-15 宽屏抽测：英文动机/不想练进诚实空态、熟人说法误转介。不改发送链。

### `confide-class-blind-acceptance` · feature · sealed-a-v1 已作废 · 每文件 1 次 · 结果 JSON 改 ft-private · a-v2 未生成 · 2026-10-14

Confide 问答按类验收（R-Confide-Class）。情绪开发集已入库。安全开发集已纳入 `audit:confide-acceptance-leak`（只防整句照抄；1 句因与封存盲测完全重复未入库）。`sealed-a-v1` 唯一真跑未过安全栏，文件作废。holdout 真跑：`npm run audit:mood-veto-holdout`。结果 JSON 默认 `~/Documents/ft-private/confide-mood-holdout-lab/`。信封校验：`npm run audit:mood-veto-holdout:validate`（#1213）。缺口计数：`npm run validate:confide-holdout-counts`（#1214）。额度：每文件一次，同一集最多 2 个文件；计数在 `~/Documents/ft-private/`。见 `task-briefs/task-confide-class-blind-acceptance.md`.

### `confide-route-devset-zh-v2` · feature · 入库待合 · 2026-10-14

路由开发集 zh v2（180 句）入库。作者本机 `~/Documents/ft-route-devset/v2.json`；仓库 SSOT `fixtures/confide-route-devset-zh-v2.json`。`rdev2-082` 已从过泛「开关在哪？」改写为「备份开关在菜单哪栏？」。整句进 `audit:confide-acceptance-leak`。不改倾诉回复。

### `confide-safety-devset-c017-grey` · note · 夹具已改类 · 分母 63 · 未见分类器开工 · 2026-10-14

`safedev-c017` 从明确危机改入灰区；计入分母 **63**。仓库夹具改名为 Brief 中的 `fixtures/confide-safety-devset-v1.json`。本会话见过开发集原文，不得再修安全分类器。

### `a3-parallel-list-census` · feature · PR #1181 · 待 CI 合 develop · 2026-10-13

根因盘点 A3：全仓平行名单普查表写入 `root-cause-audit-2026-10-12.md` §5；玻璃叠层 SSOT + 契约单测；不做 A4、不做 A9 总表。

### `a4-missing-handler-throw` · feature · PR #1184 · 待 CI 合 develop · 2026-10-13

根因盘点 A4：菜单与 chrome 缺 handler 时开发/测试 `throw`，生产 `console.error` 且菜单不关。不做 A12。

### `a6-main-use-before-define` · feature · 已合 #1189 · 2026-10-13

根因盘点 A6：`src/main.js` ESLint `no-use-before-define`（仅变量）进 `test:smoke`。#1139 夹具必须红；现存 23 名封顶。不拆 `init()`（A7）。

### `a7-1-boot-scene-anim` · feature · 已合 #1192 · 2026-10-13

A7.1：抽出 `src/boot/boot-scene-anim.js` 状态袋（dispatch / occupancy / 提醒横幅）。清掉 A6 豁免 `sceneAnimationDispatch` · `spriteOccupancy` · `inAppReminderBannerUI`。不改第一幕占用与 Loading 遮罩时机。

### `a7-2-boot-moment-hosts` · feature · 已合 #1199 · 2026-10-13

A7.2：抽出 `src/boot/boot-moment-hosts.js` 状态袋（Recover 卡 / 罗盘 / 见证圈 / Support 实例）。清掉 A6 豁免 `calmActionRecoverCardUI` · `fiveMomentsCompassUI` · `focusCircleWitnessChrome` · `supportYinModalUI`。不改 Support 构造相对遮罩/欢迎的时机，不改付款路径。

### `a7-3-boot-honesty-companion` · feature · 本支 chore/a7-3-boot-honesty-companion · 2026-10-13

A7.3：抽出 `src/boot/boot-honesty-companion.js` 状态袋（Honesty UI / Companion 点选 / 微仪式 / Arrival 占位 null）。清掉 A6 豁免 `honestyCheckInUI` · `companionModePicker` · `microRitualUI` · `arrivalPractice`。Arrival 仍在段 7 赋值。不改付款路径、不改第一幕占用与 Loading 遮罩时机。

### `confide-help-center-miss-fallback` · feature · 第一刀已合 #1183 · 第二刀 Brief 待点头 · 2026-10-13

短答未命中时诚实空态改指 Help Center + hello@twinsology.com（#1183）。缺口主题第二刀见 `task-help-center-gap-articles.md`。Confide 检索帮助中心须第三刀另 Brief。

### `confide-kb-catalog-near-misfire` · feature · 第一段影子已开工（不改回复） · 2026-10-13

知识库目录 / 近邻误命中：句子先被目录或近邻接成某条短答，答非所问。正式 Brief：`task-briefs/task-confide-kb-catalog-near-misfire.md`。方向已锁：目录或近邻命中之后，再过一道「这句是不是情绪自述」的复核。第一段只记 `kb_catalog_near_review_shadow`，实验室出表，不改回复。徽章句 PO 倾向诚实空态，改回复前再确认；本段不特判。来源：`confide-kb-gate-mood-veto` 第三轮后 PO 决定 6。

### `confide-kb-gate-mood-veto` · feature · 第二段已点头；中文否决已接发送链，开关默认关，本机未打包 Electron 设 FT_CONFIDE_KB_MOOD_VETO=live 才改回复 · 2026-10-13

知识库产品闸加情绪否决。第一段影子与三轮实验室已合 #1193 / #1194 / #1196。第二段（本分支）只在开关打开时，把中文情绪自述从诚实空态改到观察翼；英文仍只记日志，日文等母语审。不加规则 1。混合句 2 句误否决接受。2b 继续 shadow。#1188 字面豁免保留。目录 / 近邻复核与徽章（#1198）继续只记日志。回滚：`FT_CONFIDE_KB_MOOD_VETO=shadow`。口径见 `task-briefs/task-confide-kb-gate-mood-veto.md`。

### `confide-kb-honesty-emotion-misroute` · feature · 根因已记 · 运行时未修 · 2b 本机已 shadow · 2026-10-13

Electron 灰度：情绪/生活句被知识库诚实空态接走。日志证明 2b `wouldPromote=false`。见 ISSUE_LEDGER 2026-10-13 扇出项。

### `confide-r0-eval-gate` · note · R-0 已写入 PRINCIPLES · CI 原句扫描已进 smoke · 2026-10-13

冻结集不退步且盲测达标才许切 live。机器闸 `confideEvalGate.js`。扫描 `npm run lint:confide-original-utterance`。

### `confide-routing-followup` · feature · 清单在 develop（#1202）· R-0 与路由仲裁 v1 Brief 已出 · 日语项本轮放过 · 2026-10-13

Confide 路由、语义和向量路由的依次跟进清单，编号 CR-01 至 CR-42。见 `docs/confide-routing-followup.md`。本片不代表其中任何一条修复已经开工。CR-42 只登记 #1200 的中文本机开关（默认关），不把英文、日文、2b 或目录命中写成已上线。

### `confide-stage2b-live` · feature · 进行中（灰度 live 已接线 · 默认仍 shadow） · 2026-10-13

Stage 2b 灰度 live：`FT_CONFIDE_STAGE2B_ROUTING` 默认 `shadow`，本机主进程 `live` 才改回复。硬约束：找记录族同小句邻近功能词；负例 txt 整表不抬桶。总绳仍是 `FT_CONFIDE_SEMANTIC_ROUTING=shadow`。

### `help-center-gap-articles` · feature · 待合 PR · 2026-10-13

Help Center 补四篇：呼吸时长、两扇收藏怎么买、莲花含义、徽章≠寅币。不进倾诉短答库。见 `task-help-center-gap-articles.md`。

### `menu-single-source` · feature · 实现中 · A2 本支（菜单查表分派） · 2026-10-13

A2：次级菜单 `proxy → handler` 单一来源；宽/窄点击查表。依赖 A1 已合 #1173。Brief `task-briefs/task-menu-single-source.md`。

### `chore-payment-click-contract` · feature · 进行中 · 旁支待合 · 2026-10-12

付款可点击契约测试进 PR 冒烟；受保护路径规则与层级登记对齐，避免玻璃卡再把 Subscribe 压到遮罩下。

### `confide-append-turn-log` · feature · 旁支待合 · 2026-10-12

Renderer `appendTurnLog` 接到 preload + `desktop:companion-append-turn-log`。白名单仅 `kb_retrieval_miss` / `crisis_paraphrase_shadow`，写入前剥掉 `text`。不改用户可见回复。

### `confide-jsonl-gates-2026-10-12` · note · 10/12 书面 defer（Stage 2b / with-prior live / KB 第二轮均不开） · 2026-10-12

# 2026-10-12 Confide jsonl 门闩复核

数据文件（开发壳）：`~/Library/Application Support/focus-tiger-desktop/companion-l2/turns.jsonl`  
打包壳路径 `Focus Tiger/…` 本机不存在。脚本默认先读 `focus-tiger-desktop`。

## 门闩（均不开）

| 线 | 结论 | 依据 |
|---|---|---|
| Stage 2b | **defer** | 官方产品路径 M 仍远低于 25。代理 M=14 不当官方。本晚 Electron 四句里 live 仅 1 条 gray∩functional。 |
| with-prior live | **defer** | 新 jsonl `eligible=3`（naiveHarm=1，ruleHarm=0）。不得与 9/26 的 eligible=45 比较：影子行只留 7 天，旧行已被 prune。 |
| KB 第二轮 probe | **defer** | `kb_retrieval_miss` **0 行**。原因不是样本不够聊天，而是 renderer 调 `companion.appendTurnLog`，preload / IPC **没有这个方法**。另：K-4 已去掉原文，probe 脚本要 `row.text`，接上 IPC 后仍无法从 hash 造问法。禁止头脑风暴补 probe。 |

## 影子 / live 写入（地面真相）

接线**仍在**：`semanticShadowClassify` / `semanticLiveClassify` 经 preload IPC 落到 `l1Runtime._appendTurnLog`。  
本晚 00:49–00:55（UTC 10-11 16:49）四句关单已写出 live=4（failOpen=1 `embed_not_ready`，semanticOk=3）、shadow N=4 D=1。  
更早审计看到 0，是 7 天滚动清理删掉 9 月影子行，加上当时还没有今晚这 8 行——**不是 Stage 2 没在跑**。

## 唯一仍断的写入

`kb_retrieval_miss` 与危机改写影子：`ConfideToYinUI` 调用 `this._companion.appendTurnLog`，`desktop/preload.js` 未暴露，`l1Ipc.js` 无 handler。今晚「观察翼是什么」已走诚实空态，jsonl 仍无 miss 行。

## 人工关单四句（用户 2026-10-12 书面）

- 「观察翼是什么」→ `Yin doesn't keep a manual for that...`（诚实空态，符合）
- 「怎么开始坐」→ `Tap Sit with Yin...`（知识库短答，符合）
- 「今天想去骑车」→ `A desire to ride a bike.`（闲聊/观察，用户：基本可以）
- 「有点烦」→ `a feeling of irritation.`（情绪观察句，不是说教）

不据此关 TEST_TRACKER 主表行（须用户明示关单）。

### `confide-stage2b-po-seeded-audit` · feature · 进行中（审计脚本已接 · 切 live 仍 defer） · 2026-10-12

Stage 2b 门闩审计：`npm run audit:stage2b-po-seeded-gate` 数 `seedSource=po_seeded` 互异句、意图族（需 `--families` TSV）、误拉（与负例表求交且 `wouldPromote`）。不改回复，不得打印「可以切 live」。字面预览：`--preview-literal`。

### `confide-stage2b-shadow` · feature · 进行中（影子字段已接 · 待 Electron 人工看 jsonl · 切 live 仍 defer） · 2026-10-12

Stage 2b（gray→功能桶）影子：`semantic_shadow_classify` 行加 `stage2bWouldPromote` / `stage2bReason` / `seedSource`。只写日志，不改路由与回复。PO 手打正例用主进程 `FT_CONFIDE_SEED_SOURCE=po_seeded`。

衍生（来源本任务）：按 `seedSource=po_seeded` 统计互异句数 / 意图族 / 误拉 → 见 `confide-stage2b-po-seeded-audit.md`。

### `glass-card-text-select` · feature · PR 待开 · 2026-10-12

玻璃功能卡：正文恢复文字选择光标；空白处仍可拖动。

### `stage2b-lab-families` · note · 实验室补族已筛（2026-10-12） · 2026-10-12

Stage 2b 终端补 寅币 / 备份 / 提醒 / 付费订阅 四族，`lab_seeded`。负例 41、误拉仍 1（「最近老是想起以前」）。语言/菜单筛不满 8。切 live Brief 未开。见 `confide-stage2b-negative-control-sheet.md`。

### `stage2b-lab-seeded-gate` · note · 进行中（门闩已改 lab_seeded · 切 live 仍 defer） · 2026-10-12

Stage 2b 切 live 不要求手打。候选句终端生成/筛选均可，日志 `lab_seeded`（旧 `po_seeded` 同计）。抽审 KEEP 19、负例误拉 1。切 live 仍缺 ≥6 意图族。影子已合，不改回复。

### `stage2b-live-brief` · note · Brief 已点头（补三处后锁 · 2026-10-12） · 2026-10-12

Stage 2b 灰度 live Brief 已起草，未改运行时。点头后另开会话写代码。见 `task-confide-stage2b-semantic-cutover.md`。

### `stage2b-negative-control` · feature · 进行中（负例 31 句误拉 1 · 正例 20 条待 PO 标 KEEP/DROP） · 2026-10-12

Stage 2b 负例对照集 + 正例 20 条抽审表入库。实验室脚本跑，不进 Confide。切 live 仍 defer：缺 PO 手打正例 ≥25 / ≥6 族。见 `confide-stage2b-negative-control-sheet.md`。

### `stage2b-po-seeded-gate` · note · Brief 已锁（2026-10-12 PO） · 2026-10-12

Stage 2b 切 live 门闩改为 PO 手打正例 + 负例对照。影子模式实现另开会话、换模型再开工。不改运行时。

### `test-menu-full-reachability` · feature · 旁支 PR #1173 · 2026-10-12

Idle 菜单全量可达 e2e：同一页关掉面板再点下一行；宽屏与窄屏共用一次打开预览。

### `test-narrow-home-cta-compass-lock` · feature · 旁支进行中 · 2026-10-12

375 热力图 e2e：主球带只锁 Quick · Sit · Honesty；栖居指南针锁角上 FAB，不再当前成第四颗球。

### `tts-default-speech-rate` · feature · 进行中 · 旁支 fix/tts-default-speech-rate · 2026-10-12

朗读改回系统默认语速。英文仍用 Joelle 优化音质，日文仍用 Otoya 优化音质。

### `beside-seat-figures` · feature · 进行中 · 旁支待合 · 2026-10-11

用请坐码入座后，左侧按圈内人数排 Yin 打坐轮廓，已入座的填淡金。

### `collection-title-names` · feature · 待合入 · 2026-10-11

称号页用原来的称号名。桌上青瓷仍用器物名。不改账本编号。

### `collections-art-bridge-seen` · feature · 待合入 · 2026-10-11

已有藏品且还没真正看见时，打开珍藏在标题下提示一次。没进画面不算看过。

### `compass-at-fan-corner` · feature · 旁支 PR · 等人工确认 · 2026-10-11

指南针从主球带挪到右下角 FAB（语言地球仪左侧），扇叶铰链跟它走。

### `enso-mark-on-cushion` · feature · 旁支 PR · 等人工确认 · 2026-10-11

Enso 按精灵展示矩形锚回蒲团可见面，不再钉在视口左下角。

### `fix-support-cta-under-dim` · feature · 进行中 · 旁支待合 · 2026-10-11

玻璃卡叠层不得把 Support 模态压到遮罩下面。Subscribe to Pro 等 CTA 要点到按钮本身。

### `lanterns-above-arrive-glass` · feature · 进行中 · 旁支待合 · 2026-10-11

Arrive Notice 毛玻璃不再糊住左下金灯、圈子蓝灯和圈子短句。短句改为深色字。

### `lotus-pond-into-where-you-are` · feature · 进行中 · feature/lotus-pond-into-where-you-are · 2026-10-11

莲花可见花从 Idle overlay 迁入 Where you are 横排。公式与阈值不变。

### `yin-coin-curio-detail-mount` · feature · 待合入 · 2026-10-11

珍藏原图先创建再挂上，去掉底部 undefined，点小图能看见大图，关掉后列表能滚。

### `yin-collections-readable-card` · feature · 旁支 PR · 等人工确认 · 2026-10-11

扇叶 Collection 与 ⋯ → Yin's Collections 共用 `FocusCoinsPanelUI`。宽屏不再通高半透明霜板；标题和关闭固定在抬头；空货架有文案。
<!-- task-entries:end -->

---
*版本：5.1 · 性能原则调整为"设底线内放心追求视觉效果"，新增首屏Poster过渡
策略，目录结构补充docs/art-reference/public三个根目录；v5.2 文档结构拆分为
PRINCIPLES / ARCHITECTURE / DESIGN / PROCESS + 本任务清单*
