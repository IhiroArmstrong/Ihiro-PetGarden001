# Task Brief · Quiet Line / 今日静语句包 overlay

> **状态（2026-09-02）**：口令已给 · **本 Brief 无运行时**。父概念 `ANTI_PLAGIARISM_LAYER.md` §5 序 1。  
> **开工运行时**须另开 `feature/quiet-line-copy-overlay`（禁止与本概念 PR 混修；禁止与品味层开机预取错峰混修）。  
> **权威**：本 Brief = 执行层；准入四问见防剽窃层 SSOT。

## 一句话

可选拉取云端 **Quiet Line 混合池**（经典 `DAILY_ZEN_QUOTE` ∪ 洞察 `DAILY_ZEN_QUOTE_INSIGHT`）；识别不了则干净降级本机 locale 池。开卡 / Save image **永远读本机已解析的当日句**，不得等网。

## 已拍板

1. 与 Daily Wisdom **分池**（Reflection 底日签 ≠ 菜单今日静语）。  
2. 同日锁 `focus-tiger.daily-zen-quote-pool-v2.v1` 语义不变。  
3. 不改明信片布局、品牌 footer、Journey 洞察 `◦`。  
4. **禁止**新开一条开机 `fetch`：并进现有品味层预取（精灵预加载 + 欢迎/Idle 之后），或同一 `prefetchTasteLayer` 增加字段。  
5. 扩 key / 改形须升品味层或本切片 `schemaVersion`，并同步本地兜底。

## 冲突扫描

对照 `SCENARIO_TESTS` Quiet Line / Daily Wisdom / Arrival 叠化 / Idle 呼吸。

| 轴 | 结论 |
|---|---|
| **a. 强度** | 无新点击；失败用本地池；不比 Sit 重 |
| **b. 语气** | 句仍观察式；禁止教练句混进洞察种子 |
| **c. 职责** | ≠ 日签 14 条；≠ YPE Pack；≠ Confide 语料 |

**无冲突。** `RB-20260820-L330`：与本地冻结表相同则不另存 overlay 副本。

## 点击反馈

Q1–Q2：**不涉及可点击交互**（后台 overlay）。点 A Quiet Line 仍 0–1 秒开卡，用已缓存或本地句。

## 后台网络三问（运行时 PR 必须照做）

1. **Q1 时机**：禁止与 `spritePlayer.preload` / Arrival / Honesty CapCut / 首段 Idle 呼吸抢窗。并进已错峰的品味层预取槽。  
2. **Q2 写盘**：句包 JSON 相同 → 只记 cloud-ok，不 `setItem` 新副本。当日锁 key 未变则不重写。  
3. **Q3 慢网**：失败不得挡 Sit / 开卡；须低速网看 Idle 呼吸与开卡淡入（TRACKER 人工）。

## 实现时必守

- 本地混合池 = 降级真源。  
- `?tasteLayer=0` 同时关掉本 overlay（同一品味开关）。  
- 生产须用户说「部署」才 Redeploy。  
- 单测：未知 schema → 本地；非空非法 key → 丢 overlay。

## 不做

- 日签 14→N  
- 伸懒腰 / 好奇权重  
- YPE Pack / Confide 路由  
- 开机预取错峰（另一 Brief）
