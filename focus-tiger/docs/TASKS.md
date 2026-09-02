---
本项目文档已拆分为以下结构，请在需要时查阅对应文件：
- 产品定位(品牌使命与长期方向): /docs/PRODUCT_POSITIONING.md
- 文化探索方向锁(From App to Culture；验证后再产品化): /docs/FROM_APP_TO_CULTURE.md
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
| **A′ 恢复派生** | v1 快照恢复后从 `practice-days` 派生 `daily-completions`（提醒与热力图对齐） | `fix/practice-backup-daily-completion-reconcile` | **本旁支** |
| **B schema v2** | 白名单第 7 key + Worker redeploy；完整保留 `celebrated` / `sessions` | Backlog | 非前置；仅当需跨恢复保留 Celebrating 戳 |

---

## 📍 寅币（Focus Coins · Yin's Collections）

> 练习货币；对外 **寅币 / Focus Coins**；个人中心 **阿寅的珍藏 / Yin's Collections**。**不**建 entitlement key。权威 `FOCUS_COINS.md`。

| 级 | 内容 | Brief / 分支 | 状态 |
|---|---|---|---|
| **文档** | 花园 vs 珍藏、铁律、清供 8 | `FOCUS_COINS.md` · `task-focus-coins.md` | **本支** |
| **L0** | 纯账本单测 | `feature/focus-coins-l0-ledger` | **#335 已合** |
| **L1** | 完成钩子写入钱包 | `feature/focus-coins-l1-award` | **#338 已合**（TRACKER 待人工） |
| **L2** | 清供卡面可兑；叠层视觉拆掉 | `feature/focus-coins-l2-redeem` | **#339 已合**；2026-08-20 清供改名 |
| **L3** | **Yin's Collections** 抽屉；挥手点播走珍藏底栏 | `feature/yin-coin-l3-surface` | **#352+#353+#354 已合** |
| **本旁支** | 珍藏挥手点播 Play；抽屉仍清供 8 | `feature/focus-coins-wave-playback` | 进行中 |

合计 L0–L2 ≈ **10–16 人日**。与桌面智能体对照见 `FOCUS_COINS.md` §10。文化 meaning layer / Practice Identity **不**在本表开工，见 `FROM_APP_TO_CULTURE.md`。

---

## 📍 From App to Culture（2026-08-27 · 方向锁）

> 把已有种子组成可验证的文化假设。**无运行时。** 权威 `FROM_APP_TO_CULTURE.md`。

| 项 | 状态 |
|---|---|
| 战略锁本文 | **本支** |
| 设计师文化原型（Objects / Identity / Quiet Social / Slack 概念） | 待 Design Review · **不排工程** |
| Slack 实验室接线 Join our community | ✅ **已接线**（2026-08-29 · `communityLink.js`） |
| Global Lanterns / Identity Runtime / 公开 Ambient | **证据后门闩** · 见 PROCESS Backlog |

---

## 📍 防剽窃层（2026-09-02 方向锁）

> SSOT：`ANTI_PLAGIARISM_LAYER.md`。品味云 ∪ YPE 云 ∪ 句包 overlay。**≠** 支付 / 备份 / Confide 路由。

| 序 | 内容 | Brief | 状态 |
|---|---|---|---|
| **0** | 概念 + 准入四问 | `ANTI_PLAGIARISM_LAYER.md` | **#542 已合** |
| **0b** | 冻表 vs 现网可分叉 | `ANTI_PLAGIARISM_LAYER.md` §3.1 | **本切片（文档）** |
| **1** | Quiet Line 句包 overlay | `task-quiet-line-copy-overlay.md` | **#543 已合 develop**（生产须「部署」） |
| **2** | YPE V2 + `algorithmVersion`（契约内真正政策） | `task-ype-v2-secret-transform.md` | 口令已给 · **运行时未开工 · 下一刀** |
| **3** | Confide 句库 overlay | `task-confide-copy-overlay.md` | 口令已给 · 运行时未开工 |
| **后排** | 日签 14→N；伸懒腰 / 好奇池 | — | 不开工 |

**我认为最合理的下一刀**：口令「开工 YPE V2」（序 2）。较弱：先 Confide 句 overlay（与开口 0–1 秒相邻）；再堆远程 flag。

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
| **L2 同意 UI** | 第四条独立同意；Privacy 开关；本机 `ype_profile_id`；无 Worker | `task-l2-personalization-consent.md` | **本支 `feature/ype-l2-ui-consent` 开工** |
| **L2 同意文案** | 关即删；HINT+DETAIL 附录 | 同上 | **已进 locale（en/ja/zh）** |
| **L2 身份键** | 本机随机 `ype_profile_id`；第二设备新档案；删除不连带 | `task-l2-personalization-identity.md` | **已拍（#456）** |
| **L2 算法 V1** | 五键 → Pack 闭包；回声选档；`patternInsights=[]`；不按完成率改档 | `task-l2-personalization-algorithm.md` | **契约已锁** · Worker 签发已合 |
| **L2 算法 V2** | 同一五键上的秘密闭包 + `algorithmVersion`；白名单 insight；仍禁止用户可见打分 / 用完成率改档 | `task-ype-v2-secret-transform.md` | **已排入口令队列** · 运行时未开工 · 须口令「开工 YPE V2」 |
| **L2 运行时 V1** | Worker ingest / delete / Pack 签发 + 客户端 sync | `task-l2-personalization-algorithm.md` | **源码已合**；生产 KV/Redeploy 见 TRACKER |

**我认为最合理的下一刀**：口令「开工 YPE V2」（防剽窃层序 2）。较弱：未部署 ingest 就当 V2 已上。

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
| **Slice 1f** | Don't save this · memory suppress | `task-yin-memory-slice-1f-dont-save-this.md` | **本旁支** · tracker 待人工 |

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
| **1C** | Reflection Companion · 用户点 → one observation | `task-local-ai-reflection-companion-validation.md` | **Candidate · validation only** | **本旁支** · lab `?reflectionCompanion=1` · 非 shipping · tracker 待人工 |
| **V2** | `DELETE_TODAY_JOURNEY_ENTRY` | — | Future Candidate · **NOT MVP** | **无** implementation task |
| **—** | Don't save this | `YIN_PERSONAL_MEMORY_PERSISTENCE_POLICY.md` | ✅ Slice 1f | tracker 待人工 |
| **0.D** | Yin Intent Diagnostic（只输出 intent JSON） | `LOCAL_AI_PHASE1_TASK_PLAN.md` §6.1 | **换模型前必做** | Phase 1–2B/E′ **#495–#520** · 字面预筛 **#523** · 三门禁 **#524** · 切片 3 **#525** · Tier 2 **#526** · **PO 不立项 Phase 3 / 不换模**；语用残差不另开生产任务 |

**Ceiling**：C2 + 少量 C3 · **C4 NO** · V4 MUST NOT ENTER 已锁 · V5 全禁。

**我认为最合理的 Phase 1 开工顺序**：① #472 **已关单** → ② **1B #503 已合** → ③ **1A #506 已合** → ④ **1C validation 本旁支**（非 shipping）。Forget 端到端补测不挡。较弱：未 validation 就 ship Reflection generate；0.D 后再 Benchmark Llama。

---

## 📍 Presence Signals（2026-08-25 · 陪伴观察账本）

> **≠** Yin Memory · **≠** Journey Log · **≠** `reflections.v1` 趋势 SSOT。Arrival Notice（calm / stressed / sad 等）及后续 Ritual / Reflection 封闭标签入账 `focus-tiger.presence-signals.v1`。Confide 趋势问句 → **CI-02** `presence_facts`（描述性 breakdown，禁止诊断）。

| 级 | 内容 | Brief | 状态 |
|---|---|---|---|
| **Slice 0–1 + 4** | 文档 + Arrival Notice 写入 + Confide 只读趋势 | `task-presence-signals-slice-0-1.md` | **本旁支** `feature/presence-signals-slice-0-1` · tracker 待人工 |
| **Slice 2** | Ritual chip 入账 + Leave 弱提示 | 见 Brief §后续 | 排期 |
| **Slice 3** | Reflection Q1–Q3 双写 | 见 Brief §后续 | 排期 |
| **Slice 5–6** | 查看/删除 UI · L3 freeText（读取 Consent） | 见 Brief §后续 | 排期 |

**我认为最合理的下一刀**：合本旁支 + 关 CI-02 tracker；再 Slice 2 或 Slice 5。

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
| **2** | 竖屏横屏建议 UI（§6.4） | `task-briefs/task-responsive-landscape-suggest.md` | 待开发 · Task 1 人工验收后开工 |
| **3** | **窄宽屏合并为响应式单代码线**（消分叉漏修） | `task-briefs/task-responsive-single-chrome-line.md` | **代码已落地 · 待双视口人工验收**（2026-07-30）。PR #31（Brief/阶段0）· #32（编排）· #33（facade）已合 `develop`。阶段 3：文档收口 + main 去掉分壳别名。关单须 **§8 + §9** 分测（见 TEST_TRACKER「Task 3 单代码线」行）；**禁止**与场景 O 混验。 |

**共同验收**：375×667 竖屏 + 横屏各走通 `RESPONSIVE_LAYOUT.md` §五 相关路径；`TEST_TRACKER` 分列登记。Task 3 另须 §8 + §9 故事最小集（见 Brief）。

> **2026-07-25 架构拍板（用户同意倾向 + 排期约束）**：窄屏抽屉与宽屏 ⋯ 菜单长期分分支维护是分叉漏修的结构性成因；值得合并成响应式单线，但须等本次宽屏修复人工验收 + push 后再开重构，避免与未验收修复叠风险。见 `PROCESS.md` 速览 / `RESPONSIVE_LAYOUT.md`。  
> **2026-07-30**：触发条件已齐；Brief 已交付并进 develop（PR #30）；同日开 feature 做阶段 0。

---

## 📍 Web2 岁月印记（2026-08-24 · 拒 Web3）

> 用户拍板：纪念走 Web2（修行纪念印 / 静默画卷 / 实体优先权），**禁止** mint / wallet / token / SBT。映射见下表；**不**新开链上立项。

| 采纳项 | 接哪条 Brief / 现网 | 排期 | 状态 |
|---|---|---|---|
| 高精度禅意徽章 · **累计**门槛 · 少连坐话术 | `task-practice-imprint-badges.md` + 壳 `task-yin-collections-four-tabs.md`（页签 **勋章印记**） | **P1** · 四页签壳可与 imprint 同支 | 待开工 |
| 现网仪式/印（不重复立项） | `MilestoneGlow`（7/21/100 动画）· `mustardSeedSeal`（score≥21 诗稿）· Idle 练习徽章 | — | **已接线** · TRACKER 待人工 |
| 纪念奖励环境细节（茶盏/香炉/蒲团） | `PROCESS.md` Backlog「纪念奖励系统」表 | **P2** · 2D 主线稳定后 | 未接线 |
| 年终 / 深练 **Save image 画卷** | `task-mindfulness-scroll-export.md` ← 依赖 `task-journey-daily-card.md` | **P1b** · Daily Card 后 | 待排期 |
| 单日日記卡（存图管线） | `task-journey-daily-card.md` | **P1a** · 无链依赖，可先开 | 待排期（Brief 已有） |
| 实体周边优先权（账号+门槛） | `task-companion-merch-priority.md` | **P0 运营** Phase 0 手工可即刻；Phase 1 产品壳在 imprint 后 | Phase 0 文档锁 |
| 用户感知句「岁月印记 / 修行纪念」 | 各 Brief + `FOCUS_COINS.md` §0.1；i18n 禁 Web3 词 | 随各 PR 文案 | 已写入 Brief |

**我认为最合理的开工顺序**：① `feature/journey-daily-card`（存图管线）→ ② `feature/yin-collections-four-tabs` + `feature/practice-imprint-badges` → ③ `feature/mindfulness-scroll-export`；周边 Phase 0 不等代码。

---

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
*版本：5.1 · 性能原则调整为"设底线内放心追求视觉效果"，新增首屏Poster过渡
策略，目录结构补充docs/art-reference/public三个根目录；v5.2 文档结构拆分为
PRINCIPLES / ARCHITECTURE / DESIGN / PROCESS + 本任务清单*
