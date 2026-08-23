# Task Brief · 品味层开机预取错峰（含软更新探测）

> **状态（2026-08-22）**：已立项，**未开工**。须口令。  
> **权威**：`BACKGROUND_NETWORK.md` 触点 4。Quiet Line 云端句包 **未接线**，不在本任务改产品句。  
> **口令**：「开工品味层开机预取错峰」

## 一句话

把 `prefetchTasteLayer`（及同窗的 `/version.json` 软更新探测）排到精灵预加载与首段 Idle 呼吸窗口之后；失败仍降级本地表。

## 已拍板（审计结论）

1. `init()` 里预取发生在 `poseManager.preload` / `spritePlayer.preload` **之前**。  
2. overlay 只进内存，不写 localStorage（Q2 已过）。  
3. 无低速网下首屏 / 首段 Idle 流畅度记录。  
4. Quiet Line 云端 overlay 仍是下一刀；本任务**禁止**接线句包。

## 要做（口令后才改代码）

1. **Q1**：预取与 `version.json` 等到预加载结束、且不与 Arrival / Honesty / Reflection 叠化重叠。切语言再拉可保留，但仍须避开进行中的转场。  
2. **Q2**：继续不把 overlay 当无条件 localStorage 副本；若日后落盘须 cloud-ok + 同内容跳过。  
3. **Q3**：低速网络下看 loading → 首段 Idle，不得只测 2.5s 超时是否返回。  
4. `?tasteLayer=0`、失败用本地表、不挡 Sit — 已好清单，禁止改坏。

## 不做

- 不开 Quiet Line 云端 overlay（见 `task-cloud-taste-layer.md` 下一刀 + 本门禁三问）。  
- 不改冻结权重数字、不改 HonestyCheckInController。

## 冲突扫描（立项时）

对照 Idle 不闪 / Rise 再选 / Honesty 关了再开。本修复只挪开机请求，不改 Dispatcher 池形。
