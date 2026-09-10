# Task Brief · 宣传站 Slice 2（Slack 实验室 · 五空间旅程）

> **状态（2026-09-08）**：用户书面拍板开工（方案 B：邀请链接 + 五空间极短旅程说明）。  
> **性质**：`marketing-site/` 静态页升级；**不进** `focus-tiger/src`。  
> **前置**：Slice 1 已合 develop（#663 · 2026-09-08）。  
> **权威交叉**：`task-marketing-site.md` · `FROM_APP_TO_CULTURE.md` §8.2 · `SLACK_COMMUNITY_GUIDELINES.md` · `PRINCIPLES.md`（禁止 FOMO / 硬推销）。

## 拍板（2026-09-08）

| 项 | 口径 |
|---|---|
| 区块位置 | `#companion` 截图区之后、页脚之前 |
| 标题 | **Early Yin Community** |
| 语气 | culture laboratory；观察式；**禁止** FOMO / 倒计时 / 硬推销 |
| Slack 入口 | `communityLink.js` 永不过期 **shared invite**（与 App **Join our community** 同链） |
| 深链 | **禁止** `#the-den` 或任何频道深链（新客须先进 workspace） |
| 五空间文案 | 极短心理旅程说明（Arrive / Grow / Practice / Just be / Belong）；IA 见 `FROM_APP_TO_CULTURE.md` §8.2 |
| CTA 文案 | **Join the laboratory** → 新标签打开 Slack |
| 副注 | 说明 shared invite、无发帖压力 |

## 明确不做

- 改 `communityLink.js` / 应用内 Join our community 改链  
- Download App / App Store / `*.workers.dev` / 练习壳挂 apex  
- 公网 Newsletter 表单（须另 Brief + CORS）  
- Ambient Atelier 第六频道 / Support 分流长文（留在 `SLACK_COMMUNITY_GUIDELINES.md`）  
- FOMO / 倒计时 / 硬推销

## 冲突扫描

对照 Stay in touch / Join our community / 练习壳：**无冲突**。官网 Slack 入口与 App 外链同链，不替代应用内留资；不假装 App 内社交已上线；语气与定位稿一致。

## 验收

1. `https://twinsology.com`：见 Early Yin Community 段 + 五空间列表 + **Join the laboratory** → shared invite（新标签）。  
2. HTML **无** `#the-den` 深链。  
3. 375 Safari：段落不横溢；CTA 可点。  
4. `node --test marketing-site/slice0-contract.test.js` 绿（含与 `communityLink.js` 同链断言）。  
5. **现网部署**：`wrangler pages deploy … --branch develop`（Pages production branch = `develop`；省略则只上 preview，**不会**更新 `twinsology.com`）。  
6. Safari：`https://www.twinsology.com` 须 **301** 到 apex，观感与 `https://twinsology.com` 相同（硬刷新一次以清旧 CSS 缓存）。
