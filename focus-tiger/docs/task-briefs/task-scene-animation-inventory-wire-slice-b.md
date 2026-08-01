# Task Brief · 场景→动画 · A′ + Slice B（一批：Dispatcher + 库存消化）

**日期**：2026-08-01  
**状态**：产品已拍板 · **实现中**（`feature/scene-animation-dispatcher-slice-b`）  
**分支建议**：`feature/scene-animation-dispatcher-slice-b` + 独立 worktree  
**权威**：`SCENE_ANIMATION_WIRING.md` §四–§五 · §七 · §九–§十 · `EMOTION_BIBLE.md` · `ASSET_INVENTORY.md`

**前置**：Slice A（PR #59）已合 `develop`。

---

## 拍板摘要（2026-08-01 用户书面）

- Honesty 分界：**≤20 min**（含 21–29）→ nod-bow；**≥30 min** → halo-breathing（或 breathHaloHq）。  
- 日语 = **合十** `palms-together`（规格正确；须修代码）。  
- **勿接**已取代目录。  
- **中央 Animation Dispatcher** 必做：语义事件 + 加权映射 + 冷却（闲置类默认 1h）。  
- 设计师清单其余项（除驳回混档 / 已接线免重做 / Slice C 荷花）→ **同一实现批次**，不拆碎。  
- **驳回**：同日非首次完成池混入 `celebrate-dance*`。

---

## 为何一批（不是「风险高所以拆开」）

触发动画对多数业务路径冲击不高；真正要一次做对的是 **档位 / 冷却 / Focusing 跳过 / 衔接**。用 Dispatcher 统一承载后，清单项应**批量接线**，避免十个平行 if-else PR。

**本批不重做**：英语切语 nod-bow；Stretch Break → stretch-reminder；MilestoneGlow 产品路径。

**本批不做**：lotus-*（Slice C，缺 Grow 面）；完成池 dance；靠近自动 nodGreeting；IdleOrchestrator 默认五变体池。

---

## 范围（一批必做）

### A′ · 日语真合十

- `ja` 切语播 `palmsTogether`（或专用键），与 Arrival Choose 的 `intentionSet`/nod **解耦**。  
- 验收：日本語 → 合十画面；English → 鞠躬；同日同语不重复；Focusing 跳过。

### Dispatcher 骨架

- 语义事件 → 映射表（单键或加权数组）→ `playEmotion`。  
- 冷却 + 同日限频 + Focusing/Celebrating/叠层 skip。  
- 迁移/包裹现有 `localeGreeting` 模式。

### 清单接线（均经 Dispatcher）

| 事件 / 场景 | 映射 |
|---|---|
| Honesty Idle 记账成功 | ≤20（含 21–29）：mindfulAcknowledge；≥30：haloBreathing / breathHaloHq |
| 微仪式完成 | 同档池：sessionComplete 为主 + blink-smile / 短 halo |
| 欢迎 / 冷启动限频 | wave-hello ~60% · nodGreeting ~40%（勿靠近自动） |
| 同日非首次计时完成 | sessionComplete ~60% · nod/blink-smile ~40%（**禁 dance**） |
| 舒展提醒池 | stretchReminder + yawnStretch 加权 |
| 深夜 ≥23:00 Idle/刚结束 | yawn 或 tea（冷却 1h） |
| Curiosity 悬停/久无操作 | ≤5% ear 或 gaze 组合（不经 Idle 默认池；冷却） |

---

## 验收口径

1. §十「一批」行均可复现；已接线行不回归。  
2. 完成 / Honesty / 切语 **从不** Celebrating。  
3. 主路径 + 回流各一条；闲置类可测冷却。  
4. 单测锁：ja→palms 目录、Honesty 20/30 分界、完成池不含 dance、冷却边界（可注入 RNG/时钟）。

自动化：unit 为主；e2e 一条切语合十 + 可选 Honesty 长时长钩子；勿本地全量 e2e。

---

## 排期口令

文档合入 `develop` 后，你点名「开工场景动画 Dispatcher / Slice B」即可开实现分支。
