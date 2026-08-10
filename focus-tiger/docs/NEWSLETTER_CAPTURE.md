# Stay in touch · Newsletter capture

> **状态（2026-08-10）**：菜单常驻入口 + mock provider 已实现（`feature/newsletter-community-capture`）。  
> **性质**：可选邮箱留资，**不是**账号 / 登录系统；**不**挂钩 entitlement / tip / sanctuary。  
> **本期不做**：情境软提示（Phase 2）、真实 ESP / Worker 部署。

## 产品入口（已实现）

| 项 | 说明 |
|---|---|
| 菜单位置 | Idle ⋯ / 窄屏抽屉，紧邻 **Buy Yin a Tea** 下方 |
| Stay in touch | 打开 `#newsletter-capture-card`；提交走 `NewsletterProvider` |
| 提交后 | 菜单行变为 **You're subscribed**（`interactive: false`），不可再开表单 |
| Join our community | 静态外链（占位 URL，见 `communityLink.js`） |
| 本地状态 | `focus-tiger.newsletter-capture.v1` → `{ submitted }` 仅标记；**不**存邮箱明文 |

## Provider 接口（已实现）

- `setNewsletterProvider` / `getNewsletterProvider`（`src/core/newsletter/newsletterProvider.js`）
- 现行：`createMockNewsletterProvider()`（本地假装成功）
- 换真实实现时：**保持接口不变**，只换 provider + Worker，不改菜单 / 卡面契约

---

## 实施备忘 · 以后切换真实 provider（已拍板 · 2026-08-10）

> 以下五点是给「接真实 provider」任务准备的背景。**本期 mock 不实现这些**；以后开工时照此执行，**不必重新讨论**。

### 1. 发信域名

- 使用已有域名 **`twinsology.com`**（不需新购）
- SPF / DKIM / DMARC 配在该域名 DNS 上
- **不要**用 `focustiger.app`（该方案已作废）
- DMARC 起步策略 **`p=none`**（先收集报告）；观察一段时间无问题后再逐步收紧到 `quarantine` / `reject`——禁止一上来用严格策略

### 2. 邮箱存储（自建）

- 邮箱直接存 **Cloudflare KV（或 D1）**
- **不用** Resend Audiences / Contacts（按联系人数量计费的名单管理；我们不需要其分群 / 群发 UI）
- 自建存储成本接近 0

### 3. 发信（Resend transactional only）

- 只用 Resend **`emails.send()`** 事务型单次发送（如欢迎信）
- 走免费档额度（约 3000 封/月、100 封/天），不涉及付费档
- 不把 Resend 当邮件列表产品使用

### 4. 退订机制（法律责任 · 与发信同批）

必须自建，**不是可选项**：

- 每个邮箱一个 **退订 token**
- Worker 端点接收退订请求，并从 KV/D1 **移除**该邮箱
- 以后每一封发出的邮件都须带 **有效退订链接**

这是 CAN-SPAM（美国）与 GDPR/PECR（欧盟/英国）硬性要求。  
**「接 Resend 发信」与「退订端点 + 链接」必须同批排期**——禁止只做发信不做退订。

### 5. Worker 部署节奏

- **不必**现在单独排期部署
- 真要切换真实 provider 时，把 DNS 记录、KV/D1、Resend、退订端点、前端换 provider **作为同一批工作**一起部署

---

## 相关代码

| 路径 | 角色 |
|---|---|
| `src/core/newsletter/newsletterProvider.js` | Provider 接口 |
| `src/core/newsletter/mockNewsletterProvider.js` | 现行 mock |
| `src/core/newsletter/newsletterCaptureGate.js` | 本地 `submitted` 标记 |
| `src/ui/NewsletterCaptureUI.js` | 玻璃卡 UI |
| `src/core/communityLink.js` | 社群占位外链 |
| `src/core/idleChromeOrchestration.js` | 次级菜单行（`newsletter` / `community`） |
