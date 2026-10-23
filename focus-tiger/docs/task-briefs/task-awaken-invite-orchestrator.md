# Task Brief · T51 觉照邀请编排（只邀请，不自动开练习）

> **状态（2026-10-23）**：Brief 待点头。口径已写入 `DESIGN.md`「觉照邀请」· `PRODUCT_POSITIONING.md` · `PRINCIPLES.md`。  
> **类**：B 类（会改 Focusing 期间用户看见什么）。**口令「立刻开工」不能跳过本 Brief。**  
> **父任务**：T50 产品口径（本治理档）。**下一刀**：T52 微打卡。  
> **依赖**：现网 Recover / Ground / 呼吸 / Re-focus / Companion Mode；不新建练习种类。

## 一句话

在电脑版专注会话里，用**已有信号**（Companion 模式、窗口是否离开、坐了多久）决定要不要让阿寅问一句「要不要停一下」。用户点头才进入已有恢复路径；不理就消失。

## 已拍板（PO 2026-10-23）

1. 邀请，不自动开练习。  
2. 不定性：用户可见文案禁止「焦虑 / 分心诊断 / 心流指数 / 分数」。  
3. `Flow State` / `Offline Space` 切走仍按 **SB-03**，不发离开类邀请。  
4. 到点多坐一会儿：只允许可撤销的一句问，禁止静默加时。  
5. 击键节奏不在本刀（T53）。

## 冲突扫描

对照 `SCENARIO_TESTS` **B**（Re-focus）、**X**（Tiger Anchor）、**AB**（托盘 **SB-18**）、Companion 三选一、**P** 忙碌提醒。

| 轴 | 结论 |
|---|---|
| **a. 强度** | 邀请必须 **轻于** 场景 X 完整 Recover，也不得重于场景 B 的 toast。禁止切走回来后再做强制双钮仪式（曾收回的 Reset Offer 不得原样复活）。 |
| **b. 语气** | 观察式短问（「要不要三次呼吸？」）；禁止临床标签、禁止说教。 |
| **c. 职责** | 不替代 Re-focus toast、不替代点阿寅 Recover、不替代菜单接地练习。本刀只做**触发编排**，练习 UI 复用现网。 |

**让位规则（写进实现）**：Re-focus toast / Celebrating / Arrival / Honesty / Confide / Support 任一在场 → **不出**邀请（**SB-10** 同类）。托盘收起 → 不出（**SB-18**）。

## 实现范围（点头后的独立 `feature/*` PR）

- [ ] `InterventionOrchestrator`（主进程或现有 reminder 旁的纯函数 + 接线）：内部状态仅 `NEUTRAL` / `FLOW_PROTECT` / `AWAY_INVITE` / `LONG_SIT_INVITE`。**禁止** `ANXIETY` 枚举名。  
- [ ] `Here & Now`：离开 ≥ 现网 Re-focus 门槛且本场 Re-focus **已展示过或已占额度**之后，冷却期满才可出 **一条**非模态邀请（呼吸或接地入口）。未到 Re-focus 门槛 → 仍 **SB-01 / SB-02**。  
- [ ] `Flow State` / `Offline Space`：`FLOW_PROTECT`；离开不邀请。会话到点：可选一句「要再坐一会儿吗」（Yes 续墙钟一小段 / No 或忽略走现网结束）。默认续时长度实现时写死一档（建议 +5 或 +10 分钟，Brief 锁：**+5 分钟**）。  
- [ ] 坐久：复用现网 stretch 门槛，把「按时长提醒」接到同一邀请表面，不另开第二套闹钟。  
- [ ] 冷却：任意邀请或 Re-focus 之后 **≥ 10 分钟**不再主动邀请；每小时最多 **1** 次主动邀请。  
- [ ] 10 秒不理 → 淡出（**SB-20**）。  
- [ ] 浮层：`focusable: false` / 不抢前台；自家 bundle 不计入切换（为 T53 预留，本刀若无 Helper 则只做到不抢焦点）。  
- [ ] locale slice `awaken-invite`：en + ja + zh；禁止硬编码。  
- [ ] 单测：模式抑制、让位、冷却、10s 自消、禁止定性词。  
- [ ] e2e：一条 Here & Now 邀请可见且点头进入现网呼吸或接地；一条 Flow 切走 **无**邀请。

## 变体矩阵

| 变体 | 入口 / 前置 | 预期 | 自动化 |
|---|---|---|---|
| Here & Now · 切走 >60s 再回 | Focusing | 先现网 Re-focus（若额度允许）；邀请不得同时叠上。冷却后再问一次可忽略入口 | 本刀补单测 + 一条 e2e |
| Flow State · 切走 >60s | Focusing | **无** Re-focus、**无**离开邀请（SB-03） | 本刀补 |
| Offline Space · 切走 | Focusing | 同上 | 单测即可 |
| 到点 · Flow | 计时结束 | 「要再坐一会儿吗」；Yes → +5 分钟继续 Focusing；忽略/No → 现网结束流 | 本刀补 |
| 到点 · Here & Now | 计时结束 | **不**出续坐问；走现网 Reflection | 单测负例 |
| 窄屏 Web | 无 Electron | 本刀 **不做**全局输入；离开信号仍用现网 visibility。邀请表面若做，须与宽屏同一套文案、可点 | 宽窄都要能关；窄屏允许只做结束续坐问，离开邀请可与现网 Re-focus 共用门槛 |
| en / ja | 同一入口 | 无临床词 | locale 切片检查 |

## 点击反馈（0–1 秒）

| 控件 | 0–1 秒 | 持久化 |
|---|---|---|
| 邀请「要」/ 呼吸入口 | 邀请收起，现网呼吸或接地练习出现（或开始进入） | 不写云；本机可记冷却时间戳 |
| 邀请「先不用」或点空白（邀请非录入卡） | 邀请淡出 | 记一次忽略，供冷却 |
| 续坐「要」 | HUD 继续走，不进 Reflection | 本场目标墙钟 +5 分钟 |
| 续坐忽略 10s | 邀请消失，现网结束流继续 | — |

设计静默：10s 不理 = **SB-20**；Flow 切走无邀请 = **SB-03**。

## 边缘状态

| 边缘 | 预期 |
|---|---|
| 日提醒额度耗尽（SB-12） | Re-focus 仍按现网；本刀邀请另计冷却，但同一小时仍最多 1 次主动出现 |
| overlay 已开 | 不出邀请 |
| 低配 / 无本地 AI | 邀请不依赖 companion 模型 |
| 输入节奏关（T53 默认） | 本刀行为不变 |

## 共用机制核对

- overlayBusy：邀请是 **非模态 z≈17 轻提示**（对齐 `#moment-whisper` / Recover toast），**不**登记为挡住 Sit 的重卡；Focusing 期间允许出现。不得盖 Support FAB / 倾听耳（z=24）。  
- HUD 呼吸：点头进入呼吸练习时，须接现网呼吸驱动者；邀请本身不驱动 HUD。  
- z-index：新节点须登记 `Z_INDEX.md`（实现 PR 改，本 Brief 预留 `#awaken-invite` @ 17）。  
- 新建可点击叠层：实现 PR 须在 `OVERLAY_UI_SURFACE` 增一行；三态：邀请无云端 mutation，`mutationFeedback` 跳过（仅本地冷却）。结论：`awaken-invite` 为轻表面，busyGate 对 Arrival/Honesty **应排除**（类比 Focus Awareness：Focusing 允许）。

## 后台网络

不涉及后台网络。零新增 fetch。

## 保护面

- 场景 B Re-focus 文案与额度  
- 场景 X 点阿寅 Recover + **SB-07** / FB-01  
- 菜单接地练习  
- 付款入口 / Support FAB  
- Idle 呼吸节奏  

## 不做

- 击键 / Helper / Input Monitoring（T53）  
- 微打卡三态（T52）  
- 系统专注模式 / 快捷指令勿扰  
- 显示分数或「心流曲线」  
- 复活已删的 emoji Reset 条  

## 验收

1. Here & Now 切走回来：先 Re-focus，不双叠。  
2. Flow 切走：安静。  
3. 邀请 10s 自消。  
4. 点头进入现网练习。  
5. `test:smoke` + 本刀单测 / 一条 e2e。  
6. TRACKER 碎片「待人工测试」。  
