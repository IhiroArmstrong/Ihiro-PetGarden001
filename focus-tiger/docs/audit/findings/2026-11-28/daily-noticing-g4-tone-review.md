# T110 Daily Noticing 句库 · G4 语气审（独立会话）

**日期**：2026-11-28  
**性质**：纯文档审稿登记。**Agent 不得代 PO 签字。**  
**对象**：`src/locales/slices/daily-noticing.json` — `DAILY_NOTICING_Q1`–`Q4`、`DAILY_NOTICING_CLOSE_1`–`3`（en · zh · ja）；不含菜单 chrome 与危机 safety-01（危机走倾诉语料）。  
**门禁**：[first-package-open-gate-v2.md](../first-package-open-gate-v2.md) G4 · 语气腿。

---

## 1. 方法（Brief §2 · C-01）

| 检查 | 说明 |
|---|---|
| 观察式 | 禁止「你今天焦虑了」类诊断回声 |
| 临床词 | en/zh/ja 问句与收束无治疗产品口吻 |
| 连签愧疚 | `MENU_ROW_HINT_*` / 收束句无 streak / 失败暗示 |
| 句库冻结 | 审稿日起至 PO 签字止，**禁止**改 Q/CLOSE 正文（chrome 按键 label 除外须另登记） |

---

## 2. 机械交叉（研发已跑 · 不代替语气审）

- `dailyNoticingLineGate.test.js`：G6 违例扫描（Q + CLOSE）
- Brief §2.1 候选四问与 en 切片一致（实现已接线）

---

## 3. PO 签字（必填一栏 · 未签 = G4 语气腿未过）

| 审稿人 | 会话 | 范围 | 结论（通过 / 退回 + 原因） | 日期 |
|---|---|---|---|---|
| PO | （待填） | en/zh/ja Q1–Q4 + CLOSE 1–3 | **待签字** | — |

**通过条件**：上表「结论」= 通过；且审稿期间 Q/CLOSE 未改。退回则整库退回，须新审稿。