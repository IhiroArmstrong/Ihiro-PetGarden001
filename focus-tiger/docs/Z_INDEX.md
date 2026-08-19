# Z_INDEX.md — 产品层叠登记（登记用，非重构）

> **目的**：新加 `position: fixed` / 浮层前，先扫一眼本表，避免与既有层级打架。  
> **范围**：`focus-tiger/` 产品运行时代码（`index.html` + `src/` + 实际挂进主壳的 ui-kit 组件）。  
> **不含**：仅 e2e 测试夹具、`ui-kit/demo.html` 演示页（见文末附录）。  
> **维护**：新增/改动产品 `z-index` 时顺手改本表一行；**不要**借登记名义批量改数值。  
> **扫描日**：2026-07-29（对照当前 `develop` 工作树）。

叠层上下文提醒：多数业务浮层挂在 `#ui-overlay`（`z-index: 10`）内部；其子节点的 `z-index` 只在该 stacking context 内比较。`NarrowIdleShell` / Ambient / Hints 等是 **同级 `position: fixed` 挂在 `body`/`#app`**，会与 `#ui-overlay` 整层比较。`IdleChromeFacade`（Task 3）**不设** z-index——层级仍登记在下方 Narrow / Wide 适配器行。

---

## 按数值升序（产品）

| z-index | 文件 | 用途 |
|---|---|---|
| **-1** | `src/ui/WideIdleMoreMenu.js` | 宽屏 Idle 次要入口 + Sit/⚡ 文案 pill park 屏外（Honesty dock / 微仪式 / dock hint / Sound FAB / Reminder toggle / `#btn-focus` / `#quick-start-focus`）时压到底层，避免误抢点击 |
| **0** | `src/effects/LightProgression.js` | Arrival 暖光 backdrop（`#light-progression-backdrop`），最底层氛围 |
| **0** | `src/ui/SeasonalThemeChromeUI.js` | `#seasonal-theme-wash` 节日轻氛围（pointer-events:none；在角色/UI 下） |
| **1** | `index.html` | `#poster` 启动海报图 |
| **1** | `src/ui/ReminderPreferenceUI.js` | Reminder 时钟控件根（`.reminder-pref`），相对热力图簇内叠层 |
| **1** | `src/ui/IdleCompanionPipUI.js` | Idle Document PiP 入口（`.idle-companion-pip`），相对热力图簇内叠层；仅 Chromium 挂载 |
| **2** | `index.html` | `#scene-canvas` 3D/WebGL 场景画布 |
| **2** | `index.html` | FocusHUD 连胜环（`.ft-hud__streak`）相对 HUD 卡 |
| **2** | `src/effects/LightProgression.js` | 日常 focus 金晕 rim（`#light-progression-rim`），在角色周围、sprite 之下 |
| **2** | `src/ui/OnboardingHintsUI.js` | 提示发现小圆点（`.ft-hint-discovery-dot`）相对宿主按钮角标 |
| **2** | `ui-kit/components/streak-meter.js` | `<streak-meter>` host 相对邻居 |
| **3** | `index.html` | FocusHUD 悬停详情卡（`.ft-hud__detail`） |
| **3** | `src/character/SpriteSequencePlayer.js` | 2D 情绪序列层（`#sprite-overlay`）：在 canvas 之上、`#ui-overlay` 之下。**子层**：`#lotus-pond`（z 0，花在阿寅后）→ `#sprite-stage`（z 1）→ `#lotus-pond-birth-fx`（z 2，出生瞬间在阿寅前）。不另开全局 z |
| **3** | `ui-kit/components/streak-meter.js` | 连胜环下方 label 提示 |
| **4** | `src/effects/LightProgression.js` | 光影 FX 根（`#light-progression-fx`）全屏特效层 |
| **4** | `src/effects/IncenseGreeting.js` | 一炷香问候粒子/特效全屏层 |
| **10** | `index.html` | `#ui-overlay` 主 UI 叠层根（多数面板/按钮挂这里） |
| **11** | `src/ui/TipKindnessBadgesChrome.js` | Idle 阿寅旁练习/善意徽章条（`#yin-tip-kindness-badges`；**mid-right** beside Yin，勿压右上 Support/mute；Focusing 隐藏） |
| **11** | `src/ui/SanctuaryEnsoMarkChrome.js` | Sanctuary Enso 页面左下角印记（`#yin-sanctuary-enso-mark`）；与 kindness badges 同带；宽屏真左下角、375 抬到三球之上；`pointer-events: none`；Focusing 淡化 |
| **12** | `src/ui/WeeklyPracticeHeatmap.js` | 周练习热力图簇（含 Reminder 时钟入口） |
| **12** | `src/ui/ActiveRecoverAnchorUI.js` | Focusing Tiger Anchor（轻触阿寅 / 幽灵提示）；冷却期微光+提示 hidden、**invisible hit 仍在**（FB-01）；`#ui-overlay` 内；须低于 dock Rise(16) 与 toast(18/40) |
| **12** | `src/ui/IdleYinTapAnchorUI.js` | Idle 轻点阿寅 `#idle-yin-tap-anchor`（invisible hit；无微光）；与 Active Recover **互斥**（Idle vs Focusing）；须低于 dock Sit(16) |
| **14** | `src/ui/HonestyCheckInUI.js` | Idle「再补登」文字入口（在 Honesty 面板之下） |
| **14** | `src/ui/MicroRitualUI.js` | 微仪式 Idle 文字入口（对称 Honesty） |
| **15** | `src/ui/HonestyCheckInUI.js` | Honesty Check-in 主面板 |
| **15** | `src/ui/ArrivalPracticeUI.js` | Arrival Practice 底部叠层 |
| **15** | `src/ui/MicroRitualUI.js` | 微仪式主面板 |
| **15** | `src/ui/TigerReflectionMoment.js` | Reflection 结束后的老虎短句叠层 |
| **16** | `src/ui/CompanionModePicker.js` | `#session-start-dock`（Sit / Companion 三选一等）；须高于 Honesty/微仪式入口，防点穿 |
| **16** | `src/ui/ImmersivePresenceUI.js` | Focusing 全屏陪伴入口条（`#immersive-presence`）；与 dock 同带，Focusing 时 dock 已藏 |
| **16** | `src/ui/InAppReminderBannerUI.js` | Reminder 横幅默认（宽屏 / 非窄壳路径）；挂在 `#ui-overlay` 内 |
| **16** | `src/ui/LanguagePreferenceUI.js` | 宽屏 Idle 右下语言地球钮（`.language-pref__fab`）；窄屏 CSS 隐藏 |
| **17** | `src/ui/FlowerBlowWelcomeBubbleUI.js` | 变花鼓励气泡（`#flower-blow-welcome-bubble`）；白玉毛玻璃 + 尖角；窄屏 `top` 须让开 ActionBar（`homeClearanceTopCss`）；须可点消 |
| **17** | `src/ui/MomentWhisperUI.js` | `#moment-whisper` Five Moments 轻量认出句（阿寅旁；3–4s 淡出；非 Banner） |
| **17** | `src/ui/FocusAwarenessCardUI.js` | `#focus-awareness-card` Focusing **底部**间隔拍觉察短句（可重复；可单独关；**不**写 Whisper seen） |
| **17** | `src/ui/SeasonalThemeChromeUI.js` | `#seasonal-theme-whisper` 节日观察式短句（一日一次；可点消；非 Banner） |
| **17** | `src/ui/ContextualTeaTipBubbleUI.js` | `#contextual-tea-tip-bubble` 场景化请茶轻气泡（达标/里程碑；可忽略；非 modal 墙） |
| **18** | `src/ui/HonestyBridgeCtaUI.js` | Honesty 桥接 Yes/No CTA |
| **18** | `src/ui/LanguagePreferenceUI.js` | `#language-preference` 语言面板（FAB / ⋯ / 抽屉打开） |
| **18** | `src/ui/ZenCinemaCardUI.js` | `#zen-cinema-card` Zen Cinema 确认卡（⋯ / 抽屉；将打开 YouTube） |
| **18** | `src/ui/FiveMomentsCompassUI.js` | `#five-moments-compass` Five Moments 指南卡（⋯ / 抽屉 / 首卡 /「?」次要链） |
| **18** | `src/ui/JourneyLogUI.js` | `#journey-log` Journey Log 轻面板（⋯ / 抽屉；本地留痕；非 HealthKit） |
| **18** | `src/ui/FocusCoinsPanelUI.js` | `#yin-coin-panel` Yin's Collections 轻面板（⋯ / 抽屉；Journey 同族玻璃；不可现金；商店目录） |
| **18** | `src/ui/DailyZenQuoteCardUI.js` | `#daily-zen-quote-card` 今日静语卡（⋯ / 抽屉；保存 PNG） |
| **18** | `src/ui/MustardSeedSealCardUI.js` | `#mustard-seed-seal-card` 芥子须弥纪念印（完成仪式后按未揭示 case 出卡；其后 ⋯ / 抽屉轮换） |
| **18** | `src/ui/DigitalWallpapersCardUI.js` | `#digital-wallpapers-card` 阿寅静帧壁纸卡（⋯ / 抽屉；保存 PNG） |
| **18** | `src/ui/SanctuaryUnlockUI.js` | `#yin-sanctuary-card` Sanctuary Lifetime 解锁卡（⋯ / 抽屉） |
| **18** | `src/ui/MembershipUnlockUI.js` | `#yin-membership-card` Yin Membership 订阅卡（⋯ / 抽屉 / Support；与 Sanctuary 互斥打开） |
| **18** | `src/ui/TipJarUI.js` | `#yin-tip-jar-card` Buy Yin a Tea 卡（⋯ / 抽屉） |
| **18** | `src/ui/NewsletterCaptureUI.js` | `#newsletter-capture-card` Stay in touch 可选邮件留资卡（⋯ / 抽屉；不存邮箱；无 entitlement） |
| **18** | `src/ui/ConfideToYinUI.js` | `#confide-to-yin-card` 向阿寅倾诉卡（⋯ / 抽屉；**Web 检索不生成**；默认挂载关；QA `?confide=1`）。桌面窄例外未接线，见定位稿 |
| **18** | `src/ui/MindfulAcknowledgeToast.js` | 「也算数」类 toast · 底部 placement |
| **20** | `src/core/EmotionController.js` | DEV 情绪调试按钮列（右上） |
| **20** | `src/ui/WideIdleMoreMenu.js` | 宽屏 More（⋯）下拉菜单面板 |
| **21** | `src/main.js` | DEV 实验室按钮（重置本地状态 / 清 hints / 等） |
| **22** | `src/main.js` | DEV 实验室一次性 toast（`#dev-lab-toast`） |
| **22** | `src/ui/AmbientSoundscapeUI.js` | Ambient 根壳（`.ambient-soundscape`，`pointer-events: none`） |
| **22** | `src/ui/OnboardingHintsUI.js` | 左下 `?` 帮助钮（`.onboarding-hint-help`） |
| **22** | `src/ui/SoftUpdatePromptUI.js` | 仅有新版本时出现的轻量更新芯片（`#ft-soft-update-prompt`；左下、几何在 `?` **上方**；点一下刷新；忙时隐藏；与 `?` 同带勿抢 23 右下 Sound chrome） |
| **23** | `src/ui/AmbientSoundscapeUI.js` | Soundscape 右下 focus chrome（曲目面板 + Sound FAB 容器） |
| **24** | `src/ui/AmbientSoundscapeUI.js` | 右上 mute / 音符钮（`.ambient-soundscape__mute`） |
| **24** | `src/ui/SupportYinModalUI.js` | 右上 Support Yin FAB（`#yin-support-fab`；在 mute 左侧） |
| **24** | `src/ui/NarrowIdleShell.js` | 窄屏 Focusing：强制把 mute 提到可点层（覆盖 park） |
| **25** | `src/ui/SupportYinModalUI.js` | `#yin-support-backdrop` Support 模态遮罩 |
| **26** | `src/ui/SupportYinModalUI.js` | `#yin-support-modal` Support 三卡模态（Sanctuary + Membership + Tea） |
| **27** | `src/ui/OnboardingHintsUI.js` | 用途说明卡（`.onboarding-app-purpose`） |
| **28** | `src/ui/OnboardingHintsUI.js` | Hints 目录芯片（`.ft-hint-catalog-chip`，如「More tips」） |
| **29** | `src/ui/OnboardingHintsUI.js` | 应用内隐私说明（`#onboarding-privacy-sheet`；高于简介卡） |
| **29** | `src/ui/OnboardingHintsUI.js` | Wellness QA 卡（`#onboarding-wellness-first`；仅 `?wellnessFirst=1`；与 Privacy Sheet 同带） |
| **30** | `src/ui/NarrowIdleShell.js` | NarrowIdleShell 固定壳（ActionBar / 抽屉 / 主屏三球）；须高于 Ambient(22) 才能点 ♪ / ? |
| **32** | `src/ui/NarrowIdleShell.js` | 窄屏 stage：Companion dock / Reminder 热力图簇 / Soundscape chrome 抬到壳之上 |
| **32** | `src/ui/WideIdleMoreMenu.js` | 宽屏 stage Sound：Soundscape chrome 抬到菜单之上 |
| **32** | `src/ui/WideIdleMoreMenu.js` | 宽屏 stage Reminder：`#reminder-preference-panel` 抬到菜单之上 |
| **32** | `src/ui/ReminderPreferenceUI.js` | `#reminder-preference-panel` viewport-fixed 挂 `body`（避开热力图簇 `backdrop-filter` 包含块；⋯ / 抽屉点选后居中偏下） |
| **33** | `src/ui/NarrowIdleShell.js` | 窄屏 stage Reminder：偏好面板再抬一层（相对 staged 簇） |
| **34** | `src/ui/ft-onboarding-hint-bubble.js` | Onboarding 提示气泡（Lit）；须高于窄壳主 CTA(~30) |
| **34** | `src/ui/InAppReminderBannerUI.js` | 窄屏 Idle/park：Reminder 横幅抬到 ActionBar 之下可见（防被壳顶栏盖住） |
| **40** | `src/ui/MindfulAcknowledgeToast.js` | 「也算数」类 toast · 中置/窄屏抬高层（Honesty 桥接等同带） |
| **100** | `index.html` | `#loading-mask` 启动加载遮罩（最高产品层，加载完移除） |

### ui-kit 变量（未在主产品硬编码数值）

| 符号 | 文件 | 说明 |
|---|---|---|
| `var(--z-modal)` → **1000** | `ui-kit/tokens.css` + `ui-kit/components/achievement-modal.js` | 成就弹层 token；主产品日常壳未接此组件 |

---

## 常用冲突带（读表速查）

| 带宽 | 谁在抢 | 注意 |
|---|---|---|
| **10–18** | `#ui-overlay` 内：热力图 / Honesty·微仪式 / dock / Reminder 横幅 / 桥接 | dock(16) 必须高于 Honesty 面板(15) |
| **22–24** | Ambient 根 / Reminder 面板 / `?` / mute | NarrowIdleShell(30) 刻意盖过 Ambient，否则 ActionBar 点不到 |
| **30–34** | 窄壳 + stage 面板 + tip 气泡 + 窄屏 Reminder 横幅 | 新加全屏 fixed 壳时，检查 tip(34) 与 Reminder 横幅(34) 是否被压 |
| **40 / 100** | 中置确认 toast / loading | 勿把常驻 chrome 抬到 40+，除非确要盖过确认 |

---

## 附录 · 非产品运行时

| z-index | 文件 | 用途 |
|---|---|---|
| **1 / 10 / 20 / 30 / 40** | `ui-kit/demo.html` | ui-kit 演示页层级示意，不进产品壳 |
| **10000** | `e2e/scenario-a.companion.spec.js` | Playwright 测试用点击挡板，仅测试页 |

---

*版本：1.0 · 2026-07-29 · Prompt 5 登记*
