# SILENT_BEHAVIORS.md — 已知静默白名单

创建日期：2026-08-14  
地位：设计上**就该没用户可感知反应**的场景清单。原则全文见 [`INTERACTION_FEEDBACK_PRINCIPLES.md`](./INTERACTION_FEEDBACK_PRINCIPLES.md)（`RULES_INDEX` → `interaction-feedback`）。

**用法**：测试时看见「没反应」→ 先查本表。**命中 id = 测对了**；**不在表里 = bug**，不要猜是不是故意的。

**不是** [`EDGE_CASES.md`](./EDGE_CASES.md)：那份是静默**失败** / 边角观察（可能要修）。本表是产品拍板的**有意沉默**。

---

## 如何新增一行

1. 产品书面确认「这次就是不反应」。  
2. 给稳定 `SB-xx` id，写清用户感知、为何有意、权威出处。  
3. 对应 `SCENARIO_TESTS` 步骤写上该 id，并回答「点击后 0–1 秒内看到什么」（若根本不是点击，写「非点击 / 系统事件」）。  
4. 若其实应有接收反馈（按压、触点淡出）却目前没有——**不要**先塞进本表当永久豁免；先改交互，或把「待补反馈」写进 TEST_TRACKER。

---

## 白名单

| id | 场景 | 用户应感知到 | 为何有意 | 权威 | 类别 |
|---|---|---|---|---|---|
| **SB-01** | Re-focus：离开 **&lt;20s** 再回来 | **无** toast / `nod-bow`；连内部记账都不做 | 门槛未到；避免误触切页 | `SCENARIO_TESTS` 场景 B | 门槛未到 · 完全静默 |
| **SB-02** | Re-focus：离开 **20–60s** 再回来 | 只内部记账；**仍无**文案 / `nod-bow` | 未达展示门槛 | 同上 | 门槛未到 · 无表面反馈 |
| **SB-03** | Offline Space / Flow State 切走再回 | 即使离开 &gt;60s 也**无** Re-focus | `suppressAwayReminders`；离开是预期 | 场景 B / E | 模式抑制 |
| **SB-04** | 应用内提醒横幅 · 忙碌期 | Arrival / Focusing / Reflection / 微仪式中横幅 **不展示、不排队** | 已拍板 `suppress`（非 defer） | 场景 P | busy suppress |
| **SB-05** | Moment Whisper 该键已见 | 再进同一 Moment **不再**出 `#moment-whisper` | 每键一生一次 | 场景 Y | 限频已消耗 |
| **SB-06** | Moment Whisper · busy | Compass / Companion / Arrival 等叠层开着时不出 | 互斥，避免挡主路径 | 场景 Y | busy suppress |
| **SB-07** | Tiger Anchor **180s 冷却 · 专用邀请** | 微光 + 幽灵提示 **hidden**；Focusing 期间 `#active-recover-anchor` **根层仍在**（invisible hit 拦截点按，避免落到摸头）；**不应**再出完整 Active Recover `nod-bow`+toast | 防误触连点。邀请隐退只说明「完整 Recover 入口暂时没有了」，**不等于**「再点阿寅无接收反馈」——后者见 **FB-01**（已落地微点头；**不是**本条豁免、也**不**新建白名单） | 场景 X | 暂不生效（邀请消失） |
| **SB-08** | 微仪式 / Breath **Leave** | 不记账、无完成 toast、**不**进 Reflection | 未完成不记 | 场景 S · `MICRO_RITUAL_PLAN` | 未完成路径 |
| **SB-09** | 同日第二次计时达标 | **无**完整 Celebrating（轻量 `SessionComplete`） | 正向反馈节制 | 场景 L · `PRINCIPLES` | 限频 |
| **SB-10** | Re-focus 与更强情绪冲突 | 静默让位、**不补发** | Celebrating 等优先 | `EMOTION_BIBLE` | 让位 |
| **SB-11** | Celebrating 期间摸头 | 忽略、不排队 | 响应优先级 | `EMOTION_BIBLE` | 忽略输入 |
| **SB-12** | 共享日提醒额度耗尽 | Mindful / stretch / 被动 Re-focus 不再出 | 三类合计每日 3 次 | `DESIGN` 提醒池 | 限频已消耗 |
| **SB-13** | 本场已出过被动 Re-focus | 同会话再离开 &gt;60s **不再**出 | 每场最多 1 次 | 场景 B | 限频 |
| **SB-14** | 节日主题 whisper 同日已出 | 刷新同日不再出 `#seasonal-theme-whisper` | 一日一次 | `TEST_TRACKER` 节日行 | 限频 |
| **SB-15** | Onboarding **auto tip** | 冷启动**不再**自动喷气泡 | 2026-08-04 产品面只留脉冲悬停 +「?」简介 | `ONBOARDING_HINTS` 文首 | 产品面取消 |
| **SB-18** | Electron：**收进托盘**（关主窗口 hide，进程仍在） | **无** Re-focus toast / `nod-bow`；计时与氛围乐继续。从托盘再打开也**不**因「藏窗时长」补发走神 | 托盘收起不是切到别的 App；与场景 B 的切标签/切前台是两类事件 | `SCENARIO_TESTS` 场景 AB · 脚手架 Brief | 壳生命周期 · 非走神 |

---

## 待补反馈（不是白名单）

这些**不是**「测到没反应就算对」。测试时若仍完全没接收反馈，记入对应 TEST_TRACKER 行，**不要**用 `SB-xx` 挡掉。

| id | 缺口 | 当前实现 | 用户可能误解 | 建议验什么 | 权威 |
|---|---|---|---|---|---|
| **FB-01** | Tiger Anchor **冷却期内再点阿寅** | **已落地（Phase 1）**：冷却中微光/提示隐退，invisible hit 仍在；再点 → `mindfulAcknowledge` subtype `activeRecoverCooldown` → `nodBowMicro`（nod-bow 第 2–4 帧 pingpong，幅度小于完整鞠躬）。**无**文字/toast；**不**重置或延长 180s 冷却；不占额度、不触发 Recover 扰动。仍**不是**白名单（设计意图是「暂不生效」的接收反馈，不是「完全不生效」） | 「我点过了、在冷却」应能从微点头读出；不要误报成摸头或功能坏了 | Focusing → 轻触出完整 `nod-bow`+toast → 180s 内再点阿寅：**0–1 秒内**见比完整鞠躬更小的点头（溶解定格已是微点头姿态）；**不应**再出 Active Recover toast/完整 nod-bow。冷却结束微光+提示回来，再点才是完整 Recover。**375**：勿误触 Rise | 场景 X 步 5b · TRACKER「FB-01」行 |

原则对应：`INTERACTION_FEEDBACK_PRINCIPLES` 规则 2「暂不生效应能感知现在还不行」。FB-01 已按产品拍板落地微点头（无 toast）；**不要**再加白名单条目。

---

## 修订

| 日期 | 说明 |
|---|---|
| 2026-08-17 | **SB-18**：Electron 收进托盘 ≠ 走神（对照场景 B；收费 DMG 必有托盘）。不复用已废止的旧 SB-16/17 id |
| 2026-08-16 | 收回切走轻语（revert PR #323）：删除曾短暂存在的 SB-16/SB-17；SB-01/02/03 恢复为仅经典 Re-focus |
| 2026-08-14 | FB-01 Phase 1：冷却再点 = `nodBowMicro`（无 toast、不延长冷却）；SB-07 改为邀请隐退 + invisible hit 仍在。不新建白名单 |
| 2026-08-14 | follow-up：SB-07 收窄为「专用触点隐退」；冷却期内再点阿寅列为 **FB-01**（待补接收反馈，非白名单） |
| 2026-08-14 | 初版：把场景 B / P / X / Y 等已文档化的有意沉默收成可引用 id |
