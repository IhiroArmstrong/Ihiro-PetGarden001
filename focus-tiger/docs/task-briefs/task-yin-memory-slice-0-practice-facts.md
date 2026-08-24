# Task Brief · Yin Personal Memory · Slice 0（练习字段事实应答）

> **状态（2026-08-25）**：**Slice 0 开工**（口令「开工 Yin Personal Memory」）。Confide「我练了多久」接到本机练习字段。**禁止**本切片写 Consent UI / Remember 管道 / 四类 store。  
> **权威架构**：`YIN_PERSONAL_MEMORY.md`（方向锁仍有效）。**禁止**本 Brief 合入后默认写 store / Consent UI / Remember 管道。  
> **开工口令**：仍须「开工 Yin Personal Memory」（可先只做本 Slice 0；全套 Remember/Use/Forget 可同口令后分段）。  
> **前置**：生产 1.7B 已接线（#419）；场景 AE 关单级「能聊」**2026-08-25 用户书面已关**。  
> **对照**：`task-desktop-on-device-companion.md` · 场景 AE / Z · `PracticeDaysStore`

---

## 用户触发（2026-08-25）

Electron Confide（1.7B 已显示）问 **How long have I practiced?** 得到含糊句（如 “I have been observing you for a while.”）。用户书面：外在记忆落地后须**精确**；上次架构计划应继续安排。

闲聊质量：用户书面「1.7B 问答水平基本可以」（**不是** AE 关单；关单仍须 `qa-pass-coverage-split`）。

---

## 冲突扫描

对照 `SCENARIO_TESTS.md`。

| 轴 | 相邻 | 判断 |
|---|---|---|
| **a. 强度** | AE Confide；Z Journey Log | 口头问一句应比打开 Log 更轻。禁止为此弹记忆面板或冷启动同意窗。 |
| **b. 人设** | 观照者；情绪桶；safety-01 | 只报系统已有数字（天数 / 累计分钟）。禁止「你练得不够」；危机/抑郁句仍走语料，**不**用时长应答顶掉。图 3「I feel depressed」路径保持 corpus。 |
| **c. 职责** | Z Journey Log；练习云备份 6 key；`turns.jsonl` | **不另建账本**。读 `PracticeDaysStore`（及现有完成分钟字段）与 Log **同一数据源**。Memory ≠ Log：Log 给人看列表；本切片只在层 3 之前用事实挡住幻觉。不进练习云备份。 |

**未拍板（仍禁）**：把 generate 扩到 Reflection / Whisper / Journey Log 润色。

---

## 做什么（运行时 · 须口令后）

1. Confide 分类：识别「练了多久 / how long have I practiced / 坐了几天」类意图（仅英文+中文短清单，禁止开放域）。  
2. 安全阀 / 情绪桶命中 → **不**走本切片。  
3. 从未匹配落到 Qwen 之前：注入或**模板短句**使用本机字段（练习日数、累计分钟；无数据则诚实「还没有记下时长」，禁止编造）。  
4. Qwen 若仍生成，不得覆盖系统数字。事实由系统给（架构 §2 #8 / §10）。

**不做（本 Slice）**：Preference（喜欢吃什么）；Consent 面板；Forget UI；从倾诉正文抽取；仪式 generate。

---

## 验收（口令开工后）

- Electron 宽屏：问 How long have I practiced? → 数字可与 Journey Log / `PracticeDaysStore` 对上。  
- 「I feel depressed」仍语料短句，不报练习账。  
- Web / 窄屏仍检索不生成。

