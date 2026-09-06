# Task Brief · 纪念印目录化（Memorial Seal Directory）

> 状态：**实现中** · `feature/memorial-seal-directory`  
> 前置：`docs/CONTEMPLATIVE_ARCHIVE.md`（#603 内容锁 + 12 条候选表）  
> 关联：现网《芥子须弥》三 case Brief `task-mustard-seed-seal.md`（行为不变）

## 背景

现有 Memorial Seal（芥子须弥三首）以三个写死对象实现，门槛统一 score ≥ 21。候选表已定稿 12 条待扩容内容；若继续「一印一开发」，工程侧会滚雪球。

## 目标

把纪念印从「写死三首」改造为「可配置目录」：新增一条纪念印仅需追加一条配置记录，无需改动触发/展示逻辑代码。

## 范围

- 只重构触发判断与数据读取方式。
- **不改**现有三首的门槛值、文案、翻译、badge、动画、音效——重构后现网行为必须与重构前逐字节等价。
- **不在本任务书内**决定候选表里其余内容何时上线、门槛多少（排期决定，另走口令）。

## 契约

| 项 | 口径 |
|---|---|
| 配置 SSOT | `src/core/memorialSealDirectory.js`（机器可读）；内容规范仍看 `CONTEMPLATIVE_ARCHIVE.md` |
| 条目字段 | `id`, `sealSceneId`, `scoreThreshold`, `poemZh`/`poemJa`, `poemEn`, `attributionZh`/`attributionEn`, `badgeDir`, `badgeAsset`, `toneTag`, `enabled` |
| 芥子须弥场景 | `sealSceneId = mustard-seed-sumeru`；三首 `enabled: true`，`scoreThreshold: 21` |
| 占位 | CA-01 古池 `enabled: false`，`scoreThreshold: 30`；不进现网菜单/仪式 |
| 触发 | 遍历目录：`enabled && score >= scoreThreshold && 未揭示` 的第一条（芥子场景内） |
| 持久化 | 不变：`focus-tiger.mustard-seed-seal.v1` |
| 调试 | `__mustardSeedSeal` API 不变 |

## 明确不做

- 不在本 PR 决定 12 条候选的实际门槛与上线顺序。
- 不做成就墙、不做纪念印列表页。
- 不改现有三首中英文措辞。
- 古池真正上线（`enabled: true` + 新 UI 表面）另走口令。

## 测试

- 单元：`memorialSealDirectory.test.js` + 既有 `mustardSeedSeal.test.js`
- e2e：`e2e/mustard-seed-seal.spec.js`（三 case 文案快照）
- 门禁：`npm run test:smoke`

## 排期层（非任务书）

哪条候选先做第 2 枚印、门槛 30 还是 60——写进 `CONTEMPLATIVE_ARCHIVE.md` 候选表「状态」列 + backlog；口令临时开工，不必逐条立项。
