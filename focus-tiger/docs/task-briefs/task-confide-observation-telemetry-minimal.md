# Task Brief · Confide 观察最小本地埋点(Batch 0 数据采集)

状态:implemented
关联:C2 Batch 0(PR #592 · chips)、`observation_honesty`桶审计(`confide-observation-honesty-bucket-audit.md`)

## 一句话

给 chip 点击和 Share 提交各加一行本地打点,沿用现有 `RetentionTelemetry` 的本地 `console.log`/本地文件追加模式,替代手动记表,用于回答"Kelly 句频次趋势"和"chip 有效引导率"这两个 Batch 0 观察指标。不建看板、不建服务器接口、不做聚合统计逻辑。

## 实现落点

- 模块:`src/core/confide/confideObservationTelemetry.js`
- UI 接线:`ConfideToYinUI` chip 点击 + `_showReply` Share
- Electron 落盘:`userData/companion-l2/confide-observation.jsonl`（IPC `desktop:confide-observation-append`）
- 渲染层环缓:`focus-tiger.confide-observation.v1` localStorage（最多 500 条）
- 汇总脚本:`npm run confide:dump-observation`（或 `node scripts/dump-confide-observation.js`）

## 背景

Batch 0(chips 引导)已合入 develop(PR #592),约定的观察协议需要两块数据:
1. Kelly 句(`observation_honesty`)触发频次趋势,及同期 `practice_facts`/`presence_facts` 触发频次是否同步上升。
2. Chip 有效引导率:点了 chip 且最终 Share 的句子确实是 chip 填入句的比例(不是裸点击率)。

## 范围声明(明确不做什么)

- 不建看板、不建聚合/统计逻辑——统计动作仍由人工看日志文件手工数,本任务只解决"抓取"不解决"分析"。
- 不新建服务器接口、不上云——本地 `console.log` + localStorage + Electron jsonl;不违反 Never-Cloud 清单。
- 不改 CI-04/05/06 或 `observation_honesty` 现有路由逻辑,纯附加打点。
- 不做用户可见 UI;无单独开关(RetentionTelemetry 同样无开关)。
- 不覆盖 `turns.jsonl` 已有逻辑。

## 验收标准

- [x] 点击 chip → `confide_chip_tapped`
- [x] Share 成功展示回复 → `confide_share` + `dataSource` + `matchedChipId`
- [x] 不记录用户自由文本
- [x] `test:smoke` 不受影响
- [x] `npm run confide:dump-observation` 可读本地记录
