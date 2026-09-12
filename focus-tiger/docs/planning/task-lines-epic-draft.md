# Focus Tiger 开发任务线 — Epic Issue 建库草案

> 本文件是"线名 → Epic Issue 内容"的初稿。**用途**：人工核定/修改后，交给 Cursor 按本文件循环执行 `gh issue create`，一次性把所有线建成 GitHub Epic Issue，再挂进 Project 看板。
>
> **2026-09-07 已拍板**：#11 与「金句库逐步接线」合并；#8/#16 只保留一条 Personalization Engine；#14 / #22 已补概述。
> **2026-09-07 关系修订**：Epic 级默认并行；GitHub 原生 `blocked by` 宁缺毋滥（见下节）。原表把「读同一事件 / 共用标签」误写成整线串行，已改掉。

## 关系怎么设才对（最佳默认）

四种关系**不要混用**。Epic 是长命容器，几乎永远不会「整线完结」，所以：

| 类型 | 用在哪一层 | GitHub 怎么设 | 何时才用 |
|---|---|---|---|
| **并行（默认）** | Epic ↔ Epic | **不设**依赖 | 两条线能同时开工、互不等「对方整线结束」 |
| **串行 `blocks`** | **子 Issue / 切片**，几乎不要挂在 Epic 上 | 原生 blocked by | 没有对方的 SSOT 或基建，**这一刀代码写不出来** |
| **逻辑先后（排期）** | 看板列 / Epic 备注「建议顺序」 | **不设**原生依赖 | 先修账本口径再加新奖励，但后一条仍可设计文档、修无关 bug |
| **耦合 `coupled`** | Epic 正文互链 | 不阻塞 | 改同一 store / 同一 overlay / 同一完成钩，改前打开对方 Epic 看一眼 |
| **兼容 `compat`** | Epic 正文 + PR review | 不阻塞 | 数字一致、Moment 标签一致、en+ja、定价文案一致；排期阶段不管 |

**最佳设置（推荐）**

1. **Epic 之间默认全部并行**，正文只填耦合 / 兼容名单。
2. **GitHub 原生依赖只打在子 Issue**：例如「Ritual 分享到 Circle」blocked by「Circle 见证可发帖」；不要让整个 `#2` blocked by 整个 `#3`。
3. **逻辑先后写进备注，不写进 blocked by**：例如累计时长口径修完再扩寅币「按时长发点」切片；莲花 Slice B 仍可并行画图。
4. **#15 i18n、#20 美术对全表都是兼容**，永不 blocks。

整线 `blocks` 的危害：`#1` `#13` `#4` 都是活基线，一旦被写成「必须等它完成」，下游看板会永久假死。

### 本表唯一建议做成「真先后」的边（仍优先打在子 Issue）

```text
冷启动第一幕审计（表外短线）  --blocks-->  #12 Onboarding 目标问答
#3 Circle 可分享基建（切片）   --blocks-->  #2 的「分享至 Circle」切片（自定义 Ritual 仍并行）
#22 的 1C validation 通过      --blocks-->  若将来立项 1C shipping（现在不建 shipping Epic）
#1 完成事件/累计时长口径修好   --排期先后-->  #6 / #14 里「按分钟发点 / 开花」的新切片（文档与无关修复仍并行）
```

**不要**设的边（原表有、已否决）：

- `#8` 整线等 `#12` / `#17`：YPE 本地层已在跑；目标问答现状是「方向采纳、现在不实现」；导入导出已有练习备份，画像进包是后续耦合。
- `#4` 整线挡住一切付费门槛：层级矩阵已有，新付费切片对齐矩阵即可，不整线等待。
- `#9` 与 `#8` 耦合算法：Operating ≠ Yin ≠ YPE，只是以后可能打进同一 DMG。
- `#7` 与金句 / Reset / Confide 整线耦合：Five Moments 是已有分桶名，其它线 **兼容标签** 即可，禁止本线去认领别人的功能。
- `#22` blocked by 整个 `#13`：验收轨挂在倾诉线下；1A/1B 已合入、等人测。整线互 block 会死锁。

### 排期波次（逻辑先后，不是 GitHub blocks）

- **随时可并行**：#3、#4、#5（除最后打包）、#7（范围收窄后）、#8 本地算法、#10、#11、#13 日常、#14 Slice B、#15、#17 扩白名单、#18、#19、#20、#21 overlay 队列。
- **先收口再解禁**：第一幕审计 → 才允许 `#12` 开工口令。
- **发布收口对齐（同一周核对，不互相等完工）**：#5 打 DMG 时对齐 #9 是否打进包、#4 官网收款文案、#19 下载入口。

## Epic Issue 正文模板（Cursor 循环渲染用）

```
## 线概述
{一句话描述这条线要做什么}

## 状态
{待细化 / 进行中 / 阻塞 / 完结}

## 关系
- 串行依赖（必须等它完成）：{默认「无」；仅表内标明的子切片例外}
- 被谁依赖（它完成前，谁不能收尾）：{默认「无」}
- 耦合（共享代码/状态，改动前互相检查）：{列表或「无」}
- 兼容约束（结果需保持一致，不阻塞）：{列表或「无」}
- 排期建议（逻辑先后，非 GitHub blocks）：{一句或「无」}

## 已知子任务/PR
{留空，后续人工或Cursor盘点后补充关联的Issue/PR}

## 备注
{留空}
```

## 线一览表

| # | 线名（slug） | Epic 级关系（修订后） | 备注 |
|---|---|---|---|
| 1 | Sit & Breath & Honesty 基础练习（`core-practice`） | **并行**活基线。**耦合** #6 #14 #18（同一完成钩 / 分钟账本）。**不**被整线 blocks。 | 优先修「累计时长口径」漏洞（排期先后，非 GitHub block）。 |
| 2 | Rituals + 自定义 Ritual + 分享至 Circle（`rituals-custom-share`） | **并行**：自定义 Ritual ↔ #1。**仅分享切片**串行依赖 #3 的可分享基建。耦合 #1（完成仪式事件）。 | 建议分享做子 Issue，不要让整个 Epic blocked by #3。 |
| 3 | Social & Circle（`social-circle`） | **并行**。被 #2 分享切片依赖。刀2 Witness/2c/2d 挂本线。 | |
| 4 | Support Yin & Stripe 支付完善/付费层级管理（`monetization-tiers`） | **并行**。其它带付费感知的线 **兼容** 本线矩阵（SKU/文案），不整线等待。**耦合** #5（官网/壳收款收口）。 | 禁止「任何付费门槛都 blocked by 本 Epic」。 |
| 5 | 苹果 DMG 发布准备（`mac-dmg-release`） | **并行**到打包周。**耦合** #9（是否打进模型）、#4（收款）、**#21**（客户端防随手抄）。**兼容** #19（下载入口）。 | 不 blocks #9 开工。**子切片**：**官网 DMG 自动更新器**（P0，挡第一份收费包；Brief `task-electron-desktop-updater.md`）· **V8 字节码编译**（bytenode，后于更新器）— Electron + DMG 后源码仍在 `app.asar`（非加密；`asar extract` 可原样解压）；若加门槛，V8 字节码是性价比合理选项；**不建议**为 score/徽章/纪念印公式上 C++/Rust 原生模块。 |
| 6 | Focus Coin & Collections（`focus-coin-collections`） | **耦合** #1（发点来源）。**耦合** #14（花园 vs 珍藏空间，已切开）。**兼容** #18（数字对得上即可）。 | 新「按时长发点」切片建议等 #1 口径；商店/清供可并行。 |
| 7 | Five Moments 场景功能扩充（`five-moments-expansion`） | **兼容** #10 #11 #13（共用 Arrive/Focus/Recover/… 标签）。**禁止**整线耦合、禁止本线认领金句/Reset/倾诉实现。 | 范围=分类框架扩展；具体功能归各产品线。 |
| 8 | Yin's Personalization Engine 算法层（`personalization-engine`） | **并行**本地 L0/L1。**耦合** #21（云端秘密变换归防剽窃，本线只管信号/Pack 形状）。**兼容** #12（问答若将来做，只是可选输入）。**兼容** #17（画像是否进备份包，分切片谈）。**不**耦合 #9。 | 算法/信号 ≠ YPE 云闭包 ≠ Qwen ≠ Operating。**防剽窃收口**：YPE V2 真保护须 insight 被 Confide 真实消费 + 现网阈值 ≠ git 验收锚 + 「部署」——见 `ANTI_PLAGIARISM_LAYER.md` §3.2.2 C。 |
| 9 | Local AI Operating 层（`local-ai-operating`） | **并行**（现仅方向锁）。**兼容** #13（可共用本机模型文件，入口禁止混成「阿寅就是操作系统」）。**耦合** #5（打包进壳）。与 #8 **并行**。 | 1C 实验室环境可借用本机模型，不等于本线必须先完结。 |
| 10 | Ground Exercise & Reset and Return（`reset-return`） | **并行**。**兼容** #13（overwhelmed 引流是可选出口，不挡 MVP）。**兼容** #7（Recover 桶名）。**耦合** #11（Recover 槽若挂行动句）。 | MVP 已拍板，可直接写进备注。 |
| 11 | 金句库/三池 + 逐步接线（`wisdom-pools`） | **并行**。**耦合** #21（Quiet Line overlay）。**兼容** #7（Moment 分桶）。与 #13 **并行且分池**（禁止倾诉语料当金句菜单）。 | 内容入库 + overlay 槽 + 挂到界面；不另开接线 Epic。**防剽窃收口**：Quiet Line 其余键逐键部署分叉（overlay 已就绪）；Calm Action 70 须 runtime Layer C 关单后再谈 overlay——见 §3.2.2 C / C′。 |
| 12 | Onboarding 提问（`onboarding-goal-questions`） | **真串行**：blocked by **表外**「冷启动第一幕审计」收口。与 #8 **不**互 blocks。 | 现状：方向采纳、现在不实现。解禁口令另说。建议审计做短 Epic 或挂本线前置子 Issue。 |
| 13 | Confide 与 AI 仪式应用（`confide-ai-ritual`） | **并行**活基线。**耦合** #21（句库 overlay）。**兼容** #9 #10。#22 是本线验收轨，**不**互设 Epic blocks。 | 工作量最大；正文链已有 task-briefs。**防剽窃收口**：句库除已分叉 EN 外，其余键 + ja/zh/corpus 逐键部署分叉；YPE insight 消费路径到位后 V2 闭包才算熟——见 §3.2.2 C。 |
| 14 | Yin Evolution（`yin-evolution`） | **耦合** #1（终身分钟）。**耦合** #6（空间切开）。**耦合** #18（P0 记忆表面在 Journey）。**兼容** #20。 | **意义层**（SSOT `YIN_EVOLUTION.md`）。莲花池 Slice A = Visible Growth（已接线）；Slice B 金环仍属本线、非 P0。禁止再造第二座池、禁止改 scoreFormula。 |
| 15 | 多语言（`i18n`） | **兼容约束（全局）**：凡用户可见文案的线都要对它兼容；**永不** blocks。 | 只 claim en+ja，zh 为草稿。 |
| 16 | ~~Personalization Engine~~ | — | **已并入 #8**，不建 Epic。 |
| 17 | 本地数据导入导出（`local-data-import-export`） | **并行**（P0 已有）。扩白名单时 **耦合** #18；若纳入 YPE/记忆则 **耦合** 对应线。不 blocks #8。 | |
| 18 | Journey Log（`journey-log`） | **耦合** #1（写入钩）。**兼容** #6 #8 #22（1B 读数须对列表）。**耦合** #17（在备份白名单里）。**耦合** #14（P0 Come Back + 六条记忆落本线表面，不合并 Epic）。 | 练习留痕仍本线；关系叙事原则在 #14。 |
| 19 | 市场官网（`marketing-site`） | **并行**。发布周 **兼容** #4 定价、#5 下载链。 | |
| 20 | 美术优化（`art-polish`） | **兼容约束（全局 UI）**；不阻塞。 | |
| 21 | 防剽窃层（`anti-plagiarism-layer`） | **耦合** #8 #11 #13（分 PR overlay，不整线互相等完）、**#5**（Electron 打包后客户端源码保护 · V8 字节码编译）。 | 正文链 `ANTI_PLAGIARISM_LAYER.md`。**不单独排期**：§3.2.2 C 挂主线前置；权重分叉等 D3 冻结；真保护 = 现网 ≠ 冻表（尺子，不是第 22 条产品线）。客户端打包见 §7（与云 overlay 正交）。 |
| 22 | Local AI Phase 1A/1B/1C 验收（`phase1-a-b-c-testing`） | **挂在 #13 下的验收轨**，Epic 级并行于其它产品线。**兼容** #18（1B 数字）。1C 只用实验室环境，**不** blocks #9。 | 1B 问练习/到场；1A 口头出示记忆；1C 第二面镜子 validation≠上线。≠ 记忆切片 1a/1b/1c。 |

## 已拍板

1. #11 与「金句库逐步接线」同一条。
2. Personalization Engine 只保留 #8。
3. #14 / #22 概述已写入。
4. **关系默认**：Epic 并行 + 正文耦合/兼容；原生 blocks 只打子切片；逻辑先后写备注。
