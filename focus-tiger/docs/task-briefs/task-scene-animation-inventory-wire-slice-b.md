# Task Brief · 场景→动画 · Slice B（库存消化 + Dispatcher）

**日期**：2026-08-01  
**状态**：产品稿已整合 · **待点名开工**  
**分支建议**：`feature/scene-animation-inventory-wire-slice-b` + 独立 worktree  
**权威**：`SCENE_ANIMATION_WIRING.md` §四–§五 · §七 · §九–§十 · `EMOTION_BIBLE.md` 反馈分级 · `ASSET_INVENTORY.md`

**前置**：Slice A（PR #59）已合 `develop`。**强烈建议先做或并行 A′**：日语切语真合十（见下「A′」），否则人工验收「合十」会失败。

---

## 拍板摘要（2026-08-01）

- 用户：不希望入库动画大部分闲置；场景应更活跃动人。  
- 设计师：场景×动画清单 + 中央 Dispatcher + 冷却。  
- 文档已写入 `SCENE_ANIMATION_WIRING`；**驳回**「同日非首次完成随机 celebrate-dance」。

---

## A′（建议冻结前 · 可拆独立 fix）

| 项 | 规格 |
|---|---|
| 问题 | `locale === 'ja'` → `intentionSet` → 实际播 `nod-bow`，不是 `palms-together` |
| 修复 | ja 切语播 `palmsTogether`（或新键）；与 Arrival Choose 的 `intentionSet`/nod **解耦** |
| 验收 | Language → 日本語 → 合十画面；English → 鞠躬；单测锁素材目录 / 键 |
| 禁止 | Celebrating；Focusing 中仍跳过 |

---

## Slice B 范围（只做这些）

1. **欢迎池（冷启动 / 回访限频）**  
   - `welcomeBack` ~60% · `nodGreeting` ~40%  
   - 同日最多 1 次；勿每次刷新；**勿**恢复靠近自动点头  

2. **Honesty Idle 时长分档**  
   - ≤20 min（可调）：保持 `mindfulAcknowledge`  
   - ≥30 min：`haloBreathing` 或 `breathHaloHq`（平静满载）  
   - 睡态路径不叠；禁止 Celebrating  

3. **微仪式完成变体池（同档）**  
   - 主权重仍 `sessionComplete`  
   - 可选：`blink-smile` / 短 halo（日限）  
   - 禁止 dance  

4. **同日非首次计时完成变体池（同档）**  
   - `sessionComplete` ~60% · ack 轻变体（nod / blink-smile）~40%  
   - **禁止** `celebrate-dance*`  

5. **生命感（均带冷却 ≥60 min）**  
   - 清晨：yawn / stretch  
   - 深夜 ≥23:00：yawn / tea  
   - 摸头较长：ear-wiggle  
   - Idle 悬停稀有：gaze 组合或 ear（≤5%）——**不**经 IdleOrchestrator 默认池  

6. **架构**  
   - 引入或扩展 `sceneAnimationDispatcher`（语义事件 → 加权键 + 冷却 + 档位门闩）  
   - 复用 / 迁移 `localeGreeting` 模式；业务侧少写 if-else  

**不做（本 Brief）**：lotus 荷花产品面（Slice C）；新抽帧；Idle 五变体自动池回归；Dispatcher 之外的平行庆祝逻辑。

---

## 验收口径（产品）

1. 库存表 §九 中标 Slice B 的目录，至少各有一条可复现产品触发（含限频/冷却可测）。  
2. 完成 / 微仪式 / Honesty **从不**误入 Celebrating。  
3. Focusing / 叠层忙碌时生命感与问候 skip。  
4. 主路径 + 回流（二次进入 / 同日第二场）各一条。  

自动化：unit 锁加权边界（可用注入 RNG）+ 冷却；e2e 一条欢迎或 Honesty 长时长钩子即可（勿本地全量 e2e）。

---

## 排期口令

你点名「开工场景动画 Slice B」或「先修日语合十 A′」即可开独立 worktree。
