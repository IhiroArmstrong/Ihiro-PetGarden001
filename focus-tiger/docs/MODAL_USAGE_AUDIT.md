# 全项目「阻断式确认 / 模态使用」审计

**状态**：PO 已拍板（2026-09-14）——实现须分批另开对话「开工」  
**决策权威（2026-09-14）**：文末 **A 类 5 条 / C 类 10 条** + §「PO 拍板记录」是全项目「阻断式确认」的**唯一打勾处**。`p5-ritual-modal-audit.md`（PR #763）那 15 行清单已被 §4 吸收，**不要再填**。  
**对齐原则**：`PRINCIPLES.md` §「减少阻断式确认（专注与仪式 · 2026-09-14）」  
**背景来源**：`MACOS_HIG_AUDIT_ROUND1.md`（P6 已合入原则；本文件核实现状）  
**吸收范围**：原 `task-modal-p5-focus-ritual.md` Part 2（Recover / RitualFlow / MicroRitual 窄范围）→ 已并入下文 §4；Part 1（OnboardingHints / Focus Circle Witness 改造方案）**不受影响**，独立推进。

**扫描日期**：2026-09-14  
**扫描口径**：

1. 浏览器原生 `alert()` / `confirm()` / `prompt()`（生产路径与 `?dev=1` 开发路径分列）
2. 自绘阻断式浮层：`aria-modal="true"`，或 `role="dialog"` 且带遮罩 / 占叠层名额 / 须显式关闭或点外 dismiss 才能继续主流程
3. 登记在 `overlaySlotContractRegistry.js` 但无 `aria-modal` 的会话叠层（仪式 / 专注 / 到达等）一并列出

---

## 大白话总结

我把整个产品里「会挡住你继续操作」的弹窗和确认框都扫了一遍：正式版本里只有两处还在用浏览器自带的报错弹窗（都在支持/付费流程里，已单独排期改造）；开发模式里还有三个重置用的确认框，普通用户碰不到。自己画的遮罩卡片大概有四十多处，绝大多数是你主动从菜单打开的，符合新原则；需要重点拍板的是：引导问号展开的大卡片、专注圈里同伴离开时的选项条，以及支持页那两处系统报错框。仪式和恢复练习里的玻璃板大多是练习本体，不宜一刀切，但有几条（早退回顾、点空白就结束等）要你定产品意图。请只按文末两张清单逐条勾选；批准后再另开对话分批开工改。

---

## 统计摘要

| 类别 | 数量 | A（违背候选） | B（合理例外） | C（待 PO 判断） |
|---|---:|---:|---:|---:|
| 原生 `alert` / `confirm` / `prompt` | 5 处调用 / 8 条记录 | 2 | 3 | 0 |
| 自绘阻断式浮层 | 52 条记录 | 4 | 33 | 15 |
| **合计** | **57** | **6** | **36** | **15** |

> `desktop/companion/*.js` 与探针脚本中的 `session.prompt()` 为 **AI 推理 API**，非浏览器 `window.prompt()`，不计入上表。

---

## 1. 浏览器原生 `alert()` / `confirm()` / `prompt()`

| ID | 组件/文件 | 触发场景 | 是否专注/仪式中 | 当前是否阻断 | 分类 | 分类理由 |
|---|---|---|---|---|---|---|
| NA1 | `main.js` ~L4807 | 开发栏「意愿漏斗」按钮，展示漏斗摘要 | 否（`?dev=1` 开发工具） | 是（系统原生，须点确定） | **B** | 原则明文排除 dev-only 路径 |
| NA2 | `main.js` ~L4833 | 开发栏「重置全部本地状态」 | 否（开发工具） | 是 | **B** | 不可逆本地清档，开发专用 |
| NA3 | `main.js` ~L4871 | 开发栏「重置并 idle 坐禅」 | 否（开发工具） | 是 | **B** | 同上 |
| NA4 | `SupportYinModalUI.js` ~L527 | Support 内 Pro / Companion 结账，云 API base 未配置 | 否（须先打开 Support；专注中通常不可达） | 是 | **A** | 用系统 `alert` 作日常错误提示，违背原则；**见 P4 已排期** |
| NA5 | `SupportYinModalUI.js` ~L560 | 同上，Checkout Session 创建失败 | 否 | 是 | **A** | 同上；**见 P4** |
| — | `desktopCheckoutConfirm.js` | 函数名 `confirm` 为 Stripe 会话确认 | — | — | **（不计入）** | 非 `window.confirm()` |
| — | `desktop/companion/*.js`、探针脚本 | `session.prompt()` / `chat.prompt()` | — | — | **（不计入）** | LLM API，非 UI 弹窗 |

**生产用户路径原生弹窗 = NA4 + NA5，共 2 处，同文件。无生产环境 `window.prompt()`。**

---

## 2. 自绘阻断式浮层 — 用户主动菜单 / Preferences（原则允许）

> `PRINCIPLES.md`：用户**主动**从 Idle ⋯ / 抽屉打开的菜单卡片仍可为遮罩面板。

| ID | 组件/文件 | 触发场景 | 是否专注/仪式中 | 当前是否阻断 | 分类 | 分类理由 |
|---|---|---|---|---|---|---|
| M01 | `JourneyLogUI.js` | ⋯ → Journey Log | 通常否 | 是（遮罩 + 空白 dismiss） | **B** | 用户主动打开的信息面板 |
| M02 | `ConfideToYinUI.js` | ⋯ → Confide | 通常否 | 是（SB-19 _hold，空白不关） | **B** | 用户主动倾诉入口 |
| M03 | `PresenceSignalsPanelUI.js` | ⋯ → Presence signals | 通常否 | 是 | **B** | 用户主动设置 |
| M04 | `FocusCoinsPanelUI.js` | ⋯ → Yin coin | 通常否 | 是 | **B** | 用户主动收藏面板 |
| M05 | `FiveMomentsCompassUI.js` | ⋯ → Five Moments | 通常否 | 是 | **B** | 用户主动成长罗盘 |
| M06 | `DailyZenQuoteCardUI.js` | ⋯ → Daily quote | 通常否 | 是 | **B** | 用户主动礼物卡 |
| M07 | `DigitalWallpapersCardUI.js` | ⋯ → Wallpapers | 通常否 | 是 | **B** | 用户主动 |
| M08 | `ZenCinemaCardUI.js` | ⋯ → Zen Cinema | 通常否 | 是 | **B** | 用户主动 |
| M09 | `MustardSeedSealCardUI.js` | ⋯ → Mustard Seed | 通常否 | 是 | **B** | 用户主动 |
| M10 | `LocalPracticeDataPanelUI.js` + `LocalPracticeDataUI.js` | ⋯ → Preferences → Backup & restore；导入覆盖用内联 checkbox | 通常否 | 是（面板）；覆盖须勾选非 `confirm()` | **B** | 数据边界 + 用户主动；导入已内联确认 |
| M11 | `ReminderPreferenceUI.js` | ⋯ → Preferences → Reminder（`role=dialog`，无 `aria-modal`） | 通常否 | 是 | **B** | 用户主动偏好 |
| M12 | `LanguagePreferenceUI.js` | ⋯ → Preferences → Language | 通常否 | 是 | **B** | 用户主动偏好 |
| M13 | `GroundExerciseChoiceUI.js` | ⋯ → Ground exercise 入口 | 否（Recover 前序） | 是 | **B** | 用户主动选练习类型 |
| M14 | `NarrowIdleShell.js` 抽屉 sheet | 窄屏 ⋯ 菜单 | 通常否 | 是 | **B** | 用户主动导航 |
| M15 | `QuietTogetherPanelUI.js` | ⋯ → Quiet together | 通常否 | 是 | **B** | 用户主动 |
| M16 | `FocusCirclePanelUI.js` | ⋯ → Focus circle 设置 | 通常否 | 是 | **B** | 用户主动 |
| M17 | `WideIdleMoreMenu.js` 宽屏菜单 + backdrop | 宽屏 ⋯ | 通常否 | 部分（菜单外点击关闭） | **B** | 用户主动导航壳 |

---

## 3. 自绘阻断式浮层 — 付费 / 支持 / 外部系统

| ID | 组件/文件 | 触发场景 | 是否专注/仪式中 | 当前是否阻断 | 分类 | 分类理由 |
|---|---|---|---|---|---|---|
| P01 | `SupportYinModalUI.js` | Support FAB / 菜单 Support | 否 | 是（遮罩，backdrop dismiss） | **B** | 用户主动付费/支持入口 |
| P02 | `TipJarUI.js` | ⋯ → Tip jar / 情境 Tea 气泡 CTA | 通常否 | 是（SB-19 hold） | **B** | 涉及外部结账，用户主动 |
| P03 | `SanctuaryUnlockUI.js` | Support / Sanctuary CTA | 通常否 | 是 | **B** | 付费解锁，用户主动 |
| P04 | `MembershipUnlockUI.js` | ⋯ → Membership | 通常否 | 是 | **B** | 付费订阅，用户主动 |
| P05 | `NewsletterCaptureUI.js` | ⋯ → Newsletter | 通常否 | 是（SB-19 hold） | **B** | 用户主动留资 |

---

## 4. 自绘阻断式浮层 — 专注 / 仪式 / 恢复流程内

> 原则：仪式主流程内**确须逐步确认**的步骤不得一刀切改为非模态；下列逐条区分「流程本体」与「可降级候选」。  
> 细目来源：原 `p5-ritual-modal-audit.md`（R/F/M 编号保留便于对照）。

| ID | 组件/文件 | 触发场景 | 是否专注/仪式中 | 当前是否阻断 | 分类 | 分类理由 |
|---|---|---|---|---|---|---|
| S01 | `FocusDurationPickerUI.js` | 开始专注前选时长 | 否（专注开始前） | 是（`aria-modal`，占 tier-6） | **B** | 开练前必要一步，非流程内意外打断 |
| S02 | `ArrivalPracticeUI.js` | 到达练习 Choose / Notice | 否（Arrive，专注前） | 是（占 tier-1，空白关闭） | **B** | 到达时刻主流程 |
| S03 | `HonestyCheckInUI.js` | Honesty 正念登入（时长 / 呼吸 / thanks） | 边界时刻（非一炷香中段） | 是（多阶段占 tier-5/9） | **C** | 用户主动登入 vs 流程内面板；强度是否应更轻量待 PO 定 |
| S04 | `RitualFlowUI.js` · 欢迎步 (F1) | 菜单选晨间 / 情绪重置 / 工作转换 | **是** | 流程占用（底部玻璃板，无全屏罩） | **C** | 仪式本体；原则要求产品确认后不得强改 |
| S05 | `RitualFlowUI.js` · 选词/选项步 (F2) | 欢迎之后 | **是** | 须板上选才能继续 | **C** | 步骤内等待，非意外确认框 |
| S06 | `RitualFlowUI.js` · 呼吸步 (F3) | 选项之后；左上计时在走 | **是** | 板上呼吸文案，离开即中断 | **C** | 仪式专注段本体 |
| S07 | `RitualFlowUI.js` · 提问步 (F4) | 呼吸之后 | **是** | 须板上回应 | **C** | 步骤内等待 |
| S08 | `RitualFlowUI.js` · 结束步 (F5) | 提问之后 | **是** | 板上收束 | **C** | 仪式收束本体 |
| S09 | `RitualFlowUI.js` · 早退回顾气泡 (F6) | 上次早退后再次打开同仪式 | **是** | 弱阻断：占板位、计时自动进欢迎 | **C** | 纪念回声；是否值得占整块板待 PO 定 |
| S10 | `RitualFlowUI.js` · 离开钮 (F7) | 各步板上 | **是** | **不阻断**（一点即走，无二层确认） | **B** | 已是安静离开；再加确认反而增模态 |
| S11 | `MicroRitualUI.js` · 时长板 (M1) | 点「一分钟呼吸」类入口 | **是** | 底部玻璃板选时长 | **C** | 开练前必要；板开着能否同时点坐下待 PO 定 |
| S12 | `MicroRitualUI.js` · 呼吸层 (M2) | 选好时长后 | **是** | 吸/呼文案 + 安静离开 | **C** | 微呼吸本体 |
| S13 | `MicroRitualUI.js` · 入口钮 (M3) | 码头入口 | 否 | **不阻断** | **B** | 仅入口 |
| S14 | `MicroRitualUI.js` · 离开 (M4) | 时长/呼吸板 | **是** | **不阻断** | **B** | 同 F7 |
| S15 | `RecoverResetPracticeUI.js` · 接地四段 (R1) | 菜单 → 接地 →「感受地面」 | Recover 流程 | **部分阻断**：下半玻璃卡，`role=dialog`，点外整段结束 | **C** | 练习本体；点空白即放弃是否历史省事待 PO 定 |
| S16 | `RecoverResetPracticeUI.js` · 环顾 (R2) | 同上 →「环顾四周」 | 同 R1 | 同 R1 | **C** | 同 R1 |
| ~~S17~~ | ~~`RecoverResetPracticeUI.js` · 呼吸/过载遗留 (R3)~~ | — | — | — | **已删** | **开工 5**（2026-09-14）已移除遗留 breath/overwhelmed 接线 |
| ~~S18~~ | ~~`RecoverResetPracticeUI.js` · 过载后倾诉条 (R4)~~ | — | — | — | **已删** | 随 S17 一并移除 |
| S19 | `TigerReflectionMoment.js` | 专注结束后反思 | 否（Reflect 时刻） | 是（占 tier-2，SB-19 hold） | **B** | 设计内的反思时刻，非专注中段打断 |
| S20 | `CompanionModePicker.js` | 「How shall we sit?」选同伴模式 | 专注开始前 | 是（空白关闭） | **B** | 开练前必要选择 |
| S21 | `TransitionMomentUI.js` | Calm Action 边界过渡（~8s CAW-T 轻提示） | 仪式/过渡边界 | **弱**（阿寅旁 whisper；不挡 Yin tap） | **A** | PO 2026-09-14 降为 Whisper · **开工 2** |
| S22 | `FocusAwarenessCardUI.js` | 专注中段觉察卡片 | **是**（Focusing 允许） | **弱**：底部条，自动收起，可点关 | **B** | 已是非侵入式范例 |
| S23 | `CalmActionRecoverCardUI.js` | Active Recover 后轻卡 | Recover 后 | 弱阻断，自动消失 | **B** | 跟练后轻提示 |
| S24 | `CalmActionArriveCardUI.js` | Arrival 后轻卡 | Arrive 后、专注前 | 弱阻断 | **B** | 过渡轻提示 |

---

## 5. 自绘阻断式浮层 — 引导 / 冷启动 / Witness（重点候选）

| ID | 组件/文件 | 触发场景 | 是否专注/仪式中 | 当前是否阻断 | 分类 | 分类理由 |
|---|---|---|---|---|---|---|
| G01 | `ColdStartGoalCardUI.js` | 首次 `?product=1` 冷启动四选 | 否（专注前） | 是 | **B** | 一次性冷启动，非仪式中段 |
| G02 | `OnboardingHintsUI.js` · `?` Purpose 卡 `#onboarding-app-purpose` | 悬停/点击 `?` 或 detailed hint CTA | **可能**（多种 overlay 时刻） | 是（`aria-modal` + backdrop，须 dismiss） | **A** | 流程内展开的阻断大卡；P5 Part 1 已列改造 |
| G03 | `OnboardingHintsUI.js` · Privacy sheet `#onboarding-privacy-sheet` | Purpose 卡内点 Privacy | 通常否 | 是（`role=dialog` + backdrop） | **B** | 隐私/合规阅读，用户主动深入 |
| G04 | `OnboardingHintsUI.js` · Wellness detail `#onboarding-wellness-detail` | Purpose 内 wellness 链接 | 通常否 | 是（`aria-modal`） | **B** | 免责详情，用户主动 |
| G05 | `OnboardingHintsUI.js` · Wellness first `#onboarding-wellness-first` | 仅 `?wellnessFirst=1` QA | 否 | 是（`aria-modal`） | **B** | QA 开关，默认不自动弹 |
| G06 | `OnboardingHintsUI.js` · auto/remedy 气泡 `ft-onboarding-hint-bubble` | 各时刻自动/补救提示；点「了解更多」→ G02 | **可能** | 气泡本身弱阻断；展开 Purpose 卡后强阻断 | **A**（展开链） / **B**（仅气泡） | 气泡符合原则；detailed CTA 链到 G02 是违背点 |
| G07 | `FocusCircleWitnessLeaveUI.js` · leave strip | Idle Focus Circle 观察窗，gentle witness 升起 | **可能** | 是（`role=dialog`，占 tier-26） | **C** | 已是底栏非全屏；是否仍太挡待 PO 定 |
| G08 | `FocusCircleWitnessLeaveUI.js` · respond/leave picker | 点 leave 或回应同伴 | **可能** | 是（`role=dialog`，占 tier-27，挡 Yin tap） | **A** | 流程内须选短语才能继续；P5 Part 1 已列改造 |
| G09 | `FlowerBlowWelcomeBubbleUI.js` | Day1 / 久别吹花欢迎 | 否 | **弱**（`role=status`，非 modal） | **B** | 非阻断气泡 |
| G10 | `ContextualTeaTipBubbleUI.js` | 会话完成 / 里程碑 Tea 提示 | 通常否 | **弱**（侧气泡，`role=dialog` 无 `aria-modal`） | **B** | 注释写明非 modal wall |
| G11 | `MomentWhisperUI.js` | 情境 Whisper 单行 | 多种时刻 | **弱**（非遮罩） | **B** | 原则倡导的就地提示 |
| G12 | `SoftUpdatePromptUI.js` | 新版本可用 | 否（`busySession` 时不展示） | **弱**（左下角 chip，非遮罩） | **B** | 非阻断；忙碌时不打扰 |
| G13 | `InAppReminderBannerUI.js` | 到点提醒条 | 多种 | **弱**（`role=status`） | **B** | 可忽略条，非模态 |
| G14 | `MindfulAcknowledgeToast.js` | 轻量确认 toast | 多种 | **弱** | **B** | 非阻断 |

---

## 6. 未接入主路径（记录备查）

| ID | 组件/文件 | 说明 | 分类 |
|---|---|---|---|
| X01 | `ui-kit/components/achievement-modal.js` | `DESIGN.md` 标明纪念奖励探索件，**未挂主会话路径** | **（不计入拍板）** |

---

## 待 PO 拍板清单

> **只在本页勾选。** 已由本审计判为 **B、不必再问** 的仪式细目：S10 / F7 离开钮、S13 / M3 入口、S14 / M4 离开、S18 / R4 轻量跟条。本清单另含 15 条没有的 **S03**（Honesty 登入）、**S21**（Transition Moment）。  
> **2026-09-14 PO 已全部拍板** → 见下节「PO 拍板记录」；下列勾选为落盘镜像，**批准 ≠ 开工**。

### 批准 ≠ 开工（强制分两步）

- 勾选 A 类 **G02 / G06 / G08** = 同意「这几处违背原则、可以进降级队列」。**不等于**已写代码；须**另开对话**发口令「开工」。
- 勾选 **NA4 / NA5** = 只确认方向（Support `alert` 应改为内联）。实际改造仍跟 HIG **P4** 既定排期，**不因本次勾选插队**。

### A 类 — 明显违背原则（批准后可进下一批降级实现）

- [x] **NA4** Support 结账：云 API 未配置 → `window.alert`（**见 P4 · 方向同意 · 不插队**）
- [x] **NA5** Support 结账：Session 创建失败 → `window.alert`（**见 P4 · 方向同意 · 不插队**）
- [x] **G02** Onboarding `?` Purpose 大卡（`aria-modal` + backdrop）— 含 detailed hint「了解更多」链入 → **同意降级 · 开工 1**
- [x] **G06** detailed hint CTA → Purpose 卡展开链（气泡本身可保留）→ **同意降级 · 开工 1**
- [x] **G08** Focus Circle Witness respond/leave 短语选择器（`role=dialog`，挡 Yin tap）→ **同意降级 · 开工 1**

### C 类 — 不确定，请归入 A 或 B

- [x] **S03** Honesty 正念登入面板 → **维持 B**
- [x] **S04–S08** RitualFlow 各步玻璃板（F1–F5）→ **维持 B**（仪式/接地/微呼吸本体不动）
- [x] **S09** RitualFlow 早退回顾气泡 (F6) → **降级 A**（不占整块仪式板 · 开工 3）
- [x] **S11** MicroRitual 时长板 (M1) → **维持 B + 门闩**（板开着时禁止/忽略 Sit · 开工 4）
- [x] **S12** MicroRitual 呼吸层 (M2) → **维持 B**
- [x] **S15** Recover 接地四段 (R1) → **维持 B**
- [x] **S16** Recover 环顾 (R2) → **维持 B**
- [x] **S17** Recover 遗留呼吸/过载 (R3) → **删遗留**（开工 5）
- [x] **S21** Transition Moment 边界文案 → **降级 A**（改为 Whisper 轻提示 · 开工 2）
- [x] **G07** Focus Circle Witness leave 底栏 → **维持 B**（G08 在开工 1 改）

---

## PO 拍板记录（2026-09-14）

**拍板人**：PO（用户书面确认）  
**落盘日期**：2026-09-14  
**主干锚点**：`origin/develop` @ `4eae1af2`（#762 + #763 已合）  
**执行顺序**：**0 → 1 → 2 → 3 → 4 → 5**（一次一任务，每批单独新对话「开工」）

### 汇总表

| ID | 决定 | 实现批次 | 备注 |
|---|---|---|---|
| NA4 / NA5 | 方向同意 | P4（HIG 原排期） | **不插队** |
| G02 / G06 / G08 | 同意降级 | **开工 1** | 依据 `p5-hints-witness-nonmodal-plan.md` |
| S03 | 维持 **B** | — | 无需写代码 |
| S04–S08、S12、S15–S16 | 维持 **B** | — | 仪式/接地/微呼吸本体不动 |
| S09 | 降级 **A** | **开工 3** | 早退回顾变轻，不占整块仪式板 |
| S11 | 维持 **B** + 门闩 | **开工 4** | 时长板留着；板开着时不能同时点坐下 |
| S17 | 删遗留 | **开工 5** | 过载/旧呼吸路径去掉 |
| S21 | 降级 **A** | **开工 2** | 过渡句 → Whisper，不挡摸头 |
| G07 | 维持 **B** | — | 离开底栏留着当底座（G08 在开工 1 改） |

### 分批开工口令（引用用）

| 批次 | 口令 | 范围摘要 |
|---|---|---|
| 0 | `开工 把模态审计拍板写入 MODAL_USAGE_AUDIT.md` | 本文档落盘（纯文档） |
| 1 | `大任务 开工 P5 Part1 问号卡与留痕选句非模态` | G02 / G06 / G08 |
| 2 | `开工 Transition Moment 降为 Whisper` | S21 |
| 3 | `开工 RitualFlow 早退回顾变轻` | S09 |
| 4 | `开工 MicroRitual 时长板开着时禁止坐下` | S11 门闩 |
| 5 | `开工 Recover 删遗留呼吸过载路径` | S17 |

每批纪律：新 Chat · 旁支 + 单 PR · 收尾 `test:smoke` + `test:e2e:smoke` · 动叠层须写保护面并核对 `overlaySlotContractRegistry` / `Z_INDEX.md`。

### 开工 1 边界：隐私页未勾完能否点走下面？

**拍板**：**必须先关隐私页** — 隐私 sheet 开着时，底下**不可点穿**去坐下/菜单/摸头。

**依据（Mac / HIG 习惯）**：

1. **G03** 隐私说明页归类为 **B**（`role=dialog` + backdrop），语义 = macOS **sheet 级模态**：父窗口内容在 sheet 存续期间不可交互。
2. 现有验收契约（`TEST_TRACKER`「Privacy 点空白关 sheet」）：点 sheet **外**空白或 backdrop → 0–1 秒内关 Privacy（可同时收简介卡）。这是 Mac「点外面 dismiss sheet」范式，**不是**点穿到底下主界面。
3. 勾选未完成只禁用 sheet 内确认钮，**不**等于允许绕过 sheet 去操作花园；用户须 Back / 点空白先关 sheet，再操作底下。

**与开工 1 非模态简介卡的关系**：Purpose 卡去掉全屏遮罩后，**G03 隐私 sheet 仍保持 sheet 模态 + backdrop**；仅非模态的是贴边玻璃简介卡（G02）与留痕选句（G08）。简介开着、用户点坐下/起来 → 仍按 `p5-hints-witness-nonmodal-plan.md` §1.4 自动收卡；**不卷** Recover / Ritual / Micro。

---

## 验收

1. PO 拍板已完成（2026-09-14）；上表与勾选为 SSOT。  
2. **批准 ≠ 开工**：各批次须另开对话发上表口令；每批一个旁支 + 一个 PR。  
3. P5 Part 1 方案（#762 已合）与 A 类 G02/G06/G08 对齐，从**开工 1**起实现。  
4. 勿在 `p5-ritual-modal-audit.md` 再打一套勾。

---

## 参考

- `PRINCIPLES.md` §「减少阻断式确认」
- `MACOS_HIG_AUDIT_ROUND1.md` §3
- `p5-ritual-modal-audit.md`（R/F/M 细目，已吸收进 §4）
- `p5-hints-witness-nonmodal-plan.md`（开工 1 方案 · #762 已合）
- `overlaySlotContractRegistry.js`（叠层 SSOT）
