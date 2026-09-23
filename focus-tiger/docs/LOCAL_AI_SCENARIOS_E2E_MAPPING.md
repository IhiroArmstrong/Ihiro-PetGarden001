# LOCAL_AI_SCENARIOS_V1 · E2E 抽取对照表

**日期**：2026-09-23  
**政策**：`LOCAL_AI_SCENARIOS_V1.md` 是能力规划 SSOT，**不整体转 GWT**。本表记录哪些意图条目须在 E2E（Playwright / Electron 人工链路）验证，哪些留在规划文档由单测/集成测覆盖。  
**用户故事 GWT**：`SCENARIO_TESTS.md` **场景 AS**（生成物 `SCENARIO_TESTS_GWT.md`）。

## 判定标准（E2E 关键路径）

满足 **任意一条** → 标记「抽取 E2E」：

1. 路由错误会导致用户在界面上看到**明显异常反馈**（错数据源、错删记忆、危机被闲聊盖住等）。
2. 该意图属于**高频 / 核心交互**（Phase 1A/1B CORE、现网 CI-xx 白名单）。

**不抽取**：用户侧看不出路由差异的细分归类、未批准 / V2 Future、纯 Operating Layer 指路、validation-only 切片。

---

## 对照表

| 来源（LOCAL_AI_SCENARIOS_V1.md） | 意图 / 问句 | E2E | 场景测试锚点 | 建议测试层（未抽或补充） |
|---|---|:---:|---|---|
| §1 Phase 1A · Forget this | 口头 Forget 单条（CI-01） | ✅ | **AS-1** · 交叉 **AG-1e** · **AE** L1 芯片 | `yinPersonalMemoryVerbalForget.test.js` · `desktopCompanionL2Route.test.js` |
| §1 Phase 1A · Show me what you remember | 你还记得什么（CI-03） | ✅ | **AS-2** · 交叉 **AG-7** | `confideMemoryList` · `confideExecutableTools` |
| §1 Phase 1A · Don't save this | 别记这句 / Don't save | ✅ | **AS-3** · 交叉 **AG-1f** · **AE** L2 步 8 | `yinPersonalMemorySuppress.test.js` |
| §1 Phase 1A · Delete today's Journey entry | 删今天 Journey | ❌ | —（V2 Future Candidate） | V2 Brief 后：路由单测 + Journey UI 集成；**不进** Phase 1 E2E |
| §1 Phase 1B · When do I usually practice? | 我通常什么时候练？ | ✅ | **AS-4** · 交叉 **AG-0** · **AE** 步 9 | `confidePracticeFacts.test.js`（时段分支） |
| §1 Phase 1B · How have I been showing up? | 我最近有在出现吗？ | ✅ | **AS-5** · 交叉 **AE** 步 9 | `confidePracticeFacts.test.js`（showing up 分支） |
| §1 Phase 1B · What has my mood looked like recently? | 最近情绪怎样（CI-02 正式示例） | ✅ | **AS-6** · 交叉 **AF** 步 3 · **AE** 步 9 | `confidePresenceFacts.test.js`（≥3 / insufficient） |
| §1 Phase 1B · Am I practicing longer… / 比以前久？ | 练习时长两窗对照 | ✅ | **AS-7** · 交叉 **AE** 步 9 | `confidePracticeFacts.test.js`（temporal compare） |
| §1 Phase 1B · Have I been more steady lately? / 比较稳定？ | 情绪稳不稳两窗对照 | ✅ | **AS-8** · 交叉 **AF** 步 3 · **AE** 步 9 | `confidePresenceFacts.test.js`（禁止「你更稳了」） |
| §1 Phase 1B · Have I been getting into practice more easily? | 更容易进入状态？ | ✅ | **AS-9** · 交叉 **AE** 步 9 | `confidePracticeFacts.test.js`（可审计 arrival 字段） |
| §1 Phase 1B · What have you noticed lately? | 你最近注意到什么？ | ❌ | **AE** 步 9 **负例**（不得走 CI-00/02） | `confideObservationHonesty.test.js` · Gate 0.D intent diagnostic |
| §1 Phase 1C · Reflection Companion | 提交后 one short observation | ❌ | **AL** validation lab（非 shipping） | `reflectionCompanionValidation.test.js`；shipping 另 Brief 后再抽 E2E |
| §1.1 · DELETE_TODAY_JOURNEY_ENTRY | 删今天 Journey | ❌ | — | 同 §1 Phase 1A Delete；V2 路由单测 |
| §1.1 · Reflection shipping | validation 通过后 shipping | ❌ | **AL** | validation gate 单测；shipping 口令前不抽 E2E |
| §1.1 · Don't save this（重复） | Slice 1f pipeline | ✅ | 同 **AS-3** | 同上行 |
| §3.1 · **CI-00** | 练了多久 / Phase 1B 练习事实族 | ✅ | **AS-4–AS-5, AS-7, AS-9** · **AG-0** | `confidePracticeFacts` · Read Hybrid paraphrase 单测 |
| §3.1 · **CI-01** | 口头 Forget | ✅ | **AS-1** | 同 §1 Phase 1A Forget |
| §3.1 · **CI-02** | 情绪趋势 / 两窗对照 | ✅ | **AS-6, AS-8** · **AF** | `confidePresenceFacts`；improved 问法仅 alias 单测 |
| §3.1 · **CI-03** | Show memory 列表 | ✅ | **AS-2** | 同 §1 Phase 1A Show memory |
| §5 · 帮我备份 | Operating Layer | ❌ | — | `LOCAL_AI_OPERATING_LAYER.md`；诚实模板 / L3 不接「已备份」单测 |
| §5 · 忘掉一切 | bulk wipe | ❌ | **AG-1e** bulk **负例**（引导面板） | 路由单测；E2E 只验「不真删库」一条负例即可 |
| §5 · Delete Journey（Phase 1） | V2 Future | ❌ | — | 同 Delete today |
| §5 · Journey / Reflection 润色 | 未批准 generate | ❌ | — | 无 runtime；MUST NOT 回归单测 |
| §5 · V4 各仪式时刻 generate | MUST NOT ENTER | ❌ | — | 无测试（产品原则禁止） |

---

## 统计

| 类别 | 条数 |
|---|---:|
| 抽取 E2E（场景 AS + 交叉 AE/AG/AF） | **12** 条用户可见意图（CI-00~03 与 Phase 1A/1B 合并计） |
| 留规划表 / 单测或集成 | **11** 条 |
| validation-only（AL） | **1** 条（Reflection Companion） |

---

## 维护

1. 新增 `LOCAL_AI_SCENARIOS_V1.md` 意图行 → 先本表打 E2E / 单测列，再决定是否写 **场景 AS** 或扩 **AE/AG/AF**。  
2. 改 **场景 AS** 后须重跑 `python3 focus-tiger/scripts/generate-scenario-tests-gwt.py`。  
3. 与 `CONFIDE_EXECUTABLE_INTENTS.md` 白名单保持一致；Operating / bulk / suppress **非 CI** 项不进 CI 表，但 E2E 列仍可按上表跟踪。
