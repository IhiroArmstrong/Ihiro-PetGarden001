---
本项目文档已拆分为以下结构，请在需要时查阅对应文件：
- 产品定位(品牌使命与长期方向): /docs/PRODUCT_POSITIONING.md
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
> **2026-07-30 口径（仍有效）**：本项**不是**「本地电脑版 APP」的最终打包选型。桌面壳（Electron / Tauri / PWA·薄壳）见 `PROCESS.md` Backlog「**本地桌面 APP 打包选型**」。**v1.0.0 纯本地 / v1.1 云端**已拍板：核心路径不依赖联网；service worker 只能增强，不得变成「无网不可用」。  
> **2026-08-07**：可选 PWA 基础层已立项；旧「离线缓存 3D」口径作废，以本任务块与 PRD 为准。

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
  - 欢迎 beat（blink-smile + 文字气泡）→ Notice 6 图标（不落库）→ ~5s 呼吸（无倒计时）
    → Choose 6 图标 + 次要打字 → Companion Mode 三选一 → 再点 Sit 开始计时
  - 全程 Skip + Skip — begin；Sit 二次点击可整体跳过仪式
  - Choose → focus-tiger.intentions.v1（source: icon|typed）；Notice 严禁持久化
  - Reflection 按来源回显（达标与未达标均回显）；Notice 不回显

明确不做：待办化、情绪分析统计、强制不可跳过流程、角色语音
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

## 📍 Phase 2 及以后：待评估

```
以下内容明确不在本次v5.0设计范围内，待Phase 0-1验证核心体验后再评估是否需要：
  - 奇遇系统(随机访客等惊喜机制)
  - 环境/角色皮肤商业化
  - 社交/多人共修功能

原因：单指标单角色产品的核心价值在于"简单直接"，
过早引入这些曾经为"三指标盆景世界"设计的扩展机制，
有把产品重新做复杂的风险，需要等核心体验跑通后再决策。
```

---
*版本：5.1 · 性能原则调整为"设底线内放心追求视觉效果"，新增首屏Poster过渡
策略，目录结构补充docs/art-reference/public三个根目录；v5.2 文档结构拆分为
PRINCIPLES / ARCHITECTURE / DESIGN / PROCESS + 本任务清单*
