# Task Brief · 状态变更三态可见性契约

日期：2026-09-18  
状态：**Brief 已锁 · 无运行时**。落地扫描 / 改契约表 / 写中间件须新 Chat 口令 **「大任务」**（跨模块 + 单测 + PR）。  
建议模型（落地会话首条用户口吻）：`Cursor Model: Grok 4.6 / Fast OFF`  
任务线：工作室流程 [#839](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/issues/839)（`type:process`）。**禁止**挂产品 Epic（音景 / 栖居壳层等）。

前置地面真相（本 Brief 锁定时）：

- `#838` 已合 `origin/develop`（提醒保存可见确认）。合入 ≠ 本契约已穷尽。
- O-04 七列 SSOT：`src/core/overlayUiSurfaceContract.js` · 扫描 `scripts/overlay-contract-ui-check.js`（PR #785）。
- 点击反馈 SSOT：`INTERACTION_FEEDBACK_PRINCIPLES.md`（接收 ≠ 结果；已知静默 `SILENT_BEHAVIORS.md`）。
- 叙事已写过「禁止发现一个洞补一条扫描」：`DEV_WORKFLOW_QUALITY.md` §6.23 H6。**本 Brief 处理的是 H6 之后仍留下的盲角。**

---

## 共用机制核对

本次不触及 overlayBusy / HUD 呼吸驱动 / z≥17 遮罩 / 新建可点击叠层，核对跳过。

落地 Slice 1 若给 O-04 加第八列，须另写结论句，点名 `OVERLAY_UI_SURFACE` 将新增的 `successFeedback` 字段；不得只写「已对照 overlay registry」。

---

## 一、问题重述

Safari Circle（请求挂死 + 重复计数）与提醒保存（看起来没反应）表面不同。两份修复报告各自往上归纳过一层，但和已沉淀的 O-04、#710 留痕迹、#732 提醒 z-index 放在一起，看到的不是两个独立的「没建好契约」，而是同一种项目习惯：

> 每次精确诊断「这一次是哪个模式没被现有契约覆盖」，然后给**这一次的模式**补一条新条款；从不先问「一个状态变更动作理论上有多少种应被观测到的结局，现有契约覆盖了几种」。

所以契约表在变厚（O-04 已从「查 id 对上」升到七列），每次升级仍追着已发生的事故走。这次盲角是「成功反馈」。下一次会换模块重演。

这不是再开第 N 个「XX 保存反馈 bug」专项。本 Brief 把「状态变更三态可见性」收成**通用契约**，并规定机器能拦的部分必须进 `docs:check`，而不是靠人眼对照。

---

## 二、证据（落地时不得当新发现再调查一遍）

1. **约定从未被机器强制（Circle）**  
   `join` / `witness` / `was_here` 走同一套 `postCloudJson` 写法；`identity_set` 曾没跟上。这套写法是目录内约定，没有 lint / codegen / 模板。与 O-04 诞生前「大家心里知道」同一结构。

2. **七列契约的设计盲角（提醒 / O-04）**  
   `OVERLAY_UI_SURFACE_COLUMNS` 有 `failureFeedback`，没有 `successFeedback`。扫描器只能拦「失败被静默吞」，拦不住「保存成功了但看不见」。列名是从已发现故障（点击穿透、静默失败）反推的，不是从「状态变更动作有几种呈现结果」倒着建的。

3. **列错位仍在合入后的表里**  
   `ReminderPreferenceUI.js` 行把成功确认 token `#reminder-preference-saved` 登记在 **`failureFeedback`**。成功被塞进失败列 = 扫描器今天仍把「有个 token」当过关，不问它是成功、失败还是挂起。

4. **镜像的静默态**  
   - Circle：本地写入失败被吞 → 云端已成功，本机像没成功 → 用户重复触发。  
   - 提醒：保存其实成功，UI 反馈被 `_render()` 重入或过弱样式冲掉 → 用户以为没成功。  
   一个是失败被当成功呈现，一个是成功被当失败感知。同一漏洞：没有硬规则要求「改变持久状态的动作，成功 / 失败 / 挂起三种真实结果都有对应且经过测试的 UI 呈现」。

5. **H6 没挡住这次**  
   §6.23 H6 已禁止「发现一个洞补一条扫描」，并要求 O-04 七列一次填齐。七列本身仍是事故反推。补「成功反馈」若只加第八列、不先枚举结局空间，仍是同一种习惯的下一次发作。

---

## 三、设计目标（先穷尽结局，再补列）

对**任何会改变持久状态**的用户动作（`localStorage` / IndexedDB / `postCloudJson` 及同类云端 mutation），理论上至少有三种应被观测到的结局：

| 真实结果 | 用户必须能区分 | 禁止 |
|---|---|---|
| **挂起** | 请求还在飞 / 写入还在进行（可轻量；慢网须可感知） | 无接收反馈的死按钮；无限转圈无超时 |
| **成功** | 持久化已生效，且确认在重绘后仍可见足够久 | 只改内存、不读回；成功 token 塞进失败列；确认被 `_render()` 冲掉 |
| **失败** | 未生效，且可再试或知道为什么 | 静默 `return` / `catch` 吞掉；失败当成功画 |

设计静默仍只登记在 `SILENT_BEHAVIORS.md`。不在白名单里的沉默 = bug。

成功反馈默认轻量（现有 `#reminder-preference-saved` 短确认风格），遵守 `PRINCIPLES.md` 反馈分级与宁静型游戏化。**禁止**为此契约新增大阻断弹窗。

---

## 四、冲突扫描（对照 `SCENARIO_TESTS.md`）

本回合 **无用户路径**（只锁 Brief / 账本）。落地时仍须重扫。已见职责疑点，**不得在拍板前改 SSOT 正文或扫描器**：

| 轴 | 判断 |
|---|---|
| **强度** | 成功/挂起若做成大 toast / 新模态，会和场景 Q 付费卡、提醒保存短确认、宁静反馈分级打架。落地默认沿用短确认 + `aria-live`（原则第 6 条）。 |
| **语气** | 失败文案须观察式、不责怪用户（诚实机制）。禁止「保存失败请重试」训诫口吻。 |
| **职责重叠（须拍板）** | 点击原则已有「结果反馈」；O-04 已有「失败反馈」；静默白名单已有「设计上没反应」。**禁止**再开第四份 `MUTATION_THREE_STATE.md` 当平行 SSOT。落点见 §五。 |

相邻场景：提醒保存、Newsletter「成功反馈才算发出」、Focus Circle 加入/离开、留痕迹选句、练习备份 OTP。这些是**三例不够、类别契约要收**的样本，不是三套平行清单。

---

## 五、SSOT 落点（推荐项 · 待拍板）

**我认为最合理的是：拆进现有三处，不新建总册。**

| 层 | 放哪 | 管什么 |
|---|---|---|
| 产品 / UX | `INTERACTION_FEEDBACK_PRINCIPLES.md`「结果反馈」扩成持久化动作的 **挂起 / 成功 / 失败** | 人能读的原则；PR 三问补一句「三种结局各看到什么」 |
| 叠层机器检查 | `DOC_CODE_CONTRACT` **O-04** 加第八列 `successFeedback` | 可点击叠层上的 mutation（保存偏好、选句、加入圈子） |
| 非叠层持久化 | 新契约 **M-01**（仍写在 `DOC_CODE_CONTRACT.md` 高风险表，SSOT 可在 `src/core/` 一小组件或扫描脚本） | `postCloudJson` 调用族 + `localStorage`/`IndexedDB` 写入后读回 |

较弱方案：

- **只加 O-04 第八列** — Circle `identity_set` 不是 occupancy 叠层，扫不到；会再留下云端 mutation 盲角。  
- **新建第四份原则文档** — 与 H6 / O-04 / 点击原则平行复述，下一次事故又不知查哪本。  
- **先写 localStorage 读回中间件、不动列名** — 又是给这一次故障模式打补丁，扫描器仍把成功 token 登记在失败列。

拍板前禁止改 `INTERACTION_FEEDBACK_PRINCIPLES.md` / `overlayUiSurfaceContract.js` / 扫描脚本。

---

## 六、切片（一次一刀 · 禁止混进提醒/Circle 功能 PR）

### Slice 0 — 本 PR（已执行）

锁 Brief、`ISSUE_LEDGER` 根因扇出、`PROCESS` 速览指针。无运行时。

### Slice 1 — 原则 + 第八列骨架（下一刀 · 「大任务」）

1. 点击原则补「持久化三态」短节；**引用不复述** O-04 / M-01。  
2. `OVERLAY_UI_SURFACE_COLUMNS` 加 `successFeedback`。存量行允许 `grandfather:true` gap；**新 occupancy 行禁止 gap**（与失败列同一纪律）。  
3. 扫描器：缺列红；成功 token 不得与失败 token 同一字符串充数（`ReminderPreferenceUI` 现网错位是回归锚）。  
4. `DOC_CODE_CONTRACT` O-04 复制清单改为八列；H6 改「八列一次填齐」，禁止再写「七列」。  
5. 不在本刀做全表人工补成功反馈。

验收：`npm run docs:check` 绿；新增单测锁「成功/失败 token 不得同位」。

### Slice 2 — 存量缺口清单（只读审计 · 「大任务」）

按 `OVERLAY_UI_SURFACE` **逐行**（禁止用「等」收口）标：

- 该行有无持久化 mutation  
- 挂起 / 成功 / 失败是否可见  
- 成功是否被 `_render()` 冲掉  
- 是否 `SILENT_BEHAVIORS` 豁免  

另表：`postCloudJson(` 调用点是否与同目录已有调用的 path / JSON body / 超时 / 错误映射同类。  
产出：清单进 Brief 附录或独立 `docs/` 审计稿（无运行时）。**禁止**本刀顺手修 UI。

### Slice 3 — 机器强制（审计清单拍板后）

1. `postCloudJson` 族静态检查：新 mutation 必须匹配同目录已有调用的路径/body/超时/错误映射模式。  
2. 本地持久化默认「写入后读回」通用辅助，而不是每个 write 函数事后打补丁。豁免须书面（配额、纯缓存、`BACKGROUND_NETWORK` 已答「同内容跳过写入」的路径）。

---

## 七、明确不做

- 不重开「提醒保存反馈」「Circle 挂死」功能专项（#838 等已合的继续走各自 TRACKER 关单）。  
- 不改 Confide / L3 / 情绪主线。  
- 不做 z-index 常量化全表扫描（仍是 Z-dim）。  
- 不把成功反馈做成新的阻断式确认（对照 `MODAL_USAGE_AUDIT.md`）。  
- 不在本 Brief PR 改扫描器或运行时。

---

## 八、保护面 / 已好清单

落地时必须守住：

- 提醒保存短确认仍轻量，不得升级成模态。  
- O-04 既有七列语义不删；第八列是加，不是换。  
- `SILENT_BEHAVIORS` 白名单继续有效。  
- 后台网络三问（`BACKGROUND_NETWORK.md`）继续只管**非点击**请求；用户点击的 mutation 走本契约。  
- 菜单逃生舱、叠层占用三问（O-01）不被本契约改写。

---

## 九、验收（Slice 0）

1. Brief 在 `docs/task-briefs/task-mutation-three-state-visibility.md`。  
2. `ISSUE_LEDGER.md` 有「根因扇出」行，状态「跟进中（Brief 已锁）」。  
3. `PROCESS.md` 当前进度有一句指针。  
4. TRACKER 碎片：纯文档、仅单元测试覆盖、无用户路径。  
5. 无 `src/` 运行时 diff。
