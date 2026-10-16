# GLOSSARY.md — 会话任务术语表（会变的内容）

创建日期：2026-10-16  
权威路径：`focus-tiger/docs/GLOSSARY.md`  
索引：`RULES_INDEX.md` → `communication-glossary`（`communication-glossary` 主题 id）  
规则：`.cursor/rules/focus-tiger-communication-consistency.mdc`

**分工**：本表 = 会话里用的 **T 代号 + 执行状态 + 风险一句话**；**排期槽位**与 [`SCHEDULING_GLOSSARY.md`](SCHEDULING_GLOSSARY.md) §1 对齐。改队列时须**同时**更新两文件，或先改 `SCHEDULING_GLOSSARY.md` 再同步本表。

**状态词**（仅此五种）：立即做／排队中／搁置／已完成／阻塞。

---

## 当前任务（2026-10-16 晚 · PO 队列拍板）

| 代号 | 名称 | 状态 | 排期槽位 | 风险(等级+原因) |
|---|---|---|---|---|
| **T1** | 文档同步 PR（账本 A9–A13 · #1288） | 已完成 | P1 | 低：纯文档 |
| **T2** | Confide CR-50 事实键（#1287） | 已完成 | P2 | 高：Confide 发送链；已合 develop，`test:smoke` 已绿 |
| **T3** | TASKS 机器块拼装（单独小 PR） | 搁置 | 可选 | 低：机械刷新；禁止与功能 PR 同批手改 |
| **T4** | 根因行动 A15 · A16 · A17 | 搁置 | 未排期 | 高（A15 资产入库）；A16/A17 低流程——PO 不安排 |
| **—** | Confide 下一刀（形状轴 / CR-45） | 搁置 | — | 高：发送链邻接；**须 PO 口令**，见 `CONFIDE_STATUS.md` §6 |

### 代号对照（禁止再换别名）

| 曾出现的混用说法 | 统一写法 |
|---|---|
| #1 / 文档刀 / PR #1288 不说槽位 | **T1** · P1 |
| #2 / Confide PR / CR-50 产品旁支 / `feat/confide-cr50-asked-fact-keys` | **T2** · P2 |
| TASKS.md 机器块拼装（未登记就出现） | **T3** · 可选 |
| A15–A17 / 高风险全放下 | **T4** · 未排期（根因行动） |

**口令**（触发执行，不是新任务名）：「继续 CR-50」或「开 Confide PR」= 在 **T2** 上开工，见 `SCHEDULING_GLOSSARY.md` 口令表。

---

## 修订记录

| 日期 | 说明 |
|---|---|
| 2026-10-16 | 初版：与 `SCHEDULING_GLOSSARY.md` §1 同步 T1–T4 |
