# TEST_TRACKER fragments（试点）

功能 PR **新增验收行**时，在本目录新建一个文件，**不要**直接在 `TEST_TRACKER.md` 功能清单表格里插行。

## 文件名

用当前功能分支名，把 `/` 换成 `-`，全小写 kebab-case，后缀 `.md`。

| 分支 | 文件 |
|---|---|
| `docs/tracker-fragment-pilot` | `docs-tracker-fragment-pilot.md` |
| `feature/foo-bar` | `feature-foo-bar.md` |
| `fix/arrival-flash` | `fix-arrival-flash.md` |

本 `readme.md` 与 `_` 开头的文件**不会**被拼装。

## 内容

只放要追加的功能清单行（可多行）。列约定与 `TEST_TRACKER.md` 主表相同：功能 / 类型 / 状态 / 测试步骤 / 用户反馈 / 严重度 / 处理承诺 / 本地访问路径 / 最后更新日期。

可在文件头写 `# 分支名` 注释，拼装脚本会忽略。

## 不要做

- 不要在功能 PR 里跑 `npm run tracker:assemble` 再提交 `TEST_TRACKER.md`（会回到「大家都改同一个文件」）。
- 不要用碎片复制一条主表里已有的功能名（改已有行：该行已在主表 → 改 `TEST_TRACKER.md`；还只在碎片里 → 改对应碎片）。
- 不要把用户反馈写进「测试步骤」。

## 拼装触发（试点）

权威：`TEST_TRACKER.md`「拼装触发」。功能 PR **禁止**拼装。

1. **P0**：口令「批量人工测试」/「给我待测清单」前，若本目录除 readme / `_` 外仍有碎片 → 先独立 `docs/*` PR 跑 `tracker:assemble`，再出清单。  
2. **P1**：待拼碎片 **≥ 5** → 下班前 Git 同步或下一次文档会话必须另开拼装 PR。  
3. 不做每周五定时。`tracker:check` 在 ≥5 时 WARN，不红。本轮拼装不删碎片文件。

```bash
cd focus-tiger && npm run tracker:check      # 校验碎片（docs:check 已包含）
cd focus-tiger && npm run tracker:assemble   # 把碎片折入 TEST_TRACKER.md 机器块
```
