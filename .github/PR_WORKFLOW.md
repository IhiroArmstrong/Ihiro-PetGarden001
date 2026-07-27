# Focus Tiger · PR 工作流基建

> 落地日期：2026-07-27  
> 对应需求：PR 模板 · 冒烟子集 · 预合并冲突检查 · 合并后删分支 · **Vercel Preview**（已拍板）

---

## 1. PR 模板

打开 PR 时自动载入：`.github/PULL_REQUEST_TEMPLATE.md`

要点：

- 标题前缀 `[UI]` / `[Logic]`
- 桌面 + 375 截图（或声明「不涉及窄屏」）
- 固定验收四项打勾
- 声明是否已跑 `npm run test:pr-smoke`

---

## 2. 冒烟测试分层

| 命令 | 用途 | 何时跑 |
|---|---|---|
| `npm run test:smoke` | **逻辑层**（`node --test` 子集：scenario-smoke、SessionUiGate、HUD 等） | 每个 PR（CI + 本地） |
| `npm run test:e2e:smoke` | **浏览器壳子集**（Playwright，见下） | 每个 PR（CI + 本地） |
| `npm run test:pr-smoke` | 上两者串联 | **PR 默认门禁** |
| `npm run test:e2e` | 完整 Playwright（~8+ 条） | 合并前 / 人工 |
| `npm run test:e2e:visibility` | visibility 注册表 + 全锚点 e2e | 触及 suppress 面 / 合并前 |
| `npm run docs:check` | 文档–代码契约 | develop 上 path-filter CI |

### `test:e2e:smoke` 入选用例（3 条，约 2–4 分钟含 dev server 启动）

| 文件 | 用例 | 为什么 |
|---|---|---|
| `e2e/product-shell.smoke.spec.js` | `product shell shows Sit with Yin…` | 验证 `?product=1` 能启动、Sit 可见、无调试 UI → **首屏渲染 + 无语法级崩溃** |
| `e2e/product-shell.smoke.spec.js` | `lab shell exposes reset-all…` | 验证默认 `/` 实验室入口同样能加载 → **双入口不挂** |
| `e2e/scenario-a.companion.spec.js` | `scenario A: Arrival → Here & Now starts focus timer` | 走 Sit → Arrival → Companion → **Focusing** → 验证 Idle/Arrival/Focusing 主路径 |

**刻意不纳入 PR 冒烟的 e2e**（留给完整 `test:e2e` / visibility）：

- scenario A2/A3/I/I2/K — 重要但属变体路径，PR 冒烟只锁一条主链
- `micro-ritual` / `in-app-reminder` / `reflection-intention-echo` / `weekly-practice-heatmap` — 功能域长测，合并前或 path-filter CI 再跑

---

## 3. Preview 部署（Vercel · 已拍板）

- 配置：`focus-tiger/vercel.json`
- 操作指南：`focus-tiger/docs/VERCEL_PREVIEW.md`（Import 仓库 + Root Directory = `focus-tiger`）
- 每个 PR 合并前可在 Vercel bot 评论里拿 Preview URL；产品壳加 `?product=1`

**一次性**：在 [vercel.com/new](https://vercel.com/new) 导入 GitHub 仓库即可，无需额外脚本。

---

## 4. 预合并冲突即停

Workflow：`.github/workflows/pr-merge-conflict-check.yml`

- 每个 PR → `develop`：`git merge --no-commit --no-ff origin/develop`
- 有冲突 → job 失败 + **Bot 在 PR 留言冲突文件列表**
- **禁止**任何步骤自动 `merge` / `rebase` / 解决冲突后继续

---

## 5. 合并后自动删除源分支（一次性仓库设置）

GitHub **无** repo 内配置文件可代劳，须在仓库 UI 开启一次：

1. GitHub → **Settings** → **General**
2. **Pull Requests** → 勾选 **Automatically delete head branches**

开启后，PR 合并进 `develop`（或任意目标分支）会自动删除远程 feature 分支；无需额外脚本。

---

## CI 工作流一览

| Workflow | 触发 | 说明 |
|---|---|---|
| `pr-smoke.yml` | PR → develop（focus-tiger 路径） | `test:pr-smoke` |
| `pr-merge-conflict-check.yml` | PR → develop | 预合并冲突检查 + 留言 |
| `focus-tiger-visibility-contract.yml` | path-filter（develop 已有） | 完整 visibility e2e |
| `focus-tiger-doc-contract-check.yml` | path-filter（develop 已有） | docs:check + smoke 契约片 |
