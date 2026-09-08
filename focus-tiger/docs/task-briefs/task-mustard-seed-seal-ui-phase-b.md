# Task Brief · 芥子须弥纪念印 · UI Phase B（背景 dim / 阿寅露脸 / 保存图片）

> 状态：**实现中** · `feature/mustard-seed-seal-ui-phase-b`  
> 前置：Phase A 已合 develop（#612）；`task-mustard-seed-seal.md`（诗/行为不变）  
> 拍板（2026-09-07）：背景 dim + 阿寅露全脸 + **Save image** 下载 PNG（Quiet Line 同模式；**不做**一键社交 App 分享）

## 目标

纪念印卡弹出时沉浸感更强：场景轻 dim、阿寅面部不被卡裁切；用户可把当前诗面保存为图片。

## 契约

| 项 | 口径 |
|---|---|
| 背景 | `#mustard-seed-seal-backdrop` z17；卡 z18；浅 rgba + blur；点遮罩关卡 |
| 阿寅 | `body.ft-mustard-seed-seal-open`：`#sprite-stage` 上抬；窄屏 `#sprite-overlay` 微缩上移 |
| 保存 | `MUSTARD_SEED_SEAL_SAVE` → `saveMustardSeedSealImage`；4:5 暖纸明信片（章 + 双语诗 + 署名 + `resolveBrandYinWaySeal` footer） |
| 不变 | 三首诗/印名、门槛、仪式时机、Continue → Reflection、Prev/Next、Phase A 主辅诗 |
| 禁止 | 改诗、成就墙 UNLOCKED、BottomSheet 大改、`navigator.share` 作核心卖点 |

## 测试

- 单元：`saveMustardSeedSealImage.test.js` + `mustardSeedSeal.test.js`（locale 主辅）
- e2e：`mustard-seed-seal.spec.js`（backdrop + body class + save 钮）
- 冒烟：`npm run test:smoke`
- 人工：375 竖屏见阿寅全脸、遮罩可关、Save image 下载、Continue 仍进 Reflection
