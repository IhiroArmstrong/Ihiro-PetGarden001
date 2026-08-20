# Task Brief · Support Modal 未练习请茶优先

> **状态（2026-08-20）**：产品已拍板商业排序；本 Brief 是工程切片。  
> **触发**：冷启动体验建议 3 + 分析师稿；落地取 **Agent 最合理项 ∪ 分析师合理约束**。  
> **分支**：`cursor/support-modal-tea-first-8475`

## 已好清单（保护面）

- 三卡始终完整可见、可点；价格 $89.99 / $6.99/月 / $4.99 与 CTA / Maybe later / FAB 显隐 **不变**。
- Tea **不**解锁内容；Sanctuary ↔ tip **零耦合**。
- 场景化请茶气泡 `#contextual-tea-tip-bubble` **本切片不改**（达标后出；与「打开 Modal 前请茶排前」时间错开）。
- **禁止**写入 `spriteChannelArbitration` / EmotionController / 会话门闩。
- 未达标 Rise **不得**把排序切回 Sanctuary 优先。

## 产品规则（已拍板）

| 项 | 口径 |
|---|---|
| **未记录过任何一次完成** | Modal 顺序 = **Tea → Sanctuary → Membership**；**Suggested** 暂时挂在 **Tea**（降低 $89 抢戏；不是藏卡、不降 B 轨可点性） |
| **已完成过至少一次** | 恢复现状：**Sanctuary → Membership → Tea**；Suggested 回 Sanctuary。**永久**，不因久别掉回请茶优先 |
| **什么算完成** | 计时达标 Focus **或** Honesty 补登成功 **或** Breath / 微仪式完成（不论时长）。与现有 `markToday` + 莲花分钟 **同一钩** |
| **不算完成** | 未达标 Rise；只打开 App；只打开 Support |
| **不做** | 连胜 / 45 分钟门槛；藏卡；灰卡；改定价或推销文案；新 localStorage key；改请茶气泡；精灵通道 |

## 完成态（复用，不新开标准）

**不要**用 `DailyCompletionStore`（只留当天）或 `hasEndedAnySession`（内存；未达标 Rise 也会置位）。

判断：

```
shouldLeadSupportModalWithTea({
  lifetimeMinutes: lotusPondStore.getLifetimeMinutes(),
  practicedDayCount: practiceDaysStore.getPracticedDateKeys().length
}) === true   // 两者都空 / 都为 0
```

并上两份账：同一完成钩写入；练习备份 v1 能带回 `practice-days`、莲花池不在六 key 白名单。

QA：`?qaSeedStreak=` / `?qaLotusBlooms=` 会使请茶优先 **关闭**（视为已练）。测请茶优先须清这两 key 或 DEV 重置。

## 冲突扫描（场景 Q / 请茶气泡 / 双轨）

- **强度**：打开 FAB 仍是 0–1s 展开 Modal；只改卡序与 Suggested 宿主。不比现路径更重。
- **语气**：不新增推销句；Suggested 仍用现 `SUPPORT_SANCTUARY_BADGE`（Suggested / 推荐 / おすすめ）。
- **职责**：与场景化请茶时间错开（打开前 vs 达标后），不关气泡。双轨仍三卡都在。

## 明确不做

- 不改 Support 其它交互、不改 Checkout。
- 不把 Suggested 做成两枚同时出现。
- 不把本切片做成 A/B 远程开关。
