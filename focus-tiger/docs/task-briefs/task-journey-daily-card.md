# Task Brief · Journey Log × Quiet Line · Daily Card（存图）

> **状态（2026-08-11）**：待排期 · 用户拍板要做。  
> **目的**：在 Journey Log 历史行上，一键生成极简日记卡（时长 + 阿寅静帧 + Quiet Line 当日句气质），**Save image** 下载——增强免费层成长获得感，并自然服务社交传播（用户自行发图）。  
> **原则**：经济可持续；增长包分享口径修订——**不是**「不做社交」，而是**暂无一键发到指定 App**。

## 产品契约

| 项 | 口径 |
|---|---|
| 入口 | Journey Log 内点某一天条目 → 「Save Daily Card」类动作 |
| 交付 | PNG 日记卡：日期、专注分钟、阿寅坐禅静帧、一句静语（可复用 Quiet Line **同日**句或独立短池——**禁止**与 Daily Wisdom 文案池合并） |
| 动作 | **Save image**（对齐 Quiet Line / Wallpapers）；可选 `navigator.share` 渐进增强 |
| 档位 | **免费**（全用户）；不绑 Sanctuary |
| 社交 | Save image **就是**方便拿出去分享；UI/卖点**不写**「一键发 IG」；日后一键深链另 Brief |
| i18n | 卡面主文 en（+ ja 若句池有）；chrome en+ja |

## 与「无上限历史」B 卖点怎么改（拍板口径）

| 层 | 口径 |
|---|---|
| 应用内 Journey Log | **保留合理上限**（现 30）——本地性能与隐私简单；**不要**把「无限滚动历史」当 B 主卖点 |
| 用户侧永久档案 | **靠 Daily Card 存图**——免费用户也能把日子带出 App；这是获得感，不是假慈善 |
| B 轨差异化 | 另卖：Deep 音效、进阶仪式、Enso、Wisdom 专属印花等；若仍要「更长应用内回顾」，可另议 **entitled 提高上限**（如 365），**勿**与免费存图互斥 |

## 实现要点（将来）

1. 复用 Quiet Line / Wallpapers canvas 下载管线；新布局组件。  
2. 静帧：策展 1 张坐禅帧（kebab-case 路径）；合法使用项目资产。  
3. 单测：有条目 → 可触发导出 helper；无条目不崩。  
4. TEST_TRACKER：主路径 + 回流；375 不挡主球。  
5. 同步增长包 / `SCENARIO_TESTS` U/Z：禁止把「无一键 IG」写成「禁止社交」。

## 保护面

- 不改 Reflection 边缘硬塞入口。  
- 不写 HealthKit。  
- Tip Log 零耦合。

## 建议分支

`feature/journey-daily-card`

## 不做（本任务）

- 一键深链到 IG/X/小红书。  
- 付费墙挡存图。  
- 把 Journey Log 上限改成「无限」却无分页/性能方案。
