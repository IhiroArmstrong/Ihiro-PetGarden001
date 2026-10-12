# Task Brief · A5 推送前启动冒烟

> **状态（2026-10-13）**：**PO 已点头 · 开工**（口令「立刻开工 A5」；规格锁在盘点表 `root-cause-audit-2026-10-12.md` §4 A5）。  
> **类**：**A**（开发钩子；不改用户可见路由 / 回复 / 等待）。  
> **依赖**：A22 钩子目录已合 [#1171](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1171)。

## 一句话目标

推代码到远端前，本机必须先证实 App 能启动：`__FT_APP_READY__ === true`，且没有未捕获的页面错误。只改文档的推送可以跳过。

## 范围（in）

- `.husky/pre-push` → `scripts/pre-push-startup-smoke.js`
- 单 spec `e2e/startup-ready.smoke.spec.js` + Vite 配置 `playwright.startup.config.js`（约 1 分钟，不跑 production build）
- 占用检查：`.husky/pre-push` 缺失即 BLOCK
- `WORKFLOW.md` / `testing-strategy.mdc` / `DOC_CODE_CONTRACT.md` 同步说明

## 范围（out）

- 不把本 spec 并进 `test:e2e:smoke` / `test:pr-smoke`（那是更宽的壳冒烟，仍走 CI）
- 不做 A6 先用后定义静态检查、A7 `init()` 拆分
- 不改产品运行时、Support / Stripe

## 点击反馈（0–1 秒）

不涉及可点击交互。

## 共用机制核对

本次不触及 overlayBusy / HUD 呼吸驱动 / z≥17 遮罩 / 新建可点击叠层。  
不改 `#yin-support-modal` / Support FAB / Stripe CTA。不涉及后台网络。

## 冲突扫描

无用户路径。相邻场景（冷启动 / Sit）画面不变。

## 已好清单

- A22：`core.hooksPath=.husky` 仍有效；`pre-commit` 仍跑 `test:smoke`
- 文档-only 推送不强制起浏览器
- 本地 e2e 硬顶仍禁止全量 / 多 spec；本条是固定单 spec

## 验收

1. 单测：docs-only 跳过；含 `src` 的推送会调冒烟；冒烟红则拒绝。
2. 占用检查：缺 `pre-push` 文件失败。
3. 本机 `npm run test:e2e:startup` 在当前 develop 绿。
4. `npm run test:smoke` 绿。
