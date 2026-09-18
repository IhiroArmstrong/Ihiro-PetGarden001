# Task Brief · 状态变更三态可见性契约

日期：2026-09-18  
修订：同日分析师挑刺后补硬锚 / 挂起分档 / 中间件顺序 / #839 关单条件  
状态：**Slice 1 骨架本支**（点击原则定义 + O-04 三键；无产品 UI 改动）。Slice 2/3 仍须新 Chat 口令 **「大任务」**。  
建议模型（落地会话首条用户口吻）：`Cursor Model: Grok 4.6 / High / Fast OFF`  
任务线：工作室流程 [#839](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/839)（`type:process`）。**禁止**挂产品 Epic。

前置地面真相：

- `#838` 已合 `origin/develop`（提醒保存可见确认）。合入 ≠ 本契约已穷尽。
- O-04 SSOT：`src/core/overlayUiSurfaceContract.js` · 扫描 `scripts/overlay-contract-ui-check.js`（PR #785）。
- 点击反馈 SSOT：`INTERACTION_FEEDBACK_PRINCIPLES.md`。已知静默：`SILENT_BEHAVIORS.md`。
- Circle mutation 超时常量已在 `focusCircleMembership.js` L23（`FOCUS_CIRCLE_MUTATION_TIMEOUT_MS = 12000`）；`postFocusCircleIdentitySet`（`focusCircleIdentity.js` L269–294）**已经**套 `withFocusCircleRequestTimeout`。本契约要锁的是「挂起这一态对用户是否可观测」，不是再发明一次 12 秒超时。
- H6（`DEV_WORKFLOW_QUALITY.md` §6.23）已禁止「发现一个洞补一条扫描」。本 Brief 处理 H6 之后仍留下的盲角。

---

## 共用机制核对

本次不触及 overlayBusy / HUD 呼吸驱动 / z≥17 遮罩，也**不**新建 occupancy 叠层。O-04 存量行字段变更见下句。

落地 Slice 1 已把 `failureFeedback` 升级为 `mutationFeedback.{pending,success,fail}`。`OVERLAY_UI_SURFACE` 行字段变更：提醒保存成功 token 改挂 `success`；Witness 提交错误仍挂 `fail`；存量其余行三键 `grandfather` gap。**不解冻** Z-dim。本刀不新建可点击叠层。

---

## 〇、共享定义（三处正文只引用本节，禁止各自重写）

**三态可见性**：用户发起的、会改变持久状态（`localStorage` / IndexedDB / `postCloudJson` 及同类云端 mutation）的动作，真实结局只有三种，且三种都必须能被用户区分：

| 态 | 真实世界 | 用户必须能区分 | 禁止 |
|---|---|---|---|
| **挂起** | 请求还在飞 / 写入还在进行 | 仍在等（可轻量；须有超时，不得无限转圈） | 无接收反馈的死按钮；超时后仍像「没点过」；把挂起画成失败或成功 |
| **成功** | 持久化已生效 | 确认在重绘后仍可见足够久 | 成功 token 塞进失败格；确认被 `_render()` 冲掉 |
| **失败** | 未生效 | 可再试或知道为什么 | 静默 `catch`；失败当成功画 |

**挂起是单独一档，禁止并入失败。** 并入失败 = 三态退回两态，立项动机自相矛盾。Circle 12 秒窗口里「还在等」≠「已经失败」。

设计静默只登记 `SILENT_BEHAVIORS.md`。不在白名单里的沉默 = bug。  
成功/挂起默认轻量（`#reminder-preference-saved` 短确认风格）。**禁止**新增大阻断弹窗（`MODAL_USAGE_AUDIT.md`）。

落地时：

- `INTERACTION_FEEDBACK_PRINCIPLES.md` **承载本节全文**（扩「结果反馈」，不另开第四份原则文档）。
- `DOC_CODE_CONTRACT` O-04 与 **M-01** 各写一句「定义见点击原则『持久化三态可见性』，此处只锁机器检查」。禁止在那两处重新解释三态。

---

## 一、问题重述

Safari Circle 与提醒保存表面不同，和 O-04 / #710 / #732 放在一起，是同一种习惯：给**这一次**的故障模式补条款，从不先问「一个状态变更动作有几种应被观测的结局」。契约表变厚，盲角换模块重演。本次不是第 N 个保存反馈专项。

---

## 二、硬证据（回归锚 · 必须带坐标）

### 2.1 成功 token 登记在失败列

| 坐标 | 内容 |
|---|---|
| `src/core/overlayUiSurfaceContract.js` **L22–30** | `OVERLAY_UI_SURFACE_COLUMNS` 七列：`failureFeedback` 在列，无 `successFeedback` / `pendingFeedback` |
| 同文件 **L215–227** | `file: 'ReminderPreferenceUI.js'` 的 `failureFeedback.tokens` = `['reminder-preference-saved']`（这是**成功**确认 id，不是失败文案） |
| `src/core/overlayUiSurfaceContract.test.js` **L32–41** | 单测把上述七列数组锁死，缺列会红，**错列不会红** |
| `scripts/overlay-contract-ui-check.js` **L94–132** `scanClaim` | `mode: 'token'` 只断言源文件 `includes(token)`；**不读 token 语义** |
| 同脚本 **L288–294** | 对每行只 `scanClaim(row.failureFeedback, …)`，没有成功/挂起键 |

扫描器能绿，是因为格子非空且字符串出现在 `ReminderPreferenceUI.js` 里，不是因为填对了态。#838 修好可见样式之后，这行**仍然**错位——所以 #838 没被 O-04 拦住。**Slice 1 回归锚**：`reminder-preference-saved` 不得再出现在失败键；本刀已把该 token 挪到 `mutationFeedback.success`，扫描器见它出现在 `fail` 则红。

不是 `overlaySlotArbitration.js`（那是 O-01 占用槽，不管反馈列）。

### 2.2 挂起曾是 Circle 的病灶，超时补丁 ≠ 挂起可见

| 坐标 | 内容 |
|---|---|
| `src/core/focusCircleMembership.js` **L22–23、L53–70** | mutation 12s 超时；`withFocusCircleRequestTimeout` |
| `src/core/focusCircleIdentity.js` **L269–294** | `identity_set` **现已**走同一 path + JSON body + 该超时（地面真相：超时补丁已打） |

仍缺：超时窗口内用户能否看出「挂起中」；超时后是失败呈现还是像没点过。O-04 表无挂起键，扫描器不能锁这件事。

### 2.3 镜像静默

本地写入失败被吞 → 云成功、本机像失败、重复点。保存成功、确认被冲掉 → 像失败。同一漏洞：没有「三态都经过测试的 UI」。

---

## 三、SSOT 落点（拍板倾向）

**我认为最合理的是：落点拆三处，概念只定义一次（§〇）。**

| 层 | 放哪 | 机器锁什么 |
|---|---|---|
| 产品 / UX | `INTERACTION_FEEDBACK_PRINCIPLES.md` 承载 §〇 | PR 三问补「挂起/成功/失败各看到什么」 |
| 叠层 | O-04：把现有 `failureFeedback` **升级**为 `mutationFeedback: { pending, success, fail }`（一列三键，**不是**先加第八列再等第九次事故加挂起列） | 三键都有 `token` / `gap+grandfather` / `na`；token 不得跨键 |
| 非叠层 | `DOC_CODE_CONTRACT` **M-01**（高风险表一行 + 扫描脚本，不新开 md 总册） | `postCloudJson` 族 path/body/超时/错误映射；本地写入后读回 |

较弱：只加名为 `successFeedback` 的第八列（挂起仍无格，会再补第九列）。新建 `MUTATION_THREE_STATE.md`（概念分裂）。

---

## 四、冲突扫描（对照 `SCENARIO_TESTS.md` + 已暂缓项）

本回合无用户路径。落地改三处正文前须再扫。**已核对暂缓项，不借本契约解冻：**

| 项 | 结论 |
|---|---|
| **Z-dim**（z-index 常量化全表扫描） | O-04 原文写明不替代 Z-dim；`task-overlay-ui-surface-o04.md` 暂缓。本契约 **不解冻**。挂起/成功确认不得靠改全表 z 常量来「看见」。 |
| **「通用中间件此前暂缓」** | 仓库里没有一份 PO 口令叫停「写入后读回中间件」。O-04 暂缓的是 Z-dim，不是 M-01。中间件是 Slice 3 通解，顺序见 §六，**不是**解冻另一条冻结线。 |
| **`SILENT_BEHAVIORS`** | 不改白名单语义。三态里「按设计无反馈」仍须 `SB-xx`。禁止把挂起缺 UI 登记成已知静默来过关。 |
| **`BACKGROUND_NETWORK`** | 继续只管**非点击**请求。用户点击的 mutation 走 §〇。同内容跳过写盘的后台路径可 M-01 豁免，须书面。 |
| **`MODAL_USAGE_AUDIT`** | 禁止用新阻断框当三态载体。 |
| **强度** | 短确认 + `aria-live`；禁止大 toast / 新模态（场景 Q、提醒保存）。 |
| **语气** | 失败观察式，不训诫。 |
| **职责** | 三处只引用 §〇，禁止平行定义。 |

相邻样本（类别契约，不是平行清单）：提醒保存、Newsletter「成功反馈才算发出」、Circle 加入/离开/身份、留痕迹选句、练习备份 OTP。

---

## 五、中间件：通解，但后做（把上一稿含糊句写死）

写入后读回 **是**防止「每个 write 函数出事再打补丁」的通解。上一稿「先不要写通用中间件」**不是**说中间件是补丁。

真正的意思是**顺序**：Slice 2 审计没做完就写中间件，只会把 Circle / 提醒已经看见的坑硬编码进去；审计再发现 IndexedDB、跳过写盘、配额豁免，中间件还要再改一轮。所以：

1. Slice 1 先让三态在原则上和表结构上分得开（含挂起键）。  
2. Slice 2 列出该走中间件的写入点与豁免。  
3. Slice 3 **必须**落地中间件（加超时/挂起可见），不是可选项。

「现在就写中间件、不动表结构」较弱：扫描器仍接受成功 token 待在失败键。

---

## 六、切片（禁止混进提醒/Circle 功能 PR）

### Slice 0 — 本 PR

锁 Brief / 账本 / PROCESS。无运行时。

### Slice 1 — 定义入点击原则 + O-04 三键骨架（「大任务」）

1. `INTERACTION_FEEDBACK_PRINCIPLES.md` 写入 §〇；PR 三问加三态句。  
2. `failureFeedback` → `mutationFeedback.{pending,success,fail}`。存量允许单键 `grandfather:true` gap；**新 occupancy 行三键禁止 gap**。  
3. 扫描器：缺键红；`reminder-preference-saved` 出现在 `fail` 键则红（§2.1 锚）。  
4. H6 / `DOC_CODE_CONTRACT` O-04 复制清单 / `COLLAB` 第七节约「七列」改为「三态键 + 其余列」；禁止再写「七列一次填齐」当完整面。  
5. M-01 在高风险表占一行（可先 `暂无 (a)`，脚本在 Slice 3）。  
6. 本刀不做全表人工补 UI。

验收：`docs:check` 绿；单测锁列枚举 + 错键锚。

### Slice 2 — 存量审计（只读 · 「大任务」）

按 `OVERLAY_UI_SURFACE` **逐行**：有无持久化 mutation；pending / success / fail 是否可见；成功是否被 `_render()` 冲掉；是否 `SB-xx`。  
另表：`postCloudJson(` 是否与同目录调用的 path / body / 超时 / 错误映射同类（超时已接上仍要查**挂起 UI**）。  
禁止本刀修 UI。

### Slice 3 — 机器强制（审计稿拍板后 · 必做中间件）

1. `postCloudJson` 族静态检查（path/body/超时/错误映射）。挂起：须有超时常数 + 超时映射到**失败呈现**；窗口内须有 pending 声明或 `SB-xx`。  
2. 本地持久化默认写入后读回。豁免书面（配额、纯缓存、后台「同内容跳过写入」）。

---

## 七、#839 / 账本扇出行关单条件（AND · 不是许愿池）

**可以关**当且仅当：

1. 三处正文已改：点击原则承载 §〇；O-04 与 M-01 只引用不复述。  
2. 扫描器按三态分键；§2.1 锚绿（成功 token 不在失败键）。  
3. 一次跨模块回归绿（同一 PR 或紧随的 process PR）：提醒保存成功确认仍可见 **且** Circle mutation 在超时窗口内有挂起**或**超时后有失败呈现（单测或 1 条 e2e）。  
4. Slice 2 审计稿已入库（路径写进本 Brief 附录或 `docs/` 一页）。

**不挡关**：存量 `grandfather` gap 未全部补 UI（另跟 TRACKER）；Z-dim；#838 人工关单；Confide / L3。

未满足 1–4 时，#839 与账本该行保持 **跟进中**。仓库已关 auto-close；PR `Closes #839` 合入 Brief **不等于**可关 Issue——须 Slice 1–3 满足后再手关，并在账本标「已解决」。

---

## 八、扇出 8 项（账本同文 · 本回合未修）

锚点：`docs/ISSUE_LEDGER.md` 表末「根因扇出」行（三态可见性）。

1. Circle `identity_set` 与同目录 mutation 的**可扫描**一致性（现已有超时补丁，仍缺静态检查）。  
2. Circle 本地写入失败被吞 → 感知错位 / 重复触发。  
3. 提醒保存成功确认被重绘冲掉（#838 已合样式，TRACKER 关单另走）。  
4. O-04 只有失败格，无成功/挂起键。  
5. `ReminderPreferenceUI` 成功 token 在失败列（§2.1）。  
6. #710 留痕迹 / #732 提醒 z-index：同族「出事补一列」。  
7. 点击原则「结果反馈」未拆三态，与 O-04、静默白名单并列。  
8. `OVERLAY_UI_SURFACE` 全表 `failureFeedback: GAP` 行的三态缺口 — Slice 2 按该 JS 全表逐行扫。

---

## 九、明确不做

- 不重开提醒保存 / Circle 挂死功能专项。  
- 不改 Confide / L3 / 情绪主线。  
- 不解冻 Z-dim。  
- 不把挂起并进失败。  
- 不在本 Brief PR 改扫描器或运行时。

---

## 十、保护面

- 提醒短确认仍轻量。  
- O-01 占用三问、菜单逃生舱不被改写。  
- 后台网络三问范围不变。  
- `SILENT_BEHAVIORS` 继续有效。

---

## 十一、验收（Slice 0 修订）

1. Brief 含 §〇 共享定义、§2.1 行号锚、挂起单独成档、中间件后做必做、#839 关单 AND。  
2. 账本该行含关单句 + 8 项仍未修。  
3. 无 `src/` 运行时 diff。
