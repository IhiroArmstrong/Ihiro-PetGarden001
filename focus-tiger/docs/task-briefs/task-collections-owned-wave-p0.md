# Task Brief · Collections P0 — 挥手 unblur + 已结缘分组

> **状态**：**开工 P0**（`feature/collections-owned-wave-p0`）  
> **分支**：`feature/collections-owned-wave-p0`（**禁止**混入 `feature/cold-start-goal-onboarding`）  
> **视觉 SSOT**：`SANCTUARY_UI_ART_DIRECTION.md` D.4 · D.5  
> **铁律**：`FOCUS_COINS.md` §1.1 — 香炉/清供只在卡面，不上主坐席、不叠序列帧

## 目标

1. **A · 挥手 blur 渐退**：Collections 底栏「请阿寅挥挥手」成功时，全屏遮罩 blur 渐退，阿寅挥手在面板外可见（回应 TRACKER「寅币 · 珍藏挥手点播」图1）。  
2. **B · 已结缘卡片 P0**：`#yin-coin-panel` 列表按「案上陪伴 / 静候结缘」分组；已结缘行暖底 + 朱印，与未结缘 shop 行视觉区分（回应图2「像没买到」）。

## 不在本批

- 四页签壳（`task-yin-collections-four-tabs.md`）  
- 案头专区 / 烟缕 / P1 详情卡（须 P0 人工看过后再 Brief）  
- 香炉定制插画 vs AI 素材（设计师并行；素材 follow-up commit）  
- P1 结缘记忆：倾向并入 Journey Log「结缘时刻」（已拍板方向，本批不实现）

## A · 挥手 unblur

| 项 | 口径 |
|---|---|
| 触发 | `playCollectionsWaveHello()` 返回 `ok` |
| 机制 | `body.ft-yin-coin-wave-focus`；`#yin-coin-panel-backdrop.is-visible` → `blur(0)` + 背景 rgba 略降 |
| 清除 | `EmotionController` `onComplete` **或** 面板 `close()` |
| 禁止 | 移动 Yin、改 PNG、把挥手 SKU 加回 shop 行（D.5 / A.6） |

## B · 已结缘分组

| 项 | 口径 |
|---|---|
| 分区 | `[案上陪伴]` owned · `[静候结缘]` 未 owned |
| owned 行 | 暖底 + 朱印「已结缘」；隐藏 gap 句；price 主视觉隐藏，可留小字 `{n} 枚` 纪念 |
| thumb | 有 `thumbSrc` 用 `<img>`；无则 owned=gold 渐变 / locked=stone |
| i18n | `YIN_COIN_SECTION_OBTAINED` / `YIN_COIN_SECTION_PENDING`（en/zh/ja） |
| 禁止 | 与 `collection-shelf.js`（Backlog 纪念柜）混用 |

## 点击反馈（PR 三问）

1. **0–1s**：挥手成功 → 遮罩 blur 渐退 + 阿寅 `wave-hello`；结缘仍按压 + 余额变化或缺口 toast。  
2. **静默**：Focusing 中挥手 → toast「阿寅正在坐着…」（既有）。  
3. **冲突**：对照 Collections / 挥手点播场景；强度不高于 Celebrating；**无冲突**。

## 测试

- 单元：`overlayBackdrop` wave-focus class · `focusCoinsSurface` sections · `FocusCoinsPanelUI` 分区/owned 样式契约  
- 冒烟：`npm run test:smoke` + `test:e2e:smoke`  
- 人工：`?product=1` → Collections → 挥手可见；已结缘与未结缘分区可读

## TEST_TRACKER

见 `docs/tracker-entries/feature-collections-owned-wave-p0.md`。
