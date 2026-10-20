---
ledger: T23 跳转漏接备份 where-click；英文名词化复述；Confide 倾听说明
kind: note
status: 跟进中
updated: 2026-10-20
---

本支只记 2026-10-20 T22 手测 + Confide 抽测。**不改发送链、不加问法关键词。**

## T22（问卡）

通过：#1348 Checks 绿；`How do I back up my data?` 有卡可点；`Back up now` 有卡未执行备份；停录不自动搜。未关单。

## T23 备份 where-click（漏跳转）

用户：`Where can I click to back up the data?` → `I do not know where to click for that.`（期望 Help Center 跳转句）。同场 `How do I back up my data?` 跳转正确。

本机对照（`origin/develop` `8970c2dd`）：

- 问法形状：`where`，算操作问法。
- 产品对象：`hasConfideCatalogNounObject` 为假——目录关键词是 `backup`，用户写 `back up`（中间有空格），字面 includes 对不上。
- T23 跳转还要闸门 `hit`/`honesty` 或 Help Center 摘录命中。对象闸不过、摘录也未撑住时 → `skip` → 本地生成「不知点哪」。
- 不是「从没做备份知识」；是 CR-47「操作问法 ∧ 对象」在空格变体上对象侧为假。

处理：机制刀（对象归一 / 确认后的操作问法即使向量未当产品也走诚实/跳转），**禁止**把这句写进 keywords。占号仍是 **CR-47**（及已合的 T23 跳转条件）。10/27 发送链冻结前须 PO 点头才改代码。

## 过跳转 / 未跳转（同场，不另开字面补丁）

- `How to understand Zen practice?`：`activityHowTo` 为真 → 按现网会跳转；用户期望陪伴生成。属操作 how-to 过宽，仍归 CR-47，不单独立项加「Zen」黑名单。
- `What is microphone meditation`：`ACTIVITY_WHAT_IS` 把 what-is+meditation 判成非产品问 → 生成/茶句。不是漏接备份闸。
- `How many (Yin) badges`：`how many` 不在 how/where 形状里 → 默认生成。徽章条目已有 CR-06 / catalog 行；本场是「枚数问」不是「徽章当寅币」。
- `Why should I do some meditation?`：负例，**不该**跳转；答非所问是生成质量，不是 T23 漏跳。

## 复述提问

`Feeling not quite happy…` / `Sister's dislike of fat noodle.` / `Dislike of Yin.`：`isEchoOfUserLine` 与 0.55 重叠均为 false。#874 拦住的是整句/中英问句照抄，拦不住名词化短改写。下一刀 **CR-22**，禁止再加这三句到拒收表。

## 朗读

不是「情绪桶都不念」。白名单：五情绪桶 + fallback + generate。危机转介 / 攻击他人 / 未登记路由（含 Help Center 跳转）静音。`Tired. The cushion stays.` 有声 = 累桶。求死句无声 = 设计。

## 文案建议

跳转句旁加一句英文：此入口只用于让 Yin 倾听倾诉、提问或表述。优化建议，须 Brief，不挡 T22。
