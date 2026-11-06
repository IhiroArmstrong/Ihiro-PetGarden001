# 审计背景索引（2026-11-06）

这份文件只做索引和范围说明。产品结论以链接指向的原文为准。审计会话先读本页，再按任务去读原文，不要把「仓库全部源码和全部 docs」一次读进上下文。

## 这次在审什么

- **对外名字**：Samatia。三语都用这一个拉丁拼写。阿寅仍是那只小老虎。
- **对内名字**：仓库、代码路径、多数开发文档仍是 Focus Tiger。
- **这次审计的定位**：建立第一份基线，不是发布审批。公开主域、商标和对外改口仍有单独闸门，见下方「还没当成已发布」。

## 产品边界（审计时不要另起一套定位）

| 要记住的事 | 去读 |
|---|---|
| 为什么做、品牌、用户可见名 | [PRODUCT_POSITIONING.md](../PRODUCT_POSITIONING.md) |
| 面向谁、不面向谁、成功怎么算、隐私与付费假设 | [MVP_PRODUCT_DEFINITION.md](../MVP_PRODUCT_DEFINITION.md) |
| 儿童、临床用户、企业员工管理 **不是** 当前目标。应用要声明：这是专注 / 正念练习，不是诊疗 | 同上，次要用户与 Wellness 免责 |
| 竞争替代是 **六类做法**，不是一张具名 App 清单：普通计时器、专注与屏蔽工具、习惯与待办、冥想应用、虚拟宠物与游戏化、用户自己的方法。差异化仍是 **待验证假设** | 同上，「竞争替代品」 |
| 手机浏览器不是首要平台；首要是笔记本上的练习 | [RESPONSIVE_LAYOUT.md](../RESPONSIVE_LAYOUT.md) |

## 工程上已经有的尺子（审「还在不在生效」，不要从零重做一套）

| 主题 | 去读 |
|---|---|
| 产品原则与架构硬约束 | [PRINCIPLES.md](../PRINCIPLES.md)、[ARCHITECTURE.md](../ARCHITECTURE.md) |
| 分支、PR、任务怎么收尾 | 仓库根 [WORKFLOW.md](../../../WORKFLOW.md)、[PROCESS.md](../PROCESS.md) |
| 任务与验收记录 | [TASKS.md](../TASKS.md)、[TEST_TRACKER.md](../TEST_TRACKER.md) |
| 场景是否互相打架 | [SCENARIO_TESTS.md](../SCENARIO_TESTS.md)、[FEATURE_CONFLICT_REVIEW.md](../FEATURE_CONFLICT_REVIEW.md) |
| 测试分层与少让人肉眼点 | [DEV_WORKFLOW_QUALITY.md](../DEV_WORKFLOW_QUALITY.md) |
| 付款入口不能被别的改动挡住 | [Z_INDEX.md](../Z_INDEX.md)；契约命令 `npm run test:payment-contract` |
| 倾诉 / 本地陪伴的安全与评测分层 | [LOCAL_AI_PHASE1_TASK_PLAN.md](../LOCAL_AI_PHASE1_TASK_PLAN.md)、[LOCAL_AI_SCENARIOS_V1.md](../LOCAL_AI_SCENARIOS_V1.md) |
| 术语与排期用词 | [GLOSSARY.md](../GLOSSARY.md)、[SCHEDULING_GLOSSARY.md](../SCHEDULING_GLOSSARY.md)（审计任务 **不要改** 这两份账本） |

仓库里没有单独的 ADR 目录，也没有把 DORA 四指标当成现行度量。决策散落在上述文档和已合并的 PR 说明里。缺一份叫 ADR 的文件，不等于没有决策记录。

## 还没当成「已经对外发布」

以下是 2026-11-06 文档里的状态，不是发布日期：

- 用户可见改名是 **T87**（对外叫 Samatia）。桌面显示名、宣传站文案、Stripe 顾客可见名分片推进。公开宣布改用 samatia.net，仍要等商标检索和站点 HTTPS，不能把文档里的域名预备说成已经上线。
- 任务说明：[task-samatia-user-facing-rename.md](../task-briefs/task-samatia-user-facing-rename.md)
- 本索引 **没有** 找到一份已拍板的「目标公开发布日」。分析师用的「距发布 6～8 周」是假设，不是仓库里的日期。

## 建议的审计表面（v1）

纳入：练习应用、桌面壳、宣传站 `marketing-site/`、支付与同意、备份与恢复、倾诉与本地陪伴。

不纳入评分：其它 git worktree、依赖安装目录、对话记录、历史审计草稿堆。主仓根上另有未入库的研究共修方案草稿和引导冥想任务稿，它们不是本目录的一部分。

## 和六份任务的对应

| 任务 | 优先对照的现成材料 |
|---|---|
| B1 架构与代码 | ARCHITECTURE、PRINCIPLES、叠层与付款契约 |
| B2 测试与项目管理 | DEV_WORKFLOW_QUALITY、SCENARIO_TESTS、TASKS、TEST_TRACKER、WORKFLOW |
| B3 功能与场景 | MVP 定义里的六类替代、SCENARIO_TESTS、功能冲突审查 |
| B4 体验、无障碍、语言、性能 | 定位文档、三语文案、RESPONSIVE_LAYOUT；性能以实测数为准 |
| B5 安全、隐私、合规 | 备份、研究数据同意、支付；结论写成「对照某要求有没有缺口」，不写成法律意见 |
| B6 陪伴质量与安全 | 倾诉路由与评测分层文档；危机用例只写意图，不写方法 |

异议和暂不执行的部分见 [REVIEW_NOTES.md](REVIEW_NOTES.md)。
