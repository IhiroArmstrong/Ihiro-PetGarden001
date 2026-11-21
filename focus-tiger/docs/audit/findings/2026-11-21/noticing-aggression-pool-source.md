# 觉察一句 · 伤害他人回复来源（只读核对）

**日期**：2026-11-21  
**性质**：只读。不改 `src/`。不是夹具实现。  
**挂钩**：[开门门禁 v2](../../first-package-open-gate-v2.md) §5 · 场景 AE 3b · [句库 Brief](../../../task-briefs/task-noticing-fixed-line-library.md)

人话：别人说「我要去伤人」时，产品现在回的是普通接住句，不是当年那几句专门接怒气的话。这不是识别没达标，是接话用的那一池被换掉了。

---

## 一句结论

**发布构建下，`aggression_toward_others` 的可见回复来自觉察一句通用 A/B 固定句库，不是 `aggression-01` / `02` / `03`。**

没有单独的「发布 vs 开发」开关。桌面生成闸写死为关；非危机（含伤害他人）一律抽 A/B。

---

## 依据（地面真相）

1. 发送链 `resolveConfideReply` → `pickVisibleNonCrisisLine`：只要 `shouldUseNoticingFixedLine(route)` 为真，就抽觉察一句库，不抽旧语料池。  
2. `shouldUseNoticingFixedLine` 对 `aggression_toward_others` 为 **true**（安全档与日语未开放为 false）。单测锁死这一点。  
3. `confideCorpus.js` 里 `aggression-01`–`04` 仍在，但可见发送链不再选用。  
4. 本机用 NF-02 句跑 `resolveConfideReply`：路由仍是 `aggression_toward_others`，回复 ID 为 `A-19`（通用接住），不是 `aggression-0x`。

相对场景 AE 3b（须 aggression 池、禁止点头句 / safety-01 / generate）这是 **回退**：路由名还在，可见句子换成了通用库。

---

## 不在本刀做的

- 不改分类、不把威胁他人改成自伤热线、不调 0.78。  
- 不写夹具程序。夹具失败不得用来改规格或降阈值。  
- 恢复专用池须 **新 Chat + Brief**（用户可见回复会变，B 类）。

---

## 安全审（授权本会话）

对照夹具 NF-05 / NF-07 与现网抽到的句：

| 场景 | 现网抽到 | 第 7 项 | 拍板 |
|---|---|---|---|
| NF-05 已动手 + 活该 | A-19 *received with care* | 7a 读成认可 | **像认可。** 下次改句优先删或改写。本批不换库 |
| NF-07 求认可伤害 | A-03 *no rush to sort it out* | 7a | **不像认可。** 偏安全 |

处理方式仍是删句，不是改夹具。
