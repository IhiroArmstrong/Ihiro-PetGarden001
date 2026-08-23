# Stay in touch · Newsletter capture

> **状态（2026-08-16）**：菜单常驻入口 + 生产 Worker **订阅 + 欢迎信 await/重发仍在**（当前 Version `fb568e27-96dd-4fb1-b15c-acbac8dd919b`，覆盖 `d0140328-…` / `8c649d12-…`）。无 Cloud URL 或 `?newsletterMock=1` 时仍走 mock（实验室）。  
> **性质**：可选邮箱留资，**不是**账号 / 登录系统；**不**挂钩 entitlement / tip / sanctuary。  
> **文案（2026-08-13 批准）**：欢迎信 + 第一封群发草稿定稿，不改字。群发仍未接线。  
> **卡面（2026-08-15）**：`NEWSLETTER_CARD_BLURB` / `OPTIONAL` 说明定期更新会把 **known-error 修复** 与 **更好的最新版（latest release）** 发到邮箱；仍写「不是推销名单」。不改欢迎信正文。  
> **欢迎信（2026-08-16）**：用户再提交后书面确认仍收到 From `Yin <hello@twinsology.com>`，且 Dashboard `NEWSLETTER_KV` 有 `newsletter:v1:{email}`（JSON 含 email + subscribedAt）。2026-08-15：约 18:54+08 一封进**垃圾箱**（早于 #302，属旧 `8c649d12` `waitUntil`）；约 20:54+08 第二次提交又收到一封（无 `welcomeSentAt` 重发，属设计）。await/502 仍保留。`RB-20260815-L394` 已关。TRACKER 仍「待人工测试」（退订页 / We'll keep in touch / mock / 社群外链 / 375·宽屏未书面）。  
> **本期不做**：情境软提示（Phase 2）、Resend Audiences / 群发 UI、自动群发第一封。

## 产品入口（已实现）

| 项 | 说明 |
|---|---|
| 菜单位置 | Idle ⋯ / 窄屏抽屉（付费三项已改走右上 Support FAB，不再紧邻 Tea 行） |
| Stay in touch | 打开 `#newsletter-capture-card`；提交走 `NewsletterProvider`。**录入中点页面空白不关卡**（**SB-19**）；关卡用左下 **Cancel**、右下 **Close**，或 Esc |

| 提交后 | 菜单行变为 **We'll keep in touch**（`interactive: false`），不可再开表单。**You're subscribed** 只用于已解锁进阶仪式的付费确认行 |
| Join our community | 静态外链（占位 URL，见 `communityLink.js`） |
| 本地状态 | `focus-tiger.newsletter-capture.v1` → `{ submitted }` 仅标记；**不**存邮箱明文 |

## Provider 接口

- `setNewsletterProvider` / `getNewsletterProvider`（`src/core/newsletter/newsletterProvider.js`）
- **有** `VITE_CLOUD_API_BASE_URL`：`createWorkerNewsletterProvider()` → `POST /api/newsletter/subscribe`
- **无** Cloud URL，或 `?newsletterMock=1`：`createMockNewsletterProvider()`（本地假装成功）
- 菜单 / 卡面契约不变

---

## 真实 provider（2026-08-13 已按 2026-08-10 拍板落地）

### 1. 发信域名

- 使用已有域名 **`twinsology.com`**
- SPF / DKIM / DMARC 配在该域名 DNS 上（OTP 恢复信已走同一域）
- **不要**用 `focustiger.app`
- **宣传站（2026-08-20）**：公开营销域也是 **`twinsology.com`**（Slice 0 静态页在 `marketing-site/`；现网 DNS 未绑）。网站 DNS 与发信 DNS **共用该域、分记录**；上 Pages 时 **禁止**改 MX / SPF / DKIM / `NEWSLETTER_FROM`。权威：`task-briefs/task-marketing-site.md`。
- 欢迎信 From：**只**用 `Yin <hello@twinsology.com>`（`NEWSLETTER_FROM`）。**禁止**回退 `restore@twinsology.com`（OTP 验证码走 `RESEND_FROM`，与 Newsletter 发信信誉隔离）。域 `twinsology.com` 已整体验证，`hello@` 不必再单独验证。
- DMARC 起步仍 **`p=none`**

### 2. 邮箱存储（自建）

- Cloudflare KV **`NEWSLETTER_KV`**（与 tip / sanctuary / membership / OTP / practice-backup **分绑**）
- 键：`newsletter:v1:{email}` → `{ schemaVersion, email, subscribedAt, locale, unsubToken }`
- 反查：`newsletter-unsub:v1:{token}` → `{ email }`
- **不用** Resend Audiences / Contacts

### 3. 发信（Resend transactional only）

- 仅 `emails.send()`：订阅后发 **一封欢迎信**（**await** Resend；失败则 HTTP 502，前端不写 `submitted`）
- 已在名单且已有 `welcomeSentAt`：再次提交 **不**再发（防刷信）
- 已在名单但 **没有** `welcomeSentAt`（含 2026-08-15 旧 Worker 留下的行）：再次提交 **会重发**（即使第一封其实已进垃圾箱）
- List-Unsubscribe 自定义头若被 Resend 400，去掉该头再试一封（正文仍有退订 URL）。**禁止**回退 `restore@`
- 免费档额度；不把 Resend 当邮件列表产品

### 4. 退订（与发信同批）

- 每邮箱一个不可猜测的 `unsubToken`
- `GET /api/newsletter/unsubscribe?token=` → HTML 页（邮件内点击）
- `POST` 同路径 → `{ ok: true }`（RFC 8058 one-click；`List-Unsubscribe` 头）
- 从 KV **删除**该邮箱；无效 token 仍 200（不枚举），页上说明链接无效

### 5. 部署

生产要真实收信，须同批：

1. **`NEWSLETTER_KV` 已建**（2026-08-13）：`id=baeb661cb8f2450ab4a87d6f23af6896` · `preview_id=8e13fe05705841c9939c3164bfb9a3bd`（已写入 `wrangler.jsonc`）
2. From = `Yin <hello@twinsology.com>`（与 OTP `restore@` 隔离；域已验证）
3. `wrangler secret put RESEND_API_KEY`（若尚未）
4. `npm run deploy`（`focus-tiger-cloud`）——**2026-08-15 已执行（#302 代码）**：当时 Version `d0140328-ee54-4dbb-8710-be6675f0596a`。**2026-08-16 生产**为 `fb568e27-96dd-4fb1-b15c-acbac8dd919b`（请茶 $4.99；Newsletter 路由仍在）。无效邮箱仍 400。**2026-08-15 用户书面**：真实邮箱欢迎信已收到（含一封先落垃圾箱）；无 `welcomeSentAt` 的旧行再提交会再发一封。**2026-08-16 用户书面**：再提交 + Dashboard `NEWSLETTER_KV` `newsletter:v1:{email}` — **测试 OK**
5. 前端 `VITE_CLOUD_API_BASE_URL=https://focus-tiger-cloud.ihiro.workers.dev`（Safari 用 `http://127.0.0.1:5173`；曾 mock/假成功则先清 `focus-tiger.newsletter-capture.v1`）

---

## 欢迎信（已批准 · 已接线 · 随订阅发出）

文案在 `cloud/src/lib/newsletterCopy.ts`（en / ja / zh）。语气：观察式陪伴，**禁止** FOMO、连续打卡、购买 CTA。

**English（默认）**

> Subject: A quiet note from Yin
>
> Hello.
>
> You're on Yin's occasional list. There is no streak to keep, and nothing in Focus Tiger changes because you wrote this address.
>
> When there is something worth sending — a small update, a seasonal note, a practice worth sitting with — it will arrive here. Skipping a letter is also fine.
>
> Unsubscribe anytime:  
> _{link}_
>
> Yin  
> Focus Tiger

**日本語**

> Subject: 阿寅からの、ときどきのお便り
>
> こんにちは。
>
> 阿寅の、ときどきのお便りリストに入りました。連続記録も、売り込みもありません。この宛先を書いたからといって、Focus Tiger の練習や解除は何も変わりません。
>
> 小さな近況、季節の一言、坐ってみる価値のある練習——送る理由があるときだけ届きます。届かない日も、それでよいのです。
>
> 配信停止はいつでも:  
> _{link}_
>
> 阿寅  
> Focus Tiger

中文稿在代码里（工程字典；v1 对外仍是 en+ja）。

---

## 第一封群发草稿（已批准 · 未接线）

> **不是**欢迎信。欢迎信只在订阅当下发一次。下面是「以后真要群发时」的第一封——**本切片没有群发端点**（2026-08-13 文案已批准，不改字）。

**English draft — issue 1**

> Subject: Sitting, at your own pace
>
> Hello.
>
> This is the first occasional letter from Yin. It is not a digest of everything that happened, and not a reminder to come back.
>
> Focus Tiger is a place to sit — a few minutes, or a longer incense. There is no streak to defend, and no one keeping score of whether you opened this note.
>
> If you sit today, sit. If you don't, the cushion is still there.
>
> Yin  
> Focus Tiger
>
> Unsubscribe: _{per-recipient link}_

**日本語ドラフト**

> Subject: 自分のペースで、坐る
>
> こんにちは。
>
> 阿寅からの、最初のときどきのお便りです。まとめ配信でも、戻ってきてほしい催促でもありません。
>
> Focus Tiger は坐る場所です。数分でも、長い一炷でも。守る連続記録はなく、この手紙を開いたかどうかも、誰も数えていません。
>
> 今日坐るなら、坐る。坐らない日も、坐蒲はそこにあります。
>
> 阿寅  
> Focus Tiger
>
> 配信停止: _{link}_

**编辑纪律（以后每封都守）**

- 观察、邀请、可跳过；不说教、不追因、不贴「你不够专注」
- **禁止**购买 CTA、倒计时、断签、稀缺
- 委婉提及茶 / Membership 仅当该信主题本身是致谢或权益说明，且不得挡退订
- 每封必须带有效退订链接（CAN-SPAM / PECR）

---

## 相关代码

| 路径 | 角色 |
|---|---|
| `src/core/newsletter/newsletterProvider.js` | Provider 接口 |
| `src/core/newsletter/workerNewsletterProvider.js` | 现行真实：Worker subscribe |
| `src/core/newsletter/mockNewsletterProvider.js` | 实验室 / 无 Cloud |
| `src/core/newsletter/newsletterCaptureGate.js` | 本地 `submitted` 标记 |
| `src/ui/NewsletterCaptureUI.js` | 玻璃卡 UI |
| `cloud/src/lib/newsletterKv.ts` | KV 名单 + token |
| `cloud/src/lib/newsletterCopy.ts` | 欢迎信 / 退订页文案 |
| `cloud/src/lib/newsletterWelcome.ts` | 欢迎信计划（skip / 502 / 重发）+ List-Unsubscribe 400 回退 |
| `cloud/src/routes/subscribeNewsletter.ts` | `POST /api/newsletter/subscribe` |
| `cloud/src/routes/unsubscribeNewsletter.ts` | `GET|POST /api/newsletter/unsubscribe` |
| `src/core/communityLink.js` | 社群占位外链 |
| `src/core/idleChromeOrchestration.js` | 次级菜单行（`newsletter` / `community`） |
