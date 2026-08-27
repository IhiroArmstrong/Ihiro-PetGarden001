# Local AI Operating Layer · 架构方向锁

> **状态（2026-08-27）**：产品方向锁 · **只设计，无运行时**。  
> **拍板**：Yin = 陪伴；Local AI Layer = 理解引擎；Auto-Operating = 用户主动进入的操作系统面。  
> **本文件禁止被解读成开工令**：不得据此实现 UI、空壳 Tool、Backup / Update / MCP 执行链。

交叉引用：

| 文档 | 职责 |
|---|---|
| `CONFIDE_EXECUTABLE_INTENTS.md` | Confide **现网**口头白名单 + Companion Tool Registry |
| `LOCAL_AI_SCENARIOS_V1.md` | Confide 场景轨道 A/B/C（口头 / L3 注入 / 仪式 generate） |
| `PRODUCT_POSITIONING.md` | Companion, not controller |
| `YIN_PERSONALIZATION_ENGINE.md` | 编排 / 门闩（≠ Qwen、≠ Operating） |
| `YIN_PERSONAL_MEMORY.md` | 陪伴记忆（≠ 练习备份 / Journey） |

**编号注意**：本文「Companion / Operating」与 `LOCAL_AI_SCENARIOS_V1.md` 的轨道 **A/B/C 不是同一套编号**。场景规划 A/B/C 仍只管 Confide。Operating 是**另一产品入口**。

---

## 1. 一句话战略

> **阿寅负责陪伴；Local AI 负责理解；Auto-Operating 负责执行。**

English:

> Yin is the companion. Local AI is the intelligence layer. Auto-Operating is the action layer.

**不是**：Yin becomes the natural-language operating system.  
**不是**：Qwen is Yin.  
**不是**：Qwen is the whole App agent.

---

## 2. 两个用户心理入口（硬边界）

```text
                         USER
                           │
              ┌────────────┴────────────┐
              │                         │
          TALK TO YIN              AUTO-OPERATING
              │                         │
              ▼                         ▼
        Companion Mode            Operating Mode
              │                         │
            Yin                   Local AI Operator
        陪伴 / Confide            系统操作 / Commands
        Memory / Reflection       Tools / Actions
              │                         │
              └────────────┬────────────┘
                           ▼
                    Local AI Layer
                           │
                      Tool Registry
```

| 入口 | 用户在说什么 | 系统必须像什么 | 现网 |
|---|---|---|---|
| **Confide → Yin** | 「今天有点累。」「我好像越来越难专注。」 | 陪伴、觉察、回应。**禁止**变成「好的，我执行命令。」 | 已有（Electron 宽屏 + Web harness） |
| **Auto-Operating** | 「请备份本周 Journey。」「检查有没有更新。」 | 克制的 command surface；**可以不显示阿寅** | **未实现**；本文件只锁边界 |

**硬闸**：同一套 Local AI Layer 与未来同一套 Registry 权限模型；**两套入口**。  
**Confide 永远不得执行 Operating Tools。**

---

## 3. 四层分别是什么

| 层 | 角色 | 用户是否需要知道 |
|---|---|---|
| **Yin** | Who I talk to（人格 / 陪伴） | 是 |
| **Local AI Layer** | What understands me（含 Qwen 1.7B 等本地 NLU） | 否（工程名） |
| **Tools** | What the system can do（确定性 handler + 真数据） | 否 |
| **Auto-Operating Entry** | Where I explicitly ask the system to do things | 是（将来 UI 名） |

内部架构名：**Local AI Operating Layer**。  
用户可见名（工作称呼，未定稿）：**Auto-Operating**（备选：Auto-Operate / AI Actions / Local Actions / Do for Me）。**不要对用户叫 CLI。**

Qwen 1.7B 的定位：

> Local AI Layer 的本地自然语言理解引擎。

它输出的是 **候选 tool call**（JSON），不是执行命令。执行只发生在 Registry 查找 + 风险闸 +（Operating 侧）确认之后。

---

## 4. Tool Registry 三个权限域（规划）

现网 Confide Registry（`confideExecutableTools.js`）**只覆盖 Companion 域的一个子集**。下表是长期形状，**不是**要一次实现。

```text
LOCAL AI TOOL REGISTRY
│
├── Companion Tools          ← Confide 可调用（只读分析）
│   ├── query_practice_duration     （CI-00 · 已有）
│   ├── query_presence_trend        （CI-02 · 已有）
│   └── （未来）query_* 须已有权威本地字段；禁止诊断句
│
├── Companion Actions        ← Confide 极窄写；Consent / 正则；模型不得 autoExecute
│   └── forget_memory_entry         （CI-01 · 已有）
│
└── Operating Tools          ← 仅 Auto-Operating；Confide 禁止执行
    ├── inspect_* / backup_* / export_* / update_* / change_setting / manage_YPE
    └── bulk_delete / erase_all_data
```

**按入口分域，不按函数名分域。** 同一能力若既像「问阿寅」又像「操作系统」，默认：陪伴只读解释走 Confide；写盘 / 外发 / 装包走 Operating。

MCP 将来是 **Tool connectivity protocol**（接在 Registry 之后），**不是产品本身**。V1 **不做** MCP。

```text
Local AI Layer → Tool Registry → Native tools（Focus Tiger）
                               → 未来 MCP tools（external）
```

---

## 5. Operating 生命周期（规范对象 · 未实现）

任何 Operating Tool 必须能讲清下列对象（实现时写进 Brief，不得缺项）：

| 对象 | 含义 |
|---|---|
| **Operating Mode** | 用户已主动进入 Auto-Operating，而不是在 Confide 闲聊 |
| **Operating Tool** | Registry 中 `domain = operating` 的一项 |
| **Risk Level** | 见 §6 |
| **Permission** | 谁允许跑（本机用户 / 将来 entitlement）；缺省拒绝 |
| **Confirmation** | 跑前用户看见什么、点什么 |
| **Execution** | 确定性服务（Backup Service、updater…），禁止模型编造副作用 |
| **Result** | 成功 / 拒绝 / 失败的可见说明（诚实，不幻觉「已备份」） |
| **Audit** | 本机可审计记录（将来）；不得 silently 外发 |
| **Failure** | 超时、校验失败、用户取消 → 不重试破坏性步骤 |

管道（规划）：

```text
Auto-Operating Entry
  → Local AI NLU（候选 tool call）
  → Registry lookup（operating + 允许的 risk）
  → Permission
  → Risk
  → Confirmation（按 §6）
  → Execution
  → Result + Audit
```

---

## 6. 风险与是否自动执行（规划）

| Risk | 示例 | 自动执行 |
|---|---|---|
| **Read** | 查询版本 / 存储占用 / 备份状态 | 可以（仍须在 Operating 入口内） |
| **Local reversible** | 改 companion style 等可还原设置 | 建议确认 |
| **External write** | Backup、Export 出沙箱 | **必须确认** |
| **System change** | Update App、改系统级设置 | **必须确认** |
| **Destructive** | bulk delete、erase all | **禁止自动**；强确认（将来可双步） |

Confide 现网对照（已实现，不在本层改）：

| Risk | Confide 策略 |
|---|---|
| read | 正则优先；regex miss 可 L0 补 `readOnly + autoExecute`（#472） |
| local_reversible | 仅正则 + Consent；模型不得写 |
| destructive / backup / update | **禁止**进 Confide registry |

---

## 7. Operating Tool 规格清单（仅 specification）

**全部未实现。** 现网备份 / 导出仍走 Journey 备份链等**专门 UI**（场景 Z），直到 Operating 真正开工并完成冲突扫描。

### READ（规划）

- `inspect_app_version`
- `inspect_storage`
- `inspect_backup_status`
- `inspect_settings`

### WRITE（规划）

- `backup_journey` — 确认后走已有 Backup Service，禁止 Qwen 声称已备份
- `export_journey`
- `change_setting`
- `update_app` / `check_app_update` — 确认后：download → verify → install → restart（细节另 Brief）

### DESTRUCTIVE（规划）

- `bulk_delete`
- `erase_all_data`

`forget_memory_entry` **不是** Operating Tool。它留在 Companion Actions（Confide + Consent）。

---

## 8. Auto-Operating Entry（未做 UI）

将来独立入口，与 Confide **并列、互不嵌套**。

建议放置（未拍板实现）：**Settings → Auto-Operating**。  
较弱：Home 主 CTA（冲淡正念伙伴主叙事）。

UI 原则：克制 command surface；可以完全不渲染阿寅。工作示意（非视觉稿）：

```text
Auto-Operating
What would you like me to do?
> backup this week's Journey
                         Run →
```

进入该入口 = 用户已声明：**我不是来和 Yin 聊天，我是来让本地 AI 帮我操作 App。**

---

## 9. 与现网 Confide 的关系（不变式）

1. Safety → 情绪桶 → Companion Registry →（regex miss 时只读 hybrid）→ YPE → L3：**不**插入 Operating 执行。  
2. 用户在 Confide 说「请备份 / 请更新 / 导出 CSV / 关闭 YPE」→ **诚实指向现有 UI 或将来 Auto-Operating**；L3 **禁止**假装已执行。  
3. Companion 只读分析仍须 **deterministic computation → 模板或受约束解释**；禁止 Qwen 编数字、禁止诊断（「焦虑缓解」）。  
4. 分析工具膨胀不得把 Confide 变成仪表盘；新 `query_*` 须已有权威字段 + 轻于专门 UI + 冲突扫描。  
5. **禁止**为 Operating 在 Confide 代码里预埋空 handler / 空 registry 项。预留 = 本文档。

---

## 10. 明确不做（直到另开产品口令）

- Auto-Operating UI、Home 入口、Settings 行  
- Operating Tool 的生产代码或占位执行  
- 把 Backup / Update / Export / MCP 接进 Confide send  
- 用 1.7B 直接操作系统写路径（无 Confirmation）  
- 把 Yin 接回「帮我操作 App」  
- 改名为 Yin CLI 对外宣传  

当前 Sprint 仍是 Companion：#472 Read Hybrid **人工验收**；至多一个新只读 tool 须另拍板。本文不改变该冻结。

---

## 11. 建议实现顺序（文档级 · 非本 PR 任务）

| 步 | 内容 | 本 PR |
|---|---|---|
| **B0** | 本文（架构） | **本文件** |
| **B1** | Auto-Operating Entry 原型 | 否 |
| **B2** | Operating Tool Registry 规格 → 代码 | 否 |
| **B3** | Permission / Confirmation 模型落地 | 否（§6 已锁原则） |
| **B4** | Backup / Export 走 Operating | 否 |
| **B5** | Update App | 否 |
| **B6** | MCP / external tools | 否 · 最后 |

Companion 侧（`LOCAL_AI_SCENARIOS_V1.md`）：验收 hybrid → 至多一个新 read tool → 更后才 `search_memory`。与 B0 **并行只允许文档**，不允许并行实现 Operating。

---

## 12. 冲突扫描备忘（实现 UI 前须重扫）

对照 `SCENARIO_TESTS.md`：

- **AE Confide**：Operating 不得嵌进倾诉卡。  
- **Z Journey 备份角**：在 Operating 的 `backup_journey` 落地前，**主路径仍是现有备份链**；两入口并存须先写互斥再拍板。  
- **AG Yin Memory**：口头 Forget 留 Confide；bulk erase 若做，只进 Operating + 强确认。

本文件入库 **不改变** 上述现网路径。
