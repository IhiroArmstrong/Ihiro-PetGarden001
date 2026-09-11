# 冷启动第一幕 · 11 入口审计清单（草案）

创建日期：2026-09-06  
状态：**audit-pass · 2026-09-11 首轮收口** — goal-onboarding 已解除 blocked；E12/摸头 CapCut 另支修复不阻塞。  
权威 Brief：`task-briefs/task-cold-start-first-scene-audit.md`  
关联：`spriteChannelArbitration.js` · `overlaySlotContractRegistry.js` · `main.js` `onAppReady` 路径 · `DEV_WORKFLOW_QUALITY.md` §6.7 / §6.9 / §6.10 / §6.17

> **口径**：「冷启动第一幕」= 本页会话 `onAppReady` 至用户第一次可稳定交互的 Idle（含同 tick / 短延迟首卡）。不含回前台 `visibilitychange`（另见场景 AD 回流路径）。

---

## Gate 顺序 SSOT（2026-09-11 · PO 收口）

```text
同 tick（精灵通道 · resolveBootSpriteOccupancy 自上而下）
  1. 付款回跳致谢（E01）— 压过一切含深夜披毯
  2. 吹花情绪（E02）— 压过 wellness 清晨/深夜
  3. Wellness 清晨苏醒（E03）
  4. Wellness 深夜进睡（E04）
  5. 欢迎池书/点头（E05）
  6. Expand A 深夜进睡（E06，仅 welcome 已用当日）
  7. 默认 Idle（E07）

第一幕结束后（精灵通道续 · 非第一帧竞争者）
  7b. 提醒鹦鹉信使（E12 精灵半）— FIRST_PAINT_OCCUPANCY 期间 KEEP；
      onComplete + CAPCUT_DISSOLVE_MS 后再 occupy PARROT。横幅可先出。

短延迟叠层（FIRST_CARD_DEFER_PRIORITY · scheduleFirstCardOffers）
  8. 吹花白玉气泡（E08）— defer 队首；须等 E02 动画触发
  9. 冷启动目标问答（E15）— defer #2；仅首次 seen 前；见 goal-onboarding Brief
 10. Five Moments Compass（E09）— defer #3
 11. Wellness 免责首卡（E10）— 默认关；?wellnessFirst=1 时优先于 Compass

并行发现（不与 defer 队统一仲裁 · 须 overlayBusy / occupancy 门闩）
 12. 额头摸头提示（E11）— 吹花气泡可见时不得出
 13. 提醒横幅（E12 叠层半）— 欢迎播放中可出；鹦鹉走 7b

卫星（记录互斥 · 不阻塞本表 11 项索引）
  E13 Onboarding auto hints — help-affordance 等；≤1 条自动
  E14 Purpose / Privacy 卡 — 手动 ? 路径；block 首卡
```

---

## 核心 11 入口明细

| ID | 名称 | 层 | Owner / 入口 | 门闩 / 存储 | 优先级（高→低） | 测试锚 | 审计状态 |
|---|---|---|---|---|---|---|---|
| **E01** | Checkout 付款回跳致谢 | A | `resolveBootSpriteOccupancy` · `checkoutWelcomeGate` · `main.js` ~3876 | `checkoutReturnKind` / session URL | 精灵 **最高**（矩阵 #3） | SCENARIO_TESTS **AD** · Q Stripe 回跳 | **ok** — 2026-09-11 冷启动首轮 **测试通过** |
| **E02** | 吹花欢迎情绪 | A | `flowerWelcomeGate` · `tryPlaySceneAnim(WELCOME_APP)` · `main.js` ~3953 | `focus-tiger.flower-welcome.v1` · `scene-anim-daily` | 精灵 #4；**压过** E03/E04 | SCENARIO_TESTS **V** · TRACKER 吹花 Phase 2b | **ok** — 2026-09-11 冷启动首轮自然触发 **测试通过** |
| **E03** | Wellness 清晨苏醒 | A | `resolveWellnessDayBand` · `cloakVariant` MORNING | 本地时钟 band | 精灵 #5；低于 E02 | SCENARIO_TESTS wellness 清晨 · TRACKER | **pending** — 须 **早晨** 再测；吹花压过已验；**不阻塞** goal-onboarding |
| **E04** | Wellness 深夜披毯 | A | `resolveBootSpriteOccupancy` enter-dormant · `HonestyCheckIn.onAppReady` | `allowEnterDormant: false` on boot | 精灵 #11；低于 E02/E05 | SCENARIO_TESTS **AD** · TRACKER 开场即睡 | **ok** — 2026-09-11 冷启动首轮 **测试通过** |
| **E05** | 欢迎池（书/点头） | A | `sceneAnimationDispatcher` `WELCOME_APP` 池 | `scene-anim-daily.welcome` 日限 1 | 精灵 #7 | SCENARIO_TESTS Slice B · TRACKER 场景动画 | **ok** — 2026-09-11 冷启动首轮 **测试通过** |
| **E06** | Expand A 深夜 DORMANT | A | `resolveBootSpriteOccupancy` lateNight boot | `welcomeUsed` + `isLateNightHour` | 精灵 #10；仅 welcome 已用后 | SCENARIO_TESTS **AD** · §6.9 互斥 | **ok** — 2026-09-11 冷启动首轮 **测试通过** |
| **E07** | 默认 Idle 闭目坐禅 | A | `resolveBootSpriteOccupancy` fallback · `emotionController.playEmotion('idle')` | — | 兜底 | TRACKER 开场即睡 · smoke A1b | **ok** — 2026-09-11 冷启动首轮 **测试通过** |
| **E08** | 吹花白玉气泡 | B | `FlowerBlowWelcomeBubbleUI` · `FIRST_CARD_DEFER_PRIORITY[0]` | 跟 E02 同日 XOR | defer **队首** | SCENARIO_TESTS **V** 窄屏气泡 | **ok** — 2026-09-11 冷启动首轮 **测试通过** |
| **E09** | Five Moments Compass | B | `FiveMomentsCompassUI` · `scheduleFirstCardOffers` | `focus-tiger.five-moments-compass-seen.v1` | defer #3（低于 E08/E15/E10） | SCENARIO_TESTS Compass 首卡 | **gap** — `?` 简介内 **不应** 再链 Compass（球形钮另排）；首卡 defer 仍缺组合 e2e |
| **E10** | Wellness 免责首卡 | B | `OnboardingHintsUI.openWellnessFirstCard` | `?wellnessFirst=1`；**默认不自动弹** | defer #4；`?` 查阅仍可用 | SCENARIO_TESTS wellness 免责 | **ok** — 2026-09-11：`?` 简介内免责区块 **测试通过** |
| **E11** | 额头摸头发现提示 | C | `idleYinTapHintGate` · `IdleYinTapAnchorUI` | `focus-tiger.idle-yin-tap-hint.v1` | 独立；`overlayBusy` / `flowerWelcomeVisible` 门闩 | SCENARIO_TESTS 摸头提示 · TRACKER | **ok** — 2026-09-11 冷启动首轮 **测试通过** |

---

## 观察卫星项

| ID | 名称 | Owner | 与 11 项互斥 | 测试锚 | 审计状态 |
|---|---|---|---|---|---|
| **E12** | 应用内提醒横幅 + 鹦鹉信使 | `inAppReminderBannerController` · `parrotMessengerGate` · `occupancyHoldsParrotMessenger` | 第一幕占用 KEEP；onComplete + 1s CapCut 后 flush | SCENARIO_TESTS 场景 A/P3/V 组合 · §6.10 | **gap** — 2026-09-11：设提醒后点确认钮无反应；**另支 Agent 修复中**；不阻塞 goal-onboarding |
| **E13** | Onboarding auto hints | `OnboardingHintsStore` · `syncOnboardingAutoHints` | `AUTO_HINT_PRIORITY` ≤1 自动；Reflection/Focusing 不抢 | `HINTS_WIRING.md` · 窄屏 e2e | **gap** — 冷启动组合 auto hint 无专门场景 |
| **E14** | Purpose / Privacy 卡 | `OnboardingHintsUI` | `onboardingHintsBlockFirstCard()` 阻断 E09/E10/E15 | Privacy e2e | **ok** — 非默认冷启动路径 |

---

## 已知分散点（审计待确认）

| # | 现象 | 涉及入口 | 文档根因 | 建议 |
|---|---|---|---|---|
| G1 | Compass 与吹花/欢迎时序 | E08/E09/E05 | `scheduleFirstCardOffers` 4s 重试 | 补组合 e2e 或单测锁 `canAttemptFirstCard` 快照 |
| G2 | 提醒横幅 vs 欢迎/吹花 | E12/E05/E02 | 曾平行白名单漏吹花键；现 occupancy KEEP | 清库：有提醒且已过时分 + Day1 吹花 → 须先吹花再 1s 叠化才鹦鹉 |
| G3 | `overlayBusy` vs `isIdleYinTapOverlayBusy` 分裂 | E11/E08 | 两套 busy 派生 | 对照 `overlaySlotArbitration` derive* 是否一致 |
| G4 | 目标问答插入位 | E15 goal-onboarding | 已拍板 | defer 队 **E08 之后、E09 之前**（`COLD_START_GOAL`） |
| G5 | 摸头 `earWiggleHeadTouch` 回落缺 1s CapCut | E11 邻接 | 冷启动点额头摸头后硬切闪一下 | **另支修复中**；记入 TRACKER「Idle 轻点阿寅」行 |

---

## 审计进度

| 里程碑 | 状态 |
|---|---|
| 清单草案（只读代码） | ✅ 2026-09-06 |
| 人工清库冷启动逐条对照 | ✅ 2026-09-11 首轮 |
| 每条标 ok/gap/risk | ✅ 2026-09-11（E03 早晨 pending；E09/E12/E13 gap 不阻塞） |
| gap → 独立 fix Brief | 🟡 E12 确认钮 + 摸头 CapCut 另支修复 |
| PO 拍板 gate SSOT | ✅ 2026-09-11（文首 SSOT 已更新含 E15） |
| 解除 goal-onboarding blocked | ✅ 2026-09-11 |

---

## 变更记录

| 日期 | 说明 |
|---|---|
| 2026-09-06 | 初稿：自 `spriteChannelArbitration` / `main.js` / `FIRST_CARD_DEFER_PRIORITY` 只读排查 |
| 2026-09-06 | E12 入精灵续链 7b；吹花×鹦鹉无叠化为 E12 risk 证据；E09 gap 补「组合 e2e」说明 |
| 2026-09-11 | 首轮冷启动人工对照收口；gate SSOT 含 E15；goal-onboarding 解除 blocked |
