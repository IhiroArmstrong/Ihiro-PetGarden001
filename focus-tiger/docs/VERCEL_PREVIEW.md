# Focus Tiger · Vercel Preview 部署

> 状态：配置已入库（`focus-tiger/vercel.json`）；**一次性**在 [Vercel 控制台](https://vercel.com/new) 导入 GitHub 仓库即可。  
> 费用：**$0**（Hobby 计划；公开仓库 PR Preview 足够）。

---

## 一、Vercel 导入步骤（约 5 分钟）

1. 打开 [vercel.com/new](https://vercel.com/new)，用 GitHub 登录。
2. **Import** 仓库：`IhiroArmstrong/Ihiro-PetGarden001`。
3. **Configure Project** 关键项：

   | 字段 | 值 |
   |---|---|
   | **Root Directory** | `focus-tiger` ← **必改**（Edit → 选子目录） |
   | Framework Preset | Vite（通常自动识别） |
   | Build Command | `npm run build`（`vercel.json` 已写，可不改） |
   | Output Directory | `dist` |
   | Install Command | `npm ci` |

4. **Environment Variables**：当前 MVP **不需要**（无 API Key）。
5. 点 **Deploy** 完成首次 Production 部署。
6. **Settings → Git**：
   - Production Branch：建议 **`develop`**（与 PR 合并目标一致；若团队以 `main` 为生产可改回 `main`）。
   - 勾选 **Preview Deployments** for Pull Requests（默认开启）。

导入后，每个 PR 会自动出现 **Preview URL** 评论（Vercel bot）。

---

## 二、本地验证 build（可选）

```bash
cd focus-tiger
npm ci
npm run build
npm run preview   # 本地预览 dist
```

产品壳：`http://127.0.0.1:4173/?product=1`

---

## 三、Preview URL 用法

| 入口 | 路径 |
|---|---|
| 产品壳（验收默认） | `https://<preview-host>/?product=1` |
| 实验室壳 | `https://<preview-host>/` |

PR 模板要求附 **桌面 + 375** 截图时，可直接对 Preview URL 截图，无需本地 `npm run dev`。

---

## 四、配置文件说明

- **`focus-tiger/vercel.json`**：构建命令、输出目录、SPA fallback（非 `/assets/*` 路径回 `index.html`）。
- 素材体积较大时，首次 Preview build 可能 **2–5 分钟**，属正常。

---

## 五、故障排查

| 现象 | 处理 |
|---|---|
| 404 on refresh | 确认 Root Directory = `focus-tiger` 且 `vercel.json` 已合并 |
| Build 失败 `npm ci` | 确保 `package-lock.json` 已提交 |
| 白屏 | 浏览器控制台看资源 404；多为 Root Directory 指错 |
| Preview 未出现在 PR | Vercel → Project Settings → Git → 确认已连仓库且 PR Preview 开启 |

---

## 六、与 CI 的关系

- **PR 冒烟**：GitHub Actions `test:pr-smoke`（逻辑 + 3 条 e2e）— 与 Vercel Preview **并行**，互不替代。
- **完整 e2e / visibility**：合并前或 path-filter workflow，不在每个 PR 强跑。

详见 `.github/PR_WORKFLOW.md`。
