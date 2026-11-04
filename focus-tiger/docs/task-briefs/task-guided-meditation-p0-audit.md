# Task Brief：语音+文案引导正念冥想（Guided Meditation）P0 只读审计

> 状态：**P0 审计已交稿（2026-11-04）** · **§7 已由 PO 拍板（2026-11-04 汇总）** · 范围：只读审计 + 文档，**不写运行时代码**  
> 对照表：[`guided-meditation-p0-audit.md`](../guided-meditation-p0-audit.md)  
> 内容规格：[`guided-meditation-p0-content-spec.md`](../guided-meditation-p0-content-spec.md)  
> P1 草稿：[`task-guided-meditation-mvp.md`](./task-guided-meditation-mvp.md)  
> 姊妹篇（媒体交付）：[`task-guided-meditation-media-delivery.md`](./task-guided-meditation-media-delivery.md) · [`guided-meditation-media-delivery-audit.md`](../guided-meditation-media-delivery-audit.md)  
> 开工口令：`开工引导冥想P0审计` · MVP：`按引导冥想 MVP Brief 开工`（**未点头不执行**）

---

## 0. 大白话总结（给 PO）

产品里要加「跟着你的原创声音（和画面）做引导冥想」：菜单里一项，点课再拉云端影片，Web 边下边播。练习分钟要进和静坐、呼吸同一本账，但不能和「无引导同坐」/help 文案打架。

P0 只查不改。体积与下载看姊妹篇；本 Brief 管播放器、计入、叠层、入口。媒体 §7 与主 §7 均已拍板。

---

## 1. 背景与目标

- 现状：Idle/CapCut 配乐、Sit、Breath、Ground、Arrival；T76 冷启动第 1 项已是 **10 分钟无引导直坐**。
- 定位：**Guided Meditation** 与静坐/呼吸/接地并列；不并入 Recover；不做「系统在猜你心情」叙事。
- 目标：P1 MVP 依据 + 与 [`practice-aggregate-registry.md`](../practice-aggregate-registry.md) 对齐的计入语义。

## 2. 本轮不做（硬边界）

- 不写运行时代码、不改 locale、不改菜单/四选卡、不加 `COLD_START_GOAL_OPTIONS_VERSION`。
- **冷启动第五项不做**（PO 2026-11-04）。以后若做，倾向在第 1 项选完后二级选「无引导直坐 / 有声引导 3 分钟」——**第一幕审计收口后再评估**。
- 倾诉/练习备份不上云；**课程媒体**走姊妹篇 R2，不进安装包、不进 Git。
- 不宣称疗效；对外 **MVP 先只上英文课**（课卡标语言）；ja 母版以后补。
- **成片配乐 App 内授权核实前不上传 R2**（姊妹篇 H7）。

## 3. 审计项

### A. 播放器能力

见 [`guided-meditation-p0-audit.md`](../guided-meditation-p0-audit.md) §A。视频课默认 `<video>` + 合轨 AAC；cue 文案高亮；不复用系统 TTS 当课。

### B. 音频体积与加载

**不在此重复审计。** SSOT：

- [`task-guided-meditation-media-delivery.md`](./task-guided-meditation-media-delivery.md) §7  
- [`guided-meditation-media-delivery-audit.md`](../guided-meditation-media-delivery-audit.md) H1–H5、H8  
- [`guided-meditation-media-delivery-spec.md`](../guided-meditation-media-delivery-spec.md)

摘要：课免费；默认播视频；Web 流式；点课才下；R2 公开桶；无后台预下载；纯音频仅退路。

### C. 计入练习

见对照表 §C。PO 完成规则见 §7 与本 Brief 下方「计入语义」。

### D–G

见对照表 §D–G 与 [`guided-meditation-p0-content-spec.md`](../guided-meditation-p0-content-spec.md)。

## 4. 产出物

1. `guided-meditation-p0-audit.md`（A–G；B 引用姊妹篇）  
2. `task-guided-meditation-mvp.md`  
3. `guided-meditation-p0-content-spec.md`  
4. `PROCESS.md` 速览（与媒体交付合并一条）

## 5. 约束与红线

- 只读 + 文档；未核实写「未核实/需实测」。  
- **上线前必改（P1 硬门禁）**：Help/KB **EDU-0003** 等现写「Sit with Yin … **no voice guidance**」须与「另有带声音的引导课」并存，禁止前后矛盾。锚点：`help-center.json` · `productKnowledgeCatalog.json` · `SCENARIO_TESTS` 问卡 alias · e2e `help-center-quiet-sit-aliases.spec.js`。

## 6. 验收

- A–G 有结论或未核实；B 用姊妹篇引用交差。  
- 计入规则已与 `practice-aggregate-registry.md` 对照写清。  
- diff 仅 docs（媒体 PR 另含 `/*.mp4` gitignore）。

## 7. PO 拍板（2026-11-04 汇总）

| 题 | 决定 |
|---|---|
| 入口 | 更多菜单 **Guided Meditation**，在 **Ground exercise 下方** |
| 语音 | **优先成片原声**（第一课 MP4）；TTS **仅**以后补短课备选 |
| 首批课 | **22 分钟长片先上**；**优先**从母版剪 **3–5 分钟入门**（比长片更重要）；10 分钟课非 MVP 硬门槛 |
| 计入 | **短课（≤10 分标称）**：播到 **≥90%** 或收尾段确认结束 → 记入**标称分钟**。**长课（>10 分）**：**实际播放 ≥3 分钟**起，按**实际整分钟**写入 `onPracticeDay` / 莲花；不足 3 分钟不计练习日。须登记 `guided-meditation` 进 `PRACTICE_BASELINE_SOURCE_IDS`（见对照表 §C2） |
| 冷启动第五项 | **不做**；以后二级选留 P2+ |
| 语言 | **先英文**；课卡标 `English`；无 ja 母版不宣称 ja 课 |
| 默认播放 | **视频**（姊妹篇）；Web **边下边播** |
| 授权 / 上传 | **先核实**配乐与 App 内分发；**核实后再上传** |

媒体交付（托管、缓存、免费、预下载）见姊妹篇 §7，不重复。

## 8. 计入语义（对照聚合注册表）

写入侧 SSOT：`main.js` `onPracticeDay({ durationMinutes, sourceId })` → `PracticeDaysStore` + `LotusPondStore.notePracticeMinutes`（[`practice-aggregate-registry.md`](../practice-aggregate-registry.md) §Baseline）。

| PO 规则 | 聚合语义 |
|---|---|
| 长课 ≥3 分钟实际播放 | `durationMinutes = floor(实际播放秒/60)`，**不是** 22 分钟标称；仍 `sourceId: 'guided-meditation'` |
| 短课 ≥90% | `durationMinutes = 标称课时长`（3/5/10） |
| 未达阈值 | **不**调用 `onPracticeDay`；不亮练习日 |
| 读取侧 | 登记基线源后，Confide `practice_facts` / 徽章 `score` / 印 经 `resolvePracticeAggregate()` 自动含新分钟与日 |

Journey 行：建议完成且过 Reflection/轻确认后写入（对齐 Sit/Breath），文案为「引导冥想」非 Sit。

## 9. 排期草案

| 阶段 | 内容 |
|---|---|
| P0 | 本 Brief + 姊妹篇媒体审计（**合并 PR #1558**） |
| P0.5 | 母版剪辑 3–5 分 + cue 稿；授权核实；**不上传直至授权 OK** |
| P1 | 菜单 + 列表 + 播放 + 点课下载/流式 + 计入 + 仲裁 + **Help/KB 改口** + e2e |
| P2+ | 冷启动二级选（第一幕审计后）；ja 课；TTS 补短课 |
