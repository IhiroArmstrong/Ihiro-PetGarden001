# Task Brief · 用户帮助中心（可浏览 · 独立入口）

> **状态（2026-10-09）**：**已合 #1120**（菜单 + ? 链）· **本批**：已审 catalog **38** 条 + 呼吸盘点 **0006** → 帮助中心 **39** 主题（`help-center.json` + `helpCenterCatalog.js`）  
> **分支建议**：`feature/user-help-center`

## 产品拍板

| 项 | 口径 |
|---|---|
| 帮助中心 | **做**：用户可自行翻看的主题目录 + 文章详情 |
| 左下「?」 | **不改**为说明书；仍只出产品简介卡（wellness + colophon 等） |
| 知识库 | 阿寅 Confide **短答检索不变**；帮助中心用**单独用户向 manifest + locale**，不整库暴露 |
| 内部排障 | **禁止**对用户展示（`KB-OPS-*`、错误码、上报路径等） |
| 入口 | **单独**：`⋯` / 抽屉 Preferences →「帮助中心」；**不**占用「?」主路径 |

## 范围

### 做

- `HelpCenterUI`：玻璃卡、目录、文章详情、Esc / 空白关闭（与 Journey Log 同级 overlay 契约）
- `helpCenterCatalog.js`：显式 allowlist（可追溯 `KB-FUNC-*` / `KB-EDU-*` id，正文走 `help_center.*` locale）
- 菜单一行 + `main.js` / `IdleChromeFacade` / 宽窄菜单 proxy 接线
- en + ja + zh 文案；单测；更新 `product-knowledge-base.md` §一、`ONBOARDING_HINTS.md`、`MENU_CHROME_CENSUS.md`

### 不做

- 不把 `productKnowledgeCatalog.json` 全量渲染成 FAQ
- 不改 Confide 检索闸门与短答生成逻辑
- 简介卡底部链：「查看全部主题 → 打开帮助中心」（先关简介卡再开帮助中心）

## 冲突扫描（相邻场景）

- **场景 ? / 用途卡**：帮助中心为菜单打开的另一叠层；? 行为不变 → **无职责重叠**
- **Confide KB**：后台检索 vs 前台静态文章 → **无强度错位**（倾诉仍短答，不念长稿）
