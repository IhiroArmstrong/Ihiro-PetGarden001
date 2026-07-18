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
     用户可忽略或点击「Did you practice elsewhere?」补登 10/20/30+ 分钟；
     10s 呼吸引导后 dormantWake（16 帧睡醒过渡 + 既有 FocusVisualizer），并按所选时长等同一次已完成会话。

已落地：DailyCompletionStore、HonestyCheckInController/UI、dormantWake 情绪键、
       getLocalDateKey → utils/localDate.js、未达标 End Focus 安静回 DORMANT；
       DORMANT 视觉 `sleeping` 8 帧 forward 循环；
       `dormant-wake` 16 帧一次性正放，前后 180ms cross-fade，播完回归 idle-breathing。
待替换：Rim Light 正式光效（当前 setFocusLevel 占位）。
```
（定稿详见 DESIGN.md「DORMANT 唤醒仪式」/ PRINCIPLES.md「诚实机制」/ EMOTION_BIBLE dormantWake）

### 任务六：PWA配置
```
manifest.json：
  name: "坐禅小老虎"
  theme_color: 参考老虎自然原色基调
  display: standalone

service worker：离线缓存3D资产，弱网/离线状态下仍可查看和开始专注
```

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
