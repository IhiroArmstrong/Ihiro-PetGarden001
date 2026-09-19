# Confide 元问题验收冻表（记忆 / 时长 / 反思）

> **状态（2026-09-19）**：冻表 + 单测锁路由桶；**过关本表 = 本轮 regex / 诚实桶验收通过**，不等于 L3 答句质量关单。  
> **代码真源**：`src/core/confide/confideMetaQueryAcceptanceFixtures.js`（**32 句** · 6 桶）。  
> **背景**：第二轮肉测「想到新说法 → 发现漏洞 → 修规则」无自然终点；参照六语 108 句闲聊冻表，为本类元问题定终止条件。

## 六桶定义

| 桶 | 含义 | 通过标准（Electron 宽屏 · memory Allow） |
|---|---|---|
| `memory_list` | CI-03 列出记忆 | `data-source=memory_list`，**0–1s**，**无** `read_hybrid_classify` |
| `reflective_honesty` | #822 诚实空态 | `data-source=reflective_honesty`，不念列表 |
| `practice_facts` | 练习时长等账本 | `data-source=practice_facts` |
| `hybrid_classify` | 正则 miss、仍须 L0 | `turns.jsonl` 有 `read_hybrid_classify` 或对应工具答句 |
| `companion_greeting` | 档 4 闲聊问候 | `data-source=companion_greeting` |
| `generate_skip_classify` | #861 明显闲聊 | **无** `read_hybrid_classify`，可进 `generate` / corpus |

## 人工验收协议

1. **壳**：`origin/develop` tip · Electron 宽屏 · `npm run desktop:dev`。
2. **顺序**：按 fixture `id` 排序逐句发送（空会话或固定单会话，全轮一致）。
3. **记录**：每句记 `data-source`、秒表、是否出现 `read_hybrid_classify`。
4. **过关线**：32/32 桶与上表一致；**不得**因即兴加句扩展本表（新漏洞 → 新 issue / 新冻表版本）。
5. **自动化**：`node --test src/core/confide/confideMetaQueryAcceptanceFixtures.test.js` 锁 regex 桶（**不**替代 Electron 路径）。

## 与肉测审计的关系

- `read-hybrid-gapfill-rate-audit.md` §5 闲聊 ≥15 + 正例 5 → **并入**本冻表（闲聊 5 + 正例覆盖 + 同义变体）。
- 本表 **不**覆盖 L3 风景/幼虎句、中文 aggression、Journey Log 口径争议——那些仍走 ISSUE_LEDGER 扇出项 4–6。

## 2026-09-19 运行时补丁（`fix/confide-meta-regex-and-acceptance`）

| 句 | 修前 | 修后 |
|---|---|---|
| `列出记忆` | regex miss → L0 真补漏 | `memory_list` 快捷规则 |
| `我最近在忙啥` | 漏诚实桶 → `generate` | `reflective_honesty`（与 `忙什么` 同桶） |

**未改**（须 PO 另议）：`我最近在忙什么` 有记忆时是否列列表（#822 关单口径仍诚实桶）。
