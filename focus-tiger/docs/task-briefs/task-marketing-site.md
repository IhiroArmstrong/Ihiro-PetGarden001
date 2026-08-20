# Task Brief · 宣传 / 营销站（Twinsology · Focus Tiger）

> **状态（2026-08-20）**：公开营销域已拍板 **`twinsology.com`**。**Slice 0 静态页已入库** `marketing-site/`。现网自定义域仍须本机 Cloudflare Pages 绑定（Cloud Agent 无 wrangler 登录）。  
> **性质**：获客向静态站，**不是**练习壳、不是 PWA、不是 Cloudflare Worker API。  
> **权威交叉**：`PRODUCT_POSITIONING.md`（品牌 / 宁静型游戏化）· `PRINCIPLES.md`（禁止 FOMO / 硬推销）· `NEWSLETTER_CAPTURE.md`（发信已用同一域）· `ENV_CONFIG.md`（公开 hostname）· `PROCESS.md` Backlog「宣传 / 营销站」。

## 拍板（2026-08-20）

1. **公开营销域名** = **`twinsology.com`**（已用于 `hello@` / `restore@` 发信，Resend 已验证该域）。  
2. **不要**另开 `focustiger.app`（或其它新购买名）当宣传站。发信侧已禁止用 `focustiger.app`；营销站同一口径。  
3. **练习产品壳不搬家**：现网 API 仍是 `https://focus-tiger-cloud.ihiro.workers.dev`；本地 QA 仍是 `:5173`；Electron 仍是桌面壳。本拍板**不是**给练习 App 绑自定义域。

## 默认（可推翻 · 未另拍板则按此做）

| 项 | 口径 |
|---|---|
| Canonical URL | `https://twinsology.com`（apex） |
| `www` | `https://www.twinsology.com` **301 → apex** |
| 站点身份 | **Twinsology 工作室首页，主角是 Focus Tiger**（colophon 已写 product of Twinsology）。不是多产品门户，也不是把练习壳挂在根路径。 |
| 托管 | 同一 **163 / ihiro Cloudflare** 帐号上的 **Cloudflare Pages**（静态）。与 `focus-tiger-cloud` Worker **分项目**。 |
| DNS | 只加 Pages 所需的 apex / www。**禁止**改 MX / SPF / DKIM / DMARC / Resend 验证记录。 |
| 语气 | 观察式、宁静；允许委婉付费感知；**禁止** FOMO、倒计时、强迫签到、街机狂欢。 |
| 应用内接线 | **本切片不改** `communityLink.js`（仍是 `example.com` 占位）。Join our community 改指向营销站 = **另口令**。 |

## 与相邻入口的分职

| 入口 | 职责 | 本站是否替代 |
|---|---|---|
| 应用内 Stay in touch | 已练习用户可选留资；From `hello@twinsology.com` | **否**。营销站以后若做留资，是公网漏斗，须另 Brief（CORS 要放行 `twinsology.com`）。 |
| Join our community | 占位外链 | **否**（本切片不动）。 |
| 练习壳 / PWA / Electron | 真正坐禅 | **否**。禁止把 `public/sprites` 重型 App 部署到营销 apex。 |
| Newsletter 发信 DNS | `hello@` / `restore@` | **共用域名、分记录**。网站记录不得覆盖邮件记录。 |

## Slice 0（口令「开工宣传站 Slice 0」· 2026-08-20 已入库）

最小可上线页（仓库 `marketing-site/`）：

1. 一屏：Focus Tiger™ + Yin / 阿寅 + Twinsology 署名。  
2. 两三句定位（从 `PRODUCT_POSITIONING` 品牌定义来，禁止新编硬推销）。  
3. 联系：`hello@twinsology.com`（mailto；**未**接 Newsletter API）。  
4. **无**「Open the practice」指向 `*.workers.dev`。  
5. 仓库落点：独立目录 `marketing-site/`（kebab-case ASCII），**不**塞进 `focus-tiger/src`。

现网：Pages 项目 + 自定义域须你在 **ihiro Cloudflare** 控制台绑定。**禁止**改 MX / SPF / DKIM。契约单测：`node --test marketing-site/slice0-contract.test.js`。

## 明确不做（本拍板 / Slice 0）

- 练习壳自定义域 / 把 Vite 产物挂到 `twinsology.com/`  
- 改 `communityLink.js` / Stay in touch 文案  
- 改 MX / SPF / DKIM / `RESEND_FROM` / `NEWSLETTER_FROM`  
- 博客、店铺、Discord、多语言整站、SEO 大战、分析像素（未单独立项前）  
- FOMO / 硬推销 CTA  

## 排期口令

- **已完成**：域名拍板；**Slice 0 静态页**（`marketing-site/`）。  
- **下一步（须本机 Cloudflare）**：Pages deploy + 绑定 `twinsology.com` / `www`（见 `marketing-site/README.md`）。口令可写 **「绑定宣传站域名」**。  
- 应用内 Join our community 改链、公网留资表单、`app.twinsology.com` = 更后面的独立口令。

## 冲突扫描（Slice 0）

对照 Stay in touch / Join our community / 练习壳：本站是公网门面，mailto 不替代应用内留资；不改 `communityLink.js`；不把练习壳挂到 apex。语气用定位稿英文，禁止 FOMO。**无冲突**。接线 Join our community 那一刀须重扫。
