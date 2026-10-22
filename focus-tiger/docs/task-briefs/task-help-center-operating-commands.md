# Task Brief · Help Center 问卡办理（T34）

> **状态（2026-10-21）**：**PO 已点头（口令：立刻安排 · 改 Brief 挡放行）。** 点头前 **禁止**改 `src/`。  
> **类别**：**B 类**（Help Center 提交后可能真备份/导航/改设置，与现网 T22「只列卡不办理」冲突）。  
> **代号**：**T34**（Help Center 与 T10 同一封闭指令集 · 办理能力）。  
> **父规格**：[`task-confide-product-ask-entry-split.md`](./task-confide-product-ask-entry-split.md)（T21）· [`task-yin-voice-command-entry.md`](./task-yin-voice-command-entry.md)（T10）  
> **交叉**：[`CONFIDE_NOW.md`](../CONFIDE_NOW.md) · [`task-user-help-center.md`](./task-user-help-center.md) · Voice Input V1 · 场景 AX · 受保护付款路径

---

## 0. 大白话（PO 2026-10-21）

用户在 **Help Center 问卡框**里，也应能像对阿寅下指令一样办完 **封闭集里允许的事**（例如备份、打开某页），而不是永远只能「搜到一张说明卡」。  
这和 T21 里「祈使句不办理、办理走 T10」**冲突**；PO 决定：**以本 Brief 为准**，**10/31 倾诉放行前须 T34 合入并验收**，否则 **不得按原日历放行**。

**不推翻：** 疑问句仍优先 **列 2–3 张卡**；危机 / FORGET 仍 **先于** 任何办理；付款结账仍 **C 档**且走既有 Stripe 契约。

---

## 一、拍板锁（点头即锁）

1. **同一封闭指令集。** Help Center 问卡 **提交** 与 Confide **T10 称呼词通道** 共用 [`task-yin-voice-command-entry.md`](./task-yin-voice-command-entry.md) 的封闭集、A/B/C 档、Never-Cloud、安全优先顺序（危机 / 边界 / FORGET **先于** 指令）。**禁止**在 Help Center 发明第二套「能备份的词表」。  
2. **提交优先级（Help Center 单框）。**  
   `安全层` → `封闭指令集命中` → **办理**（字+声、B/C 复述确认同 T10）→ **未命中** → **现有 T22 列卡检索**（规则 + embedding，不执行 1.7B 自由编排）。  
3. **句式。**  
   - *How do I back up my data?* → **列卡**（T22，不办理）。  
   - *Hi Yin, please backup all the app data for me.*（及 T10 §8 近义）→ **办理**（B 档确认）。  
   - *Back up now* / 其它 **封闭集内祈使** → **可办理**（同档确认），**不得**静默写盘；**不得**因「在 Help Center」就降级为只列卡。  
   - 未命中封闭集、也不像产品问 → 列卡或「没有合适的卡」；**禁止**「我不能办」羞辱句。  
4. **与倾诉分工。** Confide 内仍：无称呼词 → 倾诉；有称呼词 + 封闭集 → T10。T23 跳转句 **不变**（高置信度产品 how-to 仍去 Help Center）。T34 **不**要求用户在倾诉里先念 Hi Yin 才能备份——**在 Help Center 框里可直接办**（封闭集 + 确认档）。  
5. **10/31 放行闸。** [`CONFIDE_NOW.md`](../CONFIDE_NOW.md) 放行清单增加 **T34** 行：**未合 develop 或未勾验收 → 10/31 不得勾选「到线放行」**（与 PO「挡放行」一致）。安全英文线仍必须先绿；T34 不替代安全回归。  
6. **现网 T22 #1348。** 当前实现 **只列卡、祈使不办理** = **已知规格缺口**，在 T34 合入前 **不算** Help Center 产品问链路「规格完成」；T22 手测关单 **须等 T34** 或 PR 描述写明「operating 行待 T34」。

---

## 二、做 / 不做

**做：** Help Center 问卡提交路径接入共享 operating 解析 + handler；B/C 确认 UI 在 Help Center 面板内或共用组件（须 0–1s 可见反馈）；单测 + e2e（至少备份 B 档一条、祈使不静默执行、疑问句仍列卡）；更新 `helpCenterAskSearch` 与 operating 优先级；黄金脚本/手测表 **补 Help Center 办理行**（英文先行）。  

**不做：** 新封闭指令（第一刀仍 T10 S2：备份 + 两个 A 档）；独立倾听面；1.7B 决定是否办理；在 Help Center 静默 Stripe；改 T14 危机入口；缩小 T23 跳转范围。

---

## 三、变体矩阵（A10）

| 变体 | 入口 / 前置状态 | 预期（可见结果） | 自动化 |
|---|---|---|---|
| Electron 宽屏 | Help Center 问卡提交 | 命中封闭集 → 办理流；未命中 → 2–3 卡或空态 | 单测 + 1 e2e |
| 窄屏 / Web 无麦 | 键盘提交 | 同逻辑；无麦不挡办理 | 窄屏一步 |
| ≤8GB | 无 1.7B | 规则 + STT 仍可走 B 档备份（同 T10） | 禁止「先下模型」 |
| 危机 / FORGET 句进框 | 提交 | **不**备份；走安全 / C 档 Forget | 与 T10 同表 |
| 付款 / Support FAB | 说「买 Pro」 | C 档；不碰 `#yin-support-fab` 契约 | `test:payment-contract` 若动 z-index |

---

## 四、点击反馈（0–1 秒）（A14）

| 控件 | 0–1 秒内 | 持久化 |
|---|---|---|
| 问卡提交（命中办理） | 进入 B/C 复述或执行中态；**禁止**静默 | 不写云 |
| 问卡提交（列卡） | 与现 T22 相同 | — |
| B 档 Cancel / 确认 | 与 T10 同口径（10s 窗等） | — |

---

## 五、边缘状态（A14）

| 边缘 | 预期 |
|---|---|
| 听写进框未提交 | 不办理、不检索 |
| 办理中关 Help Center | 与 T10 取消规则一致；不得半份备份无提示 |
| 封闭集外祈使 | 列卡或空态，不执行 |
| Confide 倾诉同句 backup 无称呼 | 仍倾诉，**不**因 T34 改变 |

---

## 六、冲突扫描

| 相邻 | 结论 |
|---|---|
| **T22 列卡** | **有冲突 → T34 覆盖 T21 §7「祈使不办理」。** 实现后疑问句仍列卡。 |
| **T10** | **无职责冲突**；须 **抽共享模块**，避免两套规则漂移。 |
| **T23 跳转** | **无冲突**；倾诉仍跳转到 Help Center 办理/问卡。 |
| **AX Help Center** | **增强**；目录与问卡框并存。 |

---

## 七、验收（实现时勾）

- [ ] *How do I back up?* → 列卡，**不**写备份文件  
- [ ] *Hi Yin, please backup…* → B 档复述 → 确认后备份（Help Center 内）  
- [ ] *Back up now* → **不**静默备份；走 B 档或列卡（与封闭集规则一致，须与 T10 同句表）  
- [ ] 危机句进框 → **0** 次误备份  
- [ ] `npm run test:smoke` + 付款契约（若动共享层）  
- [ ] CONFIDE_NOW 放行清单 **T34** 可勾  

---

## 八、口令

| 口令 | 动作 |
|---|---|
| 「按 T34 Brief 开工」 | 实现 Help Center 办理；**新 Chat** 建议 |
| 「先挡放行」 | **仅本文 + CONFIDE_NOW**（已完成 2026-10-21） |

*点头前本页不改用户可见办理行为。*
