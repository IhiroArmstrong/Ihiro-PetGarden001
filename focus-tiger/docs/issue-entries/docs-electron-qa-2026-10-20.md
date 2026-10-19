---
ledger: Electron 测扇形菜单仍只有三个图标，疑未实现近期五组扇形
kind: note
status: 未跟进
updated: 2026-10-20
---

本回合只分析、落账，不改 `src/`。验收树已 `sync:qa-develop`，QA HEAD = `origin/develop` `8970c2dd`。用户测的是「最新 Electron 壳 APP」。

## 1:1 对应（用户【Bug】/ 主张）

| 用户原文 | 账本行 | 本回合动作 |
|---|---|---|
| 【Bug】扇形菜单还是以前三个 icons | 独立bug · 三图标 vs 五组 | 取 git 锚点；未改代码 |
| Help Center 安在问号右边 | 优化建议 | 记入口现状；须 Brief |
| 练习中间不要 inhale/exhale 语音 | 优化建议 | 锁定 `maybeSpeakBreathPhaseCue` 四处接线 |
| 【Bug】practice paper 应是彩色进度健康地图 | 独立bug · 口径冲突 | 对照方向锁；截图=已合第一刀 |

## 扇形：两套控件，不是一套没合进去

地面真相（`origin/develop` 含 `8665c2ac` / #1307）：

1. **右下指南针扇** `#home-sanctuary-nav-fan`：永远三叶 Home / Calendar / Collection。引入 #986 / #1150。账本已有「三钮是否该扩成整菜单」（2026-10-11，未跟进）。**不是**宽屏菜单三刀。
2. **底栏 `⋯` 五组扇** `#ft-wide-more-radial`：Practice / Records / Quiet gifts / You are not alone / Preferences。#1289+#1305+#1307 已合。打开条件：宽 ≥480px，且 `shouldDegenerateWideMenuRadialForButton` 为假（`innerHeight < 520` 或压到阿寅序列层则直接出手风琴列表，**不会**画出五个图标）。

用户说「只有以前的三个 icons」，与指南针扇的契约字面相同。在确认点的是 `⋯` 之前，**禁止**再开同内容第三刀 PR。

Electron 壳若未从 `8970c2dd` 重打包，也可能仍是旧二进制；与 QA 源码 tip 对齐不等于壳已重建。

## 练习纸：截图符合现行锁，不是漏做健康地图

[`PRACTICE_PAPER.md`](../PRACTICE_PAPER.md)：**不是**健康仪表盘 / ServiceMap / 红黄绿告警。第一刀一张 Sit & Breath 卡 + 一句节奏；「句子不带情感色」。#1353 已合。用户截图里的节奏句、Sit & Breath、1 days / Last time, 1 minutes、Hide this paper，与该刀一致。

若要彩色进度标记，须先书面推翻方向锁，再开新 Brief。不得把 T24 第一刀当漏实现来补健康盘。

## 还剩什么

- 用户确认：点的是底栏 `⋯` 还是右下指南针；壳是否从 `8970c2dd` 重打。
- T26 / T27 等 Brief 点头后再改运行时。
- T28 仅当 PO 书面推翻观察纸禁色禁分条款。
