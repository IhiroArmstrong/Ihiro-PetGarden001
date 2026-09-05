# 冷启动第一幕 · 11 入口审计清单（草案）

创建日期：2026-09-06  
状态：**draft · 待逐条标 ok/gap/risk**  
权威 Brief：`task-briefs/task-cold-start-first-scene-audit.md`  
关联：`spriteChannelArbitration.js` · `overlaySlotContractRegistry.js` · `main.js` `onAppReady` 路径 · `DEV_WORKFLOW_QUALITY.md` §6.7 / §6.9 / §6.10 / §6.17

> **口径**：「冷启动第一幕」= 本页会话 `onAppReady` 至用户第一次可稳定交互的 Idle（含同 tick / 短延迟首卡）。不含回前台 `visibilitychange`（另见场景 AD 回流路径）。

---

## Gate 顺序 SSOT（草案 · 待 PO 拍板）

```text
同 tick（精灵通道 · resolveBootSpriteOccupancy 自上而下）
  1. 付款回跳致谢（E01）— 压过一切含深夜披毯
  2. 吹花情绪（E02）— 压过 wellness 清晨/深夜
  3. Wellness 清晨苏醒（E03）
  4. Wellness 深夜进睡（E04）
  5. 欢迎池书/点头（E05）
  6. Expand A 深夜进睡（E06，仅 welcome 已用当日）
  7. 默认 Idle（E07）

短延迟叠层（FIRST_CARD_DEFER_PRIORITY · scheduleFirstCardOffers）
  8. 吹花白玉气泡（E08）— defer 队首；须等 E02 动画触发
  9. Wellness 免责首卡（E10）— 默认关；?wellnessFirst=1 时优先于 Compass
 10. Five Moments Compass（E09）

并行发现（不与 defer 队统一仲裁 · 须 overlayBusy / occupancy 门闩）
 11. 额头摸头提示（E11）— 吹花气泡可见时不得出

卫星（记录互斥 · 不阻塞本表 11 项索引）
  E12 提醒横幅 + 鹦鹉信使 — 欢迎播放中 hold；见 §6.10
  E13 Onboarding auto hints — help-affordance 等；≤1 条自动
  E14 Purpose / Privacy 卡 — 手动 ? 路径；block 首卡
```

---

## 核心 11 入口明细

| ID | 名称 | 层 | Owner / 入口 | 门闩 / 存储 | 优先级（高→低） | 测试锚 | 审计状态 |
|---|---|---|---|---|---|---|---|
| **E01** | Checkout 付款回跳致谢 | A | `resolveBootSpriteOccupancy` · `checkoutWelcomeGate` · `main.js` ~3876 | `checkoutReturnKind` / session URL | 精灵 **最高**（矩阵 #3） | SCENARIO_TESTS **AD** · Q Stripe 回跳 | **risk** — 矩阵已收口；TRACKER 致谢行仍待人工 |
| **E02** | 吹花欢迎情绪 | A | `flowerWelcomeGate` · `tryPlaySceneAnim(WELCOME_APP)` · `main.js` ~3953 | `focus-tiger.flower-welcome.v1` · `scene-anim-daily` | 精灵 #4；**压过** E03/E04 | SCENARIO_TESTS **V** · TRACKER 吹花 Phase 2b | **ok** — 2026-09-04 用户书面吹花 OK（未全关单） |
| **E03** | Wellness 清晨苏醒 | A | `resolveWellnessDayBand` · `cloakVariant` MORNING | 本地时钟 band | 精灵 #5；低于 E02 | SCENARIO_TESTS wellness 清晨 · TRACKER | **ok** — 吹花压过已验 |
| **E04** | Wellness 深夜披毯 | A | `resolveBootSpriteOccupancy` enter-dormant · `HonestyCheckIn.onAppReady` | `allowEnterDormant: false` on boot | 精灵 #11；低于 E02/E05 | SCENARIO_TESTS **AD** · TRACKER 开场即睡 | **risk** — 冷启动禁进睡已加固；与 E06 分工须人工区分 |
| **E05** | 欢迎池（书/点头） | A | `sceneAnimationDispatcher` `WELCOME_APP` 池 | `scene-anim-daily.welcome` 日限 1 | 精灵 #7 | SCENARIO_TESTS Slice B · TRACKER 场景动画 | **ok** — 池成员单测锁；组合 boot 见 E06 |
| **E06** | Expand A 深夜 DORMANT | A | `resolveBootSpriteOccupancy` lateNight boot | `welcomeUsed` + `isLateNightHour` | 精灵 #10；仅 welcome 已用后 | SCENARIO_TESTS **AD** · §6.9 互斥 | **ok** — `shouldAttemptLateNightOnBoot` 互斥已合 |
| **E07** | 默认 Idle 闭目坐禅 | A | `resolveBootSpriteOccupancy` fallback · `emotionController.playEmotion('idle')` | — | 兜底 | TRACKER 开场即睡 · smoke A1b | **ok** — 新用户/清库主路径 |
| **E08** | 吹花白玉气泡 | B | `FlowerBlowWelcomeBubbleUI` · `FIRST_CARD_DEFER_PRIORITY[0]` | 跟 E02 同日 XOR | defer **队首** | SCENARIO_TESTS **V** 窄屏气泡 | **ok** — 2026-09-04 用户书面 OK |
| **E09** | Five Moments Compass | B | `FiveMomentsCompassUI` · `scheduleFirstCardOffers` | `focus-tiger.five-moments-compass-seen.v1` | defer #2（低于 E08/E10） | SCENARIO_TESTS Compass 首卡 | **gap** — defer 重试 4s 逻辑复杂；缺组合 e2e |
| **E10** | Wellness 免责首卡 | B | `OnboardingHintsUI.openWellnessFirstCard` | `?wellnessFirst=1`；**默认不自动弹** | defer #3；`?` 查阅仍可用 | SCENARIO_TESTS wellness 免责 | **ok** — 2026-08-15 拍板不冷启动弹窗 |
| **E11** | 额头摸头发现提示 | C | `idleYinTapHintGate` · `IdleYinTapAnchorUI` | `focus-tiger.idle-yin-tap-hint.v1` | 独立；`overlayBusy` / `flowerWelcomeVisible` 门闩 | SCENARIO_TESTS 摸头提示 · TRACKER | **ok** — 2026-09-04 用户书面 OK |

---

## 观察卫星项

| ID | 名称 | Owner | 与 11 项互斥 | 测试锚 | 审计状态 |
|---|---|---|---|---|---|
| **E12** | 应用内提醒横幅 + 鹦鹉信使 | `inAppReminderBannerController` · `parrotMessengerGate` | 欢迎播放中 hold；`welcomePlayOptions.onComplete` flush | SCENARIO_TESTS 场景 A/P3 · §6.10 | **risk** — 逻辑已修；冷启动+已过提醒时分组合仍靠人工 |
| **E13** | Onboarding auto hints | `OnboardingHintsStore` · `syncOnboardingAutoHints` | `AUTO_HINT_PRIORITY` ≤1 自动；Reflection/Focusing 不抢 | `HINTS_WIRING.md` · 窄屏 e2e | **gap** — 冷启动组合 auto hint 无专门场景 |
| **E14** | Purpose / Privacy 卡 | `OnboardingHintsUI` | `onboardingHintsBlockFirstCard()` 阻断 E09/E10 | Privacy e2e | **ok** — 非默认冷启动路径 |

---

## 已知分散点（审计待确认）

| # | 现象 | 涉及入口 | 文档根因 | 建议 |
|---|---|---|---|---|
| G1 | Compass 与吹花/欢迎时序 | E08/E09/E05 | `scheduleFirstCardOffers` 4s 重试 | 补组合 e2e 或单测锁 `canAttemptFirstCard` 快照 |
| G2 | 提醒横幅 vs 欢迎 | E12/E05 | §6.10 已修 hold | TRACKER 标 `ok` 前补冷启动+提醒已过组合步骤 |
| G3 | `overlayBusy` vs `isIdleYinTapOverlayBusy` 分裂 | E11/E08 | 两套 busy 派生 | 对照 `overlaySlotArbitration` derive* 是否一致 |
| G4 | 新 gate 插入位未定 | 未来 goal-onboarding | 本表未含目标问答 | 审计收口后插入 defer 队 **E08 之后、E09 之前** 或 sprite 层之后（PO 拍板） |

---

## 审计进度

| 里程碑 | 状态 |
|---|---|
| 清单草案（只读代码） | ✅ 2026-09-06 |
| 人工清库冷启动逐条对照 | ⬜ 待做 |
| 每条标 ok/gap/risk | ⬜ 进行中（上表初标） |
| gap → 独立 fix Brief | ⬜ |
| PO 拍板 gate SSOT | ⬜ |
| 解除 goal-onboarding blocked | ⬜ |

---

## 变更记录

| 日期 | 说明 |
|---|---|
| 2026-09-06 | 初稿：自 `spriteChannelArbitration` / `main.js` / `FIRST_CARD_DEFER_PRIORITY` 只读排查 |
