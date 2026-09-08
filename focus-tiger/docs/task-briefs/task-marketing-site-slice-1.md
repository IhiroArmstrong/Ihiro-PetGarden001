# Task Brief · 宣传站 Slice 1（短单页 · 见阿寅）

> **状态（2026-09-08）**：用户书面拍板开工。  
> **性质**：`marketing-site/` 静态页升级；**不进** `focus-tiger/src`。  
> **前置**：Slice 0 已上线（`https://twinsology.com` · Pages `twinsology-marketing`）。  
> **权威交叉**：`task-marketing-site.md` · `PRODUCT_POSITIONING.md` · `FROM_APP_TO_CULTURE.md` · `PRIVACY_NOTICE.md` · `PRINCIPLES.md`（禁止 FOMO / 硬推销）。

## 拍板（2026-09-08）

| 项 | 口径 |
|---|---|
| 页面形态 | 单页约 2.5 屏；**无**假导航 / 无 Practice 假页 |
| 主 CTA | **See the companion** → `#companion` 截图区锚点（暂无公开下载 / 练习 URL） |
| 次 CTA | **Write to Yin** → `mailto:hello@twinsology.com` |
| Hero 视觉 | 2D 阿寅闭目坐禅静帧（`idle-breathing` · 与 App 主线一致；**不用** 3D） |
| 副标 | `Walking the Yin Way?`（品牌精神句问句版） |
| 三截图 | 陪伴 / 微仪式与音景 / Quiet Line 或珍藏意象（仅已有能力） |
| 页脚 | Privacy + Medical disclaimer 静态摘录 + 版权；**Slice 1 不含** Slack 入口 |
| 视觉微调 | 极浅纸感纹理 + 主钮 hover 微放大 / 金色光晕 |

## Slice 2（本 Brief 不做）

- Slack 实验室入口：须用 `communityLink.js` 永不过期 **shared invite**，**禁止**深链到 `#the-den`（未入 workspace 打不开；The Den = Belong 阶段，不是新客入口）。
- 五频道心理旅程文案可放在 Slice 2 极短 Philosophy 段；频道 IA 见 `FROM_APP_TO_CULTURE.md` §8.2。

## 明确不做

- Download App / App Store / `*.workers.dev` / 练习壳挂 apex  
- 四段滚动站 + 顶栏假菜单  
- 改 `communityLink.js` / Stay in touch  
- 公网 Newsletter 表单（须另 Brief + CORS）  
- FOMO / 倒计时 / 硬推销

## 冲突扫描

对照 Stay in touch / Join our community / 练习壳：**无冲突**。官网 mailto 不替代应用内留资；主 CTA 锚点截图区，不假装 App 入口；Slice 1 不接 Slack。

## 验收

1. `https://twinsology.com`：Hero 见 2D 阿寅；主钮滚到三截图区；次钮 mailto。  
2. 375 Safari：不横溢；两 CTA 可点。  
3. Privacy / Medical disclaimer 页可读、可回首页。  
4. `node --test marketing-site/slice0-contract.test.js` 绿。
