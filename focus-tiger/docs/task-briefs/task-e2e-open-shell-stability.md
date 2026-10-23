# Task Brief · E2E 打开链路稳定性（product-shell + :5199，与 visibility 合并）

> **状态（2026-10-23）**：**PO 已批准第一刀**（与 night full RCA、visibility「压打开超时」同线，禁止做两遍）。  
> **类**：**A**（CI 可观测 + 基建/打开链路；无用户可见文案/控件语义变更）。  
> **基线**：`origin/develop`。建议分支：`fix/e2e-open-shell-stability`（或 stacked 在 visibility 基建旁支上）。  
> **RCA SSOT**：会话 night full 对比 run [38124878581](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/actions/runs/38124878581) vs [39560728361](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/actions/runs/39560728361)。

## 一句话

在 **不拉长 timeout 掩盖** 的前提下，让 `:5199` 静态预览与 `openFreshProductShell`（goto 40s → `__FT_APP_READY__` 35s → `#btn-focus`）在 CI 上可观测、可回归；验收 **night full shard 3/4** 与 **visibility scenario-a** 的 **一次就过 / 重试才过** 占比同向下降。

## 范围（必须）

1. **先可观测，再修复**（同 PR 内两阶段 commit 可，但日志/指标必须先落地）  
   - 分桶统计（每 shard / 每 visibility job 或汇总 step 日志）：  
     - `waitForPreviewHealthy` 失败次数  
     - `page.goto` 40s `domcontentloaded` 超时次数  
     - `__FT_APP_READY__` 35s 超时次数  
     - `#btn-focus` 15s 不可见次数  
   - 输出须进 **Actions 日志可搜**（例如 `FT_E2E_OPEN_METRICS` 单行 JSON 或分阶段 counter）；不依赖人工翻 HTML report。

2. **禁止** 通过单纯增大 `gotoMs` / `readyMs` / `navigationTimeout` 把 job 刷绿（若需调整须有 RCA 子因 + 非默认 CI 配置隔离）。

3. **与 visibility 合并处理**  
   - 共享：`focus-tiger/e2e/helpers/product-shell.js`、`ft-playwright-static-5199`、CI `workers:1`、重媒体 stub。  
   - 同一修复须同时在 **focus-tiger-e2e-full.yml** 与 **focus-tiger-visibility-contract.yml** 路径验证。

4. **验收口径（写进 PR）**  
   - 贴 **workflow_dispatch 或 develop 上** 一轮 night full + 一轮 visibility 的 run 链接。  
   - 表：`一次就过 | 重试才过 | 硬失败`（Playwright list 小结；JUnit retry 附件交叉）。  
   - **不**以「workflow 全绿」单独过关（10-11 已证 45.5% 重试绿）。

## 明确不做

- 不勾 GitHub Required / 不抽 core 26 / 不启动「连续全绿计时」。  
- 不把长 e2e 升为合并门槛。  
- **不**在本 PR 改宽屏 ⋯ 菜单产品行为（见 T25 / 菜单 e2e 对齐另 PR）。  
- **不**并进 10-12 `sanctuary-nav` Type A（独立小 PR，等 PO 一句）。

## 非范围但相关（后续 PR）

- `ground-exercise-menu` / `today-direction-manual-entry` 等仍直接断言 `#ft-wide-more-menu` 可见的 spec → 对齐 `expectWideMoreMenuShellVisible` / `pickWideMoreRadialGroup`（菜单 RCA 已判：产品 radial 先行，非壳未开）。  
- `weekly-practice-heatmap` 375 CTA `sanctuary-nav` 期望（PO 确认后 Type A fix）。

## 变体矩阵（A10）

本次不新增练习种类、商品类型、宽窄视口分叉或多语言入口差异，变体矩阵跳过。

## 点击反馈（0–1 秒）

本次无可点击交互改动，点击反馈节跳过。不涉及用户可见新控件（**A 类**）。

## 边缘状态（A14）

本次无付款/已购/练习结束/窄屏专属分支，边缘状态节跳过。

## 测试计划

- 本地：`cd focus-tiger && npm run test:e2e -- e2e/product-shell.smoke.spec.js`（若动 product-shell）。  
- CI：手动触发 `focus-tiger full e2e` + `focus-tiger visibility-contract e2e` on develop tip；对比 metrics 行与 flaky%。  
- 仍跑 `npm run test:payment-contract` 若动共享 preview/overlay（通常不碰）。
