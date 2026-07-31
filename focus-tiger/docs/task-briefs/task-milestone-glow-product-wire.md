# Task Brief · MilestoneGlow 正式产品路径接线

**日期**：2026-07-31  
**状态**：产品已拍板可接线 · **本 Brief 立项** · 实现另开分支（排在 Ambient ⑤⑥⑩ 自动化之后或并行，勿与对账填表 PR 混装）  
**角色**：Emotion / Session  
**权威**：`EMOTION_BIBLE.md` MilestoneGlow · `DESIGN.md` 三级反馈 · Backlog「纪念奖励系统」  
**拍板（2026-07-31 用户书面）**：长期里程碑仪式（金辉+蝴蝶）**本来就是产品需要**；正式产品路径**完全可以接线**——不再把「仅调试面板预览」当作终态。

---

## 一句话目标

在产品壳（非仅 `#emotion-debug-ui`）于约定里程碑节点触发一次 `MilestoneGlow`（`milestone-glow` @ 4 fps + 末帧停留），与每日 `Celebrating` 分工不叠加。

---

## 范围（建议首刀）

**做**：
1. 选定首批节点（建议与既有文案对齐：连续练习 **7 / 21 / 100** 天，或先只做 **7** 验证路径）。
2. 判定存储（只增不减、每节点只播一次）；冲突规则：与当日 Celebrating 同刻 → 只播 MilestoneGlow，庆祝戳仍记账。
3. 产品壳触发 `playEmotion('milestoneGlow')`；e2e 至少锁「节点达成 → 播一次 → 不再重复」。
4. 调试面板预览保留；4 fps + 末帧停留回归锁（可单测/manifest）。

**不做（可留纪念奖励大 Backlog）**：莲花池/香炉/蒲团刺绣等环境细节；3D 公仔柜。

---

## 已好清单

1. Celebrating / SessionComplete 日路径不退化。  
2. 金光互斥：播放期归零实时 Rim，播完回落。  
3. 不制造断签焦虑文案；中断不撤回已播里程碑。

---

## 建议分支

`feature/milestone-glow-product-wire` · 独立 worktree · 基线 `origin/develop` tip。
